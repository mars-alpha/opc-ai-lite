import fs from "node:fs";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_GOVERNANCE_FAILED:" + code);
}

const read = (path: string) => fs.readFileSync(path, "utf8");
const ruleText = COURSE_PRODUCTION_RULE_SOURCES.map(read).join("\n");
const entry = read("docs/learning/COURSE_BUILD_START_HERE.md");
const workflowDoc = read("docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md");
const workflowCode = read("lib/learning/course-production-workflow.ts");
const skill = read("skills/course-builder/v1.ts");
const courseBuilderCore = read("lib/learning/course-builder.ts");
const skillRegistry = read("skills/REGISTRY.md");
const panel = read("components/GenericLessonRuntimePanel.tsx");
const batchCPreview = read("app/course-builder/preview/track02-batch-c/[lessonId]/page.tsx");
const batchDSource = read("fixtures/course-builder/track02-batch-d.ts");
const batchDValidator = read("scripts/validate-track02-batch-d-drafts.ts");
const formalRoute = read("app/courses/[slug]/lessons/[lessonId]/page.tsx");

for (const phrase of [
  "Step 5 保持 2–4",
  "Step 5 固定 2–4",
  "Review 主卡片固定为两张",
  "保持两张主 Review 卡片",
  "两个方向各一张已经能把本课讲清楚，就保持两张"
]) {
  assert(!ruleText.includes(phrase), "ACTIVE_RULE_FIXED_REVIEW_COUNT:" + phrase);
}

assert(
  ruleText.includes("至少 2 张") &&
    ruleText.includes("上限不固定"),
  "ACTIVE_RULE_REVIEW_MIN_TWO_FLEXIBLE_MAX_MISSING"
);
assert(
  ruleText.includes("本课能力适用场景与本课价值的总结说明") &&
    ruleText.includes("Next Lesson Value"),
  "ACTIVE_RULE_STEP6_TRIGGER_SEPARATION_MISSING"
);
assert(
  ruleText.includes("正常课程序号") &&
    ruleText.includes("T2-07"),
  "ACTIVE_RULE_LEARNER_NUMBERING_BOUNDARY_MISSING"
);

assert(
  skill.includes("至少 2 张") &&
    skill.includes("上限不固定"),
  "COURSE_BUILDER_REVIEW_MIN_TWO_FLEXIBLE_MAX_DRIFT"
);
assert(
  courseBuilderCore.includes("主卡片至少 2 张") &&
    courseBuilderCore.includes("上限不固定"),
  "COURSE_BUILDER_CORE_REVIEW_RULE_DRIFT"
);
assert(
  ruleText.includes("STEP_1_2_OVERLAP_FAIL") &&
    skill.includes("STEP_1_2_OVERLAP_FAIL"),
  "STEP_1_2_OVERLAP_GUARD_MISSING"
);
assert(
  ruleText.includes("STEP5_KNOWLEDGE_COVERAGE_FAIL") &&
    skill.includes("STEP5_KNOWLEDGE_COVERAGE_FAIL"),
  "STEP5_KNOWLEDGE_COVERAGE_GUARD_MISSING"
);
assert(
  !batchDSource.includes("situation: lesson.example.situation") &&
    !batchDSource.includes("text: lesson.example.before") &&
    !batchDSource.includes("text: lesson.example.after") &&
    !batchDSource.includes("lesson.mistakes.slice"),
  "BATCH_D_TEMPLATE_DERIVATION_DRIFT"
);
assert(
  batchDValidator.includes("STEP_1_2_OVERLAP") &&
    batchDValidator.includes("STEP5_KNOWLEDGE_COVERAGE"),
  "BATCH_D_CONTENT_INTEGRITY_VALIDATOR_MISSING"
);
assert(
  skill.includes("不能写成下一课预告") &&
    skill.includes("不能用 Next Lesson Value 代替"),
  "COURSE_BUILDER_STEP6_TRIGGER_DRIFT"
);

assert(panel.includes("previewTriggerScenario?: string | null"), "PREVIEW_TRIGGER_PROP_MISSING");
assert(
  panel.includes("? previewTriggerScenario") &&
    !panel.includes("const presentationTriggerScenario = previewMode\n    ? null") &&
    !panel.includes("presentationTriggerScenario ?? lesson.related[0]"),
  "PREVIEW_TRIGGER_MUST_NOT_FALLBACK_TO_NEXT_LESSON"
);
assert(
  batchCPreview.includes('canonicalId.replace("T2-", "")') &&
    batchCPreview.includes("previewTriggerScenario={presentation.triggerScenario}"),
  "BATCH_C_PREVIEW_NUMBER_OR_TRIGGER_DRIFT"
);
assert(
  !formalRoute.includes("canonicalId") && !formalRoute.includes("T2-07"),
  "FORMAL_ROUTE_INTERNAL_ID_PRESENTATION_DRIFT"
);

assert(
  entry.includes("_historical-*") &&
    entry.includes("不得作为当前 Workflow 入口"),
  "HISTORICAL_ACCEPTANCE_BOUNDARY_MISSING"
);
assert(read("package.json").includes('"scripts:current:check"'), "SCRIPT_ENTRYPOINT_GOVERNANCE_MISSING");
assert(
  !COURSE_PRODUCTION_RULE_SOURCES.some((path) =>
    path.includes("task-results") ||
    path.includes("fixture") ||
    path.includes("CURRENT_SYSTEM_FACTS") ||
    path.includes("COURSE_BUILD_START_HERE")
  ),
  "NON_NORMATIVE_SOURCE_REGISTERED_AS_RULE_SOURCE"
);
assert(
  skillRegistry.includes("_historical-v0.1.ts") &&
    skillRegistry.includes("_historical-v0.2.ts") &&
    skillRegistry.includes("不得被 Workflow、Orchestrator、validator 或新课程直接 import"),
  "HISTORICAL_SKILL_ISOLATION_MISSING"
);
assert(
  workflowDoc.includes("Bootstrap Sources") &&
    workflowDoc.includes("它们**不是课程规则正文 owner**") &&
    workflowDoc.includes("随后读取 `COURSE_PRODUCTION_RULE_SOURCES` 当前内容") &&
    workflowCode.includes('ruleSourcePolicy: "READ_LATEST_AT_RUN_START"') &&
    workflowCode.includes("Rule source content is read at workflow run start"),
  "WORKFLOW_READ_LATEST_POLICY_MISSING"
);
assert(
  entry.includes("当前 Formal Brief / Batch **不在本入口维护状态清单**") &&
    !entry.includes("TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md"),
  "COURSE_ENTRY_MUST_NOT_DUPLICATE_CURRENT_BATCH_STATUS"
);

console.log("COURSE_GOVERNANCE_ACTIVE_RULE_OWNERS=PASS");
console.log("COURSE_GOVERNANCE_STEP1_STEP2_SEPARATION=PASS");
console.log("COURSE_GOVERNANCE_STEP5_KNOWLEDGE_COVERAGE=PASS");
console.log("COURSE_GOVERNANCE_STEP5_MIN_TWO_FLEXIBLE_MAX=PASS");
console.log("COURSE_GOVERNANCE_STEP6_TRIGGER_SEPARATION=PASS");
console.log("COURSE_GOVERNANCE_LEARNER_NUMBERING_BOUNDARY=PASS");
console.log("COURSE_GOVERNANCE_HISTORICAL_ASSET_ISOLATION=PASS");
console.log("COURSE_GOVERNANCE_RUNTIME_PREVIEW_MAPPING=PASS");
