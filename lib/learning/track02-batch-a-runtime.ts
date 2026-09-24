import {
  courseBuilderCheckSequenceToRuntimeSeeds,
  type CourseBuilderBuildDraft
} from "./course-builder";
import {
  track02BatchADrafts,
  track02BatchAKnowledgeDepth,
  track02BatchATriggerScenarios
} from "../../fixtures/course-builder/track02-batch-a";

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
  if (!draft.practice) throw new Error("TRACK02_BATCH_A_PRACTICE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    id: "practice_ai_work_" + draft.lessonSpec.lessonId.replace(/-/g, "_"),
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

function introFromDraft(draft: ApprovedDraft) {
  return {
    title: draft.content.example.title,
    situation: draft.content.example.situation,
    approaches: [
      { label: "容易出错的做法", text: draft.content.example.before ?? "直接让 AI 自己猜重点。" },
      { label: "更稳妥的做法", text: draft.content.example.after ?? draft.content.example.result }
    ],
    comparison: [
      { term: "先判断", meaning: draft.content.points[0] ?? draft.content.plainExplanation },
      { term: "再处理", meaning: draft.content.points[1] ?? draft.content.whyItMatters }
    ],
    comparisonPlacement: "BOTTOM" as const,
    takeaway: draft.content.example.result
  };
}

export const TRACK02_RUNTIME_COURSE_SLUG = "ai-work";

export const track02BatchARuntimeDefinitions = track02BatchADrafts.map((sourceDraft, index) => {
  const draft = sourceDraft as ApprovedDraft;
  if (!draft.checkSequence) {
    throw new Error("TRACK02_BATCH_A_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  }
  return {
    canonicalId: "T2-0" + (index + 1),
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

export const track02BatchACourse = {
  slug: TRACK02_RUNTIME_COURSE_SLUG,
  title: "AI 工作应用：把 AI 用进真实工作",
  stage: "AI Work",
  stageLabel: "Track 02 · AI 工作应用",
  level: "入门实战",
  duration: "约 1 小时",
  summary: "先从研究与证据开始，把 AI 用到真实工作中的问题定义、来源判断与多来源综合。",
  outcome: "面对真实工作问题时，能先把问题说清楚、判断证据是否能用，并处理多个来源之间的差异。",
  modules: [
    {
      id: "research",
      title: "会找答案",
      description: "把问题定义清楚，判断证据，并处理多个来源的差异。",
      lessons: track02BatchARuntimeDefinitions.map((item) => item.lesson)
    }
  ]
};

export function getTrack02BatchARuntimePresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK02_RUNTIME_COURSE_SLUG) return null;
  const draft = track02BatchADrafts.find((item) => item.lessonSpec.lessonId === lessonSlug) as ApprovedDraft | undefined;
  if (!draft) return null;
  return {
    activity: {
      ...draft.pedagogy.participation,
      fields: draft.practice?.instructions ?? []
    },
    introComparison: introFromDraft(draft),
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth:
      track02BatchAKnowledgeDepth[lessonSlug as keyof typeof track02BatchAKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true,
    practiceHintsGrouped: true,
    practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment,
    triggerScenario:
      track02BatchATriggerScenarios[lessonSlug as keyof typeof track02BatchATriggerScenarios] ?? null
  };
}
