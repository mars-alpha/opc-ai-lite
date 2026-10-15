import { RADAR_SOURCE_PORTFOLIO } from "./radar-source-portfolio";

export const INTELLIGENCE_POLICY_VERSION = "ai-intelligence-policy-v1";

export const ENTITY_TYPES = [
  "COMPANY",
  "MODEL",
  "PRODUCT",
  "API",
  "RESEARCH_ORG",
  "PERSON",
  "PROJECT"
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const ENTITY_STATUSES = ["KNOWN", "TEMPORARY", "MERGED", "DEPRECATED", "UNCOVERED"] as const;
export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const REFERENCE_STRENGTHS = ["STRONG", "WEAK", "NONE"] as const;
export type ReferenceStrength = (typeof REFERENCE_STRENGTHS)[number];

export const SOURCE_TYPES = ["OFFICIAL", "MEDIA", "RESEARCH", "SOCIAL", "DEVELOPER"] as const;
export type IntelligenceSourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_ROLES = ["FACT", "SIGNAL", "HYBRID"] as const;
export type IntelligenceSourceRole = (typeof SOURCE_ROLES)[number];

export const CONFIRMATION_SCOPES = [
  "NONE",
  "EXISTENCE",
  "DETAIL",
  "SPECIFICATION",
  "PRIMARY_SOURCE"
] as const;
export type ConfirmationScope = (typeof CONFIRMATION_SCOPES)[number];

export const CONFIRMATION_AUTHORITIES = ["PRIMARY", "HIGH", "MEDIUM", "SIGNAL_ONLY"] as const;
export type ConfirmationAuthority = (typeof CONFIRMATION_AUTHORITIES)[number];

export const COLLECTION_CONTENT_TYPES = [
  "OFFICIAL_ANNOUNCEMENT",
  "NEWS_ARTICLE",
  "RESEARCH_PAPER",
  "CHANGELOG",
  "RELEASE",
  "REPO_RELEASE",
  "TRENDING_REPO",
  "SOCIAL_POST",
  "VIDEO",
  "RANKING_ITEM",
  "PRODUCT_LISTING",
  "OTHER"
] as const;
export type CollectionContentType = (typeof COLLECTION_CONTENT_TYPES)[number];

export const EVENT_TYPES = [
  "MODEL_RELEASE",
  "PRODUCT_FEATURE_RELEASE",
  "API_PLATFORM_UPDATE",
  "OPEN_SOURCE",
  "RESEARCH",
  "COMPANY_FINANCE_PARTNERSHIP",
  "POLICY_SAFETY",
  "INDUSTRY_HOTSPOT"
] as const;
export type IntelligenceEventType = (typeof EVENT_TYPES)[number];

export const EVENT_VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "CONFIRMED_MEDIA",
  "CONFIRMED_OFFICIAL",
  "ARCHIVED_UNVERIFIED"
] as const;
export type EventVerificationStatus = (typeof EVENT_VERIFICATION_STATUSES)[number];

export type SourceContentRule = {
  contentType: CollectionContentType;
  role: IntelligenceSourceRole;
  confirmationScope: ConfirmationScope;
  confirmationAuthority: ConfirmationAuthority;
  canContributeHotness: boolean;
  requiresFactConfirmation: boolean;
};

export type SourcePolicy = {
  key: string;
  sourceId?: string;
  providerRefs?: string[];
  name: string;
  platform: string;
  sourceType: IntelligenceSourceType;
  collectionMethod: string;
  canonicalUrl?: string | null;
  sourceFreshnessHours: number;
  fallbackWindowHours: number;
  priority: number;
  expectedContentTypes: CollectionContentType[];
  contentTypeRules: SourceContentRule[];
};

export type EntitySeed = {
  entityId: string;
  entityType: EntityType;
  canonicalName: string;
  displayNameZh: string;
  aliases: string[];
  officialDomains: string[];
  parentEntityId?: string | null;
  ownedByEntityId?: string | null;
  successorOfEntityId?: string | null;
  predecessorOfEntityId?: string | null;
  referenceStrength: ReferenceStrength;
  status: EntityStatus;
};

