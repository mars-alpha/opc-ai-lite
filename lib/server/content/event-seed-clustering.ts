import "server-only";

import { and, desc, gte, isNull, lte } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentEvents } from "../db/schema";
import { buildEntityActionVersionKey } from "./raw-relevance-dedup";

export const EVENT_SEED_CLUSTER_RULE_VERSION = "event-seed-cluster-v3-recall-guarded";
export const EVENT_SEED_CLUSTER_TIME_WINDOW_HOURS = 72;
export const EVENT_SEED_CLUSTER_THRESHOLD = 80;

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","has","in","is","it","of","on","or","that","the","to","with",
  "new","latest","today","update","updates","announces","announced","launches","launched","releases","released"
]);

type SeedTerms = {
  title: string;
  keywords?: string[];
  entities?: string[];
  eventType?: string;
  observedAt: Date;
};

type EventTerms = {
  id: string;
  title: string;
  keywords: unknown;
  entities: unknown;
  eventType?: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
};

export type EventSeedClusterScore = {
  eventId: string;
  score: number;
  reason: "TITLE_EXACT" | "ENTITY_ACTION_VERSION_EXACT" | "TITLE_TOKEN_OVERLAP" | "ENTITY_FACT_ANCHOR";
  metadata: {
    titleScore: number;
    tokenOverlap: number;
    jaccard: number;
    keywordOverlap: number;
    entityOverlap: number;
    hoursApart: number;
    semanticKey?: string;
    rules: string[];
  };
};

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

export function normalizeEventSeedTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleTokens(value: string) {
  const normalized = normalizeEventSeedTitle(value);
  const tokens = new Set<string>();

  for (const part of normalized.split(/\s+/)) {
    if (!part) continue;

    if (/^[\p{Script=Han}]+$/u.test(part)) {
      if (part.length <= 2) {
        tokens.add(part);
      } else {
        tokens.add(part);
        for (let index = 0; index < part.length - 1; index += 1) {
          tokens.add(part.slice(index, index + 2));
        }
      }
      continue;
    }

    if (part.length < 2 || STOP_WORDS.has(part)) continue;
    tokens.add(part);
  }

  return tokens;
}

function normalizedTerms(values: string[]) {
  return new Set(
    values
      .map((item) => normalizeEventSeedTitle(item))
      .filter(Boolean)
  );
}

function overlapStats(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) return { overlap: 0, jaccard: 0, intersection: 0 };
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  const overlap = intersection / Math.min(left.size, right.size);
  const jaccard = intersection / (left.size + right.size - intersection);
  return { overlap, jaccard, intersection };
}

function numericTokens(value: string) {
  const normalized = value.normalize("NFKC").toLocaleLowerCase();
  return new Set(normalized.match(/\b\d+(?:\.\d+)+\b|\b\d+\b/g) ?? []);
}

function conflictingNumbers(left: string, right: string) {
  const a = numericTokens(left);
  const b = numericTokens(right);
  if (a.size === 0 || b.size === 0) return false;
  for (const value of a) if (b.has(value)) return false;
  return true;
}

function termOverlap(left: string[], right: string[]) {
  const stats = overlapStats(normalizedTerms(left), normalizedTerms(right));
  return stats.overlap;
}

function entityMentionedInTitle(entity: string, title: string) {
  const name = entity.replace(/^(?:company|model|product|creator)_/i, "").replace(/_/g, " ").toLocaleLowerCase();
  if (name.length < 4) return false;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "iu").test(normalizeEventSeedTitle(title));
}

function sharedEntityAnchor(seed: SeedTerms, candidate: EventTerms) {
  const seedEntities = stringList(seed.entities ?? []);
  const candidateEntities = stringList(candidate.entities);
  if (seedEntities.length && candidateEntities.length) {
    return termOverlap(seedEntities, candidateEntities) > 0;
  }
  const knownEntities = seedEntities.length ? seedEntities : candidateEntities;
  return knownEntities.some((entity) =>
    entityMentionedInTitle(entity, seed.title) && entityMentionedInTitle(entity, candidate.title)
  );
}

