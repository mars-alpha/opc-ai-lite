import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEvents,
  contentEventRawItems,
  contentExpansionRuns,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import { createEventSeed, ingestRawItem } from "../lib/server/content/discovery";
import { runEventExpansion } from "../lib/server/content/collection-expansion";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_EXPANSION_ACCEPT_FAILED:" + code);
}

async function main() {
  const db = getDatabase();
  const marker = String(process.pid);
  const seedSource = `source_expansion_accept_seed_${marker}`;
  const seedExternalId = `expansion-seed-${marker}`;
  const hnExternalId = `hn:expansion-${marker}`;
  const githubExternalId = `github:expansion-${marker}`;
  const user = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "expansion-accept@opc.local",
    displayName: "Expansion Acceptance",
    role: "ADMIN" as const
  };

  let eventId = "";

  async function cleanup() {
    const raws = await db
      .select({ id: contentRawItems.id })
      .from(contentRawItems)
      .where(inArray(contentRawItems.externalId, [seedExternalId, hnExternalId, githubExternalId]));

    const linkedEvents = raws.length
      ? await db
          .select({ eventId: contentEventRawItems.eventId })
          .from(contentEventRawItems)
          .where(inArray(contentEventRawItems.rawItemId, raws.map((item) => item.id)))
      : [];
    const testEventIds = [...new Set([
      ...(eventId ? [eventId] : []),
      ...linkedEvents.map((item) => item.eventId)
    ])];

    if (eventId) {
      await db.delete(contentExpansionRuns).where(eq(contentExpansionRuns.eventId, eventId));
    }
    if (raws.length) {
      await db.delete(contentRawItems).where(inArray(contentRawItems.id, raws.map((item) => item.id)));
    }
    if (testEventIds.length) {
      await db.delete(contentEvents).where(inArray(contentEvents.id, testEventIds));
    }
    await db.delete(contentSources).where(eq(contentSources.id, seedSource));
  }

  await cleanup();

  try {
    await db.insert(contentSources).values({
      id: seedSource,
      name: "Expansion Acceptance Seed",
      sourceType: "DISCOVERY",
      status: "ACTIVE",
      platform: "WEB",
      collectionMethod: "MANUAL",
      enabled: true,
      authorityScore: 80,
      topics: ["acceptance"],
      collectionConfig: {},
      signalConfig: {},
      metadata: { acceptance: true }
    });

    const raw = await ingestRawItem({
      sourceId: seedSource,
      externalId: seedExternalId,
      originalUrl: `https://example.com/expansion-seed-${marker}`,
      title: `OpenAI Agent Platform OPCExpansion${marker} launches orchestration update`,
      excerpt: "Seed event for expansion acceptance.",
      publishedAt: new Date().toISOString()
    });
    assert(raw.created, "SEED_RAW_NOT_CREATED");

    const seed = await createEventSeed({
      rawItemId: raw.item.id,
      title: raw.item.title,
      summary: raw.item.excerpt,
      entities: ["OpenAI"],
      keywords: ["FailTerm"]
    });
    eventId = seed.item.id;

    let fetchCount = 0;
    const result = await runEventExpansion(
      user,
      eventId,
      { providers: ["HN_ALGOLIA", "GITHUB_SEARCH"], windowHours: 72, resultLimit: 10, maxQueries: 4 },
      {
        fetchJson: async (url) => {
          fetchCount += 1;
          const parsed = new URL(url);
          const query = parsed.searchParams.get("query") ?? parsed.searchParams.get("q") ?? "";

          if (parsed.hostname === "hn.algolia.com") {
            if (query.includes("FailTerm")) throw new Error("COLLECTION_HTTP_503");
            return {
              hits: [{
                objectID: `expansion-${marker}`,
                title: `OPCExpansion${marker} OpenAI launches Agent Platform orchestration update`,
                url: `https://news.example.com/expansion-${marker}`,
                author: "test",
                created_at: new Date().toISOString(),
                points: 20,
                num_comments: 5
              }]
            };
          }

          return {
            items: [{
              id: `expansion-${marker}`,
              full_name: `opc/other-tool-${marker}`,
              html_url: `https://github.com/opc/other-tool-${marker}`,
              description: "A separate repository result that should remain its own event.",
              pushed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              stargazers_count: 10,
              forks_count: 2,
              open_issues_count: 1,
              owner: { login: "opc" },
              language: "TypeScript",
              topics: ["ai"]
            }]
          };
        }
      }
    );

    assert(result.queries.length >= 3, "MULTI_QUERY_PLAN_MISSING");
    assert(result.providers.length === 2, "CROSS_PROVIDER_PLAN_MISSING");
    assert(fetchCount === result.summary.total, "RUN_COUNT_FETCH_COUNT_MISMATCH");
    assert(result.summary.failed >= 1, "FAILED_QUERY_NOT_RECORDED");
    assert(result.summary.succeeded >= 1, "SUCCESSFUL_QUERY_MISSING");
    assert(result.summary.created >= 2, "EXPANSION_NEW_ITEMS_MISSING");
    assert(result.summary.duplicates >= 1, "EXPANSION_DEDUPE_MISSING");

    const runs = await db
      .select()
      .from(contentExpansionRuns)
      .where(eq(contentExpansionRuns.eventId, eventId));
    assert(runs.length === result.summary.total, "EXPANSION_RUN_TRACE_MISSING");
    assert(runs.some((run) => run.status === "FAILED" && run.errorCode === "COLLECTION_HTTP_503"), "FAILED_RUN_TRACE_MISSING");
    assert(new Set(runs.map((run) => run.provider)).size === 2, "PROVIDER_TRACE_MISSING");

    const expansionRaws = await db
      .select()
      .from(contentRawItems)
      .where(inArray(contentRawItems.externalId, [hnExternalId, githubExternalId]));
    assert(expansionRaws.length === 2, "EXPANSION_RAW_DEDUPE_WRONG");

    const events = await db.select().from(contentEvents);
    const original = events.find((event) => event.id === eventId);
    assert(original, "ORIGINAL_EVENT_MISSING");

    const hnRaw = expansionRaws.find((item) => item.externalId === hnExternalId);
    const githubRaw = expansionRaws.find((item) => item.externalId === githubExternalId);
    assert(hnRaw && githubRaw, "EXPANSION_RAW_ITEMS_MISSING");
    const links = await db
      .select()
      .from(contentEventRawItems)
      .where(inArray(contentEventRawItems.rawItemId, [hnRaw.id, githubRaw.id]));
    const hnLink = links.find((item) => item.rawItemId === hnRaw.id);
    const githubLink = links.find((item) => item.rawItemId === githubRaw.id);
    assert(hnLink?.eventId === eventId, "RELATED_RESULT_NOT_LINKED_TO_ORIGINAL_EVENT");
    assert(githubLink && githubLink.eventId !== eventId, "UNRELATED_RESULT_MUST_FORM_SEPARATE_EVENT");

    console.log("COLLECTION_EXPANSION_MULTI_QUERY=PASS");
    console.log("COLLECTION_EXPANSION_CROSS_PROVIDER=PASS");
    console.log("COLLECTION_EXPANSION_DEDUPE=PASS");
    console.log("COLLECTION_EXPANSION_FAILURE_TRACE=PASS");
    console.log("COLLECTION_EXPANSION_EVENT_LINKING=PASS");
    console.log("COLLECTION_EXPANSION_DB=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
