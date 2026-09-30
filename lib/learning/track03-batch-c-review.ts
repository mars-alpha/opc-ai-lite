import type { CourseBuilderBuildDraft } from "./course-builder";
import {
  track03BatchCDrafts,
  track03BatchCIntroComparisons,
  track03BatchCKnowledgeDepth,
  track03BatchCTriggerScenarios
} from "./course-content/track03-batch-c";

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

export const track03BatchCReviewDefinitions = track03BatchCDrafts.map((draft,index)=>{
  if (!draft.checkSequence) throw new Error("TRACK03_BATCH_C_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return { canonicalId: "T3-" + String(index + 7).padStart(2,"0"), lesson: lessonFromDraft(draft,"约 18 分钟"), spec: draft.lessonSpec };
});

export function getTrack03BatchCReviewPresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== "ai-growth") return null;
  const draft = track03BatchCDrafts.find((item)=>item.lessonSpec.lessonId===lessonSlug);
  if (!draft) return null;
  return {
    activity: { ...draft.pedagogy.participation, fields: draft.practice?.instructions ?? [] },
    introComparison: track03BatchCIntroComparisons[lessonSlug as keyof typeof track03BatchCIntroComparisons],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth: track03BatchCKnowledgeDepth[lessonSlug as keyof typeof track03BatchCKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true, practiceHintsGrouped: true, practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario: track03BatchCTriggerScenarios[lessonSlug] ?? null
  };
}
