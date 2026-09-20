import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  lessonCheckResponses,
  lessonChecks,
  lessons,
  modules,
  practiceEvaluations,
  practiceSubmissions,
  practices,
  stages
} from "../db/schema";
import { getLessonAccess } from "../entitlements/service";
import { getPracticeForSubmission } from "../practices/service";
import { validatePracticeSubmission } from "../practices/submission-schema";
import {
  recordLearningEvent,
  refreshLearningBehaviorSignals
} from "../learning-insights/service";
import {
  type EvaluationResult,
  type PracticeContent,
  type PracticeEvaluator,
  type RubricCriterion,
  rulePracticeEvaluator
} from "../../learning/practice-evaluator";

type CheckOption = { value: string; label: string };
type PracticeInstruction = { key: string; label: string; prompt: string };

function asOptions(value: unknown): CheckOption[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is CheckOption =>
      Boolean(
        item &&
        typeof item === "object" &&
        "value" in item &&
        "label" in item &&
        typeof item.value === "string" &&
        typeof item.label === "string"
      )
  );
}

function asInstructions(value: unknown): PracticeInstruction[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is PracticeInstruction =>
      Boolean(
        item &&
        typeof item === "object" &&
        "key" in item &&
        "label" in item &&
        "prompt" in item &&
        typeof item.key === "string" &&
        Boolean(item.key.trim()) &&
        typeof item.label === "string" &&
        typeof item.prompt === "string"
      )
  );
}

function asRubric(value: unknown): RubricCriterion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is RubricCriterion =>
      Boolean(
        item &&
        typeof item === "object" &&
        "key" in item &&
        "label" in item &&
        "maxScore" in item &&
        "minScore" in item &&
        "example" in item &&
        typeof item.key === "string" &&
        Boolean(item.key.trim()) &&
        typeof item.label === "string" &&
        typeof item.maxScore === "number" &&
        item.maxScore > 0 &&
        typeof item.minScore === "number" &&
        item.minScore >= 0 &&
        item.minScore <= item.maxScore &&
        typeof item.example === "string"
      )
  );
}

