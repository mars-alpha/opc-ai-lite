import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { foundationCatalog } from "../lib/learning/foundation-catalog";
import {
  continuityTrialMeta,
  continuityTrialUseCasesDraft,
  continuityTrialResultQualityDraft,
  continuityTrialPromptDraft,
  continuityTrialContextDraft,
  continuityTrialIterationDraft
} from "../fixtures/course-builder/foundation-continuity-trial";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const drafts = [
  continuityTrialUseCasesDraft,
  continuityTrialResultQualityDraft,
  continuityTrialPromptDraft,
  continuityTrialContextDraft,
  continuityTrialIterationDraft
] as const;

const expectedIds = [
  "beginner-ai-use-cases",
  "beginner-ai-result-quality",
  "beginner-prompt",
  "beginner-context",
  "beginner-iteration"
] as const;

const expectedTypes = [
  "APPLICATION",
  "APPLICATION",
  "APPLICATION",
  "CONCEPT",
  "APPLICATION"
] as const;

const expectedGates = [
  "CHECK,PRACTICE",
  "CHECK,PRACTICE",
  "CHECK,PRACTICE",
  "CHECK",
  "CHECK,PRACTICE"
] as const;

const visibleText = (draft: (typeof drafts)[number]) =>
  [
    draft.content.summary,
    draft.content.plainExplanation,
    draft.content.whyItMatters,
    ...draft.content.points,
    ...draft.content.content,
    draft.content.example.title,
    draft.content.example.situation,
    draft.content.example.before,
    draft.content.example.after,
    draft.content.example.result,
    ...draft.content.mistakes,
    ...draft.content.related,
    ...draft.lessonSpec.steps.flatMap((step) => [step.title, step.objective]),
    ...(draft.practice?.instructions.flatMap((item) => [item.label, item.prompt]) ?? []),
    ...(draft.practice?.hints ?? []),
    ...(draft.review ?? []),
    ...(draft.selfAssessment ?? [])
  ].join(" ");

for (const [index, input] of drafts.entries()) {
  const packet = createCourseBuilderReviewPacket(
    input,
    new Date("2026-09-21T00:00:00.000Z"),
    "0.2.0"
  );
  assert(packet.skill.version === "0.2.0", "CONTINUITY_TRIAL_SKILL_VERSION");
  if (packet.output.mode !== "BUILD") throw new Error("CONTINUITY_TRIAL_BUILD_REQUIRED");
  const draft = packet.output;
  const meta = continuityTrialMeta[index];

  assert(draft.lessonSpec.lessonId === expectedIds[index], "CONTINUITY_TRIAL_ID");
  assert(draft.lessonSpec.lessonType === expectedTypes[index], "CONTINUITY_TRIAL_TYPE");
  assert(draft.lessonSpec.completionGates.join(",") === expectedGates[index], "CONTINUITY_TRIAL_GATES");
  assert(draft.pedagogy.qualityProfile?.id === "BEGINNER_QUALITY_V1", "CONTINUITY_TRIAL_QUALITY");
  assert(meta.lessonId === expectedIds[index], "CONTINUITY_TRIAL_META_ID");
  assert(meta.caseThread === "OPC_SELF_MEDIA_AI_TOPIC", "CONTINUITY_TRIAL_CASE_THREAD");
  assert(meta.artifactOutput.length > 0 && meta.nextReuse.length > 0, "CONTINUITY_TRIAL_ARTIFACT_METADATA");

  const text = visibleText(input);
  assert(text.includes("OPC") || text.includes("自媒体"), "CONTINUITY_TRIAL_CASE_VISIBLE:" + expectedIds[index]);
  assert(!text.includes("客户跟进消息"), "CONTINUITY_TRIAL_UNRELATED_CASE_LEAK");
}

assert(
  continuityTrialMeta.map((item) => item.inheritedArtifact).join(">") ===
    "REAL_TASK_SEED>AI_FIRST_DRAFT>PREPARED_DRAFT_WITH_SOURCE_PLAN>CLEAR_TASK_BRIEF_WITH_NEW_DRAFT>CONTEXT_ENRICHED_DRAFT",
  "CONTINUITY_TRIAL_INHERITED_CHAIN"
);

