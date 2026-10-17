import "server-only";

import { desc, eq, inArray } from "drizzle-orm";
import {
  RADAR_OPTIONAL_CAPABILITIES,
  RADAR_SOURCE_IDS,
  RADAR_SOURCE_PORTFOLIO,
  type RadarPortfolioEntry
} from "../../content/radar-source-portfolio";
import { SOURCE_PLATFORM_CAPABILITIES } from "../../content/source-platform-capabilities";
import {
  DISCOVERY_ROUTE_DEFINITIONS,
  resolveDiscoveryRouteIds
} from "../../content/discovery-routing";
import { DAILYHOT_DOMESTIC_EXCLUDED_ROUTES, DAILYHOT_DOMESTIC_RUNTIME_ROUTES } from "./trend-discovery";
import { getDatabase } from "../db";
import { contentCollectionRuns, contentSources } from "../db/schema";
import { resolveSourceAcquisitionPlan } from "./source-acquisition-plan";
import { listSourceQualificationSnapshots, type SourceRuntimeQualification } from "./source-qualification";
import {
  auditSourceGovernanceExecution,
  buildSourceGovernanceExecutionPlan,
  resolveSourceBaseIntervalMinutes
} from "./source-runtime-governance-execution";
import { evaluateSourceRuntimeGovernance } from "./source-runtime-governance";
import { readSourceRuntimeUtility } from "./source-runtime-utility";
import { readSourceApiQuota } from "./source-api-quota-ledger";

import type { AuthUser } from "../auth/service";
import { recordContentAudit } from "./workbench";
import { classifySourceAssetForCleanup } from "./source-asset-cleanup";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function isRuntimeRelevantProductionRun(run: { metadata: unknown }) {
  const metadata = record(run.metadata);
  const staleRunRecovery = record(metadata.staleRunRecovery);
  return metadata.qualificationOnly !== true &&
    staleRunRecovery.excludeFromRuntimeQualification !== true;
}

function isOperatorAddedSource(source: typeof contentSources.$inferSelect) {
  const metadata = record(source.metadata);
  const registry = record(metadata.sourceRegistry);
  return (
    (source.status === "ACTIVE" || (source.status === "ARCHIVED" && metadata.archivedFromSourceManagement === true)) &&
    (metadata.manualEntry === true || registry.managed === true) &&
    !RADAR_SOURCE_IDS.has(source.id)
  );
}

function sourceCategory(sourceRole: string, sourceType: string) {
  if (sourceRole === "DISCOVERY_AGGREGATOR") return "聚合发现";
  if (sourceRole === "OFFICIAL" || sourceType === "OFFICIAL") return "官方";
  if (sourceRole === "PROFESSIONAL_MEDIA" || sourceType === "MEDIA") return "专业媒体";
  if (sourceRole === "RESEARCH" || sourceType === "RESEARCH") return "研究";
  if (sourceRole === "DEVELOPER_COMMUNITY" || sourceType === "DEVELOPER") return "开发者社区";
  if (["CREATOR", "SOCIAL"].includes(sourceRole) || ["CREATOR", "SOCIAL"].includes(sourceType)) return "Creator / 社区";
  return "其他";
}

function operationReason(input: unknown, fallback: string) {
  if (input === undefined || input === null || input === "") return fallback;
  if (typeof input !== "string" || input.trim().length > 500) throw new Error("INVALID_OPERATION_REASON");
  return input.trim() || fallback;
}

export async function setSourceManagementEnabled(sourceId: string, enabled: boolean, user: AuthUser, reason?: unknown) {
  return getDatabase().transaction(async (tx) => {
    const [source] = await tx.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1).for("update");
    if (!source) throw new Error("SOURCE_NOT_FOUND");
    if (source.status !== "ACTIVE") throw new Error("SOURCE_NOT_ACTIVE");
    const metadata = record(source.metadata);
    const [updated] = await tx.update(contentSources).set({ enabled,
      metadata: { ...metadata, managementDisabled: !enabled, managementDisabledAt: !enabled ? new Date().toISOString() : null }, updatedAt: new Date()
    }).where(eq(contentSources.id, sourceId)).returning();
    await recordContentAudit(user, { action: enabled ? "SOURCE_ENABLED" : "SOURCE_DISABLED", entityType: "CONTENT_SOURCE", entityId: sourceId,
      before: { enabled: source.enabled, status: source.status }, after: { enabled: updated.enabled, status: updated.status }, metadata: { reason: operationReason(reason, enabled ? "ADMIN_ENABLE_SOURCE" : "ADMIN_DISABLE_SOURCE") } }, tx);
    return updated;
  });
}

