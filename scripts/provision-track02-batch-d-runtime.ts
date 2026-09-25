import { loadEnvConfig } from "@next/env";
import { and, asc, eq, sql } from "drizzle-orm";

loadEnvConfig(process.cwd());

import { track02CourseWithBatchD, track02BatchDRuntimeDefinitions } from "../lib/learning/track02-batch-d-runtime";
import { TRACK02_RUNTIME_COURSE_SLUG } from "../lib/learning/track02-batch-a-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { getDatabaseConfig } from "../lib/server/database-config";
import { lessonChecks, lessons, modules, practices, stages } from "../lib/server/db/schema";

const APPLY = process.argv.includes("--apply");
const CONFIRM = process.argv.includes("--confirm=TRACK02-BATCH-D-RUNTIME-001");
const STAGE_ID = "stage_ai_work";
const moduleMeta = [
  { id: "module_ai_work_data", order: 4, indexes: [0, 1, 2] },
  { id: "module_ai_work_knowledge", order: 5, indexes: [3, 4] },
  { id: "module_ai_work_reuse", order: 6, indexes: [5] }
] as const;

function lessonId(slug: string) { return "lesson_ai_work_" + slug.replace(/-/g, "_"); }
function checkId(slug: string, order: number) { return "check_ai_work_" + slug.replace(/-/g, "_") + "_" + order; }

async function readState() {
  const rows = await getDatabase()
    .select({ lessonId: lessons.id, lessonSlug: lessons.slug, status: lessons.status })
    .from(lessons).innerJoin(modules, eq(lessons.moduleId, modules.id)).innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(stages.slug, TRACK02_RUNTIME_COURSE_SLUG)).orderBy(asc(lessons.order));

  const runtime = [];
  for (const row of rows) {
    const [checks, practiceRows] = await Promise.all([
      getDatabase().select({ id: lessonChecks.id, type: lessonChecks.type, required: lessonChecks.required, order: lessonChecks.order, status: lessonChecks.status })
        .from(lessonChecks).where(eq(lessonChecks.lessonId, row.lessonId)).orderBy(asc(lessonChecks.order)),
      getDatabase().select({ id: practices.id, required: practices.required, status: practices.status, submissionSchema: practices.submissionSchema })
        .from(practices).where(and(eq(practices.lessonId, row.lessonId), eq(practices.type, "LESSON_PRACTICE")))
    ]);
    runtime.push({ ...row, checks, practices: practiceRows });
  }
  return { databaseConfigured: getDatabaseConfig().configured, courseSlug: TRACK02_RUNTIME_COURSE_SLUG, lessons: runtime };
}

