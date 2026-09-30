import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../course-builder";

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export const track01T108Meta = {
  canonicalId: "T1-08",
  draftVersion: "1.0.0-track01-t108-build",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "git-history:TRACK01_T1_08_FORMAL_BRIEF_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "NEW_CHAT_CONTINUATION_TASK",
  inheritedCapability: "T1-07_CURRENT_INPUT_GENERATION_WORLDVIEW",
  artifactOutput: "NEW_CHAT_HANDOFF_PROMPT",
  nextReuse: "T1-09_KNOWLEDGE_SOURCE"
} as const;

export const track01T108Intro = {
  title: "为什么换一个新对话，AI 可能就接不上了？",
  situation:
    "你在一个对话里和 AI 来回讨论了很久，已经确定好格式和要求。过一会儿你新开一个对话，只说“按刚才的继续”，AI 却没有按你预期的方式做。",
  approaches: [
    {
      label: "认为 AI 应该自动记得全部内容",
      text: "默认旧对话里的格式、数字、临时要求和项目状态都会一直被 AI 完整保留，新对话里不再重复说明。"
    },
    {
      label: "先判断这次回答实际拿到了什么",
      text: "重要任务开始前，把会影响结果的旧信息重新明确带入；长期偏好可以利用记忆，但不把精确任务细节只交给“记得”。"
    }
  ],
  comparison: [],
  takeaway:
    "对话历史（Conversation History）和长期记忆（Memory）不是一回事。当前回答只能利用这一次实际获得的信息；只要结果依赖某个旧细节，就应该把关键内容重新明确提供。",
  bottomDetails: [
    {
      title: "对话历史（Conversation History）",
      text: "可以先理解为当前对话里前面发生过的消息。AI 产品通常会把相关历史信息带给当前回答，所以同一个对话能自然接着做。"
    },
    {
      title: "长期记忆（Memory）",
      text: "可以先理解为产品保存并在以后可能再次提供的较稳定信息，例如长期偏好。它不代表所有对话都会被永久、完整、逐字记住。"
    }
  ],
  comparisonPlacement: "BOTTOM"
} as const;

export const track01T108KnowledgeDepth = {
  example: [
    {
      title: "为什么“按刚才的继续”有时会失效",
      text: "这句话把真正需要的信息留在了旧对话里。只要新对话没有获得那些具体要求，AI 就只能猜“刚才”指什么。"
    },
    {
      title: "什么信息值得重新带入",
      text: "精确格式、当前材料、临时数字、截止时间和项目状态，只要会改变本次结果，就应该明确提供。"
    }
  ],
  review: [
    {
      title: "把记忆当便利，不当任务底稿",
      text: "长期记忆可以减少重复说明稳定偏好，但重要任务仍应让关键输入在当前任务里可见、可检查。"
    },
    {
      title: "区分稳定偏好与临时任务信息",
      text: "“先结论后细节”可能是稳定偏好；“本周四 18:00 前交付、使用四段模板”属于当前任务信息，不适合只靠记忆。"
    }
  ]
} as const;

export const track01T108ReferenceFill = {
  task:
    "请根据下面的本周记录整理一份周报：已完成客户资料整理和两次需求沟通；当前问题是数据表还有两列待确认；下周计划完成数据确认并输出第一版方案。",
  carryover:
    "沿用已经确定的四段结构：本周完成、当前问题、下周计划、需要协助。每一段最多 3 点；没有信息的“需要协助”写“暂无”。",
  preference:
    "表达保持先结论后细节、简洁直接。只使用我提供的信息；不确定内容标记“待确认”，不要自行补充事实。"
} as const;

