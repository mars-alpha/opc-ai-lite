import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  type CourseBuilderBuildDraft
} from "../../lib/learning/course-builder";

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export type LessonConfig = {
  id: string;
  canonicalId: "T2-01" | "T2-02" | "T2-03" | "T2-04" | "T2-05" | "T2-06" | "T2-07" | "T2-08" | "T2-09" | "T2-10" | "T2-11" | "T2-12" | "T2-13" | "T2-14" | "T2-15";
  formalBriefSource?: string;
  title: string;
  prerequisites: string[];
  learningRecommendation: string;
  stepCopy: {
    explainTitle: string;
    exampleTitle: string;
    checkTitle: string;
    practiceTitle: string;
    reviewTitle: string;
    capabilityTitle: string;
    explainGuide: string;
    exampleGuide: string;
    checkGuide: string;
    practiceGuide: string;
    reviewGuide: string;
    capabilityGuide: string;
  };
  navigation: {
    explain: string;
    example: string;
    check: string;
    practice: string;
    review: string;
    capability: string;
  };
  mainQuestion: string;
  mainConcept: string;
  summary: string;
  explanation: string;
  why: string;
  points: string[];
  body: string[];
  example: {
    title: string;
    situation: string;
    before: string;
    after: string;
    result: string;
  };
  mistakes: string[];
  related: string[];
  practice: {
    title: string;
    goal: string;
    fields: Array<{ key: string; label: string; prompt: string; example: string }>;
    hints: string[];
    prompt: string;
    reflection: string;
  };
  checks: {
    best: { question: string; options: [string, string, string]; answer: "A" | "B" | "C"; explanation: string };
    misconception: { question: string; answer: boolean; explanation: string };
    boundary: {
      question: string;
      options: [string, string, string, string];
      answers: Array<"A" | "B" | "C" | "D">;
      explanation: string;
    };
  };
  review: string[];
  self: string[];
  trigger: string;
  capability: string;
  next: string;
};

export function makeDraft(config: LessonConfig): CourseBuilderBuildDraft {
  const referenceValues = config.practice.fields.map((field) => field.example);
  const practice = {
    id: config.id.replace(/-/g, "_") + "_practice",
    title: config.practice.title,
    goal: config.practice.goal,
    instructions: config.practice.fields.map(({ key, label, prompt }) => ({ key, label, prompt })),
    hints: config.practice.hints,
    rubric: config.practice.fields.map((field, index) => ({
      key: field.key,
      label: field.label + "是否清楚",
      maxScore: index === config.practice.fields.length - 1 ? 30 : 25,
      minScore: Math.round((index === config.practice.fields.length - 1 ? 30 : 25) * 0.4),
      example: field.example
    })),
    passScore: 60
  };

  return {
    mode: "BUILD",
    grounding: {
      status: "REVIEWED",
      sourceKind: "APPROVED_KNOWLEDGE",
      sourceLabels: [
        "TRACK02_CATALOG_CONTEXT_V1.md",
        "TRACK02_SIX_STEP_AUDIT_V1.md",
        config.formalBriefSource ?? "TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md",
        "FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
        "DEFERRED_KNOWLEDGE_LEDGER_V1.md",
        "LESSON_OUTPUT_CONTRACT_V1.md"
      ],
      researchSummary:
        config.summary +
        " 本课只使用已批准课程知识与课程内样例，不假设已经联网，也不把 Track 01 已教概念重新当成主知识。"
    },
    pedagogy: {
      audience: "BEGINNER",
      languagePolicy: "TERM_READABILITY",
      aiToolNeutral: true,
      conceptMasteryBeforePractice: true,
      qualityProfile: {
        id: "BEGINNER_QUALITY_V1",
        mainLearnerQuestion: config.mainQuestion,
        mainConcept: config.mainConcept,
        allowedCoreTerms: [],
        deferredTerms: []
      },
      participation: {
        kind: "COPY_TO_AI",
        title: config.practice.title,
        instruction: config.practice.goal,
        prompt: config.practice.prompt,
        reflection: config.practice.reflection
      },
      sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
    },
    lessonSpec: {
      version: "1.0.0-track02-" + config.canonicalId.toLowerCase().replace("-", ""),
      courseSlug: "ai-work",
      lessonId: config.id,
      title: config.title,
      lessonType: "APPLICATION",
      learningObjectives: [
        config.mainConcept,
        "能在真实工作里判断什么时候应该使用本课方法。",
        "能完成本课动手实操，并留下可以检查和继续复用的结果。"
      ],
      knowledgePoints: config.points,
      prerequisites: config.prerequisites,
      learningRecommendation: config.learningRecommendation,
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
        { id: "explain", kind: "EXPLAIN", title: config.stepCopy.explainTitle, objective: config.stepCopy.explainGuide, navigationDescription: config.navigation.explain },
        { id: "example", kind: "EXAMPLE", title: config.stepCopy.exampleTitle, objective: config.stepCopy.exampleGuide, navigationDescription: config.navigation.example },
        { id: "check", kind: "CHECK", title: config.stepCopy.checkTitle, objective: config.stepCopy.checkGuide, navigationDescription: config.navigation.check },
        { id: "practice", kind: "PRACTICE", title: config.stepCopy.practiceTitle, objective: config.stepCopy.practiceGuide, navigationDescription: config.navigation.practice },
        { id: "review", kind: "REVIEW", title: config.stepCopy.reviewTitle, objective: config.stepCopy.reviewGuide, navigationDescription: config.navigation.review },
        { id: "capability", kind: "CAPABILITY", title: config.stepCopy.capabilityTitle, objective: config.stepCopy.capabilityGuide, navigationDescription: config.navigation.capability }
      ],
      capabilityGain: [config.capability],
      nextLessonValue: config.next,
      accessPresentation
    },
    content: {
      summary: config.summary,
      plainExplanation: config.explanation,
      whyItMatters: config.why,
      points: config.points,
      content: config.body,
      example: config.example,
      mistakes: config.mistakes,
      related: config.related
    },
    check: null,
    checkSequence: [
      {
        id: config.id + "_best",
        questionType: "SINGLE_CHOICE",
        masteryRole: "BEST_JUDGMENT",
        question: config.checks.best.question,
        options: [
          { value: "A", label: config.checks.best.options[0] },
          { value: "B", label: config.checks.best.options[1] },
          { value: "C", label: config.checks.best.options[2] }
        ],
        correctValues: [config.checks.best.answer],
        explanation: config.checks.best.explanation,
        correctFeedback: "正确。你抓住了本课真正要解决的工作问题。",
        incorrectFeedback: "再看一次前两步：先判断当前工作到底缺的是哪一层信息，而不是先追求更多内容。"
      },
      {
        id: config.id + "_misconception",
        questionType: "TRUE_FALSE",
        masteryRole: "MISCONCEPTION",
        question: config.checks.misconception.question,
        options: [
          { value: "TRUE", label: "对" },
          { value: "FALSE", label: "错" }
        ],
        correctValues: [config.checks.misconception.answer ? "TRUE" : "FALSE"],
        explanation: config.checks.misconception.explanation,
        correctFeedback: "正确。你没有把本课方法理解成万能规则。",
        incorrectFeedback: "重新判断：本课是在减少错误判断，不是在替你自动决定真实业务目标或事实。"
      },
      {
        id: config.id + "_boundary",
        questionType: "MULTI_SELECT",
        masteryRole: "BOUNDARY_CONDITIONS",
        question: config.checks.boundary.question,
        options: [
          { value: "A", label: config.checks.boundary.options[0] },
          { value: "B", label: config.checks.boundary.options[1] },
          { value: "C", label: config.checks.boundary.options[2] },
          { value: "D", label: config.checks.boundary.options[3] }
        ],
        correctValues: config.checks.boundary.answers,
        explanation: config.checks.boundary.explanation,
        correctFeedback: "正确。你已经能把这项方法放回真实工作边界里使用。",
        incorrectFeedback: "重新检查每个选项：哪些信息真的足够支撑当前判断，哪些还需要补充或保留不确定。"
      }
    ],
    practice,
    hints: config.practice.hints,
    referenceAnswer: referenceValues.join("\n"),
    review: config.review,
    selfAssessment: config.self
  };
}

