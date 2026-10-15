import { isWorthPracticingEligible } from "./practical-evidence-actionability";
import "server-only";

import { eq } from "drizzle-orm";
import { listRadarTimelinePage, listRadarTimelineWindow } from "./intelligence-read-model";
import { getTodayIntelligenceSignalReadiness } from "./today-intelligence-readiness";
import { listSourceRuntimeSummary } from "./source-runtime-operations";
import { getDatabase } from "../db";
import { contentRadarSnapshots } from "../db/schema";

const RADAR_SNAPSHOT_TTL_MS = 30_000;
const RADAR_SNAPSHOT_KEY = "CURRENT";
export const RADAR_SNAPSHOT_SCHEMA_VERSION = "radar-snapshot-v9-content-understanding";

type RadarSnapshot = Awaited<ReturnType<typeof buildRadarSnapshot>>;
const globalForRadarSnapshot = globalThis as typeof globalThis & {
  __opcRadarSnapshotCache?: {
    expiresAt: number;
    promise: Promise<RadarSnapshot>;
  };
};

async function buildRadarSnapshot() {
  const startedAt = Date.now();
  const [initialPage, fullWindow, readiness, collectionHealth] = await Promise.all([
    listRadarTimelinePage({ limit: 120, windowDays: 7 }),
    listRadarTimelineWindow(7),
    getTodayIntelligenceSignalReadiness(),
    listSourceRuntimeSummary(100)
  ]);
  const items = initialPage.items;
  // Worth Practicing is derived from the same canonical Event timeline, using the
  // exact product eligibility rule rather than radarState (a confirmed Event may be
  // tagged LATEST in the timeline even when it is also eligible for practice).
  // Featured is derived from the full seven-day Event window so a curated Event can never
  // disappear merely because it fell outside the first 120-item timeline page.
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
  const worthPracticing = fullWindow
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
    generatedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    items,
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
  const hasStoryContract = Array.isArray(payload.items) && payload.items.every((item) => Boolean(item && typeof item === "object" && !Array.isArray(item) && (item as Record<string, unknown>).story));
  if (!hasStoryContract) return null;
  if (
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

export function getRadarSnapshot() {
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
