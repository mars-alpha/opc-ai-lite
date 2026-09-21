import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../../lib/learning/course-builder";

const basePedagogy = {
  audience: "BEGINNER",
  languagePolicy: "TERM_READABILITY",
  aiToolNeutral: true,
  conceptMasteryBeforePractice: true,
  sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
} as const;

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export const foundationAiMlIntroPreview = {
  situation: "地图导航、垃圾邮件过滤、AI 写邮件都会被叫作“智能功能”，但它们背后的工作方式并不一样。",
  approaches: [
    { label: "固定规则", text: "满足明确条件就执行预先写好的结果。" },
    { label: "从数据学模式", text: "根据过去的数据判断新输入更像哪一类。" },
    { label: "生成新内容", text: "根据输入组织并生成新的文字、图片或声音。" }
  ],
  comparison: [
    { term: "规则程序", meaning: "规则由人明确写好，结果强调稳定和确定。" },
    { term: "Machine Learning", meaning: "系统从数据中学习模式，用来判断、预测或识别。" },
    { term: "Generative AI", meaning: "基于学到的模式生成新的内容，是机器学习体系中的一类能力。" }
  ],
  takeaway: "先判断它是在按规则执行、从数据判断，还是生成新内容，再谈“AI”。",
  comparisonPlacement: "BOTTOM"
} as const;