export const track02T201Draft = makeDraft({
  id: "t2-01-research-question-scope",
  canonicalId: "T2-01",
  title: "问题太大？先把它变成真正能查清楚的问题",
  prerequisites: ["T1-02", "T1-03", "T1-05"],
  learningRecommendation: "本课把大主题变成可研究的问题；先说清要支持的决定、对象和范围，再让 AI 查资料。",
  stepCopy: {
    explainTitle: "为什么资料很多，仍回答不了问题？",
    exampleTitle: "把大主题改成可回答的问题",
    checkTitle: "研究问题是否已经清楚？",
    practiceTitle: "定义一份可执行的研究任务",
    reviewTitle: "研究范围该怎样确定？",
    capabilityTitle: "你能独立定义研究任务了吗？",
    explainGuide: "先看清模糊主题为什么无法支持决定，再确定研究必须回答什么。",
    exampleGuide: "对照改写前后的任务，看目的、对象、范围和证据要求怎样收拢资料。",
    checkGuide: "判断一个问题能否开始研究，还是仍缺目的、范围或证据要求。",
    practiceGuide: "写出自己的研究目的、范围和核心问题，再检查 AI 能否照此执行。",
    reviewGuide: "用真实目的决定研究边界，避免范围太大或为了具体而缩错对象。",
    capabilityGuide: "确认别人拿到你的研究任务后，也知道该查什么、怎样核验。"
  },
  navigation: {
    explain: "看问题为何太大\n找到研究目的",
    example: "对比改写前后\n收窄对象范围",
    check: "判断问题能否查\n补齐证据要求",
    practice: "定义研究任务\n让 AI 能执行",
    review: "校准目的与范围\n防止问题跑偏",
    capability: "自查任务是否清楚\n让别人也能执行"
  },
  mainQuestion: "为什么让 AI“全面研究一下”经常得到很多资料，却还是不能帮助你做决定？",
  mainConcept: "开始查资料前，先把研究目的、对象、范围、时间和要回答的问题说清楚，让证据有明确的寻找边界。",
  summary: "你会把一个模糊的工作主题整理成真正可以查、可以回答、可以判断是否完成的研究任务。",
  explanation:
    "“帮我研究这个行业”只是一个主题，不是一个已经定义好的研究问题。AI 不知道你为什么查、查谁、查哪个地区、看哪个时间段，也不知道最后要支持什么决定，于是只能自己猜。更稳妥的做法是先确定研究目的，再补齐对象、范围、时间、核心问题和证据要求。",
  why:
    "范围先说清，后面的搜索、来源判断和多资料比较才有共同标准。否则资料越多，反而越容易把不相关的信息混在一起。",
  points: [
    "先说为什么要查：这个研究最后要帮助你做什么工作判断。",
    "明确查谁或查什么，并限定必要的地区、场景、类别或时间范围。",
    "把大主题拆成少量真正需要回答的问题，不追求一次查完整个世界。",
    "提前说明关键事实、数字和近期变化需要来源与日期。",
    "问题范围必须服务真实目的，不能为了看起来具体而随意缩小。"
  ],
  body: [
    "一个好的研究任务，不是把提示写得很长，而是让别人拿到以后也知道：要查什么、查到什么程度、什么信息才算有用。",
    "如果 AI 给出的答案很泛，第一反应不应该是换模型，而应先检查：是不是研究目的、对象、范围或时间仍然没有说清楚。"
  ],
  example: {
    title: "从“研究 AI 培训市场”到一个能真正回答的问题",
    situation: "团队想判断是否值得为没有技术背景的职场用户增加一门 AI 入门训练课程。",
    before: "直接问：请全面研究 AI 培训市场。AI 返回市场规模、公司名单、趋势、工具和大量观点，却没有回答团队真正要做的决定。",
    after:
      "先说明：研究目的是判断中国市场中非技术职场用户是否存在“从零开始学会把 AI 用到日常工作”的需求；关注近 12 个月公开资料；重点回答常见学习困难、已有课程主要承诺、用户真正需要的结果，并要求关键事实注明来源与日期。",
    result: "资料开始围绕同一个决策问题收敛，后续也能判断哪些来源真正有用。"
  },
  mistakes: [
    "误区：主题写得越大，AI 就越全面｜正确理解：范围过大时，AI 只能替你猜重点，结果反而更散。",
    "误区：问题越窄越专业｜正确理解：范围必须和真实工作目的匹配，不能为了具体而丢掉关键对象。",
    "误区：先定好答案再找证据｜正确理解：研究问题要允许证据改变你的判断。"
  ],
  related: ["下一课会继续解决：资料找到了以后，怎样判断它真的能支持当前问题。"],
  practice: {
    title: "把一个模糊工作问题整理成可直接交给 AI 的研究任务",
    goal: "完成一份具体研究任务，让 AI 知道你为什么查、查什么、范围在哪里、要回答哪些问题，以及关键结论需要什么证据。",
    fields: [
      {
        key: "purpose",
        label: "研究目的",
        prompt: "写清你为什么要查，以及研究结果最后要帮助你做什么决定。",
        example: "我正在决定是否为没有技术背景的职场用户增加一门 AI 入门训练课程。请围绕这个决定帮助我做前期研究。"
      },
      {
        key: "scope",
        label: "对象和范围",
        prompt: "写清要研究谁或什么，以及必要的地区、场景和时间边界。",
        example: "研究对象是中国市场中没有技术背景、希望把 AI 用到日常工作的职场用户；优先看近 12 个月公开资料。"
      },
      {
        key: "questions",
        label: "核心问题",
        prompt: "列出真正会影响这个决定的少量问题。",
        example: "请重点回答：1. 这类用户最常见的学习困难是什么；2. 现有入门课程通常承诺什么结果；3. 哪些工作场景最常被当作入门使用案例。"
      },
      {
        key: "evidence",
        label: "证据和输出要求",
        prompt: "写清哪些内容必须给出处，以及资料不足时怎样处理。",
        example: "请先不要替我搜索或补充外部事实。先把以上内容整理成一份完整研究任务说明，按“研究目的、对象与范围、核心问题、证据要求、完成标准”输出；发现范围仍不清楚时指出具体缺口，不要自行猜测。"
      }
    ],
    hints: [
      "先想清楚最后要支持什么决定，再决定查哪些资料。",
      "核心问题保持少而关键，不要把所有想到的问题一次塞进去。",
      "要求来源不是为了堆链接，而是为了让关键结论之后可以核验。"
    ],
    prompt: "请把我填写的目的、范围、核心问题和证据要求整理成一份完整、可直接交给研究人员或具备搜索能力的 AI 执行的研究任务说明。你现在只负责把任务定义清楚，不要假装已经搜索过资料。",
    reflection: "检查 AI 整理出的研究任务：一个不了解背景的人拿到后，是否也知道为什么查、查谁、查什么、什么证据才算够，以及什么算完成。"
  },
  checks: {
    best: {
      question: "你想判断“要不要为新手增加一门 AI 入门课”。下面哪一个最像已经可以开始研究的问题？",
      options: [
        "请全面研究 AI 教育行业。",
        "请研究近 12 个月中国市场中非技术职场用户学习 AI 的主要困难，并说明哪些证据能帮助判断是否需要一门工作应用型入门课。",
        "请证明 AI 入门课程一定会越来越受欢迎。"
      ],
      answer: "B",
      explanation: "B 同时说明了目的、对象、时间范围和要形成的判断，而且没有把预设结论写进问题。"
    },
    misconception: {
      question: "判断：研究范围越窄越好，只要足够具体，就一定能得到更可靠的答案。",
      answer: false,
      explanation: "范围要与真实工作目的匹配。过窄可能把真正影响决策的人群、时间或条件排除掉。"
    },
    boundary: {
      question: "开始研究前，哪些信息通常值得先说清楚？（多选）",
      options: ["研究最后要支持什么决定", "研究对象和必要范围", "希望 AI 最终证明的固定答案", "关键问题和证据要求"],
      answers: ["A", "B", "D"],
      explanation: "目的、对象/范围和证据要求能形成研究边界；固定答案会把研究变成找材料证明预设观点。"
    }
  },
  review: [
    "帮你把大主题收窄成明确目的、对象、范围、时间和待回答问题｜不要替你猜真正的业务目的，也不要在你没说明取舍标准时擅自决定研究重点。",
    "根据明确问题提出还需要哪些资料、哪些关键事实应该给来源和日期｜不要为了迎合预设观点只找支持材料，或把资料不足补成确定答案。",
    "发现答案过泛时帮助你检查究竟缺了哪一层边界｜不要把“问题写得更长”误当成“研究问题已经更清楚”。"
  ],
  self: ["我能把一个“大主题”改成别人拿到也知道怎样查的问题。", "我能在开始搜索前说清研究目的、范围和证据要求。"],
  trigger: "当我准备说“帮我全面研究一下……”或发现 AI 给了很多资料却仍不能支持工作决定时，我会先重新检查研究问题和范围。",
  capability: "能把一个模糊工作主题整理成可执行、可核验的研究任务。",
  next: "下一课继续判断：找到的来源是否真的能支撑当前结论，而不是只看有没有链接。"
});

