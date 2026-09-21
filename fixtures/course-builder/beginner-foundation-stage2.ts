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

const deferredTerms = [
  "Training",
  "Inference",
  "Token",
  "Context Window",
  "Embedding",
  "Vector Search",
  "API",
  "Tool",
  "MCP",
  "RAG",
  "Agent",
  "Evaluation"
] as const;

export const beginnerPromptIntro = {
  situation: "你想让 AI 帮你写一封客户跟进消息，只说“帮我写一下”，结果很像模板。把“写给谁、这次要做什么、希望对方下一步做什么”说清后，结果立刻更接近你的需要。",
  approaches: [
    { label: "只丢一句话", text: "帮我写一封客户跟进消息。" },
    { label: "把任务说清楚", text: "告诉 AI 任务目标、必要背景和你真正想拿到的结果。" }
  ],
  comparison: [],
  takeaway: "Prompt 不是神奇咒语。它首先只是：把你想让 AI 做的事情说清楚。",
  bottomDetails: [
    { title: "先说任务，不背模板", text: "新手先练“让 AI 少猜一点”，不需要记万能公式。" },
    { title: "只给必要条件", text: "真正会改变结果的信息才需要写进任务，不相关的背景不用堆进去。" }
  ],
  comparisonPlacement: "BOTTOM"
} as const;

