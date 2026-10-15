import "server-only";

import { desc, eq, inArray } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentCollectionRuns,
  contentRawItemObservations,
  contentRawItems,
  contentSources
} from "../db/schema";

export const SOURCE_CAPABILITY_STATUSES = [
  "LIVE_PASS",
  "FALLBACK_ONLY",
  "CONFIG_REQUIRED",
  "READY_NO_LIVE_RUN",
  "BLOCKED_NETWORK",
  "BLOCKED_RATE_LIMIT",
  "NOT_IMPLEMENTED"
] as const;

export type SourceCapabilityStatus = (typeof SOURCE_CAPABILITY_STATUSES)[number];

export type SourceCapabilityRow = {
  key: string;
  name: string;
  category: "OFFICIAL" | "MEDIA" | "RESEARCH" | "TREND" | "CREATOR" | "TOOL";
  status: SourceCapabilityStatus;
  sourceMode: string;
  lastSuccessAt: string | null;
  sampleCount: number;
  sampleTitles: string[];
  detail: string | null;
};

function failureStatus(errorCode: string | null): SourceCapabilityStatus {
  if (errorCode === "COLLECTION_HTTP_429") return "BLOCKED_RATE_LIMIT";
  if (errorCode?.includes("NETWORK") || errorCode?.includes("TIMEOUT")) return "BLOCKED_NETWORK";
  return "NOT_IMPLEMENTED";
}

function metadataObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function buildSourceCapabilityAudit(): Promise<SourceCapabilityRow[]> {
  const db = getDatabase();
  const sources = await db.select().from(contentSources);
  const sourceIds = sources.map((item) => item.id);
  const runs = sourceIds.length
    ? await db.select().from(contentCollectionRuns)
        .where(inArray(contentCollectionRuns.sourceId, sourceIds))
        .orderBy(desc(contentCollectionRuns.startedAt))
    : [];
  const rawItems = sourceIds.length
    ? await db.select().from(contentRawItems)
        .where(inArray(contentRawItems.sourceId, sourceIds))
    : [];
  const observations = sourceIds.length
    ? await db.select().from(contentRawItemObservations)
        .where(inArray(contentRawItemObservations.sourceId, sourceIds))
    : [];
  const observedRawIds = [...new Set(observations.map((item) => item.rawItemId))];
  const observedRawItems = observedRawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, observedRawIds))
    : [];
  const rawById = new Map([...rawItems, ...observedRawItems].map((item) => [item.id, item]));

  const rows: SourceCapabilityRow[] = [];
  for (const source of sources) {
    const meta = metadataObject(source.metadata);
    if (meta.capabilityAuditHidden === true) continue;
    const sourceRuns = runs.filter((run) => run.sourceId === source.id);
    const latest = sourceRuns[0] ?? null;
    const latestSuccess = sourceRuns.find(
      (run) => run.status === "SUCCEEDED" && run.receivedCount > 0
    ) ?? null;
    const sourceRawItems = rawItems
      .filter((item) => item.sourceId === source.id)
      .sort((left, right) => right.collectedAt.getTime() - left.collectedAt.getTime());
    const sourceObservedRawItems = observations
      .filter((item) => item.sourceId === source.id)
      .map((item) => rawById.get(item.rawItemId))
      .filter((item): item is typeof contentRawItems.$inferSelect => Boolean(item))
      .sort((left, right) => right.collectedAt.getTime() - left.collectedAt.getTime());
    const persistedItems = [...new Map(
      [...sourceRawItems, ...sourceObservedRawItems].map((item) => [item.id, item])
    ).values()];
    const provider = String(metadataObject(source.collectionConfig).provider ?? "");
    const providerConfigured =
      provider.startsWith("DAILYHOT_")
        ? Boolean(process.env.DAILYHOT_API_BASE_URL?.trim()) :
      provider === "RSSHUB_DOMESTIC_HOT" ? Boolean(process.env.RSSHUB_BASE_URL?.trim()) :
      provider === "TRENDRADAR_SIGNAL" ? Boolean(process.env.TRENDRADAR_API_BASE_URL?.trim()) :
      true;

    let category: SourceCapabilityRow["category"] | null = null;
    if (source.sourceType === "OFFICIAL") {
      category = "OFFICIAL";
    } else if (source.sourceType === "MEDIA") {
      category = "MEDIA";
    } else if (source.sourceType === "RESEARCH") {
      category = "RESEARCH";
    } else if (source.collectionMethod === "TREND") {
      category = source.platform === "GITHUB" ? "TOOL" : "TREND";
    }
    if (!category) continue;

    let status: SourceCapabilityStatus;
    const persistenceSatisfied = persistedItems.length > 0;
    if (!providerConfigured) status = "CONFIG_REQUIRED";
    else if (latestSuccess) status = "LIVE_PASS";
    else if (latest?.status === "FAILED") status = failureStatus(latest.errorCode);
    else status = "NOT_IMPLEMENTED";

    rows.push({
      key: source.providerRef ?? source.id,
      name: source.name,
      category,
      status,
      sourceMode: String(meta.sourceMode ?? source.collectionMethod),
      lastSuccessAt: latestSuccess?.finishedAt?.toISOString() ?? null,
      sampleCount: latestSuccess?.receivedCount ?? 0,
      sampleTitles: persistedItems.slice(0, 3).map((item) => item.title),
      detail: !providerConfigured
        ? "missing-configurable-source-url"
        : latest?.errorCode ?? (latestSuccess && !persistenceSatisfied ? "runtime-live-no-policy-eligible-item" : null)
    });
  }

  const youtubeConfigured = Boolean(process.env.YOUTUBE_DATA_API_KEY?.trim());
  const productHuntConfigured = Boolean(process.env.PRODUCT_HUNT_API_TOKEN?.trim());
  for (const [key, name, configured] of [
    ["YOUTUBE_AI_TREND", "YouTube AI Trend", youtubeConfigured],
    ["PRODUCT_HUNT", "Product Hunt", productHuntConfigured]
  ] as const) {
    const source = sources.find((item) => metadataObject(item.collectionConfig).provider === key);
    const sourceRuns = source ? runs.filter((run) => run.sourceId === source.id) : [];
    const liveRun = sourceRuns.find((run) => run.status === "SUCCEEDED" && run.receivedCount > 0) ?? null;
    rows.push({
      key,
      name,
      category: "TREND",
      status: liveRun ? "LIVE_PASS" : configured ? "READY_NO_LIVE_RUN" : "CONFIG_REQUIRED",
      sourceMode: "OFFICIAL_API_FALLBACK",
      lastSuccessAt: liveRun?.finishedAt?.toISOString() ?? null,
      sampleCount: liveRun?.receivedCount ?? 0,
      sampleTitles: [],
      detail: liveRun ? null : configured ? "configured-but-no-successful-ingestion" : "missing-provider-credential"
    });
  }

  return rows.sort((left, right) =>
    left.category.localeCompare(right.category) || left.name.localeCompare(right.name)
  );
}
