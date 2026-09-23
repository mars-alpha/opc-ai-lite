import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  type CourseBuilderBuildDraft
} from "../../lib/learning/course-builder";

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

type LessonConfig = {
  id: string;
  canonicalId: string;
  title: string;
  type: "CONCEPT" | "APPLICATION";
  prerequisites: string[];
  mainQuestion: string;
  mainConcept: string;
  allowedCoreTerms: string[];
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
    boundary: { question: string; options: [string, string, string, string]; answers: Array<"A" | "B" | "C" | "D">; explanation: string };
  };
  review: string[];
  self: string[];
  trigger: string;
  capability: string;
  next: string;
};

function makeDraft(config: LessonConfig): CourseBuilderBuildDraft {
  const application = config.type === "APPLICATION";
  const referenceValues = config.practice.fields.map((field) => field.example);
  const practice = {
    id: config.id.replace(/-/g, "_") + "_practice",
    title: config.practice.title,
    goal: config.practice.goal,
    instructions: config.practice.fields.map(({ key, label, prompt }) => ({ key, label, prompt })),
    hints: config.practice.hints,
    rubric: config.practice.fields.map((field, index) => ({
      key: field.key,
      label: field.label + "明确",
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
        "TRACK01_T11_T20_FORMAL_BRIEFS_V1.md",
        "DEFERRED_KNOWLEDGE_LEDGER_V1.md",
        "LESSON_OUTPUT_CONTRACT_V1.md",
        "TRACK01_CATALOG_METADATA_V2.md"
      ],
      researchSummary: config.summary + " 当前只生成 Track 01 Beginner 所需判断与最小动作；工程实现细节进入 Deferred Knowledge Ledger。"
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
        allowedCoreTerms: config.allowedCoreTerms,
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
      version: "1.0.0-track01-" + config.canonicalId.toLowerCase().replace("-", ""),
      courseSlug: "foundation-ai",
      lessonId: config.id,
      title: config.title,
      lessonType: config.type,
      learningObjectives: [
        config.mainConcept,
        "能在真实任务中判断本课能力什么时候应该使用、什么时候不应该使用。",
        "能完成本课 Step 4 的最小真实动作，并留下可检查结果。"
      ],
      knowledgePoints: config.points,
      prerequisites: config.prerequisites,
      requiresExample: true,
      requiresCheck: true,
      practiceMode: application ? "GUIDED" : "NONE",
      realAiOperation: "NONE",
      realAiEvidence: "NONE",
      referenceAnswerEnabled: true,
      reviewEnabled: true,
      selfAssessmentEnabled: true,
      courseFeedbackEnabled: true,
      completionGates: application ? ["CHECK", "PRACTICE"] : ["CHECK"],
      steps: [
        { id: "explain", kind: "EXPLAIN", title: config.mainQuestion, objective: "建立本课唯一主问题与核心判断，不提前展开工程实现。" },
        { id: "example", kind: "EXAMPLE", title: config.example.title, objective: "用真实案例看见核心规律，而不是只记住术语。" },
        { id: "check", kind: "CHECK", title: "你能不能做出正确判断", objective: "用三题检查最佳判断、常见误解和适用边界。" },
        { id: "practice", kind: "PRACTICE", title: config.practice.title, objective: config.practice.goal },
        { id: "review", kind: "REVIEW", title: "以后遇到类似任务，记住这两个边界", objective: "回答 AI 适合做什么，以及 AI 不应该替你做什么。" },
        { id: "capability", kind: "CAPABILITY", title: "你已经能把这项能力用到真实任务里", objective: "确认会做什么、如何自证，以及下一步为什么值得继续。" }
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
        correctFeedback: "正确。你抓住了本课最重要的判断：" + config.mainConcept,
        incorrectFeedback: "再回到前两步，只判断当前问题真正需要的能力边界，不要把更复杂的实现细节带进来。"
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
        correctFeedback: "正确。你没有把本课能力夸大成万能机制。",
        incorrectFeedback: "本课只建立最小可用判断；能力、权限、可靠性和事实正确性仍是不同问题。"
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
        correctFeedback: "正确。你已经能把本课能力放回真实任务边界里判断。",
        incorrectFeedback: "重新检查：哪些选项真的需要本课能力，哪些只是看起来更复杂。"
      }
    ],
    practice,
    hints: config.practice.hints,
    referenceAnswer: referenceValues.join("\n"),
    review: config.review,
    selfAssessment: config.self
  };
}

export const track01T111Draft = makeDraft({
  id: "t1-11-api",
  canonicalId: "T1-11",
  title: "应用程序编程接口（API）：AI 产品怎样和其他系统交换信息",
  type: "CONCEPT",
  prerequisites: ["T1-06"],
  mainQuestion: "两个系统为什么需要一个明确的接口才能稳定交换信息？",
  mainConcept: "应用程序编程接口（API）是系统之间约定好的通信边界；最小关系是请求（Request）进入接口，再得到响应（Response）。",
  allowedCoreTerms: ["API", "Request/Response"],
  summary: "你会看懂应用程序编程接口（API）的最小作用：让两个系统按照约定交换请求和结果，而不是互相猜内部状态。",
  explanation: "当 AI 产品需要订单状态、客户资料或其他系统能力时，它通常不能靠猜测得到真实结果，而要通过对方提供的应用程序编程接口（API）提出请求并接收响应。",
  why: "理解接口边界后，你会知道“让 AI 接系统”首先是系统通信问题，不是先写更复杂的提示词。",
  points: [
    "应用程序编程接口（API）是两个系统之间约定好的通信边界。",
    "请求（Request）说明要什么以及提供哪些必要输入。",
    "响应（Response）返回结果、状态或错误。",
    "API 不是 AI 专属；AI 产品只是调用者或被调用者之一。",
    "有接口不代表任何调用都被允许，权限属于后续安全边界。"
  ],
  body: [
    "接口把双方需要知道的内容限制在明确输入和输出上，调用方不需要知道对方内部怎样实现。",
    "看到“AI 要读取另一个系统的数据”时，先问有没有稳定接口，而不是让模型根据描述猜系统里的真实状态。"
  ],
  example: {
    title: "查询订单状态：让 AI 猜，还是向订单系统发请求",
    situation: "客服要回答客户订单是否已经发货，真实状态只存在订单系统里。",
    before: "直接让 AI 根据客户描述猜测订单状态，答案看起来合理，却没有真实系统依据。",
    after: "AI 产品通过订单系统提供的应用程序编程接口（API）提交订单编号，接口返回当前订单状态，再由 AI 整理成客服可读回答。",
    result: "系统间的职责变清楚：订单系统提供真实状态，AI 负责提出请求和整理结果。"
  },
  mistakes: [
    "误区：API 是 AI 专属技术｜正确理解：API 是系统之间通用的通信边界。",
    "误区：有 API 就能读取任何数据｜正确理解：接口存在和调用权限是两回事。"
  ],
  related: ["下一课会继续解决：接口返回的 AI 结果怎样变成程序可以稳定接收的结构。"],
  practice: {
    title: "把一个跨系统需求写成最小接口任务",
    goal: "把一个跨系统查询写成可直接交给 AI 帮你整理的接口任务：查询目标、必要信息和返回要求。",
    fields: [
      { key: "need", label: "查询目标", prompt: "写清这个接口要帮助谁完成什么查询。", example: "请帮我设计一个用于客服查询订单发货状态的最小接口任务。" },
      { key: "input", label: "必要信息", prompt: "写出完成查询真正必须提供的最少信息。", example: "查询时只提供订单编号作为必要输入，不要求无关客户资料。" },
      { key: "response", label: "返回要求", prompt: "写清成功和失败时分别要返回什么。", example: "请返回订单状态和更新时间；查不到时返回明确错误，不要让 AI 猜测订单状态。" }
    ],
    hints: ["只描述系统边界，不写 HTTP 方法或代码。", "请求输入应该是完成查询真正需要的数据。"],
    prompt: "请把这个跨系统需求整理成最小接口说明：调用方要解决什么、请求需要哪些输入、对方应返回什么结果。",
    reflection: "检查你的说明是否已经让两个系统的输入和输出边界变得明确。"
  },
  checks: {
    best: { question: "客服要回答真实订单状态，哪种做法最符合本课？", options: ["让 AI 根据聊天内容猜状态", "通过订单系统接口提交订单编号并读取返回状态", "把整套客服话术交给 AI"], answer: "B", explanation: "真实订单状态属于外部系统事实，应通过明确接口获取。" },
    misconception: { question: "判断：只要系统提供了应用程序编程接口（API），AI 就自动拥有读取所有数据的权限。", answer: false, explanation: "接口是通信边界，不等于权限授权。" },
    boundary: { question: "哪些情况体现了 API 的基本作用？（多选）", options: ["订单系统接收订单编号并返回状态", "天气服务接收城市并返回天气数据", "让 AI 自己猜数据库里的余额", "两个系统约定固定输入输出交换数据"], answers: ["A","B","D"], explanation: "API 的核心是系统按约定交换请求和响应，不是模型猜测外部真实状态。" }
  },
  review: [
    "根据明确接口读取另一个系统里的真实数据，并把请求和响应组织成后续可以继续处理的结果｜不要替你猜数据库、订单、库存或账户里的当前状态；没有真实接口返回时，不能把生成内容当成系统事实。",
    "按照接口约定填写必要输入、读取成功或错误响应，并帮助你解释结果｜不要替你自行增加未授权参数、绕过权限，或把“存在接口”理解成“已经拥有访问权”。"
  ],
  self: ["我能用请求（Request）和响应（Response）解释一个接口任务。", "我能看到跨系统需求时先找接口边界，而不是先写提示词。"],
  trigger: "当任务需要 AI 读取另一个系统的真实数据或能力时，我会先确认是否存在明确接口、需要什么输入、应该返回什么。",
  capability: "能把一个跨系统需求拆成最小请求输入与响应结果。",
  next: "下一课继续解决：怎样用结构化输出（Structured Output）与结构规则让程序稳定接收 AI 结果。"
});

export const track01T112Draft = makeDraft({
  id: "t1-12-structured-output-schema",
  canonicalId: "T1-12",
  title: "结构化输出（Structured Output）与结构规则：怎样让系统稳定接收 AI 结果",
  type: "APPLICATION",
  prerequisites: ["T1-11"],
  mainQuestion: "AI 的结果要交给程序继续处理时，为什么“写得清楚”还不够？",
  mainConcept: "结构化输出（Structured Output）把结果放进明确字段，结构规则规定字段及基本要求，让程序能够稳定读取。",
  allowedCoreTerms: ["Structured Output"],
  summary: "你会把自由文本结果改成明确字段，并用最小结构规则说明系统需要接收什么。",
  explanation: "人可以从一段话里理解姓名、意向和下一步，但程序更需要固定字段。结构化输出（Structured Output）负责按结构返回，结构规则负责约定字段及基本要求。",
  why: "AI 结果一旦要进入表格、数据库、自动化或下一段程序，字段稳定性就比文案是否漂亮更重要。",
  points: [
    "自由文本适合人读，但字段位置和表达可能变化。",
    "结构化输出（Structured Output）把结果拆成明确字段。",
    "结构规则定义有哪些字段、字段代表什么以及最基本要求。",
    "结构正确不代表事实正确；内容仍需独立核验。",
    "最小验证先检查必需字段是否存在、格式是否符合要求。"
  ],
  body: [
    "初学阶段不需要学习完整的数据结构规则语法，只要先会把系统真正需要的信息拆成稳定字段。",
    "字段数量由任务需要决定；不是字段越多越专业。"
  ],
  example: {
    title: "客户跟进结果：一段话和三个字段有什么区别",
    situation: "销售把客户聊天交给 AI，希望后续系统自动创建跟进任务。",
    before: "AI 返回一段自然语言：客户李女士对企业版感兴趣，下周二再联系，她特别关心团队权限。",
    after: "AI 按约定返回客户姓名、意向、下一步三个字段，每个字段都对应后续系统明确用途。",
    result: "程序不用再猜一段文字里哪部分是姓名、哪部分是下一步，后续自动化更稳定。"
  },
  mistakes: [
    "误区：用了结构化输出，内容就一定正确｜正确理解：结构稳定和事实正确是两个问题。",
    "误区：字段越多越稳定｜正确理解：只保留后续系统真正需要的字段。"
  ],
  related: ["下一课会让 AI 根据任务选择并调用外部工具，结构化参数会继续发挥作用。"],
  practice: {
    title: "把一段自由文本结果改成稳定字段",
    goal: "把一段真实内容整理成后续系统可以直接读取的结构化结果，并写清必要字段与缺失处理规则。",
    fields: [
      { key: "source", label: "待处理内容", prompt: "放入一段真实或示例内容，让 AI 有具体材料可以处理。", example: "待处理内容：客户李女士表示对企业版感兴趣，希望下周二再联系，并特别关心团队权限。" },
      { key: "usage", label: "使用场景", prompt: "写清这份结果接下来要交给什么系统或流程使用。", example: "请把这段内容整理成销售跟进系统可以直接读取的结构化结果。" },
      { key: "fields", label: "输出字段", prompt: "只列出后续系统真正需要的字段。", example: "输出只保留三个字段：客户姓名、客户意向、下一步行动。" },
      { key: "rules", label: "字段规则", prompt: "写清必填、缺失和不能编造的规则。", example: "客户姓名和下一步行动必须有值；无法判断时留空并标记“需要人工确认”，不要编造。" }
    ],
    hints: ["字段从后续用途倒推，不要为了完整而堆字段。", "这里只做最小结构，不需要写完整的数据结构规则。"],
    prompt: "请根据后续系统用途，把这个 AI 结果设计成最小结构化输出：列出必要字段、字段含义和最小必填规则。",
    reflection: "检查这些字段是否真的能让程序稳定接收，而不是把自由文本换一个排版。"
  },
  checks: {
    best: { question: "AI 的客户总结要交给程序创建跟进任务，哪种要求最合适？", options: ["只要求写得专业", "明确客户姓名、意向、下一步等固定字段", "让 AI 每次自由决定输出格式"], answer: "B", explanation: "程序需要稳定字段，而不是依赖自然语言位置和写法。" },
    misconception: { question: "判断：只要 AI 严格按结构规则输出，字段里的事实就一定正确。", answer: false, explanation: "结构规则约束输出结构，不自动保证事实正确。" },
    boundary: { question: "哪些属于结构化输出要解决的问题？（多选）", options: ["固定字段名称", "说明必要字段", "验证字段是否存在", "保证所有业务事实绝对正确"], answers: ["A","B","C"], explanation: "结构化输出负责结构和基本验证，不替代事实核验。" }
  },
  review: [
    "把自由文本整理成后续表格、数据库或自动化可以稳定读取的固定字段，并按规则标记缺失内容｜不要替你编造缺失字段，也不要因为格式完整就把未经核实的内容当成真实事实。",
    "根据后续系统真正需要的用途生成最小结构，并保持字段名称、类型和必填规则稳定｜不要替你无限增加字段、擅自改变业务含义，或把结构验证当成事实验证。"
  ],
  self: ["我能把一段自由文本拆成后续系统真正需要的字段。", "我能区分结构验证与事实核验。"],
  trigger: "当 AI 结果要交给表格、数据库、自动化或程序继续处理时，我会先把结果设计成稳定字段和最小规则。",
  capability: "能为一个 AI 输出定义最小字段结构和基本接收规则。",
  next: "下一课继续解决：什么时候 AI 应该停止自己回答，转而调用外部工具。"
});

export const track01T113Draft = makeDraft({
  id: "t1-13-function-calling-tool-use",
  canonicalId: "T1-13",
  title: "函数调用（Function Calling）与工具使用（Tool Use）：AI 怎样调用外部能力",
  type: "CONCEPT",
  prerequisites: ["T1-11","T1-12"],
  mainQuestion: "什么时候 AI 应该停止“自己回答”，转而调用一个外部工具？",
  mainConcept: "工具（Tool）提供模型之外的真实能力；函数调用（Function Calling）让模型按约定提出要调用什么以及需要哪些参数。",
  allowedCoreTerms: ["Function Calling", "Tool Use"],
  summary: "你会区分“模型回答”和“工具执行”，并知道何时应该让 AI 调用真实外部能力。",
  explanation: "模型可以生成文字，但库存、日历、付款、搜索等真实能力通常属于外部工具。需要真实数据或动作时，应让系统执行工具，再把结果交回模型。",
  why: "把所有事情都当成问答，会让 AI 在没有真实数据或执行能力时产生看似合理的猜测。",
  points: [
    "工具（Tool）是模型之外可以查询数据或执行动作的能力。",
    "函数调用（Function Calling）让模型按约定描述要调用哪个能力和参数。",
    "最小链路是理解任务 → 选择工具 → 形成参数 → 系统执行 → 返回结果。",
    "模型提出调用不等于模型自己拥有执行权限。",
    "需要真实数据或真实动作时，优先使用对应工具，而不是让模型猜。"
  ],
  body: [
    "工具使用（Tool Use）的重点不是让模型更会聊天，而是让模型知道何时需要外部能力。",
    "权限、超时、重试和工具可靠性属于后续工程层，本课只建立调用边界。"
  ],
  example: {
    title: "查询实时库存：模型回答和工具执行不是一回事",
    situation: "用户问某款商品现在还有没有库存，库存只存在仓库系统里。",
    before: "AI 根据历史描述或常识直接回答“应该还有库存”。",
    after: "AI 判断需要实时库存工具，系统用商品编号调用库存查询，再把真实返回结果交给 AI 组织回答。",
    result: "模型负责判断和表达，工具负责获取外部真实数据，两者职责分开。"
  },
  mistakes: [
    "误区：模型会调用工具就等于模型自己执行一切｜正确理解：真正执行由系统和工具完成。",
    "误区：能直接回答就不需要工具｜正确理解：涉及实时或外部真实数据时应优先查询工具。"
  ],
  related: ["下一课继续解决：工具和资源越来越多时，为什么需要统一连接方式。"],
  practice: {
    title: "给一个真实任务定义最小工具边界",
    goal: "写清工具用途、必要输入、返回结果和禁止动作。",
    fields: [
      { key: "purpose", label: "工具用途", prompt: "写清这个工具只负责完成什么。", example: "请帮我定义一个“查询指定商品当前可售库存”的最小工具。" },
      { key: "input", label: "必要输入", prompt: "写出工具执行所需的最少参数。", example: "工具执行时只接收商品编号作为必要输入。" },
      { key: "output", label: "返回结果", prompt: "写出调用后应该返回什么。", example: "请返回可售数量、更新时间和查询状态。" },
      { key: "forbidden", label: "禁止动作", prompt: "写清这个工具不应该做什么。", example: "这个工具只允许查询，不得修改库存、创建订单或执行其他写入动作。" }
    ],
    hints: ["一个工具先保持单一职责。", "不要在本课设计重试、超时或权限系统。"],
    prompt: "请把这个外部能力整理成最小工具说明：用途、必要输入、返回结果、禁止动作。",
    reflection: "检查模型是否只负责选择和提出调用，而真正执行仍由系统控制。"
  },
  checks: {
    best: { question: "用户询问实时库存时，哪种做法最合理？", options: ["让模型凭常识估计库存", "调用库存工具取得真实结果后再回答", "只优化提示词让回答更自信"], answer: "B", explanation: "实时库存属于外部系统真实状态，应使用对应工具。" },
    misconception: { question: "判断：模型决定调用某个工具，就表示它已经拥有该工具的全部执行权限。", answer: false, explanation: "模型提出调用和系统授予权限是不同层。" },
    boundary: { question: "哪些情况更适合使用外部工具？（多选）", options: ["查询实时库存", "创建日历事件", "纯创意起名", "读取当前账户状态"], answers: ["A","B","D"], explanation: "真实外部数据和动作需要工具；纯创意任务通常不需要。" }
  },
  review: [
    "在任务需要实时数据或真实动作时，判断应该调用哪个外部工具，并按约定准备必要参数｜不要替你用模型记忆猜库存、账户、日历等外部状态，也不要把“提出调用”当成“已经执行成功”。",
    "利用工具返回的真实结果继续解释、整理或决定下一步建议｜不要替系统授予自己执行权限，也不要让只负责查询的工具顺便修改数据、下单或完成其他越界动作。"
  ],
  self: ["我能判断任务是模型回答还是需要工具执行。", "我能定义一个工具的输入、输出和禁止动作。"],
  trigger: "当任务依赖实时数据或要执行外部动作时，我会先判断是否需要工具，而不是让模型猜。",
  capability: "能把“让 AI 做事”拆成模型判断与外部工具执行两层。",
  next: "下一课继续解决：怎样用模型上下文协议（MCP）统一连接越来越多的工具和资源。"
});

export const track01T114Draft = makeDraft({
  id: "t1-14-mcp",
  canonicalId: "T1-14",
  title: "模型上下文协议（MCP）：为什么 AI 需要统一连接工具与资源",
  type: "CONCEPT",
  prerequisites: ["T1-13"],
  mainQuestion: "当 AI 要连接很多工具和资源时，为什么需要一套统一连接约定？",
  mainConcept: "模型上下文协议（MCP）提供较统一的连接约定，让 AI 应用更一致地发现和使用外部工具与资源。",
  allowedCoreTerms: ["MCP", "Tool"],
  summary: "你会理解模型上下文协议（MCP）解决的是“统一连接”问题，而不是替代 API、工具或权限系统。",
  explanation: "如果每接一个文件系统、知识库或业务工具都写一套专属连接，AI 应用会越来越难维护。模型上下文协议（MCP）提供更统一的连接约定。",
  why: "理解 MCP 的位置后，你不会把 API、Tool 和 MCP 混成同一个概念，也不会把“接上 MCP”误解成“自动拥有能力”。",
  points: [
    "模型上下文协议（MCP）关注 AI 应用连接外部工具与资源时的统一约定。",
    "API 关注系统之间怎样通信，Tool 关注可调用能力，MCP 关注更统一地连接这些能力和资源。",
    "MCP 不替代具体 API，也不自动让工具更安全。",
    "接入 MCP 不等于自动获得所有权限。",
    "初学阶段只需要理解统一连接层的价值。"
  ],
  body: [
    "MCP 的价值来自连接数量增加后的复用，不是因为协议名字更先进。",
    "协议实现、传输方式和 Server 开发进入后续工程课程。"
  ],
  example: {
    title: "同一个 AI 工作台要接文件、知识库和业务工具",
    situation: "一个 AI 工作台需要读取团队文件、搜索知识库并调用工单工具。",
    before: "每接一个来源都在应用里写一套完全不同的专属连接逻辑，维护成本持续上升。",
    after: "应用通过统一连接约定识别可用资源和工具，再由具体系统执行各自能力。",
    result: "连接方式更一致，但具体工具权限、数据真实性和执行安全仍由对应系统控制。"
  },
  mistakes: [
    "误区：MCP 是 API 的替代品｜正确理解：MCP 解决统一连接，底层能力仍可能由 API 等方式提供。",
    "误区：接上 MCP 就自动拥有所有工具权限｜正确理解：连接和授权是不同问题。"
  ],
  related: ["下一课从“连接能力”转向“复用方法”：什么时候值得沉淀成技能（Skill）。"],
  practice: {
    title: "判断哪些资源值得统一接入",
    goal: "为一个 AI 工作台列出需要连接的资源或工具，并说明统一连接的价值。",
    fields: [
      { key: "workspace", label: "AI 工作台任务", prompt: "写出这个 AI 工作台主要要完成什么。", example: "请为“查询内部资料并在需要时创建工单”的 AI 工作台设计连接方案。" },
      { key: "connections", label: "需要连接", prompt: "列出最重要的资源或工具。", example: "需要连接团队文件、知识库和工单工具三类资源。" },
      { key: "value", label: "统一连接价值", prompt: "说明为什么不希望每个连接都做一套专属适配。", example: "请说明怎样用统一连接约定减少重复接入，同时保留各工具自己的权限控制。" }
    ],
    hints: ["先判断连接对象，不讨论传输协议。", "不要把 MCP 写成权限系统。"],
    prompt: "请分析这个 AI 工作台需要连接哪些资源或工具，以及为什么统一连接约定有价值。",
    reflection: "检查你是否能区分“连接方式统一”和“具体能力/权限由谁负责”。"
  },
  checks: {
    best: { question: "一个 AI 工作台要接很多工具和资源，MCP 最主要解决什么？", options: ["让模型自动拥有所有权限", "提供更统一的连接约定", "替代所有外部 API"], answer: "B", explanation: "MCP 的核心位置是统一连接，不是自动授权或替代所有接口。" },
    misconception: { question: "判断：只要接入模型上下文协议（MCP），工具权限和安全问题就会自动解决。", answer: false, explanation: "统一连接不能替代权限和安全控制。" },
    boundary: { question: "哪些说法符合本课对 MCP 的定位？（多选）", options: ["统一连接工具与资源", "不自动授予权限", "可以与具体 API 共存", "等同于 Agent"], answers: ["A","B","C"], explanation: "MCP 是连接约定，不等于 Agent，也不消除具体接口和权限。" }
  },
  review: [
    "在一个 AI 应用需要连接多个工具和资源时，通过模型上下文协议（MCP）更一致地发现和使用这些能力，减少重复接入逻辑｜不要替你把 MCP 当成具体业务能力本身；它不能代替实际 API、工具实现或真实数据来源。",
    "按照统一连接约定使用已经暴露的资源和工具，让不同连接方式更容易复用和维护｜不要替系统自动获得权限、扩大可访问范围，或把“连接成功”理解成“安全与授权问题已经解决”。"
  ],
  self: ["我能用自己的话说明 API、Tool 与 MCP 各自关注什么。", "我知道 MCP 解决统一连接，不自动解决权限。"],
  trigger: "当一个 AI 应用需要连接越来越多工具和资源时，我会先区分这是接口、工具能力还是统一连接问题。",
  capability: "能识别一个问题是在讨论接口、工具能力，还是统一连接层。",
  next: "下一课继续解决：一个反复成功的方法什么时候值得沉淀成技能（Skill）。"
});

export const track01T115Draft = makeDraft({
  id: "t1-15-skill",
  canonicalId: "T1-15",
  title: "技能（Skill）：把可复用的方法交给 AI",
  type: "CONCEPT",
  prerequisites: ["T1-02","T1-13"],
  mainQuestion: "一个反复成功的方法，什么时候值得从“每次重新说明”变成可复用技能？",
  mainConcept: "技能（Skill）适合沉淀反复出现、判断逻辑相对稳定的方法，并明确使用条件、输入、输出和禁止动作。",
  allowedCoreTerms: ["Skill", "Input/Output"],
  summary: "你会判断什么值得沉淀成技能（Skill），并能定义它的单一职责和边界。",
  explanation: "如果一个方法已经被反复验证，每次都重新写长说明会增加漂移。技能（Skill）把稳定方法固化成可重复调用的语义能力。",
  why: "Skill 的价值不是让提示词变长，而是减少重复说明，让方法边界和结果标准更稳定。",
  points: [
    "技能（Skill）适合复用反复出现且相对稳定的方法。",
    "一个 Skill 应优先保持单一职责。",
    "最小定义包括何时使用、需要什么输入、输出什么结果、哪些动作禁止。",
    "一次性或还没验证稳定的方法不急着做 Skill。",
    "Skill 不天然拥有发布、权限或生产数据修改权。"
  ],
  body: [
    "把所有规则都塞进一个万能 Skill 会让职责模糊，后续很难测试和维护。",
    "是否值得做 Skill，先看重复性和稳定性，再看是否有清楚输入输出。"
  ],
  example: {
    title: "会议记录整理：每次重新解释，还是沉淀成一个 Skill",
    situation: "团队每周都要把会议记录整理成行动项、负责人和截止时间。",
    before: "每次都临时写一大段提示词，字段和判断标准经常发生变化。",
    after: "把已经稳定的方法沉淀成单一职责 Skill：输入会议记录，输出行动项列表，并明确不得自行承诺负责人未确认的截止时间。",
    result: "方法可以重复使用，同时仍保留清楚输入、输出和禁止动作。"
  },
  mistakes: [
    "误区：任何长提示词都应该做 Skill｜正确理解：先确认方法是否反复使用且已经稳定。",
    "误区：一个 Skill 做得越多越好｜正确理解：单一职责更容易复用、验证和维护。"
  ],
  related: ["下一课继续解决：多个稳定步骤怎样组成工作流（Workflow），哪些步骤适合自动化。"],
  practice: {
    title: "定义一个最小 Skill",
    goal: "选择一个反复出现的方法，定义使用条件、输入、输出和禁止动作。",
    fields: [
      { key: "trigger", label: "何时使用", prompt: "写出什么情况下应该调用这个 Skill。", example: "请帮我定义一个用于“把团队会议记录整理成可执行行动项”的最小技能（Skill）。" },
      { key: "input", label: "输入", prompt: "写出完成任务真正需要的输入。", example: "输入是一份会议记录正文。" },
      { key: "output", label: "输出", prompt: "写出稳定输出应该包含什么。", example: "输出包含行动项、负责人、截止时间和待确认项。" },
      { key: "forbidden", label: "禁止动作", prompt: "写出 Skill 不应该替用户做什么。", example: "不得自行补充未明确的负责人或截止时间，无法确定时必须标记待确认。" }
    ],
    hints: ["优先选择你已经重复做过的方法。", "如果职责一句话说不清，先不要把它做成 Skill。"],
    prompt: "请把这个重复方法定义成最小 Skill：何时使用、需要什么输入、输出什么、哪些动作禁止。",
    reflection: "检查这个 Skill 是否只有一个主要职责，并且可以独立验证结果。"
  },
  checks: {
    best: { question: "哪种情况最值得沉淀成 Skill？", options: ["只会做一次的临时任务", "每周重复且规则已经稳定的会议整理方法", "还没验证过的万能助手想法"], answer: "B", explanation: "Skill 优先沉淀重复且稳定的方法。" },
    misconception: { question: "判断：Skill 的职责越多越好，这样一个 Skill 可以解决所有问题。", answer: false, explanation: "单一职责通常更容易复用、验证和维护。" },
    boundary: { question: "一个最小 Skill 定义通常应该明确哪些内容？（多选）", options: ["何时使用", "输入与输出", "禁止动作", "自动获得生产权限"], answers: ["A","B","C"], explanation: "Skill 定义方法边界，不自动获得生产权限。" }
  },
  review: [
    "把已经反复验证、输入输出和判断边界相对稳定的方法沉淀成可重复调用的技能（Skill）｜不要替你把一次性、仍在变化或还没验证的方法过早固化，否则错误规则也会被重复放大。",
    "按照明确的使用条件、输入、输出和禁止动作重复执行同一类方法，减少每次重新解释造成的漂移｜不要替你把多个无关职责塞进一个万能 Skill，也不要因为做成 Skill 就自动获得发布、付款或修改生产数据的权限。"
  ],
  self: ["我能判断一个方法是否已经值得沉淀成 Skill。", "我能写出 Skill 的使用条件、输入、输出和禁止动作。"],
  trigger: "当一个方法反复出现且规则已经稳定时，我会判断它是否值得沉淀成单一职责的技能（Skill）。",
  capability: "能判断并定义一个最小、单一职责、可复用的 Skill。",
  next: "下一课继续解决：怎样把多个稳定步骤组成工作流（Workflow），并判断哪些节点适合自动化。"
});

export const track01T116Draft = makeDraft({
  id: "t1-16-workflow-automation",
  canonicalId: "T1-16",
  title: "工作流（Workflow）与自动化（Automation）：把一次方法变成可重复流程",
  type: "APPLICATION",
  prerequisites: ["T1-15"],
  mainQuestion: "一个已经验证有效的做法，怎样拆成稳定步骤，再决定哪些步骤适合自动运行？",
  mainConcept: "工作流（Workflow）把任务拆成有顺序、输入输出和条件的步骤；自动化（Automation）只让适合的步骤按规则自动执行。",
  allowedCoreTerms: ["Workflow", "Automation"],
  summary: "你会把一个重复任务拆成最小工作流，并区分规则代码、AI 和人工确认各自适合的节点。",
  explanation: "自动化不是先找一个 AI 把所有事情做完，而是先把已经验证有效的方法拆成步骤，再决定每一步最适合由规则、AI 还是人完成。",
  why: "没有先证明流程就直接自动化，只会把错误流程执行得更快、更难发现。",
  points: [
    "工作流（Workflow）是有明确顺序、输入输出和条件的步骤链。",
    "自动化（Automation）让适合的步骤按规则自动执行。",
    "先证明流程，再自动化。",
    "确定性强的步骤优先普通代码或规则；语义理解和灵活判断再交给 AI。",
    "高风险或关键授权步骤应保留人工确认。"
  ],
  body: [
    "Workflow 的价值来自职责清晰，不是节点越多越专业。",
    "同一流程可以同时包含普通代码、AI Skill、外部工具和人工确认。"
  ],
  example: {
    title: "内容发布前，为什么不应该直接让 AI 一键全自动",
    situation: "团队每天需要收集资料、生成内容、检查事实并发布。",
    before: "把“收集到发布”全部交给一个 AI，任何一步出错都很难知道问题发生在哪里。",
    after: "拆成资料收集→内容生成→事实检查→人工确认→发布，每个节点都标明输入、输出和执行者。",
    result: "流程可以逐步自动化，而且错误更容易定位，关键发布权仍受控制。"
  },
  mistakes: [
    "误区：自动化就是把所有步骤交给 AI｜正确理解：确定性步骤通常更适合代码或规则。",
    "误区：流程越长越成熟｜正确理解：只保留完成目标真正需要的节点。"
  ],
  related: ["下一课继续解决：固定 Workflow 不够时，什么时候才需要智能体（Agent）的动态决策。"],
  practice: {
    title: "把一个重复任务拆成最小 Workflow",
    goal: "把任务拆成 3～6 个节点，并为每个节点标记输入、输出和执行者。",
    fields: [
      { key: "goal", label: "流程目标", prompt: "写出整个 Workflow 最终要完成什么。", example: "请把“每天把已审核资料整理成一篇待发布内容”设计成一个最小工作流（Workflow）。" },
      { key: "steps", label: "关键节点", prompt: "按顺序写出 3～6 个必要节点。", example: "流程按“读取资料 → 生成初稿 → 核验事实 → 人工确认 → 发布”执行。" },
      { key: "owners", label: "执行者", prompt: "标记每个节点由规则代码、AI、工具还是人工负责。", example: "执行者分工：读取由代码完成，生成由 AI 完成，核验由工具和 AI 配合，确认由人工完成，发布由系统执行。" },
      { key: "boundary", label: "失败/确认边界", prompt: "指出哪个节点失败要停止，哪个节点必须人工确认。", example: "事实核验失败时停止流程；正式发布前必须由人工确认。请输出清晰的流程节点和每个节点的职责。" }
    ],
    hints: ["先拆职责，再谈自动化。", "能确定执行的节点不要为了使用 AI 而使用 AI。"],
    prompt: "请把这个重复任务整理成最小 Workflow：目标、节点顺序、每个节点执行者，以及停止/人工确认边界。",
    reflection: "检查你的流程是不是先稳定，再自动化，而不是把不清楚的过程直接全交给 AI。"
  },
  checks: {
    best: { question: "要自动化一个重复业务流程，第一步最应该做什么？", options: ["先找最强 Agent", "先把已验证方法拆成清楚步骤和边界", "先把所有节点都交给 AI"], answer: "B", explanation: "稳定 Workflow 是自动化前提。" },
    misconception: { question: "判断：只要一个节点可以让 AI 完成，就应该优先让 AI 来做。", answer: false, explanation: "确定性强的节点通常普通代码更稳定。" },
    boundary: { question: "哪些节点更适合保留人工确认或明确停止条件？（多选）", options: ["正式发布", "高额退款", "读取固定配置", "事实核验失败后的继续执行"], answers: ["A","B","D"], explanation: "高影响动作和关键失败边界需要更强控制。" }
  },
  review: [
    "把已经稳定的重复任务拆成有顺序的步骤，并在真正需要理解、归纳或灵活判断的节点使用 AI｜不要替你把尚未稳定的流程直接自动化，也不要让 AI 接管本来用普通代码或固定规则就能可靠完成的确定性步骤。",
    "在多个步骤之间传递结果、根据既定条件继续执行，并帮助处理可验证的中间任务｜不要替你跨过事实核验失败、正式发布、付款等停止点；高影响节点必须按规则停下或交给人工确认。"
  ],
  self: ["我能把一个重复任务拆成有顺序的节点。", "我能判断一个节点更适合代码、AI、工具还是人工。"],
  trigger: "当一个重复任务准备自动化时，我会先把流程步骤、执行者和停止或确认边界拆清楚。",
  capability: "能设计一个最小 Workflow，并识别适合自动化与必须保留控制的节点。",
  next: "下一课继续解决：什么时候固定 Workflow 已经不够，需要智能体（Agent）在运行中动态选择下一步。"
});

export const track01T117Draft = makeDraft({
  id: "t1-17-agent",
  canonicalId: "T1-17",
  title: "智能体（Agent）：什么时候才需要动态决策",
  type: "APPLICATION",
  prerequisites: ["T1-13","T1-16"],
  mainQuestion: "什么时候固定 Workflow 已经够用，什么时候任务真的需要 AI 在运行中动态决定下一步？",
  mainConcept: "智能体（Agent）的关键是根据当前状态观察结果、选择下一步并在满足停止条件时结束，而不是单纯能调用工具。",
  allowedCoreTerms: ["Agent", "Workflow"],
  summary: "你会区分固定工作流（Workflow）与智能体（Agent），并能为真正需要动态决策的任务写清目标、当前状态与观察、判断与行动、停止条件。",
  explanation: "如果步骤顺序可以事先确定，Workflow 通常更简单稳定。只有当下一步取决于中间结果时，才真正需要 Agent 在运行中动态决策。",
  why: "很多任务被过早包装成 Agent，会增加不确定性、权限风险和调试成本，却没有得到真正的动态价值。",
  points: [
    "智能体（Agent）的关键是运行中根据状态决定下一步。",
    "最小循环可以理解为：目标 → 当前状态与观察 → 判断 → 行动 → 停止。",
    "步骤可预先确定时，Workflow 通常更简单、更稳定。",
    "需要根据中间结果选择下一步时，才考虑 Agent。",
    "Agent 必须有停止条件和权限边界。"
  ],
  body: [
    "会调用工具只是能力，不等于具备智能体（Agent）的动态决策循环。",
    "Agent 动态性越高，越需要清楚目标、状态、停止条件和人工边界。"
  ],
  example: {
    title: "固定资料整理和开放式研究，为什么不该用同一种流程",
    situation: "一个任务是每天把固定来源整理成日报，另一个任务是研究一个陌生市场并根据发现继续追查。",
    before: "两个任务都设计成复杂 Agent，希望 AI 自己决定所有步骤。",
    after: "固定日报使用 Workflow；开放式研究才允许 AI 根据已找到证据决定继续查哪个方向，并设定停止条件。",
    result: "只在真正需要动态决策的任务里承担 Agent 的额外复杂度。"
  },
  mistakes: [
    "误区：会调用工具就是 Agent｜正确理解：Agent 的关键是运行中动态决定下一步。",
    "误区：Agent 越自主越高级｜正确理解：动态性越高越需要停止和权限边界。"
  ],
  related: ["下一课转向多模态（Multimodal），学习怎样根据任务选择文字、图片、语音和视频。"],
  practice: {
    title: "把一个动态任务写成最小 Agent 边界",
    goal: "写清目标、当前状态与观察、判断与行动、停止条件，让动态决策有明确范围。",
    fields: [
      { key: "goal", label: "目标", prompt: "写出智能体最终要完成的目标。", example: "请先判断“找出三个可信来源解释某个市场近期变化”是否真的需要智能体（Agent）；如果需要，再设计最小执行边界。" },
      { key: "observe", label: "当前状态与观察", prompt: "写出每一步先要看清什么当前状态、再观察什么结果。", example: "每一步先记录已经回答的核心问题，再观察新来源是否补上证据缺口或出现关键线索。" },
      { key: "decision", label: "判断与行动", prompt: "写出什么情况下继续查、换方向或执行下一步。", example: "证据不足时继续查最关键缺口；证据冲突时优先追查正式事实源。" },
      { key: "stop", label: "停止条件", prompt: "写出明确停止条件。", example: "当核心问题已有三个独立可信来源支持，或达到限定时间时停止，并报告仍未解决的证据缺口。" }
    ],
    hints: ["如果步骤能完全预先写死，优先 Workflow。", "停止条件不能写成“AI 觉得差不多”。"],
    prompt: "请先判断这个任务适合固定工作流（Workflow）还是智能体（Agent）；如果需要 Agent，写出目标、当前状态与观察、判断与行动、停止条件。" ,
    reflection: "检查动态决策是否真的来自中间结果，而不是为了使用 Agent 强行增加自由度。"
  },
  checks: {
    best: { question: "哪种任务更需要 Agent，而不是固定 Workflow？", options: ["每天按固定步骤生成日报", "根据研究结果不断决定下一步查什么的开放式调查", "固定格式转换文件"], answer: "B", explanation: "下一步依赖中间发现时才真正需要动态决策。" },
    misconception: { question: "判断：只要 AI 能调用多个工具，这个系统就一定属于 Agent。", answer: false, explanation: "Tool 能力不等于动态决策循环。" },
    boundary: { question: "哪些元素是最小智能体边界的重要部分？（多选）", options: ["明确目标", "根据观察决定下一步", "停止条件", "无限自主权限"], answers: ["A","B","C"], explanation: "智能体需要目标、观察/决策和停止条件，不需要无限权限。" }
  },
  review: [
    "当下一步确实取决于中间结果时，持续观察当前状态、在允许的动作中选择下一步，并围绕明确目标完成动态任务｜不要替你把步骤本来固定的工作流强行改成 Agent，也不要为了“更智能”引入不必要的自主决策。",
    "在预先定义的工具、权限和停止条件内进行多步决策，并在无法继续或达到目标时停止｜不要替系统扩大权限、无限循环调用工具，或在没有明确结束标准时持续自主执行。"
  ],
  self: ["我能区分固定 Workflow 与真正需要动态决策的 Agent。", "我能为 Agent 写出可检查的停止条件。"],
  trigger: "当任务下一步取决于中间结果、无法预先写死时，我会判断是否真正需要智能体（Agent），并先定义停止条件。",
  capability: "能判断任务是否需要 Agent，并定义最小动态决策与停止边界。",
  next: "下一课继续解决：怎样根据真实任务选择文字、图片、语音或视频等多模态（Multimodal）输入输出。"
});

export const track01T118Draft = makeDraft({
  id: "t1-18-multimodal",
  canonicalId: "T1-18",
  title: "多模态（Multimodal）：文字、图片、语音、视频怎样一起工作",
  type: "APPLICATION",
  prerequisites: ["T1-06"],
  mainQuestion: "同一个任务可以给 AI 文字、图片、语音或视频时，应该怎样选择最有信息价值的形式？",
  mainConcept: "多模态（Multimodal）让 AI 处理或生成多种信息形式；选择模态的标准是任务需要什么信息，而不是越多越好。",
  allowedCoreTerms: ["Multimodal", "Context"],
  summary: "你会根据任务信息选择文字、图片、语音或视频，而不是把“多模态越多”误认为“效果越好”。",
  explanation: "不同模态承载的信息不同：文字适合语言和结构化说明，图片适合视觉关系，语音包含声音与口述，视频还包含时间变化。",
  why: "选错输入形式会丢失关键信息；选太多又会增加噪声和成本。真正重要的是任务需要什么证据。",
  points: [
    "多模态（Multimodal）表示 AI 可以处理或生成不止一种信息形式。",
    "模态选择应该由任务信息决定，不是越多越好。",
    "图片适合视觉结构，语音适合声音和口述，视频适合时间变化与动作过程。",
    "多模态任务仍然需要明确任务、上下文（Context）和结果核验。",
    "具体产品是否支持某种模态，需要按实际模型能力确认。"
  ],
  body: [
    "同一个任务可以组合多种模态，但每一种输入都应该有明确的信息价值。",
    "把所有媒体都上传并不会自动提高答案质量。"
  ],
  example: {
    title: "门店陈列检查：一段文字为什么不如一张现场图",
    situation: "运营要检查门店货架是否符合陈列规范。",
    before: "只让店员用文字描述“整体还可以，主推商品在中间”，关键视觉位置和遮挡情况很难还原。",
    after: "提供现场图片，并明确检查目标：主推商品位置、价签可见性、通道遮挡。",
    result: "输入模态直接保留了任务真正需要的视觉信息，AI 的判断依据更完整。"
  },
  mistakes: [
    "误区：多模态输入越多越好｜正确理解：只提供对当前任务有信息价值的模态。",
    "误区：AI 看过图片就等于完全理解现实场景｜正确理解：图像仍可能缺角度、时间和上下文。"
  ],
  related: ["下一课继续解决：AI 写代码、浏览网页和操作界面分别属于什么执行能力。"],
  practice: {
    title: "为一个真实任务选择最合适的模态",
    goal: "写出任务目标、选择输入模态、说明原因，并定义希望得到的输出。",
    fields: [
      { key: "task", label: "任务目标", prompt: "写出 AI 要帮助完成什么。", example: "请帮我判断“检查门店货架是否符合陈列规范”最适合使用哪些输入模态。" },
      { key: "input", label: "输入模态", prompt: "选择文字、图片、语音、视频或组合。", example: "可用输入是现场图片加一段简短文字说明。" },
      { key: "reason", label: "选择原因", prompt: "说明这个模态保留了什么关键信息。", example: "请优先考虑能保留商品位置、价签和遮挡关系等视觉信息的输入方式。" },
      { key: "output", label: "希望输出", prompt: "写出希望 AI 返回什么结果。", example: "输出请列出不符合项、对应位置，以及需要人工复核的问题，并说明为什么选择这些模态。" }
    ],
    hints: ["不要因为产品支持就把所有模态都加上。", "先问任务真正依赖的是文字、视觉、声音还是时间变化。"],
    prompt: "请根据这个任务选择最合适的输入模态，并说明为什么，以及希望 AI 返回什么结果。",
    reflection: "检查每种输入是否真的贡献了任务信息，而不是为了显得更复杂。"
  },
  checks: {
    best: { question: "要检查门店货架陈列位置，哪种输入更直接？", options: ["只提供店员一句“看起来不错”", "提供现场图片并说明检查目标", "只提供品牌名称"], answer: "B", explanation: "任务依赖视觉空间信息，图片更直接保留证据。" },
    misconception: { question: "判断：同一个任务加入越多模态，AI 的结果一定越好。", answer: false, explanation: "无关模态会增加噪声，关键是信息价值。" },
    boundary: { question: "哪些任务更可能从对应模态中获得关键信息？（多选）", options: ["用图片检查版面布局", "用语音判断口述内容和语气", "用视频观察动作过程", "只为数字求和强制上传视频"], answers: ["A","B","C"], explanation: "模态应服务任务信息，纯数字求和不需要视频。" }
  },
  review: [
    "根据任务真正缺失的信息选择合适的文字、图片、语音或视频输入，让 AI 从对应模态中提取和结合有用线索｜不要替你为了“功能更多”无目的地叠加模态；与任务无关的图片、声音或视频只会增加噪声和成本。",
    "把不同模态里的信息整理成可检查的结果，并结合明确任务说明继续分析或生成｜不要替你假设画面之外、录音之外或视频之外的现实背景，也不要把“能看、能听”当成事实已经自动核实。"
  ],
  self: ["我能根据任务信息选择合适模态。", "我能解释为什么某个模态对任务有价值，而不是只是产品支持。"],
  trigger: "当任务涉及文字、图片、语音或视频时，我会先问哪种信息形式最能保留完成任务所需的关键信息。",
  capability: "能为真实任务选择合适的文字、图片、语音或视频输入输出组合。",
  next: "下一课继续解决：编码（Coding）、浏览器（Browser）和计算机操作（Computer Use）怎样把 AI 从回答带到执行。"
});

export const track01T119Draft = makeDraft({
  id: "t1-19-coding-browser-computer-use",
  canonicalId: "T1-19",
  title: "编码（Coding）、浏览器（Browser）与计算机操作（Computer Use）：AI 怎样从回答走向操作",
  type: "CONCEPT",
  prerequisites: ["T1-13","T1-18"],
  mainQuestion: "AI 会写代码、会浏览网页、会操作电脑，看起来都能做事，它们到底有什么不同？",
  mainConcept: "编码（Coding）、浏览器（Browser）与计算机操作（Computer Use）是不同执行方式；应优先选择更稳定、可验证、风险更低的方式。",
  allowedCoreTerms: ["Coding", "Browser"],
  summary: "你会看懂 AI 常见执行能力地图，并为任务选择更稳定、可验证、风险更低的实现方式。",
  explanation: "Coding 用代码完成处理或自动化，Browser 读取和导航网页，Computer Use 像用户一样操作图形界面。它们可以组合，但可靠性和风险不同。",
  why: "如果明明有稳定接口或代码路径，却默认让 AI 模拟人点击界面，会增加脆弱性和操作风险。",
  points: [
    "编码（Coding）通过生成、修改或运行代码完成任务。",
    "浏览器（Browser）用于搜索、读取和导航网页信息。",
    "计算机操作（Computer Use）像用户一样与图形界面交互。",
    "能用 API 或代码稳定完成时，不应默认选择脆弱的界面点击。",
    "能操作不等于应该自动执行，高影响动作仍需要权限和确认。"
  ],
  body: [
    "执行能力选择的重点不是“哪种看起来更像人”，而是哪种更稳定、可验证、权限更清楚。",
    "浏览器自动化框架和代码沙箱属于后续工程课程。"
  ],
  example: {
    title: "收集公开网页数据并生成表格，有三种完全不同的做法",
    situation: "团队需要每天收集公开网站上的产品价格并整理成表格。",
    before: "默认让 AI 像人一样逐页点击和复制，不考虑网站是否有更稳定的数据接口或代码读取方式。",
    after: "先检查是否有 API；没有时再考虑代码或浏览器读取；只有必须操作图形界面时才使用 Computer Use，并设置确认边界。",
    result: "实现方式从“最像人”变成“最稳定、最可验证、风险最低”。"
  },
  mistakes: [
    "误区：Computer Use 最像人，所以一定最强｜正确理解：稳定接口或代码通常更可靠。",
    "误区：AI 能操作界面就应该自动执行｜正确理解：外部动作仍受权限和风险控制。"
  ],
  related: ["下一课会把权限、隐私和人工确认边界正式收束。"],
  practice: {
    title: "为一个任务选择最低风险的执行方式",
    goal: "在 Coding、Browser、Computer Use 或已有 API 中选择更合适的方式，并写出理由和人工确认点。",
    fields: [
      { key: "task", label: "任务", prompt: "写出需要 AI 帮助完成的真实操作任务。", example: "请为“每天收集三个公开网站的产品价格并生成表格”选择更稳定、可验证、风险更低的执行方式。" },
      { key: "method", label: "执行方式", prompt: "选择 API、Coding、Browser 或 Computer Use。", example: "优先检查是否有稳定 API；没有时再考虑浏览器读取，不默认使用计算机操作（Computer Use）模拟点击。" },
      { key: "reason", label: "选择理由", prompt: "说明为什么这个方式更稳定或可验证。", example: "这个任务只读取公开数据、不修改外部状态，请把可验证来源和稳定性作为选择依据。" },
      { key: "confirm", label: "人工确认点", prompt: "如果涉及外部动作，写出什么时候必须停下来确认。", example: "本任务不需要外部写入；如果以后增加自动下单、发布或付款等动作，必须在执行前加入人工确认。请给出推荐方式和理由。" }
    ],
    hints: ["优先稳定接口，再考虑代码/浏览器，最后才是图形界面操作。", "外部写入动作要单独考虑权限和后果。"],
    prompt: "请为这个任务选择 API、Coding、Browser 或 Computer Use 中更合适的执行方式，并说明稳定性、可验证性和人工确认边界。",
    reflection: "检查你选的是最低必要复杂度，而不是最炫的操作方式。"
  },
  checks: {
    best: { question: "一个系统已有稳定 API 可以取得数据时，通常应优先怎么做？", options: ["优先让 AI 模拟鼠标点击界面", "优先使用稳定 API 或代码路径", "让 AI 截图后猜数据"], answer: "B", explanation: "稳定接口通常更可验证，也更少受界面变化影响。" },
    misconception: { question: "判断：AI 可以使用 Computer Use，就意味着所有界面操作都适合完全自动执行。", answer: false, explanation: "能操作和应该自动执行是不同问题。" },
    boundary: { question: "哪些判断符合本课的能力选择原则？（多选）", options: ["优先稳定 API", "网页研究可用 Browser", "必须操作图形界面时才考虑计算机操作（Computer Use）", "任何任务都优先 Computer Use"], answers: ["A","B","C"], explanation: "优先稳定、可验证、最低风险的执行方式。" }
  },
  review: [
    "根据任务选择更稳定、可验证的执行方式：有可靠接口时优先 API 或代码，需要网页信息时使用浏览器，只有必须操作图形界面时再考虑计算机操作｜不要替你一律选择最复杂的 Computer Use，也不要在存在稳定接口时用脆弱的界面点击绕路。",
    "在明确权限内读取网页、运行代码或操作界面，并把可验证结果交回任务继续处理｜不要替你自动执行付款、发布、下单、删除等高影响写入动作；能操作界面不等于应该拥有最终执行权。"
  ],
  self: ["我能区分 Coding、Browser 与 Computer Use。", "我能为真实任务选择更稳定的执行方式并设置确认点。"],
  trigger: "当 AI 要从回答走向执行时，我会优先选择更稳定、可验证、权限更清楚的 API、代码、浏览器或界面操作路径。",
  capability: "能看懂现代 AI 执行能力地图，并为任务选择最低必要复杂度的实现方式。",
  next: "下一课收束 Track 01：怎样用隐私（Privacy）、权限（Permissions）与人在回路（Human-in-the-loop）控制高影响动作。"
});

export const track01T120Draft = makeDraft({
  id: "t1-20-privacy-permissions-hitl",
  canonicalId: "T1-20",
  title: "隐私（Privacy）、权限（Permissions）与人在回路（Human-in-the-loop）：什么不能直接交给 AI",
  type: "APPLICATION",
  prerequisites: ["T1-05","T1-17","T1-19"],
  mainQuestion: "当 AI 已经能读取数据、调用工具并执行动作时，哪些事情必须限制权限或保留人工确认？",
  mainConcept: "高影响 AI 执行必须同时考虑隐私（Privacy）、权限（Permissions）与人在回路（Human-in-the-loop），并遵守最小权限和关键动作人工确认。",
  allowedCoreTerms: ["Privacy", "Permissions"],
  summary: "你会为 AI 工作流标出敏感数据、最小权限和人工确认点，知道哪些动作不能直接交给 AI 自动执行。",
  explanation: "AI 能做某件事，不代表系统就应该把执行权交给它。涉及敏感数据、高权限或不可逆后果时，需要限制可访问范围，并在关键动作前保留人工确认。",
  why: "随着 AI 从回答走向真实操作，最大的风险往往不再是文案不好，而是读错数据、越权执行或直接造成现实后果。",
  points: [
    "隐私（Privacy）关注哪些数据不该暴露或不该超范围使用。",
    "权限（Permissions）决定 AI 可以读取、调用和修改什么。",
    "人在回路（Human-in-the-loop）在关键动作前保留人工确认。",
    "最小权限原则是只给完成当前任务真正需要的能力。",
    "金钱、账户、正式发布、敏感数据和不可逆动作通常需要更强人工确认。"
  ],
  body: [
    "人工确认应该放在真正高风险的节点，而不是让所有低风险步骤都变成人工点击。",
    "核心授权应由业务规则和系统掌握，不能仅凭模型输出决定。"
  ],
  example: {
    title: "退款建议可以自动生成，高额退款为什么不能自动执行",
    situation: "客服 AI 可以读取订单信息并给出退款建议，系统也具备退款工具。",
    before: "AI 根据聊天判断后直接执行高额退款，没有金额边界、权限限制或人工确认。",
    after: "AI 可以整理证据和给出建议；低风险范围按明确规则处理，高额或异常退款必须停在执行前由有权限的人确认。",
    result: "AI 仍然提高效率，但最终高影响授权没有从核心系统和责任人手里消失。"
  },
  mistakes: [
    "误区：AI 判断很准就可以给全部权限｜正确理解：权限应按任务最小化，与模型表现好坏分开。",
    "误区：Human-in-the-loop 就是每一步都人工点确认｜正确理解：人工确认应放在真正高风险的关键动作前。"
  ],
  related: ["完成本课后，Track 01 的基础能力闭环结束；后续板块会在真实工作、自动化和 FDE 场景中深化这些边界。"],
  practice: {
    title: "给一个 AI 工作流标出安全边界",
    goal: "把关键动作分成可自动、需确认、禁止自动，并说明敏感数据和最小权限。",
    fields: [
      { key: "flow", label: "AI 流程", prompt: "写出一个会读取数据或执行外部动作的 AI 流程。", example: "请为“客服 AI 读取订单与聊天记录并判断是否建议退款”的流程标出安全边界。" },
      { key: "data", label: "敏感数据", prompt: "写出流程中哪些数据需要限制使用范围。", example: "敏感数据包括客户联系方式、支付信息和订单明细，只允许为当前退款判断使用。" },
      { key: "permission", label: "最小权限", prompt: "写出 AI 完成任务真正需要哪些读取或调用权限。", example: "最小权限：可以读取订单和退款政策，不得修改支付账户或用户身份信息。" },
      { key: "approval", label: "人工确认", prompt: "写出哪些高影响动作必须在执行前停下来确认。", example: "高额退款、异常账户和正式对外承诺必须在执行前由有权限人员确认。请把动作分成“可自动、需确认、禁止自动”三类。" }
    ],
    hints: ["先区分读取和修改权限。", "人工确认只放在真正高风险节点。", "不要用“AI 很聪明”作为扩大权限的理由。"],
    prompt: "请为这个 AI 流程标出隐私、最小权限和人工参与边界：哪些可自动、哪些需确认、哪些禁止自动。",
    reflection: "检查最终高影响授权是否仍然由清楚的业务规则和责任人掌握。"
  },
  checks: {
    best: { question: "AI 可以生成退款建议并具备退款工具时，高额退款最合理的做法是什么？", options: ["让 AI 直接执行以提高效率", "在执行前检查权限并要求有权限的人确认", "只要模型信心高就自动执行"], answer: "B", explanation: "高影响动作需要权限边界和人工确认。" },
    misconception: { question: "判断：人在回路（Human-in-the-loop）意味着 AI 流程里的每一步都必须人工点击确认。", answer: false, explanation: "人工确认应集中在高风险、不可逆或正式授权节点。" },
    boundary: { question: "哪些情况通常需要更强权限限制或人工确认？（多选）", options: ["高额付款或退款", "修改用户账户权限", "读取公开网页标题", "正式对外发布不可逆内容"], answers: ["A","B","D"], explanation: "涉及金钱、账户权限和正式不可逆发布时，现实后果更高。" }
  },
  review: [
    "在最小必要范围内处理任务确实需要的敏感数据，并在已有权限内提供分析、建议或低风险辅助｜不要替你收集、保留或传播与当前任务无关的敏感信息，也不要因为模型需要方便就扩大数据访问范围。",
    "在清楚的权限边界内读取、调用和建议下一步，并在高影响动作前停下来等待授权｜不要替责任人直接批准高额付款、退款、账户权限变更、正式发布或其他不可逆操作。",
    "依据业务规则整理证据、暴露风险并把需要确认的节点交给有权限的人｜不要替系统决定谁拥有最终授权，也不要因为模型置信度高就跳过人在回路（Human-in-the-loop）。"
  ],
  self: ["我能识别敏感数据、高权限和高影响动作。", "我能给一个 AI 工作流设计最小权限和人工确认点。"],
  trigger: "当 AI 要读取敏感数据、调用高权限能力或执行高影响动作时，我会先检查最小权限和人工确认点。",
  capability: "能为真实 AI 工作流设置隐私、最小权限和人工参与边界。",
  next: "Track 01 到这里完成基础闭环；后续课程会把这些能力带入真实工作应用、推广运营、自动化与 FDE 场景。"
});

export const track01T111T120Drafts = [
  track01T111Draft,
  track01T112Draft,
  track01T113Draft,
  track01T114Draft,
  track01T115Draft,
  track01T116Draft,
  track01T117Draft,
  track01T118Draft,
  track01T119Draft,
  track01T120Draft
] as const;

export const track01T111T120TriggerScenarios: Record<string, string> = {
  "t1-11-api": "当你要让 AI 读取订单、库存、客户资料等另一个系统里的真实信息，却不知道应该怎样提出跨系统请求时。",
  "t1-12-structured-output-schema": "当 AI 的结果要交给表格、数据库、自动化或程序继续处理，而自由文本经常让后续系统读不稳时。",
  "t1-13-function-calling-tool-use": "当任务需要实时数据、查询外部状态或执行真实动作，AI 只靠文字回答已经不够时。",
  "t1-14-mcp": "当一个 AI 应用要同时连接文件、知识库和多个业务工具，每个连接都在重复做专属适配时。",
  "t1-15-skill": "当你发现同一种 AI 做法反复出现，而且每次都要重新解释相同规则、输入和输出时。",
  "t1-16-workflow-automation": "当一个重复任务准备自动化，但你还说不清步骤顺序、每一步由谁执行，以及失败时应该在哪里停下来时。",
  "t1-17-agent": "当任务的下一步会随着中间结果变化，无法在开始前把所有步骤完全写死时。",
  "t1-18-multimodal": "当文字不足以表达任务关键信息，你需要判断应该加入图片、语音、视频还是保持纯文字时。",
  "t1-19-coding-browser-computer-use": "当 AI 不只是回答问题，还要读取网页、运行代码或操作界面，你需要选择更稳定、可验证、风险更低的执行方式时。",
  "t1-20-privacy-permissions-hitl": "当 AI 要接触敏感数据、修改外部状态、付款、发布或执行其他高影响动作，你需要决定哪些能自动、哪些必须人工确认时。",
};

export const track01T111T120Intros = Object.fromEntries(
  track01T111T120Drafts.map((draft) => [
    draft.lessonSpec.lessonId,
    {
      title: draft.lessonSpec.steps[0].title,
      situation: draft.content.example.situation,
      approaches: [
        { label: "容易出现的做法", text: draft.content.example.before ?? "" },
        { label: "更合适的做法", text: draft.content.example.after ?? "" }
      ],
      comparison: [],
      takeaway: draft.content.points[0],
      bottomDetails: draft.content.points.slice(1, 3).map((text, index) => ({
        title: index === 0 ? "关键判断" : "使用边界",
        text
      })),
      comparisonPlacement: "BOTTOM" as const
    }
  ])
);

export const track01T111T120ReviewDepth: Record<string, ReadonlyArray<{ title: string; text: string }>> = {
  "t1-11-api": [
    { title: "接口真正解决的是系统之间怎样交换信息", text: "订单、库存、账户等外部状态不应该由模型猜。AI 要使用这些事实时，应通过明确接口提交请求并读取真实响应。" },
    { title: "为什么接口要同时定义输入、成功结果和错误结果", text: "真实系统不只会成功，也会出现缺参数、无权限或数据不存在。把这些状态都说清楚，AI 才知道什么时候能继续、什么时候必须停下来。" },
    { title: "为什么能连接不等于能访问", text: "API 只是通信入口；具体能读取哪些数据、执行哪些动作，仍由权限和业务规则决定，不能从“接口存在”推出“什么都能访问”。" }
  ],
  "t1-12-structured-output-schema": [
    { title: "字段为什么必须从后续用途倒推", text: "结构化输出的目标不是看起来整齐，而是让表格、数据库或自动化稳定读取，所以字段只保留后续系统真正要用的内容。" },
    { title: "为什么结构正确不能代替事实核验", text: "字段名称、类型和必填规则都正确，只能说明格式合格；字段里的日期、价格、状态等事实是否真实，仍需独立核对。" },
    { title: "缺失值应该怎样处理", text: "输入材料无法确定某个字段时，应该留空、标记缺失或转人工确认，而不是为了让结构完整就补出一个不存在的答案。" }
  ],
  "t1-13-function-calling-tool-use": [
    { title: "什么时候应该从“模型回答”切换到“工具调用”", text: "只要任务依赖实时外部状态或需要执行真实动作，模型生成文字就不够，应调用对应工具取得数据或完成动作。" },
    { title: "为什么模型提出调用不等于已经执行", text: "AI 可以选择工具、准备参数，但真正执行、权限判断和成功失败都由系统与工具负责，返回结果之后模型才能继续处理。" },
    { title: "为什么工具要尽量保持单一职责", text: "只负责查询库存的工具比同时查询、修改和下单的万能工具更容易设置权限、验证输出，也更容易发现越界行为。" }
  ],
  "t1-14-mcp": [
    { title: "MCP 什么时候真正有价值", text: "当一个 AI 应用同时连接文件、知识库和多个业务工具时，统一发现和使用这些资源可以减少重复接入逻辑。" },
    { title: "MCP、API 与 Tool 的边界是什么", text: "API 负责系统通信，Tool 表示可调用能力，MCP 提供更统一的连接约定；它们可以协同存在，但解决的不是同一个问题。" },
    { title: "为什么统一连接不能代替权限设计", text: "资源能被发现和连接，不代表 AI 自动有权读取或修改。权限、敏感数据范围和高风险动作确认仍由具体系统负责。" }
  ],
  "t1-15-skill": [
    { title: "为什么要先验证方法，再沉淀成 Skill", text: "一次性或仍频繁变化的方法过早固化，只会把不稳定判断长期复制；只有反复有效、边界稳定的方法才值得复用。" },
    { title: "Skill 真正复用的是什么", text: "它复用的是已经确认的使用条件、输入、输出和禁止动作，让每次执行少重新解释，而不是扩大 AI 的业务权限。" },
    { title: "为什么单一职责更重要", text: "一个 Skill 只解决一个主要问题，更容易测试、维护和替换；把多个无关任务塞进去，会让失败原因和边界越来越难判断。" }
  ],
  "t1-16-workflow-automation": [
    { title: "为什么自动化前必须先把流程拆清楚", text: "步骤顺序、输入输出和失败处理如果都没稳定，自动化不会修复问题，只会让错误更快重复。" },
    { title: "哪些步骤应该优先用普通代码或规则", text: "固定转换、读取配置、确定计算等明确动作，用确定性代码通常更稳定；只有需要理解、归纳或灵活判断时才值得引入 AI。" },
    { title: "为什么关键节点必须设计停点", text: "事实核验失败、正式发布、付款等动作会产生现实后果，流程必须提前定义停止、回退或人工确认条件。" }
  ],
  "t1-17-agent": [
    { title: "什么时候 Agent 比固定 Workflow 更合适", text: "只有下一步真的依赖中间结果，无法在开始前把所有步骤写死时，动态观察和决策才有价值。" },
    { title: "Agent 为什么仍然必须有边界", text: "目标、允许使用的工具、权限和停止条件共同限定它能做什么；动态决策不等于无限自主。" },
    { title: "停止条件为什么不是可选项", text: "没有结束标准的 Agent 可能持续调用工具、重复尝试或越过任务范围，所以达到目标、无法继续或触发风险都必须能停下来。" }
  ],
  "t1-18-multimodal": [
    { title: "模态选择应该由什么决定", text: "视觉关系用图片，声音和语气用音频，动作过程才需要视频；先判断任务真正缺什么信息，再决定输入形式。" },
    { title: "为什么模态不是越多越好", text: "无关图片、音频或视频只会增加噪声、成本和判断负担，并不会因为输入更多就自动让答案更可靠。" },
    { title: "为什么多模态仍然需要上下文和核验", text: "AI 能看图听音，不代表知道画面外的事实、来源和业务背景；没有出现的信息仍要明确提供，关键事实仍要验证。" }
  ],
  "t1-19-coding-browser-computer-use": [
    { title: "执行方式为什么要优先稳定路径", text: "已有可靠 API 时优先接口或代码；网页资料使用浏览器；只有必须操作图形界面且没有更稳定方法时，才考虑计算机操作。" },
    { title: "为什么读取与写入要分开判断", text: "读取公开资料通常只影响信息获取，而发布、下单、付款和删除会改变现实状态，所以需要更严格权限与人工确认。" },
    { title: "Computer Use 为什么不是默认最高级方案", text: "界面会变化，也更难复现和验证。能模拟人点击并不代表应该绕过已有的稳定接口或确定性代码。" }
  ],
  "t1-20-privacy-permissions-hitl": [
    { title: "为什么先做最小数据暴露", text: "敏感信息只有在完成当前任务确实需要时才应该提供，并限制保存、传播和二次使用范围。" },
    { title: "为什么最小权限与模型能力无关", text: "权限只看任务真正需要什么。模型再聪明，也不应该因此获得额外读取、修改或执行能力。" },
    { title: "哪些动作必须保留人工确认", text: "金钱、账户权限、正式发布、不可逆修改等高影响操作要在执行前由有权限的人确认，模型只能提供依据和建议。" },
    { title: "Human-in-the-loop 不等于每一步都人工点击", text: "低风险、可逆且规则清楚的步骤可以自动执行；人工确认应集中在高后果、异常或责任必须明确归属的节点。" }
  ]
};
export const track01T111T120KnowledgeDepth = Object.fromEntries(
  track01T111T120Drafts.map((draft) => [
    draft.lessonSpec.lessonId,
    {
      example: draft.content.content.map((text, index) => ({
        title: index === 0 ? "为什么这样判断" : "还要注意什么",
        text
      })),
      review: track01T111T120ReviewDepth[draft.lessonSpec.lessonId] ?? []
    }
  ])
);
