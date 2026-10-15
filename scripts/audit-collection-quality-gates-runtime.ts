import { loadEnvConfig } from "@next/env";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentSources } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION
} from "../lib/server/content/source-qualification-runtime";
import { listSourceQualificationSnapshots } from "../lib/server/content/source-qualification";

loadEnvConfig(process.cwd());

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("POLLUTION_SYNDICATION_022C_RUNTIME_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }
  const sources = await getDatabase().select().from(contentSources);
  const snapshots = await listSourceQualificationSnapshots();
  const auto = snapshots.filter((item) => item.qualification === "AUTO_READY");

  assert(auto.length >= 12, "AUTO_BASELINE_STILL_HEALTHY");
  assert(
    auto.every((item) => item.evidenceSufficiency === "MATURE"),
    "AUTO_READY_REQUIRES_MATURE_EVIDENCE"
  );
  assert(
    auto.every((item) => item.evidence.currentRuntimeContractObserved),
    "AUTO_READY_CURRENT_RUNTIME_CONTRACT_OBSERVED"
  );
  assert(
    auto.every((item) => item.evidence.qualificationCheckpointCurrent),
    "AUTO_READY_CURRENT_CHECKPOINT_OBSERVED"
  );
  console.log("CURRENT_RUNTIME_CONTRACT=" + SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION);
  const hf = sources.find((item) => item.id === "source_research_huggingface_papers");
  const hfRuntime = record(record(hf?.metadata).runtimeQualification);
  assert(
    hfRuntime.effectiveQualification === "DISABLED" &&
      Number(hfRuntime.consecutiveFailures) >= 6,
    "HUGGINGFACE_RUNTIME_DISABLED_AFTER_6_FAILURES"
  );
  assert(
    auto.every((item) => !item.adapterFamilies.includes("SOCIAL_BROWSER")),
    "NO_BROWSER_AUTO_READY"
  );

  console.log(JSON.stringify({
    autoReadyCount: auto.length,
    conditionalCount: snapshots.filter((item) => item.qualification === "CONDITIONAL").length,
    manualOnlyCount: snapshots.filter((item) => item.qualification === "MANUAL_ONLY").length,
    disabledCount: snapshots.filter((item) => item.qualification === "DISABLED").length,
    huggingFaceRuntime: hfRuntime
  }, null, 2));
  console.log("POLLUTION_SYNDICATION_022C_RUNTIME_AUDIT=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
