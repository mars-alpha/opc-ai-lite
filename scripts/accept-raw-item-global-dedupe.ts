import { loadEnvConfig } from "@next/env";
import { and, eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  contentEventRawItems,
  contentRawItemObservations,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import {
  canonicalizeOriginalUrl,
  ingestRawItem
} from "../lib/server/content/discovery";

loadEnvConfig(process.cwd());

const SOURCE_A = "source_accept_global_dedupe_a";
const SOURCE_B = "source_accept_global_dedupe_b";
const TITLE = "Global URL Dedupe Acceptance Story";
const CANONICAL = "https://example.com/global-dedupe?id=42";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("RAW_ITEM_GLOBAL_DEDUPE_FAILED:" + code);
}

async function cleanup() {
  const db = getDatabase();
  const raws = await db
    .select({ id: contentRawItems.id })
    .from(contentRawItems)
    .where(eq(contentRawItems.title, TITLE));
  const rawIds = raws.map((item) => item.id);
  if (rawIds.length) {
    await db.delete(contentEventRawItems).where(inArray(contentEventRawItems.rawItemId, rawIds));
    await db.delete(contentRawItemObservations).where(inArray(contentRawItemObservations.rawItemId, rawIds));
    await db.delete(contentRawItems).where(inArray(contentRawItems.id, rawIds));
  }
  await db.delete(contentSources).where(inArray(contentSources.id, [SOURCE_A, SOURCE_B]));
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");

  const db = getDatabase();
  await cleanup();

  await db.insert(contentSources).values([
    {
      id: SOURCE_A,
      name: "Global Dedupe A",
      sourceType: "DISCOVERY",
      canonicalUrl: "https://example.com/a",
      providerRef: "GLOBAL_DEDUPE_A",
      status: "ACTIVE",
      platform: "WEB",
      collectionMethod: "HTTP",
      enabled: true,
      authorityScore: 60,
      topics: [],
      collectionConfig: {},
      signalConfig: {},
      metadata: { acceptance: true }
    },
    {
      id: SOURCE_B,
      name: "Global Dedupe B",
      sourceType: "DISCOVERY",
      canonicalUrl: "https://example.com/b",
      providerRef: "GLOBAL_DEDUPE_B",
      status: "ACTIVE",
      platform: "WEB",
      collectionMethod: "HTTP",
      enabled: true,
      authorityScore: 70,
      topics: [],
      collectionConfig: {},
      signalConfig: {},
      metadata: { acceptance: true }
    }
  ]);

  assert(
    canonicalizeOriginalUrl("https://EXAMPLE.com/global-dedupe/?id=42&utm_source=test#section") === CANONICAL,
    "CANONICALIZATION_MISMATCH"
  );

  const first = await ingestRawItem({
    sourceId: SOURCE_A,
    externalId: "a-1",
    originalUrl: "https://example.com/global-dedupe/?id=42&utm_source=alpha#top",
    title: TITLE,
    excerpt: "First observation",
    platformMetrics: { likes: 10 }
  });
  const second = await ingestRawItem({
    sourceId: SOURCE_B,
    externalId: "b-1",
    originalUrl: "https://example.com/global-dedupe?id=42&utm_medium=beta",
    title: TITLE,
    excerpt: "Second observation",
    platformMetrics: { likes: 20 }
  });

  assert(first.created === true, "FIRST_ITEM_NOT_CREATED");
  assert(second.created === false, "SECOND_ITEM_NOT_DEDUPED");
  assert(first.item.id === second.item.id, "RAW_ITEM_IDS_DIFFER");

  const [stored] = await db
    .select()
    .from(contentRawItems)
    .where(eq(contentRawItems.id, first.item.id))
    .limit(1);
  assert(stored?.canonicalUrl === CANONICAL, "CANONICAL_URL_NOT_STORED");

  const observations = await db
    .select()
    .from(contentRawItemObservations)
    .where(eq(contentRawItemObservations.rawItemId, first.item.id));
  assert(observations.length === 2, "OBSERVATION_COUNT_MISMATCH");
  assert(
    new Set(observations.map((item) => item.sourceId)).size === 2,
    "OBSERVATION_SOURCES_NOT_PRESERVED"
  );

  const duplicateRows = await db
    .select({ id: contentRawItems.id })
    .from(contentRawItems)
    .where(
      and(
        eq(contentRawItems.canonicalUrl, CANONICAL),
        eq(contentRawItems.title, TITLE)
      )
    );
  assert(duplicateRows.length === 1, "MULTIPLE_RAW_ITEMS_REMAIN");

  console.log("RAW_ITEM_GLOBAL_CANONICAL_DEDUPE=PASS");
  console.log("RAW_ITEM_SOURCE_OBSERVATIONS=PASS");
  console.log("RAW_ITEM_CANONICAL_NORMALIZATION=PASS");
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
