import "server-only";

import type { SourceRuntimeQualification } from "./source-qualification";
import type {
  SourceRuntimeUtilityDecision,
  SourceRuntimeUtilityFacts,
  SourceRuntimeUtilityRecommendation
} from "./source-runtime-utility";
import { auditSourceRuntimeUtility } from "./source-runtime-utility";
import { listSourceQualificationSnapshots } from "./source-qualification";

export const SOURCE_RUNTIME_GOVERNANCE_VERSION = "source-runtime-governance-v1";

export const SOURCE_RUNTIME_GOVERNANCE_PLANS = [
  "KEEP_CADENCE",
  "REDUCE_CADENCE",
  "PAUSE_AUTO_REVIEW",
  "DISABLE_REVIEW_REQUIRED"
] as const;

export type SourceRuntimeGovernancePlan =
  (typeof SOURCE_RUNTIME_GOVERNANCE_PLANS)[number];

export type SourceRuntimeHealth =
  | "HEALTHY"
  | "DEGRADED"
  | "FAILED"
  | "UNKNOWN";

export type SourceRuntimeGovernanceDecision = {
  version: typeof SOURCE_RUNTIME_GOVERNANCE_VERSION;
  plan: SourceRuntimeGovernancePlan;
  recommendedIntervalMultiplier: 1 | 2 | 4 | null;
  humanReviewRequired: boolean;
  automaticMutationAllowed: false;
  qualification: SourceRuntimeQualification;
  runtimeHealth: SourceRuntimeHealth;
  utilityRecommendation: SourceRuntimeUtilityRecommendation;
  coverageCritical: boolean;
  coverageRiskReasons: string[];
  reasons: string[];
};

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

export function inferSourceRuntimeHealth(
  facts: SourceRuntimeUtilityFacts
): SourceRuntimeHealth {
  if (facts.runCount === 0) return "UNKNOWN";
  const failureRate = ratio(facts.failedRunCount, facts.runCount);
  if (facts.failedRunCount >= 3 && failureRate >= 0.5) return "FAILED";
  if (facts.failedRunCount > 0 || facts.fallbackRate >= 0.5) return "DEGRADED";
  return "HEALTHY";
}

function qualificationFloor(
  qualification: SourceRuntimeQualification
): SourceRuntimeGovernancePlan | null {
  if (qualification === "DISABLED") return "DISABLE_REVIEW_REQUIRED";
  if (qualification === "MANUAL_ONLY") return "PAUSE_AUTO_REVIEW";
  if (qualification === "CONDITIONAL") return "PAUSE_AUTO_REVIEW";
  return null;
}

function utilityPlan(
  recommendation: SourceRuntimeUtilityRecommendation,
  facts: SourceRuntimeUtilityFacts
): {
  plan: SourceRuntimeGovernancePlan;
  multiplier: 1 | 2 | 4 | null;
  reason: string;
} {
  if (facts.runCount < 4) {
    return {
      plan: "KEEP_CADENCE",
      multiplier: 1,
      reason: "INSUFFICIENT_HISTORY_KEEP_CURRENT_CADENCE"
    };
  }
  if (recommendation === "AUTO_KEEP") {
    return {
      plan: "KEEP_CADENCE",
      multiplier: 1,
      reason: "UTILITY_AUTO_KEEP"
    };
  }
  if (recommendation === "REDUCE_FREQUENCY") {
    return {
      plan: "REDUCE_CADENCE",
      multiplier: 2,
      reason: "UTILITY_REDUCE_FREQUENCY"
    };
  }
  if (recommendation === "CONDITIONAL") {
    return {
      plan: "PAUSE_AUTO_REVIEW",
      multiplier: 4,
      reason: "UTILITY_CONDITIONAL"
    };
  }
  return {
    plan: "DISABLE_REVIEW_REQUIRED",
    multiplier: null,
    reason: "UTILITY_DISABLE_CANDIDATE"
  };
}

const GOVERNANCE_SEVERITY: Record<SourceRuntimeGovernancePlan, number> = {
  KEEP_CADENCE: 0,
  REDUCE_CADENCE: 1,
  PAUSE_AUTO_REVIEW: 2,
  DISABLE_REVIEW_REQUIRED: 3
};

function maxPlan(
  left: SourceRuntimeGovernancePlan,
  right: SourceRuntimeGovernancePlan
) {
  return GOVERNANCE_SEVERITY[left] >= GOVERNANCE_SEVERITY[right]
    ? left
    : right;
}

