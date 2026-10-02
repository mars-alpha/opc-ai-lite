import fs from "node:fs";
import {
  applyHumanTextEdits,
  applyValidatedPatches,
  buildHumanEditablePathCatalog,
  buildMutablePathCatalog,
  validateCourseChangePatchV2
} from "../lib/server/learning-insights/task-b";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const core = fs.readFileSync("lib/server/learning-insights/task-b.ts", "utf8");
const route = fs.readFileSync("app/api/admin/learning/courses/[courseKey]/proposal/route.ts", "utf8");
const panel = fs.readFileSync("components/admin-learning/AdminLearningCourseDiagnosis.tsx", "utf8");
const decision = fs.readFileSync("components/admin-learning/AdminLearningCourseDecision.tsx", "utf8");
const compare = fs.readFileSync("components/admin-learning/AdminLearningCourseCompareModal.tsx", "utf8");
const workbench = fs.readFileSync("components/AdminLearningWorkbenchV2.tsx", "utf8");
const registry = fs.readFileSync("components/AdminCourseRegistry.tsx", "utf8");
const maintenance = fs.readFileSync("lib/server/admin/course-maintenance.ts", "utf8");
const coursesPage = fs.readFileSync("app/admin/courses/page.tsx", "utf8");
const runtime = fs.readFileSync("components/GenericLessonRuntimePanel.tsx", "utf8");

for (const required of [
  "mutable_path_catalog",
  "PATCH_BASELINE_CONFLICT",
  "CANDIDATE_ALREADY_ACTIVE",
  "startAdminCourseCandidate",
  "saveAdminCourseCandidate",
  "timeoutMs: 120000",
  "course_change_patch_v2"
]) assert(core.includes(required), "TASK_B_CORE_MISSING:" + required);

