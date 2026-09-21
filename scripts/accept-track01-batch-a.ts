import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import {
  track01T101Draft,
  track01T101KnowledgeDepth,
  track01T101Meta,
  track01T101ReferenceFill,
  track01T102Draft,
  track01T102KnowledgeDepth,
  track01T102Meta,
  track01T102ReferenceFill,
  track01T103Draft,
  track01T103KnowledgeDepth,
  track01T103Meta,
  track01T103ReferenceFill
} from "../fixtures/course-builder/track01-batch-a";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const packet = createCourseBuilderReviewPacket(
  track01T101Draft,
  new Date("2026-09-21T00:00:00.000Z"),
  "0.2.0"
);

assert(packet.skill.id === "course-builder", "TRACK01_T101_SKILL_ID");
assert(packet.skill.version === "0.2.0", "TRACK01_T101_SKILL_VERSION");
if (packet.output.mode !== "BUILD") throw new Error("TRACK01_T101_BUILD_REQUIRED");
const draft = packet.output;

assert(track01T101Meta.canonicalId === "T1-01", "TRACK01_T101_CANONICAL_ID");
assert(track01T101Meta.formalBrief.includes("T1_01_T1_05"), "TRACK01_T101_FORMAL_BRIEF");
assert(draft.lessonSpec.lessonId === "t1-01-ai-task-fit", "TRACK01_T101_LESSON_ID");
assert(draft.lessonSpec.lessonType === "APPLICATION", "TRACK01_T101_TYPE");
assert(draft.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "TRACK01_T101_GATES");
assert(draft.pedagogy.qualityProfile?.id === "BEGINNER_QUALITY_V1", "TRACK01_T101_QUALITY");
assert(
  draft.lessonSpec.steps.map((step) => step.kind).join(">") === "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY",
  "TRACK01_T101_SIX_STEP_ORDER"
);
assert(draft.checkSequence?.length === 3, "TRACK01_T101_THREE_QUESTION_MASTERY");
assert(
  draft.checkSequence?.map((item) => item.masteryRole).join(",") === "BEST_JUDGMENT,MISCONCEPTION,BOUNDARY_CONDITIONS",
  "TRACK01_T101_MASTERY_ROLES"
);
assert(draft.practice?.instructions.length === 2, "TRACK01_T101_STEP4_TWO_LEARNER_OUTPUTS");
assert(draft.practice?.instructions.map((item) => item.key).join(",") === "task,help", "TRACK01_T101_STEP4_KEYS");
assert(draft.review.length === 3, "TRACK01_T101_REVIEW_COUNT");
assert(draft.review.every((item) => item.includes("｜")), "TRACK01_T101_REVIEW_EXPLANATION");
assert(draft.review[0]?.startsWith("先做第一版："), "TRACK01_T101_REVIEW_JUDGMENT_1");
assert(draft.review[1]?.startsWith("提供创意方案："), "TRACK01_T101_REVIEW_JUDGMENT_2");
assert(draft.review[2]?.startsWith("整理和比较："), "TRACK01_T101_REVIEW_JUDGMENT_3");
assert(draft.practice?.hints.every((hint) => !/^\d+[｜.、]/.test(hint)), "TRACK01_T101_STEP4_HINTS_NO_MANUAL_NUMBERING");
assert(draft.practice?.hints.every((hint) => !/^\s*\d+\s*(?:[｜|、.．]|\))/.test(hint)), "TRACK01_T101_STEP4_HINTS_UI_OWNS_NUMBERING");
assert(track01T101KnowledgeDepth.review.length === 3, "TRACK01_T101_REVIEW_DEPTH_COUNT");
assert(track01T101KnowledgeDepth.review.every((item) => item.title.startsWith("为什么")), "TRACK01_T101_REVIEW_DEPTH_EXPLAINS_WHY");
assert(draft.selfAssessment.length >= 2, "TRACK01_T101_SELF_ASSESSMENT");
assert(Boolean(draft.referenceAnswer?.trim()), "TRACK01_T101_REFERENCE_ANSWER");
assert(draft.hints.length >= 2, "TRACK01_T101_HINTS");
assert(track01T101Meta.artifactOutput === "TASK_FIT_NOTE", "TRACK01_T101_ARTIFACT_OUTPUT");
assert(track01T101Meta.nextReuse === "T1-02_CLEAR_TASK_BRIEF", "TRACK01_T101_NEXT_REUSE");
assert(track01T101Meta.caseThread === "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT", "TRACK01_T101_DEFAULT_CASE_THREAD");
assert(track01T101Draft.content.example.title.includes("AI 内容"), "TRACK01_T101_BEGINNER_OBVIOUS_EXAMPLE");
assert(track01T101Draft.pedagogy.participation.title.includes("内容"), "TRACK01_T101_OPC_CONTENT_ENTRY");
assert(track01T101Draft.content.example.situation.includes("AI 工具"), "TRACK01_T101_OPC_CONTENT_EXAMPLE");
assert(!track01T101Draft.referenceAnswer?.includes("下一课"), "TRACK01_T101_REFERENCE_INTERNAL_ORCHESTRATION_LEAK");
assert(draft.practice?.instructions[0]?.label === "我原本要做的事", "TRACK01_T101_STEP4_REAL_TASK_LABEL");
assert(draft.practice?.instructions[1]?.label === "AI 先帮哪一步", "TRACK01_T101_STEP4_HELP_STEP_LABEL");
assert(!draft.practice?.instructions.some((item) => /3 个|分类|任务目标|粘贴|回复/.test(item.label + item.prompt)), "TRACK01_T101_STEP4_NO_ARTIFACT_DRIVEN_OVERLOAD");
for (const value of Object.values(track01T101ReferenceFill)) {
  for (const forbidden of ["下一课", "继续使用", "参考答案", "说明：", "为什么"]) {
    assert(!value.includes(forbidden), "TRACK01_T101_REFERENCE_FILL_PURE_VALUE:" + forbidden);
  }
}