export function evaluateSourceRuntimeGovernance(input: {
  qualification: SourceRuntimeQualification;
  utility: SourceRuntimeUtilityDecision;
  facts: SourceRuntimeUtilityFacts;
  runtimeHealth?: SourceRuntimeHealth;
}): SourceRuntimeGovernanceDecision {
  const reasons: string[] = [];
  const runtimeHealth = input.runtimeHealth ?? inferSourceRuntimeHealth(input.facts);
  const utility = utilityPlan(input.utility.recommendation, input.facts);
  let plan = utility.plan;
  let multiplier = utility.multiplier;
  reasons.push(utility.reason);

  const floor = qualificationFloor(input.qualification);
  if (floor) {
    plan = maxPlan(plan, floor);
    reasons.push("QUALIFICATION_" + input.qualification);
  }

  if (runtimeHealth === "FAILED") {
    plan = maxPlan(plan, "PAUSE_AUTO_REVIEW");
    multiplier = plan === "DISABLE_REVIEW_REQUIRED" ? null : 4;
    reasons.push("RUNTIME_HEALTH_FAILED");
  } else if (runtimeHealth === "DEGRADED") {
    plan = maxPlan(plan, "REDUCE_CADENCE");
    if (plan === "REDUCE_CADENCE") multiplier = Math.max(multiplier ?? 1, 2) as 2 | 4;
    if (plan === "PAUSE_AUTO_REVIEW") multiplier = 4;
    reasons.push("RUNTIME_HEALTH_DEGRADED");
  }

  if (input.facts.fallbackRate >= 0.5 && input.facts.runCount >= 6) {
    plan = maxPlan(plan, "PAUSE_AUTO_REVIEW");
    if (plan === "PAUSE_AUTO_REVIEW") multiplier = 4;
    reasons.push("HIGH_FALLBACK_DEPENDENCY");
  }

  if (input.utility.coverageCritical && plan === "DISABLE_REVIEW_REQUIRED") {
    plan = "PAUSE_AUTO_REVIEW";
    multiplier = 4;
    reasons.push("COVERAGE_CRITICAL_DISABLE_BLOCKED");
  }

  if (input.facts.runCount < 4 && input.qualification === "AUTO_READY") {
    plan = "KEEP_CADENCE";
    multiplier = 1;
    reasons.push("HISTORY_PROTECTION");
  }

  if (plan === "DISABLE_REVIEW_REQUIRED") multiplier = null;
  if (plan === "KEEP_CADENCE") multiplier = 1;
  if (plan === "REDUCE_CADENCE" && multiplier === null) multiplier = 2;
  if (plan === "PAUSE_AUTO_REVIEW" && multiplier === null) multiplier = 4;

  return {
    version: SOURCE_RUNTIME_GOVERNANCE_VERSION,
    plan,
    recommendedIntervalMultiplier: multiplier,
    humanReviewRequired:
      plan === "PAUSE_AUTO_REVIEW" ||
      plan === "DISABLE_REVIEW_REQUIRED",
    automaticMutationAllowed: false,
    qualification: input.qualification,
    runtimeHealth,
    utilityRecommendation: input.utility.recommendation,
    coverageCritical: input.utility.coverageCritical,
    coverageRiskReasons: input.utility.coverageRiskReasons,
    reasons: [...new Set(reasons)]
  };
}

export async function auditSourceRuntimeGovernance(options: {
  windowDays?: number;
  sourceIds?: string[];
  now?: Date;
} = {}) {
  const utilities = await auditSourceRuntimeUtility(options);
  if (!utilities.length) return [];

  const sourceIds = utilities.map((item) => item.source.id);
  const qualifications = await listSourceQualificationSnapshots(sourceIds);
  const qualificationBySource = new Map(
    qualifications.map((item) => [item.sourceId, item.qualification])
  );

  return utilities.map((item) => {
    const qualification =
      qualificationBySource.get(item.source.id) ?? "CONDITIONAL";
    const governance = evaluateSourceRuntimeGovernance({
      qualification,
      utility: item.decision,
      facts: item.facts
    });
    return {
      source: item.source,
      windowDays: item.windowDays,
      facts: item.facts,
      utility: item.decision,
      qualificationKnown: qualificationBySource.has(item.source.id),
      governance
    };
  });
}