export const track02T202Draft = makeDraft({
  id: "t2-02-source-evidence-judgment",
  canonicalId: "T2-02",
  title: "AI 给了来源，怎么判断这些证据真的靠得住",
  prerequisites: ["T2-01", "T1-05", "T1-09", "T1-10"],
  learningRecommendation: "本课判断来源能否支撑结论；先写下要核验的说法，再检查资料的日期、对象和原始依据。",
  stepCopy: {
    explainTitle: "有链接，为什么仍不能直接相信？",
    exampleTitle: "同一结论，来源能证明到哪一步？",
    checkTitle: "这份资料能支持当前结论吗？",
    practiceTitle: "审查来源与结论的对应关系",
    reviewTitle: "来源可靠就代表结论可靠吗？",
    capabilityTitle: "你能说清证据的适用范围吗？",
    explainGuide: "先区分“给出来源”和“证据支持结论”，不要只看链接或机构名称。",
    exampleGuide: "逐项核对发布日期、研究对象和原始依据，看来源实际支持哪句话。",
    checkGuide: "判断来源是否适用于当前对象、时间与说法，并指出证据缺口。",
    practiceGuide: "对照待判断的说法审查候选资料，标出可用部分和待核验部分。",
    reviewGuide: "把来源可信度与证据适用性分开，避免把权威当成万能证明。",
    capabilityGuide: "确认自己能解释一个来源能证明什么，以及下一步还须核验什么。"
  },
  navigation: {
    explain: "看链接为何不够\n区分来源与证据",
    example: "核对日期与对象\n看原文支持什么",
    check: "判断能证明什么\n找出证据缺口",
    practice: "审查候选来源\n标出待核验处",
    review: "分开来源可信度\n与证据适用性",
    capability: "说清结论依据\n知道还须查什么"
  },
  mainQuestion: "有链接、有机构名称，为什么仍然不能直接说明一个结论是真的？",
  mainConcept: "判断证据不能只看来源名气，还要检查发布时间、适用对象、是否为原始依据，以及它实际能支持哪一句结论。",
  summary: "你会判断一个来源到底能证明什么、适用于谁、是否仍然有效，以及什么时候必须继续追到原始依据。",
  explanation:
    "AI 给出一个链接，只说明它提供了一个可能的线索。真正要判断的是：谁发布的、什么时候发布、针对什么对象、数据从哪里来，以及原文到底有没有支持当前这句话。一个很权威的来源，也可能因为时间太旧、对象不同或只被二手转述而不能直接支持你的问题。",
  why:
    "工作中的购买、发布、汇报和决策，经常会被一个看起来很确定的数字或说法影响。学会判断证据，才能把“AI 说了”变成“我知道这句话为什么可以用”。",
  points: [
    "先确认来源主体和发布时间，再判断它是否适用于当前问题。",
    "关键结论尽量追到原始公告、原始数据、正式文档或直接研究结果。",
    "来源是否权威，与它是否真的支持当前这句话，是两个不同问题。",
    "检查研究对象、地区、样本、产品版本或时间范围是否一致。",
    "证据不够时明确标为待核验，不因为链接数量多就自动接受。"
  ],
  body: [
    "同一篇二手文章被十个网站转载，仍可能只有一个原始证据链；数量不能代替独立证据。",
    "判断来源不是做“可信/不可信”的简单标签，而是说明：它可以支持什么、不能支持什么、还缺什么。"
  ],
  example: {
    title: "同样说“用户更喜欢 AI 学习”，三个来源的作用完全不同",
    situation: "团队正在判断用户是否更愿意选择工作应用型 AI 入门课。",
    before: "AI 列出一篇两年前的媒体文章、一条无出处社交帖和一份近期官方调查，然后因为三条资料方向相似就说“需求已经得到充分证明”。",
    after:
      "先分别检查：官方调查的样本是谁、什么时候做；媒体文章引用的原始数据在哪里；社交帖只能作为线索还是可以代表整体用户。再说明每一条资料实际能支持的结论和仍缺的证据。",
    result: "团队不再把“有三个链接”当成“三份同等证据”，而能看到哪些资料真正适用于当前判断。"
  },
  mistakes: [
    "误区：有链接就代表已核验｜正确理解：还要确认原文、日期、对象和它实际支持的结论。",
    "误区：官方来源一定能证明所有相关说法｜正确理解：权威来源也有自己的范围和时间边界。",
    "误区：很多文章都写一样，所以证据很多｜正确理解：它们可能都在转述同一个原始来源。"
  ],
  related: ["下一课会继续解决：即使每个来源都看过了，为什么不同资料仍会给出不一样的答案。"],
  practice: {
    title: "让 AI 帮你审查一组来源，而不是替你直接判真假",
    goal: "把给定资料和当前待判断结论一起交给 AI，要求它说明每个来源能证明什么、不能证明什么，以及还缺哪些证据。",
    fields: [
      {
        key: "claim",
        label: "当前要判断的说法",
        prompt: "写清这次到底要验证哪一句话，以及它会影响什么决定。",
        example: "我要判断的说法是：“近一年，中国市场中非技术职场用户更希望学习能直接用于日常工作的 AI 课程。”这个判断会影响我们是否增加工作应用型入门课程。"
      },
      {
        key: "sources",
        label: "候选资料",
        prompt: "把资料的发布主体、日期、对象和关键内容一起给 AI，不只给标题。",
        example: "资料A：2026年某培训平台学员问卷，样本为其420名付费学员，称68%最关注办公提效；资料B：2024年媒体文章，引用一家全球咨询公司的旧调查但未附原始链接；资料C：2026年政府数字技能报告，覆盖本地在职成年人，提到生成式 AI 的工作应用培训需求上升。"
      },
      {
        key: "review",
        label: "审查要求",
        prompt: "要求 AI 分别说明每条资料能支持和不能支持什么，并指出需继续核验的地方。",
        example: "请逐条检查发布者、日期、适用对象、是否接近原始证据，以及它实际能支持哪一部分说法；不要只打“可信/不可信”标签。若是二手转述，请标记需要追到原始资料。"
      },
      {
        key: "output",
        label: "结论方式",
        prompt: "写清证据不足时必须保留缺口，不允许为了给答案而补全。",
        example: "最后分成“目前可使用的证据、只能当线索的资料、与当前范围不匹配的资料、仍缺的证据”。资料不足时明确说不足，不要把三个来源合成一个确定结论。"
      }
    ],
    hints: [
      "判断一个来源时同时看“它是谁”和“它能证明什么”。",
      "样本、地区、时间或版本不一致，都可能让一个权威资料不适用于当前问题。",
      "二手资料可以帮助找到线索，但关键结论尽量回到原始依据。"
    ],
    prompt: "请根据我给出的待判断说法和候选资料，做一次证据审查。不要替我简单判真假，而要说明每个来源能支持什么、不能支持什么，以及下一步该核验什么。",
    reflection: "检查你的结果：是否已经能说明“为什么这条证据可以用”，而不只是“我觉得这个网站比较可信”。"
  },
  checks: {
    best: {
      question: "要判断“中国职场用户更需要 AI 工作应用培训”，下面哪种证据用法更稳妥？",
      options: [
        "看到三个网站都转述同一个百分比，就当成三份独立证据。",
        "优先检查近期中国市场调查的样本和原始报告，再说明它具体能支持哪一部分结论。",
        "只要是知名机构发布的数据，就不需要再看年份和研究对象。"
      ],
      answer: "B",
      explanation: "证据要和当前问题的时间、对象和结论匹配，而且关键数字应尽量追到原始依据。"
    },
    misconception: {
      question: "判断：来源越权威，它就越能支持任何与主题相关的结论。",
      answer: false,
      explanation: "权威来源也只对自己的研究对象、时间、定义和原文结论负责，超出范围仍不能直接使用。"
    },
    boundary: {
      question: "审查一个来源时，哪些信息会直接影响它能否支持当前结论？（多选）",
      options: ["发布日期", "覆盖对象和范围", "原始证据是否可追溯", "网页配色是否专业"],
      answers: ["A", "B", "C"],
      explanation: "日期、对象/范围和原始证据都会影响适用性；页面是否“看起来专业”不是证据判断标准。"
    }
  },
  review: [
    "帮你整理来源主体、日期、对象、原始性，并对照当前结论找证据缺口｜不要因为网站知名、语言肯定或链接很多，就替你宣布一个事实已经成立。",
    "帮助你追踪二手转述背后的原始资料，并说明某条证据实际能支持到什么程度｜不要声称已经打开、核验或读取了它实际没有访问到的原文。",
    "把资料分成可直接使用、需要继续核验、范围不匹配和仍缺证据几类｜不要把所有来源压成一个简单的“可信分数”，掩盖真正的适用边界。"
  ],
  self: ["我能说明一条资料究竟能支持哪一句结论。", "我能在关键事实前检查日期、对象、原始依据和适用范围。"],
  trigger: "当 AI 给出一个会影响发布、购买、汇报或决策的数字、政策、功能说明或链接时，我会先检查它实际能证明什么。",
  capability: "能判断候选来源对当前工作问题的证据价值，并明确仍需核验的缺口。",
  next: "下一课继续处理：多个来源都各自有依据，但数字或结论仍然不一致时，怎样形成不强行消除差异的综合判断。"
});

