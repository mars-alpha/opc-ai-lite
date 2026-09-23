import { loadEnvConfig } from "@next/env";
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  TRACK01_PHASE1_COURSE_SLUG,
  getTrack01Phase1RuntimePresentation,
  track01T107RuntimeDefinition
} from "../lib/learning/track01-phase1-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  lessonProgress,
  lessons,
  modules,
  sessions,
  stages,
  userIdentities,
  users
} from "../lib/server/db/schema";

const RUN = process.argv.includes("--run");
const CONFIRM = process.argv.includes("--confirm=TRACK01-PHASE2-T1-07-003");
const BASE_URL =
  process.argv.find((item) => item.startsWith("--base-url="))?.slice("--base-url=".length) ||
  "http://127.0.0.1:3001";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ACCEPTANCE_FAILED:" + code);
}

async function getLessonId(lessonSlug: string) {
  const [row] = await getDatabase()
    .select({ lessonId: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(
      and(
        eq(stages.slug, TRACK01_PHASE1_COURSE_SLUG),
        eq(lessons.slug, lessonSlug),
        eq(lessons.status, "PUBLISHED")
      )
    )
    .limit(1);
  if (!row) throw new Error("ACCEPTANCE_LESSON_NOT_FOUND:" + lessonSlug);
  return row.lessonId;
}

async function jsonRequest(path: string, sessionToken: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("cookie", "opc_session=" + encodeURIComponent(sessionToken));
  const response = await fetch(BASE_URL + path, {
    ...init,
    headers,
    signal: AbortSignal.timeout(15000)
  });
  const text = await response.text();
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  return { status: response.status, body, text };
}

async function pageRequest(path: string, sessionToken: string) {
  const response = await fetch(BASE_URL + path, {
    headers: { cookie: "opc_session=" + encodeURIComponent(sessionToken) },
    signal: AbortSignal.timeout(15000)
  });
  return { status: response.status, text: await response.text() };
}

async function setCurrentStep(sessionToken: string, lessonSlug: string, currentStep: number) {
  return jsonRequest("/api/learning/progress", sessionToken, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      courseSlug: TRACK01_PHASE1_COURSE_SLUG,
      lessonSlug,
      currentStep
    })
  });
}