export const track01T108Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "git-history:TRACK01_T1_08_FORMAL_BRIEF_V1.md",
      "COURSE_BUILD_STANDARD_V1.md",
      "TRACK_CONTEXTS_V1.md"
    ],
    researchSummary:
      "本课只建立对话历史（Conversation History）与长期记忆（Memory）的 Beginner 直觉。核心是：当前回答只能基于产品实际提供给模型的信息；同一对话的历史记录与跨对话长期记忆属于不同机制；长期记忆不等于永久、完整保存全部对话。结果依赖精确旧信息时，关键内容必须重新明确带入。RAG、Knowledge Base、Source of Truth、Search、Vector Database、Embedding、Retrieval 和 Context Window 机制延后。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion:
        "为什么同一个对话里 AI 好像记得前面说过的话，换一个新对话后却可能接不上？有长期记忆后是不是就不用再提供以前的信息？",
      mainConcept:
        "对话历史和长期记忆是两种不同的信息来源；当前回答只能利用产品这一次实际提供的信息，因此关键任务信息不能只依赖“AI 应该记得”。",
      allowedCoreTerms: ["Conversation History", "Memory"],
      deferredTerms: [
        "RAG",
        "Knowledge Base",
        "Source of Truth",
        "Search",
        "Vector Database",
        "Embedding",
        "Retrieval",
        "Context Window"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "把“按刚才的继续”改成新对话也能执行",
      instruction:
        "选择一个你原本会说“按之前的继续”的任务，把当前材料、必须继承的旧要求和稳定偏好重新写完整，再复制到一个新对话里测试。",
      prompt:
        "请直接根据我提供的完整信息完成任务，不要假设你能读取其他对话里的内容。",
      reflection:
        "观察新对话是否不需要你补充“刚才说过什么”就能直接完成任务；如果还需要追问，说明关键上下文还没有带齐。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.0.0-track01-t108-build",
    courseSlug: "foundation-ai",
    lessonId: "t1-08-history-memory",
    title: "对话历史（Conversation History）与长期记忆（Memory）：AI 到底记得什么",
    lessonType: "CONCEPT",
    learningObjectives: [
      "能用直观语言区分对话历史（Conversation History）与长期记忆（Memory）。",
      "能解释为什么同一个对话通常容易接着做，而换一个新对话后可能缺少旧信息。",
      "能判断哪些任务信息不能只依赖 AI 的记忆，必须重新明确提供。",
      "能把一个依赖旧对话的请求改写成在新对话里也能直接执行的完整任务。"
    ],
    knowledgePoints: [
      "对话历史（Conversation History）是当前对话中之前发生的消息记录；产品可以把相关历史信息提供给当前回答。",
      "长期记忆（Memory）是部分 AI 产品保存并在以后可能再次提供的较稳定信息，不等于永久、完整、逐字保存全部对话。",
      "当前回答能使用什么，取决于产品这一次实际提供了什么信息，而不是用户主观认为 AI“应该记得什么”。",
      "精确格式、当前材料、临时数字、截止时间和项目状态只要会影响结果，就应该在重要任务中重新明确带入。"
    ],
    prerequisites: ["T1-07"],
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
      {
        id: "explain",
        kind: "EXPLAIN",
        title: "为什么换一个新对话，AI 可能就接不上了",
        objective:
          "建立对话历史（Conversation History）与长期记忆（Memory）的最小直觉，理解当前回答只能使用实际获得的信息。"
      },
      {
        id: "example",
        kind: "EXAMPLE",
        title: "一句“按刚才的继续”，到底缺了什么",
        objective:
          "用继续整理周报的真实任务看清：旧对话里的关键要求如果没有重新带入，新对话就可能无法准确继续。"
      },
      {
        id: "check",
        kind: "CHECK",
        title: "哪些信息可以利用记忆，哪些必须重新说明",
        objective:
          "检查学习者能否区分对话历史、长期记忆和本次任务必须明确带入的信息。"
      },
      {
        id: "practice",
        kind: "PRACTICE",
        title: "把旧对话任务变成新对话也能执行",
        objective:
          "把当前任务、需要继承的旧要求和稳定偏好写成一份自包含任务，并在新对话中实际运行。"
      },
      {
        id: "review",
        kind: "REVIEW",
        title: "以后别再只说“你应该记得”",
        objective:
          "固定回答“AI适合做什么 / AI不应该替你做什么”，留下可复用的信息带入边界。"
      },
      {
        id: "capability",
        kind: "CAPABILITY",
        title: "你已经会判断什么时候必须把旧信息带回来",
        objective:
          "确认学习者能在换对话、隔了一段时间或重要任务开始前，主动补齐会影响结果的旧信息。"
      }
    ],
    capabilityGain: [
      "能区分对话历史与长期记忆，并把依赖旧对话的重要任务改写成当前对话可直接执行的完整请求。"
    ],
    nextLessonValue:
      "下一课继续解决另一个常见问题：当 AI 需要依据公司的资料、规则或业务事实回答时，哪些内容才应该成为正式知识来源。",
    accessPresentation
  },
  content: {
    summary:
      "你会分清当前对话里的历史记录和跨对话的长期记忆，并学会在重要任务中主动把真正需要的旧信息重新带回来。",
    plainExplanation:
      "AI 的当前回答只能利用这一次实际获得的信息。同一个对话里，产品通常会把前面的相关消息作为对话历史（Conversation History）提供给当前回答，所以它看起来能“接着聊”。长期记忆（Memory）则是另一种机制：部分产品会保存某些较稳定的信息，并在以后的对话中再次提供，但这不等于所有旧对话都会被永久、完整记住。",
    whyItMatters:
      "如果你把精确格式、临时数字、截止时间或项目状态都交给“AI 应该记得”，换对话、隔一段时间或产品没有带回相关信息时，结果就容易偏掉。重要任务最稳妥的做法，是让会影响结果的关键信息在当前任务里重新变得明确。",
    points: [
      "对话历史（Conversation History）主要帮助当前这个对话延续前面的内容。",
      "长期记忆（Memory）更适合保存某些较稳定的信息或偏好，但具体能力取决于产品。",
      "长期记忆不等于永久、完整、逐字记住所有聊天内容。",
      "只要某个旧信息会影响本次结果，就不要只靠“记得”，而要主动重新提供。"
    ],
    content: [
      "你在聊天界面里能看到旧消息，不代表每一次回答都必然拿到了全部旧消息；真正决定当前回答的是这一次实际被提供的信息。",
      "稳定偏好和具体任务信息要分开看。例如“先结论后细节”比较像长期偏好；“本周四 18:00 前交付、必须使用四段模板”属于当前任务细节。",
      "本课不要求理解记忆功能背后的存储和检索实现。先学会一个操作原则：重要信息要在需要它的任务里可见、可检查。"
    ],
    example: {
      title: "换一个新对话继续写周报，为什么格式突然变了",
      situation:
        "你在旧对话里已经确定：周报分成“本周完成、当前问题、下周计划、需要协助”四段，每段最多 3 点，表达先结论后细节。新的一周你打开新对话，只输入“按刚才的格式继续整理这周周报”。",
      before:
        "只说“按刚才的格式继续”，默认 AI 一定能从其他对话找回四段结构、数量限制和表达偏好。",
      after:
        "在新对话里重新提供本周材料，并明确写出四段结构、每段最多 3 点和“先结论后细节”的要求；即使产品存在长期记忆，也不让关键任务要求只依赖记忆。",
      result:
        "新对话已经拥有完成任务所需的信息，不需要猜“刚才的格式”是什么，也更容易检查结果有没有漏掉关键要求。"
    },
    mistakes: [
      "误区：聊天记录还在界面里，AI 就一定能永久读取全部旧消息｜正确理解：当前回答只能使用产品这一次实际提供的信息。",
      "误区：开启长期记忆后，所有项目细节都不需要再说明｜正确理解：长期记忆不等于完整项目记录，重要任务细节仍应明确带入。",
      "误区：只要 AI 曾经知道过一个数字，以后都可以直接引用｜正确理解：临时数字、状态和截止时间会变化，使用前应重新提供或确认。"
    ],
    related: [
      "当你准备说“按刚才的继续”“你应该记得”“还是用之前那个格式”，但这次结果又依赖旧对话里的精确要求、数字、材料或项目状态时。",
      "下一课会继续区分长期记忆和正式业务知识来源。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t108_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question:
        "你新开一个对话，要继续整理上周已经确定格式的周报，而且格式必须准确。最可靠的做法是什么？",
      options: [
        { value: "A", label: "只写“按上周的格式继续”，因为 AI 应该能自动找回其他对话里的全部要求" },
        { value: "B", label: "把本周材料和必须沿用的格式要求重新写清楚，再让 AI 继续" },
        { value: "C", label: "连续问几次“你记得吗”，直到 AI 回答记得再开始" }
      ],
      correctValues: ["B"],
      explanation:
        "任务依赖精确旧信息时，最可靠的做法是让这些信息在当前任务里重新变得明确，而不是假设新对话一定获得了旧对话内容。",
      correctFeedback:
        "正确。关键任务信息重新带入后，不管产品有没有长期记忆，这次任务本身都有足够信息执行。",
      incorrectFeedback:
        "回到 Step 1 的核心判断：当前回答只能使用这一次实际获得的信息。精确要求如果会影响结果，就应重新提供。"
    },
    {
      id: "t108_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question:
        "判断：只要一个 AI 产品开启了长期记忆（Memory），它就会永久、完整、逐字记住你以后所有对话，因此重要任务不用再重复关键要求。",
      options: [
        { value: "TRUE", label: "对" },
        { value: "FALSE", label: "错" }
      ],
      correctValues: ["FALSE"],
      explanation:
        "长期记忆通常只保存或再次提供部分信息，具体行为取决于产品；它不等于所有对话的永久完整副本。",
      correctFeedback:
        "正确。记忆可以减少部分重复说明，但不能替代重要任务里明确、可检查的关键输入。",
      incorrectFeedback:
        "长期记忆和“永久完整保存全部对话”不是同一个概念。重要任务仍要把关键内容明确写出来。"
    },
    {
      id: "t108_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question:
        "你准备在一个新对话里继续完成周报。下面哪些信息如果会影响结果，就不应该只靠“AI 应该记得”，而应该重新明确带入？（多选）",
      options: [
        { value: "FORMAT", label: "上次确定的四段周报结构和“每段最多 3 点”的要求" },
        { value: "MATERIAL", label: "这一次周报要依据的本周完成事项和当前问题" },
        { value: "WORDING", label: "上一次回答里 AI 偶然使用过的某一个同义词" },
        { value: "DEADLINE", label: "这次任务临时确定的截止时间和交付状态" }
      ],
      correctValues: ["FORMAT", "MATERIAL", "DEADLINE"],
      explanation:
        "精确格式、本次材料和临时截止信息都会直接改变任务结果，应该在当前任务中明确提供；偶然措辞并不是完成任务所必需的关键输入。",
      correctFeedback:
        "正确。先找出真正会改变结果的旧信息，再把它们重新带入当前任务。",
      incorrectFeedback:
        "判断标准不是“以前出现过没有”，而是“缺少它会不会改变这次结果”。格式、材料和临时状态都属于关键输入。"
    }
  ],
  practice: {
    id: "t108_new_chat_handoff",
    title: "把旧对话任务变成新对话也能执行",
    goal:
      "把一个原本依赖“按之前的继续”的任务改写成完整请求，让它放进一个新对话后也能直接执行。",
    instructions: [
      {
        key: "task",
        label: "当前任务与本次材料",
        prompt:
          "写清这一次要 AI 完成什么，并提供这次任务真正要处理的材料或事实。"
      },
      {
        key: "carryover",
        label: "必须从旧对话带入的要求",
        prompt:
          "把会影响结果的旧格式、约束、数字、项目状态或其他关键决定重新写出来。"
      },
      {
        key: "preference",
        label: "稳定偏好与执行边界",
        prompt:
          "写清需要保持的稳定表达偏好，以及本次不能猜、不能自行补充的边界。"
      }
    ],
    hints: [
      "先删掉“按刚才的”“和之前一样”“你应该记得”这类只有旧对话才能理解的指代。",
      "问自己：如果对方完全看不到旧对话，还缺哪条信息才做得对？把它补回来。",
      "稳定偏好可以写进当前任务，但精确格式、材料、数字和临时状态不要只依赖长期记忆。"
    ],
    rubric: [
      {
        key: "task",
        label: "当前任务自包含",
        maxScore: 35,
        minScore: 21,
        example:
          "明确写出本次要整理周报，并提供本周已完成事项、当前问题和下周计划。"
      },
      {
        key: "carryover",
        label: "旧要求带入完整",
        maxScore: 35,
        minScore: 21,
        example:
          "明确写出四段结构、每段最多 3 点等旧对话中会影响结果的要求。"
      },
      {
        key: "preference",
        label: "偏好与边界清楚",
        maxScore: 30,
        minScore: 18,
        example:
          "写清先结论后细节，只使用提供的信息，不确定内容标记待确认。"
      }
    ],
    passScore: 60
  },
  hints: [
    "不要把“AI 记不记得”当成练习目标；目标是让当前任务本身拥有足够信息。",
    "三个字段组合后应该是一份可以直接放进新对话运行的完整任务。"
  ],
  referenceAnswer:
    "请根据下面的本周记录整理一份周报：已完成客户资料整理和两次需求沟通；当前问题是数据表还有两列待确认；下周计划完成数据确认并输出第一版方案。\n沿用已经确定的四段结构：本周完成、当前问题、下周计划、需要协助。每一段最多 3 点；没有信息的“需要协助”写“暂无”。\n表达保持先结论后细节、简洁直接。只使用我提供的信息；不确定内容标记“待确认”，不要自行补充事实。",
  review: [
    "利用当前对话里已经提供的相关信息继续任务，并在产品支持时利用长期记忆减少重复说明稳定偏好｜不要替你猜旧对话里没有重新出现的精确格式、数字、临时状态或项目决定。",
    "在你重新提供关键上下文后继续整理、改写和执行任务，让新对话也能保持连续性｜不要替你把“可能记得”当成可靠的项目记录；重要输入是否完整仍需要你确认。"
  ],
  selfAssessment: [
    "我能区分对话历史（Conversation History）与长期记忆（Memory）。",
    "我知道长期记忆不等于永久、完整记住所有对话。",
    "当任务依赖旧信息时，我能判断哪些内容必须重新明确带入，并写成新对话可直接执行的任务。"
  ]
} as const;
