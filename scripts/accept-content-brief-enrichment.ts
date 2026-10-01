import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  aiRuns,
  contentAuditRecords,
  contentEventClusters,
  contentEventRawItems,
  contentEvents,
  contentItems,
  contentRawItems,
  contentSources,
  users
} from "../lib/server/db/schema";
import { ensureContentDraftForEvent } from "../lib/server/content/adoption";
import { enrichContentBriefAfterAdoption } from "../lib/server/content/content-brief-enrichment";
import { runEventClustering } from "../lib/server/content/event-clustering";

loadEnvConfig(process.cwd());

const SOURCE_ID = "source_accept_brief_enrichment";
const EVENT_FINGERPRINT = "accept-content-brief-enrichment-v1";
const RAW_HASH = "accept-content-brief-enrichment-raw-v1";
let cleanupEventId: string | null = null;

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_BRIEF_ENRICHMENT_FAILED:" + code);
}

async function cleanup() {
  const db = getDatabase();
  const events = await db
    .select({ id: contentEvents.id })
    .from(contentEvents)
    .where(eq(contentEvents.fingerprint, EVENT_FINGERPRINT));
  const eventIds = [...new Set([...events.map((item) => item.id), ...(cleanupEventId ? [cleanupEventId] : [])])];

  const contents = eventIds.length
    ? await db.select({ id: contentItems.id }).from(contentItems).where(inArray(contentItems.sourceRef, eventIds))
    : [];
  const auditIds = [...eventIds, ...contents.map((item) => item.id)];
  if (auditIds.length) {
    await db.delete(contentAuditRecords).where(inArray(contentAuditRecords.entityId, auditIds));
  }

  const runs = await db
    .select({ id: aiRuns.id, contextIds: aiRuns.contextIds })
    .from(aiRuns)
    .where(eq(aiRuns.taskType, "CONTENT_BRIEF_ENRICHMENT"));
  const matchingRunIds = runs
    .filter((run) => {
      const contextIds = Array.isArray(run.contextIds)
        ? run.contextIds.filter((item): item is string => typeof item === "string")
        : [];
      return eventIds.some((eventId) => contextIds.includes(eventId));
    })
    .map((run) => run.id);
  if (matchingRunIds.length) {
    await db.delete(aiRuns).where(inArray(aiRuns.id, matchingRunIds));
  }

  if (eventIds.length) {
    await db.delete(contentItems).where(inArray(contentItems.sourceRef, eventIds));
    await db.delete(contentEventClusters).where(inArray(contentEventClusters.primaryEventId, eventIds));
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
    name: "Brief Enrichment Acceptance Source",
    sourceType: "DISCOVERY",
    canonicalUrl: "https://example.com/brief-source",
    providerRef: "BRIEF_ENRICHMENT_ACCEPTANCE",
    status: "ACTIVE",
    platform: "WEB",
    collectionMethod: "HTTP",
    enabled: true,
    authorityScore: 80,
    topics: ["AI"],
    collectionConfig: {},
    signalConfig: {},
    metadata: { acceptance: true }
  });

  const [raw] = await db.insert(contentRawItems).values({
    sourceId: SOURCE_ID,
    platform: "WEB",
    externalId: "brief-001",
    originalUrl: "https://example.com/brief-article",
    canonicalUrl: "https://example.com/brief-article",
    title: "AI Content Workflow Changes",
    excerpt: "A factual source about a new AI content workflow.",
    contentHash: RAW_HASH,
    platformMetrics: {},
    metadata: { acceptance: true }
  }).returning();

  const [event] = await db.insert(contentEvents).values({
    fingerprint: EVENT_FINGERPRINT,
    title: "AI Content Workflow Changes",
    summary: "Initial event summary.",
    keywords: ["AI", "内容工作流"],
    entities: ["AI"],
    discoveryStatus: "ADOPTED"
  }).returning();
  cleanupEventId = event.id;

  await db.insert(contentEventRawItems).values({
    eventId: event.id,
    rawItemId: raw.id,
    role: "SEED",
    clusterRuleVersion: "acceptance-v1",
    clusterReason: "ACCEPTANCE",
    clusterScore: 100,
    clusterMetadata: { acceptance: true }
  });
  await runEventClustering(event.id);

  const user = {
    id: actor.id,
    email: "brief-enrichment-accept@opc.local",
    displayName: actor.displayName,
    role: actor.role
  };

  const created = await ensureContentDraftForEvent(user, event.id);
  const result = await enrichContentBriefAfterAdoption(user, event.id, created.id, {
    modelConfig: {
      baseUrl: "https://example.invalid/v1",
      apiKey: "test-only",
      model: "test-model",
      provider: "TEST"
    },
    callModel: async () => ({
      config: {
        baseUrl: "https://example.invalid/v1",
        apiKey: "test-only",
        model: "test-model",
        provider: "TEST"
      },
      data: {
        coreViewpoint: "AI 内容工作流的价值在于把同一选题稳定拆成多个平台输出，而不是重复改写。",
        audience: "使用 AI 做内容生产的个人创作者与小团队",
        purpose: "分析并解释更稳定的内容工作流",
        tags: ["AI", "内容工作流", "内容生产"]
      }
    })
  });

  assert(result.status === "SUCCEEDED", "ENRICHMENT_NOT_SUCCEEDED");

  const [updated] = await db.select().from(contentItems).where(eq(contentItems.id, created.id)).limit(1);
  assert(updated?.summary.includes("多个平台输出"), "CORE_VIEWPOINT_NOT_UPDATED");
  assert(updated?.audience === "使用 AI 做内容生产的个人创作者与小团队", "AUDIENCE_NOT_UPDATED");
  assert(updated?.purpose === "分析并解释更稳定的内容工作流", "PURPOSE_NOT_UPDATED");
  assert(Array.isArray(updated?.tags) && updated.tags.includes("内容工作流"), "TAGS_NOT_UPDATED");
  assert(updated?.status === "DRAFT", "CONTENT_STATUS_CHANGED_BY_AI");
  assert(updated?.version === 1, "CONTENT_VERSION_CHANGED_BY_AI");

  const [eventAfter] = await db.select().from(contentEvents).where(eq(contentEvents.id, event.id)).limit(1);
  assert(eventAfter?.discoveryStatus === "ADOPTED", "EVENT_DECISION_CHANGED_BY_AI");
  assert(updated?.publishedAt === null, "AI_PUBLISHED_CONTENT");

  console.log("CONTENT_BRIEF_AI_ENRICHMENT=PASS");
  console.log("CONTENT_BRIEF_AI_BUSINESS_STATE_BOUNDARY=PASS");
  console.log("CONTENT_BRIEF_AI_NO_PUBLISH=PASS");
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
