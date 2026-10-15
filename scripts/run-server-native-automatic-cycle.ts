import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { users } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  listCurrentSystemCollectionSourceIds,
  runSystemSourcePortfolio
} from "../lib/server/content/source-portfolio-runtime";
import { reconcileSourceRuntimeQualifications } from "../lib/server/content/source-qualification-runtime";
import { refreshRadarSnapshot } from "../lib/server/content/radar-snapshot";
import { listDueSourceIdsForAutomaticCycle, withSourceCollectionCycleLock } from "../lib/server/content/source-runtime-governance-execution";
import { runTopicMomentumRuntime } from "../lib/server/content/topic-momentum-runtime";
import { recoverStaleCollectionRuns } from "../lib/server/content/collection-runner";
import { runDiscoveryExpansionCycle } from "../lib/server/content/collection-expansion";
import {backfillPracticeMaterials} from "../lib/server/content/practice-material-backfill";

loadEnvConfig(process.cwd());

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (process.argv.includes("--confirm=SERVER-NATIVE-COLLECTION-PRODUCTION") && target.environment !== "production") {
    throw new Error("PRODUCTION_COLLECTION_TARGET_REQUIRED");
  }
  if (target.environment === "production" && !process.argv.includes("--confirm=SERVER-NATIVE-COLLECTION-PRODUCTION")) {
    throw new Error("PRODUCTION_COLLECTION_CONFIRMATION_REQUIRED");
  }
  return withSourceCollectionCycleLock(runCycle);
}

