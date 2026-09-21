import { validateCourseBuilderOutput } from "../lib/learning/course-builder";
import {
  foundationAiMlBuildDraft,
  foundationModelProductBuildDraft,
  foundationTrainingInferenceBuildDraft,
  foundationGenerationRetrievalBuildDraft
} from "../fixtures/course-builder/foundation-batch-a";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const drafts = [
  foundationAiMlBuildDraft,
  foundationModelProductBuildDraft,
  foundationTrainingInferenceBuildDraft,
  foundationGenerationRetrievalBuildDraft
];

const ids = new Set<string>();
for (const draft of drafts) {
  const parsed = validateCourseBuilderOutput(draft);
  if (parsed.mode !== "BUILD") throw new Error("FOUNDATION_BATCH_A_BUILD_REQUIRED");
  assert(parsed.lessonSpec.lessonType === "CONCEPT", "FOUNDATION_BATCH_A_CONCEPT_ONLY");
  assert(parsed.lessonSpec.practiceMode === "NONE", "FOUNDATION_BATCH_A_NO_REQUIRED_PRACTICE");
  assert(parsed.lessonSpec.completionGates.join(",") === "CHECK", "FOUNDATION_BATCH_A_CHECK_GATE_ONLY");
  assert(parsed.pedagogy.conceptMasteryBeforePractice, "FOUNDATION_BATCH_A_MASTERY_REQUIRED");
  assert(parsed.lessonSpec.steps.map((step) => step.kind).join(">") === "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY", "FOUNDATION_BATCH_A_SIX_STEP_ORDER");
  assert(parsed.check === null, "FOUNDATION_BATCH_A_LEGACY_CHECK_NULL");
  assert(parsed.checkSequence?.length === 3, "FOUNDATION_BATCH_A_THREE_QUESTION_MASTERY");
  assert(parsed.checkSequence?.map((item) => item.questionType).join(">") === "SINGLE_CHOICE>TRUE_FALSE>MULTI_SELECT", "FOUNDATION_BATCH_A_MASTERY_ORDER");
  assert(!ids.has(parsed.lessonSpec.lessonId), "FOUNDATION_BATCH_A_DUPLICATE_ID");
  ids.add(parsed.lessonSpec.lessonId);
}

assert(ids.size === 4, "FOUNDATION_BATCH_A_FOUR_DRAFTS");
console.log("FOUNDATION_BATCH_A_DRAFTS=PASS");
console.log("FOUNDATION_BATCH_A_SIX_STEP=PASS");
console.log("FOUNDATION_BATCH_A_CHECK_ONLY=PASS");
console.log("FOUNDATION_BATCH_A_THREE_QUESTION_MASTERY=PASS");
