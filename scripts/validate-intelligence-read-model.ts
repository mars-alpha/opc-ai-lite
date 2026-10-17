import fs from "node:fs";
import path from "node:path";

function assert(condition: unknown, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED:" + label);
  console.log(label + "=PASS");
}

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "lib/server/content/intelligence-read-model.ts"), "utf8");
const legacyContentPage = fs.readFileSync(path.join(root, "app/admin/content/page.tsx"), "utf8");
const legacyWorkspace = fs.readFileSync(path.join(root, "components/AdminPlatformContentWorkspace.tsx"), "utf8");
const contract = fs.readFileSync(path.join(root, "docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md"), "utf8");
const intelligenceUi = fs.readFileSync(path.join(root, "components/AdminIntelligenceWorkspace.tsx"), "utf8");
const intelligenceRoute = fs.readFileSync(path.join(root, "app/api/admin/content/intelligence/route.ts"), "utf8");
const momentum = fs.readFileSync(path.join(root, "lib/server/content/topic-momentum.ts"), "utf8");

assert(!source.includes("Rising") && !source.includes("risingScore") && !source.includes("risingSignalSourceCount"), "RISING_READ_MODEL_PHYSICALLY_RETIRED");
assert(!source.includes("calculateTrendRisingScore"), "RISING_RUNTIME_CALCULATION_REMOVED");
assert(!source.includes("listRisingEventCandidatesShadow"), "RISING_SHADOW_QUERY_REMOVED");
assert(!intelligenceRoute.includes('view === "rising"'), "RISING_FORMAL_API_RETIRED");
assert(!intelligenceRoute.includes('view === "hotspot"'), "LEGACY_HOTSPOT_API_RETIRED");
assert(!source.includes("listAiHotspotCandidates"), "LEGACY_HOTSPOT_READ_MODEL_RETIRED");
assert(!intelligenceUi.includes('key: "RISING"') && !intelligenceUi.includes("上升趋势"), "RISING_OPERATIONAL_UI_RETIRED");
assert(source.includes("calculateTopicMomentum") && source.includes("topicMomentum.eligible"), "CURRENT_HOT_TOPIC_MOMENTUM");
assert(momentum.includes("TOPIC_MOMENTUM_MIN_AGE_HOURS = 24") && momentum.includes("TOPIC_MOMENTUM_MAX_AGE_HOURS = 168") && momentum.includes('"RISING"') && momentum.includes('"SUSTAINED"'), "TOPIC_MOMENTUM_RISING_AND_SUSTAINED_WINDOW");
assert(momentum.includes('authority: "PRESENTATION_ONLY"'), "TOPIC_MOMENTUM_NO_FACT_AUTHORITY");

assert(source.includes("listAiHotspotPractices"), "TODAY_AI_HOTSPOT_PRACTICE_VIEW_PRESENT");
assert(source.includes("listCurrentHotTodayIntelligence"), "HOT_RANK_VIEW_PRESENT");
assert(source.includes("listRadarTimeline"), "ALL_DYNAMICS_EVENT_VIEW_PRESENT");
assert(source.includes("officialNewsEligible") && source.includes("hotspotEligible"), "EVENT_POLICY_ELIGIBILITY_BOUNDARY");
assert(source.includes("INTELLIGENCE_POLICY_VERSION"), "FORMAL_EVENT_FEED_POLICY_VERSION_REQUIRED");
assert(source.includes("selectCanonicalEventGroups") && source.includes("memberEventIdsByPrimary") && source.includes("projectEventPolicy"), "FORMAL_EVENT_FEED_CANONICAL_CLUSTER_REQUIRED");
assert(source.includes("isSystemIntelligenceObservationMetadata"), "INTELLIGENCE_SYSTEM_ORIGIN_FILTER_PRESENT");
assert(source.includes("hasSystemCollectionHistory"), "EVENT_FEED_REQUIRES_SYSTEM_COLLECTION_HISTORY");

assert(source.includes('collectionMethod, "TREND"'), "PLATFORM_TREND_DISCOVERY_BOUNDARY_PRESENT");
assert(source.includes("a.trendRank ?? Number.POSITIVE_INFINITY"), "PLATFORM_TREND_DISCOVERY_RANK_SORT");
assert(!source.includes("b.hotValue - a.hotValue"), "NO_CROSS_PLATFORM_RAW_HOT_SORT");

assert(legacyContentPage.includes('redirect("/admin/intelligence")'), "LEGACY_INTELLIGENCE_ROUTE_REDIRECTED");
assert(!legacyWorkspace.includes('{ key: "INTELLIGENCE", label: "今日情报"'), "NO_DUPLICATE_LEGACY_INTELLIGENCE_TAB");
assert(contract.includes("Unified Collection — SYSTEM Runtime"), "UNIFIED_COLLECTION_CONTRACT");
assert(contract.includes("Topic Momentum current rule"), "TOPIC_MOMENTUM_CONTRACT");

for (const label of ["当前热点", "AI热点练习", "精选", "全部动态"]) {
  assert(intelligenceUi.includes(label), "HOT_TRACKING_CURRENT_VIEW_" + label);
}
assert(!intelligenceUi.includes("最新资讯") && !intelligenceUi.includes("值得实践"), "LEGACY_INTELLIGENCE_VIEWS_NOT_OPERATIONAL_UI");
assert(intelligenceRoute.includes('view === "ai-hotspot-practice"'), "AI_HOTSPOT_PRACTICE_API");
assert(!intelligenceRoute.includes('view === "worth-watching"') && !source.includes("listTodayWorthWatchingHotTracking"), "WORTH_WATCHING_PARALLEL_PATH_REMOVED");
assert(intelligenceRoute.includes('view === "current-hot"'), "HOT_RANK_API");
assert(!intelligenceRoute.includes('view === "platform"'), "PLATFORM_HEATBOARD_NOT_FORMAL_INTELLIGENCE_API");

console.log("INTELLIGENCE_READ_MODEL_CONTRACT=PASS");