const visibleText = [
  draft.lessonSpec.title,
  draft.lessonSpec.nextLessonValue,
  ...draft.lessonSpec.learningObjectives,
  ...draft.lessonSpec.knowledgePoints,
  ...draft.content.points,
  ...draft.content.content,
  ...draft.content.mistakes,
  ...draft.review,
  ...draft.selfAssessment,
  ...(draft.practice?.instructions.flatMap((item) => [item.label, item.prompt]) ?? [])
].join(" ");

for (const deferred of ["Context Window", "Embedding", "MCP Server", "Agent Runtime"]) {
  assert(!visibleText.includes(deferred), "TRACK01_T101_DEFERRED_TERM:" + deferred);
}
assert(!visibleText.includes("审批流程"), "TRACK01_T101_NO_APPROVAL_TEACHING");
assert(!visibleText.includes("权限控制"), "TRACK01_T101_NO_PERMISSION_TEACHING");

const t102Packet = createCourseBuilderReviewPacket(
  track01T102Draft,
  new Date("2026-09-21T00:00:00.000Z"),
  "0.2.0"
);
if (t102Packet.output.mode !== "BUILD") throw new Error("TRACK01_T102_BUILD_REQUIRED");
const t102 = t102Packet.output;

assert(track01T102Meta.canonicalId === "T1-02", "TRACK01_T102_CANONICAL_ID");
assert(t102.lessonSpec.lessonId === "t1-02-clear-prompt", "TRACK01_T102_LESSON_ID");
assert(t102.lessonSpec.lessonType === "APPLICATION", "TRACK01_T102_TYPE");
assert(t102.lessonSpec.prerequisites.join(",") === "T1-01", "TRACK01_T102_PREREQUISITE");
assert(t102.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "TRACK01_T102_GATES");
assert(t102.pedagogy.qualityProfile?.allowedCoreTerms.join(",") === "Prompt", "TRACK01_T102_PROMPT_PRIMARY_HOME");
assert(t102.checkSequence?.length === 3, "TRACK01_T102_THREE_QUESTION_MASTERY");
assert(
  t102.checkSequence?.map((item) => item.masteryRole).join(",") === "BEST_JUDGMENT,MISCONCEPTION,BOUNDARY_CONDITIONS",
  "TRACK01_T102_MASTERY_ROLES"
);
assert(t102.practice?.instructions.map((item) => item.key).join(",") === "goal,audience,requirements,format", "TRACK01_T102_STEP4_KEYS");
assert(t102.practice?.hints.every((hint) => !/^\s*\d+\s*(?:[｜|、.．]|\))/.test(hint)), "TRACK01_T102_HINTS_UI_OWNS_NUMBERING");
assert(!t102.practice?.goal.includes("T1-01"), "TRACK01_T102_STEP4_NO_INTERNAL_LESSON_ID");
assert(!t102.practice?.goal.includes("上一课"), "TRACK01_T102_STEP4_SELF_CONTAINED_GOAL");
assert(!t102.practice?.goal.match(/T1-\d+/), "TRACK01_T102_STEP4_NO_INTERNAL_LESSON_CODE");
assert(t102.review.length === 4, "TRACK01_T102_REVIEW_COUNT");
assert(t102.review.every((item) => item.includes("｜")), "TRACK01_T102_REVIEW_VERTICAL_CONTRAST");
assert(t102.review[0]?.startsWith("把任务目标说清楚｜"), "TRACK01_T102_REVIEW_GOAL_CONTRAST");
assert(t102.review[1]?.startsWith("把使用对象说清楚｜"), "TRACK01_T102_REVIEW_AUDIENCE_CONTRAST");
assert(t102.review[2]?.startsWith("把关键要求说清楚｜"), "TRACK01_T102_REVIEW_REQUIREMENTS_CONTRAST");
assert(t102.review[3]?.startsWith("把输出形式说清楚｜"), "TRACK01_T102_REVIEW_FORMAT_CONTRAST");
assert(track01T102KnowledgeDepth.review.length === 4, "TRACK01_T102_REVIEW_DEPTH_COUNT");
assert(track01T102Meta.caseThread === "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT", "TRACK01_T102_CASE_THREAD");
assert(track01T102Meta.artifactOutput === "CLEAR_TASK_BRIEF", "TRACK01_T102_ARTIFACT");
assert(track01T102Draft.content.example.situation.includes("AI 工具"), "TRACK01_T102_OPC_CONTENT_EXAMPLE");
assert(!track01T102Draft.referenceAnswer?.includes("下一课"), "TRACK01_T102_REFERENCE_INTERNAL_ORCHESTRATION_LEAK");
assert(!track01T102Draft.referenceAnswer?.includes("AI 回复"), "TRACK01_T102_REFERENCE_AI_REPLY_LEAK");
for (const value of Object.values(track01T102ReferenceFill)) {
  for (const forbidden of ["下一课", "继续使用", "参考答案", "说明：", "为什么"]) {
    assert(!value.includes(forbidden), "TRACK01_T102_REFERENCE_FILL_PURE_VALUE:" + forbidden);
  }
}
const t102VisibleText = [
  t102.lessonSpec.title,
  ...t102.lessonSpec.learningObjectives,
  ...t102.lessonSpec.knowledgePoints,
  ...t102.content.points,
  ...t102.content.content,
  ...t102.review,
  ...t102.selfAssessment,
  ...(t102.practice?.instructions.flatMap((item) => [item.label, item.prompt]) ?? [])
].join(" ");
assert(!t102VisibleText.includes("System Prompt"), "TRACK01_T102_NO_SYSTEM_PROMPT_TEACHING");
assert(!t102VisibleText.includes("Prompt Engineering"), "TRACK01_T102_NO_PROMPT_ENGINEERING_TEACHING");
assert(!t102VisibleText.includes("Minimum Context Pack"), "TRACK01_T102_NO_CONTEXT_METHOD_TEACHING");
assert(!t102VisibleText.includes("Clear Task Brief"), "TRACK01_T102_NO_UNNECESSARY_ENGLISH_LEARNER_COPY");

