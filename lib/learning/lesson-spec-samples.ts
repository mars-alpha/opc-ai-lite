import type { LessonSpec } from "./lesson-spec";

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export const lessonSpecValidationSamples: LessonSpec[] = [
  {
    version: "0.2",
    courseSlug: "ai-literacy",
    lessonId: "memory-rag",
    title: "Memory 与 RAG",
    lessonType: "CONCEPT",
    learningObjectives: [
      "区分 Memory、Knowledge Base 与 RAG 的职责",
      "判断什么时候需要从外部知识源检索证据"
    ],
    knowledgePoints: ["memory", "knowledge-base", "rag"],
    prerequisites: ["what-is-genai", "context-token"],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "NONE",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: false,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK"],
    steps: [
      { id: "explain", kind: "EXPLAIN", title: "理解 Memory 与 RAG", objective: "知道二者分别解决什么问题。" },
      { id: "example", kind: "EXAMPLE", title: "客服知识为什么不能只靠 Memory", objective: "从真实案例理解外部知识检索的价值。" },
      { id: "check", kind: "CHECK", title: "判断该用 Memory 还是 RAG", objective: "正确区分持续状态与可追溯知识。" },
      { id: "review", kind: "REVIEW", title: "回顾三个概念边界", objective: "用自己的话复述 Memory / Knowledge Base / RAG。" },
      { id: "capability", kind: "CAPABILITY", title: "能力获得", objective: "面对场景能判断知识应该从哪里来。" }
    ],
    capabilityGain: ["能区分 Memory 与 RAG", "能判断何时需要外部知识与来源"],
    nextLessonValue: "继续理解 API、Tool、MCP 与 Agent 如何把模型连接到外部世界。",
    accessPresentation
  },
  {
    version: "0.2",
    courseSlug: "chatgpt-worker",
    lessonId: "writing-files",
    title: "写作与文件处理",
    lessonType: "APPLICATION",
    learningObjectives: [
      "把真实文件按字段先抽取再生成成品",
      "验证生成结果没有增加文件外事实"
    ],
    knowledgePoints: ["file-grounding", "structured-extraction", "audience-output"],
    prerequisites: ["task-brief", "search-research"],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "INDEPENDENT",
    realAiOperation: "REQUIRED",
    realAiEvidence: "ARTIFACT",
    referenceAnswerEnabled: true,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK", "PRACTICE", "REAL_AI"],
    steps: [
      { id: "explain", kind: "EXPLAIN", title: "先抽取，再生成", objective: "理解文件任务为什么要拆成两阶段。" },
      { id: "example", kind: "EXAMPLE", title: "会议记录变成项目更新", objective: "观察事实抽取如何降低幻觉和遗漏。" },
      { id: "check", kind: "CHECK", title: "理解检查", objective: "判断哪些信息必须来自原文件。" },
      { id: "practice", kind: "PRACTICE", title: "处理一份真实文件", objective: "用真实 AI 工具完成抽取、生成和人工核对。" },
      { id: "review", kind: "REVIEW", title: "回顾最终结果", objective: "检查事实来源、遗漏和输出适配。" },
      { id: "capability", kind: "CAPABILITY", title: "能力获得", objective: "能把一份真实文件稳定处理成可用成品。" }
    ],
    capabilityGain: ["能先抽取事实再生成", "能检查成品是否超出文件证据"],
    nextLessonValue: "把同样的结构化方法用于数据、表格和办公分析。",
    accessPresentation
  },
  {
    version: "0.2",
    courseSlug: "ai-workflow",
    lessonId: "task-decomposition",
    title: "任务拆解与节点设计",
    lessonType: "PRACTICE",
    learningObjectives: [
      "把一个重复任务拆成 4–7 个职责清晰的节点",
      "为每个节点定义输入、输出、处理方式和失败边界"
    ],
    knowledgePoints: ["workflow-node", "input-output", "control-boundary"],
    prerequisites: ["chatgpt-worker"],
    requiresExample: true,
    requiresCheck: false,
    practiceMode: "INDEPENDENT",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: true,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["PRACTICE"],
    steps: [
      { id: "explain", kind: "EXPLAIN", title: "把大任务拆成节点", objective: "理解为什么不能把完整流程塞进一个超级 Prompt。" },
      { id: "example", kind: "EXAMPLE", title: "内容发布流程拆解", objective: "观察生成、判断、人工审核为什么要分开。" },
      { id: "practice", kind: "PRACTICE", title: "画出自己的工作流", objective: "独立完成 4–7 个节点并标出处理方式。" },
      { id: "review", kind: "REVIEW", title: "检查节点边界", objective: "检查每个节点是否有明确输入、输出和失败处理。" },
      { id: "capability", kind: "CAPABILITY", title: "能力获得", objective: "能把重复任务变成可检查、可替换的工作流结构。" }
    ],
    capabilityGain: ["能拆分工作流节点", "能区分 AI / 规则 / 人工 / 工具节点"],
    nextLessonValue: "继续学习 Context Engineering，决定每个节点真正需要看到哪些信息。",
    accessPresentation
  }
];

