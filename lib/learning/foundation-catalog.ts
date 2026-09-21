export type FoundationCatalogStatus = "PLANNED" | "BRIEF_READY" | "IN_PRODUCTION" | "AVAILABLE";
export type FoundationAvailability = "LOCKED" | "COMING_SOON" | "AVAILABLE";
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

export const foundationCatalog: FoundationCatalogStage[] = [
  { stageId:"foundation-1", title:"先认识 AI 怎么用", promise:"先知道 AI 能帮什么、为什么会出错，以及自己正在使用的是什么。", order:1, lessons:[
    { lessonId:"beginner-ai-use-cases", title:"AI 到底能帮我做什么", subtitle:"从真实工作任务开始，看见 AI 能帮你写、整理、总结、分析和找思路。", learnerOutcome:"能从自己的日常工作中找出 3 类适合 AI 协助的任务。", lessonType:"APPLICATION", estimatedMinutes:12, prerequisites:[], badge:"新手第一课", order:1, ...planned },
    { lessonId:"beginner-ai-result-quality", title:"为什么同一个 AI，有时好用、有时不好用", subtitle:"AI 不是读心术，你给出的目标和信息会直接影响结果。", learnerOutcome:"能发现一个模糊任务缺了什么信息，并主动补充。", lessonType:"APPLICATION", estimatedMinutes:12, prerequisites:["F1-01"], badge:"新手必修", order:2, ...planned },
    { lessonId:"beginner-ai-can-be-wrong", title:"AI 为什么会说错，而且还说得很像真的", subtitle:"说得流畅不代表事实正确，先学会什么时候不能直接相信。", learnerOutcome:"能识别事实、数字、最新信息等需要核实的结果。", lessonType:"CONCEPT", estimatedMinutes:12, prerequisites:["F1-01"], badge:"新手必修", order:3, ...planned },
    { lessonId:"beginner-ai-product-map", title:"AI 软件里的模型、搜索、文件和记忆是什么关系", subtitle:"先看懂你正在使用的是一个完整 AI 软件，不需要先学系统架构。", learnerOutcome:"能说出模型是核心能力之一，搜索、文件、记忆等属于产品额外能力。", lessonType:"CONCEPT", estimatedMinutes:12, prerequisites:["F1-01","F1-03"], badge:"新手必修", order:4, ...planned }
  ]},
  { stageId:"foundation-2", title:"学会和 AI 基本协作", promise:"学会把任务说清楚、把信息给够、逐轮改进并知道何时必须检查。", order:2, lessons:[
    { lessonId:"beginner-prompt", title:"Prompt：怎样把想做的事情说清楚", subtitle:"不学“神奇提示词”，先把目标、必要背景和结果要求说清楚。", learnerOutcome:"能把模糊要求改成 AI 更容易执行的任务说明。", lessonType:"APPLICATION", estimatedMinutes:16, prerequisites:["F1-01","F1-02"], badge:"应用", order:1, ...planned },
    { lessonId:"beginner-context", title:"Context：AI 只知道你这次给它看到的东西", subtitle:"你知道的背景，AI 不一定知道；需要时要把资料和背景给它。", learnerOutcome:"能判断 AI 还缺哪些当前任务信息。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F2-01"], badge:"新手必修", order:2, ...planned },
    { lessonId:"beginner-iteration", title:"第一次结果不对，怎样继续让 AI 改好", subtitle:"不满意时不要只重来，学会指出偏差、补信息、给示例和让 AI 提问。", learnerOutcome:"能把一次不满意的结果逐步改到可用。", lessonType:"APPLICATION", estimatedMinutes:16, prerequisites:["F2-01","F2-02"], badge:"应用", order:3, ...planned },
    { lessonId:"beginner-result-check", title:"AI 的结果什么时候能直接用，什么时候一定要检查", subtitle:"学会按事实、风险和可验证性决定检查力度。", learnerOutcome:"能判断哪些结果可以直接参考，哪些必须核实后再用。", lessonType:"APPLICATION", estimatedMinutes:16, prerequisites:["F1-03","F2-03"], badge:"应用", order:4, ...planned }
  ]},
  { stageId:"foundation-3", title:"再理解 AI 背后的基本机制", promise:"已经会用之后，再理解 Model、Training、Token 与 Context Window。", order:3, lessons:[
    { lessonId:"foundation-llm-model-vs-product-v2", title:"大语言模型是什么：Model 不等于 AI 软件", subtitle:"已经会用 AI 后，再理解“模型”和完整 AI 产品不是一回事。", learnerOutcome:"能区分核心 Model 与完整 AI 软件。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F1-04"], badge:"机制基础", order:1, ...planned },
    { lessonId:"foundation-training-inference-v2", title:"Training 与 Inference：模型怎样学会、又怎样被使用", subtitle:"把模型长期训练形成的能力和当前一次使用分开。", learnerOutcome:"能解释 Training 与 Inference 的基本区别。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F3-01"], badge:"机制基础", order:2, ...planned },
    { lessonId:"foundation-token-generation-v2", title:"Token 与概率生成：AI 为什么不是在查一条固定答案", subtitle:"到这里再理解 AI 是怎样一步步生成内容的。", learnerOutcome:"能理解 Token 与概率生成的基本直觉。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F3-01","F3-02"], badge:"机制基础", order:3, ...planned },
    { lessonId:"foundation-context-window-v2", title:"Context Window：AI 一次能看到的信息为什么有限", subtitle:"已经理解 Task Context 后，再理解“能看到多少”也有容量限制。", learnerOutcome:"能理解上下文容量有限以及长资料需要取舍。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F2-02","F3-03"], badge:"机制基础", order:4, ...planned }
  ]},
  { stageId:"foundation-4", title:"理解 AI 的记忆与知识", promise:"分清 Memory、Knowledge Base、Search、RAG 与语义检索。", order:4, lessons:[
    { lessonId:"foundation-history-memory", title:"Conversation History 与 Memory：AI 的“记住”有几种", subtitle:"当前对话、长期偏好和真正知识资料不是同一种“记忆”。", learnerOutcome:"能区分 Conversation History 与长期 Memory。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F3-02"], badge:"基础必修", order:1, ...planned },
    { lessonId:"foundation-knowledge-source-of-truth", title:"Knowledge Base 与 Source of Truth：AI 应该相信哪份资料", subtitle:"资料很多不等于知识可靠，关键是明确哪份信息才是正式事实源。", learnerOutcome:"能为业务知识问题指定可信 Source of Truth。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F4-01"], badge:"基础必修", order:2, ...planned },
    { lessonId:"foundation-search-rag", title:"Search 与 RAG：AI 怎样先找资料再回答", subtitle:"先找到相关资料，再把证据交给模型组织回答。", learnerOutcome:"能解释 Retrieval → Context → Answer 的基本流程。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F4-02","F2-03"], badge:"基础必修", order:3, ...planned },
    { lessonId:"foundation-embedding-vector-search", title:"Embedding 与 Vector Search：为什么系统能“按意思”找资料", subtitle:"不只按关键词匹配，还能按语义相似度寻找相关内容。", learnerOutcome:"能理解语义检索的直觉和局限。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F4-03"], badge:"进阶基础", order:4, ...planned }
  ]},
  { stageId:"foundation-5", title:"理解 AI 如何连接外部世界", promise:"看懂 API、Structured Output、Tool 与 MCP 怎样让 AI 获得外部能力。", order:5, lessons:[
    { lessonId:"foundation-api", title:"API：AI 产品怎样和其他系统交换信息", subtitle:"API 让 AI 产品与其他系统按约定交换请求和结果。", learnerOutcome:"能理解 API 的 request/response 直觉。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F1-02","F3-02"], badge:"基础必修", order:1, ...planned },
    { lessonId:"foundation-structured-output-schema", title:"Structured Output 与 Schema：为什么系统不能只接收一段自然语言", subtitle:"人可以读自由文本，系统更需要稳定字段和明确结构。", learnerOutcome:"能解释 Structured Output 与 Schema 的作用。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F5-01"], badge:"基础必修", order:2, ...planned },
    { lessonId:"foundation-function-calling-tool-use", title:"Function Calling 与 Tool Use：AI 怎样调用外部能力", subtitle:"模型可以决定需要做什么，Tool 才真正提供查询或执行能力。", learnerOutcome:"能区分文本生成、Function Calling 与 Tool Use。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F5-01","F5-02"], badge:"基础必修", order:3, ...planned },
    { lessonId:"foundation-mcp", title:"MCP：为什么 AI 需要统一连接工具与资源", subtitle:"当工具和数据越来越多，AI 需要更标准的方式发现和使用外部能力。", learnerOutcome:"能解释 MCP 与 API、Tool 的关系。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F5-03"], badge:"基础必修", order:4, ...planned }
  ]},
  { stageId:"foundation-6", title:"理解 AI 的复用与执行方式", promise:"分清 Skill、Workflow、Automation、Agent 与 Human-in-the-loop。", order:6, lessons:[
    { lessonId:"foundation-skill", title:"Skill：把可复用的方法交给 AI", subtitle:"不必每次重新教，把经过验证的方法保存下来重复使用。", learnerOutcome:"能区分 Prompt、Skill 与 Tool。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F3-01","F5-03"], badge:"基础必修", order:1, ...planned },
    { lessonId:"foundation-workflow", title:"Workflow：从一次任务变成可重复流程", subtitle:"把多个步骤、输入输出和检查点连起来，形成稳定工作方式。", learnerOutcome:"能解释 Workflow 的基本结构。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F6-01","F5-03"], badge:"基础必修", order:2, ...planned },
    { lessonId:"foundation-automation", title:"Automation：什么值得自动，什么不应该自动", subtitle:"自动化不是越多越好，稳定、可逆和风险可控才值得自动。", learnerOutcome:"能判断一个步骤是否适合自动化。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["F6-02","F2-04"], badge:"应用", order:3, ...planned },
    { lessonId:"foundation-agent", title:"Agent：从固定流程到动态决策循环", subtitle:"Agent 不只是“更聪明的聊天”，而是会根据目标和结果决定下一步。", learnerOutcome:"能解释 Agent 的基本决策循环。", lessonType:"CONCEPT", estimatedMinutes:18, prerequisites:["F5-03","F6-01","F6-02"], badge:"基础必修", order:4, ...planned },
    { lessonId:"foundation-workflow-vs-agent", title:"Workflow 与 Agent：什么时候用固定流程，什么时候需要动态决策", subtitle:"不是所有流程都需要 Agent，能固定就不要为了“智能”增加复杂度。", learnerOutcome:"能根据任务变化和风险选择 Workflow 或 Agent。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["F6-02","F6-04"], badge:"应用", order:5, ...planned },
    { lessonId:"foundation-human-in-the-loop", title:"Human-in-the-loop：为什么成熟 AI 系统不是“全自动”", subtitle:"自动执行前要知道什么时候必须停下来让人确认。", learnerOutcome:"能识别需要人工审批或异常升级的高风险步骤。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F6-03","F6-04"], badge:"基础必修", order:6, ...planned }
  ]},
  { stageId:"foundation-7", title:"理解现代 AI 能力与边界", promise:"理解多模态、操作能力、安全、Evaluation 与自动决策边界。", order:7, lessons:[
    { lessonId:"foundation-multimodal", title:"Multimodal：文字、图片、语音、视频怎样进入同一个 AI 系统", subtitle:"现代 AI 已经不只处理文字，不同模态可以一起成为任务输入和输出。", learnerOutcome:"能判断不同任务更适合哪种输入输出形式。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F1-02","F3-02"], badge:"基础必修", order:1, ...planned },
    { lessonId:"foundation-media-capabilities", title:"AI 图像、语音与视频：生成与理解分别能做什么", subtitle:"图像、语音和视频既可以被 AI 理解，也可以由 AI 生成。", learnerOutcome:"能为常见任务选择图像、语音或视频能力。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["F7-01"], badge:"应用", order:2, ...planned },
    { lessonId:"foundation-coding-browser-computer-use", title:"Coding、Browser 与 Computer Use：AI 怎样从回答走向操作", subtitle:"写代码、浏览网页和操作界面是三种不同层次的 AI 执行能力。", learnerOutcome:"能区分 Coding、Browser Research 与 Computer Use。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F5-03","F7-01"], badge:"进阶基础", order:3, ...planned },
    { lessonId:"foundation-privacy-security-permissions", title:"Privacy、Security 与 Permissions：哪些数据和动作不能随便交给 AI", subtitle:"AI 能处理数据不代表它应该获得所有数据和权限。", learnerOutcome:"能识别敏感信息和高权限操作场景。", lessonType:"CONCEPT", estimatedMinutes:16, prerequisites:["F5-01","F6-06"], badge:"基础必修", order:4, ...planned },
    { lessonId:"foundation-evaluation", title:"Evaluation 基础：怎样知道 AI 结果真的可用", subtitle:"“看起来不错”不是验收标准，要检查事实、任务完成度和稳定性。", learnerOutcome:"能用基础标准判断 AI 结果是否真的可用。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["F2-04","F6-03"], badge:"应用", order:5, ...planned },
    { lessonId:"foundation-ai-decision-boundary", title:"AI 决策边界：什么事情不应该直接交给 AI 自动决定", subtitle:"能生成建议不等于应该拥有最终决定权。", learnerOutcome:"能识别需要人工或 Core System 最终控制的动作。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["F6-06","F7-04","F7-05"], badge:"应用", order:6, ...planned }
  ]}
];

export const curriculumStatusLabel: Record<FoundationCatalogStatus,string> = {
  PLANNED:"规划中", BRIEF_READY:"准备中", IN_PRODUCTION:"制作中", AVAILABLE:"已开放"
};

export const lessonTypeLabel: Record<FoundationLessonType,string> = {
  CONCEPT:"理解", APPLICATION:"应用", PRACTICE:"实操", PROJECT:"项目"
};
