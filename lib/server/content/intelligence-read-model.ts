import { calendarWindow, dayStart, nextHistoryDay, selectCalendarItems } from "../../content/radar-calendar";
import { isMultiNewsRoundup } from "./content-evidence-signals";
import {listAiHotspotPractices} from "./ai-hotspot-practice-store";
import {aiHotspotPracticePublisher} from "./ai-hotspot-practice";
import "server-only";

import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentEventClusterMembers,
  contentEventClusterAnalyses,
  contentEventClusters,
  contentEventExpansionEvidence,
  contentEventRawItems,
  contentEvents,
  contentRawItemObservations,
  contentRawItems,
  contentSources
} from "../db/schema";
import { INTELLIGENCE_POLICY_VERSION } from "../../content/intelligence-policy";
import { getTodayIntelligenceSignalReadiness } from "./today-intelligence-readiness";
import { calculateTopicMomentum, canonicalHotParticipantName } from "./topic-momentum";
import { calculateAihotHeatShadow } from "./aihot-heat-shadow";
import { attachRelatedEventStories, buildEventStoryReadModel } from "./event-story-read-model";
import { evaluatePracticalEvidenceActionability, isFormalPracticalEvidenceSource } from "./content-evidence-signals";
import {evaluatePracticeMaterials} from "./practice-materials";

import { evaluateEventEvidenceRelevance } from "./pollution-syndication-gate";
import { buildContentPresentationEnrichment } from "./presentation-enrichment";
import { evaluateBoleDailyCuration, rerankBoleDailyFeatured } from "./bole-daily-curation";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function originPublisher(raw: { metadata: unknown }) {
  const metadata = record(raw.metadata);
  return typeof metadata.originPublisher === "string" && metadata.originPublisher.trim()
    ? metadata.originPublisher.trim()
    : null;
}

function radarCategory(
  eventType: string | null,
  raws: Array<typeof contentRawItems.$inferSelect>,
  sourceById: Map<string, typeof contentSources.$inferSelect>
) {
  const originText = raws.map((raw) => {
    const metadata = record(raw.metadata);
    return [
      originPublisher(raw) ?? "",
      typeof metadata.originSiteId === "string" ? metadata.originSiteId : "",
      raw.platform,
      sourceById.get(raw.sourceId)?.platform ?? ""
    ].join(" ").toLowerCase();
  }).join(" ");
  if (/公众号|xiaohongshu|小红书|douyin|抖音|weibo|微博|twitter|youtube|bilibili|b站/.test(originText)) return "自媒体";
  if (/hacker.news|hacker_news|github|product.hunt|product_hunt|reddit/.test(originText)) return "社区";
  if (eventType === "MODEL_RELEASE") return "模型";
  if (eventType === "PRODUCT_FEATURE_RELEASE") return "产品";
  if (eventType === "API_PLATFORM_UPDATE" || eventType === "OPEN_SOURCE") return "开发者";
  if (eventType === "RESEARCH") return "论文";
  return "行业";
}

export function isSystemIntelligenceObservationMetadata(metadata: unknown) {
  const item = record(metadata);
  const origin = typeof item.collectionOrigin === "string"
    ? item.collectionOrigin.trim().toUpperCase()
    : "SYSTEM";
  return origin !== "MANUAL";
}

function hasSystemCollectionHistory(metadata: unknown) {
  if (isSystemIntelligenceObservationMetadata(metadata)) return true;
  const item = record(metadata);
  const contexts = Array.isArray(item.collectionContexts)
    ? item.collectionContexts.filter((value): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value)))
    : [];
  return contexts.some((context) => String(context.origin ?? "").toUpperCase() === "SYSTEM");
}

function finite(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeTrendSignalSamples(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const row = item as Record<string, unknown>;
      if (typeof row.observedAt !== "string") return [];
      const observedAt = new Date(row.observedAt);
      if (Number.isNaN(observedAt.getTime())) return [];
      return [{
        observedAt: observedAt.toISOString(),
        trendRank: finite(row.trendRank),
        hotValue: finite(row.hotValue)
      }];
    })
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())
    .slice(-96);
}