export const track02T203Draft = makeDraft({
  id: "t2-03-multi-source-synthesis",
  canonicalId: "T2-03",
  title: "几个来源说法不一样，怎么判断差异到底在哪里",
  prerequisites: ["T2-01", "T2-02"],
  learningRecommendation: "本课解释多个来源为何结论不同；先看每份资料能证明什么，再对齐定义、对象和时间，保留无法解释的分歧。",
  stepCopy: {
    explainTitle: "数字不同，究竟是哪里不同？",
    exampleTitle: "对齐口径后，差异还存在吗？",
    checkTitle: "这是口径差异还是真正冲突？",
    practiceTitle: "对齐三份资料并整理分歧",
    reviewTitle: "怎样得出不过度的综合结论？",
    capabilityTitle: "你能解释来源之间的差异吗？",
    explainGuide: "先看定义、对象、时间和方法是否相同，再决定数字能否比较。",
    exampleGuide: "对照两个使用率指标，找出看似冲突的数字背后各自的统计范围。",
    checkGuide: "判断差异能否解释；证据不足时，明确保留真正的冲突与未知。",
    practiceGuide: "让 AI 逐项对齐三份资料，再分出共识、可解释差异和待查问题。",
    reviewGuide: "不投票、不平均不可比数字，让最终判断与证据强度相匹配。",
    capabilityGuide: "确认自己能说明差异来源，并在证据不足时写出有条件的结论。"
  },
  navigation: {
    explain: "先看数字能否比\n核对对象与时间",
    example: "对齐统计口径\n解释表面差异",
    check: "区分可解释差异\n与真正冲突",
    practice: "对齐三份资料\n保留未知问题",
    review: "按证据写结论\n不平均不可比数",
    capability: "解释来源差异\n写出条件与未知"
  },
  mainQuestion: "两个看起来都靠谱的来源给出不同数字时，为什么不能直接选最新的、最权威的或最多人说的那个？",
  mainConcept: "先对齐定义、对象、时间和方法，区分表面差异与真正冲突，再决定当前证据最多能支持到什么程度。",
  summary: "你会把多个不一致来源整理成共识、可解释差异、真正冲突和仍不确定四类，而不是强行选一个答案。",
  explanation:
    "不同来源得出不同数字，不一定表示其中一个错了。它们可能统计的不是同一件事、针对不同人群、来自不同时间，或者使用不同方法。先把这些条件对齐，很多“冲突”会自然得到解释；对齐以后仍不能解释的部分，才需要保留为真正冲突或不确定。",
  why:
    "现实工作里，市场数据、竞品资料、政策解读和 AI 回答经常不一致。如果不会处理差异，人很容易用“多数票”或“我更相信这个机构”替代真正的证据判断。",
  points: [
    "先检查不同来源是不是用了同一个定义或指标口径。",
    "继续对齐研究对象、地区、样本和时间范围。",
    "再看数据来源、计算方法或证据类型是否不同。",
    "能解释的差异要说明原因，不能把不同口径硬合成一个数字。",
    "对齐后仍证据不足时，保留“目前不能确定”是正确结果，不是失败。"
  ],
  body: [
    "多来源综合的目标不是消灭所有差异，而是把“为什么不同”说清楚，让最后的结论强度与证据强度相匹配。",
    "如果三篇文章都引用同一份报告，它们不是三票；如果新旧数据来自不同年份，它们可能反映变化，也不应该直接互相否定。"
  ],
  example: {
    title: "都是“AI 工具使用率”，为什么一个是 62%，另一个只有 34%",
    situation: "团队在判断中国职场用户使用生成式 AI 的普及程度，找到两个近期报告却数字差距很大。",
    before: "直接选择数字更高的报告，因为发布机构更知名，或者把两个百分比取平均数。",
    after:
      "先发现报告A统计的是“过去一个月使用过至少一次”，报告B统计的是“每周在工作中使用”；两者对象和行为定义不同，因此不是同一指标。再分别保留它们支持的结论，而不是合成一个数字。",
    result: "原本的数字冲突被解释成口径差异，同时团队知道哪些问题仍需要同口径资料才能回答。"
  },
  mistakes: [
    "误区：来源多的一方就是事实｜正确理解：多个转述可能只是同一个证据链。",
    "误区：数字不一样就一定有人错｜正确理解：先检查定义、对象、时间和方法是否一致。",
    "误区：把不同口径数字平均就更客观｜正确理解：不可比的数据不能靠平均消除差异。",
    "误区：研究一定要给唯一答案｜正确理解：证据不足时保留不确定，是更可靠的工作结果。"
  ],
  related: ["下一阶段会开始把已经查清的事实，针对不同对象和工作目的变成真正可交付的表达。"],
  practice: {
    title: "让 AI 对齐三份资料，并保留真正无法解释的冲突",
    goal: "把三份存在差异的资料交给 AI，先比较定义、对象、时间和方法，再整理出共识、可解释差异、真冲突和当前不能确定的部分。",
    fields: [
      {
        key: "question",
        label: "当前问题",
        prompt: "先写清你最终想回答什么，避免比较过程中换问题。",
        example: "我要判断：中国市场中非技术职场用户在日常工作中使用生成式 AI 的普及程度，目前公开资料最多能支持到什么结论？"
      },
      {
        key: "evidence",
        label: "三份资料",
        prompt: "把每份资料的数字、定义、对象和时间一起给 AI。",
        example: "资料A：2026年中国市场行业调查，62%受访者表示“过去一个月在工作中至少用过一次生成式 AI”；资料B：2026年中国企业员工调查，34%表示“每周至少三天使用生成式 AI 工作”；资料C：2025年亚太区域报告，48%受访者表示“曾在任何场景使用生成式 AI”，样本覆盖多个国家和地区。"
      },
      {
        key: "alignment",
        label: "对齐要求",
        prompt: "要求先找差异原因，不允许直接投票或平均。",
        example: "请先逐条对齐三个来源的指标定义、研究对象、地区、时间和方法；指出哪些数字其实不能直接比较，哪些差异可以由口径或范围解释。"
      },
      {
        key: "synthesis",
        label: "综合结论",
        prompt: "要求把结论按证据强度分层，并保留仍不能确定的地方。",
        example: "最后请分成“多来源一致支持的内容、可以解释的差异、真正仍冲突的内容、当前证据不足不能确定的内容”，再写一句不超过现有证据强度的结论。不要为了给唯一答案而取平均数。"
      }
    ],
    hints: [
      "先对齐定义，再比较数字；名称相同不代表口径相同。",
      "新旧数据不同可能反映时间变化，不要自动判定旧数据“错误”。",
      "最后的结论可以带条件，也可以明确写“目前不能确定”。"
    ],
    prompt: "请根据我提供的当前问题和多份资料，先做口径与范围对齐，再形成证据综合。不要投票，不要把不可比数字直接平均，也不要隐藏不确定性。",
    reflection: "检查你的综合：是否已经解释“为什么不同”，并且最后一句结论没有超过现有证据能支持的程度。"
  },
  checks: {
    best: {
      question: "两个报告分别给出 62% 和 34% 的 AI 使用率。第一步最应该做什么？",
      options: [
        "选发布机构更知名的数字。",
        "先检查两个报告对“使用”的定义、对象和时间是否一致。",
        "把两个数字平均，得到更中立的结果。"
      ],
      answer: "B",
      explanation: "只有先确认两边在统计同一件事，数字比较才有意义。"
    },
    misconception: {
      question: "判断：如果多数网站都写同一个数字，就可以把它当成多数独立来源的共同结论。",
      answer: false,
      explanation: "多个网站可能都在转述同一个原始来源，数量并不自动增加独立证据。"
    },
    boundary: {
      question: "下面哪些情况可能解释两个来源为什么看起来冲突？（多选）",
      options: ["指标定义不同", "研究对象或地区不同", "统计时间不同", "网页标题颜色不同"],
      answers: ["A", "B", "C"],
      explanation: "定义、对象/范围和时间都可能造成合理差异；视觉样式与证据冲突无关。"
    }
  },
  review: [
    "帮你把多个来源的定义、对象、时间和方法并排对齐，找出差异真正来自哪里｜不要用简单多数票、机构名气或“最新的就是对的”替代证据比较。",
    "把一致部分、可解释差异、真冲突和仍不确定部分分开整理｜不要为了让答案看起来完整，就把无法解释的分歧藏起来。",
    "帮助你写出与现有证据强度匹配的综合结论，并指出下一步还需要哪类资料｜不要把不同口径的数字直接平均，也不要把相关信息夸大成因果结论。"
  ],
  self: ["我能先解释多个来源为什么不同，再决定能不能比较。", "我能在证据不足时保留不确定，而不是强迫 AI 给唯一答案。"],
  trigger: "当同一个问题在不同网站、报告或 AI 回答里出现不同数字或结论时，我会先对齐定义、对象、时间和方法。",
  capability: "能把多个不一致来源整理成有条件、有证据边界的综合判断。",
  next: "下一阶段从“事实是什么”进入“怎样把这些已经查清的信息针对不同对象表达并做成交付物”。"
});

