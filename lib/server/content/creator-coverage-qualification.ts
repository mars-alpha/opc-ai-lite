export const CREATOR_COVERAGE_QUALIFICATION_VERSION = "creator-coverage-qualification-v1";

export type CreatorCoverageInput = {
  creatorCount: number;
  creatorItemCount: number;
  platformCount: number;
  activeDayCount: number;
  practicalTypeCount: number;
  engagedCreatorItemCount: number;
};

export function qualifyCreatorCoverage(input: CreatorCoverageInput) {
  const reasons: string[] = [];
  if (input.creatorCount < 1) reasons.push("NO_CREATOR_EVIDENCE");
  if (input.creatorCount < 2) reasons.push("INSUFFICIENT_CREATOR_DIVERSITY");
  if (input.activeDayCount < 2) reasons.push("INSUFFICIENT_MULTI_DAY_EVIDENCE");
  if (input.platformCount < 2 && input.practicalTypeCount < 2) {
    reasons.push("INSUFFICIENT_PLATFORM_OR_PRACTICAL_DIVERSITY");
  }
  const status =
    input.creatorCount >= 2 &&
    input.activeDayCount >= 2 &&
    (input.platformCount >= 2 || input.practicalTypeCount >= 2)
      ? "QUALIFIED" as const
      : input.creatorCount >= 1
        ? "CONDITIONAL" as const
        : "GAP" as const;
  return {
    version: CREATOR_COVERAGE_QUALIFICATION_VERSION,
    status,
    reasons,
    ...input
  };
}
