import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { track01T101Draft, track01T101Meta, track01T101ReferenceFill } from "../fixtures/course-builder/track01-batch-a";

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
assert(draft.practice?.instructions.map((item) => item.key).join(",") === "tasks,goal", "TRACK01_T101_STEP4_KEYS");
assert(draft.review.length === 4, "TRACK01_T101_REVIEW_COUNT");
assert(draft.review.every((item) => item.includes("｜")), "TRACK01_T101_REVIEW_EXPLANATION");
assert(draft.selfAssessment.length >= 2, "TRACK01_T101_SELF_ASSESSMENT");
assert(Boolean(draft.referenceAnswer?.trim()), "TRACK01_T101_REFERENCE_ANSWER");
assert(draft.hints.length >= 2, "TRACK01_T101_HINTS");
assert(track01T101Meta.artifactOutput === "TASK_FIT_NOTE_WITH_SELECTED_TASK_GOAL", "TRACK01_T101_ARTIFACT_OUTPUT");
assert(track01T101Meta.nextReuse === "T1-02_CLEAR_TASK_BRIEF", "TRACK01_T101_NEXT_REUSE");
assert(track01T101Meta.caseThread === "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT", "TRACK01_T101_DEFAULT_CASE_THREAD");
assert(track01T101Draft.content.example.title.includes("AI 新变化"), "TRACK01_T101_SIMPLE_OPC_ENTRY_TASK");
assert(track01T101Draft.pedagogy.participation.title.includes("第一个 AI 小任务"), "TRACK01_T101_PROGRESSIVE_ENTRY");
assert(!track01T101Draft.referenceAnswer?.includes("下一课"), "TRACK01_T101_REFERENCE_INTERNAL_ORCHESTRATION_LEAK");
assert(draft.practice?.instructions[1]?.label === "我选中的任务", "TRACK01_T101_STEP4_SELECTED_TASK_LABEL");
assert(!draft.practice?.instructions.some((item) => item.key === "draft"), "TRACK01_T101_STEP4_NO_EXTERNAL_AI_REPLY_FIELD");
assert(!draft.practice?.instructions.some((item) => /粘贴|回复/.test(item.label + item.prompt)), "TRACK01_T101_STEP4_NO_AI_REPLY_PASTE");
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

console.log("TRACK01_T101_COURSE_BUILDER_V02=PASS");
console.log("TRACK01_T101_FORMAL_BRIEF_ALIGNMENT=PASS");
console.log("TRACK01_T101_SIX_STEP_CONTENT=PASS");
console.log("TRACK01_T101_STEP4_ARTIFACT=PASS");
console.log("TRACK01_T101_NEXT_REUSE=PASS");
console.log("TRACK01_T101_SIMPLE_FIRST_TASK=PASS");
console.log("TRACK01_T101_REFERENCE_FILL_CLEAN=PASS");
console.log("TRACK01_T101_STEP4_NO_EXTERNAL_AI_REPLY_FIELD=PASS");
console.log("TRACK01_T101_REFERENCE_FILL_PURE_VALUES=PASS");
console.log("TRACK01_T101_OPC_DEFAULT_CASE_THREAD=PASS");
