import "server-only";

import { eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentSources } from "../db/schema";

export const SOURCE_ASSET_CLEANUP_VERSION = "source-asset-cleanup-v1";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export type SourceAssetCleanupDecision = {
  sourceId: string;
  action: "KEEP" | "ARCHIVE";
  reason: string;
  mergedIntoSourceId: string | null;
};

const HIGH_CONFIDENCE_OWNER_BY_SOURCE_ID: Record<string, string> = {
  "source_manual_a4716f9d-0836-41c3-9808-3aa3a00c0296": "source_radar_official_openai",
  "source_manual_8428a160-cc53-49f3-8733-c1dadb58aa00": "source_radar_hacker_news",
  "source_manual_84911eb6-b34d-4722-9516-901fa309f088": "source_manual_25f501e4-1726-4772-bd73-d9684532e3db"
};

export function classifySourceAssetForCleanup(
  source: typeof contentSources.$inferSelect
): SourceAssetCleanupDecision {
  if (["MANUAL", "BROWSER", "BROWSER_SESSION"].includes(source.collectionMethod?.toUpperCase())) {
    return { sourceId: source.id, action: "ARCHIVE", reason: "NON_SERVER_ACQUISITION_RETIRED", mergedIntoSourceId: null };
  }
  const metadata = record(source.metadata);
  const registry = record(metadata.sourceRegistry);
  const onboarding = record(metadata.sourceOnboarding);
  const isCurrentOnboarded =
    registry.usageMode === "SYSTEM" &&
    onboarding.version === "source-onboarding-v1";
  const isLegacyManual =
    registry.usageMode === "MANUAL" ||
    (source.id.startsWith("source_manual_") && !isCurrentOnboarded);

  if (!isLegacyManual) {
    return {
      sourceId: source.id,
      action: "KEEP",
      reason: isCurrentOnboarded ? "CURRENT_SOURCE_MANAGEMENT_OWNER" : "CURRENT_SOURCE_ASSET",
      mergedIntoSourceId: null
    };
  }

  return {
    sourceId: source.id,
    action: "ARCHIVE",
    reason: "LEGACY_MANUAL_CORE_ASSET",
    mergedIntoSourceId: HIGH_CONFIDENCE_OWNER_BY_SOURCE_ID[source.id] ?? null
  };
}

export async function auditActiveSourceAssets() {
  const sources = await getDatabase()
    .select()
    .from(contentSources)
    .where(eq(contentSources.status, "ACTIVE"));
  return sources.map((source) => ({
    source,
    decision: classifySourceAssetForCleanup(source)
  }));
}

export async function applyDevelopmentSourceAssetCleanup() {
  const db = getDatabase();
  const audit = await auditActiveSourceAssets();
  const archived = [];
  for (const item of audit) {
    if (item.decision.action !== "ARCHIVE") continue;
    const metadata = record(item.source.metadata);
    const [updated] = await db
      .update(contentSources)
      .set({
        status: "ARCHIVED",
        enabled: false,
        metadata: {
          ...metadata,
          sourceAssetCleanup: {
            version: SOURCE_ASSET_CLEANUP_VERSION,
            archivedAt: new Date().toISOString(),
            reason: item.decision.reason,
            mergedIntoSourceId: item.decision.mergedIntoSourceId,
            historicalFactsPreserved: true
          }
        },
        updatedAt: new Date()
      })
      .where(eq(contentSources.id, item.source.id))
      .returning();
    if (updated) archived.push(updated);
  }
  return {
    version: SOURCE_ASSET_CLEANUP_VERSION,
    archivedCount: archived.length,
    archived
  };
}
