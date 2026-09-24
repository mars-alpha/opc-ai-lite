import {
  courseBuilderCheckSequenceToRuntimeSeeds,
  type CourseBuilderBuildDraft
} from "./course-builder";
import { withTrack01StepNavigation } from "./track01-step-navigation";
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
import {
  track01T106Draft,
  track01T106Intro,
  track01T106KnowledgeDepth,
  track01T106ReferenceFill
} from "../../fixtures/course-builder/track01-phase2-t106";
import {
  track01T107Draft,
  track01T107Intro,
  track01T107KnowledgeDepth,
  track01T107ReferenceFill
} from "../../fixtures/course-builder/track01-phase2-t107";
import {
  track01T108Draft,
  track01T108Intro,
  track01T108KnowledgeDepth,
  track01T108ReferenceFill
} from "../../fixtures/course-builder/track01-phase3-t108";
import {
  track01T109Draft,
  track01T109Intro,
  track01T109KnowledgeDepth,
  track01T109ReferenceFill
} from "../../fixtures/course-builder/track01-phase3-t109";
import {
  track01T110Draft,
  track01T110Intro,
  track01T110KnowledgeDepth,
  track01T110ReferenceFill
} from "../../fixtures/course-builder/track01-phase3-t110";
import {
  track01T111T120Drafts,
  track01T111T120Intros,
  track01T111T120KnowledgeDepth,
  track01T111T120TriggerScenarios
} from "../../fixtures/course-builder/track01-t111-t120";

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
  title: "先学会和 AI 协作",
  stage: "AI Foundation",
  stageLabel: "Track 01 · AI 基础认知",
  level: "入门",
  duration: "约 1.5 小时",
  summary: "先掌握 AI 任务边界、提示词、上下文、迭代与结果核验，再进入模型和系统机制。",
  outcome: "能把一个真实 AI 任务说清楚、给够必要信息、定向修改结果，并知道什么时候必须核验。",
  modules: [
    {
      id: "phase1",
      title: "先学会和 AI 基本协作",
      description: "先把最常用、最容易出错的 AI 协作方法练会。",
      lessons: approvedLessons.map((item) => lessonFromDraft(item.draft, item.duration))
    },
    {
      id: "phase2",
      title: "理解模型为什么这样工作",
      description: "在已经会基本协作之后，再理解模型和完整 AI 产品的基本关系。",
      lessons: [
        lessonFromDraft(track01T106Draft as unknown as ApprovedDraft, "约 16 分钟"),
        lessonFromDraft(track01T107Draft as unknown as ApprovedDraft, "约 16 分钟")
      ]
    },
    {
      id: "phase3",
      title: "理解 AI 的记忆与知识",
      description: "分清对话历史、长期记忆、知识库与事实源，知道信息从哪里来，以及冲突时哪一份说了算。",
      lessons: [
        lessonFromDraft(track01T108Draft as unknown as ApprovedDraft, "约 16 分钟"),
        lessonFromDraft(track01T109Draft as unknown as ApprovedDraft, "约 16 分钟"),
        lessonFromDraft(track01T110Draft as unknown as ApprovedDraft, "约 18 分钟")
      ]
    }
,
    {
      id: "phase4",
      title: "理解 AI 如何连接外部世界",
      description: "理解接口、结构化输出、工具调用与统一连接层，知道 AI 怎样安全地连接外部数据和能力。",
      lessons: track01T111T120Drafts.slice(0, 4).map((draft) =>
        lessonFromDraft(draft as unknown as ApprovedDraft, "约 16 分钟")
      )
    },
    {
      id: "phase5",
      title: "理解 AI 的复用与执行",
      description: "从一次有效方法进入可复用、可重复、可动态决策的执行方式。",
      lessons: track01T111T120Drafts.slice(4, 7).map((draft) =>
        lessonFromDraft(draft as unknown as ApprovedDraft, "约 16 分钟")
      )
    },
    {
      id: "phase6",
      title: "理解现代 AI 能力与安全边界",
      description: "理解多模态与操作能力，同时建立隐私、权限和人工确认边界。",
      lessons: track01T111T120Drafts.slice(7).map((draft) =>
        lessonFromDraft(draft as unknown as ApprovedDraft, "约 16 分钟")
      )
    }
  ]
};

