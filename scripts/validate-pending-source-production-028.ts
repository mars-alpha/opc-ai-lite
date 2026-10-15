import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("PENDING_SOURCE_PRODUCTION_028_VALIDATION_FAILED:" + code);
  console.log(code + "=PASS");
}

const management = fs.readFileSync("lib/server/content/source-management.ts", "utf8");
const acceptance = fs.readFileSync("scripts/accept-pending-source-production-028.ts", "utf8");
const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const automaticCycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
const qualificationRuntime = fs.readFileSync("lib/server/content/source-qualification-runtime.ts", "utf8");

assert(management.includes("recentProductionStatuses") && management.includes('latestProductionStatus === "FAILED"'), "FAST_INDEX_DISTINGUISHES_FAILED_FROM_NEVER_RUN");
assert(management.includes("productionRuns = sourceRuns.filter") && management.includes("qualificationOnly !== true"), "OVERVIEW_HEALTH_USES_PRODUCTION_RUNS_ONLY");
assert(management.includes("isRuntimeRelevantProductionRun") && management.includes("excludeFromRuntimeQualification"), "OVERVIEW_IGNORES_STALE_RECOVERY_FAILURES");
assert(management.includes('item.health === "RUNNING"') && management.includes("latestProductionRun"), "OVERVIEW_TREATS_RUNNING_AS_NON_ATTENTION_AND_DETAIL_USES_RELEVANT_PRODUCTION_RUN");
assert(management.includes('["FAILED","MISSING","DISABLED"].includes(item.health)'), "FAST_INDEX_ATTENTION_INCLUDES_FAILED");
assert(runner.includes("STALE_COLLECTION_RUN_MINUTES = 15") && runner.includes("COLLECTION_STALE_RUN_RECOVERED"), "STALE_COLLECTION_RUN_RECOVERY_BOUNDED");
assert(automaticCycle.includes('runSection("STALE_COLLECTION_RUN_RECOVERY"') && automaticCycle.includes("recoverStaleCollectionRuns"), "AUTOMATIC_CYCLE_RECOVERS_STALE_RUNS_FIRST");
assert(qualificationRuntime.includes("excludeFromRuntimeQualification") && qualificationRuntime.includes("staleRunRecovery"), "STALE_RECOVERY_DOES_NOT_PENALIZE_SOURCE_QUALIFICATION");
assert(acceptance.includes('item.health === "READY"'), "ACCEPTANCE_TARGETS_UI_READY_SOURCES");
assert(acceptance.includes("runSystemSourcePortfolio") && acceptance.includes("sourceIds: pendingIds"), "ACCEPTANCE_USES_UNIFIED_PRODUCTION_RUNTIME");
assert(!acceptance.includes("qualificationOnly: true"), "ACCEPTANCE_IS_PRODUCTION_NOT_QUALIFICATION_ONLY");
assert(acceptance.includes("reconcileSourceRuntimeQualifications"), "ACCEPTANCE_RECONCILES_QUALIFICATION");
assert(acceptance.includes("NO_ATTEMPTED_SOURCE_STILL_READY"), "ACCEPTANCE_REQUIRES_READY_EXIT");
assert(acceptance.includes("ALL_ATTEMPTS_CLASSIFIED"), "ACCEPTANCE_CLASSIFIES_SUCCESS_OR_FAILURE");

console.log("PENDING_SOURCE_PRODUCTION_028_VALIDATION=PASS");
