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
const briefReady = { curriculumStatus: "BRIEF_READY" as const, availability: "COMING_SOON" as const };
const inProduction = { curriculumStatus: "IN_PRODUCTION" as const, availability: "COMING_SOON" as const };

export const foundationCatalog: FoundationCatalogStage[] = [
  { stageId:"foundation-1", title:"认识 AI", promise:"建立 AI、模型、训练与生成机制的基本世界观。", order:1, lessons:[
    { lessonId:"foundation-ai-ml-generative-ai", title:"AI、机器学习与生成式 AI 到底是什么", subtitle:"先分清 AI、机器学习和生成式 AI，不把所有“智能功能”都当成同一种东西。", learnerOutcome:"能判断常见产品能力属于规则程序、机器学习还是生成式 AI。", lessonType:"CONCEPT", estimatedMinutes:12, prerequisites:[], badge:"基础必修", order:1, ...inProduction },
    { lessonId:"foundation-llm-model-vs-product", title:"大语言模型是什么：Model 不等于 AI 产品", subtitle:"理解你正在使用的是一个 AI 产品，而 Model 只是其中的核心能力之一。", learnerOutcome:"能区分 Model、AI App 和平台功能。", lessonType:"CONCEPT", estimatedMinutes:12, prerequisites:["F1-01"], badge:"基础必修", order:2, ...inProduction },
    { lessonId:"foundation-training-inference", title:"Training 与 Inference：模型是怎样“学会”再“使用”的", subtitle:"把“模型训练时学到什么”和“你现在问它问题时发生什么”分清楚。", learnerOutcome:"能解释 Training 与 Inference 的区别。", lessonType:"CONCEPT", estimatedMinutes:12, prerequisites:["F1-01","F1-02"], badge:"基础必修", order:3, ...inProduction },
    { lessonId:"foundation-generation-retrieval-rules", title:"AI 为什么不是数据库：生成、检索与确定性规则的区别", subtitle:"学会判断一个答案应该让模型生成、从资料中查找，还是交给普通程序计算。", learnerOutcome:"能判断 Generation、Retrieval、Deterministic Logic 哪种机制更适合。", lessonType:"CONCEPT", estimatedMinutes:15, prerequisites:["F1-01","F1-02","F1-03"], badge:"基础必修", order:4, ...inProduction }
  ]},
  { stageId:"foundation-2", title:"理解模型怎么工作", promise:"看懂 Token、Context Window、幻觉与模型可靠性。", order:2, lessons:[
    { lessonId:"foundation-token-generation", title:"Token 与概率生成：AI 怎样一句句生成答案", subtitle:"看懂模型如何把输入拆成 Token，并一步步生成下一段内容。", learnerOutcome:"能解释 Token 与概率生成的基本直觉。", lessonType:"CONCEPT", estimatedMinutes:12, prerequisites:["F1-02","F1-03"], badge:"基础必修", order:1, ...planned },
    { lessonId:"foundation-context-window", title:"Context Window：模型一次到底能看到多少", subtitle:"理解模型的“眼前信息”有范围，资料越多不一定越好。", learnerOutcome:"能判断长对话和长文件为什么受到 Context Window 限制。", lessonType:"CONCEPT", estimatedMinutes:12, prerequisites:["F2-01"], badge:"基础必修", order:2, ...planned },
    { lessonId:"foundation-hallucination-knowledge-limits", title:"幻觉与知识边界：为什么 AI 说得像真的也可能错", subtitle:"AI 可以表达得很自信，但表达流畅不等于事实正确。", learnerOutcome:"能识别需要查证的事实型输出。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F1-04","F2-01"], badge:"基础必修", order:3, ...planned },
    { lessonId:"foundation-model-reliability", title:"模型能力与可靠性：什么时候应该信、什么时候必须验证", subtitle:"不追求“永远正确”，而是学会按风险决定验证强度。", learnerOutcome:"能根据风险和错误成本决定 AI 结果如何复核。", lessonType:"APPLICATION", estimatedMinutes:16, prerequisites:["F2-02","F2-03"], badge:"应用", order:4, ...planned }
  ]},
  { stageId:"foundation-3", title:"学会和 AI 沟通", promise:"学会把任务、上下文、示例与反馈说清楚。", order:3, lessons:[
    { lessonId:"foundation-prompt", title:"Prompt：怎样把任务说清楚", subtitle:"把目标、背景、输入、限制和结果要求交代清楚，减少 AI 猜测。", learnerOutcome:"能把模糊需求改写成 AI 更容易执行的任务说明。", lessonType:"APPLICATION", estimatedMinutes:18, prerequisites:["F2-04"], badge:"应用", order:1, ...planned },
    { lessonId:"foundation-task-context", title:"Context：AI 当前到底看到了什么", subtitle:"Prompt 只是你说的话，Context 是模型这次任务真正能看到的全部信息。", learnerOutcome:"能区分 Prompt、历史、文件和工具结果如何进入当前任务。", lessonType:"CONCEPT", estimatedMinutes:14, prerequisites:["F2-02","F3-01"], badge:"基础必修", order:2, ...planned },
    { lessonId:"foundation-examples-structured-request", title:"Example 与 Structured Request：复杂要求怎样表达更稳定", subtitle:"当文字说明不够时，用示例、结构和格式减少理解偏差。", learnerOutcome:"能判断什么时候应该补示例、字段或结果格式。", lessonType:"APPLICATION", estimatedMinutes:16, prerequisites:["F3-01","F3-02"], badge:"应用", order:3, ...planned },
    { lessonId:"foundation-iteration-clarification", title:"Iteration 与 Clarification：第一次不对，怎样继续和 AI 合作", subtitle:"不满意时不要从头重来，要找到偏差并补充真正缺失的信息。", learnerOutcome:"能根据结果偏差继续追问并逐轮改进。", lessonType:"APPLICATION", estimatedMinutes:16, prerequisites:["F3-01","F3-03"], badge:"应用", order:4, ...planned }
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
