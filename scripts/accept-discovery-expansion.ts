import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  listDiscoveryExpansionCandidates
} from "../lib/server/content/intelligence-read-model";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("DISCOVERY_EXPANSION_DB_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DISCOVERY_EXPANSION_DEV_DATABASE_ONLY"
  );

  const candidates = await listDiscoveryExpansionCandidates(100);

  assert(Array.isArray(candidates), "DISCOVERY_EXPANSION_CANDIDATE_READ_MODEL");
  assert(
    candidates.every((item) => item.coverage.authority === "REFERENCE_ONLY"),
    "DISCOVERY_EXPANSION_REFERENCE_ONLY_COVERAGE"
  );
  assert(
    candidates.every((item) => item.discoveryExpansion.formalVerificationPromotion === false),
    "DISCOVERY_EXPANSION_NO_VERIFICATION_PROMOTION"
  );
  assert(
    candidates.every((item) => item.discoveryExpansion.formalHotspotPromotion === false),
    "DISCOVERY_EXPANSION_NO_HOTSPOT_PROMOTION"
  );
  assert(
    candidates.every((item) => item.discoveryExpansion.topicMomentumAuthority === "PRESENTATION_ONLY"),
    "DISCOVERY_EXPANSION_TOPIC_MOMENTUM_PRESENTATION_ONLY"
  );
  assert(
    candidates.every((item) => item.discoveryExpansion.opcValueAuthority === "CLUSTER_ANALYSIS_ONLY"),
    "DISCOVERY_EXPANSION_OPC_AUTHORITY"
  );
  console.log("DISCOVERY_EXPANSION_CANDIDATES=" + candidates.length);
  console.log("DISCOVERY_EXPANSION_DB=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
