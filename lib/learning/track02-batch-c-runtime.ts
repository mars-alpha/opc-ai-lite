import { courseBuilderCheckSequenceToRuntimeSeeds, type CourseBuilderBuildDraft } from "./course-builder";
import { TRACK02_RUNTIME_COURSE_SLUG, lessonFromDraft, practiceSeedFor, referenceFillFor } from "./track02-batch-a-runtime";
import { track02CourseWithBatchB } from "./track02-batch-b-runtime";
import { track02BatchCDrafts, track02BatchCIntroComparisons, track02BatchCKnowledgeDepth, track02BatchCTriggerScenarios } from "../../fixtures/course-builder/track02-batch-c";

export const track02BatchCRuntimeDefinitions = track02BatchCDrafts.map((sourceDraft, index) => {
  const draft = sourceDraft as CourseBuilderBuildDraft;
  if (!draft.checkSequence) throw new Error("TRACK02_BATCH_C_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    canonicalId: "T2-0" + (index + 7),
    lesson: lessonFromDraft(draft, "约 18 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({ ...check, status: "PUBLISHED" as const })),
    practice: practiceSeedFor(draft),
    referenceFill: referenceFillFor(draft)
  };
});

export const track02CourseWithBatchC = {
  ...track02CourseWithBatchB,
  duration: "约 3 小时",
  modules: [
    ...track02CourseWithBatchB.modules,
    { id: "documents", title: "会处理复杂资料", description: "文件多、内容长时，仍然知道怎样定位、比较，并把信息推进成行动。", lessons: track02BatchCRuntimeDefinitions.map((item) => item.lesson) }
  ]
};

export function getTrack02BatchCRuntimePresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK02_RUNTIME_COURSE_SLUG) return null;
  const draft = track02BatchCDrafts.find((item) => item.lessonSpec.lessonId === lessonSlug) as CourseBuilderBuildDraft | undefined;
  if (!draft) return null;
  return {
    activity: { ...draft.pedagogy.participation, fields: draft.practice?.instructions ?? [] },
    introComparison: track02BatchCIntroComparisons[lessonSlug as keyof typeof track02BatchCIntroComparisons],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth: track02BatchCKnowledgeDepth[lessonSlug as keyof typeof track02BatchCKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true,
    practiceHintsGrouped: true,
    practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario: track02BatchCTriggerScenarios[lessonSlug as keyof typeof track02BatchCTriggerScenarios] ?? null
  };
}
