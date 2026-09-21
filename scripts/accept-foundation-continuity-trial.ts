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
    draft.lessonSpec.title,
    draft.lessonSpec.nextLessonValue,
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
    draft.pedagogy.participation.title,
    draft.pedagogy.participation.instruction,
    draft.pedagogy.participation.reflection,
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
  assert(draft.checkSequence?.length === 3, "CONTINUITY_TRIAL_CURRENT_MASTERY_COUNT:" + expectedIds[index]);
  assert(draft.checkSequence?.every((item) => item.id.startsWith("continuity_")) === true, "CONTINUITY_TRIAL_OLD_CHECK_INHERITANCE:" + expectedIds[index]);
  assert(draft.lessonSpec.steps.map((step) => step.kind).join(">") === "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY", "CONTINUITY_TRIAL_SIX_STEP_ORDER:" + expectedIds[index]);

  const text = visibleText(input);
  assert(!text.includes("OPC"), "CONTINUITY_TRIAL_OPC_VISIBLE_LEAK:" + expectedIds[index]);
  assert(!text.includes("自媒体"), "CONTINUITY_TRIAL_SELF_MEDIA_VISIBLE_LEAK:" + expectedIds[index]);
  assert(!text.includes("客户跟进消息"), "CONTINUITY_TRIAL_UNRELATED_CASE_LEAK");
  for (const term of ["AI First Draft","Better Draft","Task Brief","Context Pack","Context-enriched Draft","Iteration Notes","Iterated Draft","Artifact"]) {
    assert(!text.includes(term), "CONTINUITY_TRIAL_INTERNAL_ENGLISH_LEAK:" + expectedIds[index] + ":" + term);
  }
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
assert(f201Text.includes("任务说明"), "CONTINUITY_TRIAL_F201_TASK_BRIEF_CN");
assert(continuityTrialPromptDraft.lessonSpec.title.startsWith("提示词（Prompt）"), "CONTINUITY_TRIAL_F201_TERM_FORMAT");
assert(!f201Text.includes("咖啡店"), "CONTINUITY_TRIAL_F201_OLD_CASE_LEAK");
assert(continuityTrialPromptDraft.lessonSpec.nextLessonValue.includes("上下文资料包"), "CONTINUITY_TRIAL_F201_NEXT_REUSE_CN");

const f202Text = visibleText(continuityTrialContextDraft);
assert(f202Text.includes("上下文资料包"), "CONTINUITY_TRIAL_F202_CONTEXT_PACK_CN");
assert(continuityTrialContextDraft.lessonSpec.title.startsWith("上下文（Context）"), "CONTINUITY_TRIAL_F202_TERM_FORMAT");
assert(!f202Text.includes("你知道 ≠ AI"), "CONTINUITY_TRIAL_F202_OLD_EXPLANATION");
assert(continuityTrialContextDraft.lessonSpec.nextLessonValue.includes("补充资料后的草稿"), "CONTINUITY_TRIAL_F202_NEXT_REUSE_CN");
assert(continuityTrialContextDraft.pedagogy.participation.kind === "MINI_TASK", "CONTINUITY_TRIAL_F202_STEP4_ACTIONABLE_KIND");
assert(Boolean(continuityTrialContextDraft.pedagogy.participation.prompt?.trim()), "CONTINUITY_TRIAL_F202_STEP4_PROMPT");
assert(continuityTrialContextDraft.practice === null, "CONTINUITY_TRIAL_F202_NO_PRACTICE_GATE");

const f203Text = visibleText(continuityTrialIterationDraft);
assert(f203Text.includes("补充资料后的草稿"), "CONTINUITY_TRIAL_F203_INHERIT_CN");
assert(f203Text.includes("迭代后的草稿"), "CONTINUITY_TRIAL_F203_OUTPUT_CN");
assert(continuityTrialIterationDraft.lessonSpec.title.startsWith("迭代（Iteration）"), "CONTINUITY_TRIAL_F203_TERM_FORMAT");
assert(!f203Text.includes("催款"), "CONTINUITY_TRIAL_F203_OLD_CASE_LEAK");

assert(continuityTrialUseCasesDraft.lessonSpec.nextLessonValue.includes("AI 第一版草稿"), "CONTINUITY_TRIAL_F101_NEXT_REUSE_CN");
assert(continuityTrialResultQualityDraft.lessonSpec.nextLessonValue.includes("改进后草稿"), "CONTINUITY_TRIAL_F102_NEXT_REUSE_CN");
assert(continuityTrialIterationDraft.lessonSpec.nextLessonValue.includes("迭代后的草稿"), "CONTINUITY_TRIAL_F203_NEXT_REUSE_CN");

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
console.log("FOUNDATION_CONTINUITY_TRIAL_LEARNER_LANGUAGE=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_CASE_NEUTRALIZATION=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_ARTIFACT_CHAIN=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_ANTI_REPEAT=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_SIX_STEP_CONTENT_INTEGRITY=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_CONCEPT_STEP4_ACTIONABLE=PASS");
console.log("FOUNDATION_CONTINUITY_TRIAL_CATALOG_BOUNDARY=PASS");
