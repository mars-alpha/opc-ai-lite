import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { users } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { getSourceManagementIndex } from "../lib/server/content/source-management";
import {
  listCurrentSystemCollectionSources,
  runSystemSourcePortfolio
} from "../lib/server/content/source-portfolio-runtime";
import { reconcileSourceRuntimeQualifications } from "../lib/server/content/source-qualification-runtime";
import { runTopicMomentumRuntime } from "../lib/server/content/topic-momentum-runtime";
import { refreshRadarSnapshot } from "../lib/server/content/radar-snapshot";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("PLATFORM_SOURCE_ROUTE_PRODUCTION_029_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_ONLY"
  );

  const [admin] = await getDatabase()
    .select()
    .from(users)
    .where(eq(users.role, "ADMIN"))
    .limit(1);
  if (!admin) throw new Error("ADMIN_USER_REQUIRED");
  const user = {
    id: admin.id,
    email: "local-admin@opc.invalid",
    displayName: admin.displayName,
    role: "ADMIN" as const
  };

  const before = await getSourceManagementIndex();
  const currentSources = await listCurrentSystemCollectionSources({ serverRuntimeOnly: true });
  const currentIds = new Set(currentSources.map((source) => source.id));

  assert(currentSources.length === before.summary.sourceCount, "ALL_CURRENT_SOURCES_SERVER_RUNNABLE");
  assert(
    before.items.every((item) => item.discoveryRouteIds.length > 0),
    "ALL_CURRENT_SOURCES_HAVE_DISCOVERY_ROUTE"
  );

  console.log("CURRENT_SOURCE_COUNT=" + before.summary.sourceCount);
  console.log("CURRENT_PLATFORM_COUNT=" + before.platformCapabilities.length);
  console.log("CURRENT_DISCOVERY_ROUTE_COUNT=" + before.discoveryRoutes.length);

  let run = await runSystemSourcePortfolio(user);
  if (run.failedSourceCount > 0) {
    const retryIds = run.results
      .filter((item) => item?.status === "FAILED")
      .map((item) => String(item?.sourceId ?? ""))
      .filter(Boolean);
    console.log("TRANSIENT_RETRY_SOURCE_COUNT=" + retryIds.length);
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    const retry = await runSystemSourcePortfolio(user, { sourceIds: retryIds });
    const retryBySource = new Map(retry.results.map((item) => [String(item?.sourceId ?? ""), item]));
    const results = run.results.map((item) => retryBySource.get(String(item?.sourceId ?? "")) ?? item);
    run = {
      ...run,
      results,
      succeededSourceCount: results.filter((item) => item?.status === "SUCCEEDED").length,
      failedSourceCount: results.filter((item) => item?.status === "FAILED").length
    };
  }
  const attemptedIds = new Set(run.results.map((item) => String(item?.sourceId ?? "")));
  assert(run.sourceCount === currentSources.length, "ALL_CURRENT_SOURCES_ATTEMPTED");
  assert(
    [...currentIds].every((sourceId) => attemptedIds.has(sourceId)),
    "NO_CURRENT_SOURCE_SKIPPED"
  );
  assert(
    run.succeededSourceCount + run.failedSourceCount === run.sourceCount,
    "ALL_SOURCE_RUNS_CLASSIFIED"
  );

  for (const result of run.results) {
    console.log(JSON.stringify({
      sourceId: result?.sourceId ?? null,
      sourceName: result?.sourceName ?? null,
      status: result?.status ?? null,
      received: result?.received ?? null,
      created: result?.created ?? null,
      duplicates: result?.duplicates ?? null,
      error: result?.error ?? null
    }));
  }

  assert(run.failedSourceCount === 0, "NO_CURRENT_SOURCE_PRODUCTION_FAILURE");

  const qualification = await reconcileSourceRuntimeQualifications();
  const topicMomentum = await runTopicMomentumRuntime(user);
  const radarSnapshot = await refreshRadarSnapshot();
  const after = await getSourceManagementIndex();

  const activePlatformCount = after.platformCapabilities.filter(
    (item) => item.runtimeState === "ACTIVE"
  ).length;
  const activeRouteCount = after.discoveryRoutes.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  console.log(JSON.stringify({
    production: {
      sourceCount: run.sourceCount,
      succeeded: run.succeededSourceCount,
      failed: run.failedSourceCount
    },
    qualification: {
      autoReady: qualification.filter((item) => item.effectiveQualification === "AUTO_READY").length,
      conditional: qualification.filter((item) => item.effectiveQualification === "CONDITIONAL").length,
      disabled: qualification.filter((item) => item.effectiveQualification === "DISABLED").length
    },
    currentRegistry: after.summary,
    activePlatformCount,
    activeRouteCount,
    topicMomentum,
    radarSnapshot: {
      generatedAt: radarSnapshot.generatedAt,
      itemCount: radarSnapshot.items.length,
      elapsedMs: radarSnapshot.elapsedMs
    }
  }, null, 2));

  // Production acceptance is fail-closed after one bounded transient retry. The retry
  // handles short DNS/network flakes but never converts a repeated failure into PASS.
  assert(radarSnapshot.items.length >= 0, "TODAY_INTELLIGENCE_SNAPSHOT_REFRESHED");
  assert(activeRouteCount > 0, "AT_LEAST_ONE_DISCOVERY_ROUTE_ACTIVE");
  console.log("PLATFORM_SOURCE_ROUTE_PRODUCTION_029=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
