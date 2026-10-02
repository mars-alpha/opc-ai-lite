import fs from "node:fs";
import {
  closeIssueCycleEvidence,
  feedbackCycleState
} from "../lib/server/learning-insights/issue-cycle";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("LEARNING_INSIGHT_V2_PHASE1_FAILED:" + code);
}

const cycleBaseRows = [1, 2, 3].map((index) => ({
  userId: "cycle-user-" + index,
  createdAt: new Date("2026-10-03T00:0" + index + ":00Z")
}));
const initialCycle = feedbackCycleState({
  evidence: {},
  status: "OPEN",
  issueKey: "dont_understand:cycle-regression",
  rows: cycleBaseRows,
  now: new Date("2026-10-03T00:04:00Z")
});
assert(initialCycle.status === "OPEN" && initialCycle.distinctUserCount === 3, "ISSUE_CYCLE_INITIAL_OPEN_FAILED");
const dismissedCycleEvidence = closeIssueCycleEvidence({
  evidence: initialCycle.evidence,
  issueKey: "dont_understand:cycle-regression",
  state: "DISMISSED",
  sampleSize: 3,
  at: new Date("2026-10-03T00:10:00Z")
});
const belowReopen = feedbackCycleState({
  evidence: dismissedCycleEvidence,
  status: "DISMISSED",
  issueKey: "dont_understand:cycle-regression",
  rows: [
    ...cycleBaseRows,
    { userId: "cycle-new-1", createdAt: new Date("2026-10-03T00:11:00Z") },
    { userId: "cycle-new-2", createdAt: new Date("2026-10-03T00:12:00Z") }
  ],
  now: new Date("2026-10-03T00:13:00Z")
});
assert(
  belowReopen.status === "DISMISSED" && belowReopen.distinctUserCount === 2,
  "ISSUE_CYCLE_PRE_THRESHOLD_REOPENED"
);
const reopenedCycle = feedbackCycleState({
  evidence: dismissedCycleEvidence,
  status: "DISMISSED",
  issueKey: "dont_understand:cycle-regression",
  rows: [
    ...cycleBaseRows,
    { userId: "cycle-new-1", createdAt: new Date("2026-10-03T00:11:00Z") },
    { userId: "cycle-new-2", createdAt: new Date("2026-10-03T00:12:00Z") },
    { userId: "cycle-new-3", createdAt: new Date("2026-10-03T00:13:00Z") }
  ],
  now: new Date("2026-10-03T00:14:00Z")
});
assert(
  reopenedCycle.status === "OPEN" &&
    reopenedCycle.distinctUserCount === 3 &&
    reopenedCycle.evidence.issueCycle &&
    typeof reopenedCycle.evidence.issueCycle === "object" &&
    !Array.isArray(reopenedCycle.evidence.issueCycle) &&
    (reopenedCycle.evidence.issueCycle as Record<string, unknown>).cycleNumber === 2,
  "ISSUE_CYCLE_REOPEN_THRESHOLD_FAILED"
);

const page = fs.readFileSync("app/admin/learning/page.tsx", "utf8");
const view = fs.readFileSync("components/AdminLearningWorkbenchV2.tsx", "utf8");
const queue = fs.readFileSync("components/admin-learning/AdminLearningCourseQueue.tsx", "utf8");
const detail = fs.readFileSync("components/admin-learning/AdminLearningCourseHealthDetail.tsx", "utf8");
const courseHeader = fs.readFileSync("components/admin-learning/AdminLearningCourseHeader.tsx", "utf8");
const issueSummary = fs.readFileSync("components/admin-learning/AdminLearningIssueSummary.tsx", "utf8");
const evidencePanel = fs.readFileSync("components/admin-learning/AdminLearningEvidencePanel.tsx", "utf8");
const decisionPanel = fs.readFileSync("components/admin-learning/AdminLearningCourseDecision.tsx", "utf8");
const viewModel = fs.readFileSync("components/admin-learning/learning-insight-view.ts", "utf8");
const effectiveEvidenceOwner = fs.readFileSync("lib/server/learning-insights/effective-evidence.ts", "utf8");
const effectiveEvidenceRoute = fs.readFileSync(
  "app/api/admin/learning/courses/[courseKey]/effective-evidence/route.ts",
  "utf8"
);
const service = fs.readFileSync("lib/server/learning-insights/service.ts", "utf8");
const route = fs.readFileSync(
  "app/api/admin/learning/courses/[courseKey]/decision/route.ts",
  "utf8"
);
const css = fs.readFileSync("app/admin/admin-v2.css", "utf8");