export async function archiveOperatorSource(sourceId: string, user: AuthUser, reason?: unknown) {
  if (RADAR_SOURCE_IDS.has(sourceId)) throw new Error("SYSTEM_BASELINE_SOURCE_CANNOT_ARCHIVE");
  return getDatabase().transaction(async (tx) => {
    const [source] = await tx.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1).for("update");
    if (!source || !isOperatorAddedSource(source)) throw new Error("OPERATOR_SOURCE_NOT_FOUND");
    const metadata = record(source.metadata);
    const [updated] = await tx.update(contentSources).set({ status: "ARCHIVED", enabled: false,
      metadata: { ...metadata, managementDisabled: true, archivedFromSourceManagement: true, archivedAt: new Date().toISOString() }, updatedAt: new Date()
    }).where(eq(contentSources.id, sourceId)).returning();
    await recordContentAudit(user, { action: "SOURCE_ARCHIVED", entityType: "CONTENT_SOURCE", entityId: sourceId,
      before: { enabled: source.enabled, status: source.status }, after: { enabled: false, status: "ARCHIVED" }, metadata: { reason: operationReason(reason, "ADMIN_ARCHIVE_SOURCE") } }, tx);
    return updated;
  });
}

export async function restoreOperatorSource(sourceId: string, user: AuthUser, reason?: unknown) {
  if (RADAR_SOURCE_IDS.has(sourceId)) throw new Error("SYSTEM_BASELINE_SOURCE_CANNOT_RESTORE");
  return getDatabase().transaction(async (tx) => {
    const [source] = await tx.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1).for("update");
    const metadata = record(source?.metadata);
    if (!source || source.status !== "ARCHIVED" || metadata.archivedFromSourceManagement !== true) throw new Error("ARCHIVED_OPERATOR_SOURCE_NOT_FOUND");
    if (classifySourceAssetForCleanup(source).action !== "KEEP") throw new Error("RETIRED_SOURCE_CANNOT_RESTORE");
    const [updated] = await tx.update(contentSources).set({ status: "ACTIVE", enabled: false,
      metadata: { ...metadata, managementDisabled: true, archivedFromSourceManagement: false, restoredAt: new Date().toISOString() }, updatedAt: new Date()
    }).where(eq(contentSources.id, sourceId)).returning();
    await recordContentAudit(user, { action: "SOURCE_RESTORED", entityType: "CONTENT_SOURCE", entityId: sourceId,
      before: { enabled: source.enabled, status: source.status }, after: { enabled: false, status: "ACTIVE" }, metadata: { reason: operationReason(reason, "ADMIN_RESTORE_SOURCE_REQUALIFY_REQUIRED") } }, tx);
    return updated;
  });
}

