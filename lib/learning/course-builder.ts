import {
  validateLessonSpec,
  type LessonSpec,
  type LessonStepKind
} from "./lesson-spec";

export type CourseBuilderMode = "BUILD" | "IMPROVE";
export type CourseBuilderReviewStatus = "PENDING_REVIEW";

export type CourseBuilderGrounding = {
  status: "REVIEWED";
  sourceKind: "APPROVED_KNOWLEDGE" | "RESEARCH_PACKET";
  sourceLabels: string[];
  researchSummary: string;
};

export type CourseBuilderParticipation = {
  kind: "CHOOSE" | "CLASSIFY" | "SHORT_RESPONSE" | "COPY_TO_AI" | "COMPARE" | "REVEAL" | "MINI_TASK";
  title: string;
  instruction: string;
  prompt: string | null;
  reflection: string;
};

export type CourseBuilderStepResponsibility = {
  purpose: string;
  include: string;
  avoid: string;
};

export type CourseBuilderSixStepResponsibilities = Record<
  LessonStepKind,
  CourseBuilderStepResponsibility
>;

export const COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES: CourseBuilderSixStepResponsibilities = {
  EXPLAIN: {
    purpose: "建立一个核心直觉：这个主题解决什么问题，以及最重要的判断原则。",
    include: "一个核心问题、一个核心结论，必要时一个最常见的错误直觉。",
    avoid: "一次堆入多个新概念、长篇说明或把后续方法全部提前讲完。"
  },
  EXAMPLE: {
    purpose: "通过真实案例展开方法、边界和为什么有效；较深知识优先放在这里。",
    include: "前后对比、为什么变好、适用边界，以及会改变结果的关键知识。",
    avoid: "只重复 EXPLAIN 的结论，或展示案例却不解释变化原因。"
  },
  CHECK: {
    purpose: "验证学习者是否真正理解，并用反馈纠正常见误区。",
    include: "需要判断的具体情境、正确答案解释，以及条件允许时说明错误选项为什么不成立。",
    avoid: "在检查题里突然加入大量未教过的新理论，或只告诉学习者对错而不给原因。"
  },
  PRACTICE: {
    purpose: "把已理解的知识转成能亲手完成的能力，并提供逐层辅助。",
    include: "清晰任务、字段或步骤提示、Hints、必要时参考答案；进阶提示可以选做。",
    avoid: "为了丰富体验增加无意义点击，或把选做知识变成新的强制 Completion Gate。"
  },
  REVIEW: {
    purpose: "把零散知识收束成以后可复用的判断或诊断框架。",
    include: "常见误区、判断顺序、遇到问题时可以复用的检查框架。",
    avoid: "只把前面内容原样重复一遍，或再次堆一组孤立知识卡片。"
  },
  CAPABILITY: {
    purpose: "明确学习者现在会什么、马上能用在哪里，以及下一步学什么。",
    include: "已获得能力、真实应用场景和下一步学习方向。",
    avoid: "只写抽象鼓励、重复课程标题，或引入新的核心理论。"
  }
};

export type CourseBuilderPedagogy = {
  audience: "BEGINNER" | "GENERAL" | "ADVANCED";
  languagePolicy: "TERM_READABILITY";
  aiToolNeutral: true;
  participation: CourseBuilderParticipation;
  sixStepResponsibilities: CourseBuilderSixStepResponsibilities;
};

export type CourseBuilderLessonContent = {
  summary: string;
  plainExplanation: string;
  whyItMatters: string;
  points: string[];
  content: string[];
  example: {
    title: string;
    situation: string;
    before?: string;
    after?: string;
    result: string;
  };
  mistakes: string[];
  related: string[];
};

export type CourseBuilderCheck = {
  id: string;
  question: string;
  options: Array<{ value: string; label: string }>;
  correctValue: string;
  explanation: string;
};

export type CourseBuilderPractice = {
  id: string;
  title: string;
  goal: string;
  instructions: Array<{ key: string; label: string; prompt: string }>;
  hints: string[];
  rubric: Array<{
    key: string;
    label: string;
    maxScore: number;
    minScore: number;
    example: string;
  }>;
  passScore: number;
};

