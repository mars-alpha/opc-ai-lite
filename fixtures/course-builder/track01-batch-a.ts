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
      "选一个你熟悉的任务，方便你判断 AI 做得好不好。",
      "只找一个小步骤，不要把整件工作一次性交出去。"
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
    "先做第一版：想标题、整理资料、列内容角度、起草一段｜替你决定最终采用什么、怎么表达、要不要发布。",
    "提供创意方案：给多个标题、角度和表达方式｜把日期、数字、功能说明、来源等事实信息当成已经确认。",
    "整理和比较：归纳资料、比较选项、列出优缺点｜替你承担承诺、发布和最终判断的责任。"
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

export const track01T102Meta = {
  canonicalId: "T1-02",
  draftVersion: "1.0.0-track01-a",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT",
  inheritedArtifact: "TASK_FIT_NOTE",
  artifactOutput: "CLEAR_TASK_BRIEF",
  nextReuse: "T1-03_MINIMUM_CONTEXT_PACK"
} as const;

export const track01T102Intro = {
  situation: "你已经决定做一条“介绍某个 AI 工具实际用途”的内容，也知道想先让 AI 帮你起草。但如果只对 AI 说“帮我写一下”，它并不知道你到底想写给谁、重点是什么、最后要长什么样。",
  approaches: [
    { label: "只说“帮我写一下”", text: "AI 只能自己猜目标、对象和格式，结果可能看起来完整，却不是你真正需要的内容。" },
    { label: "把任务说清楚", text: "先告诉 AI 要完成什么、给谁看、有哪些关键要求、希望输出成什么样，它才更容易给出可用的第一版。" }
  ],
  comparison: [],
  takeaway: "提示词（Prompt）不是越长越好，而是要把这次任务真正需要执行的要求说清楚。",
  bottomDetails: [
    { title: "先说任务，不先堆资料", text: "这一课只解决“AI 要做什么”。背景资料、参考内容和业务事实留到下一课再学，不要和任务说明混在一起。" },
    { title: "四项够用就停", text: "目标、对象、关键要求、输出形式已经能让多数日常任务明显更清楚。第一阶段不需要背复杂的提示词模板。" }
  ],
  comparisonPlacement: "BOTTOM"
} as const;

