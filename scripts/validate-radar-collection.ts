import fs from "node:fs";
import path from "node:path";
import { calculateTopicMomentum } from "../lib/server/content/topic-momentum";
import {
  acquisitionSupportsServerRuntime,
  resolveSourceAcquisitionPlan
} from "../lib/server/content/source-acquisition-plan";
import { preferredDeepReadBackend } from "../lib/server/content/deep-read-contract";
import { RADAR_SOURCE_PORTFOLIO_VERSION } from "../lib/content/radar-source-portfolio";

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("RADAR_COLLECTION_FAILED:" + code);
  console.log(code + "=PASS");
}

const route = read("app/api/admin/content/intelligence/route.ts");
const ui = read("components/AdminIntelligenceWorkspace.tsx");
const operations = read("lib/server/content/source-runtime-operations.ts");
const runner = read("lib/server/content/collection-runner.ts");
const portfolio = read("lib/content/radar-source-portfolio.ts");
const cycle = read("scripts/run-server-native-automatic-cycle.ts");
const nav = read("components/AdminWorkspaceNav.tsx");
const architecture = read("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md");
const mapping = read("docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md");
const acquisition = read("lib/server/content/source-acquisition-plan.ts");
const facts = read("docs/CURRENT_SYSTEM_FACTS.md");

assert(route.includes('view === "current-hot"'), "RADAR_CURRENT_HOT_API");
assert(route.includes('"PRESENTATION_ONLY"'), "RADAR_CURRENT_HOT_NO_AUTHORITY_PROMOTION");
assert(route.includes('view === "source-health"'), "RADAR_SOURCE_HEALTH_API");
assert(ui.includes("当前热点"), "RADAR_CURRENT_HOT_UI");
assert(!ui.includes("currentHot.slice("), "RADAR_CURRENT_HOT_NO_FIXED_COUNT");
assert(ui.includes("当前热点") && ui.includes("今日值得做") && ui.includes("精选") && ui.includes("全部动态"), "HOT_TRACKING_CURRENT_LAYOUT_DATA_BINDING");
assert(ui.includes("data.worthPracticing") && ui.includes("实践证据") && !ui.includes("todayWorthWatching"), "TODAY_WORTH_DOING_PRACTICAL_DIRECTION");
assert(ui.includes("actionablePracticalEvidenceCount"), "TODAY_WORTH_DOING_ACTIONABLE_EVIDENCE_GATE");
assert(ui.includes("reportTimeline") && ui.includes("加载更多") && ui.includes("shortSummary") && ui.includes("intel-timeline-day"), "RADAR_SEVEN_DAY_GROUPED_PAGINATION_UI");
assert(ui.includes("open={dayIndex === 0}") && ui.includes("近 7 天全部 AI 相关"), "RADAR_DAILY_COLLAPSE_FIRST_DAY_ONLY");
assert(ui.includes("reportTimeline") && ui.includes("evidenceLinks"), "RADAR_MULTI_SOURCE_STORY_UI");
assert(ui.includes("采集") && ui.includes("AI强相关") && ui.includes("失败"), "RADAR_SOURCE_HEALTH_INTEGRATED_UI");
assert(ui.includes("effectiveQualification") && ui.includes("serverRuntimeSupported"), "RADAR_RUNTIME_TRUTH_VISIBLE");
assert(!nav.includes('href: "/admin/automatic-collection"'), "RADAR_NO_STANDALONE_AUTO_NAV");
assert(!fs.existsSync(path.join(process.cwd(), "app/admin/automatic-collection")), "RADAR_OLD_AUTO_ROUTE_REMOVED");
assert(!fs.existsSync(path.join(process.cwd(), "app/api/admin/content/automatic-collection")), "RADAR_OLD_AUTO_API_REMOVED");
assert(!fs.existsSync(path.join(process.cwd(), "components/AdminAutomaticCollectionWorkspace.tsx")), "RADAR_OLD_AUTO_WORKSPACE_REMOVED");
assert(!ui.includes("今日 TOP3 · 三口味"), "RADAR_PERSONA_NOT_PRIMARY_UI");

