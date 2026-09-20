export const skillFoundationsBuildDraft = {
  mode: "BUILD",
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "ai-literacy",
    lessonId: "skill-foundations",
    title: "Skill 是什么：把可复用方法交给 AI",
    lessonType: "CONCEPT",
    learningObjectives: [
      "理解 Skill 不是模型本身，而是可版本化、可复用的方法与规则资产。",
      "区分 Prompt、Tool、Skill 与 Agent 在 AI 系统中的不同职责。",
      "知道什么时候应该把重复做法沉淀成 Skill，而不是继续依赖临时对话。"
    ],
    knowledgePoints: [
      "Skill 把 Prompt、规则、SOP、结构化输出要求等组织成可复用能力。",
      "Skill 负责智能方法，不应该直接拥有数据库、权限、发布或学习进度等核心状态。",
      "当一个任务反复出现、输入输出边界稳定且需要语义判断时，适合逐步沉淀成 Skill。"
    ],
    prerequisites: [
      "理解生成式 AI 与 Prompt 的基本概念。",
      "知道 Tool / Agent 可以让 AI 与外部系统交互。"
    ],
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
      {
        id: "explain",
        kind: "EXPLAIN",
        title: "先把 Skill 和 Prompt 分开",
        objective: "理解 Skill 是可复用、可版本化的方法资产，而不是一次性的聊天指令。"
      },
      {
        id: "example",
        kind: "EXAMPLE",
        title: "从每次重写提示词到固定课程生成方法",
        objective: "通过真实重复任务理解 Skill 为什么需要稳定输入、规则和结构化输出。"
      },
      {
        id: "check",
        kind: "CHECK",
        title: "判断什么应该做成 Skill",
        objective: "能区分临时 Prompt、普通代码、Tool 与真正需要 Skill 的语义任务。"
      },
      {
        id: "review",
        kind: "REVIEW",
        title: "记住 Skill 的边界",
        objective: "复盘 Skill 与 Core System、Tool、Agent 的职责边界。"
      },
      {
        id: "capability",
        kind: "CAPABILITY",
        title: "你现在能判断什么时候需要 Skill",
        objective: "能为一个重复 AI 任务判断是否值得沉淀为 Skill。"
      }
    ],
    capabilityGain: [
      "看到重复 AI 任务时，能判断应该用普通代码、Prompt、Tool 还是 Skill。",
      "理解 Skill 可以持续优化，但不能直接掌握系统核心状态。"
    ],
    nextLessonValue: "理解 Skill 后，再学习 Agent 如何组合模型、Context、Tool 与 Skill 完成多步任务。",
    accessPresentation: {
      showCourseContext: true,
      showLearningPathLink: true,
      inlineConversionCta: false
    }
  },
  content: {
    summary: "理解 Skill 在 AI 系统里的位置：它把反复验证过的方法、Prompt、规则和输出要求沉淀成可复用能力。",
    plainExplanation: "你可以把 Skill 理解成“教 AI 怎么稳定完成某一类任务的方法包”。一次 Prompt 只解决当前对话；Skill 则把经过反复验证的做法固定下来，让系统以后遇到同类任务时继续使用，而且还能按版本迭代。",
    whyItMatters: "如果所有智能逻辑都散落在临时 Prompt 里，系统会越来越难维护；但如果什么都叫 Skill，又会把本来应该由普通代码完成的确定性规则交给模型。学会区分两者，是后面理解 Agent、自动化和 AI 应用架构的基础。",
    points: [
      "Prompt 是一次任务说明，Skill 是可复用的方法资产。",
      "确定性规则优先用普通代码；需要理解、生成、分类、综合等语义能力时再考虑 Skill。",
      "Skill 的输出应该结构化，并交给代码校验；最终发布、权限和状态变化仍由 Core System 决定。"
    ],
    content: [
      "一个 Skill 通常不只是几句 Prompt。它可以包含角色与目标、允许读取的上下文、执行步骤、判断规则、输出 Schema、失败处理方式，以及哪些事情明确禁止做。",
      "Skill 和 Tool 也不是一回事。Tool 是“能做什么”，例如查数据库、搜索网页、发送消息；Skill 是“应该怎么做”，例如如何把一条已审核 Knowledge 转成课程草稿，并保持课程结构和审核边界。",
      "Skill 也不等于 Agent。Agent 是一个围绕目标持续判断、调用能力、观察结果并决定下一步的运行模式；一个 Agent 可以调用多个 Tool，也可以使用多个 Skill。",
      "最适合沉淀 Skill 的任务通常同时满足三个条件：会重复出现、输入输出边界相对稳定、又不能完全靠固定规则解决。第一次出现的任务不必急着做 Skill，先把真实流程跑通，再从重复做法中沉淀。"
    ],
    example: {
      title: "为什么 Course Builder 值得做成 Skill？",
      situation: "OPC 以后会持续把 Reviewed Knowledge 和课程规划转成新的 Lesson Draft，也会根据学习反馈改进已有课程。",
      before: "每次临时要求 AI“帮我写一节课”，课程结构、Step、Check 和 Completion Gate 都可能漂移，而且 AI 可能误以为自己可以直接发布。",
      after: "把 Lesson Spec、BUILD / IMPROVE 输出格式、禁止行为和 Human Review 边界固定进 Course Builder Skill，再由 Code Validation 检查结果。",
      result: "Skill 负责课程设计中的语义生成，Core 继续掌握规则、校验和正式写入权限；Skill 可以迭代，但系统不会跟着失控。"
    },
    mistakes: [
      "把一段常用 Prompt 直接当成成熟 Skill，而没有稳定输入、输出和验证规则。",
      "把数据库写入、权限判断、价格计算等确定性规则交给 Skill。",
      "认为有 Tool 就等于有 Skill，或有 Skill 就等于 Agent。",
      "在真实任务还没跑通前先建设庞大的通用 Skill 平台。"
    ],
    related: [
      "前置：API、Tool、MCP 与 Agent。",
      "后续：Agent 如何组合 Tool、Skill 与 Context。",
      "实战：OPC Course Builder Skill 如何把 Lesson Draft 送入 Code Validation 与 Human Review。"
    ]
  },
  check: {
    id: "check_skill_boundary",
    question: "下面哪一项最适合由 Skill 负责？",
    options: [
      {
        value: "A",
        label: "根据固定公式计算订单总价"
      },
      {
        value: "B",
        label: "判断当前用户是否拥有会员权限"
      },
      {
        value: "C",
        label: "根据已审核资料生成符合固定 Lesson Spec 的课程草稿"
      },
      {
        value: "D",
        label: "直接把课程状态修改为 PUBLISHED"
      }
    ],
    correctValue: "C",
    explanation: "课程草稿生成需要语义理解与内容组织，适合 Skill；价格、权限和正式状态变化属于确定性 Core。"
  },
  practice: null,
  hints: [
    "先问：这件事能不能用确定性代码稳定完成？",
    "再问：它是不是会反复出现，而且需要语义理解、生成或综合？"
  ],
  referenceAnswer: null,
  review: [
    "Code = Truth：确定性规则与核心状态由代码负责。",
    "Skill = Intelligence：负责需要语义理解、生成、分类、综合的方法。",
    "Workflow = Controlled Bridge：Skill 输出必须经过 Code Validation / Human Review 才能进入正式数据。"
  ],
  selfAssessment: [
    "我能解释 Prompt、Tool、Skill、Agent 的区别。",
    "我能判断一个任务什么时候应该 Code First，什么时候值得沉淀成 Skill。"
  ]
} as const;
