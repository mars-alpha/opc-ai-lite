import "server-only";

import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentCollectionRuns,
  contentEventRawItems,
  contentRawItemObservations,
  contentRawItems,
  contentSources
} from "../db/schema";
import {
  SOURCE_COVERAGE_MINIMUMS,
  buildSourceCoverageMatrix,
  resolvePortfolioCoverage
} from "./source-coverage-matrix";
import { RADAR_SOURCE_PORTFOLIO } from "../../content/radar-source-portfolio";

export const SOURCE_RUNTIME_UTILITY_VERSION = "source-runtime-utility-v1";
export const SOURCE_RUNTIME_UTILITY_WINDOW_DAYS = 14;

export const SOURCE_RUNTIME_UTILITY_RECOMMENDATIONS = [
  "AUTO_KEEP",
  "REDUCE_FREQUENCY",
  "CONDITIONAL",
  "DISABLE_CANDIDATE"
] as const;

export type SourceRuntimeUtilityRecommendation =
  (typeof SOURCE_RUNTIME_UTILITY_RECOMMENDATIONS)[number];

export type SourceRuntimeUtilityFacts = {
  runCount: number;
  succeededRunCount: number;
  failedRunCount: number;
  receivedCount: number;
  keptCount: number;
  keepRatio: number;
  emptyRunCount: number;
  emptyRunRatio: number;
  duplicateCount: number;
  duplicateRatio: number;
  noiseDropCount: number;
  noiseDropRatio: number;
  fallbackAttemptCount: number;
  fallbackRunCount: number;
  fallbackRate: number;
  independentEventContributionCount: number;
  lastSuccessAt: string | null;
  lastNewItemAt: string | null;
  freshnessLagHours: number | null;
};

