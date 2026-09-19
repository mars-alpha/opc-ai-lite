export type KnowledgeItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  destination: "DAILY_ITEM" | "KNOWLEDGE_CAPSULE" | "PRACTICE_CANDIDATE" | "COURSE_UPDATE_CANDIDATE";
  impactLabel: string;
  stage: string;
  stageLabel: string;
  courseSlug?: string;
  lessonId?: string;
  readingTime: string;
  practiceId?: string;
};

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: "context-window-change",
    title: "示例：上下文能力升级，真正影响的是什么？",
    category: "模型与能力",
    summary: "重点不是参数变大，而是理解更长上下文会如何改变文件处理、研究和工作流设计。",
    destination: "COURSE_UPDATE_CANDIDATE",
    impactLabel: "可能影响课程",
    stage: "AI Literacy",
    stageLabel: "Stage 1 · 看懂 AI",
    courseSlug: "ai-literacy",
    lessonId: "context-token",
    readingTime: "5 分钟"
  },
  {
    id: "workflow-tools",
    title: "示例：新的 AI 工具出现后，先别急着换工具",
    category: "工具与应用",
    summary: "先判断它解决的是搜索、文件、生成还是自动化节点，再决定是否值得进入自己的工作流。",
    destination: "KNOWLEDGE_CAPSULE",
    impactLabel: "形成知识胶囊",
    stage: "AI Worker",
    stageLabel: "Stage 2 · 用好 AI",
    courseSlug: "chatgpt-worker",
    lessonId: "task-brief",
    readingTime: "4 分钟"
  },
  {
    id: "evaluation-practice",
    title: "示例：AI 工作流为什么必须有 Evaluation？",
    category: "工作流",
    summary: "能自动运行不代表有效。真正稳定的工作流需要成功标准、失败记录和人工检查边界。",
    destination: "PRACTICE_CANDIDATE",
    impactLabel: "值得做实操",
    stage: "AI Workflow",
    stageLabel: "Stage 3 · 工作流",
    courseSlug: "ai-workflow",
    lessonId: "evaluation",
    readingTime: "6 分钟",
    practiceId: "practice_latest_evaluation_workflow"
  }
];

export const destinationLabel: Record<KnowledgeItem["destination"], string> = {
  DAILY_ITEM: "AI Daily",
  KNOWLEDGE_CAPSULE: "Knowledge Capsule",
  PRACTICE_CANDIDATE: "Practice Candidate",
  COURSE_UPDATE_CANDIDATE: "Course Update Candidate"
};
