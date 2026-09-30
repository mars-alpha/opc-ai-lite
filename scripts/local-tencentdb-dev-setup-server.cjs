const http = require("node:http");
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const crypto = require("node:crypto");
const postgres = require("postgres");

const HOST = "127.0.0.1";
const PORT = 17654;
const TUNNEL_PORT = 15432;
const project = path.resolve(__dirname, "..");
const token = crypto.randomBytes(24).toString("hex");
const resultFile = path.join(os.tmpdir(), "opc-ai-tencentdb-dev-setup.result.txt");
const logFile = path.join(os.tmpdir(), "opc-ai-tencentdb-dev-setup.log");

function html(body) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>OPC AI TencentDB Dev Setup</title>
  <style>body{font-family:system-ui,"Microsoft YaHei",sans-serif;background:#f6f7f9;margin:0;padding:40px}.card{max-width:620px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:28px;box-shadow:0 8px 28px rgba(0,0,0,.06)}h1{font-size:22px;margin:0 0 12px}p{color:#5b6472;line-height:1.6}.field{margin:18px 0}.field label{display:block;font-weight:600;margin-bottom:8px}.field input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #cfd5dd;border-radius:8px;font-size:15px}.btn{border:0;border-radius:8px;padding:12px 18px;background:#1769e0;color:#fff;font-size:15px;cursor:pointer}.note{font-size:13px;color:#6b7280;background:#f8fafc;border-radius:8px;padding:12px}.ok{color:#137333}.err{color:#b42318;white-space:pre-wrap}</style></head><body><div class="card">${body}</div></body></html>`;
}

function runStep(name, commandLine, env) {
  const comspec = process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe";
  const r = spawnSync(comspec, ["/d", "/s", "/c", commandLine], {
    cwd: project,
    env,
    encoding: "utf8",
    windowsHide: true
  });
  const launchError = r.error ? ("\nLAUNCH_ERROR=" + r.error.message) : "";
  const output = ((r.stdout || "") + "\n" + (r.stderr || "") + launchError)
    .replace(/postgres(?:ql)?:\/\/[^\s\r\n]+/g, "[DATABASE_URL_REDACTED]");
  fs.appendFileSync(logFile, `=== ${name} ===\n${output}\n`, "utf8");
  if (r.error) throw new Error(name + " launch failed");
  if (r.status !== 0) throw new Error(name + " failed with exit code " + r.status);
}

function replaceEnvLine(content, key, value) {
  const re = new RegExp("^" + key + "=.*$", "m");
  if (re.test(content)) return content.replace(re, key + "=" + value);
  if (content && !content.endsWith("\n")) content += "\n";
  return content + key + "=" + value + "\n";
}

async function checkApp(url) {
  const sql = postgres(url, { max: 1 });
  try {
    const rows = await sql.unsafe("select current_database() as db, current_user as usr");
    if (rows[0]?.db !== "opc_ai_dev" || rows[0]?.usr !== "opc_ai_dev_app") {
      throw new Error("APP_ROLE_CONNECTION_CHECK_FAILED");
    }
  } finally {
    await sql.end();
  }
}

function startTunnel() {
  const ssh = spawn("C:\\Windows\\System32\\OpenSSH\\ssh.exe", [
    "-N","-o","BatchMode=yes","-o","ExitOnForwardFailure=yes","-o","ServerAliveInterval=30",
    "-L",`${TUNNEL_PORT}:10.20.0.2:5432`,"ubuntu@1.14.180.16"
  ], { windowsHide: true, stdio: ["ignore","ignore","pipe"] });
  ssh.stderr.on("data", d => fs.appendFileSync(logFile, "[SSH] " + d.toString(), "utf8"));
  return ssh;
}

function waitPort(port, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = () => {
      const s = net.connect({ host: HOST, port }, () => { s.destroy(); resolve(); });
      s.on("error", () => {
        s.destroy();
        if (Date.now() - start > timeoutMs) reject(new Error("SSH_TUNNEL_NOT_READY"));
        else setTimeout(attempt, 300);
      });
    };
    attempt();
  });
}

try { fs.unlinkSync(resultFile); } catch {}
try { fs.unlinkSync(logFile); } catch {}

