import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { and, desc, gte, inArray, sql } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentCollectionRuns } from "../lib/server/db/schema";
import { listCurrentSystemCollectionSourceIds } from "../lib/server/content/source-portfolio-runtime";
import { listSourceQualificationSnapshots, selectRecentQualificationRuns, SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS } from "../lib/server/content/source-qualification";
import { withSourceCollectionCycleLock } from "../lib/server/content/source-runtime-governance-execution";

async function acceptLockLoss() {
  const child = spawn(process.execPath, ["--env-file=.env.local", "--conditions=react-server", "--import", "tsx", "scripts/accept-discovery-collection-boundary.ts", "--lock-probe"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  let errorOutput = "";
  const closed = new Promise<number | null>((resolve, reject) => {
    child.once("close", resolve);
    child.once("error", reject);
  });
  const timeout = setTimeout(() => child.kill(), 20_000);
  try {
    await new Promise<void>((resolve, reject) => {
      child.stdout.on("data", (chunk) => {
        output += chunk.toString();
        if (output.includes("LOCK_PROBE_READY")) resolve();
      });
      child.stderr.on("data", (chunk) => { errorOutput += chunk.toString(); });
      closed.then(() => reject(new Error("LOCK_PROBE_EXITED_BEFORE_READY")), reject);
    });
    const contended = await withSourceCollectionCycleLock(async () => { assert.fail("CONTENDED_CYCLE_MUST_NOT_RUN"); });
    assert.equal(contended.status, "SKIPPED", "PRIVATE_SESSION_LOCK_EXCLUDES_SECOND_CYCLE");
    // Only terminate the private lock session created by this exact child PID.
    const rows = await getDatabase().execute(sql`select pg_terminate_backend(pid) as terminated from pg_stat_activity where datname = current_database() and application_name = ${"opc_collection_lock_" + child.pid}`);
    assert.equal(rows.length, 1, "ONLY_OWN_PROBE_CONNECTION_TARGETED");
    assert.equal(rows[0]?.terminated, true, "OWN_PROBE_CONNECTION_TERMINATED");
    assert.equal(await closed, 1, "LOST_SESSION_TERMINATES_COLLECTOR");
    assert(errorOutput.includes("SOURCE_COLLECTION_CYCLE_LOCK_LOST"));
    assert(!output.includes("LOCK_PROBE_WORK_CONTINUED"), "WORK_STOPS_ON_LOCK_LOSS");
    console.log("SOURCE_COLLECTION_LOCK_CONNECTION_LOSS=PASS");
  } finally {
    clearTimeout(timeout);
    if (child.exitCode === null) child.kill();
    await closed.catch(() => {});
  }
}

async function main() {
  assert.equal(assertCurrentDatabaseTarget().environment, "development", "DEVELOPMENT_DATABASE_ONLY");
  if (process.argv.includes("--lock-probe")) {
    await withSourceCollectionCycleLock(async () => {
      console.log("LOCK_PROBE_READY");
      await new Promise((resolve) => setTimeout(resolve, 30_000));
      console.log("LOCK_PROBE_WORK_CONTINUED");
    });
    return;
  }
  if (process.argv.includes("--lock-only")) {
    await acceptLockLoss();
    return;
  }
  const sourceIds = await listCurrentSystemCollectionSourceIds({ serverRuntimeOnly: true });
  assert(sourceIds.length > 0, "REAL_SOURCE_DIRECTORY_NON_EMPTY");
  const now = new Date();
  // Compare the bounded query against the previous in-memory selection using only
  // minimal provenance fields, without transferring historic full Run payloads.
  const rows = await getDatabase().select({
    sourceId: contentCollectionRuns.sourceId,
    status: contentCollectionRuns.status,
    receivedCount: contentCollectionRuns.receivedCount,
    startedAt: contentCollectionRuns.startedAt,
    metadata: sql`jsonb_build_object('collectionOrigin', ${contentCollectionRuns.metadata}->'collectionOrigin', 'qualificationOnly', ${contentCollectionRuns.metadata}->'qualificationOnly')`
  }).from(contentCollectionRuns).where(and(
    inArray(contentCollectionRuns.sourceId, sourceIds),
    gte(contentCollectionRuns.startedAt, new Date(now.getTime() - SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS * 86_400_000))
  )).orderBy(desc(contentCollectionRuns.startedAt), desc(contentCollectionRuns.id));
  const startedAt = Date.now();
  const snapshots = await listSourceQualificationSnapshots(sourceIds);
  for (const snapshot of snapshots) {
    const { sample } = selectRecentQualificationRuns(rows.filter((row) => row.sourceId === snapshot.sourceId), now);
    assert.equal(snapshot.evidence.liveRunCount, sample.length, "RECENT_RUN_COUNT_UNCHANGED:" + snapshot.sourceId);
    assert.equal(snapshot.evidence.successfulLiveRunCount, sample.filter((run) => run.status === "SUCCEEDED").length, "RECENT_SUCCESS_COUNT_UNCHANGED:" + snapshot.sourceId);
  }
  assert.equal(snapshots.length, sourceIds.length, "ALL_CURRENT_SOURCES_QUALIFIED");
  console.log(JSON.stringify({ sourceCount: sourceIds.length, comparedRunCount: rows.length, qualificationReadMs: Date.now() - startedAt }));
  console.log("DISCOVERY_COLLECTION_REAL_DATABASE_BOUNDARY=PASS");
}

main().finally(closeDatabase).catch((error) => { console.error(error); process.exitCode = 1; });
