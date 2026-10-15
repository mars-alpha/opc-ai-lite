import {
  evaluateSourceRuntimeGovernance,
  inferSourceRuntimeHealth
} from "../lib/server/content/source-runtime-governance";
import type {
  SourceRuntimeUtilityDecision,
  SourceRuntimeUtilityFacts
} from "../lib/server/content/source-runtime-utility";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_RUNTIME_GOVERNANCE_009_FAILED:" + code);
  console.log(code + "=PASS");
}

const baseFacts: SourceRuntimeUtilityFacts = {
  runCount: 10,
  succeededRunCount: 10,
  failedRunCount: 0,
  receivedCount: 100,
  keptCount: 30,
  keepRatio: 0.3,
  emptyRunCount: 0,
  emptyRunRatio: 0,
  duplicateCount: 10,
  duplicateRatio: 0.1,
  noiseDropCount: 20,
  noiseDropRatio: 0.2,
  fallbackAttemptCount: 0,
  fallbackRunCount: 0,
  fallbackRate: 0,
  independentEventContributionCount: 8,
  lastSuccessAt: "2026-10-12T12:00:00.000Z",
  lastNewItemAt: "2026-10-12T11:00:00.000Z",
  freshnessLagHours: 1
};

function utility(
  recommendation: SourceRuntimeUtilityDecision["recommendation"],
  coverageCritical = false
): SourceRuntimeUtilityDecision {
  return {
    version: "source-runtime-utility-v1",
    recommendation,
    reasons: [],
    coverageCritical,
    coverageRiskReasons: coverageCritical ? ["ROLE_MINIMUM:RESEARCH"] : []
  };
}

const healthyHighYield = evaluateSourceRuntimeGovernance({
  qualification: "AUTO_READY",
  utility: utility("AUTO_KEEP"),
  facts: baseFacts
});
assert(healthyHighYield.plan === "KEEP_CADENCE", "HEALTHY_HIGH_YIELD_KEEP");
assert(healthyHighYield.recommendedIntervalMultiplier === 1, "HEALTHY_HIGH_YIELD_MULTIPLIER_1");

const healthyLowYield = evaluateSourceRuntimeGovernance({
  qualification: "AUTO_READY",
  utility: utility("REDUCE_FREQUENCY"),
  facts: { ...baseFacts, keepRatio: 0.05, independentEventContributionCount: 2 }
});
assert(healthyLowYield.plan === "REDUCE_CADENCE", "HEALTHY_LOW_YIELD_REDUCE");
assert(healthyLowYield.recommendedIntervalMultiplier === 2, "HEALTHY_LOW_YIELD_MULTIPLIER_2");

const conditionalFallback = evaluateSourceRuntimeGovernance({
  qualification: "CONDITIONAL",
  utility: utility("CONDITIONAL"),
  facts: {
    ...baseFacts,
    fallbackAttemptCount: 8,
    fallbackRunCount: 7,
    fallbackRate: 0.7
  }
});
assert(conditionalFallback.plan === "PAUSE_AUTO_REVIEW", "CONDITIONAL_HIGH_FALLBACK_PAUSE_REVIEW");
assert(conditionalFallback.humanReviewRequired === true, "CONDITIONAL_HIGH_FALLBACK_HUMAN_GATE");

const coverageCriticalDisable = evaluateSourceRuntimeGovernance({
  qualification: "AUTO_READY",
  utility: utility("DISABLE_CANDIDATE", true),
  facts: {
    ...baseFacts,
    independentEventContributionCount: 0,
    lastNewItemAt: null,
    freshnessLagHours: null
  }
});
assert(coverageCriticalDisable.plan === "PAUSE_AUTO_REVIEW", "COVERAGE_CRITICAL_DISABLE_BLOCKED");
assert(coverageCriticalDisable.coverageCritical === true, "COVERAGE_CRITICAL_PRESERVED");

const manualOnly = evaluateSourceRuntimeGovernance({
  qualification: "MANUAL_ONLY",
  utility: utility("AUTO_KEEP"),
  facts: baseFacts
});
assert(manualOnly.plan === "PAUSE_AUTO_REVIEW", "MANUAL_ONLY_PAUSE_AUTO");
assert(manualOnly.automaticMutationAllowed === false, "MANUAL_ONLY_NO_AUTOMATIC_MUTATION");

const disabled = evaluateSourceRuntimeGovernance({
  qualification: "DISABLED",
  utility: utility("DISABLE_CANDIDATE"),
  facts: { ...baseFacts, independentEventContributionCount: 0, lastNewItemAt: null }
});
assert(disabled.plan === "DISABLE_REVIEW_REQUIRED", "DISABLED_REQUIRES_DISABLE_REVIEW");
assert(disabled.recommendedIntervalMultiplier === null, "DISABLED_HAS_NO_CADENCE");
assert(disabled.humanReviewRequired === true, "DISABLED_HUMAN_REVIEW_REQUIRED");

const insufficientHistory = evaluateSourceRuntimeGovernance({
  qualification: "AUTO_READY",
  utility: utility("AUTO_KEEP"),
  facts: {
    ...baseFacts,
    runCount: 3,
    succeededRunCount: 3,
    receivedCount: 10,
    keptCount: 1,
    keepRatio: 0.1
  }
});
assert(insufficientHistory.plan === "KEEP_CADENCE", "INSUFFICIENT_HISTORY_KEEP_CURRENT");
assert(insufficientHistory.reasons.includes("HISTORY_PROTECTION"), "INSUFFICIENT_HISTORY_PROTECTION_REASON");

assert(inferSourceRuntimeHealth(baseFacts) === "HEALTHY", "HEALTH_INFERENCE_HEALTHY");
assert(inferSourceRuntimeHealth({
  ...baseFacts,
  failedRunCount: 2,
  succeededRunCount: 8,
  fallbackRate: 0.6
}) === "DEGRADED", "HEALTH_INFERENCE_DEGRADED");
assert(inferSourceRuntimeHealth({
  ...baseFacts,
  failedRunCount: 6,
  succeededRunCount: 4
}) === "FAILED", "HEALTH_INFERENCE_FAILED");

console.log("SOURCE_RUNTIME_GOVERNANCE_009=PASS");
