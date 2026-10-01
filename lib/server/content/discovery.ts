import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentCandidateDecisions,
  contentCollectionRuns,
  contentCollectionStrategies,
  contentCollectionStrategySources,
  contentEventClusterMembers,
  contentEventClusterAnalyses,
  contentEventClusters,
  contentEventRawItems,
  contentEventSignals,
  contentEvents,
  contentRawItemObservations,
  contentRawItems,
  contentSources
} from "../db/schema";
import {
  buildExpansionQueries,
  EVENT_SIGNAL_TYPES,
  normalizeCandidateDecision,
  normalizeSignalScore,
  type EventSignalType
} from "./discovery-contract";
import { recordContentAudit } from "./workbench";
import { EVENT_SEED_CLUSTER_RULE_VERSION, findEventSeedCluster } from "./event-seed-clustering";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requiredText(value: unknown, code: string, max: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > max) throw new Error(code);
  return text;
}

function optionalText(value: unknown, code: string, max: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error(code);
  const text = value.trim();
  if (!text) return null;
  if (text.length > max) throw new Error(code);
  return text;
}

function parseOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_DATE");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("INVALID_DATE");
  return date;
}

function stringArray(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim())
    .slice(0, max);
}

function sourceId(value: unknown) {
  const id = requiredText(value, "INVALID_SOURCE_ID", 160);
  if (!id.startsWith("source_") || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("INVALID_SOURCE_ID");
  return id;
}

function eventFingerprint(title: string, keywords: string[], entities: string[]) {
  const seed = [title.toLocaleLowerCase(), ...entities.map((x) => x.toLocaleLowerCase()), ...keywords.map((x) => x.toLocaleLowerCase())]
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(seed).digest("hex");
}

const TRACKING_QUERY_KEYS = new Set([
  "fbclid",
  "gclid",
  "dclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "igshid",
  "yclid"
]);

export function canonicalizeOriginalUrl(input: string | null) {
  if (!input) return null;
  try {
    const url = new URL(input);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) {
      url.port = "";
    }
    for (const key of [...url.searchParams.keys()]) {
      const normalized = key.toLowerCase();
      if (normalized.startsWith("utm_") || TRACKING_QUERY_KEYS.has(normalized)) {
        url.searchParams.delete(key);
      }
    }
    url.searchParams.sort();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return input.trim() || null;
  }
}

async function upsertRawItemObservation(input: {
  rawItemId: string;
  sourceId: string;
  platform: string;
  externalId: string | null;
  observedUrl: string | null;
  platformMetrics: Record<string, unknown>;
  metadata: Record<string, unknown>;
}) {
  const db = getDatabase();
  const [item] = await db
    .insert(contentRawItemObservations)
    .values({
      rawItemId: input.rawItemId,
      sourceId: input.sourceId,
      platform: input.platform,
      externalId: input.externalId,
      observedUrl: input.observedUrl,
      platformMetrics: input.platformMetrics,
      metadata: input.metadata,
      observedAt: new Date(),
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: [contentRawItemObservations.rawItemId, contentRawItemObservations.sourceId],
      set: {
        platform: input.platform,
        externalId: input.externalId,
        observedUrl: input.observedUrl,
        platformMetrics: input.platformMetrics,
        metadata: input.metadata,
        observedAt: new Date(),
        updatedAt: new Date()
      }
    })
    .returning();
  return item;
}

export async function listDiscoverySources() {
  return getDatabase().select().from(contentSources).orderBy(contentSources.name);
}