assert(page.includes("AdminLearningWorkbenchV2"), "V2_WORKBENCH_NOT_CURRENT");
assert(page.includes("<h1>学习洞察</h1>"), "LEARNING_INSIGHT_PAGE_TITLE_MISSING");
assert(page.includes("admin-platform-flow-learning"), "APPROVED_FOUR_STAGE_FLOW_MISSING");
assert(!page.includes("admin-learning-flowline"), "UNAPPROVED_LIGHTWEIGHT_FLOW_PRESENT");
assert(!page.includes('from "../../../components/AdminLearningWorkbench";'), "LEGACY_WORKBENCH_STILL_REFERENCED");
assert(!fs.existsSync("components/AdminLearningWorkbench.tsx"), "LEGACY_WORKBENCH_FILE_PRESENT");

for (const required of [
  "PAGE_SIZE = 20",
  "AdminLearningCourseQueue",
  "AdminLearningCourseHealthDetail",
  "decide"
]) {
  assert(view.includes(required), "WORKBENCH_ORCHESTRATOR_MISSING:" + required);
}

for (const required of ["课程健康队列", "搜索课程", "全部风险", "需要检查", "关注", "正常"]) {
  assert(queue.includes(required), "COURSE_QUEUE_RULE_MISSING:" + required);
}
for (const removed of ["全部问题类型", "风险 + 未处理时长", "最近问题", "累计问题", "至少影响人数"]) {
  assert(!queue.includes(removed), "REMOVED_QUEUE_CONTROL_PRESENT:" + removed);
}
assert(view.includes("const [search, setSearch]"), "QUEUE_SEARCH_STATE_MISSING");
assert(!view.includes("typeFilter"), "QUEUE_TYPE_FILTER_STATE_PRESENT");
assert(!view.includes("sortBy"), "QUEUE_SORT_STATE_PRESENT");
assert(css.includes("/* Learning Insight V2.1 single risk filter */"), "SINGLE_RISK_FILTER_STYLE_MISSING");
assert(css.includes("grid-column: 2"), "RISK_FILTER_POSITION_MISSING");

for (const required of [
  "AdminLearningCourseHeader",
  "AdminLearningIssueSummary",
  "AdminLearningEvidencePanel",
  "AdminLearningCourseDecision"
]) {
  assert(detail.includes(required), "COURSE_HEALTH_COMPONENT_SPLIT_MISSING:" + required);
}

for (const required of ["课程健康详情", "累计反馈", "学员影响", "处理次数"]) {
  assert(courseHeader.includes(required), "COURSE_HEADER_MISSING:" + required);
}
for (const required of ["问题汇总", "问题类型", "首次", "最近", "影响"]) {
  assert(issueSummary.includes(required), "ISSUE_SUMMARY_MISSING:" + required);
}
for (const required of [
  "真实数据",
  "学习反馈",
  "学习行为",
  "用于判断",
  "辅助参考",
  "直接看学员说了什么",
  "看学员在哪些步骤明显遇到困难",
  "/effective-evidence",
  "admin-learning-data-switch",
  'tab === "FEEDBACK"',
  'tab === "BEHAVIOR"'
]) {
  assert(evidencePanel.includes(required), "EVIDENCE_PANEL_MISSING:" + required);
}
assert(!evidencePanel.includes("AdminLearningEvidenceDetail"), "LEGACY_EVIDENCE_DETAIL_STILL_MOUNTED");
assert(!evidencePanel.includes("/api/admin/learning/insights/"), "LEGACY_EVIDENCE_API_STILL_USED");
assert(!evidencePanel.includes("Effective Evidence Set"), "INTERNAL_EVIDENCE_TERM_EXPOSED");
assert(!evidencePanel.includes("AI 可用证据"), "INTERNAL_AI_EVIDENCE_COUNT_EXPOSED");
assert(effectiveEvidenceRoute.includes("buildEffectiveLearningEvidenceSet"), "EFFECTIVE_EVIDENCE_ROUTE_OWNER_MISSING");
for (const required of [
  "ALLOWED_EVENT_NAMES",
  "NON_PRODUCTION_ORIGIN",
  "INSUFFICIENT_SAMPLE",
  "VALID",
  "SUPPORTING_ONLY",
  "learningFeedback",
  "lessonCheckResponses",
  "practiceSubmissions",
  "learningEvents"
]) {
  assert(effectiveEvidenceOwner.includes(required), "EFFECTIVE_EVIDENCE_OWNER_MISSING:" + required);
}
for (const required of ["<span>03</span><strong>处理这门课程</strong>", "AI分析", "人工修正", "继续观察", "无需处理"]) {
  assert(decisionPanel.includes(required), "DECISION_PANEL_MISSING:" + required);
}

