import { and, eq, inArray } from "drizzle-orm";
import { OPC_MEMBERSHIP_PRODUCT } from "../lib/membership/policy";
import { listAdminCourseRegistry } from "../lib/server/admin/course-registry";
import { createSession, SESSION_COOKIE } from "../lib/server/auth/service";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  aiRuns,
  courseInsights,
  courseUpdateCandidates,
  entitlements,
  learningFeedback,
  lessonCheckResponses,
  lessonChecks,
  lessonProgress,
  lessons,
  practiceSubmissions,
  practices,
  userIdentities,
  users
} from "../lib/server/db/schema";
import { decideLearningCourseGate1 } from "../lib/server/learning-insights/service";
import { runLearningInsightTaskA } from "../lib/server/learning-insights/task-a";
import { runLearningInsightTaskB } from "../lib/server/learning-insights/task-b";

const CONFIRM = "LEARNING-INSIGHT-REAL-CLOSED-LOOP-001";
const COURSE_SLUG = "fde";
const LESSON_SLUG = "t5-16-capstone";
const COURSE_KEY = "lesson_fde_t5_16_capstone";
const ISSUE_KEY = "dont_understand:decision-chain-gap";
const BASE_URL =
  process.argv.find((arg) => arg.startsWith("--base-url="))?.slice("--base-url=".length) ??
  "http://127.0.0.1:3000";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("REAL_CLOSED_LOOP_FAILED:" + code);
}