export async function configureDiscoverySource(user: AuthUser, input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const id = sourceId(input.id);
  const values = {
    name: requiredText(input.name, "INVALID_SOURCE_NAME", 180),
    sourceType: optionalText(input.sourceType, "INVALID_SOURCE_TYPE", 120) ?? "DISCOVERY",
    canonicalUrl: optionalText(input.canonicalUrl, "INVALID_SOURCE_URL", 2000),
    providerRef: optionalText(input.providerRef, "INVALID_SOURCE_REF", 500),
    status: input.enabled === false ? "PAUSED" : "ACTIVE",
    platform: requiredText(input.platform, "INVALID_PLATFORM", 80),
    collectionMethod: requiredText(input.collectionMethod, "INVALID_COLLECTION_METHOD", 80),
    enabled: input.enabled !== false,
    authorityScore: normalizeSignalScore(input.authorityScore ?? 50),
    topics: stringArray(input.topics, 30),
    collectionConfig: isRecord(input.collectionConfig) ? input.collectionConfig : {},
    signalConfig: isRecord(input.signalConfig) ? input.signalConfig : {},
    updatedAt: new Date()
  };

  const db = getDatabase();
  const [existing] = await db.select().from(contentSources).where(eq(contentSources.id, id)).limit(1);
  const [item] = existing
    ? await db.update(contentSources).set(values).where(eq(contentSources.id, id)).returning()
    : await db.insert(contentSources).values({ id, ...values }).returning();

  await recordContentAudit(user, {
    action: existing ? "DISCOVERY_SOURCE_UPDATED" : "DISCOVERY_SOURCE_CREATED",
    entityType: "DISCOVERY_SOURCE",
    entityId: id,
    before: existing ?? null,
    after: item
  });
  return item;
}

export async function setDiscoverySourceEnabled(user: AuthUser, sourceIdInput: string, enabled: boolean) {
  const id = sourceId(sourceIdInput);
  const db = getDatabase();
  const [existing] = await db.select().from(contentSources).where(eq(contentSources.id, id)).limit(1);
  if (!existing) throw new Error("DISCOVERY_SOURCE_NOT_FOUND");
  const metadata = isRecord(existing.metadata) ? existing.metadata : {};
  if (metadata.systemManaged === true) throw new Error("DISCOVERY_SOURCE_SYSTEM_MANAGED");

  const [item] = await db
    .update(contentSources)
    .set({
      enabled,
      status: enabled ? "ACTIVE" : "PAUSED",
      updatedAt: new Date()
    })
    .where(eq(contentSources.id, id))
    .returning();

  await recordContentAudit(user, {
    action: enabled ? "DISCOVERY_SOURCE_ENABLED" : "DISCOVERY_SOURCE_DISABLED",
    entityType: "DISCOVERY_SOURCE",
    entityId: id,
    before: existing,
    after: item
  });
  return item;
}

export async function archiveDiscoverySource(user: AuthUser, sourceIdInput: string) {
  const id = sourceId(sourceIdInput);
  const db = getDatabase();
  const [existing] = await db.select().from(contentSources).where(eq(contentSources.id, id)).limit(1);
  if (!existing) throw new Error("DISCOVERY_SOURCE_NOT_FOUND");
  const metadata = isRecord(existing.metadata) ? existing.metadata : {};
  if (metadata.systemManaged === true) throw new Error("DISCOVERY_SOURCE_SYSTEM_MANAGED");

  const [item] = await db
    .update(contentSources)
    .set({
      enabled: false,
      status: "ARCHIVED",
      updatedAt: new Date()
    })
    .where(eq(contentSources.id, id))
    .returning();

  await recordContentAudit(user, {
    action: "DISCOVERY_SOURCE_ARCHIVED",
    entityType: "DISCOVERY_SOURCE",
    entityId: id,
    before: existing,
    after: item
  });
  return item;
}

