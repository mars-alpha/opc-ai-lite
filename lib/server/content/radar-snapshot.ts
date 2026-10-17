import {appendMomentumHistory} from './topic-momentum-history';
import {readRadarAlgorithmPolicy} from './radar-algorithm-store';
import { calendarWindow, beijingDay } from "../../content/radar-calendar";
import { compactRadarSnapshot, expandRadarSnapshot } from "../../content/radar-snapshot-storage";
import {recordAiHotspotPracticeTriggers,listAiHotspotPractices} from "./ai-hotspot-practice-store";
import "server-only";

import { eq, inArray, sql } from "drizzle-orm";
import { listRadarTimelinePage } from "./intelligence-read-model";
import { getTodayIntelligenceSignalReadiness } from "./today-intelligence-readiness";
import { listSourceRuntimeSummary } from "./source-runtime-operations";
import { getDatabase } from "../db";
import { contentEvents, contentRadarSnapshots,contentEventClusterMembers,contentEventClusters } from "../db/schema";
import {canonicalOperationStates} from './canonical-event';
import {isToolPracticeRecord} from './ai-hotspot-practice';

const RADAR_SNAPSHOT_TTL_MS = 30_000;
const RADAR_SNAPSHOT_KEY = "CURRENT";
export const RADAR_SNAPSHOT_SCHEMA_VERSION = "radar-snapshot-v17-compact-storage";
const PREVIOUS_RADAR_SNAPSHOT_SCHEMA_VERSION = "radar-snapshot-v16-audit-fixes";

type RadarSnapshot = Awaited<ReturnType<typeof buildRadarSnapshot>>;
const globalForRadarSnapshot = globalThis as typeof globalThis & {
  __opcRadarSnapshotCache?: {
    expiresAt: number;
    promise: Promise<RadarSnapshot>;
  };
};

async function buildRadarSnapshot() {
  const startedAt = Date.now();
  const asOf = new Date();
  const algorithm=await readRadarAlgorithmPolicy();
  const window = calendarWindow(asOf, 7);
  const [initialPage, readiness, collectionHealth] = await Promise.all([
    listRadarTimelinePage({ windowDays: 7, asOf,algorithm }),
    getTodayIntelligenceSignalReadiness(),
    listSourceRuntimeSummary(100, asOf)
  ]);
  const fullWindow = initialPage.items;
  const items = fullWindow;
  const featured = fullWindow
    .filter((item) => item.curation.curated)
    .sort((a, b) =>
      b.curation.score - a.curation.score ||
      new Date(b.publishedAt ?? b.collectedAt).getTime() - new Date(a.publishedAt ?? a.collectedAt).getTime()
    )
    .map((item, index) => ({
      ...item,
      curation: { ...item.curation, featuredRank: index + 1, rerankAuthority: "PRESENTATION_ONLY" as const }
    }));
  await recordAiHotspotPracticeTriggers(fullWindow.map((item) => ({ ...item, hotParticipants: item.aiPracticeParticipants })),asOf,algorithm.policy);
  const aiHotspotPractices = await listAiHotspotPractices(algorithm.policy);
  const currentHot = fullWindow
    .filter((item) => item.currentHot.eligible)
    .sort((a, b) =>
      b.topicMomentum.score - a.topicMomentum.score ||
      Number(b.topicMomentum.status === "SUSTAINED") - Number(a.topicMomentum.status === "SUSTAINED") ||
      b.topicMomentum.independentParticipantCount - a.topicMomentum.independentParticipantCount ||
      new Date(b.publishedAt ?? b.collectedAt).getTime() -
        new Date(a.publishedAt ?? a.collectedAt).getTime()
    )
    .slice(0, 10);
  const categoryCounts7d = Object.fromEntries(
    ["全部", "模型", "产品", "开发者", "行业", "论文", "社区", "自媒体"].map((category) => [
      category,
      category === "全部" ? fullWindow.length : fullWindow.filter((item) => item.category === category).length
    ])
  );

  return {
    algorithmRevision:algorithm.revision,
    schemaVersion: RADAR_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: asOf.toISOString(),
    timelineWindow: { from: window.from.toISOString(), to: asOf.toISOString(), today: window.today, firstDay: window.firstDay, timeZone: window.timeZone },
    elapsedMs: Date.now() - startedAt,
    items,
    windowEventIndex: fullWindow.map((item) => ({ eventId: item.eventId, category: item.category })),
    totalEventCount7d: fullWindow.length,
    categoryCounts7d,
    windowDays: 7 as const,
    hasMore: initialPage.hasMore,
    nextCursor: initialPage.nextCursor,
    featured,
    currentHot,
    aiHotspotPractices,
    readiness,
    collectionHealth
  };
}

