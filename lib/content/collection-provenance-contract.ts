export const COLLECTION_ORIGINS = ["SYSTEM", "MANUAL"] as const;
export type CollectionOrigin = (typeof COLLECTION_ORIGINS)[number];

export const COLLECTION_PURPOSES = [
  "TREND",
  "LATEST",
  "COMPETITOR",
  "COMMENT",
  "AUDIENCE",
  "TEMPORARY",
  "RESEARCH",
  "EXPANSION"
] as const;
export type CollectionPurpose = (typeof COLLECTION_PURPOSES)[number];

export type CollectionProvenance = {
  origin: CollectionOrigin;
  collectionPurpose: CollectionPurpose;
  taskId?: string;
  runKind?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalId(value: unknown, max = 200) {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value !== "string") throw new Error("COLLECTION_PROVENANCE_ID_INVALID");
  const text = value.trim();
  if (!text || text.length > max) throw new Error("COLLECTION_PROVENANCE_ID_INVALID");
  return text;
}

export function normalizeCollectionProvenance(
  value: unknown,
  fallback: CollectionProvenance = { origin: "SYSTEM", collectionPurpose: "EXPANSION" }
): CollectionProvenance {
  if (value === null || value === undefined) return { ...fallback };
  if (!isRecord(value)) throw new Error("COLLECTION_PROVENANCE_INVALID");

  const origin = String(value.origin ?? fallback.origin).toUpperCase();
  const collectionPurpose = String(value.collectionPurpose ?? fallback.collectionPurpose).toUpperCase();
  if (!COLLECTION_ORIGINS.includes(origin as CollectionOrigin)) {
    throw new Error("COLLECTION_ORIGIN_INVALID");
  }
  if (!COLLECTION_PURPOSES.includes(collectionPurpose as CollectionPurpose)) {
    throw new Error("COLLECTION_PURPOSE_INVALID");
  }

  const taskId = optionalId(value.taskId);
  const runKind = optionalId(value.runKind, 120);
  if (origin === "MANUAL" && !taskId) {
    throw new Error("MANUAL_COLLECTION_TASK_ID_REQUIRED");
  }
  if (origin === "SYSTEM" && taskId) {
    throw new Error("SYSTEM_COLLECTION_TASK_ID_FORBIDDEN");
  }

  return {
    origin: origin as CollectionOrigin,
    collectionPurpose: collectionPurpose as CollectionPurpose,
    ...(taskId ? { taskId } : {}),
    ...(runKind ? { runKind } : {})
  };
}

export function provenanceMetadata(provenance: CollectionProvenance) {
  return {
    collectionOrigin: provenance.origin,
    collectionPurpose: provenance.collectionPurpose,
    manualTaskId: provenance.taskId ?? null,
    collectionRunKind: provenance.runKind ?? null
  } as const;
}
