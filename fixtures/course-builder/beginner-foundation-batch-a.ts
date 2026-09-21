import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../../lib/learning/course-builder";

const pedagogyBase = {
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

export const beginnerAiUseCasesIntro = {
  situation: "你今天有一封难写的邮件、一页杂乱会议记录，还要想三个活动点子。第一次接触 AI 时，不需要先懂技术，先看它能不能帮你把这些工作变轻一点。",
  approaches: [
    { label: "自己从空白开始", text: "每件事都自己起草、整理和想结构，时间主要花在重复脑力劳动上。" },
    { label: "让 AI 先协助", text: "把已有信息交给 AI，让它先起草、整理、总结或给思路，再由你判断和修改。" }
  ],
  comparison: [],
  takeaway: "第一步不是记住 AI 的定义，而是学会看见：哪些工作可以先让 AI 帮一把。",
  bottomDetails: [
    {
      title: "先从“第一版”开始",
      text: "第一次用 AI，不需要一上来就做复杂项目。让它先起草、整理或列思路，你会更容易判断它到底有没有帮到你。"
    },
    {
      title: "优先选你自己熟悉的事情",
      text: "你越熟悉任务，就越容易发现 AI 哪里做得对、哪里需要改。新手第一步不是追求神奇，而是建立判断感。"
    }
  ],
  comparisonPlacement: "BOTTOM"
} as const;

export const beginnerAiUseCasesDraft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: ["OPC Beginner Foundation：日常 AI 使用场景"],
    researchSummary: "新手第一课只建立使用直觉：AI 适合协助文字起草、整理、总结、比较、提取和发散思路等认知型任务；高风险事实、最终决定和必须精确的结果仍需人检查。"
  },
  pedagogy: {
    ...pedagogyBase,
    participation: {
      kind: "MINI_TASK",
      title: "从你今天的工作里找一个 AI 可以先帮忙的任务",
      instruction: "不用想复杂。选一件你今天原本要自己花时间处理的文字、资料或思路工作，说清楚你希望 AI 先帮哪一步。",
      prompt: null,
      reflection: "重点不是把工作全部交出去，而是先找到一个可以减少重复脑力劳动的小入口。"
    }
  },
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "foundation-ai",
    lessonId: "beginner-ai-use-cases",
    title: "AI 到底能帮我做什么",
    lessonType: "APPLICATION",
    learningObjectives: [
      "从真实工作中识别适合 AI 协助的任务。",
      "知道 AI 常见价值是先起草、整理、总结、比较和找思路。",
      "理解 AI 是协助工具，不等于把最终判断全部交出去。"
    ],
    knowledgePoints: [
      "优先从文字、资料、整理和思路类工作寻找 AI 使用入口。",
      "让 AI 先做第一版，人负责提供信息、判断结果和最后决定。"
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
      { id:"explain", kind:"EXPLAIN", title:"先从你每天都在做的事情开始", objective:"让新手先看见 AI 和自己工作的关系。" },
      { id:"example", kind:"EXAMPLE", title:"看三个最常见的工作怎么让 AI 先帮一把", objective:"用写、整理、想思路三个场景建立使用直觉。" },
      { id:"check", kind:"CHECK", title:"哪些事情适合先让 AI 协助？", objective:"检查学习者是否能识别合适的使用场景和边界。" },
      { id:"practice", kind:"PRACTICE", title:"找出你自己的第一个 AI 使用场景", objective:"把理解落到学习者自己的真实工作。" },
      { id:"review", kind:"REVIEW", title:"先记住三个入口就够了", objective:"收束成写东西、理资料、找思路三个简单入口。" },
      { id:"capability", kind:"CAPABILITY", title:"你已经能找到第一个值得用 AI 的任务", objective:"让学习者带着具体任务继续下一课。" }
    ],
    capabilityGain: ["能从自己的日常工作中找出一个适合先让 AI 协助的任务。"],
    nextLessonValue: "下一节看为什么同一个 AI，有时结果很好，有时却像完全没理解你的意思。",
    accessPresentation
  },
  content: {
    summary: "先不学技术名词。你会从真实工作出发，看懂 AI 最容易在哪些事情上先帮到你。",
    plainExplanation: "刚开始用 AI，不需要先知道它内部怎么工作。先把它当成一个可以帮你处理文字、资料和思路的助手：你把已有信息和任务交给它，它先给第一版，你再判断、修改和决定。",
    whyItMatters: "如果第一步就是背概念，很容易觉得 AI 离自己很远。先在真实工作里用出一点价值，你才知道后面为什么值得继续学。",
    points: [
      "写东西：邮件、说明、方案初稿。",
      "理资料：总结、分类、提取重点。",
      "找思路：列方向、比较选择、补充遗漏。"
    ],
    content: [
      "AI 很适合从空白到第一版，或者把杂乱信息先整理成结构。",
      "你仍然需要提供真实信息，并判断结果有没有偏差。",
      "涉及重要事实、金额、承诺或最终决定时，不要因为文字看起来顺就直接使用。"
    ],
    example: {
      title: "同一个上午，三件小事都可以先让 AI 帮一步",
      situation: "你要回复客户、整理会议记录、再想一个周末活动。",
      before: "三件事都从空白开始，先花时间组织语言和结构。",
      after: "把客户背景交给 AI 起草邮件；把会议记录交给 AI 整理行动项；把活动目标告诉 AI，让它先给几个方向。",
      result: "AI 没有替你做最后决定，但把最耗时间的第一版和整理工作提前完成了。"
    },
    mistakes: [
      "误区：用了 AI 就要让它全部做完｜正确理解：先让它协助一小步也有价值。",
      "误区：只有写文章才适合 AI｜正确理解：整理资料、比较信息、找思路同样常见。",
      "误区：AI 给了答案就能直接用｜正确理解：结果仍要由你判断。"
    ],
    related: ["下一课：为什么结果有时好、有时不好", "后续：怎样把任务说清楚"]
  },
  check: null,
  checkSequence: [
    {
      id:"check_use_best", questionType:"SINGLE_CHOICE", masteryRole:"BEST_JUDGMENT",
      question:"你有一页杂乱的会议记录，想先快速得到“待办事项 + 负责人 + 截止时间”。哪种做法最适合作为第一次使用 AI 的入口？",
      options:[{value:"A",label:"把会议记录给 AI，让它先整理成行动清单，再自己检查"},{value:"B",label:"让 AI 直接决定项目下一季度预算"},{value:"C",label:"先学习完所有 AI 技术术语再开始用"}],
      correctValues:["A"],
      explanation:"整理已有文字并形成第一版结构，是低门槛、容易检查的使用场景。",
      correctFeedback:"正确。新手先从“有现成材料、结果容易检查”的小任务开始，最容易感受到 AI 的价值。",
      incorrectFeedback:"先找一个风险低、材料已经在手里、结果又容易检查的任务。不要把重要决定直接交出去，也不用等学完所有理论才开始。"
    },
    {
      id:"check_use_misconception", questionType:"TRUE_FALSE", masteryRole:"MISCONCEPTION",
      question:"判断：第一次用 AI，最好把整份工作全部交给它，这样最能体现效率。",
      options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
      correctValues:["FALSE"],
      explanation:"从一个小步骤开始更容易判断结果，也更容易建立正确使用习惯。",
      correctFeedback:"正确。先让 AI 帮一小步，更容易看清它哪里有用、哪里还需要你负责。",
      incorrectFeedback:"把全部工作一次性交出去，反而更难发现哪里出了问题。新手更适合从一个清楚的小任务开始。"
    },
    {
      id:"check_use_boundary", questionType:"MULTI_SELECT", masteryRole:"BOUNDARY_CONDITIONS",
      question:"下面哪些通常适合作为 AI 的入门使用场景？（多选）",
      options:[{value:"EMAIL",label:"根据已有背景起草一封邮件"},{value:"SUMMARY",label:"把一页资料整理成重点"},{value:"IDEAS",label:"围绕一个目标先列几个思路"},{value:"FINAL",label:"不看资料就让 AI 替你做重要最终决定"}],
      correctValues:["EMAIL","SUMMARY","IDEAS"],
      explanation:"起草、整理、发散都适合先让 AI 协助；重要最终决定仍需要人负责。",
      correctFeedback:"正确。你已经能看见几个最常见、低门槛的 AI 使用入口。",
      incorrectFeedback:"再看哪些任务的结果容易检查、适合先给第一版。重要最终决定不是新手应该直接交给 AI 的任务。"
    }
  ],
  practice: {
    id:"practice_use_case",
    title:"找到你自己的第一个 AI 使用场景",
    goal:"从今天真实要做的事情里，选一个适合 AI 先协助的小任务。",
    instructions:[
      {key:"task",label:"我原本要做的事",prompt:"写一件你今天或最近真的要完成的工作。"},
      {key:"help",label:"AI 先帮哪一步",prompt:"只写一个小步骤，例如起草、整理、总结、比较或找思路。"}
    ],
    hints:["选一个你熟悉的任务，方便你判断 AI 做得好不好。","先让 AI 帮一小步，不要把整个工作一次性交出去。"],
    rubric:[
      {key:"task",label:"任务真实具体",maxScore:50,minScore:25,example:"整理今天客户拜访的会议记录。"},
      {key:"help",label:"协助步骤清楚",maxScore:50,minScore:25,example:"先提取待办事项、负责人和时间。"}
    ],
    passScore:60
  },
  hints:["先找文字、资料或思路类任务。","优先选择结果容易由你自己检查的事情。"],
  referenceAnswer:"我原本要做的事：整理今天的客户会议记录。\nAI 先帮哪一步：先把记录整理成“待办事项 / 负责人 / 截止时间”三栏，我再逐条核对。",
  review:["要写东西？先让 AI 起草第一版。","资料太乱？先让 AI 整理重点。","没有思路？先让 AI 帮你打开几个方向。"],
  selfAssessment:["我能想到至少一个和自己工作有关的 AI 使用场景。","我知道 AI 是协助，不是替我承担最后判断。"]
} as const;

