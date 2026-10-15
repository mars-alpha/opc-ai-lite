import fs from "node:fs";

export const GROUND_TRUTH_SCHEMA_VERSION = "ai-collection-ground-truth-v1";
export const FIXED_BENCHMARK_VERSION = "ai-collection-benchmark-v2";
export const SUPPORTED_BENCHMARK_VERSIONS = ["ai-collection-benchmark-v1", FIXED_BENCHMARK_VERSION] as const;

export const GROUND_TRUTH_REVIEW_STATUSES = ["PROVISIONAL", "HUMAN_APPROVED"] as const;
export type GroundTruthReviewStatus = (typeof GROUND_TRUTH_REVIEW_STATUSES)[number];

export const GROUND_TRUTH_DISPOSITIONS = [
  "OFFICIAL_NEWS",
  "HOTSPOT",
  "UNVERIFIED",
  "IGNORE"
] as const;
export type GroundTruthDisposition = (typeof GROUND_TRUTH_DISPOSITIONS)[number];

export const GROUND_TRUTH_DISCOVERY_DECISIONS = ["KEEP_NOW", "REJECT_NOW", "REVIEW_REQUIRED"] as const;
export type GroundTruthDiscoveryDecision = (typeof GROUND_TRUTH_DISCOVERY_DECISIONS)[number];

export type GroundTruthDiscoveryCase = {
  caseId: string;
  collectionRunId: string;
  sourceId: string;
  sourceName: string;
  collectionMethod: string;
  actualDecision: "KEEP" | "REJECT";
  rejectionStage?: "DISCOVERY_FILTER" | "SOURCE_POLICY";
  rejectionReason?: string;
  relationType?: string;
  rawItemId?: string;
  externalId?: string | null;
  originalUrl?: string | null;
  titleSnapshot: string;
  excerptSnapshot?: string | null;
  publishedAt?: string | null;
  metadataSnapshot?: Record<string, unknown>;
  expectedDecision: GroundTruthDiscoveryDecision;
  reviewStatus: GroundTruthReviewStatus;
  reviewerId: string;
  reviewedAt: string;
  reason: string;
};

export type GroundTruthEventCase = {
  eventId: string;
  titleSnapshot: string;
  contentLabel: "AI_RELEVANT" | "NOT_AI_RELEVANT" | "LOW_VALUE" | "STALE" | "DUPLICATE";
  expectedDisposition: GroundTruthDisposition;
  expectedVerification?: "UNVERIFIED" | "CONFIRMED_MEDIA" | "CONFIRMED_OFFICIAL" | "ARCHIVED_UNVERIFIED";
  reviewStatus: GroundTruthReviewStatus;
  reviewerId: string;
  reviewedAt: string;
  reason: string;
};

export type GroundTruthClusterEventSnapshot = {
  eventId: string;
  titleSnapshot: string;
  sourceNames: string[];
  firstSeenAt: string;
};

export type GroundTruthClusterCoverageArea =
  | "MODEL_RELEASE"
  | "FINANCE"
  | "POLICY_SAFETY"
  | "OPEN_SOURCE"
  | "RESEARCH";

export type GroundTruthClusterCase = {
  caseId: string;
  eventIds: string[];
  eventSnapshots: GroundTruthClusterEventSnapshot[];
  coverageAreas: GroundTruthClusterCoverageArea[];
  expectedRelation: "SAME_EVENT" | "NEW_EVENT" | "RELATED_EVENT" | "NOT_EVENT";
  reviewStatus: GroundTruthReviewStatus;
  reviewerId: string;
  reviewedAt: string;
  reason: string;
};

export type GroundTruthBenchmark = {
  schemaVersion: string;
  benchmarkVersion: string;
  labelingGuideVersion: string;
  frozenAt: string;
  sourceDatabase: "opc_ai_dev";
  policyVersionAtFreeze: string;
  reviewStatus: GroundTruthReviewStatus;
  notes: string[];
  eventCases: GroundTruthEventCase[];
  discoveryCases: GroundTruthDiscoveryCase[];
  clusterCases: GroundTruthClusterCase[];
};

