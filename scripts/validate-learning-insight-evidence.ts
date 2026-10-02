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
const detailView = fs.readFileSync(
  "components/AdminLearningEvidenceDetail.tsx",
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

assert(
  evidencePanel.includes("AdminLearningEvidenceDetail"),
  "EVIDENCE_PANEL_ENTRY_MISSING"
);
assert(detailView.includes("查看真实数据"), "EVIDENCE_ACTION_MISSING");
assert(detailView.includes("学习反馈"), "FEEDBACK_SECTION_MISSING");
assert(detailView.includes("学习行为"), "BEHAVIOR_SECTION_MISSING");
for (const required of [
  "进入学习",
  "完成课程",
  "检查重试",
  "实操参与",
  "实操重试",
  "AI 实操证据"
]) {
  assert(detailView.includes(required), "BEHAVIOR_CARD_MISSING:" + required);
}
assert(detailView.includes("暂无直接学习反馈"), "REAL_EMPTY_STATE_MISSING");
assert(!detailView.includes("userId"), "USER_ID_MUST_NOT_BE_EXPOSED");

console.log("LEARNING_INSIGHT_EVIDENCE_READ_ONLY_OWNER=PASS");
console.log("LEARNING_INSIGHT_EVIDENCE_FOUR_SOURCES=PASS");
console.log("LEARNING_INSIGHT_EVIDENCE_ON_DEMAND_UI=PASS");
console.log("LEARNING_INSIGHT_EVIDENCE_NO_USER_ID_EXPOSURE=PASS");