assert(
  continuityTrialMeta.map((item) => item.artifactOutput).join(">") ===
    "AI_FIRST_DRAFT>SELECTED_BETTER_DRAFT_WITH_COMPARISON_NOTE>CLEAR_TASK_BRIEF_WITH_NEW_DRAFT>CONTEXT_PACK_WITH_CONTEXT_ENRICHED_DRAFT>ITERATION_NOTES_WITH_ITERATED_DRAFT",
  "CONTINUITY_TRIAL_OUTPUT_CHAIN"
);

const f102Text = visibleText(continuityTrialResultQualityDraft);
assert(!f102Text.includes("Prompt："), "CONTINUITY_TRIAL_F102_PROMPT_RETEACH");
assert(!f102Text.includes("Context："), "CONTINUITY_TRIAL_F102_CONTEXT_RETEACH");
assert(f102Text.includes("单变量"), "CONTINUITY_TRIAL_F102_SINGLE_VARIABLE");

const f201Text = visibleText(continuityTrialPromptDraft);
assert(f201Text.includes("Task Brief"), "CONTINUITY_TRIAL_F201_TASK_BRIEF");
assert(!f201Text.includes("咖啡店"), "CONTINUITY_TRIAL_F201_OLD_CASE_LEAK");
assert(continuityTrialPromptDraft.lessonSpec.nextLessonValue.includes("Context Pack"), "CONTINUITY_TRIAL_F201_NEXT_REUSE");

const f202Text = visibleText(continuityTrialContextDraft);
assert(f202Text.includes("Context Pack"), "CONTINUITY_TRIAL_F202_CONTEXT_PACK");
assert(!f202Text.includes("你知道 ≠ AI"), "CONTINUITY_TRIAL_F202_OLD_EXPLANATION");
assert(continuityTrialContextDraft.lessonSpec.nextLessonValue.includes("Context-enriched Draft"), "CONTINUITY_TRIAL_F202_NEXT_REUSE");

const f203Text = visibleText(continuityTrialIterationDraft);
assert(f203Text.includes("Context-enriched Draft"), "CONTINUITY_TRIAL_F203_INHERIT");
assert(f203Text.includes("Iterated Draft"), "CONTINUITY_TRIAL_F203_OUTPUT");
assert(!f203Text.includes("催款"), "CONTINUITY_TRIAL_F203_OLD_CASE_LEAK");

assert(continuityTrialUseCasesDraft.lessonSpec.nextLessonValue.includes("AI First Draft"), "CONTINUITY_TRIAL_F101_NEXT_REUSE");
assert(continuityTrialResultQualityDraft.lessonSpec.nextLessonValue.includes("Better Draft"), "CONTINUITY_TRIAL_F102_NEXT_REUSE");
assert(continuityTrialIterationDraft.lessonSpec.nextLessonValue.includes("Iterated Draft"), "CONTINUITY_TRIAL_F203_NEXT_REUSE");

const stage1 = foundationCatalog.find((stage) => stage.stageId === "foundation-1");
const stage2 = foundationCatalog.find((stage) => stage.stageId === "foundation-2");
for (const lessonId of ["beginner-ai-use-cases","beginner-ai-result-quality"]) {
  const lesson = stage1?.lessons.find((item) => item.lessonId === lessonId);
  assert(lesson?.curriculumStatus === "IN_PRODUCTION", "CONTINUITY_TRIAL_STAGE1_STATUS");
  assert(lesson?.availability === "COMING_SOON", "CONTINUITY_TRIAL_STAGE1_AVAILABILITY");
}
for (const lessonId of ["beginner-prompt","beginner-context","beginner-iteration"]) {
  const lesson = stage2?.lessons.find((item) => item.lessonId === lessonId);
  assert(lesson?.curriculumStatus === "IN_PRODUCTION", "CONTINUITY_TRIAL_STAGE2_STATUS");
  assert(lesson?.availability === "COMING_SOON", "CONTINUITY_TRIAL_STAGE2_AVAILABILITY");
  assert(!lesson?.runtimeCourseSlug && !lesson?.runtimeLessonId, "CONTINUITY_TRIAL_NO_RUNTIME_MAPPING");
}

console.log("FOUNDATION_CONTINUITY_TRIAL_V02=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_CASE_THREAD=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_ARTIFACT_CHAIN=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_ANTI_REPEAT=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_CATALOG_BOUNDARY=PASS");
