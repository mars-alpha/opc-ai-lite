import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("CURRENT_COLLECTION_RUNTIME_FAILED:" + code);
  console.log(code + "=PASS");
}

const mustExist = [
  "lib/server/content/source-management.ts",
  "lib/server/content/source-onboarding.ts",
  "lib/server/content/source-acquisition-plan.ts",
  "lib/server/content/source-acquisition-runtime-adapters.ts",
  "lib/server/content/source-qualification.ts",
  "lib/server/content/source-qualification-runtime.ts",
  "lib/server/content/collection-runner.ts",
  "lib/server/content/source-portfolio-runtime.ts",
  "lib/server/content/discovery-filter.ts",
  "lib/server/content/raw-relevance-dedup.ts",
  "lib/server/content/collection-expansion.ts",
  "lib/server/content/creator-coverage-qualification.ts",
  "lib/server/content/topic-momentum.ts",
  "lib/server/content/presentation-enrichment.ts",
  "lib/server/content/source-runtime-utility.ts",
  "lib/server/content/source-runtime-governance.ts",
  "lib/server/content/source-runtime-governance-execution.ts",
  "lib/server/content/source-runtime-operations.ts",
  "lib/server/content/intelligence-read-model.ts",
  "scripts/run-server-native-automatic-cycle.ts"
];

for (const path of mustExist) assert(fs.existsSync(path), "CURRENT_OWNER_EXISTS:" + path);

const retired = [
  "app/admin/automatic-collection",
  "app/api/admin/content/automatic-collection",
  "app/api/admin/content/discovery/runtime",
  "lib/server/content/automatic-collection.ts",
  "lib/server/content/media-discovery.ts",
  "lib/server/content/research-discovery.ts",
  "lib/server/content/real-trend-runtime.ts",
  "lib/server/content/manual-event-candidate-gate.ts",
  "lib/server/content/trend-rising.ts",
  "scripts/run-content-ai-media-discovery.ts",
  "scripts/run-content-ai-research-discovery.ts",
  "scripts/run-content-ai-real-trend.ts",
  "scripts/run-content-ai-domestic-trend.ts",
  "scripts/run-content-ai-global-social.ts",
  "scripts/run-adapter-qualification-022b.ts",
  "scripts/validate-adapter-qualification-022b.ts",
  "scripts/validate-pollution-syndication-022c.ts",
  "scripts/backtest-ai-collection-policy.ts",
  "scripts/govern-server-native-auto-sources.ts",
  "scripts/accept-server-native-auto-baseline.ts",
  "scripts/probe-radar-source-portfolio.ts",
  "scripts/reset-radar-source-portfolio.ts",
  "scripts/run-topic-momentum-follow-up.ts",
  "deploy/systemd/opc-topic-momentum.service",
  "deploy/systemd/opc-topic-momentum.timer",
  "scripts/run-xiaohongshu-rsshub-automatic.ts"
];

for (const path of retired) assert(!fs.existsSync(path), "RETIRED_OWNER_ABSENT:" + path);

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as { scripts?: Record<string, string> };
const scripts = packageJson.scripts ?? {};
for (const key of [
  "content:real-trend:run",
  "content:domestic-trend:run",
  "content:global-social:run",
  "content:media-discovery:run",
  "content:research-discovery:run",
  "content:adapter-qualification:022b:run",
  "content:pollution-syndication:022c:check",
  "content:source-portfolio:reset",
  "content:source-portfolio:probe",
  "content:server-native-auto:govern",
  "content:server-native-auto:accept",
  "content:topic-momentum:follow-up",
  "content:topic-momentum:follow-up:production",
  "content:xiaohongshu-rsshub:auto:run"
]) {
  assert(!(key in scripts), "RETIRED_ENTRYPOINT_ABSENT:" + key);
}

const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const portfolio = fs.readFileSync("lib/server/content/source-portfolio-runtime.ts", "utf8");
const acquisitionAdapters = fs.readFileSync("lib/server/content/source-acquisition-runtime-adapters.ts", "utf8");
const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
const intelligence = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");
const manualPage = fs.readFileSync("app/admin/manual-collection/page.tsx", "utf8");
const manualApi = fs.readFileSync("app/api/admin/manual-collection/route.ts", "utf8");
const architecture = fs.readFileSync("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md", "utf8");
const mapping = fs.readFileSync("docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md", "utf8");

