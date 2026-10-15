import { loadEnvConfig } from "@next/env";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentSources } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  RADAR_SOURCE_IDS,
  RADAR_SOURCE_PORTFOLIO,
  RADAR_SOURCE_PORTFOLIO_VERSION
} from "../lib/content/radar-source-portfolio";
import { resolveSourceAcquisitionPlan } from "../lib/server/content/source-acquisition-plan";
import { listCurrentSystemCollectionSources } from "../lib/server/content/source-portfolio-runtime";

loadEnvConfig(process.cwd());

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("RADAR_SOURCE_PORTFOLIO_ACCEPTANCE_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_ONLY");
  const rows = await getDatabase().select().from(contentSources);
  const current = rows.filter((source) => {
    const metadata = record(source.metadata);
    return RADAR_SOURCE_IDS.has(source.id) &&
      metadata.currentPortfolio === true &&
      metadata.radarPortfolioVersion === RADAR_SOURCE_PORTFOLIO_VERSION &&
      source.enabled === true &&
      source.status === "ACTIVE";
  });
  assert(current.length === RADAR_SOURCE_PORTFOLIO.length, "CURRENT_PORTFOLIO_COUNT");
  const systemSources = await listCurrentSystemCollectionSources();
  assert(systemSources.length >= current.length, "SYSTEM_SOURCE_SET_INCLUDES_BASELINE");
  assert(
    systemSources.filter((source) => !RADAR_SOURCE_IDS.has(source.id)).every((source) =>
      record(source.metadata).sourceRegistry !== undefined
    ),
    "OPERATOR_SOURCES_OWNED_BY_SOURCE_MANAGEMENT"
  );
  for (const source of systemSources) {
    const acquisition = resolveSourceAcquisitionPlan({
      collectionMethod: source.collectionMethod,
      platform: source.platform,
      providerRef: source.providerRef,
      canonicalUrl: source.canonicalUrl,
      metadata: source.metadata,
      collectionConfig: source.collectionConfig
    });
    assert(acquisition.kind !== "UNRESOLVED", "ACQUISITION_RESOLVED_" + source.id);
  }
  assert(
    systemSources.every((source) => source.collectionMethod !== "MANUAL"),
    "CURRENT_SYSTEM_SOURCES_NO_MANUAL_METHOD"
  );
  assert(!current.some((source) =>
    source.platform === "AI_NEWS_RADAR" ||
    source.canonicalUrl?.includes("news.learnprompt.pro/data")
  ), "NO_REFERENCE_SITE_PROXY_DB");
  for (const sourceId of ["source_radar_ai_hot"]) {
    const source = current.find((item) => item.id === sourceId);
    assert(
      Boolean(source) &&
      record(source?.metadata).referenceOnly === true &&
      record(source?.metadata).factualSource === false,
      "REFERENCE_ONLY_" + sourceId
    );
  }
  const archivedWithReleasedIdentity = rows.filter((source) =>
    source.status === "ARCHIVED" &&
    record(source.metadata).retiredReason === "AI_NEWS_RADAR_SOURCE_RESET_001"
  );
  assert(
    archivedWithReleasedIdentity.every((source) => source.providerRef === null),
    "ARCHIVED_SOURCE_IDENTITY_RELEASED"
  );
  console.log("CURRENT_PORTFOLIO_COUNT=" + current.length);
  console.log("CURRENT_SYSTEM_SOURCE_COUNT=" + systemSources.length);
  console.log("SOURCE_MANAGEMENT_ADDED_COUNT=" + systemSources.filter((source) => !RADAR_SOURCE_IDS.has(source.id)).length);
  console.log("ARCHIVED_SOURCE_COUNT=" + rows.filter((source) => source.status === "ARCHIVED").length);
  console.log("RADAR_SOURCE_PORTFOLIO_ACCEPTANCE=PASS");
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
