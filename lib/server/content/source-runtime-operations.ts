import "server-only";

import { desc, inArray } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentCollectionRuns, contentRawItems, contentSources } from "../db/schema";
import { listSourceQualificationSnapshots } from "./source-qualification";
import { resolveSourceAcquisitionPlan } from "./source-acquisition-plan";
import { RADAR_OPTIONAL_CAPABILITIES } from "../../content/radar-source-portfolio";
import { listCurrentSystemCollectionSources } from "./source-portfolio-runtime";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function numeric(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isSystemRun(run: typeof contentCollectionRuns.$inferSelect) {
  return String(record(run.metadata).collectionOrigin ?? "SYSTEM").toUpperCase() !== "MANUAL";
}

function category(source: typeof contentSources.$inferSelect | undefined) {
  if (!source) return "OTHER";
  if (source.sourceType === "OFFICIAL") return "OFFICIAL";
  if (source.sourceType === "MEDIA") return "MEDIA";
  if (source.sourceType === "RESEARCH") return "RESEARCH";
  if (source.collectionMethod === "TREND") return "TREND";
  if (source.platform === "XIAOHONGSHU" || source.sourceType === "SOCIAL" || source.sourceType === "MANAGED_SOURCE") return "SOCIAL";
  return "OTHER";
}

export async function listSourceRuntimeSummary(limit = 120) {
  const db = getDatabase();
  const sources = await listCurrentSystemCollectionSources();
  const currentIds = sources.map((source) => source.id);
  const allRuns = currentIds.length
    ? await db.select().from(contentCollectionRuns)
        .where(inArray(contentCollectionRuns.sourceId, currentIds))
        .orderBy(desc(contentCollectionRuns.startedAt))
        .limit(Math.max(1, Math.min(240, limit * 2)))
    : [];
  const currentSourceIds = new Set(sources.map((source) => source.id));
  const runs = allRuns
    .filter((run) => isSystemRun(run) && Boolean(run.sourceId && currentSourceIds.has(run.sourceId)))
    .slice(0, Math.max(1, Math.min(160, limit)));
  const latestRunBySource = new Map<string, typeof contentCollectionRuns.$inferSelect>();
  for (const run of runs) {
    if (run.sourceId && !latestRunBySource.has(run.sourceId)) {
      latestRunBySource.set(run.sourceId, run);
    }
  }
  const sourceGroupNames = [...new Set(sources.map((source) => {
    const metadata = record(source.metadata);
    return typeof metadata.portfolioGroup === "string" ? metadata.portfolioGroup : "其他";
  }))];
  const sourceGroups = sourceGroupNames.map((groupName) => {
    const groupSources = sources.filter((source) => {
      const metadata = record(source.metadata);
      return (typeof metadata.portfolioGroup === "string" ? metadata.portfolioGroup : "其他") === groupName;
    });
    const groupSourceIds = new Set(groupSources.map((source) => source.id));
    const groupRuns = runs.filter((run) => Boolean(run.sourceId && groupSourceIds.has(run.sourceId)));
    const receivedTotal = groupRuns.reduce((sum, run) => sum + run.receivedCount, 0);
    const keptTotal = groupRuns.reduce((sum, run) => {
      const filter = record(record(run.metadata).discoveryFilter);
      return sum + numeric(filter.kept ?? filter.accepted ?? run.createdCount + run.duplicateCount);
    }, 0);
    const successCount = groupRuns.filter((run) => run.status === "SUCCEEDED").length;
    const healthyCount = groupSources.filter((source) => {
      const latest = latestRunBySource.get(source.id);
      return !latest || latest.status === "SUCCEEDED";
    }).length;
    const failedCount = groupSources.length - healthyCount;
    return {
      groupName,
      sourceCount: groupSources.length,
      healthyCount,
      failedCount,
      runCount: groupRuns.length,
      successRate: groupRuns.length ? Math.round(successCount / groupRuns.length * 100) : null,
      receivedTotal,
      keptTotal,
      aiRelevantKeepRate: receivedTotal ? Math.round(Math.min(1, keptTotal / receivedTotal) * 100) : null,
      lastSuccessAt: groupRuns
        .filter((run) => run.status === "SUCCEEDED" && run.finishedAt)
        .map((run) => run.finishedAt!.toISOString())
        .sort()
        .at(-1) ?? null
    };
  });
  const receivedTotal = runs.reduce((sum, run) => sum + run.receivedCount, 0);
  const keptTotal = runs.reduce((sum, run) => {
    const filter = record(record(run.metadata).discoveryFilter);
    return sum + numeric(filter.kept ?? filter.accepted ?? run.createdCount + run.duplicateCount);
  }, 0);
  const failedSourceCount = sources.filter((source) => latestRunBySource.get(source.id)?.status === "FAILED").length;
  return {
    summary: {
      runCount: runs.length,
      successCount: runs.filter((run) => run.status === "SUCCEEDED").length,
      failedCount: runs.filter((run) => run.status === "FAILED").length,
      configuredSourceCount: sources.length,
      monitoredSourceCount: sources.length,
      healthySourceCount: sources.length - failedSourceCount,
      failedSourceCount,
      degradedSourceCount: 0,
      runtimeGapCount: 0,
      receivedTotal,
      keptTotal,
      aiRelevantKeepRate: receivedTotal ? Math.round(Math.min(1, keptTotal / receivedTotal) * 100) : null
    },
    sourceGroups,
    optionalCapabilities: RADAR_OPTIONAL_CAPABILITIES
  };
}

export async function listSourceRuntimeOperations(limit = 120) {
  const db = getDatabase();
  const sources = await listCurrentSystemCollectionSources();
  const currentIds = sources.map((source) => source.id);
  const [allRuns, qualifications] = await Promise.all([
    currentIds.length
      ? db.select().from(contentCollectionRuns)
          .where(inArray(contentCollectionRuns.sourceId, currentIds))
          .orderBy(desc(contentCollectionRuns.startedAt))
          .limit(Math.max(1, Math.min(400, limit * 3)))
      : Promise.resolve([]),
    currentIds.length ? listSourceQualificationSnapshots(currentIds) : Promise.resolve([])
  ]);
  const currentSourceIds = new Set(sources.map((source) => source.id));
  const runs = allRuns
    .filter((run) => isSystemRun(run) && Boolean(run.sourceId && currentSourceIds.has(run.sourceId)))
    .slice(0, Math.max(1, Math.min(200, limit)));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const rawIds = [...new Set(runs.flatMap((run) => {
    const ids = record(run.metadata).rawItemIds;
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  }))];
  const rawItems = rawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds))
    : [];
  const rawById = new Map(rawItems.map((item) => [item.id, item]));

  const items = runs.map((run) => {
    const source = run.sourceId ? sourceById.get(run.sourceId) : undefined;
    const metadata = record(run.metadata);
    const filter = record(metadata.discoveryFilter);
    const runRawIds = Array.isArray(metadata.rawItemIds)
      ? metadata.rawItemIds.filter((id): id is string => typeof id === "string")
      : [];
    const media = runRawIds
      .map((id) => rawById.get(id))
      .filter((item): item is typeof contentRawItems.$inferSelect => Boolean(item))
      .map((item) => {
        const itemMetadata = record(item.metadata);
        return {
          rawItemId: item.id,
          title: item.title,
          mediaType: typeof itemMetadata.mediaType === "string" ? itemMetadata.mediaType : null,
          transcriptStatus: typeof itemMetadata.transcriptStatus === "string" ? itemMetadata.transcriptStatus : null,
          descriptionText: item.excerpt,
          originalUrl: item.originalUrl
        };
      });
    const keptCount = numeric(
      filter.kept ??
      filter.accepted ??
      metadata.storedCount ??
      run.createdCount + run.duplicateCount
    );
    return {
      id: run.id,
      sourceId: run.sourceId,
      sourceName: run.sourceName,
      platform: source?.platform ?? String(metadata.platform ?? "UNKNOWN"),
      category: category(source),
      adapter: String(metadata.collectionRunKind ?? source?.collectionMethod ?? run.collectionMethod),
      status: run.status,
      health: run.status === "SUCCEEDED" ? "HEALTHY" : run.status === "FAILED" ? "FAILED" : "RUNNING",
      receivedCount: run.receivedCount,
      keptCount,
      rejectedCount: numeric(filter.rejected ?? filter.dropped ?? Math.max(0, run.receivedCount - keptCount)),
      duplicateCount: run.duplicateCount,
      createdCount: run.createdCount,
      errorCode: run.errorCode,
      errorMessage: run.errorMessage,
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt?.toISOString() ?? null,
      media
    };
  });

  const qualificationBySource = new Map(qualifications.map((item) => [item.sourceId, item]));
  const recentSystemSourceIds = new Set(runs.flatMap((run) => run.sourceId ? [run.sourceId] : []));
  const automaticSources = sources;
  const sourceHealth = automaticSources.map((source) => {
    const qualification = qualificationBySource.get(source.id);
    const sourceMetadata = record(source.metadata);
    const runtimeQualification = record(sourceMetadata.runtimeQualification);
    const effectiveQualification =
      typeof runtimeQualification.effectiveQualification === "string"
        ? runtimeQualification.effectiveQualification
        : qualification?.qualification ?? "CONDITIONAL";
    const acquisition = resolveSourceAcquisitionPlan({
      collectionMethod: source.collectionMethod,
      platform: source.platform,
      providerRef: source.providerRef,
      canonicalUrl: source.canonicalUrl,
      metadata: source.metadata,
      collectionConfig: source.collectionConfig
    });
    const latest = runs.find((run) => run.sourceId === source.id) ?? null;
    const status =
      !acquisition.serverRuntimeSupported ? "RUNTIME_GAP" :
      latest?.status === "FAILED" ? "FAILED" :
      latest?.status === "SUCCEEDED" ? "HEALTHY" :
      "READY";
    const recentRuns = runs.filter((run) => run.sourceId === source.id).slice(0, 12);
    const receivedTotal = recentRuns.reduce((sum, run) => sum + run.receivedCount, 0);
    const keptTotal = recentRuns.reduce((sum, run) => {
      const filter = record(record(run.metadata).discoveryFilter);
      return sum + numeric(filter.kept ?? filter.accepted ?? run.createdCount + run.duplicateCount);
    }, 0);
    const duplicateTotal = recentRuns.reduce((sum, run) => sum + run.duplicateCount, 0);
    const materializedTotal = recentRuns.reduce((sum, run) => sum + run.createdCount + run.duplicateCount, 0);
    const successCount = recentRuns.filter((run) => run.status === "SUCCEEDED").length;
    return {
      sourceId: source.id,
      sourceName: source.name,
      platform: source.platform,
      adapter: acquisition.primaryRoute.kind,
      acquisitionKind: acquisition.kind,
      acquisitionReason: acquisition.reason,
      acquisitionRuntimeOwner: acquisition.runtimeOwner,
      serverRuntimeSupported: acquisition.serverRuntimeSupported,
      qualification: qualification?.qualification ?? "CONDITIONAL",
      effectiveQualification,
      runtimeQualificationReason:
        typeof runtimeQualification.reason === "string" ? runtimeQualification.reason : null,
      sourceRole: qualification?.sourceRole ?? "UNKNOWN",
      portfolioGroup:
        typeof sourceMetadata.portfolioGroup === "string" ? sourceMetadata.portfolioGroup : "其他",
      status,
      detail: !acquisition.serverRuntimeSupported ? "SERVER_RUNTIME_UNSUPPORTED" : latest?.errorCode ?? null,
      lastSuccessAt: runs.find((run) => run.sourceId === source.id && run.status === "SUCCEEDED")?.finishedAt?.toISOString() ?? null,
      utility: {
        recentRunCount: recentRuns.length,
        successRate: recentRuns.length ? Math.round(successCount / recentRuns.length * 100) : null,
        aiRelevantKeepRate: receivedTotal ? Math.round(Math.min(1, keptTotal / receivedTotal) * 100) : null,
        duplicateRate: materializedTotal ? Math.round(Math.min(1, duplicateTotal / materializedTotal) * 100) : null,
        receivedTotal,
        keptTotal
      }
    };
  });
  const sourceGroups = [...new Set(sourceHealth.map((item) => item.portfolioGroup))].map((groupName) => {
    const groupSources = sourceHealth.filter((item) => item.portfolioGroup === groupName);
    const receivedTotal = groupSources.reduce((sum, item) => sum + item.utility.receivedTotal, 0);
    const keptTotal = groupSources.reduce((sum, item) => sum + item.utility.keptTotal, 0);
    const successRunCount = groupSources.reduce((sum, item) => {
      const successRate = item.utility.successRate ?? 0;
      return sum + Math.round(item.utility.recentRunCount * successRate / 100);
    }, 0);
    const runCount = groupSources.reduce((sum, item) => sum + item.utility.recentRunCount, 0);
    return {
      groupName,
      sourceCount: groupSources.length,
      healthyCount: groupSources.filter((item) => item.status === "HEALTHY" || item.status === "READY").length,
      failedCount: groupSources.filter((item) => item.status === "FAILED" || item.status === "RUNTIME_GAP").length,
      runCount,
      successRate: runCount ? Math.round(successRunCount / runCount * 100) : null,
      receivedTotal,
      keptTotal,
      aiRelevantKeepRate: receivedTotal ? Math.round(Math.min(1, keptTotal / receivedTotal) * 100) : null,
      lastSuccessAt: groupSources
        .flatMap((item) => item.lastSuccessAt ? [item.lastSuccessAt] : [])
        .sort()
        .at(-1) ?? null
    };
  });

  return {
    summary: {
      runCount: items.length,
      successCount: items.filter((item) => item.status === "SUCCEEDED").length,
      failedCount: items.filter((item) => item.status === "FAILED").length,
      configuredSourceCount: sourceHealth.length,
      monitoredSourceCount: sourceHealth.length,
      healthySourceCount: sourceHealth.filter((item) =>
        item.status !== "FAILED" && item.status !== "RUNTIME_GAP"
      ).length,
      failedSourceCount: sourceHealth.filter((item) => item.status === "FAILED").length,
      degradedSourceCount: sourceHealth.filter((item) =>
        item.effectiveQualification === "CONDITIONAL" ||
        item.effectiveQualification === "DISABLED"
      ).length,
      runtimeGapCount: sourceHealth.filter((item) => !item.serverRuntimeSupported).length,
      receivedTotal: items.reduce((sum, item) => sum + item.receivedCount, 0),
      keptTotal: items.reduce((sum, item) => sum + item.keptCount, 0),
      aiRelevantKeepRate: (() => {
        const received = items.reduce((sum, item) => sum + item.receivedCount, 0);
        const kept = items.reduce((sum, item) => sum + item.keptCount, 0);
        return received ? Math.round(Math.min(1, kept / received) * 100) : null;
      })()
    },
    sourceGroups,
    optionalCapabilities: RADAR_OPTIONAL_CAPABILITIES,
    sourceHealth,
    runs: items
  };
}