function asHints(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

async function getPublishedLesson(courseSlug: string, lessonSlug: string) {
  const [lesson] = await getDatabase()
    .select({ id: lessons.id, slug: lessons.slug, courseSlug: stages.slug })
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

  return lesson ?? null;
}

export async function getInteractiveLesson(
  userId: string | null,
  courseSlug: string,
  lessonSlug: string
) {
  const lesson = await getPublishedLesson(courseSlug, lessonSlug);
  if (!lesson) throw new Error("LESSON_NOT_FOUND");

  const isReferencePreview =
    courseSlug === "chatgpt-worker" && lessonSlug === "task-brief";
  if (!isReferencePreview) {
    const access = await getLessonAccess(userId, courseSlug, lessonSlug);
    if (!access.allowed) {
      throw new Error(
        access.reason === "PREREQUISITE_STAGE_REQUIRED"
          ? "STAGE_PREREQUISITE_REQUIRED"
          : "LESSON_LOCKED"
      );
    }
  }

  const db = getDatabase();
  const [checkRows, practiceRows] = await Promise.all([
    db
      .select()
      .from(lessonChecks)
      .where(
        and(
          eq(lessonChecks.lessonId, lesson.id),
          eq(lessonChecks.status, "PUBLISHED")
        )
      )
      .orderBy(asc(lessonChecks.order)),
    db
      .select()
      .from(practices)
      .where(
        and(
          eq(practices.lessonId, lesson.id),
          eq(practices.type, "LESSON_PRACTICE"),
          eq(practices.status, "PUBLISHED")
        )
      )
      .orderBy(asc(practices.createdAt))
  ]);

  const checkStates = new Map<string, { answer: string; isCorrect: boolean; attempts: number }>();
  const practiceStates = new Map<
    string,
    {
      submissionId: string;
      attempt: number;
      status: "SUBMITTED" | "NEEDS_REVISION" | "PASSED" | "EVALUATION_FAILED";
      content: unknown;
      evaluation: EvaluationResult | null;
    }
  >();

  if (userId) {
    const responses = await db
      .select()
      .from(lessonCheckResponses)
      .where(eq(lessonCheckResponses.userId, userId));
    for (const response of responses) {
      if (checkRows.some((check) => check.id === response.checkId)) {
        checkStates.set(response.checkId, {
          answer: response.answer,
          isCorrect: response.isCorrect,
          attempts: response.attempts
        });
      }
    }

    for (const practice of practiceRows) {
      const [submission] = await db
        .select()
        .from(practiceSubmissions)
        .where(
          and(
            eq(practiceSubmissions.userId, userId),
            eq(practiceSubmissions.practiceId, practice.id)
          )
        )
        .orderBy(desc(practiceSubmissions.attempt))
        .limit(1);

      if (!submission) continue;

      const [evaluation] = await db
        .select({ result: practiceEvaluations.result })
        .from(practiceEvaluations)
        .where(eq(practiceEvaluations.submissionId, submission.id))
        .orderBy(desc(practiceEvaluations.createdAt))
        .limit(1);

      practiceStates.set(practice.id, {
        submissionId: submission.id,
        attempt: submission.attempt,
        status: submission.status,
        content: submission.content,
        evaluation: (evaluation?.result as EvaluationResult | undefined) ?? null
      });
    }
  }

  return {
    lessonId: lesson.id,
    authenticated: Boolean(userId),
    checks: checkRows.map((check) => {
      const state = checkStates.get(check.id);
      return {
        id: check.id,
        type: check.type,
        question: check.question,
        options: asOptions(check.options),
        required: check.required,
        state: state
          ? {
              ...state,
              explanation: state.isCorrect ? check.explanation : null
            }
          : null
      };
    }),
    practices: practiceRows.map((practice) => ({
      id: practice.id,
      title: practice.title,
      goal: practice.goal,
      instructions: asInstructions(practice.instructions),
      hints: asHints(practice.hints),
      rubric: asRubric(practice.rubric),
      passScore: practice.passScore,
      required: practice.required,
      state: practiceStates.get(practice.id) ?? null
    }))
  };
}

const REFERENCE_PREVIEW_CHECK_IDS = new Set(["check_task_brief_constraint"]);

async function evaluateCheckAnswer(
  userId: string | null,
  checkId: string,
  answer: unknown,
  allowReferencePreview = false
) {
  if (typeof answer !== "string" || !answer.trim() || answer.length > 120) {
    throw new Error("INVALID_CHECK_ANSWER");
  }

  const db = getDatabase();
  const [check] = await db
    .select()
    .from(lessonChecks)
    .where(and(eq(lessonChecks.id, checkId), eq(lessonChecks.status, "PUBLISHED")))
    .limit(1);
  if (!check) throw new Error("CHECK_NOT_FOUND");

  const [identity] = await db
    .select({
      courseSlug: stages.slug,
      lessonSlug: lessons.slug
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(lessons.id, check.lessonId))
    .limit(1);
  if (!identity) throw new Error("CHECK_NOT_FOUND");

  const isReferencePreview =
    allowReferencePreview && REFERENCE_PREVIEW_CHECK_IDS.has(checkId);
  if (!isReferencePreview) {
    const access = await getLessonAccess(
      userId,
      identity.courseSlug,
      identity.lessonSlug
    );
    if (!access.allowed) {
      throw new Error(
        access.reason === "PREREQUISITE_STAGE_REQUIRED"
          ? "STAGE_PREREQUISITE_REQUIRED"
          : "LESSON_LOCKED"
      );
    }
  }

  const normalized = answer.trim();
  const isCorrect = normalized === check.correctAnswer;
  return { check, normalized, isCorrect };
}

function checkResult(check: { explanation: string }, isCorrect: boolean) {
  return {
    correct: isCorrect,
    explanation: isCorrect
      ? check.explanation
      : "再看一下本课说明和选项之间的区别，然后重试。"
  };
}

export async function previewLessonCheck(
  checkId: string,
  answer: unknown,
  allowReferencePreview = false
) {
  const { check, isCorrect } = await evaluateCheckAnswer(
    null,
    checkId,
    answer,
    allowReferencePreview
  );
  return checkResult(check, isCorrect);
}

export async function answerLessonCheck(
  userId: string,
  checkId: string,
  answer: unknown
) {
  const { check, normalized, isCorrect } = await evaluateCheckAnswer(
    userId,
    checkId,
    answer
  );
  const now = new Date();
  const db = getDatabase();

  await db
    .insert(lessonCheckResponses)
    .values({
      checkId,
      userId,
      answer: normalized,
      isCorrect,
      attempts: 1,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [lessonCheckResponses.userId, lessonCheckResponses.checkId],
      set: {
        answer: normalized,
        isCorrect,
        attempts: sql`${lessonCheckResponses.attempts} + 1`,
        updatedAt: now
      }
    });

  await recordLearningEvent({
    userId,
    lessonId: check.lessonId,
    eventName: "check_answered",
    targetType: "LESSON_CHECK",
    targetId: checkId,
    properties: { correct: isCorrect }
  });
  await refreshLearningBehaviorSignals(check.lessonId, "CHECK");

  return checkResult(check, isCorrect);
}

async function getPracticeForUser(userId: string, practiceId: string) {
  const { practice } = await getPracticeForSubmission(userId, practiceId);
  return practice;
}
async function persistEvaluation(
  submissionId: string,
  evaluation: EvaluationResult
) {
  const db = getDatabase();
  await db.transaction(async (tx) => {
    await tx.insert(practiceEvaluations).values({
      submissionId,
      evaluatorType: evaluation.evaluatorType,
      score: evaluation.score,
      passed: evaluation.passed,
      result: evaluation
    });
    await tx
      .update(practiceSubmissions)
      .set({
        status: evaluation.passed ? "PASSED" : "NEEDS_REVISION",
        updatedAt: new Date()
      })
      .where(eq(practiceSubmissions.id, submissionId));
  });
}

export async function evaluatePracticeSubmission(
  userId: string,
  submissionId: string,
  evaluator: PracticeEvaluator = rulePracticeEvaluator
) {
  const db = getDatabase();
  const [row] = await db
    .select({
      submissionId: practiceSubmissions.id,
      practiceId: practices.id,
      lessonId: practices.lessonId,
      attempt: practiceSubmissions.attempt,
      content: practiceSubmissions.content,
      rubric: practices.rubric,
      passScore: practices.passScore,
      submissionSchema: practices.submissionSchema
    })
    .from(practiceSubmissions)
    .innerJoin(practices, eq(practiceSubmissions.practiceId, practices.id))
    .where(
      and(
        eq(practiceSubmissions.id, submissionId),
        eq(practiceSubmissions.userId, userId)
      )
    )
    .limit(1);

  if (!row) throw new Error("SUBMISSION_NOT_FOUND");

  try {
    const evaluation = await evaluator({
      content: validatePracticeSubmission(row.submissionSchema, row.content),
      rubric: asRubric(row.rubric),
      passScore: row.passScore
    });
    await persistEvaluation(submissionId, evaluation);
    await recordLearningEvent({
      userId,
      lessonId: row.lessonId,
      eventName: "evaluation_completed",
      targetType: "PRACTICE_SUBMISSION",
      targetId: submissionId,
      properties: {
        practiceId: row.practiceId,
        attempt: row.attempt,
        score: evaluation.score,
        passed: evaluation.passed
      }
    });
    await recordLearningEvent({
      userId,
      lessonId: row.lessonId,
      eventName: evaluation.passed ? "practice_passed" : "practice_needs_revision",
      targetType: "PRACTICE",
      targetId: row.practiceId,
      properties: {
        submissionId,
        attempt: row.attempt,
        score: evaluation.score
      }
    });
    if (row.lessonId) {
      await refreshLearningBehaviorSignals(row.lessonId, "PRACTICE");
    }
    return { submissionId, status: evaluation.passed ? "PASSED" : "NEEDS_REVISION", evaluation };
  } catch (error) {
    await db
      .update(practiceSubmissions)
      .set({ status: "EVALUATION_FAILED", updatedAt: new Date() })
      .where(eq(practiceSubmissions.id, submissionId));
    await recordLearningEvent({
      userId,
      lessonId: row.lessonId,
      eventName: "evaluation_failed",
      targetType: "PRACTICE_SUBMISSION",
      targetId: submissionId,
      properties: { practiceId: row.practiceId, attempt: row.attempt }
    });
    throw error;
  }
}

export async function submitPractice(
  userId: string,
  practiceId: string,
  rawContent: unknown,
  evaluator: PracticeEvaluator = rulePracticeEvaluator
) {
  const practice = await getPracticeForUser(userId, practiceId);
  const content = validatePracticeSubmission(practice.submissionSchema, rawContent);
  const db = getDatabase();

  const [latest] = await db
    .select({ attempt: practiceSubmissions.attempt })
    .from(practiceSubmissions)
    .where(
      and(
        eq(practiceSubmissions.userId, userId),
        eq(practiceSubmissions.practiceId, practiceId)
      )
    )
    .orderBy(desc(practiceSubmissions.attempt))
    .limit(1);

  const [submission] = await db
    .insert(practiceSubmissions)
    .values({
      practiceId,
      userId,
      attempt: (latest?.attempt ?? 0) + 1,
      content,
      status: "SUBMITTED"
    })
    .returning({ id: practiceSubmissions.id, attempt: practiceSubmissions.attempt });

  await recordLearningEvent({
    userId,
    lessonId: practice.lessonId,
    eventName: "submission_created",
    targetType: "PRACTICE_SUBMISSION",
    targetId: submission.id,
    properties: { practiceId, practiceType: practice.type, attempt: submission.attempt }
  });

  try {
    return {
      attempt: submission.attempt,
      ...(await evaluatePracticeSubmission(userId, submission.id, evaluator))
    };
  } catch {
    return {
      submissionId: submission.id,
      attempt: submission.attempt,
      status: "EVALUATION_FAILED" as const,
      evaluation: null
    };
  }
}

export type RequiredGateState = {
  configured: boolean;
  passed: boolean;
  requiredIds: string[];
};

export async function getRequiredCheckGateState(
  userId: string | null,
  lessonId: string
): Promise<RequiredGateState> {
  const required = await getDatabase()
    .select({ id: lessonChecks.id })
    .from(lessonChecks)
    .where(
      and(
        eq(lessonChecks.lessonId, lessonId),
        eq(lessonChecks.required, true),
        eq(lessonChecks.status, "PUBLISHED")
      )
    );

  if (required.length === 0) {
    return { configured: false, passed: false, requiredIds: [] };
  }
  if (!userId) {
    return { configured: true, passed: false, requiredIds: required.map((item) => item.id) };
  }

  for (const check of required) {
    const [passed] = await getDatabase()
      .select({ checkId: lessonCheckResponses.checkId })
      .from(lessonCheckResponses)
      .where(
        and(
          eq(lessonCheckResponses.userId, userId),
          eq(lessonCheckResponses.checkId, check.id),
          eq(lessonCheckResponses.isCorrect, true)
        )
      )
      .limit(1);
    if (!passed) {
      return { configured: true, passed: false, requiredIds: required.map((item) => item.id) };
    }
  }

  return { configured: true, passed: true, requiredIds: required.map((item) => item.id) };
}

export async function getRequiredPracticeGateState(
  userId: string | null,
  lessonId: string
): Promise<RequiredGateState> {
  const required = await getDatabase()
    .select({ id: practices.id })
    .from(practices)
    .where(
      and(
        eq(practices.lessonId, lessonId),
        eq(practices.type, "LESSON_PRACTICE"),
        eq(practices.required, true),
        eq(practices.status, "PUBLISHED")
      )
    );

  if (required.length === 0) {
    return { configured: false, passed: false, requiredIds: [] };
  }
  if (!userId) {
    return { configured: true, passed: false, requiredIds: required.map((item) => item.id) };
  }

  for (const practice of required) {
    const [passed] = await getDatabase()
      .select({ id: practiceSubmissions.id })
      .from(practiceSubmissions)
      .where(
        and(
          eq(practiceSubmissions.userId, userId),
          eq(practiceSubmissions.practiceId, practice.id),
          eq(practiceSubmissions.status, "PASSED")
        )
      )
      .limit(1);
    if (!passed) {
      return { configured: true, passed: false, requiredIds: required.map((item) => item.id) };
    }
  }

  return { configured: true, passed: true, requiredIds: required.map((item) => item.id) };
}

export async function hasPassedRequiredChecks(userId: string, lessonId: string) {
  const state = await getRequiredCheckGateState(userId, lessonId);
  return !state.configured || state.passed;
}

export async function hasPassedRequiredPractices(userId: string, lessonId: string) {
  const state = await getRequiredPracticeGateState(userId, lessonId);
  return !state.configured || state.passed;
}


















