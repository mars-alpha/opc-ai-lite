import { handleRelayRequest } from "../services/overseas-collector-relay/deno";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("OVERSEAS_DENO_FAILED:" + code);
}

async function main() {
  const env = {
    OVERSEAS_COLLECTOR_RELAY_SECRET: "shared-secret",
    YOUTUBE_DATA_API_KEY: "yt-test"
  };

  const health = await handleRelayRequest(new Request("https://relay.example/health"), env);
  assert(health.status === 200, "HEALTH");

  const unauthorized = await handleRelayRequest(new Request("https://relay.example/v1/collect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "YOUTUBE_AI_TREND", searchQuery: "AI", windowHours: 24, resultLimit: 1 })
  }), env);
  assert(unauthorized.status === 401, "UNAUTHORIZED");

  const blocked = await handleRelayRequest(new Request("https://relay.example/v1/collect", {
    method: "POST",
    headers: { authorization: "Bearer shared-secret", "content-type": "application/json" },
    body: JSON.stringify({ provider: "ARBITRARY_PROXY", url: "http://169.254.169.254/latest/meta-data" })
  }), env);
  assert(blocked.status === 400, "ALLOWLIST");

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/youtube/v3/search")) {
      return new Response(JSON.stringify({ items: [{ id: { videoId: "v1" }, snippet: { title: "AI demo", channelTitle: "AI", publishedAt: "2026-10-04T00:00:00Z" } }] }), { status: 200 });
    }
    if (url.includes("/youtube/v3/videos")) {
      return new Response(JSON.stringify({ items: [{ id: "v1", statistics: { viewCount: "100", likeCount: "10", commentCount: "2" } }] }), { status: 200 });
    }
    throw new Error("UNEXPECTED_UPSTREAM:" + url);
  }) as typeof fetch;

  try {
    const response = await handleRelayRequest(new Request("https://relay.example/v1/collect", {
      method: "POST",
      headers: { authorization: "Bearer shared-secret", "content-type": "application/json" },
      body: JSON.stringify({ provider: "YOUTUBE_AI_TREND", searchQuery: "AI", windowHours: 24, resultLimit: 1 })
    }), env);
    assert(response.status === 200, "YOUTUBE_STATUS");
    const payload = await response.json() as { provider?: string; statsPayload?: unknown };
    assert(payload.provider === "YOUTUBE_AI_TREND", "YOUTUBE_PROVIDER");
    assert(JSON.stringify(payload.statsPayload).includes("viewCount"), "YOUTUBE_STATS");
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("https://trends.google.com/trending/rss?geo=US")) {
        return new Response("<rss><channel><item><title>OpenAI</title></item></channel></rss>", { status: 200 });
      }
      throw new Error("UNEXPECTED_UPSTREAM:" + url);
    }) as typeof fetch;

    const google = await handleRelayRequest(new Request("https://relay.example/v1/collect", {
      method: "POST",
      headers: { authorization: "Bearer shared-secret", "content-type": "application/json" },
      body: JSON.stringify({ provider: "GOOGLE_TRENDS", url: "http://169.254.169.254/latest/meta-data" })
    }), { ...env, GOOGLE_TRENDS_GEO: "US" });
    assert(google.status === 200, "GOOGLE_STATUS");
    const googlePayload = await google.json() as { provider?: string; rssText?: string };
    assert(googlePayload.provider === "GOOGLE_TRENDS", "GOOGLE_PROVIDER");
    assert(Boolean(googlePayload.rssText?.includes("<rss>")), "GOOGLE_RSS");
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log("OVERSEAS_DENO_HEALTH=PASS");
  console.log("OVERSEAS_DENO_AUTH=PASS");
  console.log("OVERSEAS_DENO_ALLOWLIST=PASS");
  console.log("OVERSEAS_DENO_YOUTUBE=PASS");
  console.log("OVERSEAS_DENO_GOOGLE_TRENDS=PASS");
}

main().catch((error) => { console.error(error); process.exit(1); });
