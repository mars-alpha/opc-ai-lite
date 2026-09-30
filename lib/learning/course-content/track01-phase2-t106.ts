import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../course-builder";

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export const track01T106Meta = {
  canonicalId: "T1-06",
  draftVersion: "1.0.0-track01-phase2",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "git-history:TRACK01_T1_06_FORMAL_BRIEF_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "GENERIC_AI_PRODUCT_INFORMATION_TASK",
  inheritedCapability: "T1-01_TO_T1-05_AI_COLLABORATION",
  artifactOutput: "MINIMUM_AI_PRODUCT_CAPABILITY_BREAKDOWN",
  nextReuse: "T1-07_TOKEN_PROBABILITY"
} as const;

export const track01T106Intro = {
  title:"你使用的是模型，还是一个完整 AI 产品？",
  situation:"你打开一个 AI 软件，可以聊天、搜索网页、上传文件、记住部分信息，甚至调用其他工具。界面上看起来都叫“AI”，但这些能力并不一定全部来自模型本身。",
  approaches:[
    {label:"把看到的所有功能都算在模型上",text:"这样很容易把搜索、文件、记忆、权限等完整产品能力误认为模型天然就具备。"},
    {label:"先区分模型核心能力和产品层能力",text:"先看哪些属于理解与生成，哪些还需要产品额外连接资料、文件、工具、状态或权限。"}
  ],
  comparison:[],
  takeaway:"模型是 AI 产品的核心能力之一，但你实际使用的是完整产品；产品能力来自多层组合。",
  bottomDetails:[
    {title:"同一个模型，不代表产品体验一定相同",text:"产品可以提供不同的搜索、文件、上下文、工具、记忆、权限和界面，因此最终体验会不同。"},
    {title:"看不见内部实现时，不需要硬猜",text:"从用户界面通常只能判断完整产品做了什么；证据不足时保留“不确定”，比给出假的确定答案更可靠。"}
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const track01T106KnowledgeDepth = {
  example: [
    { title: "为什么同一个模型在不同产品里体验会不同", text: "因为产品可以给模型不同的上下文、搜索、文件、工具、权限和界面能力。" }
  ],
  review: [
    { title: "为什么产品新增功能不等于模型重新训练", text: "完整产品可以通过额外系统能力扩展体验，当前使用模型产生结果属于推理过程。" },
    { title: "为什么允许标记“不确定”", text: "从用户界面通常看不到完整内部实现，保持边界比猜一个确定答案更可靠。" }
  ]
} as const;

export const track01T106ReferenceFill = {
  model_core: "我认为“根据当前输入生成一段新文字”最接近模型核心能力，因为这直接体现模型根据输入理解并生成内容。",
  product_layer: "我认为“搜索最新网页资料”和“权限控制”明显需要产品层参与：前者要连接外部信息，后者要由产品系统管理用户与操作权限。",
  uncertain: "我会把“上传并解析 PDF”和“记住长期偏好”放在需要进一步确认：它们是完整产品能力，可能同时涉及模型、文件处理、上下文或记忆系统，仅凭界面不能判断内部具体由哪一层完成。"
} as const;

export const track01T106Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "git-history:TRACK01_T1_06_FORMAL_BRIEF_V1.md",
      "COURSE_BUILD_STANDARD_V1.md",
      "TRACK_CONTEXTS_V1.md"
    ],
    researchSummary:
      "本课只建立 Model vs AI Product 的 Beginner 分层判断。模型负责核心理解与生成能力；完整 AI 产品通常还会组合界面、上下文管理、搜索、文件、记忆、工具、权限等产品层能力。Training / Inference 只作为帮助理解模型能力形成与当前使用的 supporting intuition，不进入底层工程细节；Token / Probability、RAG、Function Calling、MCP、Agent 等后续概念均不在本课正式教学。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion:
        "我每天都在“用 AI”，但我用的到底是模型，还是一个完整 AI 产品？为什么不同 AI 软件实际能力会不一样？",
      mainConcept:
        "模型是核心理解与生成能力之一；AI 产品会把一个或多个模型与界面、资料、搜索、文件、记忆、工具和权限等能力组合成完整体验。",
      allowedCoreTerms: ["Model", "AI Product"],
      deferredTerms: [
        "Token",
        "Probability",
        "RAG",
        "Function Calling",
        "MCP",
        "Agent",
        "Vector DB",
        "Fine-tuning",
        "Transformer"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "把你的判断复制到 AI 里对照一次",
      instruction:
        "先完成下面 3 个判断框并检查结果。之后把你自己的判断复制到常用 AI，请它逐项分析依据；不要让 AI 替你先做第一次分类。",
      prompt:
        "请根据“模型核心能力 vs AI 产品层能力”的区别，逐项分析我的判断。不要只告诉我对错，请说明依据；如果仅凭表面功能无法确认内部实现，也请明确指出。",
      reflection:
        "重点不是让 AI 替你分类，而是先形成自己的判断，再用 AI 检查推理是否站得住。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0-track01-phase2",
    courseSlug: "foundation-ai",
    lessonId: "t1-06-model-and-product",
    title: "模型与 AI 产品：你使用的到底是什么",
    lessonType: "CONCEPT",
    learningObjectives: [
      "能用自己的话区分模型（Model）与 AI 产品（AI Product）。",
      "能判断一个功能主要体现模型核心理解 / 生成能力，还是明显需要产品层额外能力共同完成。",
      "理解训练发生在模型能力形成阶段，推理是当前使用已训练模型产生结果的过程。",
      "比较不同 AI 产品时，不再把所有差异都简单归因于模型强弱。"
    ],
    knowledgePoints: [
      "模型负责核心理解与生成能力，但模型本身不等于完整 AI 产品。",
      "AI 产品通常会把一个或多个模型与界面、上下文管理、搜索、文件、记忆、工具、权限等能力组合成完整体验。",
      "训练发生在模型能力形成阶段；当前用户输入后得到结果属于推理过程。",
      "仅凭产品表面功能，不能可靠反推出厂商真实内部架构。"
    ],
    prerequisites: ["T1-05"],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "NONE",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: true,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK"],
    steps: [
      {id:"explain",kind:"EXPLAIN",title:"为什么一个 AI 软件不等于一个模型",objective:"让学习者先建立“模型是核心能力之一，产品还会组合其他能力”的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"为什么两个都会聊天的 AI 产品，能力仍然不同",objective:"用搜索最新资料的真实场景，让模型核心生成与产品额外能力的区别变得可见。"},
      {id:"check",kind:"CHECK",title:"这个能力更像来自模型，还是完整产品",objective:"检查学习者能否分层判断，同时在证据不足时保留边界。"},
      {id:"practice",kind:"PRACTICE",title:"拆解一个你熟悉的 AI 产品",objective:"把已理解的分层判断应用到常见功能，不猜厂商内部实现。"},
      {id:"review",kind:"REVIEW",title:"以后看 AI 产品，真正需要保留的判断",objective:"收束模型、产品组合和不确定边界三个可复用判断。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会把模型和 AI 产品分开看",objective:"确认学习者能用分层视角理解产品能力，并知道什么时候不能从表面功能直接下结论。"}
    ],
    capabilityGain: [
      "能把一个 AI 产品拆成“模型核心能力”和“产品层额外能力”来看，并在不确定时保留判断边界。"
    ],
    nextLessonValue:
      "下一课继续理解模型在推理时为什么会逐步生成，以及为什么同一个问题不会永远得到完全相同的答案。",
    accessPresentation
  },
  content: {
    summary:
      "你会学会把“模型”和“你正在使用的 AI 产品”分开看，不再把搜索、文件、记忆、工具等全部当成模型本身。",
    plainExplanation:
      "模型（Model）可以理解为提供核心理解与生成能力的引擎。你真正使用的 AI 产品（AI Product）通常还会在模型之外组织很多能力，例如管理当前输入、读取文件、搜索资料、保存部分记忆、连接工具、控制权限和提供界面。一个产品甚至可能组合不止一个模型。所以产品新增一个功能，不等于模型本身一定获得了完全相同的内生能力。",
    whyItMatters:
      "如果把模型和产品混成一件事，后面看到搜索、记忆、工具或自动执行时，很容易把所有功能都归因于“模型更聪明”。先分清层级，你以后比较 AI 产品、理解新功能和学习后续概念时会更准确。",
    points: [
      "模型：负责核心的理解、推理和内容生成能力。",
      "AI 产品：把模型与界面、资料、搜索、文件、记忆、工具、权限等能力组合起来。",
      "训练（Training）：模型能力形成阶段；推理（Inference）：你当前输入信息后，模型产生结果的过程。",
      "看见一个功能时，先判断它属于哪一层；如果证据不足，可以保留“不确定”。"
    ],
    content: [
      "同一个模型可以被不同产品使用，而不同产品给它准备的上下文、工具和界面可能完全不同，所以用户体验不一定相同。",
      "同一个 AI 产品也可能在不同任务里组合不同模型或其他系统能力，因此“这个产品会做什么”和“某一个模型会做什么”不是完全同一个问题。",
      "初学阶段不需要知道厂商内部到底怎样实现，只要先学会不把完整产品的全部能力都归给模型。"
    ],
    example: {
      title:"为什么一个 AI 产品能回答最新信息，另一个却不能",
      situation:"你向两个 AI 产品询问今天刚发布的新功能。产品 A 只能根据当前已有输入回答；产品 B 会先搜索最新公开资料，再把找到的信息交给模型生成答案。",
      before:"看到产品 B 能查到今天的新功能，就直接认定“它的模型本身实时知道互联网全部最新信息”。",
      after:"先区分模型的理解 / 生成与产品额外提供的搜索、文件、工具等能力；看不到内部证据时保留“不确定”。",
      result:"两个产品都需要模型理解问题并生成内容，但产品 B 还明显增加了搜索和资料组织能力。你不需要猜内部实现细节，只要知道“产品会做什么”和“模型本身会做什么”不是同一个问题。"
    },
    mistakes: [
      "误区：产品能联网，所以模型本身一定实时知道互联网全部信息｜正确理解：联网通常是完整产品组织出来的能力，不能只凭界面功能反推模型本身。",
      "误区：两个产品用了同一个模型，体验就一定完全相同｜正确理解：上下文、搜索、文件、工具、权限和界面都会影响完整体验。",
      "误区：产品新增一个功能，就等于模型训练阶段已经永久学会这个功能｜正确理解：产品可以通过额外系统能力扩展体验，当前使用也不等于重新训练模型。"
    ],
    related: [
      "当你比较不同 AI 产品、看到一个新功能，或想判断某项能力到底来自模型本身还是产品层时。",
      "训练 / 推理只帮助理解模型能力形成与当前使用，不进入工程原理。",
      "下一课再正式学习模型为什么会逐步生成并出现输出变化。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t106_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question:
        "某 AI 软件新增“上传 PDF 后提问”功能。只根据这个表面功能，哪种判断最合理？",
      options: [
        { value: "A", label: "说明模型本身一定新增了完整 PDF 文件管理能力" },
        { value: "B", label: "这是完整 AI 产品能力，可能同时包含模型和产品层的文件处理能力" },
        { value: "C", label: "只要能读取 PDF，就说明这个功能完全不需要模型" }
      ],
      correctValues: ["B"],
      explanation:
        "从用户看到的功能只能确认完整产品能处理 PDF；它可能包含模型理解能力，也可能有文件解析、上下文组织等产品层能力。",
      correctFeedback:
        "正确。先判断完整产品做了什么，再区分模型和产品层能力，不凭表面功能猜内部架构。",
      incorrectFeedback:
        "不要从一个界面功能直接反推内部只有哪一种能力。先记住：模型是核心能力之一，但不是整个产品。"
    },
    {
      id: "t106_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question:
        "判断：如果两个 AI 产品使用同一个模型，它们给用户的全部能力和体验就一定相同。",
      options: [
        { value: "TRUE", label: "对" },
        { value: "FALSE", label: "错" }
      ],
      correctValues: ["FALSE"],
      explanation:
        "完整产品还可能拥有不同的搜索、文件、上下文管理、工具、权限和界面，因此同一模型不等于完全相同的产品体验。",
      correctFeedback:
        "正确。比较 AI 产品时，要看“模型 + 产品层能力”的整体组合。",
      incorrectFeedback:
        "再想想搜索、文件、记忆和工具：这些能力即使使用同一个模型，也可能因为产品系统不同而不同。"
    },
    {
      id: "t106_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question:
        "下面哪些更适合先理解为“完整 AI 产品可能在模型之外额外组织的能力”？（多选）",
      options: [
        { value: "SEARCH", label: "连接最新资料搜索" },
        { value: "FILES", label: "上传和解析文件" },
        { value: "PERMISSIONS", label: "控制哪些用户可以执行某个操作" },
        { value: "GENERATE", label: "根据当前输入生成一段新文字" }
      ],
      correctValues: ["SEARCH", "FILES", "PERMISSIONS"],
      explanation:
        "搜索、文件和权限明显需要完整产品层面的组织；根据当前输入生成内容更接近模型的核心能力。",
      correctFeedback:
        "正确。你已经能先做层级判断，而不是把所有功能都归给模型。",
      incorrectFeedback:
        "先问：这是核心理解 / 生成，还是需要产品系统额外连接资料、文件或权限？"
    }
  ],
  practice: {
    id: "t106_model_product_breakdown",
    title: "拆解一个 AI 产品的能力来源",
    goal: "用三个判断框，把常见 AI 功能分成模型核心能力、产品层能力和暂时不能确定三类，并说明理由。",
    instructions: [
      {
        key: "model_core",
        label: "模型核心能力",
        prompt: "从“生成新文字、搜索最新网页、上传解析 PDF、记住长期偏好、权限控制”里，写出你认为最接近模型核心理解 / 生成能力的项目，并说明理由。"
      },
      {
        key: "product_layer",
        label: "产品层能力",
        prompt: "写出你认为明显还需要产品系统额外组织、连接外部资料或控制权限的项目，并说明理由。"
      },
      {
        key: "uncertain",
        label: "暂时不能确定",
        prompt: "写出你认为仅凭用户看到的功能还不能判断内部实现的项目，并说明为什么不能直接下结论。"
      }
    ],
    hints: [
      "先问：这个功能主要是在理解 / 生成，还是还需要外部资料、状态、工具或权限？",
      "搜索和权限通常明显需要产品层参与；生成新文字更接近模型核心能力。",
      "如果一个功能可能同时涉及模型与文件处理、上下文或记忆系统，可以保留“暂时不能确定”。"
    ],
    rubric: [
      {
        key: "model_core",
        label: "模型核心能力判断",
        maxScore: 34,
        minScore: 20,
        example: "我认为“根据当前输入生成一段新文字”最接近模型核心能力，因为这直接体现模型根据输入理解并生成内容。"
      },
      {
        key: "product_layer",
        label: "产品层能力判断",
        maxScore: 33,
        minScore: 20,
        example: "搜索最新网页资料和权限控制明显需要产品层参与，因为它们涉及外部信息连接和权限管理。"
      },
      {
        key: "uncertain",
        label: "不确定边界判断",
        maxScore: 33,
        minScore: 20,
        example: "上传解析 PDF 和记住长期偏好属于完整产品能力，仅凭界面不能判断内部具体由模型还是其他系统完成。"
      }
    ],
    passScore: 60
  },
  hints: [
    "先问：这个功能主要是在理解 / 生成内容，还是还需要产品额外连接资料、文件、工具或权限？",
    "如果只看界面无法确认内部实现，可以直接标记“不确定”，不要硬猜。"
  ],
  referenceAnswer:
    "模型核心能力：我认为“根据当前输入生成一段新文字”最接近模型核心能力，因为这直接体现模型根据输入理解并生成内容。\n\n产品层能力：我认为“搜索最新网页资料”和“权限控制”明显需要产品层参与：前者要连接外部信息，后者要由产品系统管理用户与操作权限。\n\n暂时不能确定：我会把“上传并解析 PDF”和“记住长期偏好”放在需要进一步确认，因为它们可能同时涉及模型、文件处理、上下文或记忆系统，仅凭界面不能判断内部具体由哪一层完成。",
  review: [
    "让模型完成理解、推理和内容生成，让完整 AI 产品再组合搜索、文件、记忆、工具等能力｜不要把产品所有表面功能都归因于“模型本身已经学会了”。",
    "根据可见功能和证据做分层判断，并在证据不足时保留“不确定”｜不要替你猜厂商内部架构，也不要从一个功能直接下技术实现结论。"
  ],
  selfAssessment: [
    "我能用自己的话区分模型和完整 AI 产品。",
    "看到搜索、文件、记忆、工具或权限功能时，我不会直接把它们全部当成模型本身。",
    "我知道证据不足时可以保留“不确定”，不需要猜真实产品内部架构。"
  ]
} as const;
