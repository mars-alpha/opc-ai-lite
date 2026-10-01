export const CANDIDATE_DECISIONS = ["ADOPT", "WATCH", "IGNORE"] as const;
export type CandidateDecision = (typeof CANDIDATE_DECISIONS)[number];

export const COLLECTOR_MEDIA_POLICY = "REFERENCE_ONLY" as const;

const FORBIDDEN_COLLECTOR_KEYS = new Set([
  "base64",
  "binary",
  "blob",
  "buffer",
  "bytes",
  "filePath",
  "localPath",
  "mediaBytes",
  "objectStorageKey",
  "persistentPath",
  "savedFile"
]);

function assertReferenceOnlyValue(value: unknown, depth = 0) {
  if (depth > 6 || value === null || value === undefined) return;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized.startsWith("data:") || normalized.startsWith("file:")) {
      throw new Error("COLLECTOR_MEDIA_PERSISTENCE_FORBIDDEN");
    }
    return;
  }
  if (typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertReferenceOnlyValue(item, depth + 1);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_COLLECTOR_KEYS.has(key)) {
      throw new Error("COLLECTOR_MEDIA_PERSISTENCE_FORBIDDEN");
    }
    assertReferenceOnlyValue(child, depth + 1);
  }
}

export function assertCollectorReferenceOnly(items: unknown[]) {
  for (const item of items) assertReferenceOnlyValue(item);
  return items;
}

export const EVENT_SIGNAL_TYPES = [
  "HOTNESS",
  "VELOCITY",
  "AUTHORITY",
  "RELEVANCE",
  "NOVELTY"
] as const;
export type EventSignalType = (typeof EVENT_SIGNAL_TYPES)[number];

function cleanTerms(values: unknown, limit: number) {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const term = value.trim().replace(/\s+/g, " ");
    if (!term) continue;
    const key = term.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(term);
    if (result.length >= limit) break;
  }
  return result;
}

export function normalizeCandidateDecision(value: unknown): CandidateDecision {
  if (typeof value !== "string" || !CANDIDATE_DECISIONS.includes(value as CandidateDecision)) {
    throw new Error("INVALID_CANDIDATE_DECISION");
  }
  return value as CandidateDecision;
}

export function normalizeSignalScore(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error("INVALID_SIGNAL_SCORE");
  }
  return value;
}

export function buildExpansionQueries(input: {
  title?: unknown;
  keywords?: unknown;
  entities?: unknown;
  maxQueries?: number;
}) {
  const keywords = cleanTerms(input.keywords, 12);
  const entities = cleanTerms(input.entities, 8);
  const maxQueries = Math.max(1, Math.min(12, input.maxQueries ?? 8));
  const queries: string[] = [];
  const title = typeof input.title === "string" ? input.title.trim().replace(/\s+/g, " ") : "";
  const seen = new Set<string>();

  function push(value: string) {
    const query = value.trim().replace(/\s+/g, " ");
    const key = query.toLocaleLowerCase();
    if (!query || seen.has(key) || queries.length >= maxQueries) return;
    seen.add(key);
    queries.push(query);
  }

  if (title) push(title);
  for (const entity of entities) push('"' + entity + '"');
  for (const keyword of keywords) push(keyword);

  const primaryEntity = entities[0];
  if (primaryEntity) {
    for (const keyword of keywords) {
      if (keyword.toLocaleLowerCase() === primaryEntity.toLocaleLowerCase()) continue;
      push('"' + primaryEntity + '" ' + keyword);
    }
  }

  return { keywords, entities, queries };
}
