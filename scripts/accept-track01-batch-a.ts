import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { track01T101Draft, track01T101Meta } from "../fixtures/course-builder/track01-batch-a";

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
assert(draft.practice?.instructions.length === 3, "TRACK01_T101_STEP4_THREE_OUTPUTS");
assert(draft.practice?.instructions.map((item) => item.key).join(",") === "tasks,goal,draft", "TRACK01_T101_STEP4_KEYS");
assert(draft.review.length === 4, "TRACK01_T101_REVIEW_COUNT");
assert(draft.review.every((item) => item.includes("｜")), "TRACK01_T101_REVIEW_EXPLANATION");
assert(draft.selfAssessment.length >= 2, "TRACK01_T101_SELF_ASSESSMENT");
assert(Boolean(draft.referenceAnswer?.trim()), "TRACK01_T101_REFERENCE_ANSWER");
assert(draft.hints.length >= 2, "TRACK01_T101_HINTS");
assert(track01T101Meta.artifactOutput === "TASK_FIT_NOTE_WITH_AI_FIRST_DRAFT", "TRACK01_T101_ARTIFACT_OUTPUT");
assert(track01T101Meta.nextReuse === "T1-02_CLEAR_TASK_BRIEF", "TRACK01_T101_NEXT_REUSE");

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
