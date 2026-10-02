import fs from "node:fs";
import { listAdminCourseRegistry } from "../lib/server/admin/course-registry";
import { formalRuntimePracticeId } from "../lib/server/learning/formal-identity";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ADMIN_COURSE_REGISTRY_FAILED:" + code);
}

const route = fs.readFileSync("app/api/admin/courses/route.ts", "utf8");
const page = fs.readFileSync("app/admin/courses/page.tsx", "utf8");
const registryView = fs.readFileSync("components/AdminCourseRegistry.tsx", "utf8");
const runtimePanel = fs.readFileSync("components/GenericLessonRuntimePanel.tsx", "utf8");
const maintenance = fs.readFileSync("lib/server/admin/course-maintenance.ts", "utf8");
const lessonPage = fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx", "utf8");
const learningPathPage = fs.readFileSync("app/learning-path/page.tsx", "utf8");
const courseBuilder = fs.readFileSync("lib/learning/course-builder.ts", "utf8");
const legacyEditorExists = fs.existsSync("components/AdminCourseEditor.tsx");
const legacyLessonRouteExists = fs.existsSync("app/api/admin/lessons/[lessonId]/route.ts");
const editWorkspace = registryView.slice(registryView.indexOf('view === "EDIT"'));

const registry = listAdminCourseRegistry();
const keys = registry.items.map((item) => item.runtimeCourseSlug + "/" + item.runtimeLessonId);

