import { executeOverseasRelayRequest, parseOverseasRelayRequest } from "../lib/content/overseas-collector-relay-core";
import { collectTrendDiscovery } from "../lib/server/content/trend-discovery";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("OVERSEAS_RELAY_FAILED:" + code);
}

async function main() {
  let blocked = false;
  try { parseOverseasRelayRequest({ provider: "ARBITRARY_PROXY" }); } catch { blocked = true; }
  assert(blocked, "PROVIDER_ALLOWLIST");

  const yt = await executeOverseasRelayRequest(
    parseOverseasRelayRequest({ provider: "YOUTUBE_AI_TREND", searchQuery: "AI", windowHours: 24, resultLimit: 2 }),
    { YOUTUBE_DATA_API_KEY: "test" },
    async (input) => {
      const url = String(input);
      if (url.includes("/youtube/v3/search")) return new Response(JSON.stringify({ items: [{ id: { videoId: "abc" } }] }), { status: 200 });
      if (url.includes("/youtube/v3/videos")) return new Response(JSON.stringify({ items: [{ id: "abc", statistics: { viewCount: "10" } }] }), { status: 200 });
      throw new Error("UNEXPECTED_URL");
    }
  );
  assert((yt as { provider?: string }).provider === "YOUTUBE_AI_TREND", "YOUTUBE_PROVIDER");
  assert(JSON.stringify(yt).includes("viewCount"), "YOUTUBE_STATS");

  let xBlocked = false;
  try {
    parseOverseasRelayRequest({ provider: "X_AI_TREND", searchQuery: "AI", windowHours: 24, resultLimit: 10 });
  } catch {
    xBlocked = true;
  }
  assert(xBlocked, "X_PROVIDER_RETIRED");

  let googleUrl = "";
  const gt = await executeOverseasRelayRequest(
    parseOverseasRelayRequest({ provider: "GOOGLE_TRENDS", url: "http://169.254.169.254/latest/meta-data" }),
    { GOOGLE_TRENDS_GEO: "US" },
    async (input) => {
      googleUrl = String(input);
      return new Response("<rss><channel><item><title>OpenAI</title></item></channel></rss>", { status: 200 });
    }
  );
  assert(googleUrl.startsWith("https://trends.google.com/trending/rss?geo=US"), "GOOGLE_FIXED_UPSTREAM");
  assert(!googleUrl.includes("169.254.169.254"), "GOOGLE_NO_ARBITRARY_URL");
  assert((gt as { provider?: string }).provider === "GOOGLE_TRENDS", "GOOGLE_PROVIDER");
  assert(String((gt as { rssText?: unknown }).rssText).includes("<rss>"), "GOOGLE_RSS");

  const oldUrl = process.env.OVERSEAS_COLLECTOR_RELAY_URL;
  const oldSecret = process.env.OVERSEAS_COLLECTOR_RELAY_SECRET;
  process.env.OVERSEAS_COLLECTOR_RELAY_URL = "https://relay.example.test";
  process.env.OVERSEAS_COLLECTOR_RELAY_SECRET = "shared-secret";
  let relayCalls = 0;
  const viaRelay = await collectTrendDiscovery(
    { provider: "YOUTUBE_AI_TREND", searchQuery: "AI", windowHours: 24, resultLimit: 2 },
    async () => { throw new Error("DIRECT_UPSTREAM_MUST_NOT_RUN"); },
    {
      reserveQuota: async () => undefined as never,
      fetchImpl: async (input, init) => {
        relayCalls += 1;
        assert(String(input) === "https://relay.example.test/v1/collect", "RELAY_ENDPOINT");
        assert(new Headers(init?.headers).get("authorization") === "Bearer shared-secret", "RELAY_AUTH");
        return new Response(JSON.stringify({
          provider: "YOUTUBE_AI_TREND",
          searchPayload: { items: [{ id: { videoId: "relay1" }, snippet: { title: "Relay AI", channelTitle: "Relay", publishedAt: "2026-10-04T00:00:00Z" } }] },
          statsPayload: { items: [{ id: "relay1", statistics: { viewCount: "99", likeCount: "5", commentCount: "2" } }] }
        }), { status: 200 });
      }
    }
  );
  assert(relayCalls === 1, "RELAY_SINGLE_CALL");
  assert(viaRelay.items[0]?.platformMetrics?.views === 99, "RELAY_YOUTUBE_PARSE");
  if (oldUrl === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_URL; else process.env.OVERSEAS_COLLECTOR_RELAY_URL = oldUrl;
  if (oldSecret === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_SECRET; else process.env.OVERSEAS_COLLECTOR_RELAY_SECRET = oldSecret;

  console.log("OVERSEAS_RELAY_PROVIDER_ALLOWLIST=PASS");
  console.log("OVERSEAS_RELAY_YOUTUBE=PASS");
  console.log("OVERSEAS_RELAY_X_RETIRED=PASS");
  console.log("OVERSEAS_RELAY_GOOGLE_TRENDS=PASS");
  console.log("OVERSEAS_RELAY_NO_ARBITRARY_URL=PASS");
  console.log("OVERSEAS_RELAY_CLIENT_SWITCH=PASS");
}
main().catch((error) => { console.error(error); process.exit(1); });
