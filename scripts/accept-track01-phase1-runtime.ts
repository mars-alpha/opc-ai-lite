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
        .select({ status: lessonProgress.status })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, testUser.id),
            eq(lessonProgress.lessonId, runtimeLessonId)
          )
        )
        .limit(1);
      assert(progress?.status === "COMPLETED", "COMPLETION_PERSISTED:" + lessonSlug);

      const page = await pageRequest(
        "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + lessonSlug,
        sessionToken
      );
      assert(page.status === 200, "LESSON_PAGE_HTTP_200:" + lessonSlug);
      assert(page.text.includes(definition.lesson.title), "LESSON_PAGE_TITLE:" + lessonSlug);
      assert(page.text.includes("AI 适合做什么"), "APPROVED_REVIEW_PRESENTATION:" + lessonSlug);
      assert(page.text.includes("放进你的 AI 软件试一下"), "COPY_TO_AI_PRESENTATION:" + lessonSlug);

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
        assert(page.text.includes("本阶段课程完成"), "FINAL_LESSON_NAV");
      }

      console.log(definition.canonicalId + "_RUNTIME_ACCEPTANCE=PASS");
    }

    console.log("TRACK01_PHASE1_COPY_VALUES_ONLY=PASS");
    console.log("TRACK01_PHASE1_CHECK_GATE=PASS");
    console.log("TRACK01_PHASE1_PRACTICE_GATE=PASS");
    console.log("TRACK01_PHASE1_COMPLETION_PERSISTENCE=PASS");
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