assert(route.includes('action === "GENERATE"'), "TASK_B_GENERATE_ROUTE_MISSING");
assert(route.includes('action === "PUBLISH"'), "TASK_B_PUBLISH_ROUTE_MISSING");
assert(route.includes("revalidatePath(`/courses/${result.courseSlug}/lessons/${result.lessonSlug}`)"), "TASK_B_FRONT_LESSON_REVALIDATION_MISSING");
assert(route.includes('revalidatePath("/learning-path")'), "TASK_B_LEARNING_PATH_REVALIDATION_MISSING");
assert(panel.includes('body: JSON.stringify({ action: "GENERATE" })'), "TASK_B_AUTOMATIC_GENERATE_MISSING");
assert(panel.includes("analysisRunToken > lastRunToken.current"), "TASK_B_STALE_PROPOSAL_PRELOAD_GUARD_MISSING");
assert(core.includes("for (let attempt = 1; attempt <= 2; attempt += 1)"), "TASK_B_VALIDATION_RETRY_MISSING");
assert(core.includes("VALIDATION_RETRY"), "TASK_B_VALIDATION_RETRY_CONTEXT_MISSING");
assert(workbench.includes('if (decision === "ANALYZE") {'), "TASK_B_ANALYZE_IMMEDIATE_STATE_GUARD_MISSING");
assert(workbench.includes("analysisStateByCourse"), "TASK_B_COURSE_SCOPED_ANALYSIS_STATE_MISSING");
assert(workbench.includes("useEffect(() => setItems(courses), [courses])"), "LEARNING_INSIGHT_SERVER_REFRESH_SYNC_MISSING");
assert(workbench.includes("router.refresh()"), "LEARNING_INSIGHT_POST_ACTION_REFRESH_MISSING");
assert(
  workbench.includes('openIssueCount >= 10 ? "ATTENTION"'),
  "LEARNING_INSIGHT_IMMEDIATE_HEALTH_RECALC_MISSING"
);
assert(workbench.includes("setAnalysisRunCourseKey(selectedCourse.courseKey)"), "TASK_B_COURSE_SCOPED_ANALYSIS_TOKEN_MISSING");
assert(panel.includes("analysisRunCourseKey !== course.courseKey"), "TASK_B_CROSS_COURSE_ANALYSIS_GUARD_MISSING");
assert(panel.includes("compareOpenCourseKey !== course.courseKey"), "TASK_B_CROSS_COURSE_COMPARE_GUARD_MISSING");
assert(!panel.includes("生成具体修正方案"), "TASK_B_SECOND_GENERATE_BUTTON_PRESENT");
assert(!panel.includes("确定修正"), "TASK_B_OLD_CONFIRM_BUTTON_PRESENT");
for (const required of ["课程预览", "本步修改", "原文", "保存草稿", "发布", "课程反馈更新"]) {
  assert(compare.includes(required), "TASK_B_COMPARE_UI_MISSING:" + required);
}
assert(!compare.includes("<strong>修改前</strong>"), "TASK_B_OLD_DOUBLE_PREVIEW_PRESENT");
assert(compare.includes("admin-learning-review-inline-change"), "TASK_B_INLINE_CHANGE_MARKER_MISSING");
assert(compare.includes("acceptancePublishAllowed"), "TASK_B_ACCEPTANCE_PUBLISH_GUARD_MISSING");
assert(route.includes("allowAcceptancePublish: acceptancePublish"), "TASK_B_ACCEPTANCE_PUBLISH_ROUTE_OPTION_MISSING");
assert(compare.includes('checks[" + checkIndex + "].correctFeedback'), "TASK_B_PREVIEW_CORRECT_FEEDBACK_MISSING");
assert(compare.includes('checks[" + checkIndex + "].incorrectFeedback'), "TASK_B_PREVIEW_INCORRECT_FEEDBACK_MISSING");
assert(!core.includes("/^practice\\.rubric"), "TASK_B_HIDDEN_RUBRIC_MUST_NOT_BE_MUTABLE");
assert(!compare.includes('practice.rubric[" + itemIndex + "].label'), "TASK_B_HIDDEN_RUBRIC_PREVIEW_PRESENT");
assert(!compare.includes('practice.rubric[" + itemIndex + "].example'), "TASK_B_HIDDEN_RUBRIC_PREVIEW_PRESENT");
assert(compare.includes('"practice.referenceFill." + key'), "TASK_B_PREVIEW_REFERENCE_FILL_MISSING");
assert(compare.includes('"practice.referenceAnswer"'), "TASK_B_PREVIEW_REFERENCE_ANSWER_MISSING");
assert(compare.includes('"practice.activity.title"'), "TASK_B_PREVIEW_ACTIVITY_TITLE_MISSING");
assert(compare.includes('"practice.activity.prompt"'), "TASK_B_PREVIEW_ACTIVITY_PROMPT_MISSING");
assert(compare.includes('"review.related[" + itemIndex + "]"'), "TASK_B_PREVIEW_RELATED_MISSING");
assert(compare.includes("orderedReferenceFillEntries"), "TASK_B_REFERENCE_FILL_ORDER_HELPER_MISSING");
assert(maintenance.includes("snapshot.courseHeader.catalogTitle = snapshot.courseHeader.title"), "COURSE_TITLE_CATALOG_SYNC_MISSING");
assert(registry.includes("draft.courseHeader.catalogTitle = value;"), "COURSE_TITLE_CATALOG_UI_SYNC_MISSING");
assert(!compare.includes('className="admin-course-preview-input"'), "TASK_B_EMPTY_PREVIEW_INPUT_PRESENT");
assert(compare.includes("GenericLessonRuntimePanel"), "TASK_B_REAL_STUDENT_RUNTIME_PREVIEW_MISSING");
assert(compare.includes("previewFreeNavigation"), "TASK_B_PREVIEW_FREE_NAVIGATION_MISSING");
assert(compare.includes("previewCurrentStep"), "TASK_B_COMPARE_SYNC_STEP_MISSING");
assert(runtime.includes("onPreviewStepChange"), "TASK_B_RUNTIME_PREVIEW_STEP_CALLBACK_MISSING");
assert(runtime.includes("previewMode && previewFreeNavigation"), "TASK_B_RUNTIME_PREVIEW_FREE_NAV_MISSING");
assert(core.includes("publishLearningInsightTaskB"), "TASK_B_DIRECT_PUBLISH_MISSING");
assert(core.includes("publishAdminCourseCandidate"), "TASK_B_COURSE_PUBLISH_MISSING");
assert(core.includes('updateReason: "课程反馈更新"'), "TASK_B_HISTORY_REASON_MISSING");
assert(core.includes("cancelAdminCourseCandidate"), "TASK_B_FAILED_PUBLISH_CLEANUP_MISSING");
assert(core.includes('status: "REVIEWED"'), "TASK_B_PUBLISHED_ISSUE_CLOSE_MISSING");
assert(core.includes('reviewStatus: "CLOSED"'), "TASK_B_PUBLISHED_QUALITY_RISK_CLOSE_MISSING");
assert(core.includes("lte(courseInsights.updatedAt, handledThrough)"), "TASK_B_NEW_ISSUE_PROTECTION_MISSING");
assert(core.includes("issueClosureWarning"), "TASK_B_POST_PUBLISH_CLOSURE_WARNING_MISSING");
assert(workbench.includes('opc_admin_course_intent", "EDIT"'), "MANUAL_EDIT_INTENT_MISSING");
assert(workbench.includes('"/admin/courses?course="'), "MANUAL_EDIT_EXPLICIT_URL_MISSING");
assert(coursesPage.includes("initialTargetKey"), "MANUAL_EDIT_SERVER_TARGET_MISSING");
assert(coursesPage.includes("initialIntent"), "MANUAL_EDIT_SERVER_INTENT_MISSING");
assert(registry.includes("initialTargetKey"), "MANUAL_EDIT_REGISTRY_TARGET_MISSING");
assert(registry.includes('intent !== "EDIT"'), "MANUAL_EDIT_DIRECT_OPEN_MISSING");
assert(registry.includes("openCandidate(persistedActive)"), "MANUAL_EDIT_EXISTING_CANDIDATE_OPEN_MISSING");
assert(decision.includes("人工修正"), "TASK_B_MANUAL_EDIT_MISSING");
assert(decision.indexOf("无需处理") < decision.indexOf("继续观察"), "GATE1_BUTTON_ORDER_1_INVALID");
assert(decision.indexOf("继续观察") < decision.indexOf("人工修正"), "GATE1_BUTTON_ORDER_2_INVALID");
assert(decision.indexOf("人工修正") < decision.indexOf("AI分析"), "GATE1_BUTTON_ORDER_3_INVALID");