function toTime(value: Date | string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function sourceManagedExpansionRuntime(metadata: unknown) {
  const state = record(record(metadata).sourceManagedExpansionRuntime);
  const status = state.status === "FAILED" ? "FAILED" as const : state.status === "SUCCEEDED" ? "SUCCEEDED" as const : "NEVER" as const;
  const lastAttemptAt = typeof state.lastAttemptAt === "string" && toTime(state.lastAttemptAt) > 0 ? state.lastAttemptAt : null;
  return {
    version: typeof state.version === "string" ? state.version : null,
    status,
    lastAttemptAt,
    practicalEvidenceCount: Math.max(0, Number(state.practicalEvidenceCount) || 0),
    analysisStatus: typeof state.analysisStatus === "string" ? state.analysisStatus : null,
    lastError: typeof state.lastError === "string" ? state.lastError : null
  };
}

function latestTrendRank(observation: { metadata: unknown; platformMetrics: unknown }) {
  const metadata = record(observation.metadata);
  const samples = normalizeTrendSignalSamples(metadata.trendSamples);
  const sampleRank = samples.at(-1)?.trendRank ?? null;
  if (sampleRank !== null) return sampleRank;
  const metrics = record(observation.platformMetrics);
  return finite(metrics.trendRank) ?? finite(metrics.rank);
}

function latestHotValue(observation: { metadata: unknown; platformMetrics: unknown }) {
  const metadata = record(observation.metadata);
  const samples = normalizeTrendSignalSamples(metadata.trendSamples);
  const sampleHot = samples.at(-1)?.hotValue ?? null;
  if (sampleHot !== null) return sampleHot;
  const metrics = record(observation.platformMetrics);
  return finite(metrics.hotValue) ?? finite(metrics.points) ?? finite(metrics.views);
}

async function rawEventContext(rawIds: string[]) {
  if (!rawIds.length) {
    return {
      eventByRawId: new Map<string, typeof contentEvents.$inferSelect>(),
      clusterIdByEventId: new Map<string, string>()
    };
  }
  const db = getDatabase();
  const links = await db
    .select()
    .from(contentEventRawItems)
    .where(inArray(contentEventRawItems.rawItemId, rawIds));
  const eventIds = [...new Set(links.map((item) => item.eventId))];
  const [events, memberships] = await Promise.all([
    eventIds.length
      ? db.select().from(contentEvents).where(inArray(contentEvents.id, eventIds))
      : Promise.resolve([]),
    eventIds.length
      ? db.select().from(contentEventClusterMembers).where(inArray(contentEventClusterMembers.eventId, eventIds))
      : Promise.resolve([])
  ]);
  const eventById = new Map(events.map((item) => [item.id, item]));
  const eventByRawId = new Map(
    links.flatMap((item) => {
      const event = eventById.get(item.eventId);
      return event ? [[item.rawItemId, event] as const] : [];
    })
  );
  const clusterIdByEventId = new Map(memberships.map((item) => [item.eventId, item.clusterId]));
  return { eventByRawId, clusterIdByEventId };
}

export async function listPlatformHeatboards(perPlatform = 20) {
  const db = getDatabase();
  const sources = await db
    .select()
    .from(contentSources)
    .where(and(eq(contentSources.enabled, true), eq(contentSources.collectionMethod, "TREND")));
  if (!sources.length) return [];

  const sourceIds = sources.map((item) => item.id);
  const observations = (await db
    .select()
    .from(contentRawItemObservations)
    .where(inArray(contentRawItemObservations.sourceId, sourceIds))
    .orderBy(desc(contentRawItemObservations.observedAt))
    .limit(3000))
    .filter((observation) => isSystemIntelligenceObservationMetadata(observation.metadata));
  if (!observations.length) return [];

  const rawIds = [...new Set(observations.map((item) => item.rawItemId))];
  const rawItems = await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds));
  const rawById = new Map(rawItems.map((item) => [item.id, item]));
  const sourceById = new Map(sources.map((item) => [item.id, item]));
  const { eventByRawId, clusterIdByEventId } = await rawEventContext(rawIds);

  const latestBySourceAndRaw = new Map<string, typeof observations[number]>();
  for (const observation of observations) {
    const key = observation.sourceId + "|" + observation.rawItemId;
    if (!latestBySourceAndRaw.has(key)) latestBySourceAndRaw.set(key, observation);
  }

  const rows = [...latestBySourceAndRaw.values()].flatMap((observation) => {
    const raw = rawById.get(observation.rawItemId);
    const source = sourceById.get(observation.sourceId);
    if (!raw || !source) return [];
    const event = eventByRawId.get(raw.id);
    return [{
      platform: observation.platform || source.platform || raw.platform,
      sourceId: source.id,
      sourceName: source.name,
      rawItemId: raw.id,
      eventId: event?.id ?? null,
      clusterId: event ? clusterIdByEventId.get(event.id) ?? null : null,
      title: raw.title,
      originalUrl: raw.originalUrl,
      publishedAt: raw.publishedAt,
      observedAt: observation.observedAt,
      trendRank: latestTrendRank(observation),
      hotValue: latestHotValue(observation)
    }];
  });

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const current = groups.get(row.platform) ?? [];
    current.push(row);
    groups.set(row.platform, current);
  }

  return [...groups.entries()]
    .map(([platform, items]) => ({
      platform,
      items: items
        .sort((a, b) => {
          const ar = a.trendRank ?? Number.POSITIVE_INFINITY;
          const br = b.trendRank ?? Number.POSITIVE_INFINITY;
          return ar - br || toTime(b.observedAt) - toTime(a.observedAt);
        })
        .slice(0, Math.max(1, Math.min(100, perPlatform)))
    }))
    .sort((a, b) => a.platform.localeCompare(b.platform));
}

function eventPolicyMetadata(metadata: unknown) {
  return record(record(metadata).eventPolicy);
}

