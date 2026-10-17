import "server-only";

import { and, desc, eq, inArray, lte, or, sql } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentCollectionRuns, contentSources } from "../db/schema";
import { resolveSourcePolicy } from "./source-policy";
import {
  buildQualificationCheckpoint,
  currentQualificationEvidencePredicate,
  SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION,
  SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS
} from "./source-qualification-runtime";
import {
  acquisitionSupportsServerRuntime,
  resolveSourceAcquisitionPlan
} from "./source-acquisition-plan";

export const SOURCE_RUNTIME_QUALIFICATIONS = [
  "AUTO_READY",
  "CONDITIONAL",
  "MANUAL_ONLY",
  "DISABLED"
] as const;
export type SourceRuntimeQualification =
  (typeof SOURCE_RUNTIME_QUALIFICATIONS)[number];

export const SOURCE_QUALIFICATION_RECENT_RUN_LIMIT = 5;
export const SOURCE_QUALIFICATION_SCAN_LIMIT = 12;
export { SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS } from "./source-qualification-runtime";

export const SOURCE_ADAPTER_FAMILIES = [
  "FEED_WEB",
  "NEWS_TREND_DISCOVERY",
  "PLATFORM_API",
  "SOCIAL_BROWSER",
  "MEDIA_TRANSCRIPT"
] as const;
export type SourceAdapterFamily = (typeof SOURCE_ADAPTER_FAMILIES)[number];

export const SOURCE_UNIVERSE_ROLES = [
  "OFFICIAL",
  "PROFESSIONAL_MEDIA",
  "RESEARCH",
  "CREATOR",
  "DEVELOPER_COMMUNITY",
  "DISCOVERY_AGGREGATOR",
  "SOCIAL"
] as const;
export type SourceUniverseRole = (typeof SOURCE_UNIVERSE_ROLES)[number];

export const SOURCE_EVIDENCE_ROLES = [
  "PRIMARY_FACT",
  "MEDIA_CONFIRMATION",
  "ANALYSIS",
  "BENCHMARK",
  "TUTORIAL",
  "EXPERIENCE",
  "ADOPTION",
  "SOCIAL_SIGNAL",
  "DEMAND_SIGNAL"
] as const;
export type SourceEvidenceRole = (typeof SOURCE_EVIDENCE_ROLES)[number];

export const SOURCE_QUALIFICATION_EVIDENCE_SUFFICIENCY = [
  "INSUFFICIENT",
  "EARLY",
  "MATURE"
] as const;
export type SourceQualificationEvidenceSufficiency =
  (typeof SOURCE_QUALIFICATION_EVIDENCE_SUFFICIENCY)[number];

export type SourceQualificationEvidence = {
  stableBackend: boolean;
  requiresManualLoginPerRun: boolean;
  continuousRuntimeAvailable: boolean;
  stableIdentity: boolean;
  timeSemanticsKnown: boolean;
  provenanceVerified: boolean;
  dedupeVerified: boolean;
  sourceFailureIsolated: boolean;
  manualIsolationVerified: boolean;
  capabilityOutputVerified: boolean;
  rerunnableAcceptance: boolean;
  currentRuntimeContractObserved: boolean;
  qualificationCheckpointCurrent: boolean;
  liveRunCount: number;
  successfulLiveRunCount: number;
  runtimeDependency: string | null;
  manualOperationOnly: boolean;
  commercialOrLegalRestriction: boolean;
  excessivePollution: boolean;
  lowValue: boolean;
};

export type SourceQualificationInput = {
  sourceId: string;
  name: string;
  sourceType: string;
  platform: string;
  collectionMethod: string;
  canonicalUrl: string | null;
  providerRef: string | null;
  status: string;
  enabled: boolean;
  metadata: unknown;
  collectionConfig: unknown;
  signalConfig: unknown;
  liveRunCount: number;
  successfulLiveRunCount: number;
  runtimeEvidence?: {
    currentRuntimeContractObserved: boolean;
    checkpointCurrent: boolean;
    stableRouteExecution: boolean;
    systemProvenanceVerified: boolean;
    timeSemanticsKnown: boolean;
    capabilityOutputVerified: boolean;
  };
};

