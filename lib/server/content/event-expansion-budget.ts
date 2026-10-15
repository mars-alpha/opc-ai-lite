import "server-only";

export const EVENT_EXPANSION_BUDGET_VERSION = "event-expansion-budget-v1";
export const DEFAULT_INITIAL_BUDGET = 6;
export const DEFAULT_MAX_BUDGET = 12;
export const MIN_BUDGET_BEFORE_EFFICIENCY_STOP = 3;
export const MIN_MARGINAL_UTILITY = 0.2;
export const HIGH_EFFICIENCY_THRESHOLD = 0.6;

export type ExpansionBudgetSample = {
  budgetUnits: number;
  independentEvidenceGained: number;
  demandSignalsGained?: number;
};

export function expansionUtility(sample: ExpansionBudgetSample) {
  const budget = Math.max(1, sample.budgetUnits);
  return (
    sample.independentEvidenceGained +
    (sample.demandSignalsGained ?? 0) * 0.5
  ) / budget;
}

export function evaluateAdaptiveExpansionBudget(input: {
  budgetUsed: number;
  budgetLimit: number;
  maxBudget?: number;
  recentSamples: ExpansionBudgetSample[];
  independentOriginCount: number;
  evidenceTypeCount: number;
  coverageThreshold?: {
    independentOrigins: number;
    evidenceTypes: number;
  };
}) {
  const maxBudget = Math.max(input.budgetLimit, input.maxBudget ?? DEFAULT_MAX_BUDGET);
  const coverage = input.coverageThreshold ?? { independentOrigins: 3, evidenceTypes: 3 };
  const coverageSatisfied =
    input.independentOriginCount >= coverage.independentOrigins &&
    input.evidenceTypeCount >= coverage.evidenceTypes;
  const recent = input.recentSamples.slice(-3);
  const marginalUtility = recent.length
    ? recent.reduce((sum, sample) => sum + expansionUtility(sample), 0) / recent.length
    : 1;

  if (coverageSatisfied) {
    return {
      version: EVENT_EXPANSION_BUDGET_VERSION,
      action: "STOP" as const,
      reason: "COVERAGE_SATISFIED" as const,
      budgetLimit: input.budgetLimit,
      marginalUtility
    };
  }
  if (
    input.budgetUsed >= MIN_BUDGET_BEFORE_EFFICIENCY_STOP &&
    recent.length >= 3 &&
    marginalUtility < MIN_MARGINAL_UTILITY
  ) {
    return {
      version: EVENT_EXPANSION_BUDGET_VERSION,
      action: "STOP" as const,
      reason: "MARGINAL_UTILITY_BELOW_THRESHOLD" as const,
      budgetLimit: input.budgetLimit,
      marginalUtility
    };
  }
  if (
    input.budgetUsed >= input.budgetLimit &&
    marginalUtility >= HIGH_EFFICIENCY_THRESHOLD &&
    input.budgetLimit < maxBudget
  ) {
    return {
      version: EVENT_EXPANSION_BUDGET_VERSION,
      action: "EXTEND" as const,
      reason: "HIGH_EFFICIENCY" as const,
      budgetLimit: Math.min(maxBudget, input.budgetLimit + 2),
      marginalUtility
    };
  }
  if (input.budgetUsed >= input.budgetLimit) {
    return {
      version: EVENT_EXPANSION_BUDGET_VERSION,
      action: "STOP" as const,
      reason: "BUDGET_EXHAUSTED" as const,
      budgetLimit: input.budgetLimit,
      marginalUtility
    };
  }
  return {
    version: EVENT_EXPANSION_BUDGET_VERSION,
    action: "CONTINUE" as const,
    reason: "WITHIN_BUDGET" as const,
    budgetLimit: input.budgetLimit,
    marginalUtility
  };
}

