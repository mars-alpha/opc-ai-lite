import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ADMIN_OFFICIAL_CONTENT_FAILED:" + code);
}

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}

const page = read("app/admin/content/page.tsx");
const workspace = read("components/AdminPlatformContentWorkspace.tsx");
const strategyUi = read("components/AdminCollectionStrategyPanel.tsx");
const studioUi = read("components/AdminContentStudioWorkspace.tsx");
const discovery = read("lib/server/content/discovery.ts");
const adoption = read("lib/server/content/adoption.ts");
const decisionRoute = read("app/api/admin/content/discovery/events/[eventId]/decision/route.ts");
const briefEnrichment = read("lib/server/content/content-brief-enrichment.ts");
const css = read("app/admin/content/official-content.css");

assert(page.includes("AdminPlatformContentWorkspace"), "WORKSPACE_ENTRY_MISSING");
assert(page.includes("内容采集"), "CONTENT_COLLECTION_LABEL_MISSING");
assert(!page.includes("WorkbenchProduct") && !workspace.includes("WorkspaceUser"), "USER_CONTENT_BOUNDARY_MISSING");

assert(!workspace.includes('type Stage = "LIBRARY" | "CANDIDATE" | "REVIEW"'), "STAGE_DRIVEN_IA_PRESENT");
assert(!workspace.includes("admin-platform-flow-interactive"), "STAGE_FLOW_UI_PRESENT");
assert(workspace.includes('type View = "INTELLIGENCE" | "WORKBENCH" | "STRATEGY"'), "OPS_VIEW_MODEL_MISSING");
assert(workspace.includes('initialView = "INTELLIGENCE"'), "INTELLIGENCE_MUST_BE_DEFAULT");
assert(page.includes('view === "strategy"') && page.includes('view === "workbench"'), "CONTENT_DEEP_LINK_VIEW_MISSING");
for (const label of ["今日情报", "内容工作台", "采集策略"]) {
  assert(workspace.includes(label), "OPS_VIEW_MISSING:" + label);
}
for (const oldLabel of ['label: "总览"', 'label: "今日发现"', 'label: "待审批"', 'label: "采集配置"']) {
  assert(!workspace.includes(oldLabel), "OLD_OPS_VIEW_PRESENT:" + oldLabel);
}
assert(workspace.includes("今日热点"), "TODAY_HOTSPOT_MISSING");
assert(!workspace.includes("最新资讯"), "LATEST_NEWS_DUPLICATE_PRESENT");
assert(workspace.includes("查看原文"), "ORIGINAL_SOURCE_LINK_MISSING");
assert(workspace.includes("来源与原文"), "SOURCE_FACTS_MISSING");
assert(workspace.includes("selectedEventSourceCount"), "SOURCE_COUNT_ALIGNMENT_MISSING");
assert(workspace.includes("discoverySourceNames"), "SOURCE_NAME_ALIGNMENT_MISSING");
assert(workspace.includes("collectionStrategies"), "STRATEGY_PROVENANCE_MISSING");
assert(workspace.includes("采集策略："), "STRATEGY_PROVENANCE_UI_MISSING");
assert(workspace.includes("languagePolicyLabel"), "LANGUAGE_POLICY_UI_MISSING");
assert(workspace.includes("raw-items?limit=500"), "RAW_ITEM_DETAIL_LIMIT_ALIGNMENT_MISSING");
assert(!workspace.includes('readJson("/api/admin/content/items")'), "INTELLIGENCE_MUST_NOT_EAGER_LOAD_WORKBENCH_ITEMS");
assert(workspace.includes("visibleHotspotEvents.some"), "VISIBLE_EVENT_SELECTION_SYNC_MISSING");
assert(workspace.includes("标签"), "TAG_INTELLIGENCE_MISSING");
assert(workspace.includes("采用"), "EVENT_ADOPT_MISSING");
assert(workspace.includes("观察"), "EVENT_WATCH_MISSING");
assert(workspace.includes("忽略"), "EVENT_IGNORE_MISSING");
assert(workspace.includes("采用并进入内容工作台"), "EVENT_PRIMARY_ACTION_MISSING");
assert(workspace.includes("<AdminCollectionStrategyPanel"), "COLLECTION_STRATEGY_PANEL_MISSING");
assert(strategyUi.includes("采集策略名称"), "STRATEGY_NAME_MISSING");
assert(strategyUi.includes("name: form.name.trim()"), "STRATEGY_NAME_SAVE_MISSING");
assert(strategyUi.includes("AI 模型"), "STRATEGY_AI_MODEL_MISSING");
assert(strategyUi.includes("采集描述"), "STRATEGY_DESCRIPTION_MISSING");
assert(strategyUi.includes("竞品主页"), "COMPETITOR_STRATEGY_MISSING");
assert(strategyUi.includes("评论挖需"), "COMMENT_MINING_STRATEGY_MISSING");
assert(strategyUi.includes("互动与粉丝筛选"), "ENGAGEMENT_STRATEGY_MISSING");
assert(strategyUi.includes("最低播放"), "VIEW_STRATEGY_MISSING");
assert(strategyUi.includes("最低粉丝数"), "FOLLOWER_STRATEGY_MISSING");
assert(!workspace.includes("运行 AI 分析"), "EVENT_AI_VISIBLE_ACTION_PRESENT");
assert(!workspace.includes("official-ai-assist"), "EVENT_AI_VISIBLE_PANEL_PRESENT");
assert(strategyUi.includes("例如 Agent、MCP、Claude Code"), "TAG_INPUT_MISSING");
assert(strategyUi.includes("onClick={addTopic}"), "TAG_MANAGEMENT_MISSING");
assert(!workspace.includes("WorkbenchStep"), "WORKBENCH_STEP_MODEL_PRESENT");
assert(workspace.includes("<AdminContentStudioWorkspace"), "CONTENT_STUDIO_MISSING");
assert(!workspace.includes("StrategyStep"), "STRATEGY_STEP_MODEL_PRESENT");
assert(strategyUi.includes("删除"), "STRATEGY_DELETE_UI_MISSING");
for (const oldField of ["渠道名称", "来源类型", "来源地址", "采集方式"]) {
  assert(!strategyUi.includes(oldField), "SOURCE_CONFIG_UI_REMAINS:" + oldField);
}
assert(studioUi.includes("生成什么"), "OUTPUT_SELECTION_UI_MISSING");
assert(studioUi.includes("生成结果"), "GENERATED_RESULT_STAGE_MISSING");
assert(studioUi.includes("素材"), "ASSET_PANEL_MISSING");
assert(studioUi.includes("审核与发布"), "REVIEW_PUBLISH_PANEL_MISSING");
assert(studioUi.includes("content-result-editor"), "RESULT_EDITOR_MISSING");
assert(studioUi.includes("insertAsset"), "ASSET_EDITOR_INTERACTION_MISSING");
assert(studioUi.includes("showDirectoryPicker"), "OUTPUT_FOLDER_PICKER_MISSING");
assert(studioUi.includes("推送到飞书"), "FEISHU_RESULT_ACTION_MISSING");
assert(!studioUi.includes('id: "FEISHU"'), "FEISHU_MUST_NOT_BE_OUTPUT_TYPE");
assert(!studioUi.includes('id: "CAPCUT"'), "CAPCUT_MUST_NOT_BE_OUTPUT_TYPE");
assert(!studioUi.includes("content-studio-toolbar"), "DUPLICATE_TOP_ACTION_ROW_PRESENT");
assert(studioUi.includes("opc-content-output-plan:"), "LOCAL_OUTPUT_CACHE_MISSING");
assert(!workspace.includes("<AdminContentAnalysisPanel"), "OLD_ANALYSIS_WORKSPACE_PRESENT");
assert(!workspace.includes("<AdminContentCandidateGenerator"), "OLD_CANDIDATE_WORKSPACE_PRESENT");
assert(studioUi.includes('selected.status === "DRAFT"'), "DRAFT_ACTION_GATE_MISSING");
assert(studioUi.includes('selected.status === "REVIEW"'), "STATUS_DRIVEN_ACTIONS_MISSING");
assert(studioUi.includes("正式发布"), "PUBLISH_ACTION_MISSING");
assert(!studioUi.includes("确认预览无误"), "BRIEF_PREVIEW_GATE_REMAINS");
assert(!studioUi.includes("确认来源无误"), "SOURCE_CONFIRMATION_REMAINS");
assert(adoption.includes("ensureContentDraftForEvent"), "DIRECT_ADOPT_DRAFT_MISSING");
assert(decisionRoute.includes("enrichContentBriefAfterAdoption"), "ADOPT_BRIEF_AI_ORCHESTRATION_MISSING");
assert(decisionRoute.includes("after(async"), "ADOPT_BRIEF_AI_MUST_NOT_BLOCK_RESPONSE");
assert(briefEnrichment.includes("coreViewpoint"), "CONTENT_BRIEF_CORE_VIEWPOINT_AI_MISSING");
assert(briefEnrichment.includes("audience"), "CONTENT_BRIEF_AUDIENCE_AI_MISSING");
assert(briefEnrichment.includes("purpose"), "CONTENT_BRIEF_PURPOSE_AI_MISSING");
assert(briefEnrichment.includes("tags"), "CONTENT_BRIEF_TAG_AI_MISSING");
assert(!discovery.includes("insert(contentItems)"), "DISCOVERY_CONTENT_WRITE_BOUNDARY_BROKEN");