async function listPolicyEventCandidatePool(limit = 100, options: { before?: Date | null; range?: { from: Date; to: Date; asOf: Date }; executor?: ReturnType<typeof getDatabase> } = {}) {
  const db = options.executor ?? getDatabase();
  const boundedLimit = Math.max(1, Math.min(1000, limit));
  const baseQuery = db.select().from(contentEvents);
  const eventTime = sql`coalesce(${contentEvents.eventAt}, ${contentEvents.firstSeenAt})`;
  const query = baseQuery.where(options.range
    ? and(sql`${eventTime} >= ${options.range.from.toISOString()}`, sql`${eventTime} < ${options.range.to.toISOString()}`, sql`${contentEvents.createdAt} < ${options.range.asOf.toISOString()}`,
      sql`${contentEvents.archivedAt} is null`,
      eq(contentEvents.policyVersion, INTELLIGENCE_POLICY_VERSION),
      sql`${contentEvents.metadata}->'eventPolicy'->>'version' = ${INTELLIGENCE_POLICY_VERSION}`,
      sql`${contentEvents.metadata}->'eventPolicy'->>'systemObserved' = 'true'`,
      sql`${contentEvents.metadata}->'eventPolicy'->>'aiRelevant' = 'true'`,
      sql`${contentEvents.metadata}->'eventPolicy'->'operationalUsefulness'->>'eligible' is distinct from 'false'`)
    : options.before ? lt(contentEvents.lastSeenAt, options.before) : undefined)
    .orderBy(desc(contentEvents.lastSeenAt), desc(contentEvents.id));
  const policyEvents = (await (options.range ? query : query.limit(Math.min(5000, Math.max(boundedLimit * 10, boundedLimit)))))
    .filter((event) => {
      if (event.archivedAt) return false;
      const policy = eventPolicyMetadata(event.metadata);
      if (event.policyVersion !== INTELLIGENCE_POLICY_VERSION) return false;
      if (policy.version !== INTELLIGENCE_POLICY_VERSION) return false;
      if (policy.systemObserved !== true || policy.aiRelevant !== true) return false;
      const operationalUsefulness = record(policy.operationalUsefulness);
      if (operationalUsefulness.eligible === false) return false;
      return true;
    });
  if (!policyEvents.length) return [];

  const policyEventIds = policyEvents.map((event) => event.id);
  const policyMemberships = await db.select().from(contentEventClusterMembers)
    .where(inArray(contentEventClusterMembers.eventId, policyEventIds));
  const policyClusterIds = [...new Set(policyMemberships.map((item) => item.clusterId))];
  const policyClusters = policyClusterIds.length
    ? await db.select().from(contentEventClusters).where(inArray(contentEventClusters.id, policyClusterIds))
    : [];
  const primaryEventByCluster = new Map(policyClusters.map((item) => [item.id, item.primaryEventId]));
  const membershipByEvent = new Map(policyMemberships.map((item) => [item.eventId, item]));
  const events = policyEvents
    .filter((event) => {
      const membership = membershipByEvent.get(event.id);
      if (!membership) return true;
      return primaryEventByCluster.get(membership.clusterId) === event.id;
    })
    .slice(0, options.range ? undefined : boundedLimit);
  if (!events.length) return [];

  const selectedClusterIds = [...new Set(events.flatMap((event) => {
    const membership = membershipByEvent.get(event.id);
    return membership ? [membership.clusterId] : [];
  }))];
  const [selectedMemberships, analyses, expansionEvidence] = await Promise.all([
    selectedClusterIds.length
      ? db.select().from(contentEventClusterMembers)
          .where(inArray(contentEventClusterMembers.clusterId, selectedClusterIds))
      : Promise.resolve([]),
    selectedClusterIds.length
      ? db.select().from(contentEventClusterAnalyses)
          .where(inArray(contentEventClusterAnalyses.clusterId, selectedClusterIds))
      : Promise.resolve([]),
    db.select().from(contentEventExpansionEvidence)
      .where(inArray(contentEventExpansionEvidence.eventId, events.map((event) => event.id)))
  ]);
  const memberIdsByCluster = new Map<string, string[]>();
  for (const item of selectedMemberships) {
    const current = memberIdsByCluster.get(item.clusterId) ?? [];
    current.push(item.eventId);
    memberIdsByCluster.set(item.clusterId, current);
  }
  const memberEventIdsByPrimary = new Map<string, string[]>();
  for (const event of events) {
    const membership = membershipByEvent.get(event.id);
    if (!membership) {
      memberEventIdsByPrimary.set(event.id, [event.id]);
      continue;
    }
    memberEventIdsByPrimary.set(
      event.id,
      memberIdsByCluster.get(membership.clusterId) ?? [event.id]
    );
  }
  const evidenceEventIds = [...new Set([...memberEventIdsByPrimary.values()].flat())];

  const links = await db.select().from(contentEventRawItems)
    .where(inArray(contentEventRawItems.eventId, evidenceEventIds));
  const directRawIds = [...new Set(links.map((link) => link.rawItemId))];
  const expansionRawIds = [...new Set(expansionEvidence.map((item) => item.rawItemId))];
  const rawIds = [...new Set([...directRawIds, ...expansionRawIds])];
  const [raws, observations] = rawIds.length
    ? await Promise.all([
        db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds)),
        db.select().from(contentRawItemObservations).where(inArray(contentRawItemObservations.rawItemId, rawIds))
      ])
    : [[], []];
  const systemRawIds = new Set(
    observations.filter((item) => hasSystemCollectionHistory(item.metadata)).map((item) => item.rawItemId)
  );
  const sourceIds = [...new Set(raws.map((raw) => raw.sourceId))];
  const sources = sourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds))
    : [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const rawById = new Map(raws.map((raw) => [raw.id, raw]));
  const rawsByEvent = new Map<string, typeof raws>();
  for (const link of links) {
    const raw = rawById.get(link.rawItemId);
    if (!raw || !systemRawIds.has(raw.id)) continue;
    const current = rawsByEvent.get(link.eventId) ?? [];
    current.push(raw);
    rawsByEvent.set(link.eventId, current);
  }
  const clusterByEvent = new Map(policyMemberships.map((item) => [item.eventId, item.clusterId]));
  const analysisByCluster = new Map(analyses.map((item) => [item.clusterId, item]));
  const expansionByEvent = new Map<string, typeof expansionEvidence>();
  for (const item of expansionEvidence) {
    const current = expansionByEvent.get(item.eventId) ?? [];
    current.push(item);
    expansionByEvent.set(item.eventId, current);
  }

  const items = events.flatMap((event) => {
    const evidenceEventIdsForEvent = memberEventIdsByPrimary.get(event.id) ?? [event.id];
    const eventRaws = evidenceEventIdsForEvent.flatMap((memberEventId) => rawsByEvent.get(memberEventId) ?? []);
    if (!eventRaws.length) return [];
    const representative = [...eventRaws].sort((a, b) => {
      const sa = sourceById.get(a.sourceId);
      const sb = sourceById.get(b.sourceId);
      const aReferenceOnly = record(a.metadata).referenceOnly === true;
      const bReferenceOnly = record(b.metadata).referenceOnly === true;
      const pa = sa?.sourceType === "OFFICIAL" ? 0 : sa?.sourceType === "MEDIA" ? 1 : 2;
      const pb = sb?.sourceType === "OFFICIAL" ? 0 : sb?.sourceType === "MEDIA" ? 1 : 2;
      return Number(aReferenceOnly) - Number(bReferenceOnly) || pa - pb || toTime(b.publishedAt ?? b.collectedAt) - toTime(a.publishedAt ?? a.collectedAt);
    })[0];
    const source = sourceById.get(representative.sourceId);
    const policy = eventPolicyMetadata(event.metadata);
    const clusterId = clusterByEvent.get(event.id) ?? null;
    const analysis = clusterId ? analysisByCluster.get(clusterId) : null;
    const evidence = expansionByEvent.get(event.id) ?? [];
    const relevantExpansionEvidence = evidence.filter((item) => {
      const raw = rawById.get(item.rawItemId);
      if (!raw || !systemRawIds.has(raw.id)) return false;
      return evaluateEventEvidenceRelevance({
        eventTitle: event.title,
        candidateTitle: raw.title,
        candidateExcerpt: raw.excerpt
      }).pass;
    });
    const formalPracticalExpansionEvidence = relevantExpansionEvidence.filter((item) => {
      const raw = rawById.get(item.rawItemId);
      if (!raw) return false;
      const rawSource = sourceById.get(raw.sourceId);
      const sourceMetadata = record(rawSource?.metadata);
      return isFormalPracticalEvidenceSource({
        sourceEnabled: rawSource?.enabled === true,
        currentPortfolio: sourceMetadata.currentPortfolio === true,
        sourceUniverseRole: typeof sourceMetadata.sourceUniverseRole === "string" ? sourceMetadata.sourceUniverseRole : null,
        sourceReferenceOnly: sourceMetadata.referenceOnly === true,
        rawReferenceOnly: record(raw.metadata).referenceOnly === true,
        signalOnly: record(rawSource?.signalConfig).signalOnly === true
      });
    });
    const presentExpansionTypes = [...new Set(formalPracticalExpansionEvidence.map((item) => item.expansionType))];
    const practicalCoverageTypes = ["EXPERIENCE", "TUTORIAL", "USE_CASE", "WORK_IMPACT"];
    const actionablePracticalEvidence = formalPracticalExpansionEvidence.filter((item) => {
      if (!practicalCoverageTypes.includes(item.expansionType)) return false;
      const raw = rawById.get(item.rawItemId);
      if (!raw?.originalUrl) return false;
      const evidenceMetadata = record(item.metadata);
      const matchedTitleSpecificAnchors = Array.isArray(evidenceMetadata.matchedTitleSpecificAnchors) ? evidenceMetadata.matchedTitleSpecificAnchors.length : 0;
      const matchedTitleVersionAnchors = Array.isArray(evidenceMetadata.matchedTitleVersionAnchors) ? evidenceMetadata.matchedTitleVersionAnchors.length : 0;
      const subjectTitleMatchCount = Number(evidenceMetadata.subjectTitleMatchCount) || 0;
      const subjectMatchCount = Number(evidenceMetadata.subjectMatchCount) || 0;
      const strongEventRelation =
        matchedTitleVersionAnchors > 0 ||
        matchedTitleSpecificAnchors > 0 ||
        (subjectTitleMatchCount > 0 && item.relevanceScore >= 70) ||
        (subjectMatchCount >= 2 && item.relevanceScore >= 85);
      if (!strongEventRelation) return false;
      return evaluatePracticeMaterials(raw).eligible && evaluatePracticalEvidenceActionability({ expansionType: item.expansionType, title: raw.title, excerpt: raw.excerpt }).actionable;
    });
    const chinesePracticalEvidenceCount = formalPracticalExpansionEvidence.filter((item) => practicalCoverageTypes.includes(item.expansionType) && item.language === "ZH").length;
    const actionableChinesePracticalEvidenceCount = actionablePracticalEvidence.filter((item) => item.language === "ZH").length;
    const expansionPracticeLinks = [...new Map(actionablePracticalEvidence.flatMap((item) => {
      const raw = rawById.get(item.rawItemId);
      if (!raw?.originalUrl) return [];
      const rawSource = sourceById.get(raw.sourceId);
      const sourceName = originPublisher(raw) ?? rawSource?.name ?? raw.sourceId;
      const key = `${sourceName.normalize("NFKC").toLocaleLowerCase()}|${raw.originalUrl}`;
      return [[key, { sourceName, originKey: sourceName.normalize("NFKC").toLocaleLowerCase(), materialQuality: evaluatePracticeMaterials(raw), title: raw.title, excerpt: raw.excerpt, presentation: buildContentPresentationEnrichment({ eventTitle: event.title, eventSummary: event.summary, representativeRaw: { title: raw.title, excerpt: raw.excerpt, originalUrl: raw.originalUrl, metadata: raw.metadata }, whyItMatters: null, allowEventSummaryFallback: false }), originalUrl: raw.originalUrl, publishedAt: raw.publishedAt, expansionType: item.expansionType }] as const];
    })).values()];
    const practicalEvidenceLinks=expansionPracticeLinks;
    const actionablePracticalEvidenceCount=practicalEvidenceLinks.length;
    const actionablePracticalOriginCount=new Set(practicalEvidenceLinks.map(link=>link.originKey)).size;
    const actionablePracticalTypeCount=new Set(practicalEvidenceLinks.map(link=>link.expansionType)).size;
    const missingExpansionTypes = practicalCoverageTypes.filter((item) => !presentExpansionTypes.includes(item));
    const scores = record(policy.scores);
    const officialNewsScores = record(scores.officialNews);
    const hotspotScores = record(scores.hotspot);
    const factSourceCount = Number(policy.factSourceCount) || 0;
    const independentOriginCount = Number(policy.independentOriginCount) || 0;
    const sourceCount = new Set(eventRaws.map((raw) => raw.sourceId)).size;
    const publicReportRaws = [...new Map(eventRaws
      .filter((raw) => {
        const rawSource = sourceById.get(raw.sourceId);
        const metadata = record(raw.metadata);
        const hasResolvedOriginalPublisher = Boolean(originPublisher(raw));
        const directPublicReport = metadata.referenceOnly !== true && record(rawSource?.metadata).referenceOnly !== true && record(rawSource?.signalConfig).signalOnly !== true;
        return Boolean(raw.originalUrl) && (directPublicReport || hasResolvedOriginalPublisher);
      })
      .map((raw) => [
        (originPublisher(raw) ?? sourceById.get(raw.sourceId)?.name ?? raw.sourceId).normalize("NFKC").toLocaleLowerCase(),
        raw
      ])).values()];
    const storyReportRaws = eventRaws.filter((raw) => {
      const rawSource = sourceById.get(raw.sourceId);
      const metadata = record(raw.metadata);
      const hasResolvedOriginalPublisher = Boolean(originPublisher(raw));
      const directPublicReport = metadata.referenceOnly !== true && record(rawSource?.metadata).referenceOnly !== true && record(rawSource?.signalConfig).signalOnly !== true;
      return Boolean(raw.originalUrl) && (directPublicReport || hasResolvedOriginalPublisher);
    });
    const hotParticipants = [...new Map(eventRaws.flatMap((raw) => {
      if (isMultiNewsRoundup(raw.title)) return [];
      const rawSource = sourceById.get(raw.sourceId);
      const origin = originPublisher(raw);
      const author = raw.author?.trim() ?? "";
      const isAggregatorWrapper =
        (record(raw.metadata).referenceOnly === true || record(rawSource?.metadata).referenceOnly === true) &&
        !origin && !author;
      if (isAggregatorWrapper) return [];
      const name = canonicalHotParticipantName(origin || author || rawSource?.name || raw.sourceId);
      const key = name.normalize("NFKC").toLocaleLowerCase();
      return [[key, { name, platform: raw.platform, role: rawSource?.sourceType ?? "UNKNOWN" }] as const];
    })).values()];
    const aiPracticeParticipants = [...new Map(eventRaws.flatMap((raw) => {
      const rawSource = sourceById.get(raw.sourceId);
      const name = aiHotspotPracticePublisher({
        title: raw.title,
        originalUrl: raw.originalUrl,
        signalOnly: record(rawSource?.signalConfig).signalOnly === true,
        referenceOnly: record(raw.metadata).referenceOnly === true || record(rawSource?.metadata).referenceOnly === true,
        originPublisher: originPublisher(raw),
        author: raw.author,
        sourceName: rawSource?.name
      });
      if (!name) return [];
      const canonical = canonicalHotParticipantName(name);
      return [[canonical.normalize("NFKC").toLocaleLowerCase(), { name: canonical, role: rawSource?.sourceType ?? "UNKNOWN" }] as const];
    })).values()];
    const topicMomentum = calculateTopicMomentum({
      firstSeenAt: event.firstSeenAt,
      raws: eventRaws.map((raw) => {
        const rawSource = sourceById.get(raw.sourceId);
        return {
          title: raw.title,
          sourceId: raw.sourceId,
          sourceType: rawSource?.sourceType ?? "UNKNOWN",
          sourceName: originPublisher(raw) ?? rawSource?.name ?? raw.sourceId,
          platform: raw.platform,
          author: raw.author,
          publishedAt: raw.publishedAt,
          collectedAt: raw.collectedAt,
          metadata: raw.metadata,
          referenceOnly: record(raw.metadata).referenceOnly === true || record(rawSource?.metadata).referenceOnly === true,
          signalOnly: record(rawSource?.signalConfig).signalOnly === true,
          platformMetrics: raw.platformMetrics
        };
      }),
      evidence
    });
    const heatRaws = eventRaws.map((raw) => {
      const rawSource = sourceById.get(raw.sourceId);
      const resolvedOrigin = (record(raw.metadata).referenceOnly === true || record(rawSource?.metadata).referenceOnly === true) && Boolean(originPublisher(raw));
      return {
        sourceId: raw.sourceId,
        sourceType: rawSource?.sourceType ?? "UNKNOWN",
        sourceName: originPublisher(raw) ?? rawSource?.name ?? raw.sourceId,
        platform: raw.platform,
        author: raw.author,
        publishedAt: raw.publishedAt,
        metadata: raw.metadata,
        sourceMetadata: rawSource?.metadata,
        canonicalUrl: rawSource?.canonicalUrl,
        referenceOnly: record(raw.metadata).referenceOnly === true || record(rawSource?.metadata).referenceOnly === true,
        signalOnly: record(rawSource?.signalConfig).signalOnly === true,
        resolvedOriginPublisher: resolvedOrigin
      };
    });
    const heatShadow = calculateAihotHeatShadow({ raws: heatRaws });
    const storyNow = new Date(Math.floor(Date.now() / (6 * 3_600_000)) * 6 * 3_600_000);
    const storyHeatSeries = Array.from({ length: 9 }, (_, index) => {
      const hoursAgo = 48 - index * 6;
      const at = new Date(storyNow.getTime() - hoursAgo * 3_600_000);
      const point = calculateAihotHeatShadow({ raws: heatRaws, now: at });
      return { at: at.toISOString(), score: point.score, participantCount: point.participantCount, editorialParticipantCount: point.editorialParticipantCount, signalParticipantCount: point.signalParticipantCount };
    });
    // Hotness measures discussion activity only. Verification remains visible as a separate fact-quality dimension.
    const contentBoundary = { roundup: isMultiNewsRoundup(event.title) };
    const currentHotPresentationEligible = topicMomentum.eligible && !contentBoundary.roundup;
    const presentation = buildContentPresentationEnrichment({
      eventTitle: event.title,
      eventSummary: event.summary,
      representativeRaw: {
        title: representative.title,
        excerpt: representative.excerpt,
        originalUrl: representative.originalUrl,
        metadata: representative.metadata
      },
      whyItMatters: analysis?.whyItMatters ?? null
    });
    const representativeFreshnessAt =
      representative.publishedAt &&
      representative.publishedAt.getTime() <= representative.collectedAt.getTime() + 15 * 60 * 1000
        ? representative.publishedAt
        : representative.collectedAt;
    const boleCuration = evaluateBoleDailyCuration({
      ageHours: Math.max(0, (Date.now() - representativeFreshnessAt.getTime()) / 3_600_000),
      aiRelevant: policy.aiRelevant === true,
      verificationStatus: event.verificationStatus,
      practicalEvidenceCount: formalPracticalExpansionEvidence.filter((item) => practicalCoverageTypes.includes(item.expansionType)).length,
      independentOriginCount,
      factSourceCount,
      sourceQuality: Number(officialNewsScores.sourceQuality) || 0,
      changeMagnitude: typeof policy.changeMagnitude === "string" ? policy.changeMagnitude : null
    });
    const curated = boleCuration.selected;
    const curationReasons = boleCuration.reasons;
    const story = buildEventStoryReadModel({
      eventId: event.id,
      title: event.title,
      titleZh: presentation.displayTitleZh,
      summary: event.summary ?? representative.excerpt,
      summaryZh: presentation.displaySummaryZh,
      reports: storyReportRaws.map((raw) => {
        const rawSource = sourceById.get(raw.sourceId);
        const resolvedOrigin = (record(raw.metadata).referenceOnly === true || record(rawSource?.metadata).referenceOnly === true) && Boolean(originPublisher(raw));
        const reportPresentation = buildContentPresentationEnrichment({ eventTitle: event.title, eventSummary: event.summary, representativeRaw: { title: raw.title, excerpt: raw.excerpt, originalUrl: raw.originalUrl, metadata: raw.metadata }, whyItMatters: null, allowEventSummaryFallback: false });
        return { reportId: raw.id, sourceId: raw.sourceId, sourceType: rawSource?.sourceType ?? "UNKNOWN", sourceName: originPublisher(raw) ?? rawSource?.name ?? raw.sourceId, platform: raw.platform, canonicalUrl: rawSource?.canonicalUrl, author: raw.author, metadata: raw.metadata, sourceMetadata: rawSource?.metadata, referenceOnly: record(raw.metadata).referenceOnly === true || record(rawSource?.metadata).referenceOnly === true, signalOnly: record(rawSource?.signalConfig).signalOnly === true, resolvedOriginPublisher: resolvedOrigin, title: raw.title, titleZh: reportPresentation.displayTitleZh, excerpt: raw.excerpt, excerptZh: reportPresentation.displaySummaryZh, originalUrl: raw.originalUrl, publishedAt: raw.publishedAt };
      }),
      heatSeries: storyHeatSeries
    });

    return [{
      rawItemId: representative.id,
      eventId: event.id,
      eventLastSeenAt: event.lastSeenAt,
      timelineAt: event.eventAt ?? event.firstSeenAt,
      clusterId,
      title: event.title,
      excerpt: event.summary ?? representative.excerpt,
      author: representative.author,
      originalUrl: representative.originalUrl,
      presentation,
      boleCuration,
      publishedAt: representative.publishedAt,
      collectedAt: representative.collectedAt,
      platform: representative.platform,
      sourceId: source?.id ?? representative.sourceId,
      sourceName: originPublisher(representative) ?? source?.name ?? representative.sourceId,
      sourceType: source?.sourceType ?? "UNKNOWN",
      collectionMethod: source?.collectionMethod ?? "UNKNOWN",
      eventType: event.eventType,
      category: radarCategory(event.eventType, eventRaws, sourceById),
      structure: {
        category: radarCategory(event.eventType, eventRaws, sourceById),
        tags: [...new Set([...(presentation.tags ?? []), event.eventType, ...eventRaws.flatMap((raw) => {
          const metadata = record(raw.metadata);
          const resolved = Array.isArray(metadata.resolvedEntities) ? metadata.resolvedEntities : [];
          return resolved.flatMap((entity) => { const row = record(entity); return typeof row.displayNameZh === "string" ? [row.displayNameZh] : []; });
        })].filter((value): value is string => typeof value === "string" && Boolean(value)))].slice(0, 12),
        coreFacts: analysis && Array.isArray(analysis.coreFacts) ? analysis.coreFacts : [],
        factsAuthority: analysis ? "AI_EXTRACTED_FROM_FACT_SOURCES" as const : "NOT_EVALUATED" as const,
        newsFact: presentation.extractedFact,
        contentCategory: presentation.tags?.[0] ?? null,
        writingAuthority: "PRESENTATION_ONLY" as const
      },
      verificationStatus: event.verificationStatus,
      generationReadiness: event.generationReadiness,
      factSourceCount,
      signalSourceCount: Number(policy.signalSourceCount) || 0,
      changeMagnitude: policy.changeMagnitude ?? null,
      scores: policy.scores ?? {},
      leadTime: policy.leadTime ?? {},
      sourceCount,
      discoveryStatus: event.discoveryStatus,
      publicReadableSourceCount: publicReportRaws.length,
      hotParticipants,
      aiPracticeParticipants,
      practicalEvidenceLinks,
      contentBoundary,
      curation: {
        curated,
        score: boleCuration.score,
        threshold: boleCuration.threshold,
        tier: boleCuration.tier,
        gatePassed: boleCuration.gatePassed,
        components: boleCuration.components,
        reasons: curationReasons,
        recommendationReason: boleCuration.recommendationReason
      },
      currentHot: {
        eligible: currentHotPresentationEligible,
        formalRanking: true as const,
        authority: "PRESENTATION_ONLY" as const,
        status: topicMomentum.status,
        score: topicMomentum.score,
        criteria: topicMomentum.criteria
      },
      topicMomentum,
      heatShadow,
      story,
      evidenceScore: {
        value: null,
        status:
          event.verificationStatus === "CONFIRMED_OFFICIAL" ||
          event.verificationStatus === "CONFIRMED_MEDIA"
            ? "TRUSTED" as const
            : "UNVERIFIED" as const,
        factSourceCount,
        independentOriginCount
      },

      opcValue: analysis ? {
        status: "AVAILABLE" as const,
        value: null,
        whyItMatters: analysis.whyItMatters,
        suggestedContentTypes: Array.isArray(analysis.suggestedContentTypes) ? analysis.suggestedContentTypes : [],
        authority: "AI_ANALYSIS_EXPLANATION_ONLY" as const
      } : {
        status: "NOT_EVALUATED" as const,
        value: null,
        whyItMatters: null,
        suggestedContentTypes: [] as string[],
        authority: "NOT_EVALUATED" as const
      },
      sourceManagedExpansionRuntime: sourceManagedExpansionRuntime(event.metadata),
      coverage: {
        evidenceCount: evidence.length,
        practicalEvidenceCount: formalPracticalExpansionEvidence.filter((item) => practicalCoverageTypes.includes(item.expansionType)).length,
        actionablePracticalEvidenceCount,
        actionablePracticalOriginCount,
        actionablePracticalTypeCount,
        chinesePracticalEvidenceCount,
        actionableChinesePracticalEvidenceCount,
        presentExpansionTypes,
        missingExpansionTypes,
        needsExpansion: missingExpansionTypes.length > 0,
        shadowSignalMax: Math.max(
          0,
          ...evidence.map((item) => Number(item.shadowSignalScore) || 0)
        ),
        authority: "REFERENCE_ONLY" as const
      },
      hotspotEligible: policy.hotspotEligible === true,
      officialNewsEligible: policy.officialNewsEligible === true,
      evidenceLinks: publicReportRaws.slice(0, 50).map((raw) => ({
        sourceId: raw.sourceId,
        sourceName: originPublisher(raw) ?? sourceById.get(raw.sourceId)?.name ?? raw.sourceId,
        sourceType: sourceById.get(raw.sourceId)?.sourceType ?? "UNKNOWN",
        sourceMetadata: sourceById.get(raw.sourceId)?.metadata ?? {},
        rawMetadata: raw.metadata,
        title: raw.title,
        presentation: buildContentPresentationEnrichment({
          eventTitle: event.title,
          eventSummary: event.summary,
          representativeRaw: {
            title: raw.title,
            excerpt: raw.excerpt,
            originalUrl: raw.originalUrl,
            metadata: raw.metadata
          },
          whyItMatters: null
          ,allowEventSummaryFallback: false
        }),
        originalUrl: raw.originalUrl,
        publishedAt: raw.publishedAt
      }))
    }];
  });
  return attachRelatedEventStories(items);
}

