import { loadEnvConfig } from "@next/env";
import { and, eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentCollectionRuns,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import {
  assertPublicHttpUrl,
  parseFeedDocument,
  parseHtmlDocument,
  runSourceCollection
} from "../lib/server/content/collection-runner";
import {
  collectSearchDiscovery,
  resolveSearchDiscoveryConfig
} from "../lib/server/content/search-discovery";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_RUNNER_ACCEPT_FAILED:" + code);
}

const HTML_FIXTURE = `<!doctype html>
<html>
<head>
  <title>OPC Collector Test Article</title>
  <meta name="description" content="A deterministic page fixture for collection acceptance." />
  <meta name="author" content="OPC Test" />
  <meta property="article:published_time" content="2026-09-30T09:00:00+08:00" />
  <link rel="canonical" href="https://example.com/test-article" />
</head>
<body><p>Test article body.</p></body>
</html>`;

const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>OPC Test Feed</title>
  <item>
    <guid>opc-test-001</guid>
    <title>AI Agent Test Event</title>
    <link>https://example.com/ai-agent-test</link>
    <author>OPC Test</author>
    <pubDate>Tue, 30 Sep 2026 01:00:00 GMT</pubDate>
    <description><![CDATA[Agent capability fixture for deterministic collection testing.]]></description>
  </item>
  <item>
    <guid>opc-test-002</guid>
    <title>AI Workflow Test Event</title>
    <link>https://example.com/ai-workflow-test</link>
    <pubDate>Tue, 30 Sep 2026 02:00:00 GMT</pubDate>
    <description>Workflow fixture.</description>
  </item>