export async function getSourceManagementOverview() {
  const db = getDatabase();
  const allSources = await db.select().from(contentSources);
  const operatorSources = allSources.filter(isOperatorAddedSource);
  const sourceIds = [...new Set([...RADAR_SOURCE_IDS, ...operatorSources.map((item) => item.id)])];

  const [qualifications, runs, governanceRows] = await Promise.all([
    listSourceQualificationSnapshots(sourceIds),
    db.select().from(contentCollectionRuns)
      .where(inArray(contentCollectionRuns.sourceId, sourceIds))
      .orderBy(desc(contentCollectionRuns.startedAt))
      .limit(500),
    auditSourceGovernanceExecution({ sourceIds })
  ]);

  const sourceById = new Map(allSources.map((item) => [item.id, item]));
  const qualificationById = new Map(qualifications.map((item) => [item.sourceId, item]));
  const governanceById = new Map(governanceRows.map((item) => [item.source.id, item]));
  const runsBySource = new Map<string, typeof runs>();
  for (const run of runs) {
    if (!run.sourceId) continue;
    const current = runsBySource.get(run.sourceId) ?? [];
    current.push(run);
    runsBySource.set(run.sourceId, current);
  }
  function buildItem(
    source: typeof contentSources.$inferSelect | null,
    entry: RadarPortfolioEntry | null
  ) {
    const sourceId = entry?.sourceId ?? source!.id;
    const qualification = qualificationById.get(sourceId) ?? null;
    const governanceState = governanceById.get(sourceId) ?? null;
    const governance = governanceState?.governance ?? null;
    const execution = governanceState?.execution ?? null;
    const sourceRuns = (runsBySource.get(sourceId) ?? []).slice(0, 12);
    const productionRuns = sourceRuns.filter(isRuntimeRelevantProductionRun);
    const latestRun = productionRuns[0] ?? null;
    const successfulRuns = productionRuns.filter((item) => item.status === "SUCCEEDED");
    const metadata = record(source?.metadata);
    const runtimeQualification = record(metadata.runtimeQualification);
    const effectiveQualification =
      !source || source.status !== "ACTIVE" || !source.enabled ? "DISABLED" :
      typeof runtimeQualification.effectiveQualification === "string"
        ? runtimeQualification.effectiveQualification
        : qualification?.qualification ?? "CONDITIONAL";
    const acquisition = resolveSourceAcquisitionPlan({
      collectionMethod: source?.collectionMethod ?? entry?.collectionMethod ?? "MANUAL",
      platform: source?.platform ?? entry?.platform ?? "WEB",
      providerRef: source?.providerRef ?? entry?.providerRef ?? null,
      canonicalUrl: source?.canonicalUrl ?? entry?.canonicalUrl ?? null,
      metadata: source?.metadata ?? {},
      collectionConfig: source?.collectionConfig ?? (entry ? { acquisition: entry.acquisition } : {})
    });
    const platform = source?.platform ?? entry?.platform ?? "WEB";
    const health =
      !source ? "MISSING" :
      latestRun?.status === "FAILED" ? "FAILED" :
      latestRun?.status === "RUNNING" ? "RUNNING" :
      latestRun?.status === "SUCCEEDED" ? "HEALTHY" :
      "READY";
    const metadataSourceRole = typeof metadata.sourceUniverseRole === "string" ? metadata.sourceUniverseRole : null;
    const resolvedSourceRole = qualification?.sourceRole ?? entry?.coverage?.sourceUniverseRole ?? metadataSourceRole ?? source?.sourceType ?? entry?.sourceType ?? "UNKNOWN";
    const resolvedSourceType = source?.sourceType ?? entry?.sourceType ?? "MANAGED_SOURCE";

    return {
      sourceId,
      name: source?.name ?? entry?.name ?? sourceId,
      group: entry?.group ?? "Operator Added",
      registrationOrigin: entry ? "SYSTEM_BASELINE" as const : "OPERATOR_ADDED" as const,
      sourceType: resolvedSourceType,
      sourceRole: resolvedSourceRole,
      sourceCategory: sourceCategory(resolvedSourceRole, resolvedSourceType),
      evidenceRoles: qualification?.evidenceRoles ?? [],
      platform,
      collectionMethod: source?.collectionMethod ?? entry?.collectionMethod ?? "MANUAL",
      canonicalUrl: source?.canonicalUrl ?? entry?.canonicalUrl ?? null,
      providerRef: source?.providerRef ?? entry?.providerRef ?? "",
      priority: entry?.priority ?? source?.authorityScore ?? 50,
      factualSource: entry?.factualSource ?? metadata.factualSource === true,
      signalSource: entry?.signalSource ?? metadata.signalSource === true,
      referenceOnly: entry?.referenceOnly === true || metadata.referenceOnly === true,
      status: source?.status ?? "MISSING",
      enabled: source?.enabled ?? false,
      acquisition: {
        kind: acquisition.kind,
        runtimeOwner: acquisition.runtimeOwner,
        serverRuntimeSupported: acquisition.serverRuntimeSupported,
        reason: acquisition.reason,
        primaryRouteId: acquisition.primaryRoute.id,
        fallbackRouteCount: acquisition.fallbackRoutes.length,
        fallbackReason: latestRun && typeof record(latestRun.metadata).acquisitionFallbackReason === "string"
          ? String(record(latestRun.metadata).acquisitionFallbackReason)
          : null,
        routes: acquisition.routes.map((route) => {
          const attempts = productionRuns.flatMap((run) => {
            const runMeta = record(run.metadata);
            const rawAttempts = Array.isArray(runMeta.acquisitionRouteAttempts)
              ? runMeta.acquisitionRouteAttempts
              : [];
            const matched = rawAttempts
              .map(record)
              .filter((attempt) => attempt.routeId === route.id)
              .map((attempt) => ({
                status: typeof attempt.status === "string" ? attempt.status : "UNKNOWN",
                errorCode: typeof attempt.errorCode === "string" ? attempt.errorCode : null,
                finishedAt: run.finishedAt,
                fallbackReason: typeof runMeta.acquisitionFallbackReason === "string"
                  ? runMeta.acquisitionFallbackReason
                  : null
              }));
            if (matched.length) return matched;
            const routeId = typeof runMeta.acquisitionRouteId === "string"
              ? runMeta.acquisitionRouteId
              : acquisition.primaryRoute.id;
            return routeId === route.id
              ? [{
                  status: run.status,
                  errorCode: run.errorCode,
                  finishedAt: run.finishedAt,
                  fallbackReason: typeof runMeta.acquisitionFallbackReason === "string"
                    ? runMeta.acquisitionFallbackReason
                    : null
                }]
              : [];
          });
          const latestAttempt = attempts[0] ?? null;
          const routeSuccess = attempts.find((attempt) => attempt.status === "SUCCEEDED") ?? null;
          return {
            id: route.id,
            role: route.role,
            kind: route.kind,
            targetUrl: route.targetUrl,
            runtimeOwner: route.runtimeOwner,
            costLevel: route.costLevel,
            enabled: route.enabled,
            serverRuntimeSupported: route.serverRuntimeSupported,
            health:
              !route.enabled ? "DISABLED" :
              !route.serverRuntimeSupported ? "RUNTIME_REQUIRED" :
              latestAttempt?.status === "FAILED" ? "FAILED" :
              latestAttempt?.status === "SKIPPED" ? "DEGRADED" :
              latestAttempt?.status === "SUCCEEDED" ? "HEALTHY" :
              "READY",
            lastSuccessAt: routeSuccess?.finishedAt?.toISOString() ?? null,
            lastErrorCode: latestAttempt?.errorCode ?? null,
            fallbackReason: route.role === "FALLBACK" ? routeSuccess?.fallbackReason ?? null : null
          };
        })
      },
      qualification: qualification?.qualification ?? "CONDITIONAL",
      effectiveQualification,
      qualificationReasons: qualification?.reasons ?? ["QUALIFICATION_NOT_EVALUATED"],
      evidenceSufficiency: qualification?.evidenceSufficiency ?? "INSUFFICIENT",
      qualificationEvidence: qualification?.evidence ?? null,
      governance: governance && execution ? {
        plan: governance.plan,
        runtimeHealth: governance.runtimeHealth,
        recommendedIntervalMultiplier: governance.recommendedIntervalMultiplier,
        action: execution.action,
        baseIntervalMinutes: execution.baseIntervalMinutes,
        effectiveIntervalMinutes: execution.effectiveIntervalMinutes,
        nextDueAt: execution.nextDueAt,
        due: execution.due,
        humanReviewRequired: execution.requiresHumanReview || governance.humanReviewRequired,
        reasons: governance.reasons
      } : null,
      health,
      latestRun: latestRun ? {
        status: latestRun.status,
        startedAt: latestRun.startedAt.toISOString(),
        finishedAt: latestRun.finishedAt?.toISOString() ?? null,
        receivedCount: latestRun.receivedCount,
        createdCount: latestRun.createdCount,
        duplicateCount: latestRun.duplicateCount,
        errorCode: latestRun.errorCode
      } : null,
      recent: {
        runCount: productionRuns.length,
        successRate: productionRuns.length
          ? Math.round(successfulRuns.length / productionRuns.length * 100)
          : null,
        lastSuccessAt: successfulRuns[0]?.finishedAt?.toISOString() ?? null
      }
    };
  }

  const radarItems = RADAR_SOURCE_PORTFOLIO.map((entry) =>
    buildItem(sourceById.get(entry.sourceId) ?? null, entry)
  );
  const operatorItems = operatorSources
    .map((source) => buildItem(source, null))
    .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
  const items = [...radarItems, ...operatorItems];

  const healthyCount = items.filter((item) => item.health === "HEALTHY").length;
  const attentionCount = items.filter((item) =>
    item.health === "FAILED" ||
    item.health === "MISSING" ||
    item.effectiveQualification === "DISABLED" ||
    item.acquisition.kind === "UNRESOLVED"
  ).length;
  const autoReadyCount = items.filter((item) => item.effectiveQualification === "AUTO_READY").length;

  return {
    summary: {
      sourceCount: items.length,
      radarSourceCount: radarItems.length,
      operatorAddedSourceCount: operatorItems.length,
      healthyCount,
      attentionCount,
      autoReadyCount,
      conditionalCount: items.filter((item) => item.effectiveQualification === "CONDITIONAL").length
    },
    items,
    optionalCapabilities: RADAR_OPTIONAL_CAPABILITIES,
    lifecycle: {
      current: "SOURCE_ONBOARDING_001",
      addFlow: ["DISCOVER", "CHECK", "PREVIEW", "REGISTER", "QUALIFY", "SYSTEM_COLLECTION"]
    }
  };
}

