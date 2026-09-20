import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../../lib/learning/course-builder";

export const aiWorkflowProjectIntroPreview = {
  situation:
    "你已经会让 AI 完成单次任务，但真实工作里经常要重复：收集信息、判断、生成内容、人工确认、再继续下一步。",
  approaches: [
    {
      label: "每次临时问 AI",
      text:
        "想到一步做一步，Prompt、输入和人工确认位置都不固定；换个人执行时很容易漏步骤。"
    },
    {
      label: "先设计一套工作流",
      text:
        "先定义什么时候开始、需要什么输入、AI 做哪些步骤、哪里必须人工确认，以及最后怎样判断有效。"
    }
  ],
  comparison: [],
  comparisonPlacement: "BOTTOM",
  bottomDetails: [
    {
      title: "为什么临时使用会越来越难维护",
      text:
        "同一件事如果每次都靠人临时决定 Prompt、输入和下一步，执行结果会跟着个人习惯变化。最常见的问题不是 AI 不够聪明，而是步骤被遗漏、信息交接不完整，最后只有原来那个人知道“应该怎么做”。"
    },
    {
      title: "工作流真正解决的是“可重复”",
      text:
        "把方法写成工作流后，别人可以接手，过程可以检查，错误可以定位，做得好的部分也能持续改进。以后要接自动化、Skill 或 API 时，也有清楚的边界可以逐步替换，而不是重做整个流程。"
    },
    {
      title: "这是从“会用 AI”走向“用 AI 建工作方式”的一步",
      text:
        "单次使用 AI 提升的是一个人的一次效率；工作流设计开始把个人经验变成团队可复用的能力。后续真正做业务提效、Agent 或自动化，基本都会建立在这一步之上。"
    }
  ],
  takeaway:
    "PROJECT 的目标不是写一段更长的 Prompt，而是把“只有你会做”的方法，变成别人也能接手、检查、改进和继续自动化的工作方式。"
} as const;

export const aiWorkflowProjectKnowledgeDepth = {
  example: [
    {
      title: "先找稳定部分，再决定哪里用 AI",
      text:
        "触发条件、输入字段、权限和最终状态通常可以用普通规则固定；需要理解客户意图、总结内容或生成文案的地方，才更适合交给 AI。"
    },
    {
      title: "Human-in-the-loop（人工确认）不是失败",
      text:
        "客户沟通、价格承诺、敏感信息等高风险节点，本来就应该保留人工确认。好的工作流不是“全自动”，而是知道哪些步骤不能自动越权。"
    }
  ],
  review: [
    {
      title: "五项项目检查",
      text:
        "目标清楚吗 → 触发和输入清楚吗 → 步骤能按顺序执行吗 → 人工确认位置明确吗 → 成功指标能判断结果吗。"
    },
    {
      title: "先做最小闭环",
      text:
        "PROJECT 不要求一次设计所有异常分支。先保证一个真实场景可以从开始走到结果，再逐步增加失败处理、渠道和自动化。"
    }
  ]
} as const;

export const aiWorkflowProjectReferenceFill = {
  projectGoal:
    "为已有意向但 3 天未回复的客户设计一套跟进工作流，帮助销售快速整理客户背景、生成个性化跟进草稿，并确保最终消息由销售确认后再发送。",
  triggerInput:
    "触发：客户进入“有意向”状态后连续 3 天没有新回复。输入：客户姓名、最近一次沟通记录、感兴趣的产品/房源、已知预算或需求、负责销售。",
  workflowSteps:
    "1. 系统读取触发条件和已允许使用的客户资料；2. AI 总结客户当前需求和上次沟通重点；3. AI 生成一条简短跟进草稿；4. 销售查看摘要和草稿并修改；5. 销售确认后发送；6. 系统记录发送时间和下一次跟进日期。",
  humanReview:
    "销售必须在发送前确认：客户信息是否准确、是否出现未授权的价格/承诺、语气是否合适、是否需要补充新的真实信息。AI 不能自动发送，也不能自行修改客户状态。",
  successMetric:
    "先用 20 个真实跟进任务试运行。记录：销售从打开任务到完成发送的平均时间、草稿被直接采用或小改后采用的比例、因信息错误被退回的次数，以及 7 天内客户重新回复的数量。"
} as const;

