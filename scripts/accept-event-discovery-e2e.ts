import { loadEnvConfig } from "@next/env";
import { and, desc, eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import { runSourceCollection } from "../lib/server/content/collection-runner";
import { runEventExpansion } from "../lib/server/content/collection-expansion";
import { listEvents } from "../lib/server/content/discovery";
import {
  getCurrentEventAiAnalysis,
  runEventAiAnalysis
} from "../lib/server/content/event-ai-analysis";
import { getConfiguredChatModelConfig } from "../lib/server/ai/configured-chat";

loadEnvConfig(process.cwd());

const SOURCE_IDS = [
  "source_e2e_hn_live",
  "source_e2e_github_live"
] as const;

const user = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "event-discovery-e2e@opc.local",
  displayName: "Event Discovery E2E",
  role: "ADMIN" as const
};

async function ensureSources() {
  const db = getDatabase();
  const definitions = [
    {
      id: SOURCE_IDS[0],
      name: "E2E · HN 最新 AI",
      platform: "HACKER_NEWS",
      providerRef: "EVENT_DISCOVERY_E2E_HN",
      authorityScore: 65,
      collectionConfig: {
        provider: "HN_ALGOLIA",
        searchQuery: "AI",
        windowHours: 24,
        resultLimit: 8
      }
    },
    {
      id: SOURCE_IDS[1],
      name: "E2E · GitHub 最新 AI",
      platform: "GITHUB",
      providerRef: "EVENT_DISCOVERY_E2E_GITHUB",
      authorityScore: 72,
      collectionConfig: {
        provider: "GITHUB_SEARCH",
        searchQuery: "AI",
        windowHours: 24,
        resultLimit: 8
      }
    }
  ];

  for (const source of definitions) {
    const [existing] = await db
      .select({ id: contentSources.id })
      .from(contentSources)
      .where(eq(contentSources.id, source.id))
      .limit(1);

    if (existing) {
      await db
        .update(contentSources)
        .set({
          name: source.name,
          sourceType: "DISCOVERY",
          status: "ACTIVE",
          platform: source.platform,
          collectionMethod: "SEARCH",
          enabled: true,
          providerRef: source.providerRef,
          authorityScore: source.authorityScore,
          topics: ["event-discovery-e2e"],
          collectionConfig: source.collectionConfig,
          signalConfig: {},
          metadata: { systemManaged: true, purpose: "EVENT_DISCOVERY_E2E" },
          updatedAt: new Date()
        })
        .where(eq(contentSources.id, source.id));
      continue;
    }

    await db.insert(contentSources).values({
      id: source.id,
      name: source.name,
      sourceType: "DISCOVERY",
      status: "ACTIVE",
      platform: source.platform,
      collectionMethod: "SEARCH",
      enabled: true,
      providerRef: source.providerRef,
      authorityScore: source.authorityScore,
      topics: ["event-discovery-e2e"],
      collectionConfig: source.collectionConfig,
      signalConfig: {},
      metadata: { systemManaged: true, purpose: "EVENT_DISCOVERY_E2E" }
    });
  }
}

async function selectFreshEvent() {
  const db = getDatabase();
  const raws = await db
    .select()
    .from(contentRawItems)
    .where(inArray(contentRawItems.sourceId, [...SOURCE_IDS]))
    .orderBy(desc(contentRawItems.collectedAt))
    .limit(40);
  if (!raws.length) return null;

  const rankedRaw = [...raws].sort((a, b) => {
    const sourcePriority = (item: typeof a) => item.sourceId === SOURCE_IDS[0] ? 2 : 1;
    const engagement = (item: typeof a) => {
      const metrics =
        item.platformMetrics && typeof item.platformMetrics === "object" && !Array.isArray(item.platformMetrics)
          ? item.platformMetrics as Record<string, unknown>
          : {};
      if (item.platform === "HACKER_NEWS") {
        const points = typeof metrics.points === "number" ? metrics.points : 0;
        const comments = typeof metrics.comments === "number" ? metrics.comments : 0;
        return points + comments * 2;
      }
      const stars = typeof metrics.stars === "number" ? metrics.stars : 0;
      const forks = typeof metrics.forks === "number" ? metrics.forks : 0;
      return Math.log1p(stars) * 2 + Math.log1p(forks);
    };
    return (
      sourcePriority(b) - sourcePriority(a) ||
      engagement(b) - engagement(a) ||
      new Date(b.publishedAt ?? b.collectedAt).getTime() -
        new Date(a.publishedAt ?? a.collectedAt).getTime()
    );
  });

  const rawIds = rankedRaw.map((item) => item.id);
  const links = await db
    .select({ eventId: contentEventRawItems.eventId, rawItemId: contentEventRawItems.rawItemId })
    .from(contentEventRawItems)
    .where(inArray(contentEventRawItems.rawItemId, rawIds));
  if (!links.length) return null;

  const eventIds = [...new Set(links.map((item) => item.eventId))];
  const events = await db
    .select()
    .from(contentEvents)
    .where(inArray(contentEvents.id, eventIds));
  const eventById = new Map(events.map((item) => [item.id, item]));
  const linkByRawId = new Map(links.map((item) => [item.rawItemId, item]));

  for (const raw of rankedRaw) {
    const link = linkByRawId.get(raw.id);
    const event = link ? eventById.get(link.eventId) : null;
    if (event?.discoveryStatus === "DISCOVERED") return event;
  }
  return events[0] ?? null;
}