export type CourseBuilderBuildDraft = {
  mode: "BUILD";
  grounding: CourseBuilderGrounding;
  pedagogy: CourseBuilderPedagogy;
  lessonSpec: LessonSpec;
  content: CourseBuilderLessonContent;
  check: CourseBuilderCheck | null;
  practice: CourseBuilderPractice | null;
  hints: string[];
  referenceAnswer: null | string;
  review: string[];
  selfAssessment: string[];
};

export type CourseBuilderImproveProposal = {
  mode: "IMPROVE";
  lessonKey: string;
  changeSummary: string;
  evidence: string[];
  affectedSteps: LessonStepKind[];
  proposedChanges: string[];
  reason: string;
  risk: string[];
  keepUnchanged: string[];
  validationPlan: string[];
};

export type CourseBuilderOutput =
  | CourseBuilderBuildDraft
  | CourseBuilderImproveProposal;

export type CourseBuilderReviewPacket = {
  skill: { id: "course-builder"; version: "0.1.0" };
  mode: CourseBuilderMode;
  status: CourseBuilderReviewStatus;
  validatedAt: string;
  output: CourseBuilderOutput;
  validation: {
    schema: "PASS";
    rules: "PASS";
    warnings: string[];
  };
};

const lessonTypes = ["CONCEPT", "APPLICATION", "PRACTICE", "PROJECT"] as const;
const practiceModes = ["NONE", "GUIDED", "INDEPENDENT", "PROJECT"] as const;
const realAiOperations = ["NONE", "GUIDED", "REQUIRED"] as const;
const realAiEvidenceKinds = ["NONE", "USER_CONFIRMATION", "ARTIFACT", "SYSTEM_RESULT"] as const;
const completionGates = ["CHECK", "PRACTICE", "DELIVERABLE", "REAL_AI"] as const;
const stepKinds = ["EXPLAIN", "EXAMPLE", "CHECK", "PRACTICE", "REVIEW", "CAPABILITY"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requiredText(value: unknown, code: string, maxLength = 12000) {
  if (typeof value !== "string") throw new Error(code);
  const text = value.trim();
  if (!text || text.length > maxLength) throw new Error(code);
  return text;
}

function optionalText(value: unknown, code: string, maxLength = 12000) {
  if (value === undefined) return undefined;
  return requiredText(value, code, maxLength);
}

function textArray(value: unknown, code: string, allowEmpty = false) {
  if (!Array.isArray(value)) throw new Error(code);
  const items = value.map((item) => requiredText(item, code, 3000));
  if (!allowEmpty && items.length === 0) throw new Error(code);
  return items;
}

function enumValue<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  code: string
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value as T[number])) {
    throw new Error(code);
  }
  return value as T[number];
}

function rejectAuthorityFields(input: Record<string, unknown>) {
  const forbidden = [
    "published",
    "publish",
    "status",
    "access",
    "accessTier",
    "entitlement",
    "progress",
    "completion",
    "completionState"
  ];
  for (const key of forbidden) {
    if (key in input) throw new Error("COURSE_BUILDER_AUTHORITY_FIELD_NOT_ALLOWED:" + key);
  }
}

function parseGrounding(input: unknown): CourseBuilderGrounding {
  if (!isRecord(input)) throw new Error("INVALID_BUILD_GROUNDING");
  if (input.status !== "REVIEWED") throw new Error("BUILD_GROUNDING_NOT_REVIEWED");
  return {
    status: "REVIEWED",
    sourceKind: enumValue(
      input.sourceKind,
      ["APPROVED_KNOWLEDGE", "RESEARCH_PACKET"] as const,
      "INVALID_GROUNDING_SOURCE_KIND"
    ),
    sourceLabels: textArray(input.sourceLabels, "INVALID_GROUNDING_SOURCE_LABELS"),
    researchSummary: requiredText(input.researchSummary, "INVALID_GROUNDING_SUMMARY", 5000)
  };
}

