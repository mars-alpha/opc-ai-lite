import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { foundationCatalog } from "../lib/learning/foundation-catalog";
import {
  beginnerPromptDraft,
  beginnerPromptIntro,
  beginnerPromptKnowledgeDepth,
  beginnerPromptReferenceFill,
  beginnerContextDraft,
  beginnerContextIntro,
  beginnerContextKnowledgeDepth,
  beginnerIterationDraft,
  beginnerIterationIntro,
  beginnerIterationKnowledgeDepth,
  beginnerIterationReferenceFill,
  beginnerResultCheckDraft,
  beginnerResultCheckIntro,
  beginnerResultCheckKnowledgeDepth,
  beginnerResultCheckReferenceFill
} from "../fixtures/course-builder/beginner-foundation-stage2";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const drafts = [
  beginnerPromptDraft,
  beginnerContextDraft,
  beginnerIterationDraft,
  beginnerResultCheckDraft
] as const;

const expectedIds = [
  "beginner-prompt",
  "beginner-context",
  "beginner-iteration",
  "beginner-result-check"
];

const expectedTypes = ["APPLICATION", "CONCEPT", "APPLICATION", "APPLICATION"];

for (const [index, input] of drafts.entries()) {
  const packet = createCourseBuilderReviewPacket(
    input,
    new Date("2026-09-21T00:00:00.000Z"),
    "0.2.0"
  );
  assert(packet.skill.version === "0.2.0", "STAGE2_SKILL_VERSION");
  if (packet.output.mode !== "BUILD") throw new Error("STAGE2_BUILD_REQUIRED");
  const draft = packet.output;

  assert(draft.lessonSpec.lessonId === expectedIds[index], "STAGE2_ID");
  assert(draft.lessonSpec.lessonType === expectedTypes[index], "STAGE2_TYPE");
  assert(draft.pedagogy.audience === "BEGINNER", "STAGE2_BEGINNER");
  assert(draft.pedagogy.qualityProfile?.id === "BEGINNER_QUALITY_V1", "STAGE2_QUALITY_PROFILE");
  assert((draft.pedagogy.qualityProfile?.allowedCoreTerms.length ?? 99) <= 2, "STAGE2_TERM_BUDGET");
  assert(draft.review.length >= 2 && draft.review.length <= 3, "STAGE2_REVIEW_BUDGET");
  assert(draft.checkSequence?.length === 3, "STAGE2_MASTERY_COUNT");
  assert(
    draft.checkSequence?.map((item) => item.questionType).join(">") ===
      "SINGLE_CHOICE>TRUE_FALSE>MULTI_SELECT",
    "STAGE2_MASTERY_ORDER"
  );
  assert(
    draft.lessonSpec.steps.map((step) => step.kind).join(">") ===
      "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY",
    "STAGE2_SIX_STEP"
  );

  if (draft.lessonSpec.lessonType === "APPLICATION") {
    assert(draft.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "STAGE2_APPLICATION_GATES");
    assert(draft.practice !== null, "STAGE2_APPLICATION_PRACTICE");
    assert(draft.referenceAnswer !== null, "STAGE2_APPLICATION_REFERENCE");
  } else {
    assert(draft.lessonSpec.completionGates.join(",") === "CHECK", "STAGE2_CONCEPT_GATE");
    assert(draft.practice === null, "STAGE2_CONCEPT_NO_PRACTICE_GATE");
  }
}

assert(beginnerPromptDraft.pedagogy.qualityProfile.allowedCoreTerms.join(",") === "Prompt", "STAGE2_PROMPT_HOME");
assert(beginnerContextDraft.pedagogy.qualityProfile.allowedCoreTerms.join(",") === "Context", "STAGE2_CONTEXT_HOME");
assert(beginnerIterationDraft.pedagogy.qualityProfile.deferredTerms.includes("Agent"), "STAGE2_ITERATION_AGENT_DEFERRED");
assert(beginnerResultCheckDraft.pedagogy.qualityProfile.deferredTerms.includes("Evaluation"), "STAGE2_EVAL_DEFERRED");

for (const intro of [
  beginnerPromptIntro,
  beginnerContextIntro,
  beginnerIterationIntro,
  beginnerResultCheckIntro
]) {
  assert(intro.bottomDetails.length >= 1 && intro.bottomDetails.length <= 2, "STAGE2_INTRO_BUDGET");
}

for (const depth of [
  beginnerPromptKnowledgeDepth,
  beginnerContextKnowledgeDepth,
  beginnerIterationKnowledgeDepth,
  beginnerResultCheckKnowledgeDepth
]) {
  assert(depth.example.length >= 1 && depth.example.length <= 2, "STAGE2_EXAMPLE_DEPTH_BUDGET");
  assert(depth.review.length >= 1 && depth.review.length <= 2, "STAGE2_REVIEW_DEPTH_BUDGET");
}

assert(Object.keys(beginnerPromptReferenceFill).length === 2, "STAGE2_PROMPT_REFERENCE_FILL");
assert(Object.keys(beginnerIterationReferenceFill).length === 2, "STAGE2_ITERATION_REFERENCE_FILL");
assert(Object.keys(beginnerResultCheckReferenceFill).length === 2, "STAGE2_RESULT_CHECK_REFERENCE_FILL");
assert(beginnerPromptDraft.pedagogy.participation.kind === "COPY_TO_AI", "STAGE2_PROMPT_COPY");
assert(beginnerIterationDraft.pedagogy.participation.kind === "COPY_TO_AI", "STAGE2_ITERATION_COPY");

const stage2 = foundationCatalog.find((stage) => stage.stageId === "foundation-2");
assert(stage2?.lessons.length === 4, "STAGE2_CATALOG_COUNT");
for (const lesson of stage2?.lessons ?? []) {
  assert(lesson.curriculumStatus === "IN_PRODUCTION", "STAGE2_CATALOG_IN_PRODUCTION");
  assert(lesson.availability === "COMING_SOON", "STAGE2_CATALOG_COMING_SOON");
  assert(!lesson.runtimeCourseSlug && !lesson.runtimeLessonId, "STAGE2_NO_RUNTIME_MAPPING");
}

console.log("FOUNDATION_STAGE2_V02=PASS");
console.log("FOUNDATION_STAGE2_QUALITY_PROFILE=PASS");
console.log("FOUNDATION_STAGE2_MASTERY=PASS");
console.log("FOUNDATION_STAGE2_APPLICATION_GATES=PASS");
console.log("FOUNDATION_STAGE2_CATALOG_BOUNDARY=PASS");
