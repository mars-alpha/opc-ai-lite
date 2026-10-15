import { executeOverseasRelayRequest, parseOverseasRelayRequest } from "../../lib/content/overseas-collector-relay-core";

type Env = {
  OVERSEAS_COLLECTOR_RELAY_SECRET: string;
  YOUTUBE_DATA_API_KEY?: string;
};

async function equalSecret(a: string, b: string) {
  if (!a || !b) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b))
  ]);
  const l = new Uint8Array(left);
  const r = new Uint8Array(right);
  if (l.length !== r.length) return false;
  let diff = 0;
  for (let i = 0; i < l.length; i += 1) diff |= l[i] ^ r[i];
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "opc-overseas-collector-relay", runtime: "cloudflare-worker" });
    }
    if (request.method !== "POST" || url.pathname !== "/v1/collect") {
      return json({ error: "NOT_FOUND" }, 404);
    }

    const header = request.headers.get("authorization") ?? "";
    const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!await equalSecret(supplied, env.OVERSEAS_COLLECTOR_RELAY_SECRET ?? "")) {
      return json({ error: "UNAUTHORIZED" }, 401);
    }

    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > 16_384) return json({ error: "REQUEST_TOO_LARGE" }, 413);

    let body = "";
    try {
      body = await request.text();
    } catch {
      return json({ error: "REQUEST_READ_FAILED" }, 400);
    }
    if (body.length > 16_384) return json({ error: "REQUEST_TOO_LARGE" }, 413);

    try {
      const parsed = parseOverseasRelayRequest(JSON.parse(body || "{}"));
      const started = Date.now();
      const result = await executeOverseasRelayRequest(parsed, env);
      console.log(JSON.stringify({ provider: parsed.provider, status: "SUCCEEDED", durationMs: Date.now() - started }));
      return json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : "RELAY_FAILED";
      console.error(JSON.stringify({ status: "FAILED", error: code }));
      const status = code.includes("NOT_ALLOWED") ? 400 : code.includes("REQUIRED") ? 503 : 502;
      return json({ error: code }, status);
    }
  }
};
