import { courses } from "../lib/courses";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";
import { meetingActionListBuildDraft } from "../fixtures/course-builder/meeting-action-list";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const aiLiteracy = courses.find((course) => course.slug === "ai-literacy");
assert(aiLiteracy, "AI_LITERACY_COURSE_NOT_FOUND");
const existing = aiLiteracy?.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)) ?? [];
assert(!existing.includes("meeting-action-list"), "PRACTICE_DRAFT_ALREADY_EXISTS_IN_CATALOG");

const packet = createCourseBuilderReviewPacket(
  meetingActionListBuildDraft,
  new Date("2026-09-20T00:00:00.000Z")
);
assert(packet.status === "PENDING_REVIEW", "PRACTICE_DRAFT_NOT_PENDING_REVIEW");
assert(packet.output.mode === "BUILD", "PRACTICE_DRAFT_BUILD_REQUIRED");
if (packet.output.mode !== "BUILD") throw new Error("PRACTICE_DRAFT_BUILD_REQUIRED");

const { lessonSpec, check, practice, grounding, pedagogy, referenceAnswer } = packet.output;
const plan = buildLessonRuntimePlan(lessonSpec);

assert(lessonSpec.lessonType === "PRACTICE", "PRACTICE_TYPE");
assert(lessonSpec.practiceMode === "INDEPENDENT", "PRACTICE_MODE_INDEPENDENT");
assert(plan.requiresCheck, "PRACTICE_CHECK_GATE");
assert(plan.requiresPractice, "PRACTICE_GATE_REQUIRED");
assert(!plan.requiresRealAi, "PRACTICE_REAL_AI_MUST_NOT_GATE");
assert(lessonSpec.realAiOperation === "NONE", "PRACTICE_REAL_AI_NONE");
assert(lessonSpec.realAiEvidence === "NONE", "PRACTICE_REAL_AI_EVIDENCE_NONE");
assert(
  plan.steps.map((step) => step.kind).join(">") ===
    "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY",
  "PRACTICE_SIX_STEP_COMPOSITION"
);
assert(Object.keys(pedagogy.sixStepResponsibilities).length === 6, "PRACTICE_SIX_STEP_RESPONSIBILITIES");
assert(Boolean(check), "PRACTICE_CHECK_REQUIRED");
assert(Boolean(practice), "PRACTICE_DATA_REQUIRED");
assert((practice?.instructions.length ?? 0) === 4, "PRACTICE_FOUR_FIELDS");
assert((practice?.rubric.length ?? 0) === 4, "PRACTICE_FOUR_RUBRICS");
assert(practice?.passScore === 70, "PRACTICE_PASS_SCORE");
assert(lessonSpec.referenceAnswerEnabled, "PRACTICE_REFERENCE_ENABLED");
assert(Boolean(referenceAnswer), "PRACTICE_REFERENCE_REQUIRED");
assert(grounding.status === "REVIEWED", "PRACTICE_GROUNDING");
assert(grounding.sourceKind === "APPROVED_KNOWLEDGE", "PRACTICE_APPROVED_KNOWLEDGE");
assert(pedagogy.audience === "BEGINNER", "PRACTICE_BEGINNER");
assert(pedagogy.aiToolNeutral, "PRACTICE_AI_TOOL_NEUTRAL");
assert(pedagogy.participation.kind === "MINI_TASK", "PRACTICE_MINI_TASK");
assert(!JSON.stringify(meetingActionListBuildDraft).includes("ChatGPT"), "PRACTICE_VENDOR_LOCK_IN");

console.log("PRACTICE_TOPIC=把会议记录整理成可执行行动清单");
console.log("PRACTICE_CODE_VALIDATION=PASS");
console.log("PRACTICE_TYPE_RULES=PASS");
console.log("PRACTICE_INDEPENDENT_MODE=PASS");
console.log("PRACTICE_COMPLETION_GATE=PASS");
console.log("PRACTICE_LOCAL_EVALUATION_SCHEMA=PASS");
console.log("PRACTICE_REFERENCE_SUPPORT=PASS");
console.log("PRACTICE_SIX_STEP_RESPONSIBILITIES=PASS");
console.log("PRACTICE_UNIFIED_SHELL=PASS");
console.log("PRACTICE_AI_TOOL_NEUTRAL=PASS");
console.log("PRACTICE_GROUNDING=PASS");
console.log("PRACTICE_STATUS=PENDING_REVIEW");
