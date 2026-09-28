import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  type CourseBuilderBuildDraft
} from "../../lib/learning/course-builder";

export type Track05BatchACanonicalId = "T5-01" | "T5-02" | "T5-03";

export type Track05BatchALessonConfig = {
  id: string;
  canonicalId: Track05BatchACanonicalId;
  title: string;
  prerequisites: string[];
  learningRecommendation: string;
  stepCopy: {
    explainTitle: string; exampleTitle: string; checkTitle: string; practiceTitle: string; reviewTitle: string; capabilityTitle: string;
    explainGuide: string; exampleGuide: string; checkGuide: string; practiceGuide: string; reviewGuide: string; capabilityGuide: string;
  };
  navigation: { explain: string; example: string; check: string; practice: string; review: string; capability: string };
  mainQuestion: string;
  mainConcept: string;
  summary: string;
  explanation: string;
  why: string;
  points: string[];
  body: string[];
  example: { title: string; situation: string; before: string; after: string; result: string };
  mistakes: string[];
  related: string[];
  practice: {
    title: string;
    goal: string;
    fields: Array<{ key: string; label: string; prompt: string; example: string }>;
    hints: string[];
    prompt: string;
    reflection: string;
    referenceAnswer: string;
  };
  checks: {
    best: { question: string; options: [string,string,string]; answer: "A"|"B"|"C"; explanation: string };
    misconception: { question: string; answer: boolean; explanation: string };
    boundary: { question: string; options: [string,string,string,string]; answers: Array<"A"|"B"|"C"|"D">; explanation: string };
  };
  review: string[];
  reviewDepth: Array<{ proposition: string; answer: string }>;
  intro: { title: string; situation: string; primary: string; secondary: string; bottomDetails: string[] };
  self: string[];
  trigger: string;
  capability: string;
  next: string;
};

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

export function makeTrack05BatchADraft(config: Track05BatchALessonConfig): CourseBuilderBuildDraft {
  const practice = {
    id: config.id.replace(/-/g, "_") + "_practice",
    title: config.practice.title,
    goal: config.practice.goal,
    instructions: config.practice.fields.map(({ key,label,prompt }) => ({ key,label,prompt })),
    hints: config.practice.hints,
    rubric: config.practice.fields.map((field) => ({
      key: field.key,
      label: field.label + "是否清楚",
      maxScore: 20,
      minScore: 8,
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
        "TRACK05_CATALOG_CONTEXT_V1.md",
        "TRACK05_SIX_STEP_AUDIT_V1.md",
        "TRACK05_BATCH_A_T5_01_T5_03_FORMAL_BRIEFS_V1.md",
        "FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
        "DEFERRED_KNOWLEDGE_LEDGER_V1.md",
        "LESSON_OUTPUT_CONTRACT_V1.md"
      ],
      researchSummary:
        config.summary +
        " 本课使用已批准的 Track 05 FDE 核心知识与 OPC/一人公司真实业务情境；继承 Track 01～04 已掌握的 AI、业务与 Workflow 能力，不重新教授 Workflow mechanics，也不提前进入后续 Problem Statement、价值、方案、Pilot 或 Adoption。"
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
      version: "1.0.0-track05-" + config.canonicalId.toLowerCase().replace("-", ""),
      courseSlug: "fde",
      lessonId: config.id,
      title: config.title,
      lessonType: "APPLICATION",
      learningObjectives: [
        config.mainConcept,
        "能在真实业务里识别本课判断何时适用。",
        "能完成本课实操，并留下后续解决方案落地课程可以继续使用的真实业务产物。"
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
          {value:"A",label:config.checks.best.options[0]},
          {value:"B",label:config.checks.best.options[1]},
          {value:"C",label:config.checks.best.options[2]}
        ],
        correctValues:[config.checks.best.answer],
        explanation:config.checks.best.explanation,
        correctFeedback:"正确。" + config.checks.best.explanation,
        incorrectFeedback:"再看本课案例，区分已经知道的事实和还不能确定的判断。"
      },
      {
        id: config.id + "_misconception",
        questionType:"TRUE_FALSE",
        masteryRole:"MISCONCEPTION",
        question:config.checks.misconception.question,
        options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
        correctValues:[config.checks.misconception.answer ? "TRUE" : "FALSE"],
        explanation:config.checks.misconception.explanation,
        correctFeedback:"正确。" + config.checks.misconception.explanation,
        incorrectFeedback:"重新判断：不要让 AI 把推测、角色或数字补成真实业务事实。"
      },
      {
        id: config.id + "_boundary",
        questionType:"MULTI_SELECT",
        masteryRole:"BOUNDARY_CONDITIONS",
        question:config.checks.boundary.question,
        options:[
          {value:"A",label:config.checks.boundary.options[0]},
          {value:"B",label:config.checks.boundary.options[1]},
          {value:"C",label:config.checks.boundary.options[2]},
          {value:"D",label:config.checks.boundary.options[3]}
        ],
        correctValues:config.checks.boundary.answers,
        explanation:config.checks.boundary.explanation,
        correctFeedback:"正确。" + config.checks.boundary.explanation,
        incorrectFeedback:"逐项检查：它是本课真正需要的判断，还是属于后续课程才解决的问题？"
      }
    ],
    practice,
    hints: config.practice.hints,
    referenceAnswer: config.practice.referenceAnswer,
    review: config.review,
    selfAssessment: config.self
  };
}
