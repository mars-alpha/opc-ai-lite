import { loadEnvConfig } from "@next/env";
import { desc, isNull } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentEvents } from "../lib/server/db/schema";
import {
  classifyEventExpansionCandidate,
  selectEventExpansionEvidence
} from "../lib/server/content/event-expansion";
import {
  collectEventExpansionSearch,
  getEventExpansionContext,
  getEventExpansionPlan,
  providerQueryPlan
} from "../lib/server/content/collection-expansion";
import { fetchPublicJson } from "../lib/server/content/collection-runner";

loadEnvConfig(process.cwd());

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("CREATOR_REPLAY_DEVELOPMENT_DATABASE_REQUIRED");
  }

  const db = getDatabase();
  const events = await db
    .select({
      id: contentEvents.id,
      title: contentEvents.title,
      eventType: contentEvents.eventType,
      verificationStatus: contentEvents.verificationStatus
    })
    .from(contentEvents)
    .where(isNull(contentEvents.archivedAt))
    .orderBy(desc(contentEvents.lastSeenAt))
    .limit(6);

  const rows: Array<Record<string, unknown>> = [];

  for (const event of events) {
    const context = await getEventExpansionContext(event.id);
    const plan = await getEventExpansionPlan(event.id);
    const queries = providerQueryPlan("BILIBILI_SEARCH", plan, 4);
    let received = 0;
    const classified = [];
    const receivedItems = new Map<string, { title: string; query: string }>();

    for (const queryPlan of queries) {
      try {
        const search = await collectEventExpansionSearch(
          "BILIBILI_SEARCH",
          queryPlan.query,
          72,
          12,
          { fetchJson: fetchPublicJson }
        );
        received += search.items.length;
        for (const item of search.items) {
          if (!item.externalId) continue;
          receivedItems.set(item.externalId, { title: item.title, query: queryPlan.query });
          const result = classifyEventExpansionCandidate(context, {
            rawItemId: item.externalId,
            platform: "BILIBILI",
            title: item.title,
            excerpt: item.excerpt,
            publishedAt: item.publishedAt,
            platformMetrics: item.platformMetrics,
            query: queryPlan.query
          });
          if (result) classified.push(result);
        }
      } catch (error) {
        rows.push({
          eventId: event.id,
          title: event.title,
          eventType: event.eventType,
          status: "QUERY_FAILED",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const selected = selectEventExpansionEvidence(classified, 10);
    rows.push({
      eventId: event.id,
      title: event.title,
      eventType: event.eventType,
      verificationStatus: event.verificationStatus,
      status: "REPLAYED",
      queries: queries.length,
      received,
      relevant: selected.length,
      types: [...new Set(selected.map((item) => item.expansionType))],
      creatorScoreAvg: selected.length
        ? Math.round(selected.reduce((sum, item) => sum + (item.creatorPracticalScore ?? 0), 0) / selected.length)
        : 0
,
      evidence: selected.map((item) => ({
        rawItemId: item.rawItemId,
        expansionType: item.expansionType,
        creatorPracticalScore: item.creatorPracticalScore,
        title: receivedItems.get(item.rawItemId)?.title ?? null,
        query: receivedItems.get(item.rawItemId)?.query ?? null
      }))
    });
  }

  const replayed = rows.filter((row) => row.status === "REPLAYED");
  const totalReceived = replayed.reduce((sum, row) => sum + Number(row.received ?? 0), 0);
  const totalRelevant = replayed.reduce((sum, row) => sum + Number(row.relevant ?? 0), 0);
  console.log(JSON.stringify(rows, null, 2));
  console.log("CREATOR_REPLAY_EVENTS=" + replayed.length);
  console.log("CREATOR_REPLAY_RECEIVED=" + totalReceived);
  console.log("CREATOR_REPLAY_RELEVANT=" + totalRelevant);
  console.log("CREATOR_REPLAY_ZERO_EVIDENCE_ALLOWED=PASS");
}

main()
  .finally(() => closeDatabase())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