async function main() {
  if (!RUN || !CONFIRM) {
    throw new Error(
      "CONFIRMATION_REQUIRED: use --run --confirm=TRACK01-PHASE2-T1-07-003"
    );
  }

  const lessonSlug = track01T107RuntimeDefinition.lesson.id;
  const sessionToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
  const identity = "track01-t107-runtime-" + Date.now() + "@example.test";

  const [testUser] = await getDatabase()
    .insert(users)
    .values({ displayName: "__TRACK01_T107_RUNTIME_ACCEPTANCE__" })
    .returning({ id: users.id });
  assert(testUser?.id, "TEST_USER_CREATE");

  try {
    await getDatabase().insert(userIdentities).values({
      userId: testUser.id,
      provider: "EMAIL",
      providerUserId: identity
    });
    await getDatabase().insert(sessions).values({
      userId: testUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    const t106LessonId = await getLessonId("t1-06-model-and-product");
    const now = new Date();
    await getDatabase()
      .insert(lessonProgress)
      .values({
        userId: testUser.id,
        lessonId: t106LessonId,
        status: "COMPLETED",
        currentStep: 6,
        startedAt: now,
        completedAt: now,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          status: "COMPLETED",
          currentStep: 6,
          completedAt: now,
          updatedAt: now
        }
      });

    const presentation = getTrack01Phase1RuntimePresentation(
      TRACK01_PHASE1_COURSE_SLUG,
      lessonSlug
    );
    assert(presentation, "T107_PRESENTATION");
    assert(presentation.activity.kind === "COPY_TO_AI", "T107_COPY_TO_AI_ACTIVITY");
    assert(
      presentation.activity.title.includes("完全相同的提示词") &&
        presentation.activity.instruction.includes("运行两次"),
      "T107_REPEAT_SAME_PROMPT_FLOW"
    );
    assert(presentation.practice !== null, "T107_PRESENTATION_STANDARD_PRACTICE");
    assert(Boolean(presentation.referenceAnswer), "T107_REFERENCE_ANSWER");
    assert(
      !presentation.referenceAnswer?.includes("任务和原始信息：") &&
        !presentation.referenceAnswer?.includes("必须保持的事实和边界：") &&
        !presentation.referenceAnswer?.includes("输出和比较要求："),
      "T107_REFERENCE_ANSWER_WITHOUT_MAIN_TITLES"
    );

    const query =
      "?courseSlug=" +
      encodeURIComponent(TRACK01_PHASE1_COURSE_SLUG) +
      "&lessonSlug=" +
      encodeURIComponent(lessonSlug);

    const runtimeBefore = await jsonRequest("/api/learning/runtime" + query, sessionToken);
    assert(runtimeBefore.status === 200, "RUNTIME_HTTP_200");
    assert(runtimeBefore.body?.registered === true, "REGISTERED");
    assert(runtimeBefore.body?.configurationReady === true, "CONFIG_READY");
    assert(runtimeBefore.body?.enforcementActive === true, "ENFORCEMENT");
    assert(runtimeBefore.body?.plan?.lessonType === "CONCEPT", "CONCEPT_PLAN");
    assert(runtimeBefore.body?.plan?.requiresCheck === true, "CHECK_REQUIRED_PLAN");
    assert(runtimeBefore.body?.plan?.requiresPractice === false, "PRACTICE_NOT_REQUIRED_PLAN");
    assert(runtimeBefore.body?.gates?.check?.configured === true, "CHECK_CONFIGURED");
    assert(runtimeBefore.body?.gates?.practice?.configured === false, "PRACTICE_NOT_CONFIGURED_EXPECTED");
    assert(runtimeBefore.body?.blockers?.length === 0, "NO_RUNTIME_BLOCKERS");
    assert(runtimeBefore.body?.interactive?.checks?.length === 3, "THREE_CHECKS");
    assert(runtimeBefore.body?.interactive?.practices?.length === 1, "ONE_OPTIONAL_PRACTICE");
    assert(runtimeBefore.body?.canComplete === false, "NOT_COMPLETE_BEFORE_CHECKS");

    const moveToCheck = await setCurrentStep(sessionToken, lessonSlug, 3);
    assert(moveToCheck.status === 200 && moveToCheck.body?.currentStep === 3, "STEP3_PERSISTED");

    const blockedStep4 = await setCurrentStep(sessionToken, lessonSlug, 4);
    assert(
      blockedStep4.status === 409 && blockedStep4.body?.error === "CHECK_REQUIRED",
      "STEP4_BLOCKED_BY_CHECK"
    );

    const interactive = await jsonRequest("/api/learning/interactive" + query, sessionToken);
    assert(interactive.status === 200, "INTERACTIVE_HTTP_200");
    assert(interactive.body?.checks?.length === 3, "INTERACTIVE_THREE_CHECKS");
    assert(interactive.body?.practices?.length === 1, "INTERACTIVE_ONE_OPTIONAL_PRACTICE");

    const blockedCompletion = await jsonRequest("/api/learning/progress", sessionToken, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseSlug: TRACK01_PHASE1_COURSE_SLUG,
        lessonSlug,
        completed: true
      })
    });
    assert(
      blockedCompletion.status === 409 && blockedCompletion.body?.error === "CHECK_REQUIRED",
      "CHECK_GATE_BLOCKS_COMPLETION"
    );

    for (const [index, check] of track01T107RuntimeDefinition.checks.entries()) {
      const runtimeCheck = interactive.body.checks[index];
      assert(runtimeCheck?.id, "CHECK_ID_PRESENT:" + index);
      const answerPayload =
        check.type === "MULTI_SELECT"
          ? { answers: check.correctAnswers }
          : { answer: check.correctAnswers[0] };
      const answered = await jsonRequest(
        "/api/learning/checks/" + encodeURIComponent(runtimeCheck.id) + "/answer",
        sessionToken,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(answerPayload)
        }
      );
      assert(answered.status === 200, "CHECK_ANSWER_HTTP_200:" + index);
      assert(answered.body?.correct === true, "CHECK_ANSWER_CORRECT:" + index);
    }

    const moveToStep4 = await setCurrentStep(sessionToken, lessonSlug, 4);
    assert(moveToStep4.status === 200 && moveToStep4.body?.currentStep === 4, "STEP4_AFTER_CHECK");

    const step4Page = await pageRequest(
      "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug,
      sessionToken
    );
    assert(step4Page.status === 200, "T107_STEP4_PAGE_HTTP_200");
    assert(step4Page.text.includes("实操验收"), "T107_STANDARD_STEP4_VISIBLE");
    assert(step4Page.text.includes("任务和原始信息"), "T107_STEP4_FIELD_GOAL");
    assert(step4Page.text.includes("必须保持的事实和边界"), "T107_STEP4_FIELD_CONSTRAINT");
    assert(step4Page.text.includes("输出和比较要求"), "T107_STEP4_FIELD_OUTPUT");
    assert(step4Page.text.includes("检查我的结果"), "T107_STEP4_CHECK_RESULT_VISIBLE");
    assert(step4Page.text.includes("复制我的提示词"), "T107_STEP4_COPY_PROMPT_VISIBLE");

    const practice = interactive.body.practices[0];
    assert(practice?.id, "T107_PRACTICE_ID_PRESENT");

    const failedPractice = await jsonRequest(
      "/api/learning/practices/" + encodeURIComponent(practice.id) + "/submissions",
      sessionToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: {
            goal: "写个介绍",
            constraint: "别乱写",
            output: "写短一点"
          }
        })
      }
    );
    assert(failedPractice.status === 201, "T107_PRACTICE_FAIL_SUBMIT_HTTP_201");
    assert(failedPractice.body?.evaluation?.passed === false, "T107_PRACTICE_FAIL_SCORE_EXPECTED");

    const failedPracticePage = await pageRequest(
      "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug,
      sessionToken
    );
    assert(failedPracticePage.text.includes("/ 100"), "T107_PRACTICE_SCORE_VISIBLE");
    assert(failedPracticePage.text.includes("一键填充参考答案"), "T107_REFERENCE_FILL_VISIBLE");
    assert(failedPracticePage.text.includes("复制参考答案"), "T107_REFERENCE_COPY_VISIBLE");

    const passedPractice = await jsonRequest(
      "/api/learning/practices/" + encodeURIComponent(practice.id) + "/submissions",
      sessionToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: track01T107RuntimeDefinition.referenceFill })
      }
    );
    assert(passedPractice.status === 201, "T107_PRACTICE_PASS_SUBMIT_HTTP_201");
    assert(passedPractice.body?.evaluation?.passed === true, "T107_PRACTICE_PASS_SCORE_EXPECTED");

    const moveToStep5 = await setCurrentStep(sessionToken, lessonSlug, 5);
    assert(moveToStep5.status === 200 && moveToStep5.body?.currentStep === 5, "STEP5_AFTER_STANDARD_PRACTICE");

    const moveToStep6 = await setCurrentStep(sessionToken, lessonSlug, 6);
    assert(moveToStep6.status === 200 && moveToStep6.body?.currentStep === 6, "STEP6_NO_PRACTICE_GATE");

    const runtimeAfterChecks = await jsonRequest("/api/learning/runtime" + query, sessionToken);
    assert(runtimeAfterChecks.body?.gates?.check?.passed === true, "CHECK_GATE_PASS");
    assert(runtimeAfterChecks.body?.gates?.practice?.configured === false, "PRACTICE_STILL_NOT_CONFIGURED");
    assert(runtimeAfterChecks.body?.canComplete === true, "CAN_COMPLETE_AFTER_CHECKS");

    const completed = await jsonRequest("/api/learning/progress", sessionToken, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseSlug: TRACK01_PHASE1_COURSE_SLUG,
        lessonSlug,
        completed: true
      })
    });
    assert(completed.status === 200, "COMPLETION_HTTP_200");

    const runtimeAfterComplete = await jsonRequest("/api/learning/runtime" + query, sessionToken);
    assert(runtimeAfterComplete.body?.progress?.completed === true, "COMPLETION_PERSISTED");
    assert(runtimeAfterComplete.body?.progress?.currentStep === 6, "FINAL_STEP6_PERSISTED");

    const t107Page = await pageRequest(
      "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug,
      sessionToken
    );
    assert(t107Page.status === 200, "T107_PAGE_HTTP_200");
    assert(t107Page.text.includes(track01T107RuntimeDefinition.lesson.title), "T107_PAGE_TITLE");
    assert(t107Page.text.includes("AI 适合做什么"), "T107_REVIEW_PRESENTATION");
    assert(t107Page.text.includes("同一份提示词，运行两次看看"), "T107_STANDARD_PRACTICE_PRESENTATION");
    assert(
      !t107Page.text.includes("继续前五课的 OPC / 自媒体任务"),
      "T107_INTERNAL_CASE_THREAD_NOT_VISIBLE"
    );

    const t106Page = await pageRequest(
      "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/t1-06-model-and-product",
      sessionToken
    );
    assert(t106Page.status === 200, "T106_PAGE_HTTP_200");
    assert(
      t106Page.text.includes(
        "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug
      ),
      "T106_TO_T107_NAV"
    );

    console.log("T1_07_RUNTIME_REGISTERED=PASS");
    console.log("T1_07_CHECK_ONLY_GATE=PASS");
    console.log("T1_07_OPTIONAL_PRACTICE_RUNTIME=PASS");
    console.log("T1_07_STANDARD_STEP4_FULL_FLOW=PASS");
    console.log("T1_07_REFERENCE_ANSWER_WITHOUT_MAIN_TITLES=PASS");
    console.log("T1_07_INTERNAL_CASE_THREAD_REMOVED=PASS");
    console.log("T1_07_CURRENT_STEP_RESUME=PASS");
    console.log("T1_07_COMPLETION_AFTER_CHECKS=PASS");
    console.log("T1_07_PRESENTATION=PASS");
    console.log("T1_06_TO_T1_07_NAVIGATION=PASS");
    console.log("T1_07_RUNTIME_ACCEPTANCE=PASS");
  } finally {
    await getDatabase().delete(users).where(eq(users.id, testUser.id));
    const [leftover] = await getDatabase()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, testUser.id))
      .limit(1);
    if (leftover) throw new Error("ACCEPTANCE_TEST_USER_CLEANUP_FAILED");
    console.log("T1_07_TEST_DATA_CLEANUP=PASS");
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
