import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import { runFreshScan } from "../lib/server/content/discovery";
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

    console.log("EVENT_SEED_CLUSTERING_SIMILAR_TITLE=PASS");
    console.log("EVENT_SEED_CLUSTERING_FALSE_POSITIVE_GUARD=PASS");
    console.log("EVENT_SEED_CLUSTERING_ENTITY_GUARD=PASS");
    console.log("EVENT_SEED_CLUSTERING_VERSION_GUARD=PASS");
    console.log("EVENT_SEED_CLUSTERING_DB_MERGE=PASS");
    console.log("EVENT_SEED_CLUSTERING_AUDIT_FIELDS=PASS");
    console.log("EVENT_SEED_CLUSTERING_RERUN=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
