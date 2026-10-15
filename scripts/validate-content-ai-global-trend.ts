import fs from "node:fs";
import { collectTrendDiscovery } from "../lib/server/content/trend-discovery";
import { localizeCollectedItemsForChineseReview } from "../lib/server/content/review-localization";
import { normalizeGlobalTrendRunnerPayload } from "../lib/server/content/global-trend-runner";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_AI_GLOBAL_TREND_FAILED:" + code);
}

async function main() {
  const hfModels = await collectTrendDiscovery(
    { provider: "HUGGINGFACE_MODELS", searchQuery: "AI", resultLimit: 2, windowHours: 72 },
    async () => [{
      id: "org/model-a",
      modelId: "org/model-a",
      author: "org",
      lastModified: "2026-10-03T08:00:00Z",
      likes: 120,
      downloads: 24000,
      trendingScore: 99,
      tags: ["text-generation", "transformers"]
    }]
  );
  assert(hfModels.items[0]?.metadata?.factualSource === false, "HF_MODEL_NOT_SIGNAL_ONLY");
  assert(hfModels.items[0]?.platformMetrics?.trendRank === 1, "HF_MODEL_RANK");

  const hfPapers = await collectTrendDiscovery(
    { provider: "HUGGINGFACE_PAPERS", searchQuery: "AI", resultLimit: 2, windowHours: 72 },
    async () => [{
      paper: { id: "2610.00001", title: "Agent Memory at Scale", summary: "A paper about agent memory." },
      upvotes: 88
    }]
  );
  assert(hfPapers.items[0]?.title === "Agent Memory at Scale", "HF_PAPER_PARSE");

  const reddit = await collectTrendDiscovery(
    { provider: "REDDIT_AI_HOT", searchQuery: "AI", resultLimit: 2, windowHours: 72 },
    async () => ({
      data: {
        children: [{
          data: {
            id: "r1",
            title: "New open model benchmark",
            permalink: "/r/LocalLLaMA/comments/r1/test/",
            author: "tester",
            selftext: "Discussion only",
            created_utc: 1791010000,
            score: 900,
            num_comments: 180,
            upvote_ratio: 0.93,
            subreddit: "LocalLLaMA"
          }
        }]
      }
    })
  );
  assert(reddit.items[0]?.metadata?.subreddit === "LocalLLaMA", "REDDIT_PARSE");

  const arxivXml = `<?xml version="1.0"?><feed>
    <entry>
      <id>http://arxiv.org/abs/2610.00001v1</id>
      <updated>2026-10-03T08:00:00Z</updated>
      <published>2026-10-03T08:00:00Z</published>
      <title>Reliable Tool Use for AI Agents</title>
      <summary>We study reliable tool use.</summary>
      <author><name>Alice Example</name></author>
    </entry>
  </feed>`;
  const arxiv = await collectTrendDiscovery(
    { provider: "ARXIV_AI_RECENT", searchQuery: "agent", resultLimit: 2, windowHours: 72 },
    async () => ({}),
    { fetchText: async () => ({ body: arxivXml }) }
  );
  assert(arxiv.items[0]?.title === "Reliable Tool Use for AI Agents", "ARXIV_PARSE");
  assert(arxiv.items[0]?.metadata?.trendSignalType === "RECENCY", "ARXIV_SIGNAL_TYPE");

  const aihot = await collectTrendDiscovery(
    { provider: "AIHOT_SELECTED", searchQuery: "AI", resultLimit: 2, windowHours: 24 },
    async () => ({
      items: [{
        publicId: "story-1",
        title: "OpenAI 发布新的 Agent 能力",
        originalTitle: "OpenAI ships new agent capabilities",
        summary: "AIHOT 发现层摘要",
        publishedAt: "2026-10-03T08:00:00Z",
        source: { name: "Example Media" },
        links: { original: "https://example.com/openai-agent", aihot: "https://aihot.news/stories/story-1" }
      }]
    })
  );
  assert(aihot.items[0]?.originalUrl === "https://example.com/openai-agent", "AIHOT_ORIGINAL_URL");
  assert(aihot.items[0]?.metadata?.sourceRole === "SECONDARY_DISCOVERY", "AIHOT_SECONDARY_ROLE");
  assert(aihot.items[0]?.metadata?.factualSource === false, "AIHOT_NOT_FACT_SOURCE");

  const previousDailyHotBase = process.env.DAILYHOT_API_BASE_URL;
  process.env.DAILYHOT_API_BASE_URL = "https://dailyhot.internal";
  const dailyHot = await collectTrendDiscovery(
    { provider: "DAILYHOT_DOMESTIC", searchQuery: "AI", resultLimit: 2, windowHours: 24 },
    async () => ({
      code: 200,
      data: [
        { id: "w1", title: "国产大模型发布新版本", url: "https://example.com/hot/1", hot: 123456 },
        { id: "w2", title: "AI Agent 成为热议话题", url: "https://example.com/hot/2", hot: 99888 }
      ]
    })
  );
  if (previousDailyHotBase === undefined) delete process.env.DAILYHOT_API_BASE_URL;
  else process.env.DAILYHOT_API_BASE_URL = previousDailyHotBase;
  assert(dailyHot.items[0]?.metadata?.sourceRole === "TREND_SIGNAL", "DAILYHOT_SIGNAL_ROLE");
  assert(dailyHot.items[0]?.platformMetrics?.hotValue === 123456, "DAILYHOT_HOT_VALUE");

  const dailyHotPlatformCases = [
    ["DAILYHOT_WEIBO", "weibo", "WEIBO"],
    ["DAILYHOT_ZHIHU", "zhihu", "ZHIHU"],
    ["DAILYHOT_DOUYIN", "douyin", "DOUYIN"]
  ] as const;
  process.env.DAILYHOT_API_BASE_URL = "https://dailyhot.internal";
  for (const [provider, route, platform] of dailyHotPlatformCases) {
    let requestedUrl = "";
    const collected = await collectTrendDiscovery(
      { provider, searchQuery: "AI", resultLimit: 1, windowHours: 24 },
      async (url) => {
        requestedUrl = url;
        return {
          code: 200,
          data: [{
            id: route + "-1",
            title: platform + " AI 热点",
            desc: "平台热榜信号",
            timestamp: 1791008691000,
            hot: 31260000,
            url: "https://example.com/" + route + "/1"
          }]
        };
      }
    );
    assert(new URL(requestedUrl).pathname === "/" + route, "DAILYHOT_ROUTE:" + provider);
    assert(collected.items[0]?.externalId === "dailyhot:" + route + ":" + route + "-1", "DAILYHOT_EXTERNAL_ID:" + provider);
    assert(collected.items[0]?.metadata?.sourcePlatform === platform, "DAILYHOT_PLATFORM:" + provider);
    assert(collected.items[0]?.publishedAt === "2026-10-03T06:24:51.000Z", "DAILYHOT_TIMESTAMP:" + provider);
  }
  if (previousDailyHotBase === undefined) delete process.env.DAILYHOT_API_BASE_URL;
  else process.env.DAILYHOT_API_BASE_URL = previousDailyHotBase;

  const previousRssHubBase = process.env.RSSHUB_BASE_URL;
  process.env.RSSHUB_BASE_URL = "https://rsshub.internal";
  const rssHubXml = `<?xml version="1.0"?><rss><channel>
    <item><title>微博热搜：AI应用爆发</title><link>https://example.com/weibo/1</link><guid>w1</guid><pubDate>Sat, 03 Oct 2026 08:00:00 GMT</pubDate><description>热榜摘要</description></item>
    <item><title>微博热搜：智能体工作流</title><link>https://example.com/weibo/2</link><guid>w2</guid></item>
  </channel></rss>`;
  const rssHub = await collectTrendDiscovery(
    { provider: "RSSHUB_DOMESTIC_HOT", searchQuery: "AI", resultLimit: 2, windowHours: 24 },
    async () => ({}),
    { fetchText: async () => ({ body: rssHubXml }) }
  );
  if (previousRssHubBase === undefined) delete process.env.RSSHUB_BASE_URL;
  else process.env.RSSHUB_BASE_URL = previousRssHubBase;
  assert(rssHub.items[0]?.title === "微博热搜：AI应用爆发", "RSSHUB_HOT_PARSE");
  assert(rssHub.items[0]?.metadata?.sourceMode === "CONFIGURABLE_RSS", "RSSHUB_CONFIGURABLE_MODE");

  const previousTrendRadarBase = process.env.TRENDRADAR_API_BASE_URL;
  process.env.TRENDRADAR_API_BASE_URL = "https://trendradar.internal";
  const trendRadar = await collectTrendDiscovery(
    { provider: "TRENDRADAR_SIGNAL", searchQuery: "AI", resultLimit: 2, windowHours: 24 },
    async () => ({
      status: "success",
      items: [
        { title: "大模型推理成本下降", url: "https://example.com/news/1" },
        { title: "AI 编程工具热度上升", url: "https://example.com/news/2" }
      ]
    })
  );
  if (previousTrendRadarBase === undefined) delete process.env.TRENDRADAR_API_BASE_URL;
  else process.env.TRENDRADAR_API_BASE_URL = previousTrendRadarBase;
  assert(trendRadar.items[0]?.metadata?.sourceMode === "TRENDRADAR_NEWSNOW_API", "TRENDRADAR_SOURCE_MODE");
  assert(trendRadar.items[0]?.metadata?.factualSource === false, "TRENDRADAR_NOT_FACT");

  const previousYoutube = process.env.YOUTUBE_DATA_API_KEY;
  process.env.YOUTUBE_DATA_API_KEY = "test-key";
  const youtube = await collectTrendDiscovery(
    { provider: "YOUTUBE_AI_TREND", searchQuery: "AI Agent", resultLimit: 2, windowHours: 72 },
    async () => ({
      items: [{
        id: { videoId: "yt1" },
        snippet: {
          title: "AI Agents Explained",
          channelTitle: "AI Channel",
          description: "Agent tutorial",
          publishedAt: "2026-10-03T08:00:00Z"
        }
      }]
    })
  );
  if (previousYoutube === undefined) delete process.env.YOUTUBE_DATA_API_KEY;
  else process.env.YOUTUBE_DATA_API_KEY = previousYoutube;
  assert(youtube.items[0]?.metadata?.trendSignalType === "SEARCH_PROXY", "YOUTUBE_PROXY_LABEL");

  const previousProductHunt = process.env.PRODUCT_HUNT_API_TOKEN;
  process.env.PRODUCT_HUNT_API_TOKEN = "test-token";
  const productHunt = await collectTrendDiscovery(
    { provider: "PRODUCT_HUNT", searchQuery: "AI", resultLimit: 2, windowHours: 72 },
    async () => ({}),
    {
      fetchImpl: async () => new Response(JSON.stringify({
        data: {
          posts: {
            edges: [{
              node: {
                id: "ph1",
                name: "Agent Tool",
                tagline: "AI workflow automation",
                url: "https://www.producthunt.com/posts/agent-tool",
                votesCount: 420,
                commentsCount: 60,
                createdAt: "2026-10-03T08:00:00Z"
              }
            }]
          }
        }
      }), { status: 200, headers: { "content-type": "application/json" } })
    }
  );
  if (previousProductHunt === undefined) delete process.env.PRODUCT_HUNT_API_TOKEN;
  else process.env.PRODUCT_HUNT_API_TOKEN = previousProductHunt;
  assert(productHunt.items[0]?.platformMetrics?.votes === 420, "PRODUCT_HUNT_PARSE");

  const localized = await localizeCollectedItemsForChineseReview(
    [{
      title: "Anthropic releases Claude 5 API",
      excerpt: "Claude 5 improves Agent tool use.",
      metadata: { test: true }
    }],
    {
      disableAi: true,
      translateBatch: async (items) => ({
        items: items.map((item) => ({
          index: item.index,
          titleZh: "Anthropic 发布 Claude 5 API",
          excerptZh: "Claude 5 提升 Agent 工具调用能力。"
        }))
      })
    }
  );
  const localizedMetadata = localized[0]?.metadata as unknown as Record<string, unknown> | undefined;
  const localization = localizedMetadata?.reviewLocalization as Record<string, unknown> | undefined;
  assert(localized[0]?.title === "Anthropic releases Claude 5 API", "ORIGINAL_TITLE_OVERWRITTEN");
  assert(localization?.originalTitle === "Anthropic releases Claude 5 API", "ORIGINAL_TITLE_MISSING");
  assert(localization?.displayTitleZh === "Anthropic 发布 Claude 5 API", "ZH_TITLE_MISSING");
  assert(localization?.translationStatus === "TRANSLATED", "TRANSLATION_STATUS");

  const failedLocalization = await localizeCollectedItemsForChineseReview(
    [{ title: "English AI headline", excerpt: "English excerpt", metadata: {} }],
    { disableAi: true, translateBatch: async () => { throw new Error("MODEL_DOWN"); } }
  );
  const failedMetadata = failedLocalization[0]?.metadata as unknown as Record<string, unknown> | undefined;
  const failed = failedMetadata?.reviewLocalization as Record<string, unknown> | undefined;
  assert(failedLocalization.length === 1, "TRANSLATION_FAILURE_BLOCKED_COLLECTION");
  assert(failed?.translationStatus === "UNAVAILABLE", "TRANSLATION_FAILURE_STATUS");

  const browserFallback = normalizeGlobalTrendRunnerPayload({
    sourceId: "source_strategy_trend_reddit_ai_hot_test",
    provider: "REDDIT_AI_HOT",
    capturedAt: "2026-10-03T10:00:00Z",
    items: [{
      rank: 1,
      title: "LocalLLaMA hot post",
      url: "https://www.reddit.com/r/LocalLLaMA/comments/test/post/",
      comments: 120,
      points: 900
    }]
  });
  assert(browserFallback.items[0]?.metadata?.sourceMode === "BROWSER_PUBLIC", "GLOBAL_BROWSER_FALLBACK_MODE");
  assert(browserFallback.items[0]?.metadata?.factualSource === false, "GLOBAL_BROWSER_FALLBACK_NOT_FACT");
  assert(browserFallback.items[0]?.metadata?.referenceOnly === true, "GLOBAL_BROWSER_FALLBACK_REFERENCE_ONLY");

  const policy = fs.readFileSync("lib/content/intelligence-policy.ts", "utf8");
  for (const provider of [
    "signal_x",
    "signal_github",
    "signal_hacker_news",
    "signal_youtube",
    "signal_reddit"
  ]) {
    assert(policy.includes(provider), "CORE_SIGNAL_POLICY_MISSING:" + provider);
  }

  const ui = fs.readFileSync("components/AdminPlatformContentWorkspace.tsx", "utf8");


  assert(ui.includes("reviewTitle(raw)"), "ADMIN_ZH_REVIEW_TITLE_MISSING");
  assert(ui.includes("中英对照"), "ADMIN_BILINGUAL_REVIEW_MARKER_MISSING");
  const runner = fs.readFileSync("lib/server/content/global-trend-runner.ts", "utf8");
  assert(runner.includes("BROWSER_PUBLIC"), "GLOBAL_BROWSER_RUNNER_MISSING");
  const collectionRunner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
  assert(collectionRunner.includes("COLLECTION_NETWORK_UNREACHABLE"), "NETWORK_FAILURE_NOT_CLASSIFIED");

  console.log("CONTENT_AI_GLOBAL_TREND_HUGGINGFACE_MODELS=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_HUGGINGFACE_PAPERS=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_REDDIT=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_ARXIV=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_AIHOT=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_DAILYHOT=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_RSSHUB=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_TRENDRADAR=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_YOUTUBE_CONTRACT=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_PRODUCT_HUNT_CONTRACT=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_CHINESE_REVIEW=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_TRANSLATION_FAIL_OPEN=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_SIGNAL_NOT_FACT=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_BROWSER_FALLBACK=PASS");
  console.log("CONTENT_AI_GLOBAL_TREND_NETWORK_FAILURE_CLASSIFIED=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
