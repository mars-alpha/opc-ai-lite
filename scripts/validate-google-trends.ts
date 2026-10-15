import {
  buildTrendDiscoveryPrimaryUrl,
  collectTrendDiscovery,
  parseGoogleTrendsRss,
  resolveTrendDiscoveryConfig
} from "../lib/server/content/trend-discovery";
import { SEARCH_DISCOVERY_PROVIDERS } from "../lib/server/content/search-discovery";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("GOOGLE_TRENDS_CHECK_FAILED:" + code);
}

async function main() {
  const config = resolveTrendDiscoveryConfig({
  provider: "GOOGLE_TRENDS",
  searchQuery: "AI",
  resultLimit: 10,
  windowHours: 24
});

const url = buildTrendDiscoveryPrimaryUrl(config);
assert(url.startsWith("https://trends.google.com/trending/rss"), "OFFICIAL_RSS_URL");
assert(url.includes("geo="), "GEO_REQUIRED");

const sample = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:ht="https://trends.google.com/trending/rss">
  <channel>
    <item>
      <title>OpenAI</title>
      <ht:approx_traffic>200K+</ht:approx_traffic>
      <pubDate>Sat, 03 Oct 2026 12:00:00 -0700</pubDate>
      <ht:news_item>
        <ht:news_item_title><![CDATA[OpenAI launches a new model]]></ht:news_item_title>
        <ht:news_item_url>https://example.com/openai</ht:news_item_url>
      </ht:news_item>
    </item>
  </channel>
</rss>`;

const parsed = parseGoogleTrendsRss(sample);
assert(parsed.length === 1, "RSS_ITEM_COUNT");
assert(parsed[0]?.title === "OpenAI", "TITLE");
assert(parsed[0]?.platformMetrics?.searchVolumeApprox === 200000, "TRAFFIC_NORMALIZED");
assert(parsed[0]?.metadata?.trendProvider === "GOOGLE_TRENDS", "PROVIDER");
assert(parsed[0]?.metadata?.signalDimension === "PUBLIC_SEARCH_ATTENTION", "SIGNAL_DIMENSION");
assert(parsed[0]?.metadata?.factualSource === false, "NOT_FACTUAL");
assert(parsed[0]?.metadata?.referenceOnly === true, "REFERENCE_ONLY");
assert(parsed[0]?.metadata?.sourceMode === "OFFICIAL_RSS", "OFFICIAL_RSS_MODE");
assert(!SEARCH_DISCOVERY_PROVIDERS.includes("GOOGLE_TRENDS" as never), "SEARCH_COLLECTOR_BOUNDARY");

const collected = await collectTrendDiscovery(
  config,
  async () => { throw new Error("JSON_FETCH_MUST_NOT_RUN"); },
  { fetchText: async () => sample }
);
assert(collected.items.length === 1, "COLLECTOR_RSS_PATH");

  console.log("GOOGLE_TRENDS_OFFICIAL_RSS=PASS");
  console.log("GOOGLE_TRENDS_TRAFFIC_NORMALIZATION=PASS");
  console.log("GOOGLE_TRENDS_FACTUAL_BOUNDARY=PASS");
  console.log("GOOGLE_TRENDS_SEARCH_COLLECTOR_SEPARATION=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