const t103Packet = createCourseBuilderReviewPacket(
  track01T103Draft,
  new Date("2026-09-21T00:00:00.000Z"),
  "0.2.0"
);
if (t103Packet.output.mode !== "BUILD") throw new Error("TRACK01_T103_BUILD_REQUIRED");
const t103 = t103Packet.output;

assert(track01T103Meta.canonicalId === "T1-03", "TRACK01_T103_CANONICAL_ID");
assert(t103.lessonSpec.lessonId === "t1-03-minimum-context", "TRACK01_T103_LESSON_ID");
assert(t103.lessonSpec.prerequisites.join(",") === "T1-02", "TRACK01_T103_PREREQUISITE");
assert(t103.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "TRACK01_T103_GATES");
assert(t103.pedagogy.qualityProfile?.allowedCoreTerms.join(",") === "Context", "TRACK01_T103_CONTEXT_PRIMARY_HOME");
assert(t103.checkSequence?.length === 3, "TRACK01_T103_THREE_QUESTION_MASTERY");
assert(t103.practice?.instructions.map((item) => item.key).join(",") === "task,mustKnow", "TRACK01_T103_STEP4_KEYS");
assert(t103.pedagogy.participation.kind === "COPY_TO_AI", "TRACK01_T103_STEP4_COPY_TO_AI");
assert(t103.practice?.hints.every((hint) => !/^\s*\d+\s*(?:[｜|、.．]|\))/.test(hint)), "TRACK01_T103_HINTS_UI_OWNS_NUMBERING");
assert(!t103.practice?.goal.match(/T1-\d+/), "TRACK01_T103_STEP4_NO_INTERNAL_LESSON_CODE");
assert(t103.practice?.instructions.length === 2, "TRACK01_T103_STEP4_TWO_FIELD_COPY_PAYLOAD");
assert(t103.review.length >= 2 && t103.review.length <= 4, "TRACK01_T103_REVIEW_COUNT");
assert(t103.review.every((item) => item.includes("｜")), "TRACK01_T103_REVIEW_VERTICAL_CONTRAST");
assert(track01T103KnowledgeDepth.review.length >= 2 && track01T103KnowledgeDepth.review.length <= 4, "TRACK01_T103_REVIEW_DEPTH_2_TO_4");
assert(t103.review.length === track01T103KnowledgeDepth.review.length, "TRACK01_T103_REVIEW_DEPTH_ALIGNED");
assert(track01T103Meta.caseThread === "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT", "TRACK01_T103_CASE_THREAD");
assert(track01T103Meta.artifactOutput === "MINIMUM_INFORMATION_PACK", "TRACK01_T103_ARTIFACT");
for (const value of Object.values(track01T103ReferenceFill)) {
  for (const forbidden of ["T1-01", "T1-02", "T1-03", "T1-04", "下一课", "参考答案"]) {
    assert(!value.includes(forbidden), "TRACK01_T103_REFERENCE_FILL_PURE_VALUE:" + forbidden);
  }
}
const t103VisibleText = [
  t103.lessonSpec.title,
  ...t103.lessonSpec.learningObjectives,
  ...t103.lessonSpec.knowledgePoints,
  ...t103.content.points,
  ...t103.content.content,
  ...t103.review,
  ...t103.selfAssessment,
  ...(t103.practice?.instructions.flatMap((item) => [item.label, item.prompt]) ?? [])
].join(" ");
for (const forbidden of ["Knowledge Base", "Source of Truth", "Memory", "RAG", "Context Engineering", "Minimum Context Pack", "Clear Task Brief"]) {
  assert(!t103VisibleText.includes(forbidden), "TRACK01_T103_DEFERRED_OR_ENGLISH_LEAK:" + forbidden);
}