export async function ingestRawItem(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const source = sourceId(input.sourceId);
  const db = getDatabase();
  const [sourceRow] = await db.select().from(contentSources).where(eq(contentSources.id, source)).limit(1);
  if (!sourceRow || !sourceRow.enabled || sourceRow.status !== "ACTIVE") throw new Error("DISCOVERY_SOURCE_INACTIVE");

  const externalId = optionalText(input.externalId, "INVALID_EXTERNAL_ID", 500);
  const originalUrl = optionalText(input.originalUrl, "INVALID_RAW_URL", 2000);
  const canonicalUrl = canonicalizeOriginalUrl(originalUrl);
  const title = requiredText(input.title, "INVALID_RAW_TITLE", 500);
  const author = optionalText(input.author, "INVALID_RAW_AUTHOR", 300);
  const excerpt = optionalText(input.excerpt, "INVALID_RAW_EXCERPT", 12000);
  const snapshotRef = optionalText(input.snapshotRef, "INVALID_SNAPSHOT_REF", 1000);
  const publishedAt = parseOptionalDate(input.publishedAt);
  const platformMetrics = isRecord(input.platformMetrics) ? input.platformMetrics : {};
  const metadata = isRecord(input.metadata) ? input.metadata : {};
  const contentHash =
    optionalText(input.contentHash, "INVALID_CONTENT_HASH", 128) ??
    createHash("sha256")
      .update([canonicalUrl, externalId, title, excerpt].map((value) => value ?? "").join("\n"))
      .digest("hex");

  const [duplicate] = canonicalUrl
    ? await db
        .select()
        .from(contentRawItems)
        .where(eq(contentRawItems.canonicalUrl, canonicalUrl))
        .limit(1)
    : await db
        .select()
        .from(contentRawItems)
        .where(
          and(
            eq(contentRawItems.sourceId, source),
            or(
              eq(contentRawItems.contentHash, contentHash),
              ...(externalId ? [eq(contentRawItems.externalId, externalId)] : [])
            )
          )
        )
        .limit(1);
  if (duplicate) {
    await upsertRawItemObservation({
      rawItemId: duplicate.id,
      sourceId: source,
      platform: sourceRow.platform,
      externalId,
      observedUrl: originalUrl,
      platformMetrics,
      metadata
    });
    await db
      .update(contentSources)
      .set({ lastCollectedAt: new Date(), updatedAt: new Date() })
      .where(eq(contentSources.id, source));
    return { item: duplicate, created: false };
  }

  const [inserted] = await db
    .insert(contentRawItems)
    .values({
      sourceId: source,
      platform: sourceRow.platform,
      externalId,
      originalUrl,
      canonicalUrl,
      title,
      author,
      excerpt,
      publishedAt,
      contentHash,
      snapshotRef,
      platformMetrics,
      metadata
    })
    .onConflictDoNothing()
    .returning();

  const item = inserted ?? (
    canonicalUrl
      ? (await db
          .select()
          .from(contentRawItems)
          .where(eq(contentRawItems.canonicalUrl, canonicalUrl))
          .limit(1))[0]
      : (await db
          .select()
          .from(contentRawItems)
          .where(
            and(
              eq(contentRawItems.sourceId, source),
              or(
                eq(contentRawItems.contentHash, contentHash),
                ...(externalId ? [eq(contentRawItems.externalId, externalId)] : [])
              )
            )
          )
          .limit(1))[0]
  );
  if (!item) throw new Error("RAW_ITEM_INSERT_CONFLICT_UNRESOLVED");

  await upsertRawItemObservation({
    rawItemId: item.id,
    sourceId: source,
    platform: sourceRow.platform,
    externalId,
    observedUrl: originalUrl,
    platformMetrics,
    metadata
  });
  await db.update(contentSources).set({ lastCollectedAt: new Date(), updatedAt: new Date() }).where(eq(contentSources.id, source));
  return { item, created: Boolean(inserted) };
}

export async function runFreshScan(input: unknown) {
  if (!isRecord(input) || !Array.isArray(input.items)) throw new Error("INVALID_INPUT");
  const sourceIdInput = sourceId(input.sourceId);
  const items = input.items.slice(0, 200);
  const results: Array<{ id: string; created: boolean }> = [];
  const createdRawItemIds: string[] = [];

  for (const item of items) {
    if (!isRecord(item)) continue;
    const result = await ingestRawItem({ ...item, sourceId: sourceIdInput });
    results.push({ id: result.item.id, created: result.created });
    if (result.created) {
      createdRawItemIds.push(result.item.id);
      await createEventSeed({
        rawItemId: result.item.id,
        title: result.item.title,
        summary: result.item.excerpt,
        keywords: [],
        entities: []
      });
    }
  }

  return {
    sourceId: sourceIdInput,
    received: items.length,
    stored: results.length,
    created: results.filter((item) => item.created).length,
    duplicates: results.filter((item) => !item.created).length,
    rawItemIds: results.map((item) => item.id),
    createdRawItemIds
  };
}