export const track01Phase1Specs = approvedLessons.map((item) => item.draft.lessonSpec);
export const track01T106Spec = (track01T106Draft as unknown as ApprovedDraft).lessonSpec;
export const track01T107Spec = (track01T107Draft as unknown as ApprovedDraft).lessonSpec;
export const track01T108Spec = (track01T108Draft as unknown as ApprovedDraft).lessonSpec;
export const track01T109Spec = (track01T109Draft as unknown as ApprovedDraft).lessonSpec;
export const track01T110Spec = (track01T110Draft as unknown as ApprovedDraft).lessonSpec;
export const track01T111T120Specs = track01T111T120Drafts.map(
  (draft) => (draft as unknown as ApprovedDraft).lessonSpec
);

export const track01FormalLessonSpecs = [
  ...track01Phase1Specs,
  track01T106Spec,
  track01T107Spec,
  track01T108Spec,
  track01T109Spec,
  track01T110Spec,
  ...track01T111T120Specs
].map(withTrack01StepNavigation);

export type Track01Phase1RuntimePresentation = {
  activity: ApprovedDraft["pedagogy"]["participation"];
  checkSequence: NonNullable<ApprovedDraft["checkSequence"]>;
  practice: ApprovedDraft["practice"];
  introComparison: (typeof approvedLessons)[number]["intro"];
  referenceAnswer: string | null;
  referenceFill: Record<string, string>;
  knowledgeDepth: (typeof approvedLessons)[number]["knowledgeDepth"];
  reviewItems: readonly string[];
  reviewLabels: { primary: string; secondary: string } | null;
  reviewCardFill: boolean;
  practiceHintsGrouped: boolean;
  practiceCopyValuesOnly: boolean;
  selfAssessment: readonly string[];
  triggerScenario?: string | null;
};

const presentationByLesson = new Map<string, Track01Phase1RuntimePresentation>(
  approvedLessons.map((item) => [
    item.draft.lessonSpec.lessonId,
    {
      activity: item.draft.pedagogy.participation,
      checkSequence: item.draft.checkSequence ?? [],
      practice: item.draft.practice!,
      introComparison: item.intro,
      referenceAnswer: item.draft.referenceAnswer,
      referenceFill: item.referenceFill,
      knowledgeDepth: item.knowledgeDepth,
      reviewItems: item.draft.review,
      reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
      reviewCardFill: true,
      practiceHintsGrouped: true,
      practiceCopyValuesOnly: true,
      selfAssessment: item.draft.selfAssessment
    }
  ])
);

const approvedT106Draft = track01T106Draft as unknown as ApprovedDraft;

presentationByLesson.set(approvedT106Draft.lessonSpec.lessonId, {
  activity: approvedT106Draft.pedagogy.participation,
  checkSequence: approvedT106Draft.checkSequence ?? [],
  practice: approvedT106Draft.practice,
  introComparison: track01T106Intro as unknown as Track01Phase1RuntimePresentation["introComparison"],
  referenceAnswer: approvedT106Draft.referenceAnswer,
  referenceFill: track01T106ReferenceFill,
  knowledgeDepth: track01T106KnowledgeDepth as unknown as Track01Phase1RuntimePresentation["knowledgeDepth"],
  reviewItems: approvedT106Draft.review,
  reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
  reviewCardFill: true,
  practiceHintsGrouped: true,
  practiceCopyValuesOnly: true,
  selfAssessment: approvedT106Draft.selfAssessment
});

const approvedT107Draft = track01T107Draft as unknown as ApprovedDraft;

presentationByLesson.set(approvedT107Draft.lessonSpec.lessonId, {
  activity: approvedT107Draft.pedagogy.participation,
  checkSequence: approvedT107Draft.checkSequence ?? [],
  practice: approvedT107Draft.practice,
  introComparison: track01T107Intro as unknown as Track01Phase1RuntimePresentation["introComparison"],
  referenceAnswer: approvedT107Draft.referenceAnswer,
  referenceFill: track01T107ReferenceFill,
  knowledgeDepth: track01T107KnowledgeDepth as unknown as Track01Phase1RuntimePresentation["knowledgeDepth"],
  reviewItems: approvedT107Draft.review,
  reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
  reviewCardFill: true,
  practiceHintsGrouped: true,
  practiceCopyValuesOnly: true,
  selfAssessment: approvedT107Draft.selfAssessment
});

