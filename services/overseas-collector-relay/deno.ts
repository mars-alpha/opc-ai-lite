const ALLOWED_PROVIDERS = new Set(["YOUTUBE_AI_TREND", "GOOGLE_TRENDS", "DEEPMIND_FEED", "GITHUB_TREND_PROXY"]);

type Env = Record<string, string | undefined>;

// Keep one bounded request comfortably inside the caller's 20s deadline.
const RELAY_TOTAL_BUDGET_MS = 16_000;
function safeRelayError(error: unknown) {
  if (error instanceof Error && /^(RELAY_UPSTREAM_HTTP_[1-5][0-9]{2}|RELAY_UPSTREAM_TOO_LARGE|RELAY_PROVIDER_NOT_ALLOWED|RELAY_YOUTUBE_KEY_REQUIRED|RELAY_GOOGLE_TRENDS_GEO_INVALID)$/.test(error.message)) return error.message;
  if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) return "RELAY_UPSTREAM_TIMEOUT";
  if (error instanceof SyntaxError) return "RELAY_UPSTREAM_PAYLOAD_INVALID";
  return "RELAY_UPSTREAM_NETWORK_FAILED";
}
function upstreamSignal(deadline: number, stageBudget: number) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new DOMException("deadline", "TimeoutError");
  return AbortSignal.timeout(Math.max(1, Math.min(stageBudget, remaining)));
}

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

function parseRequest(value: unknown) {
  const input = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const provider = typeof input.provider === "string" ? input.provider.trim().toUpperCase() : "";
  if (!ALLOWED_PROVIDERS.has(provider)) throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
  const searchQuery = typeof input.searchQuery === "string" ? input.searchQuery.trim().slice(0, 500) : "";
  const windowHours = Math.max(1, Math.min(168, Math.round(Number(input.windowHours) || 72)));
  const resultLimit = Math.max(1, Math.min(30, Math.round(Number(input.resultLimit) || 20)));
  return { provider, searchQuery, windowHours, resultLimit, minStars: Math.max(0, Math.min(1000000, Math.round(Number(input.minStars) || 0))) };
}

async function checkedJson(response: Response) {
  if (!response.ok) throw new Error("RELAY_UPSTREAM_HTTP_" + response.status);
  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  return JSON.parse(text);
}

async function checkedText(response: Response) {
  if (!response.ok) throw new Error("RELAY_UPSTREAM_HTTP_" + response.status);
  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  return text;
}

async function collectYouTube(request: ReturnType<typeof parseRequest>, env: Env, deadline: number) {
  const key = env.YOUTUBE_DATA_API_KEY?.trim();
  if (!key) throw new Error("RELAY_YOUTUBE_KEY_REQUIRED");
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("order", "viewCount");
  searchUrl.searchParams.set("q", request.searchQuery || "AI artificial intelligence");
  searchUrl.searchParams.set("maxResults", String(request.resultLimit));
  searchUrl.searchParams.set("publishedAfter", new Date(Date.now() - request.windowHours * 3_600_000).toISOString());
  searchUrl.searchParams.set("key", key);
  const searchPayload = await checkedJson(await fetch(searchUrl, { signal: upstreamSignal(deadline, 10_000) }));

  const rows = searchPayload && typeof searchPayload === "object" && Array.isArray((searchPayload as { items?: unknown[] }).items)
    ? (searchPayload as { items: Array<{ id?: { videoId?: string } }> }).items
    : [];
  const ids = rows.map((row) => row?.id?.videoId).filter((id): id is string => Boolean(id)).slice(0, 30);

  let statsPayload: unknown = { items: [] };
  let metricsStatus = ids.length ? "AVAILABLE" : "EMPTY";
  let metricsError: string | null = null;
  if (ids.length) {
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.set("part", "statistics");
    statsUrl.searchParams.set("id", ids.join(","));
    statsUrl.searchParams.set("key", key);
    try {
      statsPayload = await checkedJson(await fetch(statsUrl, { signal: upstreamSignal(deadline, 5_000) }));
    } catch (error) {
      metricsStatus = "UNAVAILABLE";
      metricsError = safeRelayError(error);
    }
  }
  return { provider: "YOUTUBE_AI_TREND", searchPayload, statsPayload, metricsStatus, metricsError };
}

