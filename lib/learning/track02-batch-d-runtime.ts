import { courseBuilderCheckSequenceToRuntimeSeeds, type CourseBuilderBuildDraft } from "./course-builder";
import { TRACK02_RUNTIME_COURSE_SLUG, lessonFromDraft, practiceSeedFor, referenceFillFor } from "./track02-batch-a-runtime";
import { track02CourseWithBatchC } from "./track02-batch-c-runtime";
import { track02BatchDDrafts, track02BatchDIntroComparisons, track02BatchDKnowledgeDepth, track02BatchDTriggerScenarios } from "./course-content/track02-batch-d";

export const track02BatchDRuntimeDefinitions = track02BatchDDrafts.map((sourceDraft, index) => {
  const draft = sourceDraft as CourseBuilderBuildDraft;
  if (!draft.checkSequence) throw new Error("TRACK02_BATCH_D_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    canonicalId: "T2-" + String(index + 10).padStart(2, "0"),
    lesson: lessonFromDraft(draft, "约 18 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({ ...check, status: "PUBLISHED" as const })),
    practice: practiceSeedFor(draft),
    referenceFill: referenceFillFor(draft)
  };
});

export const track02CourseWithBatchD = {
  ...track02CourseWithBatchC,
  duration: "约 5 小时",
  modules: [
    ...track02CourseWithBatchC.modules,
    { id: "data", title: "会看数据", description: "面对表格和数字时，先把口径与质量搞清楚，再让 AI 帮你形成可信判断。", lessons: track02BatchDRuntimeDefinitions.slice(0, 3).map((item) => item.lesson) },
    { id: "knowledge", title: "会积累知识", description: "把值得复用的资料和经验留下来，并知道以后怎样找到可信版本。", lessons: track02BatchDRuntimeDefinitions.slice(3, 5).map((item) => item.lesson) },
    { id: "reuse", title: "会复用方法", description: "把一次做成功的真实工作提炼成以后可以继续使用的方法。", lessons: track02BatchDRuntimeDefinitions.slice(5).map((item) => item.lesson) }
  ]
};

export function getTrack02BatchDRuntimePresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK02_RUNTIME_COURSE_SLUG) return null;
  const draft = track02BatchDDrafts.find((item) => item.lessonSpec.lessonId === lessonSlug) as CourseBuilderBuildDraft | undefined;
  if (!draft) return null;
  return {
    activity: { ...draft.pedagogy.participation, fields: draft.practice?.instructions ?? [] },
    introComparison: track02BatchDIntroComparisons[lessonSlug as keyof typeof track02BatchDIntroComparisons],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth: track02BatchDKnowledgeDepth[lessonSlug as keyof typeof track02BatchDKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true,
    practiceHintsGrouped: true,
    practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario: track02BatchDTriggerScenarios[lessonSlug] ?? null
  };
}
