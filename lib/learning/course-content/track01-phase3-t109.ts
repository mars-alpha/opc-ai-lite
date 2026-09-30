import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../course-builder";

const accessPresentation = { showCourseContext:true, showLearningPathLink:true, inlineConversionCta:false } as const;

export const track01T109Meta = {
  canonicalId:"T1-09", draftVersion:"1.0.1-track01-t109-review", skillId:"course-builder",
  skillVersion:"0.2.0", qualityProfile:"BEGINNER_QUALITY_V1",
  formalBrief:"git-history:TRACK01_T1_09_FORMAL_BRIEF_V1.md", grounding:"REVIEWED_KNOWLEDGE",
  caseThread:"MEMBERSHIP_PRICE_SOURCE_RULE", inheritedCapability:"T1-08_INFORMATION_SOURCE_AWARENESS",
  artifactOutput:"BUSINESS_SOURCE_OF_TRUTH_RULE", nextReuse:"T1-10_SEARCH_RAG"
} as const;

export const track01T109Intro = {
  title:"资料都已经给 AI 了，为什么它还是可能答错？",
  situation:"你把帮助文档、培训资料、历史活动说明和当前业务配置都交给 AI。它们都和同一个问题有关，但可能来自不同时间、不同用途，甚至写着不同答案。资料都在，不代表 AI 自动知道哪一份才代表现在的正式事实。",
  approaches:[
    { label:"把所有资料当成同等权威", text:"只要资料都放在一起，就默认 AI 会自己判断哪一份最新、哪一份更可信。" },
    { label:"先明确资料角色和最终权威", text:"允许多份资料作为背景参考，但明确当前会员价格必须以正式价格配置或已发布价格页为准。" }
  ],
  comparison:[],
  takeaway:"知识库（Knowledge Base）解决“有哪些资料可以使用”，事实源（Source of Truth）解决“资料冲突时谁说了算”。资料越多，不代表事实自动更可靠。",
  bottomDetails:[
    { title:"知识库（Knowledge Base）", text:"一组供人或 AI 使用的知识资料，其中既可能有正式说明，也可能有背景材料、旧版本和辅助内容。" },
    { title:"事实源（Source of Truth）", text:"多个来源对同一业务事实说法不一致时，被明确指定为最终权威、负责当前事实的来源。" }
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const track01T109KnowledgeDepth = {
  example:[
    { title:"为什么“资料更多”仍可能答错", text:"旧活动页、培训稿和当前价格配置都可能有参考价值，但它们不一定处在同一个版本和权威等级。" },
    { title:"哪些事实特别需要明确权威来源", text:"当前价格、退款政策、产品状态、库存、客户权益、正式截止日期等会变化或产生业务后果的信息，都应该先明确由谁负责最终事实。" }
  ],
  review:[
    { title:"先确定谁负责当前事实", text:"价格、政策、状态、截止日期等信息只要会变化或影响业务结果，就先明确哪个来源拥有最终权威。" },
    { title:"其他资料负责补充，不负责改写事实", text:"历史材料和说明文档可以帮助 AI 理解背景，但一旦与正式事实源冲突，就不能覆盖当前正式结论。" }
  ]
} as const;

export const track01T109ReferenceFill = {
  question:"客户询问“OPC 会员当前年费是多少？”",
  sources:"可参考资料包括官网帮助说明、销售培训稿、历史活动海报和当前会员价格配置。",
  authority:"当前会员价格配置是正式事实源；只有已发布并处于当前生效状态的价格可以作为正式回答。",
  conflictRule:"如果历史活动、培训稿或其他说明与当前价格配置不一致，以当前价格配置为准；不要根据旧资料自行折中、推断或补出一个价格。"
} as const;

export const track01T109Draft = {
  mode:"BUILD",
  grounding:{
    status:"REVIEWED", sourceKind:"APPROVED_KNOWLEDGE",
    sourceLabels:["git-history:TRACK01_T1_09_FORMAL_BRIEF_V1.md","COURSE_BUILD_STANDARD_V1.md","TRACK_CONTEXTS_V1.md"],
    researchSummary:"本课只建立知识库（Knowledge Base）与事实源（Source of Truth）的 Beginner 直觉。资料集合与最终权威是两个问题；价格、政策、状态、截止日期等业务事实应先指定正式来源和冲突规则。Search、RAG、Retrieval、Vector Database、Embedding、Vector Search、Chunk、Top-K、Reranking、API、Tool Use、MCP 延后。"
  },
  pedagogy:{
    audience:"BEGINNER", languagePolicy:"TERM_READABILITY", aiToolNeutral:true, conceptMasteryBeforePractice:true,
    qualityProfile:{
      id:"BEGINNER_QUALITY_V1",
      mainLearnerQuestion:"公司明明已经有很多资料，为什么 AI 还是可能回答错？如果几份资料写得不一样，AI 到底应该相信哪一份？",
      mainConcept:"知识库负责提供可用资料，事实源负责定义资料冲突时哪个来源拥有最终权威。",
      allowedCoreTerms:["Knowledge Base","Source of Truth"],
      deferredTerms:["Search","RAG","Retrieval","Vector Database","Embedding","Vector Search","Chunk","Top-K","Reranking","API","Tool Use","MCP"]
    },
    participation:{
      kind:"COPY_TO_AI", title:"给一个业务事实指定“谁说了算”",
      instruction:"选一个希望 AI 稳定回答的真实业务问题，列出可参考资料、正式事实源和冲突规则，再组合成完整知识规则。",
      prompt:"请只按我明确的事实源和冲突规则回答；其他资料可以用于解释背景，但不能覆盖正式事实。",
      reflection:"对比没有规则时的回答和加入事实源规则后的回答：AI 是否还会在冲突资料里自行猜一个答案？"
    },
    sixStepResponsibilities:COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec:{
    version:"1.0.1-track01-t109-review",
    courseSlug:"foundation-ai",
    lessonId:"t1-09-knowledge-source",
    title:"知识库（Knowledge Base）与事实源（Source of Truth）：AI 应该相信哪份资料",
    lessonType:"CONCEPT",
    learningObjectives:[
      "能用直观语言区分知识库（Knowledge Base）与事实源（Source of Truth）。",
      "能解释为什么资料很多仍不代表 AI 自动知道哪一份最新、最权威。",
      "能判断价格、政策、产品状态和截止日期等业务事实何时必须明确正式来源。",
      "能为一个真实业务问题写出可参考资料、正式事实源与冲突规则。"
    ],
    knowledgePoints:[
      "知识库（Knowledge Base）是一组可供人或 AI 使用的知识资料，其中不同资料的时效和权威等级可能不同。",
      "事实源（Source of Truth）是在多个来源说法不一致时，被明确指定为最终权威的来源。",
      "资料都能参考不等于资料权威等级相同；重要业务事实必须明确哪个来源拥有最终决定权。",
      "当参考资料与正式事实源冲突时，应执行已定义的冲突规则，不让 AI 自行折中或猜测。"
    ],
    prerequisites:["T1-08"],
    requiresExample:true,
    requiresCheck:true,
    practiceMode:"NONE",
    realAiOperation:"NONE",
    realAiEvidence:"NONE",
    referenceAnswerEnabled:true,
    reviewEnabled:true,
    selfAssessmentEnabled:true,
    courseFeedbackEnabled:true,
    completionGates:["CHECK"],
    steps:[
      { id:"explain", kind:"EXPLAIN", title:"资料都已经给 AI 了，为什么它还是可能答错", objective:"建立知识库（Knowledge Base）与事实源（Source of Truth）的最小区别，理解资料多不等于事实可靠。" },
      { id:"example", kind:"EXAMPLE", title:"同一个会员价格，四份资料却写得不一样", objective:"用会员年费冲突案例看清：可参考资料可以很多，但当前事实必须有明确的最终权威来源。" },
      { id:"check", kind:"CHECK", title:"资料冲突时，应该让谁说了算", objective:"检查学习者能否区分可参考资料与正式事实源，并识别哪些业务事实需要明确权威来源。" },
      { id:"practice", kind:"PRACTICE", title:"给一个业务事实指定正式来源和冲突规则", objective:"为一个真实业务问题写清可参考资料、正式事实源和冲突处理方式，形成可直接使用的知识规则。" },
      { id:"review", kind:"REVIEW", title:"以后别再把“资料都在”当成“事实就可靠”", objective:"固定回答“AI适合做什么 / AI不应该替你做什么”，留下资料角色和权威来源的长期判断。" },
      { id:"capability", kind:"CAPABILITY", title:"你已经会为业务事实指定“谁说了算”", objective:"确认学习者能在把业务资料交给 AI 前，先指定正式事实源，并明确资料冲突时的处理规则。" }
    ],
    capabilityGain:["能区分知识库与事实源，并为一个真实业务事实指定权威来源和冲突规则。"],
    nextLessonValue:"下一课继续解决：当可信资料很多时，系统怎样先找到与当前问题真正相关的证据，再交给 AI 回答。",
    accessPresentation
  },
  content:{
    summary:"你会分清“有哪些资料可以用”和“资料冲突时谁说了算”，并学会为价格、政策、状态等真实业务事实指定正式来源。",
    plainExplanation:"知识库（Knowledge Base）是一组供人或 AI 使用的知识资料；事实源（Source of Truth）解决的是当不同资料对同一个事实写得不一样时，哪个来源才代表当前正式事实。",
    whyItMatters:"如果没有明确事实源，资料越多反而可能带来越多冲突。价格、政策、库存、产品状态、项目截止日期这类会变化或产生业务后果的信息，不能让 AI 自己从多个版本里猜一个最合理的。",
    points:[
      "知识库（Knowledge Base）回答“有哪些资料可以使用”。",
      "事实源（Source of Truth）回答“同一个事实出现冲突时，谁拥有最终权威”。",
      "参考资料可以很多，但它们不一定同样新、同样正式、同样有决定权。",
      "会变化或产生业务后果的信息，应提前定义正式事实源和冲突规则。"
    ],
    content:[
      "旧活动页、培训稿和帮助文档都可能有价值，但这些价值不等于它们都能决定今天的正式事实。",
      "事实源不一定是一份 PDF。它也可能是一个正式配置、一个已发布页面、一个业务系统里的当前状态，关键在于组织明确规定“这个事实最终由它负责”。",
      "本课先解决“可信事实是谁负责”。至于资料很多时怎样把相关证据找出来，是下一课的问题。"
    ],
    example:{
      title:"客户问会员年费，为什么“把所有资料都给 AI”还不够",
      situation:"旧活动海报写 199 元，销售培训稿写 249 元，帮助说明里还有一个旧版本，而当前会员价格配置已经是 299 元。客户现在问“会员年费是多少？”",
      before:"把所有资料都当成同等权威，让 AI 自己从 199、249、299 里判断哪个数字最合理；只要答案听起来像真的就直接回复。",
      after:"保留这些资料作为背景参考，但明确“当前会员价格配置 / 已发布价格页”是正式事实源；只要其他资料与当前价格冲突，就以正式事实源为准，不自行折中或推断。",
      result:"AI 的回答不再取决于它碰巧引用了哪一份旧资料，而是遵循明确的业务权威和冲突规则。"
    },
    mistakes:[
      "误区：资料都进入知识库后，AI 会自动知道哪一份最新｜正确理解：知识库提供资料范围，正式权威仍需要业务规则明确。",
      "误区：资料越多，答案一定越可靠｜正确理解：没有版本和权威边界时，更多资料也可能带来更多冲突。",
      "误区：AI 可以自己综合几份冲突资料，选一个最合理的正式结论｜正确理解：正式业务事实由组织指定的事实源决定，不应交给 AI 自行裁决。"
    ],
    related:[
      "当你准备把价格、政策、产品状态、客户权益、库存或项目截止日期交给 AI 回答，但手上存在多个版本、历史说明或不同系统记录时。",
      "下一课会继续解决：已经明确哪些资料可信之后，面对大量资料怎样把与当前问题相关的证据找出来。"
    ]
  },
  check:null,
  checkSequence:[
    {
      id:"t109_best_judgment", questionType:"SINGLE_CHOICE", masteryRole:"BEST_JUDGMENT",
      question:"客户询问当前会员年费，但旧活动海报、销售培训稿和当前价格配置写着不同数字。最可靠的处理方式是什么？",
      options:[
        { value:"A", label:"让 AI 综合三个数字，选择看起来最合理的一个" },
        { value:"B", label:"先确认哪个来源被业务明确指定为当前价格的正式事实源，再按它回答" },
        { value:"C", label:"优先使用内容写得最长、解释最详细的资料" }
      ],
      correctValues:["B"],
      explanation:"资料冲突时，关键不是让 AI 猜哪个更可信，而是先明确哪个来源拥有当前事实的最终权威。",
      correctFeedback:"正确。事实源先解决“谁说了算”，其他资料才适合作为背景或解释。",
      incorrectFeedback:"回到 Step 1：知识库可以有很多资料，但正式事实必须有明确的最终权威来源。"
    },
    {
      id:"t109_misconception", questionType:"TRUE_FALSE", masteryRole:"MISCONCEPTION",
      question:"判断：只要把公司的全部资料都放进知识库（Knowledge Base），AI 就会自动知道哪一份最新、哪一份最权威，因此不需要再定义事实源（Source of Truth）。",
      options:[{ value:"TRUE", label:"对" },{ value:"FALSE", label:"错" }],
      correctValues:["FALSE"],
      explanation:"知识库描述可用资料范围，不自动赋予每份资料相同或正确的权威等级；正式事实源仍需要明确。",
      correctFeedback:"正确。资料集合和最终权威是两个不同问题。",
      incorrectFeedback:"知识库里可以同时存在旧资料、背景资料和正式资料；没有事实源规则时，AI 不会自动获得组织内部的权威判断。"
    },
    {
      id:"t109_boundary", questionType:"MULTI_SELECT", masteryRole:"BOUNDARY_CONDITIONS",
      question:"下面哪些业务信息特别需要提前明确正式事实源，因为它们会变化、发生冲突或产生业务后果？（多选）",
      options:[
        { value:"PRICE", label:"当前会员价格" },
        { value:"REFUND", label:"当前退款政策" },
        { value:"DEADLINE", label:"项目已经确认的正式截止日期" },
        { value:"TONE", label:"某篇旧宣传文案使用了“轻松”还是“简单”这个词" }
      ],
      correctValues:["PRICE","REFUND","DEADLINE"],
      explanation:"价格、政策和正式截止日期会直接影响业务结果，应该明确由哪个来源负责当前事实；普通措辞差异通常不需要成为正式事实源。",
      correctFeedback:"正确。优先为会影响交易、权益、状态或承诺的事实明确权威来源。",
      incorrectFeedback:"判断重点不是资料重要不重要，而是这个事实是否会变化、冲突，以及错误是否会影响真实业务决定。"
    }
  ],
  practice:{
    id:"t109_source_of_truth_rule",
    title:"给一个业务事实指定正式来源和冲突规则",
    goal:"为一个真实业务问题定义可参考资料、正式事实源与冲突规则，让 AI 不需要自己猜哪份资料才算正式。",
    instructions:[
      { key:"question", label:"业务问题", prompt:"写出你希望 AI 稳定回答的一个真实业务事实问题，例如当前价格、退款政策、产品状态或正式截止日期。" },
      { key:"sources", label:"可参考资料", prompt:"列出目前可能被 AI 使用的相关资料，包括说明文档、帮助内容、历史材料或当前系统记录。" },
      { key:"authority", label:"正式事实源", prompt:"明确哪一个来源对这个事实拥有最终权威，并说明什么状态下它才算当前有效。" },
      { key:"conflictRule", label:"冲突规则", prompt:"写清其他资料与正式事实源不一致时怎么办，以及 AI 明确不能自行做什么推断。" }
    ],
    hints:[
      "先挑一个会真实影响客户、交易、权益、项目状态或正式承诺的问题，不要从抽象术语开始。",
      "事实源必须具体到可执行，例如“当前会员价格配置”，而不是笼统写“以最新资料为准”。",
      "冲突规则要能回答：旧资料不同怎么办？AI 能不能自己折中、猜测或补出一个结论？"
    ],
    rubric:[
      { key:"question", label:"业务问题明确", maxScore:25, minScore:15, example:"客户询问“OPC 会员当前年费是多少？”" },
      { key:"sources", label:"参考资料范围清楚", maxScore:20, minScore:12, example:"帮助说明、销售培训稿、历史活动海报、当前会员价格配置。" },
      { key:"authority", label:"正式事实源可执行", maxScore:30, minScore:18, example:"当前会员价格配置是正式事实源，只有当前生效状态可以作为正式回答。" },
      { key:"conflictRule", label:"冲突规则明确", maxScore:25, minScore:15, example:"历史资料与当前价格配置冲突时，以当前配置为准，不自行折中或推断。" }
    ],
    passScore:60
  },
  hints:[
    "不要把练习做成“建立一个知识库系统”；本课只练习定义资料角色和权威来源。",
    "四个字段组合后应该是一条真实业务可以直接使用的知识规则。"
  ],
  referenceAnswer:"客户询问“OPC 会员当前年费是多少？”\n可参考资料包括官网帮助说明、销售培训稿、历史活动海报和当前会员价格配置。\n当前会员价格配置是正式事实源；只有已发布并处于当前生效状态的价格可以作为正式回答。\n如果历史活动、培训稿或其他说明与当前价格配置不一致，以当前价格配置为准；不要根据旧资料自行折中、推断或补出一个价格。",
  review:[
    "基于已经确认的正式事实整理、解释和回答业务问题，让辅助资料帮助补充背景｜不要在多个来源冲突时替业务自行决定哪一份才算正式事实。",
    "按照事实源和冲突规则保持价格、政策、状态等答案一致｜不要把旧资料、培训材料和当前正式配置当成同等权威。"
  ],
  selfAssessment:[
    "我能区分知识库（Knowledge Base）与事实源（Source of Truth）。",
    "我知道资料很多不等于 AI 会自动知道哪一份最新、最权威。",
    "面对一个真实业务事实，我能指定正式事实源，并写清资料冲突时的处理规则。"
  ]
} as const;
