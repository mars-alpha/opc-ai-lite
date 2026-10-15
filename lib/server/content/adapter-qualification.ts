import "server-only";

import { eq, inArray } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentCollectionRuns,
  contentRawItems,
  contentSources
} from "../db/schema";
import {
  evaluateSourceQualification,
  inferSourceAdapterFamilies,
  type SourceQualificationEvidence,
  type SourceRuntimeQualification
} from "./source-qualification";
import { buildQualificationCheckpoint } from "./source-qualification-runtime";
import {
  acquisitionSupportsServerRuntime,
  resolveSourceAcquisitionPlan
} from "./source-acquisition-plan";

export const ADAPTER_QUALIFICATION_VERSION = "adapter-qualification-v1";
export const ADAPTER_QUALIFICATION_REQUIRED_RUNS = 5;
export const ADAPTER_QUALIFICATION_REQUIRED_SUCCESSES = 4;

type QualificationRunLike = {
  id: string;
  status: string;
  collectionMethod: string;
  receivedCount: number;
  duplicateCount: number;
  metadata: unknown;
};

type QualificationRawLike = {
  id: string;
  publishedAt: Date | null;
};

export type AdapterQualificationContractEvidence = {
  failureIsolationVerified: boolean;
  manualIsolationVerified: boolean;
  rerunnableAcceptance: boolean;
};

export type AdapterQualificationEvaluationInput = {
  source: {
    id: string;
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
  };
  runKind: string;
  runs: QualificationRunLike[];
  rawItems: QualificationRawLike[];
  contractEvidence: AdapterQualificationContractEvidence;
};

export type AdapterQualificationResult = {
  version: typeof ADAPTER_QUALIFICATION_VERSION;
  sourceId: string;
  runKind: string;
  qualification: SourceRuntimeQualification;
  evidence: SourceQualificationEvidence;
  sessionRunIds: string[];
  successfulRunIds: string[];
  referencedRawItemCount: number;
  qualificationCandidateCount: number;
  publishedTimeCoverage: number;
  dedupeObserved: boolean;
  reasons: string[];
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item))
    : [];
}

function isSystemQualificationRun(run: QualificationRunLike, runKind: string) {
  const metadata = record(run.metadata);
  return (
    metadata.collectionOrigin === "SYSTEM" &&
    metadata.collectionRunKind === runKind &&
    (metadata.manualTaskId === null || metadata.manualTaskId === undefined)
  );
}

function serverNativeRuntime(
  source: AdapterQualificationEvaluationInput["source"]
) {
  const families = inferSourceAdapterFamilies({
    collectionMethod: source.collectionMethod,
    platform: source.platform,
    metadata: source.metadata,
    collectionConfig: source.collectionConfig
  });
  const acquisition = resolveSourceAcquisitionPlan({
    collectionMethod: source.collectionMethod,
    platform: source.platform,
    canonicalUrl: source.canonicalUrl,
    providerRef: source.providerRef,
    metadata: source.metadata,
    collectionConfig: source.collectionConfig
  });
  return (
    !families.includes("SOCIAL_BROWSER") &&
    acquisitionSupportsServerRuntime(acquisition.kind, acquisition.runtimeOwner)
  );
}

