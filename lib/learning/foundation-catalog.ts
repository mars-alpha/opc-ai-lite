export type FoundationCatalogStatus = "PLANNED" | "BRIEF_READY" | "IN_PRODUCTION" | "AVAILABLE";
export type FoundationAvailability = "LOCKED" | "COMING_SOON" | "RUNTIME_PREVIEW" | "AVAILABLE";
export type FoundationLessonType = "CONCEPT" | "APPLICATION" | "PRACTICE" | "PROJECT";

export type FoundationRuntimeMapping = {
  runtimeCourseSlug?: string;
  runtimeLessonId?: string;
};

export type FoundationCatalogLesson = FoundationRuntimeMapping & {
  lessonId: string;
  title: string;
  subtitle: string;
  learnerOutcome: string;
  lessonType: FoundationLessonType;
  estimatedMinutes: number;
  curriculumStatus: FoundationCatalogStatus;
  availability: FoundationAvailability;
  prerequisites: string[];
  badge: string;
  order: number;
};

export type FoundationCatalogStage = {
  stageId: string;
  title: string;
  promise: string;
  order: number;
  lessons: FoundationCatalogLesson[];
};

const runtimeAvailable = (runtimeLessonId: string) => ({
  curriculumStatus: "AVAILABLE" as const,
  availability: "AVAILABLE" as const,
  runtimeCourseSlug: "foundation-ai",
  runtimeLessonId
});

