import "server-only";

export const EVENT_EXPANSION_TYPES = [
  "EXPERIENCE",
  "TUTORIAL",
  "USE_CASE",
  "WORK_IMPACT",
  "DEMO",
  "DISCUSSION",
  "SHAREABLE"
] as const;

export type EventExpansionType = (typeof EVENT_EXPANSION_TYPES)[number];

export const CREATOR_PRACTICAL_POLICY_VERSION = "creator-practical-v1";

export const EVENT_EXPANSION_MEDIA_TYPES = [
  "ARTICLE",
  "VIDEO",
  "IMAGE_TEXT",
  "POST",
  "REPO"
] as const;

export type EventExpansionMediaType = (typeof EVENT_EXPANSION_MEDIA_TYPES)[number];

export type EventExpansionQuery = {
  expansionType: EventExpansionType;
  language: "ZH" | "EN";
  query: string;
  priority: number;
  sourceFocus?: "CREATOR_PRACTICAL" | "GENERAL_REFERENCE";
};

export type EventExpansionCandidate = {
  rawItemId: string;
  platform: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: Date | string | null;
  platformMetrics?: Record<string, unknown> | null;
  query?: string | null;
  expansionRunId?: string | null;
};

export type EventExpansionContext = {
  title: string;
  summary?: string | null;
  keywords?: unknown;
  entityTerms?: unknown;
};

const TYPE_PATTERNS: Array<[EventExpansionType, RegExp]> = [
  ["EXPERIENCE", /实测|体验|上手|试用|测评|对比测试|hands[- ]?on|review|tested|testing|benchmark/i],
  ["TUTORIAL", /教程|指南|如何|怎么用|入门|步骤|配置|详细操作|操作步骤|操作指南|tutorial|how to|guide|walkthrough|getting started/i],
  ["USE_CASE", /案例|场景|用法|工作流|应用|use case|workflow|built with|made with|using .* for/i],
  ["WORK_IMPACT", /工作|岗位|行业|办公|效率|生产力|运营|营销|客服|设计|编程|开发|教育|医疗|金融|productivity|workplace|industry|marketing|coding|developer|customer service/i],
  ["DEMO", /演示|demo|showcase|演示视频|效果展示|live demo/i],
  ["DISCUSSION", /讨论|反馈|争议|评价|怎么看|社区|discussion|feedback|community|opinion|reaction/i],
  ["SHAREABLE", /总结|清单|一图|速览|值得收藏|对比|要点|盘点|summary|comparison|cheat sheet|top \d+|things to know/i]
];

function stringList(value: unknown, limit = 24) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const text = item.trim().replace(/\s+/g, " ");
    if (!text) continue;
    const key = text.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= limit) break;
  }
  return out;
}