console.log("TRACK01_T101_COURSE_BUILDER_V02=PASS");
console.log("TRACK01_T101_FORMAL_BRIEF_ALIGNMENT=PASS");
console.log("TRACK01_T101_SIX_STEP_CONTENT=PASS");
console.log("TRACK01_T101_STEP4_ARTIFACT=PASS");
console.log("TRACK01_T101_NEXT_REUSE=PASS");
console.log("TRACK01_T101_BEGINNER_OBVIOUS_EXAMPLE=PASS");
console.log("TRACK01_T101_REFERENCE_FILL_CLEAN=PASS");
console.log("TRACK01_T101_STEP4_NATURAL_PRACTICE=PASS");
console.log("TRACK01_T101_REFERENCE_FILL_PURE_VALUES=PASS");
console.log("TRACK01_T101_OPC_DEFAULT_CASE_THREAD=PASS");
console.log("TRACK01_T101_OPC_CONTENT_EXAMPLE=PASS");
console.log("TRACK01_T102_COURSE_BUILDER_V02=PASS");
console.log("TRACK01_T102_FORMAL_BRIEF_ALIGNMENT=PASS");
console.log("TRACK01_T102_PROMPT_CONTEXT_BOUNDARY=PASS");
console.log("TRACK01_T102_STEP4_CLEAR_TASK_BRIEF=PASS");
console.log("TRACK01_T102_REVIEW_2_TO_4=PASS");
console.log("TRACK01_T102_REFERENCE_FILL_PURE_VALUES=PASS");
console.log("TRACK01_T102_OPC_DEFAULT_CASE_THREAD=PASS");
