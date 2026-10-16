import "server-only";

import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentEntities,
  contentEventExpansionEvidence,
  contentEventRawItems,
  contentEvents,
  contentExpansionRuns,
  contentRawItems,
  contentSources
} from "../db/schema";
import { fetchPublicJson } from "./collection-runner";
import {
  creatorExpansionProvidersFromRegistry,
  getCurrentCollectionCapabilityHealthSnapshot,
  healthyCreatorExpansionProviders
} from "./collection-capability-router";
import { ingestRawItem } from "./discovery";
import {
  EVENT_EXPANSION_CAPABILITIES,
  EVENT_EXPANSION_TYPES,
  buildCreatorFirstEventExpansionQueryPlan,
  buildEventExpansionQueryPlan,
  calculateExpansionShadowSignal,
  classifyEventExpansionCandidate,
  selectEventExpansionEvidence,
  type EventExpansionType
} from "./event-expansion";
import {
  collectSearchDiscovery,
  SEARCH_DISCOVERY_PROVIDERS,
  type SearchDiscoveryProvider
} from "./search-discovery";
import { collectTrendDiscovery } from "./trend-discovery";
import {
  DEFAULT_INITIAL_BUDGET,
  DEFAULT_MAX_BUDGET,
  evaluateAdaptiveExpansionBudget,
  type ExpansionBudgetSample
} from "./event-expansion-budget";
import {
  evaluateDeterministicQualityGate,
  evaluateEventEvidenceRelevance,
  evaluatePollutionGate,
  resolveIndependentOrigins
} from "./pollution-syndication-gate";
import { listDiscoveryExpansionCandidates } from "./intelligence-read-model";
import { isFormalPracticalEvidenceSource } from "./content-evidence-signals";
import { resolveSourceAcquisitionPlan } from "./source-acquisition-plan";
import {aiHotspotPracticeSubject,shouldExpandAiHotspotPractice,evaluateAiHotspotPractice} from "./ai-hotspot-practice";
import {evaluatePublicPracticeAccess} from "./public-practice-access";

const DEFAULT_WINDOW_HOURS = 168;
const DEFAULT_RESULT_LIMIT = 20;
const MAX_QUERIES = 4;
const MAX_EVIDENCE = 10;
export const SOURCE_MANAGED_EXPANSION_RUNTIME_VERSION = "source-managed-expansion-runtime-v1";
export const SOURCE_MANAGED_EXPANSION_SUCCESS_COOLDOWN_HOURS = 6;
export const SOURCE_MANAGED_EXPANSION_FAILURE_COOLDOWN_HOURS = 1;

type ExpansionInput = {
  managedSourceId?: string;
  practiceTitle?: string;
  providers?: unknown;
  windowHours?: unknown;
  resultLimit?: unknown;
  maxQueries?: unknown;
  expansionTypes?: unknown;
};

type ExpansionDependencies = {
  fetchJson?: (url: string) => Promise<unknown>;
  fetchImpl?: typeof fetch;
};

const EVENT_EXPANSION_SEARCH_PROVIDERS = [
  ...SEARCH_DISCOVERY_PROVIDERS,
  "BILIBILI_SEARCH",
  "YOUTUBE_SEARCH"
] as const;
type EventExpansionSearchProvider = (typeof EVENT_EXPANSION_SEARCH_PROVIDERS)[number];
export const DEFAULT_EVENT_EXPANSION_SEARCH_PROVIDERS: EventExpansionSearchProvider[] =
  creatorExpansionProvidersFromRegistry();

function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function resolveRequestedExpansionTypes(value: unknown): EventExpansionType[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().toUpperCase())
      .filter((item): item is EventExpansionType =>
        EVENT_EXPANSION_TYPES.includes(item as EventExpansionType)
      )
  )];
}

async function resolveProviders(value: unknown): Promise<EventExpansionSearchProvider[]> {
  if (!Array.isArray(value) || value.length === 0) {
    const snapshot = await getCurrentCollectionCapabilityHealthSnapshot();
    return healthyCreatorExpansionProviders(snapshot);
  }
  const providers = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toUpperCase())
    .filter((item): item is EventExpansionSearchProvider =>
      EVENT_EXPANSION_SEARCH_PROVIDERS.includes(item as EventExpansionSearchProvider)
    );
  return [...new Set(providers)].slice(0, EVENT_EXPANSION_SEARCH_PROVIDERS.length);
}

function errorCode(error: unknown) {
  if (error instanceof Error && /^[A-Z0-9_:-]+$/.test(error.message)) return error.message;
  return "EXPANSION_FAILED";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1500) : String(error).slice(0, 1500);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function isManagedPracticeSearchReady(source: Pick<typeof contentSources.$inferSelect, "enabled" | "status" | "collectionMethod" | "platform" | "providerRef" | "canonicalUrl" | "collectionConfig" | "metadata">) {
  const config = record(source.collectionConfig);
  const plan = resolveSourceAcquisitionPlan(source);
  return source.enabled && source.status === "ACTIVE" && record(source.metadata).currentPortfolio === true &&
    config.practiceExpansionEnabled === true &&
    ["BILIBILI_SEARCH", "YOUTUBE_SEARCH"].includes(String(config.practiceExpansionProvider ?? config.provider ?? source.providerRef)) &&
    ["AUTO_READY", "CONDITIONAL"].includes(String(record(record(source.metadata).runtimeQualification).effectiveQualification)) &&
    plan.routes.some(route => route.kind === "SEARCH_DISCOVERY" && route.enabled && route.explicit && route.serverRuntimeSupported);
}