export const currentLessonRuntimeCapabilities = {
  requiredCheckCompletionGate: true,
  requiredPracticeCompletionGate: true,
  publishedInteractiveLessonKeys: ["chatgpt-worker/task-brief"],
  supportedPracticeSubmissionKinds: ["TASK_BRIEF_V1", "STRUCTURED_TEXT_V1"],
  requiredRealAiCompletionGate: true,
  realAiEvidenceKinds: ["USER_CONFIRMATION", "SYSTEM_RESULT"] as string[]
} as const;

export type LessonRuntimeFinding = {
  courseSlug: string;
  lessonId: string;
  ready: boolean;
  blockers: string[];
};

export function validateCurrentRuntimeSupport(spec: LessonSpec): LessonRuntimeFinding {
  const blockers: string[] = [];

  const lessonKey = spec.courseSlug + "/" + spec.lessonId;
  const hasPublishedInteractiveData =
    currentLessonRuntimeCapabilities.publishedInteractiveLessonKeys.includes(
      lessonKey as (typeof currentLessonRuntimeCapabilities.publishedInteractiveLessonKeys)[number]
    );

  if (spec.completionGates.includes("CHECK") && !currentLessonRuntimeCapabilities.requiredCheckCompletionGate) {
    blockers.push("CHECK_COMPLETION_GATE_NOT_IMPLEMENTED");
  }
  if (spec.completionGates.includes("PRACTICE") && !currentLessonRuntimeCapabilities.requiredPracticeCompletionGate) {
    blockers.push("PRACTICE_COMPLETION_GATE_NOT_IMPLEMENTED");
  }

  if (spec.requiresCheck && !hasPublishedInteractiveData) {
    blockers.push("REQUIRED_CHECK_DATA_NOT_PROVISIONED");
  }
  if (spec.practiceMode !== "NONE" && !hasPublishedInteractiveData) {
    blockers.push("REQUIRED_PRACTICE_DATA_NOT_PROVISIONED");
  }

  if (spec.completionGates.includes("REAL_AI") && !currentLessonRuntimeCapabilities.requiredRealAiCompletionGate) {
    blockers.push("REAL_AI_COMPLETION_GATE_NOT_IMPLEMENTED");
  }
  if (spec.realAiEvidence !== "NONE" && !currentLessonRuntimeCapabilities.realAiEvidenceKinds.includes(spec.realAiEvidence)) {
    blockers.push("REAL_AI_EVIDENCE_NOT_IMPLEMENTED:" + spec.realAiEvidence);
  }
  return {
    courseSlug: spec.courseSlug,
    lessonId: spec.lessonId,
    ready: blockers.length === 0,
    blockers
  };
}