export async function listCollectionRuns(limit = 60) {
  return getDatabase()
    .select()
    .from(contentCollectionRuns)
    .orderBy(desc(contentCollectionRuns.startedAt))
    .limit(Math.max(1, Math.min(200, limit)));
}

export async function listRawItems(limit = 100) {
  const db = getDatabase();
  const items = await db
    .select()
    .from(contentRawItems)
    .orderBy(desc(contentRawItems.collectedAt))
    .limit(Math.max(1, Math.min(500, limit)));
  if (items.length === 0) return [];

  const rawIds = items.map((item) => item.id);
  const [observations, links] = await Promise.all([
    db
      .select()
      .from(contentRawItemObservations)
      .where(inArray(contentRawItemObservations.rawItemId, rawIds)),
    db
      .select()
      .from(contentEventRawItems)
      .where(inArray(contentEventRawItems.rawItemId, rawIds))
  ]);
  const sourceIds = [
    ...new Set([
      ...items.map((item) => item.sourceId),
      ...observations.map((item) => item.sourceId)
    ])
  ];
  const sources = sourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds))
    : [];
  const strategyLinks = sourceIds.length
    ? await db
        .select()
        .from(contentCollectionStrategySources)
        .where(inArray(contentCollectionStrategySources.sourceId, sourceIds))
    : [];
  const strategyIds = [...new Set(strategyLinks.map((item) => item.strategyId))];
  const strategies = strategyIds.length
    ? await db
        .select()
        .from(contentCollectionStrategies)
        .where(inArray(contentCollectionStrategies.id, strategyIds))
    : [];
  const eventIds = [...new Set(links.map((item) => item.eventId))];
  const events = eventIds.length
    ? await db.select().from(contentEvents).where(inArray(contentEvents.id, eventIds))
    : [];
  const memberships = eventIds.length
    ? await db
        .select()
        .from(contentEventClusterMembers)
        .where(inArray(contentEventClusterMembers.eventId, eventIds))
    : [];

  const sourceById = new Map(sources.map((item) => [item.id, item]));
  const strategyById = new Map(strategies.map((item) => [item.id, item]));
  const strategyLinksBySourceId = new Map<string, typeof strategyLinks>();
  for (const link of strategyLinks) {
    const current = strategyLinksBySourceId.get(link.sourceId) ?? [];
    current.push(link);
    strategyLinksBySourceId.set(link.sourceId, current);
  }
  const observationsByRawId = new Map<string, typeof observations>();
  for (const observation of observations) {
    const current = observationsByRawId.get(observation.rawItemId) ?? [];
    current.push(observation);
    observationsByRawId.set(observation.rawItemId, current);
  }
  const eventById = new Map(events.map((item) => [item.id, item]));
  const eventLinkByRawId = new Map(links.map((item) => [item.rawItemId, item]));
  const membershipByEventId = new Map(memberships.map((item) => [item.eventId, item]));

  return items.map((item) => {
    const source = sourceById.get(item.sourceId);
    const link = eventLinkByRawId.get(item.id);
    const event = link ? eventById.get(link.eventId) : null;
    const membership = event ? membershipByEventId.get(event.id) : null;
    const itemObservations = observationsByRawId.get(item.id) ?? [];
    const relatedSourceIds = [...new Set([item.sourceId, ...itemObservations.map((observation) => observation.sourceId)])];
    const relatedStrategyIds = [...new Set(
      relatedSourceIds.flatMap((relatedSourceId) =>
        (strategyLinksBySourceId.get(relatedSourceId) ?? []).map((entry) => entry.strategyId)
      )
    )];
    const collectionStrategies = relatedStrategyIds
      .map((strategyIdValue) => strategyById.get(strategyIdValue))
      .filter((strategy): strategy is NonNullable<typeof strategy> => Boolean(strategy))
      .map((strategy) => {
        const advanced = isRecord(strategy.advancedConfig) ? strategy.advancedConfig : {};
        const languagePolicy =
          typeof advanced.languagePolicy === "string" && ["ZH_PREFERRED", "ZH_EN", "ANY"].includes(advanced.languagePolicy)
            ? advanced.languagePolicy
            : "ZH_EN";
        return {
          id: strategy.id,
          name: strategy.name,
          topics: stringArray(strategy.topics, 30),
          languagePolicy
        };
      });
    return {
      ...item,
      sourceName: source?.name ?? item.sourceId,
      sourceUrl: source?.canonicalUrl ?? null,
      sourceTopics: source?.topics ?? [],
      eventId: event?.id ?? null,
      clusterId: membership?.clusterId ?? null,
      keywords: event?.keywords ?? [],
      entities: event?.entities ?? [],
      collectionStrategies,
      observations: itemObservations.map((observation) => ({
        id: observation.id,
        sourceId: observation.sourceId,
        sourceName: sourceById.get(observation.sourceId)?.name ?? observation.sourceId,
        platform: observation.platform,
        observedUrl: observation.observedUrl,
        observedAt: observation.observedAt,
        platformMetrics: observation.platformMetrics
      }))
    };
  });
}