function parseSixStepResponsibilities(input: unknown): CourseBuilderSixStepResponsibilities {
  if (!isRecord(input)) throw new Error("INVALID_SIX_STEP_RESPONSIBILITIES");
  const result = {} as CourseBuilderSixStepResponsibilities;
  for (const kind of stepKinds) {
    const item = input[kind];
    if (!isRecord(item)) {
      throw new Error("MISSING_STEP_RESPONSIBILITY:" + kind);
    }
    result[kind] = {
      purpose: requiredText(item.purpose, "INVALID_STEP_RESPONSIBILITY_PURPOSE:" + kind, 2000),
      include: requiredText(item.include, "INVALID_STEP_RESPONSIBILITY_INCLUDE:" + kind, 3000),
      avoid: requiredText(item.avoid, "INVALID_STEP_RESPONSIBILITY_AVOID:" + kind, 3000)
    };
  }
  const unexpected = Object.keys(input).filter(
    (key) => !stepKinds.includes(key as LessonStepKind)
  );
  if (unexpected.length > 0) {
    throw new Error("UNEXPECTED_STEP_RESPONSIBILITY:" + unexpected.join(","));
  }
  return result;
}

function parsePedagogy(input: unknown): CourseBuilderPedagogy {
  if (!isRecord(input)) throw new Error("INVALID_BUILD_PEDAGOGY");
  if (!isRecord(input.participation)) throw new Error("INVALID_BUILD_PARTICIPATION");
  if (input.languagePolicy !== "TERM_READABILITY") {
    throw new Error("COURSE_BUILDER_TERM_READABILITY_REQUIRED");
  }
  if (input.aiToolNeutral !== true) {
    throw new Error("COURSE_BUILDER_AI_TOOL_NEUTRAL_REQUIRED");
  }
  const prompt =
    input.participation.prompt === null
      ? null
      : requiredText(input.participation.prompt, "INVALID_PARTICIPATION_PROMPT", 6000);
  return {
    audience: enumValue(
      input.audience,
      ["BEGINNER", "GENERAL", "ADVANCED"] as const,
      "INVALID_PEDAGOGY_AUDIENCE"
    ),
    languagePolicy: "TERM_READABILITY",
    aiToolNeutral: true,
    participation: {
      kind: enumValue(
        input.participation.kind,
        ["CHOOSE", "CLASSIFY", "SHORT_RESPONSE", "COPY_TO_AI", "COMPARE", "REVEAL", "MINI_TASK"] as const,
        "INVALID_PARTICIPATION_KIND"
      ),
      title: requiredText(input.participation.title, "INVALID_PARTICIPATION_TITLE", 500),
      instruction: requiredText(input.participation.instruction, "INVALID_PARTICIPATION_INSTRUCTION", 3000),
      prompt,
      reflection: requiredText(input.participation.reflection, "INVALID_PARTICIPATION_REFLECTION", 3000)
    },
    sixStepResponsibilities: parseSixStepResponsibilities(input.sixStepResponsibilities)
  };
}

