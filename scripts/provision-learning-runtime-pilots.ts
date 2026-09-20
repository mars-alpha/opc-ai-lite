import { loadEnvConfig } from "@next/env";
import { and, eq, sql } from "drizzle-orm";

loadEnvConfig(process.cwd());

import {
  memoryRagCheckSeed,
  taskDecompositionPracticeSeed
} from "../lib/learning/lesson-runtime-samples";
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
const CONFIRM = process.argv.includes("--confirm=LEARNING-RUNTIME-001-A");

async function getLessonIdentity(courseSlug: string, lessonSlug: string) {
  const [row] = await getDatabase()
    .select({
      lessonId: lessons.id,
      lessonSlug: lessons.slug,
      courseSlug: stages.slug,
      status: lessons.status
    })
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

  if (!row) {
    throw new Error("PILOT_LESSON_NOT_FOUND:" + courseSlug + "/" + lessonSlug);
  }
  return row;
}

async function readState() {
  const memory = await getLessonIdentity("ai-literacy", "memory-rag");
  const workflow = await getLessonIdentity("ai-workflow", "task-decomposition");

  const [memoryCheck] = await getDatabase()
    .select()
    .from(lessonChecks)
    .where(eq(lessonChecks.id, memoryRagCheckSeed.id))
    .limit(1);

  const [workflowPractice] = await getDatabase()
    .select()
    .from(practices)
    .where(eq(practices.id, taskDecompositionPracticeSeed.id))
    .limit(1);

  return {
    databaseConfigured: getDatabaseConfig().configured,
    memoryRag: {
      lessonId: memory.lessonId,
      lessonStatus: memory.status,
      check: memoryCheck
        ? {
            id: memoryCheck.id,
            lessonId: memoryCheck.lessonId,
            type: memoryCheck.type,
            required: memoryCheck.required,
            status: memoryCheck.status,
            correctAnswer: memoryCheck.correctAnswer
          }
        : null
    },
    taskDecomposition: {
      lessonId: workflow.lessonId,
      lessonStatus: workflow.status,
      practice: workflowPractice
        ? {
            id: workflowPractice.id,
            lessonId: workflowPractice.lessonId,
            type: workflowPractice.type,
            accessTier: workflowPractice.accessTier,
            required: workflowPractice.required,
            status: workflowPractice.status,
            submissionSchema: workflowPractice.submissionSchema,
            passScore: workflowPractice.passScore
          }
        : null
    }
  };
}

async function provision() {
  if (!APPLY) return;
  if (!CONFIRM) {
    throw new Error(
      "CONFIRMATION_REQUIRED: use --apply --confirm=LEARNING-RUNTIME-001-A"
    );
  }

  const memory = await getLessonIdentity("ai-literacy", "memory-rag");
  const workflow = await getLessonIdentity("ai-workflow", "task-decomposition");

  await getDatabase().transaction(async (tx) => {
    await tx
      .insert(lessonChecks)
      .values({
        ...memoryRagCheckSeed,
        lessonId: memory.lessonId,
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: lessonChecks.id,
        set: {
          lessonId: memory.lessonId,
          type: memoryRagCheckSeed.type,
          question: memoryRagCheckSeed.question,
          options: memoryRagCheckSeed.options,
          correctAnswer: memoryRagCheckSeed.correctAnswer,
          explanation: memoryRagCheckSeed.explanation,
          required: memoryRagCheckSeed.required,
          order: memoryRagCheckSeed.order,
          status: memoryRagCheckSeed.status,
          updatedAt: sql`now()`
        }
      });

    await tx
      .insert(practices)
      .values({
        id: taskDecompositionPracticeSeed.id,
        type: "LESSON_PRACTICE",
        accessTier: "INHERIT",
        lessonId: workflow.lessonId,
        title: taskDecompositionPracticeSeed.title,
        goal: taskDecompositionPracticeSeed.goal,
        instructions: taskDecompositionPracticeSeed.instructions,
        hints: taskDecompositionPracticeSeed.hints,
        submissionSchema: taskDecompositionPracticeSeed.submissionSchema,
        rubric: taskDecompositionPracticeSeed.rubric,
        passScore: taskDecompositionPracticeSeed.passScore,
        required: taskDecompositionPracticeSeed.required,
        status: taskDecompositionPracticeSeed.status,
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: practices.id,
        set: {
          type: "LESSON_PRACTICE",
          accessTier: "INHERIT",
          lessonId: workflow.lessonId,
          title: taskDecompositionPracticeSeed.title,
          goal: taskDecompositionPracticeSeed.goal,
          instructions: taskDecompositionPracticeSeed.instructions,
          hints: taskDecompositionPracticeSeed.hints,
          submissionSchema: taskDecompositionPracticeSeed.submissionSchema,
          rubric: taskDecompositionPracticeSeed.rubric,
          passScore: taskDecompositionPracticeSeed.passScore,
          required: taskDecompositionPracticeSeed.required,
          status: taskDecompositionPracticeSeed.status,
          updatedAt: sql`now()`
        }
      });
  });
}

async function main() {
  if (!getDatabaseConfig().configured) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const before = await readState();
  console.log("MODE=" + (APPLY ? "APPLY" : "CHECK"));
  console.log("BEFORE=" + JSON.stringify(before));

  await provision();

  const after = await readState();
  console.log("AFTER=" + JSON.stringify(after));

  if (APPLY) {
    const memoryOk =
      after.memoryRag.check?.id === memoryRagCheckSeed.id &&
      after.memoryRag.check.lessonId === after.memoryRag.lessonId &&
      after.memoryRag.check.required === true &&
      after.memoryRag.check.status === "PUBLISHED";

    const practice = after.taskDecomposition.practice;
    const workflowOk =
      practice?.id === taskDecompositionPracticeSeed.id &&
      practice.lessonId === after.taskDecomposition.lessonId &&
      practice.type === "LESSON_PRACTICE" &&
      practice.accessTier === "INHERIT" &&
      practice.required === true &&
      practice.status === "PUBLISHED" &&
      practice.passScore === taskDecompositionPracticeSeed.passScore &&
      typeof practice.submissionSchema === "object" &&
      practice.submissionSchema !== null &&
      "kind" in practice.submissionSchema &&
      practice.submissionSchema.kind === "STRUCTURED_TEXT_V1";

    if (!memoryOk || !workflowOk) {
      throw new Error("PILOT_PROVISIONING_POSTCONDITION_FAILED");
    }

    console.log("PILOT_PROVISIONING=PASS");
  } else {
    console.log("PILOT_PRECHECK=PASS");
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
