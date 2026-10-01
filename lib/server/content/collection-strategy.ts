import "server-only";

import { createHash } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentCollectionStrategies,
  contentCollectionStrategySources,
  contentSources
} from "../db/schema";
import {
  callConfiguredChatJson,
  getConfiguredChatModelConfig,
  type ConfiguredChatModelConfig
} from "../ai/configured-chat";
import { canonicalizeOriginalUrl } from "./discovery";
import { runSourceCollection } from "./collection-runner";
import { recordContentAudit } from "./workbench";

export const COLLECTION_STRATEGY_AI_MODES = ["NONE", "SYSTEM_DEFAULT", "CUSTOM"] as const;
export type CollectionStrategyAiMode = (typeof COLLECTION_STRATEGY_AI_MODES)[number];

type StrategyInput = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  aiMode?: unknown;
  modelRef?: unknown;
  topics?: unknown;
  competitorAccounts?: unknown;
  collectComments?: unknown;
  filters?: unknown;
  advancedConfig?: unknown;
  enabled?: unknown;
};

type ParsedIntent = {
  summary: string;
  searchQuery: string;
  suggestedTopics: string[];
};

type StrategyTestDependencies = {
  runSource?: typeof runSourceCollection;
  parseIntent?: (
    mode: CollectionStrategyAiMode,
    modelRef: string | null,
    description: string,
    topics: string[]
  ) => Promise<ParsedIntent>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalText(value: unknown, max = 2000) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_STRATEGY_TEXT");
  const normalized = value.trim();
  if (normalized.length > max) throw new Error("INVALID_STRATEGY_TEXT");
  return normalized || null;
}

function stringArray(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => item.length <= maxLength)
  )].slice(0, maxItems);
}

function aiMode(value: unknown): CollectionStrategyAiMode {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "NONE";
  if (!COLLECTION_STRATEGY_AI_MODES.includes(normalized as CollectionStrategyAiMode)) {
    throw new Error("INVALID_STRATEGY_AI_MODE");
  }
  return normalized as CollectionStrategyAiMode;
}

function cleanNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeFilters(value: unknown) {
  const input = isRecord(value) ? value : {};
  return {
    minLikes: cleanNumber(input.minLikes),
    minComments: cleanNumber(input.minComments),
    minFavorites: cleanNumber(input.minFavorites),
    minViews: cleanNumber(input.minViews),
    minFollowers: cleanNumber(input.minFollowers),
    minPlayFollowerRatio: cleanNumber(input.minPlayFollowerRatio)
  };
}

function normalizeAdvanced(value: unknown) {
  const input = isRecord(value) ? value : {};
  const window = Number(input.windowHours);
  const windowHours = Number.isFinite(window) && window > 0 ? Math.min(24 * 30, Math.round(window)) : 72;
  const languagePolicy =
    typeof input.languagePolicy === "string" &&
    ["ZH_PREFERRED", "ZH_EN", "ANY"].includes(input.languagePolicy)
      ? input.languagePolicy
      : "ZH_EN";
  const updateFrequency =
    typeof input.updateFrequency === "string" &&
    ["SYSTEM_DEFAULT", "HOURLY", "THREE_HOURLY", "DAILY", "MANUAL"].includes(input.updateFrequency)
      ? input.updateFrequency
      : "SYSTEM_DEFAULT";
  return { windowHours, languagePolicy, updateFrequency };
}

function strategyId(value: unknown) {
  if (typeof value === "string" && /^strategy_[a-zA-Z0-9_-]{3,120}$/.test(value.trim())) {
    return value.trim();
  }
  return "strategy_" + Date.now();
}

function deriveName(description: string | null, topics: string[], competitors: string[]) {
  if (topics.length) return topics.slice(0, 3).join(" · ").slice(0, 80);
  if (description) return description.replace(/\s+/g, " ").slice(0, 32);
  if (competitors.length) {
    try {
      return new URL(competitors[0]).hostname.replace(/^www\./, "").slice(0, 80);
    } catch {}
  }
  return "采集策略";
}

function validateUrlList(values: string[]) {
  return values.map((value) => {
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
      return url.toString();
    } catch {
      throw new Error("INVALID_COMPETITOR_URL");
    }
  });
}

function modelConfigFor(mode: CollectionStrategyAiMode, modelRef: string | null) {
  if (mode === "NONE") return null;
  const configured = getConfiguredChatModelConfig();
  if (!configured) throw new Error("STRATEGY_AI_MODEL_NOT_CONFIGURED");
  if (mode === "CUSTOM") {
    if (!modelRef) throw new Error("STRATEGY_MODEL_REF_REQUIRED");
    return { ...configured, model: modelRef } satisfies ConfiguredChatModelConfig;
  }
  return configured;
}