export const track01T102Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "Track 01 Batch A Formal Brief · T1-02",
      "Lesson Output Contract v1"
    ],
    researchSummary:
      "本课只教 Prompt 的最低任务说明能力：明确任务目标、使用对象、关键要求与限制、输出形式。Prompt = Task Instruction；Context = Task Information，Context、System Prompt、Prompt Engineering 技巧均后置。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "为什么“帮我写一下”经常得不到我真正想要的结果？",
      mainConcept: "把任务目标、使用对象、关键要求和输出形式说清楚，AI 才知道这次到底要完成什么。",
      allowedCoreTerms: ["Prompt"],
      deferredTerms: [
        "Context",
        "System Prompt",
        "Prompt Engineering",
        "RAG",
        "Tool",
        "MCP",
        "Agent"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "把同一个任务说得更清楚",
      instruction: "完成四个字段后，你可以把整理好的清晰任务说明复制到常用 AI，和原来的“帮我写一下”比较一次。课程不要求把 AI 回复粘贴回来。",
      prompt: "请根据我提供的任务说明完成内容。不要补充我没有要求的事实。",
      reflection: "重点不是记模板，而是感受：任务说得越清楚，AI 越少需要猜。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0-track01-a",
    courseSlug: "foundation-ai",
    lessonId: "t1-02-clear-prompt",
    title: "提示词（Prompt）：把任务说清楚",
    lessonType: "APPLICATION",
    learningObjectives: [
      "能区分模糊要求和可执行的任务说明。",
      "能用任务目标、使用对象、关键要求与限制、输出形式四项把任务说清楚。",
      "能完成一份自己的清晰任务说明。"
    ],
    knowledgePoints: [
      "提示词（Prompt）在本课只表示这次要 AI 做什么，不等于把所有背景资料都塞进去。",
      "清楚的任务说明至少要让 AI 知道目标、对象、关键要求和输出形式。",
      "任务说明的价值不是写得长，而是减少 AI 对任务意图的猜测。"
    ],
    prerequisites: ["T1-01"],
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
      { id: "explain", kind: "EXPLAIN", title: "“帮我写一下”到底少了什么", objective: "让学习者看见模糊要求会迫使 AI 猜任务。" },
      { id: "example", kind: "EXAMPLE", title: "同一个内容任务，为什么第二种说法更好用", objective: "只补齐目标、对象、要求和输出形式，观察任务说明如何从模糊变得可执行。" },
      { id: "check", kind: "CHECK", title: "这句话真的把任务说清楚了吗", objective: "检查学习者能否识别真正可执行的任务说明。" },
      { id: "practice", kind: "PRACTICE", title: "把你自己的任务写成清晰任务说明", objective: "把真实内容任务拆成四个已经学会的字段。" },
      { id: "review", kind: "REVIEW", title: "以后写 Prompt，先检查这 4 件事", objective: "留下目标、对象、要求、输出四个可复用判断。" },
      { id: "capability", kind: "CAPABILITY", title: "你已经能把模糊需求变成可执行任务", objective: "确认学习者能独立写出一份清晰任务说明，并知道下一课只补任务所需信息。" }
    ],
    capabilityGain: [
      "能把一个模糊内容需求整理成目标、对象、要求、输出都清楚的清晰任务说明。"
    ],
    nextLessonValue:
      "下一课不再改“AI 要做什么”，而是学习判断：为了完成这个任务，AI 还需要知道哪些信息。",
    accessPresentation
  },
  content: {
    summary: "你会把“帮我写一下”这种模糊要求，变成 AI 真正可以执行和检查的任务说明。",
    plainExplanation:
      "AI 不会自动知道你脑子里的目标。你只说“帮我写一下”，它就必须猜：写什么、给谁看、有什么限制、最后要什么格式。提示词（Prompt）的第一层能力，就是把这些任务要求说清楚。",
    whyItMatters:
      "很多 AI 结果不好，不一定是模型不行，而是任务本身没有说清楚。先学会把任务说明写清，后面的补资料、修改和核验才有稳定起点。",
    points: [
      "任务目标：这次到底要 AI 完成什么。",
      "使用对象：结果主要给谁看、谁会使用。",
      "关键要求 / 限制：这次必须满足什么、避免什么。",
      "输出形式：最后希望得到什么结构或格式。"
    ],
    content: [
      "四项不是万能公式，而是一份最低够用的任务说明。",
      "提示词（Prompt）负责说清“做什么”；完成任务所需的事实、资料和背景留到下一课再补。",
      "如果一条提示词很长，却仍然说不清目标、对象、要求和输出，它依然是模糊的。"
    ],
    example: {
      title: "同一条 AI 工具内容，从“帮我写一下”到真正可执行",
      situation:
        "你准备做一条介绍某个 AI 工具实际用途的内容，想让 AI 先帮你起草。",
      before:
        "你只输入：帮我写一条这个 AI 工具的介绍。",
      after:
        "你改成：为第一次接触这个工具的普通用户，写一条介绍它实际用途的短内容；重点讲 3 个日常可用场景，不夸大能力；输出为“标题 + 3 个要点 + 一句总结”。",
      result:
        "第二种说法没有增加大量背景资料，只是把目标、对象、关键要求和输出形式说清楚，AI 就更少需要自己猜任务。"
    },
    mistakes: [
      "误区：提示词越长越专业｜正确理解：长度不是目标，关键是任务要求是否清楚。",
      "误区：把所有资料都塞进提示词才完整｜正确理解：这一课只先说清任务，任务所需资料留到下一课再补。",
      "误区：写了“专业一点、好一点”就算有要求｜正确理解：要求要尽量具体到可以检查，例如“讲 3 个场景、不夸大能力”。"
    ],
    related: [
      "你可以直接用一个自己真实想做的 AI 内容任务来练习。",
      "下一课会在清晰任务说明不变的前提下，补充完成任务真正需要的信息。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t102_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question: "你想让 AI 帮你写一条 AI 工具介绍。下面哪一句最接近“任务已经说清楚”？",
      options: [
        { value: "A", label: "帮我写一条专业一点、吸引人的 AI 内容。" },
        { value: "B", label: "给第一次接触这个工具的普通用户写一条短介绍，讲 3 个日常用途，不夸大能力，输出标题 + 3 个要点。" },
        { value: "C", label: "这个工具最近很火，你应该知道怎么写，发挥一下。" }
      ],
      correctValues: ["B"],
      explanation: "B 明确了任务目标、使用对象、关键要求和输出形式。",
      correctFeedback: "正确。你不需要把提示词写得很长，只要把执行任务真正需要的要求说清楚。",
      incorrectFeedback: "再检查四件事：要完成什么、给谁看、有什么关键要求、最后输出成什么样。"
    },
    {
      id: "t102_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question: "判断：提示词写得越长，AI 就一定越容易给出好结果。",
      options: [{ value: "TRUE", label: "对" }, { value: "FALSE", label: "错" }],
      correctValues: ["FALSE"],
      explanation: "长度不能代替任务清晰度。很长但目标模糊的提示词仍然会让 AI 猜。",
      correctFeedback: "正确。提示词的重点是任务清楚，不是字数多。",
      incorrectFeedback: "想一想：如果一大段话仍没说清目标和输出，AI 是否真的知道要做什么？"
    },
    {
      id: "t102_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question: "下面哪些信息属于这一课要写清楚的“任务说明”？（多选）",
      options: [
        { value: "GOAL", label: "要写一条介绍 AI 工具实际用途的内容" },
        { value: "AUDIENCE", label: "主要给第一次接触这个工具的普通用户看" },
        { value: "FORMAT", label: "输出标题 + 3 个要点 + 一句总结" },
        { value: "SOURCE", label: "把过去半年收集的 20 篇行业资料全部提供给 AI" }
      ],
      correctValues: ["GOAL", "AUDIENCE", "FORMAT"],
      explanation: "目标、对象和输出形式属于任务说明；大量参考资料属于完成任务所需的信息，不在这一课展开。",
      correctFeedback: "正确。你已经能把“任务说明”和“任务所需资料”分开。",
      incorrectFeedback: "这一课只问“AI 要做什么”。资料、事实和参考内容先不要混进任务结构。"
    }
  ],
  practice: {
    id: "t102_clear_task_brief",
    title: "把你的真实任务说清楚",
    goal: "把你准备做的真实内容任务整理成一份清晰任务说明。",
    instructions: [
      { key: "goal", label: "任务目标", prompt: "这次到底要 AI 帮你完成什么？用一句话写清。" },
      { key: "audience", label: "使用对象", prompt: "这份结果主要给谁看或给谁使用？" },
      { key: "requirements", label: "关键要求 / 限制", prompt: "写 1～3 个这次必须满足或必须避免的要求。" },
      { key: "format", label: "输出形式", prompt: "希望 AI 最后按什么结构或格式输出？" }
    ],
    hints: [
      "先写“这次要完成什么”，不要把背景资料混进任务目标。",
      "对象写到能影响表达方式即可，例如“第一次接触这个工具的普通用户”。",
      "要求尽量写成能检查的条件，例如“讲 3 个场景”“不夸大能力”。",
      "输出形式只规定你真正需要的结构，不需要为了显得专业增加复杂格式。"
    ],
    rubric: [
      { key: "goal", label: "任务目标清楚", maxScore: 25, minScore: 15, example: "写一条介绍某个 AI 工具实际用途的短内容。" },
      { key: "audience", label: "使用对象明确", maxScore: 25, minScore: 15, example: "第一次接触这个工具、没有技术背景的普通用户。" },
      { key: "requirements", label: "关键要求可检查", maxScore: 25, minScore: 15, example: "重点讲 3 个日常使用场景；不夸大工具能力。" },
      { key: "format", label: "输出形式明确", maxScore: 25, minScore: 15, example: "标题 + 3 个要点 + 一句总结。" }
    ],
    passScore: 60
  },
  hints: [
    "如果不知道从哪里开始，就选一个你准备做的 AI 工具内容任务。",
    "四项写清楚就够了，这一课不要求加入参考资料或复杂的提示词技巧。"
  ],
  referenceAnswer:
    "任务目标：写一条介绍某个 AI 工具实际用途的短内容。\n使用对象：第一次接触这个工具、没有技术背景的普通用户。\n关键要求 / 限制：重点讲 3 个日常使用场景；不夸大工具能力。\n输出形式：标题 + 3 个要点 + 一句总结。",
  review: [
    "把任务目标说清楚｜替你猜这次真正想完成什么。",
    "把使用对象说清楚｜替你猜结果到底要给谁看、该用什么表达方式。",
    "把关键要求说清楚｜替你决定什么叫“专业一点”“好一点”或哪些限制最重要。",
    "把输出形式说清楚｜替你猜最后需要标题、清单、表格还是完整文章。"
  ],
  selfAssessment: [
    "我能指出一条模糊提示词到底缺了哪些任务信息。",
    "我能用目标、对象、要求、输出四项写出自己的清晰任务说明。",
    "我知道提示词（Prompt）负责说清任务，而不是把所有背景资料都塞进去。"
  ]
} as const;

