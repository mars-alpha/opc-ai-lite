import { buildEventExpansionQueryPlan, classifyEventExpansionCandidate } from "../lib/server/content/event-expansion";
import { collectEventExpansionSearch, providerQueryPlan } from "../lib/server/content/collection-expansion";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_EXPANSION_SOURCE_COVERAGE_FAILED:" + code);
}

function metadataFlag(value: unknown, key: string) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && (value as Record<string, unknown>)[key] === true);
}

async function main() {
  const relayUrl = process.env.OVERSEAS_COLLECTOR_RELAY_URL;
  const relaySecret = process.env.OVERSEAS_COLLECTOR_RELAY_SECRET;
  const youtubeKey = process.env.YOUTUBE_DATA_API_KEY;

  delete process.env.OVERSEAS_COLLECTOR_RELAY_URL;
  delete process.env.OVERSEAS_COLLECTOR_RELAY_SECRET;
  process.env.YOUTUBE_DATA_API_KEY = "coverage-acceptance-key";

  const context = {
    title: "OpenAI GPT-6 智能界面发布",
    summary: "GPT-6 新增智能界面与工作流能力。",
    keywords: ["GPT-6", "智能界面", "工作流"],
    entityTerms: ["OpenAI", "GPT-6"]
  };
  const plan = buildEventExpansionQueryPlan(context, 10);

  try {
    const biliPlan = providerQueryPlan("BILIBILI_SEARCH", plan, 2);
    const youtubePlan = providerQueryPlan("YOUTUBE_SEARCH", plan, 2);
    assert(biliPlan.length === 2 && biliPlan.every((item) => item.language === "ZH"), "BILIBILI_CHINESE_QUERY_PLAN");
    assert(youtubePlan.length === 2 && youtubePlan.every((item) => item.language === "ZH"), "YOUTUBE_CHINESE_QUERY_PLAN");
    assert([...biliPlan, ...youtubePlan].every((item) => item.query.includes("GPT-6")), "EVENT_ANCHOR_REQUIRED");
    const modelContext = {
      title: "EmbeddingGemma 2：一个开放、轻量级的多模态嵌入模型",
      summary: "Google 发布 EmbeddingGemma 2。",
      keywords: ["EmbeddingGemma 2", "多模态嵌入", "模型"],
      entityTerms: ["EmbeddingGemma 2", "Google"]
    };
    assert(!classifyEventExpansionCandidate(modelContext, {
      rawItemId: "negative-model-roundup",
      platform: "BILIBILI",
      title: "谷歌发布 Nano Banana 2.1：画面设计和主体一致性升级",
      excerpt: "AI 简报中同时提到 EmbeddingGemma 2，但本条视频主题是 Nano Banana 2.1 的设计能力。"
    }), "ROUNDUP_OTHER_PRODUCT_MUST_NOT_MATCH_MODEL_EVENT");
    assert(!classifyEventExpansionCandidate(modelContext, {
      rawItemId: "negative-unrelated-value-signal",
      platform: "BILIBILI",
      title: "Gamma 5炸场，Gemini 4 现身Antigravity CLI！EmbeddingGemma 2开源 | AI日报",
      excerpt: "1. Gamma 发布 Gamma 5，智能体接管演示文稿规划与编辑 2. Gemini 4 Argon 曝光 3. DeepMind 发布多模态端侧嵌入模型 EmbeddingGemma 2 4. Nano Banana 2.1 登榜"
    }), "UNRELATED_SECTION_VALUE_SIGNAL_MUST_NOT_CLASSIFY_TARGET");

    const productContext = {
      title: "ChatGPT 正变得视觉化得多，并推出全新界面",
      summary: "ChatGPT 推出新的视觉化界面能力。",
      keywords: ["ChatGPT", "全新界面", "视觉化"],
      entityTerms: ["ChatGPT", "OpenAI"]
    };
    const productPlan = buildEventExpansionQueryPlan(productContext, 10);
    assert(productPlan.subject.includes("全新界面"), "PRODUCT_FEATURE_SPECIFIC_ANCHOR_QUERY_MISSING");
    assert(!classifyEventExpansionCandidate(productContext, {
      rawItemId: "negative-chatgpt-math",
      platform: "BILIBILI",
      title: "AAA论文批发gpt哥今天又来炸数学界了",
      excerpt: "讨论 ChatGPT 数学能力和 Lean 形式化，但没有新界面体验。"
    }), "SAME_BRAND_OTHER_TOPIC_MUST_NOT_MATCH_PRODUCT_EVENT");


    let biliUrl = "";
    const bili = await collectEventExpansionSearch(
      "BILIBILI_SEARCH",
      biliPlan[0]!.query,
      72,
      10,
      {
        fetchJson: async (url) => {
          biliUrl = url;
          return {
            data: {
              result: [{
                result_type: "video",
                data: [{
                  bvid: "BV1Coverage013",
                  title: "<em class=\"keyword\">GPT-6</em> 上手实测：智能界面工作流怎么用",
                  author: "OPC测试",
                  description: "中文体验教程，演示 GPT-6 智能界面在内容运营与办公中的实际使用。",
                  pubdate: Math.floor(Date.now() / 1000),
                  play: 12800,
                  like: 860,
                  favorites: 520,
                  review: 91,
                  video_review: 143
                }]
              }]
            }
          };
        }
      }
    );
    const parsedBiliUrl = new URL(biliUrl);
    assert(parsedBiliUrl.pathname === "/x/web-interface/search/all/v2", "BILIBILI_MUST_USE_EVENT_SEARCH_NOT_POPULAR");
    assert(parsedBiliUrl.searchParams.get("keyword")?.includes("GPT-6"), "BILIBILI_QUERY_ANCHOR_MISSING");
    assert(bili.items.length === 1 && metadataFlag(bili.items[0]?.metadata, "referenceOnly"), "BILIBILI_REFERENCE_ONLY");
    assert(!bili.items[0]?.title.includes("<em"), "BILIBILI_HIGHLIGHT_NOT_CLEANED");
    assert(Boolean(classifyEventExpansionCandidate(context, {
      rawItemId: "coverage-bili",
      platform: "BILIBILI",
      ...bili.items[0]
    })), "BILIBILI_RELEVANT_CONTENT_REJECTED");

    const youtubeRequests: string[] = [];
    const youtube = await collectEventExpansionSearch(
      "YOUTUBE_SEARCH",
      youtubePlan[0]!.query,
      72,
      10,
      {
        fetchJson: async (url) => {
          youtubeRequests.push(url);
          const parsed = new URL(url);
          if (parsed.pathname.endsWith("/search")) {
            assert(parsed.searchParams.get("q")?.includes("GPT-6"), "YOUTUBE_QUERY_ANCHOR_MISSING");
            assert(Boolean(parsed.searchParams.get("publishedAfter")), "YOUTUBE_TIME_WINDOW_MISSING");
            return {
              items: [{
                id: { videoId: "coverage013youtube" },
                snippet: {
                  title: "GPT-6 中文上手实测：智能界面工作流怎么用",
                  description: "中文教程，演示 GPT-6 在办公与内容运营中的实际使用。",
                  channelTitle: "OPC Coverage",
                  publishedAt: new Date().toISOString()
                }
              }]
            };
          }
          return {
            items: [{
              id: "coverage013youtube",
              statistics: { viewCount: "23000", likeCount: "1200", commentCount: "118" }
            }]
          };
        }
      }
    );
    assert(youtubeRequests.length === 2, "YOUTUBE_SEARCH_AND_STATS_REQUIRED");
    assert(youtube.items.length === 1 && metadataFlag(youtube.items[0]?.metadata, "referenceOnly"), "YOUTUBE_REFERENCE_ONLY");
    assert(Boolean(classifyEventExpansionCandidate(context, {
      rawItemId: "coverage-youtube",
      platform: "YOUTUBE",
      ...youtube.items[0]
    })), "YOUTUBE_RELEVANT_CONTENT_REJECTED");

    console.log("EVENT_EXPANSION_SOURCE_COVERAGE_FALSE_POSITIVE_REGRESSION=PASS");
    console.log("EVENT_EXPANSION_SOURCE_COVERAGE_PROVIDER_ROUTING=PASS");
    console.log("EVENT_EXPANSION_SOURCE_COVERAGE_EVENT_ANCHORS=PASS");
    console.log("EVENT_EXPANSION_SOURCE_COVERAGE_BILIBILI=PASS");
    console.log("EVENT_EXPANSION_SOURCE_COVERAGE_YOUTUBE=PASS");
    console.log("EVENT_EXPANSION_SOURCE_COVERAGE_REFERENCE_ONLY=PASS");
  } finally {
    if (relayUrl === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_URL;
    else process.env.OVERSEAS_COLLECTOR_RELAY_URL = relayUrl;
    if (relaySecret === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_SECRET;
    else process.env.OVERSEAS_COLLECTOR_RELAY_SECRET = relaySecret;
    if (youtubeKey === undefined) delete process.env.YOUTUBE_DATA_API_KEY;
    else process.env.YOUTUBE_DATA_API_KEY = youtubeKey;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
