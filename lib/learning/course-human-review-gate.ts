import type {
  CourseHumanReviewDecision,
  CourseHumanReviewResult
} from "./course-production-contract";

export function createCourseHumanReviewResult(
  decision: CourseHumanReviewDecision,
  reference: string | null,
  notes: string[] = []
): CourseHumanReviewResult {
  if (decision === "PASS" && !reference?.trim()) {
    throw new Error("HUMAN_REVIEW_PASS_REQUIRES_REFERENCE");
  }
  return {
    decision,
    reference: reference?.trim() || null,
    notes: notes.map((item) => item.trim()).filter(Boolean)
  };
}

export function humanReviewAllowsRuntime(
  result: CourseHumanReviewResult
) {
  return result.decision === "PASS";
}
