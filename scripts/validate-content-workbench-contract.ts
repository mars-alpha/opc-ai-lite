import fs from "node:fs";
import {
  assertPublishableContent,
  nextContentStatusForReview
} from "../lib/server/content/workbench-contract";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_WORKBENCH_CONTRACT_FAILED:" + code);
}

const schema = fs.readFileSync("lib/server/db/schema.ts", "utf8");
for (const name of [
  "contentSources",
  "contentEvidence",
  "contentItemEvidence",
  "contentReviews",
  "contentPublishRecords",
  "contentAuditRecords",
  "feishuDocumentMappings",
  "aiRuns"
]) {
  assert(schema.includes("export const " + name), "SCHEMA_OBJECT_MISSING:" + name);
}
assert(schema.includes('version: integer("version").notNull().default(1)'), "CONTENT_VERSION_MISSING");

assert(nextContentStatusForReview("APPROVED") === "REVIEW", "APPROVED_STATE");
assert(nextContentStatusForReview("NEEDS_CHANGES") === "DRAFT", "NEEDS_CHANGES_STATE");
assert(nextContentStatusForReview("REJECTED") === "ARCHIVED", "REJECTED_STATE");

assertPublishableContent({
  status: "REVIEW",
  evidenceCount: 1,
  verifiedEvidenceCount: 1,
  latestReviewDecision: "APPROVED",
  latestReviewVersion: 2,
  version: 2
});

for (const invalid of [
  { status: "DRAFT", evidenceCount: 1, verifiedEvidenceCount: 1, latestReviewDecision: "APPROVED", latestReviewVersion: 2, version: 2 },
  { status: "REVIEW", evidenceCount: 0, verifiedEvidenceCount: 0, latestReviewDecision: "APPROVED", latestReviewVersion: 2, version: 2 },
  { status: "REVIEW", evidenceCount: 1, verifiedEvidenceCount: 0, latestReviewDecision: "APPROVED", latestReviewVersion: 2, version: 2 },
  { status: "REVIEW", evidenceCount: 1, verifiedEvidenceCount: 1, latestReviewDecision: "NEEDS_CHANGES", latestReviewVersion: 2, version: 2 },
  { status: "REVIEW", evidenceCount: 1, verifiedEvidenceCount: 1, latestReviewDecision: "APPROVED", latestReviewVersion: 1, version: 2 }
]) {
  let failed = false;
  try {
    assertPublishableContent(invalid);
  } catch {
    failed = true;
  }
  assert(failed, "PUBLISH_GATE_MUST_FAIL");
}

console.log("CONTENT_WORKBENCH_SCHEMA_BOUNDARY=PASS");
console.log("CONTENT_WORKBENCH_REVIEW_STATE_MACHINE=PASS");
console.log("CONTENT_WORKBENCH_PUBLISH_GATE=PASS");
