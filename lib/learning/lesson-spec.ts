export type LessonType = "CONCEPT" | "APPLICATION" | "PRACTICE" | "PROJECT";
export type RealAiOperation = "NONE" | "GUIDED" | "REQUIRED";
export type RealAiEvidence = "NONE" | "USER_CONFIRMATION" | "ARTIFACT" | "SYSTEM_RESULT";
export type PracticeMode = "NONE" | "GUIDED" | "INDEPENDENT" | "PROJECT";
export type CompletionGate = "CHECK" | "PRACTICE" | "DELIVERABLE" | "REAL_AI";
export type LessonStepKind = "EXPLAIN" | "EXAMPLE" | "CHECK" | "PRACTICE" | "REVIEW" | "CAPABILITY";

export type LessonStepSpec = {
  id: string;
  kind: LessonStepKind;
  title: string;
  objective: string;
};

export type LessonSpec = {
  version: string;
  courseSlug: string;
  lessonId: string;
  title: string;
  lessonType: LessonType;
  learningObjectives: string[];
  knowledgePoints: string[];
  prerequisites: string[];
  requiresExample: boolean;
  requiresCheck: boolean;
  practiceMode: PracticeMode;
  realAiOperation: RealAiOperation;
  realAiEvidence: RealAiEvidence;
  referenceAnswerEnabled: boolean;
  reviewEnabled: boolean;
  selfAssessmentEnabled: boolean;
  courseFeedbackEnabled: boolean;
  completionGates: CompletionGate[];
  steps: LessonStepSpec[];
  capabilityGain: string[];
  nextLessonValue?: string;
  accessPresentation: {
    showCourseContext: true;
    showLearningPathLink: true;
    inlineConversionCta: false;
  };
};

export type LessonSpecIssue = {
  severity: "ERROR" | "WARNING";
  code: string;
  message: string;
};

const stepOrder: Record<LessonStepKind, number> = {
  EXPLAIN: 0,
  EXAMPLE: 1,
  CHECK: 2,
  PRACTICE: 3,
  REVIEW: 4,
  CAPABILITY: 5
};

function hasStep(spec: LessonSpec, kind: LessonStepKind) {
  return spec.steps.some((step) => step.kind === kind);
}

function hasGate(spec: LessonSpec, gate: CompletionGate) {
  return spec.completionGates.includes(gate);
}

