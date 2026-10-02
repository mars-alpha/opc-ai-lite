import { and, eq, inArray } from "drizzle-orm";
import { listAdminCourseRegistry } from "../lib/server/admin/course-registry";
import { getDatabase } from "../lib/server/db";
import {
  aiRuns,
  courseInsights,
  courseUpdateCandidates,
  learningFeedback
} from "../lib/server/db/schema";
import { formalRuntimeLessonId } from "../lib/server/learning/formal-identity";
import { decideLearningCourseGate1 } from "../lib/server/learning-insights/service";
import {
  getCurrentLearningInsightTaskA,
  runLearningInsightTaskA
} from "../lib/server/learning-insights/task-a";

const CONFIRM = "LEARNING-INSIGHT-TASK-A-001";
const ISSUE_KEY = "acceptance:learning-insight-task-a";
const TEST_MODEL = "acceptance-model";

if (!process.argv.includes("--run") || !process.argv.includes("--confirm=" + CONFIRM)) {
  console.log("DRY_RUN_ONLY=PASS");
  console.log("USE --run --confirm=" + CONFIRM);
  process.exit(0);
}

const db = getDatabase();

async function cleanup() {
  await db.delete(aiRuns).where(eq(aiRuns.model, TEST_MODEL));
  await db.delete(courseInsights).where(eq(courseInsights.issueKey, ISSUE_KEY));
}

async function pickSafeCourse() {
  for (const item of listAdminCourseRegistry().items) {
    const courseKey = formalRuntimeLessonId(item.runtimeCourseSlug, item.runtimeLessonId);
    const [issues, risks] = await Promise.all([
      db
        .select({ id: courseInsights.id })
        .from(courseInsights)
        .where(
          and(
            eq(courseInsights.lessonId, courseKey),
            inArray(courseInsights.status, ["OPEN", "ANALYSIS_READY", "UNDER_REVIEW", "REVIEW_REQUIRED"])
          )
        ),
      db
        .select({ id: learningFeedback.id })
        .from(learningFeedback)
        .where(
          and(
            eq(learningFeedback.lessonId, courseKey),
            eq(learningFeedback.qualityRisk, true),
            inArray(learningFeedback.reviewStatus, ["OPEN", "UNDER_REVIEW"])
          )
        )
    ]);
    if (issues.length === 0 && risks.length === 0) return { item, courseKey };
  }
  throw new Error("TASK_A_ACCEPTANCE_SAFE_COURSE_NOT_FOUND");
}