function factTopic(title: string) {
  if (/\b(?:revenue|sales)\b|营收|收入/iu.test(title)) return "REVENUE";
  if (/\b(?:source|version) control\b|版本控制|源码系统/iu.test(title) &&
      /\b(?:redesign|rebuild|reinvent|rewrit|replace)\w*\b|重造|重做|重建|重新设计/iu.test(title)) return "SOURCE_CONTROL_REDESIGN";
  return null;
}

function sharedNumericAnchor(left: string, right: string) {
  const monetaryNumbers = (title: string) => new Set(
    [...title.normalize("NFKC").toLocaleLowerCase().matchAll(/\b(\d+(?:\.\d+)?)\s*(b(?:n|illion)?\b|亿美元)/giu)]
      .map((match) => (Number(match[1]) * (match[2] === "亿美元" ? 0.1 : 1)).toFixed(6))
  );
  const rightNumbers = monetaryNumbers(right);
  return [...monetaryNumbers(left)].some((value) => rightNumbers.has(value));
}

function compatibleReportedNumbers(left: string, right: string) {
  const a = numericTokens(left);
  const b = numericTokens(right);
  if (!a.size || !b.size) return true;
  return [...a].every((value) => b.has(value)) || [...b].every((value) => a.has(value));
}

function strongFactAnchor(seed: SeedTerms, candidate: EventTerms) {
  if (!sharedEntityAnchor(seed, candidate)) return false;
  const seedTopic = factTopic(seed.title);
  if (!seedTopic || seedTopic !== factTopic(candidate.title)) return false;
  if (seedTopic === "REVENUE") return sharedNumericAnchor(seed.title, candidate.title);
  return compatibleReportedNumbers(seed.title, candidate.title);
}

