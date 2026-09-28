import {
  foundationCatalog,
  type FoundationAvailability,
  type FoundationCatalogLesson,
  type FoundationCatalogStage,
  type FoundationCatalogStatus,
  type FoundationLessonType
} from "./foundation-catalog";

export type LearningTrackSlug = "foundation-ai" | "ai-work" | "ai-growth" | "ai-workflow";
export type TrackCatalogLesson = FoundationCatalogLesson;
export type TrackCatalogStage = FoundationCatalogStage;

export type LearningTrackCatalog = {
  slug: LearningTrackSlug;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  stageLabel: string;
  stages: TrackCatalogStage[];
};

function plannedLesson(
  lessonId: string,
  title: string,
  subtitle: string,
  order: number,
  prerequisites: string[],
  status: FoundationCatalogStatus = "PLANNED",
  type: FoundationLessonType = "APPLICATION",
  estimatedMinutes = 18
): TrackCatalogLesson {
  return {
    lessonId,
    title,
    subtitle,
    learnerOutcome: subtitle,
    lessonType: type,
    estimatedMinutes,
    curriculumStatus: status,
    availability: "COMING_SOON" satisfies FoundationAvailability,
    prerequisites,
    badge: status === "IN_PRODUCTION" ? "准备开放" : "规划中",
    order
  };
}

