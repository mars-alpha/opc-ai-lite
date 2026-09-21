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
  track01T103ReferenceFill,
  track01T104Draft,
  track01T104KnowledgeDepth,
  track01T104Meta,
  track01T104ReferenceFill,
  track01T105Draft,
  track01T105KnowledgeDepth,
  track01T105Meta,
  track01T105ReferenceFill
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
assert(draft.pedagogy.participation.kind === "COPY_TO_AI", "TRACK01_T101_STEP4_COPY_TO_AI");
assert(track01T101ReferenceFill.task.includes("OPC AI 学习站"), "TRACK01_T101_REFERENCE_OPC_CASE");
assert(track01T101ReferenceFill.task.includes("自媒体"), "TRACK01_T101_REFERENCE_SELF_MEDIA_CASE");
assert(track01T101ReferenceFill.task.length >= 45, "TRACK01_T101_REFERENCE_TASK_COMPLETE");
assert(track01T101ReferenceFill.help.length >= 45, "TRACK01_T101_REFERENCE_HELP_COMPLETE");
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
assert(!draft.pedagogy.participation.instruction.includes("粘贴回来"), "TRACK01_T101_NO_PASTEBACK_META_COPY");

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
assert(track01T102ReferenceFill.goal.includes("OPC AI 学习站"), "TRACK01_T102_REFERENCE_OPC_CASE");
assert(track01T102ReferenceFill.goal.includes("自媒体"), "TRACK01_T102_REFERENCE_SELF_MEDIA_CASE");
assert(track01T102ReferenceFill.goal.length >= 40, "TRACK01_T102_REFERENCE_GOAL_COMPLETE");
assert(track01T102ReferenceFill.requirements.length >= 60, "TRACK01_T102_REFERENCE_REQUIREMENTS_COMPLETE");
assert(track01T102ReferenceFill.format.includes("标题"), "TRACK01_T102_REFERENCE_FORMAT_COMPLETE");
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
assert(!t102.pedagogy.participation.instruction.includes("粘贴回来"), "TRACK01_T102_NO_PASTEBACK_META_COPY");

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
assert(track01T103ReferenceFill.task.includes("OPC AI 学习站"), "TRACK01_T103_REFERENCE_OPC_SELF_MEDIA_CASE");
assert(track01T103ReferenceFill.task.includes("自媒体"), "TRACK01_T103_REFERENCE_SELF_MEDIA_TASK");
assert(track01T103ReferenceFill.task.length >= 50, "TRACK01_T103_REFERENCE_TASK_COMPLETE");
assert(track01T103ReferenceFill.mustKnow.length >= 50, "TRACK01_T103_REFERENCE_CONTEXT_COMPLETE");
assert((t103.referenceAnswer ?? "").includes("OPC AI 学习站"), "TRACK01_T103_REFERENCE_ANSWER_DIRECTLY_TESTABLE");
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
assert(!t103.pedagogy.participation.instruction.includes("粘贴回来"), "TRACK01_T103_NO_PASTEBACK_META_COPY");
assert(!t103.practice?.hints.some((hint) => hint.includes("粘贴回课程")), "TRACK01_T103_NO_PASTEBACK_META_HINT");

const t104Packet = createCourseBuilderReviewPacket(
  track01T104Draft,
  new Date("2026-09-21T00:00:00.000Z"),
  "0.2.0"
);
if (t104Packet.output.mode !== "BUILD") throw new Error("TRACK01_T104_BUILD_REQUIRED");
const t104 = t104Packet.output;

assert(track01T104Meta.canonicalId === "T1-04", "TRACK01_T104_CANONICAL_ID");
assert(t104.lessonSpec.lessonId === "t1-04-purposeful-iteration", "TRACK01_T104_LESSON_ID");
assert(t104.lessonSpec.prerequisites.join(",") === "T1-03", "TRACK01_T104_PREREQUISITE");
assert(t104.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "TRACK01_T104_GATES");
assert(t104.pedagogy.qualityProfile?.allowedCoreTerms.join(",") === "Iteration", "TRACK01_T104_ITERATION_PRIMARY_HOME");
assert(t104.checkSequence?.length === 3, "TRACK01_T104_THREE_QUESTION_MASTERY");
assert(t104.practice?.instructions.map((item) => item.key).join(",") === "desired,requirements", "TRACK01_T104_STEP4_KEYS");
assert(t104.practice?.instructions.map((item) => item.label).join(",") === "我希望改成什么样,这次的具体要求", "TRACK01_T104_STEP4_BEGINNER_LABELS");
assert(t104.practice?.instructions.length === 2, "TRACK01_T104_STEP4_TWO_FIELDS");
assert(t104.practice?.goal.includes("第 2 个要点"), "TRACK01_T104_STEP4_PROBLEM_PRESET");
assert(t104.pedagogy.participation.kind === "COPY_TO_AI", "TRACK01_T104_COPY_TO_AI");
assert(!t104.pedagogy.participation.instruction.includes("粘贴回来"), "TRACK01_T104_NO_PASTEBACK_META_COPY");
assert(t104.practice?.hints.every((hint) => !/^\s*\d+\s*(?:[｜|、.．]|\))/.test(hint)), "TRACK01_T104_HINTS_UI_OWNS_NUMBERING");
assert(track01T104ReferenceFill.desired.includes("OPC AI 学习站"), "TRACK01_T104_REFERENCE_OPC_CASE");
assert(track01T104ReferenceFill.desired.includes("自媒体"), "TRACK01_T104_REFERENCE_SELF_MEDIA_CASE");
assert(track01T104ReferenceFill.desired.length >= 50, "TRACK01_T104_REFERENCE_DESIRED_COMPLETE");
assert(track01T104ReferenceFill.requirements.length >= 50, "TRACK01_T104_REFERENCE_REQUIREMENTS_COMPLETE");
assert((t104.referenceAnswer ?? "").includes("第 2 个要点"), "TRACK01_T104_REFERENCE_DIRECTLY_TESTABLE");
assert(t104.review.length >= 2 && t104.review.length <= 4, "TRACK01_T104_REVIEW_2_TO_4");
assert(t104.review.every((item) => item.includes("｜")), "TRACK01_T104_REVIEW_VERTICAL_CONTRAST");
assert(t104.review.length === track01T104KnowledgeDepth.review.length, "TRACK01_T104_REVIEW_DEPTH_ALIGNED");
assert(track01T104Meta.caseThread === "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT", "TRACK01_T104_CASE_THREAD");
const t104VisibleText = [
  t104.lessonSpec.title,
  ...t104.lessonSpec.learningObjectives,
  ...t104.lessonSpec.knowledgePoints,
  ...t104.content.points,
  ...t104.content.content,
  ...t104.review,
  ...t104.selfAssessment,
  ...(t104.practice?.instructions.flatMap((item) => [item.label, item.prompt]) ?? [])
].join(" ");
for (const forbidden of ["Workflow", "Agent", "Evaluation Engineering", "Chain-of-Thought", "Prompt Engineering", "Self-correction", "Iteration Notes"]) {
  assert(!t104VisibleText.includes(forbidden), "TRACK01_T104_DEFERRED_TERM:" + forbidden);
}
assert(!t104.practice?.instructions.some((item) => item.label.includes("哪里不对")), "TRACK01_T104_NO_DIAGNOSIS_FIELD");