function parseLessonSpec(input: unknown): LessonSpec {
  if (!isRecord(input)) throw new Error("INVALID_LESSON_SPEC_DRAFT");
  rejectAuthorityFields(input);

  if (!Array.isArray(input.steps)) throw new Error("INVALID_LESSON_STEPS");
  const steps = input.steps.map((step) => {
    if (!isRecord(step)) throw new Error("INVALID_LESSON_STEP");
    return {
      id: requiredText(step.id, "INVALID_STEP_ID", 120),
      kind: enumValue(step.kind, stepKinds, "INVALID_STEP_KIND"),
      title: requiredText(step.title, "INVALID_STEP_TITLE", 300),
      objective: requiredText(step.objective, "INVALID_STEP_OBJECTIVE", 1000)
    };
  });

  if (!isRecord(input.accessPresentation)) {
    throw new Error("INVALID_ACCESS_PRESENTATION");
  }
  if (
    input.accessPresentation.showCourseContext !== true ||
    input.accessPresentation.showLearningPathLink !== true ||
    input.accessPresentation.inlineConversionCta !== false
  ) {
    throw new Error("COURSE_BUILDER_ACCESS_PRESENTATION_NOT_ALLOWED");
  }

  const spec: LessonSpec = {
    version: requiredText(input.version, "INVALID_SPEC_VERSION", 30),
    courseSlug: requiredText(input.courseSlug, "INVALID_COURSE_SLUG", 160),
    lessonId: requiredText(input.lessonId, "INVALID_LESSON_ID", 160),
    title: requiredText(input.title, "INVALID_LESSON_TITLE", 300),
    lessonType: enumValue(input.lessonType, lessonTypes, "INVALID_LESSON_TYPE"),
    learningObjectives: textArray(input.learningObjectives, "INVALID_LEARNING_OBJECTIVES"),
    knowledgePoints: textArray(input.knowledgePoints, "INVALID_KNOWLEDGE_POINTS"),
    prerequisites: textArray(input.prerequisites ?? [], "INVALID_PREREQUISITES", true),
    requiresExample: input.requiresExample === true,
    requiresCheck: input.requiresCheck === true,
    practiceMode: enumValue(input.practiceMode, practiceModes, "INVALID_PRACTICE_MODE"),
    realAiOperation: enumValue(input.realAiOperation, realAiOperations, "INVALID_REAL_AI_OPERATION"),
    realAiEvidence: enumValue(input.realAiEvidence, realAiEvidenceKinds, "INVALID_REAL_AI_EVIDENCE"),
    referenceAnswerEnabled: input.referenceAnswerEnabled === true,
    reviewEnabled: input.reviewEnabled === true,
    selfAssessmentEnabled: input.selfAssessmentEnabled === true,
    courseFeedbackEnabled: input.courseFeedbackEnabled === true,
    completionGates: Array.isArray(input.completionGates)
      ? input.completionGates.map((gate) =>
          enumValue(gate, completionGates, "INVALID_COMPLETION_GATE")
        )
      : (() => {
          throw new Error("INVALID_COMPLETION_GATES");
        })(),
    steps,
    capabilityGain: textArray(input.capabilityGain, "INVALID_CAPABILITY_GAIN"),
    nextLessonValue: optionalText(input.nextLessonValue, "INVALID_NEXT_LESSON_VALUE", 1200),
    accessPresentation: {
      showCourseContext: true,
      showLearningPathLink: true,
      inlineConversionCta: false
    }
  };

  const errors = validateLessonSpec(spec).filter((issue) => issue.severity === "ERROR");
  if (errors.length > 0) {
    throw new Error("COURSE_BUILDER_LESSON_SPEC_INVALID:" + errors.map((item) => item.code).join(","));
  }
  return spec;
}

function parseContent(input: unknown): CourseBuilderLessonContent {
  if (!isRecord(input)) throw new Error("INVALID_LESSON_CONTENT");
  if (!isRecord(input.example)) throw new Error("INVALID_LESSON_EXAMPLE");
  return {
    summary: requiredText(input.summary, "INVALID_CONTENT_SUMMARY", 1200),
    plainExplanation: requiredText(input.plainExplanation, "INVALID_CONTENT_EXPLANATION", 3000),
    whyItMatters: requiredText(input.whyItMatters, "INVALID_CONTENT_WHY", 3000),
    points: textArray(input.points, "INVALID_CONTENT_POINTS"),
    content: textArray(input.content, "INVALID_CONTENT_BODY"),
    example: {
      title: requiredText(input.example.title, "INVALID_EXAMPLE_TITLE", 500),
      situation: requiredText(input.example.situation, "INVALID_EXAMPLE_SITUATION", 3000),
      before: optionalText(input.example.before, "INVALID_EXAMPLE_BEFORE", 3000),
      after: optionalText(input.example.after, "INVALID_EXAMPLE_AFTER", 3000),
      result: requiredText(input.example.result, "INVALID_EXAMPLE_RESULT", 3000)
    },
    mistakes: textArray(input.mistakes, "INVALID_CONTENT_MISTAKES"),
    related: textArray(input.related, "INVALID_CONTENT_RELATED")
  };
}