async function readPersistedRadarSnapshot() {
  const [row] = await getDatabase()
    .select()
    .from(contentRadarSnapshots)
    .where(eq(contentRadarSnapshots.key, RADAR_SNAPSHOT_KEY))
    .limit(1);
  if (!row) return null;
  const payload = row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
    ? row.payload as Record<string, unknown>
    : {};
  if (payload.schemaVersion !== RADAR_SNAPSHOT_SCHEMA_VERSION && payload.schemaVersion !== PREVIOUS_RADAR_SNAPSHOT_SCHEMA_VERSION) return null;
  if ((payload.timelineWindow as { today?: string } | undefined)?.today !== beijingDay(new Date())) return null;
  const hasStoryContract = Array.isArray(payload.items) && payload.items.every((item) => Boolean(item && typeof item === "object" && !Array.isArray(item) && (item as Record<string, unknown>).story));
  if (!hasStoryContract) return null;
  if (
    !Array.isArray(payload.windowEventIndex) ||
    !Array.isArray(payload.items) ||
    !Array.isArray(payload.featured) ||
    !Array.isArray(payload.currentHot) ||
    !Array.isArray(payload.aiHotspotPractices) ||
    typeof payload.totalEventCount7d !== "number" ||
    payload.windowDays !== 7
  ) return null;
  if (payload.schemaVersion === PREVIOUS_RADAR_SNAPSHOT_SCHEMA_VERSION) return row.payload as RadarSnapshot;
  try {
    return expandRadarSnapshot(row.payload as ReturnType<typeof compactRadarSnapshot<RadarSnapshot["items"][number], RadarSnapshot>>);
  } catch {
    return null;
  }
}

function cacheSnapshot(snapshot: RadarSnapshot) {
  const promise = Promise.resolve(snapshot);
  globalForRadarSnapshot.__opcRadarSnapshotCache = {
    expiresAt: Date.now() + RADAR_SNAPSHOT_TTL_MS,
    promise
  };
  return promise;
}

export async function refreshRadarSnapshot() {
  const snapshot = await buildRadarSnapshot();
  // Only the SYSTEM refresh path writes observations; ordinary page reads remain read-only.
  if(snapshot.items.length)await getDatabase().transaction(async tx=>{
   const rows=await tx.select({id:contentEvents.id,metadata:contentEvents.metadata}).from(contentEvents).where(inArray(contentEvents.id,snapshot.items.map(i=>i.eventId))).for('update');
   const changes=rows.flatMap(event=>{
    const item=snapshot.items.find(i=>i.eventId===event.id)!,meta=(event.metadata??{}) as Record<string,unknown>,m=item.topicMomentum;
    const history=appendMomentumHistory(meta.topicMomentumHistory,{at:snapshot.generatedAt,version:m.version,inputVersion:item.momentumInputVersion,algorithmRevision:snapshot.algorithmRevision,score:m.score,participantCount:m.independentParticipantCount,components:{participantActivity:m.participantActivity,decayFactor:m.decayFactor,activeDayCount:m.activeDayCount,creatorCount:m.creatorCount,practicalTypes:m.practicalTypes}});
    return JSON.stringify(history)===JSON.stringify(meta.topicMomentumHistory)?[]:[{id:event.id,history}];
   });
   if(changes.length)await tx.execute(sql`update content_events e set metadata=jsonb_set(e.metadata,'{topicMomentumHistory}',p.history,true) from jsonb_to_recordset(${JSON.stringify(changes)}::jsonb) as p(id text,history jsonb) where e.id=p.id`);
  });
  const storedPayload = compactRadarSnapshot(snapshot);
  const generatedAt = new Date(snapshot.generatedAt);
  await getDatabase()
    .insert(contentRadarSnapshots)
    .values({
      key: RADAR_SNAPSHOT_KEY,
      payload: storedPayload,
      generatedAt,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: contentRadarSnapshots.key,
      set: {
        payload: storedPayload,
        generatedAt,
        updatedAt: new Date()
      }
    });
  cacheSnapshot(snapshot);
  return snapshot;
}

function getBaseRadarSnapshot() {
  const now = Date.now();
  const cached = globalForRadarSnapshot.__opcRadarSnapshotCache;
  if (cached && cached.expiresAt > now) return cached.promise;
  const entry = {
    expiresAt: Number.POSITIVE_INFINITY,
    promise: Promise.resolve(null as never as RadarSnapshot)
  };
  const promise = readPersistedRadarSnapshot()
    .then((persisted) => persisted ?? refreshRadarSnapshot())
    .then((snapshot) => {
      if (globalForRadarSnapshot.__opcRadarSnapshotCache === entry) {
        entry.expiresAt = Date.now() + RADAR_SNAPSHOT_TTL_MS;
      }
      return snapshot;
    })
    .catch((error) => {
    if (globalForRadarSnapshot.__opcRadarSnapshotCache === entry) {
      delete globalForRadarSnapshot.__opcRadarSnapshotCache;
    }
    throw error;
  });
  entry.promise = promise;
  globalForRadarSnapshot.__opcRadarSnapshotCache = entry;
  return promise;
}