const factPrimary = (
  contentType: CollectionContentType,
  scope: ConfirmationScope = "PRIMARY_SOURCE"
): SourceContentRule => ({
  contentType,
  role: "FACT",
  confirmationScope: scope,
  confirmationAuthority: "PRIMARY",
  canContributeHotness: false,
  requiresFactConfirmation: false
});

const factMedia = (contentType: CollectionContentType): SourceContentRule => ({
  contentType,
  role: "FACT",
  confirmationScope: "EXISTENCE",
  confirmationAuthority: "HIGH",
  canContributeHotness: true,
  requiresFactConfirmation: false
});

const signal = (contentType: CollectionContentType): SourceContentRule => ({
  contentType,
  role: "SIGNAL",
  confirmationScope: "NONE",
  confirmationAuthority: "SIGNAL_ONLY",
  canContributeHotness: true,
  requiresFactConfirmation: true
});

const radarSourcePolicy = (
  entry: (typeof RADAR_SOURCE_PORTFOLIO)[number]
): SourcePolicy | null => {
  if (!entry.policyManaged) return null;
  const sourceType =
    entry.sourceType === "OFFICIAL" ? "OFFICIAL" :
    entry.sourceType === "MEDIA" ? "MEDIA" :
    entry.sourceType === "RESEARCH" ? "RESEARCH" :
    entry.sourceType === "SOCIAL" ? "SOCIAL" :
    "DEVELOPER";
  const contentTypes = entry.contentTypes as readonly CollectionContentType[];
  const contentTypeRules = contentTypes.map((contentType) => {
    if (sourceType === "OFFICIAL") {
      return factPrimary(
        contentType,
        ["CHANGELOG", "RESEARCH_PAPER", "REPO_RELEASE"].includes(contentType)
          ? "SPECIFICATION"
          : "PRIMARY_SOURCE"
      );
    }
    if (sourceType === "MEDIA") return factMedia(contentType);
    if (sourceType === "RESEARCH") return factPrimary(contentType, "SPECIFICATION");
    return signal(contentType);
  });
  return {
    key: entry.key,
    sourceId: entry.sourceId,
    providerRefs: [entry.providerRef],
    name: entry.name,
    platform: entry.platform,
    sourceType,
    collectionMethod: entry.collectionMethod,
    canonicalUrl: entry.canonicalUrl ?? undefined,
    sourceFreshnessHours: entry.freshnessHours,
    fallbackWindowHours: entry.fallbackWindowHours,
    priority: entry.priority,
    expectedContentTypes: [...contentTypes],
    contentTypeRules
  };
};

export const INITIAL_SOURCE_POLICIES: readonly SourcePolicy[] = RADAR_SOURCE_PORTFOLIO
  .map(radarSourcePolicy)
  .filter((item): item is SourcePolicy => Boolean(item));

