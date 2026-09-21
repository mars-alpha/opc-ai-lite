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
  caseThread: "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT",
  inheritedArtifact: "REAL_TASK_IDEA",
  artifactOutput: "TASK_FIT_NOTE_WITH_SELECTED_TASK_GOAL",
  nextReuse: "T1-02_CLEAR_TASK_BRIEF"
} as const;

export const track01T101Intro = {
  situation: "你刚看到一个值得分享的 AI 新变化，手里只有几句零散想法。先别想复杂：第一步只是让 AI 帮你把这些想法整理成 3 个清楚重点。",
  approaches: [
    {
      label: "自己从零整理",
      text: "一边想内容、一边想顺序，容易卡在空白页，迟迟没有第一版。"
    },
    {
      label: "先让 AI 整理第一步",
      text: "把已有的几句想法交给 AI，让它先整理成 3 个重点，你马上就有一个可以继续判断和修改的结果。"
    }
  ],
  comparison: [],
  takeaway: "第一课先做成一件小事：让 AI 帮你把零散想法整理清楚。做出来之后，再慢慢学会判断它还适合帮哪些事情。",
  bottomDetails: [
    {
      title: "从你自己熟悉的任务开始",
      text: "你越熟悉任务，就越容易判断 AI 的结果有没有偏，也越容易建立真正可迁移的使用判断。"
    },
    {
      title: "先体验，再扩展判断",
      text: "先通过一个简单任务感受 AI 的协助价值，再从这个体验扩展到“哪些可以交给 AI、哪些需要更谨慎”。"
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
      mainLearnerQuestion: "我第一次用 AI，可以先让它帮我做哪件简单的小事？",
      mainConcept: "先让 AI 完成一个容易看懂的小任务，再逐步建立任务边界判断。",
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
      title: "先完成你的第一个 AI 小任务",
      instruction:
        "你可以把下面这句话复制到常用 AI，体验一次最简单的整理任务。这个体验不需要把 AI 回复粘贴回课程，也不参与课程评分。",
      prompt: "请把下面这些零散想法整理成 3 个清楚、普通人容易看懂的重点。不要补充我没有提供的新事实。",
      reflection: "只需要感受：AI 可以先帮你整理已有内容。课程里真正要留下的是你对任务边界的判断，以及你选中的真实任务。"
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
      "能选择一个适合的真实任务，并写清自己准备让 AI 协助完成什么。"
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
      { id: "explain", kind: "EXPLAIN", title: "先让 AI 帮你完成一件小事", objective: "从一个简单内容整理任务建立第一次成功体验，降低第一课认知负担。" },
      { id: "example", kind: "EXAMPLE", title: "从整理 3 个重点，再慢慢看 AI 还能帮什么", objective: "从已完成的小任务扩展到起草、整理、核验与最终判断的不同边界。" },
      { id: "check", kind: "CHECK", title: "你会判断 AI 适合帮到什么程度吗", objective: "通过真实情境检查三类任务适配判断是否真正理解。" },
      { id: "practice", kind: "PRACTICE", title: "给自己的 3 个任务分类，再选出一个", objective: "完成真实任务分类，选 1 个适合 AI 协助的任务并写清目标。" },
      { id: "review", kind: "REVIEW", title: "以后遇到新任务，先用这 4 个判断", objective: "留下任务清楚、AI 能否协助、错误后果、最终判断权四个复盘点。" },
      { id: "capability", kind: "CAPABILITY", title: "你已经会安全地开始一个 AI 任务", objective: "确认学习者能选任务、定边界并留下下一课可继续使用的真实产物。" }
    ],
    capabilityGain: [
      "能判断一个真实任务应该让 AI 帮到什么程度，并选出一个适合继续交给 AI 的真实任务。"
    ],
    nextLessonValue:
      "下一课直接使用你刚才选中的任务和一句话目标，把“我想让 AI 帮一下”整理成清楚、可执行、可检查的任务说明。",
    accessPresentation
  },
  content: {
    summary:
      "第一课只从一个很简单的任务开始：把几句零散想法交给 AI，让它整理成 3 个清楚重点。做完以后，再逐步认识 AI 可以帮到什么程度。",
    plainExplanation:
      "刚开始学 AI，不需要先理解一堆边界和术语。你可以先把它当成一个整理助手：你已经有一些内容，它先帮你排清楚。等你亲眼看到这个小任务完成，再去理解“起草、整理、核验、最终决定”之间有什么不同，会容易很多。",
    whyItMatters:
      "第一课最重要的是先建立“我真的用 AI 完成了一件事”的感觉。只有先有这个简单体验，后面的任务判断、任务说明、补资料、修改和核验才不会变成抽象概念。",
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
      title: "先把一个 AI 新变化整理成 3 个重点",
      situation:
        "你准备做一条 AI 学习内容，手里只有三句零散想法：功能变简单了、普通人更容易用、但重要信息仍要自己确认。",
      before:
        "三句话散在一起，你知道大概想说什么，但还没有清楚结构。",
      after:
        "让 AI 只做一件事：把已有内容整理成 3 个普通人容易看懂的重点，不补充新的事实。",
      result:
        "你马上得到一个清楚的第一版。接着再看：整理和起草可以让 AI 多帮一点，事实信息要谨慎核验，最终发布决定仍由你负责。"
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
    id: "t101_task_fit_selected_goal",
    title: "给 3 个真实任务分类，再选出一个",
    goal: "把刚才的判断迁移到自己的真实任务，并留下下一课真正会继续使用的任务与目标。",
    instructions: [
      { key: "tasks", label: "我的 3 个真实任务", prompt: "写 3 个你最近真的要做的任务，并分别标记：AI 可协助 / 需谨慎核验 / 人负责最终决定。" },
      { key: "goal", label: "我选中的任务", prompt: "从上面选 1 个适合 AI 协助的任务，用一句话写清楚：你想让 AI 先帮你完成什么。" }
    ],
    hints: [
      "1｜先写你最近真的会做的事，不需要为了课程编一个复杂案例。",
      "2｜分类只判断 AI 应该参与到什么程度。",
      "3｜第二栏只写你自己的任务目标，不需要粘贴任何 AI 回复。"
    ],
    rubric: [
      { key: "tasks", label: "3 个任务真实且完成分类", maxScore: 50, minScore: 30, example: "整理 AI 新变化的零散想法—AI 可协助；核对功能发布日期—需谨慎核验；决定内容是否正式发布—人负责最终决定。" },
      { key: "goal", label: "选中的任务目标清楚", maxScore: 50, minScore: 30, example: "把我对这个 AI 新变化的零散想法整理成 3 个普通人容易看懂的重点。" }
    ],
    passScore: 60
  },
  hints: [
    "如果不知道选什么，就从“整理已有资料、写一段内容、列几个候选方向”里找一个真实任务。",
    "这一课只需要留下你自己的任务判断和目标；AI 的外部回复不需要回填到课程。"
  ],
  referenceAnswer:
    "1. 整理一个 AI 新变化的零散想法——AI 可协助。\n2. 核对这个功能的正式发布日期——需谨慎核验。\n3. 决定内容是否正式发布——人负责最终决定。\n\n把我对这个 AI 新变化的零散想法整理成 3 个普通人容易看懂的重点。",
  review: [
    "任务先看清｜先确认自己到底要完成什么，避免因为 AI 能回答就直接开始。",
    "协助程度要匹配｜优先让 AI 产生容易检查的中间结果，而不是默认把整个任务交出去。",
    "错误后果要有感觉｜结果错了越麻烦，就越不能只看 AI 写得是否流畅；完整核验方法后面再学。",
    "最终判断权要明确｜AI 可以提供草稿、整理和分析，但重要最终决定仍由人负责。"
  ],
  selfAssessment: [
    "我能拿出 3 个自己的真实任务，并说明 AI 应该参与到什么程度。",
    "我已经选出 1 个适合 AI 协助的任务，并能用一句话说清楚想让 AI 先帮我做什么。",
    "我知道课程只需要保留我的任务判断和目标，不需要把外部 AI 回复再粘贴回来。"
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
  tasks: "1. 整理一个 AI 新变化的零散想法—AI 可协助；2. 核对功能正式发布日期—需谨慎核验；3. 决定内容是否正式发布—人负责最终决定。",
  goal: "把我对这个 AI 新变化的零散想法整理成 3 个普通人容易看懂的重点。"
} as const;
