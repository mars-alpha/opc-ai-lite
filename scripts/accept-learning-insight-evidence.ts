import { and, eq } from "drizzle-orm";
import { getLearningInsightEvidenceDetail } from "../lib/server/learning-insights/evidence-detail";
import { listLearningInsightWorkbench } from "../lib/server/learning-insights/service";
import { formalRuntimeLessonId } from "../lib/server/learning/formal-identity";
import { getDatabase } from "../lib/server/db";
import {
  courseInsights,
  learningEvents,
  learningFeedback,
  lessonProgress,
  lessonCheckResponses,
  lessonChecks,
  lessons,
  practiceEvaluations,
  practiceSubmissions,
  practices,
  users
} from "../lib/server/db/schema";

const CONFIRM = "LEARNING-INSIGHT-EVIDENCE-001";
const USER_1 = "00000000-0000-4000-8000-000000000101";
const USER_2 = "00000000-0000-4000-8000-000000000102";
const CHECK_ID = "acceptance-learning-evidence-check";
const PRACTICE_ID = "acceptance-learning-evidence-practice";
const ISSUE_KEY = "acceptance:learning_evidence_detail";

async function cleanup() {
  const db = getDatabase();
  await db.delete(users).where(eq(users.id, USER_1));
  await db.delete(users).where(eq(users.id, USER_2));
  await db.delete(lessonChecks).where(eq(lessonChecks.id, CHECK_ID));
  await db.delete(practices).where(eq(practices.id, PRACTICE_ID));
  const lessonId = formalRuntimeLessonId("foundation-ai", "t1-02-clear-prompt");
  await db
    .delete(courseInsights)
    .where(
      and(
        eq(courseInsights.lessonId, lessonId),
        eq(courseInsights.issueKey, ISSUE_KEY)
      )
    );
}

