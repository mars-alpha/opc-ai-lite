import "server-only";

import { and, asc, eq, lte, sql } from "drizzle-orm";
import { getDatabase } from "./db";
import { backgroundJobs } from "./db/schema";

export type LearningBehaviorSignal = "CHECK" | "PRACTICE" | "HELPFULNESS";

export function isBackgroundJobsUnavailable(error: unknown) {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (typeof current === "object") {
      const value = current as { code?: unknown; message?: unknown; cause?: unknown };
      if (value.code === "42P01") return true;
      if (typeof value.message === "string" && value.message.includes("background_jobs")) {
        return true;
      }
      current = value.cause;
      continue;
    }
    break;
  }
  return false;
}

type LearningBehaviorPayload = {
  lessonId: string;
  signal: LearningBehaviorSignal;
};

function isLearningBehaviorPayload(value: unknown): value is LearningBehaviorPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.lessonId === "string" &&
    (payload.signal === "CHECK" ||
      payload.signal === "PRACTICE" ||
      payload.signal === "HELPFULNESS")
  );
}

export async function enqueueLearningBehaviorRefresh(
  lessonId: string,
  signal: LearningBehaviorSignal
) {
  const db = getDatabase();
  const now = new Date();
  const dedupeKey = `behavior:${lessonId}:${signal}`;
  await db
    .insert(backgroundJobs)
    .values({
      jobType: "LEARNING_BEHAVIOR_REFRESH",
      dedupeKey,
      payload: { lessonId, signal },
      status: "PENDING",
      attempts: 0,
      availableAt: now,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: backgroundJobs.dedupeKey,
      set: {
        payload: { lessonId, signal },
        status: "PENDING",
        availableAt: now,
        completedAt: null,
        lastError: null,
        updatedAt: now
      }
    });
  return { queued: true, dedupeKey };
}

export async function claimLearningBehaviorJobs(limit = 20) {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(backgroundJobs)
    .where(
      and(
        eq(backgroundJobs.jobType, "LEARNING_BEHAVIOR_REFRESH"),
        eq(backgroundJobs.status, "PENDING"),
        lte(backgroundJobs.availableAt, new Date())
      )
    )
    .orderBy(asc(backgroundJobs.createdAt))
    .limit(Math.max(1, Math.min(limit, 100)));

  const claimed: Array<{ id: string; payload: LearningBehaviorPayload }> = [];
  for (const row of rows) {
    if (!isLearningBehaviorPayload(row.payload)) {
      await db
        .update(backgroundJobs)
        .set({
          status: "FAILED",
          lastError: "INVALID_LEARNING_BEHAVIOR_PAYLOAD",
          updatedAt: new Date()
        })
        .where(eq(backgroundJobs.id, row.id));
      continue;
    }
    const [locked] = await db
      .update(backgroundJobs)
      .set({
        status: "PROCESSING",
        attempts: sql`${backgroundJobs.attempts} + 1`,
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(backgroundJobs.id, row.id), eq(backgroundJobs.status, "PENDING")))
      .returning({ id: backgroundJobs.id });
    if (locked) claimed.push({ id: row.id, payload: row.payload });
  }
  return claimed;
}

export async function completeBackgroundJob(id: string) {
  await getDatabase()
    .update(backgroundJobs)
    .set({
      status: "DONE",
      completedAt: new Date(),
      lastError: null,
      updatedAt: new Date()
    })
    .where(eq(backgroundJobs.id, id));
}

export async function failBackgroundJob(id: string, error: unknown) {
  const message = error instanceof Error ? error.message : "BACKGROUND_JOB_FAILED";
  await getDatabase()
    .update(backgroundJobs)
    .set({
      status: "PENDING",
      availableAt: new Date(Date.now() + 60_000),
      lastError: message.slice(0, 2000),
      updatedAt: new Date()
    })
    .where(eq(backgroundJobs.id, id));
}
