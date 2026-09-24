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

export const UNIFIED_LESSON_STEP_NAV_DESCRIPTIONS: Readonly<Record<LessonStepKind, string>> = {
  EXPLAIN: "从真实问题出发\n抓住核心判断",
  EXAMPLE: "跟着案例看\n方法怎样起作用",
  CHECK: "做题检验理解\n找出判断误区",
  PRACTICE: "亲手完成任务\n检查实际结果",
  REVIEW: "整理判断框架\n记住适用边界",
  CAPABILITY: "确认自己会做\n知道何时使用"
};

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

export function unifiedLessonStepNavDescription(kind: LessonStepKind) {
  return UNIFIED_LESSON_STEP_NAV_DESCRIPTIONS[kind];
}

export function lessonStepNavigationDescription(step: { kind: LessonStepKind; objective: string; navigationDescription?: string }) {
  if (step.navigationDescription) return step.navigationDescription;
  return step.objective;
}