const momentum = calculateTopicMomentum({
  firstSeenAt: "2026-10-08T00:00:00.000Z",
  now: new Date("2026-10-12T00:00:00.000Z"),
  raws: [
    {
      sourceId: "creator-a",
      sourceType: "SOCIAL",
      sourceName: "Creator A",
      platform: "YOUTUBE",
      author: "Creator A",
      publishedAt: "2026-10-10T08:00:00.000Z",
      collectedAt: "2026-10-10T08:00:00.000Z",
      metadata: { contentType: "VIDEO" },
      platformMetrics: { views: 1000 }
    },
    {
      sourceId: "creator-b",
      sourceType: "SOCIAL",
      sourceName: "Creator B",
      platform: "X",
      author: "Creator B",
      publishedAt: "2026-10-11T08:00:00.000Z",
      collectedAt: "2026-10-11T08:00:00.000Z",
      metadata: { contentType: "SOCIAL_POST" },
      platformMetrics: { likes: 30 }
    }
,
    {
      sourceId: "creator-c",
      sourceType: "SOCIAL",
      sourceName: "Creator C",
      platform: "WEB",
      author: "Creator C",
      publishedAt: "2026-10-11T18:00:00.000Z",
      collectedAt: "2026-10-11T18:00:00.000Z",
      metadata: { contentType: "SOCIAL_POST" },
      platformMetrics: { comments: 20 }
    }
  ],
  evidence: [
    { expansionType: "TUTORIAL" },
    { expansionType: "EXPERIENCE" }
  ]
});
assert(momentum.eligible, "RADAR_CURRENT_HOT_TOPIC_MOMENTUM_ACTIVITY_GATE");
const readModel = read("lib/server/content/intelligence-read-model.ts");
assert(readModel.includes("const currentHotPresentationEligible = topicMomentum.eligible"), "RADAR_CURRENT_HOT_TOPIC_MOMENTUM_ONLY");
assert(!readModel.includes("currentHotScore"), "RADAR_OLD_CURRENT_HOT_SCORE_REMOVED");
assert(readModel.includes("listRadarTimelinePage") && readModel.includes("listRadarTimelineWindow"), "RADAR_TIMELINE_PAGINATION_AND_SEVEN_DAY_WINDOW");

assert(operations.includes("aiRelevantKeepRate"), "SOURCE_AI_KEEP_RATE_OWNER");
assert(operations.includes("runtimeGapCount") && operations.includes("serverRuntimeSupported"), "SOURCE_RUNTIME_GAP_VISIBLE");
assert(operations.includes("successRate") && operations.includes("duplicateRate"), "SOURCE_UTILITY_BASELINE");
assert(portfolio.includes("RADAR_SOURCE_PORTFOLIO_VERSION") && RADAR_SOURCE_PORTFOLIO_VERSION.startsWith("bole-radar-v"), "RUNTIME_CURRENT_PORTFOLIO_OWNER");
assert(cycle.includes('runSection("SOURCE_PORTFOLIO"'), "RUNTIME_CYCLE_SOURCE_PORTFOLIO");
assert(cycle.includes('runSection("DISCOVERY_EXPANSION"') && cycle.indexOf('runSection("SOURCE_PORTFOLIO"') < cycle.indexOf('runSection("DISCOVERY_EXPANSION"') && cycle.indexOf('runSection("DISCOVERY_EXPANSION"') < cycle.indexOf('runSection("RADAR_SNAPSHOT"'), "RUNTIME_EXPANSION_IN_PRODUCTION_CYCLE");
assert(cycle.includes("CYCLE_SECTION_START=") && cycle.includes("CYCLE_SECTION_PASS=") && cycle.includes("ELAPSED_MS="), "RUNTIME_CYCLE_SECTION_OBSERVABILITY");

