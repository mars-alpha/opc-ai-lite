import { validateCourseBuilderOutput } from "../lib/learning/course-builder";
import {
  beginnerAiUseCasesDraft,
  beginnerAiResultQualityDraft,
  beginnerAiCanBeWrongDraft,
  beginnerAiProductMapDraft
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
  assert(parsed.review.length >= 2 && parsed.review.length <= 4, "BEGINNER_BATCH_A_REVIEW_SIZE");

  const openingText = [
    parsed.content.summary,
    parsed.content.plainExplanation,
    parsed.lessonSpec.steps[0]?.title ?? "",
    parsed.lessonSpec.steps[1]?.title ?? ""
  ].join(" ");
  for (const term of forbiddenOpeningTerms) {
    assert(!openingText.includes(term), "BEGINNER_BATCH_A_FORBIDDEN_OPENING_TERM:" + term);
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

console.log("BEGINNER_BATCH_A_DRAFTS=PASS");
console.log("BEGINNER_BATCH_A_BEGINNER_CONSTRAINTS=PASS");
console.log("BEGINNER_BATCH_A_SIX_STEP=PASS");
console.log("BEGINNER_BATCH_A_MASTERY=PASS");
