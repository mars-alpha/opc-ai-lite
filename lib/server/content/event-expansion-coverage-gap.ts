import "server-only";

export const EVENT_EXPANSION_COVERAGE_GAP_CATEGORIES = [
  "COVERED",
  "NOT_CREATOR_SEARCH_ELIGIBLE",
  "PRECISION_FILTER_GAP",
  "SOURCE_RESULT_GAP",
  "RUN_FAILURE_GAP",
  "NOT_RUN"
] as const;

export type EventExpansionCoverageGapCategory =
  (typeof EVENT_EXPANSION_COVERAGE_GAP_CATEGORIES)[number];

export type CoverageGapRun = {
  status: string;
  receivedCount: number;
  provider: string;
};

export function classifyEventExpansionCoverageGap(input: {
  creatorSearchEligible: boolean;
  referenceCount: number;
  recentRuns: CoverageGapRun[];
}) {
  if (input.referenceCount > 0) {
    return {
      category: "COVERED" as const,
      reason: "high-confidence-reference-evidence-present",
      nextAction: "KEEP_CURRENT_RULES" as const
    };
  }

  if (!input.creatorSearchEligible) {
    return {
      category: "NOT_CREATOR_SEARCH_ELIGIBLE" as const,
      reason: "no-event-specific-creator-anchor",
      nextAction: "DO_NOT_FORCE_PRACTICAL_EXPANSION" as const
    };
  }

  if (input.recentRuns.length === 0) {
    return {
      category: "NOT_RUN" as const,
      reason: "creator-search-eligible-but-no-recent-run",
      nextAction: "RUN_CURRENT_HEALTHY_SOURCES_FIRST" as const
    };
  }

  const succeeded = input.recentRuns.filter((run) => run.status === "SUCCEEDED");
  const received = succeeded.reduce((sum, run) => sum + Math.max(0, run.receivedCount), 0);
  if (received > 0) {
    return {
      category: "PRECISION_FILTER_GAP" as const,
      reason: "candidates-received-but-no-high-confidence-evidence",
      nextAction: "REVIEW_QUERY_AND_MATCHER_BEFORE_NEW_SOURCE" as const
    };
  }

  if (succeeded.length > 0) {
    return {
      category: "SOURCE_RESULT_GAP" as const,
      reason: "healthy-search-ran-but-returned-zero-candidates",
      nextAction: "REVIEW_SOURCE_COVERAGE" as const
    };
  }

  return {
    category: "RUN_FAILURE_GAP" as const,
    reason: "creator-search-runs-failed",
    nextAction: "FIX_RUNTIME_OR_PROVIDER_HEALTH" as const
  };
}