export const track01T102KnowledgeDepth = {
  example: [
    { title: "不是“写更多”，而是“少让 AI 猜”", text: "任务目标、对象、要求、输出越清楚，AI 越少需要自己补全你的意图。" }
  ],
  review: [
    { title: "为什么目标必须先清楚", text: "如果连最终要完成什么都模糊，AI 只能自己选方向，后面的格式和语气要求很难补救。" },
    { title: "为什么对象会改变结果", text: "同一个主题，写给新手和写给专业用户，需要的解释深度、术语和表达方式都不同。" },
    { title: "为什么要求要能检查", text: "“好一点、专业一点”很难验收；“讲 3 个场景、不夸大能力”才知道有没有做到。" },
    { title: "为什么输出形式要提前说", text: "你需要的是标题、清单、表格还是完整文章，会直接影响 AI 如何组织答案。" }
  ]
} as const;

export const track01T102ReferenceFill = {
  goal: "写一条介绍某个 AI 工具实际用途的短内容。",
  audience: "第一次接触这个工具、没有技术背景的普通用户。",
  requirements: "重点讲 3 个日常使用场景；不夸大工具能力。",
  format: "标题 + 3 个要点 + 一句总结。"
} as const;

export const track01T103Meta = {
  canonicalId: "T1-03",
  draftVersion: "1.0.0-track01-a",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT",
  inheritedArtifact: "CLEAR_TASK_BRIEF",
  artifactOutput: "MINIMUM_INFORMATION_PACK",
  nextReuse: "T1-04_ITERATION"
} as const;

