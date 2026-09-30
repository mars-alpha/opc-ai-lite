import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../course-builder";

const accessPresentation = {
  showCourseContext:true,
  showLearningPathLink:true,
  inlineConversionCta:false
} as const;

export const track01T110Meta = {
  canonicalId:"T1-10",
  draftVersion:"1.0.2-track01-t110-terminology",
  skillId:"course-builder",
  skillVersion:"0.2.0",
  qualityProfile:"BEGINNER_QUALITY_V1",
  formalBrief:"git-history:TRACK01_T1_10_FORMAL_BRIEF_V1.md",
  grounding:"RESEARCH_PACKET",
  groundingSource:"git-history:TRACK01_T1_10_RESEARCH_PACKET_V1.md",
  caseThread:"ENTERPRISE_REFUND_EVIDENCE",
  inheritedCapability:"T1-09_SOURCE_OF_TRUTH_AWARENESS",
  artifactOutput:"MINIMUM_RETRIEVAL_TASK",
  nextReuse:"T1-11_API"
} as const;

export const track01T110Intro = {
  title:"资料已经可信了，为什么回答前还要先找证据？",
  situation:"公司已经整理好帮助中心、退款政策、合同模板、培训资料和产品更新说明。现在客服只想回答一个具体问题：企业版当前退款条件是什么。资料都已经准备好，不代表每次回答都应该把全部内容一起交给 AI。",
  approaches:[
    {
      label:"把全部资料一次性交给 AI",
      text:"不管当前问题是什么，都把整套资料塞进当前任务，希望 AI 自己在大量内容中找到重点。"
    },
    {
      label:"先找相关证据，再让 AI 回答",
      text:"先根据当前问题找到与“企业版 + 当前退款条件”真正相关的内容，再把命中的证据放进当前上下文，让 AI 基于证据回答。"
    }
  ],
  comparison:[],
  takeaway:"先记住一个动作：回答前先找到和当前问题真正相关的证据，再让 AI 基于这些证据回答。这个“找相关信息”的动作属于搜索（Search）和检索（Retrieval）；把检索到的证据加入当前回答，再生成答案，就是RAG的核心。",
  bottomDetails:[
    {
      title:"搜索（Search）",
      text:"根据当前问题，从大量外部资料中找到更相关的候选信息。"
    },
    {
      title:"RAG",
      text:"回答前先取回相关证据，把证据放进这一次回答可用的信息里，再让模型基于这些证据生成答案。"
    }
  ],
  comparisonPlacement:"BOTTOM"
} as const;

export const track01T110KnowledgeDepth = {
  example:[
    {
      title:"为什么不能只靠模型原有知识",
      text:"当前退款政策属于公司自己的业务资料，而且可能发生变化。模型原有知识不一定包含这份内部、最新的事实。"
    },
    {
      title:"为什么也不该把所有资料全塞进去",
      text:"当前问题只需要少量相关证据。先检索真正相关的政策片段，可以让模型看到更聚焦的上下文，也更容易判断证据是否缺失。"
    },
    {
      title:"为什么 RAG 也不是自动正确",
      text:"如果系统找到了无关资料，或漏掉关键政策，模型依然可能给出不完整或错误回答。先找证据，不等于任何检索结果都可信。"
    }
  ],
  review:[
    {
      title:"先问“当前问题需要什么证据”",
      text:"涉及大量资料、最新政策、内部知识或必须有依据的问题，先明确需要检索哪类证据，再让 AI 生成答案。"
    },
    {
      title:"检索到了，不等于已经可靠",
      text:"检索结果仍要符合上一课的事实源规则；如果关键证据没找到，就不能让 AI 用猜测补上。"
    }
  ]
} as const;

export const track01T110ReferenceFill = {
  question:"请回答：企业版当前退款条件是什么？",
  scope:"只从当前生效的退款政策、企业版帮助中心和已发布合同说明中检索；历史培训稿仅用于背景，不作为正式政策依据。",
  evidence:"必须先找到与“企业版、退款条件、当前生效”直接相关的政策条款；如果没有找到明确证据，请直接说明证据不足。",
  answerRule:"回答时只依据检索到的当前有效证据，简要说明适用条件；不要用模型记忆或旧资料补出未找到的退款规则。"
} as const;