assert(registry.summary.tracks === 5, "FIVE_TRACKS_REQUIRED");
assert(registry.summary.lessons === 81, "EIGHTY_ONE_LESSONS_REQUIRED");
assert(registry.summary.availableLessons === 81, "ALL_LESSONS_AVAILABLE");
assert(registry.summary.frozenLessons === 81, "ALL_LESSONS_FROZEN");
assert(new Set(keys).size === 81, "LESSON_IDENTITY_DUPLICATE");
assert(registry.items.every((item) => Boolean(item.preview)), "ALL_FORMAL_ADMIN_SNAPSHOTS_REQUIRED");
assert(registry.items.every((item) => item.preview.stepMeta.length === 6), "ALL_FORMAL_ADMIN_SNAPSHOTS_SIX_STEPS_REQUIRED");
assert(
  registry.items.every(
    (item) =>
      item.preview.practice.id ===
      formalRuntimePracticeId(item.runtimeCourseSlug, item.runtimeLessonId)
  ),
  "ALL_FORMAL_ADMIN_PRACTICE_IDS_MUST_MATCH_RUNTIME"
);
assert(route.includes("getAdminCourseMaintenanceRegistry"), "API_NOT_USING_COURSE_MAINTENANCE_REGISTRY");
assert(page.includes("AdminCourseRegistry"), "PAGE_NOT_USING_REGISTRY_VIEW");
assert(!legacyEditorExists, "LEGACY_DB_EDITOR_STILL_PRESENT");
assert(!legacyLessonRouteExists, "LEGACY_DIRECT_LESSON_ROUTE_STILL_PRESENT");
assert(!registryView.includes("全局固定壳层 · 不随单课修改"), "T101_FIXED_SHELL_SHOULD_BE_REMOVED");
assert(!registryView.includes("课程构建解析字段"), "T101_CHECK_EXPLANATION_SHOULD_BE_HIDDEN");
assert(!registryView.includes("Activity 内部标题"), "T101_ACTIVITY_TITLE_SHOULD_BE_HIDDEN");
assert(!registryView.includes("Activity 内部 Prompt"), "T101_ACTIVITY_PROMPT_SHOULD_BE_HIDDEN");
assert(!registryView.includes("其它前台入口内容 · 学习路径卡片"), "LEGACY_AUXILIARY_FRONTEND_LABEL_FORBIDDEN");
assert(registryView.includes("新增做法"), "T101_STEP1_APPROACH_STRUCTURE_EDITING_MISSING");
assert(registryView.includes("新增说明"), "T101_DESCRIPTION_STRUCTURE_EDITING_MISSING");
assert(registryView.includes("新增卡片"), "T101_STEP5_CARD_STRUCTURE_EDITING_MISSING");
assert(registryView.includes("candidate.review.items.length <= 2"), "T101_STEP5_CARD_MINIMUM_GUARD_MISSING");
assert(registryView.includes("candidate.review.knowledgeDepth.length <= 1"), "T101_STEP5_DETAIL_MINIMUM_GUARD_MISSING");
assert(!registryView.includes("查看正式课程"), "T101_DUPLICATE_FORMAL_PREVIEW_ACTION_SHOULD_BE_REMOVED");
assert(registryView.includes("发起课程更新"), "T101_START_UPDATE_ACTION_MISSING");
assert(registryView.includes("对比当前"), "T101_CANDIDATE_COMPARE_ACTION_MISSING");
assert(registryView.includes("只展示发生变化的内容"), "T101_CANDIDATE_DIFF_SCOPE_MISSING");
assert(registryView.includes("版本更新对照"), "REAL_VERSION_OVERVIEW_ACTION_MISSING");
assert(registryView.includes("历史更新记录"), "REAL_VERSION_HISTORY_LABEL_MISSING");
assert(registryView.includes("历史版本对照"), "REAL_HISTORY_COMPARE_ACTION_MISSING");
assert(registryView.includes("六步变化分布"), "REAL_VERSION_STEP_DISTRIBUTION_MISSING");
assert(registryView.includes("各版本调整原因"), "REAL_VERSION_REASON_OVERVIEW_MISSING");
assert(registryView.includes("buildCandidateDiff(item.baseSnapshot, item.snapshot)"), "REAL_VERSION_OVERVIEW_MUST_USE_PERSISTED_DIFFS");
assert(registryView.includes("buildCandidateDiff(historyCompare.baseSnapshot, historyCompare.snapshot)"), "REAL_HISTORY_COMPARE_MUST_USE_PREVIOUS_VERSION");
assert(registryView.includes("version > 1"), "INITIAL_VERSION_COMPARE_ACTION_FORBIDDEN");
assert(registryView.includes("上一版本"), "REAL_HISTORY_COMPARE_PREVIOUS_LABEL_MISSING");
assert(registryView.includes("本版本"), "REAL_HISTORY_COMPARE_CURRENT_LABEL_MISSING");
assert(registryView.includes("调整原因"), "REAL_HISTORY_REASON_LABEL_MISSING");
assert(registryView.includes("课程目录 · 导航卡片"), "CATALOG_NAV_CARD_EDITOR_MISSING");
assert(registryView.includes('CandidateField label="标题"'), "CATALOG_TITLE_EDITOR_MISSING");
assert(registryView.includes('CandidateField label="副标题"'), "CATALOG_SUBTITLE_EDITOR_MISSING");
assert(registryView.includes('add("课程目录 · 导航卡片", "标题"'), "CATALOG_TITLE_DIFF_LABEL_DRIFT");
assert(registryView.includes('add("课程目录 · 导航卡片", "副标题"'), "CATALOG_SUBTITLE_DIFF_LABEL_DRIFT");
assert(editWorkspace.indexOf("本次更新原因") < editWorkspace.indexOf("课程目录 · 导航卡片"), "CATALOG_NAV_CARD_MUST_FOLLOW_UPDATE_REASON");
assert(editWorkspace.indexOf("课程目录 · 导航卡片") < editWorkspace.indexOf("学员实际看到的内容 · 课程页顶部"), "CATALOG_NAV_CARD_ORDER_DRIFT");
assert(registryView.includes("lastPublishedAt"), "COURSE_LAST_PUBLISHED_AT_UI_MISSING");
assert(registryView.includes("保存草稿"), "CANDIDATE_SAVE_DRAFT_ACTION_MISSING");
assert(registryView.includes("退出修改"), "CANDIDATE_EXIT_EDIT_ACTION_MISSING");
assert(!registryView.includes("保存候选版本"), "LEGACY_CANDIDATE_SAVE_LABEL_FORBIDDEN");
assert(!registryView.includes("重置为本次基线"), "REDUNDANT_CANDIDATE_RESET_ACTION_FORBIDDEN");
assert(!registryView.includes("取消本次更新"), "LEGACY_CANDIDATE_CANCEL_LABEL_FORBIDDEN");
assert(registryView.includes("onClick={cancelCandidate}>退出修改</button>"), "CANDIDATE_EXIT_EDIT_MUST_USE_CANCEL_ACTION");
assert(registryView.includes("提交审核"), "CANDIDATE_SUBMIT_ACTION_MISSING");
assert(registryView.includes("审核通过并上线"), "CANDIDATE_APPROVE_PUBLISH_ACTION_MISSING");
assert(!registryView.includes("确认上线"), "CANDIDATE_DUPLICATE_PUBLISH_CONFIRMATION_FORBIDDEN");
assert(registryView.includes("恢复此版本"), "CANDIDATE_RESTORE_ACTION_MISSING");
assert(maintenance.includes("startAdminCourseRestoreCandidate"), "CANDIDATE_RESTORE_SERVICE_MISSING");
assert(maintenance.includes("CANNOT_RESTORE_CURRENT_VERSION"), "CANDIDATE_RESTORE_CURRENT_GUARD_MISSING");
assert(maintenance.includes("CANDIDATE_ALREADY_ACTIVE"), "CANDIDATE_RESTORE_ACTIVE_GUARD_MISSING");
assert(maintenance.includes('sourceType: "ADMIN_MANUAL"'), "ADMIN_MANUAL_CANDIDATE_SOURCE_MISSING");
assert(maintenance.includes("baseSnapshot"), "CANDIDATE_BASE_SNAPSHOT_MISSING");
assert(maintenance.includes('status: "DRAFT"'), "CANDIDATE_DRAFT_STATE_MISSING");
assert(maintenance.includes('status: "REVIEW"'), "CANDIDATE_REVIEW_STATE_MISSING");
assert(maintenance.includes('status: "PUBLISHED"'), "CANDIDATE_PUBLISHED_STATE_MISSING");
assert(maintenance.includes("reviewedBy: user.email"), "CANDIDATE_REVIEW_AUDIT_MISSING");
assert(!maintenance.includes('status: "APPROVED"'), "CANDIDATE_APPROVED_INTERMEDIATE_STATE_FORBIDDEN");
assert(registryView.includes("opc_admin_course_selected_key"), "CANDIDATE_REFRESH_SELECTION_RESTORE_MISSING");
assert(registryView.includes("target.maintenance?.activeCandidate"), "CANDIDATE_REFRESH_VIEW_RESTORE_MISSING");
assert(maintenance.includes("db.transaction"), "CANDIDATE_PUBLISH_TRANSACTION_MISSING");
assert(maintenance.includes(".slice(0, 6)"), "CANDIDATE_SIX_VERSION_HISTORY_REQUIRED");
assert(maintenance.includes("CANDIDATE_BASE_VERSION_CONFLICT"), "CANDIDATE_VERSION_CONFLICT_GUARD_MISSING");
assert(maintenance.includes("explanation: check.correctFeedback"), "CANDIDATE_CORRECT_FEEDBACK_MAPPING_MISSING");
assert(maintenance.includes("incorrectExplanation: check.incorrectFeedback"), "CANDIDATE_INCORRECT_FEEDBACK_MAPPING_MISSING");
assert(maintenance.includes("CANDIDATE_RUNTIME_PRACTICE_NOT_FOUND"), "CANDIDATE_RUNTIME_PRACTICE_GUARD_MISSING");
assert(maintenance.includes("submissionSchema: runtimePractice.submissionSchema"), "CANDIDATE_RUNTIME_PRACTICE_SCHEMA_PRESERVATION_MISSING");
assert(!maintenance.includes('submissionSchema: { kind: "TASK_BRIEF_V1" }'), "CANDIDATE_PRACTICE_SCHEMA_MUST_NOT_BE_HARDCODED");
assert(!maintenance.includes("course-production-workflow"), "CANDIDATE_MUST_NOT_IMPORT_COURSE_BUILDER_WORKFLOW");
assert(lessonPage.includes("getPublishedAdminCourseOverrides"), "PUBLISHED_CANDIDATE_RUNTIME_OVERRIDE_MISSING");
assert(lessonPage.includes("course={effectiveCourse}"), "PUBLISHED_CANDIDATE_RUNTIME_SIDEBAR_TITLE_SYNC_MISSING");
assert(lessonPage.includes("const lessons = getAllLessons(effectiveCourse)"), "PUBLISHED_CANDIDATE_RUNTIME_NAV_TITLE_SYNC_MISSING");
assert(lessonPage.includes("crossTrackNextOverride"), "PUBLISHED_CANDIDATE_CROSS_TRACK_NAV_TITLE_SYNC_MISSING");
assert(lessonPage.includes("course={effectiveCourse}") && lessonPage.includes("lesson={effectiveCurrentLesson}"), "PUBLISHED_CANDIDATE_LOCKED_VIEW_TITLE_SYNC_MISSING");
assert(learningPathPage.includes("getPublishedAdminCourseOverrides"), "PUBLISHED_CANDIDATE_LEARNING_PATH_OVERRIDE_MISSING");
assert(learningPathPage.includes("override.snapshot.courseHeader.catalogSubtitle"), "PUBLISHED_CANDIDATE_LEARNING_PATH_SUBTITLE_SYNC_MISSING");
assert(learningPathPage.includes("override.snapshot.courseHeader.catalogTitle?.trim() || override.snapshot.courseHeader.title"), "PUBLISHED_CANDIDATE_LEARNING_PATH_TITLE_SYNC_MISSING");
assert(maintenance.includes("lastPublishedAt: latestPublished?.updatedAt ?? null"), "PUBLISHED_CANDIDATE_LAST_UPDATED_SYNC_MISSING");
assert(route.includes("revalidatePath(`/courses/${result.courseSlug}/lessons/${result.lessonSlug}`)"), "PUBLISHED_CANDIDATE_LESSON_REVALIDATION_MISSING");
assert(route.includes('revalidatePath("/learning-path")'), "PUBLISHED_CANDIDATE_LEARNING_PATH_REVALIDATION_MISSING");
assert(runtimePanel.includes("presentationCapabilityTitle ??"), "T101_CAPABILITY_TITLE_RUNTIME_BINDING_MISSING");
assert(runtimePanel.includes("lesson.related.length > 0"), "T101_RELATED_EMPTY_RUNTIME_GUARD_MISSING");
assert(courseBuilder.includes("explanation: check.correctFeedback"), "T101_CORRECT_FEEDBACK_RUNTIME_MAPPING_MISSING");
assert(courseBuilder.includes("incorrectExplanation: check.incorrectFeedback"), "T101_INCORRECT_FEEDBACK_RUNTIME_MAPPING_MISSING");
assert(runtimePanel.includes('key={`${index}-${item}`}'), "T101_VARIABLE_LIST_RUNTIME_KEY_GUARD_MISSING");
const t101 = registry.items.find((item) => item.lessonId === "t1-01-ai-task-fit");
assert(t101?.preview, "T101_PREVIEW_MISSING");
assert(t101.lessonTitle === t101.preview.courseHeader.title, "T101_TITLE_NOT_ALIGNED");
assert(t101.lessonSubtitle === t101.preview.courseHeader.catalogSubtitle, "T101_SUBTITLE_NOT_ALIGNED");
assert(t101.preview.capability.gain[0]?.length > 0, "T101_HERO_CAPABILITY_MISSING");
assert(t101.preview.capability.title.length > 0, "T101_CAPABILITY_TITLE_MISSING");
assert(t101.preview.capability.title === "把“学过”变成你现在真的能做的事情", "T101_CAPABILITY_TITLE_RUNTIME_SOURCE_DRIFT");
assert(t101.preview.courseHeader.lessonPageLead.length > 0, "T101_LESSON_PAGE_LEAD_MISSING");
assert(t101.preview.stepMeta.length === 6, "T101_SIX_STEP_META_REQUIRED");
assert(
  t101.preview.stepMeta.every((step) => step.title && step.objective && step.navigationDescription),
  "T101_STEP_VISIBLE_FIELDS_INCOMPLETE"
);
assert(t101.preview.checks.length === 3, "T101_CHECKS_INCOMPLETE");
assert(
  t101.preview.stepMeta.every((step) => step.id && step.kind),
  "T101_STEP_EXECUTION_IDENTITY_MISSING"
);
assert(
  t101.preview.checks.every(
    (check) =>
      check.id &&
      check.questionType &&
      check.options.length > 0 &&
      check.options.every((option) => option.value && option.label) &&
      check.correctValues.length > 0 &&
      check.correctValues.every((value) => check.options.some((option) => option.value === value))
  ),
  "T101_CHECK_EXECUTION_SEMANTICS_MISSING"
);
assert(t101.preview.practice.id.length > 0, "T101_PRACTICE_ID_MISSING");
assert(t101.preview.checks.every((check) => check.explanation.length > 0), "T101_CHECK_EXPLANATION_MUST_REMAIN_IN_MODEL");
assert(t101.preview.practice.activity.title.length > 0, "T101_ACTIVITY_TITLE_MUST_REMAIN_IN_MODEL");
assert(typeof t101.preview.practice.activity.prompt === "string", "T101_ACTIVITY_PROMPT_MUST_REMAIN_IN_MODEL");
assert(t101.preview.practice.instructions.length > 0, "T101_PRACTICE_FIELDS_MISSING");
assert(t101.preview.practice.rubric.length > 0, "T101_PRACTICE_RUBRIC_MISSING");
assert(t101.preview.review.items.length > 0, "T101_REVIEW_ITEMS_MISSING");
assert(t101.preview.review.knowledgeDepth.length > 0, "T101_REVIEW_DEPTH_MISSING");
assert(t101.preview.capability.selfAssessment.length > 0, "T101_SELF_ASSESSMENT_MISSING");
assert(t101.preview.capability.triggerScenario.length > 0, "T101_TRIGGER_SCENARIO_MISSING");
assert(t101.preview.capability.nextLessonValue.length > 0, "T101_NEXT_LESSON_VALUE_MISSING");

