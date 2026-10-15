import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  listCurrentHotTodayIntelligence,
  listRadarTimelineWindow
} from "../lib/server/content/intelligence-read-model";
import {
  AIHOT_HEAT_HALF_LIFE_HOURS,
  AIHOT_HEAT_SHADOW_VERSION,
  AIHOT_HEAT_WINDOW_HOURS
} from "../lib/server/content/aihot-heat-shadow";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_ONLY");

  const [timeline, formalCurrentHot] = await Promise.all([
    listRadarTimelineWindow(7),
    listCurrentHotTodayIntelligence(100)
  ]);

  assert(timeline.length > 0, "TIMELINE_HAS_EVENTS");
  assert(timeline.every((item) => item.heatShadow.version === AIHOT_HEAT_SHADOW_VERSION), "SHADOW_VERSION_CURRENT");
  assert(timeline.every((item) => item.heatShadow.authority === "SHADOW_ONLY"), "SHADOW_AUTHORITY_ONLY");
  assert(timeline.every((item) => item.heatShadow.windowHours === AIHOT_HEAT_WINDOW_HOURS), "SHADOW_WINDOW_48H");
  assert(timeline.every((item) => item.heatShadow.halfLifeHours === AIHOT_HEAT_HALF_LIFE_HOURS), "SHADOW_HALF_LIFE_24H");
  assert(timeline.every((item) => item.currentHot.formalRanking === true), "FORMAL_CURRENT_HOT_AUTHORITY_PRESERVED");

  const shadowEligible = timeline.filter((item) => item.heatShadow.eligible);
  assert(shadowEligible.length > 0, "SHADOW_HAS_REAL_ELIGIBLE_EVENTS");
  assert(shadowEligible.every((item) => item.heatShadow.participantCount >= 2), "SHADOW_MIN_TWO_PARTICIPANTS");
  assert(shadowEligible.every((item) => item.heatShadow.editorialParticipantCount >= 1), "SHADOW_EDITORIAL_GATE");
  assert(shadowEligible.every((item) =>
    item.heatShadow.participants.every((participant) => {
      const ageHours = (Date.now() - new Date(participant.activityAt).getTime()) / 3_600_000;
      return ageHours >= -1 && ageHours <= 48.1;
    })
  ), "SHADOW_PARTICIPANTS_BOUNDED_48H");
  assert(timeline.every((item) =>
    !item.heatShadow.trend.comparable ||
    item.heatShadow.trend.basis === "SAME_SOURCE_COHORT"
  ), "TREND_ONLY_SAME_SOURCE_COHORT");

  const expectedFormal = [...timeline]
    .filter((item) => item.currentHot.eligible)
    .sort((a, b) =>
      b.topicMomentum.score - a.topicMomentum.score ||
      Number(b.topicMomentum.status === "SUSTAINED") - Number(a.topicMomentum.status === "SUSTAINED") ||
      b.topicMomentum.independentSourceCount - a.topicMomentum.independentSourceCount ||
      b.topicMomentum.activeDayCount - a.topicMomentum.activeDayCount ||
      new Date(b.publishedAt ?? b.collectedAt).getTime() - new Date(a.publishedAt ?? a.collectedAt).getTime()
    )
    .map((item) => item.eventId);
  assert(
    JSON.stringify(formalCurrentHot.map((item) => item.eventId)) === JSON.stringify(expectedFormal),
    "FORMAL_CURRENT_HOT_SORT_UNCHANGED"
  );

  const shadowRanked = [...shadowEligible].sort((a, b) =>
    b.heatShadow.score - a.heatShadow.score ||
    b.heatShadow.participantCount - a.heatShadow.participantCount
  );

  console.log(JSON.stringify({
    task: "AIHOT-HOT-HEAT-SHADOW-002-A",
    database: target.databaseName,
    timelineEvents: timeline.length,
    formalCurrentHotCount: formalCurrentHot.length,
    shadowEligibleCount: shadowEligible.length,
    trendComparableCount: shadowEligible.filter((item) => item.heatShadow.trend.comparable).length,
    topShadow: shadowRanked.slice(0, 10).map((item, index) => ({
      rank: index + 1,
      eventId: item.eventId,
      title: item.presentation?.displayTitleZh || item.title,
      heatIndex: item.heatShadow.score,
      participants: item.heatShadow.participantCount,
      editorial: item.heatShadow.editorialParticipantCount,
      signal: item.heatShadow.signalParticipantCount,
      formalCurrentHot: item.currentHot.eligible,
      formalScore: item.topicMomentum.score
    })),
    formalAuthorityChanged: false,
    status: "PASS"
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
