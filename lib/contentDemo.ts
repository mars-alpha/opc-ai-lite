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
  },
  {
    id: "agent-tool-selection",
    title: "示例：Agent 什么时候应该调用工具？",
    category: "Agent",
    summary: "练习判断什么时候只靠模型推理就够了，什么时候必须调用搜索、文件、数据库或其他外部工具。",
    body: ["Agent 的关键并不是工具越多越好，而是能在正确的节点判断是否需要调用外部能力。", "当答案依赖实时信息、用户文件或外部系统状态时，工具调用通常比模型猜测更可靠。", "这个练习关注的是工具调用边界，而不是某一个具体 Agent 框架。"],
    destination: "PRACTICE_CANDIDATE",
    impactLabel: "值得做实操",
    stage: "AI Agent",
    stageLabel: "热点知识 · Agent",
    readingTime: "5 分钟"
  },
  {
    id: "structured-output-check",
    title: "示例：为什么 AI 输出最好先固定结构？",
    category: "结构化输出",
    summary: "练习把模糊回答要求改成明确字段，让结果更容易检查、复用和进入下一步流程。",
    body: ["当 AI 输出要继续进入表格、自动化或业务流程时，自由文本往往很难稳定复用。", "先定义字段、格式和缺失信息处理方式，可以显著降低后续人工整理成本。", "重点不是学习某一种 JSON 写法，而是理解结构化输出为什么有助于验证和复用。"],
    destination: "PRACTICE_CANDIDATE",
    impactLabel: "值得做实操",
    stage: "AI Work",
    stageLabel: "热点知识 · 工作应用",
    readingTime: "4 分钟"
  },
  {
    id: "rag-source-boundary",
    title: "示例：RAG 找到资料后，答案就一定可靠吗？",
    category: "RAG",
    summary: "练习区分“检索到了资料”和“资料真的支持结论”，避免把检索结果直接当成可靠答案。",
    body: ["RAG 能帮助模型找到相关资料，但相关不等于足以证明结论。", "仍然需要检查资料来源、时间、对象范围，以及模型是否超出了原文能支持的边界。", "这个练习把 RAG 从一个技术名词转成可以实际判断的证据问题。"],
    destination: "PRACTICE_CANDIDATE",
    impactLabel: "值得做实操",
    stage: "RAG",
    stageLabel: "热点知识 · RAG",
    readingTime: "5 分钟"
  },
  {
    id: "multimodal-brief",
    title: "示例：图片、文字一起交给 AI 时，任务怎么说清楚？",
    category: "多模态",
    summary: "练习把图片里的观察对象、任务目标和输出要求说清楚，而不是只上传图片后让 AI 自己猜。",
    body: ["多模态能力让 AI 可以同时理解图片和文字，但输入更多信息并不代表任务自然会变清楚。", "更有效的做法是明确告诉 AI 要观察什么、忽略什么、最终输出什么。", "这个练习关注多模态任务说明，而不是具体模型或图片工具。"],
    destination: "PRACTICE_CANDIDATE",
    impactLabel: "值得做实操",
    stage: "Multimodal",
    stageLabel: "热点知识 · 多模态",
    readingTime: "4 分钟"
  }
];

export const destinationLabel: Record<KnowledgeItem["destination"], string> = {
  DAILY_ITEM: "AI Daily",
  KNOWLEDGE_CAPSULE: "Knowledge Capsule",
  PRACTICE_CANDIDATE: "Practice Candidate",
  COURSE_UPDATE_CANDIDATE: "Course Update Candidate"
};
