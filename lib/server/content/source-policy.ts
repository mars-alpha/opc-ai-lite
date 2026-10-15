import "server-only";

import { eq, sql } from "drizzle-orm";
import {
  INITIAL_SOURCE_POLICIES,
  INTELLIGENCE_POLICY_VERSION,
  contentRuleFor,
  sourcePolicyByIdentity,
  type CollectionContentType,
  type SourceContentRule,
  type SourcePolicy
} from "../../content/intelligence-policy";
import { getDatabase } from "../db";
import { contentSources } from "../db/schema";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function hostname(value: string | null | undefined) {
  if (!value) return null;
  try { return new URL(value).hostname.toLocaleLowerCase(); } catch { return null; }
}

function policyByDomain(canonicalUrl: string | null | undefined) {
  const inputHost = hostname(canonicalUrl);
  if (!inputHost) return null;
  return INITIAL_SOURCE_POLICIES.find((policy) => {
    const policyHost = hostname(policy.canonicalUrl);
    return Boolean(policyHost && (inputHost === policyHost || inputHost.endsWith("." + policyHost) || policyHost.endsWith("." + inputHost)));
  }) ?? null;
}

export function resolveSourcePolicy(source: {
  id: string;
  providerRef: string | null;
  platform: string;
  canonicalUrl: string | null;
  name?: string;
  collectionMethod?: string;
  metadata?: unknown;
}): SourcePolicy | null {
  const current = sourcePolicyByIdentity(source) ?? policyByDomain(source.canonicalUrl);
  if (current) return current;
  const stored = record(record(source.metadata).intelligencePolicy);
  const storedRules = Array.isArray(stored.contentTypeRules) ? stored.contentTypeRules : [];
  const storedTypes = Array.isArray(stored.expectedContentTypes) ? stored.expectedContentTypes : [];
  if (
    typeof stored.key === "string" &&
    typeof stored.sourceType === "string" &&
    storedRules.length &&
    storedTypes.length
  ) {
    return {
      key: stored.key,
      sourceId: source.id,
      providerRefs: source.providerRef ? [source.providerRef] : [],
      name: source.name ?? source.id,
      platform: source.platform,
      sourceType: stored.sourceType as SourcePolicy["sourceType"],
      collectionMethod: source.collectionMethod ?? "RSS",
      canonicalUrl: source.canonicalUrl ?? undefined,
      sourceFreshnessHours: Number(stored.sourceFreshnessHours) || 72,
      fallbackWindowHours: Number(stored.fallbackWindowHours) || 168,
      priority: Number(stored.priority) || 50,
      expectedContentTypes: storedTypes as CollectionContentType[],
      contentTypeRules: storedRules as SourceContentRule[]
    };
  }
  return null;
}

export function inferCollectionContentType(input: {
  metadata?: Record<string, unknown>;
  originalUrl?: string | null;
  collectionMethod?: string;
  platform?: string;
  source?: {
    id: string;
    providerRef: string | null;
    platform: string;
    canonicalUrl: string | null;
  };
}): CollectionContentType {
  const raw = typeof input.metadata?.contentType === "string" ? input.metadata.contentType.trim().toUpperCase() : "";
  const allowed = new Set<CollectionContentType>([
    "OFFICIAL_ANNOUNCEMENT", "NEWS_ARTICLE", "RESEARCH_PAPER", "CHANGELOG", "RELEASE",
    "REPO_RELEASE", "TRENDING_REPO", "SOCIAL_POST", "VIDEO", "RANKING_ITEM", "PRODUCT_LISTING", "OTHER"
  ]);
  if (allowed.has(raw as CollectionContentType)) return raw as CollectionContentType;

  const policy = input.source ? resolveSourcePolicy(input.source) : null;
  const urlForPolicy = (input.originalUrl ?? input.source?.canonicalUrl ?? "").toLocaleLowerCase();
  if (policy?.sourceType === "OFFICIAL") {
    if (/changelog|change-log|updates?|release-notes?|api-docs/.test(urlForPolicy) && policy.expectedContentTypes.includes("CHANGELOG")) {
      return "CHANGELOG";
    }
    if (policy.expectedContentTypes.includes("OFFICIAL_ANNOUNCEMENT")) return "OFFICIAL_ANNOUNCEMENT";
    return policy.expectedContentTypes[0] ?? "OFFICIAL_ANNOUNCEMENT";
  }
  if (policy?.sourceType === "MEDIA") return "NEWS_ARTICLE";
  if (policy?.sourceType === "RESEARCH") return "RESEARCH_PAPER";

  const url = input.originalUrl ?? "";
  const method = (input.collectionMethod ?? "").toUpperCase();
  const platform = (input.platform ?? "").toUpperCase();
  if (platform === "YOUTUBE") return "VIDEO";
  if (["X", "REDDIT", "HACKER_NEWS", "WEIBO", "ZHIHU", "BILIBILI", "DOUYIN"].includes(platform)) return "SOCIAL_POST";
  if (platform === "GITHUB") return /\/releases?(?:\/|$)/i.test(url) ? "REPO_RELEASE" : "TRENDING_REPO";
  if (["ARXIV", "HUGGING_FACE"].includes(platform) || method === "RESEARCH") return "RESEARCH_PAPER";
  if (method === "TREND") return "RANKING_ITEM";
  if (method === "RSS" || method === "HTTP" || method === "MANUAL") return "NEWS_ARTICLE";
  return "OTHER";
}

