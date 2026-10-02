import fs from "node:fs";
import {
  validateLearningIssueDiagnosisReferences,
  validateLearningIssueDiagnosisV2,
  type LearningInsightTaskAInput
} from "../lib/server/learning-insights/task-a";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const core = fs.readFileSync("lib/server/learning-insights/task-a.ts", "utf8");
const route = fs.readFileSync(
  "app/api/admin/learning/courses/[courseKey]/diagnosis/route.ts",
  "utf8"
);
const panel = fs.readFileSync(
  "components/admin-learning/AdminLearningCourseDiagnosis.tsx",
  "utf8"
);
const decision = fs.readFileSync(
  "components/admin-learning/AdminLearningCourseDecision.tsx",
  "utf8"
);
const detail = fs.readFileSync(
  "components/admin-learning/AdminLearningCourseHealthDetail.tsx",
  "utf8"
);

for (const required of [
  "buildLearningInsightTaskAInput",
  "runLearningInsightTaskA",
  "getCurrentLearningInsightTaskA",
  "callConfiguredChatJson",
  "getConfiguredChatModelConfig",
  "LEARNING_INSIGHT_TASK_A_TASK_TYPE",
  "TASK_A_GATE1_NOT_AUTHORIZED",
  "buildEffectiveLearningEvidenceSet",
  "evidence-mode:",
  "AdminCourseRegistry",
  "current_course_snapshot",
  "curriculum_catalog",
  "adjacent_course_summaries",
  "data_availability"
]) {
  assert(core.includes(required), "TASK_A_CORE_MISSING:" + required);
}

assert(core.includes(".insert(aiRuns)"), "TASK_A_AI_RUN_AUDIT_MISSING");
assert(!core.includes("courseUpdateCandidates"), "TASK_A_CANDIDATE_WRITE_PRESENT");
assert(!core.includes("Course Maintenance DRAFT"), "TASK_A_DRAFT_WRITE_PRESENT");
assert(route.includes("export async function GET"), "TASK_A_GET_ROUTE_MISSING");
assert(route.includes("export async function POST"), "TASK_A_POST_ROUTE_MISSING");
assert(route.includes("runLearningInsightTaskA"), "TASK_A_ROUTE_RUNNER_MISSING");
assert(panel.includes("等待AI分析，给出整课综合诊断"), "TASK_A_UI_WAITING_COPY_MISSING");
assert(panel.includes("整门课程诊断"), "TASK_A_UI_TITLE_MISSING");
assert(panel.includes("runFullAnalysis"), "TASK_A_UI_RUNNER_MISSING");
assert(!panel.includes("开始 AI 综合诊断"), "TASK_A_DUPLICATE_START_BUTTON_PRESENT");
assert(!core.includes("courseUpdateCandidates"), "TASK_A_CORE_CANDIDATE_WRITE_PRESENT");
assert(!core.includes("startAdminCourseCandidate"), "TASK_A_CORE_DRAFT_WRITE_PRESENT");
assert(decision.includes("AI分析中…"), "GATE1_RUNNING_STATE_MISSING");
assert(decision.includes("更新对照"), "GATE1_COMPARE_STATE_MISSING");
assert(detail.includes("AdminLearningCourseDiagnosis"), "TASK_A_PANEL_NOT_MOUNTED");

const input: LearningInsightTaskAInput = {
  course_issue_bundle: {
    current_course_id: "T1-01",
    current_course_title: "测试课程",
    issue_count: 1,
    open_issue_count: 1,
    issues: [{
      issue_id: "issue:1",
      issue_type: "DONT_UNDERSTAND",
      status: "ANALYSIS_READY",
      occurred_at: "2026-10-01T00:00:00.000Z",
      updated_at: "2026-10-01T00:00:00.000Z",
      evidence_refs: ["issue:1"]
    }]
  },
  course_issue_timeline: [{
    issue_id: "issue:1",
    issue_type: "DONT_UNDERSTAND",
    status: "ANALYSIS_READY",
    occurred_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z"
  }],
  deterministic_metrics: {},
  evidence_catalog: [{
    evidence_ref: "issue:1",
    source_type: "LEARNING_ISSUE",
    human_readable_source: "课程问题",
    evidence_status: "VALID",
    content: { fact: true },
    occurred_at: "2026-10-01T00:00:00.000Z",
    source_owner: "courseInsights"
  }],
  current_course_snapshot: {},
  curriculum_catalog: [{
    course_id: "T1-01",
    title: "测试课程",
    track: "01 AI 基础",
    short_capability: "测试"
  }],
  adjacent_course_summaries: [],
  data_availability: {
    available_fields: ["evidence_catalog"],
    unavailable_fields: [],
    source_owners: { evidence_catalog: "courseInsights" },
    evidence_governance: {
      mode: "PRODUCTION",
      eligible_evidence_count: 1,
      excluded_evidence_count: 0,
      exclusions: [],
      feedback_min_users: 3,
      behavior_min_users: 10,
      check_difficulty_threshold: 35,
      practice_first_pass_threshold: 50,
      hint_usage_threshold: 50,
      helpfulness_threshold: 25
    }
  },
  prompt_version: "learning-insight-task-a-prompt-v1",
  output_schema_version: "learning_issue_diagnosis_v2"
};