export const track02BatchADrafts = [
  track02T201Draft,
  track02T202Draft,
  track02T203Draft
] as const;


export const track02BatchAIntroComparisons = {
  "t2-01-research-question-scope": {
    title: "为什么‘全面研究一下’常常帮不了你做决定",
    situation: "你想判断是否要面向中国职场用户增加一门 AI 工作应用入门课，却只给 AI 一句‘研究一下 AI 培训市场’。",
    approaches: [
      { label: "表面上信息很多", text: "AI 可能给你市场规模、趋势、公司和工具，但这些内容未必对应你真正要做的决定。" },
      { label: "真正卡住的地方", text: "如果研究目的和必要边界没有说清，AI 只能自己猜哪些信息重要。" }
    ],
    comparison: [],
    comparisonPlacement: "BOTTOM" as const,
    takeaway: "先把真正要解决的问题和必要边界说清，后面的资料才会围绕同一个决定收敛。",
    bottomDetails: [
      { title: "主题不是研究问题", text: "“AI 培训市场”只是一个大主题；要不要为中国职场用户开设入门课，才是这次研究要支持的具体决定。" },
      { title: "先圈定必要范围", text: "明确研究对象、地区和要回答的问题，才能判断后续资料是否与这次决定有关。" }
    ]
  },
  "t2-02-source-evidence-judgment": {
    title: "有链接，不等于这句话已经被证明",
    situation: "AI 给你一个看起来很专业的数字、机构名称和链接，你准备把它写进一份中国市场的工作汇报。",
    approaches: [
      { label: "看起来很可信", text: "有知名机构、有数字、有链接，很容易让人下意识觉得这句话已经可以直接使用。" },
      { label: "真正要确认的事", text: "关键不是‘有没有来源’，而是这份资料是否真的适用于当前对象，并支持你准备写下的这句话。" }
    ],
    comparison: [],
    comparisonPlacement: "BOTTOM" as const,
    takeaway: "来源只是线索；能不能使用，要看证据和当前结论是否真正匹配。",
    bottomDetails: [
      { title: "有来源不等于有证据", text: "链接只能告诉你到哪里查，不能自动证明报告里的这句话；需要回到资料中确认原话和数据。" },
      { title: "证据要对准当前说法", text: "即使资料可信，也要核对发布时间、研究对象和适用范围，避免把别人的结论直接搬到当前问题上。" }
    ]
  },
  "t2-03-multi-source-synthesis": {
    title: "数字不一样，不一定是谁错了",
    situation: "两份关于中国职场用户使用生成式 AI 的报告给出不同数字，团队马上想选一个‘更可信’的答案。",
    approaches: [
      { label: "直接二选一", text: "只看机构名气、发布时间或数字高低，很容易把不同口径的数据当成同一件事比较。" },
      { label: "先确认是否可比", text: "两个来源可能统计的是不同对象、不同时间或不同‘使用’定义，差异本身还不能说明谁错。" }
    ],
    comparison: [],
    comparisonPlacement: "BOTTOM" as const,
    takeaway: "遇到冲突先判断是否在比较同一件事，再决定差异意味着什么。",
    bottomDetails: [
      { title: "数字不同先别急着选", text: "一份报告统计所有职场用户，另一份只统计特定行业时，两个数字不同并不直接构成冲突。" },
      { title: "先让口径能够比较", text: "确认“使用”如何定义、调查了谁、发生在何时，再区分范围差异和真正无法解释的分歧。" }
    ]
  }
} as const;