export const foundationCatalog: FoundationCatalogStage[] = [
  { stageId:"phase-1", title:"先学会和 AI 基本协作", promise:"从真实任务开始，依次掌握任务边界、提示词、上下文、迭代和结果核验。", order:1, lessons:[
    { lessonId:"t1-01-ai-task-fit", title:"AI 能帮什么，不能帮什么", subtitle:"先找到适合让 AI 协助的小步骤，同时保留事实核对和最终判断。", learnerOutcome:"能从真实内容任务中找出一个适合 AI 先帮忙的步骤。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:[], badge:"新手第一课", order:1, ...runtimeAvailable("t1-01-ai-task-fit") },
    { lessonId:"t1-02-clear-prompt", title:"提示词（Prompt）：把任务说清楚", subtitle:"把任务目标、使用对象、关键要求和输出形式说清楚。", learnerOutcome:"能把一个真实任务整理成清晰任务说明。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-01"], badge:"新手必修", order:2, ...runtimeAvailable("t1-02-clear-prompt") },
    { lessonId:"t1-03-minimum-context", title:"上下文（Context）：给 AI 足够但不过量的信息", subtitle:"只提供真正影响当前任务结果的必要信息。", learnerOutcome:"能为真实 AI 任务准备足够但不过量的信息。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-02"], badge:"新手必修", order:3, ...runtimeAvailable("t1-03-minimum-context") },
    { lessonId:"t1-04-purposeful-iteration", title:"迭代（Iteration）：把第一版结果改到可用", subtitle:"问题明确后，用具体要求只修改有问题的部分。", learnerOutcome:"能完成一次具体、可检查的定向修改。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-03"], badge:"应用", order:4, ...runtimeAvailable("t1-04-purposeful-iteration") },
    { lessonId:"t1-05-reliability-verification", title:"结果可靠性：什么时候必须核验", subtitle:"识别数字、日期、最新功能、来源和高后果信息的核验需求。", learnerOutcome:"能识别必须核验的陈述，并明确下一步应该查什么。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-04"], badge:"应用", order:5, ...runtimeAvailable("t1-05-reliability-verification") }
  ]},
  { stageId:"phase-2", title:"理解模型为什么这样工作", promise:"在已经会基本协作之后，再理解模型（Model）、词元（Token）与概率（Probability）生成的基本直觉。", order:2, lessons:[
    { lessonId:"t1-06-model-and-product", title:"模型（Model）与 AI 产品", subtitle:"理解核心模型和完整 AI 产品不是同一层。", learnerOutcome:"能区分模型能力与产品附加能力。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-05"], badge:"机制基础", order:1, ...runtimeAvailable("t1-06-model-and-product") },
    { lessonId:"t1-07-token-probability", title:"词元（Token）与概率（Probability）生成", subtitle:"理解 AI 为什么是在逐步生成，而不是查询一条固定答案。", learnerOutcome:"能建立词元与概率生成的基础直觉。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-06"], badge:"机制基础", order:2, ...runtimeAvailable("t1-07-token-probability") }
  ]},
  { stageId:"phase-3", title:"理解 AI 的记忆与知识", promise:"分清对话历史（Conversation History）、长期记忆（Memory）、知识库（Knowledge Base）、搜索（Search）与检索增强生成（RAG）。", order:3, lessons:[
    { lessonId:"t1-08-history-memory", title:"对话历史（Conversation History）与长期记忆（Memory）", subtitle:"当前对话和长期记忆不是同一种信息。", learnerOutcome:"能区分对话历史与长期记忆，并知道重要旧信息何时必须重新带入。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-07"], badge:"基础必修", order:1, ...runtimeAvailable("t1-08-history-memory") },
    { lessonId:"t1-09-knowledge-source", title:"知识库（Knowledge Base）与事实源（Source of Truth）", subtitle:"资料很多不等于事实可靠，先明确正式知识源。", learnerOutcome:"能为业务事实指定稳定、权威、可更新的正式来源和冲突规则。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-08"], badge:"基础必修", order:2, ...runtimeAvailable("t1-09-knowledge-source") },
    { lessonId:"t1-10-search-rag", title:"搜索（Search）与检索增强生成（RAG）", subtitle:"先找相关资料，再把必要证据交给模型回答。", learnerOutcome:"能判断什么时候需要先找证据，并能写出最小检索任务。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-09"], badge:"基础必修", order:3, ...runtimeAvailable("t1-10-search-rag") }
  ]},
  { stageId:"phase-4", title:"理解 AI 如何连接系统和工具", promise:"看懂应用程序编程接口（API）、结构化输出（Structured Output）、工具使用（Tool Use）与模型上下文协议（MCP）的基本角色。", order:4, lessons:[
    { lessonId:"t1-11-api", title:"应用程序编程接口（API）", subtitle:"理解系统之间怎样按约定交换请求和结果。", learnerOutcome:"能理解请求（Request）与响应（Response）的基本直觉。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-10"], badge:"基础必修", order:1, ...runtimeAvailable("t1-11-api") },
    { lessonId:"t1-12-structured-output", title:"结构化输出（Structured Output）与结构规则", subtitle:"系统需要稳定字段和明确结构，而不只是自由文本。", learnerOutcome:"能解释结构化输出与模式的作用。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-11"], badge:"基础必修", order:2, ...runtimeAvailable("t1-12-structured-output-schema") },
    { lessonId:"t1-13-function-tool", title:"函数调用（Function Calling）与工具使用（Tool Use）", subtitle:"模型可以决定调用什么，工具负责真正查询或执行。", learnerOutcome:"能区分文本生成、函数调用与工具使用。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-12"], badge:"基础必修", order:3, ...runtimeAvailable("t1-13-function-calling-tool-use") },
    { lessonId:"t1-14-mcp", title:"模型上下文协议（MCP）", subtitle:"理解 AI 为什么需要更标准地连接工具与资源。", learnerOutcome:"能解释模型上下文协议与应用程序编程接口、工具之间的关系。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-13"], badge:"基础必修", order:4, ...runtimeAvailable("t1-14-mcp") }
  ]},
  { stageId:"phase-5", title:"理解 AI 的复用与执行方式", promise:"分清技能（Skill）、工作流（Workflow）、自动化（Automation）与智能体（Agent）的角色。", order:5, lessons:[
    { lessonId:"t1-15-skill", title:"技能（Skill）", subtitle:"把经过验证的方法保存下来，让 AI 可以稳定复用。", learnerOutcome:"能区分提示词、技能与工具。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-14"], badge:"基础必修", order:1, ...runtimeAvailable("t1-15-skill") },
    { lessonId:"t1-16-workflow-automation", title:"工作流（Workflow）与自动化（Automation）", subtitle:"把一次任务变成可重复、可控制的执行流程。", learnerOutcome:"能解释工作流与自动化的基本关系。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-15"], badge:"基础必修", order:2, ...runtimeAvailable("t1-16-workflow-automation") },
    { lessonId:"t1-17-agent", title:"智能体（Agent）", subtitle:"理解根据目标和中间结果动态决定下一步的执行模式。", learnerOutcome:"能解释智能体的基本决策循环和边界。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-16"], badge:"基础必修", order:3, ...runtimeAvailable("t1-17-agent") }
  ]},
  { stageId:"phase-6", title:"理解现代 AI 能力与边界", promise:"理解多模态（Multimodal）、操作能力，以及隐私（Privacy）、权限（Permissions）与人工参与（Human-in-the-loop）。", order:6, lessons:[
    { lessonId:"t1-18-multimodal", title:"多模态（Multimodal）", subtitle:"文字、图片、语音、视频都可以成为 AI 的输入与输出。", learnerOutcome:"能判断不同任务适合哪些模态。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-17"], badge:"基础必修", order:1, ...runtimeAvailable("t1-18-multimodal") },
    { lessonId:"t1-19-coding-browser-computer", title:"编程（Coding）、浏览器（Browser）与计算机操作（Computer Use）", subtitle:"理解写代码、浏览网页和操作界面的不同执行层次。", learnerOutcome:"能区分编程、浏览器研究与计算机操作。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-18"], badge:"进阶基础", order:2, ...runtimeAvailable("t1-19-coding-browser-computer-use") },
    { lessonId:"t1-20-privacy-permissions-hitl", title:"隐私（Privacy）、权限（Permissions）与人工参与（Human-in-the-loop）", subtitle:"AI 能处理数据和执行动作，不等于应该拥有全部权限。", learnerOutcome:"能识别敏感数据、高权限操作和必须人工确认的场景。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-19"], badge:"基础必修", order:3, ...runtimeAvailable("t1-20-privacy-permissions-hitl") }
  ]}
];

export function isFoundationRuntimeLesson(
  lesson: FoundationCatalogLesson
): boolean {
  return (
    (lesson.availability === "AVAILABLE" || lesson.availability === "RUNTIME_PREVIEW") &&
    Boolean(lesson.runtimeCourseSlug) &&
    Boolean(lesson.runtimeLessonId)
  );
}

export const curriculumStatusLabel: Record<FoundationCatalogStatus,string> = {
  PLANNED:"规划中", BRIEF_READY:"准备中", IN_PRODUCTION:"制作中", AVAILABLE:"已开放"
};

export const lessonTypeLabel: Record<FoundationLessonType,string> = {
  CONCEPT:"理解", APPLICATION:"应用", PRACTICE:"实操", PROJECT:"项目"
};
