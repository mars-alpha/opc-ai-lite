import "server-only";

import { and, asc, desc, eq, gte, inArray, isNull, lte, ne, or, sql } from "drizzle-orm";
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
import { normalizeEventSeedTitle, scoreEventSeedCandidate } from "./event-seed-clustering";

export const EVENT_CLUSTER_RULE_VERSION = "event-cluster-v7-versioned-release";
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
  summary?: string | null;
  keywords: unknown;
  entities: unknown;
  eventType?: string;
  primaryEntityId?: string | null;
  subjectEntityId?: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
};

export type EventClusterCandidateScore = {
  eventId: string;
  score: number;
  reason: "TITLE_EXACT" | "TITLE_TOKEN_OVERLAP" | "ACTION_ENTITY_MATCH" | "ENTITY_FACT_ANCHOR";
  metadata: {
    titleScore: number;
    tokenOverlap: number;
    jaccard: number;
    keywordOverlap: number;
    entityOverlap: number;
    sharedTokenCount: number;
    hoursApart: number;
    actionSignature?: string | null;
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

type EventObjectSignature = "SYNTHID" | "CLAUDE_HAIKU";
type EventActionSignature =
  | "PRODUCT_UI_ROLLOUT"
  | "EU_TEXT_PROVENANCE"
  | "AI_CONTENT_DETECTOR_ROLLOUT"
  | "MODEL_VARIANT_RELEASE";

function objectSignature(event: EventLike): EventObjectSignature | null {
  const text = [event.title, event.summary ?? ""].join(" ").normalize("NFKC").toLocaleLowerCase();
  const entities = new Set(stringList(event.entities));

  if (/\bsynthid\b/i.test(text)) return "SYNTHID";

  const explicitClaudeHaiku = /claude\s+haiku|haiku\s*5(?:\.5)?/i.test(text);
  const claudeSmallModel =
    entities.has("model_claude") &&
    /小模型|small model|small-model|lightweight model|轻量模型/i.test(text);
  if (explicitClaudeHaiku || claudeSmallModel) return "CLAUDE_HAIKU";

  return null;
}

function actionSignature(event: EventLike): EventActionSignature | null {
  const text = [event.title, event.summary ?? ""].join(" ").normalize("NFKC").toLocaleLowerCase();
  const object = objectSignature(event);

  const uiObject =
    /\bui\b|\binterface\b|user interface|interactive visual|visual experience|界面|交互式|可视化|视觉化|聊天框/.test(text);
  const rolloutAction =
    /launch|roll(?:ing)? out|release|introduc|new interface|free to use|推出|上线|发布|今起|免费用|全新界面|长出界面/.test(text);
  if (uiObject && rolloutAction) return "PRODUCT_UI_ROLLOUT";

  const provenanceObject = /watermark|provenance|水印|溯源/.test(text);
  const euScope = /\beu\b|european union|欧盟/.test(text);
  if (provenanceObject && euScope) return "EU_TEXT_PROVENANCE";

  const detectorObject = /detector|detect|identify|verify|检测器|检测|识别|验证/.test(text);
  if (object === "SYNTHID" && detectorObject && rolloutAction) return "AI_CONTENT_DETECTOR_ROLLOUT";

  const explicitModelRelease =
    event.eventType === "MODEL_RELEASE" ||
    /new model|model release|launch|release|推出|发布|上线|新模型/.test(text);
  const versionedClaudeHaikuTitle = /claude\s+haiku\s+\d+(?:\.\d+)?/i.test(event.title);
  if (object === "CLAUDE_HAIKU" && (explicitModelRelease || versionedClaudeHaikuTitle)) {
    return "MODEL_VARIANT_RELEASE";
  }

  return null;
}

function versionTokens(value: string) {
  return new Set(
    value
      .normalize("NFKC")
      .toLocaleLowerCase()
      .match(/\bv(?:ersion)?\s*\d+(?:\.\d+)*\b|\b\d+(?:\.\d+)+\b/gi)?.map(v=>v.replace(/^v(?:ersion)?\s*/i,'')) ?? []
  );
}

function hasVersionConflict(left: string, right: string) {
  const a = versionTokens(left);
  const b = versionTokens(right);
  if (a.size === 0 || b.size === 0) return false;
  for (const value of a) if (b.has(value)) return false;
  return true;
}

function releaseObject(title:string) {
  const text=title.normalize('NFKC').toLowerCase();
  // Explicit family + numeric version + optional named variant. Channel rollout
  // is evidence of the same release, never a new identity by destination alone.
  const models=[...text.matchAll(/(?<![a-z0-9])(?:gemini|claude|gpt|llama|qwen|deepseek)\s*[- ]?\s*\d+(?:\.\d+)*(?:\s*[- ]\s*(?:argon|opus|sonnet|haiku|pro|flash|nano|ultra|turbo|mini|max))?(?![a-z0-9])/gi)].map(m=>m[0].replace(/[\s-]+/g,''));
  if(models.length)return new Set(models).size===1?models[0]:null;
  const objects=[...text.matchAll(/(?<![a-z0-9])muse\s*(?:spark\s*open|wonder(?:\s*(?:full|max))?)(?:\s+(?:v\d+(?:\.\d+)*|\d+(?:\.\d+)+))?(?![a-z0-9])/gi)].map(m=>m[0].replace(/\s+/g,''));
  return new Set(objects).size===1?objects[0]:null;
}
function independentReleaseAction(title:string){
  return /\b(?:updates?|updated|adds?|added|retires?|deprecat\w*)\b|\b(?:pricing|prices?|security|breach|cve|patch)\b|\bnow\s+supports?\b|\bapi\b.*\bsupports?\b|outage|vulnerabilit|funding|acquisit|新增|更新|升级|退役|融资|事故|漏洞|安全|降价|价格|涨价|停止服务|停止支持/i.test(title);
}

function versionedModelReleaseReport(title:string) {
  return /release|launch|roll(?:ing)?\s*out|available|\bin\s+github\s+copilot\b|\bcomes?\s+to\b|day[ -]*0|发布|上线|上架|开放|推出|首发/i.test(title)&&
    !/\b(?:benchmark|comparison|review|tutorial|versus)\b|实测|评测|教程|对比|如何评价|性能测试/i.test(title);
}

/** Hard exclusions also apply to semantic advice; AI cannot override them. */
export function eventRelationHardConflict(left:EventLike,right:EventLike){
 const a=releaseObject(left.title),b=releaseObject(right.title);
 const av=versionTokens(left.title),bv=versionTokens(right.title);
 const versionConflict=av.size>0&&bv.size>0&&([...av].some(v=>!bv.has(v))||[...bv].some(v=>!av.has(v)));
 return Boolean((a&&b&&a!==b)||versionConflict||independentReleaseAction(left.title)||independentReleaseAction(right.title)||
  (left.subjectEntityId&&right.subjectEntityId&&left.subjectEntityId!==right.subjectEntityId)||
  Math.abs(left.firstSeenAt.getTime()-right.firstSeenAt.getTime())>72*3600000);
}

/** Complete linkage prevents broad articles bridging incompatible clusters. */
export function canCombineEventClusters(left:EventLike[],right:EventLike[]) {
  if(!left.length||!right.length||left.length+right.length>100)return false;
  const all=[...left,...right];
  if(Math.max(...all.map(e=>e.firstSeenAt.getTime()))-Math.min(...all.map(e=>e.firstSeenAt.getTime()))>EVENT_CLUSTER_TIME_WINDOW_HOURS*3600000)return false;
  return left.every(a=>right.every(b=>Boolean(scoreEventClusterCandidate(a,b))));
}

export function scoreEventClusterCandidate(
  anchor: EventLike,
  candidate: EventLike
): EventClusterCandidateScore | null {
  const leftObject=releaseObject(anchor.title),rightObject=releaseObject(candidate.title);
  if(leftObject&&rightObject){
    // Both titles explicitly identify the same version. Legacy subject extraction
    // can incorrectly label a release with a competitor mentioned in its body.
    if(leftObject!==rightObject||hasVersionConflict(anchor.title,candidate.title)||independentReleaseAction(anchor.title)||independentReleaseAction(candidate.title))return null;
    if(!leftObject.startsWith('muse')&&(!versionedModelReleaseReport(anchor.title)||!versionedModelReleaseReport(candidate.title)))return null;
    const hoursApart=Math.abs(anchor.firstSeenAt.getTime()-candidate.firstSeenAt.getTime())/3600000;
    if(hoursApart>EVENT_CLUSTER_TIME_WINDOW_HOURS)return null;
    return {eventId:candidate.id,score:98,reason:'ACTION_ENTITY_MATCH',metadata:{titleScore:0,tokenOverlap:0,jaccard:0,keywordOverlap:0,entityOverlap:0,sharedTokenCount:0,hoursApart,actionSignature:leftObject,rules:['EXPLICIT_RELEASE_OBJECT','TIME_WINDOW','VERSION_CONFLICT_GUARDED']}};
  }
  const hoursApart =
    Math.abs(anchor.lastSeenAt.getTime() - candidate.lastSeenAt.getTime()) /
    (60 * 60 * 1000);
  if (hoursApart > EVENT_CLUSTER_TIME_WINDOW_HOURS) return null;
  const anchorEntities = stringList(anchor.entities);
  const candidateEntities = stringList(candidate.entities);
  const entityOverlap = termOverlap(anchorEntities, candidateEntities);
  if (anchorEntities.length && candidateEntities.length && entityOverlap === 0) return null;
  const anchorAction = actionSignature(anchor);
  const candidateAction = actionSignature(candidate);
  const sharedAction = anchorAction && anchorAction === candidateAction ? anchorAction : null;

  if (sharedAction && entityOverlap > 0 && !hasVersionConflict(anchor.title, candidate.title)) {
    return {
      eventId: candidate.id,
      score: hoursApart <= 24 ? 96 : 92,
      reason: "ACTION_ENTITY_MATCH",
      metadata: {
        titleScore: 0,
        tokenOverlap: 0,
        jaccard: 0,
        keywordOverlap: termOverlap(stringList(anchor.keywords), stringList(candidate.keywords)),
        entityOverlap,
        sharedTokenCount: 0,
        hoursApart,
        actionSignature: sharedAction,
        rules: ["ACTION_SIGNATURE_MATCH", "ENTITY_OVERLAP", "TIME_WINDOW"]
      }
    };
  }

  if (
    (anchor.eventType ?? "INDUSTRY_HOTSPOT") !== "INDUSTRY_HOTSPOT" &&
    (candidate.eventType ?? "INDUSTRY_HOTSPOT") !== "INDUSTRY_HOTSPOT" &&
    anchor.eventType !== candidate.eventType
  ) return null;
  if (
    anchor.primaryEntityId &&
    candidate.primaryEntityId &&
    anchor.primaryEntityId !== candidate.primaryEntityId &&
    entityOverlap === 0
  ) return null;
  if (
    anchor.subjectEntityId &&
    candidate.subjectEntityId &&
    anchor.subjectEntityId !== candidate.subjectEntityId &&
    ["MODEL_RELEASE", "PRODUCT_FEATURE_RELEASE", "API_PLATFORM_UPDATE", "OPEN_SOURCE"].includes(anchor.eventType ?? "")
  ) return null;

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
        actionSignature: null,
        rules: ["TITLE_EXACT", "TIME_WINDOW"]
      }
    };
  }

  if (hasVersionConflict(anchor.title, candidate.title)) {
    void VERSION_CONFLICT;
    return null;
  }

  const factAnchor = scoreEventSeedCandidate(
    { title: anchor.title, keywords: stringList(anchor.keywords), entities: anchorEntities, eventType: anchor.eventType, observedAt: anchor.lastSeenAt },
    candidate
  );
  if (factAnchor?.reason === "ENTITY_FACT_ANCHOR") {
    return {
      eventId: candidate.id,
      score: factAnchor.score,
      reason: "ENTITY_FACT_ANCHOR",
      metadata: {
        titleScore: factAnchor.metadata.titleScore,
        tokenOverlap: factAnchor.metadata.tokenOverlap,
        jaccard: factAnchor.metadata.jaccard,
        keywordOverlap: factAnchor.metadata.keywordOverlap,
        entityOverlap: factAnchor.metadata.entityOverlap,
        sharedTokenCount: 0,
        hoursApart,
        actionSignature: null,
        rules: factAnchor.metadata.rules
      }
    };
  }

  const titleStats = overlapStats(titleTokens(anchor.title), titleTokens(candidate.title));
  if (titleStats.intersection < 2) return null;

  const keywordOverlap = termOverlap(stringList(anchor.keywords), stringList(candidate.keywords));
  if (anchorEntities.length && candidateEntities.length && entityOverlap === 0) return null;
  let titleScore = Math.round(Math.max(titleStats.jaccard * 100, titleStats.overlap * 78));

  let score = titleScore + Math.round(entityOverlap * 18);
  if (titleScore >= 45) {
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
      actionSignature: null,
      rules: ["TITLE_TOKEN_OVERLAP", "ENTITY_COMPATIBLE", "EVENT_TYPE_COMPATIBLE", "TIME_WINDOW"]
    }
  };
}

