import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { executeOverseasRelayRequest, parseOverseasRelayRequest } from "../../lib/content/overseas-collector-relay-core";

const PORT = Math.max(1, Math.min(65535, Number(process.env.PORT) || 8787));
const HOST = process.env.HOST?.trim() || "127.0.0.1";
const secret = process.env.OVERSEAS_COLLECTOR_RELAY_SECRET?.trim() || "";
if (!secret) throw new Error("OVERSEAS_COLLECTOR_RELAY_SECRET_REQUIRED");

function authorized(header: string | undefined) {
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

createServer(async (req, res) => {
  res.setHeader("content-type", "application/json; charset=utf-8");
  if (req.method === "GET" && req.url === "/health") {
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, service: "opc-overseas-collector-relay" }));
    return;
  }
  if (req.method !== "POST" || req.url !== "/v1/collect") {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "NOT_FOUND" }));
    return;
  }
  if (!authorized(req.headers.authorization)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "UNAUTHORIZED" }));
    return;
  }

  let body = "";
  for await (const chunk of req) {
    body += chunk.toString("utf8");
    if (body.length > 16_384) {
      res.statusCode = 413;
      res.end(JSON.stringify({ error: "REQUEST_TOO_LARGE" }));
      return;
    }
  }

  try {
    const parsed = parseOverseasRelayRequest(JSON.parse(body || "{}"));
    const started = Date.now();
    const result = await executeOverseasRelayRequest(parsed, process.env);
    console.log(JSON.stringify({ provider: parsed.provider, status: "SUCCEEDED", durationMs: Date.now() - started }));
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (error) {
    const code = error instanceof Error ? error.message : "RELAY_FAILED";
    console.error(JSON.stringify({ status: "FAILED", error: code }));
    res.statusCode = code.includes("NOT_ALLOWED") ? 400 : code.includes("REQUIRED") ? 503 : 502;
    res.end(JSON.stringify({ error: code }));
  }
}).listen(PORT, HOST, () => {
  console.log(JSON.stringify({ service: "opc-overseas-collector-relay", host: HOST, port: PORT }));
});