async function runCycle() {
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

  const startedAt = new Date().toISOString();
  const failures: Array<{ section: string; error: string }> = [];
  async function runSection<T>(section: string, work: () => Promise<T>) {
    const sectionStartedAt = Date.now();
    console.log("CYCLE_SECTION_START=" + section);
    try {
      const value = await work();
      console.log("CYCLE_SECTION_PASS=" + section + ";ELAPSED_MS=" + (Date.now() - sectionStartedAt));
      return value;
    } catch (error) {
      failures.push({
        section,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log("CYCLE_SECTION_FAIL=" + section + ";ELAPSED_MS=" + (Date.now() - sectionStartedAt));
      return null;
    }
  }
  const staleRunRecovery = await runSection("STALE_COLLECTION_RUN_RECOVERY", () =>
    recoverStaleCollectionRuns()
  );
  const systemSourceIds = await runSection("SYSTEM_SOURCE_DISCOVERY", () =>
    listCurrentSystemCollectionSourceIds({ serverRuntimeOnly: true })
  );
  if (systemSourceIds?.length === 0) {
    failures.push({ section: "SYSTEM_SOURCE_DISCOVERY", error: "CURRENT_SYSTEM_SOURCE_DIRECTORY_EMPTY" });
  }
  const governanceExecution = systemSourceIds
    ? await runSection("SOURCE_GOVERNANCE_EXECUTION", () =>
        listDueSourceIdsForAutomaticCycle({ sourceIds: systemSourceIds })
      )
    : null;
  if (systemSourceIds?.length && governanceExecution &&
      !governanceExecution.items.some((item) => item.execution.executable)) {
    failures.push({ section: "SOURCE_GOVERNANCE_EXECUTION", error: "NO_EXECUTABLE_SYSTEM_SOURCE" });
  }
  const sourcePortfolio = governanceExecution
    ? governanceExecution.sourceIds.length
      ? await runSection("SOURCE_PORTFOLIO", () =>
          runSystemSourcePortfolio(user, { sourceIds: governanceExecution.sourceIds })
        )
      : {
          version: "system-source-portfolio-v1",
          sourceCount: 0,
          succeededSourceCount: 0,
          failedSourceCount: 0,
          skipped: "NO_SOURCE_DUE",
          results: []
        }
    : null;
  const qualification =
    await runSection("QUALIFICATION_RECONCILE", () =>
      reconcileSourceRuntimeQualifications()
    ) ?? [];
  if (sourcePortfolio && sourcePortfolio.failedSourceCount > 0) {
    failures.push({ section: "SOURCE_PORTFOLIO", error: "SOURCE_PORTFOLIO_PARTIAL_FAILURE" });
  }
  const practiceMaterials = await runSection("PRACTICE_MATERIALS", () =>
    backfillPracticeMaterials(user,{limit:2,apply:true})
  );
  const discoveryExpansion = await runSection("DISCOVERY_EXPANSION", () =>
    runDiscoveryExpansionCycle(user, { maxEvents: 3 })
  );
  if (discoveryExpansion && discoveryExpansion.failed > 0) {
    failures.push({ section: "DISCOVERY_EXPANSION", error: "DISCOVERY_EXPANSION_PARTIAL_FAILURE" });
  }
  const topicMomentum = await runSection("TOPIC_MOMENTUM_FOLLOW_UP", () =>
    runTopicMomentumRuntime(user)
  );
  if (topicMomentum?.results.some((item) => item.error)) {
    failures.push({ section: "TOPIC_MOMENTUM_FOLLOW_UP", error: "TOPIC_MOMENTUM_PARTIAL_FAILURE" });
  }
  const radarSnapshot = await runSection("RADAR_SNAPSHOT", () =>
    refreshRadarSnapshot()
  );
  const finishedAt = new Date().toISOString();

  console.log(JSON.stringify({
    version: "server-native-automatic-cycle-v10-human-ai-boundary",
    status: failures.length ? "PARTIAL" : "SUCCEEDED",
    startedAt,
    finishedAt,
    staleRunRecovery,
    sourcePortfolio,
    aiExecution: "HUMAN_TRIGGER_ONLY",
    governanceExecution: governanceExecution ? {
      dueSourceCount: governanceExecution.sourceIds.length,
      dueSourceIds: governanceExecution.sourceIds,
      humanReviewRequiredCount: governanceExecution.items.filter((item) =>
        item.execution.requiresHumanReview
      ).length,
      waitingSourceCount: governanceExecution.items.filter((item) =>
        item.execution.executable && !item.execution.due
      ).length,
      blockedSourceCount: governanceExecution.items.filter((item) =>
        item.execution.action === "BLOCKED_INVALID_INPUT"
      ).length
    } : null,
    systemSourceCount: systemSourceIds?.length ?? 0,
    qualification: {
      evaluated: qualification.length,
      autoReady: qualification.filter((item) =>
        item.effectiveQualification === "AUTO_READY"
      ).length,
      conditional: qualification.filter((item) =>
        item.effectiveQualification === "CONDITIONAL"
      ).length,
      disabled: qualification.filter((item) =>
        item.effectiveQualification === "DISABLED"
      ).length,
      results: qualification
    },
    practiceMaterials,
    discoveryExpansion,
    topicMomentum,
    radarSnapshot: radarSnapshot ? {
      generatedAt: radarSnapshot.generatedAt,
      itemCount: radarSnapshot.items.length,
      currentHotCount: radarSnapshot.currentHot.length,
      worthPracticingCount: radarSnapshot.worthPracticing.length,
      curatedCount: radarSnapshot.items.filter((item) => item.curation.curated).length,
      elapsedMs: radarSnapshot.elapsedMs
    } : null,
    failures
  }, null, 2));
  if (failures.length) {
    throw new Error(
      "SERVER_NATIVE_AUTOMATIC_CYCLE_PARTIAL_FAILURE:" +
      failures.map((item) => item.section).join(",")
    );
  }
  console.log("SERVER_NATIVE_AUTOMATIC_CYCLE=PASS");
}

main()
  .then(async (result) => {
    if (result.status === "SKIPPED") console.log("SERVER_NATIVE_AUTOMATIC_CYCLE=SKIPPED_ALREADY_RUNNING");
    await closeDatabase();
  })
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