export const track01T103Intro = {
  situation: "你已经把任务说清楚：要做一条面向普通用户的 AI 工具内容。但 AI 仍然不知道你手里有哪些真实资料、哪些功能是你亲自试过的、哪些信息只是顺手收集来的。",
  approaches: [
    { label: "什么都不给", text: "AI 只能凭已有知识猜，很容易漏掉你的真实情况。" },
    { label: "把所有资料都塞进去", text: "重点反而可能被大量无关信息淹没，结果看起来更长，却不一定更准确。" }
  ],
  comparison: [],
  takeaway: "上下文（Context）的重点不是越多越好，而是给 AI 完成当前任务真正需要的信息。",
  bottomDetails: [
    { title: "先判断“完成任务缺什么”", text: "不是把手头所有资料都交给 AI，而是先从当前任务出发判断哪些信息真的会影响结果。" },
    { title: "够用就停", text: "只要已经足以完成当前任务，就先停下来。多余信息会增加噪音，也让你更难检查结果。" }
  ],
  comparisonPlacement: "BOTTOM"
} as const;

export const track01T103Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "Track 01 Batch A Formal Brief · T1-03",
      "Lesson Output Contract v1"
    ],
    researchSummary:
      "本课只教上下文（Context）的最低信息选择能力：从当前任务出发，把信息分成必须知道、有帮助但非必须、暂时不要放，并整理最小信息包。Knowledge Base、Source of Truth、Memory、RAG、Context Engineering 均后置。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "任务已经说清楚了，AI 还需要知道哪些信息？",
      mainConcept: "只给完成当前任务真正需要的信息，既不能缺关键背景，也不要把所有资料一次塞进去。",
      allowedCoreTerms: ["Context"],
      deferredTerms: [
        "Knowledge Base",
        "Source of Truth",
        "Memory",
        "RAG",
        "Context Engineering",
        "Vector",
        "Embedding",
        "Agent"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "复制到你的 AI 里验证一次",
      instruction: "把下面两项填好后，直接复制到你常用的 AI 软件里。看看只提供必要信息时，AI 是否已经能围绕你的真实任务给出更贴合的结果。课程不要求把 AI 回复粘贴回来。",
      prompt: "请根据我写清楚的任务和必要信息完成内容，只使用我提供的真实信息，不要自行补充未经确认的事实。",
      reflection: "如果 AI 已经能围绕你的任务和必要信息正常完成内容，就说明这份上下文已经基本够用；不需要为了显得完整继续塞资料。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0-track01-a",
    courseSlug: "foundation-ai",
    lessonId: "t1-03-minimum-context",
    title: "上下文（Context）：给 AI 足够但不过量的信息",
    lessonType: "APPLICATION",
    learningObjectives: [
      "能判断当前任务真正需要哪些信息。",
      "能判断哪些信息这次可以先不放。",
      "能整理一份足够但不过量的最小信息包。"
    ],
    knowledgePoints: [
      "上下文（Context）是 AI 为了完成当前任务需要知道的信息。",
      "信息过少会让 AI 缺关键背景，信息过多也会制造噪音。",
      "选择信息时要从当前任务出发，而不是从“我手里有什么资料”出发。"
    ],
    prerequisites: ["T1-02"],
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
      { id: "explain", kind: "EXPLAIN", title: "任务说清楚了，AI 为什么还是可能答不好", objective: "让学习者理解 AI 仍然缺少完成任务所需的信息。" },
      { id: "example", kind: "EXAMPLE", title: "同一条内容，信息太少、太多和刚好够用有什么区别", objective: "通过一个内容任务看见信息选择会直接影响结果。" },
      { id: "check", kind: "CHECK", title: "这些信息真的需要放进去吗", objective: "检查学习者能否区分必须、可选和暂时不要放的信息。" },
      { id: "practice", kind: "PRACTICE", title: "整理一段可以直接给 AI 使用的内容", objective: "写清当前任务，并只补充完成任务真正需要的信息。" },
      { id: "review", kind: "REVIEW", title: "准备信息时，记住这 2 个判断", objective: "留下“只选必要信息”和“够用就停”两个可复用判断。" },
      { id: "capability", kind: "CAPABILITY", title: "你已经会为 AI 准备刚好够用的信息", objective: "确认学习者能独立判断信息是否必要，并整理最小信息包。" }
    ],
    capabilityGain: [
      "能为一个真实 AI 任务准备足够但不过量的信息。"
    ],
    nextLessonValue:
      "下一课会在任务和信息都准备好的基础上，学习第一版结果不理想时应该怎么改。",
    accessPresentation
  },
  content: {
    summary: "你会从一堆手头资料里，选出当前任务真正需要的信息，而不是全部塞给 AI。",
    plainExplanation:
      "提示词把“AI 要做什么”说清楚后，AI 还需要完成任务所需的信息。上下文（Context）就是这些信息。但它不是资料仓库：缺关键背景会让 AI 猜，塞得太多也会让重点变模糊。",
    whyItMatters:
      "很多人发现 AI 结果不准时，会继续加更多资料。真正有效的做法是先判断：当前任务到底缺什么信息。只有真正影响结果的信息，才值得优先放进去。",
    points: [
      "必须知道：没有这条信息，AI 很可能理解错任务或给出明显不合适的结果。",
      "有帮助但非必须：有它可能更好，但没有它仍然能完成当前任务。",
      "暂时不要放：和当前任务关系弱、重复、过时，或只会增加噪音的信息。"
    ],
    content: [
      "先看当前任务，再看手头资料，不要反过来。",
      "信息不是越多越安全；越多越需要你判断哪些是真正重要的。",
      "最小信息包只保留完成当前任务必须知道的内容。"
    ],
    example: {
      title: "做一条 AI 工具体验内容，哪些资料真的需要",
      situation:
        "你准备写一条“这个 AI 工具适合普通用户做什么”的短内容，手里有自己的试用记录、官方功能介绍、几篇半年前的行业文章，还有大量和这次主题无关的产品更新截图。",
      before:
        "如果什么都不给，AI 不知道你实际试过什么；如果把所有资料都塞进去，半年前文章和无关截图又会干扰重点。",
      after:
        "你只保留自己的真实试用记录、当前要介绍的 3 个功能和必要的最新功能说明；其余资料暂时不放。",
      result:
        "信息没有变多，而是变得更贴合当前任务。AI 更容易围绕真实体验和当前重点组织内容。"
    },
    mistakes: [
      "误区：资料越多，AI 越不容易出错｜正确理解：无关、重复或过时资料也会制造噪音。",
      "误区：只要以后可能有用就都先放进去｜正确理解：这一课只判断当前任务是否需要。",
      "误区：AI 会自动知道哪些资料可信｜正确理解：本课只做信息取舍，不把可信度判断交给 AI。"
    ],
    related: [
      "任务说明负责告诉 AI 要做什么；这一课只补完成任务需要知道的信息。",
      "下一课会继续使用已经明确的任务和信息，学习如何修改第一版结果。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t103_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question: "你要让 AI 根据自己的真实体验写一条工具介绍。下面哪类信息最应该先提供？",
      options: [
        { value: "A", label: "你这次实际试过的功能和结果" },
        { value: "B", label: "所有收藏过的 AI 行业文章" },
        { value: "C", label: "和这次主题无关的产品更新截图" }
      ],
      correctValues: ["A"],
      explanation: "真实试用信息直接影响当前任务，属于优先需要的信息。",
      correctFeedback: "正确。先从当前任务真正缺什么出发，而不是从资料数量出发。",
      incorrectFeedback: "再想一想：没有哪条信息，AI 最容易把你的真实体验写错？"
    },
    {
      id: "t103_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question: "判断：只要资料是真实的，就应该全部提供给 AI。",
      options: [{ value: "TRUE", label: "对" }, { value: "FALSE", label: "错" }],
      correctValues: ["FALSE"],
      explanation: "真实不等于当前任务需要。无关或重复的信息仍然会增加噪音。",
      correctFeedback: "正确。是否提供，要看它是否真的影响当前任务。",
      incorrectFeedback: "即使资料真实，也要问：它和这次任务有什么直接关系？"
    },
    {
      id: "t103_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question: "你要写一条“某 AI 工具适合普通用户做什么”的短内容。下面哪些信息更适合放进最小信息包？（多选）",
      options: [
        { value: "TEST", label: "你亲自试用后确认可用的 3 个功能" },
        { value: "AUDIENCE", label: "目标读者是第一次接触这个工具的普通用户" },
        { value: "OLD_NEWS", label: "半年前收藏但和当前功能变化较大的旧文章" },
        { value: "RANDOM", label: "与本次主题无关的其他 AI 产品截图" }
      ],
      correctValues: ["TEST", "AUDIENCE"],
      explanation: "真实试用信息和目标读者会直接影响当前内容；旧文章和无关截图不属于最低必需信息。",
      correctFeedback: "正确。最小信息包只留下会直接影响当前任务的内容。",
      incorrectFeedback: "只保留缺了就会明显影响当前任务的信息。"
    }
  ],
  practice: {
    id: "t103_minimum_information_pack",
    title: "整理一段可以直接给 AI 使用的内容",
    goal: "把任务和真正需要的信息放在一起，形成一段可以直接复制验证的内容。",
    instructions: [
      { key: "task", label: "我要 AI 完成的任务", prompt: "用一句话写清这次要 AI 做什么。可以直接沿用你已经准备好的任务说明。" },
      { key: "mustKnow", label: "这次提供给 AI 的必要信息", prompt: "只写 1～3 条真正会影响结果的信息，不需要把手头资料全部放进去。" }
    ],
    hints: [
      "任务只写这次要完成什么，不需要重新写复杂提示词。",
      "必要信息优先写你亲自确认、而且会直接影响结果的内容。",
      "填好后直接复制去自己的 AI 验证，不需要把 AI 回复粘贴回课程。"
    ],
    rubric: [
      { key: "task", label: "任务本身清楚", maxScore: 45, minScore: 25, example: "为第一次接触这个工具的普通用户，写一条介绍它实际用途的短内容。" },
      { key: "mustKnow", label: "必要信息足够且不过量", maxScore: 55, minScore: 30, example: "我亲自试过并确认可用的 3 个功能；每个功能各有一句真实体验。" }
    ],
    passScore: 60
  },
  hints: [
    "如果没有现成资料，就从你已经知道的真实信息开始，不需要为了练习额外搜一堆内容。",
    "这一课只练信息取舍，不要求判断哪一个来源最权威。"
  ],
  referenceAnswer:
    "我要 AI 完成的任务：为第一次接触这个工具的普通用户，写一条介绍它实际用途的短内容。\n这次提供给 AI 的必要信息：我亲自试过并确认可用的 3 个功能；每个功能各有一句真实体验。",
  review: [
    "围绕当前任务使用你选出的必要信息｜替你决定手头所有资料都必须放进任务。",
    "在信息已经够用时继续完成任务｜替你判断哪些资料一定可信、哪些事实已经确认。"
  ],
  selfAssessment: [
    "我能判断一条信息是不是当前任务必须知道的。",
    "我能把这次不需要的信息先拿掉。",
    "我能整理一份足够但不过量的最小信息包。"
  ]
} as const;

export const track01T103KnowledgeDepth = {
  example: [
    { title: "为什么“更多资料”不等于“更好上下文”", text: "AI 需要的是和当前任务直接相关的信息。资料越多，你越需要先做取舍，否则重点会被稀释。" }
  ],
  review: [
    { title: "为什么先看任务再看资料", text: "只有先知道要完成什么，才能判断哪条信息会真正影响结果。" },
    { title: "为什么够用就应该停", text: "继续加入无关、重复或只是锦上添花的信息，会增加噪音，也让结果更难检查。资料是否可信则是另一层判断，不交给 AI 自动决定。" }
  ]
} as const;

export const track01T103ReferenceFill = {
  task: "为第一次接触这个工具的普通用户，写一条介绍它实际用途的短内容。",
  mustKnow: "我亲自试过并确认可用的 3 个功能；每个功能各有一句真实体验。"
} as const;
