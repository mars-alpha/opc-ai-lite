import "server-only";

import { desc, eq } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentEvents,
  contentExpansionRuns,
  contentSources
} from "../db/schema";
import { fetchPublicJson } from "./collection-runner";
import { runFreshScan } from "./discovery";
import { buildExpansionQueries } from "./discovery-contract";
import { runEventClustering } from "./event-clustering";
import { calculateEventClusterSignals } from "./event-signal";
import {
  collectSearchDiscovery,
  SEARCH_DISCOVERY_PROVIDERS,
  type SearchDiscoveryProvider
} from "./search-discovery";

const DEFAULT_WINDOW_HOURS = 72;
const DEFAULT_RESULT_LIMIT = 20;
const MAX_QUERIES = 4;

type ExpansionInput = {
  providers?: unknown;
  windowHours?: unknown;
  resultLimit?: unknown;
  maxQueries?: unknown;
};

type ExpansionDependencies = {
  fetchJson?: (url: string) => Promise<unknown>;
};

function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function resolveProviders(value: unknown): SearchDiscoveryProvider[] {
  if (!Array.isArray(value) || value.length === 0) return [...SEARCH_DISCOVERY_PROVIDERS];
  const providers = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toUpperCase())
    .filter((item): item is SearchDiscoveryProvider =>
      SEARCH_DISCOVERY_PROVIDERS.includes(item as SearchDiscoveryProvider)
    );
  return [...new Set(providers)].slice(0, SEARCH_DISCOVERY_PROVIDERS.length);
}

function errorCode(error: unknown) {
  if (error instanceof Error && /^[A-Z0-9_:-]+$/.test(error.message)) return error.message;
  return "EXPANSION_FAILED";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1500) : String(error).slice(0, 1500);
}

function expansionSourceDefinition(provider: SearchDiscoveryProvider) {
  if (provider === "GITHUB_SEARCH") {
    return {
      id: "source_expansion_github_search",
      name: "GitHub Search · Event Expansion",
      platform: "GITHUB",
      authorityScore: 75
    };
  }
  return {
    id: "source_expansion_hn_algolia",
    name: "HN Algolia · Event Expansion",
    platform: "HACKER_NEWS",
    authorityScore: 65
  };
}

export async function ensureExpansionSource(provider: SearchDiscoveryProvider) {
  const db = getDatabase();
  const definition = expansionSourceDefinition(provider);
  const [existing] = await db.select().from(contentSources).where(eq(contentSources.id, definition.id)).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(contentSources)
    .values({
      id: definition.id,
      name: definition.name,
      sourceType: "DISCOVERY",
      canonicalUrl: null,
      providerRef: provider,
      status: "ACTIVE",
      platform: definition.platform,
      collectionMethod: "SEARCH",
      enabled: true,
      authorityScore: definition.authorityScore,
      topics: ["event-expansion"],
      collectionConfig: { provider, systemManaged: true },
      signalConfig: {},
      metadata: { systemManaged: true, purpose: "EVENT_EXPANSION" }
    })
    .returning();
  return created;
}

export async function listEventExpansionRuns(eventId: string, limit = 40) {
  return getDatabase()
    .select()
    .from(contentExpansionRuns)
    .where(eq(contentExpansionRuns.eventId, eventId))
    .orderBy(desc(contentExpansionRuns.startedAt))
    .limit(Math.max(1, Math.min(100, limit)));
}

export async function runEventExpansion(
  user: AuthUser,
  eventId: string,
  input: ExpansionInput = {},
  dependencies: ExpansionDependencies = {}
) {
  const db = getDatabase();
  const [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const windowHours = boundedInteger(input.windowHours, DEFAULT_WINDOW_HOURS, 24, 72);
  const resultLimit = boundedInteger(input.resultLimit, DEFAULT_RESULT_LIMIT, 1, 50);
  const maxQueries = boundedInteger(input.maxQueries, MAX_QUERIES, 1, MAX_QUERIES);
  const providers = resolveProviders(input.providers);
  if (providers.length === 0) throw new Error("EXPANSION_PROVIDER_REQUIRED");

  const plan = buildExpansionQueries({
    title: event.title,
    keywords: event.keywords,
    entities: event.entities,
    maxQueries
  });
  if (plan.queries.length === 0) throw new Error("EXPANSION_QUERY_REQUIRED");

  const fetchJson = dependencies.fetchJson ?? fetchPublicJson;
  const completed = [];

  for (const provider of providers) {
    const source = await ensureExpansionSource(provider);

    for (const query of plan.queries) {
      const [run] = await db
        .insert(contentExpansionRuns)
        .values({
          eventId,
          sourceId: source.id,
          query,
          provider,
          windowHours,
          resultLimit,
          status: "RUNNING",
          triggeredByEmail: user.email,
          metadata: { eventTitle: event.title }
        })
        .returning();

      try {
        const search = await collectSearchDiscovery(
          { provider, searchQuery: query, windowHours, resultLimit },
          fetchJson
        );
        const result = await runFreshScan({ sourceId: source.id, items: search.items });
        const [finished] = await db
          .update(contentExpansionRuns)
          .set({
            status: "SUCCEEDED",
            receivedCount: search.items.length,
            createdCount: result.created,
            duplicateCount: result.duplicates,
            finishedAt: new Date(),
            metadata: {
              eventTitle: event.title,
              requestUrl: search.requestUrl,
              rawItemIds: result.rawItemIds.slice(0, 100),
              createdRawItemIds: result.createdRawItemIds.slice(0, 100)
            }
          })
          .where(eq(contentExpansionRuns.id, run.id))
          .returning();
        completed.push(finished);
      } catch (error) {
        const [failed] = await db
          .update(contentExpansionRuns)
          .set({
            status: "FAILED",
            errorCode: errorCode(error),
            errorMessage: errorMessage(error),
            finishedAt: new Date()
          })
          .where(eq(contentExpansionRuns.id, run.id))
          .returning();
        completed.push(failed);
      }
    }
  }

  const cluster = await runEventClustering(eventId);
  const signal = await calculateEventClusterSignals(eventId);

  return {
    eventId,
    queries: plan.queries,
    providers,
    windowHours,
    resultLimit,
    runs: completed,
    clusterId: cluster?.cluster.id ?? null,
    clusterMemberCount: cluster?.researchPack.memberEventCount ?? 1,
    signalScores: signal.scores,
    summary: {
      total: completed.length,
      succeeded: completed.filter((run) => run.status === "SUCCEEDED").length,
      failed: completed.filter((run) => run.status === "FAILED").length,
      received: completed.reduce((sum, run) => sum + run.receivedCount, 0),
      created: completed.reduce((sum, run) => sum + run.createdCount, 0),
      duplicates: completed.reduce((sum, run) => sum + run.duplicateCount, 0)
    }
  };
}
