import { loadEnvConfig } from "@next/env";
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  TRACK01_PHASE1_COURSE_SLUG,
  getTrack01Phase1RuntimePresentation,
  track01T110RuntimeDefinition
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
const CONFIRM = process.argv.includes("--confirm=TRACK01-PHASE3-T1-10-002");
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
      "CONFIRMATION_REQUIRED: use --run --confirm=TRACK01-PHASE3-T1-10-002"
    );
  }

  const lessonSlug = track01T110RuntimeDefinition.lesson.id;
  const sessionToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
  const identity = "track01-t110-runtime-" + Date.now() + "@example.test";

  const [testUser] = await getDatabase()
    .insert(users)
    .values({ displayName: "__TRACK01_T110_RUNTIME_ACCEPTANCE__" })
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

    const t109LessonId = await getLessonId("t1-09-knowledge-source");
    const now = new Date();
    await getDatabase()
      .insert(lessonProgress)
      .values({
        userId: testUser.id,
        lessonId: t109LessonId,
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
    assert(presentation, "T110_PRESENTATION");
    assert(presentation.activity.kind === "COPY_TO_AI", "T110_COPY_TO_AI_ACTIVITY");
    assert(presentation.practice !== null, "T110_PRESENTATION_STANDARD_PRACTICE");
    assert(Boolean(presentation.referenceAnswer), "T110_REFERENCE_ANSWER");
    assert(
      !presentation.referenceAnswer?.includes("当前问题：") &&
        !presentation.referenceAnswer?.includes("检索范围：") &&
        !presentation.referenceAnswer?.includes("必须找到的证据：") &&
        !presentation.referenceAnswer?.includes("回答规则："),
      "T110_REFERENCE_ANSWER_WITHOUT_MAIN_TITLES"
    );

    const query =
      "?courseSlug=" +
      encodeURIComponent(TRACK01_PHASE1_COURSE_SLUG) +
      "&lessonSlug=" +
      encodeURIComponent(lessonSlug);

    const runtimeBefore = await jsonRequest("/api/learning/runtime" + query, sessionToken);
    if (runtimeBefore.status !== 200) console.error("T110_RUNTIME_DEBUG=" + JSON.stringify({ status: runtimeBefore.status, body: runtimeBefore.body, text: runtimeBefore.text.slice(0, 500) }));
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

    for (const [index, check] of track01T110RuntimeDefinition.checks.entries()) {
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

    const practiceLabels = presentation.practice?.instructions.map((item) => item.label) ?? [];
    assert(practiceLabels.includes("当前问题"), "T110_STEP4_FIELD_QUESTION");
    assert(practiceLabels.includes("检索范围"), "T110_STEP4_FIELD_SCOPE");
    assert(practiceLabels.includes("必须找到的证据"), "T110_STEP4_FIELD_EVIDENCE");
    assert(practiceLabels.includes("回答规则"), "T110_STEP4_FIELD_ANSWER_RULE");

    const practice = interactive.body.practices[0];
    assert(practice?.id, "T110_PRACTICE_ID_PRESENT");


    const passedPractice = await jsonRequest(
      "/api/learning/practices/" + encodeURIComponent(practice.id) + "/submissions",
      sessionToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: track01T110RuntimeDefinition.referenceFill })
      }
    );
    assert(passedPractice.status === 201, "T110_PRACTICE_PASS_SUBMIT_HTTP_201");
    assert(passedPractice.body?.evaluation?.passed === true, "T110_PRACTICE_PASS_SCORE_EXPECTED");

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

    const t110Page = await pageRequest(
      "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug,
      sessionToken
    );
    assert(t110Page.status === 200, "T110_PAGE_HTTP_200");
    assert(t110Page.text.includes(track01T110RuntimeDefinition.lesson.title), "T110_PAGE_TITLE");
    assert(t110Page.text.includes("搜索（Search）"), "T110_SEARCH_PRESENTATION");
    assert(
      t110Page.text.includes("检索增强生成（RAG）") && !t110Page.text.includes("Retrieval-Augmented Generation"),
      "T110_RAG_PRESENTATION"
    );
    assert(
      !t110Page.text.includes("继续前五课的 OPC / 自媒体任务"),
      "T110_INTERNAL_CASE_THREAD_NOT_VISIBLE"
    );

    const t109Page = await pageRequest(
      "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/t1-09-knowledge-source",
      sessionToken
    );
    assert(t109Page.status === 200, "T109_PAGE_HTTP_200");
    assert(
      t109Page.text.includes(
        "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug
      ),
      "T109_TO_T110_NAV"
    );

    console.log("T1_10_RUNTIME_REGISTERED=PASS");
    console.log("T1_10_CHECK_ONLY_GATE=PASS");
    console.log("T1_10_OPTIONAL_PRACTICE_RUNTIME=PASS");
    console.log("T1_10_STANDARD_STEP4_FULL_FLOW=PASS");
    console.log("T1_10_REFERENCE_ANSWER_WITHOUT_MAIN_TITLES=PASS");
    console.log("T1_10_CURRENT_STEP_RESUME=PASS");
    console.log("T1_10_COMPLETION_AFTER_CHECKS=PASS");
    console.log("T1_10_PRESENTATION=PASS");
    console.log("T1_09_TO_T1_10_NAVIGATION=PASS");
    console.log("T1_10_RUNTIME_ACCEPTANCE=PASS");
  } finally {
    await getDatabase().delete(users).where(eq(users.id, testUser.id));
    const [leftover] = await getDatabase()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, testUser.id))
      .limit(1);
    if (leftover) throw new Error("ACCEPTANCE_TEST_USER_CLEANUP_FAILED");
    console.log("T1_10_TEST_DATA_CLEANUP=PASS");
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
