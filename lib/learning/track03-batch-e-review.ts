import type { CourseBuilderBuildDraft } from "./course-builder";
import {
  track03BatchEDrafts,
  track03BatchEIntroComparisons,
  track03BatchEKnowledgeDepth,
  track03BatchETriggerScenarios
} from "./course-content/track03-batch-e";

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

export const track03BatchEReviewDefinitions = track03BatchEDrafts.map((draft,index)=>{
  if (!draft.checkSequence) throw new Error("TRACK03_BATCH_E_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return { canonicalId: "T3-" + String(index + 14).padStart(2,"0"), lesson: lessonFromDraft(draft,"约 18 分钟"), spec: draft.lessonSpec };
});

export function getTrack03BatchEReviewPresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== "ai-growth") return null;
  const draft = track03BatchEDrafts.find((item)=>item.lessonSpec.lessonId===lessonSlug);
  if (!draft) return null;
  return {
    activity: { ...draft.pedagogy.participation, fields: draft.practice?.instructions ?? [] },
    introComparison: track03BatchEIntroComparisons[lessonSlug as keyof typeof track03BatchEIntroComparisons],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth: track03BatchEKnowledgeDepth[lessonSlug as keyof typeof track03BatchEKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true, practiceHintsGrouped: true, practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario: track03BatchETriggerScenarios[lessonSlug] ?? null
  };
}