</channel>
</rss>`;

async function main() {
  const db = getDatabase();
  const sourceId = `source_accept_collection_runner_${process.pid}`;
  const user = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "collection-runner-accept@opc.local",
    displayName: "Acceptance",
    role: "ADMIN" as const
  };

  async function cleanup() {
    const raw = await db
      .select({ id: contentRawItems.id })
      .from(contentRawItems)
      .where(eq(contentRawItems.sourceId, sourceId));
    const links = raw.length
      ? await db
          .select({ eventId: contentEventRawItems.eventId })
          .from(contentEventRawItems)
          .where(inArray(contentEventRawItems.rawItemId, raw.map((item) => item.id)))
      : [];
    await db.delete(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId, sourceId));
    await db.delete(contentSources).where(eq(contentSources.id, sourceId));
    const eventIds = [...new Set(links.map((item) => item.eventId))];
    if (eventIds.length) await db.delete(contentEvents).where(inArray(contentEvents.id, eventIds));
  }

  await cleanup();

  try {
    let privateBlocked = false;
    try {
      await assertPublicHttpUrl("http://127.0.0.1:3000/");
    } catch (error) {
      privateBlocked = error instanceof Error && error.message === "COLLECTION_URL_PRIVATE_BLOCKED";
    }
    assert(privateBlocked, "PRIVATE_URL_NOT_BLOCKED");

    const manual = parseHtmlDocument(HTML_FIXTURE, "https://example.com/manual");
    assert(manual.length === 1 && manual[0]?.title === "OPC Collector Test Article", "MANUAL_PARSE_FAILED");
    assert(manual[0]?.originalUrl === "https://example.com/test-article", "MANUAL_CANONICAL_FAILED");

    const http = parseHtmlDocument(HTML_FIXTURE, "https://example.com/http", { collector: "http" });
    assert(http.length === 1 && Boolean(http[0]?.excerpt), "HTTP_PARSE_FAILED");

    const rss = parseFeedDocument(RSS_FIXTURE, "https://example.com/feed.xml");
    assert(rss.length === 2, "RSS_PARSE_FAILED");
    assert(rss[0]?.externalId === "opc-test-001", "RSS_EXTERNAL_ID_MISSING");

    const searchConfig = resolveSearchDiscoveryConfig({
      provider: "HN_ALGOLIA",
      searchQuery: "OpenAI OR Anthropic",
      windowHours: 24,
      resultLimit: 10
    });
    const search = await collectSearchDiscovery(searchConfig, async () => ({
      hits: [
        {
          objectID: "search-recent",
          title: "Recent Search Result",
          url: "https://example.com/search-recent",
          story_text: "Recent AI result.",
          author: "opc-test",
          created_at: new Date().toISOString(),
          points: 12,
          num_comments: 3
        },
        {
          objectID: "search-old",
          title: "Old Search Result",
          url: "https://example.com/search-old",
          story_text: "Old AI result.",
          author: "opc-test",
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          points: 4,
          num_comments: 1
        }
      ]
    }));
    assert(search.requestUrl.startsWith("https://hn.algolia.com/api/v1/search_by_date?"), "SEARCH_REQUEST_URL_INVALID");
    assert(search.items.length === 1, "SEARCH_WINDOW_FILTER_FAILED");
    assert(search.items[0]?.metadata?.searchProvider === "HN_ALGOLIA", "SEARCH_PROVIDER_METADATA_MISSING");

    await db.insert(contentSources).values({
      id: sourceId,
      name: "Collection Runner Acceptance RSS",
      sourceType: "DISCOVERY",
      canonicalUrl: "https://example.com/feed.xml",
      status: "ACTIVE",
      platform: "RSS",
      collectionMethod: "RSS",
      enabled: true,
      authorityScore: 80,
      topics: ["acceptance"],
      collectionConfig: {},
      signalConfig: {},
      metadata: { acceptance: true }
    });

    const collectorOverride = async () => parseFeedDocument(RSS_FIXTURE, "https://example.com/feed.xml");

    const first = await runSourceCollection(user, sourceId, {}, collectorOverride);
    assert(first.status === "SUCCEEDED", "FIRST_RUN_FAILED");
    assert(first.receivedCount === 2, "FIRST_RUN_COUNT_WRONG");
    assert(first.createdCount === 2, "FIRST_RUN_CREATED_WRONG");

    const second = await runSourceCollection(user, sourceId, {}, collectorOverride);
    assert(second.status === "SUCCEEDED", "SECOND_RUN_FAILED");
    assert(second.createdCount === 0, "RERUN_CREATED_DUPLICATES");
    assert(second.duplicateCount === 2, "RERUN_DEDUPE_MISSING");

    await db.update(contentSources).set({
      platform: "SEARCH",
      collectionMethod: "SEARCH",
      canonicalUrl: null,
      collectionConfig: {
        provider: "HN_ALGOLIA",
        searchQuery: "OpenAI OR Anthropic",
        windowHours: 24,
        resultLimit: 10
      },
      updatedAt: new Date()
    }).where(eq(contentSources.id, sourceId));

    const searchRun = await runSourceCollection(user, sourceId, {}, async (method, requestedUrl) => {
      assert(method === "SEARCH", "SEARCH_METHOD_NOT_USED");
      assert(requestedUrl.startsWith("https://hn.algolia.com/api/v1/search_by_date?"), "SEARCH_RUN_URL_INVALID");
      return search.items;
    });
    assert(searchRun.status === "SUCCEEDED", "SEARCH_RUN_FAILED");
    assert(searchRun.createdCount === 1, "SEARCH_RUN_CREATED_WRONG");

    const raw = await db
      .select({ id: contentRawItems.id })
      .from(contentRawItems)
      .where(eq(contentRawItems.sourceId, sourceId));
    assert(raw.length === 3, "RAW_ITEMS_NOT_WRITTEN");
    const links = await db
      .select({ eventId: contentEventRawItems.eventId })
      .from(contentEventRawItems)
      .where(inArray(contentEventRawItems.rawItemId, raw.map((item) => item.id)));
    assert(links.length === 3, "EVENT_SEEDS_NOT_CREATED");

    let failed = false;
    try {
      await runSourceCollection(user, sourceId, {}, async () => {
        throw new Error("COLLECTION_HTTP_503");
      });
    } catch {
      failed = true;
    }
    assert(failed, "FAILED_RUN_DID_NOT_THROW");
    const failedRuns = await db
      .select()
      .from(contentCollectionRuns)
      .where(
        and(
          eq(contentCollectionRuns.sourceId, sourceId),
          eq(contentCollectionRuns.status, "FAILED")
        )
      );
    assert(failedRuns.some((run) => run.errorCode === "COLLECTION_HTTP_503"), "FAILED_RUN_NOT_RECORDED");

    console.log("COLLECTION_RUNNER_MANUAL_PARSE=PASS");
    console.log("COLLECTION_RUNNER_HTTP_PARSE=PASS");
    console.log("COLLECTION_RUNNER_RSS_PARSE=PASS");
    console.log("COLLECTION_RUNNER_SEARCH_DISCOVERY=PASS");
    console.log("COLLECTION_RUNNER_RERUN_DEDUPE=PASS");
    console.log("COLLECTION_RUNNER_EVENT_SEED=PASS");
    console.log("COLLECTION_RUNNER_FAILURE_TRACE=PASS");
    console.log("COLLECTION_RUNNER_SSRF=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
