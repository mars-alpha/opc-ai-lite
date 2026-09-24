import { courseBuilderCheckSequenceToRuntimeSeeds, type CourseBuilderBuildDraft } from "./course-builder";
import { TRACK02_RUNTIME_COURSE_SLUG, lessonFromDraft, practiceSeedFor, referenceFillFor, track02BatchACourse } from "./track02-batch-a-runtime";
import { track02BatchBDrafts, track02BatchBIntroComparisons, track02BatchBKnowledgeDepth, track02BatchBTriggerScenarios } from "../../fixtures/course-builder/track02-batch-b";

export const track02BatchBRuntimeDefinitions = track02BatchBDrafts.map((sourceDraft, index) => {
  const draft = sourceDraft as CourseBuilderBuildDraft;
  if (!draft.checkSequence) throw new Error("TRACK02_BATCH_B_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    canonicalId: "T2-0" + (index + 4),
    lesson: lessonFromDraft(draft, "约 18 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice: practiceSeedFor(draft),
    referenceFill: referenceFillFor(draft)
  };
});

// Both batches share the formal course and the existing lesson Shell.
export const track02CourseWithBatchB = {
  ...track02BatchACourse,
  duration: "约 2 小时",
  modules: [
    ...track02BatchACourse.modules,
    {
      id: "deliverable",
      title: "会做成品",
      description: "把已经查清的信息，变成适合真实对象和用途的可交付结果。",
      lessons: track02BatchBRuntimeDefinitions.map((item) => item.lesson)
    }
  ]
};

export function getTrack02BatchBRuntimePresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK02_RUNTIME_COURSE_SLUG) return null;
  const draft = track02BatchBDrafts.find((item) => item.lessonSpec.lessonId === lessonSlug) as CourseBuilderBuildDraft | undefined;
  if (!draft) return null;
  return {
    activity: { ...draft.pedagogy.participation, fields: draft.practice?.instructions ?? [] },
    introComparison: track02BatchBIntroComparisons[lessonSlug as keyof typeof track02BatchBIntroComparisons],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth: track02BatchBKnowledgeDepth[lessonSlug as keyof typeof track02BatchBKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true,
    practiceHintsGrouped: true,
    practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario: track02BatchBTriggerScenarios[lessonSlug as keyof typeof track02BatchBTriggerScenarios] ?? null
  };
}