export function sourceContentRule(
  source: { id: string; providerRef: string | null; platform: string; canonicalUrl: string | null; sourceType?: string; metadata?: unknown },
  contentType: CollectionContentType
): SourceContentRule {
  const policy = resolveSourcePolicy(source);
  const explicit = contentRuleFor(policy, contentType);
  if (explicit) return explicit;
  const metadata = record(source.metadata);
  const sourceUniverseRole = typeof metadata.sourceUniverseRole === "string" ? metadata.sourceUniverseRole : null;
  const evidenceRoles = Array.isArray(metadata.evidenceRoles) ? metadata.evidenceRoles.map(String) : [];
  if (metadata.factualSource === true && (sourceUniverseRole === "OFFICIAL" || source.sourceType === "OFFICIAL")) {
    return {
      contentType,
      role: "FACT",
      confirmationScope: "SPECIFICATION",
      confirmationAuthority: "PRIMARY",
      canContributeHotness: false,
      requiresFactConfirmation: false
    };
  }
  if (metadata.factualSource === true && (sourceUniverseRole === "PROFESSIONAL_MEDIA" || source.sourceType === "MEDIA")) {
    return {
      contentType,
      role: "FACT",
      confirmationScope: "EXISTENCE",
      confirmationAuthority: "HIGH",
      canContributeHotness: true,
      requiresFactConfirmation: false
    };
  }
  if (metadata.factualSource === true) {
    return {
      contentType,
      role: "FACT",
      confirmationScope: "EXISTENCE",
      confirmationAuthority: "MEDIUM",
      canContributeHotness: false,
      requiresFactConfirmation: false
    };
  }
  return {
    contentType,
    role: "SIGNAL",
    confirmationScope: "NONE",
    confirmationAuthority: "SIGNAL_ONLY",
    canContributeHotness: true,
    requiresFactConfirmation: true
  };
}

export function sourceFreshnessHours(source: {
  id: string;
  providerRef: string | null;
  platform: string;
  canonicalUrl: string | null;
  collectionConfig?: unknown;
}) {
  const policy = resolveSourcePolicy(source);
  const collectionConfig = record(source.collectionConfig);
  const override = Number(collectionConfig.sourceFreshnessHours ?? collectionConfig.windowHours);
  if (Number.isFinite(override) && override > 0) return Math.min(24 * 30, Math.round(override));
  return policy?.sourceFreshnessHours ?? 72;
}

export function sourcePolicyMetadata(policy: SourcePolicy) {
  return {
    version: INTELLIGENCE_POLICY_VERSION,
    key: policy.key,
    sourceType: policy.sourceType,
    sourceFreshnessHours: policy.sourceFreshnessHours,
    fallbackWindowHours: policy.fallbackWindowHours,
    priority: policy.priority,
    expectedContentTypes: policy.expectedContentTypes,
    contentTypeRules: policy.contentTypeRules
  };
}

export async function syncInitialSourcePolicies() {
  const db = getDatabase();
  const existingSources = await db.select().from(contentSources);
  const rows = [];
  for (const policy of INITIAL_SOURCE_POLICIES) {
    if (!policy.sourceId) continue;
    const policyProviderRefs = new Set((policy.providerRefs ?? []).map((value) => value.trim().toUpperCase()));
    const policyHost = hostname(policy.canonicalUrl);
    const existing = existingSources.find((source) => source.id === policy.sourceId)
      ?? existingSources.find((source) => policyProviderRefs.has((source.providerRef ?? "").trim().toUpperCase()))
      ?? existingSources.find((source) => {
        if (!policyHost) return false;
        const sourceHost = hostname(source.canonicalUrl);
        return sourceHost === policyHost && source.sourceType === policy.sourceType;
      });
    const providerRef = existing?.providerRef ?? policy.providerRefs?.[0] ?? ("POLICY_" + policy.key.toUpperCase());
    const metadata = {
      intelligencePolicy: sourcePolicyMetadata(policy),
      factualSource: policy.contentTypeRules.some((rule) => rule.role === "FACT"),
      signalSource: policy.contentTypeRules.some((rule) => rule.canContributeHotness),
      referenceOnly: true,
      policyManaged: true
    };
    const collectionConfig = {
      ...record(existing?.collectionConfig),
      sourceFreshnessHours: policy.sourceFreshnessHours,
      fallbackWindowHours: policy.fallbackWindowHours
    };
    if (existing) {
      const [updated] = await db.update(contentSources).set({
        name: policy.name,
        sourceType: policy.sourceType,
        canonicalUrl: policy.canonicalUrl ?? existing.canonicalUrl,
        platform: policy.platform,
        collectionMethod: policy.collectionMethod,
        authorityScore: policy.priority,
        collectionConfig,
        metadata: sql`${contentSources.metadata} || ${JSON.stringify(metadata)}::jsonb`,
        updatedAt: new Date()
      }).where(eq(contentSources.id, existing.id)).returning();
      rows.push(updated);
      const index = existingSources.findIndex((source) => source.id === existing.id);
      if (index >= 0) existingSources[index] = updated;
    } else {
      const [created] = await db.insert(contentSources).values({
        id: policy.sourceId,
        name: policy.name,
        sourceType: policy.sourceType,
        canonicalUrl: policy.canonicalUrl ?? null,
        providerRef,
        status: "ACTIVE",
        platform: policy.platform,
        collectionMethod: policy.collectionMethod,
        enabled: true,
        authorityScore: policy.priority,
        topics: ["AI"],
        collectionConfig,
        signalConfig: {},
        metadata
      }).returning();
      rows.push(created);
      existingSources.push(created);
    }
  }
  return rows;
}
