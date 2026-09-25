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
const panel = read("components/GenericLessonRuntimePanel.tsx");
const batchCPreview = read("app/course-builder/preview/track02-batch-c/[lessonId]/page.tsx");
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
  ruleText.includes("卡片数量不固定") &&
    (ruleText.includes("不得预设“两张即可”") || ruleText.includes("不得预设两张")),
  "ACTIVE_RULE_REVIEW_COUNT_FLEXIBILITY_MISSING"
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
  skill.includes("卡片数量不固定") &&
    skill.includes("不得预设两张、2–4 张或其他数量范围"),
  "COURSE_BUILDER_FIXED_REVIEW_COUNT_DRIFT"
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

for (const path of [
  "scripts/validate-track02-batch-c-drafts.ts"
]) {
  const source = read(path);
  assert(!/review\.length\s*>=\s*[234]/.test(source), "TRACK02_VALIDATOR_FIXED_REVIEW_MIN:" + path);
  assert(source.includes("REVIEW_TWO_DIRECTIONS"), "TRACK02_REVIEW_DIRECTION_CHECK_MISSING:" + path);
}

assert(
  entry.includes("_historical-*") &&
    entry.includes("不得作为当前 Workflow 入口"),
  "HISTORICAL_ACCEPTANCE_BOUNDARY_MISSING"
);
assert(read("package.json").includes('"scripts:current:check"'), "SCRIPT_ENTRYPOINT_GOVERNANCE_MISSING");
assert(
  !COURSE_PRODUCTION_RULE_SOURCES.some((path) => path.includes("task-results") || path.includes("fixture")),
  "HISTORICAL_ASSET_REGISTERED_AS_RULE_SOURCE"
);
assert(
  workflowDoc.includes("每次运行开始必须读取 `COURSE_PRODUCTION_RULE_SOURCES` 当前内容") &&
    workflowCode.includes('ruleSourcePolicy: "READ_LATEST_AT_RUN_START"') &&
    workflowCode.includes("Rule source content is read at workflow run start"),
  "WORKFLOW_READ_LATEST_POLICY_MISSING"
);
assert(
  entry.includes("TRACK02_BATCH_C_T2_07_T2_09_FORMAL_BRIEFS_V1.md") &&
    entry.includes("Human Review Pending"),
  "COURSE_ENTRY_CURRENT_BATCH_STALE"
);

console.log("COURSE_GOVERNANCE_ACTIVE_RULE_OWNERS=PASS");
console.log("COURSE_GOVERNANCE_STEP5_FLEXIBLE_COUNT=PASS");
console.log("COURSE_GOVERNANCE_STEP6_TRIGGER_SEPARATION=PASS");
console.log("COURSE_GOVERNANCE_LEARNER_NUMBERING_BOUNDARY=PASS");
console.log("COURSE_GOVERNANCE_HISTORICAL_ASSET_ISOLATION=PASS");
console.log("COURSE_GOVERNANCE_RUNTIME_PREVIEW_MAPPING=PASS");
