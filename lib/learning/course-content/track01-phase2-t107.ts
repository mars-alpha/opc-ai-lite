import { COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES } from "../course-builder";

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export const track01T107Meta = {
  canonicalId: "T1-07",
  draftVersion: "1.1.0-track01-t107-rebuild",
  skillId: "course-builder",
  skillVersion: "0.2.0",
  qualityProfile: "BEGINNER_QUALITY_V1",
  formalBrief: "git-history:TRACK01_T1_07_FORMAL_BRIEF_V1.md",
  grounding: "REVIEWED_KNOWLEDGE",
  caseThread: "GENERIC_OUTPUT_VARIATION_TASK",
  inheritedCapability: "T1-06_MODEL_PRODUCT_WORLDVIEW",
  artifactOutput: "OUTPUT_VARIATION_CONTROL_JUDGMENT",
  nextReuse: "T1-08_HISTORY_MEMORY"
} as const;

export const track01T107Intro = {
  title: "为什么同一个任务，AI 两次回答会不一样？",
  situation:
    "你把同一个任务连续交给 AI 两次。两次表达方式不完全一样，但意思看起来差不多。很多人第一次遇到这种情况，会怀疑是不是 AI 有一次答错了。",
  approaches: [
    {
      label: "看到不同，就判断有一次错了",
      text: "只要两次用词、句式或顺序不一样，就把其中一次当成错误，继续反复重新生成。"
    },
    {
      label: "先看关键内容有没有变",
      text: "先检查事实、数字、任务要求和必须保留的信息，再判断这次变化是不是问题。"
    }
  ],
  comparison: [],
  takeaway:
    "不一定。生成式 AI 会根据当前输入一步一步生成后续词元（Token）；每一步通常不只有一个可能方向，而是存在不同的概率（Probability）。因此同一个开放任务可以出现不同但都合理的表达。",
  bottomDetails: [
    {
      title: "先理解词元（Token）与概率（Probability）",
      text: "词元（Token）是模型逐步处理和生成内容的基本单位之一；概率（Probability）可以先理解为：下一步通常存在多个可能继续方向。"
    },
    {
      title: "再判断变化是否影响任务",
      text: "用词、句式或信息顺序不同不一定有问题；时间、数字、事实、范围或明确要求被改动、遗漏或新增，才需要处理。"
    }
  ],
  comparisonPlacement: "BOTTOM"
} as const;

export const track01T107KnowledgeDepth = {
  example: [
    {
      title: "为什么同一个任务可以有不同写法",
      text: "模型是在当前输入下逐步生成后续内容，不是读取一条唯一固定文本。只要关键事实和任务要求没变，不同措辞可以同时合理。"
    }
  ],
  review: [
    {
      title: "为什么先看关键内容",
      text: "判断输出变化时，先看负责人、时间、数字、事实和任务边界有没有改变，比比较每个字更有用。"
    },
    {
      title: "为什么相似回答仍不能代替核验",
      text: "多次生成可能重复同一个错误；事实是否正确仍要看外部证据。"
    }
  ]
} as const;

export const track01T107ReferenceFill = {
  goal:
    "请根据下面的信息，为第一次了解这项服务的普通用户写一段简短介绍：某小型服务团队提供预约、方案说明和售后答疑，服务时间为周一至周五 9:00–18:00，首次咨询免费。",
  constraint:
    "必须保留服务时间和首次咨询免费这两个事实；不要新增价格、效果承诺、客户数量或原始信息中没有的数据。",
  output:
    "控制在 100 字以内，语气自然、清楚，只输出成品，不解释过程。我会用完全相同的提示词运行两次，比较两次表达是否不同，同时检查关键事实是否保持一致。"
} as const;

