import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../../lib/learning/course-builder";

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export const track01T101Meta = {
  canonicalId: "T1-01",
  draftVersion: "1.0.0-track01-a",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "SWAPPABLE_REAL_TASK",
  inheritedArtifact: "REAL_TASK_IDEA",
  artifactOutput: "TASK_FIT_NOTE_WITH_AI_FIRST_DRAFT",
  nextReuse: "T1-02_CLEAR_TASK_BRIEF"
} as const;

export const track01T101Intro = {
  situation: "你手上同时有几件事：整理一页会议记录、写一段活动介绍、决定一笔重要支出。AI 都可能给你答案，但这三件事并不应该用同一种方式交给 AI。",
  approaches: [
    {
      label: "什么都交给 AI",
      text: "看到 AI 能回答，就默认它也应该替你判断，结果容易把“协助”和“决定”混在一起。"
    },
    {
      label: "先判断 AI 适合帮哪一步",
      text: "先看任务是不是适合让 AI 协助、结果要不要核验，以及最后决定是不是必须由人负责。"
    }
  ],
  comparison: [],
  takeaway: "会用 AI 的第一步，不是多会几个按钮，而是先判断：这件事应该让 AI 帮到什么程度。",
  bottomDetails: [
    {
      title: "从你自己熟悉的任务开始",
      text: "你越熟悉任务，就越容易判断 AI 的结果有没有偏，也越容易建立真正可迁移的使用判断。"
    },
    {
      title: "第一课只做一级判断",
      text: "现在只分清“可以协助、需要谨慎核验、人负责最终决定”。怎么核验、权限怎么管，后面会分别学习。"
    }
  ],
  comparisonPlacement: "BOTTOM"
} as const;

