import path from "node:path";
import { inArray } from "drizzle-orm";
import {
  isAiRelevantGroundTruth,
  isOperationalGroundTruth,
  loadGroundTruthBenchmark
} from "../lib/content/ground-truth";
import { INTELLIGENCE_POLICY_VERSION } from "../lib/content/intelligence-policy";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentCollectionRuns,
  contentEventClusterMembers,
  contentEvents,
  contentSources
} from "../lib/server/db/schema";
import { filterDiscoveryCandidates } from "../lib/server/content/discovery-filter";
import { resolveKnownEntities, syncCoreEntityRegistry } from "../lib/server/content/entity-registry";
import {
  inferCollectionContentType,
  resolveSourcePolicy,
  sourceContentRule,
  sourceFreshnessHours
} from "../lib/server/content/source-policy";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function pct(num: number, den: number) {
  return den ? Math.round((num / den) * 10_000) / 100 : null;
}

function binaryMetrics(rows: Array<{ predicted: boolean; expected: boolean }>) {
  const tp = rows.filter((row) => row.predicted && row.expected).length;
  const fp = rows.filter((row) => row.predicted && !row.expected).length;
  const tn = rows.filter((row) => !row.predicted && !row.expected).length;
  const fn = rows.filter((row) => !row.predicted && row.expected).length;
  return {
    truePositive: tp,
    falsePositive: fp,
    trueNegative: tn,
    falseNegative: fn,
    precision: pct(tp, tp + fp),
    recall: pct(tp, tp + fn),
    falsePositiveRate: pct(fp, fp + tn),
    falseNegativeRate: pct(fn, fn + tp)
  };
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") throw new Error("DEVELOPMENT_DATABASE_REQUIRED");

  const benchmark = loadGroundTruthBenchmark(path.join(process.cwd(), "data/content/ground-truth/benchmark-v2.json"));
  const db = getDatabase();
  const ids = benchmark.eventCases.map((item) => item.eventId);
  const events = await db.select().from(contentEvents).where(inArray(contentEvents.id, ids));
  const byId = new Map(events.map((item) => [item.id, item]));
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) throw new Error("GROUND_TRUTH_EVENTS_MISSING:" + missing.join(","));

  const titleDrift = benchmark.eventCases.flatMap((item) => {
    const current = byId.get(item.eventId)!;
    return current.title === item.titleSnapshot ? [] : [{ eventId: item.eventId, frozen: item.titleSnapshot, current: current.title }];
  });

  const relevanceRows = benchmark.eventCases.map((item) => {
    const event = byId.get(item.eventId)!;
    const policy = record(record(event.metadata).eventPolicy);
    return {
      eventId: item.eventId,
      predicted: policy.aiRelevant === true,
      expected: isAiRelevantGroundTruth(item.contentLabel)
    };
  });

  const operationalRows = benchmark.eventCases.map((item) => {
    const event = byId.get(item.eventId)!;
    const policy = record(record(event.metadata).eventPolicy);
    const policyCurrent = event.policyVersion === INTELLIGENCE_POLICY_VERSION && policy.version === INTELLIGENCE_POLICY_VERSION;
    const operationalUsefulness = record(policy.operationalUsefulness);
    const operationalUseful = operationalUsefulness.eligible !== false;
    const predicted = policyCurrent && policy.systemObserved === true && policy.aiRelevant === true && operationalUseful && (
      policy.officialNewsEligible === true ||
      policy.hotspotEligible === true ||
      event.verificationStatus === "UNVERIFIED"
    );
    return {
      eventId: item.eventId,
      title: item.titleSnapshot,
      predicted,
      expected: isOperationalGroundTruth(item.expectedDisposition),
      expectedDisposition: item.expectedDisposition,
      actualVerification: event.verificationStatus,
      officialNewsEligible: policy.officialNewsEligible === true,
      hotspotEligible: policy.hotspotEligible === true,
      operationalUseful,
      operationalReason: String(operationalUsefulness.reason ?? "")
    };
  });

  const discoveryRows = benchmark.discoveryCases
    .filter((item) => item.expectedDecision !== "REVIEW_REQUIRED")
    .map((item) => ({
      caseId: item.caseId,
      title: item.titleSnapshot,
      predicted: item.actualDecision === "KEEP",
      expected: item.expectedDecision === "KEEP_NOW",
      actualDecision: item.actualDecision,
      expectedDecision: item.expectedDecision,
      rejectionStage: item.rejectionStage ?? null,
      rejectionReason: item.rejectionReason ?? null
    }));
  const discoveryMismatches = discoveryRows.filter((row) => row.predicted !== row.expected);

  await syncCoreEntityRegistry();
  const discoveryRunIds = [...new Set(benchmark.discoveryCases.map((item) => item.collectionRunId))];
  const discoveryRuns = discoveryRunIds.length
    ? await db.select().from(contentCollectionRuns).where(inArray(contentCollectionRuns.id, discoveryRunIds))
    : [];
  const runById = new Map(discoveryRuns.map((item) => [item.id, item]));
  const discoverySourceIds = [...new Set(
    discoveryRuns
      .map((item) => item.sourceId)
      .filter((value): value is string => typeof value === "string" && Boolean(value))
  )];
  const discoverySources = discoverySourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, discoverySourceIds))
    : [];
  const sourceById = new Map(discoverySources.map((item) => [item.id, item]));

  const currentDiscoveryRows: Array<{
    caseId: string;
    title: string;
    predicted: boolean;
    expected: boolean;
    expectedDecision: string;
    relationType: string;
    reason: string;
  }> = [];
  for (const item of benchmark.discoveryCases.filter((row) => row.expectedDecision !== "REVIEW_REQUIRED")) {
    const run = runById.get(item.collectionRunId);
    if (!run) throw new Error("GROUND_TRUTH_DISCOVERY_RUN_MISSING:" + item.collectionRunId);
    if (!run.sourceId) throw new Error("GROUND_TRUTH_DISCOVERY_RUN_SOURCE_MISSING:" + run.id);
    const source = sourceById.get(run.sourceId);
    if (!source) throw new Error("GROUND_TRUTH_DISCOVERY_SOURCE_MISSING:" + run.sourceId);
    const candidate = {
      externalId: item.externalId ?? null,
      originalUrl: item.originalUrl ?? null,
      title: item.titleSnapshot,
      excerpt: item.excerptSnapshot ?? null,
      publishedAt: item.publishedAt ?? null,
      metadata: item.metadataSnapshot ?? {}
    };
    const knownEntities = await resolveKnownEntities({ title: candidate.title, excerpt: candidate.excerpt });
    const knownEntitiesByIndex = new Map([[0, knownEntities]]);
    const policy = resolveSourcePolicy(source);
    const replay = await filterDiscoveryCandidates([candidate], {
      now: run.startedAt,
      windowHours: sourceFreshnessHours(source),
      sourceName: source.name,
      sourcePlatform: source.platform,
      sourceMethod: run.collectionMethod,
      sourceType: policy?.sourceType ?? source.sourceType,
      strategyTopics: Array.isArray(source.topics) ? source.topics.filter((value): value is string => typeof value === "string") : [],
      requireExplicitAiRelation:
        policy?.sourceType === "MEDIA" || policy?.sourceType === "SOCIAL" || policy?.sourceType === "DEVELOPER",
      knownEntitiesByIndex
    });
    const decision = replay.decisions[0];
    let predicted = decision?.keep === true;
    let finalReason = decision?.reason ?? "NO_DECISION";
    if (predicted) {
      const contentType = inferCollectionContentType({
        metadata: candidate.metadata,
        originalUrl: candidate.originalUrl,
        collectionMethod: run.collectionMethod,
        platform: source.platform,
        source
      });
      const rule = sourceContentRule(source, contentType);
      if (rule.role === "SIGNAL" && (decision.relationType === "UNKNOWN" || decision.relationType === "NONE")) {
        predicted = false;
        finalReason = "SIGNAL_WITHOUT_AI_RELATION";
      }
    }
    currentDiscoveryRows.push({
      caseId: item.caseId,
      title: item.titleSnapshot,
      predicted,
      expected: item.expectedDecision === "KEEP_NOW",
      expectedDecision: item.expectedDecision,
      relationType: decision?.relationType ?? "NONE",
      reason: finalReason
    });
  }
  const discoveryBySource = [...new Set(currentDiscoveryRows.map((row) => benchmark.discoveryCases.find((item) => item.caseId === row.caseId)?.sourceId).filter((value): value is string => Boolean(value)))].map((sourceId) => {
    const caseIds = new Set(benchmark.discoveryCases.filter((item) => item.sourceId === sourceId).map((item) => item.caseId));
    const rows = currentDiscoveryRows.filter((row) => caseIds.has(row.caseId));
    return { sourceId, cases: rows.length, ...binaryMetrics(rows) };
  });
  const currentDiscoveryMismatches = currentDiscoveryRows.filter((row) => row.predicted !== row.expected);

  let clusterMetrics: Record<string, unknown> = {
    status: "INSUFFICIENT_GROUND_TRUTH",
    clusterPurity: null,
    fragmentationRate: null,
    cases: benchmark.clusterCases.length,
    reason: "No real multi-member cluster ground-truth cases are frozen yet."
  };
  if (benchmark.clusterCases.length) {
    const clusterEventIds = [...new Set(benchmark.clusterCases.flatMap((item) => item.eventIds))];
    const memberships = await db.select().from(contentEventClusterMembers).where(inArray(contentEventClusterMembers.eventId, clusterEventIds));
    const clusterByEvent = new Map(memberships.map((item) => [item.eventId, item.clusterId]));
    const sameCases = benchmark.clusterCases.filter((item) => item.expectedRelation === "SAME_EVENT");
    const differentCases = benchmark.clusterCases.filter((item) => item.expectedRelation === "NEW_EVENT" || item.expectedRelation === "NOT_EVENT");
    const relatedCases = benchmark.clusterCases.filter((item) => item.expectedRelation === "RELATED_EVENT");
    const sameCorrect = sameCases.filter((item) => new Set(item.eventIds.map((id) => clusterByEvent.get(id))).size === 1).length;
    const differentCorrect = differentCases.filter((item) => new Set(item.eventIds.map((id) => clusterByEvent.get(id))).size === item.eventIds.length).length;
    const relatedSeparated = relatedCases.filter((item) => new Set(item.eventIds.map((id) => clusterByEvent.get(id))).size === item.eventIds.length).length;
    const clusterMismatches = benchmark.clusterCases.flatMap((item) => {
      const clusterIds = item.eventIds.map((id) => clusterByEvent.get(id) ?? null);
      const uniqueClusterIds = new Set(clusterIds);
      const predictedSame = uniqueClusterIds.size === 1;
      const mismatch =
        item.expectedRelation === "SAME_EVENT"
          ? !predictedSame
          : item.expectedRelation === "NEW_EVENT" || item.expectedRelation === "NOT_EVENT"
            ? predictedSame
            : false;
      return mismatch ? [{
        caseId: item.caseId,
        expectedRelation: item.expectedRelation,
        eventIds: item.eventIds,
        clusterIds,
        titles: item.eventSnapshots.map((snapshot) => snapshot.titleSnapshot)
      }] : [];
    });
    const coverageByArea = ["MODEL_RELEASE", "FINANCE", "POLICY_SAFETY", "OPEN_SOURCE", "RESEARCH"].map((area) => {
      const cases = benchmark.clusterCases.filter((item) => item.coverageAreas.includes(area as typeof item.coverageAreas[number]));
      return {
        area,
        cases: cases.length,
        sameEvent: cases.filter((item) => item.expectedRelation === "SAME_EVENT").length,
        relatedEvent: cases.filter((item) => item.expectedRelation === "RELATED_EVENT").length,
        newEvent: cases.filter((item) => item.expectedRelation === "NEW_EVENT").length,
        mismatches: clusterMismatches.filter((row) => cases.some((item) => item.caseId === row.caseId)).length
      };
    });
    clusterMetrics = {
      status: "AVAILABLE",
      clusterPurity: pct(differentCorrect, differentCases.length),
      fragmentationRate: sameCases.length ? 100 - (pct(sameCorrect, sameCases.length) ?? 0) : null,
      sameEventCases: sameCases.length,
      sameEventMerged: sameCorrect,
      differentEventCases: differentCases.length,
      differentEventSeparated: differentCorrect,
      relatedEventCases: relatedCases.length,
      relatedEventSeparated: relatedSeparated,
      relatedEventSeparatedRate: pct(relatedSeparated, relatedCases.length),
      coverageByArea,
      clusterMismatches,
      scope: "RELATED_EVENT is reported separately and is not counted as a purity negative."
    };
  }

  const mismatches = operationalRows.filter((row) => row.predicted !== row.expected);
  console.log(JSON.stringify({
    version: "ai-collection-ground-truth-evaluation-v1",
    benchmarkVersion: benchmark.benchmarkVersion,
    benchmarkReviewStatus: benchmark.reviewStatus,
    evaluatedAt: new Date().toISOString(),
    database: target.databaseName,
    cases: benchmark.eventCases.length,
    discoveryCases: benchmark.discoveryCases.length,
    titleDrift,
    relevance: binaryMetrics(relevanceRows),
    operationalSelection: binaryMetrics(operationalRows),
    observedDiscoverySelection: {
      status: "FROZEN_OBSERVED_BASELINE",
      ...binaryMetrics(discoveryRows),
      reviewRequiredExcluded: benchmark.discoveryCases.filter((item) => item.expectedDecision === "REVIEW_REQUIRED").length,
      scope: "Observed decisions frozen from the original collection run."
    },
    currentDiscoverySelection: {
      status: "CURRENT_POLICY_REPLAY_PROVISIONAL",
      ...binaryMetrics(currentDiscoveryRows),
      reviewRequiredExcluded: benchmark.discoveryCases.filter((item) => item.expectedDecision === "REVIEW_REQUIRED").length,
      scope: "Current code replayed against the same frozen candidate benchmark using original run time/source policy."
    },
    currentDiscoveryBySource: discoveryBySource,
    cluster: clusterMetrics,
    observedDiscoveryMismatches: discoveryMismatches,
    currentDiscoveryMismatches,
    operationalMismatches: mismatches
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
