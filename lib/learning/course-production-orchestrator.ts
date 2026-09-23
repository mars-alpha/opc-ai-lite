import {
  COURSE_PRODUCTION_RULE_SOURCES,
  type CourseProductionRuleBundle,
  type CourseProductionRuleSource,
  type CourseProductionSnapshot
} from "./course-production-contract";
import type { CourseProductionWorkflowStage } from "./course-production-workflow";

function hasAllRuleSources(loaded: readonly CourseProductionRuleSource[]) {
  return COURSE_PRODUCTION_RULE_SOURCES.every((source) =>
    loaded.includes(source)
  );
}

export function loadCourseProductionRuleSources(
  readLatest: (path: CourseProductionRuleSource) => string
): CourseProductionRuleBundle {
  return Object.fromEntries(
    COURSE_PRODUCTION_RULE_SOURCES.map((source) => {
      const content = readLatest(source);
      if (!content.trim()) {
        throw new Error("COURSE_PRODUCTION_RULE_SOURCE_EMPTY:" + source);
      }
      return [source, content];
    })
  ) as CourseProductionRuleBundle;
}

export function nextCourseProductionStage(
  snapshot: CourseProductionSnapshot
): CourseProductionWorkflowStage | "COMPLETE" {
  if (!hasAllRuleSources(snapshot.ruleSourcesLoaded)) {
    return "LOAD_CURRENT_RULE_SOURCES";
  }
  if (!snapshot.groundingReady) return "PREPARE_GROUNDING";
  if (!snapshot.courseContextReady) return "PREPARE_FORMAL_BRIEF";
  if (!snapshot.formalBriefReady) return "PREPARE_FORMAL_BRIEF";
  if (!snapshot.draftReady) return "RUN_COURSE_BUILDER";
  if (snapshot.deterministicValidation !== "PASS") {
    return "RUN_DETERMINISTIC_VALIDATORS";
  }
  if (snapshot.humanReview !== "PASS") return "HUMAN_REVIEW_GATE";
  if (!snapshot.lessonSpecRegistered) return "REGISTER_LESSON_SPEC";
  if (!snapshot.runtimeProvisioned) return "PROVISION_RUNTIME";
  if (snapshot.runtimeAcceptance !== "PASS") {
    return "RUN_RUNTIME_ACCEPTANCE";
  }
  if (!snapshot.available) return "MARK_AVAILABLE";
  return "COMPLETE";
}

export function assertRuntimeEntryAllowed(snapshot: CourseProductionSnapshot) {
  if (snapshot.deterministicValidation !== "PASS") {
    throw new Error("RUNTIME_REQUIRES_DETERMINISTIC_VALIDATION_PASS");
  }
  if (snapshot.humanReview !== "PASS") {
    throw new Error("RUNTIME_REQUIRES_HUMAN_REVIEW_PASS");
  }
}