async function main() {
  if (!process.argv.includes("--run") || !process.argv.includes("--confirm=" + CONFIRM)) {
    console.log("DRY_RUN_ONLY=PASS");
    console.log("USE --run --confirm=" + CONFIRM);
    return;
  }

  const db = getDatabase();
  const startedAt = new Date();
  let testUserId: string | null = null;
  let originalLesson: typeof lessons.$inferSelect | null = null;
  let originalChecks: Array<typeof lessonChecks.$inferSelect> = [];
  let originalPractices: Array<typeof practices.$inferSelect> = [];
  let originalSnapshot: ReturnType<typeof listAdminCourseRegistry>["items"][number]["preview"] | null = null;

  try {
    const registryItem = listAdminCourseRegistry().items.find(
      (item) =>
        item.runtimeCourseSlug === COURSE_SLUG &&
        item.runtimeLessonId === LESSON_SLUG
    );
    assert(registryItem?.preview, "TARGET_PREVIEW_MISSING");
    originalSnapshot = structuredClone(registryItem.preview);

    [originalLesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, COURSE_KEY))
      .limit(1);
    assert(originalLesson, "TARGET_LESSON_MISSING");

    originalChecks = await db
      .select()
      .from(lessonChecks)
      .where(eq(lessonChecks.lessonId, COURSE_KEY));
    originalPractices = await db
      .select()
      .from(practices)
      .where(eq(practices.lessonId, COURSE_KEY));

    const [existingCandidates, progressRows, responseRows, submissionRows, issueRows, riskRows] =
      await Promise.all([
        db
          .select({ id: courseUpdateCandidates.id })
          .from(courseUpdateCandidates)
          .where(eq(courseUpdateCandidates.lessonId, COURSE_KEY)),
        db
          .select({ id: lessonProgress.id })
          .from(lessonProgress)
          .where(eq(lessonProgress.lessonId, COURSE_KEY)),
        db
          .select({ id: lessonCheckResponses.id })
          .from(lessonCheckResponses)
          .innerJoin(lessonChecks, eq(lessonCheckResponses.checkId, lessonChecks.id))
          .where(eq(lessonChecks.lessonId, COURSE_KEY)),
        db
          .select({ id: practiceSubmissions.id })
          .from(practiceSubmissions)
          .innerJoin(practices, eq(practiceSubmissions.practiceId, practices.id))
          .where(eq(practices.lessonId, COURSE_KEY)),
        db
          .select({ id: courseInsights.id })
          .from(courseInsights)
          .where(eq(courseInsights.lessonId, COURSE_KEY)),
        db
          .select({ id: learningFeedback.id })
          .from(learningFeedback)
          .where(eq(learningFeedback.lessonId, COURSE_KEY))
      ]);

    assert(existingCandidates.length === 0, "TARGET_HAS_CANDIDATE_HISTORY");
    assert(progressRows.length === 0, "TARGET_HAS_PROGRESS");
    assert(responseRows.length === 0, "TARGET_HAS_CHECK_RESPONSES");
    assert(submissionRows.length === 0, "TARGET_HAS_PRACTICE_SUBMISSIONS");
    assert(issueRows.length === 0, "TARGET_HAS_EXISTING_INSIGHT");
    assert(riskRows.length === 0, "TARGET_HAS_EXISTING_FEEDBACK");

    const [issue] = await db
      .insert(courseInsights)
      .values({
        lessonId: COURSE_KEY,
        issueKey: ISSUE_KEY,
        issueCategory: "DONT_UNDERSTAND",
        status: "OPEN",
        distinctUserCount: 12,
        evidence: {
          finding:
            "多名学员在学习第2步后，仍把“材料很多、文档齐全”理解成“完整交付”，无法说清完整交付最低需要哪些前后可追溯的决策依据。",
          observedPattern:
            "学员能复述课程结论，但面对真实方案包时，仍无法判断哪些信息只是材料，哪些信息是必须能前后追溯的决策依据。",
          affectedArea: "第2步案例与方法解释"
        },
        analysisMode: "RULE"
      })
      .returning({ id: courseInsights.id });

    await decideLearningCourseGate1({
      courseKey: COURSE_KEY,
      decision: "ANALYZE",
      decidedBy: "real-closed-loop-review"
    });
    console.log("REAL_CLOSED_LOOP_GATE1=PASS");

    const taskA = await runLearningInsightTaskA(COURSE_KEY);
    assert(taskA.diagnosis.decision === "CHANGE_RECOMMENDED", "TASK_A_NOT_CHANGE_RECOMMENDED");
    assert(
      taskA.diagnosis.targets.some((target) => target.course_id === LESSON_SLUG && target.step === 2),
      "TASK_A_STEP2_TARGET_MISSING"
    );
    assert(
      taskA.diagnosis.targets.every(
        (target) =>
          !/(?:新增|增加|加入|添加).{0,12}(?:练习|题目|实操|卡片|步骤|说明区)/.test(
            target.change_goal
          )
      ),
      "TASK_A_STRUCTURE_EXPANSION_LEAKED"
    );
    console.log("REAL_CLOSED_LOOP_TASK_A=PASS");

    const taskB = await runLearningInsightTaskB(COURSE_KEY);
    assert(taskB.patch.decision === "PATCH_PROPOSED", "TASK_B_PATCH_NOT_PROPOSED");
    assert(taskB.patch.changes.length > 0 && taskB.patch.changes.length <= 8, "TASK_B_CHANGE_COUNT_INVALID");
    assert(
      taskB.patch.changes.every((change) => change.path.startsWith("example.")),
      "TASK_B_STEP_SCOPE_DRIFT"
    );
    assert(
      JSON.stringify(taskB.beforeSnapshot.courseHeader) ===
        JSON.stringify(taskB.afterSnapshot.courseHeader),
      "TASK_B_COURSE_HEADER_CHANGED"
    );
    assert(
      JSON.stringify(taskB.beforeSnapshot.stepMeta) ===
        JSON.stringify(taskB.afterSnapshot.stepMeta),
      "TASK_B_STEP_META_CHANGED"
    );
    console.log("REAL_CLOSED_LOOP_TASK_B=PASS");

    const [testUser] = await db
      .insert(users)
      .values({ displayName: "Learning Insight Closed Loop", role: "ADMIN" })
      .returning({ id: users.id });
    testUserId = testUser.id;
    await db.insert(userIdentities).values({
      userId: testUser.id,
      provider: "EMAIL",
      providerUserId: "real.closed.loop@local.test"
    });
    await db.insert(entitlements).values({
      userId: testUser.id,
      type: OPC_MEMBERSHIP_PRODUCT.entitlementType,
      resourceType: OPC_MEMBERSHIP_PRODUCT.resourceType,
      resourceId: OPC_MEMBERSHIP_PRODUCT.resourceId,
      source: "MEMBERSHIP"
    });
    const { token } = await createSession(testUser.id);
    const cookie = SESSION_COOKIE + "=" + encodeURIComponent(token);

    const postJson = async (url: string, body: unknown) => {
      const response = await fetch(BASE_URL + url, {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180000)
      });
      const json = await response.json();
      assert(response.ok, "API_HTTP_" + response.status + ":" + JSON.stringify(json));
      return json;
    };

    const publishResponse = await postJson(
      "/api/admin/learning/courses/" + COURSE_KEY + "/proposal",
      {
        action: "PUBLISH",
        edits: taskB.patch.changes.map((change) => ({
          patch_id: change.patch_id,
          proposed_value: change.proposed_value
        })),
        manualEdits: []
      }
    );
    const publish = publishResponse.result;
    assert(publish.ok && publish.version === originalLesson.version + 1, "PUBLISH_VERSION_INVALID");
    assert(publish.updateReason === "课程反馈更新", "PUBLISH_REASON_INVALID");
    assert(publish.issueClosureWarning === null, "ISSUE_CLOSURE_WARNING");

    const [issueAfter] = await db
      .select({ status: courseInsights.status })
      .from(courseInsights)
      .where(eq(courseInsights.id, issue.id))
      .limit(1);
    assert(issueAfter?.status === "REVIEWED", "ISSUE_NOT_CLOSED");
    console.log("REAL_CLOSED_LOOP_PUBLISH=PASS");

    const lessonResponse = await fetch(
      BASE_URL + "/courses/" + COURSE_SLUG + "/lessons/" + LESSON_SLUG,
      {
        headers: {
          cookie
        },
        signal: AbortSignal.timeout(20000)
      }
    );
    const lessonHtml = await lessonResponse.text();
    assert(lessonResponse.status === 200, "FRONT_LESSON_HTTP_" + lessonResponse.status);
    const frontNeedle = taskB.patch.changes[0].proposed_value.slice(0, 24);
    assert(lessonHtml.includes(frontNeedle), "FRONT_LESSON_NOT_UPDATED");
    console.log("REAL_CLOSED_LOOP_FRONTEND=PASS");

    const restoreStart = await postJson("/api/admin/courses", {
      action: "START",
      courseSlug: COURSE_SLUG,
      lessonSlug: LESSON_SLUG
    });
    const restoreCandidateId = restoreStart.item?.id;
    assert(restoreCandidateId, "RESTORE_CANDIDATE_MISSING");
    await postJson("/api/admin/courses", {
      action: "SAVE",
      candidateId: restoreCandidateId,
      updateReason: "真实闭环验收后恢复原始课程",
      snapshot: originalSnapshot
    });
    await postJson("/api/admin/courses", {
      action: "SUBMIT",
      candidateId: restoreCandidateId
    });
    await postJson("/api/admin/courses", {
      action: "PUBLISH",
      candidateId: restoreCandidateId
    });

    const restoredResponse = await fetch(
      BASE_URL + "/courses/" + COURSE_SLUG + "/lessons/" + LESSON_SLUG,
      {
        headers: {
          cookie
        },
        signal: AbortSignal.timeout(20000)
      }
    );
    const restoredHtml = await restoredResponse.text();
    assert(!restoredHtml.includes(frontNeedle), "FRONT_RESTORE_NOT_VISIBLE");
    console.log("REAL_CLOSED_LOOP_FRONT_RESTORE=PASS");
  } finally {
    const lessonBackup = originalLesson;
    if (lessonBackup) {
      await db.transaction(async (tx) => {
        await tx
          .delete(courseUpdateCandidates)
          .where(eq(courseUpdateCandidates.lessonId, COURSE_KEY));
        await tx.delete(courseInsights).where(eq(courseInsights.issueKey, ISSUE_KEY));
        await tx.delete(lessonChecks).where(eq(lessonChecks.lessonId, COURSE_KEY));
        await tx.delete(practices).where(eq(practices.lessonId, COURSE_KEY));
        if (originalChecks.length) await tx.insert(lessonChecks).values(originalChecks);
        if (originalPractices.length) await tx.insert(practices).values(originalPractices);
        await tx
          .update(lessons)
          .set({
            title: lessonBackup.title,
            summary: lessonBackup.summary,
            version: lessonBackup.version,
            status: lessonBackup.status,
            updatedAt: lessonBackup.updatedAt
          })
          .where(eq(lessons.id, COURSE_KEY));
      });
    }

    const runRows = await db
      .select({ id: aiRuns.id, taskType: aiRuns.taskType, contextIds: aiRuns.contextIds, createdAt: aiRuns.createdAt })
      .from(aiRuns);
    const cleanupRunIds = runRows
      .filter(
        (row) =>
          row.createdAt >= startedAt &&
          ["LEARNING_INSIGHT_TASK_A", "LEARNING_INSIGHT_TASK_B"].includes(row.taskType) &&
          Array.isArray(row.contextIds) &&
          row.contextIds.includes(COURSE_KEY)
      )
      .map((row) => row.id);
    if (cleanupRunIds.length) {
      await db.delete(aiRuns).where(inArray(aiRuns.id, cleanupRunIds));
    }

    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }

    const [finalLesson] = await db
      .select({ version: lessons.version, summary: lessons.summary })
      .from(lessons)
      .where(eq(lessons.id, COURSE_KEY))
      .limit(1);
    const finalCandidates = await db
      .select({ id: courseUpdateCandidates.id })
      .from(courseUpdateCandidates)
      .where(eq(courseUpdateCandidates.lessonId, COURSE_KEY));
    const finalIssues = await db
      .select({ id: courseInsights.id })
      .from(courseInsights)
      .where(eq(courseInsights.issueKey, ISSUE_KEY));
    assert(
      !originalLesson ||
        (finalLesson?.version === originalLesson.version &&
          finalLesson.summary === originalLesson.summary &&
          finalCandidates.length === 0 &&
          finalIssues.length === 0),
      "FINAL_CLEANUP_FAILED"
    );
    console.log("REAL_CLOSED_LOOP_TEST_DATA_CLEANUP=PASS");
    await closeDatabase();
  }
}

main().then(
  () => {
    console.log("LEARNING_INSIGHT_REAL_CLOSED_LOOP=PASS");
    process.exit(0);
  },
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
);
