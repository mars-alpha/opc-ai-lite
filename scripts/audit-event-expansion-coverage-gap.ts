import { loadEnvConfig } from "@next/env";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import {
  listOfficialNewsCandidates,
  listCurrentHotTodayIntelligence,
  listUnverifiedEventCandidates
} from "../lib/server/content/intelligence-read-model";
import {
  getEventExpansionPlan,
  listEventExpansionRuns
} from "../lib/server/content/collection-expansion";
import { getEventExpansionDailyOutput } from "../lib/server/content/event-expansion-output";
import { classifyEventExpansionCoverageGap } from "../lib/server/content/event-expansion-coverage-gap";
import { getCurrentCollectionCapabilityRoutes } from "../lib/server/content/collection-capability-router";

loadEnvConfig(process.cwd());

const CREATOR_PROVIDERS = new Set(["BILIBILI_SEARCH", "YOUTUBE_SEARCH"]);

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("COVERAGE_GAP_017_DEVELOPMENT_REQUIRED");
  }

  const routes = await getCurrentCollectionCapabilityRoutes();
  const creatorRoutes = routes.filter(
    (route) =>
      route.capability === "SEARCH" &&
      (route.platform === "BILIBILI" || route.platform === "YOUTUBE")
  );
  const healthyCreatorRoutes = creatorRoutes.filter((route) => route.status === "READY");
  const healthyCreatorProviders = new Set(
    healthyCreatorRoutes.flatMap((route) => route.expansionProvider ? [route.expansionProvider] : [])
  );
  const recentRunLimit = Math.max(3, healthyCreatorRoutes.length * 3);

  console.log(
    "COVERAGE_GAP_017_CREATOR_HEALTH=" +
    creatorRoutes.map((route) =>
      route.platform + ":" + route.status + ":" + (route.activeBackend?.id ?? "NONE")
    ).join(",")
  );

  const [official, hotspots, unverified] = await Promise.all([
    listOfficialNewsCandidates(6),
    listCurrentHotTodayIntelligence(4),
    listUnverifiedEventCandidates(6)
  ]);
  const candidates = [
    ...official.map((item) => ({ ...item, view: "OFFICIAL" as const })),
    ...hotspots.map((item) => ({ ...item, view: "CURRENT_HOT" as const })),
    ...unverified.map((item) => ({ ...item, view: "UNVERIFIED" as const }))
  ];
  const unique = [...new Map(candidates.map((item) => [item.eventId, item])).values()];

  const categoryCounts = new Map<string, number>();
  let practicalTargets = 0;

  for (const item of unique) {
    const [plan, output, runs] = await Promise.all([
      getEventExpansionPlan(item.eventId),
      getEventExpansionDailyOutput(item.eventId),
      listEventExpansionRuns(item.eventId, 20)
    ]);
    const references = output.sections
      .filter((section) => section.key !== "WHAT_HAPPENED")
      .flatMap((section) => section.items);
    const recentCreatorRuns = runs
      .filter((run) => CREATOR_PROVIDERS.has(run.provider) && healthyCreatorProviders.has(run.provider as "BILIBILI_SEARCH" | "YOUTUBE_SEARCH"))
      .slice(0, recentRunLimit)
      .map((run) => ({
        status: run.status,
        receivedCount: run.receivedCount,
        provider: run.provider
      }));
    const diagnosis = classifyEventExpansionCoverageGap({
      creatorSearchEligible: plan.creatorSearchEligible,
      referenceCount: references.length,
      recentRuns: recentCreatorRuns
    });

    if (plan.creatorSearchEligible) practicalTargets += 1;
    categoryCounts.set(diagnosis.category, (categoryCounts.get(diagnosis.category) ?? 0) + 1);

    console.log(JSON.stringify({
      view: item.view,
      eventId: item.eventId,
      title: item.title,
      eventType: item.eventType,
      verificationStatus: item.verificationStatus,
      creatorSearchEligible: plan.creatorSearchEligible,
      creatorAnchorTerms: plan.creatorAnchorTerms,
      healthyCreatorSources: healthyCreatorRoutes.map((route) => route.platform),
      recentCreatorRuns,
      referenceCount: references.length,
      referenceTypes: references.map((reference) => reference.expansionType),
      coverageGap: diagnosis
    }));
  }

  console.log("COVERAGE_GAP_017_EVENTS=" + unique.length);
  console.log("COVERAGE_GAP_017_PRACTICAL_TARGETS=" + practicalTargets);
  console.log(
    "COVERAGE_GAP_017_CATEGORIES=" +
    [...categoryCounts.entries()].map(([key, count]) => key + ":" + count).join(",")
  );
  console.log("COVERAGE_GAP_017_HEALTHY_CREATOR_SOURCES=" + healthyCreatorRoutes.length);
  console.log("EVENT_EXPANSION_COVERAGE_GAP_017_REAL_DB_AUDIT=PASS");
}

const keepAlive = setInterval(() => {}, 1000);
main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase().catch(() => {});
    clearInterval(keepAlive);
  });