const snapshot = {
  courseHeader: { title: "原标题", catalogTitle: "目录", catalogSubtitle: "副标题", lessonPageLead: "引导" },
  stepMeta: Array.from({ length: 6 }, (_, index) => ({ id: "s" + index, kind: "x", title: "标题" + index, objective: "目标" + index, navigationDescription: "说明" + index })),
  intro: { title: "开始", situation: "场景", approaches: [], takeaway: "结论", bottomDetails: [] },
  example: { title: "方法", situation: "场景", before: "前", after: "后", result: "结果", knowledgeDepth: [] },
  checks: [],
  practice: { id: "p", title: "实操", goal: "目标", instructions: [], hints: [], rubric: [], activity: { title: "练习", instruction: "说明", prompt: "提示", reflection: "复盘" }, referenceAnswer: "答案", referenceFill: {} },
  review: { items: [], labels: { primary: "适合", secondary: "不适合" }, knowledgeDepth: [], mistakes: [], related: [] },
  capability: { title: "能力", gain: ["获得"], selfAssessment: ["自评"], triggerScenario: "场景", nextLessonValue: "下一课" }
} as any;

const mutable = buildMutablePathCatalog(snapshot);
const humanEditable = buildHumanEditablePathCatalog(snapshot);
assert(!mutable.some((item) => item.path.startsWith("courseHeader.")), "TASK_B_COURSE_HEADER_MUST_NOT_BE_MUTABLE");
assert(!mutable.some((item) => item.path.startsWith("stepMeta[")), "TASK_B_STEP_META_MUST_NOT_BE_MUTABLE");
assert(!mutable.some((item) => item.path === "intro.title"), "TASK_B_STEP_CONTENT_TITLE_MUST_NOT_BE_MUTABLE");
assert(!mutable.some((item) => item.path.endsWith(".label") && !item.path.startsWith("checks[")), "TASK_B_CONTENT_LABEL_MUST_NOT_BE_MUTABLE");
assert(!mutable.some((item) => item.path === "practice.title"), "TASK_B_PRACTICE_TITLE_MUST_NOT_BE_MUTABLE");
assert(!mutable.some((item) => item.path === "capability.title"), "TASK_B_CAPABILITY_TITLE_MUST_NOT_BE_MUTABLE");
assert(mutable.some((item) => item.path === "intro.situation"), "TASK_B_CONTENT_MUTABLE_PATH_MISSING");
assert(!mutable.some((item) => item.path.includes(".id")), "TASK_B_ID_MUST_NOT_BE_MUTABLE");
assert(humanEditable.some((item) => item.path === "courseHeader.title"), "TASK_B_HUMAN_TITLE_EDIT_MISSING");
assert(humanEditable.some((item) => item.path === "stepMeta[0].title"), "TASK_B_HUMAN_STEP_TITLE_EDIT_MISSING");
assert(humanEditable.some((item) => item.path === "intro.title"), "TASK_B_HUMAN_CONTENT_TITLE_EDIT_MISSING");
assert(compare.includes("contentEditable"), "TASK_B_PREVIEW_DIRECT_MANUAL_EDIT_MISSING");
assert(compare.includes("currentManualChanges"), "TASK_B_MANUAL_CHANGE_SIDEBAR_MISSING");
assert(!compare.includes("currentReviewChanges.slice("), "TASK_B_CHANGE_LIST_MUST_NOT_BE_TRUNCATED");
assert(route.includes("manualEdits"), "TASK_B_MANUAL_PUBLISH_PAYLOAD_MISSING");
assert(core.includes("row.changes.length > 8"), "TASK_B_MAX_PATCH_COUNT_GUARD_MISSING");
assert(core.includes("TASK_B_DUPLICATE_PATH"), "TASK_B_DUPLICATE_PATH_GUARD_MISSING");
assert(core.includes("TASK_B_EXPANSION_EXCEEDED"), "TASK_B_EXPANSION_GUARD_MISSING");

