import { collectTrendDiscovery } from "../lib/server/content/trend-discovery";
import { fetchPublicText } from "../lib/server/content/collection-runner";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("GOOGLE_TRENDS_LIVE_FAILED:" + code);
}

async function main() {
  const result = await collectTrendDiscovery(
  {
    provider: "GOOGLE_TRENDS",
    searchQuery: "",
    resultLimit: 10,
    windowHours: 24
  },
  async () => { throw new Error("JSON_FETCH_MUST_NOT_RUN"); },
  {
    fetchText: async (url) => {
      const fetched = await fetchPublicText(url);
      return { body: fetched.body, finalUrl: fetched.finalUrl };
    }
  }
);

assert(result.items.length > 0, "NO_LIVE_ITEMS");
assert(result.items.every((item) => item.metadata?.trendProvider === "GOOGLE_TRENDS"), "PROVIDER_MISMATCH");
assert(result.items.every((item) => item.metadata?.factualSource === false), "FACTUAL_BOUNDARY");
assert(result.items.every((item) => item.metadata?.signalDimension === "PUBLIC_SEARCH_ATTENTION"), "SIGNAL_DIMENSION");

  console.log("GOOGLE_TRENDS_LIVE=PASS");
  console.log("GOOGLE_TRENDS_LIVE_ITEMS=" + result.items.length);
  console.log("GOOGLE_TRENDS_LIVE_SAMPLE=" + JSON.stringify(result.items.slice(0, 3).map((item) => ({
    title: item.title,
    searchVolumeApprox: item.platformMetrics?.searchVolumeApprox,
    publishedAt: item.publishedAt
  }))));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
