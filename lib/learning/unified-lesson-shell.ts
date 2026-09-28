import type { LessonStepKind } from "./lesson-spec";
import type {
  CourseBuilderCheckQuestionType,
  CourseBuilderMasteryRole
} from "./course-builder";

export const UNIFIED_LESSON_SHELL_VERSION = "1.0.0" as const;
export const UNIFIED_LESSON_SHELL_STATUS = "FROZEN_V1" as const;

export const UNIFIED_LESSON_STEP_ORDER = [
  "EXPLAIN",
  "EXAMPLE",
  "CHECK",
  "PRACTICE",
  "REVIEW",
  "CAPABILITY"
] as const satisfies readonly LessonStepKind[];

export const UNIFIED_LESSON_STEP_LABELS: Readonly<Record<LessonStepKind, string>> = {
  EXPLAIN: "建立直觉",
  EXAMPLE: "讲透方法",
  CHECK: "检查理解",
  PRACTICE: "动手实操",
  REVIEW: "复盘框架",
  CAPABILITY: "能力获得"
};

export const UNIFIED_LESSON_MASTERY_SEQUENCE = [
  { questionType: "SINGLE_CHOICE", masteryRole: "BEST_JUDGMENT" },
  { questionType: "TRUE_FALSE", masteryRole: "MISCONCEPTION" },
  { questionType: "MULTI_SELECT", masteryRole: "BOUNDARY_CONDITIONS" }
] as const satisfies readonly {
  questionType: CourseBuilderCheckQuestionType;
  masteryRole: CourseBuilderMasteryRole;
}[];

export function unifiedLessonStepLabel(kind: LessonStepKind) {
  return UNIFIED_LESSON_STEP_LABELS[kind];
}

export function lessonStepNavigationDescription(step: { kind: LessonStepKind; objective: string; navigationDescription?: string }) {
  if (step.navigationDescription) return step.navigationDescription;
  return step.objective;
}
