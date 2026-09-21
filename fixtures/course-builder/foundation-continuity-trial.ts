import {
  beginnerAiUseCasesDraft,
  beginnerAiUseCasesIntro,
  beginnerAiUseCasesKnowledgeDepth,
  beginnerAiResultQualityDraft,
  beginnerAiResultQualityIntro,
  beginnerAiResultQualityKnowledgeDepth
} from "./beginner-foundation-batch-a";
import {
  beginnerPromptDraft,
  beginnerPromptIntro,
  beginnerPromptKnowledgeDepth,
  beginnerContextDraft,
  beginnerContextIntro,
  beginnerContextKnowledgeDepth,
  beginnerIterationDraft,
  beginnerIterationIntro,
  beginnerIterationKnowledgeDepth
} from "./beginner-foundation-stage2";

const stage1Deferred = [
  "Prompt",
  "Context",
  "Training",
  "Inference",
  "Token",
  "Context Window",
  "Embedding",
  "API",
  "MCP",
  "RAG",
  "Agent",
  "Evaluation"
] as const;

const stage2Deferred = [
  "Training",
  "Inference",
  "Token",
  "Context Window",
  "Embedding",
  "API",
  "MCP",
  "RAG",
  "Agent",
  "Evaluation"
] as const;

export const continuityTrialMeta = [
  {
    lessonId: "beginner-ai-use-cases",
    inheritedArtifact: "REAL_TASK_SEED",
    artifactOutput: "AI_FIRST_DRAFT",
    nextReuse: "AI_FIRST_DRAFT",
    caseThread: "OPC_SELF_MEDIA_AI_TOPIC",
    doNotReteach: ["Prompt", "Context", "Hallucination", "模型内部机制"]
  },
  {
    lessonId: "beginner-ai-result-quality",
    inheritedArtifact: "AI_FIRST_DRAFT",
    artifactOutput: "SELECTED_BETTER_DRAFT_WITH_COMPARISON_NOTE",
    nextReuse: "SELECTED_BETTER_DRAFT",
    caseThread: "OPC_SELF_MEDIA_AI_TOPIC",
    doNotReteach: ["Prompt 正式结构", "Context 定义", "Iteration"]
  },
  {
    lessonId: "beginner-prompt",
    inheritedArtifact: "PREPARED_DRAFT_WITH_SOURCE_PLAN",
    artifactOutput: "CLEAR_TASK_BRIEF_WITH_NEW_DRAFT",
    nextReuse: "CLEAR_TASK_BRIEF_WITH_NEW_DRAFT",
    caseThread: "OPC_SELF_MEDIA_AI_TOPIC",
    doNotReteach: ["输入清楚为什么会改变结果", "F1-02 Before/After 论证"]
  },
  {
    lessonId: "beginner-context",
    inheritedArtifact: "CLEAR_TASK_BRIEF_WITH_NEW_DRAFT",
    artifactOutput: "CONTEXT_PACK_WITH_CONTEXT_ENRICHED_DRAFT",
    nextReuse: "CONTEXT_ENRICHED_DRAFT",
    caseThread: "OPC_SELF_MEDIA_AI_TOPIC",
    doNotReteach: ["搜索/文件产品能力", "输入影响结果直觉"]
  },
  {
    lessonId: "beginner-iteration",
    inheritedArtifact: "CONTEXT_ENRICHED_DRAFT",
    artifactOutput: "ITERATION_NOTES_WITH_ITERATED_DRAFT",
    nextReuse: "ITERATED_DRAFT",
    caseThread: "OPC_SELF_MEDIA_AI_TOPIC",
    doNotReteach: ["Prompt 三要素", "Context 定义", "输入影响结果"]
  }
] as const;

export const continuityTrialUseCasesIntro = {
  ...beginnerAiUseCasesIntro,
  situation: "你准备做一篇“最近一个值得关注的 AI 变化”短内容。先别学一堆概念，今天只做一件事：让 AI 帮你把这个真实想法变成第一版草稿。",
  approaches: [
    { label: "一直停在想法", text: "脑子里知道想讲什么，但没有第一版，就很难继续判断和修改。" },
    { label: "先拿到第一版", text: "把真实主题交给正在使用的 AI 软件，让它先给一版，再由你继续判断。" }
  ],
  takeaway: "第一课的目标不是学完 AI，而是留下一份后面七节课会继续使用的真实草稿。"
} as const;

