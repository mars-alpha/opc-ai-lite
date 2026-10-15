import "server-only";
import {testSourceAiRelevance,type AiRelevanceTerm} from "./source-management-policy";
import {
  evaluateDiscoveryKeywordPolicy,
  type DiscoveryKeywordPolicy
} from "./discovery-keyword-policy";

export const AI_RELATION_TYPES = [
  "CORE_AI",
  "AI_PRODUCT_APPLICATION",
  "AI_WORKFLOW_CHANGE",
  "AI_LABOR_IMPACT",
  "AI_BUSINESS_MODEL_CHANGE",
  "AI_INDUSTRY_STRUCTURE_CHANGE",
  "AI_REGULATION",
  "UNKNOWN",
  "NONE"
] as const;

export type AiRelationType = (typeof AI_RELATION_TYPES)[number];

export type DiscoveryCandidate = {
  externalId?: string | null;
  originalUrl?: string | null;
  title: string;
  author?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  platformMetrics?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type DiscoveryKnownEntityContext = {
  entityId: string;
  entityType: string;
  canonicalName: string;
  matchedTerm: string;
  status: string;
  referenceStrength: string;
};

export type DiscoveryFilterDecision = {
  index: number;
  keep: boolean;
  relationType: AiRelationType;
  discoveryValue: "CANDIDATE" | "DROP";
  reason: string;
  mode: "DETERMINISTIC";
};

export type DiscoveryFilterResult<T extends DiscoveryCandidate> = {
  items: T[];
  decisions: DiscoveryFilterDecision[];
  stats: {
    received: number;
    kept: number;
    dropped: number;
    deterministicDropped: number;
    classified: number;
  };
};

type FilterOptions = {
  now?: Date;
  windowHours?: number;
  sourceName?: string;
  sourcePlatform?: string;
  sourceMethod?: string;
  sourceType?: string;
  strategyTopics?: string[];
  relevanceTerms?: AiRelevanceTerm[];
  keywordPolicy?: DiscoveryKeywordPolicy | null;
  requireExplicitAiRelation?: boolean;
  knownEntitiesByIndex?: ReadonlyMap<number, readonly DiscoveryKnownEntityContext[]>;
};

const AI_TERMS = [
  "artificial intelligence",
  "generative ai",
  "machine learning",
  "large language model",
  "foundation model",
  "multimodal",
  "llm",
  "ai ",
  " ai",
  "openai",
  "anthropic",
  "claude",
  "gemini",
  "deepseek",
  "qwen",
  "通义",
  "豆包",
  "kimi",
  "chatgpt",
  "copilot",
  "agentic",
  "ai agent",
  "智能体",
  "人工智能",
  "大模型",
  "生成式ai",
  "生成式 ai",
  "机器学习",
  "多模态",
  "模型推理",
  "模型训练"
];

const AI_INFRA_TERMS = [
  "ai accelerator",
  "ai chip",
  "inference accelerator",
  "model inference",
  "training cluster",
  "模型推理",
  "ai 芯片",
  "人工智能芯片",
  "大模型算力",
  "训练集群"
];

const IMPACT_TERMS = [
  "workflow",
  "productivity",
  "automation",
  "automate",
  "replace",
  "job",
  "jobs",
  "workforce",
  "customer service",
  "coding",
  "developer",
  "marketing",
  "education",
  "healthcare",
  "legal",
  "finance",
  "manufacturing",
  "retail",
  "工作流",
  "效率",
  "自动化",
  "替代",
  "岗位",
  "就业",
  "客服",
  "编程",
  "开发者",
  "营销",
  "教育",
  "医疗",
  "法律",
  "金融",
  "制造",
  "零售",
  "商业模式",
  "行业"
];

const REGULATION_TERMS = [
  "regulation",
  "regulator",
  "law",
  "legislation",
  "policy",
  "executive order",
  "compliance",
  "监管",
  "法规",
  "法案",
  "政策",
  "合规",
  "行政令"
];

const EVENT_TERMS = [
  "launch",
  "launches",
  "launched",
  "release",
  "releases",
  "released",
  "announce",
  "announces",
  "announced",
  "unveil",
  "unveils",
  "introduce",
  "introduces",
  "deploy",
  "deploys",
  "deployed",
  "integrate",
  "integrates",
  "adopt",
  "adopts",
  "open source",
  "open-source",
  "update",
  "updates",
  "acquire",
  "acquires",
  "funding",
  "raises",
  "partnership",
  "发布",
  "推出",
  "上线",
  "开放",
  "宣布",
  "更新",
  "开源",
  "部署",
  "采用",
  "接入",
  "集成",
  "合作",
  "收购",
  "融资",
  "批准",
  "禁令"
];

const LOW_VALUE_TITLE_PATTERNS = [
  /^home$/i,
  /^首页$/,
  /^about( us)?$/i,
  /^关于我们$/,
  /^contact( us)?$/i,
  /^联系我们$/,
  /^privacy( policy)?$/i,
  /^terms( of service)?$/i,
  /^tag[:：]/i,
  /^category[:：]/i,
  /^author[:：]/i
];
const LOW_VALUE_PROMOTION_ACTIVITY_TERMS = [
  "conference", "summit", "webinar", "stage", "forum", "expo", "event", "qcon",
  "会议", "峰会", "网络研讨会", "论坛", "展会", "活动"
];

const LOW_VALUE_PROMOTION_CTA_TERMS = [
  "register now", "register today", "get your pass", "grab a pass", "grab a second",
  "buy your pass", "buy a ticket", "tickets", "ticket", "save up to", "save 50%",
  "discount", "early bird", "at the door",
  "立即注册", "报名", "购票", "门票", "通行证", "优惠", "折扣", "早鸟",
  "即将开幕", "确认出席", "嘉宾出席", "确认参会", "确认参加"
];

const LOW_VALUE_ENTERTAINMENT_PERSON_TERMS = [
  "actor", "actress", "celebrity", "hollywood star", "movie star",
  "演员", "明星", "名人", "好莱坞"
];

const LOW_VALUE_ENTERTAINMENT_REACTION_TERMS = [
  "going viral", "went viral", "internet is impressed", "internet reacts",
  "fans are impressed", "social media is impressed",
  "走红", "爆红", "刷屏", "网友热议", "网友惊叹"
];

function textOf(candidate: DiscoveryCandidate) {
  return [candidate.title, candidate.excerpt ?? "", candidate.author ?? ""]
    .join("\n")
    .toLocaleLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

// Recall signals only. These never grant verification, practical evidence or heat.
function hasPracticalDiscoveryTopic(candidate: DiscoveryCandidate) {
  const title = candidate.title.normalize("NFKC").toLowerCase();
  const text = [title, candidate.excerpt ?? ""].join("\n").normalize("NFKC").toLowerCase();
  let reaRepository = false;
  try {
    const url = new URL(candidate.originalUrl ?? "");
    reaRepository = url.hostname === "github.com" && /^\/morluto\/rea(?:\/|$)/i.test(url.pathname);
  } catch {}
  if (reaRepository || /\bcomfyui\b|\bmcp\b|model context protocol/.test(title)) return true;
  if (/\brea\b/.test(title) && /reverse engineer|逆向/.test(text)) return true;
  return /\bskills?\b/.test(title) &&
    /\bagents?\b|\bagentic\b|\bclaude\b|\bcodex\b|\bllm\b|\bai\b|智能体|投流|文章改写|人味写作|排版|配图|生图|文生动画|图生动画|视频脚本|剪辑|微信群|飞书|信息整理|客服|助手/.test(text);
}
const SIGNAL_ASSET_ENTITY_TYPES = new Set(["MODEL", "PRODUCT", "API", "PROJECT"]);
const SIGNAL_ASSET_PLATFORMS = new Set(["GITHUB", "HACKER_NEWS", "X", "REDDIT", "YOUTUBE"]);

function allowsKnownAiAssetSignal(options: Pick<FilterOptions, "sourcePlatform" | "sourceMethod">) {
  return (
    (options.sourceMethod ?? "").trim().toUpperCase() === "TREND" &&
    SIGNAL_ASSET_PLATFORMS.has((options.sourcePlatform ?? "").trim().toUpperCase())
  );
}

function deterministicRelation(
  candidate: DiscoveryCandidate,
  knownEntities: readonly DiscoveryKnownEntityContext[] = [],
  options: Pick<FilterOptions, "sourcePlatform" | "sourceMethod" | "relevanceTerms"> = {}
): { relationType: AiRelationType | null; reason: string | null; entityIds: string[] } {
  const text = textOf(candidate);
  const hasCoreAi = includesAny(text, AI_TERMS);
  const hasInfra = includesAny(text, AI_INFRA_TERMS);
  const hasImpact = includesAny(text, IMPACT_TERMS);
  const hasRegulation = includesAny(text, REGULATION_TERMS);
  if (hasPracticalDiscoveryTopic(candidate)) {
    return { relationType: "AI_PRODUCT_APPLICATION", reason: "PRACTICAL_DISCOVERY_TOPIC", entityIds: [] };
  }
  const strongKnownEntities = knownEntities
    .filter((entity) => entity.status === "KNOWN" && entity.referenceStrength === "STRONG");
  const strongKnownEntityIds = [...new Set(strongKnownEntities.map((entity) => entity.entityId))];
  const strongKnownAiAssetEntityIds = [...new Set(
    strongKnownEntities
      .filter((entity) => SIGNAL_ASSET_ENTITY_TYPES.has(entity.entityType))
      .map((entity) => entity.entityId)
  )];

  if ((hasCoreAi || hasInfra) && hasRegulation) return { relationType: "AI_REGULATION", reason: "TEXT_AI_RELATION", entityIds: strongKnownEntityIds };
  if (hasCoreAi && hasImpact) {
    if (/job|jobs|workforce|replace|岗位|就业|替代/.test(text)) return { relationType: "AI_LABOR_IMPACT", reason: "TEXT_AI_RELATION", entityIds: strongKnownEntityIds };
    if (/workflow|automation|productivity|工作流|自动化|效率/.test(text)) return { relationType: "AI_WORKFLOW_CHANGE", reason: "TEXT_AI_RELATION", entityIds: strongKnownEntityIds };
    if (/business model|商业模式/.test(text)) return { relationType: "AI_BUSINESS_MODEL_CHANGE", reason: "TEXT_AI_RELATION", entityIds: strongKnownEntityIds };
    if (/industry|行业/.test(text)) return { relationType: "AI_INDUSTRY_STRUCTURE_CHANGE", reason: "TEXT_AI_RELATION", entityIds: strongKnownEntityIds };
    return { relationType: "AI_PRODUCT_APPLICATION", reason: "TEXT_AI_RELATION", entityIds: strongKnownEntityIds };
  }
  if (hasCoreAi || hasInfra) return { relationType: "CORE_AI", reason: "TEXT_AI_RELATION", entityIds: strongKnownEntityIds };
  if (strongKnownAiAssetEntityIds.length && allowsKnownAiAssetSignal(options)) {
    return { relationType: "CORE_AI", reason: "STRONG_KNOWN_AI_ASSET_SIGNAL", entityIds: strongKnownAiAssetEntityIds };
  }
  if (strongKnownEntityIds.length && hasDiscoveryEventSignal(candidate)) {
    return { relationType: "CORE_AI", reason: "STRONG_KNOWN_AI_ENTITY_EVENT", entityIds: strongKnownEntityIds };
  }
  // Operator terms extend recall only; quality, freshness and column gates remain mandatory.
  if (testSourceAiRelevance(candidate.title, options.relevanceTerms ?? []).relevant) {
    return {relationType:"CORE_AI",reason:"OPERATOR_INCLUDE_TERM",entityIds:[]};
  }
  return { relationType: null, reason: null, entityIds: strongKnownEntityIds };
}

function hasProminentAiRelation(candidate: DiscoveryCandidate) {
  const title = candidate.title.normalize("NFKC").toLocaleLowerCase();
  const excerpt = (candidate.excerpt ?? "").normalize("NFKC").toLocaleLowerCase();
  if (includesAny(title, AI_TERMS) || includesAny(title, AI_INFRA_TERMS)) return true;
  const distinctExcerptAiTerms = new Set(
    [...AI_TERMS, ...AI_INFRA_TERMS].filter((term) => excerpt.includes(term))
  );
  return distinctExcerptAiTerms.size >= 2;
}

function hasDiscoveryEventSignal(candidate: DiscoveryCandidate) {
  return includesAny(textOf(candidate), EVENT_TERMS);
}
function lowValueDiscoveryReason(
  candidate: DiscoveryCandidate,
  relationType: AiRelationType,
  options: Pick<FilterOptions, "sourceType">
) {
  if ((options.sourceType ?? "").trim().toUpperCase() !== "MEDIA") return null;
  if (relationType === "UNKNOWN" || relationType === "NONE") return null;
  const text = textOf(candidate);

  const hasPromotionActivity = includesAny(text, LOW_VALUE_PROMOTION_ACTIVITY_TERMS);
  const hasPromotionCta = includesAny(text, LOW_VALUE_PROMOTION_CTA_TERMS);
  if (hasPromotionActivity && hasPromotionCta) return "LOW_VALUE_PROMOTION";

  const hasEntertainmentPerson = includesAny(text, LOW_VALUE_ENTERTAINMENT_PERSON_TERMS);
  const hasEntertainmentReaction = includesAny(text, LOW_VALUE_ENTERTAINMENT_REACTION_TERMS);
  if (hasEntertainmentPerson && hasEntertainmentReaction && !hasDiscoveryEventSignal(candidate)) {
    return "LOW_VALUE_ENTERTAINMENT";
  }
  return null;
}

function isCurrentRankingSignal(candidate: DiscoveryCandidate) {
  const metadata = candidate.metadata;
  return Boolean(
    metadata &&
    metadata.sourceRole === "TREND_SIGNAL" &&
    metadata.trendSignalType === "RANKING" &&
    metadata.rankingObservedNow === true
  );
}

function obviousInvalidReason(
  candidate: DiscoveryCandidate,
  now: Date,
  windowHours: number
) {
  const title = candidate.title.trim();
  if (!title || title.length < 4) return "INVALID_OR_EMPTY_TITLE";
  if (LOW_VALUE_TITLE_PATTERNS.some((pattern) => pattern.test(title))) return "NON_CONTENT_PAGE";
  if (!candidate.originalUrl && !candidate.externalId) return "MISSING_REFERENCE";

  if (candidate.publishedAt && !isCurrentRankingSignal(candidate)) {
    const published = new Date(candidate.publishedAt);
    if (!Number.isNaN(published.getTime())) {
      const ageMs = now.getTime() - published.getTime();
      if (ageMs > windowHours * 60 * 60 * 1000) return "OUTSIDE_TIME_WINDOW";
    }
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function industryHint(candidate: DiscoveryCandidate) {
  const text = textOf(candidate);
  const pairs: Array<[string, string[]]> = [
    ["SOFTWARE", ["coding", "developer", "software", "编程", "开发者", "软件"]],
    ["MARKETING", ["marketing", "advertising", "content", "营销", "广告", "内容"]],
    ["EDUCATION", ["education", "school", "student", "教育", "学校", "学生"]],
    ["HEALTHCARE", ["healthcare", "hospital", "medical", "医疗", "医院"]],
    ["FINANCE", ["finance", "bank", "insurance", "金融", "银行", "保险"]],
    ["MANUFACTURING", ["manufacturing", "factory", "制造", "工厂"]],
    ["RETAIL", ["retail", "ecommerce", "customer service", "零售", "电商", "客服"]],
    ["LEGAL", ["legal", "law firm", "法律", "律所"]],
    ["HR", ["human resources", "recruiting", "workforce", "人力资源", "招聘"]],
    ["RESEARCH", ["research", "scientific", "科研", "研究"]]
  ];
  return pairs.find(([, terms]) => includesAny(text, terms))?.[0] ?? null;
}

function impactHints(candidate: DiscoveryCandidate) {
  const text = textOf(candidate);
  const out: string[] = [];
  if (/workflow|automation|productivity|工作流|自动化|效率/.test(text)) out.push("WORKFLOW");
  if (/job|jobs|workforce|replace|岗位|就业|替代/.test(text)) out.push("JOB_ROLE");
  if (/cost|costs|成本/.test(text)) out.push("COST");
  if (/business model|商业模式/.test(text)) out.push("BUSINESS_MODEL");
  if (/regulation|law|policy|监管|法规|政策/.test(text)) out.push("REGULATION");
  if (/launch|release|发布|推出|上线/.test(text)) out.push("CAPABILITY");
  return [...new Set(out)];
}

export function filterCheapDiscoveryCandidates<T extends DiscoveryCandidate>(
  candidates: T[],
  options: FilterOptions = {}
): DiscoveryFilterResult<T> {
  const now = options.now ?? new Date();
  const windowHours = Math.max(1, Math.min(24 * 30, Math.round(options.windowHours ?? 72)));
  const decisions: DiscoveryFilterDecision[] = [];

  candidates.forEach((candidate, index) => {
    const relevance = testSourceAiRelevance([candidate.title,candidate.excerpt ?? ""].join(" "),options.relevanceTerms ?? []);
    if (relevance.excluded.length) {
      decisions.push({index,keep:false,relationType:"NONE",discoveryValue:"DROP",reason:"SOURCE_POLICY_EXCLUDED_TERM",mode:"DETERMINISTIC"});
      return;
    }
    const keywordDecision = evaluateDiscoveryKeywordPolicy(
      [candidate.title, candidate.excerpt, candidate.author],
      options.keywordPolicy
    );
    if (!keywordDecision.passed) {
      decisions.push({
        index,
        keep: false,
        relationType: "NONE",
        discoveryValue: "DROP",
        reason: "CHEAP_KEYWORD_POLICY_" + keywordDecision.reason,
        mode: "DETERMINISTIC"
      });
      return;
    }

    const invalid = obviousInvalidReason(candidate, now, windowHours);
    if (invalid) {
      decisions.push({
        index,
        keep: false,
        relationType: "NONE",
        discoveryValue: "DROP",
        reason: "CHEAP_" + invalid,
        mode: "DETERMINISTIC"
      });
      return;
    }

    const relation = deterministicRelation(candidate, [], options);
    const relationType = relation.relationType ?? "UNKNOWN";
    const lowValueReason = lowValueDiscoveryReason(candidate, relationType, options);
    if (lowValueReason) {
      decisions.push({
        index,
        keep: false,
        relationType,
        discoveryValue: "DROP",
        reason: "CHEAP_" + lowValueReason,
        mode: "DETERMINISTIC"
      });
      return;
    }

    decisions.push({
      index,
      keep: true,
      relationType,
      discoveryValue: "CANDIDATE",
      reason: relationType === "UNKNOWN" ? "CHEAP_DEFER_TO_ENTITY_CONTEXT" : "CHEAP_TEXT_RELEVANT",
      mode: "DETERMINISTIC"
    });
  });

  const decisionByIndex = new Map(decisions.map((decision) => [decision.index, decision]));
  const items = candidates.filter((_, index) => decisionByIndex.get(index)?.keep === true);
  return {
    items,
    decisions,
    stats: {
      received: candidates.length,
      kept: items.length,
      dropped: candidates.length - items.length,
      deterministicDropped: decisions.filter((item) => !item.keep).length,
      classified: decisions.filter((item) => item.keep).length
    }
  };
}

export async function filterDiscoveryCandidates<T extends DiscoveryCandidate>(
  candidates: T[],
  options: FilterOptions = {}
): Promise<DiscoveryFilterResult<T>> {
  const now = options.now ?? new Date();
  const windowHours = Math.max(1, Math.min(24 * 30, Math.round(options.windowHours ?? 72)));
  const decisions: DiscoveryFilterDecision[] = [];
  candidates.forEach((candidate, index) => {
    const relevance = testSourceAiRelevance([candidate.title,candidate.excerpt ?? ""].join(" "),options.relevanceTerms ?? []);
    if (relevance.excluded.length) {
      decisions.push({index,keep:false,relationType:"NONE",discoveryValue:"DROP",reason:"SOURCE_POLICY_EXCLUDED_TERM",mode:"DETERMINISTIC"});
      return;
    }
    const keywordDecision = evaluateDiscoveryKeywordPolicy(
      [candidate.title, candidate.excerpt, candidate.author],
      options.keywordPolicy
    );
    if (!keywordDecision.passed) {
      decisions.push({
        index,
        keep: false,
        relationType: "NONE",
        discoveryValue: "DROP",
        reason: "KEYWORD_POLICY_" + keywordDecision.reason,
        mode: "DETERMINISTIC"
      });
      return;
    }
    const invalid = obviousInvalidReason(candidate, now, windowHours);
    if (invalid) {
      decisions.push({
        index,
        keep: false,
        relationType: "NONE",
        discoveryValue: "DROP",
        reason: invalid,
        mode: "DETERMINISTIC"
      });
      return;
    }

    const entityContext = options.knownEntitiesByIndex?.get(index) ?? [];
    const relation = deterministicRelation(candidate, entityContext, options);
    const relationType = relation.relationType ?? "UNKNOWN";
    const lowValueReason = lowValueDiscoveryReason(candidate, relationType, options);
    if (lowValueReason) {
      decisions.push({
        index,
        keep: false,
        relationType,
        discoveryValue: "DROP",
        reason: lowValueReason,
        mode: "DETERMINISTIC"
      });
      return;
    }
    if (options.requireExplicitAiRelation === true && (relationType === "UNKNOWN" || relationType === "NONE")) {
      decisions.push({
        index,
        keep: false,
        relationType,
        discoveryValue: "DROP",
        reason: "NOT_AI_RELATED",
        mode: "DETERMINISTIC"
      });
      return;
    }
    if (
      options.requireExplicitAiRelation === true &&
      relation.reason === "TEXT_AI_RELATION" &&
      !hasProminentAiRelation(candidate) &&
      !testSourceAiRelevance(candidate.title,options.relevanceTerms ?? []).relevant
    ) {
      decisions.push({
        index,
        keep: false,
        relationType,
        discoveryValue: "DROP",
        reason: "INCIDENTAL_AI_MENTION",
        mode: "DETERMINISTIC"
      });
      return;
    }

    decisions.push({
      index,
      keep: true,
      relationType,
      discoveryValue: "CANDIDATE",
      reason:
        relation.reason === "STRONG_KNOWN_AI_ENTITY_EVENT"
          ? "ENTITY_EVENT_CANDIDATE"
          : relation.reason === "STRONG_KNOWN_AI_ASSET_SIGNAL"
            ? "ENTITY_SIGNAL_CANDIDATE"
            : hasDiscoveryEventSignal(candidate)
              ? "EVENT_CANDIDATE"
              : "CONTEXT_CANDIDATE",
      mode: "DETERMINISTIC"
    });
  });

  decisions.sort((a, b) => a.index - b.index);
  const decisionByIndex = new Map(decisions.map((decision) => [decision.index, decision]));
  const items = candidates.flatMap((candidate, index) => {
    const decision = decisionByIndex.get(index);
    if (!decision?.keep) return [];
    return [{
      ...candidate,
      metadata: {
        ...(candidate.metadata ?? {}),
        discoveryFilter: {
          version: "ai-discovery-filter-v2",
          relationType: decision.relationType,
          discoveryValue: decision.discoveryValue,
          reason: decision.reason,
          mode: decision.mode,
          entityContext: {
            matchedEntityIds: (options.knownEntitiesByIndex?.get(index) ?? [])
              .filter((entity) => entity.status === "KNOWN" && entity.referenceStrength === "STRONG")
              .map((entity) => entity.entityId),
            matchedSignalAssetEntityIds: (options.knownEntitiesByIndex?.get(index) ?? [])
              .filter((entity) =>
                entity.status === "KNOWN" &&
                entity.referenceStrength === "STRONG" &&
                SIGNAL_ASSET_ENTITY_TYPES.has(entity.entityType)
              )
              .map((entity) => entity.entityId),
            promotedByEntityEvent: decision.reason === "ENTITY_EVENT_CANDIDATE",
            promotedBySignalAsset: decision.reason === "ENTITY_SIGNAL_CANDIDATE"
          },
          industry: industryHint(candidate),
          impactTypes: impactHints(candidate)
        }
      }
    }] as T[];
  });

  return {
    items,
    decisions,
    stats: {
      received: candidates.length,
      kept: items.length,
      dropped: candidates.length - items.length,
      deterministicDropped: decisions.filter((item) => !item.keep && item.mode === "DETERMINISTIC").length,
      classified: decisions.filter((item) => item.keep).length
    }
  };
}
