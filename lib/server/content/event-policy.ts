import "server-only";

import { eq, inArray, sql } from "drizzle-orm";
import {
  EVENT_POLICIES,
  HOTSPOT_POLICY,
  INTELLIGENCE_POLICY_VERSION,
  OFFICIAL_NEWS_POLICY,
  type ChangeMagnitude,
  type IntelligenceEventType
} from "../../content/intelligence-policy";
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
import { inferCollectionContentType, sourceContentRule } from "./source-policy";
import { scoreEventClusterCandidate } from './event-clustering';
import { normalizeEventSeedTitle } from './event-seed-clustering';
import {
  evaluateEventEvidenceRelevance,
  resolveIndependentOrigins
} from "./pollution-syndication-gate";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function classifyIntelligenceEvent(input: {
  title: string;
  excerpt?: string | null;
  contentType?: string | null;
}): IntelligenceEventType {
  const text = [input.title, input.excerpt ?? ""].join(" ").toLocaleLowerCase();
  const contentType = input.contentType?.toUpperCase() ?? "";
  if (contentType === "RESEARCH_PAPER" || /\bpaper\b|research|论文|研究|benchmark|评测/.test(text)) return "RESEARCH";
  if (/open[ -]?source|开源|github release/.test(text)) return "OPEN_SOURCE";
  if (/model|gpt|claude|gemini|llama|qwen|deepseek|ernie|mistral|grok|模型/.test(text) && /launch|release|introduc|unveil|发布|推出|上线|更新/.test(text)) return "MODEL_RELEASE";
  if (/product|feature|agent|tool|app|功能|产品|智能体|工具/.test(text) && /launch|release|introduc|update|发布|推出|上线|更新/.test(text)) return "PRODUCT_FEATURE_RELEASE";
  if (/policy|regulation|safety|security|监管|政策|安全|合规|法案/.test(text)) return "POLICY_SAFETY";
  if (/funding|fundraise|acqui|partnership|融资|收购|合作|投资/.test(text)) return "COMPANY_FINANCE_PARTNERSHIP";
  if (/\bapi\b|sdk|platform|pricing|price|deprecat|changelog|接口|平台|价格|弃用/.test(text)) return "API_PLATFORM_UPDATE";
  return "INDUSTRY_HOTSPOT";
}

function scopeRank(scope: string) {
  return ({ NONE: 0, EXISTENCE: 1, DETAIL: 2, SPECIFICATION: 3, PRIMARY_SOURCE: 4 } as Record<string, number>)[scope] ?? 0;
}

function isSystemObservation(metadata: unknown) {
  const item = record(metadata);
  if (String(item.collectionOrigin ?? "SYSTEM").toUpperCase() === "SYSTEM") return true;
  const contexts = Array.isArray(item.collectionContexts) ? item.collectionContexts : [];
  return contexts.some((context) => String(record(context).origin ?? "").toUpperCase() === "SYSTEM");
}

function changeMagnitudeForEvent(eventType: IntelligenceEventType, title: string, summary: string | null): ChangeMagnitude {
  const text = [title, summary ?? ""].join(" ").toLocaleLowerCase();
  if (/bug\s*fix|docs?|documentation|招聘|活动|webinar|minor|typo|文档/.test(text)) return "MINOR";
  if (["MODEL_RELEASE", "OPEN_SOURCE"].includes(eventType)) return "MAJOR";
  if (/major|new model|frontier|general availability|正式发布|重大|全新模型|开源模型/.test(text)) return "MAJOR";
  return "NORMAL";
}

function magnitudeScore(value: ChangeMagnitude) {
  return value === "MAJOR" ? 100 : value === "NORMAL" ? 72 : 30;
}

function freshnessScore(ageHours: number, windowHours: number) {
  if (ageHours <= 0) return 100;
  if (ageHours >= windowHours) return 0;
  return Math.max(0, Math.round(100 * (1 - ageHours / windowHours)));
}

