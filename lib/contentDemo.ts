export type KnowledgeItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  body?: string[];
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
    body: ["上下文能力升级最容易被误解为“能一次塞进去更多文字”。真正值得关注的是，它会改变资料处理、长文研究、跨文件比较和复杂任务拆解的方式。", "当模型能够稳定处理更长的上下文后，工作方式也要跟着变化：不是把所有资料一次性扔进去，而是重新设计资料结构、引用方式和检查节点。", "对学习者来说，最重要的不是记住一个新的上下文数字，而是理解什么时候应该利用长上下文、什么时候仍然需要检索、分段与人工复核。"],
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
    body: ["新工具出现时，最容易发生的错误是先迁移工具，再思考问题。更稳妥的方式是先确定它在工作流里承担什么角色：搜索、资料处理、生成、判断还是自动化。", "如果一个新工具不能明显改善现有流程中的成本、质量或速度，就没有必要因为“最新”而立刻切换。", "真正值得学习的是判断工具价值的方法，而不是不断追逐工具名称。这样即使工具继续变化，你仍然知道如何把它放进自己的工作流。"],
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
    body: ["AI 工作流最容易被忽略的一层不是自动化，而是 Evaluation。一个流程能够自动完成，并不代表输出已经可靠、稳定或值得交付。", "Evaluation 要回答几个问题：什么结果算成功？哪些错误必须拦截？哪些环节需要人工确认？失败之后如何记录并重新执行？", "当这些标准进入工作流，自动化才从“能跑”变成“可验证”。这也是为什么最新技术实操应该先让你理解评价机制，再进入正式课程或练习。"],
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