const approvedT108Draft = track01T108Draft as unknown as ApprovedDraft;

presentationByLesson.set(approvedT108Draft.lessonSpec.lessonId, {
  activity: approvedT108Draft.pedagogy.participation,
  checkSequence: approvedT108Draft.checkSequence ?? [],
  practice: approvedT108Draft.practice,
  introComparison: track01T108Intro as unknown as Track01Phase1RuntimePresentation["introComparison"],
  referenceAnswer: approvedT108Draft.referenceAnswer,
  referenceFill: track01T108ReferenceFill,
  knowledgeDepth: track01T108KnowledgeDepth as unknown as Track01Phase1RuntimePresentation["knowledgeDepth"],
  reviewItems: approvedT108Draft.review,
  reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
  reviewCardFill: true,
  practiceHintsGrouped: true,
  practiceCopyValuesOnly: true,
  selfAssessment: approvedT108Draft.selfAssessment
});

const approvedT109Draft = track01T109Draft as unknown as ApprovedDraft;

presentationByLesson.set(approvedT109Draft.lessonSpec.lessonId, {
  activity: approvedT109Draft.pedagogy.participation,
  checkSequence: approvedT109Draft.checkSequence ?? [],
  practice: approvedT109Draft.practice,
  introComparison: track01T109Intro as unknown as Track01Phase1RuntimePresentation["introComparison"],
  referenceAnswer: approvedT109Draft.referenceAnswer,
  referenceFill: track01T109ReferenceFill,
  knowledgeDepth: track01T109KnowledgeDepth as unknown as Track01Phase1RuntimePresentation["knowledgeDepth"],
  reviewItems: approvedT109Draft.review,
  reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
  reviewCardFill: true,
  practiceHintsGrouped: true,
  practiceCopyValuesOnly: true,
  selfAssessment: approvedT109Draft.selfAssessment
});

const approvedT110Draft = track01T110Draft as unknown as ApprovedDraft;

presentationByLesson.set(approvedT110Draft.lessonSpec.lessonId, {
  activity: approvedT110Draft.pedagogy.participation,
  checkSequence: approvedT110Draft.checkSequence ?? [],
  practice: approvedT110Draft.practice,
  introComparison: track01T110Intro as unknown as Track01Phase1RuntimePresentation["introComparison"],
  referenceAnswer: approvedT110Draft.referenceAnswer,
  referenceFill: track01T110ReferenceFill,
  knowledgeDepth: track01T110KnowledgeDepth as unknown as Track01Phase1RuntimePresentation["knowledgeDepth"],
  reviewItems: approvedT110Draft.review,
  reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
  reviewCardFill: true,
  practiceHintsGrouped: true,
  practiceCopyValuesOnly: true,
  selfAssessment: approvedT110Draft.selfAssessment
});

for (const sourceDraft of track01T111T120Drafts) {
  const draft = sourceDraft as unknown as ApprovedDraft;
  const practice = draft.practice;
  if (!practice) throw new Error("TRACK01_T111_T120_PRACTICE_REQUIRED:" + draft.lessonSpec.lessonId);
  const referenceFill = Object.fromEntries(
    practice.instructions.map((instruction, index) => [
      instruction.key,
      practice.rubric[index]?.example ?? ""
    ])
  );
  presentationByLesson.set(draft.lessonSpec.lessonId, {
    activity: draft.pedagogy.participation,
    checkSequence: draft.checkSequence ?? [],
    practice,
    introComparison: track01T111T120Intros[draft.lessonSpec.lessonId] as unknown as Track01Phase1RuntimePresentation["introComparison"],
    referenceAnswer: draft.referenceAnswer,
    referenceFill,
    knowledgeDepth: track01T111T120KnowledgeDepth[draft.lessonSpec.lessonId] as unknown as Track01Phase1RuntimePresentation["knowledgeDepth"],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true,
    triggerScenario: track01T111T120TriggerScenarios[draft.lessonSpec.lessonId] ?? null,
    practiceHintsGrouped: true,
    practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment
  });
}

