import "server-only";

import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentEventClusterMembers,
  contentEventClusters,
  contentEventRawItems,
  contentEvents,
  contentRawItemObservations,
  contentRawItems,
  contentSources
} from "../db/schema";
import { normalizeEventSeedTitle } from "./event-seed-clustering";

export const EVENT_CLUSTER_RULE_VERSION = "event-cluster-v1";
export const EVENT_CLUSTER_TIME_WINDOW_HOURS = 72;
export const EVENT_CLUSTER_THRESHOLD = 68;

const VERSION_CONFLICT = "VERSION_CONFLICT";

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","has","in","is","it","of","on","or","that","the","to","with",
  "new","latest","today","update","updates","announces","announced","launches","launched","releases","released",
  "report","reports","says","about","after","before","how","why"
]);

type EventLike = {
  id: string;
  title: string;
  keywords: unknown;
  entities: unknown;
  firstSeenAt: Date;
  lastSeenAt: Date;
};

export type EventClusterCandidateScore = {
  eventId: string;
  score: number;
  reason: "TITLE_EXACT" | "TITLE_TOKEN_OVERLAP";
  metadata: {
    titleScore: number;
    tokenOverlap: number;
    jaccard: number;
    keywordOverlap: number;
    entityOverlap: number;
    sharedTokenCount: number;
    hoursApart: number;
    rules: string[];
  };
};

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
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
  return new Set(values.map((item) => normalizeEventSeedTitle(item)).filter(Boolean));
}

function overlapStats(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) {
    return { overlap: 0, jaccard: 0, intersection: 0 };
  }
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  return {
    overlap: intersection / Math.min(left.size, right.size),
    jaccard: intersection / (left.size + right.size - intersection),
    intersection
  };
}

function termOverlap(left: string[], right: string[]) {
  return overlapStats(normalizedTerms(left), normalizedTerms(right)).overlap;
}

function versionTokens(value: string) {
  return new Set(
    value
      .normalize("NFKC")
      .toLocaleLowerCase()
      .match(/\b(?:v(?:ersion)?\s*)?\d+(?:\.\d+)+\b/gi) ?? []
  );
}

function hasVersionConflict(left: string, right: string) {
  const a = versionTokens(left);
  const b = versionTokens(right);
  if (a.size === 0 || b.size === 0) return false;
  for (const value of a) if (b.has(value)) return false;
  return true;
}

export function scoreEventClusterCandidate(
  anchor: EventLike,
  candidate: EventLike
): EventClusterCandidateScore | null {
  const hoursApart =
    Math.abs(anchor.lastSeenAt.getTime() - candidate.lastSeenAt.getTime()) /
    (60 * 60 * 1000);
  if (hoursApart > EVENT_CLUSTER_TIME_WINDOW_HOURS) return null;

  const leftTitle = normalizeEventSeedTitle(anchor.title);
  const rightTitle = normalizeEventSeedTitle(candidate.title);
  if (!leftTitle || !rightTitle) return null;

  if (leftTitle === rightTitle) {
    return {
      eventId: candidate.id,
      score: 100,
      reason: "TITLE_EXACT",
      metadata: {
        titleScore: 100,
        tokenOverlap: 1,
        jaccard: 1,
        keywordOverlap: termOverlap(stringList(anchor.keywords), stringList(candidate.keywords)),
        entityOverlap: termOverlap(stringList(anchor.entities), stringList(candidate.entities)),
        sharedTokenCount: titleTokens(anchor.title).size,
        hoursApart,
        rules: ["TITLE_EXACT", "TIME_WINDOW"]
      }
    };
  }

  if (hasVersionConflict(anchor.title, candidate.title)) {
    void VERSION_CONFLICT;
    return null;
  }

  const titleStats = overlapStats(titleTokens(anchor.title), titleTokens(candidate.title));
  if (titleStats.intersection < 2) return null;

  const keywordOverlap = termOverlap(stringList(anchor.keywords), stringList(candidate.keywords));
  const entityOverlap = termOverlap(stringList(anchor.entities), stringList(candidate.entities));
  let titleScore = Math.round(Math.max(titleStats.jaccard * 100, titleStats.overlap * 78));

  let score = titleScore;
  if (titleScore >= 45) {
    score += Math.round(entityOverlap * 10);
    score += Math.round(keywordOverlap * 6);
  }
  if (titleScore >= 55 && hoursApart <= 12) score += 5;
  else if (titleScore >= 55 && hoursApart <= 24) score += 3;
  score = Math.min(100, score);

  if (score < EVENT_CLUSTER_THRESHOLD) return null;

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
      sharedTokenCount: titleStats.intersection,
      hoursApart,
      rules: ["TITLE_TOKEN_OVERLAP", "TIME_WINDOW"]
    }
  };
}

