import {
  CREATOR_PRACTICAL_POLICY_VERSION,
  buildCreatorFirstEventExpansionQueryPlan,
  classifyEventExpansionCandidate,
  selectEventExpansionEvidence
} from "../lib/server/content/event-expansion";
import {
  DEFAULT_EVENT_EXPANSION_SEARCH_PROVIDERS,
  providerQueryPlan
} from "../lib/server/content/collection-expansion";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_EXPANSION_CREATOR_SOURCE_015_FAILED:" + code);
}

const context = {
  title: "ChatGPT 推出新的视觉化界面",
  summary: "OpenAI 发布 ChatGPT 新视觉界面。",
  keywords: ["ChatGPT", "视觉化界面", "新界面"],
  entityTerms: ["ChatGPT", "OpenAI"]
};

const plan = buildCreatorFirstEventExpansionQueryPlan(context, 8);

assert(plan.chineseCreatorQueries.length >= 4, "CREATOR_CHINESE_QUERY_COVERAGE");
assert(plan.chineseCreatorQueries.some((q) => /实测|上手|演示/.test(q.query)), "EXPERIENCE_DEMO_QUERY_REQUIRED");
assert(plan.chineseCreatorQueries.some((q) => /教程|怎么用|步骤/.test(q.query)), "TUTORIAL_QUERY_REQUIRED");
assert(plan.chineseCreatorQueries.some((q) => /工作流|案例|办公/.test(q.query)), "USE_CASE_QUERY_REQUIRED");
assert(plan.chineseCreatorQueries.some((q) => /工作|行业|效率/.test(q.query)), "WORK_IMPACT_QUERY_REQUIRED");
assert(plan.chineseCreatorQueries.some((q) => /总结|对比|清单/.test(q.query)), "SHAREABLE_QUERY_REQUIRED");
assert(plan.chineseCreatorQueries.every((q) => q.sourceFocus === "CREATOR_PRACTICAL"), "CREATOR_QUERY_FOCUS_REQUIRED");
assert(plan.chineseCreatorQueries.every((q) => q.query.includes("ChatGPT")), "EVENT_ANCHOR_REQUIRED");

const genericEntityOnlyPlan = buildCreatorFirstEventExpansionQueryPlan({
  title: "OpenAI 年化营收变化",
  summary: "OpenAI 营收相关消息。",
  keywords: ["OpenAI", "营收"],
  entityTerms: ["OpenAI"]
}, 8);
assert(genericEntityOnlyPlan.creatorSearchEligible === false, "GENERIC_ENTITY_ONLY_CREATOR_SEARCH_MUST_BE_GATED");
assert(genericEntityOnlyPlan.creatorQueries.length === 0, "GENERIC_ENTITY_ONLY_CREATOR_QUERY_MUST_BE_EMPTY");

assert(
  DEFAULT_EVENT_EXPANSION_SEARCH_PROVIDERS.join(",") === "BILIBILI_SEARCH,YOUTUBE_SEARCH",
  "DEFAULT_PROVIDER_MUST_BE_CREATOR_VIDEO_FIRST"
);

const biliQueries = providerQueryPlan("BILIBILI_SEARCH", plan, 4);
const youtubeQueries = providerQueryPlan("YOUTUBE_SEARCH", plan, 4);
assert(biliQueries.every((q) => q.sourceFocus === "CREATOR_PRACTICAL"), "BILIBILI_CREATOR_QUERY_ONLY");
assert(youtubeQueries.every((q) => q.sourceFocus === "CREATOR_PRACTICAL"), "YOUTUBE_CREATOR_QUERY_ONLY");

const newsOnly = classifyEventExpansionCandidate(context, {
  rawItemId: "creator-news-only",
  platform: "BILIBILI",
  title: "OpenAI 正式发布 ChatGPT 全新视觉化界面",
  excerpt: "新闻速览：OpenAI 今日宣布更新，新界面面向更多用户推出。"
});
assert(!newsOnly, "NEWS_ONLY_CREATOR_RESULT_MUST_BE_REJECTED");