export const foundationAiMlBuildDraft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: ["OPC Reviewed Knowledge：AI / ML / Generative AI 基础概念"],
    researchSummary: "稳定基础知识：AI 是广义领域，Machine Learning 是其中重要方法，Generative AI 是面向内容生成的一类机器学习能力。课程只建立初学者分类直觉，不进入模型结构与训练数学。"
  },
  pedagogy: {
    ...basePedagogy,
    participation: {
      kind: "CLASSIFY",
      title: "给常见功能分分类",
      instruction: "先判断它更接近固定规则、机器学习判断，还是生成式 AI。重点写出你为什么这样判断。",
      prompt: null,
      reflection: "不要只看产品宣传里有没有“AI”两个字，先看这个功能实际上在做什么。"
    }
  },
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "foundation-ai",
    lessonId: "foundation-ai-ml-generative-ai",
    title: "AI、机器学习与生成式 AI 到底是什么",
    lessonType: "CONCEPT",
    learningObjectives: [
      "用自己的话解释 AI 是一个大范围概念，而不是某一个聊天产品。",
      "理解 Machine Learning 是让系统从数据中学习模式的一类方法。",
      "理解 Generative AI 的核心特征是生成新的内容。",
      "能用真实例子区分规则程序、机器学习和生成式 AI。"
    ],
    knowledgePoints: [
      "AI 是广义能力集合，不等于某个聊天产品或 LLM。",
      "Machine Learning 是 AI 的重要实现方式之一。",
      "Generative AI 是机器学习体系中的一类生成型能力。",
      "真实产品通常会组合普通代码、模型、数据和界面。"
    ],
    prerequisites: [],
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
      { id:"explain", kind:"EXPLAIN", title:"为什么“智能功能”不是同一种东西", objective:"先建立直觉：AI 是一个大范围概念，不是单一技术。" },
      { id:"example", kind:"EXAMPLE", title:"用三个日常功能分清三种工作方式", objective:"通过规则、判断和生成的对比讲清边界。" },
      { id:"check", kind:"CHECK", title:"你真的分得清了吗？", objective:"用三题理解检查纠正常见混淆。" },
      { id:"practice", kind:"PRACTICE", title:"给四个常见功能分类", objective:"把前三步的理解用于真实产品功能，不增加新的核心理论。" },
      { id:"review", kind:"REVIEW", title:"记住三个判断问题", objective:"形成规则 / 判断 / 生成的可复用分类框架。" },
      { id:"capability", kind:"CAPABILITY", title:"你已经会先看能力，再看宣传词", objective:"把分类能力带到之后的 AI 学习中。" }
    ],
    capabilityGain: ["看到一个“AI 功能”时，能判断它更接近规则程序、机器学习还是生成式 AI。"],
    nextLessonValue: "下一步理解 Large Language Model（大语言模型）和你正在使用的 AI 产品为什么不是同一个东西。",
    accessPresentation
  },
  content: {
    summary: "先把 AI、机器学习和生成式 AI 分清。你不需要记复杂历史，只需要能判断常见产品能力到底在做什么。",
    plainExplanation: "AI 是一个很大的范围。Machine Learning（机器学习）让系统从数据中学习模式；Generative AI（生成式 AI）进一步擅长根据输入生成新的文字、图片、声音等内容。真实软件还会同时使用普通代码和明确规则。",
    whyItMatters: "如果一开始把所有自动化、模型和聊天产品都叫成同一种 AI，后面学习 Model、RAG、Tool、Agent 时会越来越混乱。先把最基本的层级分清，后面的概念才有位置。",
    points: [
      "固定规则：条件和结果由人明确写好。",
      "机器学习：从数据中学习模式，用于判断、预测或识别。",
      "生成式 AI：根据输入生成新的内容。",
      "一个产品可以同时组合这三类能力。"
    ],
    content: [
      "垃圾邮件过滤可能依赖机器学习判断一封邮件像不像垃圾邮件；一个明确的满减公式更适合普通代码；AI 写邮件则属于生成型任务。",
      "Generative AI 并不代表软件里的所有功能都由模型完成。登录、权限、金额计算和状态保存等仍然经常由普通程序负责。",
      "基础阶段只需要学会分类，不需要进入神经网络、Transformer 或训练算力。"
    ],
    example: {
      title: "三个看起来都“智能”的功能",
      situation: "你同时使用地图导航、邮箱垃圾邮件过滤和 AI 邮件助手。",
      before: "把它们全部理解成“AI 自己在思考并给答案”。",
      after: "分别判断哪些主要依赖明确规则、哪些从数据中识别模式、哪些是在生成新内容。",
      result: "你会发现“智能产品”往往是多种机制的组合，而不是一个模型包办全部工作。"
    },
    mistakes: [
      "误区：AI 就是聊天机器人｜正确理解：聊天只是 AI 产品的一种形态。",
      "误区：会自动执行就是 AI｜正确理解：很多自动化只是普通确定性代码。",
      "误区：机器学习和生成式 AI 完全一样｜正确理解：生成式 AI 是机器学习体系中的一类能力。"
    ],
    related: ["后续：LLM 与 AI 产品", "后续：Training 与 Inference", "不提前讲：Token / Prompt / RAG"]
  },
  check: null,
  checkSequence: [
    {
      id:"check_ai_ml_best_judgment", questionType:"SINGLE_CHOICE", masteryRole:"BEST_JUDGMENT",
      question:"一个系统根据大量历史邮件学习特征，再判断新邮件是不是垃圾邮件。它最接近哪一种？",
      options:[{value:"RULE",label:"完全固定规则"},{value:"ML",label:"Machine Learning 判断"},{value:"GEN",label:"Generative AI 生成内容"}],
      correctValues:["ML"],
      explanation:"这里的核心任务是从数据中学习模式并做分类判断，不是生成新内容。",
      correctFeedback:"正确。先看系统的主要任务：它是在识别和判断，而不是生成一段新的内容。",
      incorrectFeedback:"再看任务本身：它需要根据历史数据判断新邮件属于哪一类，这更接近机器学习分类。"
    },
    {
      id:"check_ai_ml_misconception", questionType:"TRUE_FALSE", masteryRole:"MISCONCEPTION",
      question:"判断：只要一个功能会自动执行，它就一定属于生成式 AI。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
      correctValues:["FALSE"],
      explanation:"很多自动执行由普通代码或规则完成，生成式 AI 的核心特征是生成新的内容。",
      correctFeedback:"正确。自动化不等于生成式 AI，先看背后真正的工作方式。",
      incorrectFeedback:"这是最常见的混淆之一。固定规则也能自动执行，但并不会因此变成生成式 AI。"
    },
    {
      id:"check_ai_ml_boundaries", questionType:"MULTI_SELECT", masteryRole:"BOUNDARY_CONDITIONS",
      question:"下面哪些更符合 Generative AI 的典型输出？（多选）",
      options:[{value:"TEXT",label:"根据要求写一封新邮件"},{value:"IMAGE",label:"根据描述生成一张新图片"},{value:"FIXED",label:"严格按公式计算订单折扣"},{value:"VOICE",label:"根据文本生成一段语音"}],
      correctValues:["TEXT","IMAGE","VOICE"],
      explanation:"文字、图片和语音都可以是生成式输出；固定公式计算更适合确定性程序。",
      correctFeedback:"正确。生成式 AI 的关键是根据输入生成新的内容，而不是所有自动计算。",
      incorrectFeedback:"再判断哪些选项真的产生了新的内容。严格公式计算虽然自动，但属于确定性逻辑。"
    }
  ],
  practice: null,
  hints: ["先问它是在执行固定规则、判断已有模式，还是生成新内容。"],
  referenceAnswer: null,
  review: ["按固定规则执行？", "从数据中判断或预测？", "根据输入生成新内容？"],
  selfAssessment: ["我能区分 AI、Machine Learning 和 Generative AI。", "我不会再把所有自动化都叫成生成式 AI。"]
} as const;

