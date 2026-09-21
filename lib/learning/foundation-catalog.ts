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

const planned = { curriculumStatus: "PLANNED" as const, availability: "COMING_SOON" as const };
const phase1Preview = {
  curriculumStatus: "IN_PRODUCTION" as const,
  availability: "RUNTIME_PREVIEW" as const,
  runtimeCourseSlug: "foundation-ai"
};

export const foundationCatalog: FoundationCatalogStage[] = [
  { stageId:"phase-1", title:"先学会和 AI 基本协作", promise:"从真实任务开始，依次掌握任务边界、提示词、上下文、迭代和结果核验。", order:1, lessons:[
    { lessonId:"t1-01-ai-task-fit", runtimeLessonId:"t1-01-ai-task-fit", title:"AI 能帮什么，不能帮什么", subtitle:"先找到适合让 AI 协助的小步骤，同时保留事实核对和最终判断。", learnerOutcome:"能从真实内容任务中找出一个适合 AI 先帮忙的步骤。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:[], badge:"新手第一课", order:1, ...phase1Preview },
    { lessonId:"t1-02-clear-prompt", runtimeLessonId:"t1-02-clear-prompt", title:"提示词（Prompt）：把任务说清楚", subtitle:"把任务目标、使用对象、关键要求和输出形式说清楚。", learnerOutcome:"能把一个真实任务整理成清晰任务说明。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-01"], badge:"新手必修", order:2, ...phase1Preview },
    { lessonId:"t1-03-minimum-context", runtimeLessonId:"t1-03-minimum-context", title:"上下文（Context）：给 AI 足够但不过量的信息", subtitle:"只提供真正影响当前任务结果的必要信息。", learnerOutcome:"能为真实 AI 任务准备足够但不过量的信息。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-02"], badge:"新手必修", order:3, ...phase1Preview },
    { lessonId:"t1-04-purposeful-iteration", runtimeLessonId:"t1-04-purposeful-iteration", title:"迭代（Iteration）：把第一版结果改到可用", subtitle:"问题明确后，用具体要求只修改有问题的部分。", learnerOutcome:"能完成一次具体、可检查的定向修改。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-03"], badge:"应用", order:4, ...phase1Preview },
    { lessonId:"t1-05-reliability-verification", runtimeLessonId:"t1-05-reliability-verification", title:"结果可靠性：什么时候必须核验", subtitle:"识别数字、日期、最新功能、来源和高后果信息的核验需求。", learnerOutcome:"能识别必须核验的陈述，并明确下一步应该查什么。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-04"], badge:"应用", order:5, ...phase1Preview }
  ]},
  { stageId:"phase-2", title:"理解模型为什么这样工作", promise:"在已经会基本协作之后，再理解模型、Token 与概率生成的基本直觉。", order:2, lessons:[
    { lessonId:"t1-06-model-and-product", title:"模型与 AI 产品", subtitle:"理解核心模型和完整 AI 产品不是同一层。", learnerOutcome:"能区分模型能力与产品附加能力。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-05"], badge:"机制基础", order:1, ...planned },
    { lessonId:"t1-07-token-probability", title:"Token 与概率生成", subtitle:"理解 AI 为什么是在逐步生成，而不是查询一条固定答案。", learnerOutcome:"能建立 Token 与概率生成的基础直觉。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-06"], badge:"机制基础", order:2, ...planned }
  ]},
  { stageId:"phase-3", title:"理解 AI 的记忆与知识", promise:"分清当前对话、长期记忆、知识库、搜索与 RAG。", order:3, lessons:[
    { lessonId:"t1-08-history-memory", title:"Conversation History 与 Memory", subtitle:"当前对话和长期记忆不是同一种信息。", learnerOutcome:"能区分 Conversation History 与长期 Memory。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-07"], badge:"基础必修", order:1, ...planned },
    { lessonId:"t1-09-knowledge-source", title:"Knowledge Base 与 Source of Truth", subtitle:"资料很多不等于事实可靠，先明确正式知识源。", learnerOutcome:"能理解 Knowledge Base 与正式事实源的区别。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-08"], badge:"基础必修", order:2, ...planned },
    { lessonId:"t1-10-search-rag", title:"Search 与 RAG", subtitle:"先找相关资料，再把必要证据交给模型回答。", learnerOutcome:"能解释 Retrieval → Context → Answer 的基本流程。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-09"], badge:"基础必修", order:3, ...planned }
  ]},
  { stageId:"phase-4", title:"理解 AI 如何连接系统和工具", promise:"看懂 API、Structured Output、Tool Use 与 MCP 的基本角色。", order:4, lessons:[
    { lessonId:"t1-11-api", title:"API", subtitle:"理解系统之间怎样按约定交换请求和结果。", learnerOutcome:"能理解 API 的 request / response 基本直觉。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-10"], badge:"基础必修", order:1, ...planned },
    { lessonId:"t1-12-structured-output", title:"Structured Output 与 Schema", subtitle:"系统需要稳定字段和明确结构，而不只是自由文本。", learnerOutcome:"能解释 Structured Output 与 Schema 的作用。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-11"], badge:"基础必修", order:2, ...planned },
    { lessonId:"t1-13-function-tool", title:"Function Calling 与 Tool Use", subtitle:"模型可以决定调用什么，工具负责真正查询或执行。", learnerOutcome:"能区分文本生成、Function Calling 与 Tool Use。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-12"], badge:"基础必修", order:3, ...planned },
    { lessonId:"t1-14-mcp", title:"MCP", subtitle:"理解 AI 为什么需要更标准地连接工具与资源。", learnerOutcome:"能解释 MCP 与 API、Tool 的关系。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-13"], badge:"基础必修", order:4, ...planned }
  ]},
  { stageId:"phase-5", title:"理解 AI 的复用与执行方式", promise:"分清 Skill、Workflow、Automation 与 Agent 的角色。", order:5, lessons:[
    { lessonId:"t1-15-skill", title:"Skill", subtitle:"把经过验证的方法保存下来，让 AI 可以稳定复用。", learnerOutcome:"能区分 Prompt、Skill 与 Tool。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-14"], badge:"基础必修", order:1, ...planned },
    { lessonId:"t1-16-workflow-automation", title:"Workflow 与 Automation", subtitle:"把一次任务变成可重复、可控制的执行流程。", learnerOutcome:"能解释 Workflow 与 Automation 的基本关系。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-15"], badge:"基础必修", order:2, ...planned },
    { lessonId:"t1-17-agent", title:"Agent", subtitle:"理解根据目标和中间结果动态决定下一步的执行模式。", learnerOutcome:"能解释 Agent 的基本决策循环和边界。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-16"], badge:"基础必修", order:3, ...planned }
  ]},
  { stageId:"phase-6", title:"理解现代 AI 能力与边界", promise:"理解多模态、操作能力，以及 Privacy / Permissions / Human-in-the-loop。", order:6, lessons:[
    { lessonId:"t1-18-multimodal", title:"Multimodal", subtitle:"文字、图片、语音、视频都可以成为 AI 的输入与输出。", learnerOutcome:"能判断不同任务适合哪些模态。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["T1-17"], badge:"基础必修", order:1, ...planned },
    { lessonId:"t1-19-coding-browser-computer", title:"Coding、Browser 与 Computer Use", subtitle:"理解写代码、浏览网页和操作界面的不同执行层次。", learnerOutcome:"能区分 Coding、Browser Research 与 Computer Use。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["T1-18"], badge:"进阶基础", order:2, ...planned },
    { lessonId:"t1-20-privacy-permissions-hitl", title:"Privacy、Permissions 与 Human-in-the-loop", subtitle:"AI 能处理数据和执行动作，不等于应该拥有全部权限。", learnerOutcome:"能识别敏感数据、高权限操作和必须人工确认的场景。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["T1-19"], badge:"基础必修", order:3, ...planned }
  ]}
];

export const curriculumStatusLabel: Record<FoundationCatalogStatus,string> = {
  PLANNED:"规划中", BRIEF_READY:"准备中", IN_PRODUCTION:"制作中", AVAILABLE:"已开放"
};

export const lessonTypeLabel: Record<FoundationLessonType,string> = {
  CONCEPT:"理解", APPLICATION:"应用", PRACTICE:"实操", PROJECT:"项目"
};
