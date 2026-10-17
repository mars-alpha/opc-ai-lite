import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentCollectionRuns,
  contentEventRawItems,
  contentEvents,
  contentRawItemObservations,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import { ingestRawItem, runFreshScan } from "../lib/server/content/discovery";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  EVENT_SEED_CLUSTER_RULE_VERSION,
  EVENT_SEED_CLUSTER_THRESHOLD,
  scoreEventSeedCandidate
} from "../lib/server/content/event-seed-clustering";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_SEED_CLUSTERING_ACCEPT_FAILED:" + code);
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_ONLY");
  const db = getDatabase();
  const marker = String(process.pid);
  const sourceA = `source_cluster_accept_a_${marker}`;
  const sourceB = `source_cluster_accept_b_${marker}`;
  const now = new Date();

  async function cleanup() {
    const raws = await db
      .select({ id: contentRawItems.id })
      .from(contentRawItems)
      .where(inArray(contentRawItems.sourceId, [sourceA, sourceB]));
    const links = raws.length
      ? await db
          .select({ eventId: contentEventRawItems.eventId })
          .from(contentEventRawItems)
          .where(inArray(contentEventRawItems.rawItemId, raws.map((item) => item.id)))
      : [];

    await db.delete(contentSources).where(inArray(contentSources.id, [sourceA, sourceB]));
    const eventIds = [...new Set(links.map((item) => item.eventId))];
    if (eventIds.length) await db.delete(contentEvents).where(inArray(contentEvents.id, eventIds));
  }

  await cleanup();

  try {
    const closeScore = scoreEventSeedCandidate(
      {
        title: `OPCClusterA${marker} OpenAI launches Agent SDK version 2.0`,
        keywords: [],
        entities: [],
        observedAt: now
      },
      {
        id: "event-a",
        title: `OpenAI releases Agent SDK 2.0 OPCClusterA${marker}`,
        keywords: [],
        entities: [],
        firstSeenAt: now,
        lastSeenAt: now
      }
    );
    assert(closeScore && closeScore.score >= EVENT_SEED_CLUSTER_THRESHOLD, "SIMILAR_TITLE_NOT_MATCHED");

    const differentScore = scoreEventSeedCandidate(
      {
        title: `OPCClusterB${marker} Anthropic updates Claude desktop app`,
        keywords: [],
        entities: [],
        observedAt: now
      },
      {
        id: "event-a",
        title: `OpenAI releases Agent SDK 2.0 OPCClusterA${marker}`,
        keywords: [],
        entities: [],
        firstSeenAt: now,
        lastSeenAt: now
      }
    );
    assert(differentScore === null, "DIFFERENT_EVENT_FALSE_POSITIVE");

    const versionConflict = scoreEventSeedCandidate(
      {
        title: `OpenAI releases Agent SDK 3.0 OPCVersionGuard${marker}`,
        keywords: [],
        entities: [],
        observedAt: now
      },
      {
        id: "event-version",
        title: `OpenAI releases Agent SDK 2.0 OPCVersionGuard${marker}`,
        keywords: [],
        entities: [],
        firstSeenAt: now,
        lastSeenAt: now
      }
    );
    assert(versionConflict === null, "VERSION_CONFLICT_FALSE_POSITIVE");

    const sharedEntityOnly = scoreEventSeedCandidate(
      {
        title: `OpenAI introduces a new image generation model OPCEntityA${marker}`,
        keywords: [],
        entities: ["OpenAI"],
        observedAt: now
      },
      {
        id: "event-entity",
        title: `OpenAI changes API billing rules OPCEntityB${marker}`,
        keywords: [],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      }
    );
    assert(sharedEntityOnly === null, "SHARED_ENTITY_FALSE_POSITIVE");

    await db.insert(contentSources).values([
      {
        id: sourceA,
        name: "Cluster Acceptance Source A",
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
      },
      {
        id: sourceB,
        name: "Cluster Acceptance Source B",
        sourceType: "DISCOVERY",
        status: "ACTIVE",
        platform: "SEARCH",
        collectionMethod: "SEARCH",
        enabled: true,
        authorityScore: 70,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      }
    ]);

    const first = await runFreshScan({
      sourceId: sourceA,
      items: [{
        externalId: `cluster-a-1-${marker}`,
        originalUrl: `https://example.com/cluster-a-1-${marker}`,
        title: `OpenAI releases Agent SDK 2.0 OPCClusterA${marker}`,
        excerpt: "First report about the same product event.",
        publishedAt: now.toISOString()
      }]
    });
    assert(first.created === 1, "FIRST_RAW_NOT_CREATED");

    const second = await runFreshScan({
      sourceId: sourceB,
      items: [{
        externalId: `cluster-a-2-${marker}`,
        originalUrl: `https://example.org/cluster-a-2-${marker}`,
        title: `OPCClusterA${marker} OpenAI launches Agent SDK version 2.0`,
        excerpt: "Second source reporting the same event with a different headline.",
        publishedAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString()
      }]
    });
    assert(second.created === 1, "SECOND_RAW_NOT_CREATED");

    const third = await runFreshScan({
      sourceId: sourceB,
      items: [{
        externalId: `cluster-b-1-${marker}`,
        originalUrl: `https://example.org/cluster-b-1-${marker}`,
        title: `OPCClusterB${marker} Anthropic updates Claude desktop app`,
        excerpt: "A clearly different event.",
        publishedAt: new Date(now.getTime() + 45 * 60 * 1000).toISOString()
      }]
    });
    assert(third.created === 1, "THIRD_RAW_NOT_CREATED");

    const rawIds = [...first.createdRawItemIds, ...second.createdRawItemIds, ...third.createdRawItemIds];
    const links = await db
      .select()
      .from(contentEventRawItems)
      .where(inArray(contentEventRawItems.rawItemId, rawIds));

    assert(links.length === 3, "EVENT_LINK_COUNT_WRONG");

    const firstLink = links.find((item) => item.rawItemId === first.createdRawItemIds[0]);
    const secondLink = links.find((item) => item.rawItemId === second.createdRawItemIds[0]);
    const thirdLink = links.find((item) => item.rawItemId === third.createdRawItemIds[0]);
    assert(firstLink && secondLink && thirdLink, "EVENT_LINK_MISSING");
    assert(firstLink.eventId === secondLink.eventId, "SAME_EVENT_NOT_CLUSTERED");
    assert(thirdLink.eventId !== firstLink.eventId, "DIFFERENT_EVENT_MERGED");
    assert(secondLink.clusterRuleVersion === EVENT_SEED_CLUSTER_RULE_VERSION, "RULE_VERSION_NOT_SAVED");
    assert(secondLink.clusterReason === "TITLE_TOKEN_OVERLAP", "CLUSTER_REASON_WRONG");
    assert((secondLink.clusterScore ?? 0) >= EVENT_SEED_CLUSTER_THRESHOLD, "CLUSTER_SCORE_TOO_LOW");

    const eventIds = [...new Set(links.map((item) => item.eventId))];
    assert(eventIds.length === 2, "EVENT_COUNT_NOT_REDUCED");

    const repeated = await runFreshScan({
      sourceId: sourceB,
      items: [{
        externalId: `cluster-a-2-${marker}`,
        originalUrl: `https://example.org/cluster-a-2-${marker}`,
        title: `OPCClusterA${marker} OpenAI launches Agent SDK version 2.0`,
        excerpt: "Second source reporting the same event with a different headline.",
        publishedAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString()
      }]
    });
    assert(repeated.created === 0 && repeated.duplicates === 1, "RERUN_NOT_STABLE");
    assert(repeated.recoveredRawItemIds.length === 0, "LINKED_RAW_SHOULD_NOT_RESEED");

    const orphanInput = {
      sourceId: sourceA,
      externalId: `cluster-orphan-${marker}`,
      originalUrl: `https://example.com/cluster-orphan-${marker}`,
      title: `OPCOrphan${marker} isolated source event`,
      excerpt: "A fresh Raw whose Event seed did not run.",
      publishedAt: now.toISOString()
    };
    const [partialRun] = await db.insert(contentCollectionRuns).values({ sourceId: sourceA, sourceName: "Cluster Acceptance Source A", collectionMethod: "RSS", status: "RUNNING" }).returning();
    const orphanRaw = await ingestRawItem({ ...orphanInput, collectionRunId: partialRun.id });
    assert(orphanRaw.created, "ORPHAN_FIXTURE_RAW_NOT_CREATED");
    const [recordedRun] = await db.select().from(contentCollectionRuns).where(eq(contentCollectionRuns.id, partialRun.id));
    const runMetadata = recordedRun.metadata as Record<string, unknown>;
    assert(Array.isArray(runMetadata.rawItemIds) && runMetadata.rawItemIds.includes(orphanRaw.item.id), "RUN_RAW_LINEAGE_MISSING");
    await db.update(contentCollectionRuns).set({ status: "FAILED", finishedAt: new Date() }).where(eq(contentCollectionRuns.id, partialRun.id));
    const rollbackUrl = `https://example.com/cluster-rollback-${marker}`;
    let rejectedClosedRun = false;
    try {
      await ingestRawItem({ ...orphanInput, externalId: `rollback-${marker}`, originalUrl: rollbackUrl, title: `Unique rollback fixture ${marker}`, collectionRunId: partialRun.id });
    } catch (error) {
      rejectedClosedRun = error instanceof Error && error.message === "COLLECTION_RUN_RAW_LINK_INVALID";
    }
    const rolledBack = await db.select({ id: contentRawItems.id }).from(contentRawItems).where(eq(contentRawItems.originalUrl, rollbackUrl));
    assert(rejectedClosedRun && rolledBack.length === 0, "RUN_RAW_TRANSACTION_DID_NOT_ROLL_BACK");
    await db.delete(contentRawItemObservations).where(eq(contentRawItemObservations.rawItemId, orphanRaw.item.id));
    const recovered = await runFreshScan({ sourceId: sourceA, items: [orphanInput] });
    assert(recovered.created === 0 && recovered.recoveredRawItemIds.includes(orphanRaw.item.id), "ORPHAN_EVENT_NOT_RECOVERED");
    const [restoredObservation] = await db.select().from(contentRawItemObservations)
      .where(eq(contentRawItemObservations.rawItemId, orphanRaw.item.id)).limit(1);
    const [restoredLink] = await db.select().from(contentEventRawItems)
      .where(eq(contentEventRawItems.rawItemId, orphanRaw.item.id)).limit(1);
    assert(restoredObservation && restoredLink, "ORPHAN_OBSERVATION_OR_EVENT_LINK_MISSING");
    const recoveredAgain = await runFreshScan({ sourceId: sourceA, items: [orphanInput] });
    assert(recoveredAgain.recoveredRawItemIds.length === 0, "RECOVERY_NOT_IDEMPOTENT");

    console.log("EVENT_SEED_CLUSTERING_SIMILAR_TITLE=PASS");
    console.log("EVENT_SEED_CLUSTERING_FALSE_POSITIVE_GUARD=PASS");
    console.log("EVENT_SEED_CLUSTERING_ENTITY_GUARD=PASS");
    console.log("EVENT_SEED_CLUSTERING_VERSION_GUARD=PASS");
    console.log("EVENT_SEED_CLUSTERING_DB_MERGE=PASS");
    console.log("EVENT_SEED_CLUSTERING_AUDIT_FIELDS=PASS");
    console.log("EVENT_SEED_CLUSTERING_RERUN=PASS");
    console.log("EVENT_SEED_CLUSTERING_ORPHAN_RECOVERY=PASS");
    console.log("RUN_RAW_LINEAGE_ATOMICITY=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
