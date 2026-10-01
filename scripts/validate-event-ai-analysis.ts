import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_AI_ANALYSIS_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const adapter = read("lib/server/ai/configured-chat.ts");
const analysis = read("lib/server/content/event-ai-analysis.ts");
const route = read("app/api/admin/content/discovery/events/[eventId]/analysis/route.ts");
const workspace = read("components/AdminPlatformContentWorkspace.tsx");

assert(schema.includes("contentEventClusterAnalyses"), "CLUSTER_ANALYSIS_TABLE_MISSING");
for (const field of [
  "aiRunId",
  "analysisVersion",
  "opcRelevanceScore",
  "coreFacts",
  "disagreementsOrUncertainties",
  "whyItMatters",
  "recommendedAngles",
  "suggestedContentTypes",
  "humanReviewFlags",
  "updatedAt"
]) {
  assert(schema.includes(field), "CLUSTER_ANALYSIS_FIELD_MISSING:" + field);
}
for (const field of ["status", "errorCode", "errorMessage", "completedAt"]) {
  assert(schema.includes(field), "AI_RUN_FIELD_MISSING:" + field);
}
assert(adapter.includes("OPC_AI_ANALYSIS_BASE_URL"), "SHARED_AI_BASE_URL_MISSING");
assert(adapter.includes("OPC_AI_ANALYSIS_API_KEY"), "SHARED_AI_API_KEY_MISSING");
assert(adapter.includes("OPC_AI_ANALYSIS_MODEL"), "SHARED_AI_MODEL_MISSING");
assert(adapter.includes("callConfiguredChatJson"), "SHARED_AI_CALL_MISSING");
for (const name of [
  "EVENT_AI_ANALYSIS_VERSION",
  "EVENT_AI_PROMPT_VERSION",
  "EVENT_AI_SKILL_VERSION",
  "validateEventAiAnalysis",
  "runEventAiAnalysis",
  "getCurrentEventAiAnalysis"
]) {
  assert(analysis.includes(name), "ANALYSIS_FUNCTION_MISSING:" + name);
}
assert(analysis.includes("aiRuns"), "AI_RUN_AUDIT_NOT_USED");
assert(analysis.includes("getEventClusterResearchPack"), "RESEARCH_PACK_INPUT_MISSING");
assert(analysis.includes("contentEventClusterSignals"), "SIGNAL_INPUT_MISSING");
assert(analysis.includes("inputHash"), "INPUT_HASH_MISSING");
assert(route.includes("export async function GET"), "ANALYSIS_GET_MISSING");
assert(route.includes("export async function POST"), "ANALYSIS_POST_MISSING");
assert(route.includes("runEventAiAnalysis"), "ANALYSIS_ROUTE_RUNNER_MISSING");
assert(!workspace.includes("运行 AI 分析"), "ANALYSIS_INTERNAL_ACTION_MUST_NOT_RETURN_TO_PRIMARY_UI");
assert(!workspace.includes("official-ai-assist"), "ANALYSIS_INTERNAL_PANEL_MUST_NOT_RETURN_TO_PRIMARY_UI");

for (const forbidden of ["recordCandidateDecision", "createAdminContentItem", "publishContent"]) {
  assert(!analysis.includes(forbidden), "ANALYSIS_BOUNDARY_VIOLATION:" + forbidden);
}

console.log("EVENT_AI_ANALYSIS_SCHEMA=PASS");
console.log("EVENT_AI_ANALYSIS_SHARED_ADAPTER=PASS");
console.log("EVENT_AI_ANALYSIS_VALIDATION=PASS");
console.log("EVENT_AI_ANALYSIS_AUDIT=PASS");
console.log("EVENT_AI_ANALYSIS_INTERNAL_UI_BOUNDARY=PASS");
console.log("EVENT_AI_ANALYSIS_BOUNDARY=PASS");
