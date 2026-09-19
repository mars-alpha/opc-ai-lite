import "server-only";

import { and, eq, sql } from "drizzle-orm";
import type { LearningStateResponse } from "../../learning/contracts";
import { getDatabase } from "../db";
import {
  courseEnrollments,
  lessonProgress,
  lessons,
  modules,
  stages
} from "../db/schema";
import { getLessonAccess, getStageAccess } from "../entitlements/service";
import { hasPassedRequiredPractices } from "../interactive/service";
import { recordLearningEvent } from "../learning-insights/service";

export async function getLearningState(userId: string): Promise<LearningStateResponse> {
  const db = getDatabase();

  const [enrollmentRows, progressRows] = await Promise.all([
    db
      .select({ courseSlug: stages.slug })
      .from(courseEnrollments)
      .innerJoin(stages, eq(courseEnrollments.stageId, stages.id))
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.status, "ACTIVE")
        )
      ),
    db
      .select({
        courseSlug: stages.slug,
        lessonSlug: lessons.slug
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(stages, eq(modules.stageId, stages.id))
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.status, "COMPLETED")
        )
      )
  ]);
  const completed: Record<string, string[]> = {};
  for (const row of progressRows) {
    completed[row.courseSlug] ??= [];
    completed[row.courseSlug].push(row.lessonSlug);
  }

  return {
    enrolledCourses: enrollmentRows.map((row) => row.courseSlug),
    completed
  };
}

export async function enrollInCourse(userId: string, courseSlug: string) {
  const db = getDatabase();

  const stageAccess = await getStageAccess(userId, courseSlug);
  if (!stageAccess.allowed) throw new Error("STAGE_PREREQUISITE_REQUIRED");

  const [stage] = await db
    .select({ id: stages.id })
    .from(stages)
    .where(and(eq(stages.slug, courseSlug), eq(stages.status, "PUBLISHED")))
    .limit(1);

  if (!stage) throw new Error("COURSE_NOT_FOUND");

  await db
    .insert(courseEnrollments)
    .values({ userId, stageId: stage.id, status: "ACTIVE" })
    .onConflictDoUpdate({
      target: [courseEnrollments.userId, courseEnrollments.stageId],
      set: { status: "ACTIVE", updatedAt: sql`now()` }
    });
}

export async function setLessonCompletion(
  userId: string,
  input: {
    courseSlug: string;
    lessonSlug: string;
    completed: boolean;
  }
) {
  const access = await getLessonAccess(
    userId,
    input.courseSlug,
    input.lessonSlug
  );

  if (!access.allowed) {
    throw new Error(
      access.reason === "PREREQUISITE_STAGE_REQUIRED"
        ? "STAGE_PREREQUISITE_REQUIRED"
        : "LESSON_LOCKED"
    );
  }

  const db = getDatabase();

  const [lesson] = await db
    .select({ id: lessons.id, stageId: stages.id })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(
      and(
        eq(stages.slug, input.courseSlug),
        eq(lessons.slug, input.lessonSlug),
        eq(lessons.status, "PUBLISHED")
      )
    )
    .limit(1);

  if (!lesson) throw new Error("LESSON_NOT_FOUND");

  if (
    input.completed &&
    !(await hasPassedRequiredPractices(userId, lesson.id))
  ) {
    throw new Error("PRACTICE_REQUIRED");
  }

  await db
    .insert(courseEnrollments)
    .values({ userId, stageId: lesson.stageId, status: "ACTIVE" })
    .onConflictDoUpdate({
      target: [courseEnrollments.userId, courseEnrollments.stageId],
      set: { status: "ACTIVE", updatedAt: sql`now()` }
    });

  const now = new Date();
  await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId: lesson.id,
      status: input.completed ? "COMPLETED" : "NOT_STARTED",
      startedAt: input.completed ? now : null,
      completedAt: input.completed ? now : null,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        status: input.completed ? "COMPLETED" : "NOT_STARTED",
        startedAt: input.completed ? now : null,
        completedAt: input.completed ? now : null,
        updatedAt: now
      }
    });

  if (input.completed) {
    await recordLearningEvent({
      userId,
      lessonId: lesson.id,
      eventName: "lesson_completed",
      targetType: "LESSON",
      targetId: lesson.id,
      properties: { courseSlug: input.courseSlug }
    });
  }
}







