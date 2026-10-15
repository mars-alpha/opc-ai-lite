import { loadEnvConfig } from "@next/env";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import {
  getCurrentCollectionCapabilityHealthSnapshot,
  getCurrentCollectionCapabilityRoutes
} from "../lib/server/content/collection-capability-router";

loadEnvConfig(process.cwd());

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("CAPABILITY_ROUTER_HEALTH_REQUIRES_DEVELOPMENT");
  }

  const snapshot = await getCurrentCollectionCapabilityHealthSnapshot();
  const routes = await getCurrentCollectionCapabilityRoutes();

  const focus = routes.filter((route) =>
    ["BILIBILI", "YOUTUBE"].includes(route.platform)
  );

  console.log(JSON.stringify({
    generatedAt: snapshot.generatedAt,
    routes: focus.map((route) => ({
      platform: route.platform,
      capability: route.capability,
      status: route.status,
      activeBackend: route.activeBackend?.id ?? null,
      fallbacks: route.fallbackBackends.map((item) => item.id),
      expansionProvider: route.expansionProvider
    }))
  }, null, 2));

  const biliSearch = focus.find((route) => route.platform === "BILIBILI" && route.capability === "SEARCH");
  if (!biliSearch || biliSearch.activeBackend?.id !== "BILIBILI_PUBLIC_SEARCH_API") {
    throw new Error("CAPABILITY_ROUTER_BILIBILI_SEARCH_NOT_READY");
  }

  console.log("COLLECTION_CAPABILITY_ROUTER_016_LIVE_HEALTH=PASS");
}

main()
  .finally(() => closeDatabase())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
