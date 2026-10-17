import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("DISCOVERY_EXPANSION_FAILED:" + code);
  console.log(code + "=PASS");
}

const model = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");
const expansion = fs.readFileSync("lib/server/content/collection-expansion.ts", "utf8");
const analysis = fs.readFileSync("lib/server/content/event-ai-analysis.ts", "utf8");
const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
const api = fs.readFileSync("app/api/admin/content/intelligence/route.ts", "utf8");
const expansionApi = fs.readFileSync("app/api/admin/content/discovery/events/[eventId]/expansion/route.ts", "utf8");

assert(model.includes("listDiscoveryExpansionCandidates"), "DISCOVERY_EXPANSION_DISCOVERY_CANDIDATE_OWNER");
assert(model.includes("CONFIRMED_EVENT_FOLLOW_UP"), "DISCOVERY_EXPANSION_CONFIRMED_EVENT_FOLLOW_UP");
assert(model.includes("UNVERIFIED_VERIFICATION_FOLLOW_UP"), "DISCOVERY_EXPANSION_UNVERIFIED_FOLLOW_UP");
assert(model.includes('"PRACTICAL_COVERAGE"') && model.includes('"CREATOR_MOMENTUM_COVERAGE"'), "DISCOVERY_EXPANSION_SECONDARY_DISCOVERY_GOALS");
assert(model.includes('formalVerificationPromotion: false') && model.includes('formalHotspotPromotion: false'), "DISCOVERY_EXPANSION_NO_AUTHORITY_PROMOTION");
assert(model.includes('topicMomentumAuthority: "PRESENTATION_ONLY"') && model.includes('opcValueAuthority: "CLUSTER_ANALYSIS_ONLY"'), "DISCOVERY_EXPANSION_SCORE_AUTHORITY_SEPARATION");
assert(model.includes("practicalEvidenceCount") && model.includes("shadowSignalMax"), "DISCOVERY_EXPANSION_COVERAGE_READ_MODEL");
assert(api.includes('view === "expansion-candidates"'), "DISCOVERY_EXPANSION_API_VIEW");
assert(expansion.includes("runDiscoveryExpansionCycle"), "DISCOVERY_EXPANSION_EXPANSION_RUNTIME_WIRING");
assert(expansion.includes("const DEFAULT_WINDOW_HOURS = 168"), "DISCOVERY_EXPANSION_EXPANSION_WINDOW_168H");
assert(expansion.includes("refreshEventExpansionEvidenceFromRecentRaw"), "DISCOVERY_EXPANSION_REUSES_SOURCE_MANAGED_RAW");
assert(expansion.includes("refreshSourceManagedEventExpansion") && expansion.includes("sourceManagedExpansionRuntime"), "DISCOVERY_EXPANSION_RUNTIME_STATE_PERSISTED");
assert(model.includes("sourceManagedExpansionRuntime") && model.includes("isSourceManagedRefreshDue") && model.includes("rankPracticeDiscoveryCandidates"), "DISCOVERY_EXPANSION_COOLDOWN_PREVENTS_STARVATION");
assert(!expansionApi.includes("export async function POST") && !expansionApi.includes("refreshSourceManagedEventExpansion"), "DISCOVERY_EXPANSION_API_READ_ONLY");
assert(cycle.includes("DISCOVERY_EXPANSION") && cycle.includes("runDiscoveryExpansionCycle"), "DISCOVERY_EXPANSION_IN_AUTOMATIC_CYCLE");
assert(analysis.includes("expansionEvidence") && analysis.includes("REFERENCE_ONLY"), "DISCOVERY_EXPANSION_AI_ANALYSIS_EXPANSION_CONTEXT");
assert(analysis.includes("getEventAiAnalysisRefreshDecision") && analysis.includes("ANALYSIS_INPUT_CHANGED"), "DISCOVERY_EXPANSION_AI_ANALYSIS_IDEMPOTENT_REFRESH");
assert(expansion.includes("hasPracticalEvidence") && expansion.includes('"HUMAN_TRIGGER_REQUIRED"'), "DISCOVERY_EXPANSION_AI_REQUIRES_HUMAN_TRIGGER");
assert(!expansion.includes("runEventAiAnalysis") && !expansion.includes("getConfiguredChatModelConfig"), "DISCOVERY_EXPANSION_NO_AUTOMATIC_MODEL_CALL");
assert(expansion.includes('sourceScope: "SOURCE_MANAGEMENT_SYSTEM_COLLECTION_ONLY"') && !expansion.includes('risingScoreMode: "SHADOW"'), "DISCOVERY_EXPANSION_SOURCE_MANAGEMENT_ONLY_NO_OLD_RISING");
assert(analysis.includes("repairAttempted") && analysis.includes("只修复 JSON 结构") && analysis.includes("temperature: 0"), "DISCOVERY_EXPANSION_AI_ANALYSIS_SINGLE_REPAIR_RETRY");
assert(!expansion.includes("formalHotspotPromotion: true"), "DISCOVERY_EXPANSION_NO_EXPANSION_HOTSPOT_AUTHORITY");
console.log("DISCOVERY_EXPANSION_CONTRACT=PASS");