async function getMemberEvents(clusterId: string) {
  const db = getDatabase();
  const members = await db
    .select()
    .from(contentEventClusterMembers)
    .where(eq(contentEventClusterMembers.clusterId, clusterId));
  if (members.length === 0) return { members, events: [] };

  const events = await db
    .select()
    .from(contentEvents)
    .where(inArray(contentEvents.id, members.map((item) => item.eventId)));

  return { members, events };
}

async function refreshClusterAggregate(clusterId: string) {
  const db = getDatabase();
  const { members, events } = await getMemberEvents(clusterId);
  if (events.length === 0) throw new Error("EVENT_CLUSTER_EMPTY");

  const eventIds = events.map((event) => event.id);
  const links = await db
    .select()
    .from(contentEventRawItems)
    .where(inArray(contentEventRawItems.eventId, eventIds));
  const rawIds = [...new Set(links.map((item) => item.rawItemId))];
  const rawItems = rawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds))
    : [];
  const observations = rawIds.length
    ? await db
        .select()
        .from(contentRawItemObservations)
        .where(inArray(contentRawItemObservations.rawItemId, rawIds))
    : [];
  const sourceIds = observations.length
    ? observations.map((item) => item.sourceId)
    : rawItems.map((item) => item.sourceId);
  const platforms = observations.length
    ? observations.map((item) => item.platform)
    : rawItems.map((item) => item.platform);

  const firstSeenAt = new Date(Math.min(...events.map((event) => event.firstSeenAt.getTime())));
  const lastSeenAt = new Date(Math.max(...events.map((event) => event.lastSeenAt.getTime())));

  const [updated] = await db
    .update(contentEventClusters)
    .set({
      memberEventCount: members.length,
      rawItemCount: rawItems.length,
      sourceCount: new Set(sourceIds).size,
      platformCount: new Set(platforms).size,
      firstSeenAt,
      lastSeenAt,
      updatedAt: new Date()
    })
    .where(eq(contentEventClusters.id, clusterId))
    .returning();

  return updated;
}

async function ensurePrimaryCluster(event: EventLike) {
  const db = getDatabase();
  const [existingMember] = await db
    .select()
    .from(contentEventClusterMembers)
    .where(eq(contentEventClusterMembers.eventId, event.id))
    .limit(1);

  if (existingMember) {
    const [cluster] = await db
      .select()
      .from(contentEventClusters)
      .where(eq(contentEventClusters.id, existingMember.clusterId))
      .limit(1);
    if (!cluster) throw new Error("EVENT_CLUSTER_NOT_FOUND");
    return cluster;
  }

  const [cluster] = await db
    .insert(contentEventClusters)
    .values({
      canonicalTitle: event.title,
      primaryEventId: event.id,
      clusterRuleVersion: EVENT_CLUSTER_RULE_VERSION,
      firstSeenAt: event.firstSeenAt,
      lastSeenAt: event.lastSeenAt,
      metadata: { canonicalization: "PRIMARY_EVENT_TITLE" }
    })
    .returning();

  await db.insert(contentEventClusterMembers).values({
    clusterId: cluster.id,
    eventId: event.id,
    role: "PRIMARY",
    clusterRuleVersion: EVENT_CLUSTER_RULE_VERSION,
    mergeReason: "PRIMARY_EVENT",
    mergeScore: 100,
    mergeMetadata: {}
  });

  return refreshClusterAggregate(cluster.id);
}