export const foundationModelProductIntroPreview = {
  situation: "你在一个 AI 软件里看到聊天、网页搜索、文件上传、Memory 和图片功能。这些能力是不是都等于“模型本身”？",
  approaches: [
    { label:"只看 Model", text:"把产品里看到的全部能力都理解成基础模型自带。" },
    { label:"看完整产品", text:"把 Model 看成核心能力之一，再看产品系统额外连接了什么。" }
  ],
  comparison: [
    { term:"Model", meaning:"负责核心的理解与生成能力。" },
    { term:"AI Product", meaning:"把 Model 与 UI、数据、Search、Memory、Tool、安全规则等组合成用户真正使用的产品。" }
  ],
  takeaway:"你使用的是完整 AI 产品；Model 是核心能力之一，但不是整个产品。",
  comparisonPlacement:"BOTTOM"
} as const;

export const foundationModelProductBuildDraft = {
  mode:"BUILD",
  grounding:{
    status:"REVIEWED",
    sourceKind:"RESEARCH_PACKET",
    sourceLabels:[
      "OpenAI API Docs：Models overview（retrieved 2026-09）",
      "Anthropic Claude Platform Docs：Messages / models / tools overview（retrieved 2026-09）"
    ],
    researchSummary:"当前一手开发者文档明确区分模型与围绕模型构建的 API、工具、搜索、文件、智能体等平台能力。课程只提炼稳定关系：Model 是产品的一部分；产品可以组合多个系统能力，不绑定某个品牌界面。"
  },
  pedagogy:{
    ...basePedagogy,
    participation:{
      kind:"CLASSIFY",
      title:"把产品功能放到正确位置",
      instruction:"判断哪些能力主要来自 Model，哪些明显需要产品系统、数据源或外部工具一起配合。",
      prompt:null,
      reflection:"不要试图画出某家公司真实内部架构，只训练“模型不是整个产品”这个判断。"
    }
  },
  lessonSpec:{
    version:"1.0.0", courseSlug:"foundation-ai", lessonId:"foundation-llm-model-vs-product",
    title:"大语言模型是什么：Model 不等于 AI 产品", lessonType:"CONCEPT",
    learningObjectives:[
      "理解 Large Language Model（LLM）主要负责语言理解与生成。",
      "区分 Model 与用户实际操作的 AI Product / App。",
      "理解产品还可能包含 UI、Memory、Search、Tool、Safety 和普通代码。",
      "知道同一个产品可能组合多个模型或能力。"
    ],
    knowledgePoints:[
      "Model 是核心计算能力之一，不是完整产品。",
      "AI Product 通常组合 Model、Code、Data、Tools、UI 与 Policies。",
      "产品新增功能不等于基础模型本身获得同一种内生能力。",
      "同一个 Model 可以被不同产品调用，同一个产品也可以组合多个 Model。"
    ],
    prerequisites:["F1-01"], requiresExample:true, requiresCheck:true, practiceMode:"NONE",
    realAiOperation:"NONE", realAiEvidence:"NONE", referenceAnswerEnabled:false, reviewEnabled:true,
    selfAssessmentEnabled:true, courseFeedbackEnabled:true, completionGates:["CHECK"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"你用的是产品，不只是一个 Model",objective:"建立 Model 与完整 AI 产品不是同一个层级的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"拆开一个 AI 产品看里面有哪些层",objective:"用产品功能对比理解 Model / Product / Capability。"},
      {id:"check",kind:"CHECK",title:"模型和产品能力分清了吗？",objective:"纠正把搜索、Memory、文件等全部归给模型本体的误区。"},
      {id:"practice",kind:"PRACTICE",title:"给产品功能分类",objective:"把前三步理解用于真实功能，不引入 API/Tool 的正式定义。"},
      {id:"review",kind:"REVIEW",title:"每次都问两个问题",objective:"形成“Model 负责什么 / 产品系统又做了什么”的判断框架。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经能看懂 AI 产品的基本分层",objective:"为后续 Memory、RAG、Tool、MCP、Agent 建立位置感。"}
    ],
    capabilityGain:["能区分 Model、AI 产品和产品层能力，不再把界面里的所有功能都理解成模型本体。"],
    nextLessonValue:"下一步理解 Training 与 Inference，分清模型长期学到的能力和当前使用时发生的事情。",
    accessPresentation
  },
  content:{
    summary:"把 Model 和 AI 产品分开看。你会理解为什么聊天、搜索、Memory、文件和工具可以出现在同一个产品里，却不等于它们全是模型本体。",
    plainExplanation:"LLM（大语言模型）负责核心的语言模式理解与生成。但你真正使用的 AI 软件通常还会加上界面、账号、文件、搜索、Memory、工具、安全策略和普通代码。",
    whyItMatters:"后面学习 RAG、Tool、MCP、Agent 时，如果把它们全部理解成“模型变强了”，就很难理解系统是怎样组合出来的。",
    points:["Model：核心理解与生成能力。","Product：把模型和其他系统能力组织成完整体验。","Capability：一个功能可能来自模型，也可能来自产品层连接的系统。","同一个产品可以组合多个模型和工具。"],
    content:[
      "一个 AI 产品可以在不同任务里选择不同模型，也可以在模型之外调用网页搜索、文件检索或其他服务。",
      "产品能访问某份资料，并不意味着模型天然知道这份资料；可能是产品把资料放进了当前任务。",
      "这里先建立分层直觉，不进入 API、Tool 或系统编排的工程实现。"
    ],
    example:{
      title:"为什么“新增网页搜索”不等于模型天生联网",
      situation:"一个 AI 产品更新后增加了网页搜索按钮。",
      before:"理解成基础模型突然把整个互联网都记进了参数。",
      after:"把它理解成产品系统新增或更新了外部搜索能力，再把找到的信息交给模型处理。",
      result:"你会开始区分模型自身能力与产品额外连接的能力。"
    },
    mistakes:[
      "误区：AI 产品名就是模型名｜正确理解：产品可以调用一个或多个模型。",
      "误区：产品能搜索，所以模型天然联网｜正确理解：搜索通常是产品/工具层能力。",
      "误区：产品记得偏好，就是模型参数被重新训练｜正确理解：Memory 还需要单独学习。"
    ],
    related:["前置：AI / ML / Generative AI", "后续：Training / Inference", "后续才正式学习：Memory / RAG / API / Tool"]
  },
  check:null,
  checkSequence:[
    {
      id:"check_model_product_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",
      question:"一个 AI 产品今天新增“网页搜索”功能。下面哪个理解最稳妥？",
      options:[{value:"A",label:"模型一定把今天整个互联网重新训练进参数了"},{value:"B",label:"产品可能新增了外部搜索能力，再把结果交给模型"},{value:"C",label:"Model 和 Product 本来就是同一个东西"}],
      correctValues:["B"],explanation:"产品功能可以来自模型之外的 Search/Tool 等系统能力。",
      correctFeedback:"正确。先把“模型本体”和“产品连接的能力”分开，很多产品更新就更容易理解。",
      incorrectFeedback:"不要把产品新增功能自动解释成模型参数发生了同样变化。完整 AI 产品可以在模型之外连接很多能力。"
    },
    {
      id:"check_model_product_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",
      question:"判断：AI 软件里的文件上传、搜索、账号状态和模型本体属于完全同一个层级。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],
      explanation:"完整产品会把模型与 UI、数据、文件、工具、账号和普通代码组合在一起。",
      correctFeedback:"正确。Model 是产品的一部分，而不是整个产品。",
      incorrectFeedback:"再区分“核心生成模型”和“围绕它构建的产品系统”。文件、账号和工具至少需要产品层配合。"
    },
    {
      id:"check_model_product_boundaries",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",
      question:"下面哪些能力明显需要完整产品系统配合，而不能只用“Model 本体”四个字解释？（多选）",
      options:[{value:"ACCOUNT",label:"读取当前账号的会员状态"},{value:"FILE",label:"读取你刚上传但训练时不存在的文件"},{value:"UI",label:"提供历史会话列表和界面操作"},{value:"LANG",label:"根据当前输入生成一段自然语言"}],
      correctValues:["ACCOUNT","FILE","UI"],
      explanation:"账号状态、临时文件和界面历史都需要产品系统提供；语言生成是模型的核心能力之一。",
      correctFeedback:"正确。你已经开始把产品层能力和 Model 核心能力分开看。",
      incorrectFeedback:"想一想哪些信息需要产品现在去读取或保存。临时文件、账号状态和界面历史不能只靠模型参数解释。"
    }
  ],
  practice:null,hints:["先问：这项能力是否需要读取当前账号、当前文件或外部系统？"],
  referenceAnswer:null,
  review:["Model 负责什么？","产品系统额外提供了什么？"],
  selfAssessment:["我能解释 Model 和 AI Product 为什么不是同一个东西。","我知道搜索、Memory、Tool 等需要后续分别理解。"]
} as const;

