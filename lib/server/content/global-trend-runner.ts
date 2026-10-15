import "server-only";

import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import { contentSources } from "../db/schema";
import { eq } from "drizzle-orm";
import { runSourceCollection } from "./collection-runner";

export const GLOBAL_BROWSER_FALLBACK_PROVIDERS = [
  "HUGGINGFACE_MODELS",
  "HUGGINGFACE_PAPERS",
  "REDDIT_AI_HOT"
] as const;

type GlobalBrowserFallbackProvider =
  (typeof GLOBAL_BROWSER_FALLBACK_PROVIDERS)[number];

type RunnerItem = {
  rank?: unknown;
  title?: unknown;
  url?: unknown;
  author?: unknown;
  excerpt?: unknown;
  publishedAt?: unknown;
  likes?: unknown;
  comments?: unknown;
  downloads?: unknown;
  points?: unknown;
  votes?: unknown;
};

type RunnerPayload = {
  sourceId?: unknown;
  provider?: unknown;
  capturedAt?: unknown;
  sessionRef?: unknown;
  items?: unknown;
};

function text(value: unknown, max = 4000) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : null;
}

function finiteNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function provider(value: unknown): GlobalBrowserFallbackProvider {
  const normalized =
    typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!GLOBAL_BROWSER_FALLBACK_PROVIDERS.includes(normalized as GlobalBrowserFallbackProvider)) {
    throw new Error("GLOBAL_TREND_RUNNER_PROVIDER_UNSUPPORTED");
  }
  return normalized as GlobalBrowserFallbackProvider;
}

function sourceProvider(source: { collectionConfig: unknown }) {
  if (
    !source.collectionConfig ||
    typeof source.collectionConfig !== "object" ||
    Array.isArray(source.collectionConfig)
  ) return null;
  const value = (source.collectionConfig as Record<string, unknown>).provider;
  return typeof value === "string" ? value.toUpperCase() : null;
}

export function normalizeGlobalTrendRunnerPayload(input: RunnerPayload) {
  const resolvedProvider = provider(input?.provider);
  const sourceId = text(input?.sourceId, 300);
  if (!sourceId) throw new Error("GLOBAL_TREND_RUNNER_SOURCE_REQUIRED");
  const capturedAt = text(input?.capturedAt, 80) ?? new Date().toISOString();
  const sessionRef = text(input?.sessionRef, 120);
  const rows = Array.isArray(input?.items) ? input.items : [];
  if (!rows.length || rows.length > 100) throw new Error("GLOBAL_TREND_RUNNER_ITEMS_REQUIRED");

  const items = rows.flatMap((raw, index) => {
    const row = raw && typeof raw === "object" && !Array.isArray(raw)
      ? raw as RunnerItem
      : {};
    const title = text(row.title, 500);
    const url = text(row.url, 2000);
    if (!title || !url) return [];
    const rank = finiteNumber(row.rank) ?? index + 1;
    return [{
      externalId: resolvedProvider.toLowerCase() + ":browser:" + rank + ":" + title.slice(0, 80),
      originalUrl: url,
      title,
      author: text(row.author, 300),
      excerpt: text(row.excerpt, 12_000),
      publishedAt: text(row.publishedAt, 80),
      platformMetrics: {
        likes: finiteNumber(row.likes),
        comments: finiteNumber(row.comments),
        downloads: finiteNumber(row.downloads),
        points: finiteNumber(row.points),
        votes: finiteNumber(row.votes),
        trendRank: rank
      },
      metadata: {
        collector: "trend_browser_fallback",
        trendProvider: resolvedProvider,
        trendSignalType: "RANKING",
        sourceMode: "BROWSER_PUBLIC",
        directHttp: "NETWORK_UNREACHABLE_FALLBACK",
        capturedAt,
        sessionRef,
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
  if (!items.length) throw new Error("GLOBAL_TREND_RUNNER_NO_VALID_ITEMS");
  return { sourceId, provider: resolvedProvider, capturedAt, sessionRef, items };
}

export async function ingestGlobalTrendRunnerPayload(
  user: AuthUser,
  input: RunnerPayload
) {
  const normalized = normalizeGlobalTrendRunnerPayload(input);
  const [source] = await getDatabase()
    .select()
    .from(contentSources)
    .where(eq(contentSources.id, normalized.sourceId))
    .limit(1);
  if (!source) throw new Error("DISCOVERY_SOURCE_NOT_FOUND");
  if (sourceProvider(source) !== normalized.provider) {
    throw new Error("GLOBAL_TREND_RUNNER_SOURCE_PROVIDER_MISMATCH");
  }
  return runSourceCollection(
    user,
    source.id,
    {},
    async () => normalized.items
  );
}