const valid = validateLearningIssueDiagnosisV2({
  schema_version: "learning_issue_diagnosis_v2",
  decision: "CHANGE_RECOMMENDED",
  problem_summary: "Step 2 的解释与当前证据存在明确缺口。",
  root_causes: [{
    type: "EXPLANATION_GAP",
    description: "Step 2 缺少关键概念之间的直接对照。",
    evidence_refs: ["issue:1"]
  }],
  courses: [{
    course_id: "T1-01",
    action: "MODIFY",
    reason: "问题直接发生在当前课程。",
    evidence_refs: ["issue:1"]
  }],
  targets: [{
    course_id: "T1-01",
    step: 2,
    area: "example.knowledgeDepth",
    problem: "解释缺少直接对照。",
    change_goal: "让学员能够区分关键概念。",
    evidence_refs: ["issue:1"]
  }],
  observation_note: null
});
validateLearningIssueDiagnosisReferences(valid, input);

let hiddenRubricRejected = false;
try {
  validateLearningIssueDiagnosisV2({
    ...valid,
    targets: [{
      ...valid.targets[0],
      step: 4,
      area: "第4步检查标准示例",
      change_goal: "修改评分标准示例，让学员更容易通过。"
    }]
  });
} catch (error) {
  hiddenRubricRejected =
    error instanceof Error &&
    error.message === "TASK_A_HIDDEN_RUBRIC_TARGET_FORBIDDEN";
}
assert(hiddenRubricRejected, "TASK_A_HIDDEN_RUBRIC_TARGET_NOT_REJECTED");
assert(core.includes("for (let attempt = 1; attempt <= 2; attempt += 1)"), "TASK_A_VALIDATION_RETRY_MISSING");
assert(core.includes("VALIDATION_RETRY"), "TASK_A_VALIDATION_RETRY_CONTEXT_MISSING");

let unknownRefRejected = false;
try {
  validateLearningIssueDiagnosisReferences(
    {
      ...valid,
      root_causes: [{ ...valid.root_causes[0], evidence_refs: ["missing:1"] }]
    },
    input
  );
} catch (error) {
  unknownRefRejected = error instanceof Error && error.message === "UNKNOWN_EVIDENCE_REF";
}
assert(unknownRefRejected, "UNKNOWN_EVIDENCE_REF_NOT_REJECTED");

let patchRejected = false;
try {
  validateLearningIssueDiagnosisV2({
    ...valid,
    patch_id: "p1"
  });
} catch {
  patchRejected = true;
}
assert(patchRejected, "TASK_A_PATCH_FIELD_NOT_REJECTED");

console.log("LEARNING_INSIGHT_TASK_A_CONTRACT=PASS");
console.log("LEARNING_INSIGHT_TASK_A_SCHEMA=PASS");
console.log("LEARNING_INSIGHT_TASK_A_REFERENCES=PASS");
console.log("LEARNING_INSIGHT_TASK_A_NO_TASK_B=PASS");
console.log("LEARNING_INSIGHT_TASK_A_UI_GATE=PASS");
console.log("LEARNING_INSIGHT_TASK_A_HIDDEN_RUBRIC_BOUNDARY=PASS");
console.log("LEARNING_INSIGHT_TASK_A_VALIDATION_RETRY=PASS");
assert(core.includes("timeoutMs: 120000"), "TASK_A_TIMEOUT_MISSING");

assert(core.includes("allowed_top_level_fields"), "TASK_A_EXACT_SCHEMA_HINT_MISSING");

assert(core.includes("exact_shape"), "TASK_A_EXACT_SHAPE_MISSING");
for (const required of [
  "Step 1 建立直觉",
  "Step 2 讲透方法",
  "Step 3 检查理解",
  "Step 4 实操",
  "Step 5 复盘判断框架",
  "Step 6 能力获得"
]) {
  assert(core.includes(required), "TASK_A_SIX_STEP_SEMANTIC_MISSING:" + required);
}

assert(core.includes("rawOutput: rawModelOutput"), "TASK_A_FAILED_RAW_OUTPUT_AUDIT_MISSING");