export function scoreEventSeedCandidate(seed: SeedTerms, candidate: EventTerms): EventSeedClusterScore | null {
  const observed = seed.observedAt.getTime();
  const candidateTime = candidate.lastSeenAt.getTime();
  const hoursApart = Math.abs(observed - candidateTime) / (60 * 60 * 1000);
  if (hoursApart > EVENT_SEED_CLUSTER_TIME_WINDOW_HOURS) return null;
  if (
    seed.eventType &&
    seed.eventType !== "INDUSTRY_HOTSPOT" &&
    (candidate.eventType ?? "INDUSTRY_HOTSPOT") !== "INDUSTRY_HOTSPOT" &&
    seed.eventType !== candidate.eventType
  ) return null;

  const normalizedSeed = normalizeEventSeedTitle(seed.title);
  const normalizedCandidate = normalizeEventSeedTitle(candidate.title);
  if (!normalizedSeed || !normalizedCandidate) return null;
  const seedEntities = stringList(seed.entities ?? []);
  const candidateEntities = stringList(candidate.entities);
  const entityOverlap = termOverlap(seedEntities, candidateEntities);
  if (seedEntities.length && candidateEntities.length && entityOverlap === 0) return null;

  const seedSemanticKey = buildEntityActionVersionKey({
    title: seed.title,
    entities: stringList(seed.entities ?? []),
    eventType: seed.eventType
  });
  const candidateSemanticKey = buildEntityActionVersionKey({
    title: candidate.title,
    entities: stringList(candidate.entities),
    eventType: candidate.eventType
  });
  if (seedSemanticKey && candidateSemanticKey && seedSemanticKey === candidateSemanticKey) {
    return {
      eventId: candidate.id,
      score: 98,
      reason: "ENTITY_ACTION_VERSION_EXACT",
      metadata: {
        titleScore: 0,
        tokenOverlap: 0,
        jaccard: 0,
        keywordOverlap: termOverlap(seed.keywords ?? [], stringList(candidate.keywords)),
        entityOverlap: termOverlap(seed.entities ?? [], stringList(candidate.entities)),
        hoursApart,
        semanticKey: seedSemanticKey,
        rules: ["ENTITY_ACTION_VERSION_EXACT", "TIME_WINDOW"]
      }
    };
  }

  if (normalizedSeed === normalizedCandidate) {
    return {
      eventId: candidate.id,
      score: 100,
      reason: "TITLE_EXACT",
      metadata: {
        titleScore: 100,
        tokenOverlap: 1,
        jaccard: 1,
        keywordOverlap: termOverlap(seed.keywords ?? [], stringList(candidate.keywords)),
        entityOverlap: termOverlap(seed.entities ?? [], stringList(candidate.entities)),
        hoursApart,
        rules: ["TITLE_EXACT", "TIME_WINDOW"]
      }
    };
  }

  const titleStats = overlapStats(titleTokens(seed.title), titleTokens(candidate.title));
  const keywordOverlap = termOverlap(seed.keywords ?? [], stringList(candidate.keywords));

  if (strongFactAnchor(seed, candidate)) {
    return {
      eventId: candidate.id,
      score: 94,
      reason: "ENTITY_FACT_ANCHOR",
      metadata: {
        titleScore: 0,
        tokenOverlap: titleStats.overlap,
        jaccard: titleStats.jaccard,
        keywordOverlap,
        entityOverlap,
        hoursApart,
        rules: ["ENTITY_FACT_ANCHOR", "EVENT_TYPE_COMPATIBLE", "TIME_WINDOW"]
      }
    };
  }

  let titleScore = Math.round(Math.max(titleStats.jaccard * 100, titleStats.overlap * 86));
  if (conflictingNumbers(seed.title, candidate.title)) titleScore = Math.min(titleScore, 55);

  let score = titleScore + Math.round(entityOverlap * 18);
  if (titleScore >= 60) {
    score += Math.round(keywordOverlap * 5);
  }
  if (titleScore >= 65 && hoursApart <= 12) score += 4;
  else if (titleScore >= 65 && hoursApart <= 24) score += 2;
  score = Math.min(100, score);

  if (score < EVENT_SEED_CLUSTER_THRESHOLD) return null;

  return {
    eventId: candidate.id,
    score,
    reason: "TITLE_TOKEN_OVERLAP",
    metadata: {
      titleScore,
      tokenOverlap: titleStats.overlap,
      jaccard: titleStats.jaccard,
      keywordOverlap,
      entityOverlap,
      hoursApart,
      rules: ["TITLE_TOKEN_OVERLAP", "ENTITY_COMPATIBLE", "EVENT_TYPE_COMPATIBLE", "TIME_WINDOW"]
    }
  };
}

export function selectBestEventSeedCandidate(input: SeedTerms, candidates: EventTerms[]) {
  let best: EventSeedClusterScore | null = null;
  for (const candidate of candidates) {
    const scored = scoreEventSeedCandidate(input, candidate);
    if (scored && (!best || scored.score > best.score)) best = scored;
  }
  return best;
}

export async function findEventSeedCluster(input: SeedTerms) {
  const start = new Date(input.observedAt.getTime() - EVENT_SEED_CLUSTER_TIME_WINDOW_HOURS * 60 * 60 * 1000);
  const end = new Date(input.observedAt.getTime() + EVENT_SEED_CLUSTER_TIME_WINDOW_HOURS * 60 * 60 * 1000);

  const candidates = await getDatabase()
    .select({
      id: contentEvents.id,
      title: contentEvents.title,
      keywords: contentEvents.keywords,
      entities: contentEvents.entities,
      eventType: contentEvents.eventType,
      firstSeenAt: contentEvents.firstSeenAt,
      lastSeenAt: contentEvents.lastSeenAt
    })
    .from(contentEvents)
    .where(and(gte(contentEvents.lastSeenAt, start), lte(contentEvents.firstSeenAt, end), isNull(contentEvents.archivedAt)))
    .orderBy(desc(contentEvents.lastSeenAt), desc(contentEvents.id));

  return selectBestEventSeedCandidate(input, candidates);
}
