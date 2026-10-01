import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  contentAuditRecords,
  contentEvents,
  contentEventRawItems,
  contentItems,
  contentEvidence,
  contentRawItems,
  contentSources,
  users
} from "../lib/server/db/schema";
import { ensureContentDraftForEvent } from "../lib/server/content/adoption";
import { listEvidenceForContent } from "../lib/server/content/workbench";

loadEnvConfig(process.cwd());

const SOURCE_ID = "source_accept_direct_adopt";
const EVENT_FINGERPRINT = "accept-direct-adopt-event-v1";
const RAW_HASH = "accept-direct-adopt-raw-v1";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("OFFICIAL_CONTENT_DIRECT_ADOPT_FAILED:" + code);
}

async function cleanup() {
  const db = getDatabase();
  const events = await db.select({ id: contentEvents.id }).from(contentEvents).where(eq(contentEvents.fingerprint, EVENT_FINGERPRINT));
  const eventIds = events.map((item) => item.id);

  const contents = eventIds.length
    ? await db.select({ id: contentItems.id }).from(contentItems).where(inArray(contentItems.sourceRef, eventIds))
    : [];
  const evidence = await db.select({ id: contentEvidence.id }).from(contentEvidence).where(eq(contentEvidence.sourceId, SOURCE_ID));
  const auditIds = [...eventIds, ...contents.map((item) => item.id), ...evidence.map((item) => item.id)];

  if (auditIds.length) {
    await db.delete(contentAuditRecords).where(inArray(contentAuditRecords.entityId, auditIds));
  }
  if (eventIds.length) {
    await db.delete(contentItems).where(inArray(contentItems.sourceRef, eventIds));
    await db.delete(contentEvents).where(inArray(contentEvents.id, eventIds));
  }
  await db.delete(contentSources).where(eq(contentSources.id, SOURCE_ID));
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");

  const db = getDatabase();
  await cleanup();

  const [actor] = await db.select().from(users).limit(1);
  assert(actor, "ADMIN_USER_REQUIRED");

  await db.insert(contentSources).values({
    id: SOURCE_ID,
    name: "Direct Adopt Acceptance Source",
    sourceType: "DISCOVERY",
    canonicalUrl: "https://example.com/source",
    providerRef: "DIRECT_ADOPT_ACCEPTANCE",
    status: "ACTIVE",
    platform: "WEB",
    collectionMethod: "MANUAL",
    enabled: true,
    authorityScore: 80,
    topics: ["acceptance"],
    collectionConfig: {},
    signalConfig: {},
    metadata: { systemManaged: true, purpose: "DIRECT_ADOPT_ACCEPTANCE" }
  });

  const [raw] = await db.insert(contentRawItems).values({
    sourceId: SOURCE_ID,
    platform: "WEB",
    externalId: "direct-adopt-001",
    originalUrl: "https://example.com/direct-adopt",
    title: "Direct Adopt Acceptance Story",
    excerpt: "Acceptance fixture for direct adopt provenance.",
    contentHash: RAW_HASH,
    platformMetrics: {},
    metadata: { acceptance: true }
  }).returning();

  const [event] = await db.insert(contentEvents).values({
    fingerprint: EVENT_FINGERPRINT,
    title: "Direct Adopt Acceptance Story",
    summary: "Acceptance fixture summary.",
    keywords: ["acceptance"],
    entities: ["OPC"],
    discoveryStatus: "ADOPTED"
  }).returning();

  await db.insert(contentEventRawItems).values({
    eventId: event.id,
    rawItemId: raw.id,
    role: "SEED",
    clusterRuleVersion: "acceptance-v1",
    clusterReason: "ACCEPTANCE",
    clusterScore: 100,
    clusterMetadata: { acceptance: true }
  });

  const user = {
    id: actor.id,
    email: "direct-adopt-accept@opc.local",
    displayName: actor.displayName,
    role: actor.role
  };

  const created = await ensureContentDraftForEvent(user, event.id);
  assert(created.status === "DRAFT", "DRAFT_NOT_CREATED");
  assert(created.sourceType === "DISCOVERY_EVENT", "SOURCE_TYPE_MISMATCH");
  assert(created.sourceRef === event.id, "EVENT_PROVENANCE_MISSING");

  const linked = await listEvidenceForContent(created.id);
  assert(linked.length === 1, "AUTO_EVIDENCE_LINK_MISSING");
  assert(linked[0]?.source.id === SOURCE_ID, "AUTO_EVIDENCE_SOURCE_MISMATCH");
  assert(linked[0]?.evidence.originalUrl === raw.originalUrl, "AUTO_EVIDENCE_URL_MISMATCH");
  assert(linked[0]?.evidence.verificationStatus === "VERIFIED", "ADOPTED_SOURCE_MUST_BE_ACCEPTED");

  const second = await ensureContentDraftForEvent(user, event.id);
  const linkedAgain = await listEvidenceForContent(second.id);
  assert(second.id === created.id, "DIRECT_ADOPT_NOT_IDEMPOTENT");
  assert(linkedAgain.length === 1, "DIRECT_ADOPT_DUPLICATED_EVIDENCE");

  console.log("OFFICIAL_CONTENT_DIRECT_ADOPT_DRAFT=PASS");
  console.log("OFFICIAL_CONTENT_DIRECT_ADOPT_PROVENANCE=PASS");
  console.log("OFFICIAL_CONTENT_DIRECT_ADOPT_SOURCE_INHERITANCE=PASS");
  console.log("OFFICIAL_CONTENT_DIRECT_ADOPT_IDEMPOTENT=PASS");
}

main()
  .then(async () => {
    await cleanup();
    await closeDatabase();
  })
  .catch(async (error) => {
    try { await cleanup(); } catch {}
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
