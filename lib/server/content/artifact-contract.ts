export const CONTENT_ARTIFACT_TYPES = [
  "TOPIC_DIAGNOSIS",
  "EVIDENCE_PACK",
  "OUTLINE",
  "DRAFT",
  "FORMATTED_DRAFT"
] as const;

export type ContentArtifactType = (typeof CONTENT_ARTIFACT_TYPES)[number];
export type ArtifactGeneratedMode = "AI" | "HUMAN" | "CORE";

export const TOPIC_DIAGNOSIS_SCHEMA_VERSION = "topic-diagnosis-v1";

export type TopicDiagnosisPayload = {
  verdict: "ADOPT_RECOMMENDED" | "WATCH_RECOMMENDED" | "REJECT_RECOMMENDED";
  whyItMatters: string;
  readerValue: string;
  suggestedAngle: string;
  duplicationRisk: "LOW" | "MEDIUM" | "HIGH";
  timeliness: "LOW" | "MEDIUM" | "HIGH";
  evidenceReadiness: "INSUFFICIENT" | "PARTIAL" | "SUFFICIENT";
  differentiation: "LOW" | "MEDIUM" | "HIGH";
  evidenceGaps: string[];
  risks: string[];
  supportingSourceIds: string[];
  reasoningSummary: string;
};

const VERDICTS = new Set<TopicDiagnosisPayload["verdict"]>([
  "ADOPT_RECOMMENDED",
  "WATCH_RECOMMENDED",
  "REJECT_RECOMMENDED"
]);
const LEVELS = new Set(["LOW", "MEDIUM", "HIGH"]);
const EVIDENCE_LEVELS = new Set<TopicDiagnosisPayload["evidenceReadiness"]>([
  "INSUFFICIENT",
  "PARTIAL",
  "SUFFICIENT"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function text(value: unknown, field: string, max: number) {
  if (typeof value !== "string") throw new Error("TOPIC_DIAGNOSIS_INVALID:" + field);
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new Error("TOPIC_DIAGNOSIS_INVALID:" + field);
  return normalized;
}

function strings(value: unknown, field: string, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) throw new Error("TOPIC_DIAGNOSIS_INVALID:" + field);
  const items = value.map((item) => {
    if (typeof item !== "string") throw new Error("TOPIC_DIAGNOSIS_INVALID:" + field);
    const normalized = item.trim();
    if (!normalized || normalized.length > maxLength) throw new Error("TOPIC_DIAGNOSIS_INVALID:" + field);
    return normalized;
  });
  return [...new Set(items)].slice(0, maxItems);
}

export function validateTopicDiagnosisPayload(
  value: unknown,
  options: { allowedSourceIds?: Iterable<string> } = {}
): TopicDiagnosisPayload {
  if (!isRecord(value)) throw new Error("TOPIC_DIAGNOSIS_INVALID");

  const verdict = value.verdict as TopicDiagnosisPayload["verdict"];
  const duplicationRisk = value.duplicationRisk as TopicDiagnosisPayload["duplicationRisk"];
  const timeliness = value.timeliness as TopicDiagnosisPayload["timeliness"];
  const evidenceReadiness = value.evidenceReadiness as TopicDiagnosisPayload["evidenceReadiness"];
  const differentiation = value.differentiation as TopicDiagnosisPayload["differentiation"];

  if (!VERDICTS.has(verdict)) throw new Error("TOPIC_DIAGNOSIS_INVALID:verdict");
  if (!LEVELS.has(duplicationRisk)) throw new Error("TOPIC_DIAGNOSIS_INVALID:duplicationRisk");
  if (!LEVELS.has(timeliness)) throw new Error("TOPIC_DIAGNOSIS_INVALID:timeliness");
  if (!EVIDENCE_LEVELS.has(evidenceReadiness)) throw new Error("TOPIC_DIAGNOSIS_INVALID:evidenceReadiness");
  if (!LEVELS.has(differentiation)) throw new Error("TOPIC_DIAGNOSIS_INVALID:differentiation");

  const supportingSourceIds = strings(value.supportingSourceIds, "supportingSourceIds", 40, 160);
  const allowed = options.allowedSourceIds ? new Set(options.allowedSourceIds) : null;
  if (allowed && supportingSourceIds.some((sourceId) => !allowed.has(sourceId))) {
    throw new Error("TOPIC_DIAGNOSIS_SOURCE_NOT_ALLOWED");
  }

  return {
    verdict,
    whyItMatters: text(value.whyItMatters, "whyItMatters", 3000),
    readerValue: text(value.readerValue, "readerValue", 1600),
    suggestedAngle: text(value.suggestedAngle, "suggestedAngle", 1600),
    duplicationRisk,
    timeliness,
    evidenceReadiness,
    differentiation,
    evidenceGaps: strings(value.evidenceGaps, "evidenceGaps", 12, 500),
    risks: strings(value.risks, "risks", 12, 500),
    supportingSourceIds,
    reasoningSummary: text(value.reasoningSummary, "reasoningSummary", 2400)
  };
}