export const track02Catalog: TrackCatalogStage[] = [
  {
    stageId: "work-research",
    title: "会找答案",
    promise: "需要资料时，知道怎么把问题问清楚、判断证据，并处理多个来源的差异。",
    order: 1,
    lessons: [
      { ...plannedLesson("t2-01-research-question-scope", "问题太大？先把它变成真正能查清楚的问题", "把模糊工作主题整理成可研究、可核验的问题。", 1, ["T1-02", "T1-03", "T1-05"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-01-research-question-scope", badge: "已上线" },
      { ...plannedLesson("t2-02-source-evidence-judgment", "AI 给了来源，怎么判断这些证据真的靠得住", "判断来源实际能证明什么、适用于谁，以及还缺什么。", 2, ["T2-01", "T1-05", "T1-09", "T1-10"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-02-source-evidence-judgment", badge: "已上线" },
      { ...plannedLesson("t2-03-multi-source-synthesis", "几个来源说法不一样，怎么判断差异到底在哪里", "先对齐定义、对象、时间和方法，再形成有边界的综合判断。", 3, ["T2-01", "T2-02"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-03-multi-source-synthesis", badge: "已上线" }
    ]
  },
  {
    stageId: "work-deliverable",
    title: "会做成品",
    promise: "把已经查清的信息，变成适合真实对象和用途的可交付结果。",
    order: 2,
    lessons: [
      { ...plannedLesson("t2-04-audience-purpose", "同样的信息，怎么针对不同人表达", "根据对象、目的和预期行动调整表达。", 1, ["T2-03"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-04-audience-purpose", badge: "已上线" },
      { ...plannedLesson("t2-05-source-to-deliverable", "一堆资料，怎么变成能交付的成品", "把来源、结构、草稿和交付结果连起来。", 2, ["T2-04"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-05-source-to-deliverable", badge: "已上线" },
      { ...plannedLesson("t2-06-editorial-revision", "AI 已经写出来了，但“不好”，到底怎么改", "先诊断问题层级，再做有目标的修改。", 3, ["T2-05"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-06-editorial-revision", badge: "已上线" }
    ]
  },
  {
    stageId: "work-documents",
    title: "会处理复杂资料",
    promise: "文件多、内容长时，仍然知道怎样定位、比较，并把信息推进成行动。",
    order: 3,
    lessons: [
      { ...plannedLesson("t2-07-targeted-document-reading", "文件太长，怎么快速找到真正需要的信息", "围绕目标字段和问题做定向阅读。", 1, ["T2-06"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-07-targeted-document-reading", badge: "已上线" },
      { ...plannedLesson("t2-08-cross-document-comparison", "多份文件怎么比较，差异在哪里", "先定义比较维度，再抽取、对齐和解释差异。", 2, ["T2-07"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-08-cross-document-comparison", badge: "已上线" },
      { ...plannedLesson("t2-09-information-to-action", "看完资料以后，下一步到底该做什么", "把信息整理成决定、行动、负责人、时间和风险。", 3, ["T2-08"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-09-information-to-action", badge: "已上线" }
    ]
  },
  {
    stageId: "work-data",
    title: "会看数据",
    promise: "面对表格和数字时，先把口径与质量搞清楚，再让 AI 帮你形成可信判断。",
    order: 4,
    lessons: [
      { ...plannedLesson("t2-10-metric-definition", "一个数字到底是什么意思，先把口径搞清楚", "明确指标对象、范围、时间和计算定义。", 1, ["T2-09"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-10-metric-definition", badge: "已上线" },
      { ...plannedLesson("t2-11-data-quality", "数据很乱，先别急着让 AI 分析", "先判断缺失、重复、格式、单位和异常。", 2, ["T2-10"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-11-data-quality", badge: "已上线" },
      { ...plannedLesson("t2-12-data-analysis", "怎么从数据里得到一个可信的判断", "把问题、指标、计算、比较、解释和核验串起来。", 3, ["T2-10", "T2-11"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-12-data-analysis", badge: "已上线" }
    ]
  },
  {
    stageId: "work-knowledge",
    title: "会积累知识",
    promise: "把值得复用的资料和经验留下来，并知道以后怎样找到可信版本。",
    order: 5,
    lessons: [
      { ...plannedLesson("t2-13-knowledge-capture", "哪些东西值得留下来，哪些不用存", "区分临时信息与值得沉淀的稳定知识。", 1, ["T2-12"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-13-knowledge-capture", badge: "已上线" },
      { ...plannedLesson("t2-14-knowledge-organization", "怎么让知识以后找得到，而且知道哪份可信", "用主题、来源、日期、版本和事实源维护知识。", 2, ["T2-13"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-14-knowledge-organization", badge: "已上线" }
    ]
  },
  {
    stageId: "work-reuse",
    title: "会复用方法",
    promise: "把一次做成功的真实工作提炼成以后可以继续使用的方法。",
    order: 6,
    lessons: [
      { ...plannedLesson("t2-15-reusable-method", "这次做得不错，怎么让下次不用重新来", "把成功过程留下成模板、检查清单或轻量流程。", 1, ["T2-14"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-15-reusable-method", badge: "已上线" }
    ]
  }
];



export const track03Catalog: TrackCatalogStage[] = [
  {
    stageId: "growth-audience",
    title: "找对业务对象",
    promise: "先找清楚重点服务谁、什么时候真的有需求，以及怎样把最重要的价值说清楚。",
    order: 1,
    lessons: [
      { ...plannedLesson("t3-01-icp-audience-fit", "不是“所有人”都要做，先找清楚你到底想服务谁", "从几类可能的读者或客户中，选出现在最值得先服务的一类。", 1, ["T2-01", "T2-04", "T2-12"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-01-icp-audience-fit", badge: "已上线" },
      { ...plannedLesson("t3-02-use-case-fit", "用户为什么现在会在意这件事", "找出对方在什么情况下真的会需要帮助，以及现在最值得回应哪个问题。", 2, ["T3-01"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-02-use-case-fit", badge: "已上线" },
      { ...plannedLesson("t3-03-message-hierarchy", "你的信息为什么值得对方继续看", "把一堆功能和卖点重新排出先后，让读者先看到最重要的价值。", 3, ["T3-01", "T3-02"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-03-message-hierarchy", badge: "已上线" }
    ]
  },
  {
    stageId: "growth-content",
    title: "做成内容资产",
    promise: "从真实业务问题出发，持续找到值得做的选题，并把核心内容复用成多种内容资产。",
    order: 2,
    lessons: [
      { ...plannedLesson("t3-04-topic-opportunity", "选什么题，才不是“为了更新而更新”", "判断哪些主题真正值得投入内容生产。", 4, ["T3-01", "T3-02", "T3-03"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-04-topic-opportunity", badge: "已上线" },
      { ...plannedLesson("t3-05-content-system", "怎么把零散选题变成持续内容体系", "把零散主题组织成可以长期持续的内容主线。", 5, ["T3-04"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-05-content-system", badge: "已上线" },
      { ...plannedLesson("t3-06-multimodal-reuse", "一份核心内容，怎么变成文字、图片、视频等多种资产", "从一份核心内容出发，规划多种表达形式和复用方式。", 6, ["T3-05"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-06-multimodal-reuse", badge: "已上线" }
    ]
  },
  {
    stageId: "growth-leads",
    title: "发布并承接线索",
    promise: "让内容适配不同渠道，并把曝光自然推进到下一步行动和有效线索。",
    order: 3,
    lessons: [
      { ...plannedLesson("t3-07-channel-adaptation", "同一内容为什么不能原样发到所有渠道", "理解不同渠道承担的角色，并调整内容表达。", 7, ["T3-03", "T3-06"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-07-channel-adaptation", badge: "已上线" },
      { ...plannedLesson("t3-08-conversion-path", "有曝光以后，怎么让用户知道下一步做什么", "设计自然的下一步，让内容从被看见走向进一步行动。", 8, ["T3-07"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-08-conversion-path", badge: "已上线" },
      { ...plannedLesson("t3-09-lead-priority", "来了线索以后，先跟谁、怎么判断价值", "判断线索质量和优先级，把有限精力放在更值得跟进的人身上。", 9, ["T3-08"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-09-lead-priority", badge: "已上线" }
    ]
  },
  {
    stageId: "growth-sales",
    title: "推进销售",
    promise: "先理解客户背景和真实需求，再处理跟进、异议和下一步推进。",
    order: 4,
    lessons: [
      { ...plannedLesson("t3-10-customer-context", "跟进客户前，先把背景和真实需求搞清楚", "把零散客户信息整理成清楚的背景和需求判断。", 10, ["T3-09"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-10-customer-context", badge: "已上线" },
      { ...plannedLesson("t3-11-sales-follow-up", "客户没回复或有异议，下一步怎么跟进", "根据客户状态和真实顾虑，决定下一次跟进怎么做。", 11, ["T3-10"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-11-sales-follow-up", badge: "已上线" }
    ]
  },
  {
    stageId: "growth-service",
    title: "做好客服",
    promise: "让回复有依据、有边界，知道什么时候可以回答、什么时候必须转人工。",
    order: 5,
    lessons: [
      { ...plannedLesson("t3-12-service-response", "客服回复为什么必须先找到依据", "基于可信资料回答客户问题，不把猜测当成事实。", 12, ["T3-11"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-12-service-response", badge: "已上线" },
      { ...plannedLesson("t3-13-service-escalation", "什么情况不能继续自动回答，必须停下来转人工", "识别高风险和不确定场景，及时停止自动回答并升级处理。", 13, ["T3-12"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-13-service-escalation", badge: "已上线" }
    ]
  },
  {
    stageId: "growth-review",
    title: "用数据复盘增长",
    promise: "把内容、线索、销售和客服数据连起来，判断这一轮哪里有效、下一轮该改什么。",
    order: 6,
    lessons: [
      { ...plannedLesson("t3-14-operations-metrics", "内容、线索、销售、客服到底看哪些数字", "建立从内容到业务结果的关键指标关系。", 14, ["T3-01", "T3-13"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-14-operations-metrics", badge: "已上线" },
      { ...plannedLesson("t3-15-growth-review", "这轮做完以后，下一轮到底改什么", "根据结果、问题和反馈，决定下一轮最值得改进的动作。", 15, ["T3-14"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-growth", runtimeLessonId: "t3-15-growth-review", badge: "已上线" }
    ]
  }
];


export const track04Catalog: TrackCatalogStage[] = [
  { stageId:"workflow-suitability", title:"先判断什么值得系统化", promise:"先选对值得系统化的真实业务链，避免把混乱直接自动化。", order:1, lessons:[
    { ...plannedLesson("t4-01-automation-suitability","哪些重复工作值得系统化，哪些反而不该动","判断重复、稳定、价值和风险，决定现在是否值得系统化。",1,["T3-15"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-01-automation-suitability", badge:"已上线" }
  ]},
  { stageId:"workflow-decomposition", title:"把人工流程拆清楚", promise:"把人的隐含做法拆成系统能理解的步骤，并定义什么时候启动和停止。", order:2, lessons:[
    { ...plannedLesson("t4-02-workflow-decomposition","一条人工流程，怎么拆成系统真正能执行的步骤","把输入、处理、判断、输出和检查拆清楚。",2,["T4-01"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-02-workflow-decomposition", badge:"已上线" },
    { ...plannedLesson("t4-03-trigger-boundary","系统什么时候开始做，什么条件下才应该启动","定义启动事件、必要条件、不启动条件和最小输入。",3,["T4-02"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-03-trigger-boundary", badge:"已上线" },
    { ...plannedLesson("t4-04-workflow-state","流程跑到哪一步了，系统怎么知道当前状态","理解状态与进度怎样让流程知道自己做到哪里。",4,["T4-03"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-04-workflow-state", badge:"已上线" },
    { ...plannedLesson("t4-05-stop-failure-boundary","什么时候继续、停止，什么时候算失败","定义继续、完成、停止和失败分支。",5,["T4-04"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-05-stop-failure-boundary", badge:"已上线" }
  ]},
  { stageId:"workflow-context", title:"让每一步拿到正确的信息", promise:"控制每一步看到的信息、责任和交接结果。", order:3, lessons:[
    { ...plannedLesson("t4-06-node-context","每一步到底需要看到哪些信息","设计节点需要的最小充分上下文。",6,["T4-05"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-06-node-context", badge:"已上线" },
    { ...plannedLesson("t4-07-responsibility-boundary","哪些事交给 AI，哪些必须用确定规则","区分 AI、代码、工具和人工的责任。",7,["T4-06"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-07-responsibility-boundary", badge:"已上线" },
    { ...plannedLesson("t4-08-structured-handoff","上一步的结果，怎么稳定交给下一步继续用","用结构化输入输出让步骤稳定交接。",8,["T4-07"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-08-structured-handoff", badge:"已上线" }
  ]},
  { stageId:"workflow-integration", title:"把外部能力接进流程", promise:"判断什么时候连接接口、工具和模型上下文协议（MCP）。", order:4, lessons:[
    { ...plannedLesson("t4-09-external-integration","要连接外部系统时，接口、工具和模型上下文协议（MCP）怎么选","设计外部能力连接方式和输入输出边界。",9,["T4-08"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-09-external-integration", badge:"已上线" }
  ]},
  { stageId:"workflow-reliability", title:"让流程出错时仍然可控", promise:"处理失败、重复执行、高风险动作和人工确认。", order:5, lessons:[
    { ...plannedLesson("t4-10-failure-recovery","外部调用超时或失败，流程应该怎么处理","设计超时、重试、停止和人工恢复。",10,["T4-09"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-10-failure-recovery", badge:"已上线" },
    { ...plannedLesson("t4-11-idempotency","同一个动作执行两次，怎么避免造成两份结果","理解幂等和重复执行保护。",11,["T4-10"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-11-idempotency", badge:"已上线" },
    { ...plannedLesson("t4-12-human-approval","哪些动作可以自动做，哪些必须先让人确认","设计人工确认、审批和回退边界。",12,["T4-11"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-12-human-approval", badge:"已上线" },
    { ...plannedLesson("t4-13-workflow-agent-boundary","固定流程不够用时，什么时候才需要智能体（Agent）","判断固定工作流和动态智能体的边界。",13,["T4-12"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-13-workflow-agent-boundary", badge:"已上线" }
  ]},
  { stageId:"workflow-evaluation", title:"判断这套系统是否真的值得长期使用", promise:"验证流程是否稳定有效，并形成完整工作流设计蓝图。", order:6, lessons:[
    { ...plannedLesson("t4-14-workflow-evaluation","怎么知道自动化不是“能跑”，而是真的稳定有效","用测试样例、指标和回归检查工作流。",14,["T4-13"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-14-workflow-evaluation", badge:"已上线" },
    { ...plannedLesson("t4-15-workflow-blueprint","把一条真实业务链整理成完整工作流设计蓝图","把前面判断整理成可交付的工作流设计蓝图。",15,["T4-14"],"AVAILABLE"), availability:"AVAILABLE", runtimeCourseSlug:"ai-workflow", runtimeLessonId:"t4-15-workflow-blueprint", badge:"已上线" }
  ]}
];

export const learningTracks: Record<LearningTrackSlug, LearningTrackCatalog> = {
  "foundation-ai": {
    slug: "foundation-ai",
    index: "01",
    eyebrow: "AI Foundation",
    title: "AI 基础认知",
    description: "先把最常用的 AI 协作方法练会，再逐步理解模型、知识、工具与现代 AI 能力。",
    stageLabel: "6 个学习阶段",
    stages: foundationCatalog
  },
  "ai-work": {
    slug: "ai-work",
    index: "02",
    eyebrow: "AI Work",
    title: "AI 工作应用",
    description: "把已经理解的 AI 基础能力用到研究、写作、文件、数据、知识和可复用工作方法。",
    stageLabel: "6 个能力分组",
    stages: track02Catalog
  },
  "ai-growth": {
    slug: "ai-growth",
    index: "03",
    eyebrow: "AI Growth",
    title: "AI 推广运营与业务增长",
    description: "把 AI 工作成果继续推进到内容、渠道、线索、销售、客服和增长复盘。",
    stageLabel: "6 个能力分组",
    stages: track03Catalog
  },
  "ai-workflow": {
    slug: "ai-workflow",
    index: "04",
    eyebrow: "AI Workflow",
    title: "AI Workflow 与自动化",
    description: "把已经人工验证的业务流程设计成可重复、可控、可检查的 AI 工作系统。",
    stageLabel: "6 个能力分组",
    stages: track04Catalog
  }
};

export function getLearningTrack(slug: string | undefined): LearningTrackCatalog {
  if (slug === "ai-work") return learningTracks["ai-work"];
  if (slug === "ai-growth") return learningTracks["ai-growth"];
  if (slug === "ai-workflow") return learningTracks["ai-workflow"];
  return learningTracks["foundation-ai"];
}

export function isTrackRuntimeLesson(lesson: TrackCatalogLesson) {
  return Boolean(
    (lesson.availability === "AVAILABLE" || lesson.availability === "RUNTIME_PREVIEW") &&
      lesson.runtimeCourseSlug &&
      lesson.runtimeLessonId
  );
}
