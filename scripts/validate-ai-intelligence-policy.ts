import fs from "node:fs";
import {
  CORE_ENTITY_SEEDS,
  EVENT_POLICIES,
  HOTSPOT_POLICY,
  INITIAL_SOURCE_POLICIES,
  LABELING_GUIDE_SNAPSHOT,
  OFFICIAL_NEWS_POLICY,
  assertIntelligencePolicy
} from "../lib/content/intelligence-policy";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("AI_INTELLIGENCE_POLICY_FAILED:" + code);
}

assert(assertIntelligencePolicy(), "POLICY_VALIDATION");
assert(INITIAL_SOURCE_POLICIES.filter((item) => item.sourceType === "OFFICIAL").length >= 10, "OFFICIAL_SOURCE_COUNT");
assert(INITIAL_SOURCE_POLICIES.filter((item) => item.sourceType === "MEDIA").length >= 5, "MEDIA_SOURCE_COUNT");
assert(INITIAL_SOURCE_POLICIES.filter((item) => item.sourceType === "SOCIAL" || item.sourceType === "DEVELOPER").length >= 5, "SIGNAL_SOURCE_COUNT");
assert(CORE_ENTITY_SEEDS.length >= 15, "ENTITY_SEED_COUNT");
assert(Object.keys(EVENT_POLICIES).length === 8, "EVENT_POLICY_COUNT");
assert(OFFICIAL_NEWS_POLICY.version === "official-news-policy-v1", "OFFICIAL_NEWS_POLICY");
assert(HOTSPOT_POLICY.minimumIndependentSignalSources === 2, "HOTSPOT_SIGNAL_MINIMUM");
assert(LABELING_GUIDE_SNAPSHOT.ignoreReasons.includes("NOT_AI_RELATED"), "LABELING_GUIDE_IGNORE_REASON");

for (const source of INITIAL_SOURCE_POLICIES) {
  for (const rule of source.contentTypeRules) {
    if (rule.role === "SIGNAL") {
      assert(rule.confirmationScope === "NONE", "SIGNAL_SCOPE:" + source.key);
      assert(rule.confirmationAuthority === "SIGNAL_ONLY", "SIGNAL_AUTHORITY:" + source.key);
      assert(rule.requiresFactConfirmation === true, "SIGNAL_FACT_CONFIRMATION:" + source.key);
    }
  }
}

const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const discovery = fs.readFileSync("lib/server/content/discovery.ts", "utf8");
const schema = fs.readFileSync("lib/server/db/schema.ts", "utf8");
const workspace = fs.readFileSync("components/AdminPlatformContentWorkspace.tsx", "utf8");
const onboarding = fs.readFileSync("lib/server/content/source-onboarding.ts", "utf8");
const portfolio = fs.readFileSync("lib/server/content/source-portfolio-runtime.ts", "utf8");
const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
const rawRoute = fs.readFileSync("app/api/admin/content/discovery/raw-items/route.ts", "utf8");

assert(runner.includes("sourceFreshnessHours"), "RUNNER_POLICY_FRESHNESS");
assert(runner.includes("sourceContentRule"), "RUNNER_SOURCE_CONTENT_RULE");
assert(runner.includes("resolveEntitiesForContent"), "RUNNER_ENTITY_RESOLUTION");
assert(runner.includes("evaluateEventPolicy"), "RUNNER_EVENT_POLICY");
assert(runner.includes("evaluateEventRelevance"), "RUNNER_EVENT_RELEVANCE");
assert(!runner.includes("cluster-discovery-gate"), "LEGACY_CLUSTER_GATE_RUNNER_PRESENT");
assert(fs.existsSync("lib/server/content/event-relevance-gate.ts"), "EVENT_RELEVANCE_GATE_MISSING");
assert(runner.includes("SYSTEM_COLLECTION_RUNTIME_ONLY"), "SYSTEM_ONLY_COLLECTION_RUNTIME");
assert(!runner.includes('provenance.origin === "MANUAL"'), "NO_MANUAL_COLLECTION_BRANCH");
assert(!runner.includes("manualResultOnly"), "NO_MANUAL_RESULT_BRANCH");
assert(!runner.includes("contentCollectionStrategies"), "RUNNER_LEGACY_STRATEGY_PRESENT");
assert(!discovery.includes("contentCollectionStrategies"), "DISCOVERY_LEGACY_STRATEGY_PRESENT");
assert(!schema.includes("content_media_candidates"), "LEGACY_MEDIA_CANDIDATE_TABLE_PRESENT");
assert(!schema.includes("content_intelligence_events"), "LEGACY_INTELLIGENCE_EVENT_TABLE_PRESENT");
assert(!schema.includes("content_collection_strategies"), "LEGACY_STRATEGY_TABLE_PRESENT");
assert(!workspace.includes("采集策略"), "LEGACY_STRATEGY_UI_PRESENT");
assert(!fs.existsSync("lib/server/content/source-watchlist.ts"), "LEGACY_WATCHLIST_CORE_PRESENT");
assert(!fs.existsSync("app/api/admin/content/source-watchlist/route.ts"), "LEGACY_WATCHLIST_API_PRESENT");
assert(onboarding.includes('origin: "SYSTEM"'), "SOURCE_ONBOARDING_SYSTEM_PROVENANCE");
assert(portfolio.includes("runSystemSourcePortfolio"), "SYSTEM_SOURCE_PORTFOLIO_OWNER");
assert(portfolio.includes("SOURCE_MANAGEMENT"), "SOURCE_MANAGEMENT_SOURCES_IN_SYSTEM_PORTFOLIO");
assert(!onboarding.includes("runOperatorSourcePortfolio"), "NO_OPERATOR_PARALLEL_EXECUTOR");
assert(!cycle.includes("OPERATOR_SOURCE_PORTFOLIO"), "NO_OPERATOR_PARALLEL_CYCLE_SECTION");
assert(rawRoute.includes("RAW_ITEM_DIRECT_INGEST_RETIRED"), "RAW_DIRECT_WRITE_API_RETIRED");
assert(!rawRoute.includes("ingestRawItem("), "RAW_API_NO_DIRECT_INGEST");
assert(!fs.existsSync("lib/server/content/xiaohongshu-browser-runner.ts"), "LOGIN_BROWSER_RUNNER_RETIRED");
assert(!fs.existsSync("lib/server/content/manual-collection.ts"), "MANUAL_COLLECTION_CORE_PRESENT");
assert(runner.includes('origin: "SYSTEM"') || runner.includes('origin: "SYSTEM",'), "SYSTEM_PROVENANCE_DEFAULT_MISSING");

console.log("AI_INTELLIGENCE_POLICY=PASS");
console.log("FACT_SIGNAL_POLICY=PASS");
console.log("UNIFIED_RAW_EVENT_PIPELINE=PASS");
console.log("LEGACY_COLLECTION_PATHS_REMOVED=PASS");
