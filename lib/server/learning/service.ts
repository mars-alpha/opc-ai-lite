import "server-only";

import { and, eq } from "drizzle-orm";
import type { LearningStateResponse } from "../../learning/contracts";
import { isRealAiEvidenceRuntimeSupported } from "../../learning/lesson-runtime";
import { getLessonSpec } from "../../learning/lesson-spec-registry";
import { getDatabase } from "../db";
import {
  courseEnrollments,
  lessonProgress,
  lessons,
  modules,
  stages
} from "../db/schema";
import { getLessonAccess, getStageAccess } from "../entitlements/service";
import {
  getRequiredCheckGateState,
  getRequiredPracticeGateState
} from "../interactive/service";
import { recordLearningEvent } from "../learning-insights/service";
import { hasRequiredRealAiEvidence } from "../lesson-runtime/service";

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
        lessonSlug: lessons.slug,
        status: lessonProgress.status,
        currentStep: lessonProgress.currentStep
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(stages, eq(modules.stageId, stages.id))
      .where(eq(lessonProgress.userId, userId))
  ]);

  const completed: Record<string, string[]> = {};
  const statusByCourse: Record<string, Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">> = {};
  const currentStepByCourse: Record<string, Record<string, number>> = {};
  for (const row of progressRows) {
    statusByCourse[row.courseSlug] ??= {};
    statusByCourse[row.courseSlug][row.lessonSlug] = row.status;
    currentStepByCourse[row.courseSlug] ??= {};
    currentStepByCourse[row.courseSlug][row.lessonSlug] = row.currentStep;
    if (row.status === "COMPLETED") {
      completed[row.courseSlug] ??= [];
      completed[row.courseSlug].push(row.lessonSlug);
    }
  }

  return {
    enrolledCourses: enrollmentRows.map((row) => row.courseSlug),
    completed,
    statusByCourse,
    currentStepByCourse
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

  const now = new Date();
  await db
    .insert(courseEnrollments)
    .values({ userId, stageId: stage.id, status: "ACTIVE" })
    .onConflictDoUpdate({
      target: [courseEnrollments.userId, courseEnrollments.stageId],
      set: { status: "ACTIVE", updatedAt: now }
    });
}

async function getPublishedLearningLesson(courseSlug: string, lessonSlug: string) {
  const [lesson] = await getDatabase()
    .select({ id: lessons.id, stageId: stages.id })
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

  if (!lesson) throw new Error("LESSON_NOT_FOUND");
  return lesson;
}

export async function getLessonProgressRuntimeState(
  userId: string | null,
  courseSlug: string,
  lessonSlug: string,
  resolvedLessonId?: string
) {
  const lesson = resolvedLessonId
    ? { id: resolvedLessonId }
    : await getPublishedLearningLesson(courseSlug, lessonSlug);

  if (!userId) {
    return {
      lessonId: lesson.id,
      currentStep: 1,
      completed: false,
      status: "NOT_STARTED" as const
    };
  }

  const [progress] = await getDatabase()
    .select({
      currentStep: lessonProgress.currentStep,
      status: lessonProgress.status
    })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lesson.id)
      )
    )
    .limit(1);

  return {
    lessonId: lesson.id,
    currentStep: progress?.currentStep ?? 1,
    completed: progress?.status === "COMPLETED",
    status: progress?.status ?? ("NOT_STARTED" as const)
  };
}

