import { courses } from "../lib/courses";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";
import { skillFoundationsBuildDraft } from "../fixtures/course-builder/skill-foundations";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const aiLiteracy = courses.find((course) => course.slug === "ai-literacy");
assert(aiLiteracy, "AI_LITERACY_COURSE_NOT_FOUND");

const existingLessonIds =
  aiLiteracy?.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)) ?? [];
assert(!existingLessonIds.includes("skill-foundations"), "REAL_DRAFT_ALREADY_EXISTS_IN_CATALOG");

const packet = createCourseBuilderReviewPacket(
  skillFoundationsBuildDraft,
  new Date("2026-09-20T00:00:00.000Z")
);

assert(packet.mode === "BUILD", "REAL_DRAFT_MODE");
assert(packet.status === "PENDING_REVIEW", "REAL_DRAFT_NOT_PENDING_REVIEW");
assert(packet.validation.schema === "PASS", "REAL_DRAFT_SCHEMA");
assert(packet.validation.rules === "PASS", "REAL_DRAFT_RULES");
assert(packet.output.mode === "BUILD", "REAL_DRAFT_OUTPUT_MODE");

if (packet.output.mode !== "BUILD") {
  throw new Error("REAL_DRAFT_BUILD_REQUIRED");
}

const { lessonSpec, content, check, practice, grounding, pedagogy } = packet.output;
const plan = buildLessonRuntimePlan(lessonSpec);

assert(lessonSpec.lessonType === "CONCEPT", "REAL_DRAFT_LESSON_TYPE");
assert(lessonSpec.courseSlug === "ai-literacy", "REAL_DRAFT_COURSE");
assert(plan.requiresCheck, "REAL_DRAFT_CHECK_GATE");
assert(!plan.requiresPractice, "REAL_DRAFT_UNEXPECTED_PRACTICE_GATE");
assert(!plan.requiresRealAi, "REAL_DRAFT_UNEXPECTED_REAL_AI_GATE");
assert(plan.realAiEvidenceSupported, "REAL_DRAFT_REAL_AI_SUPPORT");
assert(practice === null, "REAL_DRAFT_PRACTICE_MUST_BE_NULL");
assert(Boolean(check), "REAL_DRAFT_CHECK_REQUIRED");

const supportedShellSteps = new Set([
  "EXPLAIN",
  "EXAMPLE",
  "CHECK",
  "PRACTICE",
  "REVIEW",
  "CAPABILITY"
]);
for (const step of plan.steps) {
  assert(supportedShellSteps.has(step.kind), "REAL_DRAFT_UNSUPPORTED_SHELL_STEP:" + step.kind);
}

assert(
  plan.steps.map((step) => step.kind).join(">") ===
    "EXPLAIN>EXAMPLE>CHECK>REVIEW>CAPABILITY",
  "REAL_DRAFT_STEP_COMPOSITION"
);

assert(content.summary.length > 0, "REAL_DRAFT_SUMMARY");
assert(content.plainExplanation.length > 0, "REAL_DRAFT_EXPLANATION");
assert(content.whyItMatters.length > 0, "REAL_DRAFT_WHY");
assert(content.points.length >= 3, "REAL_DRAFT_POINTS");
assert(content.content.length >= 3, "REAL_DRAFT_CONTENT");
assert(content.example.title.length > 0, "REAL_DRAFT_EXAMPLE");
assert(content.mistakes.length >= 3, "REAL_DRAFT_MISTAKES");
assert(content.related.length >= 2, "REAL_DRAFT_RELATED");

assert(
  content.related.some((item) => item.includes("接口、工具、模型上下文协议与智能体")),
  "REAL_DRAFT_CURRICULUM_LINK"
);
assert(grounding.status === "REVIEWED", "REAL_DRAFT_GROUNDING_NOT_REVIEWED");
assert(grounding.sourceKind === "RESEARCH_PACKET", "REAL_DRAFT_GROUNDING_SOURCE");
assert(grounding.sourceLabels.length >= 2, "REAL_DRAFT_GROUNDING_SOURCES");
assert(pedagogy.audience === "BEGINNER", "REAL_DRAFT_BEGINNER_AUDIENCE");
assert(pedagogy.languagePolicy === "ZH_CN_FIRST", "REAL_DRAFT_LANGUAGE_POLICY");
assert(pedagogy.aiToolNeutral, "REAL_DRAFT_AI_TOOL_NEUTRAL");
assert(pedagogy.participation.kind === "COPY_TO_AI", "REAL_DRAFT_PARTICIPATION_KIND");
assert(Boolean(pedagogy.participation.prompt), "REAL_DRAFT_PARTICIPATION_PROMPT");
assert(!JSON.stringify(skillFoundationsBuildDraft).includes("ChatGPT"), "REAL_DRAFT_VENDOR_LOCK_IN");

console.log("REAL_LESSON_TOPIC=技能（Skill）是什么：把常用方法教给 AI");
console.log("REAL_DRAFT_CODE_VALIDATION=PASS");
console.log("REAL_DRAFT_CONCEPT_RULES=PASS");
console.log("REAL_DRAFT_RUNTIME_PLAN=PASS");
console.log("REAL_DRAFT_UNIFIED_SHELL_COMPATIBILITY=PASS");
console.log("REAL_DRAFT_CURRICULUM_FIT=PASS");
console.log("REAL_DRAFT_GROUNDING=PASS");
console.log("REAL_DRAFT_BEGINNER_PEDAGOGY=PASS");
console.log("REAL_DRAFT_AI_TOOL_NEUTRAL=PASS");
console.log("REAL_DRAFT_PARTICIPATION=PASS");
console.log("REAL_DRAFT_STATUS=PENDING_REVIEW");
