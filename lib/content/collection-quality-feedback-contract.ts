export const COLLECTION_QUALITY_LABELS = ["POSITIVE", "NEGATIVE", "CLEAR"] as const;
export type CollectionQualityLabel = (typeof COLLECTION_QUALITY_LABELS)[number];

export const COLLECTION_QUALITY_REASONS = [
  "IRRELEVANT", "DUPLICATE", "OUTDATED", "INCOMPLETE_BODY", "FACTUAL_ERROR", "OTHER"
] as const;
export type CollectionQualityReason = (typeof COLLECTION_QUALITY_REASONS)[number];

export const COLLECTION_QUALITY_REASON_NAMES: Record<CollectionQualityReason, string> = {
  IRRELEVANT: "不相关",
  DUPLICATE: "重复",
  OUTDATED: "过时",
  INCOMPLETE_BODY: "正文缺失或截断",
  FACTUAL_ERROR: "事实不准确",
  OTHER: "其他"
};

export type QualityFeedbackInput = {
  eventId: string;
  sourceId: string | null;
  label: CollectionQualityLabel;
  reason: CollectionQualityReason | null;
  note: string | null;
  requestId: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseQualityFeedbackInput(eventId: string, value: unknown): QualityFeedbackInput {
  if (!UUID.test(eventId) || !value || typeof value !== "object" || Array.isArray(value)) throw new Error("QUALITY_INPUT_INVALID");
  const row = value as Record<string, unknown>;
  if (!COLLECTION_QUALITY_LABELS.includes(row.label as CollectionQualityLabel)) throw new Error("QUALITY_LABEL_INVALID");
  const label = row.label as CollectionQualityLabel;
  const sourceId = row.sourceId == null || row.sourceId === "" ? null : row.sourceId;
  if (sourceId !== null && (typeof sourceId !== "string" || sourceId.length > 160 || !/^source_[A-Za-z0-9_-]+$/.test(sourceId))) throw new Error("QUALITY_SOURCE_INVALID");
  const reason = row.reason == null || row.reason === "" ? null : row.reason;
  if (reason !== null && !COLLECTION_QUALITY_REASONS.includes(reason as CollectionQualityReason)) throw new Error("QUALITY_REASON_INVALID");
  const note = row.note == null || row.note === "" ? null : row.note;
  if (note !== null && (typeof note !== "string" || note.trim().length > 500)) throw new Error("QUALITY_NOTE_INVALID");
  if (label !== "NEGATIVE" && (reason !== null || note !== null)) throw new Error("QUALITY_DETAILS_ONLY_FOR_NEGATIVE");
  if (typeof row.requestId !== "string" || !UUID.test(row.requestId)) throw new Error("QUALITY_REQUEST_ID_INVALID");
  return { eventId, sourceId: sourceId as string | null, label, reason: reason as CollectionQualityReason | null, note: note ? (note as string).trim() : null, requestId: row.requestId };
}