async function main() {
  await cleanup();
  const { item, courseKey } = await pickSafeCourse();
  const candidateBefore = await db
    .select({ id: courseUpdateCandidates.id })
    .from(courseUpdateCandidates)
    .where(eq(courseUpdateCandidates.lessonId, courseKey));

  const [issue] = await db
    .insert(courseInsights)
    .values({
      lessonId: courseKey,
      issueKey: ISSUE_KEY,
      issueCategory: "DONT_UNDERSTAND",
      status: "OPEN",
      distinctUserCount: 12,
      evidence: {
        acceptance: true,
        incorrectRate: 67,
        finding: "学员能够复述概念，但无法在真实任务中区分边界。"
      },
      analysisMode: "RULE",
      createdAt: new Date("2026-09-20T00:00:00.000Z"),
      updatedAt: new Date("2026-10-01T00:00:00.000Z")
    })
    .returning({ id: courseInsights.id });

  let blockedBeforeGate = false;
  try {
    await runLearningInsightTaskA(courseKey, {
      evidenceMode: "ACCEPTANCE",
      modelConfig: {
        baseUrl: "https://example.invalid",
        apiKey: "acceptance-key",
        model: TEST_MODEL,
        provider: "ACCEPTANCE"
      },
      callModel: async () => {
        throw new Error("MODEL_MUST_NOT_RUN_BEFORE_GATE1");
      }
    });
  } catch (error) {
    blockedBeforeGate =
      error instanceof Error && error.message === "TASK_A_GATE1_NOT_AUTHORIZED";
  }
  if (!blockedBeforeGate) throw new Error("TASK_A_GATE1_PRECONDITION_FAILED");
  console.log("TASK_A_GATE1_PRECONDITION=PASS");

  await decideLearningCourseGate1({
    courseKey,
    decision: "ANALYZE",
    decidedBy: "acceptance-admin"
  });

  let sawWholeCourseInput = false;
  const result = await runLearningInsightTaskA(courseKey, {
    evidenceMode: "ACCEPTANCE",
    modelConfig: {
      baseUrl: "https://example.invalid",
      apiKey: "acceptance-key",
      model: TEST_MODEL,
      provider: "ACCEPTANCE"
    },
    callModel: async (input, dependencies) => {
      const payload = input.userPayload as Record<string, any>;
      const bundle = payload.COURSE_ISSUE_BUNDLE;
      const evidence = payload.EVIDENCE_CATALOG;
      const currentCourse = payload.CURRENT_COURSE;
      const curriculum = payload.CURRICULUM_CATALOG;
      sawWholeCourseInput =
        bundle?.issue_count >= 1 &&
        Array.isArray(evidence) &&
        evidence.length >= 1 &&
        Array.isArray(currentCourse?.stepMeta) &&
        currentCourse.stepMeta.length === 6 &&
        Array.isArray(curriculum) &&
        curriculum.length === 81;

      const courseId = bundle.current_course_id as string;
      const evidenceRef = evidence[0].evidence_ref as string;
      return {
        config: dependencies.config,
        data: {
          schema_version: "learning_issue_diagnosis_v2",
          decision: "CHANGE_RECOMMENDED",
          problem_summary: "当前课程的解释层与真实任务判断之间存在缺口。",
          root_causes: [{
            type: "EXPLANATION_GAP",
            description: "Step 2 没有把概念边界和真实任务判断建立直接联系。",
            evidence_refs: [evidenceRef]
          }],
          courses: [{
            course_id: courseId,
            action: "MODIFY",
            reason: "问题直接发生在当前课程的核心能力范围。",
            evidence_refs: [evidenceRef]
          }],
          targets: [{
            course_id: courseId,
            step: 2,
            area: "example.knowledgeDepth",
            problem: "概念与实际判断之间缺少对照。",
            change_goal: "让学员能够在真实任务中判断概念边界。",
            evidence_refs: [evidenceRef]
          }],
          observation_note: null
        }
      };
    }
  });

  if (!sawWholeCourseInput) throw new Error("TASK_A_WHOLE_COURSE_INPUT_INVALID");
  if (result.diagnosis.schema_version !== "learning_issue_diagnosis_v2") {
    throw new Error("TASK_A_RESULT_SCHEMA_INVALID");
  }

  const [runRow] = await db
    .select({ status: aiRuns.status, rawOutput: aiRuns.rawOutput })
    .from(aiRuns)
    .where(eq(aiRuns.id, result.aiRunId))
    .limit(1);
  if (runRow?.status !== "SUCCEEDED") throw new Error("TASK_A_AI_RUN_NOT_SUCCEEDED");

  const [issueAfter] = await db
    .select({ status: courseInsights.status })
    .from(courseInsights)
    .where(eq(courseInsights.id, issue.id))
    .limit(1);
  if (issueAfter?.status !== "ANALYSIS_READY") {
    throw new Error("TASK_A_CHANGED_BUSINESS_STATE");
  }

  const candidateAfter = await db
    .select({ id: courseUpdateCandidates.id })
    .from(courseUpdateCandidates)
    .where(eq(courseUpdateCandidates.lessonId, courseKey));
  if (candidateAfter.length !== candidateBefore.length) {
    throw new Error("TASK_A_CREATED_CANDIDATE");
  }

  const current = await getCurrentLearningInsightTaskA(courseKey);
  if (current?.aiRunId === result.aiRunId) {
    throw new Error("TASK_A_ACCEPTANCE_RUN_VISIBLE_AS_PRODUCTION");
  }

  console.log("TASK_A_WHOLE_COURSE_INPUT=PASS");
  console.log("TASK_A_AI_RUN_AUDIT=PASS");
  console.log("TASK_A_BUSINESS_STATE_UNCHANGED=PASS");
  console.log("TASK_A_NO_CANDIDATE=PASS");
  console.log("TASK_A_ACCEPTANCE_ISOLATION=PASS");
  console.log("TASK_A_ACCEPTANCE_COURSE=" + item.lessonId);
}

main()
  .then(async () => {
    await cleanup();
    console.log("TASK_A_TEST_DATA_CLEANUP=PASS");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await cleanup().catch(() => undefined);
    process.exit(1);
  });