export function invalidateRadarSnapshot() {
  delete globalForRadarSnapshot.__opcRadarSnapshotCache;
}


export function radarSnapshotFreshness(generatedAt: string, now = new Date()) {
  const generated = new Date(generatedAt).getTime();
  const maxAgeSeconds = 30 * 60;
  const valid = Number.isFinite(generated) && generated <= now.getTime();
  const ageSeconds = valid ? Math.floor((now.getTime() - generated) / 1000) : null;
  return { ageSeconds, maxAgeSeconds, stale: !valid || ageSeconds! > maxAgeSeconds,
    reason: !Number.isFinite(generated) ? "INVALID_GENERATED_AT" : generated > now.getTime() ? "FUTURE_GENERATED_AT" : ageSeconds! > maxAgeSeconds ? "STALE" : "FRESH" };
}

type OperationalItem = { eventId: string; category: string; discoveryStatus?: string | null };
type EventOperation = { id: string; discoveryStatus: string; archivedAt: Date | null };
export function applyRadarOperations<T extends { items: OperationalItem[]; featured: OperationalItem[]; currentHot: OperationalItem[]; aiHotspotPractices: {eventId:string}[]; windowEventIndex?: { eventId: string; category: string }[]; categoryCounts7d: Record<string, number>; totalEventCount7d: number }>(snapshot: T, states: EventOperation[]): T {
  const current = new Map(states.map((state) => [state.id, state]));
  const visible = (id: string) => { const state = current.get(id); return state && !state.archivedAt; };
  const project = <I extends OperationalItem>(items: I[]) => items.filter((item) => visible(item.eventId)).map((item) => ({ ...item, discoveryStatus: current.get(item.eventId)!.discoveryStatus }));
  const index = (snapshot.windowEventIndex ?? [...new Map([...snapshot.items, ...snapshot.featured, ...snapshot.currentHot].map((item) => [item.eventId, item])).values()]).filter((item) => visible(item.eventId));
  const categoryCounts7d = Object.fromEntries(Object.keys(snapshot.categoryCounts7d).map((category) => [category, category === "全部" ? index.length : index.filter((item) => item.category === category).length]));
  const aiHotspotPractices = snapshot.aiHotspotPractices.filter(item => visible(item.eventId));
  return { ...snapshot, items: project(snapshot.items), featured: project(snapshot.featured), currentHot: project(snapshot.currentHot), aiHotspotPractices, categoryCounts7d, totalEventCount7d: index.length };
}

export async function readRadarOperations<T extends Parameters<typeof applyRadarOperations>[0]>(snapshot: T): Promise<T> {
  const index = snapshot.windowEventIndex ?? [...snapshot.items, ...snapshot.featured, ...snapshot.currentHot];
  const ids = [...new Set([...index,...snapshot.aiHotspotPractices].map((item) => item.eventId))];
  if(!ids.length)return applyRadarOperations(snapshot,[]);
  return getDatabase().transaction(async tx=>{
   const memberships=await tx.select().from(contentEventClusterMembers).where(inArray(contentEventClusterMembers.eventId,ids));
   const clusterIds=[...new Set(memberships.map(m=>m.clusterId))];
   const clusters=clusterIds.length?await tx.select().from(contentEventClusters).where(inArray(contentEventClusters.id,clusterIds)):[];
   const allMemberships=clusterIds.length?await tx.select().from(contentEventClusterMembers).where(inArray(contentEventClusterMembers.clusterId,clusterIds)):[];
   const eventIds=[...new Set([...ids,...allMemberships.map(m=>m.eventId)])];
   const rows=await tx.select({id:contentEvents.id,discoveryStatus:contentEvents.discoveryStatus,archivedAt:contentEvents.archivedAt,createdAt:contentEvents.createdAt,firstSeenAt:contentEvents.firstSeenAt,lastSeenAt:contentEvents.lastSeenAt,eventAt:contentEvents.eventAt}).from(contentEvents).where(inArray(contentEvents.id,eventIds));
   return applyRadarOperations(snapshot,canonicalOperationStates(rows,allMemberships,clusters));
  },{accessMode:'read only',isolationLevel:'repeatable read'});
}

export async function getRadarSnapshot() {
  // Only the expensive base payload is cached. Operations are read on EVERY request,
  // including from other processes and after a concurrent snapshot refresh.
  const snapshot = await getBaseRadarSnapshot();
  const current=await readRadarOperations(snapshot);
  // Old persisted snapshots may still contain model-news triggers. Classification
  // is deterministic and uses original records, before any AI display wording.
  return { ...current, aiHotspotPractices:current.aiHotspotPractices.filter(r=>isToolPracticeRecord(r)), freshness: radarSnapshotFreshness(snapshot.generatedAt) };
}
