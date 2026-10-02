import "server-only";

import { inArray, sql } from "drizzle-orm";
import { courses } from "../../courses";
import { formalLessonSpecs } from "../../learning/lesson-spec-registry";
import { getDatabase } from "../db";
import { lessons, modules, stages } from "../db/schema";

const FORMAL_KEYS = new Set(
  formalLessonSpecs.map((spec) => spec.courseSlug + "/" + spec.lessonId)
);

export function formalRuntimeStageId(courseSlug: string) {
  return "stage_" + courseSlug.replace(/-/g, "_");
}

export function formalRuntimeModuleId(courseSlug: string, moduleSlug: string) {
  return "module_" + courseSlug.replace(/-/g, "_") + "_" + moduleSlug.replace(/-/g, "_");
}

export function formalRuntimeLessonId(courseSlug: string, lessonSlug: string) {
  return "lesson_" + courseSlug.replace(/-/g, "_") + "_" + lessonSlug.replace(/-/g, "_");
}

export function formalRuntimePracticeId(courseSlug: string, lessonSlug: string) {
  const lessonPart = lessonSlug.replace(/-/g, "_");
  return courseSlug === "foundation-ai"
    ? "practice_" + lessonPart
    : "practice_" + courseSlug.replace(/-/g, "_") + "_" + lessonPart;
}

function durationMinutes(duration: string) {
  const match = duration.match(/(\d+)\s*分钟/);
  return match ? Number(match[1]) : null;
}

function resolveFormalSource(courseSlug: string, lessonSlug: string) {
  const key = courseSlug + "/" + lessonSlug;
  if (!FORMAL_KEYS.has(key)) throw new Error("FORMAL_LESSON_SPEC_NOT_FOUND");

  const courseIndex = courses.findIndex((item) => item.slug === courseSlug);
  const course = courses[courseIndex];
  if (!course) throw new Error("FORMAL_COURSE_SOURCE_NOT_FOUND");

  for (const [moduleIndex, courseModule] of course.modules.entries()) {
    const lessonIndex = courseModule.lessons.findIndex((item) => item.id === lessonSlug);
    if (lessonIndex < 0) continue;
    return {
      course,
      courseIndex,
      module: courseModule,
      moduleIndex,
      lesson: courseModule.lessons[lessonIndex],
      lessonIndex
    };
  }

  throw new Error("FORMAL_LESSON_SOURCE_NOT_FOUND");
}

export async function ensureFormalLearningIdentity(courseSlug: string, lessonSlug: string) {
  const source = resolveFormalSource(courseSlug, lessonSlug);
  const stageId = formalRuntimeStageId(source.course.slug);
  const moduleId = formalRuntimeModuleId(source.course.slug, source.module.id);
  const lessonId = formalRuntimeLessonId(source.course.slug, source.lesson.id);

  await getDatabase().transaction(async (tx) => {
    await tx
      .insert(stages)
      .values({
        id: stageId,
        slug: source.course.slug,
        title: source.course.title,
        summary: source.course.summary,
        outcome: source.course.outcome,
        order: source.courseIndex + 1,
        status: "PUBLISHED",
        version: 1,
        updatedAt: sql`now()`
      })
      .onConflictDoNothing();

    await tx
      .insert(modules)
      .values({
        id: moduleId,
        stageId,
        slug: source.module.id,
        title: source.module.title,
        summary: source.module.description,
        order: source.moduleIndex + 1,
        status: "PUBLISHED",
        updatedAt: sql`now()`
      })
      .onConflictDoNothing();

    await tx
      .insert(lessons)
      .values({
        id: lessonId,
        moduleId,
        slug: source.lesson.id,
        title: source.lesson.title,
        summary: source.lesson.summary,
        durationMinutes: durationMinutes(source.lesson.duration),
        content: {
          plainExplanation: source.lesson.plainExplanation,
          whyItMatters: source.lesson.whyItMatters,
          points: source.lesson.points,
          content: source.lesson.content,
          example: source.lesson.example,
          guides: source.lesson.guides,
          practice: source.lesson.practice,
          mistakes: source.lesson.mistakes,
          related: source.lesson.related
        },
        order: source.lessonIndex + 1,
        status: "PUBLISHED",
        version: 1,
        updatedAt: sql`now()`
      })
      .onConflictDoNothing();
  });

  return { stageId, moduleId, lessonId };
}

export async function auditFormalLearningIdentities() {
  const expected = formalLessonSpecs.map((spec) => ({
    key: spec.courseSlug + "/" + spec.lessonId,
    lessonId: formalRuntimeLessonId(spec.courseSlug, spec.lessonId)
  }));
  const expectedIds = expected.map((item) => item.lessonId);
  const rows =
    expectedIds.length === 0
      ? []
      : await getDatabase()
          .select({ id: lessons.id })
          .from(lessons)
          .where(inArray(lessons.id, expectedIds));
  const presentIds = new Set(rows.map((row) => row.id));
  const missing = expected.filter((item) => !presentIds.has(item.lessonId));

  return {
    expected: expected.length,
    present: expected.length - missing.length,
    missing
  };
}

export async function ensureAllFormalLearningIdentities() {
  for (const spec of formalLessonSpecs) {
    await ensureFormalLearningIdentity(spec.courseSlug, spec.lessonId);
  }
  return auditFormalLearningIdentities();
}