async function listPolicyEventCandidates(
  kind: "LATEST" | "OFFICIAL_NEWS" | "UNVERIFIED",
  limit = 100
) {
  const bounded = Math.max(1, Math.min(500, limit));
  const pool = await listPolicyEventCandidatePool(Math.max(bounded * 3, 120));
  return pool
    .filter((item) => {
      if (kind === "LATEST") {
        return item.verificationStatus === "CONFIRMED_OFFICIAL" || item.verificationStatus === "CONFIRMED_MEDIA";
      }
      if (kind === "OFFICIAL_NEWS") return item.officialNewsEligible;
      return item.verificationStatus === "UNVERIFIED";
    })
    .slice(0, bounded);
}

export async function listOfficialNewsCandidates(limit = 100) {
  return listPolicyEventCandidates("OFFICIAL_NEWS", limit);
}

export async function listCurrentHotTodayIntelligence(limit = 100) {
  const bounded = Math.max(1, Math.min(500, limit));
  const pool = await listRadarTimelineWindow(7);
  return pool
    .filter((item) => item.currentHot.eligible)
    .sort((a, b) =>
      b.topicMomentum.score - a.topicMomentum.score ||
      Number(b.topicMomentum.status === "SUSTAINED") - Number(a.topicMomentum.status === "SUSTAINED") ||
      b.topicMomentum.independentSourceCount - a.topicMomentum.independentSourceCount ||
      b.topicMomentum.activeDayCount - a.topicMomentum.activeDayCount ||
      toTime(b.publishedAt ?? b.collectedAt) - toTime(a.publishedAt ?? a.collectedAt)
    )
    .slice(0, bounded);
}