export async function getSourceManagementIndex() {
  const db = getDatabase();
  const [allSources, youtubeQuota] = await Promise.all([
    db.select().from(contentSources),
    readSourceApiQuota("YOUTUBE", { limit: 10_000, baseIntervalMinutes: 60 })
  ]);
  const operatorSources = allSources.filter(isOperatorAddedSource);
  const sourceById = new Map(allSources.map((item) => [item.id, item]));
  function buildIndexItem(source: typeof contentSources.$inferSelect | null, entry: RadarPortfolioEntry | null) {
    const metadata = record(source?.metadata);
    const runtimeQualification = record(metadata.runtimeQualification);
    const resolvedSourceRole = entry?.coverage?.sourceUniverseRole ??
      (typeof metadata.sourceUniverseRole === "string" ? metadata.sourceUniverseRole : null) ??
      source?.sourceType ?? entry?.sourceType ?? "UNKNOWN";
    const resolvedSourceType = source?.sourceType ?? entry?.sourceType ?? "MANAGED_SOURCE";
    const acquisition = resolveSourceAcquisitionPlan({
      collectionMethod: source?.collectionMethod ?? entry?.collectionMethod ?? "MANUAL",
      platform: source?.platform ?? entry?.platform ?? "WEB",
      providerRef: source?.providerRef ?? entry?.providerRef ?? null,
      canonicalUrl: source?.canonicalUrl ?? entry?.canonicalUrl ?? null,
      metadata: source?.metadata ?? {},
      collectionConfig: source?.collectionConfig ?? (entry ? { acquisition: entry.acquisition } : {})
    });
    const platform = source?.platform ?? entry?.platform ?? "WEB";
    const effectiveQualification = !source || source.status !== "ACTIVE" || !source.enabled ? "DISABLED" : typeof runtimeQualification.effectiveQualification === "string"
      ? runtimeQualification.effectiveQualification : "CONDITIONAL";
    const recentProductionStatuses = Array.isArray(runtimeQualification.recentProductionStatuses)
      ? runtimeQualification.recentProductionStatuses.filter((value): value is string => typeof value === "string")
      : [];
    const latestProductionStatus = recentProductionStatuses[0] ?? null;
    const health = !source ? "MISSING" :
      source.status !== "ACTIVE" || !source.enabled ? "DISABLED" :
      latestProductionStatus === "FAILED" ? "FAILED" :
      latestProductionStatus === "SUCCEEDED" ? "HEALTHY" : "READY";
    const discoveryRouteIds = resolveDiscoveryRouteIds({
      sourceRole: resolvedSourceRole,
      sourceType: resolvedSourceType,
      evidenceRoles: entry?.coverage?.evidenceRoles ?? []
    });
    return {
      sourceId: entry?.sourceId ?? source!.id,
      name: source?.name ?? entry?.name ?? source!.id,
      group: entry?.group ?? "Operator Added",
      registrationOrigin: entry ? "SYSTEM_BASELINE" as const : "OPERATOR_ADDED" as const,
      sourceType: resolvedSourceType, sourceRole: resolvedSourceRole,
      sourceCategory: sourceCategory(resolvedSourceRole, resolvedSourceType),
      evidenceRoles: entry?.coverage?.evidenceRoles ?? [],
      languageScope: entry?.coverage?.languageScope ?? (typeof metadata.languageScope === "string" ? metadata.languageScope : "MIXED"),
      platform, collectionMethod: source?.collectionMethod ?? entry?.collectionMethod ?? "MANUAL",
      canonicalUrl: source?.canonicalUrl ?? entry?.canonicalUrl ?? null,
      providerRef: source?.providerRef ?? entry?.providerRef ?? "",
      priority: entry?.priority ?? source?.authorityScore ?? 50,
      factualSource: entry?.factualSource ?? metadata.factualSource === true,
      signalSource: entry?.signalSource ?? metadata.signalSource === true,
      referenceOnly: entry?.referenceOnly === true || metadata.referenceOnly === true,
      discoveryRouteIds,
      status: source?.status ?? "MISSING", enabled: source?.enabled ?? false,
      acquisition: { kind: acquisition.kind, costLevel: acquisition.primaryRoute.costLevel, runtimeOwner: acquisition.runtimeOwner,
        serverRuntimeSupported: acquisition.serverRuntimeSupported, primaryRouteId: acquisition.primaryRoute.id, fallbackRouteCount: acquisition.fallbackRoutes.length },
      effectiveQualification, health, lastCollectedAt: source?.lastCollectedAt?.toISOString() ?? null
    };
  }

  const items = [
    ...RADAR_SOURCE_PORTFOLIO.map((entry) => buildIndexItem(sourceById.get(entry.sourceId) ?? null, entry)),
    ...operatorSources.map((source) => buildIndexItem(source, null))
  ];
  const staticCapabilityByPlatform = new Map(
    SOURCE_PLATFORM_CAPABILITIES.map((item) => [item.platform, item])
  );
  const platformKeys = [...new Set([
    ...items.map((item) => item.platform),
    ...SOURCE_PLATFORM_CAPABILITIES.map((item) => item.platform),
    ...DAILYHOT_DOMESTIC_RUNTIME_ROUTES.map((item) => item.platform)
  ])].sort();
  const dailyHotSource = items.find((item) => item.sourceId === "source_radar_dailyhot_domestic") ?? null;
  const platformCapabilities = platformKeys.map((platform) => {
    const capability = staticCapabilityByPlatform.get(platform) ?? null;
    const platformSources = items.filter((item) => item.platform === platform);
    const supportedSources = platformSources.filter((item) => item.acquisition.serverRuntimeSupported);
    const qualifiedSources = supportedSources.filter((item) => item.effectiveQualification === "AUTO_READY");
    const activeSources = qualifiedSources.filter((item) =>
      item.status === "ACTIVE" && item.enabled && item.health !== "FAILED" && item.health !== "MISSING"
    );
    const aggregatorRoute = DAILYHOT_DOMESTIC_RUNTIME_ROUTES.find((item) => item.platform === platform) ?? null;
    const activeViaAggregator = Boolean(
      aggregatorRoute &&
      dailyHotSource &&
      dailyHotSource.status === "ACTIVE" &&
      dailyHotSource.enabled &&
      dailyHotSource.acquisition.serverRuntimeSupported &&
      dailyHotSource.effectiveQualification === "AUTO_READY" &&
      dailyHotSource.health !== "FAILED" &&
      dailyHotSource.health !== "MISSING"
    );
    const routeIds = [...new Set([
      ...platformSources.flatMap((item) =>
        resolveDiscoveryRouteIds({
          sourceRole: item.sourceRole,
          sourceType: item.sourceType,
          evidenceRoles: item.evidenceRoles
        })
      ),
      ...(aggregatorRoute ? ["AGGREGATED_DISCOVERY" as const] : []),
      ...(aggregatorRoute?.role === "SOCIAL_SIGNAL" ? ["SOCIAL_SIGNAL" as const] : []),
      ...(aggregatorRoute?.role === "DEVELOPER_COMMUNITY" ? ["DEVELOPER_ADOPTION" as const] : [])
    ])];
    const runtimeState =
      (activeSources.length || activeViaAggregator) ? "ACTIVE" as const :
      qualifiedSources.length ? "QUALIFIED" as const :
      (supportedSources.length || capability || aggregatorRoute) ? "SUPPORTED" as const :
      "BLOCKED" as const;
    return {
      platform,
      label: capability?.label ?? platform.replaceAll("_", " "),
      region: capability?.region ?? "OVERSEAS" as const,
      discoveryOwner: routeIds.length
        ? routeIds.map((routeId) => DISCOVERY_ROUTE_DEFINITIONS.find((route) => route.id === routeId)?.label ?? routeId).join(" / ")
        : capability?.discoveryOwner ?? "尚未绑定 Discovery Route",
      creatorRoute: capability?.creatorRoute ?? "由已注册 Source 的 Acquisition Plan 决定",
      defaultMode: capability?.defaultMode ?? "FEED_FIRST",
      freeAccess: capability?.freeAccess ?? "按 Source Acquisition Plan",
      schedulePolicy: capability?.schedulePolicy ?? "由 Source Runtime Governance 决定",
      status: runtimeState === "ACTIVE" ? "ACTIVE" as const : "CONDITIONAL" as const,
      runtimeState,
      reason: activeSources.length
        ? "已有直连 AUTO_READY Source 进入 SYSTEM Collection。"
        : activeViaAggregator
          ? "通过国内综合热点 AUTO_READY Source 的 " + aggregatorRoute!.route + " Route 进入 SYSTEM Collection。"
        : qualifiedSources.length
          ? "已通过资格，但当前没有健康启用 Source。"
          : supportedSources.length
            ? "Runtime 已支持，仍需真实运行证据达到 AUTO_READY。"
            : capability?.reason ?? "尚无可运行 Source。",
      sourceCount: platformSources.length,
      supportedSourceCount: supportedSources.length,
      qualifiedSourceCount: qualifiedSources.length,
      activeSourceCount: activeSources.length + (activeViaAggregator ? 1 : 0),
      productionPath: activeSources.length ? "DIRECT_SOURCE" as const : activeViaAggregator ? "AGGREGATED_ROUTE" as const : "NONE" as const,
      backingSourceIds: [
        ...activeSources.map((item) => item.sourceId),
        ...(activeViaAggregator && dailyHotSource ? [dailyHotSource.sourceId] : [])
      ],
      aggregatorRoute: aggregatorRoute?.route ?? null,
      discoveryRouteIds: routeIds
    };
  });
  const discoveryRoutes = DISCOVERY_ROUTE_DEFINITIONS.map((route) => {
    const routeSources = items.filter((item) => resolveDiscoveryRouteIds({
      sourceRole: item.sourceRole,
      sourceType: item.sourceType,
      evidenceRoles: item.evidenceRoles
    }).includes(route.id));
    const activeSources = routeSources.filter((item) =>
      item.status === "ACTIVE" &&
      item.enabled &&
      item.acquisition.serverRuntimeSupported &&
      item.effectiveQualification === "AUTO_READY"
    );
    return {
      ...route,
      sourceCount: routeSources.length,
      activeSourceCount: activeSources.length,
      platformCount: new Set(routeSources.map((item) => item.platform)).size,
      sourceIds: routeSources.map((item) => item.sourceId),
      status: activeSources.length ? "ACTIVE" as const : routeSources.length ? "CONDITIONAL" as const : "EMPTY" as const
    };
  });
  return {
    summary: {
      sourceCount: items.length, radarSourceCount: RADAR_SOURCE_PORTFOLIO.length, operatorAddedSourceCount: operatorSources.length,
      healthyCount: items.filter((item) => item.health === "HEALTHY").length,
      attentionCount: items.filter((item) => ["FAILED","MISSING","DISABLED"].includes(item.health)).length,
      autoReadyCount: items.filter((item) => item.effectiveQualification === "AUTO_READY").length,
      conditionalCount: items.filter((item) => item.effectiveQualification === "CONDITIONAL").length
    },
    items,
    optionalCapabilities: RADAR_OPTIONAL_CAPABILITIES.filter((item) =>
      !["redfox_social","socialdata_x","tikhub_douyin","tikhub_xiaohongshu"].includes(item.key)
    ),
    platformCapabilities,
    discoveryRoutes,
    apiQuota: {
      YOUTUBE: youtubeQuota
    },
    aggregators: {
      dailyHot: {
        sourceId: "source_radar_dailyhot_domestic",
        label: "国内综合热点",
        keepRoutes: DAILYHOT_DOMESTIC_RUNTIME_ROUTES,
        excludedRoutes: DAILYHOT_DOMESTIC_EXCLUDED_ROUTES
      },
      aiHot: { sourceId: "source_radar_ai_hot", label: "AI HOT", role: "综合 AI 发现" },
      hackerNews: { sourceId: "source_radar_hacker_news", label: "Hacker News · AI", role: "开发者讨论信号" },
      github: { sourceId: "source_radar_github_trending", label: "GitHub Trending · AI", role: "工具采用信号" },
      productHunt: { sourceId: "source_radar_product_hunt", label: "Product Hunt", role: "产品发布 / 采用信号" }
    },
    lifecycle: { current: "SOURCE_MANAGEMENT_CONSOLE_018", addFlow: ["DISCOVER","CHECK","PREVIEW","REGISTER","QUALIFY","SYSTEM_COLLECTION"] }
  };
}

