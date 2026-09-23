import fs from "node:fs";
import {
  COURSE_PRODUCTION_RULE_SOURCES
} from "../lib/learning/course-production-contract";
import {
  COURSE_PRODUCTION_WORKFLOW_V1
} from "../lib/learning/course-production-workflow";
import {
  loadCourseProductionRuleSources,
  nextCourseProductionStage
} from "../lib/learning/course-production-orchestrator";
import {
  createCourseHumanReviewResult,
  humanReviewAllowsRuntime
} from "../lib/learning/course-human-review-gate";
import {
  CURRENT_COURSE_BUILDER_SKILL
} from "../skills/course-builder";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_PRODUCTION_WORKFLOW_FAILED:" + code);
}

for (const source of COURSE_PRODUCTION_RULE_SOURCES) {
  assert(fs.existsSync(source), "RULE_SOURCE_MISSING:" + source);
  assert(!source.includes("TRACK01_"), "GLOBAL_RULE_SOURCE_BINDS_TRACK01:" + source);
  assert(!source.includes("DEFERRED_KNOWLEDGE_LEDGER"), "GLOBAL_RULE_SOURCE_BINDS_TRACK_DEFERRED_LEDGER:" + source);
}

const ruleBundle = loadCourseProductionRuleSources((source) =>
  fs.readFileSync(source, "utf8")
);
assert(
  Object.keys(ruleBundle).length === COURSE_PRODUCTION_RULE_SOURCES.length,
  "READ_LATEST_RULE_BUNDLE_INCOMPLETE"
);

const workflowSource = fs.readFileSync(
  "lib/learning/course-production-workflow.ts",
  "utf8"
);
assert(!workflowSource.includes("skills/course-builder/v1"), "WORKFLOW_BINDS_SKILL_V1");
assert(!workflowSource.includes("skills/course-builder/v0.2"), "WORKFLOW_BINDS_SKILL_V02");
assert(!workflowSource.includes('"1.0.0-track'), "WORKFLOW_BINDS_DRAFT_VERSION");

assert(
  COURSE_PRODUCTION_WORKFLOW_V1.ruleSourcePolicy === "READ_LATEST_AT_RUN_START",
  "WORKFLOW_MUST_READ_LATEST_RULES"
);
assert(
  COURSE_PRODUCTION_WORKFLOW_V1.requiredRuleSources.length ===
    COURSE_PRODUCTION_RULE_SOURCES.length,
  "WORKFLOW_RULE_SOURCE_DRIFT"
);
assert(
  COURSE_PRODUCTION_WORKFLOW_V1.contextPolicy ===
    "RESOLVE_CURRENT_COURSE_CONTEXT_BEFORE_BUILD",
  "WORKFLOW_CONTEXT_POLICY_DRIFT"
);
for (const kind of [
  "CURRENT_TRACK_OR_BOARD_CATALOG",
  "PREVIOUS_CURRENT_NEXT_LESSON_CONTINUITY",
  "FORMAL_BRIEF",
  "DEFERRED_KNOWLEDGE_BOUNDARIES"
] as const) {
  assert(
    COURSE_PRODUCTION_WORKFLOW_V1.requiredContextKinds.includes(kind),
    "WORKFLOW_CONTEXT_KIND_MISSING:" + kind
  );
}

const activeRuleText = [
  "docs/learning/COURSE_BUILD_START_HERE.md",
  "docs/learning/LESSON_OUTPUT_CONTRACT_V1.md",
  "docs/learning/BEGINNER_LESSON_QUALITY_STANDARD_V1.md",
  "docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md"
].map((path) => fs.readFileSync(path, "utf8")).join("\n");

assert(
  !activeRuleText.includes("禁止把“AI适合做什么 / AI不应该替你做什么”"),
  "STEP5_OLD_FIXED_DIRECTION_CONTRADICTION_PRESENT"
);
assert(
  !activeRuleText.includes("2–4"),
  "STEP5_FIXED_CARD_COUNT_RANGE_PRESENT"
);

const base = {
  ruleSourcesLoaded: [...COURSE_PRODUCTION_RULE_SOURCES],
  courseContextReady: true,
  groundingReady: true,
  formalBriefReady: true,
  draftReady: true,
  deterministicValidation: "PASS" as const,
  humanReview: "PASS" as const,
  lessonSpecRegistered: true,
  runtimeProvisioned: true,
  runtimeAcceptance: "PASS" as const,
  available: false
};
assert(nextCourseProductionStage(base) === "MARK_AVAILABLE", "ORCHESTRATOR_LAST_GATE_INVALID");
assert(
  nextCourseProductionStage({ ...base, courseContextReady: false }) === "PREPARE_FORMAL_BRIEF",
  "ORCHESTRATOR_COURSE_CONTEXT_GATE_INVALID"
);
assert(
  nextCourseProductionStage({ ...base, humanReview: "REVISE" }) === "HUMAN_REVIEW_GATE",
  "ORCHESTRATOR_HUMAN_REVIEW_GATE_INVALID"
);
assert(
  nextCourseProductionStage({ ...base, deterministicValidation: "FAIL" }) ===
    "RUN_DETERMINISTIC_VALIDATORS",
  "ORCHESTRATOR_VALIDATOR_GATE_INVALID"
);

const passedReview = createCourseHumanReviewResult(
  "PASS",
  "docs/task-results/example-human-review.md"
);
assert(humanReviewAllowsRuntime(passedReview), "HUMAN_REVIEW_PASS_MUST_ALLOW_RUNTIME");
assert(CURRENT_COURSE_BUILDER_SKILL.version === "1.0.0", "CURRENT_SKILL_NOT_V1");
assert(
  CURRENT_COURSE_BUILDER_SKILL.requiredRuleSources === COURSE_PRODUCTION_RULE_SOURCES,
  "SKILL_RULE_SOURCES_NOT_SHARED_CONTRACT"
);

console.log("COURSE_PRODUCTION_STABLE_CONTRACT=PASS");
console.log("COURSE_PRODUCTION_WORKFLOW_SKILL_DECOUPLED=PASS");
console.log("COURSE_PRODUCTION_RULE_SOURCE_SYNC=PASS");
console.log("COURSE_PRODUCTION_GLOBAL_RULE_SOURCES=PASS");
console.log("COURSE_PRODUCTION_CONTEXT_POLICY=PASS");
console.log("COURSE_PRODUCTION_ACTIVE_RULE_DRIFT_GUARD=PASS");
console.log("COURSE_PRODUCTION_ORCHESTRATOR_GATES=PASS");
console.log("COURSE_PRODUCTION_HUMAN_REVIEW_GATE=PASS");
console.log("COURSE_BUILDER_SKILL_V1_CURRENT=PASS");
