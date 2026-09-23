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
  title:"哪些工作适合先让 AI 帮忙？",
  situation:"你手上有一项真实工作：要整理资料、起草内容、比较几个方案，还要自己决定最后采用什么。AI 可以参与其中，但不是每一步都适合直接交出去。",
  approaches:[
    {label:"把整件事直接交给 AI",text:"AI 可以很快给出结果，但你会更难判断哪些内容可靠、哪些取舍应该由自己负责。"},
    {label:"先让 AI 完成可检查的中间工作",text:"让 AI 先起草、整理、总结或提供候选，再由你检查事实、做取舍和决定最终结果。"}
  ],
  comparison:[],
  takeaway:"AI 最适合先协助容易检查的中间工作；重要事实、关键取舍和最终决定仍由人负责。",
  bottomDetails:[
    {title:"容易检查的工作更适合作为入口",text:"起草、整理、总结、比较候选等结果可以很快看出是否有用，适合先让 AI 协助。"},
    {title:"使用 AI 不等于把责任一起交出去",text:"AI 可以参与很多步骤，但事实是否准确、结果是否采用以及最终决定仍需要你判断。"}
  ],
  comparisonPlacement:"BOTTOM"
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
      kind: "COPY_TO_AI",
      title: "从你的内容任务里找一个 AI 可以先帮忙的小步骤，并直接验证",
      instruction: "填好两个字段后，直接复制到你常用的 AI 软件里试一次。看看 AI 是否只完成你指定的小步骤，而不是替你做最终决定。",
      prompt: "请只完成我指定的协助步骤，不要替我做最终发布决定。",
      reflection: "重点不是把整件工作交出去，而是先找到一个容易检查的小步骤，让 AI 先帮一把。"
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
      {id:"explain",kind:"EXPLAIN",title:"哪些工作适合先让 AI 帮忙",objective:"建立任务适配与人的责任边界直觉。"},
      {id:"example",kind:"EXAMPLE",title:"看一个真实任务怎样拆出 AI 协助入口",objective:"让学习者看见容易检查的中间工作为什么更适合作为 AI 协作起点。"},
      {id:"check",kind:"CHECK",title:"这一步适合交给 AI 吗",objective:"检查学习者能否判断 AI 可协助的部分与必须由人负责的部分。"},
      {id:"practice",kind:"PRACTICE",title:"找出你自己的第一个 AI 协作入口",objective:"从真实任务中选择一个适合 AI 先协助、并且容易检查的小步骤。"},
      {id:"review",kind:"REVIEW",title:"以后判断 AI 能不能帮忙，记住这些原则",objective:"留下任务适配、事实核验和最终责任三个可复用判断。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会为真实任务划分 AI 协作边界",objective:"确认学习者能选择合适任务、保留人的责任，并知道何时调用这项能力。"}
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
    example: {title:"准备一份客户会议后的跟进内容",situation:"你刚开完一次客户会议，手上有会议记录，需要整理重点、起草一封跟进邮件，并决定哪些承诺可以正式发给客户。",before:"把整理、起草、承诺判断和最终发送都一次性交给 AI。",after:"让 AI 先整理会议重点和起草邮件；你核对事实与承诺，再决定最终发送版本。",result:"AI 可以先把会议记录整理成重点、起草邮件结构和措辞；你再核对事实、确认承诺内容，并决定最终发送版本。"},
    mistakes: [
      "误区：AI 写得很像真的，就可以直接发布｜正确理解：表达流畅不代表事实准确，日期、数字、功能信息仍要自己确认。",
      "误区：AI 给了几个标题或角度，就应该直接选一个用｜正确理解：AI 负责提供候选，你仍要判断哪个最适合这条内容。",
      "误区：AI 已经帮了很多，就可以让它决定最终怎么发｜正确理解：AI 可以参与很多步骤，但最终取舍和发布决定仍由你负责。"
    ],
    related: [
      "当你面对一个新任务，不确定它适不适合交给 AI，或者不知道应该让 AI 做到哪一步时。",
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
    "我要把一次客户会议记录整理成一封跟进邮件，内容要让客户清楚下一步安排。\n\n请先根据我提供的会议记录整理出 3 个重点，并起草一版简短跟进邮件；不要新增会议中没有出现的承诺，也不要替我决定最终发送内容。",
  review: [
    "先起草、整理、总结和提供可检查的候选结果｜不要替你确认重要事实，也不要把“写得像真的”当成已经核验。",
    "把复杂任务拆成容易检查的中间步骤，先帮你省掉重复脑力工作｜不要替你做涉及承诺、风险或真实后果的最终取舍。"
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
  task:"我要把一次客户会议记录整理成一封跟进邮件，内容要让客户清楚下一步安排。",
  help:"请先根据我提供的会议记录整理出 3 个重点，并起草一版简短跟进邮件；不要新增会议中没有出现的承诺，也不要替我决定最终发送内容。"
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
  title:"为什么“帮我写一下”经常得不到想要的结果？",
  situation:"你知道自己想让 AI 帮忙，但只说一句“帮我写一下”，AI 仍然不知道要完成什么、给谁使用、有哪些重要要求，以及最后应该交付成什么样。",
  approaches:[
    {label:"让 AI 自己猜任务",text:"要求越模糊，AI 越需要自己补全目标和标准，结果看起来完整，也可能不是你真正需要的。"},
    {label:"把任务要求说清楚",text:"把这次任务真正需要的目标、对象、关键要求和交付形式说清，AI 才更容易按你的意图执行。"}
  ],
  comparison:[],
  takeaway:"提示词（Prompt）的重点不是写得长，而是减少 AI 对任务意图的猜测。",
  bottomDetails:[
    {title:"任务清楚比字数更重要",text:"很长但目标模糊的提示词仍然不好执行；短一些，只要关键要求明确，也可以很好用。"},
    {title:"任务要求和任务资料不是一回事",text:"这一课先解决“AI 要做什么”；完成任务所需的事实、资料和背景在下一课再处理。"}
  ],
  comparisonPlacement:"BOTTOM"
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
      instruction: "完成四个字段后，你可以把整理好的清晰任务说明复制到常用 AI，和原来的“帮我写一下”比较一次。",
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
      {id:"explain",kind:"EXPLAIN",title:"为什么模糊要求会让 AI 猜任务",objective:"让学习者看懂任务不清楚时，AI 会自行补全目标和标准。"},
      {id:"example",kind:"EXAMPLE",title:"同一个任务，怎样从模糊变成可执行",objective:"用一个真实任务说明哪些信息会直接改变 AI 的执行方向。"},
      {id:"check",kind:"CHECK",title:"这份任务说明真的清楚吗",objective:"检查学习者能否识别可执行任务与模糊要求的差别。"},
      {id:"practice",kind:"PRACTICE",title:"把自己的任务说到可以直接执行",objective:"把真实需求整理成 AI 能理解、执行和检查的任务说明。"},
      {id:"review",kind:"REVIEW",title:"以后写 Prompt，真正需要保留的判断",objective:"收束任务目标、使用对象、关键要求和交付形式这些本课实际需要的判断。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会把模糊需求变成可执行任务",objective:"确认学习者能独立写出一份清楚任务说明，并知道什么情况应该重新检查任务表达。"}
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
    example: {title:"从“帮我写一下”到真正可以执行",situation:"你想让 AI 为第一次了解某项服务的普通用户写一段简短介绍。",before:"只说“帮我写一下”，没有说明给谁看、要达到什么目的、有什么要求、最后要什么形式。",after:"说明目标用户、任务目标、关键要求和输出形式，让 AI 少猜，并让结果可以直接检查。",result:"只说“帮我写一下”时，AI 必须猜对象、重点和格式；把目标用户、核心要求、限制和输出形式说清楚后，任务就有了可执行和可检查的标准。"},
    mistakes: [
      "误区：提示词越长越专业｜正确理解：长度不是目标，关键是任务要求是否清楚。",
      "误区：把所有资料都塞进提示词才完整｜正确理解：这一课只先说清任务，任务所需资料留到下一课再补。",
      "误区：写了“专业一点、好一点”就算有要求｜正确理解：要求要尽量具体到可以检查，例如“讲 3 个场景、不夸大能力”。"
    ],
    related: [
      "当 AI 给出的结果偏题、太泛或不符合预期，而你发现自己还没有把目标和要求说清楚时。",
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
    "为第一次了解这项服务、没有专业背景的普通用户写一段简短介绍。重点说明服务能解决什么问题和主要流程；不要夸大效果，不新增原始资料里没有的数字或承诺。控制在 120 字以内，输出为一个简短标题加一段正文。",
  review: [
    "按照你给出的明确目标、对象和要求完成具体任务｜不要替你猜这次到底要完成什么，或默认补全没有说清的关键目标。",
    "根据清楚的限制条件和输出形式组织结果｜不要替你定义“专业一点”“更好”具体意味着什么，也不要替你承担验收标准。",
    "在任务说明完整后快速起草可检查的第一版｜不要替你决定未经说明的业务边界、承诺或最终用途。"
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
  goal:"为第一次了解这项服务的普通用户写一段简短介绍。",
  audience:"第一次接触这项服务、没有专业背景的普通用户。",
  requirements:"重点说明服务能解决什么问题和主要流程；不要夸大效果，不新增原始资料里没有的数字或承诺。",
  format:"控制在 120 字以内，输出为一个简短标题加一段正文。"
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
  title:"任务已经说清楚，为什么 AI 还是可能答偏？",
  situation:"你已经告诉 AI 要完成什么，但它并不知道你手上的真实资料、业务背景和必须依据的事实。另一种常见情况是，你把所有资料一次性都塞进去，真正重要的信息反而被淹没。",
  approaches:[
    {label:"能找到的资料全部放进去",text:"信息很多不等于信息有效。无关内容会增加干扰，也更难看出 AI 到底依据了什么。"},
    {label:"只给完成当前任务真正需要的信息",text:"先判断哪些事实和背景会直接影响这次结果，够用就停，不为了“更完整”继续堆资料。"}
  ],
  comparison:[],
  takeaway:"上下文（Context）的目标是让 AI 拿到完成当前任务所需的信息，不是把你知道的一切都塞进去。",
  bottomDetails:[
    {title:"缺少关键信息，AI 只能猜",text:"任务说得再清楚，如果缺少完成任务必须知道的事实和背景，结果仍可能偏离真实情况。"},
    {title:"信息越多不一定越好",text:"与当前任务无关的资料会稀释重点；只保留真正影响结果的信息，更容易得到可检查的输出。"}
  ],
  comparisonPlacement:"BOTTOM"
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
      instruction: "把下面两项填好后，直接复制到你常用的 AI 软件里。看看只提供必要信息时，AI 是否已经能围绕你的真实任务给出更贴合的结果。",
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
      {id:"explain",kind:"EXPLAIN",title:"任务说清楚了，为什么还需要上下文",objective:"建立“任务要求”和“完成任务所需信息”是两件事的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"同一个任务，信息不够和信息过多都会发生什么",objective:"让学习者看见上下文不足与无关信息过多怎样影响结果。"},
      {id:"check",kind:"CHECK",title:"哪些信息这次真的需要给 AI",objective:"检查学习者能否区分必要信息、可选信息和无关信息。"},
      {id:"practice",kind:"PRACTICE",title:"为一个真实任务准备刚好够用的信息",objective:"把任务与完成任务真正需要的信息组合成可直接验证的内容。"},
      {id:"review",kind:"REVIEW",title:"以后准备 Context，记住这些判断",objective:"留下“只给真正影响当前任务的信息”和“信息够用就停”两个可复用判断。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会准备够用而不过量的上下文",objective:"确认学习者能判断一项信息是否应该进入当前任务的 Context。"}
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
    example: {title:"写一段服务介绍，需要哪些信息才够用",situation:"任务已经说清楚：为第一次了解服务的用户写一段 100 字以内的介绍。你手上同时有服务时间、核心流程、内部会议记录、旧活动文案和与本次无关的历史资料。",before:"把会议记录、旧文案和历史资料全部一股脑塞给 AI，希望资料越多就越准确。",after:"只提供这次介绍真正需要的服务时间、核心流程和必须保留的事实；无关或重复资料先拿掉。",result:"真正影响这次结果的是服务时间、核心流程和必须保留的事实；内部讨论和无关旧资料不需要全部加入。上下文的目标是够用，不是越多越好。"},
    mistakes: [
      "误区：资料越多，AI 越不容易出错｜正确理解：无关、重复或过时资料也会制造噪音。",
      "误区：只要以后可能有用就都先放进去｜正确理解：这一课只判断当前任务是否需要。",
      "误区：AI 会自动知道哪些资料可信｜正确理解：本课只做信息取舍，不把可信度判断交给 AI。"
    ],
    related: [
      "当 AI 已经知道要做什么，但因为缺少背景、材料、对象或限制条件，结果仍然不够准确时。",
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
      "填好后直接复制去自己的 AI 验证，观察结果是否更贴合当前任务。"
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
    "请为第一次了解这项服务的普通用户写一段 100 字以内的介绍，重点说明服务内容和预约方式。\n\n服务时间为周一至周五 9:00–18:00；首次咨询免费；需要提前预约；不要新增价格、效果承诺或资料中没有的数据。",
  review: [
    "使用你提供的必要背景、材料和限制来完成当前任务｜不要替你猜那些没有提供、却会影响结果的关键信息。",
    "在足够的上下文里整理、总结和生成结果｜不要替你决定资料是否真实可靠，也不要因为资料很多就自动判断哪些该相信。"
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
  task:"请为第一次了解这项服务的普通用户写一段 100 字以内的介绍，重点说明服务内容和预约方式。",
  mustKnow:"服务时间为周一至周五 9:00–18:00；首次咨询免费；需要提前预约；不要新增价格、效果承诺或资料中没有的数据。"
} as const;

export const track01T104Meta = {
  canonicalId: "T1-04",
  draftVersion: "1.0.0-track01-a",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT",
  inheritedArtifact: "MINIMUM_INFORMATION_PACK",
  artifactOutput: "PURPOSEFUL_REVISION_REQUEST",
  nextReuse: "T1-05_RELIABILITY_CHECK"
} as const;

export const track01T104Intro = {
  title:"第一版不满意，为什么不要只说“重写一次”？",
  situation:"AI 的第一版已经有不少内容可以用，只是其中一部分太抽象、太长或不符合要求。如果只说“重新写好一点”，AI 仍然要猜到底哪里有问题，原本可用的部分也可能一起被改掉。",
  approaches:[
    {label:"整份重新生成",text:"修改范围和标准都不清楚，每一轮都会产生更多变化，你反而更难判断哪里真的改善了。"},
    {label:"只修改已经明确的问题",text:"告诉 AI 具体改哪一部分、希望变成什么样、哪些内容保持不变，更容易检查这一轮是否有效。"}
  ],
  comparison:[],
  takeaway:"迭代（Iteration）不是不断重来，而是针对明确问题做可检查的修改。",
  bottomDetails:[
    {title:"修改范围越清楚，越容易判断结果",text:"问题已经明确时，只改目标部分，可以避免把原本可用的内容一起改坏。"},
    {title:"“更好一点”要变成可以检查的要求",text:"具体场景、长度、结构、保留范围等要求，比“更专业”“更有感觉”更容易执行和验证。"}
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const track01T104Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "Track 01 Batch A Formal Brief · T1-04",
      "Lesson Output Contract v1"
    ],
    researchSummary:
      "本课只教 Beginner 最低迭代能力：在问题已经明确的情况下，把修改要求说具体，并让 AI 只修改有问题的部分。复杂结果诊断、自动迭代、Workflow、Agent self-correction、Evaluation Engineering 与高级 Prompt Engineering 均后置。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "AI 第一版已经出来了，但有一部分不好用，我下一步该怎么改？",
      mainConcept: "问题已经明确时，只改有问题的部分，并把修改目标和具体要求说清楚。",
      allowedCoreTerms: ["Iteration"],
      deferredTerms: [
        "Workflow",
        "Agent",
        "Evaluation Engineering",
        "Chain-of-Thought",
        "Prompt Engineering",
        "Self-correction"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "只改这一个问题，直接验证一次",
      instruction: "练习场景已经告诉你：这次只改第 2 个要点。把修改目标和具体要求写清楚后，直接复制到你常用的 AI 软件里，看它能不能只改这一处。",
      prompt: "请只修改我指定的部分，其他已经可用的内容保持不变。",
      reflection: "如果 AI 能按你的具体要求只修改目标部分，你就完成了一次最小的定向迭代。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0-track01-a",
    courseSlug: "foundation-ai",
    lessonId: "t1-04-purposeful-iteration",
    title: "迭代（Iteration）：把第一版结果改到可用",
    lessonType: "APPLICATION",
    learningObjectives: [
      "能区分模糊重写和有目的的定向修改。",
      "能在问题已经明确时，说清希望修改成什么样。",
      "能给出具体、可检查的修改要求，让 AI 只改有问题的部分。"
    ],
    knowledgePoints: [
      "第一版不理想，不代表整份内容都要重来。",
      "“再写好一点”仍然让 AI 猜；具体修改目标更容易执行。",
      "一次先改一个明确问题，更容易判断这次修改是否真的有效。"
    ],
    prerequisites: ["T1-03"],
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
      {id:"explain",kind:"EXPLAIN",title:"第一版有问题，为什么不该只让 AI 重写",objective:"建立定向修改比模糊重生成更容易控制的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"只改一个明确问题，结果有什么不同",objective:"用真实修改任务说明范围、目标和可检查标准如何减少无关变化。"},
      {id:"check",kind:"CHECK",title:"这是一条可执行的修改要求吗",objective:"检查学习者能否识别具体、可检查的定向修改要求。"},
      {id:"practice",kind:"PRACTICE",title:"完成一次只改目标部分的修改",objective:"在问题已经明确时，把修改目标和要求写到 AI 可以直接执行。"},
      {id:"review",kind:"REVIEW",title:"以后迭代 AI 结果，记住这些判断",objective:"留下定向修改与可检查标准两个真正需要复用的判断。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会完成一次有目的的迭代",objective:"确认学习者能在明确问题出现时控制修改范围并判断是否改善。"}
    ],
    capabilityGain: [
      "能在 AI 第一版出现一个明确问题时，写出具体修改要求，让 AI 只改这一处。"
    ],
    nextLessonValue:
      "下一课会继续判断：即使结果已经更好看、更好用，哪些事实、日期、数字和重要信息仍然必须核验。",
    accessPresentation
  },
  content: {
    summary: "你会学会在第一版结果已经有基础时，只改一个明确问题，而不是让 AI 反复全部重写。",
    plainExplanation:
      "AI 第一版经常不会一次就完全可用。初学时不需要马上学复杂的诊断方法。先从一个已经明确的问题开始：告诉 AI 这次只改哪里、希望改成什么样、具体要满足什么条件。这样比一句“重新写好一点”更稳定。",
    whyItMatters:
      "如果每次不满意都让 AI 全部重写，你很难知道到底哪条要求起了作用，原本已经满意的部分也可能被改坏。定向修改让变化更小，也更容易检查。",
    points: [
      "先只处理一个已经明确的问题，不一次改所有东西。",
      "把“更好一点”改成具体结果，例如“改成普通用户能马上理解的日常场景”。",
      "给出可检查要求，例如“控制在 2 句话以内”“只改第 2 个要点”。"
    ],
    content: [
      "这节课不要求你独立诊断复杂问题，练习中的问题会直接告诉你。",
      "定向修改的重点是把修改要求说具体，而不是学习更多复杂提示词技巧。",
      "一次修改后先看这一处有没有改善，再决定是否继续改其他地方。"
    ],
    example: {title:"一份已经基本可用的介绍，只是其中一段太抽象",situation:"第一版服务介绍的大部分内容都能用，但第二段只有“提供专业支持、提升体验”这类空泛表达，用户看完仍不知道具体能得到什么。",before:"看到一处不满意，就让 AI 把整份介绍重新写一遍，结果原本能用的部分也一起变化。",after:"只指出第二段太抽象，要求改成具体使用场景、控制在两句话内，并明确其他部分保持不变。",result:"与其让 AI 全部重写，不如明确“只修改第二段”，要求改成一个具体使用场景、控制在两句话内，并保留其他已经可用的内容。这样更容易判断修改是否有效。"},
    mistakes: [
      "误区：不满意就让 AI 全部重写｜正确理解：先改一个已经明确的问题，更容易判断修改有没有效果。",
      "误区：说“更专业、更具体”就已经很清楚｜正确理解：最好给出能检查的结果标准，例如具体场景、长度或结构。",
      "误区：每一轮都应该同时改很多问题｜正确理解：初学时一次先改一个明显问题，变化更容易观察。"
    ],
    related: [
      "当 AI 第一版方向基本对，但还不能直接使用，需要你指出具体问题并做一次定向修改时。",
      "结果变得更可用，不代表其中的事实已经自动变得可靠。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t104_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question: "课程已经告诉你：第 2 个要点太抽象，其他部分基本可用。下面哪一句最适合下一步修改？",
      options: [
        { value: "A", label: "这一版不太好，重新写一篇更专业的。" },
        { value: "B", label: "只修改第 2 个要点，把它改成普通用户能马上理解的具体场景，控制在 2 句话以内；其他部分保持不变。" },
        { value: "C", label: "再生成几次，我从里面挑一个感觉好的。" }
      ],
      correctValues: ["B"],
      explanation: "B 明确了修改位置、目标和可检查要求，也保护了已经可用的部分。",
      correctFeedback: "正确。问题已经明确时，下一步就是把这一处的修改要求说具体。",
      incorrectFeedback: "题目已经告诉你第 2 个要点有问题。现在要做的不是重新猜问题，而是让 AI 只改这一处，并说明什么叫改好。"
    },
    {
      id: "t104_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question: "判断：只要第一版不满意，多让 AI 全部重写几次，结果通常就会自然变得更符合要求。",
      options: [{ value: "TRUE", label: "对" }, { value: "FALSE", label: "错" }],
      correctValues: ["FALSE"],
      explanation: "如果没有说明具体问题和修改标准，重复生成仍然可能沿着错误方向变化。",
      correctFeedback: "正确。修改次数不是关键，关键是这一轮到底要改什么。",
      incorrectFeedback: "如果每次都只说“再写一次”，AI 仍然不知道你真正不满意的是哪一部分。"
    },
    {
      id: "t104_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question: "已知第 2 个要点太抽象。下面哪些信息能让这次修改更明确？（多选）",
      options: [
        { value: "TARGET", label: "只修改第 2 个要点" },
        { value: "OUTCOME", label: "改成普通用户能马上理解的日常场景" },
        { value: "STANDARD", label: "用一个具体例子说明，并控制在 2 句话以内" },
        { value: "VAGUE", label: "整体再高级一点、有感觉一点" }
      ],
      correctValues: ["TARGET", "OUTCOME", "STANDARD"],
      explanation: "修改位置、希望结果和可检查标准都能减少 AI 猜测；模糊形容词仍然很难执行。",
      correctFeedback: "正确。你已经能识别一条可执行的定向修改要求需要什么。",
      incorrectFeedback: "再看哪些选项能让你修改后直接判断“有没有做到”，哪些仍然只是模糊感觉。"
    }
  ],
  practice: {
    id: "t104_targeted_revision",
    title: "这次只改第 2 个要点",
    goal: "练习场景已经明确：第 2 个要点太抽象。你只需要把这一次修改要求说具体。",
    instructions: [
      { key: "desired", label: "我希望改成什么样", prompt: "直接写你希望第 2 个要点变成什么样，不需要再判断问题在哪里。" },
      { key: "requirements", label: "这次的具体要求", prompt: "写 1～3 个可以直接检查的要求，例如使用什么场景、控制多长、哪些内容保持不变。" }
    ],
    hints: [
      "先从“普通用户看完能不能马上理解”来写修改目标。",
      "具体要求尽量能直接检查，例如“用一个日常工作场景”“控制在 2 句话以内”。",
      "这次只改第 2 个要点，不需要重新设计整篇内容。"
    ],
    rubric: [
      { key: "desired", label: "修改目标具体", maxScore: 50, minScore: 30, example: "请只修改第 2 个要点，把它改成普通用户能马上理解的具体日常场景。" },
      { key: "requirements", label: "修改要求可检查", maxScore: 50, minScore: 30, example: "用一个日常工作例子说明，控制在 2 句话以内；标题和第 1、3 个要点保持不变。" }
    ],
    passScore: 60
  },
  hints: [
    "如果不知道怎么写，先把“更好一点”换成一个能看见结果的要求。",
    "修改范围越清楚，你越容易检查这一轮到底有没有改善。"
  ],
  referenceAnswer:
    "请只修改服务介绍的第 2 段，把抽象的“提供专业支持、提升体验”改成普通用户能马上理解的具体使用场景。\n\n用一个日常场景说明，控制在 2 句话以内；标题和其他段落保持不变，不新增未经确认的事实。",
  review: [
    "根据你指出的具体问题做局部、定向修改｜不要替你决定整份内容都要重写，尤其当大部分内容已经可用。",
    "按明确的位置、目标和可检查标准调整结果｜不要替你定义“更好一点”到底是什么，也不要用无限次随机重写代替你的判断。"
  ],
  selfAssessment: [
    "我能区分“重新写好一点”和“只改一个明确问题”的差别。",
    "问题已经明确时，我能说清希望它改成什么样。",
    "我能写出一条可直接复制验证的定向修改要求。"
  ]
} as const;

export const track01T104KnowledgeDepth = {
  example: [
    { title: "为什么不先全部重写", text: "因为原本已经可用的部分也会一起变化，你会更难判断这次修改到底解决了什么问题。" }
  ],
  review: [
    { title: "为什么一次先改一个明确问题", text: "变化越集中，你越容易比较修改前后，知道这条要求有没有真正起作用。" },
    { title: "为什么修改要求要能检查", text: "“更好一点”没有清楚终点；具体场景、长度、结构或保留范围能让你直接判断 AI 有没有做到。" }
  ]
} as const;

export const track01T104ReferenceFill = {
  desired:"请只修改服务介绍的第 2 段，把抽象的“提供专业支持、提升体验”改成普通用户能马上理解的具体使用场景。",
  requirements:"用一个日常场景说明，控制在 2 句话以内；标题和其他段落保持不变，不新增未经确认的事实。"
} as const;

export const track01T105Meta = {
  canonicalId: "T1-05",
  draftVersion: "1.0.0-track01-a",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "OPC_SELF_MEDIA_AI_CONTENT_DEFAULT",
  inheritedArtifact: "PURPOSEFUL_REVISION_REQUEST",
  artifactOutput: "VERIFICATION_CHECKLIST",
  nextReuse: "TRACK02_SEARCH_RESEARCH"
} as const;

export const track01T105Intro = {
  title:"AI 写得很像真的，为什么还要核验？",
  situation:"AI 可以把数字、日期、最新功能和来源写得非常自然，甚至语气很确定。但表达流畅只说明文字像答案，不代表这些事实已经被真实来源确认。",
  approaches:[
    {label:"看起来合理就直接采用",text:"最容易出问题的往往不是句子难看，而是错误或过时的信息被写得很像真的。"},
    {label:"把需要核验的陈述单独挑出来",text:"看到数字、日期、当前状态、来源或错误后果较大的说法，先确认真实来源和最新状态。"}
  ],
  comparison:[],
  takeaway:"AI 内容能不能使用，不只看表达质量；可查证、会变化或后果重要的信息必须先核验。",
  bottomDetails:[
    {title:"事实类陈述需要证据",text:"数字、日期、价格、功能状态、来源和政策都可以被查对错，不能只依赖 AI 的语气。"},
    {title:"时效性和错误后果决定核验优先级",text:"越容易变化、写错后越可能误导真实决策的信息，越应该优先确认。"}
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const track01T105Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "Track 01 Batch A Formal Brief · T1-05",
      "Lesson Output Contract v1"
    ],
    researchSummary:
      "本课只教 Beginner 最低可靠性判断：看到 AI 输出中的事实、数字、日期、最新功能、来源或错误后果较大的说法时，知道这些内容必须先核验，并明确应该核对什么。Hallucination 只作为原因解释；HITL、权限、审批、Evaluation Engineering、RAG、Source of Truth 与复杂证据工作均后置。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "AI 写得很像真的，我怎么知道哪些内容一定要先查？",
      mainConcept: "凡是可查证、会变化或写错后果较大的陈述，都不能只凭 AI 的语气采用。",
      allowedCoreTerms: ["Hallucination"],
      deferredTerms: [
        "Evaluation Engineering",
        "RAG",
        "Source of Truth",
        "HITL",
        "Permission",
        "Approval Flow",
        "Agent",
        "Workflow"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "把待核验内容整理成一份清单",
      instruction: "课程已经给出一段准备发布的内容。把必须先核验的说法和对应核验方向写清楚后，可以复制到 AI，让它只帮你整理成检查清单，不让它替你判断真假。",
      prompt: "请只把我列出的待核验内容整理成清晰检查清单，并说明每一项应该核对哪类来源或最新信息；不要直接判断这些说法是真是假。",
      reflection: "真正的核验还要回到可靠来源。这里先练的是：知道什么不能直接信，以及下一步应该查什么。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0-track01-a",
    courseSlug: "foundation-ai",
    lessonId: "t1-05-reliability-verification",
    title: "结果可靠性：什么时候必须核验",
    lessonType: "APPLICATION",
    learningObjectives: [
      "能识别 AI 输出中必须先核验的事实、数字、日期、功能和来源类陈述。",
      "能判断会随时间变化的信息为什么需要检查最新状态。",
      "能在错误后果较大时提高核验优先级，并明确下一步要核对什么。"
    ],
    knowledgePoints: [
      "表达流畅、语气确定，不等于事实正确。",
      "数字、日期、价格、功能状态、来源等可查证陈述应该先核验。",
      "越容易过时、越可能误导用户或造成较大后果的信息，越不能直接采用。"
    ],
    prerequisites: ["T1-04"],
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
      {id:"explain",kind:"EXPLAIN",title:"为什么 AI 写得像真的，也不能直接相信",objective:"建立表达质量与事实可靠性是两件事的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"一段准备使用的内容里，哪些说法必须先查",objective:"让学习者看见数字、日期、当前状态和来源为什么需要真实证据。"},
      {id:"check",kind:"CHECK",title:"哪些内容不能直接采用",objective:"检查学习者能否识别必须核验的陈述和核验优先级。"},
      {id:"practice",kind:"PRACTICE",title:"整理一份真正有用的待核验清单",objective:"把不能直接采用的具体说法和下一步核验方向写清楚。"},
      {id:"review",kind:"REVIEW",title:"以后使用 AI 内容，记住这些可靠性判断",objective:"留下事实证据、时效性和错误后果三个可复用判断。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经知道什么必须先核验",objective:"确认学习者能识别高优先级核验内容，并明确下一步需要查什么。"}
    ],
    capabilityGain: [
      "能在使用或发布 AI 内容前，识别必须核验的陈述，并明确下一步核验方向。"
    ],
    nextLessonValue:
      "下一课先把“模型”和“完整 AI 产品”分开看。这样你会明白：为什么有的 AI 能搜索最新资料、有的不能，也不会把产品的搜索能力误当成模型天然知道最新事实。",
    accessPresentation
  },
  content: {
    summary: "你会学会从一段看起来很完整的 AI 内容里，先挑出不能直接相信、必须核验的说法。",
    plainExplanation:
      "AI 可以生成很自然、很有把握的句子，但它不等于事实数据库。尤其是数字、日期、价格、最新功能、引用来源或高后果信息，不能因为读起来顺就直接采用。这里先学会判断“什么时候必须查”。",
    whyItMatters:
      "很多真正危险的错误不是句子写得差，而是句子写得太像真的。只要学会先挑出需要核验的陈述，你就能避免把 AI 的表达能力误当成事实保证。",
    points: [
      "可查证事实：数字、日期、价格、功能状态、来源、政策或明确事件，都可以被核对。",
      "时效性：今天成立的功能、价格或规则，过一段时间可能已经变化。",
      "错误后果：如果写错会误导用户、影响决策或造成明显损失，就应该提高核验优先级。"
    ],
    content: [
      "创意标题、表达角度可以先作为候选，不代表其中夹带的事实也可以直接采用。",
      "“据官方数据”“目前已经支持”“截至今天”等句式都应该提醒你去找真实来源和最新状态。",
      "Hallucination 可以理解为 AI 生成了听起来合理、但未必真实可靠的内容；本课不展开技术机制。"
    ],
    example: {title:"一段准备发给客户的服务说明，哪些句子必须先确认",situation:"草稿里写着“本月已经向所有客户开放新功能”“官方数据显示处理效率提升 40%”，同时还有一些普通的表达建议。",before:"因为句子写得具体、语气很确定，就把“本月已开放”“效率提升 40%”直接当成真实事实。",after:"把日期、数字、当前状态和来源单独挑出来，回到最新可靠来源逐项确认；普通表达建议只当候选。",result:"“本月已经开放”涉及当前状态，“效率提升 40%”涉及具体数字和来源，都必须回到最新可靠来源确认；普通表达建议可以作为候选，但不能把其中夹带的事实一起默认当真。"},
    mistakes: [
      "误区：AI 语气很肯定，说明它应该有来源｜正确理解：语气确定不是来源证明。",
      "误区：只要以前是真的，现在就可以继续用｜正确理解：功能、价格、政策和数据都可能变化。",
      "误区：只有数字才需要核验｜正确理解：日期、功能状态、来源、政策和高后果事实同样需要核验。"
    ],
    related: [
      "当 AI 输出里出现事实、数字、来源、重要结论或会影响真实决策的内容，你需要判断哪些地方不能直接相信时。",
      "下一课先理解模型与完整 AI 产品的区别，弄清“产品能搜索最新资料”为什么不等于“模型天然知道所有最新事实”；真正的来源搜索、证据比较和冲突处理再在后续课程展开。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t105_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question: "AI 写道：“这个工具本月已向所有免费用户开放文件分析。”准备发布前，最合适的做法是什么？",
      options: [
        { value: "A", label: "句子很具体，可以直接采用" },
        { value: "B", label: "先查看当前官方功能说明和发布日期，确认免费用户范围是否仍然成立" },
        { value: "C", label: "让 AI 再说一次，只要两次答案一样就算确认" }
      ],
      correctValues: ["B"],
      explanation: "功能开放范围会变化，而且这是一条可查证的当前事实，应该回到最新可靠来源确认。",
      correctFeedback: "正确。越是具体、会变化的信息，越需要看当前真实来源。",
      incorrectFeedback: "不要把 AI 的确定语气或重复回答当成核验。先问：这条信息现在还能不能在可靠来源中查到？"
    },
    {
      id: "t105_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question: "判断：只要 AI 给出的内容没有明显矛盾、读起来也很顺，就可以把其中的事实信息直接发布。",
      options: [{ value: "TRUE", label: "对" }, { value: "FALSE", label: "错" }],
      correctValues: ["FALSE"],
      explanation: "语言质量和事实可靠性是两件事。AI 可以把错误或过时信息写得非常自然。",
      correctFeedback: "正确。看起来像真的，只能说明表达自然，不能替代事实核验。",
      incorrectFeedback: "想一想：数字、日期和最新功能，即使句子写得很顺，是否仍然可能过时或错误？"
    },
    {
      id: "t105_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question: "下面哪些内容在发布前更应该先核验？（多选）",
      options: [
        { value: "DATE", label: "某功能于 2026 年 9 月正式上线" },
        { value: "NUMBER", label: "官方数据显示效率提升 40%" },
        { value: "CURRENT", label: "目前免费版已经支持该功能" },
        { value: "CREATIVE", label: "“让 AI 成为你的第二双手”这个标题方向" }
      ],
      correctValues: ["DATE", "NUMBER", "CURRENT"],
      explanation: "日期、数字和当前功能状态都可以被查证，也可能过时；创意标题本身主要是表达选择。",
      correctFeedback: "正确。你已经能把“需要查真的事实”和“可以先当作表达候选”的内容分开。",
      incorrectFeedback: "优先找那些能被客观查证、会随时间变化，或者写错会误导用户的陈述。"
    }
  ],
  practice: {
    id: "t105_verification_checklist",
    title: "整理一份发布前待核验清单",
    goal: "课程给出的草稿里包含最新功能和具体数据。你只需要列出哪些内容必须先查，以及每一项应该去核对什么。",
    instructions: [
      { key: "claims", label: "我准备核验的内容", prompt: "写出 1～3 条不能直接采用的具体说法，例如日期、数字、当前功能状态或来源。" },
      { key: "checks", label: "我会去核对什么", prompt: "对应写清要核对哪类信息，例如最新官方功能说明、发布日期、原始数据来源或适用条件。" }
    ],
    hints: [
      "优先找数字、日期、最新功能、价格、政策、来源等可以查对错的内容。",
      "如果一句话会随着时间变化，就要特别注意核对最新状态。",
      "这里只写核验方向，不要求现在完成复杂搜索或证据比较。"
    ],
    rubric: [
      { key: "claims", label: "待核验内容具体", maxScore: 50, minScore: 30, example: "“某 AI 工具本月已向所有免费用户开放文件分析”；“官方数据显示效率提升 40%”。" },
      { key: "checks", label: "核验方向明确", maxScore: 50, minScore: 30, example: "核对当前官方功能说明和发布日期；找到 40% 的原始官方数据来源，并确认适用条件。" }
    ],
    passScore: 60
  },
  hints: [
    "如果一句话里出现非常具体的数字、日期或“目前已经支持”，先把它当成待核验候选。",
    "不要让 AI 的重复回答代替真实来源。"
  ],
  referenceAnswer:
    "需要核验：“某 AI 工具本月已向所有免费用户开放文件分析”；“官方数据显示使用该功能后效率提升 40%”。\n核验方向：查看该工具当前官方功能说明与发布日期，确认免费用户开放范围；找到“效率提升 40%”对应的原始官方数据或报告，确认数字是否真实、统计对象和适用条件。",
  review: [
    "帮你从草稿里标出数字、日期、来源、当前状态等需要核验的事实陈述｜不要替你把流畅表达当成证据，也不要把 AI 自己的重复回答当作事实核验。",
    "帮你整理待核验清单、列出应该去查哪类来源｜不要替你确认最新官方状态、价格、政策或数据是否仍然成立。",
    "在你提供可靠来源后帮助比较、整理或重写已确认的信息｜不要替你承担高后果事实错误带来的最终判断和发布责任。"
  ],
  selfAssessment: [
    "我能从 AI 内容里找出不能直接相信的事实类陈述。",
    "我知道最新功能、日期和数字为什么需要额外核验。",
    "我能为待核验内容写出下一步应该查什么。"
  ]
} as const;

export const track01T105KnowledgeDepth = {
  example: [
    { title: "为什么“像真的”最容易让人放松警惕", text: "AI 的强项之一就是自然表达，所以错误信息也可能被写得完整、具体、很有把握。判断可靠性不能只看语气。" }
  ],
  review: [
    { title: "为什么事实类陈述必须单独检查", text: "数字、日期、功能状态和来源都有客观答案，发布前应该用真实来源确认，而不是只依赖生成结果。" },
    { title: "为什么最新信息更容易出问题", text: "模型掌握的信息和现实更新可能不同步，功能、价格、规则等内容尤其容易变化。" },
    { title: "为什么后果越大越要优先核验", text: "同样一个错误，如果只影响一句普通文案和如果会误导用户做重要决定，核验优先级不应该一样。" }
  ]
} as const;

export const track01T105ReferenceFill = {
  claims: "需要核验：“某 AI 工具本月已向所有免费用户开放文件分析”；“官方数据显示使用该功能后效率提升 40%”。",
  checks: "核验方向：查看该工具当前官方功能说明与发布日期，确认免费用户开放范围；找到“效率提升 40%”对应的原始官方数据或报告，确认数字是否真实、统计对象和适用条件。"
} as const;
