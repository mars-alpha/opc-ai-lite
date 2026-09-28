import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  type CourseBuilderBuildDraft
} from "../../lib/learning/course-builder";

const formalBriefSource = "TRACK03_BATCH_A_T3_01_T3_03_FORMAL_BRIEFS_V1.md";
const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

type Track03LessonConfig = {
  id: string;
  canonicalId: "T3-01" | "T3-02" | "T3-03";
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

function makeTrack03Draft(config: Track03LessonConfig): CourseBuilderBuildDraft {
  const practice = {
    id: config.id.replace(/-/g, "_") + "_practice",
    title: config.practice.title,
    goal: config.practice.goal,
    instructions: config.practice.fields.map(({ key, label, prompt }) => ({ key, label, prompt })),
    hints: config.practice.hints,
    rubric: config.practice.fields.map((field) => ({
      key: field.key,
      label: field.label + "是否清楚",
      maxScore: 25,
      minScore: 10,
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
        "TRACK03_CATALOG_CONTEXT_V1.md",
        "TRACK03_SIX_STEP_AUDIT_V1.md",
        formalBriefSource,
        "FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
        "DEFERRED_KNOWLEDGE_LEDGER_V1.md",
        "LESSON_OUTPUT_CONTRACT_V1.md"
      ],
      researchSummary:
        config.summary +
        " 本课只使用已批准的 Track 03 业务增长知识与课程内样例；继承 Track 02 的研究、内容、数据和知识能力，不重教基础，也不提前进入 Track 04 自动化。"
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
      version: "1.0.0-track03-" + config.canonicalId.toLowerCase().replace("-", ""),
      courseSlug: "ai-growth",
      lessonId: config.id,
      title: config.title,
      lessonType: "APPLICATION",
      learningObjectives: [
        config.mainConcept,
        "能在真实业务里判断什么时候应该使用本课方法。",
        "能完成本课实操，并留下可以检查、复用和继续推进的业务结果。"
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
        correctFeedback: "正确。你抓住了本课真正要做的业务判断。",
        incorrectFeedback: "再看前两步：先判断当前缺的是业务对象、真实情境还是信息优先级，不要只追求更多描述。"
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
        correctFeedback: "正确。你没有把 AI 的候选分析当成真实市场事实。",
        incorrectFeedback: "重新判断：AI 可以整理已有信息，但不能替你制造真实用户证据、业务优先级或效果承诺。"
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
        correctFeedback: "正确。你已经能把方法放回真实业务边界里使用。",
        incorrectFeedback: "重新检查每项：它是已有证据、待验证假设，还是 AI 自己补出来的内容？"
      }
    ],
    practice,
    hints: config.practice.hints,
    referenceAnswer: config.practice.fields.map((field) => field.example).join("\n"),
    review: config.review,
    selfAssessment: config.self
  };
}

const lessons: Track03LessonConfig[] = [
  {
    id: "t3-01-icp-audience-fit",
    canonicalId: "T3-01",
    title: "不是“所有人”都要做，先找清楚你到底想服务谁",
    prerequisites: ["T2-01", "T2-04", "T2-12"],
    learningRecommendation: "本课先判断当前业务最值得服务谁；开始前先准备真实业务目标、候选对象和已有证据。",
    stepCopy: {
      explainTitle: "为什么“所有人都可能需要”反而最难行动？",
      exampleTitle: "三个都相关的人群，为什么当前只能先选一个？",
      checkTitle: "什么才算真正选清楚了服务对象？",
      practiceTitle: "选出现在最值得先服务的人",
      reviewTitle: "选业务对象时哪些判断不能交给 AI 猜？",
      capabilityTitle: "你能说清当前最该服务谁了吗？",
      explainGuide: "先看清“描述一个人”和“决定现在先服务谁”不是一回事。",
      exampleGuide: "比较三类读者的问题、我们能不能帮上，以及手里已有多少真实依据。",
      checkGuide: "判断哪些信息真的能支持“现在先服务谁”，哪些只是人物描述或 AI 猜测。",
      practiceGuide: "把真实业务目标、候选对象和证据整理成可直接交给 AI 的比较任务。",
      reviewGuide: "分清 AI 能帮你比较什么，以及哪些最终选择仍要由你根据真实情况决定。",
      capabilityGuide: "确认自己能解释为什么当前先服务这一类，也能说明其他候选为什么暂不优先。"
    },
    navigation: {
      explain: "区分画像优先级\n先看业务对象",
      example: "比较三个候选\n看证据和匹配",
      check: "判断优先依据\n识别虚构信息",
      practice: "填写真实输入\n形成对象判断",
      review: "保留业务决定\n区分证据假设",
      capability: "说清优先对象\n解释选择边界"
    },
    mainQuestion: "为什么把用户年龄、职业和兴趣写得很详细，仍然不能说明当前业务应该优先服务谁？",
    mainConcept: "选服务对象时，不是把人物画像写得越细越好，而是看四件事：他有没有真实问题、我们能不能帮上、手里有没有依据，以及现在值不值得先投入。",
    summary: "你会从几类看起来都相关的人里，选出现在最值得先服务的一类，并说清为什么选他、还缺什么依据、为什么其他人暂时不优先。",
    explanation: "“25到35岁、关注 AI、愿意学习”只是人物描述，还不能告诉你现在该先服务谁。真正有用的判断要回答：他有没有真实问题、我们是不是真的能帮上、手里有什么依据，以及为什么这段时间先把精力放在他身上。",
    why: "如果一开始觉得“所有人都可能需要”，后面的选题、表达和推广很容易越做越散。先选清楚现在重点服务谁，后面的内容和获客动作才会朝同一个方向积累。",
    points: [
      "先写清当前业务目标，再讨论应该服务谁。",
      "既要确认对方真的有这个问题，也要确认我们确实能帮上忙；只有“看起来相关”还不够。",
      "真实证据与待验证假设必须分开。",
      "现在不优先，不等于以后永远不做；只是这段时间先把精力放在更值得验证的人身上。"
    ],
    body: [
      "选服务对象，不需要先编一整套人物画像。先看几类人分别有什么真实问题、我们能不能帮上、手里有什么依据，就已经足够做第一轮选择。",
      "AI 可以帮你把几类人放在一起比较，但“这段时间先服务谁”仍要结合真实目标、反馈和你能投入的精力来决定。"
    ],
    example: {
      title: "三个看起来都适合的人，为什么不能同时当第一优先级",
      situation: "一个做 AI 实用内容的自媒体账号准备规划接下来一个月的内容。现在有三类读者经常出现：只想看看 AI 新鲜事的人、每天要用 AI 做内容和资料工作的一人公司经营者、关注企业 AI 采购和技术方案的人。",
      before: "账号觉得三类人都可能成为读者，于是今天发 AI 新闻，明天讲内容技巧，后天又讲企业技术方案。内容很多，但读者很难形成“这个账号就是在帮我解决问题”的感觉。",
      after: "账号先明确这一个月的目标是做出能持续吸引真实业务线索的实用内容，再比较三类人的真实问题、账号现有内容是否能帮上忙，以及过去评论和私信里有什么依据。最后先服务每天都有内容和资料任务的一人公司经营者，另外两类继续观察。",
      result: "账号终于知道接下来一个月主要为谁做内容，同时也记下还缺哪些依据，没有把其他读者永久排除。"
    },
    mistakes: [
      "误区：画像字段越多，服务对象选得越准确｜正确理解：只有会影响当前业务选择的信息才重要。",
      "误区：AI 排名第一的人群就是真实市场答案｜正确理解：模型只能依据输入比较，不能制造需求证据。",
      "误区：暂不优先就是这个人群没有价值｜正确理解：优先级是当前目标和资源下的取舍。"
    ],
    related: ["下一课会继续判断：这个对象在什么具体情境下会真的产生需求。"],
    practice: {
      title: "把候选人群整理成可检查的优先级任务",
      goal: "把真实业务目标、候选对象和已有依据交给 AI，帮助比较谁的问题更真实、我们更能帮上谁，并把还没确认的地方单独留下。",
      fields: [
        { key: "goal", label: "当前业务目标", prompt: "说明这次为什么要选择优先对象，以及接下来要支持什么业务动作。", example: "我经营一个分享 AI 实用方法的自媒体账号。接下来一个月，我不想继续什么都发，而是先找到最值得重点服务的一类读者，让选题更集中，也更容易获得真实咨询和线索。" },
        { key: "candidates", label: "候选对象", prompt: "列出当前真实考虑的 3～4 类对象，不虚构额外画像属性。", example: "候选对象：A. 主要关注 AI 新闻和新工具、但没有固定业务任务的人；B. 自己做内容或一人公司、每天要处理资料、写稿和客户沟通的人；C. 负责企业 AI 采购、技术评估或系统建设的人。" },
        { key: "evidence", label: "已有证据与未知项", prompt: "写出现有反馈、行为或业务事实，并把未知内容明确标出。", example: "已有信息：过去一个月，关于“资料太散、选题做不完、写稿重复”的内容更容易收到收藏和私信；其中不少留言来自个人经营者和内容创作者。未知：三类人的付费意愿、真实需求规模和后续转化，目前都没有足够数据。" },
        { key: "output", label: "比较与输出要求", prompt: "规定 AI 如何比较、怎样表达不确定，以及哪些事实禁止补写。", example: "请按“候选对象｜问题是不是真的存在｜我们能不能帮上忙｜已有证据｜关键假设｜当前优先级｜理由｜还需验证什么”比较。给出当前优先、次优先、暂不优先的候选判断，但不要虚构预算、购买意愿、人口属性、市场规模或转化数据；证据不足时明确写“待验证”。" }
      ],
      hints: ["先写业务目标，再比较对象。", "把真实证据和模型推测分开。", "优先级必须能解释为什么现在先做这一类。"],
      prompt: "请基于我填写的真实业务目标、候选对象和已有证据，比较当前最值得优先服务的人群；所有证据不足的内容保持为待验证假设，不要替我制造市场事实。",
      reflection: "检查 AI 输出：它有没有用不存在的数据替你决定市场？你能否明确说出“为什么现在先服务这类人，以及还缺什么证据”？"
    },
    checks: {
      best: { question: "下面哪一种最像“现在最值得重点服务的人”？", options: ["25～35岁、喜欢科技、经常看短视频的人。", "每天都有资料、内容和客户沟通任务，账号现有内容确实能帮上忙，而且过去已有相关收藏、评论或私信的一人公司经营者。", "任何对 AI 感兴趣的人。"], answer: "B", explanation: "B 同时说明了真实问题、我们能提供什么帮助，以及手里已有的反馈依据；另外两项都太宽泛，无法支持现在先服务谁。" },
      misconception: { question: "判断：只要给 AI 一份产品介绍，它就能直接判断真实市场中最值得服务的优先服务对象。", answer: false, explanation: "产品介绍只能说明你能提供什么，不能自动提供真实用户需求、行为和购买证据。" },
      boundary: { question: "哪些信息能帮助判断一个候选对象当前是否值得优先？（多选）", options: ["反复出现的真实工作问题", "当前产品或内容能否提供对应价值", "已有访谈、使用或行为证据", "AI 自动补写的收入和购买意愿"], answers: ["A", "B", "C"], explanation: "前三项能支持真实业务判断；模型补写的人口或购买信息不能作为市场证据。" }
    },
    review: [
      "按统一标准整理候选对象，比较“问题是不是真的存在、我们能不能帮上、手里有什么依据”｜不要把人物描述得多详细当成业务优先级，也不要凭空决定真实市场最值得投谁。",
      "把已有证据和还没验证的假设分开，帮助指出接下来还要确认什么｜不要虚构购买意愿、预算、需求强度、市场规模或客户行为。",
      "根据已经给出的业务目标辅助比较当前优先、次优先和暂不优先｜不要把一次候选排序包装成永久市场结论，或替负责人承担资源取舍。"
    ],
    self: ["我能解释为什么这个对象当前优先，而不只是列画像字段。", "我能指出哪些判断有证据、哪些仍是待验证假设。", "我能说明其他候选为什么当前不优先，而不是说他们永远不适合。"],
    trigger: "当你准备做内容、产品或推广，却发现“谁都可以看、谁都可能需要”，选题越来越散、流量也难沉淀时，这节课用于先选清楚当前最值得重点服务的人。",
    capability: "能从几类可能的读者或客户中，选出现在最值得先服务的一类，并说清依据、待验证的地方，以及为什么其他人暂时不优先。",
    next: "下一课会继续判断：这个对象在什么具体情境下真正会在意，从静态对象进入真实需求场景。"
  },
  {
    id: "t3-02-use-case-fit",
    canonicalId: "T3-02",
    title: "用户为什么现在会在意这件事",
    prerequisites: ["T3-01", "T2-01", "T2-03"],
    learningRecommendation: "本课把目标对象还原成真实问题情境；开始前先准备已选对象和能说明真实行为的资料。",
    stepCopy: {
      explainTitle: "为什么目标用户也不一定现在需要你？",
      exampleTitle: "同一个人，在哪个情境下需求才真正出现？",
      checkTitle: "什么才算一个真实、具体的需求场景？",
      practiceTitle: "完成一张真实问题情境卡",
      reviewTitle: "哪些“用户痛点”其实只是我们的猜测？",
      capabilityTitle: "你能说清用户何时真的会在意了吗？",
      explainGuide: "先看清“知道他是谁”和“知道他什么时候真的需要”是两回事。",
      exampleGuide: "比较同一个人的三个真实场景，看什么时候会遇到问题、现在怎么处理、卡在哪里，以及最后想得到什么。",
      checkGuide: "判断一个需求描述是否具体到可行动情境，并识别证据不足的痛点推测。",
      practiceGuide: "用真实资料整理“什么时候发生、现在怎么做、哪里麻烦、想得到什么、还有什么没确认”。",
      reviewGuide: "区分归纳真实问题模式与编造用户痛点，保留紧迫度和期望结果的不确定性。",
      capabilityGuide: "确认自己能把“目标用户”进一步说成“在什么情况下为什么会真的需要”。"
    },
    navigation: {
      explain: "对象不等于需求\n看真实触发情境",
      example: "比较三个场景\n找当前问题差距",
      check: "识别真实用例\n排除泛化痛点",
      practice: "整理问题情境\n标记证据未知",
      review: "归纳已有信息\n不编造用户事实",
      capability: "说清何时在意\n连接真实结果"
    },
    mainQuestion: "为什么已经知道目标用户是谁，仍然可能不知道他什么时候会真正关心你的内容或方案？",
    mainConcept: "判断一个人会不会真正需要你，要看具体情况：什么时候会遇到问题、现在怎么处理、哪里最麻烦、最后想得到什么，以及哪些地方还没确认。",
    summary: "你会从“这个人是谁”继续走到“他什么时候真的会需要帮助”，不再只写“想提效、想学 AI”这种太宽泛的痛点。",
    explanation: "同一个人不会时时刻刻有同样需求。要判断他现在会不会在意，先看具体情况：发生了什么任务、现在怎么处理、哪里最麻烦，以及最后真正想完成什么结果。",
    why: "内容、转化和销售都发生在具体情境里。如果只知道“这个人是我们想服务的人”，后续仍可能对着正确的人说一个此刻无关的问题。",
    points: [
      "先选清楚“服务谁”，再判断“他在什么时候、为什么现在会在意”。",
      "先说清什么时候发生、现在怎么处理，问题才会落到真实工作里。",
      "“哪里麻烦”要说到具体成本，不能只写一句“效率低”。",
      "真正想要的是业务结果，不是“使用 AI”本身。",
      "已有证据、推测和未知项必须显式分开。"
    ],
    body: [
      "同一类人可以有多个需求场景，但每个场景的重要程度和价值可能完全不同。",
      "AI 可以从访谈、对话和反馈里归纳重复情境；如果资料没有说，就不能把“应该会痛”写成真实痛点。"
    ],
    example: {
      title: "同一个独立顾问，三个场景为什么只有一个最值得现在处理",
      situation: "一个做 AI 实用内容的账号已经决定重点服务一人公司经营者。现在要继续判断：这类读者到底在什么情况下最容易真正需要帮助，接下来的内容应该先回应哪个问题。",
      before: "账号只写“一人公司想提高效率、学会 AI、节省时间”，于是任何选题都像是相关的：AI 新闻、工具推荐、写作技巧、客户管理都能发，但没有一个问题特别具体。",
      after: "账号把读者常见情况拆开比较：每周固定写行业内容、偶尔看看 AI 新闻、客户咨询后临时整理资料。结合过去评论和私信，发现“每周都要持续发内容，但资料散、整理重复、写稿前准备很久”出现得最频繁，也最具体。",
      result: "团队得到一个当前更值得回应的需求场景，同时把其他场景保留为后续验证，而不是把泛化痛点当成全部需求。"
    },
    mistakes: [
      "误区：属于目标人群就会对所有卖点感兴趣｜正确理解：需求只有在具体情境和任务里才会真正出现。",
      "误区：“提高效率”已经是清楚痛点｜正确理解：还要说明哪一步慢、造成什么成本、期望什么结果。",
      "误区：用户想要的结果是“使用 AI”｜正确理解：AI 是手段，真正结果通常是交付、收入、质量、速度或风险改善。"
    ],
    related: ["下一课会把已确认的对象和需求场景，转成清晰的信息先后顺序。"],
    practice: {
      title: "把目标对象整理成真实需求场景",
      goal: "把“什么时候发生、现在怎么做、哪里麻烦、想得到什么、有什么依据、还有什么没确认”整理清楚。",
      fields: [
        { key: "audience", label: "目标对象", prompt: "写明已经选定的对象，以及本次不重新讨论的对象边界。", example: "目标对象是自己经营内容账号或一人公司、每周都要稳定产出行业内容的人。本次先不讨论只看 AI 新闻的泛兴趣读者，也不讨论企业技术采购负责人。" },
        { key: "situations", label: "已有情境资料", prompt: "提供真实资料中的具体任务、现有做法和可观察问题。", example: "已有情境：A. 每周至少发布2篇内容，资料来自收藏、新闻和聊天记录，写稿前经常重新整理；B. 偶尔浏览 AI 新闻，没有固定产出任务；C. 客户咨询后有时需要临时整理背景。过去评论和私信主要集中在 A：资料散、重复整理、写稿前准备时间长，还担心漏掉原始来源。" },
        { key: "analysis", label: "分析要求", prompt: "要求 AI 按真实问题情境来分析，不把推测写成事实。", example: "请分别整理每个情境的 什么时候发生｜现在怎么做｜具体麻烦或成本｜想要的结果｜已有证据｜待确认信息，并判断“值得现在处理 / 有问题但优先级低 /依据不足”。“效率低”必须继续说明低在哪一步、造成什么具体成本。" },
        { key: "boundary", label: "事实边界", prompt: "规定哪些内容不能自动补写，以及最终输出怎样处理未知项。", example: "不要把“使用 AI”写成最终想要的结果，也不要补写资料中没有的紧迫度、付费意愿或痛点。无法从资料确认时写“待验证”，并列出后续应该问用户的具体问题。" }
      ],
      hints: ["先找触发情境，不要先写抽象痛点。", "把现有做法和期望结果分开。", "资料没说的紧迫度和痛苦程度保持未知。"],
      prompt: "请根据我提供的目标对象与真实情境资料，整理可行动的需求场景；把已有证据、推测和未知项分开，不要为了让故事完整而替用户编造痛点。",
      reflection: "检查结果：一个没看过背景的人是否能知道“什么情况发生、用户现在怎么做、哪里受阻、真正想得到什么”？"
    },
    checks: {
      best: { question: "下面哪一个最像真正可行动的需求场景？", options: ["独立经营者希望提高效率。", "每周交稿前要重新整理散落资料，通常花两小时且担心遗漏来源，希望更快形成可引用的工作材料。", "独立经营者都应该学习 AI。"], answer: "B", explanation: "B 有具体触发任务、现有摩擦与期望结果；A 太泛，C 是主张而不是用户情境。" },
      misconception: { question: "判断：只要一个人属于目标人群，他就应该对我们所有内容、功能和方案都有较强兴趣。", answer: false, explanation: "同一对象在不同时间和任务下有不同需求场景，只有当前情境相关的价值才更可能被在意。" },
      boundary: { question: "一个可信需求场景 通常应该包含哪些信息？（多选）", options: ["具体发生情境", "现在怎么做 与 具体麻烦", "想要的结果", "AI 推测出的隐性购买预算"], answers: ["A", "B", "C"], explanation: "前三项构成可行动情境；没有真实资料时，预算和购买意愿不能由模型补写。" }
    },
    review: [
      "从访谈、反馈、对话和工作资料里归纳重复出现的“什么时候发生、现在怎么做、哪里麻烦、想得到什么”｜不要把“效率低”“想用 AI”这类泛化词自动包装成已经验证的真实痛点。",
      "把已有证据、待确认信息和待验证问题整理出来，帮助比较哪些需求场景当前更值得处理｜不要替用户编造紧迫度、期望结果、购买意愿或把所有目标人群的场景都判成同样重要。"
    ],
    self: ["我能写出一个具体发生情境，而不是只说用户想提高效率。", "我能区分 现在怎么做、哪里麻烦和想得到什么。", "我能指出哪些痛点有证据、哪些仍需要验证。"],
    trigger: "当你已经知道大概要服务谁，却发现选题和表达仍然很泛，不知道对方为什么现在会在意时，这节课用于找出他真正会遇到的具体情况。",
    capability: "能把“我想服务这类人”继续说清成“他在什么情况下会真的需要帮助，以及现在最值得回应哪个问题”。",
    next: "下一课会把对象与需求场景转成清晰的信息层级，让对方先看到最相关的价值和可信证据。"
  },
  {
    id: "t3-03-message-hierarchy",
    canonicalId: "T3-03",
    title: "你的信息为什么值得对方继续看",
    prerequisites: ["T3-01", "T3-02", "T2-04", "T2-06"],
    learningRecommendation: "本课学习怎样把最重要的信息放到前面；开始前先准备目标对象、真实问题和可用依据。",
    stepCopy: {
      explainTitle: "为什么说得越多，用户反而越抓不住重点？",
      exampleTitle: "同一条推广内容，怎样让读者一眼知道和自己有什么关系？",
      checkTitle: "怎样说，才能让读者一眼抓住重点？",
      practiceTitle: "把一条推广内容的重点排清楚",
      reviewTitle: "价值表达里哪些内容不能让 AI 自己补？",
      capabilityTitle: "你能把最重要的信息放到最前面了吗？",
      explainGuide: "先理解信息多不等于价值清楚，抓住“对当前对象和情境最值得先说什么”。",
      exampleGuide: "对比“什么都说”和“先说重点”两种表达，看对象、当前情境、核心价值、真实依据和下一步怎样排出先后。",
      checkGuide: "判断核心价值、支持证据和下一步是否与当前对象和需求场景 真正匹配。",
      practiceGuide: "用真实读者、真实问题和真实资料，先把“先说什么、拿什么证明、下一步做什么”排清楚。",
      reviewGuide: "区分表达优化与事实创造，守住真实依据、承诺强度和下一步的业务边界。",
      capabilityGuide: "确认自己能删掉无关功能，明确一个最核心价值，并说明支持证据来自哪里。"
    },
    navigation: {
      explain: "信息多不等于清楚\n先找核心价值",
      example: "从功能到价值\n加入真实证据",
      check: "判断信息层级\n识别虚假证明",
      practice: "整理价值主线\n匹配自然下一步",
      review: "优化表达结构\n不制造效果承诺",
      capability: "说清先讲什么\n证明从哪里来"
    },
    mainQuestion: "为什么产品功能、优势和 AI 术语都是真的，全部一起讲出来却仍然不能让目标用户觉得“这跟我有关”？",
    mainConcept: "表达价值时，先回答对方此刻最关心的一件事，再用真实依据证明，其他信息往后放，最后给出一个不过度跳跃的下一步。",
    summary: "你会把“我有什么”改成“对这个人现在最值得先说什么”，再用真实依据支持，而不是把所有功能和卖点一次堆出来。",
    explanation: "用户不会按你的产品目录来理解价值。面对一个具体问题，他最先想知道三件事：这和我有什么关系、能帮我解决什么、为什么值得相信。把信息排出先后，不是为了写得更漂亮，而是为了让对方先看到最重要的内容。",
    why: "如果核心价值、证明材料、次要功能和行动提示全部同样突出，信息就会变成说明书。先排出重点，后面的选题、渠道和转化才会围绕同一条价值主线。",
    points: [
      "最重要的价值必须对应当前对象和需求场景。",
      "一次表达需要明确主线，不能让所有价值点同权。",
      "支持这个价值的依据必须来自真实能力、案例、数据或可靠来源。",
      "补充信息只放真正需要的内容，不能抢走核心价值。",
      "下一步要匹配用户当前状态，不默认直接要求购买。"
    ],
    body: [
      "一个产品可以有多个真实价值，但一次沟通仍要决定哪个价值最先被理解。",
      "AI 很适合比较表达结构和压缩信息，但任何客户结果、效果数字、案例和承诺都必须来自真实证据。"
    ],
    example: {
      title: "为什么“什么都想说”不如先回应一个真实内容难题",
      situation: "一个做 AI 实用内容的账号准备发布一篇内容，并在文末引导读者领取一份“AI 内容工作流模板”。目标读者每周都要稳定产出内容，最常见的问题是写稿前资料散、重复整理、还担心遗漏来源。",
      before: "原来的内容一上来就说模板里有选题、资料整理、写作、复盘、提示词等很多模块。信息都是真的，但读者看了半天仍不知道“为什么我现在需要它”。",
      after: "改成先说一个最重要结果：“把散乱资料先整理成能直接用于写稿的材料，少在动笔前反复翻找。”随后展示模板里的真实步骤和一份填写示例，最后只邀请读者领取模板试用。",
      result: "内容从“我有什么功能”变成“你现在最麻烦的事，我能具体帮你解决什么”，而且所有依据都来自真实模板和实际过程，没有虚构效果。"
    },
    mistakes: [
      "误区：卖点越多越容易命中用户｜正确理解：所有价值同权会让用户更难判断最重要的结果。",
      "误区：真实功能就自动等于用户价值｜正确理解：功能必须连接当前需求场景才能成为相关价值。",
      "误区：AI 写得像案例就可以当作证据｜正确理解：客户结果、数字和评价必须真实可验证。"
    ],
    related: ["下一阶段会用已明确的对象、情境和价值主线判断哪些主题值得持续做成内容。"],
    practice: {
      title: "把产品信息整理出清晰的先后顺序",
      goal: "用真实目标对象、需求场景、产品能力和已有依据，整理出“最重要的价值、支持依据、补充信息和合适的下一步”。",
      fields: [
        { key: "context", label: "对象与当前问题", prompt: "写清这条内容主要给谁看，以及他现在正在遇到什么真实问题。", example: "对象：自己做内容或经营一人公司的创作者。当前问题：每周都要持续发内容，但资料来自收藏、新闻和聊天记录，写稿前经常重新整理，既耗时又怕漏掉来源。" },
        { key: "value", label: "最想先让对方明白的价值", prompt: "提供这次内容或产品真实能带来的一个核心帮助，不先写营销句式。", example: "这次要推广的是一份 AI 内容工作流模板。它最重要的价值不是“功能很多”，而是先帮创作者把散乱资料整理成能直接用于写稿的材料，减少动笔前反复翻找。" },
        { key: "proof", label: "可用依据", prompt: "列出真实过程、示例、数据或公开来源；没有依据的内容明确排除。", example: "可用依据：模板中真实包含“整理资料来源、提取可用信息、生成写作提纲、完成后复核”这些步骤，也可以展示一份真实填写示例。当前没有可信的“节省70%时间”或“阅读量翻倍”数据，因此这些不能写入。" },
        { key: "output", label: "输出顺序要求", prompt: "要求 AI 只整理信息先后，不制造新的证明或过度承诺。", example: "请按“目标对象和当前问题｜最重要的价值｜真实依据｜补充信息｜下一步｜不应写入”输出。最重要的价值只保留一个主线；下一步只邀请读者领取模板或查看示例，不默认要求立即购买。不要编造用户评价、效果数字、成交结果或不存在的案例。" }
      ],
      hints: ["先决定一个最核心价值，再处理其他信息。", "每条依据都要能说明来源在哪里。", "下一步的强度要匹配用户当前状态。"],
      prompt: "请根据我提供的对象、需求场景、真实能力与已有依据，整理信息的先后顺序；你只负责安排先后和表达结构，不得创造新的客户结果、数字、案例或承诺。",
      reflection: "检查结果：第一眼能否看出一个清楚的最重要的价值？每条依据能否追到真实来源？删掉无关功能后主线是否更清楚？"
    },
    checks: {
      best: { question: "下面哪一种最能让读者先抓住重点？", options: ["这份模板有选题、资料整理、写作、复盘、提示词等很多模块。", "先回应“写稿前资料太散、总要重新整理”这个问题，说明模板能先把资料整理成可直接写稿的材料，再用真实步骤和示例证明，最后邀请领取模板。", "把所有优点都写进第一屏，避免遗漏。"], answer: "B", explanation: "B 先回应目标读者正在遇到的问题，再给出一个最重要价值和真实依据；其他选项都只是把功能平铺出来。" },
      misconception: { question: "判断：价值点越多越有说服力，因为总有一个卖点会打中用户。", answer: false, explanation: "一次沟通需要信息优先级。价值点全部同权会削弱主线，让用户更难判断最相关的结果。" },
      boundary: { question: "哪些内容可以作为可信依据？（多选）", options: ["已经存在且可核验的产品能力", "真实客户案例或明确授权反馈", "可验证的数据或公开来源", "AI 为了增强说服力生成的客户效果数字"], answers: ["A", "B", "C"], explanation: "依据必须可追溯；模型生成的客户结果或数字不能变成真实证明。" }
    },
    review: [
      "根据明确对象和需求场景比较多个价值点，收敛成一个最值得先说的核心价值｜不要把功能数量、术语密度或夸张程度当成价值本身。",
      "帮助整理真实能力、案例、数据和来源，把真实依据放在支持核心价值的位置｜不要发明客户结果、评价、效果数字、成交数据或不存在的证明材料。",
      "根据用户当前状态提出更自然的下一步，并把次要信息放到后面｜不要默认所有场景都立即要求购买，也不要为了转化做无法兑现的承诺。"
    ],
    self: ["我能从很多功能里只保留一个当前最核心价值。", "我能说明每条支持依据的真实来源。", "我能删掉与当前需求场景无关的功能和内部术语。", "我能给出不过度跳跃的下一步。"],
    trigger: "当你已经知道在对谁说、对方也确实有一个具体问题，但文案、介绍页或销售表达仍像功能说明书时，这节课用于重新安排信息优先级，让核心价值更容易被理解和相信。",
    capability: "能把一堆功能和卖点重新排出先后：先说对方现在最关心的价值，再给出真实依据和合适的下一步。",
    next: "下一阶段会从明确对象、需求场景和价值主线出发，判断哪些主题值得持续做成内容，而不是为了更新而更新。"
  }
];

export const track03BatchADrafts = lessons.map(makeTrack03Draft);

export const track03BatchAIntroComparisons = {
  "t3-01-icp-audience-fit": {
    title: "为什么“所有人都可能需要”不是一个可行动的对象判断？",
    situation: "资源有限时，内容、渠道和验证必须先服务某一类真实对象；如果没有优先级，后面的每一步都会继续发散。",
    approaches: [
      { label: "只描述人群", text: "年龄、职业、兴趣写得很多，但仍不知道为什么当前业务应该先投入这一类。" },
      { label: "做业务优先级", text: "把真实问题、价值匹配、证据和资源取舍放到同一标准下比较，先选当前最值得验证的一类。" }
    ],
    comparison: [],
    comparisonPlacement: "BOTTOM" as const,
    takeaway: "优先服务对象的核心不是把人物写得更像真人，而是让业务知道有限资源现在先服务谁。",
    bottomDetails: [
      { title: "相关不等于优先", text: "一个人群可能与产品相关，但如果问题弱、价值不匹配或证据不足，当前仍不一定优先。" },
      { title: "选择必须保留证据边界", text: "没有真实需求和行为证据时，只能形成待验证假设，不能把模型排序当市场事实。" }
    ]
  },
  "t3-02-use-case-fit": {
    title: "为什么知道“是谁”，仍不知道“什么时候会需要”？",
    situation: "同一个目标对象在不同任务和时间里会有完全不同的需求强度；静态画像不能说明当前问题有没有发生。",
    approaches: [
      { label: "停在泛化痛点", text: "只说“想提效、想学 AI”，任何产品都能往上套，却不能指导选题、卖点或方案。" },
      { label: "还原真实情境", text: "写清“什么时候发生、现在怎么做、哪里麻烦、想得到什么”，才知道这个价值为什么现在相关。" }
    ],
    comparison: [],
    comparisonPlacement: "BOTTOM" as const,
    takeaway: "需求场景把“这个人是谁”推进成“什么情况发生时，他为什么会真正需要”。",
    bottomDetails: [
      { title: "同一个对象可以有多个需求场景", text: "内容生产、客户回复、资料整理都可能真实存在，但紧迫度和当前证据不同。" },
      { title: "AI 不是用户事实的来源", text: "AI 可以归纳已有反馈，却不能把“可能痛”写成已经验证的痛点和紧迫度。" }
    ]
  },
  "t3-03-message-hierarchy": {
    title: "为什么功能都是真的，全部说出来还是让人抓不住重点？",
    situation: "用户先判断“这跟我现在的问题有什么关系”，而不是按产品内部模块顺序逐项理解所有功能。",
    approaches: [
      { label: "功能平铺", text: "每个功能都同等强调，信息很多，但用户不知道哪个结果最值得先理解。" },
      { label: "价值分层", text: "先回应当前需求场景里最重要的一个价值，再用真实依据支撑，最后补充次要信息和自然下一步。" }
    ],
    comparison: [],
    comparisonPlacement: "BOTTOM" as const,
    takeaway: "清晰表达不是说得更多，而是让最相关的价值、证据和下一步按正确顺序出现。",
    bottomDetails: [
      { title: "真实功能不自动等于用户价值", text: "必须连接当前对象和需求场景，功能才会变成此刻相关的价值。" },
      { title: "写得好看不能代替真实依据", text: "写得像案例、像数据、像用户评价，都不等于真实证据；证明必须可追溯。" }
    ]
  }
} as const;

export const track03BatchAKnowledgeDepth = {
  "t3-01-icp-audience-fit": {
    example: [
      { title: "为什么先写业务目标", text: "同一类人面对不同业务目标可能有不同优先级；没有目标就没有可解释的资源取舍。" },
      { title: "为什么既要看问题真假，也要看我们能不能解决", text: "问题再强，如果当前产品解决不了，就不是合适对象；产品再强，如果对方没有相关问题，也不应优先。" }
    ],
    review: [
      { title: "为什么画像写得很细，仍不代表服务对象选对了", text: "人口与兴趣字段只有在能影响 问题是不是真的存在、我们能不能帮上忙 或优先级时才有用；否则只是装饰性描述。" },
      { title: "适合与优先有什么不同", text: "多个对象都可能适合，但当前优先还要结合证据强度、业务目标和有限资源。" },
      { title: "证据不足时结论怎样降级", text: "把“最优对象”改成“当前候选假设”，明确哪些只是待验证假设、哪些信息还没确认，而不是让 AI 补足事实。" }
    ]
  },
  "t3-02-use-case-fit": {
    example: [
      { title: "为什么要先说清“什么时候会发生”", text: "需求通常由任务、截止时间、客户事件或业务变化触发；如果连发生的具体情况都说不清，痛点就很容易停在抽象标签。" },
      { title: "为什么真正想要的结果不能写成“用 AI”", text: "用户真正要的是更快交付、更少遗漏、更稳定质量等业务结果，AI 只是实现手段之一。" }
    ],
    review: [
      { title: "为什么同一类人会有多个不同需求场景", text: "同一对象承担不同任务，每个任务的触发、成本和结果都不同，因此不能把一个痛点代表整个人群。" },
      { title: "哪些需求场景值得先验证", text: "优先看重复发生、成本清楚、价值匹配且已有证据的情境；证据不足的场景保留为待验证。" },
      { title: "泛化效率问题怎样变具体", text: "继续追问慢在哪一步、重复什么、造成多少时间或风险、最后希望完成什么，才能形成可行动情境。" }
    ]
  },
  "t3-03-message-hierarchy": {
    example: [
      { title: "为什么一次表达要先抓住一个核心价值", text: "一次沟通可以包含多个真实价值，但用户需要先抓住最相关结果；其余信息应服务主线而不是与它竞争。" },
      { title: "为什么价值后面要马上有真实依据", text: "价值回答“有什么用”，依据回答“为什么相信”；两者分开太远，或者依据本身不真实，都会削弱可信度。" }
    ],
    review: [
      { title: "功能怎样变成价值", text: "只有把功能连接到对方现在正在遇到的问题和想得到的结果，它才会变成真正和用户有关的价值。" },
      { title: "真实依据不等于堆数据", text: "数据、案例和评价必须与当前价值直接相关且可追溯；无关数字再多也不能证明核心主张。" },
      { title: "为什么下一步不能总是“立即购买”", text: "用户当前认知与信任程度不同，体验、查看方法、进一步了解或咨询都可能比立即购买更自然。" }
    ]
  }
} as const;

export const track03BatchATriggerScenarios = Object.fromEntries(
  lessons.map((lesson) => [lesson.id, lesson.trigger])
) as Record<string, string>;
