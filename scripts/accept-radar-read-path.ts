import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import {
  getRadarSnapshot,
  invalidateRadarSnapshot
} from "../lib/server/content/radar-snapshot";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("RADAR_READ_PATH_ACCEPT_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "RADAR_READ_PATH_DEV_DATABASE_ONLY"
  );

  invalidateRadarSnapshot();
  let started = Date.now();
  const persisted = await getRadarSnapshot();
  const persistedMs = Date.now() - started;
  assert(persisted.items.length > 0, "RADAR_PERSISTED_SNAPSHOT_NONEMPTY");
  assert(persistedMs < 3000, "RADAR_PERSISTED_COLD_READ_UNDER_3S");

  started = Date.now();
  const cached = await getRadarSnapshot();
  const cacheMs = Date.now() - started;
  assert(cached.generatedAt === persisted.generatedAt, "RADAR_CACHE_SAME_SNAPSHOT");
  assert(cacheMs < 100, "RADAR_MEMORY_CACHE_UNDER_100MS");
  assert(
    persisted.readiness.discoverySignals.recentSourceCount >=
      persisted.readiness.discoverySignals.qualifiedRecentSourceCount,
    "RADAR_OBSERVED_SIGNALS_NOT_BELOW_QUALIFIED"
  );
  assert(
    persisted.readiness.discoverySignals.recentPlatformCount >=
      persisted.readiness.discoverySignals.qualifiedRecentPlatformCount,
    "RADAR_OBSERVED_PLATFORMS_NOT_BELOW_QUALIFIED"
  );

  console.log("RADAR_PERSISTED_COLD_MS=" + persistedMs);
  console.log("RADAR_MEMORY_CACHE_MS=" + cacheMs);
  console.log("RADAR_OBSERVED_SIGNALS=" +
    persisted.readiness.discoverySignals.recentSourceCount + "/" +
    persisted.readiness.discoverySignals.recentPlatformCount);
  console.log("RADAR_QUALIFIED_SIGNALS=" +
    persisted.readiness.discoverySignals.qualifiedRecentSourceCount + "/" +
    persisted.readiness.discoverySignals.qualifiedRecentPlatformCount);
  console.log("RADAR_READ_PATH_ACCEPTANCE=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
