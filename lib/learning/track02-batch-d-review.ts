import type { CourseBuilderBuildDraft } from "./course-builder";
import { lessonFromDraft, referenceFillFor, TRACK02_RUNTIME_COURSE_SLUG } from "./track02-batch-a-runtime";
import {
  track02BatchDDrafts,
  track02BatchDIntroComparisons,
  track02BatchDKnowledgeDepth,
  track02BatchDTriggerScenarios
} from "../../fixtures/course-builder/track02-batch-d";

export const track02BatchDReviewDefinitions = track02BatchDDrafts.map((sourceDraft, index) => {
  const draft = sourceDraft as CourseBuilderBuildDraft;
  if (!draft.checkSequence) throw new Error("TRACK02_BATCH_D_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    canonicalId: "T2-" + String(index + 10).padStart(2, "0"),
    lesson: lessonFromDraft(draft, "约 18 分钟"),
    spec: draft.lessonSpec
  };
});

export function getTrack02BatchDReviewPresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK02_RUNTIME_COURSE_SLUG) return null;
  const draft = track02BatchDDrafts.find(
    (item) => item.lessonSpec.lessonId === lessonSlug
  ) as CourseBuilderBuildDraft | undefined;
  if (!draft) return null;

  return {
    activity: {
      ...draft.pedagogy.participation,
      fields: draft.practice?.instructions ?? []
    },
    introComparison:
      track02BatchDIntroComparisons[
        lessonSlug as keyof typeof track02BatchDIntroComparisons
      ],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth:
      track02BatchDKnowledgeDepth[
        lessonSlug as keyof typeof track02BatchDKnowledgeDepth
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
    triggerScenario: track02BatchDTriggerScenarios[lessonSlug] ?? null
  };
}
