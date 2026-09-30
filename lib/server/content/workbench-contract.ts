export const CONTENT_REVIEW_DECISIONS = ["APPROVED", "NEEDS_CHANGES", "REJECTED"] as const;
export type ContentReviewDecision = (typeof CONTENT_REVIEW_DECISIONS)[number];

export const EVIDENCE_VERIFICATION_STATUSES = ["UNVERIFIED", "VERIFIED", "REJECTED"] as const;
export type EvidenceVerificationStatus = (typeof EVIDENCE_VERIFICATION_STATUSES)[number];

export const CONTENT_SOURCE_STATUSES = ["ACTIVE", "PAUSED", "ARCHIVED"] as const;
export type ContentSourceStatus = (typeof CONTENT_SOURCE_STATUSES)[number];

export function nextContentStatusForReview(decision: ContentReviewDecision) {
  if (decision === "APPROVED") return "REVIEW" as const;
  if (decision === "NEEDS_CHANGES") return "DRAFT" as const;
  return "ARCHIVED" as const;
}

export function assertPublishableContent(input: {
  status: string;
  evidenceCount: number;
  verifiedEvidenceCount: number;
  latestReviewDecision: string | null;
  latestReviewVersion: number | null;
  version: number;
}) {
  if (input.status !== "REVIEW") throw new Error("CONTENT_NOT_REVIEW_READY");
  if (input.evidenceCount < 1) throw new Error("CONTENT_EVIDENCE_REQUIRED");
  if (input.verifiedEvidenceCount < 1) throw new Error("CONTENT_VERIFIED_EVIDENCE_REQUIRED");
  if (input.latestReviewDecision !== "APPROVED") throw new Error("CONTENT_APPROVAL_REQUIRED");
  if (input.latestReviewVersion !== input.version) throw new Error("CONTENT_REVIEW_STALE");
}
