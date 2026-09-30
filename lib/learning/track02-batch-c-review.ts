import type { CourseBuilderBuildDraft } from "./course-builder";
import { lessonFromDraft, referenceFillFor, TRACK02_RUNTIME_COURSE_SLUG } from "./track02-batch-a-runtime";
import {
  track02BatchCDrafts,
  track02BatchCIntroComparisons,
  track02BatchCKnowledgeDepth,
  track02BatchCTriggerScenarios
} from "./course-content/track02-batch-c";

export const track02BatchCReviewDefinitions = track02BatchCDrafts.map((sourceDraft, index) => {
  const draft = sourceDraft as CourseBuilderBuildDraft;
  if (!draft.checkSequence) {
    throw new Error("TRACK02_BATCH_C_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  }
  return {
    canonicalId: "T2-0" + (index + 7),
    lesson: lessonFromDraft(draft, "约 18 分钟"),
    spec: draft.lessonSpec
  };
});

export function getTrack02BatchCReviewPresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK02_RUNTIME_COURSE_SLUG) return null;
  const draft = track02BatchCDrafts.find(
    (item) => item.lessonSpec.lessonId === lessonSlug
  ) as CourseBuilderBuildDraft | undefined;
  if (!draft) return null;

  return {
    activity: {
      ...draft.pedagogy.participation,
      fields: draft.practice?.instructions ?? []
    },
    introComparison:
      track02BatchCIntroComparisons[
        lessonSlug as keyof typeof track02BatchCIntroComparisons
      ],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth:
      track02BatchCKnowledgeDepth[
        lessonSlug as keyof typeof track02BatchCKnowledgeDepth
      ],
    reviewItems: draft.review,
    reviewLabels: {
      primary: "AI适合做什么",
      secondary: "AI不应该替你做什么"
    },
    reviewCardFill: true,
    practiceHintsGrouped: true,
    practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario:
      track02BatchCTriggerScenarios[
        lessonSlug as keyof typeof track02BatchCTriggerScenarios
      ] ?? null
  };
}