export function loadGroundTruthBenchmark(path: string): GroundTruthBenchmark {
  const parsed = JSON.parse(fs.readFileSync(path, "utf8")) as GroundTruthBenchmark;
  if (parsed.schemaVersion !== GROUND_TRUTH_SCHEMA_VERSION) throw new Error("GROUND_TRUTH_SCHEMA_VERSION_MISMATCH");
  if (!SUPPORTED_BENCHMARK_VERSIONS.includes(parsed.benchmarkVersion as (typeof SUPPORTED_BENCHMARK_VERSIONS)[number])) throw new Error("GROUND_TRUTH_BENCHMARK_VERSION_MISMATCH");
  if (!GROUND_TRUTH_REVIEW_STATUSES.includes(parsed.reviewStatus)) throw new Error("GROUND_TRUTH_REVIEW_STATUS_INVALID");
  if (!parsed.eventCases.length) throw new Error("GROUND_TRUTH_EVENT_CASES_REQUIRED");
  if (!Array.isArray(parsed.discoveryCases) || !parsed.discoveryCases.length) throw new Error("GROUND_TRUTH_DISCOVERY_CASES_REQUIRED");

  const eventIds = new Set<string>();
  for (const item of parsed.eventCases) {
    if (eventIds.has(item.eventId)) throw new Error("GROUND_TRUTH_DUPLICATE_EVENT:" + item.eventId);
    eventIds.add(item.eventId);
    if (!GROUND_TRUTH_DISPOSITIONS.includes(item.expectedDisposition)) throw new Error("GROUND_TRUTH_DISPOSITION_INVALID:" + item.eventId);
    if (!GROUND_TRUTH_REVIEW_STATUSES.includes(item.reviewStatus)) throw new Error("GROUND_TRUTH_CASE_REVIEW_STATUS_INVALID:" + item.eventId);
    if (!item.reason.trim() || !item.reviewerId.trim()) throw new Error("GROUND_TRUTH_AUDIT_METADATA_REQUIRED:" + item.eventId);
  }

  const discoveryCaseIds = new Set<string>();
  for (const item of parsed.discoveryCases) {
    if (discoveryCaseIds.has(item.caseId)) throw new Error("GROUND_TRUTH_DUPLICATE_DISCOVERY_CASE:" + item.caseId);
    discoveryCaseIds.add(item.caseId);
    if (!GROUND_TRUTH_DISCOVERY_DECISIONS.includes(item.expectedDecision)) throw new Error("GROUND_TRUTH_DISCOVERY_DECISION_INVALID:" + item.caseId);
    if (!GROUND_TRUTH_REVIEW_STATUSES.includes(item.reviewStatus)) throw new Error("GROUND_TRUTH_DISCOVERY_REVIEW_STATUS_INVALID:" + item.caseId);
    if (!item.reason.trim() || !item.reviewerId.trim()) throw new Error("GROUND_TRUTH_DISCOVERY_AUDIT_METADATA_REQUIRED:" + item.caseId);
    if (item.actualDecision === "REJECT" && (!item.rejectionStage || !item.rejectionReason)) {
      throw new Error("GROUND_TRUTH_REJECT_PROVENANCE_REQUIRED:" + item.caseId);
    }
  }

  const clusterCaseIds = new Set<string>();
  for (const item of parsed.clusterCases) {
    if (clusterCaseIds.has(item.caseId)) throw new Error("GROUND_TRUTH_DUPLICATE_CLUSTER_CASE:" + item.caseId);
    clusterCaseIds.add(item.caseId);
    if (item.eventIds.length < 2) throw new Error("GROUND_TRUTH_CLUSTER_CASE_REQUIRES_PAIR:" + item.caseId);
    if (!Array.isArray(item.coverageAreas) || !item.coverageAreas.length) throw new Error("GROUND_TRUTH_CLUSTER_COVERAGE_AREA_REQUIRED:" + item.caseId);
    if (!item.reason.trim() || !item.reviewerId.trim()) throw new Error("GROUND_TRUTH_CLUSTER_AUDIT_METADATA_REQUIRED:" + item.caseId);
    if (!GROUND_TRUTH_REVIEW_STATUSES.includes(item.reviewStatus)) throw new Error("GROUND_TRUTH_CLUSTER_REVIEW_STATUS_INVALID:" + item.caseId);
    if (!Array.isArray(item.eventSnapshots) || item.eventSnapshots.length !== item.eventIds.length) {
      throw new Error("GROUND_TRUTH_CLUSTER_SNAPSHOT_COVERAGE_INVALID:" + item.caseId);
    }
    const snapshotIds = new Set(item.eventSnapshots.map((snapshot) => snapshot.eventId));
    if (snapshotIds.size !== item.eventIds.length || item.eventIds.some((eventId) => !snapshotIds.has(eventId))) {
      throw new Error("GROUND_TRUTH_CLUSTER_SNAPSHOT_EVENT_MISMATCH:" + item.caseId);
    }
    for (const snapshot of item.eventSnapshots) {
      if (!snapshot.titleSnapshot.trim() || !snapshot.firstSeenAt.trim() || !Array.isArray(snapshot.sourceNames) || !snapshot.sourceNames.length) {
        throw new Error("GROUND_TRUTH_CLUSTER_SNAPSHOT_INVALID:" + item.caseId + ":" + snapshot.eventId);
      }
    }
  }

  return parsed;
}

export function isAiRelevantGroundTruth(label: GroundTruthEventCase["contentLabel"]) {
  return label === "AI_RELEVANT" || label === "LOW_VALUE";
}

export function isOperationalGroundTruth(disposition: GroundTruthDisposition) {
  return disposition !== "IGNORE";
}