export async function getSourceManagementDetail(sourceId: string) {
  const db = getDatabase();
  const [index, sourceRows, runs, utility] = await Promise.all([
    getSourceManagementIndex(),
    db.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1),
    db.select().from(contentCollectionRuns)
      .where(eq(contentCollectionRuns.sourceId, sourceId))
      .orderBy(desc(contentCollectionRuns.startedAt))
      .limit(12),
    readSourceRuntimeUtility(sourceId)
  ]);
  const baseItem = index.items.find((entry) => entry.sourceId === sourceId);
  const source = sourceRows[0] ?? null;
  if (!baseItem || !source) throw new Error("SOURCE_NOT_FOUND");

  const metadata = record(source.metadata);
  const runtimeQualification = record(metadata.runtimeQualification);
  const rawQualification = String(
    baseItem.effectiveQualification ??
    runtimeQualification.effectiveQualification ??
    "CONDITIONAL"
  );
  const qualification: SourceRuntimeQualification =
    ["AUTO_READY", "CONDITIONAL", "MANUAL_ONLY", "DISABLED"].includes(rawQualification)
      ? rawQualification as SourceRuntimeQualification
      : "CONDITIONAL";
  const governanceDecision = evaluateSourceRuntimeGovernance({
    qualification,
    utility: utility.decision,
    facts: utility.facts
  });
  const productionRuns = runs.filter(isRuntimeRelevantProductionRun);
  const latestProductionRun = productionRuns[0] ?? null;
  const execution = buildSourceGovernanceExecutionPlan({
    sourceId,
    governancePlan: governanceDecision.plan,
    recommendedIntervalMultiplier: governanceDecision.recommendedIntervalMultiplier,
    qualificationKnown: true,
    coverageCritical: governanceDecision.coverageCritical,
    baseIntervalMinutes: resolveSourceBaseIntervalMinutes(source),
    lastRunAt: latestProductionRun?.startedAt ?? null
  });
  const successfulRuns = productionRuns.filter((run) => run.status === "SUCCEEDED");
  const evidenceSufficiency =
    productionRuns.length >= 5 && successfulRuns.length >= 4 ? "MATURE" as const :
    productionRuns.length >= 2 && successfulRuns.length >= 1 ? "EARLY" as const :
    "INSUFFICIENT" as const;

  return {
    item: {
      ...baseItem,
      qualificationReasons: [
        typeof runtimeQualification.reason === "string"
          ? runtimeQualification.reason
          : "RUNTIME_QUALIFICATION_SNAPSHOT"
      ],
      evidenceSufficiency,
      latestRun: latestProductionRun ? {
        status: latestProductionRun.status,
        startedAt: latestProductionRun.startedAt.toISOString(),
        finishedAt: latestProductionRun.finishedAt?.toISOString() ?? null,
        receivedCount: latestProductionRun.receivedCount,
        createdCount: latestProductionRun.createdCount,
        duplicateCount: latestProductionRun.duplicateCount,
        errorCode: latestProductionRun.errorCode
      } : null,
      recent: {
        runCount: productionRuns.length,
        successRate: productionRuns.length
          ? Math.round(successfulRuns.length / productionRuns.length * 100)
          : null,
        lastSuccessAt: successfulRuns[0]?.finishedAt?.toISOString() ?? null
      },
      governance: {
        plan: governanceDecision.plan,
        runtimeHealth: governanceDecision.runtimeHealth,
        recommendedIntervalMultiplier: governanceDecision.recommendedIntervalMultiplier,
        action: execution.action,
        baseIntervalMinutes: execution.baseIntervalMinutes,
        effectiveIntervalMinutes: execution.effectiveIntervalMinutes,
        nextDueAt: execution.nextDueAt,
        due: execution.due,
        humanReviewRequired: execution.requiresHumanReview || governanceDecision.humanReviewRequired,
        reasons: governanceDecision.reasons
      }
    },
    utility
  };
}

