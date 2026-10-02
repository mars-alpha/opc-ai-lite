import { eq, inArray, sql } from "drizzle-orm";
import {
  decideLearningCourseGate1,
  listLearningInsightWorkbench
} from "../lib/server/learning-insights/service";
import { formalRuntimeLessonId } from "../lib/server/learning/formal-identity";
import { getDatabase } from "../lib/server/db";
import {
  courseInsights,
  courseUpdateCandidates
} from "../lib/server/db/schema";

const CONFIRM = "LEARNING-INSIGHT-V2-PHASE1-001";
const ISSUE_KEYS = Array.from(
  { length: 10 },
  (_, index) => "acceptance:v2_1_phase1:" + String(index + 1).padStart(2, "0")
);

async function cleanup() {
  await getDatabase()
    .delete(courseInsights)
    .where(inArray(courseInsights.issueKey, [...ISSUE_KEYS]));
}

async function main() {
  const run = process.argv.includes("--run");
  const confirmArg = process.argv.find((arg) => arg.startsWith("--confirm="));
  const confirm = confirmArg?.slice("--confirm=".length) ?? "";
  const db = getDatabase();
  const lessonId = formalRuntimeLessonId("fde", "t5-16-capstone");

  if (!run) {
    console.log("LEARNING_INSIGHT_V2_PHASE1_ACCEPT_TARGET=" + lessonId);
    console.log("DRY_RUN_ONLY=PASS");
    return;
  }
  if (confirm !== CONFIRM) throw new Error("CONFIRM_REQUIRED:" + CONFIRM);

  await cleanup();

  try {
    const inserted = await db
      .insert(courseInsights)
      .values(
        ISSUE_KEYS.map((issueKey, index) => ({
          lessonId,
          issueKey,
          issueCategory: "DONT_UNDERSTAND",
          status: "OPEN" as const,
          distinctUserCount: index === 4 ? 5 : 3 + (index % 2),
          evidence: { acceptance: true, sequence: index + 1 },
          analysisMode: "RULE" as const,
          createdAt:
            index === 9
              ? new Date("2026-10-01T00:00:00.000Z")
              : new Date(Date.UTC(2026, 8, 10 + index)),
          updatedAt:
            index === 9
              ? new Date("2026-10-01T00:00:00.000Z")
              : new Date(Date.UTC(2026, 8, 10 + index))
        }))
      )
      .returning({ id: courseInsights.id, issueKey: courseInsights.issueKey });

    const testIds = new Set(inserted.map((row) => row.id));
    const workbenchBefore = await listLearningInsightWorkbench();
    const courseBefore = workbenchBefore.courseHealth.find((course) => course.courseKey === lessonId);
    if (!courseBefore) throw new Error("COURSE_AGGREGATION_MISSING");
    if (courseBefore.openIssueCount < 10) throw new Error("COURSE_OPEN_ISSUE_COUNT_INVALID");
    if (courseBefore.healthStatus !== "ATTENTION") throw new Error("COURSE_HEALTH_STATUS_INVALID");
    if (courseBefore.affectedUserCount < 5) throw new Error("COURSE_AFFECTED_USER_BOUND_INVALID");

    const understandingGroup = courseBefore.issueGroups.find(
      (group) => group.category === "DONT_UNDERSTAND"
    );
    if (!understandingGroup) throw new Error("ISSUE_CATEGORY_GROUP_MISSING");
    if (understandingGroup.occurrenceCount < 10) throw new Error("ISSUE_CATEGORY_COUNT_INVALID");
    if (![...testIds].every((id) => understandingGroup.issueIds.includes(id))) {
      throw new Error("ISSUE_CATEGORY_IDS_MISSING");
    }
    if (understandingGroup.firstSeenAt.getTime() > Date.parse("2026-09-10T00:00:00.000Z")) {
      throw new Error("ISSUE_FIRST_SEEN_INVALID");
    }
    if (understandingGroup.lastSeenAt.getTime() < Date.parse("2026-10-01T00:00:00.000Z")) {
      throw new Error("ISSUE_LAST_SEEN_INVALID");
    }

    const gateResult = await decideLearningCourseGate1({
      courseKey: lessonId,
      decision: "ANALYZE",
      decidedBy: "phase1.acceptance@local.test"
    });
    if (![...testIds].every((id) => gateResult.issueStatuses.some((issue) => issue.id === id))) {
      throw new Error("COURSE_GATE1_MISSED_TEST_ISSUES");
    }

    const rowsAfter = await db
      .select({
        id: courseInsights.id,
        status: courseInsights.status,
        diagnosis: courseInsights.diagnosis
      })
      .from(courseInsights)
      .where(inArray(courseInsights.id, [...testIds]));

    if (rowsAfter.some((row) => row.status !== "ANALYSIS_READY" || row.diagnosis !== null)) {
      throw new Error("COURSE_GATE1_STATUS_INVALID");
    }

    const [candidateCount] = await db
      .select({ n: sql`count(*)` })
      .from(courseUpdateCandidates)
      .where(inArray(courseUpdateCandidates.insightId, [...testIds]));
    if (Number(candidateCount.n) !== 0) throw new Error("GATE1_CREATED_CANDIDATE");

    console.log("LEARNING_INSIGHT_V2_1_PHASE1_CATEGORY_AGGREGATION_DB=PASS");
    console.log("LEARNING_INSIGHT_V2_1_PHASE1_TEMPORAL_FACTS_DB=PASS");
    console.log("LEARNING_INSIGHT_V2_1_PHASE1_COURSE_HEALTH_DB=PASS");
    console.log("LEARNING_INSIGHT_V2_1_PHASE1_COURSE_GATE1_DB=PASS");
    console.log("LEARNING_INSIGHT_V2_1_PHASE1_NO_AI_DIAGNOSIS=PASS");
    console.log("LEARNING_INSIGHT_V2_1_PHASE1_NO_COURSE_CANDIDATE=PASS");
  } finally {
    await cleanup();
    console.log("LEARNING_INSIGHT_V2_1_PHASE1_TEST_DATA_CLEANUP=PASS");
  }
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
);