const tunnel = startTunnel();
let tunnelReady = false;
waitPort(TUNNEL_PORT).then(() => { tunnelReady = true; }).catch(err => {
  fs.writeFileSync(resultFile, "FAILED\nERROR=" + err.message, "utf8");
});

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method === "GET" && req.url === "/") {
    const status = tunnelReady ? '<p class="ok">✓ SSH 隧道已就绪：127.0.0.1:15432 → TencentDB</p>' : '<p>正在建立 SSH 隧道，请稍候几秒后刷新。</p>';
    res.end(html(`<h1>OPC AI · TencentDB 开发库配置</h1><p>此页面只监听你电脑的 <b>127.0.0.1</b>，不会对外网开放。</p>${status}
      <form method="post" action="/setup">
      <input type="hidden" name="token" value="${token}">
      <div class="field"><label>管理员 opcai 密码</label><input type="password" name="admin" required autocomplete="off"></div>
      <div class="note">只操作 Development 的 opc_ai_dev。管理员连接将保存为 Git 已忽略的 DATABASE_MIGRATION_URL，只用于 Schema Migration；日常应用仍使用低权限 opc_ai_dev_app。</div>
      <div style="margin-top:20px"><button class="btn" type="submit" ${tunnelReady ? "" : "disabled"}>开始安全配置</button></div>
      </form>`));
    return;
  }

  if (req.method === "POST" && req.url === "/setup") {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 20000) req.destroy(); });
    req.on("end", async () => {
      try {
        if (!tunnelReady) throw new Error("SSH_TUNNEL_NOT_READY");
        const form = new URLSearchParams(raw);
        if (form.get("token") !== token) throw new Error("INVALID_LOCAL_TOKEN");
        const admin = form.get("admin") || "";
        raw = "";
        if (!admin) throw new Error("PASSWORD_REQUIRED");

        const adminUrl = `postgresql://opcai:${encodeURIComponent(admin)}@127.0.0.1:${TUNNEL_PORT}/opc_ai_dev`;
        const envPath = path.join(project, ".env.local");
        const existingEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
        const appMatch = existingEnv.match(/^DATABASE_URL=(.+)$/m);
        if (!appMatch) throw new Error("DATABASE_URL_REQUIRED");
        const appUrl = appMatch[1].trim();
        const baseEnv = { ...process.env, DATABASE_ENVIRONMENT: "development" };

        runStep("DATABASE_TARGET_CHECK", "npm.cmd run db:target:check", { ...baseEnv, DATABASE_URL: appUrl });
        runStep("DATABASE_MIGRATION", "npm.cmd run db:migrate -- --confirm=development", {
          ...baseEnv,
          DATABASE_URL: appUrl,
          DATABASE_MIGRATION_URL: adminUrl
        });
        await checkApp(appUrl);

        const backup = path.join(os.tmpdir(), "opc-ai-env-local-before-tencentdb-" + Date.now() + ".bak");
        let content = existingEnv;
        if (fs.existsSync(envPath)) {
          fs.copyFileSync(envPath, backup);
        }
        content = replaceEnvLine(content, "DATABASE_ENVIRONMENT", "development");
        content = replaceEnvLine(content, "DATABASE_URL", appUrl);
        content = replaceEnvLine(content, "DATABASE_MIGRATION_URL", adminUrl);
        fs.writeFileSync(envPath, content, "utf8");

        fs.writeFileSync(resultFile, "SUCCESS\nENV_BACKUP=" + backup + "\nLOG=" + logFile, "utf8");
        res.end(html('<h1 class="ok">配置完成</h1><p>Development Migration 已完成。日常应用继续使用低权限 opc_ai_dev_app；DATABASE_MIGRATION_URL 仅用于后续 Schema Migration。</p><p>可以关闭此页面并回到 ChatGPT。</p>'));
      } catch (err) {
        const msg = String(err?.message || err).replace(/postgres(?:ql)?:\/\/[^\s\r\n]+/g, "[DATABASE_URL_REDACTED]");
        fs.writeFileSync(resultFile, "FAILED\nERROR=" + msg + "\nLOG=" + logFile, "utf8");
        res.statusCode = 500;
        res.end(html('<h1 class="err">配置未完成</h1><p class="err">' + msg.replace(/[<>&]/g, "_") + '</p><p>不要重复修改数据库，请回到 ChatGPT，我会根据本机日志继续处理。</p>'));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end(html("<h1>Not Found</h1>"));
});

server.listen(PORT, HOST, () => {
  fs.writeFileSync(path.join(os.tmpdir(), "opc-ai-tencentdb-dev-setup.url.txt"), `http://${HOST}:${PORT}/`, "utf8");
});

function shutdown() {
  try { tunnel.kill(); } catch {}
  try { server.close(); } catch {}
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