function validateParsedIntent(value: unknown): ParsedIntent {
  if (!isRecord(value)) throw new Error("STRATEGY_AI_INVALID");
  const summary = optionalText(value.summary, 500);
  const searchQuery = optionalText(value.searchQuery, 500);
  if (!summary || !searchQuery) throw new Error("STRATEGY_AI_INVALID");
  return {
    summary,
    searchQuery,
    suggestedTopics: stringArray(value.suggestedTopics, 12, 80)
  };
}

async function parseStrategyIntent(
  mode: CollectionStrategyAiMode,
  modelRef: string | null,
  description: string,
  topics: string[]
) {
  const config = modelConfigFor(mode, modelRef);
  if (!config) {
    return {
      summary: description || topics.join("，"),
      searchQuery: topics.join(" "),
      suggestedTopics: topics
    } satisfies ParsedIntent;
  }

  const result = await callConfiguredChatJson(
    {
      systemPrompt:
        "你是采集策略解析 Skill。只把管理员自然语言转成结构化采集意图，不执行采集、不决定业务状态、不生成或猜测具体网站 URL。" +
        "返回 JSON：{summary:string,searchQuery:string,suggestedTopics:string[]}。" +
        "searchQuery 应适合搜索最新内容；suggestedTopics 只保留长期有用主题。",
      userPayload: { description, topics },
      temperature: 0.1
    },
    { config }
  );
  return validateParsedIntent(result.data);
}

function sourceHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 20);
}

function detectPlatform(url: string) {
  const host = new URL(url).hostname.toLowerCase();
  if (host === "github.com" || host.endsWith(".github.com")) return "GITHUB";
  if (host.includes("youtube.com") || host === "youtu.be") return "YOUTUBE";
  if (
    host.includes("xiaohongshu.com") ||
    host.includes("douyin.com") ||
    host.includes("bilibili.com") ||
    host.includes("weibo.com") ||
    host.includes("zhihu.com")
  ) return "SOCIAL";
  return "WEB";
}

