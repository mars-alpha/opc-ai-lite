import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  contentCollectionRuns,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources,
  users
} from "../lib/server/db/schema";
import { runSourceCollection } from "../lib/server/content/collection-runner";

loadEnvConfig(process.cwd());

const SOURCE_ID = "source_accept_ai_discovery_filter";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_AI_DISCOVERY_FILTER_ACCEPT_FAILED:" + code);
}

async function cleanup() {
  const db = getDatabase();
  const raws = await db
    .select({ id: contentRawItems.id })
    .from(contentRawItems)
    .where(eq(contentRawItems.sourceId, SOURCE_ID));
  const rawIds = raws.map((item) => item.id);
  if (rawIds.length) {
    const links = await db
      .select({ eventId: contentEventRawItems.eventId })
      .from(contentEventRawItems)
      .where(inArray(contentEventRawItems.rawItemId, rawIds));
    const eventIds = [...new Set(links.map((item) => item.eventId))];
    if (eventIds.length) await db.delete(contentEvents).where(inArray(contentEvents.id, eventIds));
  }
  await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId, SOURCE_ID));
  await db.delete(contentSources).where(eq(contentSources.id, SOURCE_ID));
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_REQUIRED"
  );
  const db = getDatabase();
  await cleanup();

  const [actor] = await db.select().from(users).limit(1);
  assert(actor, "ACTOR_REQUIRED");
  const user = {
    id: actor.id,
    email: "ai-discovery-filter-accept@opc.local",
    displayName: actor.displayName,
    role: actor.role
  };

  await db.insert(contentSources).values({
    id: SOURCE_ID,
    name: "AI Discovery Filter Acceptance RSS",
    sourceType: "DISCOVERY",
    canonicalUrl: "https://example.invalid/filter-feed.xml",
    providerRef: "AI_DISCOVERY_FILTER_ACCEPT",
    status: "ACTIVE",
    platform: "WEB",
    collectionMethod: "RSS",
    enabled: true,
    authorityScore: 70,
    topics: ["AI", "行业影响"],
    collectionConfig: { windowHours: 72 },
    metadata: { acceptance: true, mediaPolicy: "REFERENCE_ONLY" }
  });

  const now = new Date();
  const old = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const recent = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const run = await runSourceCollection(
    user,
    SOURCE_ID,
    {},
    async () => [
      {
        externalId: "accept-ai-model",
        originalUrl: "https://example.com/accept-ai-model",
        title: "OpenAI releases a new multimodal AI model and API",
        excerpt: "The release adds new model capabilities for developers.",
        publishedAt: recent,
        metadata: { collector: "feed", acceptance: true }
      },
      {
        externalId: "accept-retail-context",
        originalUrl: "https://example.com/accept-retail-context",
        title: "Acme Retail customer service transformation rollout",
        excerpt: "Acme Retail is changing how its support teams handle routine customer service cases.",
        publishedAt: recent,
        metadata: { collector: "feed", acceptance: true }
      },
      {
        externalId: "accept-retail-ai",
        originalUrl: "https://example.com/accept-retail-ai",
        title: "Acme Retail customer service transformation uses AI agents",
        excerpt: "The rollout deploys AI agents to automate part of the customer service workflow.",
        publishedAt: recent,
        metadata: { collector: "feed", acceptance: true }
      },
      {
        externalId: "accept-unrelated-sales",
        originalUrl: "https://example.com/accept-unrelated-sales",
        title: "Automaker reports record quarterly vehicle sales",
        excerpt: "Sales rose across multiple regional markets.",
        publishedAt: recent,
        metadata: { collector: "feed", acceptance: true }
      },
      {
        externalId: "accept-old-ai",
        originalUrl: "https://example.com/accept-old-ai",
        title: "Anthropic releases an AI model update",
        excerpt: "This item is intentionally outside the active window.",
        publishedAt: old,
        metadata: { collector: "feed", acceptance: true }
      },
      {
        externalId: "accept-manus-funding",
        originalUrl: "https://example.com/accept-manus-funding",
        title: "Manus raises over $500M in a new funding round",
        excerpt: "Boyu Capital and IDG Capital led the round alongside existing shareholders.",
        publishedAt: recent,
        metadata: { collector: "feed", acceptance: true }
      },
      {
        externalId: "accept-manus-profile",
        originalUrl: "https://example.com/accept-manus-profile",
        title: "Inside Manus company culture",
        excerpt: "A profile of the company's office routines and team traditions.",
        publishedAt: recent,
        metadata: { collector: "feed", acceptance: true }
      },
      {
        externalId: "accept-meta-funding",
        originalUrl: "https://example.com/accept-meta-funding",
        title: "Meta raises new corporate financing",
        excerpt: "The company completed a general corporate financing transaction.",
        publishedAt: recent,
        metadata: { collector: "feed", acceptance: true }
      }
    ]
  );

  const raws = await db
    .select()
    .from(contentRawItems)
    .where(eq(contentRawItems.sourceId, SOURCE_ID));
  assert(raws.some((item) => item.externalId === "accept-ai-model"), "CORE_AI_NOT_STORED");
  assert(!raws.some((item) => item.externalId === "accept-retail-context"), "NON_AI_SIGNAL_CONTEXT_STORED");
  assert(raws.some((item) => item.externalId === "accept-retail-ai"), "AI_WORKFLOW_NOT_STORED");
  assert(!raws.some((item) => item.externalId === "accept-unrelated-sales"), "UNRELATED_SIGNAL_CONTENT_STORED");
  assert(!raws.some((item) => item.externalId === "accept-old-ai"), "STALE_AI_STORED");
  assert(raws.some((item) => item.externalId === "accept-manus-funding"), "STRONG_AI_ENTITY_EVENT_NOT_STORED");
  assert(!raws.some((item) => item.externalId === "accept-manus-profile"), "ENTITY_WITHOUT_EVENT_STORED");
  assert(!raws.some((item) => item.externalId === "accept-meta-funding"), "WEAK_ENTITY_EVENT_STORED");

  const metadata = run.metadata as Record<string, unknown>;
  const filter = metadata.discoveryFilter as Record<string, unknown> | undefined;
  assert(filter?.version === "ai-discovery-filter-v2", "FILTER_AUDIT_MISSING");
  assert(Number(filter?.received) === 8, "FILTER_RECEIVED_COUNT_WRONG");
  assert(Number(filter?.kept) === 7, "FILTER_KEPT_COUNT_WRONG");
  assert(Number(filter?.dropped) === 1, "FILTER_DROPPED_COUNT_WRONG");

  const rejectedCapture = metadata.rejectedSampleCapture as Record<string, unknown> | undefined;
  assert(rejectedCapture?.version === "ai-rejected-sample-capture-v1", "REJECTED_SAMPLE_CAPTURE_VERSION_MISSING");
  assert(Number(rejectedCapture?.totalRejected) === 5, "REJECTED_SAMPLE_TOTAL_WRONG");
  assert(Number(rejectedCapture?.captured) === 5, "REJECTED_SAMPLE_CAPTURED_WRONG");
  assert(rejectedCapture?.truncated === false, "REJECTED_SAMPLE_UNEXPECTED_TRUNCATION");
  const rejectedSamples = Array.isArray(rejectedCapture?.samples)
    ? rejectedCapture.samples as Array<Record<string, unknown>>
    : [];
  assert(rejectedSamples.length === 5, "REJECTED_SAMPLE_ROWS_WRONG");
  assert(
    rejectedSamples.some((item) => item.stage === "DISCOVERY_FILTER" && item.reason === "OUTSIDE_TIME_WINDOW"),
    "DISCOVERY_FILTER_REJECT_NOT_CAPTURED"
  );
  assert(
    rejectedSamples.filter((item) => item.stage === "SOURCE_POLICY" && item.reason === "SIGNAL_WITHOUT_AI_RELATION").length === 4,
    "SOURCE_POLICY_REJECTS_NOT_CAPTURED"
  );
  assert(
    rejectedSamples.every((item) => typeof item.title === "string" && typeof item.sourceId === "string"),
    "REJECTED_SAMPLE_AUDIT_FIELDS_MISSING"
  );
  assert(
    rejectedSamples.every((item) => item.metadataSnapshot && typeof item.metadataSnapshot === "object" && !Array.isArray(item.metadataSnapshot)),
    "REJECTED_SAMPLE_METADATA_SNAPSHOT_MISSING"
  );

  const manusRaw = raws.find((item) => item.externalId === "accept-manus-funding");
  if (!manusRaw) throw new Error("CONTENT_AI_DISCOVERY_FILTER_ACCEPT_FAILED:MANUS_RAW_MISSING");
  const manusMetadata = (manusRaw.metadata ?? {}) as Record<string, unknown>;
  const manusFilter = (manusMetadata.discoveryFilter ?? {}) as Record<string, unknown>;
  const manusEntityContext = (manusFilter.entityContext ?? {}) as Record<string, unknown>;
  assert(manusFilter.reason === "ENTITY_EVENT_CANDIDATE", "ENTITY_EVENT_REASON_MISSING");
  assert(manusFilter.relationType === "CORE_AI", "ENTITY_EVENT_RELATION_WRONG");
  assert(
    Array.isArray(manusEntityContext.matchedEntityIds) && manusEntityContext.matchedEntityIds.includes("company_manus"),
    "MANUS_ENTITY_CONTEXT_MISSING"
  );
  assert(manusEntityContext.promotedByEntityEvent === true, "ENTITY_EVENT_PROMOTION_AUDIT_MISSING");

  const relevanceGate = metadata.eventRelevanceGate as Record<string, unknown> | undefined;
  assert(relevanceGate?.version === "event-relevance-gate-v1", "EVENT_RELEVANCE_GATE_AUDIT_MISSING");
  assert(Number(relevanceGate?.evaluatedEvents) >= 2, "EVENT_RELEVANCE_GATE_NOT_EVALUATED");

  const aiRaw = raws.find((item) => item.externalId === "accept-retail-ai");
  if (!aiRaw) throw new Error("CONTENT_AI_DISCOVERY_FILTER_ACCEPT_FAILED:AI_SIGNAL_RAW_MISSING");
  const [aiEventLink] = await db.select().from(contentEventRawItems)
    .where(eq(contentEventRawItems.rawItemId, aiRaw.id)).limit(1);
  assert(Boolean(aiEventLink), "AI_SIGNAL_EVENT_LINK_MISSING");
  const [aiEvent] = await db.select().from(contentEvents)
    .where(eq(contentEvents.id, aiEventLink.eventId)).limit(1);
  assert(aiEvent?.relevanceScore === 100, "AI_SIGNAL_EVENT_RELEVANCE_NOT_CONFIRMED");
  const aiEventPolicy = (aiEvent?.metadata ?? {}) as Record<string, unknown>;
  const policy = (aiEventPolicy.eventPolicy ?? {}) as Record<string, unknown>;
  assert(policy.hotspotEligible !== true, "SINGLE_SIGNAL_EVENT_PROMOTED_TO_HOTSPOT");

  console.log("CONTENT_AI_DISCOVERY_FILTER_COLLECTION_PATH=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_SIGNAL_NOISE_DROPPED=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_AI_CONTEXT_RETAINED=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_ENTITY_EVENT_CONTEXT=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_ENTITY_EVENT_GUARDRAILS=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_EVENT_RELEVANCE_GATE=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_AUDIT_METADATA=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_REJECTED_SAMPLE_CAPTURE=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_REJECTED_METADATA_SNAPSHOT=PASS");
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