export async function listUnverifiedEventCandidates(limit = 100) {
  return listPolicyEventCandidates("UNVERIFIED", limit);
}

export async function listLatestTodayIntelligence(limit = 100) {
  return listPolicyEventCandidates("LATEST", limit);
}

function buildDiscoveryExpansionCandidatesFromPools(
  latest: Awaited<ReturnType<typeof listPolicyEventCandidates>>,
  unverified: Awaited<ReturnType<typeof listPolicyEventCandidates>>,
  limit: number
) {
  const bounded = Math.max(1, Math.min(500, limit));
  const byEvent = new Map([...latest, ...unverified].map((item) => [item.eventId, item]));

  const now = Date.now();
  return [...byEvent.values()]
    .filter((item) => {
      if (!item.coverage.needsExpansion) return false;
      const runtime = item.sourceManagedExpansionRuntime;
      if (!runtime.lastAttemptAt) return true;
      const cooldownHours = runtime.status === "FAILED" ? 1 : 6;
      return now - toTime(runtime.lastAttemptAt) >= cooldownHours * 3_600_000;
    })
    .map((item) => {
      const confirmed =
        item.verificationStatus === "CONFIRMED_OFFICIAL" ||
        item.verificationStatus === "CONFIRMED_MEDIA";
      const verificationFollowUp = item.verificationStatus === "UNVERIFIED";
      const priority =
        (item.verificationStatus === "CONFIRMED_OFFICIAL" ? 100 :
          item.verificationStatus === "CONFIRMED_MEDIA" ? 90 : 70) +
        (item.sourceManagedExpansionRuntime.status === "NEVER" ? 24 : 0) +
        (item.coverage.practicalEvidenceCount === 0 ? 12 : 0) +
        ((item.coverage.actionablePracticalOriginCount ?? 0) < 2 ? 12 : 0) +
        (item.evidenceScore.independentOriginCount < 2 ? 10 : 0) +
        ((item.publicReadableSourceCount ?? 0) < 2 ? 10 : 0) +
        (item.topicMomentum.independentParticipantCount < 3 ? 10 : 0) +
        Math.min(16, item.coverage.missingExpansionTypes.length * 4) +
        (item.topicMomentum.phase === "MOMENTUM_WINDOW" ? 8 : 0) +
        Math.min(8, Math.round(item.coverage.shadowSignalMax / 15));

      return {
        ...item,
        discoveryExpansion: {
          candidate: true as const,
          priority,
          trigger: confirmed
            ? "CONFIRMED_EVENT_FOLLOW_UP" as const
            : "UNVERIFIED_VERIFICATION_FOLLOW_UP" as const,
          goals: [
            ...(verificationFollowUp ? ["VERIFICATION_SUPPORT" as const] : []),
            "PRACTICAL_COVERAGE" as const,
            "CREATOR_MOMENTUM_COVERAGE" as const
          ],
          chineseFirst: true as const,
          bounded: true as const,
          formalVerificationPromotion: false as const,
          formalHotspotPromotion: false as const,
          topicMomentumAuthority: "PRESENTATION_ONLY" as const,
          opcValueAuthority: "CLUSTER_ANALYSIS_ONLY" as const
        }
      };
    })
    .sort((a, b) =>
      b.discoveryExpansion.priority - a.discoveryExpansion.priority ||
      toTime(b.publishedAt ?? b.collectedAt) - toTime(a.publishedAt ?? a.collectedAt)
    )
    .slice(0, bounded);
}