export type SourceQualificationDecision = {
  sourceId: string;
  qualification: SourceRuntimeQualification;
  sourceRole: SourceUniverseRole;
  evidenceRoles: SourceEvidenceRole[];
  adapterFamilies: SourceAdapterFamily[];
  reasons: string[];
  evidence: SourceQualificationEvidence;
  evidenceSufficiency: SourceQualificationEvidenceSufficiency;
};

export type SourceQualificationSnapshot = SourceQualificationDecision & {
  name: string;
  platform: string;
  collectionMethod: string;
  canonicalUrl: string | null;
  providerRef: string | null;
};

type QualificationRunEvidenceRow = {
  sourceId: string | null;
  status: string;
  receivedCount: number;
  metadata: unknown;
  startedAt: Date;
};

export function selectRecentQualificationRuns(
  runs: QualificationRunEvidenceRow[],
  now = new Date()
) {
  const safetySince = new Date(
    now.getTime() - SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS * 86_400_000
  );
  const eligible = runs
    .filter((run) => {
      const metadata = record(run.metadata);
      return (
        run.startedAt >= safetySince &&
        run.startedAt <= now &&
        metadata.qualificationOnly !== true &&
        String(metadata.collectionOrigin ?? "") === "SYSTEM" &&
        ["SUCCEEDED", "FAILED"].includes(run.status)
      );
    })
    .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
    .slice(0, SOURCE_QUALIFICATION_SCAN_LIMIT);
  return {
    scanned: eligible,
    sample: eligible.slice(0, SOURCE_QUALIFICATION_RECENT_RUN_LIMIT),
    safetySince
  };
}

