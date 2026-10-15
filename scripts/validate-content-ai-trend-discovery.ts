import {
  buildTrendDiscoveryPrimaryUrl,
  collectTrendDiscovery,
  resolveTrendDiscoveryConfig
} from "../lib/server/content/trend-discovery";
import { filterDiscoveryCandidates } from "../lib/server/content/discovery-filter";
import {
  normalizeGithubSignal,
  normalizeHnSignal,
  normalizeSocialTrendSignal
} from "../lib/server/content/event-signal";
import { INITIAL_SOURCE_POLICIES } from "../lib/content/intelligence-policy";
import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_AI_TREND_DISCOVERY_FAILED:" + code);
}

async function main() {
  const runnerSource = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
  assert(runnerSource.includes('method === "TREND"'), "RUNNER_TREND_METHOD_MISSING");
  assert(runnerSource.includes("collectTrendDiscovery"), "RUNNER_TREND_COLLECTOR_MISSING");
  assert(INITIAL_SOURCE_POLICIES.some((item) => item.key === "github_trending"), "POLICY_GITHUB_SIGNAL_MISSING");
  assert(INITIAL_SOURCE_POLICIES.some((item) => item.key === "hacker_news"), "POLICY_HN_SIGNAL_MISSING");
  assert(!INITIAL_SOURCE_POLICIES.some((item) => item.key === "signal_bilibili"), "GENERIC_BILIBILI_MUST_NOT_BE_CORE_SIGNAL");

  const hnConfig = resolveTrendDiscoveryConfig({
    provider: "HN_TOP",
    searchQuery: "AI",
    resultLimit: 2,
    windowHours: 72
  });
  assert(buildTrendDiscoveryPrimaryUrl(hnConfig).includes("topstories.json"), "HN_TOP_URL");

  const hn = await collectTrendDiscovery(hnConfig, async (url) => {
    if (url.includes("topstories.json")) return [101, 102];
    if (url.includes("/101.json")) return {
      id: 101,
      type: "story",
      title: "OpenAI releases new AI agent API",
      url: "https://example.com/openai-agent",
      by: "alice",
      time: 1791010000,
      score: 420,
      kids: new Array(80).fill(1)
    };
    return {
      id: 102,
      type: "story",
      title: "Automaker reports vehicle sales",
      url: "https://example.com/cars",
      by: "bob",
      time: 1791010000,
      score: 500,
      kids: new Array(100).fill(1)
    };
  });

  assert(hn.items.length === 2, "HN_ITEMS");
  assert(hn.items[0]?.metadata?.trendRank === 1, "HN_RANK");
  assert(hn.items[0]?.metadata?.factualSource === false, "HN_SIGNAL_NOT_FACT");

  const filtered = await filterDiscoveryCandidates(hn.items, {
    now: new Date("2026-10-03T17:00:00+08:00"),
    windowHours: 72
  });
  assert(filtered.items.length === 2, "TREND_MUST_USE_CLUSTER_FIRST_FILTER");

  const ghConfig = resolveTrendDiscoveryConfig({
    provider: "GITHUB_TREND_PROXY",
    searchQuery: "AI agent",
    resultLimit: 10,
    minStars: 50,
    windowHours: 72
  });
  const ghUrl = buildTrendDiscoveryPrimaryUrl(ghConfig, Date.parse("2026-10-03T09:00:00Z"));
  assert(ghUrl.includes("search/repositories"), "GITHUB_PROXY_URL");
  assert(decodeURIComponent(ghUrl).includes("stars:>=50"), "GITHUB_PROXY_THRESHOLD");

  const bili = await collectTrendDiscovery(
    { provider: "BILIBILI_POPULAR", searchQuery: "AI", resultLimit: 2, windowHours: 72 },
    async () => ({
      data: {
        list: [
          {
            bvid: "BV1AI",
            title: "AI Agent 实战",
            desc: "AI workflow",
            pubdate: 1791010000,
            owner: { name: "creator" },
            stat: { view: 120000, like: 8000, reply: 900, favorite: 3200, share: 1100 }
          }
        ]
      }
    })
  );
  assert(bili.items[0]?.metadata?.sourceMode === "PUBLIC", "BILIBILI_PUBLIC_MODE");
  assert(bili.items[0]?.metadata?.factualSource === false, "BILIBILI_NOT_FACT");
  assert(bili.items[0]?.platformMetrics?.trendRank === 1, "BILIBILI_RANK");

  assert(!INITIAL_SOURCE_POLICIES.some((item) => ["signal_weibo", "signal_zhihu"].includes(item.key)), "GENERIC_CHINA_HOTLIST_MUST_NOT_BE_CORE_POLICY");

  const hnScore = normalizeHnSignal({ points: 420, comments: 80, trendRank: 1 });
  const ghScore = normalizeGithubSignal({
    stars: 9000,
    forks: 1200,
    openIssues: 200,
    trendRank: 2
  });
  assert(hnScore.components.rankScore === 100, "HN_RANK_SIGNAL");
  assert(ghScore.components.rankScore === 100, "GITHUB_RANK_SIGNAL");
  const socialScore = normalizeSocialTrendSignal({
    views: 120000,
    likes: 8000,
    comments: 900,
    favorites: 3200,
    shares: 1100,
    trendRank: 1
  });
  assert(socialScore.components.rankScore === 100, "SOCIAL_RANK_SIGNAL");
  assert(socialScore.score > 0, "SOCIAL_SIGNAL_SCORE");

  console.log("CONTENT_AI_TREND_DISCOVERY_HN_TOP=PASS");
  console.log("CONTENT_AI_TREND_DISCOVERY_GITHUB_PROXY=PASS");
  console.log("CONTENT_AI_TREND_DISCOVERY_BILIBILI_PUBLIC=PASS");
  console.log("CONTENT_AI_TREND_DISCOVERY_RUNNER=PASS");
  console.log("CONTENT_AI_TREND_DISCOVERY_STRATEGY=PASS");
  console.log("CONTENT_AI_TREND_DISCOVERY_CLUSTER_FIRST=PASS");
  console.log("CONTENT_AI_TREND_DISCOVERY_SIGNAL_NOT_FACT=PASS");
  console.log("CONTENT_AI_TREND_DISCOVERY_RANK_SIGNAL=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
