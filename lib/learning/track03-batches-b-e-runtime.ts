import { courseBuilderCheckSequenceToRuntimeSeeds, type CourseBuilderBuildDraft } from "./course-builder";
import { TRACK03_RUNTIME_COURSE_SLUG, track03BatchACourse } from "./track03-batch-a-runtime";
import { track03BatchBDrafts, track03BatchBIntroComparisons, track03BatchBKnowledgeDepth, track03BatchBTriggerScenarios } from "./course-content/track03-batch-b";
import { track03BatchCDrafts, track03BatchCIntroComparisons, track03BatchCKnowledgeDepth, track03BatchCTriggerScenarios } from "./course-content/track03-batch-c";
import { track03BatchDDrafts, track03BatchDIntroComparisons, track03BatchDKnowledgeDepth, track03BatchDTriggerScenarios } from "./course-content/track03-batch-d";
import { track03BatchEDrafts, track03BatchEIntroComparisons, track03BatchEKnowledgeDepth, track03BatchETriggerScenarios } from "./course-content/track03-batch-e";

type ApprovedDraft = CourseBuilderBuildDraft;
const remainingDrafts = [...track03BatchBDrafts, ...track03BatchCDrafts, ...track03BatchDDrafts, ...track03BatchEDrafts] as ApprovedDraft[];

function lessonFromDraft(draft: ApprovedDraft, duration: string) {
  return {
    id: draft.lessonSpec.lessonId, title: draft.lessonSpec.title, duration,
    summary: draft.content.summary, plainExplanation: draft.content.plainExplanation,
    whyItMatters: draft.content.whyItMatters, points: [...draft.content.points],
    content: [...draft.content.content], example: { ...draft.content.example }, guides: [],
    practice: { goal: draft.practice?.goal ?? "", steps: draft.practice?.instructions.map((item) => item.prompt) ?? [], acceptance: draft.practice?.rubric.map((item) => item.label) ?? [] },
    mistakes: [...draft.content.mistakes], related: [...draft.content.related]
  };
}

function practiceSeedFor(draft: ApprovedDraft) {
  if (!draft.practice) throw new Error("TRACK03_PRACTICE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    id: "practice_ai_growth_" + draft.lessonSpec.lessonId.replace(/-/g, "_"),
    title: draft.practice.title, goal: draft.practice.goal, instructions: draft.practice.instructions, hints: draft.practice.hints,
    submissionSchema: { kind: "STRUCTURED_TEXT_V1" as const, fields: draft.practice.instructions.map((item) => ({ key: item.key, label: item.label, minLength: 1, maxLength: 3000 })) },
    rubric: draft.practice.rubric, passScore: draft.practice.passScore, required: true, status: "PUBLISHED" as const
  };
}

function referenceFillFor(draft: ApprovedDraft) {
  if (!draft.practice) return {};
  return Object.fromEntries(draft.practice.instructions.map((instruction, index) => [instruction.key, draft.practice?.rubric[index]?.example ?? ""]));
}

export const track03BatchesBERuntimeDefinitions = remainingDrafts.map((draft, index) => {
  if (!draft.checkSequence) throw new Error("TRACK03_REMAINING_CHECK_SEQUENCE_REQUIRED:" + draft.lessonSpec.lessonId);
  return {
    canonicalId: "T3-" + String(index + 4).padStart(2, "0"),
    lesson: lessonFromDraft(draft, "约 18 分钟"),
    spec: draft.lessonSpec,
    checks: courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map((check) => ({ ...check, status: "PUBLISHED" as const })),
    practice: practiceSeedFor(draft),
    referenceFill: referenceFillFor(draft)
  };
});

export const track03FullCourse = {
  ...track03BatchACourse,
  duration: "约 4.5 小时",
  outcome: "能把真实业务对象、内容、渠道、线索、销售、客服与数据复盘连接成一套可持续改进的 AI 推广运营方法。",
  modules: [
    ...track03BatchACourse.modules,
    { id: "content", title: "做成内容资产", description: "从真实业务问题出发，持续找到值得做的选题，并把核心内容复用成多种内容资产。", lessons: track03BatchesBERuntimeDefinitions.slice(0, 3).map((item) => item.lesson) },
    { id: "leads", title: "发布并承接线索", description: "让内容适配不同渠道，并把曝光自然推进到下一步行动和有效线索。", lessons: track03BatchesBERuntimeDefinitions.slice(3, 6).map((item) => item.lesson) },
    { id: "sales", title: "推进销售", description: "先理解客户背景和真实需求，再处理跟进、异议和下一步推进。", lessons: track03BatchesBERuntimeDefinitions.slice(6, 8).map((item) => item.lesson) },
    { id: "service", title: "做好客服", description: "让回复有依据、有边界，知道什么时候可以回答、什么时候必须转人工。", lessons: track03BatchesBERuntimeDefinitions.slice(8, 10).map((item) => item.lesson) },
    { id: "review", title: "用数据复盘增长", description: "把内容、线索、销售和客服数据连起来，判断这一轮哪里有效、下一轮该改什么。", lessons: track03BatchesBERuntimeDefinitions.slice(10).map((item) => item.lesson) }
  ]
};

const triggerMaps = { ...track03BatchBTriggerScenarios, ...track03BatchCTriggerScenarios, ...track03BatchDTriggerScenarios, ...track03BatchETriggerScenarios } as Record<string, string>;

export function getTrack03BatchesBERuntimePresentation(courseSlug: string, lessonSlug: string) {
  if (courseSlug !== TRACK03_RUNTIME_COURSE_SLUG) return null;
  const draft = remainingDrafts.find((item) => item.lessonSpec.lessonId === lessonSlug);
  if (!draft) return null;
  return {
    activity: { ...draft.pedagogy.participation, fields: draft.practice?.instructions ?? [] },
    introComparison:
      track03BatchBIntroComparisons[lessonSlug as keyof typeof track03BatchBIntroComparisons] ??
      track03BatchCIntroComparisons[lessonSlug as keyof typeof track03BatchCIntroComparisons] ??
      track03BatchDIntroComparisons[lessonSlug as keyof typeof track03BatchDIntroComparisons] ??
      track03BatchEIntroComparisons[lessonSlug as keyof typeof track03BatchEIntroComparisons],
    referenceAnswer: draft.referenceAnswer,
    referenceFill: referenceFillFor(draft),
    knowledgeDepth:
      track03BatchBKnowledgeDepth[lessonSlug as keyof typeof track03BatchBKnowledgeDepth] ??
      track03BatchCKnowledgeDepth[lessonSlug as keyof typeof track03BatchCKnowledgeDepth] ??
      track03BatchDKnowledgeDepth[lessonSlug as keyof typeof track03BatchDKnowledgeDepth] ??
      track03BatchEKnowledgeDepth[lessonSlug as keyof typeof track03BatchEKnowledgeDepth],
    reviewItems: draft.review,
    reviewLabels: { primary: "AI适合做什么", secondary: "AI不应该替你做什么" },
    reviewCardFill: true, practiceHintsGrouped: true, practiceCopyValuesOnly: true,
    selfAssessment: draft.selfAssessment, triggerScenario: triggerMaps[lessonSlug] ?? null
  };
}
