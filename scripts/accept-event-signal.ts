import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventClusterMembers,
  contentEventClusters,
  contentEventClusterSignals,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import {
  EVENT_SIGNAL_ADAPTER_VERSION,
  calculateEventClusterSignals,
  normalizeGithubSignal,
  normalizeHnSignal
} from "../lib/server/content/event-signal";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_SIGNAL_ACCEPT_FAILED:" + code);
}

async function main() {
  const db = getDatabase();
  const marker = String(process.pid);
  const now = new Date();

  const sourceHn = `source_signal_hn_${marker}`;
  const sourceGithub = `source_signal_github_${marker}`;
  const sourceOfficial = `source_signal_official_${marker}`;
  const sourceFallback = `source_signal_fallback_${marker}`;

  const eventA = crypto.randomUUID();
  const eventB = crypto.randomUUID();
  const eventC = crypto.randomUUID();
  const eventFallback = crypto.randomUUID();
  const clusterMain = crypto.randomUUID();
  const clusterFallback = crypto.randomUUID();

  const rawHn = crypto.randomUUID();
  const rawGithub = crypto.randomUUID();
  const rawOfficial = crypto.randomUUID();
  const rawFallback = crypto.randomUUID();

  const sourceIds = [sourceHn, sourceGithub, sourceOfficial, sourceFallback];
  const eventIds = [eventA, eventB, eventC, eventFallback];
  const rawIds = [rawHn, rawGithub, rawOfficial, rawFallback];
  const clusterIds = [clusterMain, clusterFallback];

  async function cleanup() {
    await db.delete(contentEventClusterSignals).where(inArray(contentEventClusterSignals.clusterId, clusterIds));
    await db.delete(contentEventClusterMembers).where(inArray(contentEventClusterMembers.clusterId, clusterIds));
    await db.delete(contentEventClusters).where(inArray(contentEventClusters.id, clusterIds));
    await db.delete(contentEventRawItems).where(inArray(contentEventRawItems.eventId, eventIds));
    await db.delete(contentEvents).where(inArray(contentEvents.id, eventIds));
    await db.delete(contentRawItems).where(inArray(contentRawItems.id, rawIds));
    await db.delete(contentSources).where(inArray(contentSources.id, sourceIds));
  }

  await cleanup();

  try {
    const hnA = normalizeHnSignal({ points: 120, comments: 45 });
    const hnB = normalizeHnSignal({ points: 120, comments: 45, stars: 999999 });
    assert(hnA.score === hnB.score, "HN_ADAPTER_LEAKED_GITHUB_METRIC");

    const ghA = normalizeGithubSignal({ stars: 2400, forks: 320, openIssues: 18 });
    const ghB = normalizeGithubSignal({ stars: 2400, forks: 320, openIssues: 18, points: 999999 });
    assert(ghA.score === ghB.score, "GITHUB_ADAPTER_LEAKED_HN_METRIC");
    assert(hnA.score >= 0 && hnA.score <= 100, "HN_SCORE_OUT_OF_RANGE");
    assert(ghA.score >= 0 && ghA.score <= 100, "GITHUB_SCORE_OUT_OF_RANGE");

    await db.insert(contentSources).values([
      {
        id: sourceHn,
        name: "Signal HN",
        sourceType: "DISCOVERY",
        status: "ACTIVE",
        platform: "HACKER_NEWS",
        collectionMethod: "SEARCH",
        enabled: true,
        authorityScore: 62,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      },
      {
        id: sourceGithub,
        name: "Signal GitHub",
        sourceType: "DISCOVERY",
        status: "ACTIVE",
        platform: "GITHUB",
        collectionMethod: "SEARCH",
        enabled: true,
        authorityScore: 78,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      },
      {
        id: sourceOfficial,
        name: "Signal Official",
        sourceType: "OFFICIAL",
        status: "ACTIVE",
        platform: "WEB",
        collectionMethod: "RSS",
        enabled: true,
        authorityScore: 96,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      },
      {
        id: sourceFallback,
        name: "Signal Fallback",
        sourceType: "DISCOVERY",
        status: "ACTIVE",
        platform: "WEB",
        collectionMethod: "RSS",
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
        id: rawHn,
        sourceId: sourceHn,
        platform: "HACKER_NEWS",
        externalId: `signal-hn-${marker}`,
        originalUrl: `https://news.ycombinator.com/item?id=${marker}`,
        title: `Signal HN item ${marker}`,
        excerpt: "HN signal item",
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        contentHash: `signal-hn-hash-${marker}`,
        platformMetrics: { points: 120, comments: 45 },
        metadata: {}
      },
      {
        id: rawGithub,
        sourceId: sourceGithub,
        platform: "GITHUB",
        externalId: `signal-gh-${marker}`,
        originalUrl: `https://github.com/opc/signal-${marker}`,
        title: `Signal GitHub item ${marker}`,
        excerpt: "GitHub signal item",
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        contentHash: `signal-gh-hash-${marker}`,
        platformMetrics: { stars: 2400, forks: 320, openIssues: 18 },
        metadata: {}
      },
      {
        id: rawOfficial,
        sourceId: sourceOfficial,
        platform: "WEB",
        externalId: `signal-official-${marker}`,
        originalUrl: `https://example.com/official-${marker}`,
        title: `Signal official item ${marker}`,
        excerpt: "Official source without engagement metrics",
        publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        contentHash: `signal-official-hash-${marker}`,
        platformMetrics: {},
        metadata: {}
      },
      {
        id: rawFallback,
        sourceId: sourceFallback,
        platform: "WEB",
        externalId: `signal-fallback-${marker}`,
        originalUrl: `https://example.net/fallback-${marker}`,
        title: `Signal fallback item ${marker}`,
        excerpt: "Fallback only source",
        publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        contentHash: `signal-fallback-hash-${marker}`,
        platformMetrics: {},
        metadata: {}
      }
    ]);

    await db.insert(contentEvents).values([
      {
        id: eventA,
        fingerprint: `signal-event-a-${marker}`,
        title: `Signal main event ${marker}`,
        keywords: ["signal"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      },
      {
        id: eventB,
        fingerprint: `signal-event-b-${marker}`,
        title: `Signal related event ${marker}`,
        keywords: ["signal"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      },
      {
        id: eventC,
        fingerprint: `signal-event-c-${marker}`,
        title: `Signal official event ${marker}`,
        keywords: ["signal"],
        entities: ["OpenAI"],
        firstSeenAt: now,
        lastSeenAt: now
      },
      {
        id: eventFallback,
        fingerprint: `signal-event-fallback-${marker}`,
        title: `Signal fallback event ${marker}`,
        keywords: ["fallback"],
        entities: [],
        firstSeenAt: now,
        lastSeenAt: now
      }
    ]);

    await db.insert(contentEventRawItems).values([
      { eventId: eventA, rawItemId: rawHn, role: "SEED", clusterRuleVersion: "acceptance", clusterReason: "SEED", clusterScore: 100, clusterMetadata: {} },
      { eventId: eventB, rawItemId: rawGithub, role: "SEED", clusterRuleVersion: "acceptance", clusterReason: "SEED", clusterScore: 100, clusterMetadata: {} },
      { eventId: eventC, rawItemId: rawOfficial, role: "SEED", clusterRuleVersion: "acceptance", clusterReason: "SEED", clusterScore: 100, clusterMetadata: {} },
      { eventId: eventFallback, rawItemId: rawFallback, role: "SEED", clusterRuleVersion: "acceptance", clusterReason: "SEED", clusterScore: 100, clusterMetadata: {} }
    ]);

    await db.insert(contentEventClusters).values([
      {
        id: clusterMain,
        canonicalTitle: `Signal main cluster ${marker}`,
        primaryEventId: eventA,
        clusterRuleVersion: "acceptance",
        memberEventCount: 3,
        rawItemCount: 3,
        sourceCount: 3,
        platformCount: 3,
        firstSeenAt: now,
        lastSeenAt: now,
        metadata: {}
      },
      {
        id: clusterFallback,
        canonicalTitle: `Signal fallback cluster ${marker}`,
        primaryEventId: eventFallback,
        clusterRuleVersion: "acceptance",
        memberEventCount: 1,
        rawItemCount: 1,
        sourceCount: 1,
        platformCount: 1,
        firstSeenAt: now,
        lastSeenAt: now,
        metadata: {}
      }
    ]);

    await db.insert(contentEventClusterMembers).values([
      { clusterId: clusterMain, eventId: eventA, role: "PRIMARY", clusterRuleVersion: "acceptance", mergeReason: "PRIMARY_EVENT", mergeScore: 100, mergeMetadata: {} },
      { clusterId: clusterMain, eventId: eventB, role: "MEMBER", clusterRuleVersion: "acceptance", mergeReason: "RELATED", mergeScore: 90, mergeMetadata: {} },
      { clusterId: clusterMain, eventId: eventC, role: "MEMBER", clusterRuleVersion: "acceptance", mergeReason: "RELATED", mergeScore: 88, mergeMetadata: {} },
      { clusterId: clusterFallback, eventId: eventFallback, role: "PRIMARY", clusterRuleVersion: "acceptance", mergeReason: "PRIMARY_EVENT", mergeScore: 100, mergeMetadata: {} }
    ]);

    const first = await calculateEventClusterSignals(eventA, now);
    assert(first.adapterVersion === EVENT_SIGNAL_ADAPTER_VERSION, "ADAPTER_VERSION_WRONG");
    assert(first.scores.hotness >= 0 && first.scores.hotness <= 100, "HOTNESS_OUT_OF_RANGE");
    assert(first.scores.velocity >= 0 && first.scores.velocity <= 100, "VELOCITY_OUT_OF_RANGE");
    assert(first.scores.authority >= 0 && first.scores.authority <= 100, "AUTHORITY_OUT_OF_RANGE");
    assert(first.scores.authority >= 70, "HIGH_AUTHORITY_SOURCE_NOT_REFLECTED");

    const signalRows = await db
      .select()
      .from(contentEventClusterSignals)
      .where(eq(contentEventClusterSignals.clusterId, clusterMain));
    assert(signalRows.length === 3, "SIGNAL_ROW_COUNT_WRONG");
    assert(new Set(signalRows.map((item) => item.signalType)).size === 3, "SIGNAL_TYPES_MISSING");
    assert(signalRows.every((item) => item.adapterVersion === EVENT_SIGNAL_ADAPTER_VERSION), "SIGNAL_VERSION_NOT_SAVED");

    const hotnessRow = signalRows.find((item) => item.signalType === "HOTNESS");
    assert(hotnessRow, "HOTNESS_ROW_MISSING");
    const hotnessBreakdown = hotnessRow.breakdown as Record<string, unknown>;
    assert(Number(hotnessBreakdown.coverageBonus ?? 0) > 0, "CROSS_SOURCE_COVERAGE_NOT_APPLIED");

    const later = await calculateEventClusterSignals(
      eventA,
      new Date(now.getTime() + 96 * 60 * 60 * 1000)
    );
    assert(later.scores.velocity < first.scores.velocity, "TIME_DECAY_NOT_APPLIED");

    const rerunRows = await db
      .select()
      .from(contentEventClusterSignals)
      .where(eq(contentEventClusterSignals.clusterId, clusterMain));
    assert(rerunRows.length === 3, "RERUN_DUPLICATED_SIGNAL_ROWS");

    const fallback = await calculateEventClusterSignals(eventFallback, now);
    assert(Number.isInteger(fallback.scores.hotness), "FALLBACK_HOTNESS_UNSTABLE");
    assert(Number.isInteger(fallback.scores.velocity), "FALLBACK_VELOCITY_UNSTABLE");
    assert(Number.isInteger(fallback.scores.authority), "FALLBACK_AUTHORITY_UNSTABLE");

    const [cachedMain] = await db
      .select()
      .from(contentEventClusters)
      .where(eq(contentEventClusters.id, clusterMain))
      .limit(1);
    assert(cachedMain.hotnessScore === later.scores.hotness, "CLUSTER_HOTNESS_CACHE_WRONG");
    assert(cachedMain.velocityScore === later.scores.velocity, "CLUSTER_VELOCITY_CACHE_WRONG");
    assert(cachedMain.authorityScore === later.scores.authority, "CLUSTER_AUTHORITY_CACHE_WRONG");

    console.log("EVENT_SIGNAL_HN_ADAPTER=PASS");
    console.log("EVENT_SIGNAL_GITHUB_ADAPTER=PASS");
    console.log("EVENT_SIGNAL_PLATFORM_ISOLATION=PASS");
    console.log("EVENT_SIGNAL_TIME_DECAY=PASS");
    console.log("EVENT_SIGNAL_AUTHORITY=PASS");
    console.log("EVENT_SIGNAL_FALLBACK=PASS");
    console.log("EVENT_SIGNAL_UPSERT=PASS");
    console.log("EVENT_SIGNAL_CLUSTER_CACHE=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