async function provision() {
  if (!APPLY) return;
  if (!CONFIRM) throw new Error("CONFIRMATION_REQUIRED: use --apply --confirm=TRACK02-BATCH-D-RUNTIME-001");

  const stage = await getDatabase().select({ id: stages.id, status: stages.status }).from(stages).where(eq(stages.id, STAGE_ID));
  if (stage.length !== 1 || stage[0]?.status !== "PUBLISHED") throw new Error("TRACK02_BATCH_D_REQUIRES_PUBLISHED_STAGE");

  await getDatabase().transaction(async (tx) => {
    for (const meta of moduleMeta) {
      const module = track02CourseWithBatchD.modules[meta.order - 1];
      if (!module) throw new Error("TRACK02_BATCH_D_MODULE_REQUIRED:" + meta.order);
      await tx.insert(modules).values({
        id: meta.id, stageId: STAGE_ID, slug: module.id, title: module.title, summary: module.description,
        order: meta.order, status: "PUBLISHED", updatedAt: sql`now()`
      }).onConflictDoUpdate({
        target: modules.id,
        set: { stageId: STAGE_ID, slug: module.id, title: module.title, summary: module.description, order: meta.order, status: "PUBLISHED", updatedAt: sql`now()` }
      });

      for (const index of meta.indexes) {
        const definition = track02BatchDRuntimeDefinitions[index]!;
        const lesson = definition.lesson;
        const runtimeLessonId = lessonId(lesson.id);
        await tx.insert(lessons).values({
          id: runtimeLessonId, moduleId: meta.id, slug: lesson.id, title: lesson.title, summary: lesson.summary,
          durationMinutes: 18,
          content: { plainExplanation: lesson.plainExplanation, whyItMatters: lesson.whyItMatters, points: lesson.points, content: lesson.content, example: lesson.example, guides: lesson.guides, practice: lesson.practice, mistakes: lesson.mistakes, related: lesson.related },
          order: index + 10, status: "PUBLISHED", version: 1, updatedAt: sql`now()`
        }).onConflictDoUpdate({
          target: lessons.id,
          set: { moduleId: meta.id, slug: lesson.id, title: lesson.title, summary: lesson.summary, durationMinutes: 18, content: { plainExplanation: lesson.plainExplanation, whyItMatters: lesson.whyItMatters, points: lesson.points, content: lesson.content, example: lesson.example, guides: lesson.guides, practice: lesson.practice, mistakes: lesson.mistakes, related: lesson.related }, order: index + 10, status: "PUBLISHED", version: 1, updatedAt: sql`now()` }
        });

        for (const check of definition.checks) {
          await tx.insert(lessonChecks).values({
            id: checkId(lesson.id, check.order), lessonId: runtimeLessonId, type: check.type, question: check.question,
            options: check.options, correctAnswer: check.correctAnswer, correctAnswers: check.correctAnswers,
            explanation: check.explanation, incorrectExplanation: check.incorrectExplanation,
            required: true, order: check.order, status: "PUBLISHED", updatedAt: sql`now()`
          }).onConflictDoUpdate({
            target: lessonChecks.id,
            set: { lessonId: runtimeLessonId, type: check.type, question: check.question, options: check.options, correctAnswer: check.correctAnswer, correctAnswers: check.correctAnswers, explanation: check.explanation, incorrectExplanation: check.incorrectExplanation, required: true, order: check.order, status: "PUBLISHED", updatedAt: sql`now()` }
          });
        }

        const practice = definition.practice;
        await tx.insert(practices).values({
          id: practice.id, type: "LESSON_PRACTICE", accessTier: "INHERIT", lessonId: runtimeLessonId,
          title: practice.title, goal: practice.goal, instructions: practice.instructions, hints: practice.hints,
          submissionSchema: practice.submissionSchema, rubric: practice.rubric, passScore: practice.passScore,
          required: true, status: "PUBLISHED", updatedAt: sql`now()`
        }).onConflictDoUpdate({
          target: practices.id,
          set: { type: "LESSON_PRACTICE", accessTier: "INHERIT", lessonId: runtimeLessonId, title: practice.title, goal: practice.goal, instructions: practice.instructions, hints: practice.hints, submissionSchema: practice.submissionSchema, rubric: practice.rubric, passScore: practice.passScore, required: true, status: "PUBLISHED", updatedAt: sql`now()` }
        });
      }
    }
  });
}

function validateState(state: Awaited<ReturnType<typeof readState>>) {
  const expected = new Set(track02BatchDRuntimeDefinitions.map((item) => item.lesson.id));
  const rows = state.lessons.filter((item) => expected.has(item.lessonSlug));
  if (rows.length !== 6) throw new Error("TRACK02_BATCH_D_LESSON_COUNT_MISMATCH");
  for (const lesson of rows) {
    if (lesson.status !== "PUBLISHED") throw new Error("TRACK02_BATCH_D_LESSON_NOT_PUBLISHED:" + lesson.lessonSlug);
    if (lesson.checks.length !== 3 || lesson.checks.some((item) => item.required !== true || item.status !== "PUBLISHED")) throw new Error("TRACK02_BATCH_D_CHECKS_NOT_READY:" + lesson.lessonSlug);
    if (lesson.practices.length !== 1 || lesson.practices[0]?.required !== true || lesson.practices[0]?.status !== "PUBLISHED") throw new Error("TRACK02_BATCH_D_PRACTICE_NOT_READY:" + lesson.lessonSlug);
    const schema = lesson.practices[0]?.submissionSchema;
    if (!schema || typeof schema !== "object" || Array.isArray(schema) || !("kind" in schema) || schema.kind !== "STRUCTURED_TEXT_V1") throw new Error("TRACK02_BATCH_D_PRACTICE_SCHEMA_INVALID:" + lesson.lessonSlug);
  }
}

async function main() {
  if (!getDatabaseConfig().configured) throw new Error("DATABASE_NOT_CONFIGURED");
  console.log("MODE=" + (APPLY ? "APPLY" : "CHECK"));
  await provision();
  const after = await readState();
  console.log("AFTER=" + JSON.stringify(after));
  if (APPLY) { validateState(after); console.log("TRACK02_BATCH_D_PROVISIONING=PASS"); }
  else console.log("TRACK02_BATCH_D_PRECHECK=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(closeDatabase);
