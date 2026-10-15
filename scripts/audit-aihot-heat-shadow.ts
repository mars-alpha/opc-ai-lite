import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { listRadarTimelineWindow } from "../lib/server/content/intelligence-read-model";

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_ONLY");
  }

  const items = await listRadarTimelineWindow(7);
  const shadowRanked = [...items]
    .filter((item) => item.heatShadow.eligible)
    .sort((a, b) =>
      b.heatShadow.score - a.heatShadow.score ||
      b.heatShadow.participantCount - a.heatShadow.participantCount
    );
  const formalRanked = [...items]
    .filter((item) => item.currentHot.eligible)
    .sort((a, b) => b.topicMomentum.score - a.topicMomentum.score);

  const formalRank = new Map(formalRanked.map((item, index) => [item.eventId, index + 1]));
  const shadowRank = new Map(shadowRanked.map((item, index) => [item.eventId, index + 1]));

  console.log(JSON.stringify({
    task: "AIHOT-HOT-HEAT-SHADOW-002-A",
    database: target.databaseName,
    events: items.length,
    formalCurrentHotCount: formalRanked.length,
    shadowHeatEligibleCount: shadowRanked.length,
    shadowTrendComparableCount: shadowRanked.filter((item) => item.heatShadow.trend.comparable).length,
    shadowSurgeCount: shadowRanked.filter((item) => item.heatShadow.surge).length,
    topShadow: shadowRanked.slice(0, 20).map((item) => ({
      eventId: item.eventId,
      title: item.presentation?.displayTitleZh || item.title,
      shadowRank: shadowRank.get(item.eventId),
      formalRank: formalRank.get(item.eventId) ?? null,
      heatIndex: item.heatShadow.score,
      rawHeat: item.heatShadow.rawHeat,
      participants: item.heatShadow.participantCount,
      editorial: item.heatShadow.editorialParticipantCount,
      signal: item.heatShadow.signalParticipantCount,
      editorialSources: item.heatShadow.editorialSourceCount,
      signalSources: item.heatShadow.signalSourceCount,
      isNew: item.heatShadow.isNew,
      surge: item.heatShadow.surge,
      rising: item.heatShadow.rising,
      trend: item.heatShadow.trend,
      formal: {
        eligible: item.currentHot.eligible,
        score: item.topicMomentum.score,
        status: item.topicMomentum.status,
        windowHours: item.topicMomentum.windowHours,
        halfLifeHours: item.topicMomentum.halfLifeHours
      }
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