const patch = validateCourseChangePatchV2({
  schema_version: "course_change_patch_v2",
  course_id: "T1-01",
  decision: "PATCH_PROPOSED",
  changes: [{
    patch_id: "p1",
    action: "REPLACE",
    path: "intro.situation",
    current_value: "场景",
    proposed_value: "更清楚的场景",
    reason: "证据支持",
    evidence_refs: ["issue:1"]
  }],
  manual_structure_reason: null
}, {
  courseId: "T1-01",
  mutable,
  evidenceRefs: ["issue:1"]
});

assert(applyValidatedPatches(snapshot, patch).intro.situation === "更清楚的场景", "TASK_B_APPLY_FAILED");
assert(
  applyHumanTextEdits(snapshot, snapshot, [
    { path: "courseHeader.title", proposed_value: "人工标题" },
    { path: "stepMeta[0].title", proposed_value: "人工步骤标题" }
  ]).courseHeader.title === "人工标题",
  "TASK_B_HUMAN_EDIT_APPLY_FAILED"
);

const aiBoundaryAfter = applyValidatedPatches(snapshot, patch);
assert(
  JSON.stringify(aiBoundaryAfter.stepMeta) === JSON.stringify(snapshot.stepMeta),
  "TASK_B_AI_STEP_META_MUST_REMAIN_IDENTICAL"
);
assert(
  JSON.stringify(aiBoundaryAfter.courseHeader) === JSON.stringify(snapshot.courseHeader),
  "TASK_B_AI_COURSE_HEADER_MUST_REMAIN_IDENTICAL"
);

