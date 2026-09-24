import { loadEnvConfig } from "@next/env";
import { and, asc, eq, sql } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  TRACK02_RUNTIME_COURSE_SLUG,
  track02BatchACourse,
  track02BatchARuntimeDefinitions
} from "../lib/learning/track02-batch-a-runtime";
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
const CONFIRM = process.argv.includes("--confirm=TRACK02-BATCH-A-RUNTIME-001");

const STAGE_ID = "stage_ai_work";
const MODULE_ID = "module_ai_work_research";

function lessonId(lessonSlug: string) {
  return "lesson_ai_work_" + lessonSlug.replace(/-/g, "_");
}

function checkId(lessonSlug: string, order: number) {
  return "check_ai_work_" + lessonSlug.replace(/-/g, "_") + "_" + order;
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
    throw new Error("TRACK02_RUNTIME_DB_SCHEMA_REQUIRES_CHECK_SEQUENCE_COLUMNS");
  }
}

async function readState() {
  const rows = await getDatabase()
    .select({
      lessonId: lessons.id,
      lessonSlug: lessons.slug,
      status: lessons.status
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(stages.slug, TRACK02_RUNTIME_COURSE_SLUG))
    .orderBy(asc(lessons.order));

  const runtime = [];
  for (const row of rows) {
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
    runtime.push({ ...row, checks, practices: practiceRows });
  }

  return {
    databaseConfigured: getDatabaseConfig().configured,
    courseSlug: TRACK02_RUNTIME_COURSE_SLUG,
    lessons: runtime
  };
}

async function provision() {
  if (!APPLY) return;
  if (!CONFIRM) {
    throw new Error(
      "CONFIRMATION_REQUIRED: use --apply --confirm=TRACK02-BATCH-A-RUNTIME-001"
    );
  }

  await assertRuntimeSchemaReady();
  const course = track02BatchACourse;
  const module = course.modules[0];
  if (!module) throw new Error("TRACK02_BATCH_A_MODULE_REQUIRED");

  await getDatabase().transaction(async (tx) => {
    await tx
      .insert(stages)
      .values({
        id: STAGE_ID,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        outcome: course.outcome,
        order: 102,
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
          order: 102,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        }
      });

    await tx
      .insert(modules)
      .values({
        id: MODULE_ID,
        stageId: STAGE_ID,
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
          stageId: STAGE_ID,
          slug: module.id,
          title: module.title,
          summary: module.description,
          order: 1,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });

    for (const [index, definition] of track02BatchARuntimeDefinitions.entries()) {
      const lesson = definition.lesson;
      const runtimeLessonId = lessonId(lesson.id);

      await tx
        .insert(lessons)
        .values({
          id: runtimeLessonId,
          moduleId: MODULE_ID,
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
          order: index + 1,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: lessons.id,
          set: {
            moduleId: MODULE_ID,
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
            order: index + 1,
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
  const expected = new Set(track02BatchARuntimeDefinitions.map((item) => item.lesson.id));
  const rows = state.lessons.filter((item) => expected.has(item.lessonSlug));
  if (rows.length !== 3) throw new Error("TRACK02_BATCH_A_LESSON_COUNT_MISMATCH");

  for (const lesson of rows) {
    if (lesson.status !== "PUBLISHED") {
      throw new Error("TRACK02_BATCH_A_LESSON_NOT_PUBLISHED:" + lesson.lessonSlug);
    }
    if (
      lesson.checks.length !== 3 ||
      lesson.checks.some((item) => item.required !== true || item.status !== "PUBLISHED")
    ) {
      throw new Error("TRACK02_BATCH_A_CHECKS_NOT_READY:" + lesson.lessonSlug);
    }
    if (
      lesson.practices.length !== 1 ||
      lesson.practices[0]?.required !== true ||
      lesson.practices[0]?.status !== "PUBLISHED"
    ) {
      throw new Error("TRACK02_BATCH_A_PRACTICE_NOT_READY:" + lesson.lessonSlug);
    }
    const schema = lesson.practices[0]?.submissionSchema;
    if (
      !schema ||
      typeof schema !== "object" ||
      Array.isArray(schema) ||
      !("kind" in schema) ||
      schema.kind !== "STRUCTURED_TEXT_V1"
    ) {
      throw new Error("TRACK02_BATCH_A_PRACTICE_SCHEMA_INVALID:" + lesson.lessonSlug);
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
    console.log("TRACK02_BATCH_A_PROVISIONING=PASS");
  } else {
    console.log("TRACK02_BATCH_A_PRECHECK=PASS");
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
