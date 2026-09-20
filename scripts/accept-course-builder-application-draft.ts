import { courses } from "../lib/courses";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";
import { promptFoundationsBuildDraft } from "../fixtures/course-builder/prompt-foundations";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const aiLiteracy = courses.find((course) => course.slug === "ai-literacy");
assert(aiLiteracy, "AI_LITERACY_COURSE_NOT_FOUND");
const existing = aiLiteracy?.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)) ?? [];
assert(!existing.includes("prompt-foundations"), "APPLICATION_DRAFT_ALREADY_EXISTS_IN_CATALOG");

const packet = createCourseBuilderReviewPacket(
  promptFoundationsBuildDraft,
  new Date("2026-09-20T00:00:00.000Z")
);
assert(packet.status === "PENDING_REVIEW", "APPLICATION_DRAFT_NOT_PENDING_REVIEW");
assert(packet.output.mode === "BUILD", "APPLICATION_DRAFT_BUILD_REQUIRED");
if (packet.output.mode !== "BUILD") throw new Error("APPLICATION_DRAFT_BUILD_REQUIRED");

const { lessonSpec, check, practice, grounding, pedagogy, referenceAnswer } = packet.output;
const plan = buildLessonRuntimePlan(lessonSpec);

assert(lessonSpec.lessonType === "APPLICATION", "APPLICATION_TYPE");
assert(lessonSpec.practiceMode === "GUIDED", "APPLICATION_PRACTICE_MODE");
assert(plan.requiresCheck, "APPLICATION_CHECK_GATE");
assert(plan.requiresPractice, "APPLICATION_PRACTICE_GATE");
assert(!plan.requiresRealAi, "APPLICATION_REAL_AI_MUST_NOT_GATE");
assert(lessonSpec.realAiOperation === "GUIDED", "APPLICATION_REAL_AI_GUIDED");
assert(lessonSpec.realAiEvidence === "NONE", "APPLICATION_REAL_AI_EVIDENCE");
assert(
  plan.steps.map((step) => step.kind).join(">") ===
    "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY",
  "APPLICATION_SIX_STEP_COMPOSITION"
);
assert(lessonSpec.knowledgePoints.length === 4, "APPLICATION_KNOWLEDGE_DEPTH");
assert(lessonSpec.knowledgePoints.some((item) => item.includes("Example")), "APPLICATION_EXAMPLE_KNOWLEDGE");
assert(lessonSpec.knowledgePoints.some((item) => item.includes("Context")), "APPLICATION_CONTEXT_KNOWLEDGE");
assert(lessonSpec.knowledgePoints.some((item) => item.includes("Iteration")), "APPLICATION_ITERATION_KNOWLEDGE");
const responsibilityKeys = Object.keys(pedagogy.sixStepResponsibilities).sort();
assert(
  responsibilityKeys.join(">") ===
    ["CAPABILITY", "CHECK", "EXAMPLE", "EXPLAIN", "PRACTICE", "REVIEW"].join(">"),
  "APPLICATION_SIX_STEP_RESPONSIBILITIES"
);
for (const kind of ["EXPLAIN", "EXAMPLE", "CHECK", "PRACTICE", "REVIEW", "CAPABILITY"] as const) {
  const responsibility = pedagogy.sixStepResponsibilities[kind];
  assert(Boolean(responsibility.purpose), "APPLICATION_RESPONSIBILITY_PURPOSE:" + kind);
  assert(Boolean(responsibility.include), "APPLICATION_RESPONSIBILITY_INCLUDE:" + kind);
  assert(Boolean(responsibility.avoid), "APPLICATION_RESPONSIBILITY_AVOID:" + kind);
}
assert(Boolean(check), "APPLICATION_CHECK_REQUIRED");
assert(Boolean(practice), "APPLICATION_PRACTICE_REQUIRED");
assert((check?.options.length ?? 0) >= 3, "APPLICATION_CHECK_OPTIONS");
assert((practice?.instructions.length ?? 0) === 4, "APPLICATION_PRACTICE_FIELDS");
assert((practice?.rubric.length ?? 0) === 4, "APPLICATION_PRACTICE_RUBRIC");
assert(practice?.passScore === 70, "APPLICATION_PRACTICE_PASS_SCORE");
assert(lessonSpec.referenceAnswerEnabled, "APPLICATION_REFERENCE_ANSWER_ENABLED");
assert(Boolean(referenceAnswer), "APPLICATION_REFERENCE_ANSWER_REQUIRED");
assert(grounding.status === "REVIEWED", "APPLICATION_GROUNDING");
assert(grounding.sourceKind === "RESEARCH_PACKET", "APPLICATION_RESEARCH_PACKET");
assert(grounding.sourceLabels.length >= 2, "APPLICATION_RESEARCH_SOURCES");
assert(pedagogy.audience === "BEGINNER", "APPLICATION_BEGINNER");
assert(pedagogy.aiToolNeutral, "APPLICATION_AI_TOOL_NEUTRAL");
assert(pedagogy.participation.kind === "COPY_TO_AI", "APPLICATION_COPY_TO_AI");
assert(!JSON.stringify(promptFoundationsBuildDraft).includes("ChatGPT"), "APPLICATION_VENDOR_LOCK_IN");

console.log("APPLICATION_TOPIC=Prompt（提示词）怎么写，AI 才更容易理解你");
console.log("APPLICATION_CODE_VALIDATION=PASS");
console.log("APPLICATION_SPEC_RULES=PASS");
console.log("APPLICATION_KNOWLEDGE_DEPTH=PASS");
console.log("APPLICATION_SIX_STEP_RESPONSIBILITIES=PASS");
console.log("APPLICATION_CHECK_SCHEMA=PASS");
console.log("APPLICATION_PRACTICE_SCHEMA=PASS");
console.log("APPLICATION_PRACTICE_GATE=PASS");
console.log("APPLICATION_REFERENCE_ANSWER=PASS");
console.log("APPLICATION_UNIFIED_SHELL=PASS");
console.log("APPLICATION_AI_TOOL_NEUTRAL=PASS");
console.log("APPLICATION_GROUNDING=PASS");
console.log("APPLICATION_STATUS=PENDING_REVIEW");
