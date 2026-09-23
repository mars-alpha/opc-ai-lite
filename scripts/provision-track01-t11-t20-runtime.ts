import { loadEnvConfig } from "@next/env";
import { and, asc, eq, sql } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  TRACK01_PHASE1_COURSE_SLUG,
  track01T111T120RuntimeDefinitions
} from "../lib/learning/track01-phase1-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { getDatabaseConfig } from "../lib/server/database-config";
import { lessonChecks, lessons, modules, practices, stages } from "../lib/server/db/schema";

const APPLY = process.argv.includes("--apply");
const CONFIRM = process.argv.includes("--confirm=TRACK01-T11-T20-RUNTIME-001");
const stageId = "stage_foundation_ai";

const phaseMeta = {
  4: {
    id: "module_foundation_ai_phase4",
    slug: "phase4",
    title: "理解 AI 如何连接外部世界",
    summary: "理解接口、结构化输出、工具调用与统一连接层，知道 AI 怎样连接外部数据和能力。"
  },
  5: {
    id: "module_foundation_ai_phase5",
    slug: "phase5",
    title: "理解 AI 的复用与执行",
    summary: "从一次有效方法进入可复用、可重复、可动态决策的执行方式。"
  },
  6: {
    id: "module_foundation_ai_phase6",
    slug: "phase6",
    title: "理解现代 AI 能力与安全边界",
    summary: "理解多模态与操作能力，同时建立隐私、权限和人工确认边界。"
  }
} as const;

function runtimeLessonId(slug: string) {
  return "lesson_foundation_ai_" + slug.replace(/-/g, "_");
}

function runtimeCheckId(slug: string, order: number) {
  return "check_foundation_ai_" + slug.replace(/-/g, "_") + "_" + order;
}

async function provision() {
  if (!APPLY) return;
  if (!CONFIRM) {
    throw new Error("CONFIRMATION_REQUIRED: use --apply --confirm=TRACK01-T11-T20-RUNTIME-001");
  }

  await getDatabase().transaction(async (tx) => {
    const [stage] = await tx
      .select({ id: stages.id })
      .from(stages)
      .where(eq(stages.slug, TRACK01_PHASE1_COURSE_SLUG))
      .limit(1);
    if (!stage) throw new Error("T111_T120_REQUIRES_EXISTING_FOUNDATION_STAGE");

    for (const phase of [4, 5, 6] as const) {
      const meta = phaseMeta[phase];
      await tx
        .insert(modules)
        .values({
          id: meta.id,
          stageId,
          slug: meta.slug,
          title: meta.title,
          summary: meta.summary,
          order: phase,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: modules.id,
          set: {
            stageId,
            slug: meta.slug,
            title: meta.title,
            summary: meta.summary,
            order: phase,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          }
        });
    }

    for (const definition of track01T111T120RuntimeDefinitions) {
      const module = phaseMeta[definition.phase];
      const lessonId = runtimeLessonId(definition.lesson.id);
      const lesson = definition.lesson;

      await tx
        .insert(lessons)
        .values({
          id: lessonId,
          moduleId: module.id,
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
          order: definition.lessonOrder,
          status: "PUBLISHED",
          version: 1,
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: lessons.id,
          set: {
            moduleId: module.id,
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
            order: definition.lessonOrder,
            status: "PUBLISHED",
            version: 1,
            updatedAt: sql`now()`
          }
        });

      for (const check of definition.checks) {
        await tx
          .insert(lessonChecks)
          .values({
            id: runtimeCheckId(lesson.id, check.order),
            lessonId,
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
              lessonId,
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
          lessonId,
          title: practice.title,
          goal: practice.goal,
          instructions: practice.instructions,
          hints: practice.hints,
          submissionSchema: practice.submissionSchema,
          rubric: practice.rubric,
          passScore: practice.passScore,
          required: practice.required,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: practices.id,
          set: {
            lessonId,
            title: practice.title,
            goal: practice.goal,
            instructions: practice.instructions,
            hints: practice.hints,
            submissionSchema: practice.submissionSchema,
            rubric: practice.rubric,
            passScore: practice.passScore,
            required: practice.required,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          }
        });
    }
  });
}

async function validateState() {
  const rows = await getDatabase()
    .select({
      lessonSlug: lessons.slug,
      lessonStatus: lessons.status,
      lessonOrder: lessons.order,
      moduleSlug: modules.slug,
      moduleOrder: modules.order
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(stages.slug, TRACK01_PHASE1_COURSE_SLUG))
    .orderBy(asc(modules.order), asc(lessons.order));

  for (const definition of track01T111T120RuntimeDefinitions) {
    const row = rows.find((item) => item.lessonSlug === definition.lesson.id);
    if (!row) throw new Error("T111_T120_RUNTIME_NOT_REGISTERED:" + definition.lesson.id);
    if (row.lessonStatus !== "PUBLISHED") throw new Error("T111_T120_LESSON_NOT_PUBLISHED:" + definition.lesson.id);
    if (row.moduleSlug !== "phase" + definition.phase || row.moduleOrder !== definition.phase) {
      throw new Error("T111_T120_MODULE_INVALID:" + definition.lesson.id);
    }
    if (row.lessonOrder !== definition.lessonOrder) {
      throw new Error("T111_T120_LESSON_ORDER_INVALID:" + definition.lesson.id);
    }

    const lessonId = runtimeLessonId(definition.lesson.id);
    const [checkRows, practiceRows] = await Promise.all([
      getDatabase()
        .select({ required: lessonChecks.required, status: lessonChecks.status })
        .from(lessonChecks)
        .where(eq(lessonChecks.lessonId, lessonId)),
      getDatabase()
        .select({ required: practices.required, status: practices.status })
        .from(practices)
        .where(and(eq(practices.lessonId, lessonId), eq(practices.type, "LESSON_PRACTICE")))
    ]);

    if (checkRows.length !== 3 || checkRows.some((item) => item.required !== true || item.status !== "PUBLISHED")) {
      throw new Error("T111_T120_CHECKS_NOT_READY:" + definition.lesson.id);
    }
    if (
      practiceRows.length !== 1 ||
      practiceRows[0]?.required !== definition.practice.required ||
      practiceRows[0]?.status !== "PUBLISHED"
    ) {
      throw new Error("T111_T120_PRACTICE_NOT_READY:" + definition.lesson.id);
    }
  }
}

async function main() {
  try {
    console.log("T111_T120_DATABASE_CONFIGURED=" + String(getDatabaseConfig().configured));
    await provision();
    if (APPLY) await validateState();
    console.log(APPLY ? "T1_11_T1_20_RUNTIME_PROVISION=PASS" : "T1_11_T1_20_RUNTIME_PROVISION_DRY_RUN=PASS");
  } finally {
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