function stringList(value: unknown, limit = 30) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim())
    .slice(0, limit);
}

function expansionSourceDefinition(provider: EventExpansionSearchProvider) {
  if (provider === "GITHUB_SEARCH") {
    return {
      id: "source_expansion_github_search",
      name: "GitHub Search · Event Expansion",
      platform: "GITHUB",
      authorityScore: 75
    };
  }
  if (provider === "BILIBILI_SEARCH") {
    return {
      id: "source_expansion_bilibili_search",
      name: "B站 Search · Event Expansion",
      platform: "BILIBILI",
      authorityScore: 55
    };
  }
  if (provider === "YOUTUBE_SEARCH") {
    return {
      id: "source_expansion_youtube_search",
      name: "YouTube Search · Event Expansion",
      platform: "YOUTUBE",
      authorityScore: 62
    };
  }
  return {
    id: "source_expansion_hn_algolia",
    name: "HN Algolia · Event Expansion",
    platform: "HACKER_NEWS",
    authorityScore: 65
  };
}

export async function ensureExpansionSource(provider: EventExpansionSearchProvider) {
  const db = getDatabase();
  const definition = expansionSourceDefinition(provider);
  const [existing] = await db.select().from(contentSources).where(eq(contentSources.id, definition.id)).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(contentSources)
    .values({
      id: definition.id,
      name: definition.name,
      sourceType: "DISCOVERY",
      canonicalUrl: null,
      providerRef: provider,
      status: "ACTIVE",
      platform: definition.platform,
      collectionMethod: "SEARCH",
      enabled: true,
      authorityScore: definition.authorityScore,
      topics: ["event-expansion"],
      collectionConfig: { provider, systemManaged: true },
      signalConfig: {},
      metadata: { systemManaged: true, purpose: "EVENT_EXPANSION" }
    })
    .returning();
  return created;
}

