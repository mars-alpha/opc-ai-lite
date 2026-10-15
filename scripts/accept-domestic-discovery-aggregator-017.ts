import { eq } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { users } from "../lib/server/db/schema";
import {
  DAILYHOT_DOMESTIC_EXCLUDED_ROUTES,
  DAILYHOT_DOMESTIC_RUNTIME_ROUTES,
  collectTrendDiscovery,
  isStrictDomesticAiSignal
} from "../lib/server/content/trend-discovery";
import { fetchPublicJson } from "../lib/server/content/collection-runner";
import {
  listCurrentSystemCollectionSources,
  runSystemSourcePortfolio,
  seedRadarSourcePortfolio
} from "../lib/server/content/source-portfolio-runtime";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("DOMESTIC_DISCOVERY_AGGREGATOR_017_ACCEPT_FAILED:" + code);
  console.log(code + "=PASS");
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizedTitle(value: string) {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DAILYHOT_DEV_DATABASE_ONLY");
  const base = process.env.DAILYHOT_API_BASE_URL?.trim() ?? "";
  assert(base === "http://127.0.0.1:16688", "DAILYHOT_DEV_SELF_HOSTED_BASE");
  const internalOrigins = (process.env.COLLECTION_INTERNAL_SERVICE_ORIGINS ?? "").split(",").map((item) => item.trim());
  assert(internalOrigins.includes(base), "DAILYHOT_INTERNAL_SERVICE_ALLOWLIST");

  const routeCounts: Record<string, number> = {};
  for (const route of DAILYHOT_DOMESTIC_RUNTIME_ROUTES) {
    const payload = record(await fetchPublicJson(new URL(route.route, base + "/").toString()));
    const rows = Array.isArray(payload.data) ? payload.data : [];
    routeCounts[route.route] = rows.length;
    assert(rows.length > 0, "DAILYHOT_LIVE_ROUTE_" + route.route.toUpperCase().replace(/\W/g, "_"));
  }

  const aggregated = await collectTrendDiscovery(
    { provider: "DAILYHOT_DOMESTIC", searchQuery: "AI", resultLimit: 30, windowHours: 72, minStars: 0 },
    fetchPublicJson
  );
  assert(aggregated.items.length > 0, "DAILYHOT_AGGREGATED_ITEMS_PRESENT");
  assert(aggregated.items.every((item) => isStrictDomesticAiSignal(item.title)), "DAILYHOT_AGGREGATED_STRICT_AI_TITLE_ONLY");
  const allowedRoutes = new Set(DAILYHOT_DOMESTIC_RUNTIME_ROUTES.map((item) => item.route));
  assert(aggregated.items.every((item) => allowedRoutes.has(String(item.metadata?.aggregatorRoute) as never)), "DAILYHOT_ONLY_QUALIFIED_ROUTES");
  const normalized = aggregated.items.map((item) => normalizedTitle(item.title));
  assert(new Set(normalized).size === normalized.length, "DAILYHOT_AGGREGATED_TITLE_DEDUPE");

  await seedRadarSourcePortfolio();
  const current = await listCurrentSystemCollectionSources({ serverRuntimeOnly: true });
  const sourceId = "source_radar_dailyhot_domestic";
  assert(current.some((source) => source.id === sourceId), "DAILYHOT_CURRENT_SYSTEM_SOURCE");

  const [admin] = await getDatabase().select().from(users).where(eq(users.role, "ADMIN")).limit(1);
  if (!admin) throw new Error("ADMIN_USER_REQUIRED");
  const result = await runSystemSourcePortfolio(
    { id: admin.id, email: "local-admin@opc.invalid", displayName: admin.displayName, role: "ADMIN" },
    {
      sourceIds: [sourceId],
      qualificationOnly: true,
      qualificationRunKind: "SOURCE_QUALIFICATION:DOMESTIC_DISCOVERY_AGGREGATOR_017"
    }
  );
  assert(result.sourceCount === 1 && result.succeededSourceCount === 1 && result.failedSourceCount === 0, "DAILYHOT_SOURCE_QUALIFICATION_LIVE_PASS");
  const received = Number(result.results[0]?.received ?? 0);
  assert(received > 0, "DAILYHOT_SOURCE_QUALIFICATION_NONEMPTY");

  console.log("DAILYHOT_RUNTIME_ROUTE_COUNTS=" + JSON.stringify(routeCounts));
  console.log("DAILYHOT_EXCLUDED_ROUTES=" + JSON.stringify(DAILYHOT_DOMESTIC_EXCLUDED_ROUTES));
  console.log("DAILYHOT_AGGREGATED_SAMPLE=" + JSON.stringify(aggregated.items.slice(0, 8).map((item) => ({
    route: item.metadata?.aggregatorRoute,
    title: item.title
  }))));
  console.log("DOMESTIC_DISCOVERY_AGGREGATOR_017_ACCEPTANCE=PASS");
}

main().finally(closeDatabase);