export async function attachRawItemToEvent(
  eventId: string,
  rawItemId: string,
  role = "SUPPORTING",
  cluster?: {
    ruleVersion?: string | null;
    reason?: string | null;
    score?: number | null;
    metadata?: Record<string, unknown>;
  }
) {
  const db = getDatabase();
  const [[event], [raw]] = await Promise.all([
    db.select({ id: contentEvents.id }).from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1),
    db.select({ id: contentRawItems.id }).from(contentRawItems).where(eq(contentRawItems.id, rawItemId)).limit(1)
  ]);
  if (!event) throw new Error("EVENT_NOT_FOUND");
  if (!raw) throw new Error("RAW_ITEM_NOT_FOUND");

  const [existing] = await db
    .select()
    .from(contentEventRawItems)
    .where(and(eq(contentEventRawItems.eventId, eventId), eq(contentEventRawItems.rawItemId, rawItemId)))
    .limit(1);
  if (existing) return { item: existing, created: false };

  const [item] = await db.insert(contentEventRawItems).values({
    eventId,
    rawItemId,
    role,
    clusterRuleVersion: cluster?.ruleVersion ?? null,
    clusterReason: cluster?.reason ?? null,
    clusterScore: cluster?.score ?? null,
    clusterMetadata: cluster?.metadata ?? {}
  }).returning();
  await db.update(contentEvents).set({ lastSeenAt: new Date(), updatedAt: new Date() }).where(eq(contentEvents.id, eventId));
  return { item, created: true };
}

