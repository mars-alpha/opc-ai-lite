import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventClusterMembers,
  contentEventClusters,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import {
  EVENT_CLUSTER_RULE_VERSION,
  EVENT_CLUSTER_THRESHOLD,
  getEventClusterResearchPack,
  runEventClustering,
  scoreEventClusterCandidate
} from "../lib/server/content/event-clustering";
import { listEvents } from "../lib/server/content/discovery";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_CLUSTERING_ACCEPT_FAILED:" + code);
}

async function main() {
  const db = getDatabase();
  const marker = String(process.pid);
  const sourceA = `source_event_cluster_a_${marker}`;
  const sourceB = `source_event_cluster_b_${marker}`;
  const sourceC = `source_event_cluster_c_${marker}`;
  const eventAId = crypto.randomUUID();
  const eventBId = crypto.randomUUID();
  const eventCId = crypto.randomUUID();
  const rawAId = crypto.randomUUID();
  const rawBId = crypto.randomUUID();
  const rawCId = crypto.randomUUID();
  const now = new Date();

  async function cleanup() {
    await db.delete(contentEventClusters).where(
      inArray(contentEventClusters.primaryEventId, [eventAId, eventBId, eventCId])
    );
    await db.delete(contentEvents).where(inArray(contentEvents.id, [eventAId, eventBId, eventCId]));
    await db.delete(contentRawItems).where(inArray(contentRawItems.id, [rawAId, rawBId, rawCId]));
    await db.delete(contentSources).where(inArray(contentSources.id, [sourceA, sourceB, sourceC]));
  }

  await cleanup();

  try {
    await db.insert(contentSources).values([
      {
        id: sourceA,
        name: "Event Cluster Source A",
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
        name: "Event Cluster Source B",
        sourceType: "DISCOVERY",
        status: "ACTIVE",
        platform: "HACKER_NEWS",
        collectionMethod: "SEARCH",
        enabled: true,
        authorityScore: 65,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      },
      {
        id: sourceC,
        name: "Event Cluster Source C",
        sourceType: "DISCOVERY",
        status: "ACTIVE",
        platform: "GITHUB",
        collectionMethod: "SEARCH",
        enabled: true,
        authorityScore: 70,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      }
    ]);

    await db.insert(contentRawItems).values([
      {
        id: rawAId,
        sourceId: sourceA,
        platform: "WEB",
        externalId: `cluster-raw-a-${marker}`,
        originalUrl: `https://example.com/cluster-a-${marker}`,
        title: `OpenAI Agent Platform orchestration update OPCEvent${marker}`,
        excerpt: "Primary report.",
        publishedAt: now,
        contentHash: `cluster-hash-a-${marker}`,
        platformMetrics: {},
        metadata: { acceptance: true }
      },
      {
        id: rawBId,
        sourceId: sourceB,
        platform: "HACKER_NEWS",
        externalId: `cluster-raw-b-${marker}`,
        originalUrl: `https://example.org/cluster-b-${marker}`,
        title: `Developers discuss OpenAI Agent Platform orchestration release OPCEvent${marker}`,
        excerpt: "Related report from another platform.",
        publishedAt: new Date(now.getTime() + 20 * 60 * 1000),
        contentHash: `cluster-hash-b-${marker}`,
        platformMetrics: {},
        metadata: { acceptance: true }
      },
      {
        id: rawCId,
        sourceId: sourceC,
        platform: "GITHUB",
        externalId: `cluster-raw-c-${marker}`,
        originalUrl: `https://github.com/opc/cluster-c-${marker}`,
        title: `OpenAI changes API billing rules OPCBilling${marker}`,
        excerpt: "Different OpenAI event.",
        publishedAt: new Date(now.getTime() + 40 * 60 * 1000),
        contentHash: `cluster-hash-c-${marker}`,
        platformMetrics: {},
        metadata: { acceptance: true }
      }
    ]);

    await db.insert(contentEvents).values([
      {
        id: eventAId,
        fingerprint: `event-cluster-a-${marker}`,
        title: `OpenAI Agent Platform orchestration update OPCEvent${marker}`,
        summary: "Primary event seed.",
        keywords: ["Agent Platform", "orchestration"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      },
      {
        id: eventBId,
        fingerprint: `event-cluster-b-${marker}`,
        title: `Developers discuss OpenAI Agent Platform orchestration release OPCEvent${marker}`,
        summary: "Related seed.",
        keywords: ["Agent Platform", "orchestration"],
        entities: ["OpenAI"],
        firstSeenAt: new Date(now.getTime() + 20 * 60 * 1000),
        lastSeenAt: new Date(now.getTime() + 20 * 60 * 1000)
      },
      {
        id: eventCId,
        fingerprint: `event-cluster-c-${marker}`,
        title: `OpenAI changes API billing rules OPCBilling${marker}`,
        summary: "Different event.",
        keywords: ["billing", "API"],
        entities: ["OpenAI"],
        firstSeenAt: new Date(now.getTime() + 40 * 60 * 1000),
        lastSeenAt: new Date(now.getTime() + 40 * 60 * 1000)
      }
    ]);

    await db.insert(contentEventRawItems).values([
      {
        eventId: eventAId,
        rawItemId: rawAId,
        role: "SEED",
        clusterRuleVersion: "acceptance",
        clusterReason: "NEW_EVENT",
        clusterScore: 100,
        clusterMetadata: {}
      },
      {
        eventId: eventBId,
        rawItemId: rawBId,
        role: "SEED",
        clusterRuleVersion: "acceptance",
        clusterReason: "NEW_EVENT",
        clusterScore: 100,
        clusterMetadata: {}
      },
      {
        eventId: eventCId,
        rawItemId: rawCId,
        role: "SEED",
        clusterRuleVersion: "acceptance",
        clusterReason: "NEW_EVENT",
        clusterScore: 100,
        clusterMetadata: {}
      }
    ]);

    const similar = scoreEventClusterCandidate(
      {
        id: eventAId,
        title: `OpenAI Agent Platform orchestration update OPCEvent${marker}`,
        keywords: ["Agent Platform", "orchestration"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      },
      {
        id: eventBId,
        title: `Developers discuss OpenAI Agent Platform orchestration release OPCEvent${marker}`,
        keywords: ["Agent Platform", "orchestration"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      }
    );
    assert(similar && similar.score >= EVENT_CLUSTER_THRESHOLD, "RELATED_EVENT_NOT_MATCHED");

    const unrelated = scoreEventClusterCandidate(
      {
        id: eventAId,
        title: `OpenAI Agent Platform orchestration update OPCEvent${marker}`,
        keywords: ["Agent Platform", "orchestration"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      },
      {
        id: eventCId,
        title: `OpenAI changes API billing rules OPCBilling${marker}`,
        keywords: ["billing", "API"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      }
    );
    assert(unrelated === null, "UNRELATED_EVENT_FALSE_POSITIVE");

    const versionConflict = scoreEventClusterCandidate(
      {
        id: "version-a",
        title: "OpenAI Agent Platform 2.0 orchestration update",
        keywords: [],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      },
      {
        id: "version-b",
        title: "OpenAI Agent Platform 3.0 orchestration update",
        keywords: [],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      }
    );
    assert(versionConflict === null, "VERSION_CONFLICT_FALSE_POSITIVE");

    const first = await runEventClustering(eventAId);
    assert(first, "CLUSTER_NOT_CREATED");
    assert(first.cluster.clusterRuleVersion === EVENT_CLUSTER_RULE_VERSION, "RULE_VERSION_WRONG");
    assert(first.researchPack.memberEventCount === 2, "RELATED_MEMBER_COUNT_WRONG");
    assert(first.researchPack.rawItemCount === 2, "RAW_ITEM_COUNT_WRONG");
    assert(first.researchPack.sourceCount === 2, "SOURCE_COUNT_WRONG");
    assert(first.researchPack.platformCount === 2, "PLATFORM_COUNT_WRONG");
    assert(first.researchPack.memberEventIds.includes(eventAId), "PRIMARY_EVENT_NOT_IN_CLUSTER");
    assert(first.researchPack.memberEventIds.includes(eventBId), "RELATED_EVENT_NOT_IN_CLUSTER");
    assert(!first.researchPack.memberEventIds.includes(eventCId), "UNRELATED_EVENT_IN_CLUSTER");

    const memberRows = await db
      .select()
      .from(contentEventClusterMembers)
      .where(eq(contentEventClusterMembers.clusterId, first.cluster.id));
    const relatedMember = memberRows.find((item) => item.eventId === eventBId);
    assert(relatedMember, "RELATED_MEMBER_TRACE_MISSING");
    assert(relatedMember.mergeReason === "TITLE_TOKEN_OVERLAP", "MERGE_REASON_WRONG");
    assert(relatedMember.mergeScore >= EVENT_CLUSTER_THRESHOLD, "MERGE_SCORE_TOO_LOW");

    const second = await runEventClustering(eventAId);
    assert(second?.cluster.id === first.cluster.id, "RERUN_CLUSTER_ID_CHANGED");
    assert(second?.researchPack.memberEventCount === 2, "RERUN_DUPLICATED_MEMBERS");

    const list = await listEvents(200);
    const listedA = list.find((item) => item.id === eventAId);
    const listedB = list.find((item) => item.id === eventBId);
    const listedC = list.find((item) => item.id === eventCId);
    assert(listedA?.clusterId === first.cluster.id, "PRIMARY_LIST_CLUSTER_ID_MISSING");
    assert(listedB?.clusterId === first.cluster.id, "MEMBER_LIST_CLUSTER_ID_MISSING");
    assert(listedA?.clusterMemberCount === 2, "LIST_CLUSTER_MEMBER_COUNT_WRONG");
    assert(listedC?.clusterId === null, "UNRELATED_EVENT_SHOULD_REMAIN_UNCLUSTERED");

    const pack = await getEventClusterResearchPack(eventBId);
    assert(pack?.cluster.id === first.cluster.id, "MEMBER_RESEARCH_PACK_LOOKUP_FAILED");
    assert(pack?.researchPack.sourceCoverage.length === 2, "SOURCE_COVERAGE_MISSING");
    assert(pack?.researchPack.platformCoverage.length === 2, "PLATFORM_COVERAGE_MISSING");

    console.log("EVENT_CLUSTERING_RELATED_MERGE=PASS");
    console.log("EVENT_CLUSTERING_FALSE_POSITIVE_GUARD=PASS");
    console.log("EVENT_CLUSTERING_VERSION_GUARD=PASS");
    console.log("EVENT_CLUSTERING_TRACEABILITY=PASS");
    console.log("EVENT_CLUSTERING_RESEARCH_PACK=PASS");
    console.log("EVENT_CLUSTERING_RERUN=PASS");
    console.log("EVENT_CLUSTERING_LIST_INTEGRATION=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
