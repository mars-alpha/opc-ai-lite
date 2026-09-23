import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_CURRENT_STATE_FAILED:" + code);
}

const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
const entry = fs.readFileSync("docs/learning/COURSE_BUILD_START_HERE.md", "utf8");
const projectStatus = fs.readFileSync("PROJECT_STATUS.md", "utf8");
const tasks = fs.readFileSync("TASKS.md", "utf8");
const historicalBatchStart = fs.readFileSync(
  "docs/task-results/TRACK01-T11-T20-BATCH-START-001.md",
  "utf8"
);
const workflowBatch = fs.readFileSync(
  "docs/task-results/TRACK01-T11-T20-WORKFLOW-BATCH-001.md",
  "utf8"
);
const humanReview = fs.readFileSync(
  "docs/task-results/TRACK01-T11-T20-HUMAN-REVIEW-001.md",
  "utf8"
);
const runtimeResult = fs.readFileSync(
  "docs/task-results/TRACK01-T11-T20-RUNTIME-001.md",
  "utf8"
);
const learningExperienceRework = fs.readFileSync(
  "docs/task-results/TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001.md",
  "utf8"
);
const workflowBatchJson = JSON.parse(
  fs.readFileSync(
    "docs/task-results/TRACK01-T11-T20-WORKFLOW-BATCH-001.json",
    "utf8"
  )
) as { result: Array<{ status: string; nextGate: string }> };

assert(facts.includes("## 0. Current Course Production Snapshot"), "CURRENT_SNAPSHOT_MISSING");
assert(
  facts.includes("T1-11～T1-20                    AVAILABLE / FORMAL_RUNTIME"),
  "T11_T20_CURRENT_STATE_MISSING"
);
assert(
  facts.includes("Next Gate                       Track 01 Runtime complete → next approved Track / course planning"),
  "T11_T20_NEXT_GATE_MISSING"
);
assert(!facts.includes("T1-11～T1-20 继续保持冻结目录规划状态"), "STALE_T11_T20_FROZEN_STATE_PRESENT");
assert(
  !facts.includes("T1-11～T1-20                     FORMAL_BRIEF_BATCH_READY / DRAFT_PRODUCTION_READY"),
  "STALE_T11_T20_BRIEF_READY_STATE_PRESENT"
);
assert(
  projectStatus.includes("TRACK01-T11-T20-RUNTIME-001 T1-11～T1-20 Batch Runtime Provisioning & Acceptance COMPLETE_RUNTIME_ACCEPTANCE_PASS_AVAILABLE"),
  "PROJECT_STATUS_RUNTIME_AVAILABLE_MISSING"
);
assert(tasks.includes("Status: COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE"), "TASKS_RUNTIME_AVAILABLE_STATUS_MISSING");
assert(
  historicalBatchStart.includes("HISTORICAL_ONLY") &&
    historicalBatchStart.includes("SUPERSEDED_BY_TRACK01-T11-T20-WORKFLOW-BATCH-001"),
  "HISTORICAL_BATCH_START_NOT_SUPERSEDED"
);
assert(workflowBatch.includes("DETERMINISTIC_PASS / HUMAN_REVIEW_PENDING"), "WORKFLOW_BATCH_CURRENT_STATUS_MISSING");
assert(humanReview.includes("Status: **HUMAN_REVIEW_PASS**"), "HUMAN_REVIEW_RESULT_MISSING");
assert(humanReview.includes("10 / 10"), "HUMAN_REVIEW_TEN_LESSONS_REQUIRED");
assert(runtimeResult.includes("Status: **COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE**"), "RUNTIME_RESULT_MISSING");
assert(runtimeResult.includes("T1_11_T1_20_RUNTIME_ACCEPTANCE=PASS"), "RUNTIME_ACCEPTANCE_EVIDENCE_MISSING");
assert(
  learningExperienceRework.includes("Status: **COMPLETE_QUALITY_REWORK_PASS / RUNTIME_ACCEPTANCE_PASS**"),
  "LEARNING_EXPERIENCE_REWORK_RESULT_MISSING"
);
assert(
  learningExperienceRework.includes("TRACK01_T11_T20_CHINESE_FIRST_LEARNER_COPY=PASS") &&
    learningExperienceRework.includes("TRACK01_T11_T20_COPY_READY_REFERENCE_ANSWER=PASS") &&
    learningExperienceRework.includes("TRACK01_T11_T20_REVIEW_DENSITY_VARIATION=PASS") &&
    learningExperienceRework.includes("TRACK01_T11_T20_TRIGGER_SCENARIOS=PASS"),
  "LEARNING_EXPERIENCE_REWORK_QUALITY_GATES_MISSING"
);
assert(
  learningExperienceRework.includes("T1_11_T1_20_RUNTIME_ACCEPTANCE=PASS"),
  "LEARNING_EXPERIENCE_REWORK_RUNTIME_ACCEPTANCE_MISSING"
);
assert(
  projectStatus.includes("TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001"),
  "PROJECT_STATUS_LEARNING_EXPERIENCE_REWORK_MISSING"
);
assert(
  tasks.includes("TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001"),
  "TASKS_LEARNING_EXPERIENCE_REWORK_MISSING"
);
assert(
  facts.includes("Learning Experience Rework Runtime Acceptance PASS"),
  "FACTS_LEARNING_EXPERIENCE_REWORK_MISSING"
);
assert(workflowBatchJson.result.length === 10, "WORKFLOW_BATCH_TEN_DRAFTS_REQUIRED");
assert(
  workflowBatchJson.result.every(
    (item) => item.status === "PENDING_REVIEW" && item.nextGate === "HUMAN_REVIEW_GATE"
  ),
  "WORKFLOW_BATCH_GATE_DRIFT"
);
assert(entry.includes("历史 task-result / legacy fixture / 旧测试课程"), "ENTRY_HISTORY_PRIORITY_RULE_MISSING");

console.log("COURSE_CURRENT_STATE_SNAPSHOT=PASS");
console.log("COURSE_CURRENT_STATE_T11_T20=PASS");
console.log("COURSE_CURRENT_STATE_HISTORY_SUPERSEDED=PASS");
console.log("COURSE_CURRENT_STATE_HUMAN_REVIEW_PASS=PASS");
console.log("COURSE_CURRENT_STATE_T11_T20_AVAILABLE=PASS");
console.log("COURSE_CURRENT_STATE_TRACK01_RUNTIME_COMPLETE=PASS");
console.log("COURSE_CURRENT_STATE_T11_T20_LEARNING_EXPERIENCE_REWORK=PASS");