export const aiWorkflowProjectBuildDraft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "OPC Reviewed Knowledge：Code / Skill / Workflow / Core Authority",
      "OPC Reviewed Knowledge：Human-in-the-loop 与最小闭环"
    ],
    researchSummary:
      "已审核知识要求：确定性规则优先普通代码，语义理解和生成才使用 AI；AI 不直接拥有核心业务状态，最终发送、权限和状态变化由人或 Core System 决定。项目设计优先先完成一个最小可执行闭环，再扩展复杂分支。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    participation: {
      kind: "MINI_TASK",
      title: "完成一份 AI 客户跟进工作流方案",
      instruction:
        "围绕同一个真实场景，完成目标、触发与输入、执行步骤、人工确认、成功指标五个项目部分。先自己设计，再用本地规则检查完整性。",
      prompt: null,
      reflection:
        "最终要得到的不是一段 Prompt，而是一份别人读完以后知道什么时候启动、按什么顺序做、哪里必须人工确认、怎样判断项目是否有效的工作流方案。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "ai-literacy",
    lessonId: "ai-workflow-project",
    title: "完成一份 AI 客户跟进工作流方案",
    lessonType: "PROJECT",
    learningObjectives: [
      "把一个真实业务问题收敛成明确的项目目标。",
      "设计触发、输入、AI 步骤和普通规则之间的分工。",
      "明确人工确认节点，避免 AI 越过发送、承诺或状态变更边界。",
      "定义可以判断项目是否有效的最小成功指标。"
    ],
    knowledgePoints: [
      "PROJECT 的核心是完整闭环，而不是把单次 Prompt 写得更复杂。",
      "稳定规则和业务状态优先由普通代码或明确流程处理，AI 只负责需要理解、总结和生成的部分。",
      "Human-in-the-loop 应放在高风险或需要最终业务判断的位置。",
      "成功指标必须能被观察或统计，否则无法判断工作流是否真的有价值。"
    ],
    prerequisites: [
      "已经理解 Prompt 的基础结构，并完成至少一次独立 PRACTICE。"
    ],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "PROJECT",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: true,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK", "DELIVERABLE"],
    steps: [
      {
        id: "explain",
        kind: "EXPLAIN",
        title: "项目课不是更长的练习",
        objective:
          "建立一个直觉：PROJECT 要把多个已学能力组合成一个能从开始走到结果的完整方案。"
      },
      {
        id: "example",
        kind: "EXAMPLE",
        title: "看一个客户跟进任务怎样变成工作流",
        objective:
          "看清目标、触发、输入、AI 步骤、人工确认和成功指标如何组成一个最小闭环。"
      },
      {
        id: "check",
        kind: "CHECK",
        title: "哪一个方案更像真正的工作流？",
        objective:
          "判断一个方案是否已经从“让 AI 帮忙”升级成可重复执行的项目设计。"
      },
      {
        id: "practice",
        kind: "PRACTICE",
        title: "完成你的五部分项目方案",
        objective:
          "亲手完成一份结构化 AI 客户跟进工作流草稿，并通过本地质量检查。"
      },
      {
        id: "review",
        kind: "REVIEW",
        title: "用五项检查判断项目能不能落地",
        objective:
          "形成可复用的项目质量检查框架。"
      },
      {
        id: "capability",
        kind: "CAPABILITY",
        title: "你已经能设计一个最小 AI 工作流项目",
        objective:
          "明确这项能力可以迁移到销售、客服、内容运营和内部协作场景。"
      }
    ],
    capabilityGain: [
      "能把一个模糊的“想用 AI 提效”需求转成完整的最小工作流方案。",
      "能区分普通规则、AI 处理和人工确认各自应该负责什么。",
      "能用目标、触发输入、步骤、人工确认、成功指标五部分描述一个项目。",
      "能先做最小闭环，再判断下一轮该增加自动化还是补业务规则。"
    ],
    nextLessonValue:
      "下一步可以把这份方案拆成真实 Workflow：先用普通代码实现确定性部分，再在需要理解或生成的节点接入 Skill / Model API。",
    accessPresentation: {
      showCourseContext: true,
      showLearningPathLink: true,
      inlineConversionCta: false
    }
  },
  content: {
    summary:
      "这是一节小型项目课：你会把“让 AI 帮销售跟进客户”从一句想法，整理成一份可以交给别人继续实现的工作流方案。",
    plainExplanation:
      "练习通常训练一个动作；PROJECT 要把多个动作组合成完整闭环。你需要同时说明项目为什么做、什么时候开始、用什么信息、按什么顺序执行、哪里不能让 AI 自己决定，以及怎么判断结果。",
    whyItMatters:
      "很多 AI 项目失败不是模型不够强，而是触发条件、输入、人工确认和结果标准都没定义清楚。项目课要训练的就是把这些边界提前设计出来。",
    points: [
      "目标：项目最终解决什么业务问题。",
      "触发与输入：什么时候启动，以及允许使用哪些真实资料。",
      "工作流步骤：普通规则、AI、人工分别做什么。",
      "人工确认：哪些关键动作必须由人决定。",
      "成功指标：怎样判断这个项目值得继续。"
    ],
    content: [
      "先从一个真实、高频、边界清楚的场景开始，不要一开始就设计“万能 Agent”。",
      "把稳定、可判断的步骤写成规则；只有需要理解文本、归纳信息或生成内容时才考虑 AI。",
      "如果一个动作会对客户、价格、权限或业务状态产生真实影响，应明确最终确认者。",
      "项目指标先选 2–4 个最容易观察的，不要一开始做复杂数据体系。"
    ],
    example: {
      title: "从“让 AI 自动跟客户”到最小工作流",
      situation:
        "销售希望减少重复跟进时间，但客户背景、沟通历史和承诺内容都不能让 AI 自己猜。",
      before:
        "让 AI 自动分析客户，然后帮我跟进。",
      after:
        "客户 3 天未回复时触发 → 读取允许使用的客户资料 → AI 总结需求 → AI 生成跟进草稿 → 销售人工确认 → 销售发送 → 系统记录发送和下次跟进时间。",
      result:
        "方案开始具备可执行边界：AI 负责总结和生成，人负责最终沟通，系统负责触发和记录。后续再决定是否增加更多渠道或自动化。"
    },
    mistakes: [
      "误区：PROJECT 就是多填几个练习字段｜正确理解：项目必须形成从触发到结果的完整闭环。",
      "误区：为了像 AI 项目就尽量全自动｜正确理解：稳定规则用代码，高风险动作保留人工确认。",
      "误区：步骤越多越专业｜正确理解：先做一个能走通的最小闭环，再扩复杂分支。",
      "误区：做出来能跑就算成功｜正确理解：还要有可以观察的成功指标，才能判断是否值得继续。"
    ],
    related: [
      "Prompt 解决单次指令怎么说清楚。",
      "PRACTICE 训练一个具体动作能不能独立完成。",
      "PROJECT 把多个能力组合成一个完整交付方案。",
      "后续真实实现时可以继续拆成 Core Code、Skill 和受控 Workflow。"
    ]
  },
  check: {
    id: "check_ai_workflow_project",
    question: "下面哪一个方案最接近一个可以继续落地的 AI 工作流项目？",
    options: [
      {
        value: "A",
        label: "以后所有客户都让 AI 自动跟进，尽量减少人工。"
      },
      {
        value: "B",
        label:
          "客户 3 天未回复时触发；系统提供最近沟通和需求；AI 生成跟进草稿；销售确认后发送；记录发送时间，并观察处理时间和客户回复情况。"
      },
      {
        value: "C",
        label: "写一个更专业的 Prompt，让 AI 给销售更多建议。"
      }
    ],
    correctValue: "B",
    explanation:
      "B 同时说明了触发、输入、AI 做什么、人工确认、后续记录和结果观察，因此已经接近最小闭环。A 没有业务边界且让 AI 越过最终沟通权；C 仍然只是单次 Prompt，没有形成可重复执行流程。"
  },
  practice: {
    id: "project_ai_customer_followup_workflow",
    title: "完成你的 AI 客户跟进工作流项目草稿",
    goal:
      "项目 Brief：为“已有意向但连续 3 天没有回复的客户”设计一套最小 AI 跟进工作流。目标不是全自动发送，而是减少销售整理背景和起草消息的重复时间，同时保留人工最终确认。请完成下面五个项目部分。",
    instructions: [
      {
        key: "projectGoal",
        label: "项目目标",
        prompt:
          "写清具体要改善什么问题、服务谁，以及项目结果应该带来什么变化。"
      },
      {
        key: "triggerInput",
        label: "触发与输入",
        prompt:
          "说明什么时候启动，以及工作流允许使用哪些真实资料。"
      },
      {
        key: "workflowSteps",
        label: "工作流步骤",
        prompt:
          "按顺序写出普通规则、AI 和人工分别做什么，至少形成一个从开始到记录结果的闭环。"
      },
      {
        key: "humanReview",
        label: "人工确认",
        prompt:
          "明确哪些内容或动作必须由销售确认，AI 不能自己决定什么。"
      },
      {
        key: "successMetric",
        label: "成功指标",
        prompt:
          "写出 2–4 个可以实际观察或统计的指标，用来判断这套工作流是否值得继续。"
      }
    ],
    hints: [
      "先写一个最小场景，不要扩成整个 CRM 或万能 Agent。",
      "确定性部分优先写成规则，例如“连续 3 天未回复时触发”。",
      "AI 只负责需要理解、总结或生成的步骤，不要让 AI 决定客户权限、价格承诺或最终发送。",
      "人工确认要写具体：到底确认哪些内容，而不是只写“人工审核”。",
      "成功指标优先选处理时间、采用率、错误次数、客户回复等容易观察的数据。"
    ],
    rubric: [
      {
        key: "projectGoal",
        label: "项目目标明确",
        maxScore: 20,
        minScore: 12,
        example:
          "减少销售整理客户背景和起草跟进消息的时间，同时保留人工最终发送。"
      },
      {
        key: "triggerInput",
        label: "触发与输入完整",
        maxScore: 20,
        minScore: 12,
        example:
          "客户有意向且 3 天未回复时触发；输入最近沟通、需求、预算和负责销售。"
      },
      {
        key: "workflowSteps",
        label: "工作流形成闭环",
        maxScore: 25,
        minScore: 15,
        example:
          "触发 → 读取资料 → AI 总结 → AI 生成草稿 → 人工确认 → 发送 → 记录结果。"
      },
      {
        key: "humanReview",
        label: "人工边界明确",
        maxScore: 20,
        minScore: 12,
        example:
          "销售确认信息准确、没有未经授权的承诺，并决定是否发送。"
      },
      {
        key: "successMetric",
        label: "成功指标可观察",
        maxScore: 15,
        minScore: 9,
        example:
          "平均处理时间、草稿采用率、信息错误次数、7 天内重新回复数量。"
      }
    ],
    passScore: 72
  },
  hints: [
    "先把项目写成一个最小闭环，再想自动化程度。",
    "任何真实业务动作都要问：最后是谁有权决定？",
    "指标必须能被观察，不要只写“体验更好”“效率更高”。"
  ],
  referenceAnswer:
    "项目目标：为已有意向但 3 天未回复的客户设计一套跟进工作流，减少销售整理背景和起草消息的重复时间，并保留人工最终发送。\n\n触发与输入：客户进入“有意向”后连续 3 天无新回复时触发；输入客户姓名、最近沟通、需求、预算/偏好和负责销售。\n\n工作流步骤：系统判断触发 → 读取已允许资料 → AI 总结需求 → AI 生成跟进草稿 → 销售检查修改 → 销售确认后发送 → 系统记录发送和下次跟进时间。\n\n人工确认：销售必须确认客户资料、价格/承诺、语气和是否发送；AI 不自动发送、不自行修改客户状态。\n\n成功指标：先试运行 20 个任务，记录平均处理时间、草稿采用率、因信息错误退回次数和 7 天内客户重新回复数量。",
  review: [
    "目标：这个项目到底解决什么具体问题？",
    "触发与输入：什么时候开始，允许用哪些资料？",
    "步骤：规则、AI、人工是否各自做适合自己的事？",
    "人工确认：真实业务风险在哪里，谁有最终决定权？",
    "成功指标：项目做完以后，拿什么数据决定继续还是调整？"
  ],
  selfAssessment: [
    "我能把“想用 AI 提效”收敛成一个具体项目目标。",
    "我能设计一个包含规则、AI 和人工确认的最小工作流。",
    "我能说明项目需要什么输入、最终怎样判断是否有效。",
    "我知道项目草稿通过不等于正式 Deliverable 已完成。"
  ]
} as const;