console.log("ADMIN_COURSE_REGISTRY_5_TRACKS_81_LESSONS=PASS");
console.log("ADMIN_COURSE_REGISTRY_FORMAL_SOURCE=PASS");
console.log("ADMIN_COURSE_REGISTRY_81_EDITABLE_SNAPSHOTS=PASS");
console.log("ADMIN_COURSE_REGISTRY_FORMAL_BASELINE_FROZEN=PASS");
console.log("ADMIN_COURSE_REGISTRY_LEGACY_DB_EDITOR_REMOVED=PASS");
console.log("ADMIN_COURSE_T101_VISIBLE_FIELD_PARITY=PASS");
console.log("ADMIN_COURSE_T101_MAINTENANCE_BOUNDARIES=PASS");
console.log("ADMIN_COURSE_T101_VARIABLE_CONTENT_STRUCTURE=PASS");
console.log("ADMIN_COURSE_T101_ADMIN_RUNTIME_PARITY=PASS");
console.log("ADMIN_COURSE_CANDIDATE_PERSISTENCE_CHAIN=PASS");
console.log("ADMIN_COURSE_PUBLISH_RUNTIME_OVERRIDE=PASS");
console.log("ADMIN_COURSE_LEARNING_PATH_SYNC=PASS");
console.log("ADMIN_COURSE_81_PRACTICE_RUNTIME_IDENTITY=PASS");
