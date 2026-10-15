import { calendarWindow, beijingDay } from "../../content/radar-calendar";
import { isWorthPracticingEligible } from "./practical-evidence-actionability";
import { buildPracticeTopics, rebuildVisiblePracticeTopic } from "./practice-topics";
import "server-only";

import { eq, inArray } from "drizzle-orm";
import { listRadarTimelinePage } from "./intelligence-read-model";
import { getTodayIntelligenceSignalReadiness } from "./today-intelligence-readiness";
import { listSourceRuntimeSummary } from "./source-runtime-operations";
import { getDatabase } from "../db";
import { contentEvents, contentRadarSnapshots } from "../db/schema";

const RADAR_SNAPSHOT_TTL_MS = 30_000;
const RADAR_SNAPSHOT_KEY = "CURRENT";
export const RADAR_SNAPSHOT_SCHEMA_VERSION = "radar-snapshot-v15-public-materials";

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
  const window = calendarWindow(asOf, 7);
  const [initialPage, readiness, collectionHealth] = await Promise.all([
    listRadarTimelinePage({ windowDays: 7, asOf }),
    getTodayIntelligenceSignalReadiness(),
    listSourceRuntimeSummary(100, asOf)
  ]);
  const fullWindow = initialPage.items;
  const items = fullWindow;
  // Worth Practicing is derived from the same canonical Event timeline, using the
  // exact product eligibility rule rather than radarState (a confirmed Event may be
  // tagged LATEST in the timeline even when it is also eligible for practice).
  // Counts, featured and initial items share one complete calendar window.
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
  const worthPracticing = buildPracticeTopics(fullWindow)
    .filter(isWorthPracticingEligible)
    .sort((a, b) =>
      (b.coverage.actionablePracticalOriginCount ?? 0) - (a.coverage.actionablePracticalOriginCount ?? 0) ||
      (b.coverage.actionablePracticalEvidenceCount ?? 0) - (a.coverage.actionablePracticalEvidenceCount ?? 0) ||
      (b.coverage.actionablePracticalTypeCount ?? 0) - (a.coverage.actionablePracticalTypeCount ?? 0) ||
      new Date(b.publishedAt ?? b.collectedAt).getTime() - new Date(a.publishedAt ?? a.collectedAt).getTime()
    )
    .slice(0, 8);
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
    worthPracticing,
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
  if (payload.schemaVersion !== RADAR_SNAPSHOT_SCHEMA_VERSION) return null;
  if ((payload.timelineWindow as { today?: string } | undefined)?.today !== beijingDay(new Date())) return null;
  const hasStoryContract = Array.isArray(payload.items) && payload.items.every((item) => Boolean(item && typeof item === "object" && !Array.isArray(item) && (item as Record<string, unknown>).story));
  if (!hasStoryContract) return null;
  if (
    !Array.isArray(payload.windowEventIndex) ||
    !Array.isArray(payload.items) ||
    !Array.isArray(payload.featured) ||
    !Array.isArray(payload.currentHot) ||
    !Array.isArray(payload.worthPracticing) ||
    typeof payload.totalEventCount7d !== "number" ||
    payload.windowDays !== 7
  ) return null;
  return row.payload as RadarSnapshot;
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
  const generatedAt = new Date(snapshot.generatedAt);
  await getDatabase()
    .insert(contentRadarSnapshots)
    .values({
      key: RADAR_SNAPSHOT_KEY,
      payload: snapshot,
      generatedAt,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: contentRadarSnapshots.key,
      set: {
        payload: snapshot,
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
export function applyRadarOperations<T extends { items: OperationalItem[]; featured: OperationalItem[]; currentHot: OperationalItem[]; worthPracticing: OperationalItem[]; windowEventIndex?: { eventId: string; category: string }[]; categoryCounts7d: Record<string, number>; totalEventCount7d: number }>(snapshot: T, states: EventOperation[]): T {
  const current = new Map(states.map((state) => [state.id, state]));
  const visible = (id: string) => { const state = current.get(id); return state && !state.archivedAt; };
  const project = <I extends OperationalItem>(items: I[]) => items.filter((item) => visible(item.eventId)).map((item) => ({ ...item, discoveryStatus: current.get(item.eventId)!.discoveryStatus }));
  const index = (snapshot.windowEventIndex ?? [...new Map([...snapshot.items, ...snapshot.featured, ...snapshot.currentHot, ...snapshot.worthPracticing].map((item) => [item.eventId, item])).values()]).filter((item) => visible(item.eventId));
  const categoryCounts7d = Object.fromEntries(Object.keys(snapshot.categoryCounts7d).map((category) => [category, category === "全部" ? index.length : index.filter((item) => item.category === category).length]));
  const worthPracticing = snapshot.worthPracticing.flatMap(item => rebuildVisiblePracticeTopic(item, id => Boolean(visible(id))));
  return { ...snapshot, items: project(snapshot.items), featured: project(snapshot.featured), currentHot: project(snapshot.currentHot), worthPracticing: project(worthPracticing), categoryCounts7d, totalEventCount7d: index.length };
}

export async function readRadarOperations<T extends Parameters<typeof applyRadarOperations>[0]>(snapshot: T): Promise<T> {
  const index = snapshot.windowEventIndex ?? [...snapshot.items, ...snapshot.featured, ...snapshot.currentHot, ...snapshot.worthPracticing];
  const ids = [...new Set(index.map((item) => item.eventId))];
  const states = ids.length ? await getDatabase().select({ id: contentEvents.id, discoveryStatus: contentEvents.discoveryStatus, archivedAt: contentEvents.archivedAt }).from(contentEvents).where(inArray(contentEvents.id, ids)) : [];
  return applyRadarOperations(snapshot, states);
}

export async function getRadarSnapshot() {
  // Only the expensive base payload is cached. Operations are read on EVERY request,
  // including from other processes and after a concurrent snapshot refresh.
  const snapshot = await getBaseRadarSnapshot();
  return { ...await readRadarOperations(snapshot), freshness: radarSnapshotFreshness(snapshot.generatedAt) };
}
