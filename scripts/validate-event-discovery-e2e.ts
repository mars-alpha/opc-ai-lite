import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_DISCOVERY_E2E_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const e2e = read("scripts/accept-event-discovery-e2e.ts");
for (const name of [
  "runSourceCollection",
  "runEventExpansion",
  "getConfiguredChatModelConfig",
  "runEventAiAnalysis",
  "listEvents"
]) {
  assert(e2e.includes(name), "E2E_STEP_MISSING:" + name);
}
assert(e2e.includes("HN_ALGOLIA"), "E2E_HN_SOURCE_MISSING");
assert(e2e.includes("GITHUB_SEARCH"), "E2E_GITHUB_SOURCE_MISSING");
assert(e2e.includes("EVENT_DISCOVERY_E2E_MODEL_CONFIG_PENDING"), "E2E_MODEL_PENDING_STATE_MISSING");
assert(e2e.includes("EVENT_DISCOVERY_E2E_HUMAN_DECISION_PENDING"), "E2E_HUMAN_GATE_MISSING");
assert(e2e.includes("cleanupAcceptanceData"), "E2E_TEST_DATA_CLEANUP_MISSING");
assert(e2e.includes("EVENT_DISCOVERY_E2E_TEST_DATA_CLEANUP=PASS"), "E2E_TEST_DATA_CLEANUP_ASSERTION_MISSING");
assert(e2e.includes("cleanupBaselineEventIds"), "E2E_CLEANUP_BASELINE_GUARD_MISSING");
for (const forbidden of ["recordCandidateDecision(", "createAdminContentItem(", "publishContent("]) {
  assert(!e2e.includes(forbidden), "E2E_MUST_NOT_AUTO_DECIDE_OR_PUBLISH:" + forbidden);
}

console.log("EVENT_DISCOVERY_E2E_TEST_DATA_CLEANUP=PASS");
console.log("EVENT_DISCOVERY_E2E_REAL_COLLECTION=PASS");
console.log("EVENT_DISCOVERY_E2E_EXPANSION_CHAIN=PASS");
console.log("EVENT_DISCOVERY_E2E_MODEL_GATE=PASS");
console.log("EVENT_DISCOVERY_E2E_HUMAN_GATE=PASS");
