import { loadEnvConfig } from "@next/env";
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

import { getAllLessons } from "../lib/courses";
import {
  TRACK01_PHASE1_COURSE_SLUG,
  getTrack01Phase1RuntimePresentation,
  track01Phase1Course,
  track01T111T120RuntimeDefinitions
} from "../lib/learning/track01-phase1-runtime";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { lessonProgress, lessons, modules, sessions, stages, userIdentities, users } from "../lib/server/db/schema";

const RUN = process.argv.includes("--run");
const CONFIRM = process.argv.includes("--confirm=TRACK01-T11-T20-RUNTIME-002");
const BASE_URL =
  process.argv.find((item) => item.startsWith("--base-url="))?.slice("--base-url=".length) ||
  "http://127.0.0.1:3110";

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
    body: JSON.stringify({ courseSlug: TRACK01_PHASE1_COURSE_SLUG, lessonSlug, currentStep })
  });
}

async function markCompleted(userId: string, lessonSlug: string) {
  const lessonId = await getLessonId(lessonSlug);
  const now = new Date();
  await getDatabase()
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      status: "COMPLETED",
      currentStep: 6,
      startedAt: now,
      completedAt: now,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { status: "COMPLETED", currentStep: 6, completedAt: now, updatedAt: now }
    });
}

