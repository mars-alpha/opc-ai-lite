import fs from "node:fs";
import { listAdminCourseRegistry } from "../lib/server/admin/course-registry";
import { getFormalAdminCourseSnapshotCount } from "../lib/server/admin/course-snapshot";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("LEARNING_INSIGHT_BRIDGE_FAILED:" + code);
}

const registry = listAdminCourseRegistry();
const route = fs.readFileSync(
  "app/api/admin/learning/candidates/[candidateId]/review/route.ts",
  "utf8"
);
const insights = fs.readFileSync("lib/server/learning-insights/service.ts", "utf8");
const maintenance = fs.readFileSync("lib/server/admin/course-maintenance.ts", "utf8");
const bridgeSection = insights.slice(
  insights.indexOf("export async function approveCourseUpdateCandidateToMaintenance"),
  insights.indexOf("export async function listLearningInsightWorkbench")
);

assert(registry.items.length === 81, "FORMAL_LESSON_COUNT_NOT_81");
assert(getFormalAdminCourseSnapshotCount() === 81, "FORMAL_SNAPSHOT_SOURCE_NOT_81");
assert(registry.items.every((item) => Boolean(item.preview)), "FORMAL_SNAPSHOT_COVERAGE_INCOMPLETE");
assert(
  registry.items.every((item) => item.preview.stepMeta.length === 6),
  "FORMAL_SNAPSHOT_SIX_STEP_COVERAGE_INCOMPLETE"
);
assert(
  registry.items.every((item) => item.preview.checks.length > 0 && item.preview.practice.id),
  "FORMAL_SNAPSHOT_INTERACTION_SOURCE_INCOMPLETE"
);

assert(
  route.includes("approveCourseUpdateCandidateToMaintenance(candidateId, user)"),
  "APPROVE_ROUTE_NOT_BRIDGED"
);
assert(
  insights.includes("startAdminCourseCandidate("),
  "BRIDGE_NOT_USING_COURSE_MAINTENANCE_START"
);
assert(
  bridgeSection.indexOf("startAdminCourseCandidate(") <
    bridgeSection.indexOf('status: "APPROVED"'),
  "INSIGHT_MUST_NOT_APPROVE_BEFORE_COURSE_CANDIDATE"
);
assert(
  bridgeSection.includes('throw new Error("CANDIDATE_ALREADY_ACTIVE")'),
  "ACTIVE_COURSE_CANDIDATE_CONFLICT_GUARD_MISSING"
);
assert(
  route.includes('code === "CANDIDATE_ALREADY_ACTIVE"'),
  "ACTIVE_COURSE_CANDIDATE_CONFLICT_ROUTE_MISSING"
);
assert(
  maintenance.includes("sourceContext?: CandidateSourceContext"),
  "COURSE_CANDIDATE_SOURCE_TRACE_MISSING"
);
assert(
  !insights.includes("publishAdminCourseCandidate"),
  "LEARNING_INSIGHT_MUST_NOT_PUBLISH_COURSE"
);
assert(
  !route.includes("publishAdminCourseCandidate"),
  "LEARNING_INSIGHT_ROUTE_MUST_NOT_PUBLISH_COURSE"
);

console.log("LEARNING_INSIGHT_BRIDGE_81_SNAPSHOTS=PASS");
console.log("LEARNING_INSIGHT_BRIDGE_HUMAN_START=PASS");
console.log("LEARNING_INSIGHT_BRIDGE_ACTIVE_CANDIDATE_GUARD=PASS");
console.log("LEARNING_INSIGHT_BRIDGE_SOURCE_TRACE=PASS");
console.log("LEARNING_INSIGHT_BRIDGE_NO_DIRECT_PUBLISH=PASS");