for (const required of [
  "firstIssueAt",
  "issueGroups",
  "firstSeenAt",
  "lastSeenAt",
  "occurrenceCount",
  "durationLabel"
]) {
  assert(viewModel.includes(required), "VIEW_MODEL_TIME_RULE_MISSING:" + required);
}

assert(evidencePanel.includes("/effective-evidence"), "EFFECTIVE_EVIDENCE_ENDPOINT_MISSING");
assert(effectiveEvidenceRoute.includes("buildEffectiveLearningEvidenceSet"), "EFFECTIVE_EVIDENCE_ROUTE_OWNER_MISSING");
assert(!evidencePanel.includes("AdminLearningEvidenceDetail"), "LEGACY_EVIDENCE_DETAIL_PRESENT");
assert(!evidencePanel.includes("const dataAnchor = course.issues.find"), "LEGACY_EVIDENCE_ANCHOR_PRESENT");
assert(!evidencePanel.includes("selectedCategory"), "EVIDENCE_SELECTED_CATEGORY_PRESENT");
assert(!evidencePanel.includes("selectedIssue"), "EVIDENCE_SELECTED_ISSUE_PRESENT");
assert(!evidencePanel.includes("feedbackNavigation"), "LEARNING_FEEDBACK_PANEL_ISSUE_NAV_PRESENT");
assert(effectiveEvidenceOwner.includes("buildEffectiveLearningEvidenceSet"), "EFFECTIVE_EVIDENCE_OWNER_FUNCTION_MISSING");
assert(effectiveEvidenceOwner.includes("evidence_governance"), "EFFECTIVE_EVIDENCE_GOVERNANCE_MISSING");
assert(issueSummary.includes("学员影响"), "LEARNER_IMPACT_COLUMN_MISSING");
assert(issueSummary.includes("admin-learning-category-row"), "ISSUE_SUMMARY_STATIC_ROW_MISSING");
assert(!issueSummary.includes("onSelectIssue"), "ISSUE_SUMMARY_MUST_BE_STATIC");
assert(!issueSummary.includes("selectedCategory"), "ISSUE_SUMMARY_SELECTION_STATE_PRESENT");
assert(!issueSummary.includes("<button"), "ISSUE_SUMMARY_CLICKABLE_ROW_PRESENT");
assert(!view.includes("selectedIssueId"), "WORKBENCH_SELECTED_ISSUE_STATE_PRESENT");
assert(!detail.includes("selectedIssueId"), "DETAIL_SELECTED_ISSUE_STATE_PRESENT");
assert(!detail.includes("onSelectIssue"), "DETAIL_ISSUE_SELECTION_HANDLER_PRESENT");
assert(issueSummary.includes("sortedGroups"), "GOVERNANCE_GROUP_SORT_MISSING");
assert(issueSummary.includes("is-governance"), "GOVERNANCE_VISUAL_CLASS_MISSING");
assert(issueSummary.includes('isGovernanceIssueCategory(group.category) ? "—"'), "GOVERNANCE_IMPACT_DASH_MISSING");
assert(courseHeader.includes("学员影响"), "COURSE_LEARNER_IMPACT_LABEL_MISSING");
assert(courseHeader.includes("处理次数"), "COURSE_UPDATE_COUNT_LABEL_MISSING");
assert(courseHeader.includes("course.feedbackCount"), "COURSE_FEEDBACK_COUNT_VALUE_MISSING");
assert(!courseHeader.includes("最近出现"), "DUPLICATE_RECENT_STAT_PRESENT");
assert(courseHeader.includes("course.updateCount"), "COURSE_UPDATE_COUNT_VALUE_MISSING");
assert(evidencePanel.includes('tab === "FEEDBACK"'), "EFFECTIVE_EVIDENCE_FEEDBACK_VIEW_MISSING");
assert(evidencePanel.includes('tab === "BEHAVIOR"'), "EFFECTIVE_EVIDENCE_BEHAVIOR_VIEW_MISSING");
assert(!queue.includes("问题队列"), "ISSUE_QUEUE_UI_STILL_PRESENT");
assert(!detail.includes("<strong>问题时间线</strong>"), "ISSUE_TIMELINE_STILL_PRIMARY");
assert(!page.includes("一次只处理一个课程问题"), "ISSUE_FIRST_PAGE_COPY_STILL_PRESENT");
assert(!page.includes("PLATFORM / LEARNING"), "ENGLISH_PAGE_KICKER_PRESENT");