export async function setLessonCurrentStep(
  userId: string,
  input: { courseSlug: string; lessonSlug: string; currentStep: number }
) {
  if (
    !Number.isInteger(input.currentStep) ||
    input.currentStep < 1 ||
    input.currentStep > 6
  ) {
    throw new Error("INVALID_CURRENT_STEP");
  }

  const [access, lesson] = await Promise.all([
    getLessonAccess(userId, input.courseSlug, input.lessonSlug),
    getPublishedLearningLesson(input.courseSlug, input.lessonSlug)
  ]);

  if (!access.allowed) {
    throw new Error(
      access.reason === "PREREQUISITE_STAGE_REQUIRED"
        ? "STAGE_PREREQUISITE_REQUIRED"
        : "LESSON_LOCKED"
    );
  }

  const db = getDatabase();
  const [existing] = await db
    .select({
      status: lessonProgress.status,
      startedAt: lessonProgress.startedAt,
      completedAt: lessonProgress.completedAt
    })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lesson.id)
      )
    )
    .limit(1);

  const now = new Date();
  const status =
    existing?.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";

  await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId: lesson.id,
      status,
      currentStep: input.currentStep,
      startedAt: existing?.startedAt ?? now,
      completedAt: existing?.completedAt ?? null,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        status,
        currentStep: input.currentStep,
        startedAt: existing?.startedAt ?? now,
        completedAt: existing?.completedAt ?? null,
        updatedAt: now
      }
    });

  return getLessonProgressRuntimeState(
    userId,
    input.courseSlug,
    input.lessonSlug,
    lesson.id
  );
}

export async function setLessonCompletion(
  userId: string,
  input: {
    courseSlug: string;
    lessonSlug: string;
    completed: boolean;
  }
) {
  const [access, lesson] = await Promise.all([
    getLessonAccess(userId, input.courseSlug, input.lessonSlug),
    getPublishedLearningLesson(input.courseSlug, input.lessonSlug)
  ]);

  if (!access.allowed) {
    throw new Error(
      access.reason === "PREREQUISITE_STAGE_REQUIRED"
        ? "STAGE_PREREQUISITE_REQUIRED"
        : "LESSON_LOCKED"
    );
  }

  const db = getDatabase();

  if (input.completed) {
    const spec = getLessonSpec(input.courseSlug, input.lessonSlug);
    const [checkGate, practiceGate] = await Promise.all([
      getRequiredCheckGateState(userId, lesson.id),
      getRequiredPracticeGateState(userId, lesson.id)
    ]);

    const specRuntimeReady =
      !spec ||
      ((!spec.completionGates.includes("CHECK") || checkGate.configured) &&
        (!spec.completionGates.includes("PRACTICE") ||
          practiceGate.configured) &&
        (!spec.completionGates.includes("REAL_AI") ||
          isRealAiEvidenceRuntimeSupported(spec.realAiEvidence)));

    if (spec && specRuntimeReady) {
      if (
        spec.completionGates.includes("CHECK") &&
        !checkGate.passed
      ) {
        throw new Error("CHECK_REQUIRED");
      }
      if (
        spec.completionGates.includes("PRACTICE") &&
        !practiceGate.passed
      ) {
        throw new Error("PRACTICE_REQUIRED");
      }
      if (
        spec.completionGates.includes("REAL_AI") &&
        !(await hasRequiredRealAiEvidence(
          userId,
          input.courseSlug,
          input.lessonSlug,
          lesson.id
        ))
      ) {
        throw new Error("REAL_AI_REQUIRED");
      }
    } else {
      if (checkGate.configured && !checkGate.passed) {
        throw new Error("CHECK_REQUIRED");
      }
      if (practiceGate.configured && !practiceGate.passed) {
        throw new Error("PRACTICE_REQUIRED");
      }
    }
  }

  const now = new Date();
  await Promise.all([
    db
      .insert(courseEnrollments)
      .values({ userId, stageId: lesson.stageId, status: "ACTIVE" })
      .onConflictDoUpdate({
        target: [courseEnrollments.userId, courseEnrollments.stageId],
        set: { status: "ACTIVE", updatedAt: now }
      }),
    db
      .insert(lessonProgress)
      .values({
        userId,
        lessonId: lesson.id,
        status: input.completed ? "COMPLETED" : "NOT_STARTED",
        currentStep: input.completed ? 6 : 1,
        startedAt: input.completed ? now : null,
        completedAt: input.completed ? now : null,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          status: input.completed ? "COMPLETED" : "NOT_STARTED",
          currentStep: input.completed ? 6 : 1,
          startedAt: input.completed ? now : null,
          completedAt: input.completed ? now : null,
          updatedAt: now
        }
      })
  ]);

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

  return {
    lessonId: lesson.id,
    completed: input.completed,
    completedAt: input.completed ? now.toISOString() : null
  };
}