export const continuityTrialUseCasesDraft = {
  ...beginnerAiUseCasesDraft,
  grounding: {
    ...beginnerAiUseCasesDraft.grounding,
    sourceLabels: ["Foundation Continuity Brief v1 · F1-01"],
    researchSummary: "本课只让零基础用户把一个 OPC/自媒体 AI 主题变成 AI First Draft，并建立 AI 可以协助真实任务、最终判断仍由人负责的使用直觉。"
  },
  pedagogy: {
    ...beginnerAiUseCasesDraft.pedagogy,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "我能不能先用 AI 把一个真实内容想法做出第一版？",
      mainConcept: "先让 AI 协助一个真实、容易检查的小任务，并保留第一版继续加工。",
      allowedCoreTerms: [],
      deferredTerms: stage1Deferred
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "生成你的第一版内容",
      instruction: "选一个你真的想讲的 AI 主题，把一句简单要求复制到常用 AI 软件，让它先给一版。不要追求完美，先把这份草稿留下来。",
      prompt: "帮我把一个最近值得关注的 AI 变化写成一篇给普通 AI 学习者看的短内容草稿。",
      reflection: "先保存这一版。下一课不会换案例，而是继续用它做对比。"
    }
  },
  lessonSpec: {
    ...beginnerAiUseCasesDraft.lessonSpec,
    version: "1.1.0-continuity-trial",
    learningObjectives: [
      "能从真实内容需求里选出一个适合 AI 先协助的小任务。",
      "能实际生成并保留一份 AI 第一版草稿。",
      "知道第一版只是后续加工的起点，不是最终成品。"
    ],
    knowledgePoints: [
      "AI 可以先协助生成、整理或起草真实任务的第一版。",
      "人继续负责判断、修改和最终使用。"
    ],
    steps: [
      { id:"explain", kind:"EXPLAIN", title:"先把一个真实想法做出来", objective:"让学习者从真实内容任务进入，而不是从概念进入。" },
      { id:"example", kind:"EXAMPLE", title:"同一个 AI 主题，先从想法变成第一版", objective:"看见 AI 最直接的价值是先产出可判断的第一版草稿。" },
      { id:"check", kind:"CHECK", title:"什么任务适合先让 AI 做第一版？", objective:"判断真实、低风险、容易检查的 AI 协作入口。" },
      { id:"practice", kind:"PRACTICE", title:"生成并保留你的 AI 第一版草稿", objective:"为后续课程留下真实学习产物。" },
      { id:"review", kind:"REVIEW", title:"第一课只记住两件事", objective:"收束为先做第一版、人继续负责判断。" },
      { id:"capability", kind:"CAPABILITY", title:"你已经有了可以继续加工的第一版", objective:"让下一课直接继续使用当前草稿。" }
    ],
    capabilityGain: ["能把一个真实内容想法交给 AI，得到并保留第一版草稿。"],
    nextLessonValue: "下一节直接拿这份 AI 第一版草稿做一次小实验：只改变一个重要信息，看结果会怎样变化。"
  },
  content: {
    ...beginnerAiUseCasesDraft.content,
    summary: "从一个真实主题开始，让 AI 先给你一版可以继续加工的内容。",
    plainExplanation: "你不需要先懂 AI 内部原理。先选一个自己真的想发布或讨论的主题，让正在使用的 AI 软件给出第一版。第一版的价值不是完美，而是让你有东西可以比较、修改和检查。",
    whyItMatters: "后面的课程都会继续使用这份草稿。你不是每节重新做一道题，而是在把同一份内容一步一步做完整。",
    points: ["选一个真实主题。","让 AI 先给第一版。","保存这份草稿，暂时不要把它当成最终成品。"],
    content: [
      "这套方法可以用于任何行业里的真实内容任务。",
      "第一版只要能看、能判断，就已经有价值。",
      "最终发布前还会继续补信息、修改和检查。"
    ],
    example: {
      title: "从“我想讲一个 AI 新变化”到第一版",
      situation: "你最近注意到一个 AI 工具或功能变化，想告诉普通用户它有什么用。",
      before: "只有一个想法，还没有可读内容。",
      after: "让 AI 先写一版 150–250 字的短内容，说明变化是什么、普通人为什么值得关注。",
      result: "你得到一份不完美但可以继续判断和修改的 AI 第一版草稿。"
    },
    mistakes: [
      "误区：第一版必须马上能发布｜正确理解：第一版是后续加工的起点。",
      "误区：一定要先学很多理论才能开始｜正确理解：先用真实任务建立判断。",
      "误区：AI 生成后就结束｜正确理解：后续课程会继续加工同一份草稿。"
    ],
    related: ["下一课继续使用这份草稿。","后续会逐步把它做到可发布。"]
  },
  checkSequence: [
    {
      id:"continuity_use_best",
      questionType:"SINGLE_CHOICE",
      masteryRole:"BEST_JUDGMENT",
      question:"你想把一个最近看到的 AI 新变化做成一篇短内容。第一步最合适的做法是什么？",
      options:[
        {value:"A",label:"先让 AI 根据这个真实主题给出第一版草稿，再由自己判断和修改"},
        {value:"B",label:"先把所有 AI 技术名词学完再开始"},
        {value:"C",label:"直接让 AI 决定最终发布内容，不再检查"}
      ],
      correctValues:["A"],
      explanation:"第一课的目标是先得到一个真实、可判断的第一版，而不是一次完成全部工作。",
      correctFeedback:"正确。先有第一版，后面才有东西可以比较、补资料和修改。",
      incorrectFeedback:"这一步只需要先把真实想法做成第一版，最终判断仍由你负责。"
    },
    {
      id:"continuity_use_misconception",
      questionType:"TRUE_FALSE",
      masteryRole:"MISCONCEPTION",
      question:"判断：AI 已经生成第一版后，这个任务就算完成了。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
      correctValues:["FALSE"],
      explanation:"第一版只是后续比较、补资料、修改和核实的起点。",
      correctFeedback:"正确。第一版是共同学习产物，不是最终成品。",
      incorrectFeedback:"后面几节会继续使用同一份草稿，所以第一版只是起点。"
    },
    {
      id:"continuity_use_boundary",
      questionType:"MULTI_SELECT",
      masteryRole:"BOUNDARY_CONDITIONS",
      question:"下面哪些做法符合“先让 AI 帮一步，人继续负责判断”的原则？（多选）",
      options:[
        {value:"DRAFT",label:"先让 AI 写一版内容草稿"},
        {value:"OUTLINE",label:"先让 AI 整理一个内容结构"},
        {value:"IDEAS",label:"先让 AI 给几个可比较的方向"},
        {value:"FINAL",label:"把最终事实判断和发布决定全部交给 AI"}
      ],
      correctValues:["DRAFT","OUTLINE","IDEAS"],
      explanation:"AI 很适合先产出可判断的中间结果，但最终事实判断和使用决定仍需要人负责。",
      correctFeedback:"正确。你已经抓住第一课最重要的使用边界。",
      incorrectFeedback:"先选那些能让 AI 帮你产生中间结果、又方便你继续检查和修改的动作。"
    }
  ],
  practice: {
    ...beginnerAiUseCasesDraft.practice!,
    id: "continuity_f101_first_draft",
    title: "生成并保留你的第一版内容",
    goal: "为真实主题留下后续课程可以继续使用的 AI 第一版草稿。",
    instructions: [
      { key:"topic", label:"我真正想讲的 AI 主题", prompt:"写一个你最近真的想做成内容的 AI 变化、工具或使用方法。" },
      { key:"draft", label:"AI 第一版草稿", prompt:"把 AI 生成的第一版保留下来；现在不需要把它改到完美。" }
    ],
    hints: ["主题越真实，后面几节越容易判断变化。","先留下第一版，不要在这一课提前做完整优化。"],
    rubric: [
      { key:"topic", label:"主题真实具体", maxScore:40, minScore:20, example:"最近 AI 软件开始更方便地处理文件，我想讲普通用户能怎么用。" },
      { key:"draft", label:"已有可继续加工的第一版", maxScore:60, minScore:30, example:"保留一份 150–250 字左右的 AI 第一版草稿。" }
    ],
    passScore:60
  },
  hints:["选一个你自己愿意继续做下去的主题。","现在只需要得到第一版。"],
  referenceAnswer:"主题：最近 AI 软件处理文件变得更方便，普通用户可以怎样用。\nAI 第一版草稿：先保留一版给普通 AI 学习者看的短内容，后续课程继续修改。",
  review:["先用真实任务拿到第一版。","第一版不是成品，是后续学习的共同产物。"],
  selfAssessment:["我已经留下了一份后面课程会继续使用的 AI 第一版草稿。","我知道最终判断仍然由我负责。"]
} as const;