function compactSubject(value: string) {
  return value
    .replace(/[“”"'‘’]/g, "")
    .replace(/[：:|｜—–]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

function looksChinese(value: string) {
  const chinese = (value.match(/[㐀-鿿]/g) ?? []).length;
  const letters = (value.match(/[A-Za-z㐀-鿿]/g) ?? []).length;
  return letters > 0 && chinese / letters >= 0.2;
}

export function detectExpansionLanguage(title: string, excerpt?: string | null) {
  return looksChinese([title, excerpt ?? ""].join(" ")) ? "ZH" as const : "EN_OR_OTHER" as const;
}

const GENERIC_TITLE_TERMS = new Set([
  "ai", "official", "launch", "launches", "launched", "release", "released",
  "update", "updated", "new", "introduces", "introduced", "announces", "announced",
  "a", "an", "the", "of", "for", "with", "from", "on", "in", "to", "and", "or", "by", "via", "using", "use",
  "evaluation", "behavioral", "framework", "system", "systems", "model", "models", "llm", "llms", "approach", "approaches",
  "method", "methods", "analysis", "study", "benchmark", "reasoning", "performance",
  "how", "why", "what", "when", "where", "who", "we", "our", "your", "their", "were", "was", "is", "are", "be", "being", "been",
  "make", "makes", "made", "making", "ever", "better", "smarter", "health"
]);

const GENERIC_EVENT_KEYWORDS = new Set([
  "ai", "人工智能", "模型", "工具", "开源", "工作流", "产品", "功能", "发布", "更新",
  "使用", "体验", "实测", "教程", "指南", "案例", "场景", "应用", "效率", "demo"
]);

function specificTitleAnchors(input: EventExpansionContext) {
  const entityKeys = new Set(stringList(input.entityTerms, 20).map((term) => normalized(term)));
  const tokens = compactSubject(input.title).match(/[A-Za-z][A-Za-z0-9._-]*|\d+(?:\.\d+)+/g) ?? [];
  const unique = new Map<string, string>();
  for (const token of tokens) {
    const key = normalized(token);
    if (token.length < 2 || entityKeys.has(key) || GENERIC_TITLE_TERMS.has(key)) continue;
    if (!unique.has(key)) unique.set(key, token);
  }
  return [...unique.values()]
    .sort((a, b) =>
      Number(/[\d._-]/.test(b)) - Number(/[\d._-]/.test(a)) ||
      b.replace(/[-\/_\s]+/g, "").length - a.replace(/[-\/_\s]+/g, "").length
    )
    .slice(0, 4);
}

function specificKeywordAnchors(input: EventExpansionContext) {
  const entityKeys = new Set(stringList(input.entityTerms, 20).map((term) => normalized(term)));
  return stringList(input.keywords, 20)
    .filter((term) => {
      const key = normalized(term);
      return term.length >= 3 && !entityKeys.has(key) && !GENERIC_EVENT_KEYWORDS.has(key);
    })
    .slice(0, 4);
}

function versionEntityAnchors(input: EventExpansionContext) {
  return stringList(input.entityTerms, 20)
    .filter((term) => /\d/.test(term) && term.length >= 3)
    .slice(0, 3);
}

function specificEventAnchors(input: EventExpansionContext) {
  const seen = new Set<string>();
  return [...specificTitleAnchors(input), ...specificKeywordAnchors(input)]
    .filter((term) => {
      const key = normalized(term);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

function primarySubject(input: EventExpansionContext) {
  const entityTerms = stringList(input.entityTerms, 12);
  const distinct: string[] = [];
  const seen = new Set<string>();
  for (const term of entityTerms) {
    const key = normalized(term);
    if (seen.has(key)) continue;
    seen.add(key);
    distinct.push(term);
    if (distinct.length >= 2) break;
  }
  const anchors = specificEventAnchors(input);
  if (distinct.length) return compactSubject([...distinct, ...anchors.slice(0, 3)].join(" "));
  if (anchors.length) return compactSubject(anchors.slice(0, 3).join(" "));
  return compactSubject(input.title);
}

export function buildEventExpansionQueryPlan(
  input: EventExpansionContext,
  maxQueries = 10,
  desiredTypes?: readonly EventExpansionType[]
) {
  const subject = primarySubject(input);
  const bounded = Math.max(1, Math.min(10, Math.round(maxQueries)));
  const queries: EventExpansionQuery[] = [];
  const seen = new Set<string>();
  const desired = desiredTypes ? new Set(desiredTypes) : null;

  function push(expansionType: EventExpansionType, language: "ZH" | "EN", suffix: string, priority: number) {
    if (!subject || queries.length >= bounded || (desired && !desired.has(expansionType))) return;
    const query = (subject + " " + suffix).replace(/\s+/g, " ").trim();
    const key = query.toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    queries.push({ expansionType, language, query, priority });
  }

  push("EXPERIENCE", "ZH", "实测 体验 上手", 100);
  push("TUTORIAL", "ZH", "教程 怎么用 使用指南", 98);
  push("USE_CASE", "ZH", "使用案例 应用场景 工作流", 96);
  push("WORK_IMPACT", "ZH", "工作帮助 行业应用 效率", 94);
  push("DEMO", "ZH", "演示 Demo 效果展示", 92);
  push("DISCUSSION", "ZH", "用户反馈 社区讨论", 90);
  push("SHAREABLE", "ZH", "总结 对比 清单", 88);
  push("EXPERIENCE", "EN", "review hands-on real-world test", 70);
  push("TUTORIAL", "EN", "tutorial how to guide", 68);
  push("USE_CASE", "EN", "use case workflow productivity", 66);

  return {
    subject,
    queries,
    chineseQueries: queries.filter((item) => item.language === "ZH"),
    overseasQueries: queries.filter((item) => item.language === "EN")
  };
}

export function buildCreatorFirstEventExpansionQueryPlan(
  input: EventExpansionContext,
  maxQueries = 10,
  desiredTypes?: readonly EventExpansionType[]
) {
  const subject = primarySubject(input);
  const creatorAnchorTerms = [...new Set([
    ...specificEventAnchors(input),
    ...versionEntityAnchors(input)
  ])];
  const creatorSearchEligible = creatorAnchorTerms.length > 0;
  const bounded = Math.max(1, Math.min(10, Math.round(maxQueries)));
  const creatorQueries: EventExpansionQuery[] = [];
  const seen = new Set<string>();
  const desired = desiredTypes ? new Set(desiredTypes) : null;

  function push(expansionType: EventExpansionType, language: "ZH" | "EN", suffix: string, priority: number) {
    if (!subject || !creatorSearchEligible || creatorQueries.length >= bounded || (desired && !desired.has(expansionType))) return;
    const query = (subject + " " + suffix).replace(/\s+/g, " ").trim();
    const key = query.toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    creatorQueries.push({
      expansionType,
      language,
      query,
      priority,
      sourceFocus: "CREATOR_PRACTICAL"
    });
  }

  push("EXPERIENCE", "ZH", "实测 上手 演示", 110);
  push("TUTORIAL", "ZH", "教程 怎么用 步骤", 108);
  push("USE_CASE", "ZH", "工作流 使用案例 办公", 106);
  push("WORK_IMPACT", "ZH", "工作帮助 行业应用 效率", 104);
  push("SHAREABLE", "ZH", "总结 对比 清单", 102);
  push("EXPERIENCE", "EN", "hands-on review demo", 84);
  push("TUTORIAL", "EN", "tutorial how to walkthrough", 82);
  push("USE_CASE", "EN", "workflow use case productivity", 80);
  push("WORK_IMPACT", "EN", "work impact industry productivity", 78);
  push("SHAREABLE", "EN", "comparison summary checklist", 76);

  return {
    subject,
    creatorQueries,
    creatorSearchEligible,
    creatorAnchorTerms,
    chineseCreatorQueries: creatorQueries.filter((item) => item.language === "ZH"),
    overseasCreatorQueries: creatorQueries.filter((item) => item.language === "EN")
  };
}

function normalized(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase();
}

function containsTerm(text: string, term: string) {
  const normalizedText = normalized(text);
  const normalizedTerm = normalized(term);
  if (/^[a-z0-9][a-z0-9._\/-]*$/i.test(term)) {
    const comparableText = normalizedText.replace(/[-\/_]+/g, " ");
    const comparableTerm = normalizedTerm.replace(/[-\/_]+/g, " ");
    const escaped = comparableTerm
      .replace(/[.*+?^$(){}|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    return new RegExp("(^|[^a-z0-9])" + escaped + "([^a-z0-9]|$)", "i").test(comparableText);
  }
  return normalizedText.includes(normalizedTerm);
}

function matchSubjectTerms(text: string, titleText: string, context: EventExpansionContext) {
  const candidates = [
    ...stringList(context.entityTerms, 16),
    ...stringList(context.keywords, 16)
  ]
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

  const matched = candidates.filter((term) => containsTerm(text, term));
  const title = compactSubject(context.title);
  const genericTitleTokens = new Set(["the", "and", "with", "from", "into", "for", "system", "systems", "llm", "llms", "ai", "agent", "agents", "model", "models", "new", "using", "framework", "platform", "发布", "推出", "更新", "模型", "人工智能", "系统", "平台", "框架"]);
  const titleTokens = title
    .split(/[^A-Za-z0-9㐀-鿿._-]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3)
    .filter((term) => !genericTitleTokens.has(normalized(term)))
    .slice(0, 12);
  const matchedTitleTokens = titleTokens.filter((term) => containsTerm(text, term));
  const specificAnchors = specificEventAnchors(context);
  const matchedSpecificAnchors = specificAnchors.filter((term) => containsTerm(text, term));
  const matchedTitleSpecificAnchors = specificAnchors.filter((term) => containsTerm(titleText, term));
  const versionAnchors = [...new Set([
    ...specificAnchors.filter((term) => /\d/.test(term)),
    ...versionEntityAnchors(context)
  ])];
  const matchedVersionAnchors = versionAnchors.filter((term) => containsTerm(text, term));
  const matchedTitleVersionAnchors = versionAnchors.filter((term) => containsTerm(titleText, term));
  const subjectTitleMatches = candidates.filter((term) => containsTerm(titleText, term));
  return {
    matchedTerms: [...new Set([...matched, ...matchedTitleTokens, ...matchedSpecificAnchors])],
    subjectMatchCount: matched.length,
    subjectTitleMatchCount: subjectTitleMatches.length,
    titleTokenMatchCount: matchedTitleTokens.length,
    specificAnchors,
    matchedSpecificAnchors,
    matchedTitleSpecificAnchors,
    versionAnchors,
    matchedVersionAnchors,
    matchedTitleVersionAnchors
  };
}

function expansionValueSignalText(
  candidate: EventExpansionCandidate,
  relation: ReturnType<typeof matchSubjectTerms>
) {
  const anchors = [...new Set([
    ...relation.matchedTitleVersionAnchors,
    ...relation.matchedTitleSpecificAnchors,
    ...relation.matchedVersionAnchors,
    ...relation.matchedSpecificAnchors
  ])];
  if (!candidate.excerpt || anchors.length === 0) return candidate.title;

  const chunks = candidate.excerpt
    .split(/(?:\r?\n+|[。！？!?；;,，]+|\s+\d+\.\s+)/)
    .map((item) => item.trim())
    .filter(Boolean);
  const relatedIndexes = chunks.flatMap((chunk, index) =>
    anchors.some((anchor) => containsTerm(chunk, anchor)) ? [index] : []
  );
  const scopedIndexes = new Set<number>();
  for (const index of relatedIndexes) {
    scopedIndexes.add(index);
    if (index > 0) scopedIndexes.add(index - 1);
    if (index + 1 < chunks.length) scopedIndexes.add(index + 1);
  }
  const relatedChunks = [...scopedIndexes]
    .sort((a, b) => a - b)
    .map((index) => chunks[index]);
  return [candidate.title, ...relatedChunks].join(" ");
}

export function inferExpansionMediaType(platform: string): EventExpansionMediaType {
  const value = platform.trim().toUpperCase();
  if (value === "YOUTUBE" || value === "BILIBILI" || value === "DOUYIN") return "VIDEO";
  if (value === "XIAOHONGSHU") return "IMAGE_TEXT";
  if (value === "GITHUB" || value === "HELLOGITHUB") return "REPO";
  if (["X", "REDDIT", "HACKER_NEWS", "WEIBO"].includes(value)) return "POST";
  return "ARTICLE";
}

function shadowSignalFromMetrics(metrics: Record<string, unknown> | null | undefined) {
  if (!metrics) return 0;
  const numbers = Object.values(metrics)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  if (!numbers.length) return 0;
  const max = Math.max(...numbers);
  return Math.max(0, Math.min(100, Math.round(Math.log10(max + 1) * 22)));
}

const CREATOR_PLATFORMS = new Set(["BILIBILI", "YOUTUBE", "XIAOHONGSHU", "ZHIHU"]);
const CREATOR_PRACTICAL_PATTERN = /实测|体验|上手|教程|指南|怎么用|步骤|详细操作|操作步骤|操作指南|演示|demo|工作流|使用案例|应用场景|办公|效率|测评|对比|清单|walkthrough|hands[- ]?on|tutorial|how to|workflow|use case|showcase|productivity|review/i;
const NEWS_ONLY_PATTERN = /新闻|快讯|日报|周报|宣布|正式发布|发布会|融资|报道称|回应|指控|news|breaking|announces?|released?|report/i;

export function scoreCreatorPracticalCandidate(candidate: EventExpansionCandidate) {
  const platform = candidate.platform.trim().toUpperCase();
  const mediaType = inferExpansionMediaType(platform);
  const title = candidate.title;
  const text = [candidate.title, candidate.excerpt ?? ""].join(" ");
  const query = candidate.query ?? "";
  const titlePractical = CREATOR_PRACTICAL_PATTERN.test(title);
  const bodyPractical = CREATOR_PRACTICAL_PATTERN.test(text);
  const queryPractical = CREATOR_PRACTICAL_PATTERN.test(query);
  const newsLike = NEWS_ONLY_PATTERN.test(title);
  const creatorSourceRole = CREATOR_PLATFORMS.has(platform) ? "CREATOR" as const : "GENERAL_REFERENCE" as const;

  let score = creatorSourceRole === "CREATOR" ? 38 : 18;
  if (mediaType === "VIDEO" || mediaType === "IMAGE_TEXT") score += 16;
  if (titlePractical) score += 30;
  else if (bodyPractical) score += 16;
  if (queryPractical) score += 8;
  if (newsLike && !titlePractical) score -= 28;
  if (newsLike && titlePractical) score -= 6;

  return {
    creatorSourceRole,
    creatorPracticalScore: Math.max(0, Math.min(100, score)),
    titlePractical,
    bodyPractical,
    queryPractical,
    newsLike
  };
}

export function classifyEventExpansionCandidate(
  context: EventExpansionContext,
  candidate: EventExpansionCandidate
) {
  const text = [candidate.title, candidate.excerpt ?? ""].join(" ");
  const relation = matchSubjectTerms(text, candidate.title, context);
  const creatorPractical = scoreCreatorPracticalCandidate(candidate);
  if (
    creatorPractical.creatorSourceRole === "CREATOR" &&
    relation.specificAnchors.length === 0 &&
    relation.versionAnchors.length === 0
  ) return null;
  if (relation.versionAnchors.length > 0) {
    if (relation.matchedTitleVersionAnchors.length === 0) return null;
  } else if (relation.specificAnchors.length > 0) {
    if (relation.matchedTitleSpecificAnchors.length === 0) return null;
    const strongSingleAnchor = relation.matchedTitleSpecificAnchors.some((anchor) =>
      normalized(anchor).replace(/[-\/_\s]+/g, "").length >= 8
    );
    if (
      relation.matchedSpecificAnchors.length < 2 &&
      relation.subjectTitleMatchCount === 0 &&
      !strongSingleAnchor
    ) return null;
  } else if (relation.subjectTitleMatchCount === 0 && relation.titleTokenMatchCount < 2) {
    return null;
  }

  const valueSignalText = expansionValueSignalText(candidate, relation);
  if (creatorPractical.creatorSourceRole === "CREATOR" && creatorPractical.creatorPracticalScore < 50) return null;
  const matchedTypes = TYPE_PATTERNS
    .filter(([, pattern]) => pattern.test(valueSignalText))
    .map(([type]) => type);
  if (!matchedTypes.length) return null;

  const expansionType = matchedTypes[0];
  const language = detectExpansionLanguage(candidate.title, candidate.excerpt);
  const relevanceScore = Math.max(
    0,
    Math.min(
      100,
      42 + relation.subjectMatchCount * 16 + relation.titleTokenMatchCount * 7
    )
  );
  const typeValue = expansionType === "TUTORIAL" || expansionType === "USE_CASE" || expansionType === "WORK_IMPACT"
    ? 84
    : expansionType === "EXPERIENCE" || expansionType === "DEMO"
      ? 78
      : 68;
  const languageBonus = language === "ZH" ? 12 : 0;
  const valueScore = Math.min(100, typeValue + languageBonus);
  const baseRankScore = Math.round(
    relevanceScore * 0.52 + valueScore * 0.33 + creatorPractical.creatorPracticalScore * 0.15
  );
  const rankScore = Math.max(
    0,
    Math.min(
      100,
      baseRankScore + (language === "ZH" ? 5 : 0) + (creatorPractical.creatorSourceRole === "CREATOR" ? 4 : 0)
    )
  );
  const shadowSignalScore = shadowSignalFromMetrics(candidate.platformMetrics);

  return {
    rawItemId: candidate.rawItemId,
    expansionType,
    secondaryTypes: matchedTypes.slice(1),
    mediaType: inferExpansionMediaType(candidate.platform),
    language,
    relevanceScore,
    valueScore,
    rankScore,
    creatorPracticalScore: creatorPractical.creatorPracticalScore,
    shadowSignalScore,
    query: candidate.query ?? null,
    expansionRunId: candidate.expansionRunId ?? null,
    metadata: {
      matchedTerms: relation.matchedTerms,
      subjectMatchCount: relation.subjectMatchCount,
      subjectTitleMatchCount: relation.subjectTitleMatchCount,
      titleTokenMatchCount: relation.titleTokenMatchCount,
      specificAnchors: relation.specificAnchors,
      matchedSpecificAnchors: relation.matchedSpecificAnchors,
      matchedTitleSpecificAnchors: relation.matchedTitleSpecificAnchors,
      versionAnchors: relation.versionAnchors,
      matchedVersionAnchors: relation.matchedVersionAnchors,
      matchedTitleVersionAnchors: relation.matchedTitleVersionAnchors,
      valueSignalScopedToEvent: true,
      chinesePriorityApplied: language === "ZH",
      creatorSourceRole: creatorPractical.creatorSourceRole,
      creatorPracticalScore: creatorPractical.creatorPracticalScore,
      creatorTitlePractical: creatorPractical.titlePractical,
      creatorNewsLike: creatorPractical.newsLike,
      creatorPolicyVersion: CREATOR_PRACTICAL_POLICY_VERSION,
      formalFactAuthorityChanged: false,
      formalHotspotPromotion: false
    }
  };
}

export function selectEventExpansionEvidence<T extends {
  rawItemId: string;
  expansionType: EventExpansionType;
  rankScore: number;
  language: string;
  creatorPracticalScore?: number;
  formalPracticalSource?: boolean;
}>(items: T[], limit = 10) {
  const bounded = Math.max(1, Math.min(10, Math.round(limit)));
  const sorted = [...items].sort((a, b) =>
    Number(b.formalPracticalSource === true) - Number(a.formalPracticalSource === true) ||
    (b.creatorPracticalScore ?? 0) - (a.creatorPracticalScore ?? 0) ||
    b.rankScore - a.rankScore ||
    Number(b.language === "ZH") - Number(a.language === "ZH")
  );
  const typeCount = new Map<EventExpansionType, number>();
  const selected: T[] = [];
  const seen = new Set<string>();
  for (const item of sorted) {
    if (seen.has(item.rawItemId)) continue;
    const count = typeCount.get(item.expansionType) ?? 0;
    if (count >= 2) continue;
    selected.push(item);
    seen.add(item.rawItemId);
    typeCount.set(item.expansionType, count + 1);
    if (selected.length >= bounded) break;
  }
  return selected;
}

export function calculateExpansionShadowSignal(items: Array<{
  expansionType: EventExpansionType;
  mediaType: EventExpansionMediaType;
  language: string;
  shadowSignalScore: number;
}>) {
  const types = new Set(items.map((item) => item.expansionType)).size;
  const media = new Set(items.map((item) => item.mediaType)).size;
  const chinese = items.filter((item) => item.language === "ZH").length;
  const observed = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.shadowSignalScore, 0) / items.length)
    : 0;
  const score = Math.min(100, items.length * 5 + types * 7 + media * 4 + chinese * 2 + Math.round(observed * 0.2));
  return {
    mode: "SHADOW" as const,
    score,
    evidenceCount: items.length,
    typeDiversity: types,
    mediaDiversity: media,
    chineseEvidenceCount: chinese,
    formalHotspotPromotion: false as const,
    formalRankingChanged: false as const
  };
}

export const EVENT_EXPANSION_CAPABILITIES = {
  existingRawReuse: ["BILIBILI", "ZHIHU", "WEIBO", "XIAOHONGSHU", "YOUTUBE", "X", "REDDIT", "GITHUB", "MEDIA"],
  liveSearch: ["BILIBILI_SEARCH", "YOUTUBE_SEARCH", "HN_ALGOLIA", "GITHUB_SEARCH"],
  explicitFallbackSearch: [],
  gaps: {
    ZHIHU_SEARCH: "NO_SERVER_RUNNABLE_PUBLIC_ROUTE",
    XIAOHONGSHU_SEARCH: "NO_SERVER_RUNNABLE_PUBLIC_ROUTE",
    BILIBILI_SEARCH: "PUBLIC_SEARCH_BEST_EFFORT_WITH_RISK_CONTROL",
    YOUTUBE_SEARCH: "OFFICIAL_API_OR_OVERSEAS_RELAY",
    X_SEARCH: "NO_CURRENT_SERVER_ROUTE"
  }
} as const;
