import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentAuditRecords, contentCollectionQualityLabels, contentEventRawItems, contentEvents, contentRawItems, contentSources, users } from "../lib/server/db/schema";
import { listEventQualityFeedback, recordCollectionQualityFeedback, sourceQualitySummary } from "../lib/server/content/collection-quality-feedback";
import type { AuthUser } from "../lib/server/auth/service";

loadEnvConfig(process.cwd());

async function main() {
  assert.equal(assertCurrentDatabaseTarget().environment, "development", "DEVELOPMENT_ONLY");
  const db = getDatabase();
  const eventId = randomUUID();
  const sourceId = "source_quality_accept_" + randomUUID().replaceAll("-", "");
  const otherSourceId = "source_quality_accept_" + randomUUID().replaceAll("-", "");
  const [admin] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1);
  console.log("QUALITY_DB_ADMIN_READ=PASS");
  assert.ok(admin, "ADMIN_REQUIRED");
  const actor: AuthUser = { id: admin.id, email: "quality-acceptance@example.invalid", displayName: null, role: "ADMIN" };
  try {
    await db.insert(contentSources).values([
      { id: sourceId, name: "Quality acceptance", sourceType: "OFFICIAL", enabled: false },
      { id: otherSourceId, name: "Unrelated acceptance", sourceType: "OFFICIAL", enabled: false }
    ]);
    await db.insert(contentEvents).values({ id: eventId, fingerprint: eventId, title: "Quality feedback acceptance" });
    const [raw] = await db.insert(contentRawItems).values({ sourceId, platform: "WEB", title: "Quality feedback source", contentHash: randomUUID(), originalUrl: "https://example.com/quality" }).returning();
    await db.insert(contentEventRawItems).values({ eventId, rawItemId: raw.id });
    console.log("QUALITY_DB_FIXTURE_READY=PASS");
    const submit = (label: "POSITIVE" | "NEGATIVE" | "CLEAR", source: string | null, requestId = randomUUID(), reason: string | null = null) =>
      recordCollectionQualityFeedback(actor, eventId, { label, sourceId: source, requestId, reason });
    await assert.rejects(() => submit("NEGATIVE", otherSourceId), /QUALITY_SOURCE_NOT_ASSOCIATED/);
    assert.equal((await sourceQualitySummary(sourceId)).evaluatedCount, 0);
    const eventOnly = await submit("NEGATIVE", null, randomUUID(), "IRRELEVANT");
    console.log("QUALITY_DB_EVENT_LABEL=PASS");
    assert.equal(eventOnly.changed, true);
    assert.equal((await sourceQualitySummary(sourceId)).evaluatedCount, 0, "EVENT_LEVEL_NOT_ATTRIBUTED_TO_SOURCE");
    const requestId = randomUUID();
    const positive = await submit("POSITIVE", sourceId, requestId);
    assert.equal(positive.changed, true);
    assert.equal((await submit("POSITIVE", sourceId, requestId)).changed, false, "RETRY_IDEMPOTENT");
    await assert.rejects(() => submit("NEGATIVE", sourceId, requestId), /QUALITY_REQUEST_CONFLICT/);
    assert.equal((await submit("POSITIVE", sourceId)).changed, false, "SAME_LABEL_NO_NEW_SAMPLE");
    const negative = await submit("NEGATIVE", sourceId, randomUUID(), "INCOMPLETE_BODY");
    console.log("QUALITY_DB_SOURCE_LABEL=PASS");
    assert.equal(negative.changed, true);
    assert.equal((await sourceQualitySummary(sourceId)).negativeCount, 1);
    const history = await db.select().from(contentCollectionQualityLabels).where(eq(contentCollectionQualityLabels.eventId, eventId));
    assert.equal(history.length, 3, "ONLY_EFFECTIVE_OPERATIONS_APPENDED");
    const context = history.find(row => row.sourceId === sourceId)?.sampleContext as Record<string, unknown>;
    assert.equal(context.rawItemId, raw.id);
    assert.equal(context.runId, null, "UNKNOWN_RUN_MUST_NOT_BE_GUESSED");
    await submit("CLEAR", sourceId);
    assert.equal((await sourceQualitySummary(sourceId)).evaluatedCount, 0);
    const current = await listEventQualityFeedback([eventId]);
    assert.equal(current[eventId].eventLabel, "NEGATIVE");
    assert.equal(current[eventId].sources.length, 0);
    const [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId));
    assert.equal(event.discoveryStatus, "DISCOVERED", "FEEDBACK_MUST_NOT_CHANGE_EVENT_STATE");
    const audits = await db.select().from(contentAuditRecords).where(eq(contentAuditRecords.entityId, eventId));
    assert.equal(audits.filter(row => row.action === "COLLECTION_QUALITY_LABEL_RECORDED").length, 4);
    console.log("COLLECTION_QUALITY_FEEDBACK_DB=PASS");
  } finally {
    await db.delete(contentAuditRecords).where(eq(contentAuditRecords.entityId, eventId));
    await db.delete(contentCollectionQualityLabels).where(eq(contentCollectionQualityLabels.eventId, eventId));
    await db.delete(contentEventRawItems).where(eq(contentEventRawItems.eventId, eventId));
    await db.delete(contentRawItems).where(eq(contentRawItems.sourceId, sourceId));
    await db.delete(contentEvents).where(eq(contentEvents.id, eventId));
    await db.delete(contentSources).where(inArray(contentSources.id, [sourceId, otherSourceId]));
    await closeDatabase();
  }
}
main().catch(async error => { console.error("COLLECTION_QUALITY_FEEDBACK_DB_FAILED", error instanceof Error ? error.message : "UNKNOWN"); await closeDatabase(); process.exitCode = 1; });
