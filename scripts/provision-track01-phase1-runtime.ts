import { loadEnvConfig } from "@next/env";
import { and, asc, eq, sql } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  TRACK01_PHASE1_COURSE_SLUG,
  track01Phase1Course,
  track01Phase1RuntimeDefinitions
} from "../lib/learning/track01-phase1-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { getDatabaseConfig } from "../lib/server/database-config";
import {
  lessonChecks,
  lessons,
  modules,
  practices,
  stages
} from "../lib/server/db/schema";

const APPLY = process.argv.includes("--apply");
const CONFIRM = process.argv.includes("--confirm=TRACK01-PHASE1-RUNTIME-001");

function stageId() {
  return "stage_foundation_ai";
}

function moduleId() {
  return "module_foundation_ai_phase1";
}

function lessonId(lessonSlug: string) {
  return "lesson_foundation_ai_" + lessonSlug.replace(/-/g, "_");
}

function checkId(lessonSlug: string, order: number) {
  return "check_foundation_ai_" + lessonSlug.replace(/-/g, "_") + "_" + order;
}

async function readState() {
  const lessonRows = await getDatabase()
    .select({
      lessonId: lessons.id,
      lessonSlug: lessons.slug,
      status: lessons.status
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(stages.slug, TRACK01_PHASE1_COURSE_SLUG))
    .orderBy(asc(lessons.order));

  const result = [];
  for (const row of lessonRows) {
    const [checks, practiceRows] = await Promise.all([
      getDatabase()
        .select({
          id: lessonChecks.id,
          type: lessonChecks.type,
          required: lessonChecks.required,
          order: lessonChecks.order,
          status: lessonChecks.status
        })
        .from(lessonChecks)
        .where(eq(lessonChecks.lessonId, row.lessonId))
        .orderBy(asc(lessonChecks.order)),
      getDatabase()
        .select({
          id: practices.id,
          required: practices.required,
          status: practices.status,
          submissionSchema: practices.submissionSchema
        })
        .from(practices)
        .where(
          and(
            eq(practices.lessonId, row.lessonId),
            eq(practices.type, "LESSON_PRACTICE")
          )
        )
    ]);
    result.push({ ...row, checks, practices: practiceRows });
  }

  return {
    databaseConfigured: getDatabaseConfig().configured,
    courseSlug: TRACK01_PHASE1_COURSE_SLUG,
    lessons: result
  };
}

async function assertRuntimeSchemaReady() {
  try {
    await getDatabase()
      .select({
        correctAnswers: lessonChecks.correctAnswers,
        incorrectExplanation: lessonChecks.incorrectExplanation
      })
      .from(lessonChecks)
      .limit(1);
  } catch {
    throw new Error("TRACK01_PHASE1_DB_SCHEMA_REQUIRES_0010_0011");
  }
}

async function provision() {
  if (!APPLY) return;
  if (!CONFIRM) {
    throw new Error(
      "CONFIRMATION_REQUIRED: use --apply --confirm=TRACK01-PHASE1-RUNTIME-001"
    );
  }

  await assertRuntimeSchemaReady();

  const course = track01Phase1Course;
  const module = course.modules[0];
  if (!module) throw new Error("TRACK01_PHASE1_MODULE_REQUIRED");

  await getDatabase().transaction(async (tx) => {
    await tx
      .insert(stages)
      .values({
        id: stageId(),
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        outcome: course.outcome,
        order: 101,
        status: "PUBLISHED",
        version: 1,
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: stages.id,
        set: {
          slug: course.slug,
          title: course.title,
          summary: course.summary,
          outcome: course.outcome,
          order: 101,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        }
      });

    await tx
      .insert(modules)
      .values({
        id: moduleId(),
        stageId: stageId(),
        slug: module.id,
        title: module.title,
        summary: module.description,
        order: 1,
        status: "PUBLISHED",
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: modules.id,
        set: {
          stageId: stageId(),
          slug: module.id,
          title: module.title,
          summary: module.description,
          order: 1,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });

    for (const [lessonIndex, definition] of track01Phase1RuntimeDefinitions.entries()) {
      const runtimeLessonId = lessonId(definition.lesson.id);
      const lesson = definition.lesson;

      await tx
        .insert(lessons)
        .values({
          id: runtimeLessonId,
          moduleId: moduleId(),
          slug: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          durationMinutes: 18,
          content: {
            plainExplanation: lesson.plainExplanation,
            whyItMatters: lesson.whyItMatters,
            points: lesson.points,
            content: lesson.content,
            example: lesson.example,
            guides: lesson.guides,
            practice: lesson.practice,
            mistakes: lesson.mistakes,
            related: lesson.related
          },
          order: lessonIndex + 1,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: lessons.id,
          set: {
            moduleId: moduleId(),
            slug: lesson.id,
            title: lesson.title,
            summary: lesson.summary,
            durationMinutes: 18,
            content: {
              plainExplanation: lesson.plainExplanation,
              whyItMatters: lesson.whyItMatters,
              points: lesson.points,
              content: lesson.content,
              example: lesson.example,
              guides: lesson.guides,
              practice: lesson.practice,
              mistakes: lesson.mistakes,
              related: lesson.related
            },
            order: lessonIndex + 1,
            status: "PUBLISHED",
            version: 1,
            updatedAt: sql`now()`
          }
        });

      for (const check of definition.checks) {
        const id = checkId(lesson.id, check.order);
        await tx
          .insert(lessonChecks)
          .values({
            id,
            lessonId: runtimeLessonId,
            type: check.type,
            question: check.question,
            options: check.options,
            correctAnswer: check.correctAnswer,
            correctAnswers: check.correctAnswers,
            explanation: check.explanation,
            incorrectExplanation: check.incorrectExplanation,
            required: true,
            order: check.order,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          })
          .onConflictDoUpdate({
            target: lessonChecks.id,
            set: {
              lessonId: runtimeLessonId,
              type: check.type,
              question: check.question,
              options: check.options,
              correctAnswer: check.correctAnswer,
              correctAnswers: check.correctAnswers,
              explanation: check.explanation,
              incorrectExplanation: check.incorrectExplanation,
              required: true,
              order: check.order,
              status: "PUBLISHED",
              updatedAt: sql`now()`
            }
          });
      }

      const practice = definition.practice;
      await tx
        .insert(practices)
        .values({
          id: practice.id,
          type: "LESSON_PRACTICE",
          accessTier: "INHERIT",
          lessonId: runtimeLessonId,
          title: practice.title,
          goal: practice.goal,
          instructions: practice.instructions,
          hints: practice.hints,
          submissionSchema: practice.submissionSchema,
          rubric: practice.rubric,
          passScore: practice.passScore,
          required: true,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: practices.id,
          set: {
            type: "LESSON_PRACTICE",
            accessTier: "INHERIT",
            lessonId: runtimeLessonId,
            title: practice.title,
            goal: practice.goal,
            instructions: practice.instructions,
            hints: practice.hints,
            submissionSchema: practice.submissionSchema,
            rubric: practice.rubric,
            passScore: practice.passScore,
            required: true,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          }
        });
    }
  });
}

function validateState(state: Awaited<ReturnType<typeof readState>>) {
  const phase1Slugs = new Set(track01Phase1RuntimeDefinitions.map((item) => item.lesson.id));
  const phase1Lessons = state.lessons.filter((lesson) => phase1Slugs.has(lesson.lessonSlug));
  if (phase1Lessons.length !== track01Phase1RuntimeDefinitions.length) {
    throw new Error("TRACK01_PHASE1_LESSON_COUNT_MISMATCH");
  }
  for (const lesson of phase1Lessons) {
    if (lesson.status !== "PUBLISHED") throw new Error("TRACK01_PHASE1_LESSON_NOT_PUBLISHED");
    if (
      lesson.checks.length !== 3 ||
      lesson.checks.some((item) => item.required !== true || item.status !== "PUBLISHED")
    ) {
      throw new Error("TRACK01_PHASE1_CHECKS_NOT_READY:" + lesson.lessonSlug);
    }
    if (
      lesson.practices.length !== 1 ||
      lesson.practices[0]?.required !== true ||
      lesson.practices[0]?.status !== "PUBLISHED"
    ) {
      throw new Error("TRACK01_PHASE1_PRACTICE_NOT_READY:" + lesson.lessonSlug);
    }
    const schema = lesson.practices[0]?.submissionSchema;
    if (
      !schema ||
      typeof schema !== "object" ||
      Array.isArray(schema) ||
      !("kind" in schema) ||
      schema.kind !== "STRUCTURED_TEXT_V1"
    ) {
      throw new Error("TRACK01_PHASE1_PRACTICE_SCHEMA_INVALID:" + lesson.lessonSlug);
    }
  }
}

async function main() {
  if (!getDatabaseConfig().configured) throw new Error("DATABASE_NOT_CONFIGURED");

  const before = await readState();
  console.log("MODE=" + (APPLY ? "APPLY" : "CHECK"));
  console.log("BEFORE=" + JSON.stringify(before));

  await provision();

  const after = await readState();
  console.log("AFTER=" + JSON.stringify(after));

  if (APPLY) {
    validateState(after);
    console.log("TRACK01_PHASE1_PROVISIONING=PASS");
  } else {
    console.log("TRACK01_PHASE1_PRECHECK=PASS");
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