export const continuityTrialUseCasesKnowledgeDepth = {
  ...beginnerAiUseCasesKnowledgeDepth,
  example: [
    { title:"同一个主题会贯穿后面课程", text:"这份草稿后面会继续比较、补资料、修改和核实，不会每节换一个新案例。" }
  ],
  review: [
    { title:"先做出来", text:"有了第一版，才有东西可以判断和改善。" },
    { title:"先别追求完美", text:"把优化留给后面的连续步骤。" }
  ]
} as const;

export const continuityTrialUseCasesReferenceFill = {
  topic:"最近 AI 软件处理文件变得更方便，普通用户可以怎样用。",
  draft:"保留一份给普通 AI 学习者看的第一版短内容，作为后续课程继续加工的草稿。"
} as const;

export const continuityTrialResultQualityIntro = {
  ...beginnerAiResultQualityIntro,
  situation: "你已经有了上一课的 AI 第一版草稿。现在不要换主题，只做一个小实验：只补“这篇内容是写给刚开始学 AI 的普通用户”这一条信息，再看第二版哪里变了。",
  approaches: [
    { label:"第一版", text:"保留上一课原始要求和 AI 第一版草稿。" },
    { label:"只改一个变量", text:"只补一个真正重要的信息，再生成第二版，比较差异。" }
  ],
  takeaway:"这一课只验证一件事：你给的信息发生变化，结果也可能明显变化。"
} as const;

export const continuityTrialResultQualityDraft = {
  ...beginnerAiResultQualityDraft,
  grounding:{
    ...beginnerAiResultQualityDraft.grounding,
    sourceLabels:["Foundation Continuity Brief v1 · F1-02"],
    researchSummary:"本课只对 F1-01 的同一 AI First Draft 做一个变量实验，建立输入变化影响结果的直觉；不正式教授 Prompt 或 Context。"
  },
  pedagogy:{
    ...beginnerAiResultQualityDraft.pedagogy,
    qualityProfile:{
      id:"BEGINNER_QUALITY_V1",
      mainLearnerQuestion:"只补一个关键信息，同一份内容为什么会明显变化？",
      mainConcept:"输入中的关键变量变化，会让同一个任务得到不同结果。",
      allowedCoreTerms:[],
      deferredTerms:stage1Deferred
    },
    participation:{
      kind:"COPY_TO_AI",
      title:"用同一份草稿做一次单变量比较",
      instruction:"继续用上一课同一个 AI 主题，只补“目标读者”这一条信息，生成第二版。",
      prompt:"继续刚才同一个主题。这篇内容写给刚开始学 AI、希望马上能用起来的普通用户。请重写一版。",
      reflection:"只比较：增加“目标读者”后，第二版是否更容易理解、更贴近使用需求。"
    }
  },
  lessonSpec:{
    ...beginnerAiResultQualityDraft.lessonSpec,
    version:"1.1.0-continuity-trial",
    learningObjectives:["能用同一份学习产物做一次单变量对比。","能指出哪个新增信息改变了结果。","不把这一体验提前总结成复杂方法。"],
    knowledgePoints:["关键输入变化可能改变结果。","用单变量比较更容易看见因果。"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"别换任务，只改一个信息",objective:"把上一课草稿直接带进一个最小实验。"},
      {id:"example",kind:"EXAMPLE",title:"只补“写给谁”，第二版哪里不同",objective:"用单变量 Before/After 建立结果变化直觉。"},
      {id:"check",kind:"CHECK",title:"哪一个变化真正影响了结果？",objective:"检查是否能识别关键输入变量。"},
      {id:"practice",kind:"PRACTICE",title:"继续你的草稿，做一次单变量实验",objective:"比较同一学习产物的两个版本。"},
      {id:"review",kind:"REVIEW",title:"只记住这个因果关系",objective:"收束为关键信息变化会改变结果。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会用比较找到影响结果的信息",objective:"把改进后的草稿交给下一课继续检查。"}
    ],
    capabilityGain:["能对同一份 AI 草稿做一次单变量比较，并说清哪个信息改变了结果。"],
    nextLessonValue:"下一节继续拿你选中的改进后草稿，找出哪些事实性内容不能因为写得自然就直接相信。"
  },
  content:{
    ...beginnerAiResultQualityDraft.content,
    summary:"继续上一课同一份草稿，只改变一个关键信息，亲眼看结果为什么会不同。",
    plainExplanation:"这一课不需要学新的复杂方法。你只保留同一个主题、同一个任务，然后补一个变量，例如目标读者。这样你会更容易判断结果变化到底来自哪里。",
    whyItMatters:"如果每次同时改很多东西，你很难知道什么真正有效。先学会一次只观察一个关键变化，后面正式整理任务时会更清楚。",
    points:["继续同一个主题。","只补一个关键变量。","比较两个版本并留下一句判断。"],
    content:["这一课不正式学习复杂任务结构。","不要换成咖啡店、客户通知等新案例。","选择更好的版本继续往下走。"],
    example:{
      title:"同一个 AI 主题，只补目标读者",
      situation:"上一课已经有一版介绍 AI 新变化的草稿。",
      before:"只说“写一篇介绍这个 AI 变化的短内容”。",
      after:"只补“写给刚开始学 AI、希望马上能用起来的普通用户”。",
      result:"第二版更可能减少术语、增加实际用途；你可以直接比较哪一版更适合目标读者。"
    },
    mistakes:[
      "误区：这一课要学一套复杂写法｜正确理解：只做单变量实验。",
      "误区：为了看差异同时改五个要求｜正确理解：一次只改一个关键变量。",
      "误区：比较完就丢掉结果｜正确理解：选择改进后的草稿给下一课继续使用。"
    ],
    related:["上一课的第一版草稿是本课起点。","下一课直接检查改进后草稿里的事实风险。"]
  },
  checkSequence:[
    {
      id:"continuity_quality_best",
      questionType:"SINGLE_CHOICE",
      masteryRole:"BEST_JUDGMENT",
      question:"你想看“目标读者”会不会影响上一课的草稿。哪种做法最合适？",
      options:[
        {value:"A",label:"只补充目标读者，其他要求保持不变，再生成第二版"},
        {value:"B",label:"同时改主题、长度、语气和受众，再比较"},
        {value:"C",label:"换一个完全不同的任务"}
      ],
      correctValues:["A"],
      explanation:"一次只改变一个关键变量，最容易看清它对结果的真实影响。",
      correctFeedback:"正确。这样你才能知道结果变化主要来自哪一条信息。",
      incorrectFeedback:"如果一次改很多东西，就很难判断到底是哪一个变化起作用。"
    },
    {
      id:"continuity_quality_misconception",
      questionType:"TRUE_FALSE",
      masteryRole:"MISCONCEPTION",
      question:"判断：只要第二版变长了，就说明新增的信息一定让结果变好了。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
      correctValues:["FALSE"],
      explanation:"要看结果是否更贴近当前目标，而不是只看字数或表面变化。",
      correctFeedback:"正确。变化不等于改善，关键是是否更符合任务。",
      incorrectFeedback:"比较时要回到当前目标，例如是否更适合目标读者。"
    },
    {
      id:"continuity_quality_boundary",
      questionType:"MULTI_SELECT",
      masteryRole:"BOUNDARY_CONDITIONS",
      question:"做单变量比较时，下面哪些做法应该保持不变？（多选）",
      options:[
        {value:"TOPIC",label:"原来的内容主题"},
        {value:"TASK",label:"原来的主要任务"},
        {value:"TOOL",label:"正在使用的 AI 工具"},
        {value:"VARIABLE",label:"这次刻意测试的那一个关键信息"}
      ],
      correctValues:["TOPIC","TASK","TOOL"],
      explanation:"除了要测试的那一个变量，其他条件尽量保持不变。",
      correctFeedback:"正确。这样对比才有意义。",
      incorrectFeedback:"把要测试的变量单独改变，其他条件尽量保持一致。"
    }
  ],
  practice:{
    ...beginnerAiResultQualityDraft.practice!,
    id:"continuity_f102_compare",
    title:"给同一份草稿做一次单变量比较",
    goal:"保留同一主题，只新增一个关键信息，选出改进后的草稿。",
    instructions:[
      {key:"changed",label:"我只改变了什么",prompt:"只写一个变量，例如目标读者。"},
      {key:"comparison",label:"结果发生了什么变化",prompt:"比较两个版本，用一句话写出最明显的变化。"}
    ],
    hints:["一次只改变一个信息。","不要为了让结果更好而同时加很多要求。"],
    rubric:[
      {key:"changed",label:"变量单一明确",maxScore:40,minScore:20,example:"只补充：写给刚开始学 AI 的普通用户。"},
      {key:"comparison",label:"能说清结果差异",maxScore:60,minScore:30,example:"第二版少了术语，更强调普通用户能马上怎么用。"}
    ],
    passScore:60
  },
  hints:["继续用上一课同一个 AI 主题。","只比较一个变量带来的变化。"],
  referenceAnswer:"改变的变量：目标读者 = 刚开始学 AI、希望马上能用起来的普通用户。\n比较：第二版更少术语，更强调实际用途，因此选第二版作为改进后的草稿。",
  review:["同一个任务只改一个变量，更容易看清原因。","选中的改进后草稿会继续进入下一课。"],
  selfAssessment:["我能指出一个具体信息怎样改变了同一份草稿。","我没有把这一课提前学成复杂任务写法。"]
} as const;

