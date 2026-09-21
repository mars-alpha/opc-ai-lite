import {
  courseBuilderCheckSequenceToRuntimeSeeds,
  type CourseBuilderBuildDraft
} from "./course-builder";
import {
  track01T101Draft,
  track01T101Intro,
  track01T101KnowledgeDepth,
  track01T101ReferenceFill,
  track01T102Draft,
  track01T102Intro,
  track01T102KnowledgeDepth,
  track01T102ReferenceFill,
  track01T103Draft,
  track01T103Intro,
  track01T103KnowledgeDepth,
  track01T103ReferenceFill,
  track01T104Draft,
  track01T104Intro,
  track01T104KnowledgeDepth,
  track01T104ReferenceFill,
  track01T105Draft,
  track01T105Intro,
  track01T105KnowledgeDepth,
  track01T105ReferenceFill
} from "../../fixtures/course-builder/track01-batch-a";

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

const approvedLessons = [
  {
    canonicalId: "T1-01",
    draft: track01T101Draft as unknown as ApprovedDraft,
    duration: "约 18 分钟",
    intro: track01T101Intro,
    knowledgeDepth: track01T101KnowledgeDepth,
    referenceFill: track01T101ReferenceFill
  },
  {
    canonicalId: "T1-02",
    draft: track01T102Draft as unknown as ApprovedDraft,
    duration: "约 18 分钟",
    intro: track01T102Intro,
    knowledgeDepth: track01T102KnowledgeDepth,
    referenceFill: track01T102ReferenceFill
  },
  {
    canonicalId: "T1-03",
    draft: track01T103Draft as unknown as ApprovedDraft,
    duration: "约 18 分钟",
    intro: track01T103Intro,
    knowledgeDepth: track01T103KnowledgeDepth,
    referenceFill: track01T103ReferenceFill
  },
  {
    canonicalId: "T1-04",
    draft: track01T104Draft as unknown as ApprovedDraft,
    duration: "约 18 分钟",
    intro: track01T104Intro,
    knowledgeDepth: track01T104KnowledgeDepth,
    referenceFill: track01T104ReferenceFill
  },
  {
    canonicalId: "T1-05",
    draft: track01T105Draft as unknown as ApprovedDraft,
    duration: "约 18 分钟",
    intro: track01T105Intro,
    knowledgeDepth: track01T105KnowledgeDepth,
    referenceFill: track01T105ReferenceFill
  }
];

export const TRACK01_PHASE1_COURSE_SLUG = "foundation-ai";

export const track01Phase1Course = {
  slug: TRACK01_PHASE1_COURSE_SLUG,
  title: "AI 基础认知：先学会和 AI 协作",
  stage: "AI Foundation",
  stageLabel: "Track 01 · AI 基础认知",
  level: "入门",
  duration: "约 1.5 小时",
  summary: "先掌握 AI 任务边界、提示词、上下文、迭代与结果核验，再进入模型和系统机制。",
  outcome: "能把一个真实 AI 任务说清楚、给够必要信息、定向修改结果，并知道什么时候必须核验。",
  modules: [
    {
      id: "phase1",
      title: "01 · AI 基础协作",
      description: "先把最常用、最容易出错的 AI 协作方法练会。",
      lessons: approvedLessons.map((item) => lessonFromDraft(item.draft, item.duration))
    }
  ]
};

export const track01Phase1Specs = approvedLessons.map((item) => item.draft.lessonSpec);

export type Track01Phase1RuntimePresentation = {
  activity: ApprovedDraft["pedagogy"]["participation"];
  introComparison: (typeof approvedLessons)[number]["intro"];
  referenceAnswer: string | null;
  referenceFill: Record<string, string>;
  knowledgeDepth: (typeof approvedLessons)[number]["knowledgeDepth"];
  reviewItems: readonly string[];
  reviewLabels: { primary: string; secondary: string };
  reviewCardFill: boolean;
  practiceHintsGrouped: boolean;
  practiceCopyValuesOnly: boolean;
  selfAssessment: readonly string[];
};

const presentationByLesson = new Map<string, Track01Phase1RuntimePresentation>(
  approvedLessons.map((item) => [
    item.draft.lessonSpec.lessonId,
    {
      activity: item.draft.pedagogy.participation,
      introComparison: item.intro,
      referenceAnswer: item.draft.referenceAnswer,
      referenceFill: item.referenceFill,
      knowledgeDepth: item.knowledgeDepth,
      reviewItems: item.draft.review,
      reviewLabels: { primary: "AI 适合做什么", secondary: "AI 不应该替你做什么" },
      reviewCardFill: true,
      practiceHintsGrouped: true,
      practiceCopyValuesOnly: true,
      selfAssessment: item.draft.selfAssessment
    }
  ])
);

export function getTrack01Phase1RuntimePresentation(
  courseSlug: string,
  lessonSlug: string
) {
  if (courseSlug !== TRACK01_PHASE1_COURSE_SLUG) return null;
  return presentationByLesson.get(lessonSlug) ?? null;
}

function practiceSeedFor(draft: ApprovedDraft) {
  if (!draft.practice) throw new Error("TRACK01_PHASE1_PRACTICE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    id: "practice_" + draft.lessonSpec.lessonId.replace(/-/g, "_"),
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

export const track01Phase1RuntimeDefinitions = approvedLessons.map((item) => {
  if (!item.draft.checkSequence) {
    throw new Error("TRACK01_PHASE1_CHECK_SEQUENCE_REQUIRED:" + item.draft.lessonSpec.lessonId);
  }
  return {
    canonicalId: item.canonicalId,
    lesson: lessonFromDraft(item.draft, item.duration),
    spec: item.draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(item.draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice: practiceSeedFor(item.draft),
    referenceFill: item.referenceFill
  };
});
