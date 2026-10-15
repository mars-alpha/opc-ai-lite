import { loadEnvConfig } from "@next/env";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentSources } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  listCurrentHotTodayIntelligence,
  listRadarTimelineWindow,
  listWorthPracticingTodayIntelligence
} from "../lib/server/content/intelligence-read-model";
import { getRadarSnapshot } from "../lib/server/content/radar-snapshot";
import { listCurrentSystemCollectionSourceIds } from "../lib/server/content/source-portfolio-runtime";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("HOT_TRACKING_CLOSED_LOOP_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_ONLY");

  const sourceIds = await listCurrentSystemCollectionSourceIds({ serverRuntimeOnly: true });
  assert(sourceIds.length > 0, "CURRENT_SOURCE_DIRECTORY_NON_EMPTY");
  console.log("CURRENT_SYSTEM_SOURCE_COUNT=" + sourceIds.length);

  console.log("AUTOMATIC_CYCLE_PRECONDITION=RUN_CONTENT_AUTOMATIC_SERVER_NATIVE_CYCLE_FIRST");

  const [snapshot, timeline, worthPracticing, currentHot, sources] = await Promise.all([
    getRadarSnapshot(),
    listRadarTimelineWindow(7),
    listWorthPracticingTodayIntelligence(100),
    listCurrentHotTodayIntelligence(100),
    getDatabase().select().from(contentSources)
  ]);

  const curated = timeline.filter((item) => item.curation.curated);
  const curationNearMiss = timeline.filter((item) => item.curation.gatePassed && !item.curation.curated);
  const trustBlocked = timeline.filter((item) => !item.boleCuration.gate.trustedEvidence);
  const freshnessBlocked = timeline.filter((item) => !item.boleCuration.gate.freshEnough);
  const materialityBlocked = timeline.filter((item) => !item.boleCuration.gate.materialChange);
  const hotNearMiss = timeline.filter((item) => !item.currentHot.eligible && item.topicMomentum.score >= 30);
  const expansionScanned = timeline.filter((item) => item.sourceManagedExpansionRuntime.status !== "NEVER");
  const expansionSucceeded = expansionScanned.filter((item) => item.sourceManagedExpansionRuntime.status === "SUCCEEDED");
  const expansionFailed = expansionScanned.filter((item) => item.sourceManagedExpansionRuntime.status === "FAILED");
  const practicalEvidenceEvents = timeline.filter((item) => item.coverage.practicalEvidenceCount > 0);
  const actionablePracticalEvents = timeline.filter((item) => (item.coverage.actionablePracticalEvidenceCount ?? 0) > 0);
  const chinesePracticalEvidenceCount = timeline.reduce((sum, item) => sum + (item.coverage.chinesePracticalEvidenceCount ?? 0), 0);
  const actionableChinesePracticalEvidenceCount = timeline.reduce((sum, item) => sum + (item.coverage.actionableChinesePracticalEvidenceCount ?? 0), 0);
  const analysisCurrentOrRefreshed = expansionScanned.filter((item) =>
    item.sourceManagedExpansionRuntime.analysisStatus === "CURRENT" ||
    item.sourceManagedExpansionRuntime.analysisStatus === "REFRESHED"
  );
  const analysisNotConfigured = expansionScanned.filter((item) => item.sourceManagedExpansionRuntime.analysisStatus === "NOT_CONFIGURED");
  const analysisFailed = expansionScanned.filter((item) => item.sourceManagedExpansionRuntime.analysisStatus === "FAILED");
  const activeHiddenExpansionSources = sources.filter((item) =>
    String(item.id).startsWith("source_expansion_") && item.enabled && item.status === "ACTIVE"
  );
  const comparableTrendEvents = timeline.filter((item) => item.topicMomentum.trendComparable && item.topicMomentum.trend);
  const hotParticipantCounts = currentHot.map((item) => item.topicMomentum.independentParticipantCount ?? item.topicMomentum.independentSourceCount);
  const publicSourceCounts = currentHot.map((item) => item.publicReadableSourceCount ?? item.topicMomentum.publicReadableSourceCount ?? 0);
  const worthPracticalGateMisses = timeline.filter((item) =>
    item.opcValue.status === "AVAILABLE" &&
    item.coverage.practicalEvidenceCount > 0 &&
    !worthPracticing.some((candidate) => candidate.eventId === item.eventId)
  );
  const worthMissReasons = {
    actionableEvidenceUnder2: worthPracticalGateMisses.filter((item) => (item.coverage.actionablePracticalEvidenceCount ?? 0) < 2).length,
    independentPracticalOriginsUnder2: worthPracticalGateMisses.filter((item) => (item.coverage.actionablePracticalOriginCount ?? 0) < 2).length,
    practicalTypesUnder2: worthPracticalGateMisses.filter((item) => (item.coverage.actionablePracticalTypeCount ?? 0) < 2).length
  };

  console.log(JSON.stringify({
    snapshot: {
      schemaVersion: snapshot.schemaVersion,
      generatedAt: snapshot.generatedAt,
      initialPageItemCount: snapshot.items.length,
      totalEventCount7d: snapshot.totalEventCount7d,
      windowDays: snapshot.windowDays,
      hasMore: snapshot.hasMore,
      curatedCount7d: curated.length,
      featuredSnapshotCount: snapshot.featured.length,
      currentHotCount: snapshot.currentHot.length,
      worthPracticingCount: snapshot.worthPracticing.length
    },
    readModel: {
      timelineCount: timeline.length,
      curatedCount: curated.length,
      currentHotCount: currentHot.length,
      worthPracticingCount: worthPracticing.length
    },
    hotSignalQuality: {
      totalHotParticipantCount: hotParticipantCounts.reduce((sum, count) => sum + count, 0),
      maxParticipantsPerHotEvent: hotParticipantCounts.length ? Math.max(...hotParticipantCounts) : 0,
      totalPublicReadableSourceCount: publicSourceCounts.reduce((sum, count) => sum + count, 0),
      comparableTrendEventCount: comparableTrendEvents.length,
      comparableTrendRate: timeline.length ? Math.round((comparableTrendEvents.length / timeline.length) * 1000) / 10 : 0
    },
    expansionRuntime: {
      scannedEventCount: expansionScanned.length,
      succeededEventCount: expansionSucceeded.length,
      failedEventCount: expansionFailed.length,
      practicalEvidenceEventCount: practicalEvidenceEvents.length,
      actionablePracticalEventCount: actionablePracticalEvents.length,
      chinesePracticalEvidenceCount,
      actionableChinesePracticalEvidenceCount,
      analysisCurrentOrRefreshedCount: analysisCurrentOrRefreshed.length,
      analysisNotConfiguredCount: analysisNotConfigured.length,
      analysisFailedCount: analysisFailed.length
    },
    recallDiagnostics: {
      curationNearMissCount: curationNearMiss.length,
      trustBlockedCount: trustBlocked.length,
      freshnessBlockedCount: freshnessBlocked.length,
      materialityBlockedCount: materialityBlocked.length,
      hotNearMissCount: hotNearMiss.length,
      worthPracticingNearMissCount: worthPracticalGateMisses.length,
      worthPracticingMissReasons: worthMissReasons,
      topCurationNearMisses: curationNearMiss.slice(0, 10).map((item) => ({
        eventId: item.eventId,
        title: item.title,
        score: item.curation.score,
        threshold: item.curation.threshold,
        practicalEvidenceCount: item.coverage.practicalEvidenceCount
      })),
      topHotNearMisses: hotNearMiss
        .sort((a, b) => b.topicMomentum.score - a.topicMomentum.score)
        .slice(0, 10)
        .map((item) => ({
          eventId: item.eventId,
          title: item.title,
          score: item.topicMomentum.score,
          independentSourceCount: item.topicMomentum.independentSourceCount,
          creatorCount: item.topicMomentum.creatorCount,
          activeDayCount: item.topicMomentum.activeDayCount,
          platformCount: item.topicMomentum.platformCount,
          practicalTypeCount: item.topicMomentum.practicalTypeCount
        }))
    },
    sourceGovernance: {
      currentSystemSourceCount: sourceIds.length,
      activeHiddenExpansionSourceCount: activeHiddenExpansionSources.length
    }
  }, null, 2));

  assert(snapshot.items.length > 0, "RADAR_SNAPSHOT_HAS_REAL_EVENTS");
  assert(snapshot.windowDays === 7 && snapshot.totalEventCount7d === timeline.length, "RADAR_SNAPSHOT_SEVEN_DAY_EVENT_TOTAL");
  assert(snapshot.items.length === snapshot.totalEventCount7d, "RADAR_SNAPSHOT_COMPLETE_SEVEN_DAY_WINDOW");
  assert(snapshot.featured.length === curated.length, "RADAR_SNAPSHOT_FEATURED_USES_COMPLETE_SEVEN_DAY_WINDOW");
  assert(snapshot.totalEventCount7d <= snapshot.items.length || snapshot.hasMore, "RADAR_SNAPSHOT_MORE_EVENTS_EXPOSE_CURSOR");
  assert(expansionScanned.length > 0, "SOURCE_MANAGED_EXPANSION_HAS_REAL_RUNS");
  assert(practicalEvidenceEvents.length > 0, "PRACTICAL_EVIDENCE_REACHED_EVENT_READ_MODEL");
  assert(worthPracticing.every((item) =>
    (item.coverage.actionablePracticalEvidenceCount ?? 0) >= 1
  ), "WORTH_PRACTICING_REQUIRES_COMPLETE_EVIDENCE");
  assert(snapshot.worthPracticing.every((item) =>
    (item.coverage.actionablePracticalEvidenceCount ?? 0) >= 1
  ), "RADAR_SNAPSHOT_WORTH_PRACTICING_ACTIONABLE_ONLY");
  assert(snapshot.worthPracticing.length === worthPracticing.length || snapshot.worthPracticing.length <= 8, "WORTH_PRACTICING_SNAPSHOT_BOUND");
  assert(snapshot.currentHot.length <= 10, "CURRENT_HOT_SNAPSHOT_BOUND");
  assert(activeHiddenExpansionSources.length === 0, "NO_ACTIVE_HIDDEN_EXPANSION_SOURCES");
  assert(curated.every((item) => item.curation.gatePassed), "CURATED_HARD_GATE_PRESERVED");
  assert(currentHot.every((item) => item.topicMomentum.authority === "PRESENTATION_ONLY"), "HOT_MOMENTUM_NO_FACT_AUTHORITY");
  assert(currentHot.every((item) => item.topicMomentum.halfLifeHours === 72), "HOT_MOMENTUM_72H_HALF_LIFE");
  assert(currentHot.every((item) => item.topicMomentum.interpretation === "讨论活跃度，不是报道质量评分"), "HOT_MOMENTUM_ACTIVITY_ONLY");
  console.log("HOT_TRACKING_PRODUCTION_CLOSED_LOOP=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
