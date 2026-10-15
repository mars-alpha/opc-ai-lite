import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { listSourceRuntimeOperations } from "../lib/server/content/source-runtime-operations";
import { RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("CURRENT_SOURCE_PRODUCTION_RUN_AUDIT_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_ONLY"
  );

  const runtime = await listSourceRuntimeOperations(200);
  const health = runtime.sourceHealth;
  assert(health.length >= RADAR_SOURCE_PORTFOLIO.length, "CURRENT_SOURCE_COVERS_BASELINE");
  console.log("CURRENT_SOURCE_COUNT=" + health.length);
  console.log("BASELINE_SOURCE_COUNT=" + RADAR_SOURCE_PORTFOLIO.length);

  const failed = health.filter((item) => item.status === "FAILED" || item.status === "RUNTIME_GAP");
  const healthy = health.filter((item) => item.status === "HEALTHY");
  const ready = health.filter((item) => item.status === "READY");
  const conditional = health.filter((item) => item.effectiveQualification === "CONDITIONAL");

  console.log("HEALTHY_SOURCE_COUNT=" + healthy.length);
  console.log("READY_WITHOUT_LATEST_RUN_COUNT=" + ready.length);
  console.log("FAILED_SOURCE_COUNT=" + failed.length);
  console.log("CONDITIONAL_SOURCE_COUNT=" + conditional.length);

  for (const item of health) {
    console.log(JSON.stringify({
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      platform: item.platform,
      status: item.status,
      effectiveQualification: item.effectiveQualification,
      latestDetail: item.detail,
      lastSuccessAt: item.lastSuccessAt,
      recentRunCount: item.utility.recentRunCount,
      successRate: item.utility.successRate,
      receivedTotal: item.utility.receivedTotal,
      keptTotal: item.utility.keptTotal
    }));
  }

  assert(ready.length === 0, "EVERY_CURRENT_SOURCE_HAS_LATEST_SYSTEM_RUN");
  assert(failed.length === 0, "NO_CURRENT_SOURCE_LATEST_RUN_FAILED");
  console.log("CURRENT_SOURCE_PRODUCTION_RUN_AUDIT=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