export const CORE_ENTITY_SEEDS: readonly EntitySeed[] = [
  { entityId: "company_openai", entityType: "COMPANY", canonicalName: "OpenAI", displayNameZh: "OpenAI", aliases: ["Open AI"], officialDomains: ["openai.com"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_anthropic", entityType: "COMPANY", canonicalName: "Anthropic", displayNameZh: "Anthropic", aliases: [], officialDomains: ["anthropic.com"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_google_deepmind", entityType: "RESEARCH_ORG", canonicalName: "Google DeepMind", displayNameZh: "Google DeepMind", aliases: ["DeepMind", "Google AI"], officialDomains: ["deepmind.google", "ai.google"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_microsoft_ai", entityType: "COMPANY", canonicalName: "Microsoft", displayNameZh: "微软", aliases: ["Microsoft AI"], officialDomains: ["microsoft.com"], referenceStrength: "WEAK", status: "KNOWN" },
  { entityId: "company_meta_ai", entityType: "COMPANY", canonicalName: "Meta AI", displayNameZh: "Meta AI", aliases: ["Meta"], officialDomains: ["ai.meta.com", "meta.com"], referenceStrength: "WEAK", status: "KNOWN" },
  { entityId: "company_deepseek", entityType: "COMPANY", canonicalName: "DeepSeek", displayNameZh: "DeepSeek", aliases: ["深度求索"], officialDomains: ["deepseek.com"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_qwen", entityType: "PROJECT", canonicalName: "Qwen", displayNameZh: "通义千问", aliases: ["通义", "通义千问"], officialDomains: ["qwenlm.github.io", "qwen.ai"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_baidu_ernie", entityType: "PROJECT", canonicalName: "ERNIE", displayNameZh: "文心 / ERNIE", aliases: ["文心", "文心一言", "Baidu ERNIE"], officialDomains: ["ernie.baidu.com"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_mistral_ai", entityType: "COMPANY", canonicalName: "Mistral AI", displayNameZh: "Mistral AI", aliases: ["Mistral"], officialDomains: ["mistral.ai"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_xai", entityType: "COMPANY", canonicalName: "xAI", displayNameZh: "xAI", aliases: ["x.ai"], officialDomains: ["x.ai"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_manus", entityType: "COMPANY", canonicalName: "Manus", displayNameZh: "Manus", aliases: ["Manus AI"], officialDomains: [], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_gpt", entityType: "MODEL", canonicalName: "GPT", displayNameZh: "GPT", aliases: ["ChatGPT", "GPT model"], officialDomains: ["openai.com"], ownedByEntityId: "company_openai", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_claude", entityType: "MODEL", canonicalName: "Claude", displayNameZh: "Claude", aliases: [], officialDomains: ["anthropic.com"], ownedByEntityId: "company_anthropic", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_gemini", entityType: "MODEL", canonicalName: "Gemini", displayNameZh: "Gemini", aliases: [], officialDomains: ["deepmind.google", "ai.google"], ownedByEntityId: "company_google_deepmind", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_llama", entityType: "MODEL", canonicalName: "Llama", displayNameZh: "Llama", aliases: ["Meta Llama"], officialDomains: ["ai.meta.com"], ownedByEntityId: "company_meta_ai", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_deepseek", entityType: "MODEL", canonicalName: "DeepSeek models", displayNameZh: "DeepSeek 模型", aliases: ["DeepSeek-V", "DeepSeek R"], officialDomains: ["deepseek.com"], ownedByEntityId: "company_deepseek", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_qwen", entityType: "MODEL", canonicalName: "Qwen models", displayNameZh: "通义千问模型", aliases: ["Qwen2", "Qwen3", "Qwen Image"], officialDomains: ["qwenlm.github.io", "qwen.ai"], ownedByEntityId: "company_qwen", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_ernie", entityType: "MODEL", canonicalName: "ERNIE models", displayNameZh: "文心模型", aliases: ["ERNIE 4", "ERNIE 5"], officialDomains: ["ernie.baidu.com"], ownedByEntityId: "company_baidu_ernie", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_mistral", entityType: "MODEL", canonicalName: "Mistral models", displayNameZh: "Mistral 模型", aliases: ["Mixtral"], officialDomains: ["mistral.ai"], ownedByEntityId: "company_mistral_ai", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_grok", entityType: "MODEL", canonicalName: "Grok", displayNameZh: "Grok", aliases: [], officialDomains: ["x.ai"], ownedByEntityId: "company_xai", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "company_stepfun", entityType: "COMPANY", canonicalName: "StepFun", displayNameZh: "阶跃星辰", aliases: ["阶跃星辰"], officialDomains: ["stepfun.com"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_stepfun_step5", entityType: "MODEL", canonicalName: "StepFun Step 5", displayNameZh: "StepFun Step 5", aliases: ["Step 5 Preview", "StepFun Step 5"], officialDomains: ["stepfun.com"], ownedByEntityId: "company_stepfun", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "model_claude_opus_55", entityType: "MODEL", canonicalName: "Claude Opus 5.5", displayNameZh: "Claude Opus 5.5", aliases: ["Opus 5.5", "Claude Opus 5.5"], officialDomains: ["anthropic.com"], ownedByEntityId: "company_anthropic", referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "project_hermes_agent", entityType: "PROJECT", canonicalName: "Hermes Agent", displayNameZh: "Hermes Agent", aliases: ["hermes-agent", "NousResearch/hermes-agent"], officialDomains: [], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "project_langchain", entityType: "PROJECT", canonicalName: "LangChain", displayNameZh: "LangChain", aliases: ["langchain-ai/langchain"], officialDomains: ["langchain.com"], referenceStrength: "STRONG", status: "KNOWN" },
  { entityId: "project_comfyui", entityType: "PROJECT", canonicalName: "ComfyUI", displayNameZh: "ComfyUI", aliases: ["Comfy-Org/ComfyUI"], officialDomains: ["comfy.org"], referenceStrength: "STRONG", status: "KNOWN" }
] as const;

export const EVENT_POLICIES: Record<IntelligenceEventType, {
  eventFreshnessHours: number;
  verificationTimeoutHours: number;
  resurrectionWindowHours: number;
  minimumFactEvidence: number;
  minimumSignalSources: number;
}> = {
  MODEL_RELEASE: { eventFreshnessHours: 168, verificationTimeoutHours: 48, resurrectionWindowHours: 336, minimumFactEvidence: 1, minimumSignalSources: 2 },
  PRODUCT_FEATURE_RELEASE: { eventFreshnessHours: 168, verificationTimeoutHours: 48, resurrectionWindowHours: 336, minimumFactEvidence: 1, minimumSignalSources: 2 },
  API_PLATFORM_UPDATE: { eventFreshnessHours: 168, verificationTimeoutHours: 48, resurrectionWindowHours: 336, minimumFactEvidence: 1, minimumSignalSources: 2 },
  OPEN_SOURCE: { eventFreshnessHours: 168, verificationTimeoutHours: 72, resurrectionWindowHours: 336, minimumFactEvidence: 1, minimumSignalSources: 2 },
  RESEARCH: { eventFreshnessHours: 336, verificationTimeoutHours: 168, resurrectionWindowHours: 720, minimumFactEvidence: 1, minimumSignalSources: 2 },
  COMPANY_FINANCE_PARTNERSHIP: { eventFreshnessHours: 168, verificationTimeoutHours: 72, resurrectionWindowHours: 336, minimumFactEvidence: 1, minimumSignalSources: 2 },
  POLICY_SAFETY: { eventFreshnessHours: 168, verificationTimeoutHours: 72, resurrectionWindowHours: 336, minimumFactEvidence: 1, minimumSignalSources: 2 },
  INDUSTRY_HOTSPOT: { eventFreshnessHours: 48, verificationTimeoutHours: 24, resurrectionWindowHours: 168, minimumFactEvidence: 1, minimumSignalSources: 2 }
};

export function sourcePolicyByIdentity(input: {
  id?: string | null;
  providerRef?: string | null;
  platform?: string | null;
}) {
  const provider = input.providerRef?.trim().toUpperCase() ?? "";
  const id = input.id?.trim() ?? "";
  const platform = input.platform?.trim().toUpperCase() ?? "";
  return INITIAL_SOURCE_POLICIES.find((policy) =>
    (policy.sourceId && policy.sourceId === id) ||
    (policy.providerRefs ?? []).some((ref) => ref.toUpperCase() === provider)
  ) ?? INITIAL_SOURCE_POLICIES.find((policy) =>
    (policy.sourceType === "SOCIAL" || policy.sourceType === "DEVELOPER") &&
    platform !== "WEB"
      ? policy.platform.toUpperCase() === platform
      : false
  ) ?? null;
}

export function contentRuleFor(policy: SourcePolicy | null, contentType: CollectionContentType) {
  if (!policy) return null;
  return policy.contentTypeRules.find((rule) => rule.contentType === contentType) ?? null;
}

export const CHANGE_MAGNITUDES = ["MAJOR", "NORMAL", "MINOR"] as const;
export type ChangeMagnitude = (typeof CHANGE_MAGNITUDES)[number];

export const OFFICIAL_NEWS_POLICY = {
  version: "official-news-policy-v1",
  dimensions: ["aiRelevance", "changeMagnitude", "sourceQuality", "freshness", "opcUsefulness"] as const,
  minimumChangeMagnitude: "NORMAL" as ChangeMagnitude,
  requiresConfirmedFact: true,
  requiresPrimaryAuthorityForOfficial: true
};

export const HOTSPOT_POLICY = {
  version: "ai-hotspot-policy-v1",
  dimensions: ["aiRelevance", "multiSourceCoverage", "velocity", "sourceQuality", "factSupport"] as const,
  minimumIndependentSignalSources: 2,
  minimumRisingSources: 1,
  requiresAiRelevance: true
};

export const LABELING_GUIDE_VERSION = "ai-intelligence-labeling-v1";
export const LABELING_GUIDE_SNAPSHOT = {
  version: LABELING_GUIDE_VERSION,
  contentLabels: ["AI_RELEVANT", "NOT_AI_RELEVANT", "LOW_VALUE", "STALE", "DUPLICATE"],
  eventLabels: ["SAME_EVENT", "NEW_EVENT", "RELATED_EVENT", "NOT_EVENT"],
  verificationLabels: EVENT_VERIFICATION_STATUSES,
  groundTruthRule: "Human decisions follow the Product Contract and this snapshot; reviewer identity is audit metadata, not the policy owner."
} as const;

export function assertIntelligencePolicy() {
  const sourceKeys = new Set<string>();
  for (const policy of INITIAL_SOURCE_POLICIES) {
    if (sourceKeys.has(policy.key)) throw new Error("SOURCE_POLICY_DUPLICATE_KEY:" + policy.key);
    sourceKeys.add(policy.key);
    if (policy.sourceFreshnessHours <= 0 || policy.fallbackWindowHours < policy.sourceFreshnessHours) {
      throw new Error("SOURCE_POLICY_FRESHNESS_INVALID:" + policy.key);
    }
    if (!policy.expectedContentTypes.length || !policy.contentTypeRules.length) {
      throw new Error("SOURCE_POLICY_CONTENT_RULE_REQUIRED:" + policy.key);
    }
    for (const contentType of policy.expectedContentTypes) {
      if (!policy.contentTypeRules.some((rule) => rule.contentType === contentType)) {
        throw new Error("SOURCE_POLICY_EXPECTED_TYPE_UNMAPPED:" + policy.key + ":" + contentType);
      }
    }
    for (const rule of policy.contentTypeRules) {
      if (rule.role === "SIGNAL" && rule.confirmationAuthority !== "SIGNAL_ONLY") {
        throw new Error("SIGNAL_SOURCE_CONFIRMATION_AUTHORITY_INVALID:" + policy.key);
      }
      if (rule.role === "SIGNAL" && rule.confirmationScope !== "NONE") {
        throw new Error("SIGNAL_SOURCE_CONFIRMATION_SCOPE_INVALID:" + policy.key);
      }
      if (rule.confirmationAuthority === "PRIMARY" && rule.role === "SIGNAL") {
        throw new Error("PRIMARY_SIGNAL_INVALID:" + policy.key);
      }
      if (rule.confirmationAuthority === "SIGNAL_ONLY" && rule.confirmationScope !== "NONE") {
        throw new Error("SIGNAL_ONLY_SCOPE_INVALID:" + policy.key);
      }
      if (rule.requiresFactConfirmation === false && rule.role === "SIGNAL") {
        throw new Error("SIGNAL_MUST_REQUIRE_FACT_CONFIRMATION:" + policy.key);
      }
    }
  }

  const entityIds = new Set<string>();
  for (const entity of CORE_ENTITY_SEEDS) {
    if (entityIds.has(entity.entityId)) throw new Error("ENTITY_DUPLICATE_ID:" + entity.entityId);
    entityIds.add(entity.entityId);
    if (!entity.canonicalName.trim()) throw new Error("ENTITY_CANONICAL_NAME_REQUIRED:" + entity.entityId);
  }
  for (const entity of CORE_ENTITY_SEEDS) {
    for (const relation of [
      entity.parentEntityId,
      entity.ownedByEntityId,
      entity.successorOfEntityId,
      entity.predecessorOfEntityId
    ]) {
      if (relation && !entityIds.has(relation)) throw new Error("ENTITY_RELATION_UNKNOWN:" + entity.entityId + ":" + relation);
    }
  }
  for (const eventType of EVENT_TYPES) {
    const policy = EVENT_POLICIES[eventType];
    if (
      !policy ||
      policy.eventFreshnessHours <= 0 ||
      policy.verificationTimeoutHours <= 0 ||
      policy.resurrectionWindowHours < policy.verificationTimeoutHours
    ) {
      throw new Error("EVENT_POLICY_INVALID:" + eventType);
    }
  }

  return true;
}


