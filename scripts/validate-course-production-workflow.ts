import fs from "node:fs";
import {
  COURSE_PRODUCTION_BOOTSTRAP_SOURCES,
  COURSE_PRODUCTION_RULE_SOURCES
} from "../lib/learning/course-production-contract";
import { COURSE_PRODUCTION_WORKFLOW_V1 } from "../lib/learning/course-production-workflow";
import {
  loadCourseProductionRuleSources,
  nextCourseProductionStage
} from "../lib/learning/course-production-orchestrator";
import {
  createCourseHumanReviewResult,
  humanReviewAllowsRuntime
} from "../lib/learning/course-human-review-gate";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_PRODUCTION_WORKFLOW_FAILED:" + code);
}

const expectedRules = [
  "docs/learning/FORMAL_CURRICULUM_V1.md",
  "docs/learning/COURSE_BUILD_STANDARD_V1.md",
  "docs/learning/UNIFIED_LESSON_SHELL_V1.md"
];

assert(
  JSON.stringify(COURSE_PRODUCTION_RULE_SOURCES) === JSON.stringify(expectedRules),
  "RULE_SOURCE_SET_DRIFT"
);
assert(
  JSON.stringify(COURSE_PRODUCTION_BOOTSTRAP_SOURCES) ===
    JSON.stringify(["docs/learning/COURSE_BUILD_START_HERE.md", "docs/CURRENT_SYSTEM_FACTS.md"]),
  "BOOTSTRAP_SOURCE_SET_DRIFT"
);

for (const source of COURSE_PRODUCTION_RULE_SOURCES) {
  assert(fs.existsSync(source), "RULE_SOURCE_MISSING:" + source);
  assert(!/TRACK0|FORMAL_BRIEF|task-results|DEFERRED/.test(source), "GLOBAL_RULE_SOURCE_CONTEXT_LEAK:" + source);
}

const bundle = loadCourseProductionRuleSources((source) => fs.readFileSync(source, "utf8"));
assert(Object.keys(bundle).length === expectedRules.length, "READ_LATEST_RULE_BUNDLE_INCOMPLETE");
assert(COURSE_PRODUCTION_WORKFLOW_V1.ruleSourcePolicy === "READ_LATEST_AT_RUN_START", "READ_LATEST_POLICY_DRIFT");
assert(
  COURSE_PRODUCTION_WORKFLOW_V1.contextPolicy === "RESOLVE_CURRENT_COURSE_CONTEXT_BEFORE_BUILD",
  "CONTEXT_POLICY_DRIFT"
);
assert(CURRENT_COURSE_BUILDER_SKILL.version === "1.0.0", "CURRENT_SKILL_VERSION_DRIFT");

const workflowDoc = fs.readFileSync("docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md", "utf8");
assert(workflowDoc.includes("Track switch = Context switch"), "TRACK_SWITCH_RULE_MISSING");
assert(workflowDoc.includes("历史生产过程通过 Git"), "HISTORICAL_BOUNDARY_MISSING");

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

assert(nextCourseProductionStage(base) === "MARK_AVAILABLE", "LAST_GATE_INVALID");
assert(
  nextCourseProductionStage({ ...base, courseContextReady: false }) === "PREPARE_FORMAL_BRIEF",
  "CONTEXT_GATE_INVALID"
);
assert(
  nextCourseProductionStage({ ...base, deterministicValidation: "FAIL" }) === "RUN_DETERMINISTIC_VALIDATORS",
  "VALIDATOR_GATE_INVALID"
);
assert(
  nextCourseProductionStage({ ...base, humanReview: "REVISE" }) === "HUMAN_REVIEW_GATE",
  "HUMAN_REVIEW_GATE_INVALID"
);

const pass = createCourseHumanReviewResult("PASS", "governance-human-review");
const revise = createCourseHumanReviewResult("REVISE", null);
assert(humanReviewAllowsRuntime(pass), "HUMAN_PASS_MUST_ALLOW_RUNTIME");
assert(!humanReviewAllowsRuntime(revise), "HUMAN_REVISE_MUST_BLOCK_RUNTIME");

console.log("COURSE_PRODUCTION_STABLE_CONTRACT=PASS");
console.log("COURSE_PRODUCTION_SINGLE_RULE_SOURCE_SET=PASS");
console.log("COURSE_PRODUCTION_READ_LATEST=PASS");
console.log("COURSE_PRODUCTION_CONTEXT_GATE=PASS");
console.log("COURSE_PRODUCTION_HUMAN_REVIEW_GATE=PASS");
console.log("COURSE_PRODUCTION_CURRENT_SKILL=PASS");