export const beginnerPromptDraft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: ["OPC Beginner Foundation Stage 2：Prompt 基础"],
    researchSummary: "本课把 Prompt 定义为清楚表达任务，不教授万能模板、System Prompt 或复杂 Prompt Engineering。"
  },
  pedagogy: {
    ...pedagogyBase,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "怎样把我想让 AI 做的事情说清楚？",
      mainConcept: "Prompt 的第一作用是减少 AI 对任务的猜测。",
      allowedCoreTerms: ["Prompt"],
      deferredTerms
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "把清楚后的任务放进自己的 AI 软件",
      instruction: "先完成练习，再把你写清楚的任务复制到常用 AI 软件里，对比原来那句模糊要求。",
      prompt: null,
      reflection: "比较的重点是：第二次结果是否更贴近真实任务，而不是文字是否更华丽。"
    }
  },
  lessonSpec: {
    version: "1.0.0",
    courseSlug: "foundation-ai",
    lessonId: "beginner-prompt",
    title: "Prompt：怎样把想做的事情说清楚",
    lessonType: "APPLICATION",
    learningObjectives: ["知道 Prompt 首先是任务说明。","能把一句模糊要求补成可执行任务。","能区分必要信息和无关信息。"],
    knowledgePoints: ["说清要做什么、必要背景和结果要求。","Prompt 的目标是减少猜测，不是追求复杂格式。"],
    prerequisites: ["F1-01","F1-02"],
    requiresExample: true,
    requiresCheck: true,
    practiceMode: "GUIDED",
    realAiOperation: "NONE",
    realAiEvidence: "NONE",
    referenceAnswerEnabled: true,
    reviewEnabled: true,
    selfAssessmentEnabled: true,
    courseFeedbackEnabled: true,
    completionGates: ["CHECK","PRACTICE"],
    steps: [
      { id:"explain",kind:"EXPLAIN",title:"先把你真正想做的事情说出来",objective:"建立 Prompt 是任务说明的直觉。" },
      { id:"example",kind:"EXAMPLE",title:"同一件事，只改三个关键信息会怎样",objective:"通过前后对比看见清楚任务的价值。" },
      { id:"check",kind:"CHECK",title:"这句话还让 AI 猜什么？",objective:"练习识别模糊任务。" },
      { id:"practice",kind:"PRACTICE",title:"把一句模糊要求改成可执行任务",objective:"亲手写出一个足够清楚的 Prompt。" },
      { id:"review",kind:"REVIEW",title:"先记住三个检查点",objective:"收束为任务、必要背景、结果要求。" },
      { id:"capability",kind:"CAPABILITY",title:"你已经会把任务说得更清楚",objective:"形成可立即使用的 Prompt 基础能力。" }
    ],
    capabilityGain: ["能把一句模糊要求改成 AI 更容易执行的任务说明。"],
    nextLessonValue: "下一节继续解决：你知道的背景，AI 为什么不一定知道。",
    accessPresentation
  },
  content: {
    summary: "不学万能模板。你会先学会把任务、必要背景和结果要求说清楚。",
    plainExplanation: "Prompt 可以先理解成你交给 AI 的任务说明。你不需要把它写得很长，只要让 AI 知道要做什么、哪些背景会影响结果、最后希望得到什么。",
    whyItMatters: "很多“AI 不好用”的问题，其实来自任务本身太模糊。先学会表达任务，后面再学习更复杂的方法才有意义。",
    points: ["要做什么？","有哪些必要背景？","最后希望得到什么？"],
    content: ["先写清任务目标。","只补会改变结果的背景。","结果形式或行动要求要让 AI 看得见。"],
    example: {
      title: "从“帮我跟进客户”到可执行任务",
      situation: "客户三天没回复，你想发一条不显催促的跟进消息。",
      before: "帮我写个客户跟进。",
      after: "给一位三天没回复的客户写一条微信跟进消息，语气友好、不催促，提醒他上次询问的方案仍可继续沟通，并请他回复是否需要我补充资料。",
      result: "只补了对象、当前情况和希望的下一步，AI 就更容易写出真正能用的第一版。"
    },
    mistakes: ["误区：Prompt 越长越专业｜正确理解：只写会改变结果的信息。","误区：一定要背固定模板｜正确理解：先把真实任务说清楚。","误区：加很多形容词就会更准｜正确理解：具体任务和必要背景更重要。"],
    related: ["下一课：AI 这次到底看到了哪些信息。","后续会继续练习怎样逐轮改进结果。"]
  },
  check: null,
  checkSequence: [
    { id:"prompt_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"你想让 AI 写一条活动延期通知，哪种要求最容易直接执行？",options:[{value:"A",label:"写专业一点"},{value:"B",label:"通知报名客户：周六活动从 14:00 改到 15:00，语气礼貌，并请对方回复是否仍能参加"},{value:"C",label:"发挥一下"}],correctValues:["B"],explanation:"可执行任务需要让 AI 看见对象、变化和希望的结果。",correctFeedback:"正确。不是复杂，而是少让 AI 猜。",incorrectFeedback:"先找对象、发生什么、最后希望对方做什么。"},
    { id:"prompt_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：好的 Prompt 必须套用固定格式，否则 AI 就无法完成任务。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"固定格式可以帮助整理思路，但新手最重要的是任务足够清楚。",correctFeedback:"正确。先把事情说清楚，比背模板重要。",incorrectFeedback:"格式只是辅助，不是目的。真正影响结果的是任务是否清楚。"},
    { id:"prompt_boundary",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些信息通常值得写进“帮我改一封客户邮件”的 Prompt？（多选）",options:[{value:"GOAL",label:"这封邮件要解决什么问题"},{value:"BACKGROUND",label:"会影响内容的客户背景"},{value:"RESULT",label:"希望语气和最终结果是什么"},{value:"NOISE",label:"与这封邮件无关的完整一天行程"}],correctValues:["GOAL","BACKGROUND","RESULT"],explanation:"只保留会改变任务结果的信息。",correctFeedback:"正确。你已经能区分必要条件和噪音。",incorrectFeedback:"问自己：这条信息删掉后，邮件内容会不会明显不同？"}
  ],
  practice: {
    id:"practice_prompt",
    title:"把一句模糊要求说清楚",
    goal:"把“帮我写个客户跟进”改成 AI 可以直接开始做的任务说明。",
    instructions:[
      {key:"task",label:"任务和情况",prompt:"写清给谁、现在发生了什么、这次要做什么。"},
      {key:"result",label:"希望结果",prompt:"写清希望语气、长度或对方下一步做什么。"}
    ],
    hints:["先回答：给谁？现在是什么情况？","不用写长，只补真正影响结果的要求。"],
    rubric:[
      {key:"task",label:"任务清楚",maxScore:50,minScore:25,example:"给三天没回复的意向客户写一条微信跟进。"},
      {key:"result",label:"结果清楚",maxScore:50,minScore:25,example:"语气友好、不催促，并请他回复是否需要补充资料。"}
    ],
    passScore:60
  },
  hints:["先写真实任务，不要从模板开始。","如果一句话里还有很多可能解释，就再补一个必要条件。"],
  referenceAnswer:"任务和情况：给一位三天没回复的意向客户写一条微信跟进。\n希望结果：语气友好、不催促，提醒上次方案仍可继续沟通，并请他回复是否需要我补充资料。",
  review:["先说清要做什么。","只补会改变结果的必要背景。","让最终结果或下一步清楚可见。"],
  selfAssessment:["我能把一句模糊要求改成可执行任务。","我不会为了显得专业而堆无关信息。"]
} as const;

export const beginnerPromptReferenceFill = {
  task: "给一位三天没回复的意向客户写一条微信跟进。",
  result: "语气友好、不催促，提醒上次方案仍可继续沟通，并请他回复是否需要我补充资料。"
} as const;

export const beginnerPromptKnowledgeDepth = {
  example: [
    { title:"只改一个变量也能看见差异",text:"先保留同一个任务，只补对象、情况和结果要求，就能判断是不是“任务说清楚”带来了变化。" },
    { title:"Prompt 不是作文",text:"不需要漂亮措辞。能让 AI 少猜、让你容易验收，就已经是好任务说明。" }
  ],
  review: [
    { title:"任务先于格式",text:"先确认事情是什么，再考虑要不要用模板整理。" },
    { title:"必要信息先于信息数量",text:"不是越多越好，而是每一条都真的影响当前结果。" }
  ]
} as const;

export const beginnerContextIntro = {
  situation: "你让 AI“继续按我们公司的规则改”，但这次对话里你从没给过那份规则。你脑子里知道，不代表 AI 这次也看得到。",
  approaches: [
    { label:"默认它都知道",text:"把自己知道的背景也当成 AI 已经知道。"},
    { label:"检查它这次看到了什么",text:"需要用到的资料、背景和前文，要在当前任务里真的提供给它。"}
  ],
  comparison: [],
  takeaway: "Context（上下文）可以先理解成：AI 这一次真正看得到、能用来完成任务的信息。",
  bottomDetails: [
    { title:"你知道 ≠ AI 看得到",text:"最常见的协作问题，是人默认了很多背景，但 AI 根本没有收到。" },
    { title:"先补当前任务需要的",text:"不用一次把所有资料都塞进去，只给这次任务真正需要的内容。" }
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const beginnerContextDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"APPROVED_KNOWLEDGE",sourceLabels:["OPC Beginner Foundation Stage 2：Task Context"],researchSummary:"本课只建立 Task Context 直觉：AI 只使用当前可见信息；不教授 Token 或 Context Window 容量机制。"},
  pedagogy:{
    ...pedagogyBase,
    qualityProfile:{id:"BEGINNER_QUALITY_V1",mainLearnerQuestion:"AI 为什么不知道我明明已经知道的背景？",mainConcept:"AI 只能使用当前任务里真正提供给它的信息。",allowedCoreTerms:["Context"],deferredTerms},
    participation:{kind:"CLASSIFY",title:"哪些信息这次必须给 AI",instruction:"看一个工作任务，判断哪些背景是当前任务必须提供的，哪些暂时不需要。",prompt:null,reflection:"重点不是资料越多越好，而是 AI 真正需要的背景有没有出现。"}
  },
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"beginner-context",title:"Context：AI 只知道你这次给它看到的东西",lessonType:"CONCEPT",
    learningObjectives:["能用直觉解释 Context。","能发现自己默认但 AI 看不到的背景。","能为当前任务挑出必要资料。"],
    knowledgePoints:["Context 是当前任务中 AI 实际可见的信息。","人脑里的默认背景不会自动进入 AI 当前任务。"],
    prerequisites:["F2-01"],requiresExample:true,requiresCheck:true,practiceMode:"NONE",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:false,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"先问：AI 这次到底看到了什么",objective:"建立当前可见信息的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"同一句“继续修改”，为什么有时完全接不上",objective:"通过缺背景和补背景的对比讲透 Context。"},
      {id:"check",kind:"CHECK",title:"哪些背景它其实不知道？",objective:"练习判断当前任务的信息缺口。"},
      {id:"practice",kind:"PRACTICE",title:"给必要信息找位置",objective:"通过轻量分类巩固 Context 判断。"},
      {id:"review",kind:"REVIEW",title:"只记住两件事",objective:"收束为“看得到什么”和“这次需要什么”。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会检查 AI 缺什么背景",objective:"为后续迭代建立信息检查能力。"}
    ],
    capabilityGain:["能在 AI 结果偏离前，先检查它这次是否真的拿到了必要背景。"],
    nextLessonValue:"下一节会练习：第一次结果不对时，怎样继续让 AI 改好。",
    accessPresentation
  },
  content:{
    summary:"你会学会一个简单判断：先别问 AI 为什么不懂，先看它这次到底看到了什么。",
    plainExplanation:"Context（上下文）可以先理解成 AI 当前任务真正看得到的信息，包括你这次写下的要求、给它的资料，以及当前对话里仍然可用的相关内容。",
    whyItMatters:"你脑子里的公司规则、客户背景、上周会议结论，如果没有在当前任务里提供，AI 不会自动知道。很多“它怎么又忘了”的问题，本质是信息没有进入这次任务。",
    points:["当前要求是信息。","你提供的资料是信息。","你没给出的背景，不会自动成为当前任务信息。"],
    content:["先判断当前任务真正需要哪些背景。","不要默认 AI 知道你脑子里的上下文。","这一课不讨论能装多少信息，只练“有没有给到”。"],
    example:{title:"一句“按之前风格改一下”为什么会失败",situation:"你新开一个对话，让 AI 修改客户欢迎语。",before:"只说“按我们之前的风格改一下”，但当前对话没有旧文案或风格说明。",after:"补上旧版欢迎语，并说明要保留“简洁、友好、不夸张”的风格。",result:"任务本身没变，只是把原本只在你脑子里的背景真正给到了 AI。"},
    mistakes:["误区：我知道的背景 AI 也应该知道｜正确理解：先看当前任务是否真的提供。","误区：Context 就是把所有资料都塞进去｜正确理解：只给这次需要的。","误区：AI 没接上就是模型变差｜正确理解：先检查当前可见信息。"],
    related:["上一课：把任务说清楚。","下一课：结果不对时怎样继续调整。"]
  },
  check:null,
  checkSequence:[
    {id:"context_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"你让 AI“按公司最新报价规则重新算”，但当前任务里没有报价规则。最先应该做什么？",options:[{value:"A",label:"把当前需要使用的报价规则提供给 AI"},{value:"B",label:"只说“你应该知道”"},{value:"C",label:"换一个更长的形容词"}],correctValues:["A"],explanation:"AI 需要真正拿到当前任务所需的信息。",correctFeedback:"正确。先把缺失背景送进当前任务。",incorrectFeedback:"先检查：这条规则是否真的出现在 AI 当前能看到的信息里。"},
    {id:"context_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：只要你之前在别的地方告诉过 AI 一次，任何新任务都可以默认它一定知道。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"当前任务能否使用某条信息，要看这次是否真的可见和可用。",correctFeedback:"正确。不要把自己的记忆当成 AI 当前任务的 Context。",incorrectFeedback:"新任务先检查当前可见信息，不要靠默认。"},
    {id:"context_boundary",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"你要 AI 根据一份会议记录写客户后续行动清单，下面哪些通常应该成为当前 Context？（多选）",options:[{value:"NOTES",label:"这次会议记录"},{value:"GOAL",label:"你希望提取行动项、负责人和时间"},{value:"CLIENT",label:"会影响行动项判断的客户背景"},{value:"UNRELATED",label:"与本客户无关的其他项目全部资料"}],correctValues:["NOTES","GOAL","CLIENT"],explanation:"当前任务需要的资料、目标和相关背景应该可见，无关资料不必加入。",correctFeedback:"正确。你已经会选择“够用的 Context”。",incorrectFeedback:"只保留完成这次任务真正需要的信息。"}
  ],
  practice:null,
  hints:["先问：这条信息现在真的在任务里吗？","再问：没有它，AI 会不会只能猜？"],
  referenceAnswer:null,
  review:["你知道的，不等于 AI 这次看得到。","只给当前任务真正需要的信息。"],
  selfAssessment:["我能发现 AI 当前缺失的必要背景。","我知道 Context 不是把所有资料一次塞进去。"]
} as const;

export const beginnerContextKnowledgeDepth = {
  example:[
    {title:"最容易漏掉的是默认背景",text:"客户是谁、公司规则、上次结论这些你很熟，但 AI 当前任务里可能完全没有。"},
    {title:"资料够用就好",text:"Context 的第一目标不是“越多越强”，而是让当前任务不需要靠猜。"}
  ],
  review:[
    {title:"先看可见性",text:"不要问“它应该知道吗”，先问“这次真的给了吗”。"},
    {title:"再看必要性",text:"只把完成当前任务需要的背景放进来。"}
  ]
} as const;

export const beginnerIterationIntro = {
  situation:"AI 第一次写出的客户消息太生硬。你可以全部删掉重来，也可以直接指出“语气太像催促，保留核心信息，但更自然一些”，让它在现有结果上继续改。",
  approaches:[
    {label:"不满意就重来",text:"每次重新开一个模糊要求，AI 又从头猜一次。"},
    {label:"告诉它哪里不对",text:"指出偏差、补缺失信息、给一个参考方向，必要时让 AI 先问你。"}
  ],
  comparison:[],
  takeaway:"第一次结果不是终点。好的协作，是把“哪里不对”变成下一轮更清楚的信息。",
  bottomDetails:[
    {title:"反馈要具体",text:"“不好”很难改；“太长、太像广告、漏了截止时间”才知道下一步怎么调整。"},
    {title:"缺信息就补，不确定就让它问",text:"不用每次自己猜原因，可以明确让 AI 先问一两个关键问题。"}
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const beginnerIterationDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"APPROVED_KNOWLEDGE",sourceLabels:["OPC Beginner Foundation Stage 2：Iteration"],researchSummary:"本课教授用户层面的逐轮改进：指出偏差、补信息、给例子、让 AI 澄清；不教授 Workflow/Agent 自动循环。"},
  pedagogy:{
    ...pedagogyBase,
    qualityProfile:{id:"BEGINNER_QUALITY_V1",mainLearnerQuestion:"第一次结果不对，我应该怎么继续？",mainConcept:"把具体偏差变成下一轮输入，而不是模糊地重来。",allowedCoreTerms:[],deferredTerms},
    participation:{kind:"COPY_TO_AI",title:"把具体反馈继续交给 AI",instruction:"完成练习后，把你的“哪里不对 + 怎么改”复制到常用 AI 软件里，观察第二轮变化。",prompt:null,reflection:"重点看第二轮是否修正了你指出的偏差，而不是要求一次就完美。"}
  },
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"beginner-iteration",title:"第一次结果不对，怎样继续让 AI 改好",lessonType:"APPLICATION",
    learningObjectives:["能指出 AI 结果的具体偏差。","能补充缺失信息或参考例子。","必要时能让 AI 先提出澄清问题。"],
    knowledgePoints:["具体反馈比“重来一次”更有效。","迭代可以通过指出偏差、补信息、给示例和澄清来完成。"],
    prerequisites:["F2-01","F2-02"],requiresExample:true,requiresCheck:true,practiceMode:"GUIDED",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:true,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK","PRACTICE"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"第一次不对，不代表任务失败",objective:"建立逐轮改进的协作直觉。"},
      {id:"example",kind:"EXAMPLE",title:"把“写得不好”改成 AI 能执行的反馈",objective:"看见具体反馈如何改变第二轮结果。"},
      {id:"check",kind:"CHECK",title:"哪种反馈真的能让它改",objective:"判断有效反馈和无效抱怨。"},
      {id:"practice",kind:"PRACTICE",title:"给一份不满意的结果写下一轮反馈",objective:"练习指出偏差并给出修改方向。"},
      {id:"review",kind:"REVIEW",title:"结果不对时按这三步",objective:"收束为指出偏差、补信息、必要时澄清。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会和 AI 继续把结果改好",objective:"形成基本的多轮协作能力。"}
    ],
    capabilityGain:["面对不满意的 AI 结果，能给出具体反馈并推动下一轮改善。"],
    nextLessonValue:"下一节会解决最后一个基础问题：什么结果可以直接参考，什么一定要检查。",
    accessPresentation
  },
  content:{
    summary:"第一次结果不理想时，不用全部重来。你会学会把具体偏差变成下一轮反馈。",
    plainExplanation:"和 AI 协作更像改稿，不像抽奖。结果不对时，指出哪里偏了、缺什么、希望怎样改变；如果你自己也不确定，还可以先让 AI 问你关键问题。",
    whyItMatters:"如果每次都只说“再来一个”，AI 仍然不知道上一版哪里错了。具体反馈能把一次回答变成逐步接近目标的过程。",
    points:["指出哪里不对。","补上缺失信息或给一个参考。","必要时先让 AI 问清楚。"],
    content:["反馈越具体，下一轮越容易变化。","不要一次同时改十件事，先处理最影响结果的问题。","这只是人与 AI 的逐轮协作，不涉及自动执行流程。"],
    example:{title:"“太生硬了”怎样变成可执行反馈",situation:"AI 写了一条客户跟进消息，但像催款通知。",before:"不好，再写一个。",after:"保留“确认是否还需要方案”这个目的，但语气不要催促；开头先问候，去掉“尽快回复”，控制在 80 字以内。",result:"AI 第二轮知道具体要保留什么、删掉什么、改变什么。"},
    mistakes:["误区：不满意就全部重开｜正确理解：先告诉 AI 上一版哪里偏。","误区：只说“更好一点”｜正确理解：给具体变化方向。","误区：必须自己把所有问题想清楚｜正确理解：也可以让 AI 先问关键问题。"],
    related:["上一课：Context 决定 AI 当前能看到什么。","下一课：不同结果需要不同检查力度。"]
  },
  check:null,
  checkSequence:[
    {id:"iteration_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"AI 写出的活动文案太像广告，你最应该怎样反馈？",options:[{value:"A",label:"不好，再来"},{value:"B",label:"保留活动时间和地点，但去掉夸张词，语气像朋友邀请，控制在 100 字以内"},{value:"C",label:"你自己看着办"}],correctValues:["B"],explanation:"具体指出保留、删除和改变的方向，AI 才能执行。",correctFeedback:"正确。你给的是可以直接修改的反馈。",incorrectFeedback:"试着把“不满意”拆成具体偏差和修改方向。"},
    {id:"iteration_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：只要第一次结果不好，就说明这个任务不适合 AI，继续反馈没有意义。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"很多任务需要通过反馈和补充信息逐轮接近目标。",correctFeedback:"正确。第一次结果只是协作的起点。",incorrectFeedback:"先判断是方向错、信息缺，还是要求还不清楚，再决定下一轮。"},
    {id:"iteration_boundary",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些属于有效的下一轮动作？（多选）",options:[{value:"DEVIATION",label:"指出哪一部分偏离目标"},{value:"MISSING",label:"补充上一轮缺失的重要信息"},{value:"EXAMPLE",label:"给一个你喜欢的参考方向"},{value:"VAGUE",label:"只重复“再好一点”"}],correctValues:["DEVIATION","MISSING","EXAMPLE"],explanation:"具体反馈、补信息和参考都能减少下一轮猜测。",correctFeedback:"正确。你已经掌握最基础的迭代动作。",incorrectFeedback:"有效动作应该让 AI 明确知道下一轮具体要改变什么。"}
  ],
  practice:{
    id:"practice_iteration",title:"给一份不满意的结果写反馈",goal:"把“这版不好”改成 AI 可以执行的下一轮要求。",
    instructions:[
      {key:"problem",label:"哪里不对",prompt:"写出最影响结果的一到两个具体问题。"},
      {key:"change",label:"下一轮怎么改",prompt:"说明保留什么、改变什么，或补充哪条信息。"}
    ],
    hints:["不要只写“太差”“不好看”。","先改最影响结果的一件事。"],
    rubric:[
      {key:"problem",label:"偏差具体",maxScore:50,minScore:25,example:"语气太像催促，而且漏了活动截止时间。"},
      {key:"change",label:"修改方向可执行",maxScore:50,minScore:25,example:"保留核心信息，语气改得友好，并补上周五截止。"}
    ],
    passScore:60
  },
  hints:["先圈出上一版最影响使用的一处。","说清楚希望它变成什么样。"],
  referenceAnswer:"哪里不对：语气太像催促，而且漏了报名截止时间。\n下一轮怎么改：保留活动信息，语气改得友好自然，补上“周五 18:00 前回复”，控制在 100 字以内。",
  review:["先指出具体偏差。","缺信息就补，方向不清就给参考。","必要时让 AI 先问你关键问题。"],
  selfAssessment:["我不会再只说“重新写一个”。","我能把不满意变成可执行反馈。"]
} as const;

export const beginnerIterationReferenceFill = {
  problem:"语气太像催促，而且漏了报名截止时间。",
  change:"保留活动信息，语气改得友好自然，补上“周五 18:00 前回复”，控制在 100 字以内。"
} as const;

export const beginnerIterationKnowledgeDepth = {
  example:[
    {title:"一次只改最重要的问题",text:"如果同时要求改语气、结构、事实、长度和风格，很难判断到底哪项调整有效。"},
    {title:"你也可以让 AI 先问",text:"当你不知道缺什么时，可以让 AI 先提出一两个完成任务必须知道的问题。"}
  ],
  review:[
    {title:"反馈要能执行",text:"“不好”是感受，“删掉夸张词、补截止时间”才是动作。"},
    {title:"把上一轮变成下一轮的材料",text:"保留有效部分，只修真正偏离目标的地方。"}
  ]
} as const;

export const beginnerResultCheckIntro = {
  situation:"AI 帮你想三个标题，你可以直接挑一个再改；但如果它给你“最新政策截止日期”，就不能只因为写得像真的而直接发给客户。",
  approaches:[
    {label:"所有结果都一样处理",text:"要么什么都查，要么什么都直接用。"},
    {label:"先看事实和风险",text:"结果越依赖事实、越难验证、错了代价越高，检查力度就越高。"}
  ],
  comparison:[],
  takeaway:"不是所有 AI 结果都要用同一种检查方式。先看它是不是事实、错了会怎样、能不能验证。",
  bottomDetails:[
    {title:"低风险内容可以先用来比较",text:"标题、表达方式、点子通常可以先挑选和修改。"},
    {title:"高风险内容先停一下",text:"数字、日期、政策、合同、金额、公开承诺等，使用前要找到可靠依据。"}
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const beginnerResultCheckDraft = {
  mode:"BUILD",
  grounding:{status:"REVIEWED",sourceKind:"APPROVED_KNOWLEDGE",sourceLabels:["OPC Beginner Foundation Stage 2：Result Check"],researchSummary:"本课建立用户层面结果检查判断：事实性、风险、可验证性；不教授正式 Evaluation framework、test set 或 regression。"},
  pedagogy:{
    ...pedagogyBase,
    qualityProfile:{id:"BEGINNER_QUALITY_V1",mainLearnerQuestion:"AI 的结果什么时候能直接参考，什么时候必须先检查？",mainConcept:"检查力度由事实性、错误代价和可验证性决定。",allowedCoreTerms:[],deferredTerms},
    participation:{kind:"CLASSIFY",title:"给结果分检查力度",instruction:"把几个常见 AI 结果分成“可以先参考”和“使用前必须核实”。",prompt:null,reflection:"重点不是对 AI 一律怀疑，而是把检查成本用在最值得的地方。"}
  },
  lessonSpec:{
    version:"1.0.0",courseSlug:"foundation-ai",lessonId:"beginner-result-check",title:"AI 的结果什么时候能直接用，什么时候一定要检查",lessonType:"APPLICATION",
    learningObjectives:["能判断一个结果是否高度依赖事实。","能按错误代价决定检查力度。","能优先检查有明确来源或依据可验证的内容。"],
    knowledgePoints:["事实性越强、错误代价越高，越需要核实。","可验证的结果应尽量回到可靠来源，而不是只看 AI 的语气。"],
    prerequisites:["F1-03","F2-03"],requiresExample:true,requiresCheck:true,practiceMode:"GUIDED",realAiOperation:"NONE",realAiEvidence:"NONE",referenceAnswerEnabled:true,reviewEnabled:true,selfAssessmentEnabled:true,courseFeedbackEnabled:true,completionGates:["CHECK","PRACTICE"],
    steps:[
      {id:"explain",kind:"EXPLAIN",title:"先别问“能不能信”，先看这是什么结果",objective:"建立按结果类型和风险决定检查力度的直觉。"},
      {id:"example",kind:"EXAMPLE",title:"三个标题和一个政策日期，为什么不能一样处理",objective:"通过风险反差讲透检查边界。"},
      {id:"check",kind:"CHECK",title:"这条结果要不要先停下来核实",objective:"练习真实使用判断。"},
      {id:"practice",kind:"PRACTICE",title:"给一个 AI 结果设计最小检查动作",objective:"把判断转成实际检查步骤。"},
      {id:"review",kind:"REVIEW",title:"检查前问三个问题",objective:"收束为事实、风险、可验证性。"},
      {id:"capability",kind:"CAPABILITY",title:"你已经会决定检查力度",objective:"形成基础的结果使用边界。"}
    ],
    capabilityGain:["能判断一条 AI 结果是可以先参考，还是必须核实后再使用。"],
    nextLessonValue:"下一阶段会在已经会用 AI 的基础上，再理解模型为什么会这样工作。",
    accessPresentation
  },
  content:{
    summary:"你会学会按事实、风险和可验证性决定检查力度，而不是对所有 AI 结果一刀切。",
    plainExplanation:"标题、表达和点子这类低风险结果，可以先用来比较和修改；数字、日期、政策、合同、金额和重要承诺更依赖事实，错了后果也更大，使用前应该回到可靠依据核实。",
    whyItMatters:"真正会用 AI，不是“全部相信”或“全部不信”，而是知道什么时候值得快速使用，什么时候必须停下来检查。",
    points:["这是事实还是创意？","如果错了，代价有多大？","有没有可靠来源可以验证？"],
    content:["事实性越强，越要检查来源。","错误代价越高，越不能只靠一次回答。","能验证时优先回到可靠原始资料。"],
    example:{title:"标题可以先挑，政策日期必须先查",situation:"AI 同时帮你想了三个活动标题，并告诉你一个政策申报截止日期。",before:"把四个结果都当成同样可信，直接使用。",after:"标题先按效果比较和修改；截止日期先回到官方通知核实。",result:"同一个 AI 输出，不同内容因为事实性和错误代价不同，需要不同检查力度。"},
    mistakes:["误区：AI 结果都要逐字查｜正确理解：低风险创意可以先比较和修改。","误区：写得很确定就比较可信｜正确理解：语气不是证据。","误区：只有重大决定才需要检查｜正确理解：数字、日期和公开事实也值得优先核实。"],
    related:["前面已经学过 AI 可能说错。","后面会更系统地学习怎样评价复杂 AI 系统。"]
  },
  check:null,
  checkSequence:[
    {id:"result_check_best",questionType:"SINGLE_CHOICE",masteryRole:"BEST_JUDGMENT",question:"AI 告诉你“某政府补贴申请截止日期是 10 月 31 日”，你准备发给客户。最合适的下一步是什么？",options:[{value:"A",label:"因为语气很确定，直接发送"},{value:"B",label:"先查看官方通知或可靠原始来源确认日期"},{value:"C",label:"让 AI 再重复一次同样答案就算核实"}],correctValues:["B"],explanation:"事实性强且对客户有影响的信息，应回到可靠来源确认。",correctFeedback:"正确。检查的关键是证据，不是让 AI 再说一次。",incorrectFeedback:"想想：如果日期错了会有什么后果？你能不能找到可靠原始来源？"},
    {id:"result_check_misconception",questionType:"TRUE_FALSE",masteryRole:"MISCONCEPTION",question:"判断：AI 给出的标题创意和合同金额，都应该用完全相同的检查方式。",options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],correctValues:["FALSE"],explanation:"不同结果的事实性和错误代价不同，检查力度也不同。",correctFeedback:"正确。会分级，比一刀切更实用。",incorrectFeedback:"标题错了可以重选，金额错了可能造成真实损失。检查力度应该不同。"},
    {id:"result_check_boundary",questionType:"MULTI_SELECT",masteryRole:"BOUNDARY_CONDITIONS",question:"下面哪些结果通常在正式使用前应该优先核实？（多选）",options:[{value:"PRICE",label:"给客户的正式报价数字"},{value:"DATE",label:"政策或活动截止日期"},{value:"CLAUSE",label:"合同条款含义"},{value:"TITLE",label:"内部头脑风暴的三个标题"}],correctValues:["PRICE","DATE","CLAUSE"],explanation:"数字、日期、合同都高度依赖事实且错误代价较高。",correctFeedback:"正确。你已经会把检查成本放在高风险结果上。",incorrectFeedback:"先找“依赖事实 + 错了代价高”的结果。"}
  ],
  practice:{
    id:"practice_result_check",title:"给一条 AI 结果设计最小检查动作",goal:"判断这条结果的风险，并写出使用前最必要的一步检查。",
    instructions:[
      {key:"risk",label:"为什么要检查或可以先参考",prompt:"说明它属于事实/创意哪一类，以及错了会有什么影响。"},
      {key:"verify",label:"最小检查动作",prompt:"如果需要核实，写清应该回到哪类可靠来源；如果低风险，说明怎样先比较/修改。"}
    ],
    hints:["先问：这是事实还是创意？","再问：错了会不会影响钱、承诺、客户或正式决策？"],
    rubric:[
      {key:"risk",label:"风险判断清楚",maxScore:50,minScore:25,example:"这是给客户的正式截止日期，属于事实信息，错了会影响客户行动。"},
      {key:"verify",label:"检查动作具体",maxScore:50,minScore:25,example:"回到官方通知确认日期，再把核实后的信息发给客户。"}
    ],
    passScore:60
  },
  hints:["语气不是证据。","优先找原始资料、官方信息或你能确认的正式记录。"],
  referenceAnswer:"为什么要检查：这是给客户的正式截止日期，属于事实信息，错了会影响客户行动。\n最小检查动作：回到官方通知确认日期，再把核实后的信息发给客户。",
  review:["先分事实还是创意。","再看错了的代价。","能验证时回到可靠来源。"],
  selfAssessment:["我能判断一条结果需要多大检查力度。","我不会把 AI 的确定语气当成证据。"]
} as const;

export const beginnerResultCheckReferenceFill = {
  risk:"这是给客户的正式截止日期，属于事实信息，错了会影响客户行动。",
  verify:"回到官方通知确认日期，再把核实后的信息发给客户。"
} as const;

export const beginnerResultCheckKnowledgeDepth = {
  example:[
    {title:"检查不是越多越好",text:"低风险创意如果每一句都查，会浪费时间；把检查资源留给事实和高风险内容更有效。"},
    {title:"让 AI 重复不算核实",text:"真正的核实需要独立可靠依据，而不是同一个回答再生成一次。"}
  ],
  review:[
    {title:"事实性",text:"数字、日期、政策、条款和正式记录优先检查。"},
    {title:"错误代价",text:"涉及钱、承诺、客户和正式决策时，提高检查力度。"}
  ]
} as const;