export const continuityTrialResultQualityKnowledgeDepth = {
  ...beginnerAiResultQualityKnowledgeDepth,
  example:[{title:"单变量更容易看懂因果",text:"主题、工具、任务都不变，只增加“写给谁”，你才更容易判断差异来自哪里。"}],
  review:[
    {title:"先比较，再总结",text:"先看真实结果发生了什么，再形成自己的判断。"},
    {title:"改进后的草稿要留下",text:"下一课直接在它上面标记风险。"}
  ]
} as const;

export const continuityTrialResultQualityReferenceFill = {
  changed:"目标读者：刚开始学 AI、希望马上能用起来的普通用户。",
  comparison:"第二版更少术语，更强调普通用户能马上怎么用，因此作为改进后的草稿。"
} as const;

export const continuityTrialPromptIntro = {
  ...beginnerPromptIntro,
  situation:"你已经用前几课证明过：任务信息会影响结果。现在不再重复这个结论，而是把当前这篇内容整理成一份以后可以反复使用和检查的清楚任务说明。",
  approaches:[
    {label:"零散要求",text:"主题、受众、目标散落在几轮对话里，自己也很难检查。"},
    {label:"整理成任务说明",text:"把“做什么、必要背景、结果要求”集中成一份清楚任务说明。"}
  ],
  takeaway:"这一课的新能力不是再次证明“说清楚有用”，而是把已有经验正式整理成一份清楚的任务说明。"
} as const;

