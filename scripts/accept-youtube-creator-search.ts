import { buildCollectionCapabilityHealthSnapshot, resolveCollectionCapabilityRoute } from "../lib/server/content/collection-capability-router";
import { assertGlobalSocialProviderConfiguration } from "../lib/server/content/global-social-provider-config";
import { collectTrendDiscovery } from "../lib/server/content/trend-discovery";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("YOUTUBE_CREATOR_SEARCH_018_FAILED:" + code);
}

async function main() {
const relayOnly = buildCollectionCapabilityHealthSnapshot({
  env: {
    OVERSEAS_COLLECTOR_RELAY_URL: "https://relay.example.test",
    OVERSEAS_COLLECTOR_RELAY_SECRET: "test-secret"
  },
  overseasRelayConfigured: true
});
const relayRoute = resolveCollectionCapabilityRoute("YOUTUBE", "SEARCH", relayOnly);
assert(relayRoute.status === "READY", "RELAY_ONLY_ROUTE_READY");
assert(relayRoute.activeBackend?.id === "YOUTUBE_RELAY_SEARCH", "RELAY_BACKEND_ACTIVE");

const halfConfigured = buildCollectionCapabilityHealthSnapshot({
  env: { OVERSEAS_COLLECTOR_RELAY_URL: "https://relay.example.test" },
  overseasRelayConfigured: false
});
const halfRoute = resolveCollectionCapabilityRoute("YOUTUBE", "SEARCH", halfConfigured);
assert(halfRoute.status === "CONFIG_REQUIRED", "HALF_CONFIG_FAIL_CLOSED");

assertGlobalSocialProviderConfiguration(
  ["YOUTUBE_AI_TREND"],
  {},
  true
);

let directOnlyBlocked = false;
try {
  assertGlobalSocialProviderConfiguration(["YOUTUBE_AI_TREND"], {}, false);
} catch (error) {
  directOnlyBlocked = error instanceof Error &&
    error.message === "YOUTUBE_PROVIDER_CONFIGURATION_REQUIRED";
}
assert(directOnlyBlocked, "MISSING_DIRECT_AND_RELAY_BLOCKED");

const previousUrl = process.env.OVERSEAS_COLLECTOR_RELAY_URL;
const previousSecret = process.env.OVERSEAS_COLLECTOR_RELAY_SECRET;
const previousKey = process.env.YOUTUBE_DATA_API_KEY;
process.env.OVERSEAS_COLLECTOR_RELAY_URL = "https://relay.example.test";
process.env.OVERSEAS_COLLECTOR_RELAY_SECRET = "test-secret";
delete process.env.YOUTUBE_DATA_API_KEY;

try {
  let relayCalls = 0;
  const result = await collectTrendDiscovery(
    {
      provider: "YOUTUBE_AI_TREND",
      searchQuery: "obra superpowers tutorial",
      windowHours: 72,
      resultLimit: 2,
      minStars: 0
    },
    async () => {
      throw new Error("DIRECT_YOUTUBE_MUST_NOT_RUN");
    },
    {
      fetchImpl: async (input, init) => {
        relayCalls += 1;
        assert(String(input) === "https://relay.example.test/v1/collect", "RELAY_ENDPOINT");
        assert(new Headers(init?.headers).get("authorization") === "Bearer test-secret", "RELAY_AUTH");
        return new Response(JSON.stringify({
          provider: "YOUTUBE_AI_TREND",
          searchPayload: {
            items: [{
              id: { videoId: "yt-018" },
              snippet: {
                title: "obra superpowers tutorial",
                channelTitle: "Creator",
                description: "hands-on workflow tutorial",
                publishedAt: "2026-10-09T01:00:00Z"
              }
            }]
          },
          statsPayload: {
            items: [{
              id: "yt-018",
              statistics: { viewCount: "1200", likeCount: "80", commentCount: "12" }
            }]
          }
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
    }
  );
  assert(relayCalls === 1, "SINGLE_RELAY_CALL");
  assert(result.items[0]?.title === "obra superpowers tutorial", "RELAY_RESULT_PARSE");
  assert(result.items[0]?.platformMetrics?.views === 1200, "RELAY_STATS_PARSE");
} finally {
  if (previousUrl === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_URL;
  else process.env.OVERSEAS_COLLECTOR_RELAY_URL = previousUrl;
  if (previousSecret === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_SECRET;
  else process.env.OVERSEAS_COLLECTOR_RELAY_SECRET = previousSecret;
  if (previousKey === undefined) delete process.env.YOUTUBE_DATA_API_KEY;
  else process.env.YOUTUBE_DATA_API_KEY = previousKey;
}

console.log("YOUTUBE_CREATOR_SEARCH_018_RELAY_ONLY=PASS");
console.log("YOUTUBE_CREATOR_SEARCH_018_FAIL_CLOSED=PASS");
console.log("YOUTUBE_CREATOR_SEARCH_018_ROUTER=PASS");
console.log("YOUTUBE_CREATOR_SEARCH_018_DISCOVERY=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