export const track01T110Draft = {
  mode:"BUILD",
  grounding:{
    status:"REVIEWED",
    sourceKind:"APPROVED_KNOWLEDGE",
    sourceLabels:[
      "git-history:TRACK01_T1_10_RESEARCH_PACKET_V1.md",
      "git-history:TRACK01_T1_10_FORMAL_BRIEF_V1.md",
      "COURSE_BUILD_STANDARD_V1.md",
      "TRACK_CONTEXTS_V1.md"
    ],
    researchSummary:"本课建立搜索（Search）与检索增强生成（RAG）的 Beginner 直觉。最小链路是问题 → 检索相关证据 → 加入当前上下文 → 基于证据回答。RAG 用外部检索结果增强当前生成上下文，不等于重新训练、永久记忆或自动正确。检索质量会影响回答质量。Embedding、Vector Search、Vector Database、Chunk、Top-K、Reranking、API、Tool Use、Function Calling、MCP、Agent 延后。"
  },
  pedagogy:{
    audience:"BEGINNER",
    languagePolicy:"TERM_READABILITY",
    aiToolNeutral:true,
    conceptMasteryBeforePractice:true,
    qualityProfile:{
      id:"BEGINNER_QUALITY_V1",
      mainLearnerQuestion:"公司已经有一大堆可信资料了，AI 为什么不能直接全部读完再回答？RAG 到底多做了哪一步？",
      mainConcept:"当外部资料很多、会变化或属于内部知识时，先根据当前问题检索相关证据，再把证据加入当前上下文，让模型基于证据回答。",
      allowedCoreTerms:["Search","RAG"],
      deferredTerms:["Embedding","Vector Search","Vector Database","Chunk","Top-K","Reranking","Hybrid Search","Query Rewrite","Index","Tool Use","Function Calling","MCP","Agent"]
    },
    participation:{
      kind:"COPY_TO_AI",
      title:"把一个问题改成“先找证据，再回答”的任务",
      instruction:"选一个真实业务问题，写清应该从哪里找、必须先找到什么证据，以及证据不足时 AI 应该怎么处理。",
      prompt:"请先从我允许使用的资料范围中检索与当前问题直接相关的证据，再基于证据回答；如果没有找到关键证据，请明确说明证据不足，不要自行补全。",
      reflection:"检查你的任务是否真正回答了三个问题：要找什么、从哪里找、没找到关键证据怎么办。"
    },
    sixStepResponsibilities:COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec:{
    version:"1.0.2-track01-t110-terminology",
    courseSlug:"foundation-ai",
    lessonId:"t1-10-search-rag",
    title:"搜索（Search）与检索增强生成（RAG）：AI 怎样先找证据再回答",
    lessonType:"CONCEPT",
    learningObjectives:[
      "能用直观语言解释搜索（Search）、检索（Retrieval）与RAG的关系。",
      "能说清“问题 → 检索相关证据 → 加入当前上下文 → 基于证据回答”的最小链路。",
      "能判断什么时候应该先检索外部证据，而不是只依赖模型原有知识或一次性塞入大量资料。",
      "能理解检索错或漏掉关键证据时，RAG 仍然可能产生不可靠回答。",
      "能为一个真实问题写出最小检索任务。"
    ],
    knowledgePoints:[
      "搜索（Search）根据当前问题，从大量外部资料中找到更相关的候选信息。",
      "检索（Retrieval）把当前问题真正需要的相关信息取回来，准备交给模型使用。",
      "RAG先检索相关证据，再把证据加入当前上下文，让模型基于证据生成回答。",
      "RAG 的价值是回答当前问题时获得相关外部证据，不是把知识永久写进模型。",
      "检索质量会影响最终回答；检索错误、遗漏关键证据时，生成结果仍可能出错。"
    ],
    prerequisites:["T1-05","T1-09"],
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
      {
        id:"explain",
        kind:"EXPLAIN",
        title:"资料明明很多，为什么 AI 回答前还要先找证据",
        objective:"先看懂“回答前找相关证据”的动作，再认识搜索（Search）、检索（Retrieval）和RAG分别在这条链路里做什么。"
      },
      {
        id:"example",
        kind:"EXAMPLE",
        title:"同一套公司资料，为什么只取退款问题真正需要的部分",
        objective:"用企业版退款案例对比不查资料、全量塞资料和先检索相关证据之间的差异。"
      },
      {
        id:"check",
        kind:"CHECK",
        title:"什么时候应该先检索，再回答",
        objective:"检查学习者能否识别 RAG 的基本链路、常见误解和适用场景。"
      },
      {
        id:"practice",
        kind:"PRACTICE",
        title:"把一个真实问题改成“先找证据，再回答”的任务",
        objective:"写清当前问题、检索范围、必须找到的证据和回答规则，形成最小可执行检索任务。"
      },
      {
        id:"review",
        kind:"REVIEW",
        title:"以后别再把“有资料”当成“AI 已经拿到证据”",
        objective:"固定回答 AI 适合做什么、AI 不应该替你做什么，留下检索与可靠性边界。"
      },
      {
        id:"capability",
        kind:"CAPABILITY",
        title:"你已经会判断什么时候必须先找证据",
        objective:"确认学习者能在大量资料、最新政策、内部知识或必须有依据的问题中，先判断检索需要，再让 AI 回答。"
      }
    ],
    capabilityGain:[
      "能判断什么时候需要先检索外部证据，并能为真实问题写出最小检索任务。"
    ],
    nextLessonValue:"下一课继续解决：AI 产品怎样通过应用程序编程接口（API）与其他系统交换信息。",
    accessPresentation
  },
  content:{
    summary:"你会理解搜索（Search）和RAG的核心作用：不是让模型永久记住更多，而是在回答当前问题前，先找到真正相关的外部证据。",
    plainExplanation:"当资料很多时，AI 不需要每次都把全部资料一起读。系统可以先根据当前问题进行搜索（Search）和检索（Retrieval），找到真正相关的证据；再把这些证据放进这一次回答可用的信息里，让模型基于证据作答。这就是RAG的核心直觉。",
    whyItMatters:"公司内部知识、最新政策、产品状态和大量文档经常不在模型原有知识里。先检索相关证据，可以让回答建立在当前任务真正需要的信息上。但如果检索错了或漏掉关键证据，回答仍然可能不可靠。",
    points:[
      "搜索（Search）先从大量资料中找到与当前问题更相关的信息。",
      "检索（Retrieval）把真正需要的证据取回来，准备加入模型当前任务。",
      "RAG的最小链路是：问题 → 找到相关证据 → 放进当前回答可用的信息 → 基于证据回答。",
      "RAG 不是永久记忆，也不是把整个知识库一次性塞给模型。",
      "检索结果的质量会影响回答质量；没找到关键证据时，不能用猜测补上。"
    ],
    content:[
      "RAG 解决的是“回答这一问之前，应该先把哪些外部证据带回来”。它不是重新训练模型，也不会因为系统接入了资料就自动保证每个答案正确。",
      "上一课已经解决资料冲突时谁说了算。本课只继续解决：可信资料很多时，当前问题到底应该取回哪一部分。",
      "当问题涉及大量公司资料、最新政策、内部知识或必须有依据的结论时，先检查 AI 这一次回答是否真的拿到了相关证据。"
    ],
    example:{
      title:"客服回答企业版退款条件，为什么“资料都可信”还不够",
      situation:"公司已经有当前退款政策、帮助中心、合同模板、历史 FAQ、销售培训资料和产品更新说明。客户现在只问：企业版当前退款条件是什么？",
      before:"要么完全不查公司资料，只凭模型原有知识回答；要么把整套资料全部塞给 AI，希望它自己从大量内容中找到重点。",
      after:"先根据“企业版 + 当前退款条件”检索与问题直接相关的当前政策证据，只把命中的有效条款和必要上下文交给 AI；如果没有找到关键证据，就明确说明证据不足。",
      result:"AI 回答前先获得了与当前问题真正相关的证据；你也能看清它依据了什么，以及关键证据有没有缺失。"
    },
    mistakes:[
      "误区：RAG 就是让模型把知识库永久记住｜正确理解：RAG 是回答当前问题前临时检索相关证据并加入当前上下文。",
      "误区：只要用了 RAG，答案就一定正确｜正确理解：检索错、检索漏或资料本身不可靠，最终回答仍可能出错。",
      "误区：资料越多，最好一次全部交给模型｜正确理解：当前问题通常只需要其中一部分相关证据，先检索可以让上下文更聚焦。"
    ],
    related:[
      "当你准备让 AI 回答大量公司资料、最新政策、内部知识或必须有依据的问题时，先确认 AI 这一次回答是否真的拿到了相关证据。",
      "下一课会继续解决：AI 产品怎样通过应用程序编程接口（API）与其他系统交换信息。"
    ]
  },
  check:null,
  checkSequence:[
    {
      id:"t110_best_judgment",
      questionType:"SINGLE_CHOICE",
      masteryRole:"BEST_JUDGMENT",
      question:"公司有几十份已经整理好的资料，客服要回答“企业版当前退款条件是什么”。哪种流程最符合本课的 RAG 思路？",
      options:[
        { value:"A", label:"不查公司资料，直接让模型凭已有知识回答" },
        { value:"B", label:"先检索与企业版当前退款条件直接相关的证据，再让 AI 基于这些证据回答" },
        { value:"C", label:"把几十份资料全部一次性交给模型，资料越多越可靠" }
      ],
      correctValues:["B"],
      explanation:"RAG 的核心是回答前先检索与当前问题相关的外部证据，再让模型基于这些证据生成答案。",
      correctFeedback:"正确。关键不是“资料越多”，而是当前问题真正需要的证据有没有先被找出来并交给 AI。",
      incorrectFeedback:"回到 Step 1：RAG 多出的关键步骤是回答前先检索相关证据，再把证据交给模型。"
    },
    {
      id:"t110_misconception",
      questionType:"TRUE_FALSE",
      masteryRole:"MISCONCEPTION",
      question:"判断：RAG会把知识库永久写进模型，所以以后模型不再需要针对当前问题重新检索资料。",
      options:[
        { value:"TRUE", label:"对" },
        { value:"FALSE", label:"错" }
      ],
      correctValues:["FALSE"],
      explanation:"RAG 的核心是针对当前问题检索外部证据，并把证据用于这一次回答，不等于把知识永久写进模型。",
      correctFeedback:"正确。RAG 是“当前问题先找证据”，不是“永久记忆整个知识库”。",
      incorrectFeedback:"本课的最小链路是问题 → 找到相关证据 → 交给 AI → 基于证据回答；它不是模型永久记忆。"
    },
    {
      id:"t110_boundary",
      questionType:"MULTI_SELECT",
      masteryRole:"BOUNDARY_CONDITIONS",
      question:"下面哪些情况更需要在回答前先检索外部证据？（多选）",
      options:[
        { value:"LATEST_POLICY", label:"回答公司当前生效的退款政策" },
        { value:"INTERNAL_DOCS", label:"从大量内部产品文档中回答一个具体配置问题" },
        { value:"EVIDENCE", label:"回答必须给出公司资料依据的问题" },
        { value:"CREATIVE_NAME", label:"为一个虚构咖啡品牌想 10 个名字" }
      ],
      correctValues:["LATEST_POLICY","INTERNAL_DOCS","EVIDENCE"],
      explanation:"最新政策、内部资料和必须有依据的问题都需要外部证据；纯创意命名通常不依赖检索公司事实。",
      correctFeedback:"正确。判断重点是当前任务是否需要模型原有知识之外的具体、当前或可核对证据。",
      incorrectFeedback:"回到 Step 2：需要最新、内部或有依据的信息时，先找证据的价值最明显；纯创意任务通常不是这个问题。"
    }
  ],
  practice:{
    id:"t110_minimum_retrieval_task",
    title:"把一个问题改成“先找证据，再回答”的任务",
    goal:"为一个真实问题定义检索范围、必须找到的证据和回答规则，让 AI 在回答前先获得真正相关的信息。",
    instructions:[
      {
        key:"question",
        label:"当前问题",
        prompt:"写出一个需要 AI 回答的真实问题，优先选择最新政策、内部知识、大量资料或必须有依据的任务。"
      },
      {
        key:"scope",
        label:"检索范围",
        prompt:"写清允许从哪些资料范围中寻找证据，哪些资料只适合作为背景。"
      },
      {
        key:"evidence",
        label:"必须找到的证据",
        prompt:"明确回答前至少要找到什么类型的直接证据；找不到时不要继续假装有结论。"
      },
      {
        key:"answerRule",
        label:"回答规则",
        prompt:"写清回答必须依据什么，以及证据不足时 AI 应该怎么做。"
      }
    ],
    hints:[
      "不要写任何检索技术参数；先把业务问题说清楚。",
      "“检索范围”要具体到资料来源类型，不要只写“去知识库找”。",
      "“必须找到的证据”应该能帮助你判断 AI 到底有没有拿到回答这个问题所需的信息。",
      "证据不足时的规则必须明确，不能默认让 AI 用自己的记忆补全。"
    ],
    rubric:[
      {
        key:"question",
        label:"当前问题明确",
        maxScore:20,
        minScore:12,
        example:"请回答：企业版当前退款条件是什么？"
      },
      {
        key:"scope",
        label:"检索范围可执行",
        maxScore:25,
        minScore:15,
        example:"只从当前退款政策、企业版帮助中心和已发布合同说明中检索。"
      },
      {
        key:"evidence",
        label:"关键证据明确",
        maxScore:30,
        minScore:18,
        example:"必须先找到与企业版、退款条件、当前生效直接相关的政策条款。"
      },
      {
        key:"answerRule",
        label:"回答与证据边界明确",
        maxScore:25,
        minScore:15,
        example:"只依据检索到的当前有效证据回答；证据不足时明确说明，不自行补全。"
      }
    ],
    passScore:60
  },
  hints:[
    "本课练的是“先找什么证据，再回答”，不是建立完整 RAG 系统。",
    "四个字段组合后应该是一条自然、可直接使用的检索任务，而不是技术配置表。"
  ],
  referenceAnswer:"请回答：企业版当前退款条件是什么？\n只从当前生效的退款政策、企业版帮助中心和已发布合同说明中检索；历史培训稿仅用于背景，不作为正式政策依据。\n必须先找到与“企业版、退款条件、当前生效”直接相关的政策条款；如果没有找到明确证据，请直接说明证据不足。\n回答时只依据检索到的当前有效证据，简要说明适用条件；不要用模型记忆或旧资料补出未找到的退款规则。",
  review:[
    "从允许使用的资料中先找与当前问题真正相关的证据，再基于证据整理回答｜不要把“检索到了内容”直接当成“已经得到可靠事实”。",
    "在证据不足时明确指出缺口，并回到资料中继续寻找｜不要让 AI 用模型记忆、猜测或无关资料补上关键证据。"
  ],
  selfAssessment:[
    "我能解释搜索（Search）、检索（Retrieval）与RAG的基本关系。",
    "我能说清“问题 → 找到相关证据 → 交给 AI → 基于证据回答”的最小链路。",
    "我知道 RAG 不是永久记忆，也不会因为用了检索就自动保证答案正确。",
    "面对一个真实问题，我能写出检索范围、关键证据和证据不足时的回答规则。"
  ]
} as const;
