const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const postgres = require("postgres");

const project = path.resolve(__dirname, "..");
const LOCAL_HOST = "127.0.0.1";
const LOCAL_PORT = 15432;
const DAILYHOT_LOCAL_PORT = 16688;
const DAILYHOT_REMOTE_PORT = 6688;
const REMOTE_DB_HOST = "127.0.0.1";
const REMOTE_DB_PORT = 5432;
const SSH_TARGET = "ubuntu@1.14.180.16";
const SSH_EXE = "C:\\Windows\\System32\\OpenSSH\\ssh.exe";
const CHECK_ONLY = process.argv.includes("--check");

function fail(message, error) {
  console.error("\n[DEV PREFLIGHT] " + message);
  if (error?.code) console.error("[DEV PREFLIGHT] CODE=" + error.code);
  process.exit(1);
}

function waitForPort(port, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const attempt = () => {
      const socket = net.connect({ host: LOCAL_HOST, port }, () => {
        socket.destroy();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started >= timeoutMs) reject(new Error("SSH_TUNNEL_NOT_READY"));
        else setTimeout(attempt, 250);
      });
    };
    attempt();
  });
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: LOCAL_HOST, port }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function startTunnel(localPort, remoteHost, remotePort, label) {
  console.log(`[DEV PREFLIGHT] ${label} tunnel missing; starting 127.0.0.1:${localPort}...`);
  return spawn(
    SSH_EXE,
    [
      "-N",
      "-o", "BatchMode=yes",
      "-o", "ExitOnForwardFailure=yes",
      "-o", "ServerAliveInterval=30",
      "-L", `${localPort}:${remoteHost}:${remotePort}`,
      SSH_TARGET
    ],
    { cwd: project, windowsHide: true, stdio: ["ignore", "ignore", "pipe"] }
  );
}

async function ensureTunnel(localPort, remoteHost, remotePort, label) {
  if (await isPortOpen(localPort)) {
    console.log(`[DEV PREFLIGHT] ${label} tunnel already ready: 127.0.0.1:${localPort}`);
    return null;
  }
  const tunnel = startTunnel(localPort, remoteHost, remotePort, label);
  let sshError = "";
  tunnel.stderr.on("data", (chunk) => { sshError += chunk.toString(); });
  try {
    await waitForPort(localPort);
  } catch (error) {
    try { tunnel.kill(); } catch {}
    fail(`Unable to establish ${label} SSH tunnel.` + (sshError ? " Check the configured SSH key/host." : ""), error);
  }
  console.log(`[DEV PREFLIGHT] ${label} tunnel ready: 127.0.0.1:${localPort}`);
  return tunnel;
}

async function verifyDatabase(databaseUrl) {
  const sql = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 5,
    idle_timeout: 1
  });
  try {
    const rows = await sql.unsafe("select current_database() as db, current_user as usr");
    const row = rows[0];
    if (row?.db !== "opc_ai_dev" || row?.usr !== "opc_ai_dev_app") {
      throw new Error(`UNEXPECTED_DATABASE_TARGET:${row?.db || "unknown"}:${row?.usr || "unknown"}`);
    }
    console.log("[DEV PREFLIGHT] Database ready: opc_ai_dev / opc_ai_dev_app");
  } finally {
    await sql.end({ timeout: 1 });
  }
}

async function main() {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(path.join(project, ".env.local"));
  } else {
    fail("Node.js 20.12+ is required because local dev uses process.loadEnvFile().");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) fail("DATABASE_URL is missing from .env.local.");

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    fail("DATABASE_URL in .env.local is invalid.");
  }

  if (
    process.env.DATABASE_ENVIRONMENT !== "development" ||
    parsed.hostname !== LOCAL_HOST ||
    Number(parsed.port) !== LOCAL_PORT ||
    parsed.pathname !== "/opc_ai_dev" ||
    decodeURIComponent(parsed.username) !== "opc_ai_dev_app"
  ) {
    fail("Local dev database target must remain development / opc_ai_dev_app@127.0.0.1:15432/opc_ai_dev.");
  }

  const dbTunnel = await ensureTunnel(LOCAL_PORT, REMOTE_DB_HOST, REMOTE_DB_PORT, "Development PostgreSQL");
  const dailyHotTunnel = await ensureTunnel(DAILYHOT_LOCAL_PORT, "127.0.0.1", DAILYHOT_REMOTE_PORT, "DailyHot");

  try {
    await verifyDatabase(databaseUrl);
  } catch (error) {
    if (dbTunnel) try { dbTunnel.kill(); } catch {}
    if (dailyHotTunnel) try { dailyHotTunnel.kill(); } catch {}
    fail("Development PostgreSQL connectivity check failed. Do not modify Auth or run migrations; restore the local tunnel/DB connectivity first.", error);
  }

  if (CHECK_ONLY) {
    console.log("[DEV PREFLIGHT] LOCAL_DEV_READY=PASS");
    if (dbTunnel || dailyHotTunnel) console.log("[DEV PREFLIGHT] Tunnels started for this check will now close.");
    if (dbTunnel) try { dbTunnel.kill(); } catch {}
    if (dailyHotTunnel) try { dailyHotTunnel.kill(); } catch {}
    return;
  }

  console.log("[DEV PREFLIGHT] Starting Next.js dev server...");
  const next = spawn(
    process.execPath,
    [path.join(project, "node_modules", "next", "dist", "bin", "next"), "dev"],
    { cwd: project, env: process.env, stdio: "inherit", windowsHide: true }
  );

  let shuttingDown = false;
  const shutdown = (exitCode) => {
    if (shuttingDown) return;
    shuttingDown = true;
    try { next.kill(); } catch {}
    if (dbTunnel) try { dbTunnel.kill(); } catch {}
    if (dailyHotTunnel) try { dailyHotTunnel.kill(); } catch {}
    if (typeof exitCode === "number") process.exit(exitCode);
  };

  const watchOwnedTunnel = (tunnel, label) => {
    if (!tunnel) return;
    tunnel.on("exit", (code, signal) => {
      if (shuttingDown) return;
      console.error(
        `[DEV PREFLIGHT] ${label} tunnel exited unexpectedly (code=${code ?? "null"}, signal=${signal ?? "null"}). Stopping Next.js so local dev cannot remain half-healthy.`
      );
      shutdown(1);
    });
    tunnel.on("error", (error) => {
      if (shuttingDown) return;
      console.error(`[DEV PREFLIGHT] ${label} tunnel process error: ${error?.message ?? "unknown"}`);
      shutdown(1);
    });
  };

  watchOwnedTunnel(dbTunnel, "Development PostgreSQL");
  watchOwnedTunnel(dailyHotTunnel, "DailyHot");

  process.on("SIGINT", () => shutdown());
  process.on("SIGTERM", () => shutdown());

  next.on("exit", (code, signal) => {
    if (!shuttingDown) {
      shuttingDown = true;
      if (dbTunnel) try { dbTunnel.kill(); } catch {}
      if (dailyHotTunnel) try { dailyHotTunnel.kill(); } catch {}
    }
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
}

main().catch((error) => fail("Local development startup failed.", error));
