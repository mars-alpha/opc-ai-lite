import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import { getSourceManagementOverview } from "../lib/server/content/source-management";
import { RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_MANAGEMENT_FOUNDATION_ACCEPT_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "SOURCE_MANAGEMENT_DEV_DATABASE_ONLY");

  const overview = await getSourceManagementOverview();
  const radarItems = overview.items.filter((item) => item.registrationOrigin === "SYSTEM_BASELINE");
  const operatorItems = overview.items.filter((item) => item.registrationOrigin === "OPERATOR_ADDED");
  assert(radarItems.length === RADAR_SOURCE_PORTFOLIO.length, "SOURCE_MANAGEMENT_RADAR_SOURCE_COUNT_MATCHES_PORTFOLIO");
  assert(
    new Set(radarItems.map((item) => item.group)).size === new Set(RADAR_SOURCE_PORTFOLIO.map((item) => item.group)).size,
    "SOURCE_MANAGEMENT_RADAR_GROUP_COUNT_MATCHES_PORTFOLIO"
  );
  assert(radarItems.every((item) => item.health !== "MISSING"), "SOURCE_MANAGEMENT_NO_MISSING_RADAR_SOURCE");
  assert(radarItems.every((item) => item.acquisition.kind !== "UNRESOLVED"), "SOURCE_MANAGEMENT_RADAR_ACQUISITION_RESOLVED");
  assert(overview.summary.operatorAddedSourceCount === operatorItems.length, "SOURCE_MANAGEMENT_OPERATOR_ADDED_COUNT_EXPLAINED");
  assert(overview.items.every((item) => item.qualificationReasons.length > 0 || item.effectiveQualification === "AUTO_READY"), "SOURCE_MANAGEMENT_QUALIFICATION_EXPLAINABLE");
  assert(overview.optionalCapabilities.length > 0, "SOURCE_MANAGEMENT_OPTIONAL_CAPABILITY_VISIBLE");

  console.log("SOURCE_MANAGEMENT_SOURCE_COUNT=" + overview.summary.sourceCount);
  console.log("SOURCE_MANAGEMENT_RADAR_SOURCE_COUNT=" + overview.summary.radarSourceCount);
  console.log("SOURCE_MANAGEMENT_OPERATOR_ADDED_SOURCE_COUNT=" + overview.summary.operatorAddedSourceCount);
  console.log("SOURCE_MANAGEMENT_HEALTHY_COUNT=" + overview.summary.healthyCount);
  console.log("SOURCE_MANAGEMENT_AUTO_READY_COUNT=" + overview.summary.autoReadyCount);
  console.log("SOURCE_MANAGEMENT_CONDITIONAL_COUNT=" + overview.summary.conditionalCount);
  console.log("SOURCE_MANAGEMENT_FOUNDATION_ACCEPTANCE=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