assert(css.includes("/* Learning Insight V2.1 visual restructure */"), "VISUAL_RESTRUCTURE_STYLE_MISSING");
assert(css.includes("grid-template-columns: minmax(300px,31%) minmax(0,69%)"), "RIGHT_WORKSPACE_PRIORITY_MISSING");
assert(css.includes("admin-learning-course-header"), "COURSE_HEADER_STYLE_MISSING");
assert(css.includes("admin-learning-course-stats"), "COURSE_STATS_STYLE_MISSING");
assert(css.includes("admin-learning-category-table"), "CATEGORY_TABLE_STYLE_MISSING");
assert(css.includes("admin-learning-evidence-panel-v2"), "EVIDENCE_PANEL_STYLE_MISSING");
assert(css.includes("/* Learning Insight V2.1 rebuilt 02 data workspace */"), "REBUILT_02_STYLE_MISSING");
assert(css.includes("admin-learning-feedback-rows"), "LEARNING_FEEDBACK_STYLE_MISSING");
assert(css.includes("admin-learning-behavior-grid"), "LEARNING_BEHAVIOR_GRID_STYLE_MISSING");
assert(css.includes("grid-template-columns: repeat(3,minmax(0,1fr))"), "LEARNING_BEHAVIOR_2X3_GRID_MISSING");
assert(css.includes("admin-learning-governance-facts"), "GOVERNANCE_FACTS_STYLE_MISSING");
assert(css.includes("admin-learning-governance-note"), "GOVERNANCE_NOTE_STYLE_MISSING");
assert(css.includes("/* Learning Insight V2.1 focused data views */"), "FOCUSED_DATA_VIEW_STYLE_MISSING");
assert(css.includes("admin-learning-data-switch"), "DATA_SWITCH_STYLE_MISSING");
assert(css.includes("admin-learning-evidence-status"), "FINAL_EVIDENCE_PRESENTATION_STYLE_MISSING");
assert(css.includes("/* Learning Insight V2.1 review polish */"), "REVIEW_POLISH_STYLE_MISSING");
assert(css.includes("admin-learning-health-dot"), "COURSE_HEALTH_DOT_STYLE_MISSING");
assert(css.includes("box-shadow: inset 3px 0 0 #2a68ff"), "COURSE_ACTIVE_BLUE_BAR_MISSING");
assert(css.includes("admin-learning-issue-summary-classic"), "ISSUE_SUMMARY_CLASSIC_STYLE_MISSING");
assert(css.includes("/* Learning Insight V2.1 static issue summary */"), "STATIC_ISSUE_SUMMARY_STYLE_MISSING");
assert(css.includes("admin-learning-category-row"), "STATIC_ISSUE_SUMMARY_ROW_STYLE_MISSING");
assert(css.includes("/* Learning Insight V2.1 review polish 2 */"), "REVIEW_POLISH_2_STYLE_MISSING");
assert(css.includes("/* Learning Insight V2.1 feedback and decision polish */"), "FEEDBACK_DECISION_POLISH_STYLE_MISSING");
assert(css.includes("/* Learning Insight V2.1 decision alignment final */"), "DECISION_ALIGNMENT_FINAL_STYLE_MISSING");
assert(css.includes(".admin-learning-decision-control"), "DECISION_CONTROL_ALIGNMENT_MISSING");
assert(css.includes("opacity: 1;"), "DISMISS_DISABLED_OPACITY_MISSING");
assert(css.includes("/* Learning Insight V2.1 scalable course queue */"), "SCALABLE_COURSE_QUEUE_STYLE_MISSING");
assert(css.includes("grid-auto-rows: max-content"), "COURSE_QUEUE_ROW_SHRINK_PROTECTION_MISSING");
assert(css.includes("min-height: 82px"), "COURSE_QUEUE_MIN_HEIGHT_MISSING");
assert(queue.includes("totalPages > 1"), "SINGLE_PAGE_PAGINATION_STILL_VISIBLE");
assert(css.includes(".admin-learning-course-stats-compact > div:first-child strong"), "COURSE_STATS_EQUAL_TYPOGRAPHY_MISSING");
assert(css.includes(".admin-learning-v2 {\n  font-size: 13px;"), "BASE_FONT_SIZE_TOO_SMALL");
assert(!detail.includes("admin-learning-evidence-layout"), "DUPLICATE_EVIDENCE_SELECTOR_STILL_PRESENT");