export const continuityTrialPromptDraft = {
  ...beginnerPromptDraft,
  grounding:{
    ...beginnerPromptDraft.grounding,
    sourceLabels:["Foundation Continuity Brief v1 · F2-01"],
    researchSummary:"学习者已在 Stage 1 体验过输入变化影响结果。本课不重复论证，只把同一 OPC/自媒体 Artifact 的零散要求整理为 Clear Task Brief。"
  },
  pedagogy:{
    ...beginnerPromptDraft.pedagogy,
    qualityProfile:{
      id:"BEGINNER_QUALITY_V1",
      mainLearnerQuestion:"怎样把前面零散的要求整理成一份清楚、可复用的任务说明？",
      mainConcept:"提示词（Prompt）在当前课被正式整理为一份可以执行和检查的任务说明。",
      allowedCoreTerms:["Prompt"],
      deferredTerms:stage2Deferred
    },
    participation:{
      kind:"COPY_TO_AI",
      title:"用清楚的任务说明重新生成同一篇内容",
      instruction:"不要换主题。把前面已经确定的任务、目标读者和结果要求整理成一份任务说明，再交给常用 AI 软件。",
      prompt:null,
      reflection:"比较重点不是再次证明输入影响结果，而是检查这份任务说明是否已经让你自己也能清楚验收。"
    }
  },
  lessonSpec:{
    ...beginnerPromptDraft.lessonSpec,
    version:"1.1.0-continuity-trial",
    title:"提示词（Prompt）：怎样把想做的事情说清楚",
    learningObjectives:["能把前面零散要求整理成一份清楚的任务说明。","能区分任务、必要背景和结果要求。","能用同一主题生成一份结构更清楚的新草稿。"],
    knowledgePoints:["提示词（Prompt）在本课正式作为当前任务说明。","清楚的任务说明让执行与验收都更明确。"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"把前面的经验整理成一份任务说明",objective:"正式建立提示词（Prompt）的任务说明方法，而不是重复证明输入质量。"},
      {id:"example",kind:"EXAMPLE",title:"把同一篇内容的零散要求收拢起来",objective:"看见任务、必要背景、结果要求怎样组成可执行说明。"},
      {id:"check",kind:"CHECK",title:"这份任务说明还缺哪一块？",objective:"检查任务说明是否完整可验收。"},
      {id:"practice",kind:"PRACTICE",title:"整理你自己的任务说明",objective:"基于前面已有内容形成可继续复用的任务说明。"},
      {id:"review",kind:"REVIEW",title:"以后先把三件事收拢",objective:"收束任务、必要背景、结果要求。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经有一份可执行的任务说明",objective:"让下一课直接在此基础上补充上下文资料。"}
    ],
    capabilityGain:["能把同一真实内容任务整理成一份 AI 可以执行、自己也可以检查的清楚任务说明。"],
    nextLessonValue:"下一节不换主题，直接检查这份任务说明之外还缺哪些受众、资料和当前事实，形成上下文资料包。"
  },
  content:{
    ...beginnerPromptDraft.content,
    summary:"把前面已经做过的同一篇内容，整理成一份清楚、可执行、可检查的任务说明。",
    plainExplanation:"你已经体验过信息变化会影响结果，所以这一课不再证明这一点。现在把已经知道的任务、必要背景和结果要求集中起来，让这份说明既方便 AI 执行，也方便你检查有没有跑偏。",
    whyItMatters:"当一个任务开始反复修改时，零散要求很容易丢。清楚任务说明的价值是把当前共识固定下来，后面补资料和改稿都围绕它继续。",
    points:["任务：这次到底要做什么。","必要背景：已经确定、会影响结果的信息。","结果要求：最后应该交出什么。"],
    content:["只整理当前任务需要的信息。","不追求万能格式。","后面补资料时继续沿用这份任务说明。"],
    example:{
      title:"把同一篇 AI 主题内容整理成任务说明",
      situation:"你已经有改进后的草稿、风险标记和资料计划。",
      before:"要求散落在多轮对话：讲 AI 新变化、写给新手、不要太技术。",
      after:"任务：写一篇介绍 AI 新变化的短内容；必要背景：读者刚开始学 AI；结果要求：150–250 字、易懂、具体、不夸大。",
      result:"任务没有换，只是从零散要求变成一份可以继续补资料和验收的清楚任务说明。"
    },
    mistakes:[
      "误区：又从头证明“说清楚会更好”｜正确理解：这一课直接整理正式任务说明。",
      "误区：把所有背景都塞进任务说明｜正确理解：这里只放当前已确定的必要信息。",
      "误区：换一个新案例练习｜正确理解：继续使用同一篇内容。"
    ],
    related:["上一阶段已经验证输入变化会影响结果。","下一课给同一任务建立上下文资料包。"]
  },
  checkSequence:[
    {
      id:"continuity_prompt_best",
      questionType:"SINGLE_CHOICE",
      masteryRole:"BEST_JUDGMENT",
      question:"下面哪一份任务说明最容易让你自己和 AI 都知道要做什么？",
      options:[
        {value:"A",label:"写得更好一点"},
        {value:"B",label:"写一篇介绍某个 AI 新变化的短内容，面向刚开始学 AI 的普通用户，150–250 字、易懂、不夸大"},
        {value:"C",label:"你看着办，专业一点"}
      ],
      correctValues:["B"],
      explanation:"清楚任务说明要让“做什么、必要背景、结果要求”都能被执行和检查。",
      correctFeedback:"正确。这是一份可以直接执行、也方便验收的任务说明。",
      incorrectFeedback:"不要只给模糊形容词，要让任务和结果要求都具体。"
    },
    {
      id:"continuity_prompt_misconception",
      questionType:"TRUE_FALSE",
      masteryRole:"MISCONCEPTION",
      question:"判断：提示词（Prompt）越长越好，只要把能想到的内容全部写进去就行。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
      correctValues:["FALSE"],
      explanation:"任务说明只需要保留当前任务真正必要的信息。",
      correctFeedback:"正确。清楚比冗长更重要。",
      incorrectFeedback:"无关信息不会自动让任务更清楚，反而可能让重点变模糊。"
    },
    {
      id:"continuity_prompt_boundary",
      questionType:"MULTI_SELECT",
      masteryRole:"BOUNDARY_CONDITIONS",
      question:"一份清楚任务说明通常至少要回答哪些问题？（多选）",
      options:[
        {value:"TASK",label:"这次要做什么"},
        {value:"BACKGROUND",label:"哪些必要背景已经确定"},
        {value:"RESULT",label:"希望最后得到什么结果"},
        {value:"HISTORY",label:"把所有历史聊天都完整贴进去"}
      ],
      correctValues:["TASK","BACKGROUND","RESULT"],
      explanation:"当前任务、必要背景和结果要求是本课训练的三个核心检查点。",
      correctFeedback:"正确。你已经能把零散要求收拢成任务说明。",
      incorrectFeedback:"先抓“做什么、必要背景、结果要求”，不要把所有信息都塞进去。"
    }
  ],
  practice:{
    ...beginnerPromptDraft.practice!,
    id:"continuity_f201_task_brief",
    title:"整理同一篇内容的任务说明",
    goal:"把前面已经确定的要求收拢成一份可执行任务说明。",
    instructions:[
      {key:"task",label:"任务",prompt:"这一次具体要完成什么内容任务？"},
      {key:"result",label:"必要背景 + 结果要求",prompt:"写清目标读者、已确定背景，以及最后希望得到什么形式的结果。"}
    ],
    hints:["不要重新发明主题，沿用前面的 AI 内容。","只写已经确定、会影响当前结果的信息。"],
    rubric:[
      {key:"task",label:"任务清楚",maxScore:45,minScore:23,example:"写一篇介绍某个 AI 新变化的短内容。"},
      {key:"result",label:"背景和结果可验收",maxScore:55,minScore:28,example:"读者刚开始学 AI；150–250 字、易懂、具体、不夸大。"}
    ],
    passScore:60
  },
  hints:["任务不换，整理表达。","这份任务说明下一课还要继续使用。"],
  referenceAnswer:"任务：写一篇最近 AI 变化的短内容。\n必要背景 + 结果要求：读者是刚开始学 AI、希望马上能用起来的普通用户；150–250 字、易懂、具体、不夸大。",
  review:["提示词（Prompt）在本课正式变成可执行的任务说明。","任务说明要让执行和验收都更清楚。","下一步不是重写任务，而是补充上下文资料。"],
  selfAssessment:["我已经把同一内容任务整理成清楚的任务说明。","我知道下一步还要补资料，而不是换一个新任务。"]
} as const;

