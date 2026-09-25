import fs from "node:fs";
import {
  COURSE_PRODUCTION_BOOTSTRAP_SOURCES,
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
  assert(!source.includes("TRACK02_"), "GLOBAL_RULE_SOURCE_BINDS_TRACK02:" + source);
  assert(!source.includes("DEFERRED_KNOWLEDGE_LEDGER"), "GLOBAL_RULE_SOURCE_BINDS_TRACK_DEFERRED_LEDGER:" + source);
  assert(!source.includes("FORMAL_BRIEF"), "GLOBAL_RULE_SOURCE_BINDS_TRACK_FORMAL_BRIEF:" + source);
}

const ruleBundle = loadCourseProductionRuleSources((source) =>
  fs.readFileSync(source, "utf8")
);
assert(
  Object.keys(ruleBundle).length === COURSE_PRODUCTION_RULE_SOURCES.length,
  "READ_LATEST_RULE_BUNDLE_INCOMPLETE"
);
assert(
  !COURSE_PRODUCTION_RULE_SOURCES.includes("docs/CURRENT_SYSTEM_FACTS.md" as never) &&
    !COURSE_PRODUCTION_RULE_SOURCES.includes("docs/learning/COURSE_BUILD_START_HERE.md" as never),
  "BOOTSTRAP_SOURCES_MUST_NOT_BE_NORMATIVE_RULE_SOURCES"
);
assert(
  JSON.stringify(COURSE_PRODUCTION_BOOTSTRAP_SOURCES) ===
    JSON.stringify(["docs/learning/COURSE_BUILD_START_HERE.md", "docs/CURRENT_SYSTEM_FACTS.md"]),
  "BOOTSTRAP_SOURCE_SET_DRIFT"
);

const workflowSource = fs.readFileSync(
  "lib/learning/course-production-workflow.ts",
  "utf8"
);
const workflowDoc = fs.readFileSync(
  "docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md",
  "utf8"
);
const courseBuildEntry = fs.readFileSync(
  "docs/learning/COURSE_BUILD_START_HERE.md",
  "utf8"
);
const outputContract = fs.readFileSync("docs/learning/LESSON_OUTPUT_CONTRACT_V1.md", "utf8");
const formalRegistryCheck = fs.readFileSync("scripts/validate-formal-lesson-runtime-registry.ts", "utf8");
const tasks = fs.readFileSync("TASKS.md", "utf8");
const formalCurriculum = fs.readFileSync(
  "docs/learning/FORMAL_CURRICULUM_V1.md",
  "utf8"
);
const continuity = fs.readFileSync(
  "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
  "utf8"
);
const governanceValidator = fs.readFileSync("scripts/validate-course-governance.ts", "utf8");
const scriptEntrypointValidator = fs.readFileSync("scripts/validate-script-entrypoints.ts", "utf8");
assert(!workflowSource.includes("skills/course-builder/"), "WORKFLOW_BINDS_CONCRETE_SKILL_VERSION");
assert(!workflowSource.includes('"1.0.0-track'), "WORKFLOW_BINDS_DRAFT_VERSION");
assert(
  workflowSource.includes("Switching Track/board changes context references only"),
  "WORKFLOW_TRACK_SWITCH_CONTEXT_ONLY_RULE_MISSING"
);
assert(
  workflowDoc.includes("Track switch = Context switch, not Workflow fork and not Skill fork."),
  "WORKFLOW_DOC_TRACK_SWITCH_RULE_MISSING"
);
assert(
  workflowDoc.includes("learning:course-governance:check") &&
    governanceValidator.includes("COURSE_GOVERNANCE_STEP5_MIN_TWO_FLEXIBLE_MAX=PASS"),
  "COURSE_GOVERNANCE_GATE_MISSING"
);
assert(
  workflowDoc.includes("scripts:current:check") &&
    scriptEntrypointValidator.includes("SCRIPT_ENTRYPOINTS_RETIRED_ABSENT=PASS"),
  "SCRIPT_ENTRYPOINT_GOVERNANCE_GATE_MISSING"
);
assert(
  courseBuildEntry.includes("不得默认从 Track 01 恢复"),
  "COURSE_BUILD_ENTRY_TRACK01_DEFAULT_DRIFT"
);
assert(
  courseBuildEntry.includes("当前 Formal Brief / Formal Brief Batch owner"),
  "COURSE_BUILD_ENTRY_CURRENT_BRIEF_RESOLUTION_MISSING"
);
assert(
  ["learningRecommendation", "navigationDescription", "bottomDetails"].every((field) =>
    outputContract.includes(field)
  ),
  "OUTPUT_CONTRACT_PRESENTATION_RULES_MISSING"
);
assert(
  outputContract.includes("Learner-visible course numbering rule") &&
    outputContract.includes("正常课程序号") &&
    outputContract.includes("`T2-07`"),
  "OUTPUT_CONTRACT_INTERNAL_ID_VISIBILITY_RULE_MISSING"
);
assert(
  outputContract.includes("本课能力适用场景与本课价值的总结说明") &&
    outputContract.includes("不得写成“我会先…… / 接下来应该……”式操作引导"),
  "OUTPUT_CONTRACT_STEP6_SUMMARY_RULE_MISSING"
);
assert(
  formalRegistryCheck.includes("formalLessonSpecs") &&
    formalRegistryCheck.includes("FORMAL_NAVIGATION_MISSING") &&
    formalRegistryCheck.includes("FORMAL_LEARNING_ADVICE_MISSING"),
  "FORMAL_PRESENTATION_GATE_MISSING"
);
assert(!tasks.includes("进度卡片由 Unified Lesson Shell 使用固定短描述"), "TASKS_OLD_NAVIGATION_RULE_PRESENT");

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
  COURSE_PRODUCTION_WORKFLOW_V1.bootstrapSources === COURSE_PRODUCTION_BOOTSTRAP_SOURCES,
  "WORKFLOW_BOOTSTRAP_SOURCE_DRIFT"
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