function parseCheck(input: unknown): CourseBuilderCheck {
  if (!isRecord(input)) throw new Error("INVALID_BUILD_CHECK");
  if (!Array.isArray(input.options) || input.options.length < 2) {
    throw new Error("INVALID_BUILD_CHECK_OPTIONS");
  }
  const options = input.options.map((option) => {
    if (!isRecord(option)) throw new Error("INVALID_BUILD_CHECK_OPTION");
    return {
      value: requiredText(option.value, "INVALID_BUILD_CHECK_OPTION_VALUE", 120),
      label: requiredText(option.label, "INVALID_BUILD_CHECK_OPTION_LABEL", 1000)
    };
  });
  const correctValue = requiredText(input.correctValue, "INVALID_BUILD_CHECK_CORRECT_VALUE", 120);
  if (!options.some((option) => option.value === correctValue)) {
    throw new Error("BUILD_CHECK_CORRECT_VALUE_NOT_FOUND");
  }
  return {
    id: requiredText(input.id, "INVALID_BUILD_CHECK_ID", 160),
    question: requiredText(input.question, "INVALID_BUILD_CHECK_QUESTION", 3000),
    options,
    correctValue,
    explanation: requiredText(input.explanation, "INVALID_BUILD_CHECK_EXPLANATION", 3000)
  };
}

function parsePractice(input: unknown): CourseBuilderPractice {
  if (!isRecord(input)) throw new Error("INVALID_BUILD_PRACTICE");
  if (!Array.isArray(input.instructions) || input.instructions.length === 0) {
    throw new Error("INVALID_BUILD_PRACTICE_INSTRUCTIONS");
  }
  if (!Array.isArray(input.rubric) || input.rubric.length === 0) {
    throw new Error("INVALID_BUILD_PRACTICE_RUBRIC");
  }
  const instructions = input.instructions.map((item) => {
    if (!isRecord(item)) throw new Error("INVALID_BUILD_PRACTICE_INSTRUCTION");
    return {
      key: requiredText(item.key, "INVALID_BUILD_PRACTICE_KEY", 120),
      label: requiredText(item.label, "INVALID_BUILD_PRACTICE_LABEL", 500),
      prompt: requiredText(item.prompt, "INVALID_BUILD_PRACTICE_PROMPT", 3000)
    };
  });
  const keys = new Set(instructions.map((item) => item.key));
  const rubric = input.rubric.map((item) => {
    if (!isRecord(item)) throw new Error("INVALID_BUILD_PRACTICE_RUBRIC_ITEM");
    const key = requiredText(item.key, "INVALID_BUILD_PRACTICE_RUBRIC_KEY", 120);
    if (!keys.has(key)) throw new Error("BUILD_PRACTICE_RUBRIC_KEY_NOT_FOUND:" + key);
    if (typeof item.maxScore !== "number" || item.maxScore <= 0) {
      throw new Error("INVALID_BUILD_PRACTICE_MAX_SCORE");
    }
    if (
      typeof item.minScore !== "number" ||
      item.minScore < 0 ||
      item.minScore > item.maxScore
    ) {
      throw new Error("INVALID_BUILD_PRACTICE_MIN_SCORE");
    }
    return {
      key,
      label: requiredText(item.label, "INVALID_BUILD_PRACTICE_RUBRIC_LABEL", 500),
      maxScore: item.maxScore,
      minScore: item.minScore,
      example: requiredText(item.example, "INVALID_BUILD_PRACTICE_RUBRIC_EXAMPLE", 3000)
    };
  });
  if (typeof input.passScore !== "number" || input.passScore <= 0) {
    throw new Error("INVALID_BUILD_PRACTICE_PASS_SCORE");
  }
  const maxTotal = rubric.reduce((sum, item) => sum + item.maxScore, 0);
  if (input.passScore > maxTotal) throw new Error("BUILD_PRACTICE_PASS_SCORE_TOO_HIGH");
  return {
    id: requiredText(input.id, "INVALID_BUILD_PRACTICE_ID", 160),
    title: requiredText(input.title, "INVALID_BUILD_PRACTICE_TITLE", 500),
    goal: requiredText(input.goal, "INVALID_BUILD_PRACTICE_GOAL", 3000),
    instructions,
    hints: textArray(input.hints ?? [], "INVALID_BUILD_PRACTICE_HINTS", true),
    rubric,
    passScore: input.passScore
  };
}

