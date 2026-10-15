import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { getSourceManagementIndex } from "../lib/server/content/source-management";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("PLATFORM_SOURCE_ROUTE_RUNTIME_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_ONLY"
  );

  const index = await getSourceManagementIndex();
  console.log("CURRENT_SOURCE_COUNT=" + index.summary.sourceCount);
  console.log("AUTO_READY=" + index.summary.autoReadyCount);
  console.log("CONDITIONAL=" + index.summary.conditionalCount);

  for (const route of index.discoveryRoutes) {
    console.log(JSON.stringify({
      kind: "DISCOVERY_ROUTE",
      id: route.id,
      label: route.label,
      status: route.status,
      sourceCount: route.sourceCount,
      activeSourceCount: route.activeSourceCount,
      platformCount: route.platformCount
    }));
  }

  for (const platform of index.platformCapabilities) {
    console.log(JSON.stringify({
      kind: "PLATFORM",
      platform: platform.platform,
      runtimeState: platform.runtimeState,
      productionPath: platform.productionPath,
      sourceCount: platform.sourceCount,
      supportedSourceCount: platform.supportedSourceCount,
      qualifiedSourceCount: platform.qualifiedSourceCount,
      activeSourceCount: platform.activeSourceCount,
      discoveryRouteIds: platform.discoveryRouteIds,
      aggregatorRoute: platform.aggregatorRoute,
      backingSourceIds: platform.backingSourceIds
    }));
    assert(
      platform.runtimeState !== "ACTIVE" || platform.backingSourceIds.length > 0,
      "ACTIVE_PLATFORM_HAS_BACKING_SOURCE_" + platform.platform
    );
  }

  assert(
    index.items.every((item) => item.discoveryRouteIds.length > 0),
    "EVERY_CURRENT_SOURCE_HAS_DISCOVERY_ROUTE"
  );

  const byPlatform = new Map(index.platformCapabilities.map((item) => [item.platform, item]));
  const dailyHot = index.items.find((item) => item.sourceId === "source_radar_dailyhot_domestic");
  const dailyHotCanBackRoutes = Boolean(
    dailyHot &&
    dailyHot.status === "ACTIVE" &&
    dailyHot.enabled &&
    dailyHot.acquisition.serverRuntimeSupported &&
    dailyHot.effectiveQualification === "AUTO_READY" &&
    dailyHot.health !== "FAILED" &&
    dailyHot.health !== "MISSING"
  );
  assert(
    (byPlatform.get("WEIBO")?.productionPath === "AGGREGATED_ROUTE") === dailyHotCanBackRoutes,
    "WEIBO_AGGREGATED_STATE_MATCHES_DAILYHOT_RUNTIME"
  );
  assert(
    (byPlatform.get("ZHIHU")?.productionPath === "AGGREGATED_ROUTE") === dailyHotCanBackRoutes,
    "ZHIHU_AGGREGATED_STATE_MATCHES_DAILYHOT_RUNTIME"
  );
  assert(byPlatform.get("DOUYIN")?.productionPath !== "AGGREGATED_ROUTE", "DOUYIN_EXCLUDED_ROUTE_NOT_FAKE_ACTIVE");
  assert(byPlatform.get("BILIBILI")?.productionPath !== "AGGREGATED_ROUTE", "BILIBILI_EXCLUDED_ROUTE_NOT_FAKE_ACTIVE");
  console.log("PLATFORM_SOURCE_ROUTE_RUNTIME_AUDIT=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
