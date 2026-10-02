import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("LEARNING_INSIGHT_V2_CONTRACT_FAILED:" + code);
}

const dir = "docs/learning-insight";
const files = {
  product: dir + "/LEARNING_INSIGHT_WORKBENCH_V2_PRODUCT_CONTRACT.md",
  prompt: dir + "/LEARNING_INSIGHT_AI_PROMPT_CONTRACT.md",
  output: dir + "/LEARNING_INSIGHT_STRUCTURED_OUTPUT_CONTRACT.md",
  validator: dir + "/LEARNING_INSIGHT_DETERMINISTIC_VALIDATOR_CONTRACT.md"
};

for (const file of Object.values(files)) {
  assert(fs.existsSync(file), "OWNER_MISSING:" + file);
}

const product = fs.readFileSync(files.product, "utf8");
const prompt = fs.readFileSync(files.prompt, "utf8");
const output = fs.readFileSync(files.output, "utf8");
const validator = fs.readFileSync(files.validator, "utf8");

for (const required of [
  "Human Gate 1",
  "Human Final Gate",
  "Task A",
  "Task B",
  "真实学员界面对比",
  "课程反馈更新",
  "机械代码",
  "Learning Issue"
]) {
  assert(product.includes(required), "PRODUCT_RULE_MISSING:" + required);
}

assert(product.includes("不属于 Course Builder Workflow"), "PRODUCT_COURSE_BUILDER_BOUNDARY_MISSING");
assert(product.includes("固定双栏"), "PRODUCT_TWO_PANE_WORKBENCH_MISSING");
assert(product.includes("Learning Issue Source Matrix"), "PRODUCT_SOURCE_MATRIX_MISSING");
assert(product.includes("学员反馈不得直接生成该类型"), "PRODUCT_STUDENT_OUTDATED_BOUNDARY_MISSING");
assert(product.includes("已采集未聚合"), "PRODUCT_DATA_AVAILABILITY_STATE_MISSING");
assert(product.includes("AI **永远不得自己发布课程**"), "PRODUCT_AI_NO_SELF_PUBLISH_MISSING");
assert(product.includes("确认并发布"), "PRODUCT_HUMAN_FINAL_PUBLISH_MISSING");
assert(product.includes("PUBLISHED 历史记录"), "PRODUCT_HISTORY_RECORD_MISSING");
assert(product.includes("问题处理周期（Issue Cycle）"), "PRODUCT_ISSUE_CYCLE_MISSING");
assert(product.includes("新增 **3 位独立学员**"), "PRODUCT_FEEDBACK_REOPEN_THRESHOLD_MISSING");
assert(product.includes("新增 **10 位样本**"), "PRODUCT_BEHAVIOR_REOPEN_THRESHOLD_MISSING");

for (const required of [
  "learning-issue-diagnosis@2",
  "course-change-generator@2",
  "evidence_catalog",
  "course_issue_bundle",
  "course_issue_timeline",
  "data_availability",
  "mutable_path_catalog",
  "Human Gate 1",
  "Task A → Task B Orchestration",
  "每次只允许一门课程",
  "Return JSON only"
]) {
  assert(prompt.includes(required), "PROMPT_RULE_MISSING:" + required);
}

assert(prompt.includes("不得输出 Markdown"), "PROMPT_JSON_ONLY_BOUNDARY_MISSING");
assert(prompt.includes("不得只挑其中一个 Issue"), "PROMPT_COURSE_BUNDLE_BOUNDARY_MISSING");
assert(prompt.includes("unavailable"), "PROMPT_DATA_AVAILABILITY_BOUNDARY_MISSING");
assert(prompt.includes("不直接修改课程") || prompt.includes("不能直接修改课程"), "PROMPT_NO_DIRECT_COURSE_EDIT_MISSING");

for (const required of [
  "learning_issue_diagnosis_v2",
  "course_change_patch_v2",
  "evidence_refs",
  "current_value",
  "proposed_value",
  "REQUIRES_MANUAL_STRUCTURE_CHANGE",
  "V2 path allowlist",
  "永久禁止的 Patch path"
]) {
  assert(output.includes(required), "OUTPUT_RULE_MISSING:" + required);
}

assert(output.includes("action V2 只允许 REPLACE"), "OUTPUT_REPLACE_ONLY_MISSING");
assert(output.includes("checks[n].correctValues"), "OUTPUT_CORRECT_VALUES_DENYLIST_MISSING");
assert(output.includes("practice.passScore"), "OUTPUT_PASS_SCORE_DENYLIST_MISSING");

for (const required of [
  "V0_INPUT",
  "V9_APPLY_PRECONDITION",
  "Fail-Closed",
  "UNKNOWN_EVIDENCE_REF",
  "PATCH_BASELINE_CONFLICT",
  "PATCH_STRUCTURE_DRIFT",
  "Human Final Preview Gate",
  "确认并发布",
  "PUBLISHED 历史记录",
  "课程反馈更新",
  "sourceContext"
]) {
  assert(validator.includes(required), "VALIDATOR_RULE_MISSING:" + required);
}

assert(validator.includes("current_value ==="), "VALIDATOR_BASELINE_EQUALITY_MISSING");
assert(validator.includes("UI 必须通过确定性映射显示中文"), "VALIDATOR_CHINESE_UI_MAPPING_MISSING");
assert(validator.includes("Issue Cycle baseline"), "VALIDATOR_ISSUE_CYCLE_BASELINE_MISSING");
assert(validator.includes("自动校验重试"), "VALIDATOR_AI_RETRY_RULE_MISSING");
assert(!validator.includes("写 Course Maintenance DRAFT 前必须"), "VALIDATOR_OLD_DRAFT_APPLY_FLOW_PRESENT");
assert(!product.includes("其中“发起课程更新”只进入现有 Course Maintenance DRAFT"), "PRODUCT_OLD_DRAFT_FLOW_PRESENT");

const ownerSet = new Set(Object.values(files).map((file) => file.split("/").pop()));
const actual = fs.readdirSync(dir);
assert(actual.length === 4, "LEARNING_INSIGHT_OWNER_COUNT_DRIFT");
for (const file of actual) {
  assert(ownerSet.has(file), "NON_CURRENT_LEARNING_INSIGHT_DOC:" + file);
}

console.log("LEARNING_INSIGHT_V2_PRODUCT_CONTRACT=PASS");
console.log("LEARNING_INSIGHT_V2_AI_PROMPT_CONTRACT=PASS");
console.log("LEARNING_INSIGHT_V2_STRUCTURED_OUTPUT_CONTRACT=PASS");
console.log("LEARNING_INSIGHT_V2_DETERMINISTIC_VALIDATOR_CONTRACT=PASS");
console.log("LEARNING_INSIGHT_V2_OWNER_SET_EXACT=PASS");