async function main() {
  if (!RUN || !CONFIRM) {
    throw new Error("CONFIRMATION_REQUIRED: use --run --confirm=TRACK01-T11-T20-RUNTIME-002");
  }

  const sessionToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
  const identity = "track01-t111-t120-runtime-" + Date.now() + "@example.test";
  const [testUser] = await getDatabase()
    .insert(users)
    .values({ displayName: "__TRACK01_T111_T120_RUNTIME_ACCEPTANCE__" })
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

    for (const lesson of getAllLessons(track01Phase1Course).slice(0, 10)) {
      await markCompleted(testUser.id, lesson.id);
    }

    for (const definition of track01T111T120RuntimeDefinitions) {
      const slug = definition.lesson.id;
      const spec = getLessonSpec(TRACK01_PHASE1_COURSE_SLUG, slug);
      assert(spec, "SPEC_REGISTERED:" + slug);
      assert(spec.steps.length === 6, "SIX_STEP_SPEC:" + slug);

      const presentation = getTrack01Phase1RuntimePresentation(TRACK01_PHASE1_COURSE_SLUG, slug);
      assert(presentation, "PRESENTATION:" + slug);
      assert(presentation.checkSequence.length === 3, "PRESENTATION_THREE_CHECKS:" + slug);
      assert(presentation.practice !== null, "PRESENTATION_PRACTICE:" + slug);

      const query =
        "?courseSlug=" + encodeURIComponent(TRACK01_PHASE1_COURSE_SLUG) +
        "&lessonSlug=" + encodeURIComponent(slug);
      const runtimeBefore = await jsonRequest("/api/learning/runtime" + query, sessionToken);
      assert(runtimeBefore.status === 200, "RUNTIME_HTTP_200:" + slug);
      assert(runtimeBefore.body?.registered === true, "REGISTERED:" + slug);
      assert(runtimeBefore.body?.configurationReady === true, "CONFIG_READY:" + slug);
      assert(runtimeBefore.body?.enforcementActive === true, "ENFORCEMENT:" + slug);
      assert(runtimeBefore.body?.blockers?.length === 0, "NO_BLOCKERS:" + slug);
      assert(runtimeBefore.body?.interactive?.checks?.length === 3, "THREE_CHECKS:" + slug);
      assert(runtimeBefore.body?.interactive?.practices?.length === 1, "ONE_PRACTICE:" + slug);

      const practiceRequired = definition.spec.lessonType === "APPLICATION";
      assert(runtimeBefore.body?.plan?.requiresPractice === practiceRequired, "PRACTICE_GATE_PLAN:" + slug);
      assert(runtimeBefore.body?.gates?.practice?.configured === practiceRequired, "PRACTICE_GATE_CONFIG:" + slug);

      const moveToCheck = await setCurrentStep(sessionToken, slug, 3);
      assert(moveToCheck.status === 200 && moveToCheck.body?.currentStep === 3, "STEP3:" + slug);

      const blockedStep4 = await setCurrentStep(sessionToken, slug, 4);
      assert(blockedStep4.status === 409 && blockedStep4.body?.error === "CHECK_REQUIRED", "CHECK_BLOCKS_STEP4:" + slug);

      const interactive = await jsonRequest("/api/learning/interactive" + query, sessionToken);
      assert(interactive.status === 200, "INTERACTIVE_HTTP_200:" + slug);

      for (const [index, check] of definition.checks.entries()) {
        const runtimeCheck = interactive.body?.checks?.[index];
        assert(runtimeCheck?.id, "CHECK_ID:" + slug + ":" + index);
        const payload =
          check.type === "MULTI_SELECT"
            ? { answers: check.correctAnswers }
            : { answer: check.correctAnswers[0] };
        const answered = await jsonRequest(
          "/api/learning/checks/" + encodeURIComponent(runtimeCheck.id) + "/answer",
          sessionToken,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          }
        );
        if (answered.status !== 200 || answered.body?.correct !== true) {
          console.error("CHECK_DEBUG=" + JSON.stringify({ slug, index, definition: check, runtimeCheck, payload, answered }));
        }
        assert(answered.status === 200 && answered.body?.correct === true, "CHECK_PASS:" + slug + ":" + index);
      }

      const moveToPractice = await setCurrentStep(sessionToken, slug, 4);
      assert(moveToPractice.status === 200 && moveToPractice.body?.currentStep === 4, "STEP4:" + slug);

      if (practiceRequired) {
        const blockedStep5 = await setCurrentStep(sessionToken, slug, 5);
        assert(
          blockedStep5.status === 409 && blockedStep5.body?.error === "PRACTICE_REQUIRED",
          "PRACTICE_BLOCKS_STEP5:" + slug
        );
      }

      const runtimePractice = interactive.body?.practices?.[0];
      assert(runtimePractice?.id, "PRACTICE_ID:" + slug);
      const submitted = await jsonRequest(
        "/api/learning/practices/" + encodeURIComponent(runtimePractice.id) + "/submissions",
        sessionToken,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content: definition.referenceFill })
        }
      );
      assert(submitted.status === 201, "PRACTICE_SUBMIT_201:" + slug);
      assert(submitted.body?.evaluation?.passed === true, "PRACTICE_PASS:" + slug);

      const step5 = await setCurrentStep(sessionToken, slug, 5);
      assert(step5.status === 200 && step5.body?.currentStep === 5, "STEP5:" + slug);
      const step6 = await setCurrentStep(sessionToken, slug, 6);
      assert(step6.status === 200 && step6.body?.currentStep === 6, "STEP6:" + slug);

      const completed = await jsonRequest("/api/learning/progress", sessionToken, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: TRACK01_PHASE1_COURSE_SLUG,
          lessonSlug: slug,
          completed: true
        })
      });
      assert(completed.status === 200, "COMPLETION:" + slug);

      const page = await pageRequest(
        "/courses/" + TRACK01_PHASE1_COURSE_SLUG + "/lessons/" + slug,
        sessionToken
      );
      assert(page.status === 200, "PAGE_HTTP_200:" + slug);
      assert(page.text.includes(definition.lesson.title), "PAGE_TITLE:" + slug);

      console.log(definition.canonicalId.replace("-", "_") + "_RUNTIME_ACCEPTANCE=PASS");
    }

    console.log("T1_11_T1_20_LESSON_SPEC_REGISTRY=PASS");
    console.log("T1_11_T1_20_RUNTIME_PROVISIONED=PASS");
    console.log("T1_11_T1_20_RUNTIME_API=PASS");
    console.log("T1_11_T1_20_CHECK_PRACTICE_GATES=PASS");
    console.log("T1_11_T1_20_PAGE_RENDERING=PASS");
    console.log("T1_11_T1_20_RUNTIME_ACCEPTANCE=PASS");
  } finally {
    await getDatabase().delete(users).where(eq(users.id, testUser.id));
    const [leftover] = await getDatabase()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, testUser.id))
      .limit(1);
    if (leftover) throw new Error("ACCEPTANCE_TEST_USER_CLEANUP_FAILED");
    console.log("T1_11_T1_20_TEST_DATA_CLEANUP=PASS");
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