export function getTrack01Phase1RuntimePresentation(
  courseSlug: string,
  lessonSlug: string
) {
  if (courseSlug !== TRACK01_PHASE1_COURSE_SLUG) return null;
  return presentationByLesson.get(lessonSlug) ?? null;
}

function practiceSeedFor(draft: ApprovedDraft, required = true) {
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
    required,
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


export const track01T106RuntimeDefinition = (() => {
  const draft = track01T106Draft as unknown as ApprovedDraft;
  if (!draft.checkSequence) throw new Error("TRACK01_T106_CHECK_SEQUENCE_REQUIRED");
  return {
    canonicalId: "T1-06",
    lesson: lessonFromDraft(draft, "约 16 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice: practiceSeedFor(draft, false),
    referenceFill: track01T106ReferenceFill
  };
})();


export const track01T107RuntimeDefinition = (() => {
  const draft = track01T107Draft as unknown as ApprovedDraft;
  if (!draft.checkSequence) throw new Error("TRACK01_T107_CHECK_SEQUENCE_REQUIRED");
  return {
    canonicalId: "T1-07",
    lesson: lessonFromDraft(draft, "约 16 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice: practiceSeedFor(draft, false),
    referenceFill: track01T107ReferenceFill
  };
})();

export const track01T108RuntimeDefinition = (() => {
  const draft = track01T108Draft as unknown as ApprovedDraft;
  if (!draft.checkSequence) throw new Error("TRACK01_T108_CHECK_SEQUENCE_REQUIRED");
  return {
    canonicalId: "T1-08",
    lesson: lessonFromDraft(draft, "约 16 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice: practiceSeedFor(draft, false),
    referenceFill: track01T108ReferenceFill
  };
})();

export const track01T109RuntimeDefinition = (() => {
  const draft = track01T109Draft as unknown as ApprovedDraft;
  if (!draft.checkSequence) throw new Error("TRACK01_T109_CHECK_SEQUENCE_REQUIRED");
  return {
    canonicalId: "T1-09",
    lesson: lessonFromDraft(draft, "约 16 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice: practiceSeedFor(draft, false),
    referenceFill: track01T109ReferenceFill
  };
})();

export const track01T110RuntimeDefinition = (() => {
  const draft = track01T110Draft as unknown as ApprovedDraft;
  if (!draft.checkSequence) throw new Error("TRACK01_T110_CHECK_SEQUENCE_REQUIRED");
  return {
    canonicalId: "T1-10",
    lesson: lessonFromDraft(draft, "约 18 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice: practiceSeedFor(draft, false),
    referenceFill: track01T110ReferenceFill
  };
})();

const track01T111T120PhaseMeta = [
  { canonicalId: "T1-11", phase: 4, lessonOrder: 1 },
  { canonicalId: "T1-12", phase: 4, lessonOrder: 2 },
  { canonicalId: "T1-13", phase: 4, lessonOrder: 3 },
  { canonicalId: "T1-14", phase: 4, lessonOrder: 4 },
  { canonicalId: "T1-15", phase: 5, lessonOrder: 1 },
  { canonicalId: "T1-16", phase: 5, lessonOrder: 2 },
  { canonicalId: "T1-17", phase: 5, lessonOrder: 3 },
  { canonicalId: "T1-18", phase: 6, lessonOrder: 1 },
  { canonicalId: "T1-19", phase: 6, lessonOrder: 2 },
  { canonicalId: "T1-20", phase: 6, lessonOrder: 3 }
] as const;

export const track01T111T120RuntimeDefinitions = track01T111T120Drafts.map((sourceDraft, index) => {
  const draft = sourceDraft as unknown as ApprovedDraft;
  if (!draft.checkSequence) {
    throw new Error("TRACK01_T111_T120_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  }
  const practice = practiceSeedFor(draft, draft.lessonSpec.lessonType === "APPLICATION");
  const referenceFill = Object.fromEntries(
    practice.instructions.map((instruction, fieldIndex) => [
      instruction.key,
      practice.rubric[fieldIndex]?.example ?? ""
    ])
  );
  return {
    ...track01T111T120PhaseMeta[index],
    lesson: lessonFromDraft(draft, "约 16 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({
      ...check,
      status: "PUBLISHED" as const
    })),
    practice,
    referenceFill
  };
});