export function evaluateAdapterQualificationSession(
  input: AdapterQualificationEvaluationInput
): AdapterQualificationResult {
  const sessionRuns = input.runs
    .filter((run) => isSystemQualificationRun(run, input.runKind))
    .slice(0, ADAPTER_QUALIFICATION_REQUIRED_RUNS);
  const successfulRuns = sessionRuns.filter(
    (run) => run.status === "SUCCEEDED" && run.receivedCount > 0
  );
  const rawIds = [
    ...new Set(
      sessionRuns.flatMap((run) => stringArray(record(run.metadata).rawItemIds))
    )
  ];
  const qualificationCandidateKeys = [
    ...new Set(
      sessionRuns.flatMap((run) =>
        stringArray(record(run.metadata).qualificationCandidateKeys)
      )
    )
  ];
  const referencedRaw = input.rawItems.filter((item) => rawIds.includes(item.id));
  const qualificationCoverages = successfulRuns
    .map((run) => Number(record(run.metadata).qualificationPublishedCoverage))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 1);
  const publishedCount = referencedRaw.filter((item) => item.publishedAt !== null).length;
  const publishedTimeCoverage = qualificationCoverages.length
    ? Math.min(...qualificationCoverages)
    : referencedRaw.length
      ? publishedCount / referencedRaw.length
      : 0;
  const duplicateByCount = sessionRuns.some((run) => run.duplicateCount > 0);
  const rawIdOccurrences = new Map<string, number>();
  const candidateKeyOccurrences = new Map<string, number>();
  for (const run of sessionRuns) {
    for (const rawId of stringArray(record(run.metadata).rawItemIds)) {
      rawIdOccurrences.set(rawId, (rawIdOccurrences.get(rawId) ?? 0) + 1);
    }
    for (const candidateKey of stringArray(record(run.metadata).qualificationCandidateKeys)) {
      candidateKeyOccurrences.set(
        candidateKey,
        (candidateKeyOccurrences.get(candidateKey) ?? 0) + 1
      );
    }
  }
  const duplicateByRepeatedRaw = [...rawIdOccurrences.values()].some((count) => count > 1);
  const duplicateByRepeatedCandidate = [...candidateKeyOccurrences.values()]
    .some((count) => count > 1);
  const dedupeObserved =
    duplicateByCount ||
    duplicateByRepeatedRaw ||
    duplicateByRepeatedCandidate;
  const provenanceVerified =
    sessionRuns.length === ADAPTER_QUALIFICATION_REQUIRED_RUNS &&
    sessionRuns.every((run) => isSystemQualificationRun(run, input.runKind));
  const capabilityOutputVerified =
    successfulRuns.length >= ADAPTER_QUALIFICATION_REQUIRED_SUCCESSES &&
    successfulRuns.every((run) => {
      const metadata = record(run.metadata);
      return (
        stringArray(metadata.qualificationCandidateKeys).length > 0 ||
        stringArray(metadata.rawItemIds).length > 0
      );
    });
  const continuousRuntimeAvailable = serverNativeRuntime(input.source);
  const stableBackend =
    sessionRuns.length === ADAPTER_QUALIFICATION_REQUIRED_RUNS &&
    new Set(sessionRuns.map((run) => run.collectionMethod)).size === 1 &&
    sessionRuns.every(
      (run) => run.collectionMethod.toUpperCase() === input.source.collectionMethod.toUpperCase()
    );
  const stableIdentity = Boolean(input.source.canonicalUrl || input.source.providerRef);
  const timeSemanticsKnown = publishedTimeCoverage >= 0.8;
  const requiresManualLoginPerRun = !continuousRuntimeAvailable;
  const runtimeDependency = continuousRuntimeAvailable
    ? null
    : "NON_SERVER_NATIVE_RUNTIME";

  const sourceMetadata = record(input.source.metadata);
  const qualificationMetadata = record(sourceMetadata.sourceQualification);
  const prospectiveCheckpoint = buildQualificationCheckpoint({
    sourceId: input.source.id,
    platform: input.source.platform,
    collectionMethod: input.source.collectionMethod,
    canonicalUrl: input.source.canonicalUrl,
    providerRef: input.source.providerRef,
    collectionConfig: input.source.collectionConfig,
    metadata: input.source.metadata
  });
  const {
    runtimeQualification: _runtimeQualification,
    ...qualificationSourceMetadata
  } = sourceMetadata;
  const manualOperationOnly =
    qualificationMetadata.manualOperationOnly === true;

  const evidence: SourceQualificationEvidence = {
    stableBackend,
    requiresManualLoginPerRun,
    continuousRuntimeAvailable,
    stableIdentity,
    timeSemanticsKnown,
    provenanceVerified,
    dedupeVerified: dedupeObserved,
    sourceFailureIsolated: input.contractEvidence.failureIsolationVerified,
    manualIsolationVerified: input.contractEvidence.manualIsolationVerified,
    capabilityOutputVerified,
    rerunnableAcceptance: input.contractEvidence.rerunnableAcceptance,
    currentRuntimeContractObserved: false,
    qualificationCheckpointCurrent: true,
    liveRunCount: sessionRuns.length,
    successfulLiveRunCount: successfulRuns.length,
    runtimeDependency,
    manualOperationOnly,
    commercialOrLegalRestriction:
      qualificationMetadata.commercialOrLegalRestriction === true,
    excessivePollution: qualificationMetadata.excessivePollution === true,
    lowValue: qualificationMetadata.lowValue === true
  };

  const decision = evaluateSourceQualification({
    sourceId: input.source.id,
    name: input.source.name,
    sourceType: input.source.sourceType,
    platform: input.source.platform,
    collectionMethod: input.source.collectionMethod,
    canonicalUrl: input.source.canonicalUrl,
    providerRef: input.source.providerRef,
    status: input.source.status,
    enabled: input.source.enabled,
    metadata: {
      ...qualificationSourceMetadata,
      sourceQualification: {
        ...qualificationMetadata,
        ...evidence,
        qualificationCheckpoint: prospectiveCheckpoint.checkpoint,
        adapterVersion: prospectiveCheckpoint.adapterVersion,
        sourceSchemaVersion: prospectiveCheckpoint.sourceSchemaVersion
      }
    },
    collectionConfig: input.source.collectionConfig,
    signalConfig: input.source.signalConfig,
    liveRunCount: sessionRuns.length,
    successfulLiveRunCount: successfulRuns.length
  });

  return {
    version: ADAPTER_QUALIFICATION_VERSION,
    sourceId: input.source.id,
    runKind: input.runKind,
    qualification: decision.qualification,
    evidence,
    sessionRunIds: sessionRuns.map((run) => run.id),
    successfulRunIds: successfulRuns.map((run) => run.id),
    referencedRawItemCount: referencedRaw.length,
    qualificationCandidateCount: qualificationCandidateKeys.length,
    publishedTimeCoverage,
    dedupeObserved,
    reasons: decision.reasons
  };
}

