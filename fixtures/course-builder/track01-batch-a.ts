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
  artifactOutput: "TASK_FIT_NOTE",
  nextReuse: "T1-02_CLEAR_TASK_BRIEF"
} as const;

export const track01T101Intro = {
  situation: "你准备做一条 AI 内容：要想标题、整理手里的资料，还要决定从哪个角度讲。第一次接触 AI 时，不需要先懂技术，先看它能不能帮你把这些内容工作变轻一点。",
  approaches: [
    { label: "全部自己从头做", text: "自己想标题、整理资料、找角度，时间容易花在重复整理和从空白开始上。" },
    { label: "让 AI 先协助", text: "把已有资料和目标交给 AI，让它先起草、整理或给几个方向，再由你判断和修改。" }
  ],
  comparison: [],
  takeaway: "第一步不是记住 AI 的定义，而是学会看见：哪些工作可以先让 AI 帮一把。",
  bottomDetails: [
    { title: "先从一个小步骤开始", text: "第一次用 AI，不需要一上来做复杂项目。让它先起草、整理或列思路，你更容易判断它到底有没有帮到你。" },
    { title: "优先选你熟悉的事情", text: "你越熟悉任务，就越容易发现 AI 哪里做得对、哪里需要改。新手第一步不是追求神奇，而是建立判断感。" }
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
      "本课只建立 Everyday AI task fit 的一级判断：先从 OPC / 自媒体内容生产里最常见的起草、整理资料、找角度看见 AI 的协助入口，再理解事实需要核验、最终发布判断仍由人负责。Hallucination、正式 Verification、Permissions/HITL、模型机制均后置。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "做一条内容时，哪些步骤可以先让 AI 帮一把？",
      mainConcept: "AI 适合先协助起草、整理、总结和找思路，人继续负责检查与最终判断。",
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
      kind: "MINI_TASK",
      title: "从你正在做的内容里找一个 AI 可以先帮忙的步骤",
      instruction: "不用想复杂。想一条你准备做的内容，再写清楚 AI 可以先帮你做哪一步，例如想标题、整理资料或列几个内容角度。",
      prompt: null,
      reflection: "重点不是把整件工作交出去，而是先找到一个可以减少重复脑力劳动的小入口。"
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
      "能从一条真实内容任务中找出一个适合先让 AI 协助的步骤。"
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
      { id: "explain", kind: "EXPLAIN", title: "先从做一条内容开始", objective: "让新手先看见 AI 和 OPC / 自媒体内容工作的关系。" },
      { id: "example", kind: "EXAMPLE", title: "看一条内容里，AI 可以先帮哪几步", objective: "用想标题、整理资料、找内容角度三个场景建立使用直觉。" },
      { id: "check", kind: "CHECK", title: "哪些事情适合先让 AI 协助？", objective: "检查学习者是否能识别合适的使用场景和边界。" },
      { id: "practice", kind: "PRACTICE", title: "找出你自己的第一个 AI 使用场景", objective: "把前三步已经理解的方法落到学习者自己的真实工作。" },
      { id: "review", kind: "REVIEW", title: "做内容时，记住这 3 件事", objective: "把本课收束成 AI 先帮一步、自己检查、自己做最终决定三个容易记住的复盘点。" },
      { id: "capability", kind: "CAPABILITY", title: "你已经会安全地开始一个 AI 任务", objective: "确认学习者能选任务、定边界并留下下一课可继续使用的真实产物。" }
    ],
    capabilityGain: [
      "能从一条真实内容任务中找出一个适合先让 AI 协助的步骤，并说清 AI 先帮什么。"
    ],
    nextLessonValue:
      "下一课可以继续使用你刚才找到的真实任务，把模糊需求整理成更清楚的任务说明。",
    accessPresentation
  },
  content: {
    summary: "先不学技术名词。你会从做一条真实内容出发，看懂 AI 最容易先帮你处理哪些步骤。",
    plainExplanation: "刚开始用 AI，不需要先知道它内部怎么工作。以一条内容为例，你可以让它先帮你想标题、整理已有资料、列几个表达角度；这些都是容易检查的中间工作，最后怎么写、事实是否准确、要不要发布仍由你判断。",
    whyItMatters: "如果第一步就是背概念，很容易觉得 AI 离自己很远。先在真实工作里看见一点价值，你才知道后面为什么值得继续学。",
    points: [
      "起草：根据已有主题先给标题、开头或结构。",
      "理资料：把已经收集的素材分类、总结、提取重点。",
      "找角度：围绕一个确定主题列几个表达方向，帮助你开始思考。"
    ],
    content: [
      "AI 很适合先做起草、整理、总结和找思路这类容易检查的中间工作。",
      "你仍然需要提供真实信息，并判断结果有没有偏差。",
      "涉及重要事实、金额、承诺或最终决定时，不要因为 AI 能回答就直接采用。"
    ],
    example: {
      title: "做一条 AI 内容，先让 AI 帮三个小步骤",
      situation: "你已经确定要做一条 AI 工具体验内容，手里也有自己收集的资料，但还没开始整理。",
      before: "你需要自己从头想标题、整理资料，还要决定内容从哪个角度切入。",
      after: "先让 AI 根据主题给几个标题方向；把已有资料整理成重点；再列几个可以展开的内容角度。",
      result: "AI 先完成了几个容易检查的中间步骤，你再决定用哪个标题、保留哪些资料、最后从哪个角度发布。"
    },
    mistakes: [
      "误区：AI 写得很像真的，就可以直接发布｜正确理解：表达流畅不代表事实准确，日期、数字、功能信息仍要自己确认。",
      "误区：AI 给了几个标题或角度，就应该直接选一个用｜正确理解：AI 负责提供候选，你仍要判断哪个最适合这条内容。",
      "误区：AI 已经帮了很多，就可以让它决定最终怎么发｜正确理解：AI 可以参与很多步骤，但最终取舍和发布决定仍由你负责。"
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
        "你已经收集了一些 AI 工具资料，准备做一条内容。下面哪种做法最适合先让 AI 协助？",
      options: [
        { value: "A", label: "让 AI 先把已有资料整理成几个重点，再由自己检查和取舍" },
        { value: "B", label: "让 AI 直接决定哪些未经确认的说法可以发布" },
        { value: "C", label: "因为 AI 可能出错，所以完全不能用它整理内容资料" }
      ],
      correctValues: ["A"],
      explanation: "整理已有资料、产生容易检查的中间结果，是很适合 AI 协助的内容工作。",
      correctFeedback: "正确。AI 先帮你把已有材料整理清楚，你继续负责核对、取舍和最终发布。",
      incorrectFeedback: "先看哪些步骤只是产生一个容易检查的中间结果。整理资料可以先交给 AI，但事实确认和最终发布判断仍要自己负责。"
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
        { value: "DRAFT", label: "让 AI 根据已有主题先给几个标题或开头方向，再自己挑选" },
        { value: "SUMMARY", label: "让 AI 把已经收集的内容资料整理成重点，再自己核对有没有遗漏" },
        { value: "OPTIONS", label: "让 AI 围绕一个确定主题列几个表达角度，最终由自己决定采用哪个" },
        { value: "AUTHORITY", label: "让 AI 直接决定未经确认的信息可以正式发布" }
      ],
      correctValues: ["DRAFT", "SUMMARY", "OPTIONS"],
      explanation: "AI 很适合先产生中间结果；最终责任和重要决定不能因为 AI 参与过就自动转移。",
      correctFeedback: "正确。你已经能区分“让 AI 帮忙”和“把最终判断交给 AI”。",
      incorrectFeedback: "再找共同点：哪些选项只是让 AI 产生可检查的中间结果，哪些把最终责任也交了出去？"
    }
  ],
  practice: {
    id: "t101_first_ai_use_case",
    title: "找到你自己的第一个 AI 使用场景",
    goal: "从你准备做的一条真实内容里，找一个适合 AI 先协助的小步骤。",
    instructions: [
      { key: "task", label: "我原本要做的事", prompt: "写一条你准备做的真实内容，例如介绍一个 AI 工具、分享一个使用方法或做一次体验内容。" },
      { key: "help", label: "AI 先帮哪一步", prompt: "只写一个小步骤，例如想标题、整理已有资料、列几个内容角度或先起草一段。" }
    ],
    hints: [
      "1｜选一个你熟悉的任务，方便你判断 AI 做得好不好。",
      "2｜只找一个小步骤，不要把整件工作一次性交出去。"
    ],
    rubric: [
      { key: "task", label: "内容任务真实具体", maxScore: 50, minScore: 25, example: "做一条介绍某个 AI 工具实际用途的内容。" },
      { key: "help", label: "协助步骤清楚", maxScore: 50, minScore: 25, example: "先根据我已有的资料列 3 个标题方向。" }
    ],
    passScore: 60
  },
  hints: [
    "先找文字、资料或思路类任务。",
    "优先选择结果容易由你自己检查的事情。"
  ],
  referenceAnswer:
    "我原本要做的事：做一条介绍某个 AI 工具实际用途的内容。\nAI 先帮哪一步：先根据我已有的资料列 3 个标题方向。",
  review: [
    "先找 AI 最适合介入的一步｜优先从想标题、整理已有资料、列内容角度、起草一段这些“做完后你能马上看懂”的步骤开始。",
    "分清“创意建议”和“事实信息”｜标题、表达角度可以拿来挑选和修改；日期、数字、功能说明、来源等事实信息，需要另外确认准确性。",
    "把 AI 放在“给方案”的位置｜让 AI 提供草稿、整理结果和候选方向，你根据目标和实际情况做取舍，再决定最后采用什么。"
  ],
  selfAssessment: [
    "我能想到至少一个和自己工作有关的 AI 使用场景。",
    "我能说清楚 AI 先帮哪一步，而不是把整件工作全部交出去。",
    "我知道 AI 可以协助起草、整理和找思路，但重要事实和最终判断仍需要我负责。"
  ]
} as const;

export const track01T101KnowledgeDepth = {
  example: [
    { title: "不是“AI 会不会”，而是“AI 应该帮到哪一步”", text: "同一个任务里，AI 可能很适合整理资料，却不适合替你承担最终批准或承诺。" }
  ],
  review: [
    { title: "为什么先从小步骤开始", text: "因为标题、资料整理、内容角度这些结果，你一眼就能看懂和修改。第一次用 AI 时，先从这种容易判断的步骤开始，最容易建立正确使用感觉。" },
    { title: "为什么要把事实信息单独看", text: "标题和表达角度主要是创意选择，但日期、数字、功能说明、来源属于事实信息。两类内容的判断方式不同，后者不能只因为 AI 写得顺就直接采用。" },
    { title: "为什么 AI 更适合先给方案", text: "AI 很擅长快速给出草稿、整理结果和多个候选方向。你再结合自己的目标、资料和判断做取舍，这样既能提速，也不会把最终决定一起交出去。" }
  ]
} as const;

export const track01T101ReferenceFill = {
  task: "做一条介绍某个 AI 工具实际用途的内容。",
  help: "先根据我已有的资料列 3 个标题方向。"
} as const;
