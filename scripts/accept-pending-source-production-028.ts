import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { users } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { getSourceManagementIndex } from "../lib/server/content/source-management";
import { runSystemSourcePortfolio } from "../lib/server/content/source-portfolio-runtime";
import { reconcileSourceRuntimeQualifications } from "../lib/server/content/source-qualification-runtime";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("PENDING_SOURCE_PRODUCTION_028_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_ONLY");

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

  const before = await getSourceManagementIndex();
  const pending = before.items.filter((item) => item.health === "READY");
  const pendingIds = pending.map((item) => item.sourceId);

  console.log("CURRENT_SOURCE_COUNT=" + before.summary.sourceCount);
  console.log("PENDING_BEFORE=" + pending.length);
  for (const item of pending) {
    console.log(JSON.stringify({
      phase: "BEFORE",
      sourceId: item.sourceId,
      name: item.name,
      health: item.health,
      qualification: item.effectiveQualification,
      acquisitionKind: item.acquisition.kind
    }));
  }

  const run = pendingIds.length
    ? await runSystemSourcePortfolio(user, { sourceIds: pendingIds })
    : {
        version: "system-source-portfolio-v1",
        sourceCount: 0,
        succeededSourceCount: 0,
        failedSourceCount: 0,
        results: [] as Array<Record<string, unknown>>
      };

  await reconcileSourceRuntimeQualifications();
  const after = await getSourceManagementIndex();
  const selectedAfter = pendingIds
    .map((sourceId) => after.items.find((item) => item.sourceId === sourceId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const remainingReady = selectedAfter.filter((item) => item.health === "READY");
  const healthy = selectedAfter.filter((item) => item.health === "HEALTHY");
  const failed = selectedAfter.filter((item) => item.health === "FAILED");

  console.log("ATTEMPTED=" + pendingIds.length);
  console.log("SUCCEEDED=" + run.succeededSourceCount);
  console.log("FAILED=" + run.failedSourceCount);
  console.log("HEALTHY_AFTER=" + healthy.length);
  console.log("FAILED_AFTER=" + failed.length);
  console.log("READY_AFTER=" + remainingReady.length);

  const resultBySource = new Map(
    run.results.map((item) => [String(item.sourceId ?? ""), item])
  );
  for (const item of selectedAfter) {
    const runResult = resultBySource.get(item.sourceId);
    console.log(JSON.stringify({
      phase: "AFTER",
      sourceId: item.sourceId,
      name: item.name,
      health: item.health,
      qualification: item.effectiveQualification,
      runStatus: runResult?.status ?? null,
      received: runResult?.received ?? null,
      created: runResult?.created ?? null,
      duplicates: runResult?.duplicates ?? null,
      error: runResult?.error ?? null
    }));
  }

  assert(run.sourceCount === pendingIds.length, "ALL_PENDING_SOURCES_ATTEMPTED");
  assert(remainingReady.length === 0, "NO_ATTEMPTED_SOURCE_STILL_READY");
  assert(healthy.length + failed.length === pendingIds.length, "ALL_ATTEMPTS_CLASSIFIED");

  if (failed.length) {
    console.log("EXTERNAL_OR_ROUTE_FAILURES_RECORDED=" + failed.length);
  }
  console.log("PENDING_SOURCE_PRODUCTION_028=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
