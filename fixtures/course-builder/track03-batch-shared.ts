import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  type CourseBuilderBuildDraft
} from "../../lib/learning/course-builder";

export type Track03CanonicalId =
  | "T3-04" | "T3-05" | "T3-06" | "T3-07" | "T3-08" | "T3-09"
  | "T3-10" | "T3-11" | "T3-12" | "T3-13" | "T3-14" | "T3-15";

export type Track03LessonConfig = {
  id: string;
  canonicalId: Track03CanonicalId;
  formalBriefSource: string;
  title: string;
  prerequisites: string[];
  learningRecommendation: string;
  stepCopy: {
    explainTitle: string; exampleTitle: string; checkTitle: string; practiceTitle: string; reviewTitle: string; capabilityTitle: string;
    explainGuide: string; exampleGuide: string; checkGuide: string; practiceGuide: string; reviewGuide: string; capabilityGuide: string;
  };
  navigation: { explain: string; example: string; check: string; practice: string; review: string; capability: string };
  mainQuestion: string; mainConcept: string; summary: string; explanation: string; why: string;
  points: string[]; body: string[];
  example: { title: string; situation: string; before: string; after: string; result: string };
  mistakes: string[]; related: string[];
  practice: {
    title: string; goal: string;
    fields: Array<{ key: string; label: string; prompt: string; example: string }>;
    hints: string[]; prompt: string; reflection: string;
  };
  checks: {
    best: { question: string; options: [string,string,string]; answer: "A"|"B"|"C"; explanation: string };
    misconception: { question: string; answer: boolean; explanation: string };
    boundary: { question: string; options: [string,string,string,string]; answers: Array<"A"|"B"|"C"|"D">; explanation: string };
  };
  review: string[]; self: string[]; trigger: string; capability: string; next: string;
};

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export function makeTrack03Draft(config: Track03LessonConfig): CourseBuilderBuildDraft {
  const practice = {
    id: config.id.replace(/-/g, "_") + "_practice",
    title: config.practice.title,
    goal: config.practice.goal,
    instructions: config.practice.fields.map(({ key,label,prompt }) => ({ key,label,prompt })),
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
        config.formalBriefSource,
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
      completionGates: ["CHECK","PRACTICE"],
      steps: [
        { id:"explain", kind:"EXPLAIN", title:config.stepCopy.explainTitle, objective:config.stepCopy.explainGuide, navigationDescription:config.navigation.explain },
        { id:"example", kind:"EXAMPLE", title:config.stepCopy.exampleTitle, objective:config.stepCopy.exampleGuide, navigationDescription:config.navigation.example },
        { id:"check", kind:"CHECK", title:config.stepCopy.checkTitle, objective:config.stepCopy.checkGuide, navigationDescription:config.navigation.check },
        { id:"practice", kind:"PRACTICE", title:config.stepCopy.practiceTitle, objective:config.stepCopy.practiceGuide, navigationDescription:config.navigation.practice },
        { id:"review", kind:"REVIEW", title:config.stepCopy.reviewTitle, objective:config.stepCopy.reviewGuide, navigationDescription:config.navigation.review },
        { id:"capability", kind:"CAPABILITY", title:config.stepCopy.capabilityTitle, objective:config.stepCopy.capabilityGuide, navigationDescription:config.navigation.capability }
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
          { value:"A", label:config.checks.best.options[0] },
          { value:"B", label:config.checks.best.options[1] },
          { value:"C", label:config.checks.best.options[2] }
        ],
        correctValues: [config.checks.best.answer],
        explanation: config.checks.best.explanation,
        correctFeedback: "正确。你抓住了本课真正要做的业务判断。",
        incorrectFeedback: "再看前两步：先确认目标、已有依据和当前业务条件，再决定下一步，不要让 AI 用猜测补齐缺失事实。"
      },
      {
        id: config.id + "_misconception",
        questionType: "TRUE_FALSE",
        masteryRole: "MISCONCEPTION",
        question: config.checks.misconception.question,
        options: [{ value:"TRUE",label:"对" },{ value:"FALSE",label:"错" }],
        correctValues: [config.checks.misconception.answer ? "TRUE" : "FALSE"],
        explanation: config.checks.misconception.explanation,
        correctFeedback: "正确。你保留了真实业务判断和证据边界。",
        incorrectFeedback: "重新判断：AI 可以帮助整理、比较和生成候选，但不能替你制造客户事实、业务承诺或成功标准。"
      },
      {
        id: config.id + "_boundary",
        questionType: "MULTI_SELECT",
        masteryRole: "BOUNDARY_CONDITIONS",
        question: config.checks.boundary.question,
        options: [
          { value:"A",label:config.checks.boundary.options[0] },
          { value:"B",label:config.checks.boundary.options[1] },
          { value:"C",label:config.checks.boundary.options[2] },
          { value:"D",label:config.checks.boundary.options[3] }
        ],
        correctValues: config.checks.boundary.answers,
        explanation: config.checks.boundary.explanation,
        correctFeedback: "正确。你已经能把方法放回真实业务边界里使用。",
        incorrectFeedback: "逐项检查：这是已有事实、可验证规则，还是模型自己补出来的内容？"
      }
    ],
    practice,
    hints: config.practice.hints,
    referenceAnswer: config.practice.fields.map((field) => field.example).join("\n"),
    review: config.review,
    selfAssessment: config.self
  };
}
