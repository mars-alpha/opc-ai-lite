import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { getDatabase, closeDatabase } from "../lib/server/db";
import { contentEvents, contentSources, contentCandidateDecisions, contentAuditRecords, users } from "../lib/server/db/schema";
import { RADAR_SNAPSHOT_SCHEMA_VERSION, getRadarSnapshot, readRadarOperations } from "../lib/server/content/radar-snapshot";
import { readSourceAiRelevancePolicy, saveSourceAiRelevancePolicy } from "../lib/server/content/source-management-policy";
import { qualifyOnboardedSource } from "../lib/server/content/source-onboarding";
import { recordCandidateDecision } from "../lib/server/content/discovery";
import * as sourceManagement from "../lib/server/content/source-management";
import type { AuthUser } from "../lib/server/auth/service";

loadEnvConfig(process.cwd());
async function main() {
  assert.equal(assertCurrentDatabaseTarget().environment, "development", "DEVELOPMENT_ONLY");
  const db = getDatabase();
  const childEvent = process.argv[process.argv.indexOf("--read-event") + 1];
  if (process.argv.includes("--read-event")) {
    const items = [{ eventId: childEvent, category: "模型", discoveryStatus: "DISCOVERED" }];
    const result = await readRadarOperations({ items, featured: items, currentHot: items, worthPracticing: items, windowEventIndex: items, totalEventCount7d: 1, categoryCounts7d: { 全部: 1, 模型: 1 } });
    assert.equal(result.items.length, 0); assert.equal(result.currentHot.length, 0); assert.equal(result.totalEventCount7d, 0);
    await closeDatabase(); console.log("CROSS_PROCESS_IGNORE_OVERLAY=PASS"); return;
  }
  const eventId = randomUUID();
  const sourceId = "source_p0_accept_" + randomUUID().replaceAll("-", "");
  const [admin] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1);
  assert.ok(admin, "EXISTING_ADMIN_REQUIRED");
  const actor: AuthUser = { id: admin.id, email: "p0-acceptance@example.invalid", displayName: null, role: "ADMIN" };
  const invalidActor = { ...actor, id: randomUUID() };
  try {
    await db.insert(contentEvents).values({ id: eventId, fingerprint: eventId, title: "P0 isolated fixture" });
    await db.insert(contentSources).values({ id: sourceId, name: "P0 isolated fixture", sourceType: "OFFICIAL", enabled: false, collectionMethod: "RSS", metadata: { manualEntry: true, sentinel: "keep", runtimeQualification: { effectiveQualification: "CONDITIONAL", checkpoint: "preserve-fixture-checkpoint" } }, collectionConfig: { acquisition: { kind: "RSS_ATOM", targetUrl: "https://example.com/feed.xml" } } });
    // An invalid actor violates the REAL audit FK. No test-only hooks in production.
    await assert.rejects(() => recordCandidateDecision(invalidActor, { eventId, decision: "IGNORE" }));
    assert.equal((await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)))[0].discoveryStatus, "DISCOVERED", "EVENT_ROLLS_BACK_ON_AUDIT_FAILURE");
    assert.equal((await db.select().from(contentCandidateDecisions).where(eq(contentCandidateDecisions.eventId, eventId))).length, 0);
    const setEnabled = Reflect.get(sourceManagement, "setSourceManagementEnabled");
    await assert.rejects(() => setEnabled(sourceId, true, invalidActor), "SOURCE_WRITE_MUST_ROLL_BACK_IF_AUDIT_FAILS");
    assert.equal((await db.select().from(contentSources).where(eq(contentSources.id, sourceId)))[0].enabled, false);
    await setEnabled(sourceId, true, actor);
    const policyBefore = await readSourceAiRelevancePolicy();
    await assert.rejects(() => saveSourceAiRelevancePolicy([{ id: "p0", value: "P0_isolated_term", kind: "INCLUDE" }], invalidActor));
    assert.deepEqual(await readSourceAiRelevancePolicy(), policyBefore, "POLICY_AND_AUDIT_ATOMIC");
    const archive = Reflect.get(sourceManagement, "archiveOperatorSource");
    await assert.rejects(() => archive(sourceId, invalidActor));
    assert.equal((await db.select().from(contentSources).where(eq(contentSources.id, sourceId)))[0].status, "ACTIVE");
    await archive(sourceId, actor);
    const restore = Reflect.get(sourceManagement, "restoreOperatorSource");
    assert.equal(typeof restore, "function");
    await restore(sourceId, actor);
    const [restored] = await db.select().from(contentSources).where(eq(contentSources.id, sourceId));
    assert.equal(restored.status, "ACTIVE"); assert.equal(restored.enabled, false);
    assert.equal((restored.metadata as Record<string, unknown>).sentinel, "keep");
    assert.equal(((restored.metadata as Record<string, unknown>).runtimeQualification as Record<string, unknown>).effectiveQualification, "CONDITIONAL", "RESTORE_MUST_NOT_CREATE_PERMANENT_RUNTIME_DISABLED");
    await db.update(contentSources).set({ collectionConfig: { acquisition: { kind: "PUBLIC_JSON_API" } } }).where(eq(contentSources.id, sourceId));
    const qualified = await qualifyOnboardedSource(actor, sourceId);
    assert.notEqual(qualified.stage, "QUALIFIED", "NO_FALSE_QUALIFICATION");
    await recordCandidateDecision(actor, { eventId, decision: "IGNORE" });
    const child = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/accept-collection-operations.ts", "--read-event", eventId], { cwd: process.cwd(), env: process.env, encoding: "utf8", timeout: 30000 });
    assert.equal(child.status, 0, "INDEPENDENT_PROCESS_MUST_HIDE_IGNORED_EVENT");
    assert.ok(child.stdout.includes("CROSS_PROCESS_IGNORE_OVERLAY=PASS"));
    await Promise.all([recordCandidateDecision(actor, { eventId, decision: "WATCH" }), recordCandidateDecision(actor, { eventId, decision: "ADOPT" })]);
    const audit = await db.select().from(contentAuditRecords).where(inArray(contentAuditRecords.entityId, [eventId, sourceId]));
    assert.equal(audit.length, 7);
    assert.ok(audit.every((row) => row.actorId === actor.id && typeof (row.metadata as Record<string, unknown>).reason === "string"));
    const eventAudits = audit.filter((row) => row.entityId === eventId);
    assert.ok(eventAudits.some((row) => (row.before as Record<string, unknown>).discoveryStatus !== "DISCOVERED"), "CONCURRENT_DECISIONS_SERIALIZE_BEFORE_STATE");
    console.log("COLLECTION_OPERATIONS_REAL_DB_ATOMICITY_AUDIT_CONCURRENCY_RESTORE=PASS");
    const snapshot = await getRadarSnapshot();
    assert.equal(snapshot.schemaVersion, RADAR_SNAPSHOT_SCHEMA_VERSION);
    assert.ok(snapshot.freshness);
    assert.equal(snapshot.totalEventCount7d, snapshot.categoryCounts7d["全部"]);
    console.log("COLLECTION_OPERATIONS_REAL_SNAPSHOT=PASS");
  } finally {
    await db.delete(contentCandidateDecisions).where(eq(contentCandidateDecisions.eventId, eventId));
    await db.delete(contentAuditRecords).where(inArray(contentAuditRecords.entityId, [eventId, sourceId]));
    await db.delete(contentEvents).where(eq(contentEvents.id, eventId));
    await db.delete(contentSources).where(eq(contentSources.id, sourceId));
    await closeDatabase();
  }
}
main().catch(async (error) => { console.error("COLLECTION_OPERATIONS_DB_FAILED", { name: error?.name, code: error?.code, assertion: error?.operator, safeMessage: /^[A-Z0-9_: ]+$/.test(error?.message ?? "") ? error.message : "DETAIL_REDACTED", causeCode: error?.cause?.code }); await closeDatabase(); process.exitCode = 1; });