export async function auditAdapterQualificationSession(
  sourceId: string,
  runKind: string,
  contractEvidence: AdapterQualificationContractEvidence
) {
  const db = getDatabase();
  const [source] = await db
    .select()
    .from(contentSources)
    .where(eq(contentSources.id, sourceId))
    .limit(1);
  if (!source) throw new Error("ADAPTER_QUALIFICATION_SOURCE_NOT_FOUND");

  const allRuns = await db
    .select()
    .from(contentCollectionRuns)
    .where(eq(contentCollectionRuns.sourceId, sourceId));
  const sessionRuns = allRuns.filter((run) =>
    isSystemQualificationRun(
      {
        id: run.id,
        status: run.status,
        collectionMethod: run.collectionMethod,
        receivedCount: run.receivedCount,
        duplicateCount: run.duplicateCount,
        metadata: run.metadata
      },
      runKind
    )
  );
  const rawIds = [
    ...new Set(
      sessionRuns.flatMap((run) => stringArray(record(run.metadata).rawItemIds))
    )
  ];
  const rawItems = rawIds.length
    ? await db
        .select({ id: contentRawItems.id, publishedAt: contentRawItems.publishedAt })
        .from(contentRawItems)
        .where(inArray(contentRawItems.id, rawIds))
    : [];

  return evaluateAdapterQualificationSession({
    source: {
      id: source.id,
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
      signalConfig: source.signalConfig
    },
    runKind,
    runs: sessionRuns.map((run) => ({
      id: run.id,
      status: run.status,
      collectionMethod: run.collectionMethod,
      receivedCount: run.receivedCount,
      duplicateCount: run.duplicateCount,
      metadata: run.metadata
    })),
    rawItems,
    contractEvidence
  });
}

export async function persistAdapterQualificationResult(
  result: AdapterQualificationResult
) {
  const db = getDatabase();
  const [source] = await db
    .select()
    .from(contentSources)
    .where(eq(contentSources.id, result.sourceId))
    .limit(1);
  if (!source) throw new Error("ADAPTER_QUALIFICATION_SOURCE_NOT_FOUND");
  const metadata = record(source.metadata);
  const prior = record(metadata.sourceQualification);
  const checkpoint = buildQualificationCheckpoint({
    sourceId: source.id,
    platform: source.platform,
    collectionMethod: source.collectionMethod,
    canonicalUrl: source.canonicalUrl,
    providerRef: source.providerRef,
    collectionConfig: source.collectionConfig,
    metadata: source.metadata
  });
  const now = new Date().toISOString();
  const [updated] = await db
    .update(contentSources)
    .set({
      metadata: {
        ...metadata,
        runtimeQualification:
          result.qualification === "AUTO_READY"
            ? {
                version: "source-qualification-runtime-v1",
                checkpoint: checkpoint.checkpoint,
                adapterVersion: checkpoint.adapterVersion,
                sourceSchemaVersion: checkpoint.sourceSchemaVersion,
                baselineQualification: "AUTO_READY",
                effectiveQualification: "AUTO_READY",
                consecutiveFailures: 0,
                reason: "RECERTIFIED",
                evaluatedAt: now,
                recentProductionStatuses: []
              }
            : metadata.runtimeQualification,
        sourceQualification: {
          ...prior,
          ...result.evidence,
          qualification: result.qualification,
          qualificationVersion: result.version,
          qualificationCheckpoint: checkpoint.checkpoint,
          adapterVersion: checkpoint.adapterVersion,
          sourceSchemaVersion: checkpoint.sourceSchemaVersion,
          lastQualificationRunKind: result.runKind,
          lastQualificationAt: now,
          sessionRunIds: result.sessionRunIds,
          successfulRunIds: result.successfulRunIds,
          referencedRawItemCount: result.referencedRawItemCount,
          qualificationCandidateCount: result.qualificationCandidateCount,
          publishedTimeCoverage: result.publishedTimeCoverage,
          dedupeObserved: result.dedupeObserved,
          reasons: result.reasons
        }
      },
      updatedAt: new Date()
    })
    .where(eq(contentSources.id, result.sourceId))
    .returning();
  return updated;
}
