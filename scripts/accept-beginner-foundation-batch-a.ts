import { validateCourseBuilderOutput } from "../lib/learning/course-builder";
import {
  beginnerAiUseCasesDraft,
  beginnerAiUseCasesIntro,
  beginnerAiUseCasesKnowledgeDepth,
  beginnerAiUseCasesReferenceFill,
  beginnerAiResultQualityDraft,
  beginnerAiResultQualityIntro,
  beginnerAiResultQualityKnowledgeDepth,
  beginnerAiResultQualityReferenceFill,
  beginnerAiCanBeWrongDraft,
  beginnerAiCanBeWrongIntro,
  beginnerAiCanBeWrongKnowledgeDepth,
  beginnerAiProductMapDraft,
  beginnerAiProductMapIntro,
  beginnerAiProductMapKnowledgeDepth
} from "../fixtures/course-builder/beginner-foundation-batch-a";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const drafts = [
  beginnerAiUseCasesDraft,
  beginnerAiResultQualityDraft,
  beginnerAiCanBeWrongDraft,
  beginnerAiProductMapDraft
];

const expectedIds = [
  "beginner-ai-use-cases",
  "beginner-ai-result-quality",
  "beginner-ai-can-be-wrong",
  "beginner-ai-product-map"
];

const forbiddenOpeningTerms = [
  "Machine Learning",
  "Training",
  "Inference",
  "Token",
  "Embedding",
  "Vector",
  "Deterministic Logic",
  "MCP",
  "Agent Runtime"
];

const forbiddenVisibleTerms = [
  "Training",
  "Inference",
  "Token",
  "Embedding",
  "Vector Search",
  "Deterministic Logic",
  "API",
  "Tool",
  "MCP",
  "Agent Runtime",
  "RAG",
  "Evaluation"
];

drafts.forEach((draft, index) => {
  const parsed = validateCourseBuilderOutput(draft);
  if (parsed.mode !== "BUILD") throw new Error("BEGINNER_BATCH_A_BUILD_REQUIRED");

  assert(parsed.lessonSpec.lessonId === expectedIds[index], "BEGINNER_BATCH_A_ID_MISMATCH");
  assert(parsed.pedagogy.audience === "BEGINNER", "BEGINNER_BATCH_A_AUDIENCE");
  assert(parsed.pedagogy.conceptMasteryBeforePractice, "BEGINNER_BATCH_A_MASTERY");
  assert(
    parsed.lessonSpec.steps.map((step) => step.kind).join(">") ===
      "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY",
    "BEGINNER_BATCH_A_SIX_STEP_ORDER"
  );
  assert(parsed.checkSequence?.length === 3, "BEGINNER_BATCH_A_THREE_QUESTION_CHECK");
  assert(
    parsed.checkSequence?.map((item) => item.questionType).join(">") ===
      "SINGLE_CHOICE>TRUE_FALSE>MULTI_SELECT",
    "BEGINNER_BATCH_A_CHECK_ORDER"
  );
  assert(parsed.review.length >= 2 && parsed.review.length <= 3, "BEGINNER_BATCH_A_REVIEW_SIZE");

  const openingText = [
    parsed.content.summary,
    parsed.content.plainExplanation,
    parsed.lessonSpec.steps[0]?.title ?? "",
    parsed.lessonSpec.steps[1]?.title ?? ""
  ].join(" ");
  for (const term of forbiddenOpeningTerms) {
    assert(!openingText.includes(term), "BEGINNER_BATCH_A_FORBIDDEN_OPENING_TERM:" + term);
  }

  const visibleText = [
    parsed.content.summary,
    parsed.content.plainExplanation,
    parsed.content.whyItMatters,
    ...parsed.content.points,
    ...parsed.content.content,
    parsed.content.example.title,
    parsed.content.example.situation,
    parsed.content.example.before,
    parsed.content.example.after,
    parsed.content.example.result,
    ...parsed.content.mistakes,
    ...parsed.content.related,
    ...parsed.lessonSpec.steps.flatMap((step) => [step.title, step.objective]),
    ...parsed.checkSequence!.flatMap((check) => [
      check.question,
      check.explanation,
      check.correctFeedback,
      check.incorrectFeedback,
      ...check.options.map((option) => option.label)
    ]),
    ...parsed.review,
    ...parsed.selfAssessment
  ].join(" ");
  for (const term of forbiddenVisibleTerms) {
    assert(!visibleText.includes(term), "BEGINNER_QUALITY_VISIBLE_TERM_LEAK:" + term);
  }
});

