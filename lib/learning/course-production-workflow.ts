import {
  COURSE_PRODUCTION_CONTRACT_VERSION,
  COURSE_PRODUCTION_RULE_SOURCES
} from "./course-production-contract";

export const COURSE_PRODUCTION_WORKFLOW_V1 = {
  id: "course-production-workflow",
  version: "1.0.0",
  contractVersion: COURSE_PRODUCTION_CONTRACT_VERSION,
  ruleSourcePolicy: "READ_LATEST_AT_RUN_START",
  requiredRuleSources: COURSE_PRODUCTION_RULE_SOURCES,
  contextPolicy: "RESOLVE_CURRENT_COURSE_CONTEXT_BEFORE_BUILD",
  requiredContextKinds: [
    "CURRENT_TRACK_OR_BOARD_CATALOG",
    "PREVIOUS_CURRENT_NEXT_LESSON_CONTINUITY",
    "FORMAL_BRIEF",
    "DEFERRED_KNOWLEDGE_BOUNDARIES"
  ] as const,
  stages: [
    "LOAD_CURRENT_RULE_SOURCES",
    "PREPARE_GROUNDING",
    "PREPARE_FORMAL_BRIEF",
    "RUN_COURSE_BUILDER",
    "RUN_DETERMINISTIC_VALIDATORS",
    "HUMAN_REVIEW_GATE",
    "REGISTER_LESSON_SPEC",
    "PROVISION_RUNTIME",
    "RUN_RUNTIME_ACCEPTANCE",
    "MARK_AVAILABLE"
  ] as const,
  invariants: [
    "Workflow depends on stable contracts and standard gate states, not a concrete Skill version.",
    "Rule source content is read at workflow run start; rule text is not copied into the workflow.",
    "Global rule sources must not bind a Track-specific catalog, lesson brief, batch file, or deferred ledger.",
    "Current Track/board owner and its current directory status are resolved from Current Facts before Course Builder.",
    "Previous-current-next continuity, current Formal Brief/batch, deferred boundaries, and required grounding are resolved as run context before Course Builder.",
    "Switching Track/board changes context references only; it must not fork the workflow or create a Track-specific Course Builder Skill.",
    "Skill output cannot publish, mutate Access, mutate Progress, or mark AVAILABLE.",
    "Deterministic validation PASS cannot replace Human Review PASS.",
    "Human Review PASS cannot replace Runtime Acceptance PASS.",
    "AVAILABLE requires Human Review PASS and Runtime Acceptance PASS."
  ] as const
} as const;

export type CourseProductionWorkflowStage =
  (typeof COURSE_PRODUCTION_WORKFLOW_V1.stages)[number];