assert(
  !service.includes('"FIND_RELATED_COURSE",\n  "CONTENT_OUTDATED",\n  "OTHER"'),
  "STUDENT_CONTENT_OUTDATED_TYPE_STILL_ALLOWED"
);
assert(service.includes("const qualityRisk = false;"), "STUDENT_FEEDBACK_QUALITY_RISK_NOT_CLOSED");
assert(!fs.existsSync("components/legacy-learning"), "LEGACY_LEARNING_COMPONENTS_PRESENT");

const runAiTokens = service.match(/runAiAnalysis\(/g) ?? [];
assert(runAiTokens.length === 1, "AUTO_AI_CALL_STILL_PRESENT");
assert(service.includes("decideLearningCourseGate1"), "COURSE_GATE1_CORE_DECISION_MISSING");
assert(service.includes("courseHealth"), "COURSE_AGGREGATION_MISSING");
assert(service.includes("issueIsOpen"), "OPEN_ISSUE_STATUS_RULE_MISSING");
assert(
  service.includes('["OPEN", "ANALYSIS_READY", "UNDER_REVIEW", "REVIEW_REQUIRED"].includes(issue.status)'),
  "CLOSED_ISSUE_EXCLUSION_MISSING"
);
assert(service.includes('input.decision === "WATCH"') && service.includes('"WATCHING"'), "WATCHING_STATE_MISSING");
assert(service.includes("closeIssueCycleEvidence"), "ISSUE_CYCLE_CLOSE_MISSING");
assert(service.includes("feedbackCycleState"), "FEEDBACK_CYCLE_REOPEN_MISSING");
assert(service.includes("behaviorCycleState"), "BEHAVIOR_CYCLE_REOPEN_MISSING");
assert(service.includes("currentIssueCycleOpenedAt"), "CURRENT_CYCLE_SORT_TIME_MISSING");
assert(service.includes("oldestOpenIssueAt"), "OLDEST_OPEN_ISSUE_TIME_MISSING");
assert(service.includes('course.openIssueCount >= 10 ? "ATTENTION" : course.openIssueCount >= 5 ? "WATCH" : "NORMAL"'), "OPEN_ISSUE_HEALTH_THRESHOLD_MISSING");
assert(service.includes("leftOpenAt - rightOpenAt"), "BACKEND_OLDEST_OPEN_FIRST_MISSING");
assert(service.includes("listAdminCourseRegistry().items.forEach"), "FORMAL_81_COURSE_SEED_MISSING");
assert(service.includes("formalRuntimeLessonId"), "FORMAL_COURSE_IDENTITY_MISSING");
assert(service.includes("curriculumOrder"), "FORMAL_CURRICULUM_ORDER_MISSING");
assert(service.includes("if (!current) continue;"), "NON_FORMAL_COURSE_MUST_NOT_ENTER_QUEUE");
assert(service.includes("left.curriculumOrder - right.curriculumOrder"), "BACKEND_STABLE_TIEBREAK_MISSING");
assert(!service.includes("right.openIssueCount - left.openIssueCount"), "BACKEND_OPEN_COUNT_SORT_WEIGHT_PRESENT");
assert(!service.includes("if (right.openIssueCount !== left.openIssueCount)"), "BACKEND_OPEN_COUNT_SORT_WEIGHT_PRESENT_2");
assert(view.includes("oldestOpenIssueAt"), "VIEW_OLDEST_OPEN_TIME_MISSING");
assert(view.includes("leftOpenAt - rightOpenAt"), "FRONTEND_OLDEST_OPEN_FIRST_MISSING");
assert(view.includes("left.curriculumOrder - right.curriculumOrder"), "FRONTEND_STABLE_TIEBREAK_MISSING");
assert(!view.includes("if (right.openIssueCount !== left.openIssueCount)"), "FRONTEND_OPEN_COUNT_SORT_WEIGHT_PRESENT");
assert(queue.includes("未处理自"), "QUEUE_OPEN_AGE_LABEL_MISSING");
assert(service.includes("openIssueCount >= 10"), "RED_THRESHOLD_10_MISSING");
assert(service.includes("openIssueCount >= 5"), "YELLOW_THRESHOLD_5_MISSING");
assert(service.includes("feedbackCounts"), "COURSE_FEEDBACK_COUNT_QUERY_MISSING");
assert(service.includes("feedbackCountByLesson"), "COURSE_FEEDBACK_COUNT_OWNER_MISSING");
assert(service.includes(".groupBy(learningFeedback.lessonId)"), "COURSE_FEEDBACK_COUNT_GROUPING_MISSING");
assert(service.includes("lessonVersion: lessons.version"), "COURSE_VERSION_OWNER_MISSING");
assert(service.includes("updateCount: Math.max(0, (versionByLesson.get(courseKey) ?? 1) - 1)"), "COURSE_UPDATE_COUNT_RULE_MISSING");
assert(service.includes("firstIssueAt"), "COURSE_FIRST_SEEN_MISSING");
assert(service.includes("issueGroups"), "ISSUE_CATEGORY_AGGREGATION_MISSING");
assert(service.includes("firstSeenAt"), "ISSUE_GROUP_FIRST_SEEN_MISSING");
assert(service.includes("lastSeenAt"), "ISSUE_GROUP_LAST_SEEN_MISSING");
assert(service.includes("occurrenceCount"), "ISSUE_GROUP_OCCURRENCE_COUNT_MISSING");
assert(service.includes("Math.max(current.affectedUserCount"), "AFFECTED_USER_LOWER_BOUND_MISSING");
assert(service.includes("learnerBackedIssue"), "LEARNER_GOVERNANCE_IMPACT_BOUNDARY_MISSING");
assert(service.includes('!["CONTENT_OUTDATED", "CONTENT_INCORRECT"].includes(issue.issueCategory)'), "GOVERNANCE_CATEGORY_EXCLUSION_MISSING");

assert(
  route.includes('const decisions: LearningIssueGate1Decision[] = ["ANALYZE", "WATCH", "DISMISS"]'),
  "COURSE_GATE1_ROUTE_DECISIONS_MISSING"
);
assert(route.includes("decideLearningCourseGate1"), "COURSE_GATE1_ROUTE_CORE_MISSING");
assert(!route.includes("runAiAnalysis"), "GATE1_ROUTE_MUST_NOT_CALL_AI");
assert(!route.includes("publishAdminCourseCandidate"), "GATE1_ROUTE_MUST_NOT_PUBLISH");
assert(route.includes("SIMULATION_ACTION_DISABLED"), "SIMULATION_ACTION_GUARD_MISSING");

console.log("LEARNING_INSIGHT_V2_1_PHASE1_COURSE_HEALTH_QUEUE=PASS");
console.log("LEARNING_INSIGHT_V2_1_PHASE1_CATEGORY_AGGREGATION=PASS");
console.log("LEARNING_INSIGHT_V2_1_PHASE1_TEMPORAL_FACTS=PASS");
console.log("LEARNING_INSIGHT_V2_1_PHASE1_EVIDENCE_DRILLDOWN=PASS");
console.log("LEARNING_INSIGHT_V2_1_PHASE1_HUMAN_GATE1=PASS");
console.log("LEARNING_INSIGHT_V2_1_PHASE1_NO_AUTO_AI=PASS");
console.log("LEARNING_INSIGHT_V2_1_FORMAL_81_COURSES=PASS");
