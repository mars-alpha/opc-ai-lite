import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  type CourseBuilderBuildDraft
} from "../course-builder";

export type Track04CanonicalId = "T4-01" | "T4-02" | "T4-03" | "T4-04" | "T4-05" | "T4-06" | "T4-07" | "T4-08" | "T4-09" | "T4-10" | "T4-11" | "T4-12" | "T4-13" | "T4-14" | "T4-15";

export type Track04LessonConfig = {
  id: string;
  canonicalId: Track04CanonicalId;
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
  review: string[];
  reviewDepth: Array<{ proposition: string; answer: string }>;
  intro: { title: string; situation: string; primary: string; secondary: string; bottomDetails: string[] };
  self: string[]; trigger: string; capability: string; next: string;
};

const accessPresentation = {
  showCourseContext: true,
  showLearningPathLink: true,
  inlineConversionCta: false
} as const;

function briefSourceFor(id: Track04CanonicalId) {
  const n = Number(id.slice(3));
  if (n <= 3) return "git-history:TRACK04_BATCH_A_T4_01_T4_03_FORMAL_BRIEFS_V1.md";
  if (n <= 6) return "git-history:TRACK04_BATCH_B_T4_04_T4_06_FORMAL_BRIEFS_V1.md";
  if (n <= 9) return "git-history:TRACK04_BATCH_C_T4_07_T4_09_FORMAL_BRIEFS_V1.md";
  if (n <= 13) return "git-history:TRACK04_BATCH_D_T4_10_T4_13_FORMAL_BRIEFS_V1.md";
  return "git-history:TRACK04_BATCH_E_T4_14_T4_15_FORMAL_BRIEFS_V1.md";
}

export function makeTrack04Draft(config: Track04LessonConfig): CourseBuilderBuildDraft {
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
        "TRACK_CONTEXTS_V1.md",
        "git-history:TRACK04_SIX_STEP_AUDIT_V1.md",
        briefSourceFor(config.canonicalId),
        "FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
        "git-history:DEFERRED_KNOWLEDGE_LEDGER_V1.md",
        "COURSE_BUILD_STANDARD_V1.md"
      ],
      researchSummary: config.summary + " 本课只使用已批准的 Track 04 工作流设计知识与真实自媒体业务案例；继承 Track 03 已人工验证的业务链，不重教业务运营方法，也不提前进入代码实现、平台配置或 Track 05 企业工程。"
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
      version: "1.0.0-track04-" + config.canonicalId.toLowerCase().replace("-", ""),
      courseSlug: "ai-workflow",
      lessonId: config.id,
      title: config.title,
      lessonType: "APPLICATION",
      learningObjectives: [
        config.mainConcept,
        "能在真实业务里判断什么时候应该使用本课方法。",
        "能完成本课实操，并留下可以检查、复用和继续推进的工作流设计结果。"
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
        id: config.id + "_best", questionType:"SINGLE_CHOICE", masteryRole:"BEST_JUDGMENT",
        question:config.checks.best.question,
        options:[{value:"A",label:config.checks.best.options[0]},{value:"B",label:config.checks.best.options[1]},{value:"C",label:config.checks.best.options[2]}],
        correctValues:[config.checks.best.answer], explanation:config.checks.best.explanation,
        correctFeedback:"正确。"+config.checks.best.explanation,
        incorrectFeedback:"再看前两步，重点检查："+config.points[0]
      },
      {
        id: config.id + "_misconception", questionType:"TRUE_FALSE", masteryRole:"MISCONCEPTION",
        question:config.checks.misconception.question,
        options:[{value:"TRUE",label:"对"},{value:"FALSE",label:"错"}],
        correctValues:[config.checks.misconception.answer ? "TRUE" : "FALSE"], explanation:config.checks.misconception.explanation,
        correctFeedback:"正确。"+config.checks.misconception.explanation,
        incorrectFeedback:"重新判断："+config.checks.misconception.explanation
      },
      {
        id: config.id + "_boundary", questionType:"MULTI_SELECT", masteryRole:"BOUNDARY_CONDITIONS",
        question:config.checks.boundary.question,
        options:[{value:"A",label:config.checks.boundary.options[0]},{value:"B",label:config.checks.boundary.options[1]},{value:"C",label:config.checks.boundary.options[2]},{value:"D",label:config.checks.boundary.options[3]}],
        correctValues:config.checks.boundary.answers, explanation:config.checks.boundary.explanation,
        correctFeedback:"正确。"+config.checks.boundary.explanation,
        incorrectFeedback:"逐项检查："+config.checks.boundary.explanation
      }
    ],
    practice,
    hints: config.practice.hints,
    referenceAnswer: config.practice.fields.map((field)=>field.example).join("\n"),
    review: config.review,
    selfAssessment: config.self
  };
}