assert(runner.includes("filterCheapDiscoveryCandidates"), "CHEAP_RELEVANCE_PRESENT");
assert(runner.indexOf("filterCheapDiscoveryCandidates") < runner.indexOf("resolveKnownEntities"), "CHEAP_RELEVANCE_BEFORE_ENTITY");
assert(runner.includes("SOURCE_QUALIFICATION:"), "GENERIC_QUALIFICATION_NAMESPACE");
assert(portfolio.includes("runSourceCollection"), "PORTFOLIO_USES_UNIFIED_RUNNER");
assert(!portfolio.includes("collectFollowBuilders"), "PORTFOLIO_NO_FOLLOW_BUILDERS_SPECIAL_CASE");
assert(!portfolio.includes("collectAiHot"), "PORTFOLIO_NO_AI_HOT_SPECIAL_CASE");
assert(!portfolio.includes("collectorOverride"), "PORTFOLIO_NO_COLLECTOR_OVERRIDE");
assert(!acquisitionAdapters.includes("RADAR_FOLLOW_BUILDERS") && !acquisitionAdapters.includes("collectFollowBuilders"), "FOLLOW_BUILDERS_RUNTIME_ADAPTER_RETIRED");
assert(acquisitionAdapters.includes("RADAR_AI_HOT"), "AI_HOT_RUNTIME_ADAPTER_REGISTERED");
assert(runner.includes("collectSourceRuntimeAdapter"), "RUNNER_OWNS_RUNTIME_ADAPTER_DISPATCH");
assert(runner.includes("SYSTEM_COLLECTION_RUNTIME_ONLY"), "RUNNER_SYSTEM_ONLY");
assert(!runner.includes("manualUrl"), "RUNNER_NO_MANUAL_URL");
assert(!runner.includes("collectManualUrl"), "RUNNER_NO_MANUAL_COLLECTOR");
assert(!runner.includes("manualResultOnly"), "RUNNER_NO_MANUAL_RESULT_BRANCH");
assert(!runner.includes('provenance.origin === "MANUAL"'), "RUNNER_NO_MANUAL_RUNTIME_BRANCH");
assert(!runner.includes("localizeCollectedItemsForChineseReview"), "PRESENTATION_LOCALIZATION_NOT_IN_COLLECTION_CRITICAL_PATH");
assert(runner.includes("runFreshScan({ sourceId: source.id, collectionRunId: run.id, items: policyItems, provenance })"), "RAW_OBSERVATION_PERSISTS_BEFORE_PRESENTATION");
assert(runner.includes("evaluateEventRelevance(eventId, { allowAi: false })"), "EVENT_AI_RELEVANCE_NOT_IN_COLLECTION_CRITICAL_PATH");
assert(runner.includes('method === "TREND"') && runner.includes("result.createdRawItemIds"), "NON_TREND_DUPLICATES_DO_NOT_REFRESH_EVENTS");
assert(cycle.includes("listDueSourceIdsForAutomaticCycle"), "FIXED_TICK_DUE_SELECTION");
assert(cycle.includes("runSystemSourcePortfolio"), "SYSTEM_PORTFOLIO_SINGLE_OWNER");
assert(cycle.includes("runTopicMomentumRuntime"), "TOPIC_MOMENTUM_SINGLE_CYCLE_OWNER");
assert(cycle.includes('runSection("TOPIC_MOMENTUM_FOLLOW_UP"'), "TOPIC_MOMENTUM_IN_FIXED_TICK");
assert(cycle.includes("listCurrentSystemCollectionSourceIds"), "SYSTEM_SOURCE_DISCOVERY_SINGLE_OWNER");
assert(!cycle.includes("OPERATOR_SOURCE_PORTFOLIO"), "NO_OPERATOR_PARALLEL_RUNTIME");
assert(!cycle.includes("runRadarSourcePortfolio"), "NO_LEGACY_RADAR_EXECUTOR");
assert(cycle.includes("NO_SOURCE_DUE"), "NO_DUE_SAFE_SKIP");
assert(!cycle.includes('runSection("MEDIA"') && !cycle.includes('runSection("RESEARCH"') && !cycle.includes('runSection("TREND"'), "NO_PARALLEL_RUNTIME_SECTIONS");

assert(!intelligence.includes("calculateTrendRisingScore"), "NO_RISING_SCORE_RUNTIME");
assert(!intelligence.includes("listRisingTodayIntelligence"), "NO_RISING_COMPAT_READ_MODEL");
assert(!intelligence.includes("risingSignalSourceCount"), "NO_RISING_SIGNAL_FIELD");

assert(manualPage.includes('redirect("/admin/sources")'), "MANUAL_PAGE_REDIRECT_ONLY");
assert(manualApi.includes("MANUAL_COLLECTION_PRODUCT_RETIRED"), "MANUAL_API_TOMBSTONE");
assert(!manualApi.includes("createManualCollectionTask"), "MANUAL_API_NO_CREATE");

assert(architecture.includes("Unified Collection — SYSTEM Runtime"), "ARCHITECTURE_SINGLE_SYSTEM_RUNTIME");
assert(architecture.includes("Current Owner Map"), "ARCHITECTURE_OWNER_MAP");
assert(
  !mapping.includes("Retired Physical Owners") && mapping.includes("历史 Phase 与已删除文件由 Git 追溯"),
  "MAPPING_HISTORY_ONLY_IN_GIT"
);
assert(
  !architecture.includes("COLLECTION-ADAPTER-QUALIFICATION-022-B 当前事实") &&
  !architecture.includes("COLLECTION-POLLUTION-SYNDICATION-022-C 当前事实") &&
  !architecture.includes("MANUAL-EVENT-CANDIDATE-GATE-023 当前事实"),
  "ARCHITECTURE_NO_HISTORICAL_PHASE_OWNERS"
);

console.log("CURRENT_COLLECTION_RUNTIME=PASS");