const tutorial = classifyEventExpansionCandidate(context, {
  rawItemId: "creator-tutorial",
  platform: "BILIBILI",
  title: "ChatGPT 新界面上手实测：5分钟看懂怎么用",
  excerpt: "逐步演示新界面的操作入口、使用步骤和真实工作流。",
  platformMetrics: { views: 50000, likes: 3200, favorites: 2500 }
});
assert(Boolean(tutorial), "CREATOR_TUTORIAL_REJECTED");
assert((tutorial?.creatorPracticalScore ?? 0) >= 70, "CREATOR_TUTORIAL_SCORE_TOO_LOW");
assert(tutorial?.metadata.creatorSourceRole === "CREATOR", "CREATOR_ROLE_MISSING");
assert(tutorial?.metadata.creatorPolicyVersion === CREATOR_PRACTICAL_POLICY_VERSION, "CREATOR_POLICY_VERSION_MISSING");

const workflow = classifyEventExpansionCandidate(context, {
  rawItemId: "creator-workflow",
  platform: "YOUTUBE",
  title: "ChatGPT 视觉化界面工作流：hands-on demo for content research",
  excerpt: "A practical walkthrough showing how the 视觉化界面 changes a research workflow.",
  platformMetrics: { views: 80000, likes: 4100, comments: 320 }
});
assert(Boolean(workflow), "CREATOR_WORKFLOW_REJECTED");

const uiuxContext = {
  title: "nextlevelbuilder/ui-ux-pro-max-skill",
  summary: "An AI skill that provides design intelligence for building professional UI/UX across multiple platforms.",
  keywords: [],
  entityTerms: []
};
const xhsDetailedOperation = classifyEventExpansionCandidate(uiuxContext, {
  rawItemId: "xhs-uiux-detailed-operation",
  platform: "XIAOHONGSHU",
  title: "Trae使用UI UX PRO MAX SKILL详细操作版",
  excerpt: "Trae使用UI UX PRO MAX SKILL详细操作版",
  platformMetrics: { likes: 116 }
});
assert(Boolean(xhsDetailedOperation), "XHS_UIUX_DETAILED_OPERATION_REJECTED");
assert(xhsDetailedOperation?.expansionType === "TUTORIAL", "XHS_UIUX_DETAILED_OPERATION_NOT_TUTORIAL");

const genericDetailedOperation = classifyEventExpansionCandidate(uiuxContext, {
  rawItemId: "xhs-generic-detailed-operation",
  platform: "XIAOHONGSHU",
  title: "前端开发详细操作版",
  excerpt: "从零开始的前端操作步骤。",
  platformMetrics: { likes: 999 }
});
assert(!genericDetailedOperation, "GENERIC_DETAILED_OPERATION_MUST_NOT_BYPASS_EVENT_ANCHOR");

const versionContext = {
  title: "Step 5 Preview 出现在 OpenRouter",
  summary: "StepFun 发布 Step 5 Preview。",
  keywords: ["Step 5 Preview", "OpenRouter"],
  entityTerms: ["StepFun", "Step 5"]
};
assert(!classifyEventExpansionCandidate(versionContext, {
  rawItemId: "same-brand-wrong-version",
  platform: "BILIBILI",
  title: "Step Code 长任务与网站发布能力实测",
  excerpt: "StepFun 编程工具的真实体验。",
  query: "StepFun Step 5 Preview 实测 上手"
}), "VERSIONED_EVENT_MUST_NOT_ACCEPT_SAME_BRAND_OTHER_PRODUCT");

const genericArticle = classifyEventExpansionCandidate(context, {
  rawItemId: "generic-article",
  platform: "HACKER_NEWS",
  title: "ChatGPT visual interface discussion",
  excerpt: "Community discussion about the product release and possible implications."
});

const selected = selectEventExpansionEvidence(
  [tutorial!, workflow!, ...(genericArticle ? [genericArticle] : [])],
  3
);
assert(selected[0]?.rawItemId === "creator-tutorial" || selected[0]?.rawItemId === "creator-workflow", "CREATOR_EVIDENCE_MUST_RANK_FIRST");
assert(selected.slice(0, 2).every((item) => (item.creatorPracticalScore ?? 0) >= 70), "TOP_EVIDENCE_MUST_BE_PRACTICAL");

console.log("EVENT_EXPANSION_CREATOR_SOURCE_015_QUERY_PLAN=PASS");
console.log("EVENT_EXPANSION_CREATOR_SOURCE_015_PROVIDER_PRIORITY=PASS");
console.log("EVENT_EXPANSION_CREATOR_SOURCE_015_NEWS_FILTER=PASS");
console.log("EVENT_EXPANSION_CREATOR_SOURCE_015_PRACTICAL_RANKING=PASS");
