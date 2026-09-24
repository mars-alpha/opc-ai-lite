import { loadEnvConfig } from "@next/env";
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

import { courses, getAllLessons } from "../lib/courses";
import {
  memoryRagCheckSeed,
  taskDecompositionPracticeSeed,
  taskDecompositionRuntimeFixture
} from "../lib/learning/lesson-runtime-samples";
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
const CONFIRM = process.argv.includes("--confirm=LEARNING-RUNTIME-001-A");
const BASE_URL =
  process.argv
    .find((item) => item.startsWith("--base-url="))
    ?.slice("--base-url=".length) || "http://127.0.0.1:3001";

function trace(message: string) {
  console.log("[LEARNING-RUNTIME-001-A] " + message);
}

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ACCEPTANCE_FAILED:" + code);
}

async function getLessonId(courseSlug: string, lessonSlug: string) {
  const [row] = await getDatabase()
    .select({ lessonId: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(
      and(
        eq(stages.slug, courseSlug),
        eq(lessons.slug, lessonSlug),
        eq(lessons.status, "PUBLISHED")
      )
    )
    .limit(1);

  if (!row) throw new Error("ACCEPTANCE_LESSON_NOT_FOUND:" + courseSlug + "/" + lessonSlug);
  return row.lessonId;
}

async function completePriorStagesForTestUser(userId: string, targetCourseSlug: string) {
  const targetIndex = courses.findIndex((course) => course.slug === targetCourseSlug);
  if (targetIndex < 0) throw new Error("ACCEPTANCE_COURSE_NOT_FOUND:" + targetCourseSlug);

  const now = new Date();

  for (const course of courses.slice(0, targetIndex)) {
    for (const lesson of getAllLessons(course)) {
      const lessonId = await getLessonId(course.slug, lesson.id);
      await getDatabase()
        .insert(lessonProgress)
        .values({
          userId,
          lessonId,
          status: "COMPLETED",
          startedAt: now,
          completedAt: now,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: [lessonProgress.userId, lessonProgress.lessonId],
          set: {
            status: "COMPLETED",
            startedAt: now,
            completedAt: now,
            updatedAt: now
          }
        });
    }
  }
}

async function jsonRequest(
  path: string,
  sessionToken: string | null,
  init: RequestInit = {}
) {
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

async function main() {  trace("start");

  if (!RUN || !CONFIRM) {
    throw new Error(
      "CONFIRMATION_REQUIRED: use --run --confirm=LEARNING-RUNTIME-001-A"
    );
  }

  const sessionToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
  const identity = "learning-runtime-001-a-" + Date.now() + "@example.test";

  const [testUser] = await getDatabase()
    .insert(users)
    .values({ displayName: "__LEARNING_RUNTIME_001_A_ACCEPTANCE__" })
    .returning({ id: users.id });

  trace("test user created");

  assert(testUser?.id, "TEST_USER_CREATE");

  try {
    await getDatabase().insert(userIdentities).values({
      userId: testUser.id,
      provider: "EMAIL",
      providerUserId: identity
    });

    trace("identity created");

    await getDatabase().insert(sessions).values({
      userId: testUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    trace("session created, requesting memory runtime");

    const memoryBefore = await jsonRequest(
      "/api/learning/runtime?courseSlug=ai-literacy&lessonSlug=memory-rag",
      sessionToken
    );
    trace("memory runtime response received");
    assert(memoryBefore.status === 200, "MEMORY_RUNTIME_HTTP_200");
    assert(memoryBefore.body?.registered === true, "MEMORY_REGISTERED");
    assert(memoryBefore.body?.configurationReady === true, "MEMORY_CONFIGURATION_READY");
    assert(memoryBefore.body?.enforcementActive === true, "MEMORY_ENFORCEMENT_ACTIVE");
    assert(memoryBefore.body?.gates?.check?.configured === true, "MEMORY_CHECK_CONFIGURED");
    assert(memoryBefore.body?.gates?.check?.passed === false, "MEMORY_CHECK_INITIAL_FALSE");

    const memoryBlocked = await jsonRequest(
      "/api/learning/progress",
      sessionToken,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: "ai-literacy",
          lessonSlug: "memory-rag",
          completed: true
        })
      }
    );
    assert(
      memoryBlocked.status === 409 && memoryBlocked.body?.error === "CHECK_REQUIRED",
      "MEMORY_COMPLETION_BLOCKED"
    );

    const check = await jsonRequest(
      "/api/learning/checks/" + memoryRagCheckSeed.id + "/answer",
      sessionToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer: memoryRagCheckSeed.correctAnswer })
      }
    );
    assert(check.status === 200 && check.body?.correct === true, "MEMORY_CHECK_PASS");

    const memoryAfterCheck = await jsonRequest(
      "/api/learning/runtime?courseSlug=ai-literacy&lessonSlug=memory-rag",
      sessionToken
    );
    assert(
      memoryAfterCheck.status === 200 &&
        memoryAfterCheck.body?.gates?.check?.passed === true,
      "MEMORY_CHECK_GATE_PASS"
    );

    const memoryComplete = await jsonRequest(
      "/api/learning/progress",
      sessionToken,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: "ai-literacy",
          lessonSlug: "memory-rag",
          completed: true
        })
      }
    );
    assert(memoryComplete.status === 200 && memoryComplete.body?.ok === true, "MEMORY_COMPLETE");

    await completePriorStagesForTestUser(testUser.id, "ai-workflow");

    const workflowBefore = await jsonRequest(
      "/api/learning/runtime?courseSlug=ai-workflow&lessonSlug=task-decomposition",
      sessionToken
    );
    assert(workflowBefore.status === 200, "WORKFLOW_RUNTIME_HTTP_200");
    assert(workflowBefore.body?.registered === true, "WORKFLOW_REGISTERED");
    assert(workflowBefore.body?.configurationReady === true, "WORKFLOW_CONFIGURATION_READY");
    assert(workflowBefore.body?.enforcementActive === true, "WORKFLOW_ENFORCEMENT_ACTIVE");
    assert(
      workflowBefore.body?.gates?.practice?.configured === true,
      "WORKFLOW_PRACTICE_CONFIGURED"
    );
    assert(
      workflowBefore.body?.gates?.practice?.passed === false,
      "WORKFLOW_PRACTICE_INITIAL_FALSE"
    );

    const workflowBlocked = await jsonRequest(
      "/api/learning/progress",
      sessionToken,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: "ai-workflow",
          lessonSlug: "task-decomposition",
          completed: true
        })
      }
    );
    assert(
      workflowBlocked.status === 409 &&
        workflowBlocked.body?.error === "PRACTICE_REQUIRED",
      "WORKFLOW_COMPLETION_BLOCKED"
    );

    const practice = await jsonRequest(
      "/api/learning/practices/" +
        taskDecompositionPracticeSeed.id +
        "/submissions",
      sessionToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: taskDecompositionRuntimeFixture.content })
      }
    );
    assert(practice.status === 201, "WORKFLOW_PRACTICE_HTTP_201");
    assert(practice.body?.status === "PASSED", "WORKFLOW_PRACTICE_STATUS_PASS");
    assert(practice.body?.evaluation?.passed === true, "WORKFLOW_EVALUATION_PASS");

    const workflowAfterPractice = await jsonRequest(
      "/api/learning/runtime?courseSlug=ai-workflow&lessonSlug=task-decomposition",
      sessionToken
    );
    assert(
      workflowAfterPractice.status === 200 &&
        workflowAfterPractice.body?.gates?.practice?.passed === true,
      "WORKFLOW_PRACTICE_GATE_PASS"
    );

    const workflowComplete = await jsonRequest(
      "/api/learning/progress",
      sessionToken,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug: "ai-workflow",
          lessonSlug: "task-decomposition",
          completed: true
        })
      }
    );
    assert(
      workflowComplete.status === 200 && workflowComplete.body?.ok === true,
      "WORKFLOW_COMPLETE"
    );

    const writing = await jsonRequest(
      "/api/learning/runtime?courseSlug=chatgpt-worker&lessonSlug=writing-files",
      sessionToken
    );
    assert(writing.status === 200, "WRITING_RUNTIME_HTTP_200");
    assert(writing.body?.registered === false, "WRITING_STILL_UNREGISTERED");

    const anonymousWorkflow = await jsonRequest(
      "/api/learning/runtime?courseSlug=ai-workflow&lessonSlug=task-decomposition",
      null
    );
    assert(
      anonymousWorkflow.status === 403 &&
        anonymousWorkflow.body?.error === "STAGE_PREREQUISITE_REQUIRED",
      "WORKFLOW_ANONYMOUS_ACCESS_GATED"
    );

    const referencePreview = await jsonRequest(
      "/api/learning/interactive?courseSlug=chatgpt-worker&lessonSlug=task-brief",
      null
    );
    assert(referencePreview.status === 200, "TASK_BRIEF_PREVIEW_HTTP_200");
    assert(
      Array.isArray(referencePreview.body?.checks) &&
        referencePreview.body.checks.length > 0,
      "TASK_BRIEF_PREVIEW_CHECK"
    );
    assert(
      Array.isArray(referencePreview.body?.practices) &&
        referencePreview.body.practices.length > 0,
      "TASK_BRIEF_PREVIEW_PRACTICE"
    );

    const memoryLessonId = await getLessonId("ai-literacy", "memory-rag");
    const workflowLessonId = await getLessonId("ai-workflow", "task-decomposition");
    const completedRows = await getDatabase()
      .select({ lessonId: lessonProgress.lessonId, status: lessonProgress.status })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, testUser.id));

    assert(
      completedRows.some(
        (row) => row.lessonId === memoryLessonId && row.status === "COMPLETED"
      ),
      "MEMORY_COMPLETION_PERSISTED"
    );
    assert(
      completedRows.some(
        (row) => row.lessonId === workflowLessonId && row.status === "COMPLETED"
      ),
      "WORKFLOW_COMPLETION_PERSISTED"
    );

    console.log("MEMORY_RUNTIME_ACCEPTANCE=PASS");
    console.log("MEMORY_CHECK_GATE=PASS");
    console.log("WORKFLOW_RUNTIME_ACCEPTANCE=PASS");
    console.log("WORKFLOW_PRACTICE_GATE=PASS");
    console.log("STRUCTURED_TEXT_V1_REMOTE=PASS");
    console.log("TASK_BRIEF_REFERENCE_COMPAT=PASS");
    console.log("ACCESS_BOUNDARY=PASS");
    console.log("WRITING_ARTIFACT_BOUNDARY=PASS");
  } finally {
    await getDatabase().delete(users).where(eq(users.id, testUser.id));

    const [leftover] = await getDatabase()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, testUser.id))
      .limit(1);

    if (leftover) {
      throw new Error("ACCEPTANCE_TEST_USER_CLEANUP_FAILED");
    }
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