const activeRuleText = COURSE_PRODUCTION_RULE_SOURCES
  .map((path) => fs.readFileSync(path, "utf8"))
  .join("\n");

assert(
  !activeRuleText.includes("禁止把“AI适合做什么 / AI不应该替你做什么”"),
  "STEP5_OLD_FIXED_DIRECTION_CONTRADICTION_PRESENT"
);
assert(
  !activeRuleText.includes("2–4"),
  "STEP5_FIXED_CARD_COUNT_RANGE_PRESENT"
);
assert(
  activeRuleText.includes("至少 2 张") && activeRuleText.includes("上限不固定"),
  "STEP5_MIN_TWO_FLEXIBLE_MAX_RULE_MISSING"
);
assert(
  activeRuleText.includes("正常课程序号") &&
    activeRuleText.includes("内部 Lesson ID"),
  "LEARNER_CARD_INTERNAL_ID_RULE_MISSING"
);
assert(
  !formalCurriculum.includes("7 个学习阶段"),
  "FORMAL_CURRICULUM_OLD_TRACK01_SEVEN_STAGE_DRIFT"
);
assert(
  !formalCurriculum.includes("FROZEN_CONTEXT_V1 / SIX_STEP_AUDIT_PENDING"),
  "FORMAL_CURRICULUM_OLD_TRACK02_STATUS_DRIFT"
);
assert(
  !continuity.includes("本任务决定：course-builder@0.2.0") &&
    !continuity.includes("两批当前课程生产状态统一解释为：CONTINUITY_REWORK_REQUIRED"),
  "CONTINUITY_OLD_CURRENT_PRODUCTION_DECISION_PRESENT"
);
assert(
  continuity.includes("切换到 Track 02～05") &&
    continuity.includes("不新建 Track-specific Course Builder Skill"),
  "CONTINUITY_TRACK_SWITCH_WITHOUT_SKILL_FORK_RULE_MISSING"
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
console.log("COURSE_PRODUCTION_PRESENTATION_RULES_SHARED=PASS");
console.log("COURSE_PRODUCTION_ORCHESTRATOR_GATES=PASS");
console.log("COURSE_PRODUCTION_HUMAN_REVIEW_GATE=PASS");
console.log("COURSE_BUILDER_SKILL_V1_CURRENT=PASS");