export const continuityTrialPromptKnowledgeDepth = {
  ...beginnerPromptKnowledgeDepth,
  example:[{title:"整理，不是重新发明",text:"前面已经知道哪些信息重要；现在只是把它们集中成一份稳定任务说明。"}],
  review:[
    {title:"任务说明固定当前共识",text:"后续补资料、改稿都围绕同一任务继续。"},
    {title:"不是万能模板",text:"只保留当前任务真正需要的部分。"}
  ]
} as const;

export const continuityTrialPromptReferenceFill = {
  task:"写一篇最近 AI 变化的短内容。",
  result:"读者是刚开始学 AI、希望马上能用起来的普通用户；150–250 字、易懂、具体、不夸大。"
} as const;

export const continuityTrialContextIntro = {
  ...beginnerContextIntro,
  situation:"清楚的任务说明已经写明“要做什么”，但真正写好这篇内容还需要目标读者、主题资料和可引用事实。现在要做的是把这些材料组成一个最小上下文资料包。",
  approaches:[
    {label:"只有任务说明",text:"任务很清楚，但 AI 手里还没有完成这篇内容所需的全部材料。"},
    {label:"补上下文资料",text:"把当前任务真正要用的读者、资料和事实放到一起。"}
  ],
  takeaway:"这一课不再讨论“AI 为什么不知道”，而是直接给当前任务装好它真正需要的材料。"
} as const;

export const continuityTrialContextDraft = {
  ...beginnerContextDraft,
  grounding:{
    ...beginnerContextDraft.grounding,
    sourceLabels:["Foundation Continuity Brief v1 · F2-02"],
    researchSummary:"本课承接 Clear Task Brief，直接建立最小 Context Pack；不重复 Stage 1 的信息缺口直觉，也不重讲搜索/文件产品能力。"
  },
  pedagogy:{
    ...beginnerContextDraft.pedagogy,
    qualityProfile:{
      id:"BEGINNER_QUALITY_V1",
      mainLearnerQuestion:"这份任务说明要真正做下去，还需要给 AI 哪些当前材料？",
      mainConcept:"上下文（Context）是当前任务实际可以使用的信息；本课把它落实为最小上下文资料包。",
      allowedCoreTerms:["Context"],
      deferredTerms:stage2Deferred
    },
    participation:{
      kind:"MINI_TASK",
      title:"给同一篇内容组装上下文资料包",
      instruction:"继续同一个主题，从已有信息里写出当前这篇内容真正需要的 3 类资料。",
      prompt:"请写出：1）目标读者最关心的问题；2）当前主题需要引用的一条资料或来源；3）AI 不应该自行猜测的一条事实。",
      reflection:"完成后检查：这三类资料是否都直接帮助当前任务，而不是无关背景。"
    }
  },
  lessonSpec:{
    ...beginnerContextDraft.lessonSpec,
    version:"1.1.0-continuity-trial",
    title:"上下文（Context）：AI 这次真正看得到哪些信息",
    learningObjectives:["能从任务说明推导当前需要的上下文（Context）。","能组装一个最小上下文资料包。","能区分必要材料和无关资料。"],
    knowledgePoints:["上下文（Context）是当前任务实际可用的信息集合。","上下文资料包应够用、相关、可继续更新。"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"任务说明清楚了，现在给它装材料",objective:"从继承任务直接进入上下文资料包。"},
      {id:"example",kind:"EXAMPLE",title:"同一篇内容需要哪些材料",objective:"用读者、主题资料和事实来源讲透上下文资料包。"},
      {id:"check",kind:"CHECK",title:"哪些材料属于当前任务的上下文？",objective:"判断够用且相关的信息。"},
      {id:"practice",kind:"PRACTICE",title:"组装你的最小上下文资料包",objective:"让同一份学习产物得到完成任务所需材料。"},
      {id:"review",kind:"REVIEW",title:"上下文资料包只看两件事",objective:"收束为当前可用、真正相关。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会给任务配齐当前材料",objective:"让下一课直接修改补充资料后的草稿。"}
    ],
    capabilityGain:["能为同一真实内容任务建立一个够用、相关的最小上下文资料包。"],
    nextLessonValue:"下一节直接拿补充资料后的草稿，指出最影响发布的一两个偏差并继续改，不重新生成无关案例。"
  },
  content:{
    ...beginnerContextDraft.content,
    summary:"任务说明已经有了，现在把完成同一篇内容真正需要的材料组成上下文资料包。",
    plainExplanation:"上下文（Context）可以理解成 AI 当前完成任务时真正可以使用的信息。这一课不再停留在定义，而是把当前任务需要的目标读者、主题资料和可引用事实放到一起。",
    whyItMatters:"任务说明负责说清做什么，上下文资料包负责提供拿什么做。两者分开后，你更容易发现到底是任务没说清，还是材料还不够。",
    points:["目标读者。","当前主题资料。","可引用事实与来源。"],
    content:["只收当前任务会用到的材料。","已有来源尽量一起保留。","下一课继续在补充资料后的草稿上改稿。"],
    example:{
      title:"给同一篇 AI 主题内容补齐材料",
      situation:"任务说明已经要求写给 AI 新手、150–250 字、易懂不夸大。",
      before:"只有任务说明，没有目标读者细节、主题资料和可引用事实。",
      after:"补上目标读者的问题、主题资料摘要，以及需要保留的来源信息。",
      result:"同一任务得到一个上下文资料包，AI 不需要重新猜当前内容依据。"
    },
    mistakes:[
      "误区：再讲一遍 AI 不知道你脑里的东西｜正确理解：直接组装当前任务材料。",
      "误区：资料越多越好｜正确理解：够用且相关才是目标。",
      "误区：上下文资料包建完就换案例｜正确理解：下一课继续修改同一份草稿。"
    ],
    related:["上一课的任务说明是本课入口。","下一课直接修改补充资料后的草稿。"]
  },
  checkSequence:[
    {
      id:"continuity_context_best",
      questionType:"SINGLE_CHOICE",
      masteryRole:"BEST_JUDGMENT",
      question:"任务说明已经写清楚，但 AI 还缺完成这篇内容的事实依据。下一步最合适是什么？",
      options:[
        {value:"A",label:"补上当前主题资料和可靠来源，再继续写"},
        {value:"B",label:"把任务说明重复三遍"},
        {value:"C",label:"完全不补资料，让 AI 自己猜"}
      ],
      correctValues:["A"],
      explanation:"上下文（Context）的作用是给当前任务提供真正可以使用的信息。",
      correctFeedback:"正确。任务说明负责说清做什么，上下文资料负责提供拿什么做。",
      incorrectFeedback:"如果缺的是材料，就应该补当前任务真正需要的资料，而不是重复任务要求。"
    },
    {
      id:"continuity_context_misconception",
      questionType:"TRUE_FALSE",
      masteryRole:"MISCONCEPTION",
      question:"判断：上下文资料越多越好，把所有资料一次性塞进去最稳。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
      correctValues:["FALSE"],
      explanation:"上下文要够用且相关，无关资料太多也会让重点变模糊。",
      correctFeedback:"正确。上下文的目标是相关、够用。",
      incorrectFeedback:"不是资料越多越好，而是当前任务真正会用到的资料要齐。"
    },
    {
      id:"continuity_context_boundary",
      questionType:"MULTI_SELECT",
      masteryRole:"BOUNDARY_CONDITIONS",
      question:"为当前这篇 AI 主题内容准备上下文资料时，哪些信息通常值得放进去？（多选）",
      options:[
        {value:"AUDIENCE",label:"目标读者是谁、关心什么"},
        {value:"SOURCE",label:"当前主题的资料和可靠来源"},
        {value:"FACT",label:"需要保留的事实、日期或数据"},
        {value:"UNRELATED",label:"与当前主题无关的个人聊天记录"}
      ],
      correctValues:["AUDIENCE","SOURCE","FACT"],
      explanation:"只保留当前任务真正需要的背景、资料和事实。",
      correctFeedback:"正确。你已经能判断什么属于当前任务的上下文。",
      incorrectFeedback:"判断标准只有一个：这条信息会不会直接帮助当前任务做得更准确。"
    }
  ],
  practice:null,
  hints:["先从任务说明反推需要哪些材料。","只保留当前任务真正会用到的内容。"],
  referenceAnswer:null,
  review:["任务说明负责说清做什么，上下文资料包负责提供拿什么做。","上下文（Context）要当前可用，而且与任务相关。"],
  selfAssessment:["我能为当前内容任务整理一个最小上下文资料包。","我没有把上下文（Context）理解成把所有资料都塞进去。"]
} as const;

