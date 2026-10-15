import { desc, eq, inArray } from "drizzle-orm";
import { auditActiveSourceAssets } from "../lib/server/content/source-asset-cleanup";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentCollectionRuns, contentSources } from "../lib/server/db/schema";
import { listSourceQualificationSnapshots } from "../lib/server/content/source-qualification";
import { auditSourceRuntimeGovernance } from "../lib/server/content/source-runtime-governance";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeCanonical(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim().toLowerCase();
  }
}

function duplicateGroups<T>(rows: T[], key: (row: T) => string | null) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const identity = key(row);
    if (!identity) continue;
    const items = groups.get(identity) ?? [];
    items.push(row);
    groups.set(identity, items);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([identity, items]) => ({ identity, items }));
}

function remediationCategory(input: {
  qualification: string;
  latestStatus?: string | null;
  latestErrorCode?: string | null;
}) {
  if (input.qualification === "AUTO_READY") return "NONE";
  if (input.latestErrorCode === "COLLECTION_HTTP_429") return "ROUTE_RATE_LIMITED";
  if (input.latestErrorCode === "COLLECTION_NETWORK_UNREACHABLE") return "ROUTE_NETWORK_UNREACHABLE";
  if (input.latestErrorCode === "COLLECTION_NETWORK_FAILED") return "ROUTE_NETWORK_FAILED";
  if (input.latestErrorCode === "RSS_NO_ITEMS") return "ROUTE_EMPTY_OR_INVALID";
  if (input.latestStatus === "SUCCEEDED") return "EVIDENCE_ACCUMULATION";
  return "RUNTIME_REVIEW";
}

async function main() {
  const db = getDatabase();
  const rows = await auditActiveSourceAssets();
  const activeSources = rows.map((item) => item.source);
  const activeIds = activeSources.map((source) => source.id);

  const [qualifications, governance, recentRuns, archived012] = await Promise.all([
    listSourceQualificationSnapshots(activeIds),
    auditSourceRuntimeGovernance({ sourceIds: activeIds, windowDays: 14 }),
    activeIds.length
      ? db.select({
          sourceId: contentCollectionRuns.sourceId,
          status: contentCollectionRuns.status,
          errorCode: contentCollectionRuns.errorCode,
          startedAt: contentCollectionRuns.startedAt,
          metadata: contentCollectionRuns.metadata
        })
          .from(contentCollectionRuns)
          .where(inArray(contentCollectionRuns.sourceId, activeIds))
          .orderBy(desc(contentCollectionRuns.startedAt))
      : [],
    db.select().from(contentSources).where(eq(contentSources.status, "ARCHIVED"))
  ]);

  const qualificationById = new Map(qualifications.map((item) => [item.sourceId, item]));
  const governanceById = new Map(governance.map((item) => [item.source.id, item]));
  const latestRunBySource = new Map<string, (typeof recentRuns)[number]>();
  for (const run of recentRuns) {
    if (!run.sourceId || latestRunBySource.has(run.sourceId)) continue;
    if (record(run.metadata).qualificationOnly === true) continue;
    latestRunBySource.set(run.sourceId, run);
  }

  const identityView = activeSources.map((source) => ({
    sourceId: source.id,
    name: source.name,
    canonicalUrl: source.canonicalUrl,
    providerRef: source.providerRef
  }));

  console.log(JSON.stringify({
    version: "source-asset-cleanup-v1",
    activeCount: rows.length,
    duplicateCanonicalGroups: duplicateGroups(
      identityView,
      (item) => normalizeCanonical(item.canonicalUrl)
    ),
    duplicateProviderGroups: duplicateGroups(
      identityView,
      (item) => item.providerRef?.trim().toLowerCase() ?? null
    ),
    archiveCandidates: rows
      .filter((item) => item.decision.action === "ARCHIVE")
      .map((item) => ({
        sourceId: item.source.id,
        name: item.source.name,
        canonicalUrl: item.source.canonicalUrl,
        providerRef: item.source.providerRef,
        reason: item.decision.reason,
        mergedIntoSourceId: item.decision.mergedIntoSourceId
      })),
    archivedBy012: archived012
      .filter((source) => record(source.metadata).sourceAssetCleanup !== undefined)
      .map((source) => ({
        sourceId: source.id,
        name: source.name,
        cleanup: record(source.metadata).sourceAssetCleanup
      })),
    keepCount: rows.filter((item) => item.decision.action === "KEEP").length,
    remediation: activeSources
      .map((source) => {
        const qualification = qualificationById.get(source.id);
        const governed = governanceById.get(source.id);
        const latest = latestRunBySource.get(source.id);
        return {
          sourceId: source.id,
          name: source.name,
          qualification: qualification?.qualification ?? "UNKNOWN",
          evidenceSufficiency: qualification?.evidenceSufficiency ?? "UNKNOWN",
          governancePlan: governed?.governance.plan ?? "UNKNOWN",
          latestStatus: latest?.status ?? null,
          latestErrorCode: latest?.errorCode ?? null,
          remediationCategory: remediationCategory({
            qualification: qualification?.qualification ?? "UNKNOWN",
            latestStatus: latest?.status ?? null,
            latestErrorCode: latest?.errorCode ?? null
          }),
          blockingReasons: qualification?.reasons ?? []
        };
      })
      .filter((item) => item.qualification !== "AUTO_READY")
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await closeDatabase(); } catch {}
  });
