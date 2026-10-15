import fs from "node:fs";
import {
  MAX_SOURCE_INTERVAL_MINUTES,
  buildSourceGovernanceExecutionPlan,
  resolveSourceBaseIntervalMinutes
} from "../lib/server/content/source-runtime-governance-execution";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_RUNTIME_GOVERNANCE_EXECUTION_010_FAILED:" + code);
  console.log(code + "=PASS");
}

const now = new Date("2026-10-12T12:00:00.000Z");

const keepDue = buildSourceGovernanceExecutionPlan({
  sourceId: "keep",
  governancePlan: "KEEP_CADENCE",
  recommendedIntervalMultiplier: 1,
  qualificationKnown: true,
  coverageCritical: false,
  baseIntervalMinutes: 15,
  lastRunAt: "2026-10-12T11:40:00.000Z",
  now
});
assert(keepDue.action === "RUN_WHEN_DUE" && keepDue.due, "KEEP_DUE_RUNS");

const reduceNotDue = buildSourceGovernanceExecutionPlan({
  sourceId: "reduce-wait",
  governancePlan: "REDUCE_CADENCE",
  recommendedIntervalMultiplier: 2,
  qualificationKnown: true,
  coverageCritical: false,
  baseIntervalMinutes: 15,
  lastRunAt: "2026-10-12T11:40:00.000Z",
  now
});
assert(reduceNotDue.action === "WAIT_UNTIL_DUE" && !reduceNotDue.due, "REDUCE_NOT_DUE_WAITS");
assert(reduceNotDue.effectiveIntervalMinutes === 30, "REDUCE_MULTIPLIER_2");

const reduceDue = buildSourceGovernanceExecutionPlan({
  sourceId: "reduce-due",
  governancePlan: "REDUCE_CADENCE",
  recommendedIntervalMultiplier: 2,
  qualificationKnown: true,
  coverageCritical: false,
  baseIntervalMinutes: 15,
  lastRunAt: "2026-10-12T11:20:00.000Z",
  now
});
assert(reduceDue.action === "RUN_WHEN_DUE" && reduceDue.due, "REDUCE_DUE_RUNS");

const pause = buildSourceGovernanceExecutionPlan({
  sourceId: "pause",
  governancePlan: "PAUSE_AUTO_REVIEW",
  recommendedIntervalMultiplier: 4,
  qualificationKnown: true,
  coverageCritical: false,
  baseIntervalMinutes: 15,
  lastRunAt: "2026-10-12T11:59:00.000Z",
  now
});
assert(pause.action === "HUMAN_REVIEW_REQUIRED", "PAUSE_REQUIRES_HUMAN_REVIEW");
assert(pause.due === false && pause.effectiveIntervalMinutes === 15, "PAUSE_PRESERVES_BASE_CADENCE");

const disable = buildSourceGovernanceExecutionPlan({
  sourceId: "disable",
  governancePlan: "DISABLE_REVIEW_REQUIRED",
  recommendedIntervalMultiplier: null,
  qualificationKnown: true,
  coverageCritical: false,
  baseIntervalMinutes: 15,
  lastRunAt: "2026-10-12T11:40:00.000Z",
  now
});
assert(disable.action === "HUMAN_REVIEW_REQUIRED", "DISABLE_REQUIRES_HUMAN_REVIEW");
assert(disable.due === true, "DISABLE_PRESERVES_BASE_CADENCE_UNTIL_REVIEW");

const coverageCritical = buildSourceGovernanceExecutionPlan({
  sourceId: "coverage-critical",
  governancePlan: "PAUSE_AUTO_REVIEW",
  recommendedIntervalMultiplier: 4,
  qualificationKnown: true,
  coverageCritical: true,
  baseIntervalMinutes: 15,
  now
});
assert(coverageCritical.reason === "HUMAN_GATE_COVERAGE_PROTECTED", "COVERAGE_CRITICAL_HUMAN_GATE");

const missingQualification = buildSourceGovernanceExecutionPlan({
  sourceId: "unknown-qualification",
  governancePlan: "KEEP_CADENCE",
  recommendedIntervalMultiplier: 1,
  qualificationKnown: false,
  coverageCritical: false,
  now
});
assert(missingQualification.action === "BLOCKED_INVALID_INPUT", "MISSING_QUALIFICATION_FAIL_CLOSED");

const noHistory = buildSourceGovernanceExecutionPlan({
  sourceId: "no-history",
  governancePlan: "KEEP_CADENCE",
  recommendedIntervalMultiplier: 1,
  qualificationKnown: true,
  coverageCritical: false,
  now
});
assert(noHistory.action === "RUN_WHEN_DUE" && noHistory.due, "NO_HISTORY_DUE_NOW");

assert(
  resolveSourceBaseIntervalMinutes({ collectionConfig: {}, metadata: {} }) === 15,
  "BASE_INTERVAL_DEFAULT_15"
);
assert(
  resolveSourceBaseIntervalMinutes({
    collectionConfig: { automaticCollection: { intervalMinutes: 99999 } },
    metadata: {}
  }) === MAX_SOURCE_INTERVAL_MINUTES,
  "BASE_INTERVAL_MAX_BOUND"
);

const maxBound = buildSourceGovernanceExecutionPlan({
  sourceId: "max-bound",
  governancePlan: "REDUCE_CADENCE",
  recommendedIntervalMultiplier: 2,
  qualificationKnown: true,
  coverageCritical: false,
  baseIntervalMinutes: 1000,
  lastRunAt: "2026-10-12T11:00:00.000Z",
  now
});
assert(maxBound.effectiveIntervalMinutes === MAX_SOURCE_INTERVAL_MINUTES, "EFFECTIVE_INTERVAL_MAX_BOUND");

const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
assert(cycle.includes("listDueSourceIdsForAutomaticCycle"), "SYSTEM_CYCLE_USES_GOVERNANCE_DUE_SELECTION");
assert(cycle.includes("sourceIds: governanceExecution.sourceIds"), "SYSTEM_CYCLE_RUNS_ONLY_DUE_SOURCES");
assert(cycle.includes("NO_SOURCE_DUE"), "SYSTEM_CYCLE_EMPTY_DUE_SET_SKIPS_COLLECTION");
assert(cycle.includes("runSystemSourcePortfolio"), "SYSTEM_CYCLE_UNIFIED_PORTFOLIO_OWNER");
assert(cycle.includes("listCurrentSystemCollectionSourceIds"), "SYSTEM_CYCLE_DISCOVERS_ALL_CURRENT_SOURCES");
assert(!cycle.includes("OPERATOR_SOURCE_PORTFOLIO"), "SYSTEM_CYCLE_NO_PARALLEL_OPERATOR_RUN");
assert(!cycle.includes("runRadarSourcePortfolio"), "SYSTEM_CYCLE_NO_LEGACY_RADAR_EXECUTOR");

console.log("SOURCE_RUNTIME_GOVERNANCE_EXECUTION_010=PASS");