export async function createEventSeed(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const rawItemId = requiredText(input.rawItemId, "INVALID_RAW_ITEM_ID", 100);
  const title = requiredText(input.title, "INVALID_EVENT_TITLE", 500);
  const summary = optionalText(input.summary, "INVALID_EVENT_SUMMARY", 4000);
  const expansion = buildExpansionQueries({ keywords: input.keywords, entities: input.entities, maxQueries: 8 });
  const fingerprint =
    optionalText(input.fingerprint, "INVALID_EVENT_FINGERPRINT", 128) ??
    eventFingerprint(title, expansion.keywords, expansion.entities);

  const db = getDatabase();
  const [raw] = await db.select().from(contentRawItems).where(eq(contentRawItems.id, rawItemId)).limit(1);
  if (!raw) throw new Error("RAW_ITEM_NOT_FOUND");

  let [event] = await db.select().from(contentEvents).where(eq(contentEvents.fingerprint, fingerprint)).limit(1);
  let created = false;
  let clusterReason = "FINGERPRINT_EXACT";
  let clusterScore = 100;
  let clusterMetadata: Record<string, unknown> = { fingerprint };

  if (!event) {
    const observedAt = raw.publishedAt ?? raw.collectedAt;
    const cluster = await findEventSeedCluster({
      title,
      keywords: expansion.keywords,
      entities: expansion.entities,
      observedAt
    });

    if (cluster) {
      [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, cluster.eventId)).limit(1);
      clusterReason = cluster.reason;
      clusterScore = cluster.score;
      clusterMetadata = cluster.metadata;
    }
  }

  if (!event) {
    [event] = await db
      .insert(contentEvents)
      .values({
        fingerprint,
        title,
        summary,
        keywords: expansion.keywords,
        entities: expansion.entities,
        discoveryStatus: "DISCOVERED",
        firstSeenAt: raw.publishedAt ?? raw.collectedAt,
        lastSeenAt: raw.publishedAt ?? raw.collectedAt
      })
      .returning();
    created = true;
    clusterReason = "NEW_EVENT";
    clusterScore = 100;
    clusterMetadata = { fingerprint };
  }

  await attachRawItemToEvent(
    event.id,
    rawItemId,
    created ? "SEED" : "SUPPORTING",
    {
      ruleVersion: EVENT_SEED_CLUSTER_RULE_VERSION,
      reason: clusterReason,
      score: clusterScore,
      metadata: clusterMetadata
    }
  );
  return { item: event, created, expansion, clusterReason, clusterScore, clusterMetadata };
}

