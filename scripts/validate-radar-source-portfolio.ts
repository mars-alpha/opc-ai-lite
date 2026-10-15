import fs from "node:fs";
import {
  RADAR_OPTIONAL_CAPABILITIES,
  RADAR_SOURCE_PORTFOLIO,
  RADAR_SOURCE_PORTFOLIO_VERSION
} from "../lib/content/radar-source-portfolio";
import { INITIAL_SOURCE_POLICIES } from "../lib/content/intelligence-policy";
import { resolveSourceAcquisitionPlan } from "../lib/server/content/source-acquisition-plan";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("RADAR_SOURCE_PORTFOLIO_FAILED:" + code);
  console.log(code + "=PASS");
}

const ids = RADAR_SOURCE_PORTFOLIO.map((item) => item.sourceId);
const groups = [...new Set(RADAR_SOURCE_PORTFOLIO.map((item) => item.group))];
assert(RADAR_SOURCE_PORTFOLIO_VERSION === "bole-radar-v5-aihot-gap-fill", "PORTFOLIO_VERSION_V5");
assert(RADAR_SOURCE_PORTFOLIO.length > 0, "PORTFOLIO_NON_EMPTY");
assert(groups.length === 7, "PORTFOLIO_GROUP_COUNT_7");
assert(new Set(ids).size === ids.length, "PORTFOLIO_SOURCE_IDS_UNIQUE");
for (const group of [
  "Official AI Updates",
  "Curated Media",
  "AI HOT",
  "Hacker News",
  "GitHub Trending",
  "Product Hunt",
  "OPML RSS"
]) {
  assert(groups.includes(group as never), "PORTFOLIO_GROUP_" + group.replace(/\W+/g, "_"));
}
assert(RADAR_SOURCE_PORTFOLIO.filter((item) => item.sourceType === "OFFICIAL").length >= 6, "PORTFOLIO_OFFICIAL_COVERAGE");
assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.name === "InfoQ CN"), "PORTFOLIO_CHINESE_MEDIA");
for (const key of ["official_aws_ml", "official_cohere", "official_cloudflare_ai", "official_langchain_blog", "official_ollama_blog", "official_openrouter_blog", "official_together_ai", "official_fireworks_ai", "official_qwen_blog", "research_arxiv_cs_ai", "research_bair", "creator_latent_space", "creator_ml_mastery", "media_ars_ai", "media_mit_tech_review_ai", "media_qbitai", "media_geekpark", "media_ifanr", "media_sspai"]) {
  assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.key === key), "PORTFOLIO_LIVE_VERIFIED_SOURCE_" + key);
}
assert(!RADAR_SOURCE_PORTFOLIO.some((item) => ["official_huggingface", "official_huggingface_blog", "official_mistral_ai", "media_venturebeat_ai"].includes(item.key)), "PORTFOLIO_UNRUNNABLE_IDENTITIES_EXITED");
assert(!RADAR_SOURCE_PORTFOLIO.some((item) => ["media_ai_news", "follow_builders", "official_openai_skills", "official_claude_code_releases"].includes(item.key)), "PORTFOLIO_UNSTABLE_OR_RETIRED_SOURCES_EXITED");
assert(!RADAR_SOURCE_PORTFOLIO.some((item) => item.key.startsWith("official_anthropic") || item.providerRef === "RADAR_OFFICIAL_ANTHROPIC"), "PORTFOLIO_ANTHROPIC_OPERATOR_IDENTITY_NOT_DUPLICATED");
assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.name === "宝玉"), "PORTFOLIO_CHINESE_BUILDER");
assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.name === "AI HOT"), "PORTFOLIO_AI_HOT");
const googleAi = RADAR_SOURCE_PORTFOLIO.find((item) => item.key === "official_google_ai");
assert(Boolean(googleAi), "PORTFOLIO_GOOGLE_AI_PRESENT");
assert(
  googleAi?.acquisition.routes.length === 2 &&
  googleAi.acquisition.routes[1]?.role === "FALLBACK" &&
  googleAi.acquisition.routes[1]?.url === "https://blog.google/rss/",
  "PORTFOLIO_GOOGLE_AI_OFFICIAL_FALLBACK"
);
assert(
  googleAi?.keywordPolicy?.mustIncludeAny?.includes("gemini") === true &&
  googleAi?.keywordPolicy?.mustIncludeAny?.includes("ai") === true,
  "PORTFOLIO_GOOGLE_AI_FALLBACK_FILTERED"
);
assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.platform === "GITHUB"), "PORTFOLIO_GITHUB");
assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.platform === "HACKER_NEWS"), "PORTFOLIO_HN");
assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.platform === "PRODUCT_HUNT"), "PORTFOLIO_PRODUCT_HUNT");
assert(RADAR_SOURCE_PORTFOLIO.every((item) =>
  item.acquisition.routes.length >= 1 &&
  item.acquisition.routes[0]?.role === "PRIMARY" &&
  !item.acquisition.routes.some((route) => String(route.kind) === "STATIC_PAGE")
), "PORTFOLIO_PRIMARY_ROUTES_NO_STATIC_HTTP_DEFAULT");
assert(!RADAR_SOURCE_PORTFOLIO.some((item) =>
  item.canonicalUrl?.includes("news.learnprompt.pro/data") ||
  item.platform === "AI_NEWS_RADAR"
), "REFERENCE_SITE_NOT_UPSTREAM_OWNER");
assert(
  !RADAR_SOURCE_PORTFOLIO.some((item) => ["X", "XIAOHONGSHU", "DOUYIN", "TIKHUB", "SOCIALDATA"].includes(item.platform)),
  "PAID_SOCIAL_NOT_DEFAULT"
);
assert(
  RADAR_OPTIONAL_CAPABILITIES.some((item) => item.key === "ai_breakfast" && item.status === "DISABLED_UNSTABLE") &&
  RADAR_OPTIONAL_CAPABILITIES.some((item) => item.key === "dailyhot_domestic" && item.status === "LIVE_SELF_HOSTED_QUALIFIED") &&
  RADAR_OPTIONAL_CAPABILITIES.some((item) => item.key === "waytoagi" && item.status === "CONDITIONAL") &&
  !RADAR_OPTIONAL_CAPABILITIES.some((item) => ["redfox_social","socialdata_x","tikhub_douyin","tikhub_xiaohongshu"].includes(item.key)),
  "OPTIONAL_ADVANCED_CAPABILITIES_EXPLICIT"
);
for (const source of RADAR_SOURCE_PORTFOLIO) {
  const acquisition = resolveSourceAcquisitionPlan({
    collectionMethod: source.collectionMethod,
    platform: source.platform,
    providerRef: source.providerRef,
    canonicalUrl: source.canonicalUrl,
    collectionConfig: {
      provider:
        source.key === "hacker_news" ? "HN_TOP" :
        source.key === "github_trending" ? "GITHUB_TREND_PROXY" :
        source.providerRef,
      acquisition: source.acquisition,
      ...(source.keywordPolicy ? { keywordPolicy: source.keywordPolicy } : {})
    }
  });
  assert(acquisition.kind !== "UNRESOLVED", "ACQUISITION_RESOLVED_" + source.key);
  assert(acquisition.routes.length >= 1 && acquisition.primaryRoute.role === "PRIMARY", "ACQUISITION_ROUTE_MODEL_" + source.key);
}
assert(INITIAL_SOURCE_POLICIES.every((policy) => ids.includes(policy.sourceId ?? "")), "POLICY_ONLY_CURRENT_PORTFOLIO");