export const track01T107Draft = {
  mode: "BUILD",
  grounding: {
    status: "REVIEWED",
    sourceKind: "APPROVED_KNOWLEDGE",
    sourceLabels: [
      "git-history:TRACK01_T1_07_FORMAL_BRIEF_V1.md",
      "COURSE_BUILD_STANDARD_V1.md",
      "TRACK_CONTEXTS_V1.md"
    ],
    researchSummary:
      "本课只建立 Token / Probability Generation 的 Beginner 机制直觉：生成式模型基于当前输入和上下文逐步产生后续 Token，每一步存在多个可能继续方向，因此同一任务可以出现不同但合理的表达。Context Window 只作为当前可见信息存在容量边界的 supporting intuition；Temperature、Top-p、Top-k、Seed、Sampling、Transformer、Attention、Memory、RAG 等不进入本课正文。"
  },
  pedagogy: {
    audience: "BEGINNER",
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    conceptMasteryBeforePractice: true,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion:
        "为什么我把差不多的问题问同一个 AI 两次，答案可能不完全一样？这种变化什么时候正常，什么时候需要处理？",
      mainConcept:
        "生成式 AI 会根据当前输入和上下文逐步生成后续内容；每一步存在多个可能继续方向，因此同一个任务可以出现不同但合理的表达。",
      allowedCoreTerms: ["Token", "Probability"],
      deferredTerms: [
        "Temperature",
        "Top-p",
        "Top-k",
        "Seed",
        "Sampling",
        "Transformer",
        "Attention",
        "Memory",
        "RAG",
        "Context Window",
        "logits",
        "softmax"
      ]
    },
    participation: {
      kind: "COPY_TO_AI",
      title: "用完全相同的提示词运行两次",
      instruction:
        "把任务、事实边界和输出要求写完整并检查后，复制到你常用的 AI。不要修改提示词，连续运行两次，再比较两次结果的表达变化和关键事实。",
      prompt:
        "请直接完成我提供的完整任务并返回结果。",
      reflection:
        "观察重点不是两次有没有逐字一致，而是哪些表达发生了变化、哪些关键事实始终保持稳定。"
    },
    sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
  },
  lessonSpec: {
    version: "1.1.0-track01-t107-rebuild",
    courseSlug: "foundation-ai",
    lessonId: "t1-07-token-probability",
    title: "词元（Token）与概率（Probability）生成：为什么同一个任务会得到不同答案",
    lessonType: "CONCEPT",
    learningObjectives: [
      "能用直观语言解释词元（Token）、逐步生成与概率（Probability）的关系。",
      "能解释为什么同一个生成任务可能出现不同但都合理的表达。",
      "能区分正常表达变化与关键事实、要求发生漂移。",
      "关键内容需要稳定时，能写出明确、可检查的约束。"
    ],
    knowledgePoints: [
      "词元（Token）是模型逐步处理和生成文本时使用的基本单位之一，初学阶段不需要掌握切分算法。",
      "模型不是读取一条唯一完整答案，而是在当前输入和上下文下逐步生成后续内容。",
      "概率（Probability）表示下一步通常不只有一个可能方向；模型会在多个可能继续方向中生成后续词元。",
      "因此同一个开放任务不保证逐字一致；真正需要稳定的是关键事实、任务要求和明确边界。"
    ],
    prerequisites: ["T1-06"],
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
        title: "为什么同一个任务会出现不同答案",
        objective:
          "建立词元（Token）、概率（Probability）与逐步生成的最小直觉，理解为什么同一任务不保证逐字一致。"
      },
      {
        id: "example",
        kind: "EXAMPLE",
        title: "两次写法不同，为什么都可能是对的",
        objective:
          "用同一个具体任务看清：表达可以变化，但关键事实和任务要求必须稳定。"
      },
      {
        id: "check",
        kind: "CHECK",
        title: "哪些变化可以接受，哪些必须处理",
        objective:
          "检查学习者能否区分正常表达变化与关键事实、明确要求发生漂移。"
      },
      {
        id: "practice",
        kind: "PRACTICE",
        title: "同一份提示词，运行两次看看",
        objective:
          "把一个真实任务写成完整可运行的提示词，用完全相同的内容运行两次，观察合理变化与必须稳定的事实边界。"
      },
      {
        id: "review",
        kind: "REVIEW",
        title: "看到答案变化时，留下两个判断",
        objective:
          "固定回答“AI适合做什么 / AI不应该替你做什么”，把输出变化判断沉淀成可复用边界。"
      },
      {
        id: "capability",
        kind: "CAPABILITY",
        title: "你已经会判断并管理一次输出变化",
        objective:
          "确认学习者能接受合理变化，并在关键内容不稳定时写出具体约束。"
      }
    ],
    capabilityGain: [
      "能解释同一个生成任务为什么可能出现不同答案，并通过明确任务边界管理不必要的输出波动。"
    ],
    nextLessonValue:
      "下一课继续理解当前对话、历史记录与长期记忆分别是什么，以及模型当前到底能看到哪些信息。",
    accessPresentation
  },
  content: {
    summary:
      "你会理解为什么同一个任务的两次 AI 回答可以不完全一样，并学会先检查关键内容，再决定是否需要收紧要求。",
    plainExplanation:
      "生成式 AI 不是先找到一条完整标准答案再复制给你。它会根据当前输入，一步一步生成后续内容；这些逐步处理和生成的基本单位之一叫词元（Token）。每一步通常不只有一个可能的后续方向，模型会根据概率（Probability）继续生成，所以同一个开放任务不一定每次逐字相同。",
    whyItMatters:
      "如果只因为文字不同就反复重来，你会把正常变化误当成错误；如果完全不检查变化，又可能漏掉负责人、时间、数字或事实被改掉。更实用的做法，是先看关键内容有没有变，再决定是否需要收紧要求。",
    points: [
      "AI 的回答是一步一步生成出来的，不是读取唯一固定答案。",
      "词元（Token）可以理解为模型逐步处理和生成文本时使用的基本单位之一。",
      "概率（Probability）在这里不是“答案正确率”，而是理解为下一步存在多个可能继续方向。",
      "同一个任务可以有不同但合理的表达；真正需要检查的是关键事实和明确要求有没有变化。"
    ],
    content: [
      "这节课不要求你计算概率（Probability），也不要求学习词元（Token）的切分算法。只要理解：回答是逐步生成的，每一步可能有多个继续方向，所以表达可以变化。",
      "判断两次答案时，不先比较每一个字，而是先看负责人、时间、数字、事实和明确要求有没有被改变。",
      "多次回答很相似也不等于事实已经核验。重要事实仍然需要外部证据。"
    ],
    example: {
      title: "同一份服务信息，两次结果不一样，要重来吗",
      situation:
        "你让 AI 根据同一份服务信息写一段给普通用户看的简短介绍。两次结果的用词、句式和信息顺序不同，但服务时间、首次咨询免费和原始服务内容都保持一致。",
      before:
        "只看到两次用词和句子顺序不同，就认为 AI 不稳定，继续反复重新生成。",
      after:
        "先检查服务时间、首次咨询免费、服务范围等关键事实和明确要求有没有变化。表达不同可以接受；关键内容漂移时，再补充更明确的边界。",
      result:
        "你会把“表达是否一样”和“关键内容是否稳定”分开判断，不再因为正常变化反复重来。"
    },
    mistakes: [
      "误区：两次回答不一样，说明至少一次一定错了｜正确理解：先看关键事实和任务要求有没有变化。",
      "误区：为了稳定结果，就要求 AI 每次逐字一样｜正确理解：真正需要稳定的是关键内容和任务边界。",
      "误区：连续几次都回答相似，就等于事实已经证实｜正确理解：生成一致性不能替代外部核验。"
    ],
    related: [
      "当你用完全相同或非常接近的任务重新生成后发现结果不一样，或者关键事实、数字和任务边界出现波动时。",
      "下一课会继续区分当前对话、历史记录和长期记忆。"
    ]
  },
  check: null,
  checkSequence: [
    {
      id: "t107_best_judgment",
      questionType: "SINGLE_CHOICE",
      masteryRole: "BEST_JUDGMENT",
      question:
        "同一份服务信息，两次生成的介绍措辞和顺序不同，但都保留服务时间、免费咨询等原始事实，也都符合面向普通用户的要求。最合理的判断是什么？",
      options: [
        {
          value: "A",
          label: "至少有一次回答一定是错误的，因为正确答案只能有一个版本"
        },
        {
          value: "B",
          label: "两次都可能合理，因为生成过程允许多个符合当前要求的表达"
        },
        {
          value: "C",
          label: "第二次回答说明模型已经重新训练，所以才改变了表达"
        }
      ],
      correctValues: ["B"],
      explanation:
        "生成式模型会在当前输入下逐步产生内容，同一个开放任务可以存在多个合理表达。是否合格要看是否满足任务和事实要求，而不是是否逐字相同。",
      correctFeedback:
        "正确。先看任务和事实是否满足，再判断变化是否有问题；不同表达本身不等于错误。",
      incorrectFeedback:
        "不要把“答案不同”直接等同于“答案错误”。开放生成任务可以有多个同时满足要求的表达。"
    },
    {
      id: "t107_misconception",
      questionType: "TRUE_FALSE",
      masteryRole: "MISCONCEPTION",
      question:
        "判断：如果同一个事实问题连续问三次都得到相似答案，就可以把这个事实当成已经核验。",
      options: [
        { value: "TRUE", label: "对" },
        { value: "FALSE", label: "错" }
      ],
      correctValues: ["FALSE"],
      explanation:
        "多次生成的相似结果仍来自模型生成，不是独立外部证据，因此不能代替事实核验。",
      correctFeedback:
        "正确。生成结果彼此一致，只能说明输出相似，不能证明外部事实一定正确。",
      incorrectFeedback:
        "再想想“证据来自哪里”：重复问同一个模型并没有新增独立事实来源。"
    },
    {
      id: "t107_boundary",
      questionType: "MULTI_SELECT",
      masteryRole: "BOUNDARY_CONDITIONS",
      question:
        "还是同一份服务介绍。下面哪些变化说明关键内容已经漂移，需要处理？（多选）",
      options: [
        { value: "WORDING", label: "把“提供售后答疑”换成“可提供后续答疑”，事实含义不变" },
        { value: "ORDER", label: "把服务时间从第二句调整到第一句，信息仍然完整" },
        { value: "TIME", label: "把原来的“周一至周五 9:00–18:00”改成了其他时间" },
        { value: "OMIT_FREE", label: "漏掉了原始信息里的“首次咨询免费”" }
      ],
      correctValues: ["TIME", "OMIT_FREE"],
      explanation:
        "措辞和顺序可以变化，但明确事实不能被改动或遗漏。判断输出变化时，先看关键内容是否仍然满足原始信息和任务要求。",
      correctFeedback:
        "正确。时间被改动、明确事实被遗漏，都属于关键内容漂移；自然措辞和顺序变化不一定有问题。",
      incorrectFeedback:
        "回到 Step 2 的判断：不要先比较每个字，先检查关键事实和明确要求有没有被改动或漏掉。"
    }
  ],
  practice: {
    id: "t107_output_variation_control",
    title: "同一份提示词，运行两次看看",
    goal:
      "把一份服务信息写成可以直接交给 AI 执行的完整任务，然后用完全相同的提示词运行两次，观察表达如何变化、关键事实是否保持稳定。",
    instructions: [
      {
        key: "goal",
        label: "任务和原始信息",
        prompt:
          "写清要 AI 完成什么，并把它完成任务必须依据的原始信息一起写进去。"
      },
      {
        key: "constraint",
        label: "必须保持的事实和边界",
        prompt:
          "写清哪些事实必须保留、哪些内容不能自行新增或改变。"
      },
      {
        key: "output",
        label: "输出和比较要求",
        prompt:
          "写清输出长度、表达方式和结果要求，并说明你会用完全相同的提示词运行两次进行比较。"
      }
    ],
    hints: [
      "任务必须包含 AI 真正需要依据的原始信息，不能只写“帮我介绍一下”。",
      "把会影响真实性的事实单独保护起来，例如时间、价格、数字、服务范围或明确承诺。",
      "输出要求要让你运行后能直接比较，而不是只写“更好一点”“更稳定”。"
    ],
    rubric: [
      {
        key: "goal",
        label: "任务与输入完整",
        maxScore: 35,
        minScore: 21,
        example:
          "请根据下面的信息，为第一次了解这项服务的普通用户写一段简短介绍，并提供完成任务需要依据的服务信息。"
      },
      {
        key: "constraint",
        label: "事实边界清楚",
        maxScore: 35,
        minScore: 21,
        example:
          "必须保留已提供的服务时间和免费咨询事实，不新增价格、效果承诺或没有提供的数据。"
      },
      {
        key: "output",
        label: "输出要求可执行",
        maxScore: 30,
        minScore: 18,
        example:
          "控制在 100 字以内，只输出成品；使用同一份提示词运行两次并比较表达变化和关键事实。"
      }
    ],
    passScore: 60
  },
  hints: [
    "检查三个问题：AI 知不知道要做什么？有没有足够原始信息？哪些事实和输出要求不能猜？",
    "三个字段组合后应该可以直接复制给 AI 运行，不需要再补一句解释。"
  ],
  referenceAnswer:
    "请根据下面的信息，为第一次了解这项服务的普通用户写一段简短介绍：某小型服务团队提供预约、方案说明和售后答疑，服务时间为周一至周五 9:00–18:00，首次咨询免费。\n必须保留服务时间和首次咨询免费这两个事实；不要新增价格、效果承诺、客户数量或原始信息中没有的数据。\n控制在 100 字以内，语气自然、清楚，只输出成品，不解释过程。我会用完全相同的提示词运行两次，比较两次表达是否不同，同时检查关键事实是否保持一致。",
  review: [
    "根据同一个开放任务生成不同但合理的表达候选，并按明确边界重新生成｜不要替你决定“表达不同就等于错误”；是否接受变化要由你根据关键事实和任务要求判断。",
    "在你给出清楚事实边界后生成可比较结果，帮助你观察哪些内容稳定、哪些内容漂移｜不要替你把多次相似回答当成事实证据，重要事实仍需要独立核验。"
  ],
  selfAssessment: [
    "我能用词元（Token）、概率（Probability）和逐步生成解释为什么同一个任务会出现不同表达。",
    "我能区分正常表达变化与关键事实、明确要求发生漂移。",
    "关键内容不稳定时，我能写出一条可直接检查的约束。"
  ]
} as const;