export const beginnerAiResultQualityIntro = {
  situation: "你对 AI 说“帮我写个宣传文案”，它写得很普通。换成“给附近上班族看的咖啡店周末活动文案，轻松一点，80 字以内”，结果马上更像你想要的。",
  approaches: [
    { label:"只说一句", text:"帮我写个宣传文案。" },
    { label:"把关键情况说出来", text:"给谁看、要达到什么目的、有哪些要求，尽量把真正会影响结果的信息补上。" }
  ],
  comparison: [],
  takeaway:"AI 不是读心术。你没有说出来的关键情况，它只能自己猜。",
  bottomDetails:[
    {
      title:"不是写得越长越好",
      text:"真正有用的是那些会改变结果的信息。无关背景加得再多，也不会让任务更清楚。"
    },
    {
      title:"先补缺失信息，再怀疑工具",
      text:"结果太泛时，先看看 AI 是否还在猜“给谁看、为什么做、最后要什么”。很多问题在这里就能找到原因。"
    }
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const beginnerAiResultQualityDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"APPROVED_KNOWLEDGE",sourceLabels:["OPC Beginner Foundation：输入信息与结果质量"],researchSummary:"本课只建立输入信息会影响结果的直觉，不提前教授正式 Prompt 框架或 Context Window。"},
  pedagogy:{...pedagogyBase,participation:{kind:"COPY_TO_AI",title:"把补清楚后的任务放进自己的 AI 软件",instruction:"完成下面两部分后，把你补清楚的要求复制到正在使用的 AI 软件里，再和原来的模糊要求比较一次。",prompt:null,reflection:"重点看第二次结果是不是更贴近真实情况、更少套话，而不是看文字有没有变得更华丽。"}},
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"beginner-ai-result-quality",title:"为什么同一个 AI，有时好用、有时不好用",lessonType:"APPLICATION",
    learningObjectives:["理解 AI 不知道你没有提供的关键信息。","能发现一个模糊任务缺了哪些重要信息。","能用少量补充让结果更贴近真实需求。"],
    knowledgePoints:["结果好不好，常常取决于任务和必要信息是否说清。","补信息的目标是减少 AI 猜测，不是把要求无限写长。"],
    prerequisites:["F1-01"],requiresExample:true,requiresCheck:true,practiceMode:"GUIDED",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:true,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK","PRACTICE"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"AI 不知道你没有说出来的事情",objective:"建立“缺信息就会猜”的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"同一个任务，补几句话为什么差这么多",objective:"通过前后结果看见哪些信息真正有用。"},
      {id:"check",kind:"CHECK",title:"它到底还缺什么信息？",objective:"练习发现模糊任务里的关键缺口。"},
      {id:"practice",kind:"PRACTICE",title:"把一句模糊要求补清楚",objective:"只补必要信息，让任务更容易被执行。"},
      {id:"review",kind:"REVIEW",title:"结果不对，先检查这三件事",objective:"形成目标、对象/背景、结果要求三个简单检查点。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会减少 AI 的猜测",objective:"让学习者知道自己已经能改善输入质量。"}
    ],
    capabilityGain:["遇到 AI 结果太泛时，能先找出缺失信息，而不是马上换工具。"],
    nextLessonValue:"下一节看一个更重要的问题：AI 为什么有时会很自信地说错。",
    accessPresentation
  },
  content:{
    summary:"你会看懂为什么一句模糊要求容易得到普通答案，并学会只补真正有用的信息。",
    plainExplanation:"AI 只能根据你给它的内容完成任务。你没说清给谁看、为什么做、有什么要求，它就只能按常见情况自己补。补得对，结果可能不错；补错了，结果就会偏。",
    whyItMatters:"很多人第一次用 AI 觉得“不聪明”，其实只是双方掌握的信息不一样。先学会把关键情况补给它，比背复杂技巧更重要。",
    points:["要做什么？","给谁用，或者现在是什么情况？","最后希望拿到什么样的结果？"],
    content:["不是信息越多越好，只补会改变结果的内容。","如果 AI 第一次做偏了，先看是不是有重要信息没告诉它。","正式的 Prompt 和 Context 会在后面单独学，这一课只练最基础的直觉。"],
    example:{title:"咖啡店活动文案",situation:"你想发一条周末活动文案。",before:"帮我写一个咖啡店宣传文案。",after:"给附近 20–35 岁上班族看的周末活动文案，主推手冲体验，语气轻松，80 字以内，最后加一句到店邀请。",result:"第二种要求没有复杂技巧，只是让 AI 不再猜受众、活动重点、语气和长度。"},
    mistakes:["误区：结果不好一定是 AI 太差｜正确理解：先检查任务有没有缺重要信息。","误区：补得越长越好｜正确理解：只补真正会改变结果的信息。","误区：一开始就要学复杂模板｜正确理解：先能发现缺什么就够了。"],
    related:["下一阶段会正式学习 Prompt。","后续会学 Context：AI 这次真正看到了什么。"]
  },
  check:null,
  checkSequence:[
    {id:"check_quality_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"你让 AI“帮我写个通知”，结果很泛。下一步最有用的做法是什么？",options:[{value:"A",label:"补充通知给谁看、发生什么事、希望对方做什么"},{value:"B",label:"只加一句“写专业一点”"},{value:"C",label:"马上换一个 AI，不检查任务信息"}],correctValues:["A"],explanation:"真正影响结果的是任务和必要背景，而不是空泛形容词。",correctFeedback:"正确。先补它必须知道的关键情况，通常比换工具更有效。",incorrectFeedback:"先问：AI 现在还必须猜什么？受众、事情、行动要求这类信息才会真正改变结果。"},
    {id:"check_quality_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：为了让 AI 做得更好，应该把能想到的所有背景都一次性塞进去。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"只需要提供真正影响当前任务的信息。",correctFeedback:"正确。重点是相关，不是越多越好。",incorrectFeedback:"信息太多也会让重点变模糊。先判断哪些内容真的会改变结果。"},
    {id:"check_quality_boundary",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些信息通常会明显影响“给客户写跟进消息”的结果？（多选）",options:[{value:"WHO",label:"客户是谁、目前到哪一步"},{value:"GOAL",label:"这次希望确认什么或推动什么"},{value:"TONE",label:"希望语气友好、不催促"},{value:"WEATHER",label:"与你们沟通无关的天气记录"}],correctValues:["WHO","GOAL","TONE"],explanation:"客户阶段、目标和语气会改变内容；无关信息不会帮助完成任务。",correctFeedback:"正确。你已经能分辨“关键情况”和“无关背景”。",incorrectFeedback:"再想一想：哪些信息真的会让这封跟进消息变得不同？"}
  ],
  practice:{
    id:"practice_quality",title:"把“帮我写个通知”补清楚",goal:"只用少量必要信息，把一句模糊要求变成可执行任务。",
    instructions:[{key:"situation",label:"对象和情况",prompt:"这份通知给谁看？发生了什么？"},{key:"result",label:"希望结果",prompt:"希望对方知道什么、做什么，或者文字有什么基本要求？"}],
    hints:["不用写很长。","只写会明显改变结果的信息。"],
    rubric:[{key:"situation",label:"情况具体",maxScore:50,minScore:25,example:"发给本周六参加活动的 20 位客户，活动时间从 14:00 改为 15:00。"},{key:"result",label:"结果要求清楚",maxScore:50,minScore:25,example:"语气礼貌，说明时间变化，并请对方回复是否能参加。"}],
    passScore:60
  },
  hints:["它还在猜谁、为什么、要什么结果吗？","先补两三条最关键的信息。"],
  referenceAnswer:"对象和情况：发给本周六参加活动的客户，活动开始时间从 14:00 改到 15:00。\n希望结果：用礼貌简洁的方式说明变更，并请客户回复是否仍能参加。",
  review:["目标有没有说清？","AI 知不知道必要的对象和情况？","最后想拿到什么结果？"],
  selfAssessment:["我能看出一句模糊要求缺了什么。","我知道补信息不是越多越好。"]
} as const;

export const beginnerAiCanBeWrongIntro = {
  situation:"AI 很快给你一个“最新行业数据”，语气非常肯定，还顺手解释了原因。问题是：它写得像真的，不代表数据就一定是真的。",
  approaches:[
    {label:"看起来很像答案",text:"文字完整、有数字、有解释，所以直接复制使用。"},
    {label:"先看风险再核实",text:"遇到事实、数字、日期和最新信息，先确认来源和时间，再决定能不能用。"}
  ],
  comparison:[],
  takeaway:"流畅 ≠ 正确。越像事实的内容，越要知道自己该不该核实。",
  bottomDetails:[
    {
      title:"创意可以先参考",
      text:"标题、改写、点子这类低风险内容，可以先拿来比较和修改，不需要每一句都当事实核验。"
    },
    {
      title:"事实越具体，越要看来源",
      text:"一旦出现数字、日期、政策、机构名称或“最新”这类内容，就要把注意力从语气转向来源。"
    }
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const beginnerAiCanBeWrongDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"RESEARCH_PACKET",sourceLabels:["OPC Beginner Foundation：AI 输出可靠性基础"],researchSummary:"本课只教授用户层面的验证意识：模型可能生成错误或过时内容，特别是事实、数字、日期、来源和高风险信息；不讲生成机制或 Evaluation 工程。"},
  pedagogy:{...pedagogyBase,participation:{kind:"CLASSIFY",title:"哪些结果要先核实",instruction:"看几个日常 AI 输出，判断哪些可以当灵感，哪些在使用前必须核实。",prompt:null,reflection:"重点不是不相信 AI，而是知道不同结果的错误代价不一样。"}},
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"beginner-ai-can-be-wrong",title:"AI 为什么会说错，而且还说得很像真的",lessonType:"CONCEPT",
    learningObjectives:["知道 AI 说得顺不代表事实正确。","能识别事实、数字、日期、最新信息等需要核实的内容。","形成先判断风险再决定是否核实的习惯。"],
    knowledgePoints:["AI 输出可以很流畅，但仍可能包含错误或过时信息。","事实、数字、日期、来源和高风险结论应优先核实。"],
    prerequisites:["F1-01"],requiresExample:true,requiresCheck:true,practiceMode:"NONE",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:false,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"说得很像真的，也可能真的错了",objective:"建立流畅与正确不是一回事的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"哪些答案可以当灵感，哪些必须先查",objective:"用低风险和事实型任务对比验证需求。"},
      {id:"check",kind:"CHECK",title:"这次应该直接用，还是先核实？",objective:"检查风险判断能力。"},
      {id:"practice",kind:"PRACTICE",title:"给四种 AI 结果分风险",objective:"把验证意识用于常见工作场景。"},
      {id:"review",kind:"REVIEW",title:"看到这四类内容，先别急着复制",objective:"收束事实、数字、日期、重要决定四类提醒。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经知道什么时候不能只看语气",objective:"建立基础 AI 判断力。"}
    ],
    capabilityGain:["看到 AI 给出的事实、数字或最新信息时，能先判断是否需要核实。"],
    nextLessonValue:"下一节会看懂一个 AI 软件里为什么会同时出现模型、搜索、文件和记忆这些不同能力。",
    accessPresentation
  },
  content:{
    summary:"AI 可以写得非常自然，但自然不等于正确。你会学会判断哪些结果一定要先核实。",
    plainExplanation:"AI 很擅长组织出像答案一样的文字，但它给出的事实可能错误、过时，甚至来源并不存在。你不需要马上理解内部原因，只需要先学会一个使用习惯：结果越像事实、错误代价越高，越要核实。",
    whyItMatters:"如果把所有流畅回答都当成事实，AI 越好用反而越容易让人放松警惕。基础判断力比背技术原理更重要。",
    points:["事实：人名、机构、规则是否准确。","数字：金额、比例、统计是否有来源。","时间：是不是最新、是否已经变化。","高风险：重要决定不能只靠一段 AI 文字。"],
    content:["创意标题、改写语气这类任务通常可以直接拿来参考。","最新政策、市场数据、合同条款、医疗或财务等高风险信息需要更认真核实。","核实可以从正式来源、原始文件、最新网页或负责该事项的人开始。"],
    example:{title:"“2026 年最新数据”看起来很完整",situation:"你让 AI 给一份行业报告补一个最新市场规模数字。",before:"看到数字和增长率写得很完整，直接放进报告。",after:"先检查数据来源、发布日期和适用范围；找不到可靠来源就不当成事实使用。",result:"你不是拒绝 AI，而是把 AI 用在起草和整理上，把事实确认留给可靠来源。"},
    mistakes:["误区：说得肯定就是有把握｜正确理解：语气不能代替证据。","误区：AI 偶尔会错，所以完全不能用｜正确理解：按任务风险决定检查强度。","误区：只有大事才需要核实｜正确理解：事实、数字、日期都值得先问来源。"],
    related:["后续会学习 Search 和 RAG。","后续会学习更正式的 Evaluation。"]
  },
  check:null,
  checkSequence:[
    {id:"check_wrong_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"AI 给你一个“今天刚公布的行业数据”，还写了具体数字。最合适的下一步是什么？",options:[{value:"A",label:"因为数字很具体，直接放进报告"},{value:"B",label:"先核对来源、发布日期和原始数据"},{value:"C",label:"把语气改得更肯定再使用"}],correctValues:["B"],explanation:"最新数据属于事实型信息，需要可靠来源支持。",correctFeedback:"正确。越是具体数字和最新信息，越不能只看表达是否像真的。",incorrectFeedback:"这里真正要判断的是“事实从哪里来”。数字具体不等于来源可靠。"},
    {id:"check_wrong_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：只要 AI 的回答很详细、很有逻辑，就可以认为事实基本可靠。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"表达质量和事实准确性不是同一件事。",correctFeedback:"正确。详细、流畅、有逻辑都不能替代事实核实。",incorrectFeedback:"AI 可以把错误信息组织得很完整。判断事实时，还是要看来源和证据。"},
    {id:"check_wrong_boundary",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些 AI 输出在使用前通常应该优先核实？（多选）",options:[{value:"NUMBER",label:"报告里的市场规模数字"},{value:"POLICY",label:"公司最新报销政策"},{value:"DATE",label:"活动官方截止日期"},{value:"IDEA",label:"给周末活动想 5 个创意主题"}],correctValues:["NUMBER","POLICY","DATE"],explanation:"数字、政策和日期属于事实型信息；创意主题可以先作为灵感使用。",correctFeedback:"正确。你已经会按“事实和错误代价”判断验证需求。",incorrectFeedback:"想一想哪些选项如果错了，会让你把错误事实直接带进工作。"}
  ],
  practice:null,
  hints:["看到数字、日期、政策、来源时先提高警惕。","先问：如果它错了，后果大不大？"],
  referenceAnswer:null,
  review:["事实要核实。","数字要找来源。","最新信息要看日期。","重要决定不要只靠 AI。"],
  selfAssessment:["我不会因为 AI 说得很肯定就直接相信。","我能判断哪些结果需要优先核实。"]
} as const;

export const beginnerAiProductMapIntro = {
  situation:"同一个 AI 软件里，你可以聊天、搜网页、上传 PDF，还会记住一些偏好。第一次看到这些功能时，不需要先懂系统架构，只要先知道：它们不是同一个东西。",
  approaches:[
    {label:"把全部都叫 AI",text:"看到聊天、搜索、文件、记忆，都理解成一个东西在做所有事情。"},
    {label:"先看成一个组合",text:"核心 Model（模型）负责理解和生成，软件再把搜索、文件、记忆等能力组合进来。"}
  ],
  comparison:[
    {term:"Model（模型）",meaning:"可以先把它理解成 AI 软件里负责理解和生成内容的核心能力。"},
    {term:"产品能力",meaning:"搜索、读文件、保存偏好等，是完整 AI 软件额外提供给你的能力。"}
  ],
  takeaway:"你正在使用的是一个完整 AI 软件。Model 很重要，但不是屏幕上所有功能的总称。",
  bottomDetails:[
    {
      title:"先记住“核心 + 功能”",
      text:"现在只需要这张简单地图：Model 负责核心理解和生成；完整软件还会加搜索、文件、记忆等能力。"
    },
    {
      title:"功能变多，不等于概念变成一个",
      text:"软件以后再增加新按钮时，先问“这是 Model 本身，还是产品额外能力”，就不容易越学越乱。"
    }
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const beginnerAiProductMapDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"RESEARCH_PACKET",sourceLabels:["OPC Beginner Foundation：AI 产品能力地图"],researchSummary:"新手只需要先区分核心 Model 与完整 AI 产品能力，不进入 API、Tool、RAG、训练参数等系统架构。"},
  pedagogy:{...pedagogyBase,participation:{kind:"CLASSIFY",title:"把功能放回简单地图",instruction:"判断一个功能更像是 Model 的核心理解/生成能力，还是 AI 软件额外组合进来的搜索、文件、记忆能力。",prompt:null,reflection:"这只是帮助建立位置感，不要求你解释内部怎么实现。"}},
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"beginner-ai-product-map",title:"AI 软件里的模型、搜索、文件和记忆是什么关系",lessonType:"CONCEPT",
    learningObjectives:["理解自己使用的是完整 AI 软件，而不只是一个 Model。","知道搜索、文件和记忆是软件组合进来的不同能力。","为后面学习 Model、Memory、Search 等概念建立位置感。"],
    knowledgePoints:["Model 是 AI 软件的核心能力之一。","搜索、文件、记忆等属于完整产品提供的额外能力，不必在本课学习其内部实现。"],
    prerequisites:["F1-01","F1-03"],requiresExample:true,requiresCheck:true,practiceMode:"NONE",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:false,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"一个 AI 软件里，其实组合了不同能力",objective:"先建立产品是组合体的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"聊天、搜索、文件、记忆分别在帮你什么",objective:"用用户能看到的功能建立简单地图。"},
      {id:"check",kind:"CHECK",title:"别再把屏幕上的所有功能都叫 Model",objective:"检查 Model 与产品能力的基本区分。"},
      {id:"practice",kind:"PRACTICE",title:"给常见功能找位置",objective:"通过轻量分类巩固位置感。"},
      {id:"review",kind:"REVIEW",title:"只记住两层就够了",objective:"收束为核心 Model + 产品能力。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经能看懂 AI 软件的基本地图",objective:"为后续深入概念建立导航。"}
    ],
    capabilityGain:["看到 AI 软件里的聊天、搜索、文件和记忆时，能知道它们不是同一个层级的概念。"],
    nextLessonValue:"下一阶段会开始学怎样把事情说清楚，让 AI 更好地和你协作。",
    accessPresentation
  },
  content:{
    summary:"不用学系统架构。你只需要先看懂：AI 软件是一个组合，Model 是核心之一，搜索、文件、记忆是其他能力。",
    plainExplanation:"你打开一个 AI 软件，看到的并不只是一个 Model（模型）。可以先把 Model 理解成负责理解你的输入、组织和生成内容的核心；完整软件还可以加上网页搜索、文件读取、历史记录或记忆等功能。",
    whyItMatters:"后面你会学很多新词。如果现在先有一张简单地图，就不会把“模型变强了”“软件多了一个功能”“AI 记住了资料”混成同一件事。",
    points:["核心 Model：理解和生成。","搜索：帮助软件找外部信息。","文件：让当前任务能使用你提供的资料。","记忆：让产品在合适情况下保留一些信息。"],
    content:["这一课只需要知道它们是不同能力，不需要知道内部怎样连接。","同一个 AI 软件可以不断增加新功能，但这不代表每个新按钮都等于 Model 本身。","后面学习 Memory、Search、RAG、Tool 时，会再逐个拆开。"],
    example:{title:"为什么一个 AI 软件能突然多出“搜索网页”功能",situation:"昨天你只能聊天，今天软件更新后多了网页搜索。",before:"理解成 Model 本身突然把整个互联网都装进去了。",after:"先简单理解成：完整软件多组合了一种可以找外部信息的能力，再把找到的内容用于回答。",result:"你不需要懂实现，也已经知道“Model”和“软件新增功能”不是同一个概念。"},
    mistakes:["误区：AI 软件名字就是 Model 名字｜正确理解：产品和 Model 不是同一层。","误区：能搜网页就是 Model 自己天然知道最新网页｜正确理解：搜索可以是产品额外能力。","误区：现在就要学懂所有内部连接｜正确理解：新手先建立地图，细节以后逐个学。"],
    related:["Stage 3 会正式学习 Model。","Stage 4 会学习 Memory、Search 和 RAG。"]
  },
  check:null,
  checkSequence:[
    {id:"check_map_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"一个 AI 软件新增“读取 PDF”功能。下面哪个理解最适合现在这个阶段？",options:[{value:"A",label:"完整 AI 软件新增了一种使用文件的能力"},{value:"B",label:"这证明 Model 和 PDF 功能本来就是同一个概念"},{value:"C",label:"必须先学会 API 才能理解这个功能"}],correctValues:["A"],explanation:"新手先把完整产品和其中不同能力分开即可。",correctFeedback:"正确。先建立“一个软件组合多种能力”的地图就够了。",incorrectFeedback:"这节课不要求解释内部实现。先判断它是完整软件里的哪类能力，而不是把所有东西都叫 Model。"},
    {id:"check_map_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：AI 软件里出现的聊天、搜索、文件和记忆，都可以直接当成 Model 的同义词。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"Model 是核心能力之一，完整软件还会组合其他产品能力。",correctFeedback:"正确。以后看到新功能时，你会先问它属于哪一层。",incorrectFeedback:"把所有功能都叫 Model，会让后面的 Memory、Search、Tool 等概念越来越混乱。"},
    {id:"check_map_boundary",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些可以先理解为完整 AI 软件额外提供的产品能力？（多选）",options:[{value:"SEARCH",label:"搜索网页"},{value:"FILE",label:"读取你上传的文件"},{value:"MEMORY",label:"保存部分长期偏好"},{value:"GENERATE",label:"根据当前输入组织并生成一段文字"}],correctValues:["SEARCH","FILE","MEMORY"],explanation:"搜索、文件、记忆属于产品层能力；理解和生成是 Model 的核心能力直觉。",correctFeedback:"正确。两层简单地图已经建立起来了。",incorrectFeedback:"先只用最简单的两层：Model 负责核心理解/生成；软件还会组合搜索、文件、记忆等能力。"}
  ],
  practice:null,
  hints:["先问：这是核心理解/生成，还是软件额外提供的功能？"],
  referenceAnswer:null,
  review:["Model 是核心能力之一。","完整 AI 软件会组合搜索、文件、记忆等其他能力。"],
  selfAssessment:["我不会再把 AI 软件里的所有功能都当成 Model。","我已经有一张足够简单的 AI 产品地图。"]
} as const;

export const beginnerAiUseCasesReferenceFill = {
  task: "整理今天的客户会议记录。",
  help: "先提取待办事项、负责人和截止时间，我再逐条核对。"
} as const;

export const beginnerAiResultQualityReferenceFill = {
  situation: "发给本周六参加活动的客户，活动开始时间从 14:00 改到 15:00。",
  result: "用礼貌简洁的方式说明时间变更，并请客户回复是否仍能参加。"
} as const;

export const beginnerAiUseCasesKnowledgeDepth = {
  example: [
    {
      title: "什么任务最适合第一次试",
      text: "有现成材料、结果容易检查、出错代价不高的任务最适合新手，例如整理会议记录、改写邮件、列活动思路。"
    },
    {
      title: "什么事情先不要直接交出去",
      text: "涉及金额、承诺、重要事实和最终决定时，AI 可以帮你整理信息，但最后确认仍然由你负责。"
    }
  ],
  review: [
    {
      title: "先找一个小入口",
      text: "不要问“我的工作能不能全自动”，先问“哪一步可以让 AI 帮我省 10 分钟”。"
    },
    {
      title: "先从容易检查的任务开始",
      text: "你熟悉任务，就更容易判断 AI 有没有真正帮忙，也更容易建立正确使用习惯。"
    }
  ]
} as const;

export const beginnerAiResultQualityKnowledgeDepth = {
  example: [
    {
      title: "真正有用的是“会改变结果”的信息",
      text: "对象、当前情况、目标、语气和结果形式常常会改变答案；与任务无关的背景再多，也只是增加噪音。"
    },
    {
      title: "结果太泛时先别急着重写全部",
      text: "先看 AI 还在猜什么。通常补一两条缺失信息，比重新写一大段更有效。"
    }
  ],
  review: [
    {
      title: "先检查缺失信息",
      text: "结果不贴合时，先检查目标、对象/背景和结果要求有没有说清。"
    },
    {
      title: "补得刚刚好",
      text: "不是越详细越专业，而是让 AI 少猜一点、让你更容易判断它有没有完成任务。"
    }
  ]
} as const;

export const beginnerAiCanBeWrongKnowledgeDepth = {
  example: [
    {
      title: "“最新”两个字要特别小心",
      text: "只要答案依赖今天、今年、最新政策或当前数据，就应该确认来源和日期，而不是只看 AI 是否说得流畅。"
    },
    {
      title: "低风险和高风险要分开",
      text: "想几个标题错了可以重来；金额、规则、合同、重要事实错了，后果完全不同。检查力度应该跟风险一起提高。"
    }
  ],
  review: [
    {
      title: "先问：这是灵感还是事实",
      text: "灵感可以先用来比较；事实要有来源，数字要能追溯，最新信息要看日期。"
    },
    {
      title: "再问：错了会怎样",
      text: "错误代价越高，越不能只依赖 AI 一次回答。"
    }
  ]
} as const;

export const beginnerAiProductMapKnowledgeDepth = {
  example: [
    {
      title: "为什么搜索功能可以后来才出现",
      text: "因为完整 AI 软件可以不断增加产品能力。你看到的新功能，不需要自动理解成 Model 本身发生了同一种变化。"
    },
    {
      title: "现在不需要知道它们怎么连接",
      text: "新手阶段只要知道不同能力各有位置。等后面学 Memory、Search、RAG 时再逐个拆开。"
    }
  ],
  review: [
    {
      title: "第一层：Model",
      text: "先把它理解成负责核心理解和生成的能力。"
    },
    {
      title: "第二层：产品能力",
      text: "搜索、文件、记忆等由完整 AI 软件组合进来，帮助你完成不同任务。"
    }
  ]
} as const;