export async function runEventClustering(eventId: string) {
  const db = getDatabase();
  const [target] = await db
    .select()
    .from(contentEvents)
    .where(eq(contentEvents.id, eventId))
    .limit(1);
  if (!target) throw new Error("EVENT_NOT_FOUND");

  const cluster = await ensurePrimaryCluster(target);
  const start = new Date(target.firstSeenAt.getTime() - EVENT_CLUSTER_TIME_WINDOW_HOURS * 60 * 60 * 1000);
  const end = new Date(target.lastSeenAt.getTime() + EVENT_CLUSTER_TIME_WINDOW_HOURS * 60 * 60 * 1000);

  const candidates = await db
    .select()
    .from(contentEvents)
    .where(
      and(
        ne(contentEvents.id, target.id),
        gte(contentEvents.lastSeenAt, start),
        lte(contentEvents.firstSeenAt, end)
      )
    )
    .limit(500);

  const candidateIds = candidates.map((item) => item.id);
  const existingMemberships = candidateIds.length
    ? await db
        .select()
        .from(contentEventClusterMembers)
        .where(inArray(contentEventClusterMembers.eventId, candidateIds))
    : [];
  const membershipByEvent = new Map(existingMemberships.map((item) => [item.eventId, item]));

  let { events: memberEvents } = await getMemberEvents(cluster.id);
  const memberIds = new Set(memberEvents.map((item) => item.id));
  let changed = true;

  while (changed) {
    changed = false;

    for (const candidate of candidates) {
      if (memberIds.has(candidate.id)) continue;
      const existing = membershipByEvent.get(candidate.id);
      if (existing && existing.clusterId !== cluster.id) continue;

      let best: EventClusterCandidateScore | null = null;
      for (const anchor of memberEvents) {
        const scored = scoreEventClusterCandidate(anchor, candidate);
        if (!scored) continue;
        if (!best || scored.score > best.score) best = scored;
      }
      if (!best) continue;

      await db.insert(contentEventClusterMembers).values({
        clusterId: cluster.id,
        eventId: candidate.id,
        role: "MEMBER",
        clusterRuleVersion: EVENT_CLUSTER_RULE_VERSION,
        mergeReason: best.reason,
        mergeScore: best.score,
        mergeMetadata: best.metadata
      });

      memberIds.add(candidate.id);
      memberEvents = [...memberEvents, candidate];
      changed = true;
    }
  }

  const refreshed = await refreshClusterAggregate(cluster.id);
  return getEventClusterResearchPack(refreshed.primaryEventId);
}

export async function getEventClusterResearchPack(eventId: string) {
  const db = getDatabase();
  const [membership] = await db
    .select()
    .from(contentEventClusterMembers)
    .where(eq(contentEventClusterMembers.eventId, eventId))
    .limit(1);
  if (!membership) return null;

  const [cluster] = await db
    .select()
    .from(contentEventClusters)
    .where(eq(contentEventClusters.id, membership.clusterId))
    .limit(1);
  if (!cluster) throw new Error("EVENT_CLUSTER_NOT_FOUND");

  const { members, events } = await getMemberEvents(cluster.id);
  const eventIds = events.map((item) => item.id);
  const links = eventIds.length
    ? await db
        .select()
        .from(contentEventRawItems)
        .where(inArray(contentEventRawItems.eventId, eventIds))
    : [];
  const rawIds = [...new Set(links.map((item) => item.rawItemId))];
  const rawItems = rawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds))
    : [];

  const observations = rawIds.length
    ? await db
        .select()
        .from(contentRawItemObservations)
        .where(inArray(contentRawItemObservations.rawItemId, rawIds))
    : [];
  const coverageRows = observations.length
    ? observations.map((item) => ({
        rawItemId: item.rawItemId,
        sourceId: item.sourceId,
        platform: item.platform
      }))
    : rawItems.map((item) => ({
        rawItemId: item.id,
        sourceId: item.sourceId,
        platform: item.platform
      }));
  const sourceIds = [...new Set(coverageRows.map((item) => item.sourceId))];
  const sources = sourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds))
    : [];
  const sourceById = new Map(sources.map((item) => [item.id, item]));

  const sourceCoverage = sourceIds.map((sourceId) => ({
    sourceId,
    sourceName: sourceById.get(sourceId)?.name ?? sourceId,
    platform: sourceById.get(sourceId)?.platform ?? "UNKNOWN",
    itemCount: new Set(
      coverageRows.filter((item) => item.sourceId === sourceId).map((item) => item.rawItemId)
    ).size
  }));

  const platforms = [...new Set(coverageRows.map((item) => item.platform))];
  const platformCoverage = platforms.map((platform) => ({
    platform,
    itemCount: new Set(
      coverageRows.filter((item) => item.platform === platform).map((item) => item.rawItemId)
    ).size
  }));

  const eventById = new Map(events.map((item) => [item.id, item]));

  return {
    cluster,
    members: members.map((member) => ({
      ...member,
      event: eventById.get(member.eventId) ?? null
    })),
    rawItems,
    researchPack: {
      canonicalTitle: cluster.canonicalTitle,
      primaryEventId: cluster.primaryEventId,
      memberEventIds: members.map((item) => item.eventId),
      memberEventCount: members.length,
      rawItemCount: rawItems.length,
      sourceCount: sourceCoverage.length,
      platformCount: platformCoverage.length,
      firstSeenAt: cluster.firstSeenAt,
      lastSeenAt: cluster.lastSeenAt,
      sourceCoverage,
      platformCoverage
    }
  };
}