assert(studioUi.includes("审核通过"), "HUMAN_REVIEW_ACTION_MISSING");
assert(studioUi.includes("content-studio-audit-stream"), "AUDIT_STREAM_MISSING");
assert(!studioUi.includes('<details className="content-studio-audit"'), "AUDIT_MUST_NOT_COLLAPSE");
assert(studioUi.includes("hasReviewableResult"), "REVIEW_RESULT_GATE_MISSING");
assert(strategyUi.includes("保存并测试策略"), "STRATEGY_SAVE_TEST_MISSING");
assert(strategyUi.includes("Collector 默认只返回引用"), "COLLECTOR_MEDIA_BOUNDARY_COPY_MISSING");
assert(discovery.includes("canonicalizeOriginalUrl"), "GLOBAL_CANONICAL_URL_DEDUPE_MISSING");
assert(discovery.includes("contentRawItemObservations"), "RAW_SOURCE_OBSERVATION_MISSING");
assert(css.includes("max-height: 180px") && css.includes("overflow-y: auto"), "AUDIT_INTERNAL_SCROLL_MISSING");

console.log("ADMIN_OFFICIAL_CONTENT_INTELLIGENCE_FIRST=PASS");
console.log("ADMIN_OFFICIAL_CONTENT_THREE_ENTRY_IA=PASS");
console.log("ADMIN_OFFICIAL_CONTENT_WORKBENCH_DEDUP=PASS");
console.log("ADMIN_OFFICIAL_CONTENT_STATUS_DRIVEN_WORKSPACE=PASS");
console.log("ADMIN_OFFICIAL_CONTENT_BOUNDARY=PASS");
