import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("LEARNING_INSIGHT_EVIDENCE_FAILED:" + code);
}

const owner = fs.readFileSync(
  "lib/server/learning-insights/evidence-detail.ts",
  "utf8"
);
const route = fs.readFileSync(
  "app/api/admin/learning/insights/[insightId]/route.ts",
  "utf8"
);
const evidencePanel = fs.readFileSync(
  "components/admin-learning/AdminLearningEvidencePanel.tsx",
  "utf8"
);

assert(
  owner.includes("getLearningInsightEvidenceDetail"),
  "READ_OWNER_MISSING"
);
assert(owner.includes("learningFeedback"), "FEEDBACK_SOURCE_MISSING");
assert(owner.includes("lessonCheckResponses"), "CHECK_SOURCE_MISSING");
assert(owner.includes("practiceSubmissions"), "PRACTICE_SOURCE_MISSING");
assert(owner.includes("learningEvents"), "EVENT_SOURCE_MISSING");
assert(!owner.includes(".insert("), "READ_OWNER_MUST_NOT_INSERT");
assert(!owner.includes(".update("), "READ_OWNER_MUST_NOT_UPDATE");
assert(!owner.includes(".delete("), "READ_OWNER_MUST_NOT_DELETE");

assert(route.includes("export async function GET"), "GET_ROUTE_MISSING");
assert(route.includes("requireAdminUser"), "ADMIN_GATE_MISSING");
assert(
  route.includes("getLearningInsightEvidenceDetail"),
  "ROUTE_NOT_USING_EVIDENCE_OWNER"
);
assert(!route.includes("export async function POST"), "EVIDENCE_ROUTE_MUST_BE_READ_ONLY");

assert(evidencePanel.includes("/effective-evidence"), "EVIDENCE_PANEL_ENTRY_MISSING");
assert(evidencePanel.includes("学习反馈"), "FEEDBACK_SECTION_MISSING");
assert(evidencePanel.includes("学习行为"), "BEHAVIOR_SECTION_MISSING");
assert(evidencePanel.includes("直接看学员说了什么"), "FEEDBACK_OPERATOR_COPY_MISSING");
assert(evidencePanel.includes("看学员在哪些步骤明显遇到困难"), "BEHAVIOR_OPERATOR_COPY_MISSING");
assert(evidencePanel.includes("用于判断"), "VALID_STATUS_OPERATOR_COPY_MISSING");
assert(evidencePanel.includes("辅助参考"), "SUPPORTING_STATUS_OPERATOR_COPY_MISSING");
assert(evidencePanel.includes("查看更多"), "FEEDBACK_MORE_ACTION_MISSING");
assert(evidencePanel.includes("feedback.length > 5"), "FEEDBACK_MORE_THRESHOLD_MISSING");
assert(evidencePanel.includes("当前没有可查看的学习反馈"), "REAL_EMPTY_STATE_MISSING");
assert(!evidencePanel.includes("userId"), "USER_ID_MUST_NOT_BE_EXPOSED");
assert(!evidencePanel.includes("Effective Evidence Set"), "INTERNAL_EVIDENCE_TERM_EXPOSED");
assert(!evidencePanel.includes("AI 可用证据"), "INTERNAL_AI_EVIDENCE_COUNT_EXPOSED");

console.log("LEARNING_INSIGHT_EVIDENCE_READ_ONLY_OWNER=PASS");
console.log("LEARNING_INSIGHT_EVIDENCE_FOUR_SOURCES=PASS");
console.log("LEARNING_INSIGHT_EVIDENCE_EFFECTIVE_PANEL=PASS");
console.log("LEARNING_INSIGHT_EVIDENCE_NO_USER_ID_EXPOSURE=PASS");
