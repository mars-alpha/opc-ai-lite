import type { CourseBuilderBuildDraft } from "./course-builder";
import {
  track03BatchDDrafts,
  track03BatchDIntroComparisons,
  track03BatchDKnowledgeDepth,
  track03BatchDTriggerScenarios
} from "./course-content/track03-batch-d";

function lessonFromDraft(draft: CourseBuilderBuildDraft, duration: string) {
  return {
    id: draft.lessonSpec.lessonId, title: draft.lessonSpec.title, duration,
    summary: draft.content.summary, plainExplanation: draft.content.plainExplanation, whyItMatters: draft.content.whyItMatters,
    points: [...draft.content.points], content: [...draft.content.content], example: { ...draft.content.example }, guides: [],
    practice: { goal: draft.practice?.goal ?? "", steps: draft.practice?.instructions.map((item) => item.prompt) ?? [], acceptance: draft.practice?.rubric.map((item) => item.label) ?? [] },
    mistakes: [...draft.content.mistakes], related: [...draft.content.related]
  };
}

function referenceFillFor(draft: CourseBuilderBuildDraft) {
  if (!draft.practice) return {};
  return Object.fromEntries(draft.practice.instructions.map((instruction,index)=>[instruction.key,draft.practice?.rubric[index]?.example ?? ""]));
}

export const track03BatchDReviewDefinitions = track03BatchDDrafts.map((draft,index)=>{
  if (!draft.checkSequence) throw new Error("TRACK03_BATCH_D_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return { canonicalId: "T3-" + String(index + 10).padStart(2,"0"), lesson: lessonFromDraft(draft,"约 18 分钟"), spec: draft.lessonSpec };
});

export function getTrack03BatchDReviewPresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== "ai-growth") return null;
  const draft = track03BatchDDrafts.find((item)=>item.lessonSpec.lessonId===lessonSlug);
  if (!draft) return null;
  return {
    activity: { ...draft.pedagogy.participation, fields: draft.practice?.instructions ?? [] },
    introComparison: track03BatchDIntroComparisons[lessonSlug as keyof typeof track03BatchDIntroComparisons],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth: track03BatchDKnowledgeDepth[lessonSlug as keyof typeof track03BatchDKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true, practiceHintsGrouped: true, practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario: track03BatchDTriggerScenarios[lessonSlug] ?? null
  };
}