function opcUsefulnessScore(eventType: IntelligenceEventType) {
  return ({
    MODEL_RELEASE: 100,
    PRODUCT_FEATURE_RELEASE: 90,
    API_PLATFORM_UPDATE: 90,
    OPEN_SOURCE: 92,
    RESEARCH: 82,
    COMPANY_FINANCE_PARTNERSHIP: 72,
    POLICY_SAFETY: 85,
    INDUSTRY_HOTSPOT: 68
  } satisfies Record<IntelligenceEventType, number>)[eventType];
}
export type OperationalUsefulness = {
  version: "operational-usefulness-v1";
  eligible: boolean;
  reason: "OPERATIONALLY_USEFUL" | "OFFICIAL_CUSTOMER_STORY" | "OFFICIAL_INITIATIVE" | "MEDIA_OPINION_SINGLE_SOURCE";
};

function eventText(title: string, summary: string | null) {
  return [title, summary ?? ""].join(" ").toLocaleLowerCase();
}

export function assessOperationalUsefulness(input: {
  title: string;
  summary: string | null;
  rawTexts?: Array<{ title: string; excerpt?: string | null }>;
  eventType: IntelligenceEventType;
  verificationStatus: string;
  factSourceCount: number;
  signalSourceCount: number;
}): OperationalUsefulness {
  const titles = [input.title, ...(input.rawTexts ?? []).map((item) => item.title)]
    .map((value) => value.toLocaleLowerCase());
  const text = [
    eventText(input.title, input.summary),
    ...(input.rawTexts ?? []).map((item) => eventText(item.title, item.excerpt ?? null))
  ].join(" ");
  const titleMatches = (pattern: RegExp) => titles.some((value) => pattern.test(value));

  if (
    input.verificationStatus === "CONFIRMED_OFFICIAL" &&
    input.factSourceCount === 1 &&
    input.signalSourceCount === 0
  ) {
    const customerStory =
      titleMatches(/^how\s+.+\b(?:uses?|using|is scaling|scales?|with)\b/) ||
      /\buses openai\b|\busing openai technology\b|\bbrings?\b.+\binto chatgpt\b|\bchatgpt plugin\b/.test(text);
    const materialPartnership =
      /\bexpand(?:s|ed|ing)? partnership\b|\bstrategic partnership\b|\bpartnership with openai\b/.test(text);
    if (customerStory && !materialPartnership) {
      return { version: "operational-usefulness-v1", eligible: false, reason: "OFFICIAL_CUSTOMER_STORY" };
    }

    const initiative =
      titleMatches(/^helping\s+.+\b(?:learn|plan|shape)\b/) ||
      /\bteen ai council\b|\byouth council\b|\beducation initiative\b|\bcommunity initiative\b/.test(text);
    if (initiative) {
      return { version: "operational-usefulness-v1", eligible: false, reason: "OFFICIAL_INITIATIVE" };
    }
  }

  if (
    input.verificationStatus === "UNVERIFIED" &&
    input.factSourceCount <= 1
  ) {
    const opinionOrExplainer =
      titleMatches(/^how\s+.+\b(?:could|might|may)\b.+\b(?:change|reshape|transform)\b/) ||
      titleMatches(/\bwon'?t\b.+\b(?:change|transform)\b/) ||
      titleMatches(/^[“"].+[”"][:：]?\s*.+\b(?:takes aim|says|claims|argues)\b/) ||
      titles.some((value) => /\bthe case for\b|\bwhat .+ means\b|\bopinion\b|\banalysis\b|\bexplainer\b/.test(value));
    if (opinionOrExplainer) {
      return { version: "operational-usefulness-v1", eligible: false, reason: "MEDIA_OPINION_SINGLE_SOURCE" };
    }
  }

  return { version: "operational-usefulness-v1", eligible: true, reason: "OPERATIONALLY_USEFUL" };
}

export async function evaluateEventPolicy(eventId: string, now = new Date()) {
 return getDatabase().transaction(async tx=>{
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext('opc-event-clustering-v6'))`);
  return evaluateEventPolicyLocked(eventId,now,tx as unknown as ReturnType<typeof getDatabase>);
 });
}
async function evaluateEventPolicyLocked(eventId:string,now:Date,db:ReturnType<typeof getDatabase>) {
  const [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const memberships = await db.select().from(contentEventClusterMembers).where(eq(contentEventClusterMembers.eventId, event.id));
  const clusterId = memberships[0]?.clusterId ?? null;
  const clusterMembers = clusterId
    ? await db.select().from(contentEventClusterMembers).where(eq(contentEventClusterMembers.clusterId, clusterId))
    : [];
  const allMemberIds = [...new Set([event.id, ...clusterMembers.map((item) => item.eventId)])];
  const clusterEvents = (allMemberIds.length
    ? await db.select().from(contentEvents).where(inArray(contentEvents.id, allMemberIds)).for("update")
    : [event]).filter(member=>!member.archivedAt||(member.id===event.id&&member.verificationStatus==="ARCHIVED_UNVERIFIED"));
  const eventIds=clusterEvents.map(member=>member.id);
  if(!eventIds.length)throw Error("EVENT_CLUSTER_NO_ACTIVE_MEMBERS");
  const [cluster] = clusterId
    ? await db.select().from(contentEventClusters).where(eq(contentEventClusters.id, clusterId)).limit(1)
    : [];
  const canonicalEvent = cluster
    ? clusterEvents.find((item) => item.id === cluster.primaryEventId) ?? [...clusterEvents].sort((a,b)=>a.firstSeenAt.getTime()-b.firstSeenAt.getTime()||a.id.localeCompare(b.id))[0]
    : event;
  const links = eventIds.length
    ? await db.select().from(contentEventRawItems).where(inArray(contentEventRawItems.eventId, eventIds))
    : [];
  const rawIds = [...new Set(links.map((item) => item.rawItemId))];
  const raws = rawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds))
    : [];
  const observations = rawIds.length
    ? await db.select().from(contentRawItemObservations).where(inArray(contentRawItemObservations.rawItemId, rawIds))
    : [];
  const sourceIds = [...new Set([
    ...raws.map((raw) => raw.sourceId),
    ...observations.map((observation) => observation.sourceId)
  ])];
  const sources = sourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds))
    : [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  const projected=projectEventPolicy({canonicalEvent,clusterId,clusterMetadata:cluster?.metadata??{},eventIds,raws,observations,sources,now});
  const {verificationStatus,generationReadiness,archivedAt,resurrectedAt,aiRelevant,metadata:eventPolicyMetadata,evidence:independentEvidence,factSourceCount,signalSourceCount,officialNewsEligible,hotspotEligible,operationalUsefulness,changeMagnitude,leadTimeToConfirmationHours,previousStatus}=projected;

  const updates = await db.update(contentEvents).set({
    verificationStatus,
    generationReadiness,
    archivedAt,
    resurrectedAt: sql`coalesce(${contentEvents.resurrectedAt}, ${resurrectedAt})`,
    relevanceScore: aiRelevant ? 100 : 0,
    policyVersion: INTELLIGENCE_POLICY_VERSION,
    updatedAt: now
  }).where(inArray(contentEvents.id, eventIds)).returning();
  for (const memberEvent of clusterEvents) {
    await db.update(contentEvents).set({
      metadata: sql`jsonb_set(${contentEvents.metadata}, '{eventPolicy}', ${JSON.stringify(eventPolicyMetadata)}::jsonb, true)`
    }).where(eq(contentEvents.id, memberEvent.id));
  }
  const updated = updates.find((item) => item.id === event.id) ?? event;

  return {
    event: updated,
    evidence: independentEvidence,
    factSourceCount,
    signalSourceCount,
    confirmedOfficial: verificationStatus === "CONFIRMED_OFFICIAL",
    confirmedMedia: verificationStatus === "CONFIRMED_MEDIA",
    officialNewsEligible,
    hotspotEligible,
    operationalUsefulness,
    changeMagnitude,
    leadTimeToConfirmationHours,
    resurrected: previousStatus === "ARCHIVED_UNVERIFIED" && updated.resurrectedAt !== null
  };
}

/** Shared deterministic projection: read paths never reuse a primary member's stale counts. */
export function projectEventPolicy(input:{canonicalEvent:typeof contentEvents.$inferSelect;clusterId:string|null;clusterMetadata:unknown;eventIds:string[];raws:(typeof contentRawItems.$inferSelect)[];observations:(typeof contentRawItemObservations.$inferSelect)[];sources:(typeof contentSources.$inferSelect)[];now:Date}) {
 const {canonicalEvent,clusterId,clusterMetadata,eventIds,raws,observations,sources,now}=input;
 const sourceById=new Map(sources.map(s=>[s.id,s]));
 const relevantRawIds=new Set(raws.filter(raw=>raw.collectedAt<=now&&(!raw.publishedAt||raw.publishedAt<=now)&&canonicalEvidenceRelevance({eventTitle:canonicalEvent.title,eventKeywords:canonicalEvent.keywords,eventEntities:canonicalEvent.entities,candidateTitle:raw.title,candidateExcerpt:raw.excerpt},canonicalEvent,raw.publishedAt??raw.collectedAt).pass).map(raw=>raw.id));
 const sourceIds=[...new Set([...raws.map(r=>r.sourceId),...observations.map(o=>o.sourceId)])];
  const evidence = sourceIds.flatMap((sourceId) => {
    const source = sourceById.get(sourceId);
    if (!source) return [];
    const sourceRaws = raws.filter((raw) => relevantRawIds.has(raw.id) && (
      raw.sourceId === sourceId || observations.some((observation) => observation.rawItemId === raw.id && observation.sourceId === sourceId)
    ));
    if(!sourceRaws.length)return [];
    const sourceObservations=observations.filter(o=>o.sourceId===sourceId&&o.observedAt<=now&&sourceRaws.some(r=>r.id===o.rawItemId));
    const factRaws=sourceRaws.filter(raw=>record(raw.metadata).referenceOnly!==true&&sourceObservations.some(o=>o.rawItemId===raw.id&&isSystemObservation(o.metadata)));
    const contentTypes = [...new Set(factRaws.map((raw) => inferCollectionContentType({
      metadata: record(raw.metadata),
      originalUrl: raw.originalUrl,
      collectionMethod: source.collectionMethod,
      platform: source.platform,
      source
    })))];
    const factAllowed = factRaws.length>0 && record(source.metadata).referenceOnly !== true && record(source.signalConfig).signalOnly !== true;
    const rules = contentTypes.map((contentType) => sourceContentRule(source, contentType));
    const strongest = rules.sort((a, b) => scopeRank(b.confirmationScope) - scopeRank(a.confirmationScope))[0]
      ?? sourceContentRule(source, inferCollectionContentType({
        collectionMethod: source.collectionMethod,
        platform: source.platform,
        source
      }));
    const firstObservedAt = sourceObservations.map((observation) => observation.observedAt).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
    const firstPublishedAt = sourceRaws.map((raw) => raw.publishedAt ?? raw.collectedAt).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
    return [{
      sourceId,
      sourceName: source.name,
      sourceType: source.sourceType,
      role: factAllowed ? strongest.role : "SIGNAL",
      confirmationScope: factAllowed ? strongest.confirmationScope : "NONE",
      confirmationAuthority: factAllowed ? strongest.confirmationAuthority : "NONE",
      canContributeHotness: strongest.canContributeHotness,
      firstObservedAt,
      firstPublishedAt,
      hasSystemObservation: sourceObservations.some((observation) => isSystemObservation(observation.metadata)),
      factHasSystemObservation: sourceObservations.some(o=>isSystemObservation(o.metadata)&&factRaws.some(r=>r.id===o.rawItemId))
    }];
  });

  const originCandidates = evidence.map((item) => {
      const source = sourceById.get(item.sourceId)!;
      const sourceRaws = raws
        .filter((raw) =>
          relevantRawIds.has(raw.id) && (raw.sourceId === item.sourceId ||
          observations.some((observation) =>
            observation.rawItemId === raw.id &&
            observation.sourceId === item.sourceId
          ))
        )
        .sort((a, b) =>
          (a.publishedAt ?? a.collectedAt).getTime() -
          (b.publishedAt ?? b.collectedAt).getTime()
        );
      const representative = sourceRaws[0];
      return {
        sourceId: item.sourceId,
        sourceName: source.name,
        canonicalUrl: source.canonicalUrl,
        sourceMetadata: source.metadata,
        author: representative?.author ?? null,
        title: representative?.title ?? item.sourceName,
        excerpt: representative?.excerpt ?? null,
        publishedAt:
          representative?.publishedAt ??
          representative?.collectedAt ??
          item.firstPublishedAt
      };
    });
  const relevanceBySource = new Map(
    originCandidates.map((candidate) => [
      candidate.sourceId,
      canonicalEvidenceRelevance({
        eventTitle: canonicalEvent.title,
        eventKeywords: canonicalEvent.keywords,
        eventEntities: canonicalEvent.entities,
        candidateTitle: candidate.title,
        candidateExcerpt: candidate.excerpt
      },canonicalEvent,candidate.publishedAt instanceof Date ? candidate.publishedAt : canonicalEvent.firstSeenAt)
    ])
  );
  const originResolution = resolveIndependentOrigins(
    originCandidates.filter((candidate) =>
      relevanceBySource.get(candidate.sourceId)?.pass === true
    )
  );
  const originBySource = new Map(
    originResolution.map((item) => [item.sourceId, item])
  );
  const independentEvidence = evidence.map((item) => ({
    ...item,
    relevance: relevanceBySource.get(item.sourceId) ?? {
      version: "pollution-syndication-v1",
      pass: false,
      reason: "EVENT_RELEVANCE_INSUFFICIENT",
      matchedTitleAnchors: [],
      matchedBodyAnchors: [],
      matchedTitleTokens: []
    },
    ...(originBySource.get(item.sourceId) ?? {
      canonicalPublisher: item.sourceName,
      originalPublisher: item.sourceName,
      syndicatedFrom: null,
      independentOriginKey: "source:" + item.sourceId,
      independenceReason: "RELEVANCE_NOT_PASSED",
      contributesEvidenceCount: false
    })
  }));

  const primaryFact = independentEvidence.find((item) =>
    item.relevance.pass &&
    item.factHasSystemObservation &&
    item.role !== "SIGNAL" &&
    item.confirmationAuthority === "PRIMARY" &&
    scopeRank(item.confirmationScope) >= scopeRank("SPECIFICATION")
  );
  const highFactSources = new Set(
    independentEvidence.filter((item) =>
      item.relevance.pass &&
        item.factHasSystemObservation &&
      item.role !== "SIGNAL" &&
      item.confirmationAuthority === "HIGH" &&
      scopeRank(item.confirmationScope) >= scopeRank("EXISTENCE")
    ).map((item) => item.independentOriginKey)
  );
  const factSources = independentEvidence.filter(
    (item) =>
      item.factHasSystemObservation &&
      item.relevance.pass &&
        item.role !== "SIGNAL" &&
      item.confirmationScope !== "NONE"
  );
  const signalSources = independentEvidence.filter(
    (item) =>
      item.relevance.pass &&
        item.canContributeHotness
  );
  const systemObserved = independentEvidence.some(
    (item) => item.hasSystemObservation
  );
  const previousStatus = canonicalEvent.verificationStatus;
  let verificationStatus = primaryFact
    ? "CONFIRMED_OFFICIAL"
    : highFactSources.size >= 2
      ? "CONFIRMED_MEDIA"
      : "UNVERIFIED";

  const eventType = (EVENT_POLICIES[canonicalEvent.eventType as IntelligenceEventType] ? canonicalEvent.eventType : "INDUSTRY_HOTSPOT") as IntelligenceEventType;
  const policy = EVENT_POLICIES[eventType];
  const anchor = canonicalEvent.eventAt ?? canonicalEvent.firstSeenAt;
  const ageHours = Math.max(0, (now.getTime() - anchor.getTime()) / 3_600_000);
  const eventFresh = ageHours <= policy.eventFreshnessHours;
  const relevanceGate = record(record(clusterMetadata).relevanceGate);
  let archivedAt = canonicalEvent.archivedAt;
  let resurrectedAt = canonicalEvent.resurrectedAt;

  if (verificationStatus === "UNVERIFIED" && ageHours > policy.verificationTimeoutHours) {
    verificationStatus = "ARCHIVED_UNVERIFIED";
    archivedAt = archivedAt ?? now;
  } else if (
    previousStatus === "ARCHIVED_UNVERIFIED" &&
    verificationStatus !== "UNVERIFIED" &&
    ageHours <= policy.resurrectionWindowHours
  ) {
    archivedAt = null;
    resurrectedAt = now;
  }

  const confirmed = verificationStatus === "CONFIRMED_OFFICIAL" || verificationStatus === "CONFIRMED_MEDIA";
  const factSourceCount = new Set(
    factSources.map((item) => item.independentOriginKey)
  ).size;
  const signalSourceCount = new Set(
    signalSources.map((item) => item.independentOriginKey)
  ).size;
  const rawAiRelevant = raws.some((raw) => {
    const metadata = record(raw.metadata);
    const filter = record(metadata.discoveryFilter);
    const relationType = String(filter.relationType ?? "").toUpperCase();
    const resolved = Array.isArray(metadata.resolvedEntities) ? metadata.resolvedEntities : [];
    return (relationType !== "" && relationType !== "UNKNOWN" && relationType !== "NONE") || resolved.length > 0;
  });
  const aiRelevant = relevanceGate.aiRelevant === true || rawAiRelevant;
  const changeMagnitude = changeMagnitudeForEvent(eventType, canonicalEvent.title, canonicalEvent.summary);
  const operationalUsefulness = assessOperationalUsefulness({
    title: canonicalEvent.title,
    summary: canonicalEvent.summary,
    rawTexts: raws.map((raw) => ({ title: raw.title, excerpt: raw.excerpt })),
    eventType,
    verificationStatus,
    factSourceCount,
    signalSourceCount
  });
  const officialNewsEligible =
    systemObserved &&
    verificationStatus === "CONFIRMED_OFFICIAL" &&
    aiRelevant &&
    eventFresh &&
    changeMagnitude !== "MINOR" &&
    operationalUsefulness.eligible;
  const hotspotEligible =
    systemObserved &&
    aiRelevant &&
    eventFresh &&
    verificationStatus !== "ARCHIVED_UNVERIFIED" &&
    operationalUsefulness.eligible &&
    signalSourceCount >= Math.max(policy.minimumSignalSources, HOTSPOT_POLICY.minimumIndependentSignalSources);

  const factTimes = factSources
    .flatMap((item) => [item.firstPublishedAt, item.firstObservedAt])
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime());
  const signalTimes = signalSources
    .flatMap((item) => [item.firstPublishedAt, item.firstObservedAt])
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime());
  const firstFactAt = factTimes[0] ?? null;
  const firstSignalAt = signalTimes[0] ?? null;
  const leadTimeToConfirmationHours = firstFactAt && firstSignalAt
    ? Math.round(((firstFactAt.getTime() - firstSignalAt.getTime()) / 3_600_000) * 10) / 10
    : null;

  const originalUrlCount = new Set(raws.map((raw) => raw.originalUrl).filter(Boolean)).size;
  const generationReadiness = {
    version: "generation-readiness-v1",
    dailyBrief: confirmed && factSourceCount >= 1 ? "READY" : "NEEDS_MORE_EVIDENCE",
    quiz: verificationStatus === "CONFIRMED_OFFICIAL" ? "READY" : confirmed ? "AMBIGUOUS" : "NOT_SUITABLE",
    relatedResources: originalUrlCount >= 2 ? "READY" : "INCOMPLETE",
    missingRequirements: [
      ...(!confirmed ? ["confirmed_event"] : []),
      ...(factSourceCount < 1 ? ["fact_evidence"] : []),
      ...(originalUrlCount < 2 ? ["multiple_reference_urls"] : [])
    ]
  };

  const sourceQuality = primaryFact ? 100 : highFactSources.size >= 2 ? 82 : factSourceCount ? 68 : 35;
  const eventPolicyMetadata = {
      version: INTELLIGENCE_POLICY_VERSION,
      evaluatedAt: now.toISOString(),
      eventType,
      eventFreshnessHours: policy.eventFreshnessHours,
      verificationTimeoutHours: policy.verificationTimeoutHours,
      resurrectionWindowHours: policy.resurrectionWindowHours,
      factSourceCount,
      signalSourceCount,
      independentOriginCount: new Set(
        independentEvidence
          .filter((item) =>
            item.relevance.pass &&
            item.contributesEvidenceCount
          )
          .map((item) => item.independentOriginKey)
      ).size,
      systemObserved,
      aiRelevant,
      operationalUsefulness,
      changeMagnitude,
      officialNewsEligible,
      hotspotEligible,
      leadTime: {
        firstSignalAt: firstSignalAt?.toISOString() ?? null,
        firstFactAt: firstFactAt?.toISOString() ?? null,
        leadTimeToConfirmationHours
      },
      scores: {
        officialNews: {
          policyVersion: OFFICIAL_NEWS_POLICY.version,
          aiRelevance: aiRelevant ? 100 : 0,
          changeMagnitude: magnitudeScore(changeMagnitude),
          sourceQuality,
          freshness: freshnessScore(ageHours, policy.eventFreshnessHours),
          opcUsefulness: opcUsefulnessScore(eventType)
        },
        hotspot: {
          policyVersion: HOTSPOT_POLICY.version,
          aiRelevance: aiRelevant ? 100 : 0,
          multiSourceCoverage: Math.min(100, signalSourceCount * 35),
          velocity: 0,
          sourceQuality,
          factSupport: verificationStatus === "CONFIRMED_OFFICIAL" ? 100 : verificationStatus === "CONFIRMED_MEDIA" ? 80 : factSourceCount ? 55 : 0
        }
      },
      confirmationEvidence: independentEvidence.map((item) => ({
        ...item,
        firstObservedAt: item.firstObservedAt?.toISOString() ?? null,
        firstPublishedAt: item.firstPublishedAt?.toISOString() ?? null
      })),
      clusterId,
      memberEventIds: eventIds
  };


 return {verificationStatus,generationReadiness,archivedAt,resurrectedAt,metadata:eventPolicyMetadata,evidence:independentEvidence,relevantRawIds:[...relevantRawIds],factSourceCount,signalSourceCount,confirmedOfficial:verificationStatus==='CONFIRMED_OFFICIAL',confirmedMedia:verificationStatus==='CONFIRMED_MEDIA',officialNewsEligible,hotspotEligible,operationalUsefulness,changeMagnitude,leadTimeToConfirmationHours,aiRelevant,previousStatus};
}

function canonicalEvidenceRelevance(input:Parameters<typeof evaluateEventEvidenceRelevance>[0],event:typeof contentEvents.$inferSelect,publishedAt:Date) {
 const evaluated=evaluateEventEvidenceRelevance(input);
 const exact=Boolean(input.candidateTitle.trim())&&normalizeEventSeedTitle(input.eventTitle)===normalizeEventSeedTitle(input.candidateTitle);
 const match=scoreEventClusterCandidate(event,{...event,id:'evidence',title:input.candidateTitle,firstSeenAt:publishedAt,lastSeenAt:publishedAt});
 const explicit=match?.metadata.rules.includes('EXPLICIT_RELEASE_OBJECT')===true;
 return exact||explicit?{...evaluated,pass:true,reason:'CANONICAL_OBJECT_EVIDENCE_PASS'}:evaluated;
}