async function main() {
  await ensureSources();

  const createdRawItemIds: string[] = [];
  const sourceRuns = [];

  for (const sourceId of SOURCE_IDS) {
    try {
      const run = await runSourceCollection(user, sourceId);
      sourceRuns.push(run);
      const metadata = run.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata)
        ? run.metadata as Record<string, unknown>
        : {};
      const ids = Array.isArray(metadata.createdRawItemIds)
        ? metadata.createdRawItemIds.filter((item): item is string => typeof item === "string")
        : [];
      createdRawItemIds.push(...ids);
      console.log(
        "EVENT_DISCOVERY_E2E_SOURCE=" +
          sourceId +
          " status=" +
          run.status +
          " received=" +
          run.receivedCount +
          " created=" +
          run.createdCount +
          " duplicates=" +
          run.duplicateCount
      );
    } catch (error) {
      console.log(
        "EVENT_DISCOVERY_E2E_SOURCE_FAILED=" +
          sourceId +
          " error=" +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  if (!sourceRuns.some((run) => run.status === "SUCCEEDED")) {
    console.log("EVENT_DISCOVERY_E2E_NETWORK_PENDING=TRUE");
    process.exitCode = 2;
    return;
  }

  const event = await selectFreshEvent();
  if (!event) {
    console.log("EVENT_DISCOVERY_E2E_NO_EVENT=TRUE");
    process.exitCode = 3;
    return;
  }

  console.log("EVENT_DISCOVERY_E2E_EVENT_ID=" + event.id);
  console.log("EVENT_DISCOVERY_E2E_EVENT_TITLE=" + event.title);

  const expansion = await runEventExpansion(
    user,
    event.id,
    {
      providers: ["HN_ALGOLIA", "GITHUB_SEARCH"],
      windowHours: 72,
      resultLimit: 8,
      maxQueries: 3
    }
  );

  console.log(
    "EVENT_DISCOVERY_E2E_EXPANSION=PASS received=" +
      expansion.summary.received +
      " created=" +
      expansion.summary.created +
      " duplicates=" +
      expansion.summary.duplicates +
      " failed=" +
      expansion.summary.failed
  );
  console.log("EVENT_DISCOVERY_E2E_CLUSTER_ID=" + (expansion.clusterId ?? "NONE"));
  console.log("EVENT_DISCOVERY_E2E_CLUSTER_MEMBERS=" + expansion.clusterMemberCount);
  console.log(
    "EVENT_DISCOVERY_E2E_SIGNAL=PASS hotness=" +
      expansion.signalScores.hotness +
      " velocity=" +
      expansion.signalScores.velocity +
      " authority=" +
      expansion.signalScores.authority
  );

  const config = getConfiguredChatModelConfig();
  if (!config) {
    console.log("EVENT_DISCOVERY_E2E_MODEL_CONFIG_PENDING=TRUE");
  } else {
    const ai = await runEventAiAnalysis(event.id);
    console.log("EVENT_DISCOVERY_E2E_AI_ANALYSIS=PASS aiRunId=" + ai.aiRunId);
    console.log("EVENT_DISCOVERY_E2E_AI_RELEVANCE=" + ai.analysis.opcRelevanceScore);
  }

  const current = await getCurrentEventAiAnalysis(event.id);
  if (current) {
    console.log("EVENT_DISCOVERY_E2E_CURRENT_ANALYSIS_ID=" + current.id);
  }

  const listed = await listEvents(100);
  const visible = listed.find((item) => item.id === event.id);
  if (!visible) throw new Error("E2E_EVENT_NOT_VISIBLE_IN_ADMIN_LIST");

  if (visible.discoveryStatus !== "DISCOVERED") {
    throw new Error("E2E_EVENT_DECISION_STATE_CHANGED");
  }

  console.log("EVENT_DISCOVERY_E2E_ADMIN_VISIBILITY=PASS");
  console.log("EVENT_DISCOVERY_E2E_HUMAN_DECISION_PENDING=TRUE");
  console.log("EVENT_DISCOVERY_E2E_SYSTEM_CHAIN=PASS");
}

main()
  .then(async () => {
    await closeDatabase();
  })
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
