import { loadEnvConfig } from "@next/env";
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

import { buildPracticeCopyText } from "../lib/learning/practice-copy";
import {
  TRACK01_PHASE1_COURSE_SLUG,
  getTrack01Phase1RuntimePresentation,
  track01Phase1RuntimeDefinitions
} from "../lib/learning/track01-phase1-runtime";
import { rulePracticeEvaluator } from "../lib/learning/practice-evaluator";
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
const CONFIRM = process.argv.includes("--confirm=TRACK01-PHASE1-RUNTIME-001");
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

async function jsonRequest(path: string, sessionToken: string | null, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (sessionToken) headers.set("cookie", "opc_session=" + encodeURIComponent(sessionToken));
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

async function setCurrentStep(
  sessionToken: string,
  lessonSlug: string,
  currentStep: number
) {
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

async function submitHelpfulRating(sessionToken: string, lessonSlug: string) {
  return jsonRequest("/api/learning/feedback", sessionToken, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      courseSlug: TRACK01_PHASE1_COURSE_SLUG,
      lessonSlug,
      issueType: "LESSON_HELPFULNESS",
      helpfulness: "HELPFUL",
      reasons: ["课程评分：基本有帮助"],
      comment: "",
      resolutionStatus: "RESOLVED"
    })
  });
}