let baselineRejected = false;
try {
  validateCourseChangePatchV2({
    ...patch,
    changes: [{ ...patch.changes[0], current_value: "错误基线" }]
  }, { courseId: "T1-01", mutable, evidenceRefs: ["issue:1"] });
} catch (error) {
  baselineRejected = error instanceof Error && error.message === "PATCH_BASELINE_CONFLICT";
}
assert(baselineRejected, "TASK_B_BASELINE_NOT_REJECTED");

let forbiddenPathRejected = false;
try {
  validateCourseChangePatchV2({
    ...patch,
    changes: [{
      ...patch.changes[0],
      path: "courseHeader.title",
      current_value: "原标题",
      proposed_value: "AI 不应修改标题"
    }]
  }, { courseId: "T1-01", mutable, evidenceRefs: ["issue:1"] });
} catch (error) {
  forbiddenPathRejected = error instanceof Error && error.message === "TASK_B_PATH_NOT_ALLOWED";
}
assert(forbiddenPathRejected, "TASK_B_FORBIDDEN_AI_PATH_NOT_REJECTED");

let duplicatePathRejected = false;
try {
  validateCourseChangePatchV2({
    ...patch,
    changes: [
      patch.changes[0],
      { ...patch.changes[0], patch_id: "p2", proposed_value: "另一个修改" }
    ]
  }, { courseId: "T1-01", mutable, evidenceRefs: ["issue:1"] });
} catch (error) {
  duplicatePathRejected = error instanceof Error && error.message === "TASK_B_DUPLICATE_PATH";
}
assert(duplicatePathRejected, "TASK_B_DUPLICATE_PATH_NOT_REJECTED");

let expansionRejected = false;
try {
  validateCourseChangePatchV2({
    ...patch,
    changes: [{
      ...patch.changes[0],
      proposed_value: "扩写".repeat(200)
    }]
  }, { courseId: "T1-01", mutable, evidenceRefs: ["issue:1"] });
} catch (error) {
  expansionRejected = error instanceof Error && error.message === "TASK_B_EXPANSION_EXCEEDED";
}
assert(expansionRejected, "TASK_B_EXPANSION_NOT_REJECTED");

let stepSemanticRejected = false;
try {
  validateCourseChangePatchV2({
    ...patch,
    changes: [{
      ...patch.changes[0],
      path: "example.result",
      current_value: "结果",
      proposed_value: "迁移练习：请你填写并提交答案。"
    }]
  }, {
    courseId: "T1-01",
    mutable: buildMutablePathCatalog(snapshot),
    evidenceRefs: ["issue:1"]
  });
} catch (error) {
  stepSemanticRejected =
    error instanceof Error && error.message === "TASK_B_STEP_SEMANTIC_VIOLATION";
}
assert(stepSemanticRejected, "TASK_B_STEP_SEMANTIC_BOUNDARY_NOT_ENFORCED");

console.log("LEARNING_INSIGHT_TASK_B_SCHEMA=PASS");
console.log("LEARNING_INSIGHT_TASK_B_MUTABLE_PATH=PASS");
console.log("LEARNING_INSIGHT_TASK_B_BASELINE=PASS");
console.log("LEARNING_INSIGHT_TASK_B_DIRECT_PUBLISH=PASS");
console.log("LEARNING_INSIGHT_TASK_B_SINGLE_PREVIEW=PASS");
console.log("LEARNING_INSIGHT_TASK_B_MANUAL_EDIT_DIRECT=PASS");
console.log("LEARNING_INSIGHT_TASK_B_REAL_RUNTIME_COMPARE=PASS");
console.log("LEARNING_INSIGHT_TASK_B_POST_PUBLISH_ISSUE_CLOSE=PASS");
console.log("LEARNING_INSIGHT_TASK_B_STEP_SEMANTIC_BOUNDARY=PASS");
