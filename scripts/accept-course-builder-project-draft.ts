import { courses } from "../lib/courses";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";
import { rulePracticeEvaluator } from "../lib/learning/practice-evaluator";
import {
  aiWorkflowProjectBuildDraft,
  aiWorkflowProjectReferenceFill
} from "../fixtures/course-builder/ai-workflow-project";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

async function main() {
  const aiLiteracy = courses.find((course) => course.slug === "ai-literacy");
  assert(aiLiteracy, "AI_LITERACY_COURSE_NOT_FOUND");
  const existing = aiLiteracy?.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)) ?? [];
  assert(!existing.includes("ai-workflow-project"), "PROJECT_DRAFT_ALREADY_EXISTS_IN_CATALOG");

  const packet = createCourseBuilderReviewPacket(
    aiWorkflowProjectBuildDraft,
    new Date("2026-09-20T00:00:00.000Z")
  );
  assert(packet.status === "PENDING_REVIEW", "PROJECT_DRAFT_NOT_PENDING_REVIEW");
  assert(packet.output.mode === "BUILD", "PROJECT_DRAFT_BUILD_REQUIRED");
  if (packet.output.mode !== "BUILD") throw new Error("PROJECT_DRAFT_BUILD_REQUIRED");

  const { lessonSpec, check, practice, grounding, pedagogy, referenceAnswer } = packet.output;
  const plan = buildLessonRuntimePlan(lessonSpec);

  assert(lessonSpec.lessonType === "PROJECT", "PROJECT_TYPE");
  assert(lessonSpec.practiceMode === "PROJECT", "PROJECT_MODE");
  assert(plan.requiresCheck, "PROJECT_CHECK_GATE");
  assert(plan.requiresDeliverable, "PROJECT_DELIVERABLE_GATE_REQUIRED");
  assert(!plan.requiresPractice, "PROJECT_PRACTICE_GATE_MUST_NOT_FAKE_DELIVERABLE");
  assert(!plan.requiresRealAi, "PROJECT_REAL_AI_MUST_NOT_GATE");
  assert(lessonSpec.completionGates.includes("DELIVERABLE"), "PROJECT_DELIVERABLE_GATE");
  assert(
    plan.steps.map((step) => step.kind).join(">") ===
      "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY",
    "PROJECT_SIX_STEP_COMPOSITION"
  );
  assert(Object.keys(pedagogy.sixStepResponsibilities).length === 6, "PROJECT_SIX_STEP_RESPONSIBILITIES");
  assert(Boolean(check), "PROJECT_CHECK_REQUIRED");
  assert(Boolean(practice), "PROJECT_DRAFT_FORM_REQUIRED");
  assert((practice?.instructions.length ?? 0) === 5, "PROJECT_FIVE_SECTIONS");
  assert((practice?.rubric.length ?? 0) === 5, "PROJECT_FIVE_RUBRICS");
  assert(practice?.passScore === 72, "PROJECT_PASS_SCORE");
  assert(lessonSpec.referenceAnswerEnabled, "PROJECT_REFERENCE_ENABLED");
  assert(Boolean(referenceAnswer), "PROJECT_REFERENCE_REQUIRED");
  assert(grounding.status === "REVIEWED", "PROJECT_GROUNDING");
  assert(grounding.sourceKind === "APPROVED_KNOWLEDGE", "PROJECT_APPROVED_KNOWLEDGE");
  assert(pedagogy.aiToolNeutral, "PROJECT_AI_TOOL_NEUTRAL");
  assert(pedagogy.participation.kind === "MINI_TASK", "PROJECT_MINI_TASK");
  assert(!JSON.stringify(aiWorkflowProjectBuildDraft).includes("ChatGPT"), "PROJECT_VENDOR_LOCK_IN");

  if (!practice) throw new Error("PROJECT_DRAFT_FORM_REQUIRED");
  const canonicalEvaluation = await rulePracticeEvaluator({
    content: { ...aiWorkflowProjectReferenceFill },
    rubric: practice.rubric,
    passScore: practice.passScore
  });
  assert(canonicalEvaluation.passed, "PROJECT_REFERENCE_DRAFT_MUST_PASS_LOCAL_QUALITY");

  console.log("PROJECT_TOPIC=完成一份 AI 客户跟进工作流方案");
  console.log("PROJECT_CODE_VALIDATION=PASS");
  console.log("PROJECT_TYPE_RULES=PASS");
  console.log("PROJECT_MODE=PASS");
  console.log("PROJECT_DELIVERABLE_GATE_DECLARED=PASS");
  console.log("PROJECT_DELIVERABLE_RUNTIME_BOUNDARY=PASS");
  console.log("PROJECT_LOCAL_DRAFT_QUALITY=PASS");
  console.log("PROJECT_REFERENCE_SUPPORT=PASS");
  console.log("PROJECT_SIX_STEP_RESPONSIBILITIES=PASS");
  console.log("PROJECT_UNIFIED_SHELL=PASS");
  console.log("PROJECT_AI_TOOL_NEUTRAL=PASS");
  console.log("PROJECT_GROUNDING=PASS");
  console.log("PROJECT_STATUS=PENDING_REVIEW_RUNTIME_BLOCKED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