const unresolved = resolveSourceAcquisitionPlan({
  collectionMethod: "UNKNOWN",
  platform: "UNKNOWN"
});
assert(unresolved.kind === "UNRESOLVED" && !unresolved.serverRuntimeSupported, "ACQUISITION_UNKNOWN_FAIL_CLOSED");
assert(!acquisition.includes('kind: "STATIC_PAGE", explicit: false'), "ACQUISITION_NO_HTTP_DEFAULT");
assert(resolveSourceAcquisitionPlan({
  collectionMethod: "HTTP",
  platform: "WEB"
}).kind === "STATIC_PAGE", "ACQUISITION_LEGACY_HTTP_EXPLICIT_ONLY");
assert(resolveSourceAcquisitionPlan({
  collectionMethod: "RSS",
  platform: "WEB"
}).kind === "RSS_ATOM", "ACQUISITION_RSS_ROUTE");
assert(resolveSourceAcquisitionPlan({
  collectionMethod: "RESEARCH",
  platform: "ARXIV",
  collectionConfig: { provider: "ARXIV" }
}).kind === "RSS_ATOM", "ACQUISITION_ARXIV_ATOM_ROUTE");

const hfWithoutOwner = resolveSourceAcquisitionPlan({
  collectionMethod: "RESEARCH",
  platform: "HUGGING_FACE",
  collectionConfig: { provider: "HF" }
});
assert(hfWithoutOwner.kind === "PUBLIC_JSON_API" && !hfWithoutOwner.serverRuntimeSupported, "ACQUISITION_CUSTOM_RUNTIME_NOT_IMPLIED");
assert(acquisitionSupportsServerRuntime("PUBLIC_JSON_API", "HF_RESEARCH_RUNTIME"), "ACQUISITION_CUSTOM_RUNTIME_OWNER_REQUIRED");
assert(acquisitionSupportsServerRuntime("JINA_READER"), "ACQUISITION_JINA_RUNTIME_SUPPORTED");
const routed = resolveSourceAcquisitionPlan({
  collectionMethod: "RSS",
  platform: "WEB",
  canonicalUrl: "https://example.com/feed.xml",
  collectionConfig: {
    acquisition: {
      routes: [
        { id: "native", role: "PRIMARY", kind: "RSS_ATOM", url: "https://example.com/feed.xml", costLevel: "LOW" },
        { id: "reader", role: "FALLBACK", kind: "JINA_READER", url: "https://example.com/", costLevel: "HIGH" }
      ]
    }
  }
});
assert(routed.routes.length === 2 && routed.primaryRoute.id === "native", "ACQUISITION_ROUTE_LIST_PRIMARY");
assert(routed.fallbackRoutes[0]?.id === "reader" && routed.fallbackRoutes[0]?.costLevel === "HIGH", "ACQUISITION_ROUTE_LIST_FALLBACK_COST");
assert(routed.kind === "RSS_ATOM" && routed.fallbackKinds[0] === "JINA_READER", "ACQUISITION_LEGACY_MIRROR_FROM_ROUTES");
assert(runner.includes("collectJinaReader") && runner.includes('route.kind === "JINA_READER"'), "ACQUISITION_JINA_RUNTIME_WIRED");

assert(preferredDeepReadBackend({
  acquisitionKind: "RSS_ATOM",
  javascriptRequired: false,
  crawl4aiConfigured: false
}) === "SOURCE_ACQUISITION", "DEEP_READ_USES_SOURCE_ACQUISITION");
let noHttpFallback = false;
try {
  preferredDeepReadBackend({
    acquisitionKind: "STATIC_PAGE",
    javascriptRequired: true,
    crawl4aiConfigured: false
  });
} catch (error) {
  noHttpFallback = error instanceof Error && error.message === "DEEP_READ_JAVASCRIPT_BACKEND_REQUIRED";
}
assert(noHttpFallback, "DEEP_READ_NO_HTTP_DEFAULT_FALLBACK");

assert(facts.includes("Source Management") && facts.includes("Acquisition Route"), "RADAR_CURRENT_FACT_OWNER");
assert(architecture.includes("Source Management") && architecture.includes("唯一") && architecture.includes("Source identity / operator-added Source"), "RADAR_CURRENT_CONTRACT_OWNER");
assert(
  architecture.includes("Primary Route") &&
  architecture.includes("Fallback Route") &&
  architecture.includes("Source Identity 与 Acquisition Route 永久分离"),
  "RADAR_ROUTE_GOVERNANCE_FACT"
);
assert(mapping.includes("source-runtime-operations.ts"), "RADAR_RUNTIME_OPERATIONS_OWNER");

console.log("RADAR_COLLECTION_SOURCE_PORTFOLIO=PASS");