export const track01T101Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "Track 01 Batch A Formal Brief · T1-01",
      "OPC Beginner Quality Standard v1"
    ],
    researchSummary:
      "本课只建立 Everyday AI task fit 的一级判断：AI 可协助、需谨慎核验、人负责最终决定。学习者必须从自己的真实任务中分类 3 个任务，并为其中 1 个生成可继续加工的第一版。Hallucination、正式 Verification、Permissions/HITL、模型机制均后置。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "面对一个真实任务，我应该把哪部分交给 AI，哪部分保留自己判断？",
      mainConcept: "先判断 AI 适合帮到什么程度，再开始使用。",
      allowedCoreTerms: [],
      deferredTerms: [
        "Prompt",
        "Context",
        "Hallucination",
        "RAG",
        "Tool",
        "MCP",
        "Agent",
        "Human-in-the-loop"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "把你选中的任务真正交给 AI 做第一版",
      instruction:
        "完成下面的任务分类后，从“AI 可协助”的任务里选 1 个，写清一句目标，把这句话复制到你常用的 AI 软件，让它先给第一版。把第一版保存回来，不要求现在就做到完美。",
      prompt: "请先根据我的任务目标给我一个最小可用的第一版。我会继续检查和修改，不需要替我做最终决定。",
      reflection: "这一课的结果不是“得到完美答案”，而是你已经知道为什么选这个任务，以及 AI 应该先帮到哪一步。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0-track01-a",
    courseSlug: "foundation-ai",
    lessonId: "t1-01-ai-task-fit",
    title: "AI 能帮什么，不能帮什么",
    lessonType: "APPLICATION",
    learningObjectives: [
      "能判断一个真实任务适合让 AI 协助到什么程度。",
      "能区分“AI 可协助、需要谨慎核验、人负责最终决定”三个层次。",
      "能选择一个适合的真实任务并留下 AI 第一版。"
    ],
    knowledgePoints: [
      "AI 能给出结果，不代表它应该替人承担最终判断。",
      "越容易检查、越适合产生中间结果的任务，越适合作为 AI 协作入口。",
      "需要核验或必须由人决定的任务，可以让 AI 协助，但不能把责任一起交出去。"
    ],
    prerequisites: [],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "GUIDED",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: true,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK", "PRACTICE"],
    steps: [
      { id: "explain", kind: "EXPLAIN", title: "先判断 AI 应该帮到哪一步", objective: "建立任务适配直觉：会回答不等于应该替你决定。" },
      { id: "example", kind: "EXAMPLE", title: "同一天的三件事，为什么不能都交给 AI", objective: "用可协助、需核验、最终决定三个场景讲清一级边界。" },
      { id: "check", kind: "CHECK", title: "你会判断 AI 适合帮到什么程度吗", objective: "通过真实情境检查三类任务适配判断是否真正理解。" },
      { id: "practice", kind: "PRACTICE", title: "给自己的 3 个任务分类，再做出第一版", objective: "完成真实任务分类，选 1 个任务生成并保留 AI 第一版。" },
      { id: "review", kind: "REVIEW", title: "以后遇到新任务，先用这 4 个判断", objective: "留下任务清楚、AI 能否协助、错误后果、最终判断权四个复盘点。" },
      { id: "capability", kind: "CAPABILITY", title: "你已经会安全地开始一个 AI 任务", objective: "确认学习者能选任务、定边界并留下下一课可继续使用的真实产物。" }
    ],
    capabilityGain: [
      "能判断一个真实任务应该让 AI 帮到什么程度，并安全地生成一个可继续加工的第一版。"
    ],
    nextLessonValue:
      "下一课直接使用你刚才选中的任务和第一版，把“我想让 AI 帮一下”整理成清楚、可执行、可检查的任务说明。",
    accessPresentation
  },
  content: {
    summary:
      "先不学复杂术语。你会从自己的真实工作出发，判断哪些事情适合让 AI 协助、哪些要更谨慎，以及哪些最终决定必须留在人手里。",
    plainExplanation:
      "AI 很擅长先起草、整理、提取、比较和给方向，但“能生成一个答案”和“应该替你做决定”不是一回事。第一次真正学会用 AI，最重要的是先判断它应该参与到哪一步，再让它产生一个你可以继续检查和修改的中间结果。",
    whyItMatters:
      "如果没有这层判断，你很容易走向两个极端：什么都不敢交给 AI，或者看到它会回答就什么都交给它。先学会选对任务，后面的提示词、上下文、迭代和核验才有真实对象。",
    points: [
      "可协助：AI 先产生草稿、整理结果或候选方向，你可以很快检查。",
      "需谨慎核验：AI 可以先帮忙，但事实、日期、数字等不能只看它写得顺不顺。",
      "人负责最终决定：涉及重要承诺、资金或最终发布决定时，可以参考 AI，但责任不能一起交出去。"
    ],
    content: [
      "第一课只建立一级边界，不要求你现在学会完整核验方法。",
      "最好的起点通常是你本来就熟悉、结果又容易检查的真实任务。",
      "真正的学习产物不是“我知道 AI 很厉害”，而是一个你选对了边界、并已经开始加工的真实任务。"
    ],
    example: {
      title: "三件真实工作，AI 应该参与到不同程度",
      situation:
        "上午你要整理会议记录、写一段活动介绍，还要决定是否批准一笔重要支出。",
      before:
        "如果只问“AI 能不能做”，三件事它都能给出某种答案，但你还不知道答案应该被怎么使用。",
      after:
        "会议记录可以让 AI 先整理行动项；活动介绍可以让 AI 起草，但事实要自己核对；重要支出可以让 AI 帮你列分析点，最终批准仍由人负责。",
      result:
        "关键不是把任务分成“AI 会 / AI 不会”，而是判断 AI 应该帮到什么程度。"
    },
    mistakes: [
      "问题：AI 能回答，就代表可以直接采用｜正确理解：能生成结果不等于结果已经可靠或适合直接使用。",
      "问题：只要有风险，就完全不能用 AI｜正确理解：很多任务仍可让 AI 做分析或草稿，只是后续检查强度不同。",
      "问题：把最终责任也交给 AI 才算自动化｜正确理解：这一课只学习协助边界，权限和自动执行会在后面的安全课程学习。"
    ],
    related: [
      "下一课会把当前真实任务整理成清楚的任务说明。",
      "当前第一版会继续用于后面的补资料、改进和核验。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t101_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question:
        "你有一页自己参加过的会议记录，想快速整理出待办事项。下面哪种做法最合适？",
      options: [
        { value: "A", label: "让 AI 先整理一版行动清单，再根据自己的会议记忆逐项检查" },
        { value: "B", label: "让 AI 根据会议记录直接决定哪些员工应该被处罚" },
        { value: "C", label: "因为 AI 可能出错，所以完全不能用它处理会议记录" }
      ],
      correctValues: ["A"],
      explanation: "整理已有资料、产生容易检查的中间结果，是很适合 AI 协助的任务。",
      correctFeedback: "正确。AI 先帮你把杂乱信息变成可检查的第一版，你继续负责判断。",
      incorrectFeedback: "先问自己：AI 能不能先产生一个容易检查的中间结果？如果可以，就不必把整个决定都交给它，也不必完全拒绝使用。"
    },
    {
      id: "t101_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question: "判断：只要一件事最后必须由人决定，就完全不应该让 AI 参与。",
      options: [{ value: "TRUE", label: "对" }, { value: "FALSE", label: "错" }],
      correctValues: ["FALSE"],
      explanation: "最终决定需要人负责，不代表前面的整理、比较、起草或分析也不能让 AI 协助。",
      correctFeedback: "正确。要区分“AI 可以协助”与“AI 可以替你做最终决定”。",
      incorrectFeedback: "很多重要任务也可以让 AI 做前置协助，只是最终责任仍然在人。"
    },
    {
      id: "t101_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question: "下面哪些做法符合这一课的任务边界？（多选）",
      options: [
        { value: "DRAFT", label: "让 AI 根据已有资料先起草一版活动介绍，再自己核对事实" },
        { value: "SUMMARY", label: "让 AI 先把一页长资料整理成重点，再自己判断有没有遗漏" },
        { value: "OPTIONS", label: "让 AI 为一个选择列出几种方案和利弊，最终由自己决定" },
        { value: "AUTHORITY", label: "让 AI 直接替你批准付款，因为它已经分析过资料" }
      ],
      correctValues: ["DRAFT", "SUMMARY", "OPTIONS"],
      explanation: "AI 很适合先产生中间结果；最终责任和重要决定不能因为 AI 参与过就自动转移。",
      correctFeedback: "正确。你已经能区分“让 AI 帮忙”和“把最终判断交给 AI”。",
      incorrectFeedback: "再找共同点：哪些选项只是让 AI 产生可检查的中间结果，哪些把最终责任也交了出去？"
    }
  ],
  practice: {
    id: "t101_task_fit_first_draft",
    title: "给 3 个真实任务分类，再做出你的 AI 第一版",
    goal: "从自己的真实工作中完成一次任务适配判断，并留下后续 T1-02 可以继续使用的第一版。",
    instructions: [
      { key: "tasks", label: "我的 3 个真实任务 + 分类", prompt: "写 3 个你最近真的要做的任务，并分别标记：AI 可协助 / 需谨慎核验 / 人负责最终决定。" },
      { key: "goal", label: "我选中的任务 + 一句话目标", prompt: "从中选 1 个适合 AI 先协助的任务，用一句话写清你希望它先帮你得到什么。" },
      { key: "draft", label: "AI 给出的第一版", prompt: "把这句话交给你常用的 AI 软件，把它生成的第一版粘贴或记录在这里。现在不要提前优化。" }
    ],
    hints: [
      "1｜先选你自己熟悉的任务，这样你更容易判断 AI 有没有帮到点上。",
      "2｜分类看的是“AI 应该帮到什么程度”，不是判断它技术上能不能生成文字。",
      "3｜第一版只要能继续检查和修改就够了，不需要现在追求完美。"
    ],
    rubric: [
      { key: "tasks", label: "3 个任务真实且完成分类", maxScore: 35, minScore: 18, example: "整理会议记录—AI 可协助；核对活动日期—需谨慎核验；批准付款—人负责最终决定。" },
      { key: "goal", label: "选中的任务目标具体", maxScore: 25, minScore: 13, example: "把今天的会议记录先整理成待办事项清单。" },
      { key: "draft", label: "留下可继续加工的第一版", maxScore: 40, minScore: 20, example: "保留 AI 根据任务目标生成的第一版结果，下一课继续使用。" }
    ],
    passScore: 60
  },
  hints: [
    "如果不知道选什么，就从“整理已有资料、写第一版、列候选方向”里找一个真实任务。",
    "不要在这一课提前优化提示词；先保留最初任务目标和第一版，下一课会专门处理。"
  ],
  referenceAnswer:
    "我的 3 个真实任务 + 分类：\n1. 整理今天的项目会议记录——AI 可协助。\n2. 写一段包含活动日期的对外介绍——需谨慎核验。\n3. 批准一笔供应商付款——人负责最终决定。\n\n我选中的任务 + 一句话目标：把今天的会议记录先整理成“待办事项 / 负责人 / 时间”三栏。\n\nAI 给出的第一版：保留 AI 生成的第一版行动清单，先不继续优化，下一课再把任务要求说得更清楚。",
  review: [
    "任务先看清｜先确认自己到底要完成什么，避免因为 AI 能回答就直接开始。",
    "协助程度要匹配｜优先让 AI 产生容易检查的中间结果，而不是默认把整个任务交出去。",
    "错误后果要有感觉｜结果错了越麻烦，就越不能只看 AI 写得是否流畅；完整核验方法后面再学。",
    "最终判断权要明确｜AI 可以提供草稿、整理和分析，但重要最终决定仍由人负责。"
  ],
  selfAssessment: [
    "我能拿出 3 个自己的真实任务，并说明 AI 应该参与到什么程度。",
    "我已经选出 1 个适合 AI 协助的任务，并保留了一句话目标和 AI 第一版。",
    "我知道为什么这份第一版还不是最终结果，也知道下一课会继续使用它。"
  ]
} as const;

export const track01T101KnowledgeDepth = {
  example: [
    { title: "不是“AI 会不会”，而是“AI 应该帮到哪一步”", text: "同一个任务里，AI 可能很适合整理资料，却不适合替你承担最终批准或承诺。" }
  ],
  review: [
    { title: "先要中间结果", text: "草稿、清单、候选方案通常比最终决定更适合作为 AI 的第一次参与点。" },
    { title: "先保留责任边界", text: "AI 帮你更快形成判断材料，不代表最终责任也跟着转移。" }
  ]
} as const;

export const track01T101ReferenceFill = {
  tasks: "1. 整理会议记录—AI 可协助；2. 写带日期的活动介绍—需谨慎核验；3. 批准供应商付款—人负责最终决定。",
  goal: "把今天的会议记录先整理成“待办事项 / 负责人 / 时间”三栏。",
  draft: "待办事项：整理客户反馈；负责人：小林；时间：周五前。下一课继续用这份第一版检查任务说明是否足够清楚。"
} as const;
