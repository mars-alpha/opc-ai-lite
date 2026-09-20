export const promptFoundationsIntroPreview = {
  situation: "同样是让 AI 写一封客户跟进邮件，为什么有时结果很贴合，有时却像套话？",
  approaches: [
    {
      label: "模糊提示",
      text: "帮我写一封客户跟进邮件。"
    },
    {
      label: "更清楚的提示",
      text: "说明要做什么、给谁看、已知背景、不能忽略什么，以及最后要什么格式。"
    }
  ],
  comparison: [
    {
      term: "模糊",
      meaning: "AI 只能自己猜目标、背景和标准"
    },
    {
      term: "清楚",
      meaning: "AI 知道任务、背景、限制和交付方式"
    }
  ],
  takeaway: "好的 Prompt（提示词）不是越长越好，而是让 AI 少猜一点。"
} as const;

export const promptFoundationsBuildDraft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "RESEARCH_PACKET",
    sourceLabels: [
      "OpenAI Help Center：Best practices for prompt engineering（2026-08）",
      "OpenAI Help Center：Prompt engineering best practices（2026-07）",
      "Anthropic Docs：Prompting best practices（2026）"
    ],
    researchSummary:
      "公开官方资料对基础提示写法的共识包括：任务要清楚具体、提供足够上下文、明确需要的结果和格式，并根据输出继续迭代。课程将这些原则压缩为适合新手使用的四部分：任务、背景、限制、结果，不把提示词写作包装成复杂公式。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    participation: {
      kind: "COPY_TO_AI",
      title: "把你改好的提示词放进自己的 AI 软件",
      instruction:
        "完成下面四部分后，复制你自己的提示词到正在使用的 AI 软件中，再和原来的模糊写法比较一次。你用哪一种 AI 都可以。",
      prompt: null,
      reflection:
        "重点不是哪一次文字更华丽，而是第二次结果是否更贴合目标、少了明显猜测，并且更接近你能直接使用的格式。"
    }
  },
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "ai-literacy",
    lessonId: "prompt-foundations",
    title: "Prompt（提示词）怎么写，AI 才更容易理解你",
    lessonType: "APPLICATION",
    learningObjectives: [
      "看出一个模糊提示为什么会让 AI 猜测太多。",
      "用任务、背景、限制、结果四部分把一个真实需求写清楚。",
      "把改写后的提示词放进自己的 AI 软件，并能比较两次结果的差异。"
    ],
    knowledgePoints: [
      "Prompt（提示词）的核心作用是把当前任务需要的信息组织清楚。",
      "基础提示最重要的不是固定咒语，而是任务明确、背景足够、限制具体、结果可判断。",
      "第一次输出不理想时，应根据缺失信息继续补充和迭代，而不是只说“再好一点”。"
    ],
    prerequisites: [
      "会在任意 AI 软件中输入问题或要求即可。"
    ],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "GUIDED",
    realAiOperation: "GUIDED",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: false,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK", "PRACTICE"],
    steps: [
      {
        id: "explain",
        kind: "EXPLAIN",
        title: "为什么一句话经常得不到想要的结果",
        objective: "先建立一个直觉：AI 不知道你没有说出来的背景和标准。"
      },
      {
        id: "example",
        kind: "EXAMPLE",
        title: "看同一个任务怎么从模糊变清楚",
        objective: "通过前后对比，看清哪些信息真正改变了结果。"
      },
      {
        id: "check",
        kind: "CHECK",
        title: "哪一种提示更容易得到可用结果？",
        objective: "判断一个提示是否把关键任务信息交代清楚。"
      },
      {
        id: "practice",
        kind: "PRACTICE",
        title: "把一个真实需求改写成清楚提示",
        objective: "亲手完成一份可执行提示，并通过本地规则检查。"
      },
      {
        id: "review",
        kind: "REVIEW",
        title: "记住四个问题就够了",
        objective: "复盘任务、背景、限制、结果四个基础部分。"
      },
      {
        id: "capability",
        kind: "CAPABILITY",
        title: "你已经能把模糊要求改成可执行提示",
        objective: "把本课方法带到之后的真实 AI 任务中。"
      }
    ],
    capabilityGain: [
      "遇到 AI 输出不对时，先检查自己有没有把任务、背景、限制和结果说清楚。",
      "能把一个模糊的一句话需求改成更容易执行的 Prompt。"
    ],
    nextLessonValue:
      "下一步可以继续学习 Context（上下文）、文件和外部资料怎样影响 AI 的结果。",
    accessPresentation: {
      showCourseContext: true,
      showLearningPathLink: true,
      inlineConversionCta: false
    }
  },
  content: {
    summary:
      "不背复杂公式。你会把一个模糊需求改写成更清楚的提示词，并亲手比较前后结果。",
    plainExplanation:
      "AI 只能根据你给它的信息工作。要求越模糊，它需要猜的东西越多。基础阶段先记住四个问题：要做什么？背景是什么？有什么限制？最后要什么结果？",
    whyItMatters:
      "很多“AI 不好用”并不是模型不会，而是任务没有说清楚。把需求写清楚，往往比寻找所谓“万能提示词”更有效。",
    points: [
      "任务：要 AI 做什么。",
      "背景：给谁用、为什么做、已知什么。",
      "限制：哪些不能做、必须遵守什么。",
      "结果：希望最终以什么形式交付。"
    ],
    content: [
      "先写任务，再补真正会影响结果的背景，不需要把所有信息都塞进去。",
      "限制要具体，例如“不要编造原文没有的信息”“200 字以内”“用表格输出”。",
      "结果要求越容易判断，越方便你比较 AI 是否真的完成了任务。"
    ],
    example: {
      title: "客户跟进邮件：同一个任务，为什么结果差很多",
      situation:
        "你需要给一个已经看过报价、但三天没有回复的客户发跟进邮件。",
      before:
        "帮我写一封客户跟进邮件。",
      after:
        "任务：写一封客户跟进邮件。背景：客户三天前看过报价但没有回复，我们希望确认是否还有疑问。限制：语气友好，不催促，不虚构优惠。结果：120 字以内，包含一句询问和一个明确下一步。",
      result:
        "第二种写法没有使用神奇词汇，只是减少了 AI 需要猜测的信息，因此更容易得到可直接使用的结果。"
    },
    mistakes: [
      "误区：Prompt 越长越专业｜正确理解：只保留真正会改变结果的信息。",
      "误区：只写语气，不写任务｜正确理解：先说清楚要完成什么，再谈表达方式。",
      "误区：结果不好就说“再好一点”｜正确理解：指出哪里不符合要求，再补缺失背景或限制。"
    ],
    related: [
      "前置：会使用任意 AI 软件进行基本对话。",
      "关联：Context（上下文）决定 AI 当前能看到哪些信息。",
      "后续：把稳定提示进一步沉淀成 Skill（技能）或工作流程。"
    ]
  },
  check: {
    id: "check_prompt_clarity",
    question:
      "你要让 AI 根据一份会议记录整理给老板看的项目风险。下面哪一个提示更容易得到可用结果？",
    options: [
      {
        value: "A",
        label: "帮我把这个会议记录总结得专业一点。"
      },
      {
        value: "B",
        label: "根据这份会议记录，找出项目风险；只使用原文信息；按“风险 / 影响 / 负责人 / 下一步”四栏输出，给项目负责人查看。"
      },
      {
        value: "C",
        label: "你是世界顶级项目管理专家，请认真思考。"
      }
    ],
    correctValue: "B",
    explanation:
      "B 把任务、使用场景、限制和输出结构都交代清楚。关键不是“专业”“顶级”等词，而是减少 AI 对目标和标准的猜测。"
  },
  practice: {
    id: "practice_prompt_rewrite",
    title: "把“帮我写一份活动方案”改成可执行提示",
    goal:
      "假设你要让 AI 帮一家咖啡店设计周末拉新活动。把这个模糊需求改写成四部分。",
    instructions: [
      {
        key: "goal",
        label: "任务",
        prompt: "AI 最终要帮你完成什么？写清一个具体结果。"
      },
      {
        key: "context",
        label: "背景",
        prompt: "补充对象、场景和用途，例如店铺、目标顾客或活动目的。"
      },
      {
        key: "constraint",
        label: "限制",
        prompt: "写出至少一个必须遵守或不能做的条件。"
      },
      {
        key: "output",
        label: "结果",
        prompt: "说明希望最后以什么结构、长度或格式交付。"
      }
    ],
    hints: [
      "不要追求华丽，把真实业务信息说清楚就够了。",
      "如果一个条件不会改变结果，可以先不写。"
    ],
    rubric: [
      {
        key: "goal",
        label: "任务清楚",
        maxScore: 25,
        minScore: 15,
        example: "为咖啡店设计一个周末拉新活动方案。"
      },
      {
        key: "context",
        label: "背景足够",
        maxScore: 25,
        minScore: 15,
        example: "社区咖啡店，希望吸引附近 20–35 岁新客到店。"
      },
      {
        key: "constraint",
        label: "限制具体",
        maxScore: 25,
        minScore: 15,
        example: "预算 1000 元以内，不使用虚假折扣，不做复杂线下布置。"
      },
      {
        key: "output",
        label: "结果可判断",
        maxScore: 25,
        minScore: 15,
        example: "用表格输出活动玩法、预算、准备事项和衡量指标。"
      }
    ],
    passScore: 70
  },
  hints: [
    "先问：AI 到底要完成什么？",
    "再问：它不知道的关键背景是什么？",
    "最后补上限制和你真正想拿到的结果形式。"
  ],
  referenceAnswer: null,
  review: [
    "任务：我要 AI 做什么？",
    "背景：它需要知道什么才能少猜？",
    "限制：哪些规则不能违反？",
    "结果：最后怎样交付才算完成？"
  ],
  selfAssessment: [
    "我能看出模糊提示缺少了哪些关键信息。",
    "我能用四部分方法重写一个真实需求。",
    "我知道提示词需要根据实际输出继续迭代。"
  ]
} as const;
