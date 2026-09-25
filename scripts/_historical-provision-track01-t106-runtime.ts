import { loadEnvConfig } from "@next/env";
import { and, asc, eq, sql } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  TRACK01_PHASE1_COURSE_SLUG,
  track01T106RuntimeDefinition
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
const CONFIRM = process.argv.includes("--confirm=TRACK01-PHASE2-T1-06-003");

const stageId = "stage_foundation_ai";
const moduleId = "module_foundation_ai_phase2";
const lessonSlug = track01T106RuntimeDefinition.lesson.id;
const runtimeLessonId = "lesson_foundation_ai_" + lessonSlug.replace(/-/g, "_");

function runtimeCheckId(order: number) {
  return "check_foundation_ai_" + lessonSlug.replace(/-/g, "_") + "_" + order;
}

async function readState() {
  const [lesson] = await getDatabase()
    .select({
      lessonId: lessons.id,
      lessonSlug: lessons.slug,
      status: lessons.status,
      moduleSlug: modules.slug,
      moduleOrder: modules.order
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(
      and(
        eq(stages.slug, TRACK01_PHASE1_COURSE_SLUG),
        eq(lessons.slug, lessonSlug)
      )
    )
    .limit(1);

  if (!lesson) {
    return {
      databaseConfigured: getDatabaseConfig().configured,
      registered: false,
      checks: [],
      practices: []
    };
  }

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
      .where(eq(lessonChecks.lessonId, lesson.lessonId))
      .orderBy(asc(lessonChecks.order)),
    getDatabase()
      .select({
        id: practices.id,
        required: practices.required,
        status: practices.status
      })
      .from(practices)
      .where(eq(practices.lessonId, lesson.lessonId))
  ]);

  return {
    databaseConfigured: getDatabaseConfig().configured,
    registered: true,
    lesson,
    checks,
    practices: practiceRows
  };
}

async function provision() {
  if (!APPLY) return;
  if (!CONFIRM) {
    throw new Error(
      "CONFIRMATION_REQUIRED: use --apply --confirm=TRACK01-PHASE2-T1-06-003"
    );
  }

  const definition = track01T106RuntimeDefinition;
  const lesson = definition.lesson;

  await getDatabase().transaction(async (tx) => {
    const [stage] = await tx
      .select({ id: stages.id })
      .from(stages)
      .where(eq(stages.slug, TRACK01_PHASE1_COURSE_SLUG))
      .limit(1);

    if (!stage) {
      throw new Error("T106_REQUIRES_EXISTING_FOUNDATION_STAGE");
    }

    await tx
      .insert(modules)
      .values({
        id: moduleId,
        stageId,
        slug: "phase2",
        title: "02 · 理解模型为什么这样工作",
        summary: "在已经会基本协作之后，再理解模型和完整 AI 产品的基本关系。",
        order: 2,
        status: "PUBLISHED",
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: modules.id,
        set: {
          stageId,
          slug: "phase2",
          title: "02 · 理解模型为什么这样工作",
          summary: "在已经会基本协作之后，再理解模型和完整 AI 产品的基本关系。",
          order: 2,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });

    await tx
      .insert(lessons)
      .values({
        id: runtimeLessonId,
        moduleId,
        slug: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        durationMinutes: 16,
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
        order: 1,
        status: "PUBLISHED",
        version: 1,
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: lessons.id,
        set: {
          moduleId,
          slug: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          durationMinutes: 16,
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
          order: 1,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        }
      });

    for (const check of definition.checks) {
      const id = runtimeCheckId(check.order);
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
    if (!practice) throw new Error("T106_STANDARD_PRACTICE_REQUIRED");
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
        required: false,
        status: "PUBLISHED",
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: practices.id,
        set: {
          lessonId: runtimeLessonId,
          title: practice.title,
          goal: practice.goal,
          instructions: practice.instructions,
          hints: practice.hints,
          submissionSchema: practice.submissionSchema,
          rubric: practice.rubric,
          passScore: practice.passScore,
          required: false,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });
  });
}

function validateState(state: Awaited<ReturnType<typeof readState>>) {
  if (!state.registered) throw new Error("T106_RUNTIME_NOT_REGISTERED");
  if (state.lesson?.status !== "PUBLISHED") throw new Error("T106_LESSON_NOT_PUBLISHED");
  if (state.lesson?.moduleSlug !== "phase2" || state.lesson?.moduleOrder !== 2) {
    throw new Error("T106_PHASE2_MODULE_INVALID");
  }
  if (
    state.checks.length !== 3 ||
    state.checks.some((item) => item.required !== true || item.status !== "PUBLISHED")
  ) {
    throw new Error("T106_CHECKS_NOT_READY");
  }
  if (
    state.practices.length !== 1 ||
    state.practices[0]?.required !== false ||
    state.practices[0]?.status !== "PUBLISHED"
  ) {
    throw new Error("T106_OPTIONAL_STANDARD_PRACTICE_NOT_READY");
  }
}

async function main() {
  try {
    const before = await readState();
    console.log("T106_RUNTIME_BEFORE=" + JSON.stringify(before));

    await provision();

    const after = await readState();
    if (APPLY) validateState(after);

    console.log("T106_RUNTIME_AFTER=" + JSON.stringify(after));
    console.log(APPLY ? "T1_06_RUNTIME_PROVISION=PASS" : "T1_06_RUNTIME_PROVISION_DRY_RUN=PASS");
  } finally {
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