export const foundationTrainingInferenceIntroPreview = {
  situation:"你上传一份 PDF 后，AI 马上能根据文件回答。它是在几秒钟里“重新训练”自己吗？",
  approaches:[
    {label:"重新训练",text:"认为每次聊天、上传文件都会改变模型长期参数。"},
    {label:"当前使用",text:"已训练好的模型在 Inference 阶段读取当前输入与 Context 完成任务。"}
  ],
  comparison:[
    {term:"Training",meaning:"通过训练过程改变模型参数，形成长期能力。"},
    {term:"Inference",meaning:"使用已经训练好的模型，根据当前输入和 Context 生成结果。"}
  ],
  takeaway:"普通聊天主要是在使用模型，不是在每次对话里重新训练模型。",
  comparisonPlacement:"BOTTOM"
} as const;

export const foundationTrainingInferenceBuildDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"APPROVED_KNOWLEDGE",sourceLabels:["OPC Reviewed Knowledge：Training / Inference 基础概念"],researchSummary:"稳定基础知识：Training 通过优化过程调整模型参数；Inference 使用已训练参数处理当前输入。当前 Context、文件与对话信息不等同于重新训练模型。Fine-tuning 只作为存在性概念，不进入实现。"},
  pedagogy:{...basePedagogy,participation:{kind:"CLASSIFY",title:"把四种行为分到正确阶段",instruction:"判断上传文件、普通聊天、Fine-tuning、调用模型生成摘要分别更接近 Training 还是 Inference / 当前 Context。",prompt:null,reflection:"核心不是背术语，而是判断有没有改变模型长期参数。"}},
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"foundation-training-inference",title:"Training 与 Inference：模型是怎样“学会”再“使用”的",lessonType:"CONCEPT",
    learningObjectives:["理解 Training 是模型从数据中调整参数、学习模式的阶段。","理解 Inference 是使用已训练模型处理当前输入的阶段。","能区分提供 Context 与重新训练模型。","知道 Fine-tuning 存在，但不把它与普通对话混为一谈。"],
    knowledgePoints:["Training 与 Inference 是不同阶段。","普通对话主要发生在 Inference 阶段。","Prompt、文件和 History 进入 Context 不等于改变模型参数。","Fine-tuning 是额外训练方式，不是每次聊天都会发生。"],
    prerequisites:["F1-01","F1-02"],requiresExample:true,requiresCheck:true,practiceMode:"NONE",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:false,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"模型先被训练，再被使用",objective:"建立 Training 与 Inference 是两个阶段的核心直觉。"},
      {id:"example",kind:"EXAMPLE",title:"上传 PDF 为什么不是重新训练",objective:"通过当前资料与长期参数的对比讲清边界。"},
      {id:"check",kind:"CHECK",title:"你还会把聊天当训练吗？",objective:"纠正常见误解并验证阶段判断。"},
      {id:"practice",kind:"PRACTICE",title:"给常见操作分分类",objective:"把概念用于上传文件、对话和 Fine-tuning 等场景。"},
      {id:"review",kind:"REVIEW",title:"只问：有没有改变长期参数",objective:"形成 Training vs 当前任务信息的判断框架。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经不会把所有“记住”都叫训练",objective:"为 Context、Memory、RAG、Fine-tuning 后续课程建立边界。"}
    ],
    capabilityGain:["能解释 Training 与 Inference 的区别，并判断普通聊天、上传文件通常不是现场重新训练。"],
    nextLessonValue:"下一步理解 Generation、Retrieval 和 Deterministic Logic，判断不同任务到底应该由什么机制负责。",
    accessPresentation
  },
  content:{
    summary:"把模型“长期学到的能力”和“这一次任务看到的信息”分开。普通聊天通常是在 Inference（推理/使用）阶段。",
    plainExplanation:"Training（训练）会调整模型参数，让模型形成长期能力；Inference（推理/使用）则拿已经训练好的模型，根据当前输入和 Context 生成结果。把一份文件放进当前任务，不等于把它重新训练进模型参数。",
    whyItMatters:"如果把 Context、Memory、RAG、上传文件都理解成“训练 AI”，后续很难判断系统到底在改变什么、信息会保存多久，以及为什么资料可以随任务变化。",
    points:["Training：形成或改变模型长期参数。","Inference：使用已经训练好的模型完成当前任务。","Context：当前任务可见的信息，不等于模型参数。","Fine-tuning：额外训练方式，基础阶段知道存在即可。"],
    content:[
      "普通对话中，你的 Prompt、历史消息和文件可以成为当前 Context，让模型在这一次任务里参考。",
      "这和修改模型长期参数是两件不同的事。关闭会话后，当前信息是否继续存在还取决于产品的 Memory 或数据机制。",
      "这里不学习梯度下降、训练集构建或 Fine-tuning 工程实现。"
    ],
    example:{
      title:"上传 PDF 后马上能回答，发生了什么？",
      situation:"你上传一份今天刚写好的项目报告，AI 几秒后就能总结。",
      before:"认为模型把整份报告重新训练进了长期参数。",
      after:"理解为产品把报告内容提供给已训练模型，模型在 Inference 阶段基于当前 Context 生成总结。",
      result:"你能把“当前看到的信息”和“长期训练形成的能力”分开。"
    },
    mistakes:["误区：多聊几次就是重新训练｜正确理解：普通聊天主要是 Inference。","误区：上传文件就是训练进模型｜正确理解：通常是把资料提供给当前任务。","误区：Prompt 改变了模型参数｜正确理解：Prompt 主要改变当前输入/Context。"],
    related:["前置：Model vs Product","后续：Context Window / Memory / RAG","Technical Track 才学习 Fine-tuning 实现"]
  },
  check:null,
  checkSequence:[
    {id:"check_training_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"你上传一份刚生成的 PDF，AI 马上能回答文件内容。最合理的理解是什么？",options:[{value:"A",label:"模型现场重新训练了全部参数"},{value:"B",label:"已训练模型在 Inference 阶段读取当前文件/Context"},{value:"C",label:"PDF 自动变成了模型永久记忆"}],correctValues:["B"],explanation:"普通文件问答主要是在 Inference 中使用当前 Context。",correctFeedback:"正确。关键在于当前资料被提供给已训练模型，而不是几秒钟内重新训练长期参数。",incorrectFeedback:"先问有没有发生长期参数更新。普通上传文件与问答通常只是让模型在当前任务里看到更多信息。"},
    {id:"check_training_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：每次和 AI 多聊几轮，模型都会自动重新训练自己的长期参数。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"普通聊天主要属于 Inference；产品可能保存 History/Memory，但那也不等于每轮都重新训练模型。",correctFeedback:"正确。对话信息和模型参数是两类不同东西。",incorrectFeedback:"这是本课最重要的误区。普通聊天可以改变当前 Context，但不等于每一轮都重新训练基础模型。"},
    {id:"check_training_boundaries",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些通常属于使用已训练模型完成当前任务，而不是重新训练基础模型？（多选）",options:[{value:"CHAT",label:"根据当前聊天生成回答"},{value:"SUMMARY",label:"根据上传文件生成摘要"},{value:"FT",label:"专门执行 Fine-tuning 训练任务"},{value:"TRANSLATE",label:"调用模型翻译当前文本"}],correctValues:["CHAT","SUMMARY","TRANSLATE"],explanation:"聊天、文件摘要和翻译属于典型 Inference；Fine-tuning 属于额外训练过程。",correctFeedback:"正确。你已经能用“是否改变长期参数”区分当前使用和训练。",incorrectFeedback:"把 Fine-tuning 单独拿出来看：它明确是在做额外训练；其他选项是在使用已有模型处理当前输入。"}
  ],
  practice:null,hints:["先问：这件事是在改变模型长期参数，还是只给当前任务更多输入？"],referenceAnswer:null,
  review:["改变长期参数？→ Training","使用已有参数 + 当前输入？→ Inference / 当前任务"],
  selfAssessment:["我能解释 Training 与 Inference 的区别。","我不会把上传文件、Memory、Prompt 都笼统叫作训练。"]
} as const;

export const foundationGenerationRetrievalIntroPreview = {
  situation:"写客户邮件、查最新年假政策、算订单折扣，这三件事都直接问模型，真的合适吗？",
  approaches:[
    {label:"都交给模型",text:"不管是事实、公式还是文字表达，都让模型直接生成最后答案。"},
    {label:"按任务分工",text:"要表达的让模型生成，要事实的先检索，要稳定规则的交给确定性代码。"}
  ],
  comparison:[
    {term:"Generation",meaning:"理解、组织和生成表达。"},
    {term:"Retrieval",meaning:"从已有资料中找到相关事实或证据。"},
    {term:"Deterministic Logic",meaning:"按稳定规则、公式、权限或状态得到确定结果。"}
  ],
  takeaway:"有些应该生成，有些应该查，有些应该算；真实系统经常需要组合。",
  comparisonPlacement:"BOTTOM"
} as const;

export const foundationGenerationRetrievalBuildDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"APPROVED_KNOWLEDGE",sourceLabels:["OPC Reviewed Knowledge：Generation / Retrieval / Deterministic Logic"],researchSummary:"稳定基础知识：生成模型擅长语义理解和内容组织；Retrieval 负责从已有来源取回信息；确定性程序适合公式、权限、状态等必须稳定可审计的逻辑。课程只建立分工直觉，不提前教授 RAG 架构。"},
  pedagogy:{...basePedagogy,participation:{kind:"CLASSIFY",title:"给六个任务分配正确机制",instruction:"把任务分成 Generation、Retrieval、Deterministic Logic 或组合，并写出为什么。",prompt:null,reflection:"如果结果必须是最新事实、精确公式或权限判断，不要因为模型“能回答”就让它独立拥有最终权威。"}},
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"foundation-generation-retrieval-rules",title:"AI 为什么不是数据库：生成、检索与确定性规则的区别",lessonType:"CONCEPT",
    learningObjectives:["理解 Generation 擅长语言理解、组合和生成，不保证事实精确。","理解 Retrieval 的目标是从已有资料找到相关信息。","理解 Deterministic Logic 更适合公式、权限、状态和明确业务规则。","能判断任务应由一种机制处理还是组合处理。"],
    knowledgePoints:["Generation 负责理解、组织与生成表达。","Retrieval 负责找到已有事实或证据。","Deterministic Logic 负责稳定规则、公式、权限与状态。","成熟 AI 系统经常组合三者。","AI 能回答不代表它应该独立决定最终事实、权限或数字。"],
    prerequisites:["F1-01","F1-02","F1-03"],requiresExample:true,requiresCheck:true,practiceMode:"NONE",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:false,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"不是所有问题都应该让模型直接回答",objective:"建立生成、查找和规则计算三种机制的分工直觉。"},
      {id:"example",kind:"EXAMPLE",title:"四个真实任务应该分别交给谁",objective:"通过邮件、政策、折扣和资格解释看清组合方式。"},
      {id:"check",kind:"CHECK",title:"你会正确分工了吗？",objective:"检查事实、公式与生成任务的判断边界。"},
      {id:"practice",kind:"PRACTICE",title:"给六个工作任务分配机制",objective:"把前三步判断框架用于真实任务，不提前教授 RAG/Tool 架构。"},
      {id:"review",kind:"REVIEW",title:"先问生成、查找、规则还是组合",objective:"形成以后设计 AI 工作方式的第一层判断框架。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会先分工，再决定用不用模型",objective:"为 RAG、Tool、Workflow、Agent 等后续知识建立正确基础。"}
    ],
    capabilityGain:["面对真实任务，能先判断该生成、检索、按确定性规则处理，还是组合使用。"],
    nextLessonValue:"下一阶段会继续理解 Token、Context Window、幻觉和模型可靠性。",
    accessPresentation
  },
  content:{
    summary:"AI 不是数据库，也不该包办所有逻辑。学会先判断任务需要生成、查资料、按规则计算，还是把它们组合起来。",
    plainExplanation:"Generation（生成）适合理解和组织语言；Retrieval（检索）负责从已有资料中找到信息；Deterministic Logic（确定性逻辑）适合公式、权限、状态和必须稳定一致的业务规则。",
    whyItMatters:"很多不可靠的 AI 系统，不是模型不够强，而是一开始就把不该交给生成模型的事实、金额或权限也交给它决定。分工正确，比“让模型包办一切”更重要。",
    points:["要表达与综合：Generation。","要已有事实和证据：Retrieval。","要精确公式、权限、状态：Deterministic Logic。","真实业务经常需要组合。"],
    content:[
      "写一封客户跟进邮件主要需要 Generation；查公司最新年假政策应该先从正式资料 Retrieval；订单折扣最好由确定性公式计算。",
      "如果要根据找到的政策给员工做解释，可以先 Retrieval 获取正式规则，再让 Generation 把规则解释清楚。",
      "这里不展开 RAG、数据库、Tool Calling 的具体实现，只建立职责判断。"
    ],
    example:{
      title:"同一个 AI 助手里的四个任务",
      situation:"员工让助手写邮件、查年假政策、算订单折扣，并解释是否符合政策。",
      before:"四个任务全部让模型凭自身回答直接给最终结果。",
      after:"邮件交给 Generation；政策先 Retrieval；折扣由确定性代码；资格说明基于检索事实和规则，再由模型组织表达。",
      result:"不同机制各自负责擅长的部分，结果更可靠，也更容易检查。"
    },
    mistakes:["误区：模型像数据库一样存着每条答案｜正确理解：生成与事实检索是不同机制。","误区：AI 能算就该负责所有金额｜正确理解：明确公式更适合确定性代码。","误区：有模型就不需要数据库或程序｜正确理解：成熟产品往往组合多种机制。"],
    related:["后续：Search / RAG","后续：Tool / API","Track 04：Code / Skill / Workflow / Agent 分工"]
  },
  check:null,
  checkSequence:[
    {id:"check_grd_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"订单折扣规则固定为“会员 9 折，非会员原价”，最终金额应该优先由哪种机制负责？",options:[{value:"GEN",label:"让模型自由生成一个金额"},{value:"RET",label:"只从文档检索一段文字"},{value:"DET",label:"确定性规则 / 代码计算"}],correctValues:["DET"],explanation:"固定公式要求稳定一致，最适合确定性逻辑。",correctFeedback:"正确。规则清楚、结果必须精确时，普通确定性代码通常比生成模型更合适。",incorrectFeedback:"先看错误成本和稳定性要求。固定折扣公式没有必要让模型每次重新“判断”一个数字。"},
    {id:"check_grd_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：模型能够流畅回答一个事实问题，就等于它是在数据库里直接读取一条确定记录。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"语言模型可以基于模式生成看似流畅的事实陈述，这与从权威数据源读取记录不是同一机制。",correctFeedback:"正确。表达得像真的，不等于发生了权威事实查询。",incorrectFeedback:"这正是为什么后续要学习 Retrieval 和 RAG。模型生成一段事实陈述，不等于它刚刚查了正式数据库。"},
    {id:"check_grd_boundaries",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些任务通常需要 Retrieval 或确定性检查，而不应该只靠模型自由生成最终结果？（多选）",options:[{value:"POLICY",label:"回答公司今天生效的最新年假政策"},{value:"DISCOUNT",label:"计算必须精确的订单折扣"},{value:"EMAIL",label:"起草一封友好的客户跟进邮件"},{value:"ACCESS",label:"判断用户是否拥有某个系统权限"}],correctValues:["POLICY","DISCOUNT","ACCESS"],explanation:"最新政策需要权威来源，折扣需要精确公式，权限必须由系统确定；邮件草稿适合生成。",correctFeedback:"正确。你已经抓住边界：事实、数字、权限需要更可靠的来源或确定性机制。",incorrectFeedback:"再看哪些结果一旦错了就不能只靠“文字看起来合理”。最新政策、精确金额和权限都需要确定性或权威来源。"}
  ],
  practice:null,hints:["问自己：需要创造表达、找到事实，还是得到稳定可审计结果？"],referenceAnswer:null,
  review:["创造/理解表达？→ Generation","查已有事实？→ Retrieval","稳定公式/权限/状态？→ Deterministic Logic","一个任务可能需要组合。"],
  selfAssessment:["我能区分 Generation、Retrieval 与 Deterministic Logic。","我知道模型能回答不等于它应该拥有最终事实、金额或权限决定权。"]
} as const;
