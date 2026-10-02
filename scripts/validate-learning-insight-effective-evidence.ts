import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const owner = fs.readFileSync(
  "lib/server/learning-insights/effective-evidence.ts",
  "utf8"
);
const taskA = fs.readFileSync(
  "lib/server/learning-insights/task-a.ts",
  "utf8"
);
const evidencePanel = fs.readFileSync(
  "components/admin-learning/AdminLearningEvidencePanel.tsx",
  "utf8"
);
const evidenceRoute = fs.readFileSync(
  "app/api/admin/learning/courses/[courseKey]/effective-evidence/route.ts",
  "utf8"
);

for (const required of [
  "buildEffectiveLearningEvidenceSet",
  "PRODUCTION",
  "ACCEPTANCE",
  "NON_PRODUCTION_ORIGIN",
  "INELIGIBLE_USER",
  "INSUFFICIENT_SAMPLE",
  "ALLOWED_EVENT_NAMES",
  "FEEDBACK_MIN_USERS = 3",
  "BEHAVIOR_MIN_USERS = 10",
  "CHECK_DIFFICULTY_THRESHOLD = 35",
  "PRACTICE_FIRST_PASS_THRESHOLD = 50",
  "HINT_USAGE_THRESHOLD = 50",
  "HELPFULNESS_THRESHOLD = 25",
  "userIdentities",
  "evidence_governance"
]) {
  assert(owner.includes(required), "EFFECTIVE_EVIDENCE_OWNER_MISSING:" + required);
}

assert(
  owner.includes('["hint_revealed", "still_confused", "real_ai_evidence_recorded"]'),
  "EFFECTIVE_EVIDENCE_EVENT_ALLOWLIST_INVALID"
);
assert(
  owner.includes("identityUsers.has(row.id)"),
  "EFFECTIVE_EVIDENCE_REAL_USER_IDENTITY_GUARD_MISSING"
);
assert(
  owner.includes('row.role === "USER"') && owner.includes('row.accountStatus === "ACTIVE"'),
  "EFFECTIVE_EVIDENCE_REAL_USER_GUARD_MISSING"
);
assert(
  owner.includes("containsDirtyFlag") && owner.includes("dirtyMarker"),
  "EFFECTIVE_EVIDENCE_TEST_ORIGIN_GUARD_MISSING"
);
assert(
  taskA.includes("buildEffectiveLearningEvidenceSet"),
  "TASK_A_EFFECTIVE_EVIDENCE_ENTRY_MISSING"
);
assert(
  !taskA.includes("getLearningInsightEvidenceDetail"),
  "TASK_A_RAW_EVIDENCE_DETAIL_STILL_USED"
);
assert(
  !taskA.includes(".from(courseInsights)") && !taskA.includes(".from(learningFeedback)"),
  "TASK_A_RAW_DB_EVIDENCE_QUERY_PRESENT"
);
assert(
  taskA.includes('"evidence-mode:" + evidenceMode'),
  "TASK_A_EVIDENCE_MODE_AUDIT_MISSING"
);
assert(
  taskA.includes('evidenceMode: EffectiveEvidenceMode = "PRODUCTION"'),
  "TASK_A_PRODUCTION_DEFAULT_MISSING"
);
assert(
  taskA.includes('item.contextIds.includes("evidence-mode:" + evidenceMode)'),
  "TASK_A_EVIDENCE_MODE_READ_ISOLATION_MISSING"
);
assert(
  evidenceRoute.includes("buildEffectiveLearningEvidenceSet"),
  "EFFECTIVE_EVIDENCE_UI_ROUTE_OWNER_MISSING"
);
assert(
  evidenceRoute.includes('process.env.NODE_ENV !== "production"') &&
    evidenceRoute.includes('searchParams.get("review") === "1"') &&
    evidenceRoute.includes("isSimulationReviewCourse"),
  "EFFECTIVE_EVIDENCE_VISUAL_REVIEW_GUARD_MISSING"
);
for (const required of ["用于判断", "辅助参考", "学习反馈", "学习行为"]) {
  assert(evidencePanel.includes(required), "EFFECTIVE_EVIDENCE_UI_STATUS_MISSING:" + required);
}
assert(
  evidencePanel.includes("/effective-evidence"),
  "EFFECTIVE_EVIDENCE_UI_ROUTE_MISSING"
);
assert(
  !evidencePanel.includes("AdminLearningEvidenceDetail") &&
    !evidencePanel.includes("/api/admin/learning/insights/"),
  "EFFECTIVE_EVIDENCE_UI_LEGACY_SOURCE_PRESENT"
);

console.log("EFFECTIVE_EVIDENCE_OWNER=PASS");
console.log("EFFECTIVE_EVIDENCE_ORIGIN_GUARD=PASS");
console.log("EFFECTIVE_EVIDENCE_SAMPLE_THRESHOLDS=PASS");
console.log("EFFECTIVE_EVIDENCE_EVENT_ALLOWLIST=PASS");
console.log("TASK_A_EFFECTIVE_EVIDENCE_ONLY=PASS");
console.log("EFFECTIVE_EVIDENCE_UI_SOURCE=PASS");
console.log("EFFECTIVE_EVIDENCE_UI_STATUS=PASS");