for (const parsedInput of [beginnerAiUseCasesDraft, beginnerAiResultQualityDraft]) {
  const parsed = validateCourseBuilderOutput(parsedInput);
  if (parsed.mode !== "BUILD") throw new Error("BEGINNER_APPLICATION_BUILD_REQUIRED");
  assert(parsed.lessonSpec.lessonType === "APPLICATION", "BEGINNER_APPLICATION_TYPE");
  assert(parsed.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "BEGINNER_APPLICATION_GATES");
  assert(parsed.practice !== null, "BEGINNER_APPLICATION_PRACTICE_REQUIRED");
}

for (const parsedInput of [beginnerAiCanBeWrongDraft, beginnerAiProductMapDraft]) {
  const parsed = validateCourseBuilderOutput(parsedInput);
  if (parsed.mode !== "BUILD") throw new Error("BEGINNER_CONCEPT_BUILD_REQUIRED");
  assert(parsed.lessonSpec.lessonType === "CONCEPT", "BEGINNER_CONCEPT_TYPE");
  assert(parsed.lessonSpec.completionGates.join(",") === "CHECK", "BEGINNER_CONCEPT_GATE");
  assert(parsed.practice === null, "BEGINNER_CONCEPT_NO_REQUIRED_PRACTICE");
}

const introEnhancements = [
  beginnerAiUseCasesIntro,
  beginnerAiResultQualityIntro,
  beginnerAiCanBeWrongIntro,
  beginnerAiProductMapIntro
];
for (const intro of introEnhancements) {
  assert((intro.bottomDetails?.length ?? 0) >= 1, "BEGINNER_EXPERIENCE_BOTTOM_DETAILS_REQUIRED");
  assert((intro.bottomDetails?.length ?? 0) <= 2, "BEGINNER_QUALITY_BOTTOM_DETAILS_BUDGET");
}

const depthEnhancements = [
  beginnerAiUseCasesKnowledgeDepth,
  beginnerAiResultQualityKnowledgeDepth,
  beginnerAiCanBeWrongKnowledgeDepth,
  beginnerAiProductMapKnowledgeDepth
];
for (const depth of depthEnhancements) {
  assert(depth.example.length >= 1, "BEGINNER_EXPERIENCE_EXAMPLE_DEPTH");
  assert(depth.example.length <= 2, "BEGINNER_QUALITY_EXAMPLE_DEPTH_BUDGET");
  assert(depth.review.length >= 1, "BEGINNER_EXPERIENCE_REVIEW_DEPTH");
  assert(depth.review.length <= 2, "BEGINNER_QUALITY_REVIEW_DEPTH_BUDGET");
}

assert(Object.keys(beginnerAiUseCasesReferenceFill).length === 2, "BEGINNER_USE_CASE_REFERENCE_FILL");
assert(Object.keys(beginnerAiResultQualityReferenceFill).length === 2, "BEGINNER_RESULT_QUALITY_REFERENCE_FILL");
assert(beginnerAiResultQualityDraft.pedagogy.participation.kind === "COPY_TO_AI", "BEGINNER_RESULT_QUALITY_COPY_TO_AI");

console.log("BEGINNER_BATCH_A_DRAFTS=PASS");
console.log("BEGINNER_BATCH_A_BEGINNER_CONSTRAINTS=PASS");
console.log("BEGINNER_BATCH_A_SIX_STEP=PASS");
console.log("BEGINNER_BATCH_A_MASTERY=PASS");
console.log("BEGINNER_BATCH_A_EXPERIENCE_RESTORATION=PASS");
console.log("BEGINNER_BATCH_A_QUALITY_BUDGET=PASS");