function detectCollectionMethod(url: string) {
  const value = url.toLowerCase();
  return /\.(rss|xml)(?:$|[?#])/.test(value) || /\/(feed|rss|atom)(?:\/|$|[?#])/.test(value)
    ? "RSS"
    : "HTTP";
}

async function ensureUrlSource(urlInput: string, strategyIdValue: string) {
  const db = getDatabase();
  const canonicalUrl = canonicalizeOriginalUrl(urlInput) ?? urlInput;
  const [existing] = await db
    .select()
    .from(contentSources)
    .where(eq(contentSources.canonicalUrl, canonicalUrl))
    .limit(1);
  if (existing) return existing;

  const host = new URL(canonicalUrl).hostname.replace(/^www\./, "");
  const platform = detectPlatform(canonicalUrl);
  const [created] = await db
    .insert(contentSources)
    .values({
      id: "source_strategy_url_" + sourceHash(canonicalUrl),
      name: host,
      sourceType: "DISCOVERY",
      canonicalUrl,
      providerRef: "STRATEGY_URL_" + sourceHash(canonicalUrl),
      status: "ACTIVE",
      platform,
      collectionMethod: detectCollectionMethod(canonicalUrl),
      enabled: true,
      authorityScore: 60,
      topics: [],
      collectionConfig: {},
      signalConfig: {},
      metadata: {
        systemManaged: true,
        strategyManaged: true,
        strategyId: strategyIdValue,
        mediaPolicy: "REFERENCE_ONLY"
      }
    })
    .returning();
  return created;
}

async function ensureSearchSource(
  provider: "HN_ALGOLIA" | "GITHUB_SEARCH",
  query: string,
  windowHours: number,
  strategyIdValue: string
) {
  const db = getDatabase();
  const ref = "STRATEGY_" + provider + "_" + sourceHash(query);
  const [existing] = await db
    .select()
    .from(contentSources)
    .where(eq(contentSources.providerRef, ref))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(contentSources)
    .values({
      id: "source_strategy_" + provider.toLowerCase() + "_" + sourceHash(query),
      name: (provider === "HN_ALGOLIA" ? "HN" : "GitHub") + " · " + query.slice(0, 60),
      sourceType: "DISCOVERY",
      canonicalUrl: null,
      providerRef: ref,
      status: "ACTIVE",
      platform: provider === "GITHUB_SEARCH" ? "GITHUB" : "WEB",
      collectionMethod: "SEARCH",
      enabled: true,
      authorityScore: provider === "GITHUB_SEARCH" ? 72 : 65,
      topics: [],
      collectionConfig: {
        provider,
        searchQuery: query,
        windowHours,
        resultLimit: 12
      },
      signalConfig: {},
      metadata: {
        systemManaged: true,
        strategyManaged: true,
        strategyId: strategyIdValue,
        mediaPolicy: "REFERENCE_ONLY"
      }
    })
    .returning();
  return created;
}

export async function listCollectionStrategies() {
  return getDatabase()
    .select()
    .from(contentCollectionStrategies)
    .where(eq(contentCollectionStrategies.status, "ACTIVE"))
    .orderBy(contentCollectionStrategies.updatedAt);
}

export async function saveCollectionStrategy(user: AuthUser, input: StrategyInput) {
  const db = getDatabase();
  const id = strategyId(input.id);
  const explicitName = optionalText(input.name, 80);
  const mode = aiMode(input.aiMode);
  const description = optionalText(input.description, 4000);
  const modelRef = optionalText(input.modelRef, 200);
  const topics = stringArray(input.topics, 30, 80);
  const competitors = validateUrlList(stringArray(input.competitorAccounts, 20, 2000));
  const collectComments = input.collectComments === true;
  const filters = normalizeFilters(input.filters);
  const advancedConfig = normalizeAdvanced(input.advancedConfig);

  if (mode !== "NONE" && !description) throw new Error("STRATEGY_DESCRIPTION_REQUIRED");
  if (mode === "CUSTOM" && !modelRef) throw new Error("STRATEGY_MODEL_REF_REQUIRED");
  if (mode === "NONE" && topics.length === 0 && competitors.length === 0) {
    throw new Error("STRATEGY_RULE_REQUIRED_WITHOUT_AI");
  }

  const [existing] = await db
    .select()
    .from(contentCollectionStrategies)
    .where(eq(contentCollectionStrategies.id, id))
    .limit(1);

  const values = {
    name: explicitName ?? deriveName(description, topics, competitors),
    description,
    aiMode: mode,
    modelRef: mode === "CUSTOM" ? modelRef : null,
    topics,
    competitorAccounts: competitors,
    collectComments,
    filters,
    advancedConfig,
    status: "ACTIVE",
    enabled: input.enabled !== false,
    updatedAt: new Date()
  };

  const [item] = existing
    ? await db.update(contentCollectionStrategies).set(values).where(eq(contentCollectionStrategies.id, id)).returning()
    : await db.insert(contentCollectionStrategies).values({ id, ...values }).returning();

  await recordContentAudit(user, {
    action: existing ? "COLLECTION_STRATEGY_UPDATED" : "COLLECTION_STRATEGY_CREATED",
    entityType: "COLLECTION_STRATEGY",
    entityId: id,
    before: existing ?? null,
    after: item
  });

  return item;
}

export async function testCollectionStrategy(
  user: AuthUser,
  strategyIdValue: string,
  dependencies: StrategyTestDependencies = {}
) {
  const db = getDatabase();
  const [strategy] = await db
    .select()
    .from(contentCollectionStrategies)
    .where(eq(contentCollectionStrategies.id, strategyIdValue))
    .limit(1);
  if (!strategy) throw new Error("COLLECTION_STRATEGY_NOT_FOUND");

  const description = typeof strategy.description === "string" ? strategy.description : "";
  const topics = stringArray(strategy.topics, 30, 80);
  const competitors = validateUrlList(stringArray(strategy.competitorAccounts, 20, 2000));
  const advanced = normalizeAdvanced(strategy.advancedConfig);

  let parsed: ParsedIntent;
  try {
    const parser = dependencies.parseIntent ?? parseStrategyIntent;
    parsed = await parser(
      aiMode(strategy.aiMode),
      typeof strategy.modelRef === "string" ? strategy.modelRef : null,
      description,
      topics
    );
  } catch (error) {
    const [updated] = await db
      .update(contentCollectionStrategies)
      .set({
        testStatus: "FAILED",
        lastTestedAt: new Date(),
        testResult: {
          error: error instanceof Error ? error.message : "STRATEGY_AI_FAILED",
          mediaPolicy: "REFERENCE_ONLY"
        },
        updatedAt: new Date()
      })
      .where(eq(contentCollectionStrategies.id, strategy.id))
      .returning();
    return updated;
  }

  const resolvedSources = [];
  for (const url of competitors.slice(0, 8)) {
    resolvedSources.push(await ensureUrlSource(url, strategy.id));
  }

  const query = parsed.searchQuery.trim() || topics.join(" ");
  if (query) {
    resolvedSources.push(await ensureSearchSource("HN_ALGOLIA", query, advanced.windowHours, strategy.id));
    resolvedSources.push(await ensureSearchSource("GITHUB_SEARCH", query, advanced.windowHours, strategy.id));
  }

  const uniqueSources = [...new Map(resolvedSources.map((source) => [source.id, source])).values()];
  if (!uniqueSources.length) {
    const [updated] = await db
      .update(contentCollectionStrategies)
      .set({
        testStatus: "FAILED",
        lastTestedAt: new Date(),
        testResult: {
          error: "STRATEGY_SOURCE_UNRESOLVED",
          parsed,
          mediaPolicy: "REFERENCE_ONLY"
        },
        updatedAt: new Date()
      })
      .where(eq(contentCollectionStrategies.id, strategy.id))
      .returning();
    return updated;
  }

  await db
    .delete(contentCollectionStrategySources)
    .where(eq(contentCollectionStrategySources.strategyId, strategy.id));
  await db.insert(contentCollectionStrategySources).values(
    uniqueSources.map((source) => ({
      strategyId: strategy.id,
      sourceId: source.id,
      role: "RESOLVED"
    }))
  );

  const results: Array<{ sourceId: string; status: string; created?: number; duplicates?: number; error?: string }> = [];
  const runner = dependencies.runSource ?? runSourceCollection;
  for (const source of uniqueSources.slice(0, 3)) {
    try {
      const run = await runner(user, source.id);
      results.push({
        sourceId: source.id,
        status: "SUCCEEDED",
        created: run.createdCount,
        duplicates: run.duplicateCount
      });
    } catch (error) {
      results.push({
        sourceId: source.id,
        status: "FAILED",
        error: error instanceof Error ? error.message : "COLLECTION_TEST_FAILED"
      });
    }
  }

  const successCount = results.filter((item) => item.status === "SUCCEEDED").length;
  const failedCount = results.length - successCount;
  const testStatus = successCount === 0 ? "FAILED" : failedCount > 0 ? "PARTIAL" : "PASSED";

  const [updated] = await db
    .update(contentCollectionStrategies)
    .set({
      testStatus,
      lastTestedAt: new Date(),
      testResult: {
        parsed,
        resolvedSourceCount: uniqueSources.length,
        testedSourceCount: results.length,
        successCount,
        failedCount,
        results,
        mediaPolicy: "REFERENCE_ONLY"
      },
      updatedAt: new Date()
    })
    .where(eq(contentCollectionStrategies.id, strategy.id))
    .returning();

  await recordContentAudit(user, {
    action: "COLLECTION_STRATEGY_TESTED",
    entityType: "COLLECTION_STRATEGY",
    entityId: strategy.id,
    after: updated,
    metadata: { testStatus, resolvedSourceCount: uniqueSources.length }
  });

  return updated;
}

export async function setCollectionStrategyEnabled(user: AuthUser, strategyIdValue: string, enabled: boolean) {
  const db = getDatabase();
  const [existing] = await db
    .select()
    .from(contentCollectionStrategies)
    .where(eq(contentCollectionStrategies.id, strategyIdValue))
    .limit(1);
  if (!existing) throw new Error("COLLECTION_STRATEGY_NOT_FOUND");

  const [item] = await db
    .update(contentCollectionStrategies)
    .set({ enabled, updatedAt: new Date() })
    .where(eq(contentCollectionStrategies.id, strategyIdValue))
    .returning();

  await recordContentAudit(user, {
    action: enabled ? "COLLECTION_STRATEGY_ENABLED" : "COLLECTION_STRATEGY_DISABLED",
    entityType: "COLLECTION_STRATEGY",
    entityId: strategyIdValue,
    before: existing,
    after: item
  });
  return item;
}

export async function archiveCollectionStrategy(user: AuthUser, strategyIdValue: string) {
  const db = getDatabase();
  const [existing] = await db
    .select()
    .from(contentCollectionStrategies)
    .where(eq(contentCollectionStrategies.id, strategyIdValue))
    .limit(1);
  if (!existing) throw new Error("COLLECTION_STRATEGY_NOT_FOUND");

  const linked = await db
    .select({ sourceId: contentCollectionStrategySources.sourceId })
    .from(contentCollectionStrategySources)
    .where(eq(contentCollectionStrategySources.strategyId, strategyIdValue));
  if (linked.length) {
    await db
      .delete(contentCollectionStrategySources)
      .where(eq(contentCollectionStrategySources.strategyId, strategyIdValue));
  }

  const [item] = await db
    .update(contentCollectionStrategies)
    .set({ status: "ARCHIVED", enabled: false, updatedAt: new Date() })
    .where(eq(contentCollectionStrategies.id, strategyIdValue))
    .returning();

  await recordContentAudit(user, {
    action: "COLLECTION_STRATEGY_ARCHIVED",
    entityType: "COLLECTION_STRATEGY",
    entityId: strategyIdValue,
    before: existing,
    after: item,
    metadata: { detachedSourceIds: linked.map((entry) => entry.sourceId) }
  });
  return item;
}