export function selectCurrentCheckpointQualificationRuns(runs:QualificationRunEvidenceRow[],checkpoint:string,now=new Date()){
  const current=runs.filter(run=>{
    const metadata=record(run.metadata);
    return metadata.collectionRuntimeVersion===SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION && metadata.qualificationCheckpoint===checkpoint && record(metadata.staleRunRecovery).excludeFromRuntimeQualification!==true;
  });
  return selectRecentQualificationRuns(current,now).sample;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function bool(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function hostname(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function sourceRoleFromLegacyLabel(value: string): SourceUniverseRole | null {
  const normalized = value.toUpperCase();
  if (normalized === "OFFICIAL") return "OFFICIAL";
  if (normalized === "MEDIA") return "PROFESSIONAL_MEDIA";
  if (normalized === "RESEARCH") return "RESEARCH";
  if (normalized === "CREATOR") return "CREATOR";
  if (normalized === "COMMUNITY" || normalized === "DEVELOPER") return "DEVELOPER_COMMUNITY";
  if (normalized === "DISCOVERY" || normalized === "AGGREGATOR") return "DISCOVERY_AGGREGATOR";
  if (normalized === "SOCIAL") return "SOCIAL";
  return null;
}

function isBrowserMethod(input: SourceQualificationInput) {
  const meta = record(input.metadata);
  const config = record(input.collectionConfig);
  const platform = input.platform.toUpperCase();
  const method = input.collectionMethod.toUpperCase();
  const sourceMode = String(
    meta.sourceMode ??
    config.sourceMode ??
    ""
  ).toUpperCase();
  return (
    method === "RUNNER" ||
    (
      method === "WATCHLIST" &&
      ["XIAOHONGSHU", "DOUYIN", "WEIBO", "ZHIHU", "X"].includes(platform)
    ) ||
    sourceMode.includes("BROWSER") ||
    sourceMode.includes("LOGIN_REQUIRED") ||
    sourceMode.includes("CONNECTED_RUNNER")
  );
}

export function inferSourceUniverseRole(
  input: Pick<
    SourceQualificationInput,
    "sourceId" |
    "sourceType" |
    "platform" |
    "collectionMethod" |
    "canonicalUrl" |
    "providerRef" |
    "metadata" |
    "collectionConfig"
  >
): SourceUniverseRole {
  const meta = record(input.metadata);
  const explicit = text(meta.sourceUniverseRole);
  if (explicit && SOURCE_UNIVERSE_ROLES.includes(explicit as SourceUniverseRole)) {
    return explicit as SourceUniverseRole;
  }

  const policy = resolveSourcePolicy({
    id: input.sourceId,
    providerRef: input.providerRef,
    platform: input.platform,
    canonicalUrl: input.canonicalUrl
  });
  if (policy) {
    const policyRole = sourceRoleFromLegacyLabel(policy.sourceType);
    if (policyRole) return policyRole;
  }

  const config = record(input.collectionConfig);
  const sourceKind = text(config.sourceKind);
  if (sourceKind) {
    const configRole = sourceRoleFromLegacyLabel(sourceKind);
    if (configRole) return configRole;
  }

  const host = hostname(input.canonicalUrl);
  if (host === "arxiv.org" || host?.endsWith(".arxiv.org")) return "RESEARCH";
  if (
    host === "news.ycombinator.com" ||
    host === "hnrss.org" ||
    host?.endsWith(".hnrss.org") ||
    host === "github.com" ||
    host?.endsWith(".github.com")
  ) {
    return "DEVELOPER_COMMUNITY";
  }

  const registry = record(meta.sourceRegistry);
  const registryRoles = Array.isArray(registry.sourceRoles)
    ? registry.sourceRoles.filter((item): item is string => typeof item === "string")
    : [];
  for (const role of registryRoles) {
    const mapped = sourceRoleFromLegacyLabel(role);
    if (mapped && mapped !== "SOCIAL") return mapped;
  }

  const sourceType = input.sourceType.toUpperCase();
  if (sourceType === "OFFICIAL") return "OFFICIAL";
  if (sourceType === "MEDIA" || sourceType === "MEDIA_DISCOVERY") return "PROFESSIONAL_MEDIA";
  if (sourceType === "RESEARCH") return "RESEARCH";
  if (sourceType === "CREATOR") return "CREATOR";
  if (
    sourceType === "DEVELOPER" ||
    input.platform.toUpperCase() === "GITHUB" ||
    input.platform.toUpperCase() === "HACKER_NEWS"
  ) {
    return "DEVELOPER_COMMUNITY";
  }
  if (
    sourceType === "DISCOVERY" ||
    input.collectionMethod.toUpperCase() === "TREND"
  ) {
    return "DISCOVERY_AGGREGATOR";
  }
  return "SOCIAL";
}

export function inferSourceEvidenceRoles(
  input: Pick<
    SourceQualificationInput,
    "sourceId" |
    "sourceType" |
    "platform" |
    "collectionMethod" |
    "canonicalUrl" |
    "providerRef" |
    "metadata" |
    "collectionConfig" |
    "signalConfig"
  >
): SourceEvidenceRole[] {
  const meta = record(input.metadata);
  const explicit = Array.isArray(meta.evidenceRoles)
    ? meta.evidenceRoles
        .filter((item): item is string => typeof item === "string")
        .filter((item): item is SourceEvidenceRole =>
          SOURCE_EVIDENCE_ROLES.includes(item as SourceEvidenceRole)
        )
    : [];
  if (explicit.length) return [...new Set(explicit)];

  const sourceRole = inferSourceUniverseRole(input);
  if (sourceRole === "OFFICIAL") return ["PRIMARY_FACT"];
  if (sourceRole === "PROFESSIONAL_MEDIA") return ["MEDIA_CONFIRMATION"];
  if (sourceRole === "RESEARCH") return ["PRIMARY_FACT", "BENCHMARK"];
  if (sourceRole === "DEVELOPER_COMMUNITY") return ["ADOPTION", "SOCIAL_SIGNAL"];
  if (sourceRole === "DISCOVERY_AGGREGATOR") return ["SOCIAL_SIGNAL"];

  const signal = record(input.signalConfig);
  if (bool(signal.signalOnly) || bool(meta.referenceOnly)) {
    return ["SOCIAL_SIGNAL"];
  }
  return ["ANALYSIS", "TUTORIAL", "EXPERIENCE", "SOCIAL_SIGNAL"];
}

export function inferSourceAdapterFamilies(
  input: Pick<
    SourceQualificationInput,
    "collectionMethod" | "platform" | "metadata" | "collectionConfig"
  >
): SourceAdapterFamily[] {
  const method = input.collectionMethod.toUpperCase();
  const platform = input.platform.toUpperCase();
  const meta = record(input.metadata);
  const config = record(input.collectionConfig);
  const provider = String(config.provider ?? "").toUpperCase();
  const automaticCollection = record(config.automaticCollection);
  const automaticAdapter = String(automaticCollection.adapter ?? "").toUpperCase();
  const sourceMode = String(meta.sourceMode ?? config.sourceMode ?? "").toUpperCase();
  const result = new Set<SourceAdapterFamily>();
  const acquisition = resolveSourceAcquisitionPlan({
    collectionMethod: input.collectionMethod,
    platform: input.platform,
    metadata: input.metadata,
    collectionConfig: input.collectionConfig
  });

  if (["RSS_ATOM", "SITEMAP", "PUBLIC_GENERATED_FEED", "STATIC_PAGE", "JINA_READER"].includes(acquisition.kind)) {
    result.add("FEED_WEB");
  }
  if (
    acquisition.kind === "TREND_DISCOVERY" ||
    acquisition.kind === "SEARCH_DISCOVERY" ||
    provider.includes("DAILYHOT") ||
    provider.includes("TRENDRADAR") ||
    provider.includes("NEWS") ||
    provider.includes("SEARCH")
  ) {
    result.add("NEWS_TREND_DISCOVERY");
  }
  if (
    acquisition.kind === "PUBLIC_JSON_API" ||
    acquisition.kind === "PLATFORM_API" ||
    ["GITHUB", "HACKER_NEWS", "ARXIV", "HUGGINGFACE", "HUGGING_FACE", "YOUTUBE"].includes(platform) ||
    method === "API"
  ) {
    result.add("PLATFORM_API");
  }
  if (
    acquisition.kind === "SOCIAL_BROWSER" ||
    sourceMode.includes("BROWSER") ||
    sourceMode.includes("LOGIN_REQUIRED")
  ) {
    result.add("SOCIAL_BROWSER");
  }
  if (automaticAdapter.includes("RSSHUB") || provider.includes("RSSHUB")) {
    result.add("FEED_WEB");
  }
  if (
    acquisition.kind === "MEDIA_TRANSCRIPT" ||
    bool(meta.mediaSource) ||
    bool(meta.transcriptCapable) ||
    String(meta.purpose ?? "").toUpperCase().includes("MEDIA")
  ) {
    result.add("MEDIA_TRANSCRIPT");
  }

  return [...result];
}

export function buildSourceQualificationEvidence(
  input: SourceQualificationInput
): SourceQualificationEvidence {
  const meta = record(input.metadata);
  const qualification = record(meta.sourceQualification);
  const sourceRegistry = record(meta.sourceRegistry);
  const manualTarget = record(meta.manualTarget);
  const autoRuntimePolicy = record(meta.autoRuntimePolicy);
  const browserMethod = isBrowserMethod(input);
  const acquisition = resolveSourceAcquisitionPlan(input);
  const runtimeEvidence = input.runtimeEvidence;
  const currentRuntimeContractObserved =
    runtimeEvidence?.currentRuntimeContractObserved === true;
  const runtimeDependency =
    text(qualification.runtimeDependency) ??
    (browserMethod ? "LOCAL_BROWSER_OR_SESSION" : null);
  const temporaryManualOnly =
    String(sourceRegistry.usageMode ?? "").toUpperCase() === "MANUAL" &&
    manualTarget.longTermEligible === false;
  const governedManualOnly =
    String(autoRuntimePolicy.status ?? "").toUpperCase() === "MANUAL_OPTIONAL_ONLY";

  return {
    stableBackend: bool(
      qualification.stableBackend,
      runtimeEvidence?.stableRouteExecution === true
    ),
    requiresManualLoginPerRun: bool(
      qualification.requiresManualLoginPerRun,
      browserMethod
    ),
    continuousRuntimeAvailable: bool(
      qualification.continuousRuntimeAvailable,
      !browserMethod && acquisitionSupportsServerRuntime(acquisition.kind, acquisition.runtimeOwner)
    ),
    stableIdentity: bool(
      qualification.stableIdentity,
      Boolean(input.canonicalUrl || input.providerRef)
    ),
    timeSemanticsKnown: bool(
      qualification.timeSemanticsKnown,
      runtimeEvidence?.timeSemanticsKnown === true
    ),
    provenanceVerified: bool(
      qualification.provenanceVerified,
      runtimeEvidence?.systemProvenanceVerified === true
    ),
    dedupeVerified: bool(qualification.dedupeVerified, currentRuntimeContractObserved),
    sourceFailureIsolated: bool(
      qualification.sourceFailureIsolated,
      currentRuntimeContractObserved
    ),
    manualIsolationVerified: bool(
      qualification.manualIsolationVerified,
      currentRuntimeContractObserved
    ),
    capabilityOutputVerified: bool(
      qualification.capabilityOutputVerified,
      runtimeEvidence?.capabilityOutputVerified === true
    ),
    rerunnableAcceptance: bool(
      qualification.rerunnableAcceptance,
      currentRuntimeContractObserved
    ),
    currentRuntimeContractObserved: bool(
      qualification.currentRuntimeContractObserved,
      currentRuntimeContractObserved
    ),
    qualificationCheckpointCurrent: bool(
      qualification.qualificationCheckpointCurrent,
      runtimeEvidence?.checkpointCurrent === true
    ),
    liveRunCount: numberValue(input.liveRunCount),
    successfulLiveRunCount: numberValue(input.successfulLiveRunCount),
    runtimeDependency,
    manualOperationOnly: bool(
      qualification.manualOperationOnly,
      input.collectionMethod.toUpperCase() === "MANUAL" ||
      temporaryManualOnly ||
      governedManualOnly
    ),
    commercialOrLegalRestriction: bool(qualification.commercialOrLegalRestriction),
    excessivePollution: bool(qualification.excessivePollution),
    lowValue: bool(qualification.lowValue)
  };
}

export function evaluateSourceQualification(
  input: SourceQualificationInput
): SourceQualificationDecision {
  const evidence = buildSourceQualificationEvidence(input);
  const reasons: string[] = [];
  const sourceRole = inferSourceUniverseRole(input);
  const evidenceRoles = inferSourceEvidenceRoles(input);
  const adapterFamilies = inferSourceAdapterFamilies(input);
  const acquisition = resolveSourceAcquisitionPlan(input);
  const meta = record(input.metadata);
  const runtimeQualification = record(meta.runtimeQualification);
  const currentCheckpoint = buildQualificationCheckpoint({
    sourceId: input.sourceId,
    platform: input.platform,
    collectionMethod: input.collectionMethod,
    canonicalUrl: input.canonicalUrl,
    providerRef: input.providerRef,
    collectionConfig: input.collectionConfig,
    metadata: input.metadata
  });
  const runtimeCheckpointCurrent =
    runtimeQualification.checkpoint === currentCheckpoint.checkpoint;
  const runtimeEffective = runtimeCheckpointCurrent
    ? String(runtimeQualification.effectiveQualification ?? "")
    : "";
  const runtimeCheckpointStale =
    Boolean(runtimeQualification.checkpoint) && !runtimeCheckpointCurrent;
  const sourceQualificationMeta = record(meta.sourceQualification);
  const qualificationCheckpointCurrent =
    sourceQualificationMeta.qualificationCheckpoint === currentCheckpoint.checkpoint ||
    input.runtimeEvidence?.checkpointCurrent === true;
  const evidenceSufficiency: SourceQualificationEvidenceSufficiency =
    evidence.liveRunCount >= 5 && evidence.successfulLiveRunCount >= 4
      ? "MATURE"
      : evidence.liveRunCount >= 2 && evidence.successfulLiveRunCount >= 1
        ? "EARLY"
        : "INSUFFICIENT";
  const runtimeConditionalIsHealthBlock =
    runtimeEffective === "CONDITIONAL" &&
    ["CONSECUTIVE_FAILURES_3"].includes(String(runtimeQualification.reason ?? ""));

  if (acquisition.kind === "UNRESOLVED") {
    reasons.push("ACQUISITION_ROUTE_UNRESOLVED");
  }
  if (!input.enabled || input.status.toUpperCase() !== "ACTIVE") {
    reasons.push("SOURCE_DISABLED");
  }
  if (evidence.commercialOrLegalRestriction) reasons.push("COMMERCIAL_OR_LEGAL_RESTRICTION");
  if (evidence.excessivePollution) reasons.push("EXCESSIVE_POLLUTION");
  if (evidence.lowValue) reasons.push("LOW_VALUE");

  if (reasons.length) {
    return {
      sourceId: input.sourceId,
      qualification: "DISABLED",
      sourceRole,
      evidenceRoles,
      adapterFamilies,
      reasons,
      evidence,
      evidenceSufficiency
    };
  }

  if (evidence.manualOperationOnly) {
    return {
      sourceId: input.sourceId,
      qualification: "MANUAL_ONLY",
      sourceRole,
      evidenceRoles,
      adapterFamilies,
      reasons: ["EXPLICIT_MANUAL_OPERATION_ONLY"],
      evidence,
      evidenceSufficiency
    };
  }

  if (runtimeEffective === "DISABLED") {
    return {
      sourceId: input.sourceId,
      qualification: "DISABLED",
      sourceRole,
      evidenceRoles,
      adapterFamilies,
      reasons: ["RUNTIME_QUALIFICATION_DISABLED"],
      evidence,
      evidenceSufficiency
    };
  }

  const autoReady =
    acquisition.kind !== "UNRESOLVED" &&
    acquisition.kind !== "MANUAL" &&
    qualificationCheckpointCurrent &&
    evidence.stableBackend &&
    !evidence.requiresManualLoginPerRun &&
    evidence.continuousRuntimeAvailable &&
    evidence.stableIdentity &&
    evidence.timeSemanticsKnown &&
    evidence.provenanceVerified &&
    evidence.dedupeVerified &&
    evidence.sourceFailureIsolated &&
    evidence.manualIsolationVerified &&
    evidence.capabilityOutputVerified &&
    evidence.rerunnableAcceptance &&
    evidence.liveRunCount >= 5 &&
    evidence.successfulLiveRunCount >= 4 &&
    !evidence.runtimeDependency;

  if (autoReady && !runtimeConditionalIsHealthBlock) {
    return {
      sourceId: input.sourceId,
      qualification: "AUTO_READY",
      sourceRole,
      evidenceRoles,
      adapterFamilies,
      reasons: ["AUTO_QUALIFICATION_EVIDENCE_COMPLETE"],
      evidence,
      evidenceSufficiency
    };
  }

  if (runtimeConditionalIsHealthBlock) {
    reasons.push("RUNTIME_QUALIFICATION_CONDITIONAL");
  }
  if (runtimeCheckpointStale) {
    reasons.push("RUNTIME_CHECKPOINT_STALE");
  }
  if (!qualificationCheckpointCurrent) {
    reasons.push("QUALIFICATION_CHECKPOINT_MISSING_OR_STALE");
  }

  if (evidence.requiresManualLoginPerRun) reasons.push("MANUAL_LOGIN_DEPENDENCY");
  if (!evidence.continuousRuntimeAvailable) reasons.push("CONTINUOUS_RUNTIME_NOT_VERIFIED");
  if (evidence.runtimeDependency) reasons.push("RUNTIME_DEPENDENCY:" + evidence.runtimeDependency);
  if (!evidence.stableBackend) reasons.push("STABLE_BACKEND_NOT_VERIFIED");
  if (evidence.liveRunCount < 5) reasons.push("LIVE_RUNS_BELOW_5");
  if (evidence.successfulLiveRunCount < 4) reasons.push("SUCCESSFUL_RUNS_BELOW_4");
  if (!evidence.timeSemanticsKnown) reasons.push("TIME_SEMANTICS_NOT_VERIFIED");
  if (!evidence.provenanceVerified) reasons.push("PROVENANCE_NOT_VERIFIED");
  if (!evidence.dedupeVerified) reasons.push("DEDUPE_NOT_VERIFIED");
  if (!evidence.sourceFailureIsolated) reasons.push("FAILURE_ISOLATION_NOT_VERIFIED");
  if (!evidence.manualIsolationVerified) reasons.push("MANUAL_ISOLATION_NOT_VERIFIED");
  if (!evidence.capabilityOutputVerified) reasons.push("CAPABILITY_OUTPUT_NOT_VERIFIED");
  if (!evidence.rerunnableAcceptance) reasons.push("RERUNNABLE_ACCEPTANCE_MISSING");

  return {
    sourceId: input.sourceId,
    qualification: "CONDITIONAL",
    sourceRole,
    evidenceRoles,
    adapterFamilies,
    reasons: [...new Set(reasons)],
    evidence,
    evidenceSufficiency
  };
}

export function buildSourceQualificationSnapshots(
  sources: Array<Omit<SourceQualificationInput, "liveRunCount" | "successfulLiveRunCount">>,
  runs: Array<{ sourceId: string | null; status: string }>
): SourceQualificationSnapshot[] {
  const runsBySource = new Map<string, Array<{ status: string }>>();
  for (const run of runs) {
    if (!run.sourceId) continue;
    const list = runsBySource.get(run.sourceId) ?? [];
    list.push({ status: run.status });
    runsBySource.set(run.sourceId, list);
  }

  return sources.map((source) => {
    const sourceRuns = runsBySource.get(source.sourceId) ?? [];
    const decision = evaluateSourceQualification({
      ...source,
      liveRunCount: sourceRuns.length,
      successfulLiveRunCount: sourceRuns.filter((item) => item.status === "SUCCEEDED").length
    });
    return {
      ...decision,
      name: source.name,
      platform: source.platform,
      collectionMethod: source.collectionMethod,
      canonicalUrl: source.canonicalUrl,
      providerRef: source.providerRef
    };
  });
}

export async function listSourceQualificationSnapshots(
  sourceIdsFilter?: string[]
): Promise<SourceQualificationSnapshot[]> {
  const db = getDatabase();
  const sources = sourceIdsFilter?.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIdsFilter))
    : await db.select().from(contentSources);
  const sourceIds = sources.map((source) => source.id);
  const now = new Date();
  const checkpoints = new Map(sources.map(source => [source.id, buildQualificationCheckpoint({...source, sourceId: source.id})]));
  // Rank IDs before fetching the potentially large Run metadata. Apply the same
  // current-checkpoint evidence filters as the runtime health window before ranking.
  const rankedRuns = db.select({
    id: contentCollectionRuns.id,
    runRank: sql<number>`row_number() over (partition by ${contentCollectionRuns.sourceId} order by ${contentCollectionRuns.startedAt} desc, ${contentCollectionRuns.id} desc)`.as("run_rank")
  }).from(contentCollectionRuns).where(or(...sources.map(source =>
    currentQualificationEvidencePredicate(source.id, checkpoints.get(source.id)!.checkpoint, now)
  ))).as("ranked_source_runs");
  const recentRuns = sourceIds.length
    ? await db
        .select({
          sourceId: contentCollectionRuns.sourceId,
          status: contentCollectionRuns.status,
          receivedCount: contentCollectionRuns.receivedCount,
          metadata: contentCollectionRuns.metadata,
          startedAt: contentCollectionRuns.startedAt
        })
        .from(contentCollectionRuns)
        .innerJoin(rankedRuns, and(
          eq(contentCollectionRuns.id, rankedRuns.id),
          lte(rankedRuns.runRank, SOURCE_QUALIFICATION_SCAN_LIMIT)
        ))
        .orderBy(desc(contentCollectionRuns.startedAt), desc(contentCollectionRuns.id))
    : [];
  const runsBySource = new Map<string, typeof recentRuns>();
  for (const run of recentRuns) {
    if (!run.sourceId) continue;
    const list = runsBySource.get(run.sourceId) ?? [];
    if (list.length < SOURCE_QUALIFICATION_SCAN_LIMIT) list.push(run);
    runsBySource.set(run.sourceId, list);
  }
  return sources.map((source) => {
    const sourceRuns = runsBySource.get(source.id) ?? [];
    const checkpoint = checkpoints.get(source.id)!;
    const acquisition = resolveSourceAcquisitionPlan({
      collectionMethod: source.collectionMethod,
      platform: source.platform,
      canonicalUrl: source.canonicalUrl,
      providerRef: source.providerRef,
      collectionConfig: source.collectionConfig,
      metadata: source.metadata
    });
    const sample=selectCurrentCheckpointQualificationRuns(sourceRuns,checkpoint.checkpoint,now);
    const successful=sample.filter(item=>item.status==="SUCCEEDED");
    const currentRuntimeRuns=sample;
    const routeIds = successful
      .map((item) => String(record(item.metadata).acquisitionRouteId ?? ""))
      .filter(Boolean);
    const timeSemanticsKnown = [
      "RSS_ATOM",
      "SITEMAP",
      "PUBLIC_JSON_API",
      "PUBLIC_GENERATED_FEED",
      "PLATFORM_API",
      "SEARCH_DISCOVERY",
      "TREND_DISCOVERY"
    ].includes(acquisition.kind);
    const decision = evaluateSourceQualification({
      sourceId: source.id,
      name: source.name,
      sourceType: source.sourceType,
      platform: source.platform,
      collectionMethod: source.collectionMethod,
      canonicalUrl: source.canonicalUrl,
      providerRef: source.providerRef,
      status: source.status,
      enabled: source.enabled,
      metadata: source.metadata,
      collectionConfig: source.collectionConfig,
      signalConfig: source.signalConfig,
      liveRunCount: sample.length,
      successfulLiveRunCount: successful.length,
      runtimeEvidence: {
        currentRuntimeContractObserved: currentRuntimeRuns.length > 0,
        checkpointCurrent: currentRuntimeRuns.length > 0,
        stableRouteExecution:
          sample.length >= 5 &&
          successful.length >= 4 &&
          new Set(routeIds).size <= 2,
        systemProvenanceVerified:
          sample.length >= 5 &&
          sample.every((item) => String(record(item.metadata).collectionOrigin ?? "") === "SYSTEM"),
        timeSemanticsKnown,
        capabilityOutputVerified:
          currentRuntimeRuns.some((item) => item.status === "SUCCEEDED") &&
          successful.length >= 4
      }
    });
    return {
      ...decision,
      name: source.name,
      platform: source.platform,
      collectionMethod: source.collectionMethod,
      canonicalUrl: source.canonicalUrl,
      providerRef: source.providerRef
    };
  }).sort(
    (left, right) =>
      left.qualification.localeCompare(right.qualification) ||
      left.sourceRole.localeCompare(right.sourceRole) ||
      left.name.localeCompare(right.name)
  );
}
