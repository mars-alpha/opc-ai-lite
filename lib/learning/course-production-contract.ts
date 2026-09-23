import type { CourseBuilderOutput } from "./course-builder";

export const COURSE_PRODUCTION_CONTRACT_VERSION = "1.0.0" as const;

export const COURSE_PRODUCTION_RULE_SOURCES = [
  "docs/learning/COURSE_BUILD_START_HERE.md",
  "docs/CURRENT_SYSTEM_FACTS.md",
  "docs/learning/FORMAL_CURRICULUM_V1.md",
  "docs/learning/LESSON_OUTPUT_CONTRACT_V1.md",
  "docs/learning/BEGINNER_LESSON_QUALITY_STANDARD_V1.md",
  "docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md",
  "docs/learning/UNIFIED_LESSON_SHELL_V1.md"
] as const;

export type CourseProductionRuleSource =
  (typeof COURSE_PRODUCTION_RULE_SOURCES)[number];

export type CourseProductionRuleBundle = Record<
  CourseProductionRuleSource,
  string
>;

export type CourseProductionValidatorResult = {
  id: string;
  status: "PASS" | "FAIL";
  issues: string[];
};

export type CourseHumanReviewDecision =
  | "PENDING"
  | "PASS"
  | "REVISE"
  | "REJECT";

export type CourseHumanReviewResult = {
  decision: CourseHumanReviewDecision;
  reference: string | null;
  notes: string[];
};

export type CourseBuilderPort = {
  id: "course-builder";
  version: string;
  build(input: unknown): Promise<CourseBuilderOutput>;
};

export type CourseProductionRuntimeGate = {
  status: "PENDING" | "PASS" | "FAIL";
  reference: string | null;
};

export type CourseProductionSnapshot = {
  ruleSourcesLoaded: CourseProductionRuleSource[];
  courseContextReady: boolean;
  groundingReady: boolean;
  formalBriefReady: boolean;
  draftReady: boolean;
  deterministicValidation: "PENDING" | "PASS" | "FAIL";
  humanReview: CourseHumanReviewDecision;
  lessonSpecRegistered: boolean;
  runtimeProvisioned: boolean;
  runtimeAcceptance: CourseProductionRuntimeGate["status"];
  available: boolean;
};