async function getMemberEvents(clusterId: string, db = getDatabase()) {
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

async function refreshClusterAggregate(clusterId: string, db = getDatabase()) {
  const { members, events } = await getMemberEvents(clusterId, db);
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

export async function ensurePrimaryCluster(event: EventLike, db = getDatabase()) {
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

  return refreshClusterAggregate(cluster.id, db);
}

/** Core-only: caller must hold clustering advisory lock and validate whole-group proof. */
export async function mergeEventClusters(input: {
  leftClusterId: string;
  rightClusterId: string;
  reason: EventClusterCandidateScore;
}, db = getDatabase()) {
  if (input.leftClusterId === input.rightClusterId) {
    const [same] = await db.select().from(contentEventClusters)
      .where(eq(contentEventClusters.id, input.leftClusterId)).limit(1);
    if (!same) throw new Error("EVENT_CLUSTER_NOT_FOUND");
    return same;
  }

  const clusters = await db.select().from(contentEventClusters)
    .where(inArray(contentEventClusters.id, [input.leftClusterId, input.rightClusterId]));
  if (clusters.length !== 2) throw new Error("EVENT_CLUSTER_MERGE_TARGET_MISSING");

  const [winner, loser] = [...clusters].sort((a, b) =>
    a.firstSeenAt.getTime() - b.firstSeenAt.getTime() ||
    a.createdAt.getTime() - b.createdAt.getTime() ||
    a.id.localeCompare(b.id)
  );
  const loserMembers = await db.select().from(contentEventClusterMembers)
    .where(eq(contentEventClusterMembers.clusterId, loser.id));

  await db.transaction(async (tx) => {
    for (const member of loserMembers) {
      await tx.update(contentEventClusterMembers).set({
        clusterId: winner.id,
        role: member.eventId === winner.primaryEventId ? "PRIMARY" : "MEMBER",
        clusterRuleVersion: EVENT_CLUSTER_RULE_VERSION,
        mergeReason: input.reason.reason,
        mergeScore: input.reason.score,
        mergeMetadata: {
          ...input.reason.metadata,
          mergedFromClusterId: loser.id,
          mergedIntoClusterId: winner.id
        }
      }).where(eq(contentEventClusterMembers.id, member.id));
    }

    const winnerMetadata = winner.metadata && typeof winner.metadata === "object" && !Array.isArray(winner.metadata)
      ? winner.metadata as Record<string, unknown>
      : {};
    const previousMerged = Array.isArray(winnerMetadata.mergedClusterIds)
      ? winnerMetadata.mergedClusterIds.filter((value): value is string => typeof value === "string")
      : [];
    await tx.update(contentEventClusters).set({
      metadata: {
        ...winnerMetadata,
        mergedClusterIds: [...new Set([...previousMerged, loser.id])],
        lastMergeRuleVersion: EVENT_CLUSTER_RULE_VERSION,
        lastMergeReason: input.reason.reason,
        lastMergeScore: input.reason.score
      },
      updatedAt: new Date()
    }).where(eq(contentEventClusters.id, winner.id));
    await tx.delete(contentEventClusters).where(eq(contentEventClusters.id, loser.id));
  });

  return refreshClusterAggregate(winner.id, db);
}

export async function runEventClustering(eventId: string) {
  return getDatabase().transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('opc-event-clustering-v6'))`);
    return runEventClusteringLocked(eventId, tx as unknown as ReturnType<typeof getDatabase>);
  });
}
/** SYSTEM maintenance of existing events; version receipts live on cluster members.
 * No new ingestion is required. Each event uses the same lock/full-link proof as
 * ingestion; a failed transaction remains due for a later cycle. */
export async function reconcileEventClusters(options: {limit?:number;eventIds?:string[];timeBudgetMs?:number} = {}) {
  const limit=Math.max(1,Math.min(100,Math.floor(options.limit??20)));
  const started=Date.now(),now=new Date(),db=getDatabase();
  const result={version:EVENT_CLUSTER_RULE_VERSION,selected:0,reconciled:0,alreadyCurrent:0,failed:0,deferred:0};
  if(options.eventIds?.length===0)return result;
  const due=await db.select({id:contentEvents.id}).from(contentEvents).where(and(
    isNull(contentEvents.archivedAt),lte(contentEvents.createdAt,now),lte(contentEvents.firstSeenAt,now),or(isNull(contentEvents.eventAt),lte(contentEvents.eventAt,now)),
    or(gte(contentEvents.lastSeenAt,new Date(now.getTime()-168*3600000)),sql`${contentEvents.metadata}->'aiHotspotPractice' is not null`),
    options.eventIds?inArray(contentEvents.id,options.eventIds):undefined,
    sql`not exists (select 1 from ${contentEventClusterMembers} m where m.event_id = ${contentEvents.id} and m.cluster_rule_version = ${EVENT_CLUSTER_RULE_VERSION})`
  )).orderBy(sql`(${contentEvents.metadata}->'aiHotspotPractice' is not null) desc`,asc(contentEvents.firstSeenAt),asc(contentEvents.id)).limit(limit);
  result.selected=due.length;
  for(let index=0;index<due.length;index++){
    if(Date.now()-started>=Math.max(1,options.timeBudgetMs??45000)){result.deferred=due.length-index;break;}
    const [current]=await db.select({version:contentEventClusterMembers.clusterRuleVersion}).from(contentEventClusterMembers).where(eq(contentEventClusterMembers.eventId,due[index].id));
    if(current?.version===EVENT_CLUSTER_RULE_VERSION){result.alreadyCurrent++;continue;}
    try{await runEventClustering(due[index].id);result.reconciled++;}catch{result.failed++;}
  }
  return result;
}
async function runEventClusteringLocked(eventId: string, db:ReturnType<typeof getDatabase>) {
  const [target] = await db
    .select()
    .from(contentEvents)
    .where(eq(contentEvents.id, eventId))
    .limit(1);
  if (!target) throw new Error("EVENT_NOT_FOUND");

  if(target.archivedAt)return getEventClusterResearchPack(eventId,db);
  let cluster = await ensurePrimaryCluster(target,db);
  const start = new Date(target.firstSeenAt.getTime() - EVENT_CLUSTER_TIME_WINDOW_HOURS * 60 * 60 * 1000);
  const end = new Date(target.lastSeenAt.getTime() + EVENT_CLUSTER_TIME_WINDOW_HOURS * 60 * 60 * 1000);

  const candidates = await db
    .select()
    .from(contentEvents)
    .where(
      and(
        ne(contentEvents.id, target.id),
        gte(contentEvents.lastSeenAt, start),
        lte(contentEvents.firstSeenAt, end),
        isNull(contentEvents.archivedAt)
      )
    )
    .orderBy(desc(contentEvents.lastSeenAt), desc(contentEvents.id));

  const candidateIds = candidates.map((item) => item.id);
  const existingMemberships = candidateIds.length
    ? await db
        .select()
        .from(contentEventClusterMembers)
        .where(inArray(contentEventClusterMembers.eventId, candidateIds))
    : [];
  const membershipByEvent = new Map(existingMemberships.map((item) => [item.eventId, item]));

  let { events: memberEvents } = await getMemberEvents(cluster.id, db);
  const memberIds = new Set(memberEvents.map((item) => item.id));
  let changed = true;

  while (changed) {
    changed = false;

    for (const candidate of candidates) {
      if (memberIds.has(candidate.id)) continue;
      let best: EventClusterCandidateScore | null = null;
      for (const anchor of memberEvents) {
        const scored = scoreEventClusterCandidate(anchor, candidate);
        if (!scored) continue;
        if (!best || scored.score > best.score) best = scored;
      }
      if (!best) continue;

      const existing = membershipByEvent.get(candidate.id);
      const incoming=existing ? (await getMemberEvents(existing.clusterId,db)).events : [candidate];
      if(incoming.some(e=>e.archivedAt)||!canCombineEventClusters(memberEvents,incoming))continue;
      if (existing && existing.clusterId !== cluster.id) {
        cluster = await mergeEventClusters({
          leftClusterId: cluster.id,
          rightClusterId: existing.clusterId,
          reason: best
        },db);
        const merged = await getMemberEvents(cluster.id, db);
        memberEvents = merged.events;
        memberIds.clear();
        for (const memberEvent of memberEvents) memberIds.add(memberEvent.id);
        changed = true;
        continue;
      }

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

  const refreshed = await refreshClusterAggregate(cluster.id, db);
  await db.update(contentEventClusters).set({
    clusterRuleVersion: EVENT_CLUSTER_RULE_VERSION,
    updatedAt: new Date()
  }).where(eq(contentEventClusters.id, refreshed.id));
  await db.update(contentEventClusterMembers).set({
    clusterRuleVersion: EVENT_CLUSTER_RULE_VERSION
  }).where(eq(contentEventClusterMembers.clusterId, refreshed.id));
  return getEventClusterResearchPack(refreshed.primaryEventId,db);
}

export async function getEventClusterResearchPack(eventId: string, db = getDatabase()) {
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

  const { members, events } = await getMemberEvents(cluster.id, db);
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