export type SourceRuntimeUtilityDecision = {
  version: typeof SOURCE_RUNTIME_UTILITY_VERSION;
  recommendation: SourceRuntimeUtilityRecommendation;
  reasons: string[];
  coverageCritical: boolean;
  coverageRiskReasons: string[];
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function nonNegativeNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function hoursSince(value: string | null, now: Date) {
  if (!value) return null;
  const ms = now.getTime() - new Date(value).getTime();
  return Number.isFinite(ms) ? Math.max(0, ms / 3_600_000) : null;
}

function metadataNoiseDropCount(metadata: unknown) {
  const meta = record(metadata);
  const rejected = record(meta.rejectedSampleCapture);
  const discovery = record(meta.discoveryFilter);
  const cheap = record(discovery.cheapGate);
  const cheapDropped = nonNegativeNumber(cheap.dropped);
  const fullDropped = nonNegativeNumber(discovery.dropped);
  const totalRejected = nonNegativeNumber(rejected.totalRejected);
  return Math.max(totalRejected, cheapDropped + fullDropped);
}

function metadataStoredCount(run: {
  createdCount: number;
  duplicateCount: number;
  metadata: unknown;
}) {
  const stored = record(run.metadata).storedCount;
  if (typeof stored === "number" && Number.isFinite(stored) && stored >= 0) return stored;
  return Math.max(0, run.createdCount) + Math.max(0, run.duplicateCount);
}

function metadataFallbackFacts(metadata: unknown) {
  const meta = record(metadata);
  const attempts = array(meta.acquisitionRouteAttempts).map(record);
  const fallbackAttempts = attempts.filter((attempt) =>
    String(attempt.role ?? "").toUpperCase() === "FALLBACK" &&
    String(attempt.status ?? "").toUpperCase() !== "SKIPPED"
  ).length;
  const usedFallback =
    String(meta.acquisitionRouteRole ?? "").toUpperCase() === "FALLBACK" ||
    Boolean(meta.acquisitionFallbackReason);
  return { fallbackAttempts, usedFallback };
}

export function evaluateSourceRuntimeUtility(input: {
  facts: SourceRuntimeUtilityFacts;
  coverageCritical?: boolean;
  coverageRiskReasons?: string[];
}): SourceRuntimeUtilityDecision {
  const facts = input.facts;
  const coverageCritical = input.coverageCritical === true;
  const coverageRiskReasons = input.coverageRiskReasons ?? [];
  const reasons: string[] = [];

  if (facts.runCount < 4) {
    reasons.push("INSUFFICIENT_RUNTIME_HISTORY");
    return {
      version: SOURCE_RUNTIME_UTILITY_VERSION,
      recommendation: "AUTO_KEEP",
      reasons,
      coverageCritical,
      coverageRiskReasons
    };
  }

  const severeRepeatedEmpty =
    facts.succeededRunCount >= 6 &&
    facts.emptyRunRatio >= 0.8 &&
    facts.independentEventContributionCount <= 1;
  const severeLowYield =
    facts.runCount >= 8 &&
    facts.receivedCount >= 40 &&
    facts.keepRatio < 0.03 &&
    facts.independentEventContributionCount <= 1 &&
    (facts.noiseDropRatio >= 0.7 || facts.duplicateRatio >= 0.8);
  const staleNoNewItem =
    facts.runCount >= 8 &&
    facts.lastNewItemAt === null;
  const severeDuplicateChurn =
    facts.runCount >= 8 &&
    facts.receivedCount >= 40 &&
    facts.duplicateRatio >= 0.8 &&
    facts.independentEventContributionCount <= 1 &&
    staleNoNewItem;
  const noContribution =
    facts.runCount >= 8 &&
    facts.independentEventContributionCount === 0 &&
    staleNoNewItem;
  const highFallback =
    facts.runCount >= 6 &&
    facts.fallbackRate >= 0.5;
  const highFailure =
    facts.runCount >= 6 &&
    ratio(facts.failedRunCount, facts.runCount) >= 0.5;
  const moderateEmpty =
    facts.succeededRunCount >= 6 &&
    facts.emptyRunRatio >= 0.5 &&
    facts.independentEventContributionCount <= 2;
  const moderateLowYield =
    facts.runCount >= 8 &&
    facts.receivedCount >= 30 &&
    facts.keepRatio < 0.08 &&
    facts.independentEventContributionCount <= 2;

  if (severeRepeatedEmpty) reasons.push("REPEATED_EMPTY_RUNS");
  if (severeLowYield) reasons.push("VERY_LOW_YIELD_WITH_HIGH_NOISE_OR_DUPLICATION");
  if (severeDuplicateChurn) reasons.push("HIGH_DUPLICATE_CHURN_WITHOUT_NEW_ITEMS");
  if (noContribution) reasons.push("NO_EVENT_CONTRIBUTION");
  if (highFallback) reasons.push("HIGH_FALLBACK_DEPENDENCY");
  if (highFailure) reasons.push("HIGH_FAILURE_RATE");
  if (moderateEmpty && !severeRepeatedEmpty) reasons.push("FREQUENT_EMPTY_RUNS");
  if (moderateLowYield && !severeLowYield) reasons.push("LOW_YIELD");

  if (coverageCritical && (severeRepeatedEmpty || severeLowYield || severeDuplicateChurn || noContribution)) {
    reasons.push("COVERAGE_CRITICAL_SOURCE_PROTECTED");
    return {
      version: SOURCE_RUNTIME_UTILITY_VERSION,
      recommendation: highFailure || highFallback ? "CONDITIONAL" : "REDUCE_FREQUENCY",
      reasons,
      coverageCritical,
      coverageRiskReasons
    };
  }

  if (
    (severeRepeatedEmpty && noContribution) ||
    (severeLowYield && noContribution) ||
    (severeDuplicateChurn && noContribution)
  ) {
    return {
      version: SOURCE_RUNTIME_UTILITY_VERSION,
      recommendation: "DISABLE_CANDIDATE",
      reasons,
      coverageCritical,
      coverageRiskReasons
    };
  }

  if (highFailure || highFallback || severeRepeatedEmpty || severeLowYield || severeDuplicateChurn) {
    return {
      version: SOURCE_RUNTIME_UTILITY_VERSION,
      recommendation: "CONDITIONAL",
      reasons,
      coverageCritical,
      coverageRiskReasons
    };
  }

  if (moderateEmpty || moderateLowYield) {
    return {
      version: SOURCE_RUNTIME_UTILITY_VERSION,
      recommendation: "REDUCE_FREQUENCY",
      reasons,
      coverageCritical,
      coverageRiskReasons
    };
  }

  reasons.push("RUNTIME_UTILITY_HEALTHY");
  return {
    version: SOURCE_RUNTIME_UTILITY_VERSION,
    recommendation: "AUTO_KEEP",
    reasons,
    coverageCritical,
    coverageRiskReasons
  };
}

function defaultPortfolioCoverageRisk(sourceId: string) {
  const entry = RADAR_SOURCE_PORTFOLIO.find((item) => item.sourceId === sourceId);
  if (!entry) return { coverageCritical: false, reasons: [] as string[] };
  const coverage = resolvePortfolioCoverage(entry);
  const matrix = buildSourceCoverageMatrix();
  const reasons: string[] = [];

  const roleMinimum = (SOURCE_COVERAGE_MINIMUMS.roles as Record<string, number>)[coverage.sourceUniverseRole];
  if (
    typeof roleMinimum === "number" &&
    (matrix.roleCoverage[coverage.sourceUniverseRole] ?? 0) - 1 < roleMinimum
  ) {
    reasons.push("ROLE_MINIMUM:" + coverage.sourceUniverseRole);
  }

  for (const evidenceRole of coverage.evidenceRoles) {
    const minimum = (SOURCE_COVERAGE_MINIMUMS.evidence as Record<string, number>)[evidenceRole];
    if (
      typeof minimum === "number" &&
      (matrix.evidenceCoverage[evidenceRole] ?? 0) - 1 < minimum
    ) {
      reasons.push("EVIDENCE_MINIMUM:" + evidenceRole);
    }
  }

  const languages = coverage.languageScope === "MIXED"
    ? ["ZH", "EN"]
    : [coverage.languageScope];
  for (const language of languages) {
    const minimum = (SOURCE_COVERAGE_MINIMUMS.languages as Record<string, number>)[language];
    if (
      typeof minimum === "number" &&
      (matrix.languageCoverage[language] ?? 0) - 1 < minimum
    ) {
      reasons.push("LANGUAGE_MINIMUM:" + language);
    }
  }

  return {
    coverageCritical: reasons.length > 0,
    reasons
  };
}

export function buildSourceRuntimeUtilityFacts(input: {
  runs: Array<{
    status: string;
    receivedCount: number;
    createdCount: number;
    duplicateCount: number;
    metadata: unknown;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
  }>;
  independentEventContributionCount: number;
  lastNewItemAt?: Date | string | null;
  now?: Date;
}): SourceRuntimeUtilityFacts {
  const now = input.now ?? new Date();
  const productionRuns = input.runs.filter((run) =>
    record(run.metadata).qualificationOnly !== true
  );
  const succeeded = productionRuns.filter((run) => run.status === "SUCCEEDED");
  const receivedCount = productionRuns.reduce((sum, run) => sum + run.receivedCount, 0);
  const keptCount = productionRuns.reduce((sum, run) => sum + metadataStoredCount(run), 0);
  const duplicateCount = productionRuns.reduce((sum, run) => sum + run.duplicateCount, 0);
  const noiseDropCount = productionRuns.reduce(
    (sum, run) => sum + metadataNoiseDropCount(run.metadata),
    0
  );
  const fallbackFacts = productionRuns.map((run) => metadataFallbackFacts(run.metadata));
  const fallbackAttemptCount = fallbackFacts.reduce((sum, item) => sum + item.fallbackAttempts, 0);
  const fallbackRunCount = fallbackFacts.filter((item) => item.usedFallback).length;
  const lastSuccessAt = succeeded
    .map((run) => iso(run.finishedAt ?? run.startedAt))
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;
  const lastNewItemAt = iso(input.lastNewItemAt ?? null);

  return {
    runCount: productionRuns.length,
    succeededRunCount: succeeded.length,
    failedRunCount: productionRuns.filter((run) => run.status === "FAILED").length,
    receivedCount,
    keptCount,
    keepRatio: ratio(keptCount, receivedCount),
    emptyRunCount: succeeded.filter((run) => run.receivedCount === 0 || metadataStoredCount(run) === 0).length,
    emptyRunRatio: ratio(
      succeeded.filter((run) => run.receivedCount === 0 || metadataStoredCount(run) === 0).length,
      succeeded.length
    ),
    duplicateCount,
    duplicateRatio: ratio(duplicateCount, receivedCount),
    noiseDropCount,
    noiseDropRatio: ratio(noiseDropCount, receivedCount),
    fallbackAttemptCount,
    fallbackRunCount,
    fallbackRate: ratio(fallbackRunCount, productionRuns.length),
    independentEventContributionCount: Math.max(0, input.independentEventContributionCount),
    lastSuccessAt,
    lastNewItemAt,
    freshnessLagHours: hoursSince(lastNewItemAt, now)
  };
}

type SourceRuntimeUtilitySourceRow = {
  id: string;
  name: string;
  platform: string;
  collectionMethod: string;
  enabled: boolean;
  status: string;
};

type SourceRuntimeUtilityRunRow = {
  sourceId: string | null;
  status: string;
  receivedCount: number;
  createdCount: number;
  duplicateCount: number;
  metadata: unknown;
  startedAt: Date;
  finishedAt: Date | null;
};

function buildSourceRuntimeUtilityResult(input: {
  source: SourceRuntimeUtilitySourceRow;
  runs: SourceRuntimeUtilityRunRow[];
  independentEventContributionCount: number;
  lastNewItemAt: Date | null;
  windowDays: number;
  now: Date;
}) {
  const facts = buildSourceRuntimeUtilityFacts({
    runs: input.runs,
    independentEventContributionCount: input.independentEventContributionCount,
    lastNewItemAt: input.lastNewItemAt,
    now: input.now
  });
  const coverage = defaultPortfolioCoverageRisk(input.source.id);
  const decision = evaluateSourceRuntimeUtility({
    facts,
    coverageCritical: coverage.coverageCritical,
    coverageRiskReasons: coverage.reasons
  });

  return {
    version: SOURCE_RUNTIME_UTILITY_VERSION,
    windowDays: input.windowDays,
    source: input.source,
    facts,
    decision
  };
}

export async function auditSourceRuntimeUtility(options: {
  windowDays?: number;
  sourceIds?: string[];
  now?: Date;
} = {}) {
  const db = getDatabase();
  const now = options.now ?? new Date();
  const windowDays = Math.max(1, Math.min(90, options.windowDays ?? SOURCE_RUNTIME_UTILITY_WINDOW_DAYS));
  const since = new Date(now.getTime() - windowDays * 86_400_000);
  const sources: SourceRuntimeUtilitySourceRow[] = options.sourceIds?.length
    ? await db
        .select({
          id: contentSources.id,
          name: contentSources.name,
          platform: contentSources.platform,
          collectionMethod: contentSources.collectionMethod,
          enabled: contentSources.enabled,
          status: contentSources.status
        })
        .from(contentSources)
        .where(inArray(contentSources.id, options.sourceIds))
    : await db
        .select({
          id: contentSources.id,
          name: contentSources.name,
          platform: contentSources.platform,
          collectionMethod: contentSources.collectionMethod,
          enabled: contentSources.enabled,
          status: contentSources.status
        })
        .from(contentSources)
        .where(eq(contentSources.status, "ACTIVE"));

  if (!sources.length) return [];
  const sourceIds = sources.map((source) => source.id);

  const [runs, rawRows, eventRows]: [
    SourceRuntimeUtilityRunRow[],
    Array<{ sourceId: string; createdAt: Date }>,
    Array<{ sourceId: string; eventId: string }>
  ] = await Promise.all([
    db
      .select({
        sourceId: contentCollectionRuns.sourceId,
        status: contentCollectionRuns.status,
        receivedCount: contentCollectionRuns.receivedCount,
        createdCount: contentCollectionRuns.createdCount,
        duplicateCount: contentCollectionRuns.duplicateCount,
        metadata: contentCollectionRuns.metadata,
        startedAt: contentCollectionRuns.startedAt,
        finishedAt: contentCollectionRuns.finishedAt
      })
      .from(contentCollectionRuns)
      .where(and(
        inArray(contentCollectionRuns.sourceId, sourceIds),
        gte(contentCollectionRuns.startedAt, since)
      ))
      .orderBy(desc(contentCollectionRuns.startedAt)),
    db
      .select({
        sourceId: contentRawItems.sourceId,
        createdAt: contentRawItems.createdAt
      })
      .from(contentRawItems)
      .where(and(
        inArray(contentRawItems.sourceId, sourceIds),
        gte(contentRawItems.createdAt, since)
      )),
    db
      .select({
        sourceId: contentRawItemObservations.sourceId,
        eventId: contentEventRawItems.eventId
      })
      .from(contentRawItemObservations)
      .innerJoin(
        contentEventRawItems,
        eq(contentEventRawItems.rawItemId, contentRawItemObservations.rawItemId)
      )
      .where(and(
        inArray(contentRawItemObservations.sourceId, sourceIds),
        gte(contentRawItemObservations.observedAt, since)
      ))
  ]);

  const runsBySource = new Map<string, SourceRuntimeUtilityRunRow[]>();
  for (const run of runs) {
    if (!run.sourceId) continue;
    const bucket = runsBySource.get(run.sourceId) ?? [];
    bucket.push(run);
    runsBySource.set(run.sourceId, bucket);
  }

  const lastNewItemBySource = new Map<string, Date>();
  for (const row of rawRows) {
    const previous = lastNewItemBySource.get(row.sourceId);
    if (!previous || row.createdAt > previous) {
      lastNewItemBySource.set(row.sourceId, row.createdAt);
    }
  }

  const eventIdsBySource = new Map<string, Set<string>>();
  for (const row of eventRows) {
    const bucket = eventIdsBySource.get(row.sourceId) ?? new Set<string>();
    bucket.add(row.eventId);
    eventIdsBySource.set(row.sourceId, bucket);
  }

  return sources.map((source) =>
    buildSourceRuntimeUtilityResult({
      source,
      runs: runsBySource.get(source.id) ?? [],
      independentEventContributionCount: eventIdsBySource.get(source.id)?.size ?? 0,
      lastNewItemAt: lastNewItemBySource.get(source.id) ?? null,
      windowDays,
      now
    })
  );
}

export async function readSourceRuntimeUtility(
  sourceId: string,
  options: { windowDays?: number; now?: Date } = {}
) {
  const [result] = await auditSourceRuntimeUtility({
    ...options,
    sourceIds: [sourceId]
  });
  if (!result) throw new Error("SOURCE_NOT_FOUND");
  return result;
}