export function validateLessonSpec(spec: LessonSpec): LessonSpecIssue[] {
  const issues: LessonSpecIssue[] = [];
  const error = (code: string, message: string) =>
    issues.push({ severity: "ERROR", code, message });
  const warning = (code: string, message: string) =>
    issues.push({ severity: "WARNING", code, message });

  if (spec.learningObjectives.length === 0) error("OBJECTIVE_REQUIRED", "Lesson 必须至少有一个 Learning Objective。");
  if (spec.knowledgePoints.length === 0) error("KNOWLEDGE_POINT_REQUIRED", "Lesson 必须至少有一个 Knowledge Point。");
  if (spec.capabilityGain.length === 0) error("CAPABILITY_GAIN_REQUIRED", "Lesson 必须定义能力获得。");

  const ids = new Set<string>();
  for (const step of spec.steps) {
    if (ids.has(step.id)) error("DUPLICATE_STEP_ID", "Step id 必须唯一：" + step.id);
    ids.add(step.id);
  }

  for (let index = 1; index < spec.steps.length; index += 1) {
    if (stepOrder[spec.steps[index].kind] < stepOrder[spec.steps[index - 1].kind]) {
      error("STEP_ORDER_INVALID", "Step 顺序必须遵守 Explain → Example → Check → Practice → Review → Capability。");
      break;
    }
  }

  if (!hasStep(spec, "CAPABILITY")) error("CAPABILITY_STEP_REQUIRED", "所有 Lesson 都必须有 Capability Step。");
  if (spec.steps.at(-1)?.kind !== "CAPABILITY") error("CAPABILITY_STEP_LAST", "Capability 必须是最后一个课程 Step。");
  if (spec.requiresExample && !hasStep(spec, "EXAMPLE")) error("EXAMPLE_STEP_REQUIRED", "requiresExample=true 时必须包含 Example Step。");
  if (spec.requiresCheck && !hasStep(spec, "CHECK")) error("CHECK_STEP_REQUIRED", "requiresCheck=true 时必须包含 Check Step。");
  if (!spec.requiresCheck && hasGate(spec, "CHECK")) error("CHECK_GATE_WITHOUT_CHECK", "没有 required Check 时不能设置 CHECK Completion Gate。");

  if (spec.practiceMode === "NONE") {
    if (hasStep(spec, "PRACTICE")) error("PRACTICE_STEP_NOT_ALLOWED", "practiceMode=NONE 时不能包含 Practice Step。");
    if (hasGate(spec, "PRACTICE")) error("PRACTICE_GATE_NOT_ALLOWED", "practiceMode=NONE 时不能设置 PRACTICE Gate。");
  } else {
    if (!hasStep(spec, "PRACTICE")) error("PRACTICE_STEP_REQUIRED", "存在 Practice Mode 时必须包含 Practice Step。");
  }

  if (spec.reviewEnabled && !hasStep(spec, "REVIEW")) error("REVIEW_STEP_REQUIRED", "reviewEnabled=true 时必须包含 Review Step。");
  if (spec.selfAssessmentEnabled && !spec.reviewEnabled) error("SELF_ASSESSMENT_REQUIRES_REVIEW", "学习自评必须位于 Review 阶段。");

  if (spec.realAiOperation === "NONE") {
    if (spec.realAiEvidence !== "NONE") error("REAL_AI_EVIDENCE_NOT_ALLOWED", "real_ai_operation=NONE 时 evidence 必须为 NONE。");
    if (hasGate(spec, "REAL_AI")) error("REAL_AI_GATE_NOT_ALLOWED", "real_ai_operation=NONE 时不能设置 REAL_AI Gate。");
  }
  if (spec.realAiOperation === "REQUIRED") {
    if (spec.realAiEvidence === "NONE") error("REAL_AI_EVIDENCE_REQUIRED", "REQUIRED 真实 AI 操作必须定义完成证据。");
    if (!hasGate(spec, "REAL_AI")) error("REAL_AI_GATE_REQUIRED", "REQUIRED 真实 AI 操作必须进入 Completion Gate。");
  }
  if (spec.realAiOperation === "GUIDED" && hasGate(spec, "REAL_AI")) {
    warning("GUIDED_REAL_AI_IS_NOT_GATE", "GUIDED 真实 AI 操作默认不应成为 Completion Gate；若必须完成应改为 REQUIRED。");
  }

  if (spec.lessonType === "CONCEPT") {
    if (!spec.requiresCheck || !hasGate(spec, "CHECK")) error("CONCEPT_CHECK_GATE_REQUIRED", "CONCEPT 必须以 required Check 作为 Completion Gate。");
    if (spec.practiceMode !== "NONE") error("CONCEPT_PRACTICE_MODE", "基础 CONCEPT 默认不应强制 Practice；需要实操时应重新判断 Lesson Type。");
  }

  if (spec.lessonType === "APPLICATION") {
    if (!spec.requiresCheck || !hasGate(spec, "CHECK")) error("APPLICATION_CHECK_GATE_REQUIRED", "APPLICATION 必须通过理解检查。");
    if (spec.practiceMode === "NONE" || !hasGate(spec, "PRACTICE")) error("APPLICATION_PRACTICE_GATE_REQUIRED", "APPLICATION 必须包含可验收 Practice。");
  }

  if (spec.lessonType === "PRACTICE") {
    if (!["INDEPENDENT", "PROJECT"].includes(spec.practiceMode)) error("PRACTICE_MODE_INDEPENDENT", "PRACTICE 必须以独立完成为主。");
    if (!hasGate(spec, "PRACTICE")) error("PRACTICE_COMPLETION_GATE_REQUIRED", "PRACTICE 必须以 Practice 通过作为 Completion Gate。");
  }

  if (spec.lessonType === "PROJECT") {
    if (spec.practiceMode !== "PROJECT") error("PROJECT_MODE_REQUIRED", "PROJECT 必须使用 PROJECT practiceMode。");
    if (!hasGate(spec, "DELIVERABLE")) error("PROJECT_DELIVERABLE_GATE_REQUIRED", "PROJECT 必须以 Deliverable 作为 Completion Gate。");
  }

  if (!spec.courseFeedbackEnabled) warning("COURSE_FEEDBACK_DISABLED", "课程评分默认应启用，但永远不是 Completion Gate。");

  return issues;
}

export function assertValidLessonSpec(spec: LessonSpec) {
  const errors = validateLessonSpec(spec).filter((issue) => issue.severity === "ERROR");
  if (errors.length > 0) {
    throw new Error(spec.courseSlug + "/" + spec.lessonId + ": " + errors.map((item) => item.code).join(", "));
  }
}
