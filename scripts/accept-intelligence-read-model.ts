import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import {
  getTodayIntelligenceOverview,
  listCurrentHotTodayIntelligence,
  listLatestTodayIntelligence,
  listOfficialNewsCandidates,
  listPlatformHeatboards,
  listUnverifiedEventCandidates
} from "../lib/server/content/intelligence-read-model";

function assert(condition: unknown, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED:" + label);
  console.log(label + "=PASS");
}

function time(value: Date | string | null) {
  return value ? new Date(value).getTime() : 0;
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development", "DEV_DATABASE_ONLY");

  const [heatboards, latest, officialNews, hotspots, unverified, overview] = await Promise.all([
    listPlatformHeatboards(30),
    listLatestTodayIntelligence(100),
    listOfficialNewsCandidates(100),
    listCurrentHotTodayIntelligence(100),
    listUnverifiedEventCandidates(100),
    getTodayIntelligenceOverview()
  ]);

  for (const group of heatboards) {
    for (let i = 1; i < group.items.length; i += 1) {
      const prev = group.items[i - 1].trendRank ?? Number.POSITIVE_INFINITY;
      const current = group.items[i].trendRank ?? Number.POSITIVE_INFINITY;
      assert(prev <= current, "PLATFORM_RANK_ORDER_" + group.platform + "_" + i);
    }
  }
  console.log("PLATFORM_HEATBOARD_GROUPS=" + heatboards.length);

  assert(latest.every((item) => ["CONFIRMED_OFFICIAL", "CONFIRMED_MEDIA"].includes(item.verificationStatus)), "LATEST_CONFIRMED_POLICY_BOUNDARY");
  assert(officialNews.every((item) => item.verificationStatus === "CONFIRMED_OFFICIAL"), "OFFICIAL_NEWS_POLICY_BOUNDARY");
  assert(hotspots.every((item) => item.currentHot.eligible && item.topicMomentum.eligible), "HOTSPOT_TOPIC_MOMENTUM_BOUNDARY");
  assert(unverified.every((item) => item.verificationStatus === "UNVERIFIED"), "UNVERIFIED_POLICY_BOUNDARY");
  assert([...latest, ...unverified].every((item) =>
    ["TRUSTED", "UNVERIFIED"].includes(item.evidenceScore.status) &&
    item.topicMomentum.criteria &&
    item.coverage && typeof item.coverage.needsExpansion === "boolean"
  ), "V2_FACT_STATUS_AND_COVERAGE_SHAPE");
  console.log("LATEST_ITEMS=" + latest.length);
  console.log("OFFICIAL_NEWS_ITEMS=" + officialNews.length);
  console.log("CURRENT_HOT_ITEMS=" + hotspots.length);
  console.log("UNVERIFIED_ITEMS=" + unverified.length);

  assert(overview.hotspotSelectionStatus === "EVENT_MOMENTUM_RISING_AND_SUSTAINED", "OVERVIEW_HOTSPOT_TOPIC_MOMENTUM");
  assert(overview.productScope === "HOT_TRACKING_V1", "OVERVIEW_PRODUCT_SCOPE");
  assert(Array.isArray(overview.latest), "OVERVIEW_LATEST");
  assert(Array.isArray(overview.currentHot), "OVERVIEW_CURRENT_HOT");
  assert(Array.isArray(overview.aiHotspotPractices), "OVERVIEW_AI_HOTSPOT_PRACTICE");
  assert(Array.isArray(overview.unverified), "OVERVIEW_UNVERIFIED");
  console.log("INTELLIGENCE_READ_MODEL_ACCEPTANCE=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error);
    process.exitCode = 1;
  });