export const track02BatchATriggerScenarios = {
  "t2-01-research-question-scope": "当研究问题太大、AI 回答很泛或资料很多却不能支持决定时，先重新定义研究范围。",
  "t2-02-source-evidence-judgment": "当一个关键数字、政策、功能或行业结论会影响工作判断时，先检查来源实际能证明什么。",
  "t2-03-multi-source-synthesis": "当多个来源对同一问题给出不同数字或结论时，先做定义、对象、时间和方法对齐。"
} as const;

const track02BatchAReviewDepth = {
  "t2-01-research-question-scope": [
    { title: "为什么先确定“最后要做什么决定”", text: "同一个主题可以服务完全不同的工作目的。先说明最终要支持的决定，才能判断哪些资料重要、哪些只是背景噪声。" },
    { title: "范围什么时候算足够清楚", text: "不是条件写得越多越好，而是另一个人接手后，不需要再猜研究对象、必要范围、时间和要回答的问题。" },
    { title: "为什么不能先写好想得到的答案", text: "研究任务可以有假设，但不能把结论预先锁死；否则 AI 很容易只寻找支持材料，失去发现反例和修正判断的机会。" }
  ],
  "t2-02-source-evidence-judgment": [
    { title: "“来源靠谱”和“这句话有证据”为什么不是一回事", text: "一个机构可以很权威，但它的某份资料仍可能太旧、对象不同，或根本没有说到你现在这句结论；证据必须逐句匹配。" },
    { title: "什么时候应该继续追原始来源", text: "当数字、政策、产品能力或其他关键事实会直接影响发布、购买、汇报或决策时，二手转述最好只作为入口，继续找到原始公告、数据或正式文档。" },
    { title: "证据不足时最专业的做法是什么", text: "不是硬选一个答案，而是明确目前能确认什么、还缺什么，以及下一步需要补哪一种证据。" }
  ],
  "t2-03-multi-source-synthesis": [
    { title: "为什么第一步不是判断谁对谁错", text: "很多所谓冲突其实来自定义、对象、时间或方法不同。先确认是不是在比较同一件事，才有资格判断真正分歧。" },
    { title: "什么情况下可以形成一个综合结论", text: "只有把不可比部分分开，并说明一致证据和差异来源后，综合结论才不会把不同口径硬揉成一个看似确定的答案。" },
    { title: "“目前不能确定”为什么也是有效结果", text: "当同口径证据仍然不足或真正冲突未解决时，保留不确定能防止团队把猜测升级成事实，也明确告诉下一步该补什么。" }
  ]
} as const;

export const track02BatchAKnowledgeDepth = Object.fromEntries(
  track02BatchADrafts.map((draft) => [
    draft.lessonSpec.lessonId,
    {
      example: draft.content.content.map((text, index) => ({
        title: index === 0 ? "为什么这样判断" : "还要注意什么",
        text
      })),
      review: track02BatchAReviewDepth[draft.lessonSpec.lessonId as keyof typeof track02BatchAReviewDepth] ?? []
    }
  ])
);
