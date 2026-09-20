import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../../lib/learning/course-builder";

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

export const promptFoundationsKnowledgeDepth = {
  example: [
    {
      title: "什么时候加 Example（示例）",
      text:
        "当你对格式、语气或结构有明确要求，但只用一句话很难说清时，给一个短示例通常比继续堆形容词更有效。示例要贴近真实任务，不需要很多。"
    },
    {
      title: "什么时候 Context（上下文）更重要",
      text:
        "如果任务依赖文件内容、历史对话、客户信息或已有数据，这些信息必须真的进入当前上下文。Prompt 写得再漂亮，也不能替代 AI 根本没看到的资料。"
    }
  ],
  review: [
    {
      title: "先补缺失信息，再改措辞",
      text:
        "结果不对时，先判断缺的是任务、背景、限制、输入资料还是输出标准。多数情况下，补对信息比重新写一整段提示更有效。"
    },
    {
      title: "Iteration（迭代）不是“再好一点”",
      text:
        "把不满意的地方说具体：哪里错了、缺了什么、哪条限制没遵守，再让 AI 针对这一点修改。这样你会逐步得到更稳定的结果。"
    }
  ]
} as const;

export const promptFoundationsReferenceFill = {
  goal: "为一家社区咖啡店设计一个周末拉新活动方案。",
  context:
    "店铺位于住宅区附近，希望吸引周边 20–35 岁、周末有休闲消费需求的新客到店，并尽量让第一次到店的人愿意再次消费。",
  constraint:
    "总预算控制在 1000 元以内；不使用虚假折扣；不做复杂的大型线下布置；活动要能由 2 名店员执行。",
  output:
    "请用表格输出 3 个活动方案，每个方案包含“玩法、目标顾客、预计预算、准备事项、执行步骤、衡量指标”，最后推荐 1 个最适合优先测试的方案并说明原因。"
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
      "公开官方资料对基础提示写法的共识包括：任务要清楚具体、提供足够上下文、明确需要的结果和格式；当格式或风格难描述时可通过 Example 展示期望；并根据实际输出继续迭代。课程把这些原则组织成“基础四部分 + Example / Context / Iteration 三个升级判断”，不把提示词写作包装成复杂公式。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    participation: {
      kind: "COPY_TO_AI",
      title: "把你改好的提示词放进自己的 AI 软件",
      instruction:
        "完成下面四部分后，复制你自己的提示词到正在使用的 AI 软件中，再和原来的模糊写法比较一次。你用哪一种 AI 都可以。",
      prompt: null,
      reflection:
        "重点不是哪一次文字更华丽，而是第二次结果是否更贴合目标、少了明显猜测，并且更接近你能直接使用的格式。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
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
      "知道什么时候应该补 Example（示例）或 Context（上下文）。",
      "根据第一次输出的问题继续 Iteration（迭代），而不是重新从零开始。"
    ],
    knowledgePoints: [
      "基础结构：先把任务、背景、限制和结果要求说清楚，让 AI 少猜。",
      "Example（示例）：当格式、语气或结构难以只靠描述说清时，用短示例展示期望。",
      "Context（上下文）：任务依赖文件、历史、客户信息或其他资料时，关键资料必须真的进入当前上下文。",
      "Iteration（迭代）：第一次结果不理想时，指出具体偏差并补缺失信息，而不是只说“再好一点”。"
    ],
    prerequisites: [
      "会在任意 AI 软件中输入问题或要求即可。"
    ],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "GUIDED",
    realAiOperation: "GUIDED",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: true,
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
      "能把一个模糊的一句话需求改成更容易执行的 Prompt。",
      "知道结果不理想时，应该补 Context、给 Example，还是针对具体偏差继续 Iteration。"
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
        "第二种写法没有使用神奇词汇，只是减少了 AI 需要猜测的信息，因此更容易得到可直接使用的结果。若你还希望邮件固定成某种格式或风格，可以再补一个短 Example；若内容必须基于客户历史记录，就要把相关记录作为 Context 提供给 AI。"
    },
    mistakes: [
      "误区：Prompt 越长越专业｜正确理解：只保留真正会改变结果的信息。",
      "误区：有格式要求就继续加形容词｜正确理解：格式或风格难描述时，给一个短 Example 往往更清楚。",
      "误区：资料没给 AI 也能靠 Prompt 猜出来｜正确理解：依赖文件、历史或用户资料时，关键 Context 必须真实提供。",
      "误区：结果不好就说“再好一点”｜正确理解：指出具体偏差，再补缺失信息或限制，逐步 Iteration。"
    ],
    related: [
      "Context：AI 当前真正能看到的资料决定了它能基于什么回答。",
      "Example：适合把难描述的格式、语气和结构直接展示出来。",
      "Iteration：根据第一次结果暴露的问题逐步修正提示。",
      "后续：稳定且会重复使用的方法可以进一步沉淀成 Skill（技能）或工作流程。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "check_prompt_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
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
      correctValues: ["B"],
      explanation:
        "B 把任务、使用场景、限制和输出结构都交代清楚。关键不是“专业”“顶级”等词，而是减少 AI 对目标和标准的猜测。",
      correctFeedback:
        "判断正确。B 让 AI 少猜四件事：要做什么、基于什么、不能越过什么边界、最后怎样交付。以后遇到结果太泛，优先检查这些信息是否缺失。",
      incorrectFeedback:
        "这里容易把“语气更专业”误当成“任务更清楚”。AI 真正缺的是任务、背景、限制和输出要求。先判断它还需要猜哪些关键信息，再决定怎样补提示。"
    },
    {
      id: "check_prompt_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question: "判断：Prompt 写得越长，AI 的结果通常就一定越好。",
      options: [
        { value: "TRUE", label: "对" },
        { value: "FALSE", label: "错" }
      ],
      correctValues: ["FALSE"],
      explanation:
        "长度不是目标。有效 Prompt 的核心是补足会改变结果的关键信息，并减少不必要的歧义。",
      correctFeedback:
        "判断正确。Prompt 不是越长越好，而是越能减少关键猜测越好。无关背景、重复要求和空泛形容词反而会增加噪声。",
      incorrectFeedback:
        "这是一个常见误区。长 Prompt 可能包含更多信息，但如果信息与任务无关，仍然不会让结果更可靠。判断标准应该是：这些内容是否真的会改变 AI 的执行结果。"
    },
    {
      id: "check_prompt_boundaries",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question: "下面哪些做法通常能减少 AI 对任务的猜测？（多选）",
      options: [
        { value: "TASK", label: "明确要完成的具体任务" },
        { value: "CONTEXT", label: "提供完成任务真正需要的上下文" },
        { value: "OUTPUT", label: "说明结果希望怎样组织或交付" },
        { value: "FLUFF", label: "加入更多“专业、顶级、完美”等形容词" }
      ],
      correctValues: ["TASK", "CONTEXT", "OUTPUT"],
      explanation:
        "明确任务、必要上下文和结果要求都会减少歧义；堆叠形容词并不能替代真正缺失的信息。",
      correctFeedback:
        "选择正确。你已经抓住了 Prompt 的核心边界：补任务、补必要上下文、补结果标准；如果只是增加空泛形容词，并没有减少 AI 的关键猜测。",
      incorrectFeedback:
        "再检查每个选项是否真的减少了 AI 必须自己猜的内容。任务、必要上下文和结果要求会改变执行；“专业、顶级、完美”通常没有提供可执行的新信息。"
    }
  ],
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
      "如果一个条件不会改变结果，可以先不写。",
      "如果你对最终格式有很明确的样子，也可以在“结果”里补一个很短的示例。"
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
  referenceAnswer:
    "任务：为一家社区咖啡店设计一个周末拉新活动方案。\n背景：店铺位于住宅区附近，希望吸引周边 20–35 岁、周末有休闲消费需求的新客到店，并尽量让第一次到店的人愿意再次消费。\n限制：总预算控制在 1000 元以内；不使用虚假折扣；不做复杂的大型线下布置；活动要能由 2 名店员执行。\n结果：请用表格输出 3 个活动方案，每个方案包含“玩法、目标顾客、预计预算、准备事项、执行步骤、衡量指标”，最后推荐 1 个最适合优先测试的方案并说明原因。",
  review: [
    "任务：我要 AI 做什么？",
    "背景：它需要知道什么才能少猜？",
    "限制：哪些规则不能违反？",
    "结果：最后怎样交付才算完成？"
  ],
  selfAssessment: [
    "我能看出模糊提示缺少了哪些关键信息。",
    "我能用四部分方法重写一个真实需求。",
    "我知道什么时候该补 Example 或 Context。",
    "我能根据实际输出指出具体偏差并继续 Iteration。"
  ]
} as const;