const t105Packet = createCourseBuilderReviewPacket(
  track01T105Draft,
  new Date("2026-09-21T00:00:00.000Z"),
  "0.2.0"
);
if (t105Packet.output.mode !== "BUILD") throw new Error("TRACK01_T105_BUILD_REQUIRED");
const t105 = t105Packet.output;

assert(track01T105Meta.canonicalId === "T1-05", "TRACK01_T105_CANONICAL_ID");
assert(t105.lessonSpec.lessonId === "t1-05-reliability-verification", "TRACK01_T105_LESSON_ID");
assert(t105.lessonSpec.prerequisites.join(",") === "T1-04", "TRACK01_T105_PREREQUISITE");
assert(t105.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "TRACK01_T105_GATES");
assert(t105.checkSequence?.length === 3, "TRACK01_T105_THREE_QUESTION_MASTERY");
assert(t105.practice?.instructions.map((item) => item.key).join(",") === "claims,checks", "TRACK01_T105_STEP4_KEYS");
assert(t105.practice?.instructions.map((item) => item.label).join(",") === "我准备核验的内容,我会去核对什么", "TRACK01_T105_STEP4_BEGINNER_LABELS");
assert(t105.practice?.instructions.length === 2, "TRACK01_T105_STEP4_TWO_FIELDS");
assert(t105.pedagogy.participation.kind === "COPY_TO_AI", "TRACK01_T105_COPY_TO_AI");
assert(!t105.pedagogy.participation.instruction.includes("粘贴回来"), "TRACK01_T105_NO_PASTEBACK_META_COPY");
assert(t105.practice?.hints.every((hint) => !/^\s*\d+\s*(?:[｜|、.．]|\))/.test(hint)), "TRACK01_T105_HINTS_UI_OWNS_NUMBERING");
assert(track01T105ReferenceFill.claims.includes("需要核验"), "TRACK01_T105_REFERENCE_CLAIMS");
assert(track01T105ReferenceFill.checks.includes("官方"), "TRACK01_T105_REFERENCE_CHECKS");
assert(track01T105ReferenceFill.claims.length >= 45, "TRACK01_T105_REFERENCE_CLAIMS_COMPLETE");
assert(track01T105ReferenceFill.checks.length >= 60, "TRACK01_T105_REFERENCE_CHECKS_COMPLETE");
assert((t105.referenceAnswer ?? "").includes("效率提升 40%"), "TRACK01_T105_REFERENCE_DIRECTLY_TESTABLE");
assert(t105.review.length >= 2 && t105.review.length <= 4, "TRACK01_T105_REVIEW_2_TO_4");
assert(t105.review.every((item) => item.includes("｜")), "TRACK01_T105_REVIEW_VERTICAL_CONTRAST");
assert(t105.review.length === track01T105KnowledgeDepth.review.length, "TRACK01_T105_REVIEW_DEPTH_ALIGNED");
assert(track01T105Meta.caseThread === "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT", "TRACK01_T105_CASE_THREAD");
const t105VisibleText = [
  t105.lessonSpec.title,
  ...t105.lessonSpec.learningObjectives,
  ...t105.lessonSpec.knowledgePoints,
  ...t105.content.points,
  ...t105.content.content,
  ...t105.review,
  ...t105.selfAssessment,
  ...(t105.practice?.instructions.flatMap((item) => [item.label, item.prompt]) ?? [])
].join(" ");
for (const forbidden of ["Evaluation Engineering", "RAG", "Source of Truth", "HITL", "Permission", "Approval Flow", "Agent", "Workflow"]) {
  assert(!t105VisibleText.includes(forbidden), "TRACK01_T105_DEFERRED_TERM:" + forbidden);
}
assert(!t105.practice?.goal.includes("完成复杂"), "TRACK01_T105_NO_COMPLEX_RESEARCH_PRACTICE");

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