// Calendar timeline never paginates by a mutable/non-unique lastSeenAt.
export async function listRadarCalendarRange(from: Date, to: Date, asOf = new Date()) {
  return getDatabase().transaction(async tx => {
    const pool = await listPolicyEventCandidatePool(1000, { range: { from, to, asOf }, executor: tx as unknown as ReturnType<typeof getDatabase> });
    return selectCalendarItems(pool, { from, to });
  }, { isolationLevel: "repeatable read", accessMode: "read only" });
}

export async function listRadarTimelinePage(input: { windowDays?: number; day?: string; asOf?: Date } = {}) {
  const asOf = input.asOf ?? new Date();
  const window = calendarWindow(asOf, input.windowDays ?? 7);
  const from = input.day ? dayStart(input.day) : window.from;
  const to = input.day ? new Date(Math.min(from.getTime() + 86_400_000, asOf.getTime())) : asOf;
  const items = await listRadarCalendarRange(from, to, asOf);
  const [oldest] = await getDatabase().select({ at: sql<Date | null>`min(coalesce(${contentEvents.eventAt}, ${contentEvents.firstSeenAt}))` }).from(contentEvents);
  // Reuse the complete visibility rule: excluded rows must never keep pagination alive.
  // SQL policy predicates above avoid hydrating unrelated historical events.
  const history = oldest?.at && new Date(oldest.at).getTime() < from.getTime()
    ? await listRadarCalendarRange(new Date(oldest.at), from, asOf) : [];
  const nextDay = nextHistoryDay(history, from);
  return { items, total: items.length, day: input.day ?? null, asOf: asOf.toISOString(),
    nextCursor: nextDay, hasMore: nextDay !== null };
}