async function main() {
  if (!RUN || !CONFIRM) {
    throw new Error(
      "CONFIRMATION_REQUIRED: use --run --confirm=TRACK01-PHASE1-RUNTIME-001"
    );
  }

  const sessionToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
  const identity = "track01-phase1-runtime-" + Date.now() + "@example.test";

  const [testUser] = await getDatabase()
    .insert(users)
    .values({ displayName: "__TRACK01_PHASE1_RUNTIME_ACCEPTANCE__" })
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

    for (const [index, definition] of track01Phase1RuntimeDefinitions.entries()) {
      const lessonSlug = definition.lesson.id;
      const presentation = getTrack01Phase1RuntimePresentation(
        TRACK01_PHASE1_COURSE_SLUG,
        lessonSlug
      );
      assert(presentation, "PRESENTATION_MISSING:" + lessonSlug);
      assert(presentation.activity.kind === "COPY_TO_AI", "COPY_TO_AI_MISSING:" + lessonSlug);

      const copyText = buildPracticeCopyText(
        definition.practice.instructions,
        definition.referenceFill,
        true
      );
      for (const instruction of definition.practice.instructions) {
        assert(
          !copyText.includes(instruction.label + "："),
          "COPY_PAYLOAD_LABEL_LEAK:" + lessonSlug + ":" + instruction.key
        );
      }
      for (const value of Object.values(definition.referenceFill)) {
        assert(copyText.includes(value), "COPY_PAYLOAD_VALUE_MISSING:" + lessonSlug);
      }

      const evaluation = await rulePracticeEvaluator({
        content: definition.referenceFill,
        rubric: definition.practice.rubric,
        passScore: definition.practice.passScore
      });
      assert(evaluation.passed, "REFERENCE_FILL_RULE_FAIL:" + lessonSlug);

      const query =
        "?courseSlug=" +
        encodeURIComponent(TRACK01_PHASE1_COURSE_SLUG) +
        "&lessonSlug=" +
        encodeURIComponent(lessonSlug);

      const runtimeBefore = await jsonRequest("/api/learning/runtime" + query, sessionToken);
      assert(runtimeBefore.status === 200, "RUNTIME_HTTP_200:" + lessonSlug);
      assert(runtimeBefore.body?.registered === true, "REGISTERED:" + lessonSlug);
      assert(runtimeBefore.body?.configurationReady === true, "CONFIG_READY:" + lessonSlug);
      assert(runtimeBefore.body?.enforcementActive === true, "ENFORCEMENT:" + lessonSlug);
      assert(runtimeBefore.body?.gates?.check?.configured === true, "CHECK_CONFIGURED:" + lessonSlug);
      assert(runtimeBefore.body?.gates?.practice?.configured === true, "PRACTICE_CONFIGURED:" + lessonSlug);
      assert(runtimeBefore.body?.progress?.currentStep === 1, "INITIAL_STEP_ONE:" + lessonSlug);
      assert(runtimeBefore.body?.progress?.completed === false, "INITIAL_NOT_COMPLETED:" + lessonSlug);
      assert(runtimeBefore.body?.interactive?.checks?.length === 3, "SNAPSHOT_THREE_CHECKS:" + lessonSlug);
      assert(runtimeBefore.body?.interactive?.practices?.length === 1, "SNAPSHOT_ONE_PRACTICE:" + lessonSlug);

      const moveToCheck = await setCurrentStep(sessionToken, lessonSlug, 3);
      assert(moveToCheck.status === 200, "STEP3_SAVE_HTTP_200:" + lessonSlug);
      assert(moveToCheck.body?.currentStep === 3, "STEP3_PERSISTED:" + lessonSlug);

      const blockedStep4 = await setCurrentStep(sessionToken, lessonSlug, 4);
      assert(
        blockedStep4.status === 409 && blockedStep4.body?.error === "CHECK_REQUIRED",
        "STEP4_BLOCKED_BY_CHECK:" + lessonSlug
      );

      const interactive = await jsonRequest("/api/learning/interactive" + query, sessionToken);
      assert(interactive.status === 200, "INTERACTIVE_HTTP_200:" + lessonSlug);
      assert(interactive.body?.checks?.length === 3, "THREE_CHECKS:" + lessonSlug);
      assert(interactive.body?.practices?.length === 1, "ONE_PRACTICE:" + lessonSlug);

      const blockedByCheck = await jsonRequest("/api/learning/progress", sessionToken, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: TRACK01_PHASE1_COURSE_SLUG,
          lessonSlug,
          completed: true
        })
      });
      assert(
        blockedByCheck.status === 409 && blockedByCheck.body?.error === "CHECK_REQUIRED",
        "CHECK_GATE_BLOCKS_COMPLETION:" + lessonSlug
      );

      for (const [checkIndex, check] of definition.checks.entries()) {
        const checkState = interactive.body.checks[checkIndex];
        assert(checkState?.id, "CHECK_ID_PRESENT:" + lessonSlug + ":" + checkIndex);
        const answerPayload =
          check.type === "MULTI_SELECT"
            ? { answers: check.correctAnswers }
            : { answer: check.correctAnswers[0] };
        const answered = await jsonRequest(
          "/api/learning/checks/" + encodeURIComponent(checkState.id) + "/answer",
          sessionToken,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(answerPayload)
          }
        );
        assert(answered.status === 200, "CHECK_ANSWER_HTTP_200:" + lessonSlug + ":" + checkIndex);
        assert(answered.body?.correct === true, "CHECK_ANSWER_CORRECT:" + lessonSlug + ":" + checkIndex);
      }

      const moveToPractice = await setCurrentStep(sessionToken, lessonSlug, 4);
      assert(moveToPractice.status === 200, "STEP4_SAVE_HTTP_200:" + lessonSlug);
      assert(moveToPractice.body?.currentStep === 4, "STEP4_PERSISTED:" + lessonSlug);

      const blockedStep5 = await setCurrentStep(sessionToken, lessonSlug, 5);
      assert(
        blockedStep5.status === 409 && blockedStep5.body?.error === "PRACTICE_REQUIRED",
        "STEP5_BLOCKED_BY_PRACTICE:" + lessonSlug
      );

      const blockedByPractice = await jsonRequest("/api/learning/progress", sessionToken, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: TRACK01_PHASE1_COURSE_SLUG,
          lessonSlug,
          completed: true
        })
      });
      assert(
        blockedByPractice.status === 409 && blockedByPractice.body?.error === "PRACTICE_REQUIRED",
        "PRACTICE_GATE_BLOCKS_COMPLETION:" + lessonSlug
      );

      const practiceState = interactive.body.practices[0];
      assert(practiceState?.id === definition.practice.id, "PRACTICE_ID:" + lessonSlug);
      const submitted = await jsonRequest(
        "/api/learning/practices/" + encodeURIComponent(practiceState.id) + "/submissions",
        sessionToken,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content: definition.referenceFill })
        }
      );
      assert(submitted.status === 201, "PRACTICE_SUBMIT_201:" + lessonSlug);
      assert(
        submitted.body?.status === "PASSED" || submitted.body?.evaluation?.passed === true,
        "PRACTICE_PASSED:" + lessonSlug
      );

      const moveToReview = await setCurrentStep(sessionToken, lessonSlug, 5);
      assert(moveToReview.status === 200, "STEP5_SAVE_HTTP_200:" + lessonSlug);
      const moveToCapability = await setCurrentStep(sessionToken, lessonSlug, 6);
      assert(moveToCapability.status === 200, "STEP6_SAVE_HTTP_200:" + lessonSlug);
      assert(moveToCapability.body?.currentStep === 6, "STEP6_PERSISTED:" + lessonSlug);

      const runtimeAfter = await jsonRequest("/api/learning/runtime" + query, sessionToken);
      assert(runtimeAfter.status === 200, "RUNTIME_AFTER_HTTP_200:" + lessonSlug);
      assert(runtimeAfter.body?.gates?.check?.passed === true, "CHECK_GATE_PASS:" + lessonSlug);
      assert(runtimeAfter.body?.gates?.practice?.passed === true, "PRACTICE_GATE_PASS:" + lessonSlug);

      const completed = await jsonRequest("/api/learning/progress", sessionToken, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: TRACK01_PHASE1_COURSE_SLUG,
          lessonSlug,
          completed: true
        })
      });
      assert(completed.status === 200, "COMPLETION_HTTP_200:" + lessonSlug);

      const runtimeLessonId = await getLessonId(lessonSlug);
      const [progress] = await getDatabase()
        .select({ status: lessonProgress.status, currentStep: lessonProgress.currentStep })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, testUser.id),
            eq(lessonProgress.lessonId, runtimeLessonId)
          )
        )
        .limit(1);
      assert(progress?.status === "COMPLETED", "COMPLETION_PERSISTED:" + lessonSlug);
      assert(progress?.currentStep === 6, "COMPLETION_STEP6_PERSISTED:" + lessonSlug);

      const completedRuntime = await jsonRequest("/api/learning/runtime" + query, sessionToken);
      assert(completedRuntime.status === 200, "COMPLETED_RUNTIME_HTTP_200:" + lessonSlug);
      assert(completedRuntime.body?.progress?.completed === true, "COMPLETED_RUNTIME_STATE:" + lessonSlug);
      assert(completedRuntime.body?.progress?.currentStep === 6, "COMPLETED_RUNTIME_STEP6:" + lessonSlug);

      if (index === 0) {
        assert(completedRuntime.body?.canRate === true, "INITIAL_RATING_AVAILABLE");

        const firstRating = await submitHelpfulRating(sessionToken, lessonSlug);
        assert(firstRating.status === 201 || firstRating.status === 200, "FIRST_RATING_STORED");
        const afterFirstRating = await jsonRequest("/api/learning/runtime" + query, sessionToken);
        assert(afterFirstRating.body?.canRate === false, "RATING_HIDES_AFTER_SUBMIT");

        const backToCheck = await setCurrentStep(sessionToken, lessonSlug, 3);
        assert(backToCheck.status === 200, "COMPLETED_REVIEW_STEP3_HTTP_200");
        assert(backToCheck.body?.status === "COMPLETED", "COMPLETION_SURVIVES_RELEARN_ENTRY");
        assert(backToCheck.body?.currentStep === 3, "RELEARN_STEP3_PERSISTED");

        const resetChecks = await jsonRequest("/api/learning/checks/reset", sessionToken, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            courseSlug: TRACK01_PHASE1_COURSE_SLUG,
            lessonSlug
          })
        });
        assert(resetChecks.status === 200, "CHECK_RELEARN_RESET_HTTP_200");

        const afterReset = await jsonRequest("/api/learning/runtime" + query, sessionToken);
        assert(
          afterReset.body?.interactive?.checks?.every((item: any) => item.state == null),
          "CHECK_RELEARN_RESET_CLEARS_CURRENT_STATE"
        );
        assert(afterReset.body?.canRate === false, "RESET_ALONE_DOES_NOT_REOPEN_RATING");

        const firstDefinitionCheck = definition.checks[0];
        const firstRuntimeCheck = interactive.body.checks[0];
        const firstAnswerPayload =
          firstDefinitionCheck.type === "MULTI_SELECT"
            ? { answers: firstDefinitionCheck.correctAnswers }
            : { answer: firstDefinitionCheck.correctAnswers[0] };
        const firstRelearnAnswer = await jsonRequest(
          "/api/learning/checks/" + encodeURIComponent(firstRuntimeCheck.id) + "/answer",
          sessionToken,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(firstAnswerPayload)
          }
        );
        assert(firstRelearnAnswer.status === 200 && firstRelearnAnswer.body?.correct === true, "RELEARN_FIRST_CHECK_PASS");

        const partialRelearn = await jsonRequest("/api/learning/runtime" + query, sessionToken);
        assert(partialRelearn.body?.interactive?.checks?.[0]?.state?.isCorrect === true, "RELEARN_FIRST_STATE_PERSISTED");
        assert(partialRelearn.body?.interactive?.checks?.[1]?.state == null, "RELEARN_SECOND_REMAINS_EMPTY");
        assert(partialRelearn.body?.canRate === true, "CHECK_INTERACTION_REOPENS_RATING");

        const blockedAfterPartialRelearn = await jsonRequest("/api/learning/progress", sessionToken, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            courseSlug: TRACK01_PHASE1_COURSE_SLUG,
            lessonSlug,
            completed: true
          })
        });
        assert(
          blockedAfterPartialRelearn.status === 409 && blockedAfterPartialRelearn.body?.error === "CHECK_REQUIRED",
          "PARTIAL_RELEARN_BLOCKS_NEW_COMPLETION"
        );

        for (let checkIndex = 1; checkIndex < definition.checks.length; checkIndex += 1) {
          const definitionCheck = definition.checks[checkIndex];
          const runtimeCheck = interactive.body.checks[checkIndex];
          const answerPayload =
            definitionCheck.type === "MULTI_SELECT"
              ? { answers: definitionCheck.correctAnswers }
              : { answer: definitionCheck.correctAnswers[0] };
          const answered = await jsonRequest(
            "/api/learning/checks/" + encodeURIComponent(runtimeCheck.id) + "/answer",
            sessionToken,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(answerPayload)
            }
          );
          assert(answered.status === 200 && answered.body?.correct === true, "RELEARN_REMAINING_CHECK_PASS:" + checkIndex);
        }

        const returnToStep6 = await setCurrentStep(sessionToken, lessonSlug, 6);
        assert(returnToStep6.status === 200, "RELEARN_RETURN_STEP6_HTTP_200");
        const secondRating = await submitHelpfulRating(sessionToken, lessonSlug);
        assert(secondRating.status === 201 || secondRating.status === 200, "SECOND_RATING_STORED");
        const afterSecondRating = await jsonRequest("/api/learning/runtime" + query, sessionToken);
        assert(afterSecondRating.body?.canRate === false, "SECOND_RATING_HIDES");

        const backToPractice = await setCurrentStep(sessionToken, lessonSlug, 4);
        assert(backToPractice.status === 200, "REPractice_STEP4_HTTP_200");
        const repractice = await jsonRequest(
          "/api/learning/practices/" + encodeURIComponent(practiceState.id) + "/submissions",
          sessionToken,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ content: definition.referenceFill })
          }
        );
        assert(repractice.status === 201, "REPractice_SUBMIT_201");
        assert(
          repractice.body?.status === "PASSED" || repractice.body?.evaluation?.passed === true,
          "REPractice_PASSED"
        );
        const afterRepractice = await jsonRequest("/api/learning/runtime" + query, sessionToken);
        assert(afterRepractice.body?.canRate === true, "PRACTICE_INTERACTION_REOPENS_RATING");
        assert(afterRepractice.body?.progress?.completed === true, "COMPLETION_SURVIVES_REPractice");

        const finalStep6 = await setCurrentStep(sessionToken, lessonSlug, 6);
        assert(finalStep6.status === 200 && finalStep6.body?.currentStep === 6, "FINAL_STEP6_RESTORED");
      }

      const page = await pageRequest(
        "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug,
        sessionToken
      );
      assert(page.status === 200, "LESSON_PAGE_HTTP_200:" + lessonSlug);
      assert(page.text.includes(definition.lesson.title), "LESSON_PAGE_TITLE:" + lessonSlug);
      assert(page.text.includes("AI 适合做什么"), "APPROVED_REVIEW_PRESENTATION:" + lessonSlug);

      const next = track01Phase1RuntimeDefinitions[index + 1];
      if (next) {
        assert(
          page.text.includes(
            "/courses/" +
              TRACK01_PHASE1_COURSE_SLUG +
              "/lessons/" +
              next.lesson.id
          ),
          "NEXT_LESSON_NAV:" + lessonSlug
        );
      } else {
        assert(
          page.text.includes(
            "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/t1-06-model-and-product"
          ),
          "T1_05_TO_T1_06_NAV"
        );
      }

      console.log(definition.canonicalId + "_RUNTIME_ACCEPTANCE=PASS");
    }

    console.log("TRACK01_PHASE1_COPY_VALUES_ONLY=PASS");
    console.log("TRACK01_PHASE1_CHECK_GATE=PASS");
    console.log("TRACK01_PHASE1_PRACTICE_GATE=PASS");
    console.log("TRACK01_PHASE1_COMPLETION_PERSISTENCE=PASS");
    console.log("TRACK01_PHASE1_CURRENT_STEP_RESUME=PASS");
    console.log("TRACK01_PHASE1_RELEARN_STATE=PASS");
    console.log("TRACK01_PHASE1_REPRACTICE_STATE=PASS");
    console.log("TRACK01_PHASE1_RATING_REOPEN=PASS");
    console.log("TRACK01_PHASE1_NAVIGATION=PASS");
  } finally {
    await getDatabase().delete(users).where(eq(users.id, testUser.id));

    const [leftover] = await getDatabase()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, testUser.id))
      .limit(1);
    if (leftover) throw new Error("ACCEPTANCE_TEST_USER_CLEANUP_FAILED");
    console.log("TEST_DATA_CLEANUP=PASS");
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
