import {
  courseBuilderCheckSequenceToRuntimeSeeds,
  type CourseBuilderBuildDraft
} from "./course-builder";
import {
  track03BatchADrafts,
  track03BatchAIntroComparisons,
  track03BatchAKnowledgeDepth,
  track03BatchATriggerScenarios
} from "../../fixtures/course-builder/track03-batch-a";

type ApprovedDraft = CourseBuilderBuildDraft;

function lessonFromDraft(draft: ApprovedDraft, duration: string) {
  return {
    id: draft.lessonSpec.lessonId,
    title: draft.lessonSpec.title,
    duration,
    summary: draft.content.summary,
    plainExplanation: draft.content.plainExplanation,
    whyItMatters: draft.content.whyItMatters,
    points: [...draft.content.points],
    content: [...draft.content.content],
    example: { ...draft.content.example },
    guides: [],
    practice: {
      goal: draft.practice?.goal ?? "",
      steps: draft.practice?.instructions.map((item) => item.prompt) ?? [],
      acceptance: draft.practice?.rubric.map((item) => item.label) ?? []
    },
    mistakes: [...draft.content.mistakes],
    related: [...draft.content.related]
  };
}

function practiceSeedFor(draft: ApprovedDraft) {
  if (!draft.practice) throw new Error("TRACK03_PRACTICE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    id: "practice_ai_growth_" + draft.lessonSpec.lessonId.replace(/-/g, "_"),
    title: draft.practice.title,
    goal: draft.practice.goal,
    instructions: draft.practice.instructions,
    hints: draft.practice.hints,
    submissionSchema: {
      kind: "STRUCTURED_TEXT_V1" as const,
      fields: draft.practice.instructions.map((item) => ({
        key: item.key,
        label: item.label,
        minLength: 1,
        maxLength: 3000
      }))
    },
    rubric: draft.practice.rubric,
    passScore: draft.practice.passScore,
    required: true,
    status: "PUBLISHED" as const
  };
}

function referenceFillFor(draft: ApprovedDraft) {
  if (!draft.practice) return {};
  return Object.fromEntries(
    draft.practice.instructions.map((instruction, index) => [
      instruction.key,
      draft.practice?.rubric[index]?.example ?? ""
    ])
  );
}

export const TRACK03_RUNTIME_COURSE_SLUG = "ai-growth";

export const track03BatchARuntimeDefinitions = track03BatchADrafts.map((sourceDraft, index) => {
  const draft = sourceDraft as ApprovedDraft;
  if (!draft.checkSequence) {
    throw new Error("TRACK03_BATCH_A_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  }
  return {
    canonicalId: "T3-0" + (index + 1),
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

export const track03BatchACourse = {
  slug: TRACK03_RUNTIME_COURSE_SLUG,
  title: "AI 推广运营与业务增长",
  stage: "AI Growth",
  stageLabel: "Track 03 · AI 推广运营与业务增长",
  level: "入门实战",
  duration: "约 1 小时",
  summary: "从真实业务对象、真实需求场景和价值表达开始，让 AI 工作成果逐步产生曝光、线索与业务价值。",
  outcome: "能先判断现在最值得服务谁、对方什么时候真正会在意，以及一条推广内容最应该先说什么。",
  modules: [
    {
      id: "audience",
      title: "找对业务对象",
      description: "先找清楚重点服务谁、什么时候真的有需求，以及怎样把最重要的价值说清楚。",
      lessons: track03BatchARuntimeDefinitions.map((item) => item.lesson)
    }
  ]
};

export function getTrack03BatchARuntimePresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK03_RUNTIME_COURSE_SLUG) return null;
  const draft = track03BatchADrafts.find((item) => item.lessonSpec.lessonId === lessonSlug) as ApprovedDraft | undefined;
  if (!draft) return null;

  return {
    activity: {
      ...draft.pedagogy.participation,
      fields: draft.practice?.instructions ?? []
    },
    introComparison:
      track03BatchAIntroComparisons[
        lessonSlug as keyof typeof track03BatchAIntroComparisons
      ],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth:
      track03BatchAKnowledgeDepth[
        lessonSlug as keyof typeof track03BatchAKnowledgeDepth
      ],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true,
    practiceHintsGrouped: true,
    practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario:
      track03BatchATriggerScenarios[lessonSlug as keyof typeof track03BatchATriggerScenarios] ?? null
  };
}