async function collectGoogleTrends(_request: ReturnType<typeof parseRequest>, env: Env, deadline: number) {
  const geo = (env.GOOGLE_TRENDS_GEO ?? "US").trim().toUpperCase();
  if (!/^[A-Z]{2}(?:-[A-Z0-9]{2,3})?$/.test(geo)) throw new Error("RELAY_GOOGLE_TRENDS_GEO_INVALID");
  const url = new URL("https://trends.google.com/trending/rss");
  url.searchParams.set("geo", geo);
  const rssText = await checkedText(await fetch(url, {
    headers: { accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
    signal: upstreamSignal(deadline, 12_000)
  }));
  return { provider: "GOOGLE_TRENDS", geo, rssText };
}

async function collectGithub(request: ReturnType<typeof parseRequest>, deadline: number) {
  const url = new URL("https://api.github.com/search/repositories");
  const cutoff = new Date(Date.now() - request.windowHours * 3_600_000).toISOString().slice(0, 10);
  url.searchParams.set("q", [request.searchQuery || "AI", "pushed:>=" + cutoff, "stars:>=" + request.minStars].join(" "));
  url.searchParams.set("sort", "stars"); url.searchParams.set("order", "desc"); url.searchParams.set("per_page", String(request.resultLimit));
  const payload = await checkedJson(await fetch(url, { headers: { accept: "application/vnd.github+json", "user-agent": "opc-collection-relay" }, redirect: "error", signal: upstreamSignal(deadline, 12000) }));
  return { provider: request.provider, payload };
}

export async function handleRelayRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") {
    return json({ ok: true, service: "opc-overseas-collector-relay", runtime: "deno-deploy", version: "relay-public-sources-v2", capabilities: [...ALLOWED_PROVIDERS] });
  }
  if (request.method !== "POST" || url.pathname !== "/v1/collect") return json({ error: "NOT_FOUND" }, 404);

  const auth = request.headers.get("authorization") ?? "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!await equalSecret(supplied, env.OVERSEAS_COLLECTOR_RELAY_SECRET?.trim() ?? "")) {
    return json({ error: "UNAUTHORIZED" }, 401);
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 16_384) return json({ error: "REQUEST_TOO_LARGE" }, 413);

  let body = "";
  try { body = await request.text(); } catch { return json({ error: "REQUEST_READ_FAILED" }, 400); }
  if (body.length > 16_384) return json({ error: "REQUEST_TOO_LARGE" }, 413);

  try {
    const parsed = parseRequest(JSON.parse(body || "{}"));
    const started = Date.now();
    const deadline = started + RELAY_TOTAL_BUDGET_MS;
    const result = parsed.provider === "DEEPMIND_FEED"
      ? { provider: parsed.provider, rssText: await checkedText(await fetch("https://deepmind.google/blog/rss.xml", { redirect: "error", signal: upstreamSignal(deadline, 12000) })) }
      : parsed.provider === "GITHUB_TREND_PROXY" ? await collectGithub(parsed, deadline)
      : parsed.provider === "YOUTUBE_AI_TREND"
      ? await collectYouTube(parsed, env, deadline)
      : await collectGoogleTrends(parsed, env, deadline);
    console.log(JSON.stringify({ provider: parsed.provider, status: "SUCCEEDED", durationMs: Date.now() - started }));
    return json(result);
  } catch (error) {
    const code = safeRelayError(error);
    console.error(JSON.stringify({ status: "FAILED", error: code }));
    return json({ error: code }, code.includes("NOT_ALLOWED") ? 400 : code.includes("REQUIRED") ? 503 : 502);
  }
}

type DenoRuntime = {
  env: { toObject(): Record<string, string> };
  serve(handler: (request: Request) => Response | Promise<Response>): unknown;
};

const deno = (globalThis as typeof globalThis & { Deno?: DenoRuntime }).Deno;
if (deno) {
  const env = deno.env.toObject();
  deno.serve((request) => handleRelayRequest(request, env));
}
