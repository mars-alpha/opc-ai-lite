import { loadEnvConfig } from "@next/env";
import { and, asc, eq, sql } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  TRACK05_RUNTIME_COURSE_SLUG,
  track05Course,
  track05RuntimeDefinitions
} from "../lib/learning/track05-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { getDatabaseConfig } from "../lib/server/database-config";
import { lessonChecks, lessons, modules, practices, stages } from "../lib/server/db/schema";

const APPLY = process.argv.includes("--apply");
const CONFIRM = process.argv.includes("--confirm=TRACK05-RUNTIME-001");
const STAGE_ID = "stage_fde";

function moduleId(slug: string) {
  return "module_" + slug.replace(/-/g, "_");
}
function lessonId(slug: string) {
  return "lesson_fde_" + slug.replace(/-/g, "_");
}
function checkId(slug: string, order: number) {
  return "check_fde_" + slug.replace(/-/g, "_") + "_" + order;
}

async function readState() {
  const rows = await getDatabase()
    .select({
      lessonId: lessons.id,
      lessonSlug: lessons.slug,
      moduleSlug: modules.slug,
      status: lessons.status,
      order: lessons.order
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(stages.slug, TRACK05_RUNTIME_COURSE_SLUG))
    .orderBy(asc(lessons.order));

  const runtime = [];
  for (const row of rows) {
    const [checks, practiceRows] = await Promise.all([
      getDatabase()
        .select({
          id: lessonChecks.id,
          required: lessonChecks.required,
          status: lessonChecks.status,
          order: lessonChecks.order
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
        .where(and(eq(practices.lessonId, row.lessonId), eq(practices.type, "LESSON_PRACTICE")))
    ]);
    runtime.push({ ...row, checks, practices: practiceRows });
  }
  return runtime;
}

async function readModules() {
  return getDatabase()
    .select({ slug: modules.slug, order: modules.order, status: modules.status })
    .from(modules)
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(stages.slug, TRACK05_RUNTIME_COURSE_SLUG))
    .orderBy(asc(modules.order));
}

async function provision() {
  if (!APPLY) return;
  if (!CONFIRM) {
    throw new Error("CONFIRMATION_REQUIRED: use --apply --confirm=TRACK05-RUNTIME-001");
  }

  await getDatabase().transaction(async (tx) => {
    await tx
      .insert(stages)
      .values({
        id: STAGE_ID,
        slug: TRACK05_RUNTIME_COURSE_SLUG,
        title: track05Course.title,
        summary: track05Course.summary,
        outcome: track05Course.outcome,
        order: 5,
        status: "PUBLISHED",
        version: 1,
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: stages.id,
        set: {
          title: track05Course.title,
          summary: track05Course.summary,
          outcome: track05Course.outcome,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });

    for (const [moduleIndex, module] of track05Course.modules.entries()) {
      const runtimeModuleId = moduleId(module.id);
      await tx
        .insert(modules)
        .values({
          id: runtimeModuleId,
          stageId: STAGE_ID,
          slug: module.id,
          title: module.title,
          summary: module.description,
          order: moduleIndex + 1,
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
            order: moduleIndex + 1,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          }
        });
    }

    for (const [index, d] of track05RuntimeDefinitions.entries()) {
      const lesson = d.lesson;
      const module = track05Course.modules.find((item) =>
        item.lessons.some((candidate) => candidate.id === lesson.id)
      );
      if (!module) throw new Error("TRACK05_MODULE_NOT_FOUND:" + lesson.id);

      const runtimeId = lessonId(lesson.id);
      const content = {
        plainExplanation: lesson.plainExplanation,
        whyItMatters: lesson.whyItMatters,
        points: lesson.points,
        content: lesson.content,
        example: lesson.example,
        guides: lesson.guides,
        practice: lesson.practice,
        mistakes: lesson.mistakes,
        related: lesson.related
      };

      await tx
        .insert(lessons)
        .values({
          id: runtimeId,
          moduleId: moduleId(module.id),
          slug: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          durationMinutes: 18,
          content,
          order: index + 1,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: lessons.id,
          set: {
            moduleId: moduleId(module.id),
            slug: lesson.id,
            title: lesson.title,
            summary: lesson.summary,
            durationMinutes: 18,
            content,
            order: index + 1,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          }
        });

      for (const check of d.checks) {
        await tx
          .insert(lessonChecks)
          .values({
            id: checkId(lesson.id, check.order),
            lessonId: runtimeId,
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
              lessonId: runtimeId,
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

      const pr = d.practice;
      await tx
        .insert(practices)
        .values({
          id: pr.id,
          type: "LESSON_PRACTICE",
          accessTier: "INHERIT",
          lessonId: runtimeId,
          title: pr.title,
          goal: pr.goal,
          instructions: pr.instructions,
          hints: pr.hints,
          submissionSchema: pr.submissionSchema,
          rubric: pr.rubric,
          passScore: pr.passScore,
          required: true,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: practices.id,
          set: {
            lessonId: runtimeId,
            title: pr.title,
            goal: pr.goal,
            instructions: pr.instructions,
            hints: pr.hints,
            submissionSchema: pr.submissionSchema,
            rubric: pr.rubric,
            passScore: pr.passScore,
            required: true,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          }
        });
    }
  });
}

function validateState(
  rows: Awaited<ReturnType<typeof readState>>,
  moduleRows: Awaited<ReturnType<typeof readModules>>
) {
  if (moduleRows.length !== 6) throw new Error("TRACK05_RUNTIME_MODULE_COUNT:" + moduleRows.length);
  const expectedModules = [
    "fde-discovery",
    "fde-definition",
    "fde-solution",
    "fde-pilot",
    "fde-adoption",
    "fde-capstone"
  ];
  if (moduleRows.map((row) => row.slug).join(",") !== expectedModules.join(",")) {
    throw new Error("TRACK05_RUNTIME_MODULE_ORDER");
  }
  if (moduleRows.some((row) => row.status !== "PUBLISHED")) {
    throw new Error("TRACK05_RUNTIME_MODULE_NOT_PUBLISHED");
  }

  const moduleCounts = expectedModules.map(
    (slug) => rows.filter((row) => row.moduleSlug === slug).length
  );
  if (moduleCounts.join(",") !== "3,3,3,3,3,1") {
    throw new Error("TRACK05_RUNTIME_MODULE_LESSON_COUNTS:" + moduleCounts.join(","));
  }
  if (rows.length !== 16) throw new Error("TRACK05_RUNTIME_LESSON_COUNT:" + rows.length);
  for (const row of rows) {
    if (row.status !== "PUBLISHED") throw new Error("LESSON_NOT_PUBLISHED:" + row.lessonSlug);
    if (row.checks.length !== 3 || row.checks.some((x) => !x.required || x.status !== "PUBLISHED")) {
      throw new Error("CHECKS_NOT_READY:" + row.lessonSlug);
    }
    if (
      row.practices.length !== 1 ||
      !row.practices[0]?.required ||
      row.practices[0]?.status !== "PUBLISHED"
    ) {
      throw new Error("PRACTICE_NOT_READY:" + row.lessonSlug);
    }
  }
}

async function main() {
  if (!getDatabaseConfig().configured) throw new Error("DATABASE_NOT_CONFIGURED");
  console.log("MODE=" + (APPLY ? "APPLY" : "CHECK"));
  await provision();
  const [rows, moduleRows] = await Promise.all([readState(), readModules()]);
  validateState(rows, moduleRows);
  console.log("TRACK05_RUNTIME_6_MODULES=PASS");
  console.log("TRACK05_RUNTIME_16_LESSONS=PASS");
  console.log("TRACK05_RUNTIME_48_CHECKS=PASS");
  console.log("TRACK05_RUNTIME_16_PRACTICES=PASS");
  console.log(APPLY ? "TRACK05_RUNTIME_PROVISIONING=PASS" : "TRACK05_RUNTIME_PRECHECK=PASS");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