function cleanBilibiliText(value: unknown) {
  return typeof value === "string"
    ? value.replace(/<[^>]+>/g, "").replace(/&(?:amp|lt|gt|quot|#39);/g, " ").replace(/\s+/g, " ").trim()
    : "";
}

function parseBilibiliSearch(payload: unknown) {
  const data = record(record(payload).data);
  const sections = Array.isArray(data.result) ? data.result : [];
  const videoSection = sections.find((section) => record(section).result_type === "video");
  const rows = Array.isArray(record(videoSection).data) ? record(videoSection).data as unknown[] : [];
  return rows.flatMap((raw) => {
    const item = record(raw);
    const bvid = typeof item.bvid === "string" ? item.bvid.trim() : "";
    const title = cleanBilibiliText(item.title);
    if (!bvid || !title) return [];
    const timestamp = typeof item.pubdate === "number" ? item.pubdate : Number(item.pubdate);
    return [{
      externalId: "bilibili:" + bvid,
      originalUrl: "https://www.bilibili.com/video/" + encodeURIComponent(bvid),
      title,
      author: typeof item.author === "string" ? item.author : null,
      excerpt: cleanBilibiliText(item.description) || null,
      publishedAt: Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp * 1000).toISOString() : null,
      platformMetrics: {
        views: typeof item.play === "number" ? item.play : Number(item.play) || null,
        likes: typeof item.like === "number" ? item.like : Number(item.like) || null,
        favorites: typeof item.favorites === "number" ? item.favorites : Number(item.favorites) || null,
        comments: typeof item.review === "number" ? item.review : Number(item.review) || null,
        danmaku: typeof item.video_review === "number" ? item.video_review : Number(item.video_review) || null
      },
      metadata: {
        collector: "search",
        searchProvider: "BILIBILI_SEARCH",
        creatorIdentity: item.mid ? {platform:"BILIBILI",id:String(item.mid),url:"https://space.bilibili.com/" + String(item.mid)} : null,
        sourceMode: "PUBLIC_SEARCH_BEST_EFFORT",
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

export async function collectEventExpansionSearch(
  provider: EventExpansionSearchProvider,
  query: string,
  windowHours: number,
  resultLimit: number,
  dependencies: Required<Pick<ExpansionDependencies, "fetchJson">> & Pick<ExpansionDependencies, "fetchImpl">
) {
  if (provider === "BILIBILI_SEARCH") {
    const url = new URL("https://api.bilibili.com/x/web-interface/search/all/v2");
    url.searchParams.set("keyword", query);
    url.searchParams.set("page", "1");
    const payload = await dependencies.fetchJson(url.toString());
    const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
    const items = parseBilibiliSearch(payload)
      .filter((item) => !item.publishedAt || new Date(item.publishedAt).getTime() >= cutoff)
      .slice(0, resultLimit);
    return { requestUrl: url.toString(), items };
  }
  if (provider === "YOUTUBE_SEARCH") {
    const search = await collectTrendDiscovery(
      {
        provider: "YOUTUBE_AI_TREND",
        searchQuery: query,
        windowHours,
        resultLimit,
        minStars: 0
      },
      dependencies.fetchJson,
      { fetchImpl: dependencies.fetchImpl }
    );
    return { requestUrl: search.requestUrl, items: search.items };
  }
  return collectSearchDiscovery({ provider, searchQuery: query, windowHours, resultLimit }, dependencies.fetchJson);
}

type EventExpansionQueryPlanLike = {
  queries?: ReturnType<typeof buildEventExpansionQueryPlan>["queries"];
  chineseQueries?: ReturnType<typeof buildEventExpansionQueryPlan>["chineseQueries"];
  overseasQueries?: ReturnType<typeof buildEventExpansionQueryPlan>["overseasQueries"];
  creatorQueries?: ReturnType<typeof buildCreatorFirstEventExpansionQueryPlan>["creatorQueries"];
  chineseCreatorQueries?: ReturnType<typeof buildCreatorFirstEventExpansionQueryPlan>["chineseCreatorQueries"];
  overseasCreatorQueries?: ReturnType<typeof buildCreatorFirstEventExpansionQueryPlan>["overseasCreatorQueries"];
};

export function providerQueryPlan(
  provider: EventExpansionSearchProvider,
  plan: EventExpansionQueryPlanLike,
  maxQueries: number
) {
  if (provider === "YOUTUBE_SEARCH") {
    return (plan.overseasCreatorQueries ?? plan.overseasQueries ?? []).slice(0, maxQueries);
  }
  if (provider === "BILIBILI_SEARCH") {
    return (plan.chineseCreatorQueries ?? plan.chineseQueries ?? []).slice(0, maxQueries);
  }
  return (plan.overseasQueries ?? []).slice(0, maxQueries);
}

export async function listEventExpansionRuns(eventId: string, limit = 40) {
  return getDatabase()
    .select()
    .from(contentExpansionRuns)
    .where(eq(contentExpansionRuns.eventId, eventId))
    .orderBy(desc(contentExpansionRuns.startedAt))
    .limit(Math.max(1, Math.min(100, limit)));
}

export async function listEventExpansionEvidence(eventId: string) {
  return getDatabase()
    .select({
      id: contentEventExpansionEvidence.id,
      eventId: contentEventExpansionEvidence.eventId,
      rawItemId: contentEventExpansionEvidence.rawItemId,
      expansionType: contentEventExpansionEvidence.expansionType,
      mediaType: contentEventExpansionEvidence.mediaType,
      language: contentEventExpansionEvidence.language,
      relevanceScore: contentEventExpansionEvidence.relevanceScore,
      valueScore: contentEventExpansionEvidence.valueScore,
      rankScore: contentEventExpansionEvidence.rankScore,
      shadowSignalScore: contentEventExpansionEvidence.shadowSignalScore,
      query: contentEventExpansionEvidence.query,
      metadata: contentEventExpansionEvidence.metadata,
      title: contentRawItems.title,
      excerpt: contentRawItems.excerpt,
      originalUrl: contentRawItems.originalUrl,
      platform: contentRawItems.platform,
      publishedAt: contentRawItems.publishedAt,
      sourceName: contentSources.name
    })
    .from(contentEventExpansionEvidence)
    .innerJoin(contentRawItems, eq(contentRawItems.id, contentEventExpansionEvidence.rawItemId))
    .innerJoin(contentSources, eq(contentSources.id, contentRawItems.sourceId))
    .where(eq(contentEventExpansionEvidence.eventId, eventId))
    .orderBy(desc(contentEventExpansionEvidence.rankScore));
}

export async function resolveExpansionContext(event: typeof contentEvents.$inferSelect) {
  const entityIds = stringList(event.entities, 30);
  const entityRows = entityIds.length
    ? await getDatabase().select().from(contentEntities).where(inArray(contentEntities.id, entityIds))
    : [];
  const byId = new Map(entityRows.map((entity) => [entity.id, entity]));
  const primaryTerms = entityIds.flatMap((id) => {
    const entity = byId.get(id);
    if (entity) return [entity.displayNameZh ?? entity.canonicalName];
    if (!id.startsWith("company_") && !id.startsWith("model_") && !id.startsWith("project_")) return [id];
    return [];
  });
  const aliasTerms = entityRows.flatMap((entity) => [
    entity.canonicalName,
    ...stringList(entity.aliases, 20)
  ]);
  const entityTerms = [...primaryTerms, ...aliasTerms];
  return {
    title: event.title,
    summary: event.summary,
    keywords: event.keywords,
    entityTerms
  };
}

export async function getEventExpansionContext(eventId: string) {
  const [event] = await getDatabase().select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");
  return resolveExpansionContext(event);
}

function assertExpansionEligible(event: typeof contentEvents.$inferSelect) {
  if (event.archivedAt) throw new Error("EXPANSION_EVENT_ARCHIVED");
  const policy = record(record(event.metadata).eventPolicy);
  if (policy.aiRelevant === false) throw new Error("EXPANSION_EVENT_NOT_AI_RELEVANT");
  const usefulness = record(policy.operationalUsefulness);
  if (usefulness.eligible === false) throw new Error("EXPANSION_EVENT_OPERATIONALLY_INELIGIBLE");
}

type SourceManagedExpansionRuntimeState = {
  version: string;
  status: "SUCCEEDED" | "FAILED";
  lastAttemptAt: string;
  evidenceCount: number;
  chineseEvidenceCount: number;
  practicalEvidenceCount: number;
  analysisStatus: "NOT_REQUIRED";
  analysisReason: string;
  lastError: string | null;
};

async function persistSourceManagedExpansionRuntime(eventId: string, state: SourceManagedExpansionRuntimeState) {
  await getDatabase()
    .update(contentEvents)
    .set({
      metadata: sql`${contentEvents.metadata} || ${JSON.stringify({ sourceManagedExpansionRuntime: state })}::jsonb`,
      updatedAt: new Date()
    })
    .where(eq(contentEvents.id, eventId));
}

async function buildExpansionPack(
  event: typeof contentEvents.$inferSelect,
  context: Awaited<ReturnType<typeof resolveExpansionContext>>,
  observedIntent: Map<string, { query: string; expansionRunId: string }>,
  windowHours: number
) {
  const db = getDatabase();
  const now = Date.now();
  const eventTime = event.firstSeenAt?.getTime() ?? now;
  const since = new Date(Math.max(now - 7 * 24 * 60 * 60 * 1000, eventTime - 12 * 60 * 60 * 1000));
  const rawRows = await db
    .select()
    .from(contentRawItems)
    .where(gte(contentRawItems.collectedAt, since))
    .orderBy(desc(contentRawItems.collectedAt))
    .limit(600);
  const rawSourceIds = [...new Set(rawRows.map((raw) => raw.sourceId))];
  const rawSources = rawSourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, rawSourceIds))
    : [];
  const rawSourceById = new Map(rawSources.map((source) => [source.id, source]));
  const factLinks = await db
    .select({ rawItemId: contentEventRawItems.rawItemId })
    .from(contentEventRawItems)
    .where(eq(contentEventRawItems.eventId, event.id));
  const factRawIds = new Set(factLinks.map((item) => item.rawItemId));

  const classified = rawRows.flatMap((raw) => {
    if (factRawIds.has(raw.id)) return [];
    const intent = observedIntent.get(raw.id);
    const result = classifyEventExpansionCandidate(context, {
      rawItemId: raw.id,
      platform: raw.platform,
      title: raw.title,
      excerpt: raw.excerpt,
      publishedAt: raw.publishedAt,
      platformMetrics: record(raw.platformMetrics),
      query: intent?.query ?? null,
      expansionRunId: intent?.expansionRunId ?? null
    });
    if (!result) return [];
    const rawSource = rawSourceById.get(raw.sourceId);
    const sourceMetadata = record(rawSource?.metadata);
    const formalPracticalSource = isFormalPracticalEvidenceSource({
      sourceEnabled: rawSource?.enabled === true,
      currentPortfolio: sourceMetadata.currentPortfolio === true,
      sourceUniverseRole: typeof sourceMetadata.sourceUniverseRole === "string" ? sourceMetadata.sourceUniverseRole : null,
      sourceReferenceOnly: sourceMetadata.referenceOnly === true,
      rawReferenceOnly: record(raw.metadata).referenceOnly === true,
      signalOnly: record(rawSource?.signalConfig).signalOnly === true
    });
    const relevance = evaluateEventEvidenceRelevance({
      eventTitle: context.title,
      eventKeywords: context.keywords,
      eventEntities: context.entityTerms,
      candidateTitle: raw.title,
      candidateExcerpt: raw.excerpt
    });
    return relevance.pass ? [{ ...result, formalPracticalSource }] : [];
  });
  const selected = selectEventExpansionEvidence(classified, MAX_EVIDENCE);

  await db.transaction(async (tx) => {
    await tx.delete(contentEventExpansionEvidence).where(eq(contentEventExpansionEvidence.eventId, event.id));
    if (selected.length) {
      await tx.insert(contentEventExpansionEvidence).values(selected.map((item) => ({
        eventId: event.id,
        rawItemId: item.rawItemId,
        expansionRunId: item.expansionRunId,
        expansionType: item.expansionType,
        mediaType: item.mediaType,
        language: item.language,
        relevanceScore: item.relevanceScore,
        valueScore: item.valueScore,
        rankScore: item.rankScore,
        shadowSignalScore: item.shadowSignalScore,
        query: item.query,
        metadata: item.metadata
      })));
    }
  });

  return {
    evidence: await listEventExpansionEvidence(event.id),
    shadowExpansionSignal: calculateExpansionShadowSignal(selected),
    scanWindowHours: Math.min(7 * 24, Math.max(windowHours, Math.round((now - since.getTime()) / 3_600_000)))
  };
}

export async function refreshEventExpansionEvidenceFromRecentRaw(
  eventId: string,
  windowHours = DEFAULT_WINDOW_HOURS
) {
  const db = getDatabase();
  const [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");
  assertExpansionEligible(event);
  const context = await resolveExpansionContext(event);
  return buildExpansionPack(
    event,
    context,
    new Map(),
    boundedInteger(windowHours, DEFAULT_WINDOW_HOURS, 24, 168)
  );
}

export async function refreshSourceManagedEventExpansion(
  eventId: string,
  windowHours = DEFAULT_WINDOW_HOURS
) {
  const attemptedAt = new Date();
  try {
    const expansion = await refreshEventExpansionEvidenceFromRecentRaw(eventId, windowHours);
    const practicalTypes = new Set(["EXPERIENCE", "TUTORIAL", "USE_CASE", "WORK_IMPACT"]);
    const practicalEvidenceCount = expansion.evidence.filter((item) => practicalTypes.has(item.expansionType)).length;
    const hasPracticalEvidence = practicalEvidenceCount > 0;
    // Collecting evidence never authorizes a model call. The admin analysis POST
    // remains the sole trigger, including after new practical evidence arrives.
    const analysisStatus: SourceManagedExpansionRuntimeState["analysisStatus"] = "NOT_REQUIRED";
    const analysisReason = hasPracticalEvidence ? "HUMAN_TRIGGER_REQUIRED" : "NO_PRACTICAL_EVIDENCE";

    const result = {
      version: SOURCE_MANAGED_EXPANSION_RUNTIME_VERSION,
      evidence: expansion.evidence,
      shadowExpansionSignal: expansion.shadowExpansionSignal,
      scanWindowHours: expansion.scanWindowHours,
      evidenceCount: expansion.evidence.length,
      chineseEvidenceCount: expansion.evidence.filter((item) => item.language === "ZH").length,
      practicalEvidenceCount,
      analysisStatus,
      analysisReason
    };
    await persistSourceManagedExpansionRuntime(eventId, {
      version: SOURCE_MANAGED_EXPANSION_RUNTIME_VERSION,
      status: "SUCCEEDED",
      lastAttemptAt: attemptedAt.toISOString(),
      evidenceCount: result.evidenceCount,
      chineseEvidenceCount: result.chineseEvidenceCount,
      practicalEvidenceCount,
      analysisStatus,
      analysisReason,
      lastError: null
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await persistSourceManagedExpansionRuntime(eventId, {
      version: SOURCE_MANAGED_EXPANSION_RUNTIME_VERSION,
      status: "FAILED",
      lastAttemptAt: attemptedAt.toISOString(),
      evidenceCount: 0,
      chineseEvidenceCount: 0,
      practicalEvidenceCount: 0,
      analysisStatus: "NOT_REQUIRED",
      analysisReason: "EXPANSION_REFRESH_FAILED",
      lastError: message.slice(0, 1000)
    }).catch(() => undefined);
    throw error;
  }
}

export async function getEventExpansionPlan(eventId: string) {
  const [event] = await getDatabase().select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");
  const context = await resolveExpansionContext(event);
  return {
    ...buildEventExpansionQueryPlan(context, 10),
    ...buildCreatorFirstEventExpansionQueryPlan(context, 10),
    capabilities: EVENT_EXPANSION_CAPABILITIES,
    formalHotspotPromotion: false as const
  };
}

export async function runEventExpansion(
  user: AuthUser,
  eventId: string,
  input: ExpansionInput = {},
  dependencies: ExpansionDependencies = {}
) {
  const db = getDatabase();
  const [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");
  assertExpansionEligible(event);

  const windowHours = boundedInteger(input.windowHours, DEFAULT_WINDOW_HOURS, 24, 168);
  const resultLimit = boundedInteger(input.resultLimit, DEFAULT_RESULT_LIMIT, 1, 50);
  const maxQueries = boundedInteger(input.maxQueries, MAX_QUERIES, 1, MAX_QUERIES);
  const requestedExpansionTypes = resolveRequestedExpansionTypes(input.expansionTypes);
  const managedSource = input.managedSourceId ? (await db.select().from(contentSources).where(eq(contentSources.id, input.managedSourceId)).limit(1))[0] : null;
  if (input.managedSourceId && (!managedSource || !isManagedPracticeSearchReady(managedSource))) throw new Error("MANAGED_SEARCH_SOURCE_NOT_READY");
  const providers = await resolveProviders(managedSource ? [record(managedSource.collectionConfig).practiceExpansionProvider ?? record(managedSource.collectionConfig).provider ?? managedSource.providerRef] : input.providers);
  if (providers.length === 0) throw new Error("EXPANSION_PROVIDER_REQUIRED");

  let context = await resolveExpansionContext(event);
  if (managedSource && input.practiceTitle) {
    const lead = (await listEventExpansionEvidence(eventId)).find(item => item.title === input.practiceTitle && aiHotspotPracticeSubject(item));
    if (!lead) throw new Error("PRACTICE_SEARCH_SUBJECT_NOT_IN_EVIDENCE");
    context = { title: lead.title!, summary: lead.excerpt, keywords: [], entityTerms: [] };
  }
  const plan = {
    ...buildEventExpansionQueryPlan(context, 10, requestedExpansionTypes),
    ...buildCreatorFirstEventExpansionQueryPlan(context, 10, requestedExpansionTypes)
  };

  const fetchJson = dependencies.fetchJson ?? fetchPublicJson;
  const completed = [];
  const observedIntent = new Map<string, { query: string; expansionRunId: string }>();
  let budgetLimit = Math.min(
    DEFAULT_INITIAL_BUDGET,
    Math.max(1, providers.length * maxQueries)
  );
  let budgetUsed = 0;
  const budgetSamples: ExpansionBudgetSample[] = [];
  const independentOriginKeys = new Set<string>();
  const evidenceTypes = new Set<string>();
  let budgetDecision = evaluateAdaptiveExpansionBudget({
    budgetUsed,
    budgetLimit,
    maxBudget: DEFAULT_MAX_BUDGET,
    recentSamples: budgetSamples,
    independentOriginCount: 0,
    evidenceTypeCount: 0
  });
  let adaptiveStop = false;

  providerLoop:
  for (const provider of providers) {
    const source = managedSource ?? await ensureExpansionSource(provider);
    const providerQueries = providerQueryPlan(provider, plan, maxQueries);
    if (providerQueries.length === 0) continue;

    for (const queryPlan of providerQueries) {
      if (adaptiveStop) break providerLoop;
      const query = queryPlan.query;
      const [run] = await db
        .insert(contentExpansionRuns)
        .values({
          eventId,
          sourceId: source.id,
          query,
          provider,
          windowHours,
          resultLimit,
          status: "RUNNING",
          triggeredByEmail: user.email,
          metadata: {
            eventTitle: event.title,
            expansionType: queryPlan.expansionType,
            queryLanguage: queryPlan.language,
            requestedExpansionTypes: requestedExpansionTypes ?? "ALL",
            formalHotspotPromotion: false
          }
        })
        .returning();

      let queryBudgetRecorded = false;
      try {
        const search = await collectEventExpansionSearch(
          provider,
          query,
          windowHours,
          resultLimit,
          { fetchJson, fetchImpl: dependencies.fetchImpl }
        );
        const preEvidenceRejectedReasons = new Map<string, number>();
        const gatedItems = search.items.filter((item) => {
          if (!evaluatePublicPracticeAccess(item).eligible) {
            preEvidenceRejectedReasons.set("HUMAN_OR_FOLLOW_ACCESS_REQUIRED",(preEvidenceRejectedReasons.get("HUMAN_OR_FOLLOW_ACCESS_REQUIRED") ?? 0)+1);
            return false;
          }
          const deterministicQuality = evaluateDeterministicQualityGate(item);
          if (!deterministicQuality.pass) {
            for (const reason of deterministicQuality.reasons) {
              const key = "DETERMINISTIC_QUALITY_GATE:" + reason;
              preEvidenceRejectedReasons.set(
                key,
                (preEvidenceRejectedReasons.get(key) ?? 0) + 1
              );
            }
            return false;
          }
          const pollutionGate = evaluatePollutionGate(item);
          if (!pollutionGate.pass) {
            for (const reason of pollutionGate.reasons) {
              const key = "POLLUTION_GATE:" + reason;
              preEvidenceRejectedReasons.set(
                key,
                (preEvidenceRejectedReasons.get(key) ?? 0) + 1
              );
            }
            return false;
          }
          return true;
        });
        const previewCandidates = gatedItems.flatMap((item, index) => {
          const classified = classifyEventExpansionCandidate(context, {
            rawItemId: "budget-preview:" + provider + ":" + index,
            platform: source.platform,
            title: item.title,
            excerpt: item.excerpt,
            publishedAt: item.publishedAt,
            platformMetrics: item.platformMetrics,
            query,
            expansionRunId: run.id
          });
          if (!classified) return [];
          const relevance = evaluateEventEvidenceRelevance({
            eventTitle: context.title,
            eventKeywords: context.keywords,
            eventEntities: context.entityTerms,
            candidateTitle: item.title,
            candidateExcerpt: item.excerpt
          });
          if (!relevance.pass) {
            const key = "EVENT_RELEVANCE:" + relevance.reason;
            preEvidenceRejectedReasons.set(
              key,
              (preEvidenceRejectedReasons.get(key) ?? 0) + 1
            );
            return [];
          }
          return [{ item, classified, index, relevance }];
        });
        const queryOrigins = resolveIndependentOrigins(
          previewCandidates.map(({ item, index }) => ({
            sourceId:
              provider +
              ":" +
              (item.externalId ?? item.originalUrl ?? String(index)),
            sourceName: provider,
            canonicalUrl: item.originalUrl,
            author: item.author,
            title: item.title,
            excerpt: item.excerpt,
            publishedAt: item.publishedAt
          }))
        );
        const beforeOriginCount = independentOriginKeys.size;
        for (const origin of queryOrigins) {
          independentOriginKeys.add(origin.independentOriginKey);
        }
        for (const { classified } of previewCandidates) {
          evidenceTypes.add(classified.expansionType);
        }
        budgetUsed += 1;
        budgetSamples.push({
          budgetUnits: 1,
          independentEvidenceGained:
            independentOriginKeys.size - beforeOriginCount,
          demandSignalsGained: 0
        });
        queryBudgetRecorded = true;
        budgetDecision = evaluateAdaptiveExpansionBudget({
          budgetUsed,
          budgetLimit,
          maxBudget: DEFAULT_MAX_BUDGET,
          recentSamples: budgetSamples,
          independentOriginCount: independentOriginKeys.size,
          evidenceTypeCount: evidenceTypes.size
        });
        if (budgetDecision.action === "EXTEND") {
          budgetLimit = budgetDecision.budgetLimit;
        } else if (budgetDecision.action === "STOP") {
          adaptiveStop = true;
        }
        let created = 0;
        let duplicates = 0;
        const rawItemIds: string[] = [];
        const createdRawItemIds: string[] = [];
        const relevantItemKeys = new Set(
          previewCandidates.map(({ item }) =>
            item.externalId ?? item.originalUrl ?? item.title
          )
        );
        for (const item of gatedItems) {
          const itemKey = item.externalId ?? item.originalUrl ?? item.title;
          if (!relevantItemKeys.has(itemKey)) continue;
          const ingested = await ingestRawItem({
            ...item,
            sourceId: source.id,
            metadata: {
              ...record(item.metadata),
              collectionOrigin: "SYSTEM",
              collectionPurpose: "EVENT_EXPANSION",
              ...(managedSource ? { referenceOnly: true, practiceDiscovery: { status: "PENDING_SOURCE_REVIEW", subjectTitle: context.title,  targetEventId: event.id } } : {}),
              targetEventId: event.id,
              expansionType: queryPlan.expansionType,
              expansionQueryLanguage: queryPlan.language,
              mediaPolicy: "REFERENCE_ONLY",
              formalHotspotPromotion: false
            }
          });
          rawItemIds.push(ingested.item.id);
          observedIntent.set(ingested.item.id, { query, expansionRunId: run.id });
          if (ingested.created) {
            created += 1;
            createdRawItemIds.push(ingested.item.id);
          } else {
            duplicates += 1;
          }
        }
        const [finished] = await db
          .update(contentExpansionRuns)
          .set({
            status: "SUCCEEDED",
            receivedCount: search.items.length,
            createdCount: created,
            duplicateCount: duplicates,
            finishedAt: new Date(),
            metadata: {
              eventTitle: event.title,
              requestUrl: search.requestUrl,
              expansionType: queryPlan.expansionType,
              queryLanguage: queryPlan.language,
              rawItemIds: rawItemIds.slice(0, 100),
              createdRawItemIds: createdRawItemIds.slice(0, 100),
              preEvidenceGate: {
                receivedCount: search.items.length,
                acceptedCount: previewCandidates.length,
                rejectedCount: search.items.length - previewCandidates.length,
                rejectedReasons: Object.fromEntries(preEvidenceRejectedReasons)
              },
              adaptiveBudget: {
                budgetUsed,
                budgetLimit,
                independentOriginCount: independentOriginKeys.size,
                evidenceTypeCount: evidenceTypes.size,
                action: budgetDecision.action,
                reason: budgetDecision.reason,
                marginalUtility: budgetDecision.marginalUtility
              },
              formalHotspotPromotion: false
            }
          })
          .where(eq(contentExpansionRuns.id, run.id))
          .returning();
        completed.push(finished);
      } catch (error) {
        if (!queryBudgetRecorded) {
          budgetUsed += 1;
          budgetSamples.push({
            budgetUnits: 1,
            independentEvidenceGained: 0,
            demandSignalsGained: 0
          });
          budgetDecision = evaluateAdaptiveExpansionBudget({
            budgetUsed,
            budgetLimit,
            maxBudget: DEFAULT_MAX_BUDGET,
            recentSamples: budgetSamples,
            independentOriginCount: independentOriginKeys.size,
            evidenceTypeCount: evidenceTypes.size
          });
          if (budgetDecision.action === "EXTEND") {
            budgetLimit = budgetDecision.budgetLimit;
          } else if (budgetDecision.action === "STOP") {
            adaptiveStop = true;
          }
        }
        const [failed] = await db
          .update(contentExpansionRuns)
          .set({
            status: "FAILED",
            errorCode: errorCode(error),
            errorMessage: errorMessage(error),
            metadata: {
              eventTitle: event.title,
              expansionType: queryPlan.expansionType,
              queryLanguage: queryPlan.language,
              adaptiveBudget: {
                budgetUsed,
                budgetLimit,
                independentOriginCount: independentOriginKeys.size,
                evidenceTypeCount: evidenceTypes.size,
                action: budgetDecision.action,
                reason: budgetDecision.reason,
                marginalUtility: budgetDecision.marginalUtility
              },
              formalHotspotPromotion: false
            },
            finishedAt: new Date()
          })
          .where(eq(contentExpansionRuns.id, run.id))
          .returning();
        completed.push(failed);
      }
    }
  }

  // Managed search discovers references. Qualification of a newly found author
  // is separate; never replace the parent Event's evidence using a tutorial angle.
  const pack = await buildExpansionPack(event, managedSource ? await resolveExpansionContext(event) : context, observedIntent, windowHours);

  return {
    eventId,
    queryPlan: plan,
    requestedExpansionTypes: requestedExpansionTypes ?? "ALL",
    queries: completed.map((run) => run.query),
    providers,
    windowHours,
    resultLimit,
    runs: completed,
    evidencePack: pack.evidence,
    shadowExpansionSignal: pack.shadowExpansionSignal,
    capabilities: EVENT_EXPANSION_CAPABILITIES,
    adaptiveBudget: {
      budgetUsed,
      budgetLimit,
      maxBudget: DEFAULT_MAX_BUDGET,
      independentOriginCount: independentOriginKeys.size,
      evidenceTypeCount: evidenceTypes.size,
      action: budgetDecision.action,
      reason: budgetDecision.reason,
      marginalUtility: budgetDecision.marginalUtility,
      samples: budgetSamples
    },
    formalHotspotPromotion: false as const,
    formalRankingChanged: false as const,
    summary: {
      total: completed.length,
      succeeded: completed.filter((run) => run.status === "SUCCEEDED").length,
      failed: completed.filter((run) => run.status === "FAILED").length,
      received: completed.reduce((sum, run) => sum + run.receivedCount, 0),
      created: completed.reduce((sum, run) => sum + run.createdCount, 0),
      duplicates: completed.reduce((sum, run) => sum + run.duplicateCount, 0),
      evidenceCount: pack.evidence.length,
      chineseEvidenceCount: pack.evidence.filter((item) => item.language === "ZH").length
    }
  };
}

export async function runDiscoveryExpansionCycle(
  user: AuthUser,
  options: { maxEvents?: number } = {}
) {
  const maxEvents = boundedInteger(options.maxEvents, 3, 1, 6);
  const candidates = await listDiscoveryExpansionCandidates(Math.max(maxEvents * 4, 12));
  const confirmed = candidates.filter(
    (item) => item.discoveryExpansion.trigger === "CONFIRMED_EVENT_FOLLOW_UP"
  );
  const unverified = candidates.filter(
    (item) => item.discoveryExpansion.trigger === "UNVERIFIED_VERIFICATION_FOLLOW_UP"
  );
  const selected: typeof candidates = [];
  const practiceCandidate = candidates.find(item => evaluateAiHotspotPractice(item).eligible);
  if (practiceCandidate) selected.push(practiceCandidate);
  if (confirmed.length && selected.length < maxEvents && !selected.some(item => item.eventId === confirmed[0].eventId)) selected.push(confirmed[0]);
  if (unverified.length && selected.length < maxEvents && !selected.some(item => item.eventId === unverified[0].eventId)) selected.push(unverified[0]);
  for (const candidate of candidates) {
    if (selected.length >= maxEvents) break;
    if (selected.some((item) => item.eventId === candidate.eventId)) continue;
    selected.push(candidate);
  }
  const results: Array<{
    eventId: string;
    trigger: string;
    priority: number;
    status: "SUCCEEDED" | "FAILED" | "SKIPPED";
    error?: string;
    evidenceCount?: number;
    chineseEvidenceCount?: number;
    practicalEvidenceCount?: number;
    shadowExpansionSignal?: ReturnType<typeof calculateExpansionShadowSignal>;
    analysisStatus?: "NOT_REQUIRED";
    analysisReason?: string;
    practiceSearch?: string;
  }> = [];

  // One managed search route, one Event, two queries at most per SYSTEM cycle.
  // Source opt-in is required: never resurrect the legacy hidden provider pool.
  const managedSearchSources = await getDatabase().select().from(contentSources).where(and(eq(contentSources.enabled, true), eq(contentSources.status, "ACTIVE")));
  const healthyProviders = managedSearchSources.some(source => record(source.collectionConfig).practiceExpansionEnabled === true) ? await resolveProviders(undefined).catch(() => []) : [];
  const searchSource = managedSearchSources.find(source =>
    isManagedPracticeSearchReady(source) &&
    healthyProviders.includes((record(source.collectionConfig).practiceExpansionProvider ?? record(source.collectionConfig).provider ?? source.providerRef) as EventExpansionSearchProvider));
  let searched = false;

  for (const candidate of selected) {
    try {
      let searchStatus = searchSource ? "NOT_TRIGGERED" : "NO_READY_MANAGED_SEARCH_SOURCE";
      const [lastSearch] = await getDatabase().select({ startedAt: contentExpansionRuns.startedAt }).from(contentExpansionRuns).where(eq(contentExpansionRuns.eventId, candidate.eventId)).orderBy(desc(contentExpansionRuns.startedAt)).limit(1);
      const practiceSearch = shouldExpandAiHotspotPractice({ title: candidate.title, excerpt: candidate.excerpt, independentParticipants: evaluateAiHotspotPractice(candidate).record?.participants.length ?? 0, lastAttemptAt: lastSearch?.startedAt?.toISOString() ?? null });
      if (!searched && practiceSearch.eligible && searchSource) {
        searched = true;
        try {
          const search = await runEventExpansion(user, candidate.eventId, { managedSourceId: searchSource.id, practiceTitle: undefined, maxQueries: 2, resultLimit: 5, windowHours: 168, expansionTypes: ["TUTORIAL", "USE_CASE"] });
          searchStatus = search.summary.failed ? "SEARCH_PARTIAL_OR_FAILED" : "SEARCH_SUCCEEDED";
        } catch (error) { searchStatus = errorCode(error); }
      }
      // Production expansion consumes only Raw items already collected by Source Management
      // through SYSTEM Collection. It never creates a hidden expansion-only Source.
      const expansion = await refreshSourceManagedEventExpansion(candidate.eventId, 168);
      results.push({
        eventId: candidate.eventId,
        trigger: candidate.discoveryExpansion.trigger,
        priority: candidate.discoveryExpansion.priority,
        status: "SUCCEEDED",
        evidenceCount: expansion.evidenceCount,
        chineseEvidenceCount: expansion.chineseEvidenceCount,
        practicalEvidenceCount: expansion.practicalEvidenceCount,
        shadowExpansionSignal: expansion.shadowExpansionSignal,
        analysisStatus: expansion.analysisStatus,
        analysisReason: expansion.analysisReason,
        practiceSearch: searchStatus
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        eventId: candidate.eventId,
        trigger: candidate.discoveryExpansion.trigger,
        priority: candidate.discoveryExpansion.priority,
        status: message === "EXPANSION_PROVIDER_REQUIRED" ? "SKIPPED" : "FAILED",
        error: message
      });
    }
  }

  return {
    version: "discovery-expansion-source-managed-v3" as const,
    candidateCount: candidates.length,
    selectedCount: selected.length,
    succeeded: results.filter((item) => item.status === "SUCCEEDED").length,
    failed: results.filter((item) => item.status === "FAILED").length,
    skipped: results.filter((item) => item.status === "SKIPPED").length,
    practicalEvidenceTotal: results.reduce((sum, item) => sum + (item.practicalEvidenceCount ?? 0), 0),
    aiExecution: "HUMAN_TRIGGER_ONLY" as const,
    humanAnalysisCandidateCount: results.filter((item) => item.analysisReason === "HUMAN_TRIGGER_REQUIRED").length,
    authority: {
      factEvidence: false as const,
      formalVerificationPromotion: false as const,
      formalHotspotPromotion: false as const,
      sourceScope: "SOURCE_MANAGEMENT_SYSTEM_COLLECTION_ONLY" as const,
      opcValueAuthority: "CLUSTER_ANALYSIS_ONLY" as const
    },
    results
  };
}
