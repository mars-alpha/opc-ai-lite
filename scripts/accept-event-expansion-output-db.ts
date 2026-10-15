import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventExpansionEvidence,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { createEventSeed, ingestRawItem } from "../lib/server/content/discovery";
import { getEventExpansionDailyOutput } from "../lib/server/content/event-expansion-output";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_EXPANSION_OUTPUT_DB_ACCEPT_FAILED:" + code);
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_REQUIRED"
  );

  const db = getDatabase();
  const marker = String(process.pid);
  const factSourceId = "source_output_014_fact_" + marker;
  const expansionSourceId = "source_output_014_expansion_" + marker;
  const factExternalId = "output-014-fact-" + marker;
  const expansionExternalId = "output-014-expansion-" + marker;
  let eventId = "";
  const rawIds: string[] = [];

  async function cleanup() {
    if (eventId) {
      await db.delete(contentEvents).where(eq(contentEvents.id, eventId));
    }
    if (rawIds.length) {
      await db.delete(contentRawItems).where(inArray(contentRawItems.id, rawIds));
    }
    await db
      .delete(contentSources)
      .where(inArray(contentSources.id, [factSourceId, expansionSourceId]));
  }

  await cleanup();

  try {
    await db.insert(contentSources).values([
      {
        id: factSourceId,
        name: "Output 014 Official Fixture",
        sourceType: "OFFICIAL",
        status: "ACTIVE",
        platform: "WEB",
        collectionMethod: "MANUAL",
        enabled: true,
        authorityScore: 95,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      },
      {
        id: expansionSourceId,
        name: "Output 014 Tutorial Fixture",
        sourceType: "SIGNAL",
        status: "ACTIVE",
        platform: "BILIBILI",
        collectionMethod: "MANUAL",
        enabled: true,
        authorityScore: 55,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: { signalOnly: true },
        metadata: { acceptance: true, mediaPolicy: "REFERENCE_ONLY" }
      }
    ]);

    const factRaw = await ingestRawItem({
      sourceId: factSourceId,
      externalId: factExternalId,
      originalUrl: "https://example.com/" + factExternalId,
      title: "OPC Output 014 正式发布新功能",
      excerpt: "官方说明 OPC Output 014 新功能已经发布。",
      publishedAt: new Date().toISOString()
    });
    rawIds.push(factRaw.item.id);

    const seed = await createEventSeed({
      rawItemId: factRaw.item.id,
      title: factRaw.item.title,
      summary: factRaw.item.excerpt,
      entities: ["OPC Output 014"],
      keywords: ["Output 014", "新功能"]
    });
    eventId = seed.item.id;

    const expansionRaw = await ingestRawItem({
      sourceId: expansionSourceId,
      externalId: expansionExternalId,
      originalUrl: "https://www.bilibili.com/video/" + expansionExternalId,
      title: "OPC Output 014 新功能使用教程",
      excerpt: "逐步演示如何使用 OPC Output 014 新功能。",
      publishedAt: new Date().toISOString(),
      metadata: {
        collectionPurpose: "EVENT_EXPANSION",
        mediaPolicy: "REFERENCE_ONLY",
        factualSource: false,
        referenceOnly: true
      }
    });
    rawIds.push(expansionRaw.item.id);

    await db.insert(contentEventExpansionEvidence).values({
      eventId,
      rawItemId: expansionRaw.item.id,
      expansionType: "TUTORIAL",
      mediaType: "VIDEO",
      language: "ZH",
      relevanceScore: 92,
      valueScore: 96,
      rankScore: 94,
      shadowSignalScore: 0,
      metadata: {
        formalFactAuthorityChanged: false,
        formalHotspotPromotion: false,
        referenceOnly: true
      }
    });

    const output = await getEventExpansionDailyOutput(eventId);
    const factSection = output.sections.find((section) => section.key === "WHAT_HAPPENED");
    const learnSection = output.sections.find((section) => section.key === "HOW_TO_LEARN");

    assert(factSection?.items[0]?.rawItemId === factRaw.item.id, "FACT_DB_MAPPING");
    assert(factSection.items[0]?.authority === "FACT", "FACT_DB_AUTHORITY");
    assert(learnSection?.items[0]?.rawItemId === expansionRaw.item.id, "EXPANSION_DB_MAPPING");
    assert(learnSection.items[0]?.authority === "REFERENCE_ONLY", "EXPANSION_DB_REFERENCE_ONLY");
    assert(learnSection.items[0]?.expansionType === "TUTORIAL", "EXPANSION_DB_TYPE");
    assert(output.missingSectionKeys.includes("HOW_TO_EXPERIENCE"), "EMPTY_SECTION_PRESERVED");

    console.log("EVENT_EXPANSION_OUTPUT_014_DB_LOAD=PASS");
    console.log("EVENT_EXPANSION_OUTPUT_014_DB_FACT_BOUNDARY=PASS");
    console.log("EVENT_EXPANSION_OUTPUT_014_DB_REFERENCE_ONLY=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch(async (error) => {
  console.error(error);
  await closeDatabase().catch(() => {});
  process.exit(1);
});