const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
assert(cycle.includes('runSection("SOURCE_PORTFOLIO"'), "AUTOMATIC_CYCLE_PORTFOLIO_OWNER");
assert(cycle.includes("runSystemSourcePortfolio"), "AUTOMATIC_CYCLE_UNIFIED_PORTFOLIO_OWNER");
assert(!cycle.includes("runRadarSourcePortfolio"), "OLD_RADAR_EXECUTOR_EXITED");
assert(!cycle.includes('runSection("MEDIA"') && !cycle.includes('runSection("RESEARCH"') && !cycle.includes('runSection("TREND"'), "OLD_CYCLE_SEEDERS_EXITED");
assert(cycle.includes('runSection("DISCOVERY_EXPANSION"') && cycle.indexOf('runSection("DISCOVERY_EXPANSION"') < cycle.indexOf('runSection("TOPIC_MOMENTUM_FOLLOW_UP"') && cycle.indexOf('runSection("TOPIC_MOMENTUM_FOLLOW_UP"') < cycle.indexOf('runSection("RADAR_SNAPSHOT"'), "EXPANSION_IN_PRODUCTION_CYCLE_BEFORE_MOMENTUM_AND_SNAPSHOT");
assert(cycle.includes("failures.push") && cycle.includes("return null"), "EXPANSION_FAILURE_ISOLATED_BY_CYCLE_SECTION");
const runtime = fs.readFileSync("lib/server/content/source-portfolio-runtime.ts", "utf8");
const runtimeAdapters = fs.readFileSync("lib/server/content/source-acquisition-runtime-adapters.ts", "utf8");
const operations = fs.readFileSync("lib/server/content/source-runtime-operations.ts", "utf8");
assert(runtime.includes("isCurrentRadarPortfolioSource"), "RADAR_BASELINE_IDENTITY_PRESENT");
assert(runtime.includes("runSystemSourcePortfolio"), "UNIFIED_SYSTEM_PORTFOLIO_OWNER");
assert(operations.includes("listCurrentSystemCollectionSources"), "SOURCE_HEALTH_USES_UNIFIED_CURRENT_SOURCES");
assert(
  !runtimeAdapters.includes("RADAR_FOLLOW_BUILDERS") &&
  runtimeAdapters.includes("RADAR_AI_HOT"),
  "REFERENCE_PUBLIC_ADAPTERS_WIRED"
);
assert(
  !runtime.includes("collectFollowBuilders") && !runtime.includes("collectAiHot"),
  "PORTFOLIO_RUNTIME_HAS_NO_SPECIAL_COLLECTORS"
);
assert(!runtime.includes("news.learnprompt.pro/data"), "NO_REFERENCE_SITE_DATA_PROXY");
const readModel = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");
assert(readModel.includes("listRadarTimeline") && readModel.includes("originPublisher"), "RADAR_TIMELINE_ORIGIN_PUBLISHER");
const ui = fs.readFileSync("components/AdminIntelligenceWorkspace.tsx", "utf8");
for (const category of ["全部", "模型", "产品", "开发者", "行业", "论文", "社区", "自媒体"]) {
  assert(ui.includes(category), "RADAR_CATEGORY_" + category);
}
assert(ui.includes("intel-timeline-day") && ui.includes("intel-timeline-date"), "RADAR_DAY_TIMELINE");
assert(ui.includes("全部动态") && ui.includes("精选"), "RADAR_CURRENT_EVENT_VIEWS");

console.log("RADAR_SOURCE_PORTFOLIO_CONTRACT=PASS");