export const continuityTrialContextKnowledgeDepth = {
  ...beginnerContextKnowledgeDepth,
  example:[{title:"从任务说明反推材料",text:"先看要交付什么，再决定读者、资料和事实哪些必须进入上下文资料包。"}],
  review:[
    {title:"够用",text:"缺关键材料会迫使 AI 猜；无关材料太多也不会让任务更清楚。"},
    {title:"可继续使用",text:"下一课直接在这套材料和草稿上继续改。"}
  ]
} as const;

export const continuityTrialIterationIntro = {
  ...beginnerIterationIntro,
  situation:"同一篇内容已经有了清楚的任务说明和上下文资料包，现在草稿也更完整。下一步不是重来，而是找出最影响发布的一到两个偏差，继续把这份内容改好。",
  approaches:[
    {label:"重新生成一篇",text:"丢掉已经有效的部分，又从头开始猜。"},
    {label:"在当前草稿上改",text:"保留有效部分，只指出具体偏差和下一轮修改方向。"}
  ],
  takeaway:"迭代（Iteration）的重点是继续加工当前学习产物，而不是反复抽一篇新答案。"
} as const;

export const continuityTrialIterationDraft = {
  ...beginnerIterationDraft,
  grounding:{
    ...beginnerIterationDraft.grounding,
    sourceLabels:["Foundation Continuity Brief v1 · F2-03"],
    researchSummary:"本课必须继承 Context-enriched Draft，训练保留有效部分、指出具体偏差并继续修改；不重教 Prompt/Context，也不换客户消息案例。"
  },
  pedagogy:{
    ...beginnerIterationDraft.pedagogy,
    qualityProfile:{
      id:"BEGINNER_QUALITY_V1",
      mainLearnerQuestion:"当前这篇内容已经比较完整，我怎样只改最影响发布的地方？",
      mainConcept:"迭代（Iteration）是继续加工当前学习产物：保留有效部分，只给具体修改方向。",
      allowedCoreTerms:[],
      deferredTerms:stage2Deferred
    },
    participation:{
      kind:"COPY_TO_AI",
      title:"继续修改同一篇内容草稿",
      instruction:"不要换案例。找出当前草稿最影响发布的一到两个问题，写成下一轮可执行反馈，再交给 AI。",
      prompt:null,
      reflection:"检查第二轮是否修正了你指出的问题，同时保留原来已经有效的部分。"
    }
  },
  lessonSpec:{
    ...beginnerIterationDraft.lessonSpec,
    version:"1.1.0-continuity-trial",
    title:"迭代（Iteration）：第一次结果不对，怎样继续改好",
    learningObjectives:["能在补充资料后的草稿中找出最重要的偏差。","能保留有效部分并给出具体修改方向。","能让同一份学习产物继续变好而不是从头重来。"],
    knowledgePoints:["迭代（Iteration）应建立在当前学习产物上。","反馈应说明保留什么、改什么、为什么。"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"别重来，继续加工当前草稿",objective:"建立同一学习产物持续迭代（Iteration）的思路。"},
      {id:"example",kind:"EXAMPLE",title:"同一篇内容，只修最影响发布的两处",objective:"看见保留有效部分 + 具体反馈的改稿方式。"},
      {id:"check",kind:"CHECK",title:"哪种反馈真的能继续改当前草稿？",objective:"区分可执行反馈与重新抽答案。"},
      {id:"practice",kind:"PRACTICE",title:"继续改补充资料后的草稿",objective:"产出修改记录和迭代后的草稿。"},
      {id:"review",kind:"REVIEW",title:"改稿只记三步",objective:"保留有效、指出偏差、给修改方向。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会把同一个 AI 结果继续做得更好",objective:"为发布前检查留下迭代后的草稿。"}
    ],
    capabilityGain:["能在同一份补充资料后的草稿上完成一轮具体、可执行的迭代修改。"],
    nextLessonValue:"下一节直接对这份迭代后的草稿做发布前检查：哪些可以保留，哪些事实必须回到可靠来源确认。"
  },
  content:{
    ...beginnerIterationDraft.content,
    summary:"继续同一篇内容，只修最影响发布的一到两个问题。",
    plainExplanation:"现在任务和材料都已经比较完整。迭代（Iteration）不需要重新发明任务，而是保留当前草稿已经有效的部分，指出哪里不符合目标，再给出下一轮具体修改方向。",
    whyItMatters:"真实工作里最浪费时间的不是第一版不完美，而是每次不满意就全部重来。连续改同一份学习产物，才能真正积累上下文和判断。",
    points:["先保留已经有效的部分。","只指出最重要的一到两个偏差。","把偏差写成下一轮可以执行的修改要求。"],
    content:["不要重讲任务说明。","不要重讲上下文（Context）的定义。","本课只负责把当前草稿继续改好。"],
    example:{
      title:"同一篇内容从“像 AI 写的”改到更适合发布",
      situation:"补充资料后的草稿信息已经够，但开头太空泛、结尾没有给读者一个实际动作。",
      before:"全部删掉，再生成一篇。",
      after:"保留中间对 AI 变化的解释；开头直接从普通用户的实际问题进入；结尾补一句“你可以先拿一个真实文件试一次”。",
      result:"有效内容被保留，只修了最影响发布的部分，得到迭代后的草稿。"
    },
    mistakes:[
      "误区：不满意就重新生成｜正确理解：先保留当前有效部分。",
      "误区：再解释一遍任务和材料｜正确理解：这些已经在前两课完成。",
      "误区：改稿时换成无关案例｜正确理解：继续同一篇内容。"
    ],
    related:["上一课已经配好上下文资料包。","下一课直接检查迭代后的草稿是否可以发布。"]
  },
  checkSequence:[
    {
      id:"continuity_iteration_best",
      questionType:"SINGLE_CHOICE",
      masteryRole:"BEST_JUDGMENT",
      question:"当前草稿开头太空泛，但中间解释已经很好。下一轮最合适的反馈是什么？",
      options:[
        {value:"A",label:"全部重写，换一种完全不同的风格"},
        {value:"B",label:"保留中间解释；只把开头改成从普通用户的实际问题进入"},
        {value:"C",label:"再好一点"}
      ],
      correctValues:["B"],
      explanation:"迭代（Iteration）要保留有效部分，只修改最影响结果的偏差。",
      correctFeedback:"正确。你是在继续加工同一份草稿，而不是重新抽一篇答案。",
      incorrectFeedback:"先找已经有效的部分，再只改最重要的问题。"
    },
    {
      id:"continuity_iteration_misconception",
      questionType:"TRUE_FALSE",
      masteryRole:"MISCONCEPTION",
      question:"判断：每次不满意都重新生成一篇，通常比明确告诉 AI 哪一部分需要改更有效。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
      correctValues:["FALSE"],
      explanation:"重新生成会丢掉已经有效的信息；具体反馈更容易让下一轮朝目标靠近。",
      correctFeedback:"正确。迭代的重点是继承，而不是反复重来。",
      incorrectFeedback:"先保留已经有效的内容，再指出具体偏差。"
    },
    {
      id:"continuity_iteration_boundary",
      questionType:"MULTI_SELECT",
      masteryRole:"BOUNDARY_CONDITIONS",
      question:"下面哪些属于有效的下一轮修改动作？（多选）",
      options:[
        {value:"KEEP",label:"说明哪些部分要保留"},
        {value:"DEVIATION",label:"指出最重要的具体偏差"},
        {value:"CHANGE",label:"给出明确的修改方向"},
        {value:"VAGUE",label:"只说“再专业一点”"}
      ],
      correctValues:["KEEP","DEVIATION","CHANGE"],
      explanation:"有效迭代要让 AI 知道保留什么、哪里偏了、下一轮具体怎么改。",
      correctFeedback:"正确。你已经掌握一轮改稿的完整反馈结构。",
      incorrectFeedback:"反馈必须能直接转成下一轮动作，而不是只表达不满意。"
    }
  ],
  practice:{
    ...beginnerIterationDraft.practice!,
    id:"continuity_f203_iteration",
    title:"继续修改补充资料后的草稿",
    goal:"在同一份内容上完成一轮可执行改稿。",
    instructions:[
      {key:"problem",label:"最影响发布的问题",prompt:"只写一到两个具体偏差。"},
      {key:"change",label:"保留什么、怎么改",prompt:"写清哪些有效内容保留，以及下一轮具体修改方向。"}
    ],
    hints:["不要一次改十件事。","先确认哪些内容已经有效，不要全部推倒。"],
    rubric:[
      {key:"problem",label:"偏差具体",maxScore:45,minScore:23,example:"开头太空泛，读者看不出这件事和自己有什么关系。"},
      {key:"change",label:"修改动作可执行",maxScore:55,minScore:28,example:"保留中间解释；开头改成普通用户实际问题；结尾补一个可立即尝试的动作。"}
    ],
    passScore:60
  },
  hints:["继续使用上一课的草稿。","反馈要让 AI 知道保留什么、改变什么。"],
  referenceAnswer:"问题：开头太空泛，结尾没有实际动作。\n修改：保留中间解释；开头从普通用户真实问题进入；结尾补一句可以马上尝试的行动建议。",
  review:["保留有效部分。","只抓最重要的偏差。","把偏差变成下一轮可执行动作。"],
  selfAssessment:["我完成的是同一份学习产物的迭代，不是重新抽一篇答案。","我已经留下迭代后的草稿给下一课检查。"]
} as const;

export const continuityTrialIterationKnowledgeDepth = {
  ...beginnerIterationKnowledgeDepth,
  example:[{title:"迭代要有继承关系",text:"上一轮哪些有效、这一轮改什么，都应该说得出来。"}],
  review:[
    {title:"保留",text:"先保护已经符合目标的部分。"},
    {title:"修改",text:"只把最重要的偏差变成下一轮动作。"}
  ]
} as const;

export const continuityTrialIterationReferenceFill = {
  problem:"开头太空泛，结尾没有让普通用户马上能做的动作。",
  change:"保留中间解释；开头从普通用户实际问题进入；结尾补一个可以立即尝试的行动建议。"
} as const;