export function validateCourseBuilderOutput(input: unknown): CourseBuilderOutput {
  if (!isRecord(input)) throw new Error("INVALID_COURSE_BUILDER_OUTPUT");
  rejectAuthorityFields(input);
  const mode = enumValue(input.mode, ["BUILD", "IMPROVE"] as const, "INVALID_COURSE_BUILDER_MODE");

  if (mode === "BUILD") {
    const grounding = parseGrounding(input.grounding);
    const pedagogy = parsePedagogy(input.pedagogy);
    const lessonSpec = parseLessonSpec(input.lessonSpec);
    const content = parseContent(input.content);
    const check = input.check === null ? null : parseCheck(input.check);
    const practice = input.practice === null ? null : parsePractice(input.practice);

    if (lessonSpec.requiresCheck && !check) throw new Error("BUILD_REQUIRED_CHECK_MISSING");
    if (!lessonSpec.requiresCheck && check) throw new Error("BUILD_UNEXPECTED_CHECK");
    if (lessonSpec.practiceMode !== "NONE" && !practice) throw new Error("BUILD_REQUIRED_PRACTICE_MISSING");
    if (lessonSpec.practiceMode === "NONE" && practice) throw new Error("BUILD_UNEXPECTED_PRACTICE");
    if (lessonSpec.lessonType === "CONCEPT" && !pedagogy.participation) {
      throw new Error("CONCEPT_PARTICIPATION_REQUIRED");
    }

    return {
      mode,
      grounding,
      pedagogy,
      lessonSpec,
      content,
      check,
      practice,
      hints: textArray(input.hints ?? [], "INVALID_BUILD_HINTS", true),
      referenceAnswer:
        input.referenceAnswer === null
          ? null
          : requiredText(input.referenceAnswer, "INVALID_REFERENCE_ANSWER", 12000),
      review: textArray(input.review, "INVALID_BUILD_REVIEW"),
      selfAssessment: textArray(
        input.selfAssessment ?? [],
        "INVALID_BUILD_SELF_ASSESSMENT",
        true
      )
    };
  }

  if (!Array.isArray(input.affectedSteps)) throw new Error("INVALID_IMPROVE_AFFECTED_STEPS");
  return {
    mode,
    lessonKey: requiredText(input.lessonKey, "INVALID_IMPROVE_LESSON_KEY", 320),
    changeSummary: requiredText(input.changeSummary, "INVALID_CHANGE_SUMMARY", 3000),
    evidence: textArray(input.evidence, "INVALID_IMPROVE_EVIDENCE"),
    affectedSteps: input.affectedSteps.map((step) =>
      enumValue(step, stepKinds, "INVALID_IMPROVE_STEP_KIND")
    ),
    proposedChanges: textArray(input.proposedChanges, "INVALID_PROPOSED_CHANGES"),
    reason: requiredText(input.reason, "INVALID_IMPROVE_REASON", 5000),
    risk: textArray(input.risk, "INVALID_IMPROVE_RISK"),
    keepUnchanged: textArray(input.keepUnchanged, "INVALID_KEEP_UNCHANGED"),
    validationPlan: textArray(input.validationPlan, "INVALID_VALIDATION_PLAN")
  };
}

export function createCourseBuilderReviewPacket(
  input: unknown,
  now = new Date()
): CourseBuilderReviewPacket {
  const output = validateCourseBuilderOutput(input);
  const warnings =
    output.mode === "BUILD"
      ? validateLessonSpec(output.lessonSpec)
          .filter((issue) => issue.severity === "WARNING")
          .map((issue) => issue.code)
      : [];

  return {
    skill: { id: "course-builder", version: "0.1.0" },
    mode: output.mode,
    status: "PENDING_REVIEW",
    validatedAt: now.toISOString(),
    output,
    validation: {
      schema: "PASS",
      rules: "PASS",
      warnings
    }
  };
}