async function main() {
  const run = process.argv.includes("--run");
  const confirmArg = process.argv.find((arg) => arg.startsWith("--confirm="));
  const confirm = confirmArg?.slice("--confirm=".length) ?? "";
  const db = getDatabase();
  const lessonId = formalRuntimeLessonId("foundation-ai", "t1-02-clear-prompt");

  const [lesson] = await db
    .select({ id: lessons.id, title: lessons.title })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) throw new Error("FORMAL_LESSON_IDENTITY_MISSING");
  console.log("LEARNING_INSIGHT_EVIDENCE_ACCEPT_TARGET=" + lesson.title);

  if (!run) {
    console.log("DRY_RUN_ONLY=PASS");
    return;
  }
  if (confirm !== CONFIRM) throw new Error("CONFIRM_REQUIRED:" + CONFIRM);

  await cleanup();

  const baselineFeedbackRows = await db
    .select({ id: learningFeedback.id })
    .from(learningFeedback)
    .where(eq(learningFeedback.lessonId, lessonId));
  const baselineFeedbackCount = baselineFeedbackRows.length;

  try {
    await db.insert(users).values([
      { id: USER_1, displayName: "Evidence Acceptance 1" },
      { id: USER_2, displayName: "Evidence Acceptance 2" }
    ]);

    await db.insert(lessonProgress).values([
      {
        userId: USER_1,
        lessonId,
        status: "IN_PROGRESS",
        currentStep: 4,
        startedAt: new Date("2026-10-01T01:00:00.000Z")
      },
      {
        userId: USER_2,
        lessonId,
        status: "COMPLETED",
        currentStep: 6,
        startedAt: new Date("2026-10-01T01:05:00.000Z"),
        completedAt: new Date("2026-10-01T01:30:00.000Z")
      }
    ]);

    const [insight] = await db
      .insert(courseInsights)
      .values({
        lessonId,
        issueKey: ISSUE_KEY,
        issueCategory: "DONT_UNDERSTAND",
        status: "ANALYSIS_READY",
        distinctUserCount: 2,
        evidence: { acceptance: true },
        analysisMode: "RULE"
      })
      .returning({ id: courseInsights.id });

    await db.insert(learningFeedback).values([
      {
        userId: USER_1,
        lessonId,
        issueType: "DONT_UNDERSTAND",
        issueKey: ISSUE_KEY,
        resolutionStatus: "UNRESOLVED",
        reasons: ["说明不够清楚"],
        comment: "第一位测试学员仍然不理解。",
        qualityRisk: false,
        reviewStatus: "FILTERED"
      },
      {
        userId: USER_2,
        lessonId,
        issueType: "DONT_UNDERSTAND",
        issueKey: ISSUE_KEY,
        resolutionStatus: "UNRESOLVED",
        reasons: ["例子不足"],
        comment: "第二位测试学员需要更具体的例子。",
        qualityRisk: false,
        reviewStatus: "FILTERED"
      }
    ]);

    await db.insert(lessonChecks).values({
      id: CHECK_ID,
      lessonId,
      type: "SINGLE_CHOICE",
      question: "Evidence acceptance check",
      options: [{ value: "A", label: "A" }, { value: "B", label: "B" }],
      correctAnswer: "A",
      explanation: "Acceptance only",
      required: true,
      order: 99,
      status: "PUBLISHED"
    });

    await db.insert(lessonCheckResponses).values([
      {
        checkId: CHECK_ID,
        userId: USER_1,
        answer: "B",
        isCorrect: false,
        attempts: 2
      },
      {
        checkId: CHECK_ID,
        userId: USER_2,
        answer: "A",
        isCorrect: true,
        attempts: 1
      }
    ]);

    await db.insert(practices).values({
      id: PRACTICE_ID,
      lessonId,
      title: "Evidence acceptance practice",
      goal: "Acceptance only",
      instructions: [],
      hints: [],
      rubric: [],
      passScore: 80,
      required: false,
      status: "PUBLISHED"
    });

    const submissions = await db
      .insert(practiceSubmissions)
      .values([
        {
          practiceId: PRACTICE_ID,
          userId: USER_1,
          attempt: 1,
          content: { value: "first" },
          status: "NEEDS_REVISION"
        },
        {
          practiceId: PRACTICE_ID,
          userId: USER_1,
          attempt: 2,
          content: { value: "retry" },
          status: "PASSED"
        },
        {
          practiceId: PRACTICE_ID,
          userId: USER_2,
          attempt: 1,
          content: { value: "pass" },
          status: "PASSED"
        }
      ])
      .returning({ id: practiceSubmissions.id, attempt: practiceSubmissions.attempt, userId: practiceSubmissions.userId });

    for (const submission of submissions) {
      const score =
        submission.userId === USER_1 && submission.attempt === 1
          ? 60
          : submission.userId === USER_1
            ? 90
            : 80;
      await db.insert(practiceEvaluations).values({
        submissionId: submission.id,
        evaluatorType: "RULE",
        score,
        passed: score >= 80,
        result: { acceptance: true }
      });
    }

    await db.insert(learningEvents).values([
      {
        userId: USER_1,
        lessonId,
        eventName: "hint_revealed",
        targetType: "PRACTICE",
        targetId: PRACTICE_ID,
        properties: { acceptance: true }
      },
      {
        userId: USER_1,
        lessonId,
        eventName: "hint_revealed",
        targetType: "PRACTICE",
        targetId: PRACTICE_ID,
        properties: { acceptance: true }
      },
      {
        userId: USER_2,
        lessonId,
        eventName: "still_confused",
        targetType: "LESSON",
        targetId: lessonId,
        properties: { acceptance: true }
      },
      {
        userId: USER_1,
        lessonId,
        eventName: "real_ai_evidence_recorded",
        targetType: "LESSON",
        targetId: lessonId,
        properties: { acceptance: true }
      }
    ]);

    const detail = await getLearningInsightEvidenceDetail(insight.id);
    const workbench = await listLearningInsightWorkbench();
    const courseHealth = workbench.courseHealth.find((course) => course.courseKey === lessonId);
    const check = detail.checks.find((item) => item.checkId === CHECK_ID);
    const practice = detail.practices.find((item) => item.practiceId === PRACTICE_ID);
    const hint = detail.events.find((item) => item.eventName === "hint_revealed");
    const confused = detail.events.find((item) => item.eventName === "still_confused");

    const accepted =
      detail.summary.feedbackCount === baselineFeedbackCount + 2 &&
      courseHealth?.feedbackCount === baselineFeedbackCount + 2 &&
      detail.behaviors.reachedUsers >= 2 &&
      detail.behaviors.completedUsers >= 1 &&
      detail.behaviors.checkRetryUsers >= 1 &&
      detail.behaviors.practiceUsers >= 2 &&
      detail.behaviors.practiceRetryUsers >= 1 &&
      detail.behaviors.aiEvidenceUsers >= 1 &&
      detail.behaviors.aiEvidenceCount >= 1 &&
      check?.incorrectRate === 50 &&
      check.attempts === 3 &&
      practice?.firstPassRate === 50 &&
      practice.retryUsers === 1 &&
      practice.averageScore === 77 &&
      (hint?.count ?? 0) >= 2 &&
      (hint?.distinctUsers ?? 0) >= 1 &&
      (confused?.count ?? 0) >= 1 &&
      JSON.stringify(detail).includes(USER_1) === false &&
      JSON.stringify(detail).includes(USER_2) === false;

    if (!accepted) {
      console.log(JSON.stringify(detail, null, 2));
      throw new Error("LEARNING_INSIGHT_EVIDENCE_DB_ACCEPT_FAILED");
    }

    console.log("LEARNING_INSIGHT_EVIDENCE_FEEDBACK_BASELINE_PLUS_2=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_HEADER_FEEDBACK_SYNC=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_CHECK_50_PERCENT=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_PRACTICE_FIRST_PASS_50_PERCENT=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_PRACTICE_RETRY_1=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_COURSE_LEVEL_EVENTS=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_BEHAVIOR_REACHED=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_BEHAVIOR_COMPLETED=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_BEHAVIOR_CHECK_RETRY=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_BEHAVIOR_PRACTICE_USERS=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_BEHAVIOR_PRACTICE_RETRY=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_BEHAVIOR_AI_EVIDENCE=PASS");
    console.log("LEARNING_INSIGHT_EVIDENCE_NO_USER_ID_EXPOSURE=PASS");
  } finally {
    await cleanup();
    console.log("LEARNING_INSIGHT_EVIDENCE_TEST_DATA_CLEANUP=PASS");
  }
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
);