export async function listEvents(limit = 100) {
  const db = getDatabase();
  const events = await db
    .select()
    .from(contentEvents)
    .orderBy(desc(contentEvents.lastSeenAt))
    .limit(Math.max(1, Math.min(500, limit)));

  if (events.length === 0) return [];

  const eventIds = events.map((event) => event.id);
  const links = await db
    .select()
    .from(contentEventRawItems)
    .where(inArray(contentEventRawItems.eventId, eventIds));

  const rawItemIds = [...new Set(links.map((link) => link.rawItemId))];
  const rawItems =
    rawItemIds.length > 0
      ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawItemIds))
      : [];

  const clusterMembers = await db
    .select()
    .from(contentEventClusterMembers)
    .where(inArray(contentEventClusterMembers.eventId, eventIds));
  const clusterIds = [...new Set(clusterMembers.map((item) => item.clusterId))];
  const clusters = clusterIds.length
    ? await db.select().from(contentEventClusters).where(inArray(contentEventClusters.id, clusterIds))
    : [];
  const clusterMemberByEvent = new Map(clusterMembers.map((item) => [item.eventId, item]));
  const clusterById = new Map(clusters.map((item) => [item.id, item]));
  const clusterAnalyses = clusterIds.length
    ? await db
        .select()
        .from(contentEventClusterAnalyses)
        .where(inArray(contentEventClusterAnalyses.clusterId, clusterIds))
    : [];
  const analysisByClusterId = new Map(
    clusterAnalyses.map((item) => [item.clusterId, item])
  );

  const rawById = new Map(rawItems.map((item) => [item.id, item]));
  const linksByEvent = new Map<string, typeof links>();
  for (const link of links) {
    const current = linksByEvent.get(link.eventId) ?? [];
    current.push(link);
    linksByEvent.set(link.eventId, current);
  }

  return events.map((event) => {
    const eventLinks = linksByEvent.get(event.id) ?? [];
    const eventRaw = eventLinks
      .map((link) => rawById.get(link.rawItemId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const clusterMember = clusterMemberByEvent.get(event.id);
    const cluster = clusterMember ? clusterById.get(clusterMember.clusterId) : null;
    const clusterAnalysis = cluster ? analysisByClusterId.get(cluster.id) : null;

    return {
      ...event,
      rawItemCount: eventRaw.length,
      sourceCount: new Set(eventRaw.map((item) => item.sourceId)).size,
      platformCount: new Set(eventRaw.map((item) => item.platform)).size,
      clusterId: cluster?.id ?? null,
      clusterMemberCount: cluster?.memberEventCount ?? 1,
      clusterRawItemCount: cluster?.rawItemCount ?? eventRaw.length,
      clusterSourceCount: cluster?.sourceCount ?? new Set(eventRaw.map((item) => item.sourceId)).size,
      clusterPlatformCount: cluster?.platformCount ?? new Set(eventRaw.map((item) => item.platform)).size,
      clusterCanonicalTitle: cluster?.canonicalTitle ?? event.title,
      clusterHotnessScore: cluster?.hotnessScore ?? null,
      clusterVelocityScore: cluster?.velocityScore ?? null,
      clusterAuthorityScore: cluster?.authorityScore ?? null,
      clusterOpcRelevanceScore: clusterAnalysis?.opcRelevanceScore ?? null,
      clusterSuggestedContentTypes: Array.isArray(clusterAnalysis?.suggestedContentTypes)
        ? clusterAnalysis.suggestedContentTypes
        : [],
      clusterWhyItMatters: clusterAnalysis?.whyItMatters ?? null
    };
  });
}

export async function getExpansionPlan(eventId: string) {
  const [event] = await getDatabase().select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");
  return buildExpansionQueries({
    title: event.title,
    keywords: event.keywords,
    entities: event.entities,
    maxQueries: 4
  });
}

export async function recordEventSignal(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const eventId = requiredText(input.eventId, "INVALID_EVENT_ID", 100);
  const signalType = requiredText(input.signalType, "INVALID_SIGNAL_TYPE", 40);
  if (!EVENT_SIGNAL_TYPES.includes(signalType as EventSignalType)) throw new Error("INVALID_SIGNAL_TYPE");
  const score = normalizeSignalScore(input.score);
  const platform = optionalText(input.platform, "INVALID_PLATFORM", 80);
  const rawValue = isRecord(input.rawValue) ? input.rawValue : {};
  const db = getDatabase();
  const [event] = await db.select({ id: contentEvents.id }).from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const [item] = await db
    .insert(contentEventSignals)
    .values({ eventId, signalType, platform, score, rawValue })
    .returning();

  const patch =
    signalType === "HOTNESS"
      ? { hotnessScore: score }
      : signalType === "RELEVANCE"
        ? { relevanceScore: score }
        : signalType === "NOVELTY"
          ? { noveltyScore: score }
          : {};
  await db.update(contentEvents).set({ ...patch, updatedAt: new Date() }).where(eq(contentEvents.id, eventId));
  return item;
}

export async function recordCandidateDecision(user: AuthUser, input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const eventId = requiredText(input.eventId, "INVALID_EVENT_ID", 100);
  const decision = normalizeCandidateDecision(input.decision);
  const selectedTypes = stringArray(input.selectedTypes, 8);
  const note = optionalText(input.note, "INVALID_DECISION_NOTE", 4000);
  const db = getDatabase();
  const [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const [item] = await db
    .insert(contentCandidateDecisions)
    .values({
      eventId,
      decision,
      selectedTypes,
      note,
      decidedBy: user.id,
      decidedByEmail: user.email
    })
    .returning();

  const discoveryStatus = decision === "ADOPT" ? "ADOPTED" : decision === "WATCH" ? "WATCHING" : "IGNORED";
  await db.update(contentEvents).set({ discoveryStatus, updatedAt: new Date() }).where(eq(contentEvents.id, eventId));

  await recordContentAudit(user, {
    action: "DISCOVERY_CANDIDATE_DECIDED",
    entityType: "DISCOVERY_EVENT",
    entityId: eventId,
    before: { discoveryStatus: event.discoveryStatus },
    after: { discoveryStatus, decision, selectedTypes },
    metadata: { decisionId: item.id }
  });

  return item;
}