export async function listRadarTimelineWindow(windowDays = 7, asOf = new Date()) {
  const window = calendarWindow(asOf, windowDays);
  return listRadarCalendarRange(window.from, window.to, asOf);
}

export async function listDiscoveryExpansionCandidates(limit = 100) {
  const bounded = Math.max(1, Math.min(500, limit));
  const [latest, unverified] = await Promise.all([
    listPolicyEventCandidates("LATEST", Math.max(bounded, 100)),
    listPolicyEventCandidates("UNVERIFIED", Math.max(bounded, 100))
  ]);
  return buildDiscoveryExpansionCandidatesFromPools(latest, unverified, bounded);
}

export async function getTodayIntelligenceOverview() {
  const [currentHot, latest, aiHotspotPractices, unverified, expansionCandidates, signalReadiness] = await Promise.all([
    listCurrentHotTodayIntelligence(10),
    listLatestTodayIntelligence(5),
    listAiHotspotPractices(),
    listUnverifiedEventCandidates(5),
    listDiscoveryExpansionCandidates(8),
    getTodayIntelligenceSignalReadiness()
  ]);
  return {
    generatedAt: new Date().toISOString(),
    currentHot,
    latest,
    aiHotspotPractices,
    unverified,
    expansionCandidates,
    signalReadiness,
    discoveryExpansionStatus: "SOURCE_MANAGEMENT_SYSTEM_COLLECTION_ONLY" as const,
    hotspotSelectionStatus: "EVENT_MOMENTUM_RISING_AND_SUSTAINED" as const,
    productScope: "HOT_TRACKING_V1" as const
  };
}
