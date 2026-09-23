import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  lessonCheckResponses,
  lessonChecks,
  lessonProgress,
  learningEvents,
  lessons,
  modules,
  practiceEvaluations,
  practiceSubmissions,
  practices,
  stages
} from "../db/schema";
import { getLessonAccess } from "../entitlements/service";
import { getPracticeForSubmission } from "../practices/service";
import { createRuntimeTiming } from "../runtime-performance";
import { validatePracticeSubmission } from "../practices/submission-schema";
import {
  recordLearningEvent,
  refreshLearningBehaviorSignals
} from "../learning-insights/service";
import {
  enqueueLearningBehaviorRefresh,
  isBackgroundJobsUnavailable,
  type LearningBehaviorSignal
} from "../background-jobs";
import {
  type EvaluationResult,
  type PracticeContent,
  type PracticeEvaluator,
  type RubricCriterion,
  rulePracticeEvaluator
} from "../../learning/practice-evaluator";
import {
  evaluateLessonCheckAnswers,
  isThreeQuestionMasterySequence,
  type LessonCheckQuestionType
} from "../../learning/check-evaluator";

async function dispatchLearningBehaviorRefresh(lessonId: string, signal: LearningBehaviorSignal) {
  try {
    await enqueueLearningBehaviorRefresh(lessonId, signal);
    return "OUTBOX" as const;
  } catch (error) {
    if (!isBackgroundJobsUnavailable(error)) throw error;
    await refreshLearningBehaviorSignals(lessonId, signal);
    return "SYNC_FALLBACK" as const;
  }
}

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

function asAnswerArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function correctAnswersForCheck(check: {
  correctAnswer: string;
  correctAnswers: unknown;
}) {
  const values = asAnswerArray(check.correctAnswers);
  return (values.length > 0 ? [...new Set(values)] : [check.correctAnswer]).sort();
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
  lessonSlug: string,
  resolved?: { lessonId: string; accessChecked: boolean }
) {
  const lesson = resolved
    ? { id: resolved.lessonId }
    : await getPublishedLesson(courseSlug, lessonSlug);
  if (!lesson) throw new Error("LESSON_NOT_FOUND");

  if (!resolved?.accessChecked) {
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
  const [checkRows, practiceRows, responses, practiceStateRows] = await Promise.all([
    db
      .select()
      .from(lessonChecks)
      .where(and(eq(lessonChecks.lessonId, lesson.id), eq(lessonChecks.status, "PUBLISHED")))
      .orderBy(asc(lessonChecks.order)),
    db
      .select()
      .from(practices)
      .where(and(eq(practices.lessonId, lesson.id), eq(practices.type, "LESSON_PRACTICE"), eq(practices.status, "PUBLISHED")))
      .orderBy(asc(practices.createdAt)),
    userId
      ? db
          .select({
            checkId: lessonCheckResponses.checkId,
            answer: lessonCheckResponses.answer,
            answers: lessonCheckResponses.answers,
            isCorrect: lessonCheckResponses.isCorrect,
            attempts: lessonCheckResponses.attempts
          })
          .from(lessonCheckResponses)
          .innerJoin(lessonChecks, eq(lessonCheckResponses.checkId, lessonChecks.id))
          .where(and(eq(lessonCheckResponses.userId, userId), eq(lessonChecks.lessonId, lesson.id), eq(lessonChecks.status, "PUBLISHED")))
      : Promise.resolve([]),
    userId
      ? db
          .select({
            submissionId: practiceSubmissions.id,
            practiceId: practiceSubmissions.practiceId,
            attempt: practiceSubmissions.attempt,
            status: practiceSubmissions.status,
            content: practiceSubmissions.content,
            evaluation: practiceEvaluations.result,
            evaluationCreatedAt: practiceEvaluations.createdAt
          })
          .from(practiceSubmissions)
          .innerJoin(practices, eq(practiceSubmissions.practiceId, practices.id))
          .leftJoin(practiceEvaluations, eq(practiceEvaluations.submissionId, practiceSubmissions.id))
          .where(and(eq(practiceSubmissions.userId, userId), eq(practices.lessonId, lesson.id), eq(practices.type, "LESSON_PRACTICE"), eq(practices.status, "PUBLISHED")))
          .orderBy(desc(practiceSubmissions.attempt), desc(practiceEvaluations.createdAt))
      : Promise.resolve([])
  ]);

  const checkStates = new Map<
    string,
    { answer: string; answers: string[]; isCorrect: boolean; attempts: number }
  >();
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
    for (const response of responses) {
      const storedAnswers = asAnswerArray(response.answers);
      checkStates.set(response.checkId, {
        answer: response.answer,
        answers: storedAnswers.length > 0 ? storedAnswers : [response.answer],
        isCorrect: response.isCorrect,
        attempts: response.attempts
      });
    }

    for (const row of practiceStateRows) {
      if (practiceStates.has(row.practiceId)) continue;
      practiceStates.set(row.practiceId, {
        submissionId: row.submissionId,
        attempt: row.attempt,
        status: row.status,
        content: row.content,
        evaluation: (row.evaluation as EvaluationResult | null) ?? null
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
              explanation: state.isCorrect
                ? check.explanation
                : check.incorrectExplanation ?? check.explanation
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

async function evaluateCheckAnswer(
  userId: string | null,
  checkId: string,
  answer: unknown
) {
  const db = getDatabase();
  const [resolved] = await db
    .select({
      id: lessonChecks.id,
      lessonId: lessonChecks.lessonId,
      type: lessonChecks.type,
      correctAnswer: lessonChecks.correctAnswer,
      correctAnswers: lessonChecks.correctAnswers,
      explanation: lessonChecks.explanation,
      incorrectExplanation: lessonChecks.incorrectExplanation,
      courseSlug: stages.slug,
      lessonSlug: lessons.slug
    })
    .from(lessonChecks)
    .innerJoin(lessons, eq(lessonChecks.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(
      and(
        eq(lessonChecks.id, checkId),
        eq(lessonChecks.status, "PUBLISHED"),
        eq(lessons.status, "PUBLISHED")
      )
    )
    .limit(1);
  if (!resolved) throw new Error("CHECK_NOT_FOUND");

  const access = await getLessonAccess(
    userId,
    resolved.courseSlug,
    resolved.lessonSlug
  );
  if (!access.allowed) {
    throw new Error(
      access.reason === "PREREQUISITE_STAGE_REQUIRED"
        ? "STAGE_PREREQUISITE_REQUIRED"
        : "LESSON_LOCKED"
    );
  }

  const expected = correctAnswersForCheck(resolved);
  const evaluated = evaluateLessonCheckAnswers(
    resolved.type as LessonCheckQuestionType,
    expected,
    answer
  );
  const normalized = evaluated.answers.join("|");
  return {
    check: resolved,
    normalized,
    answers: evaluated.answers,
    isCorrect: evaluated.isCorrect
  };
}

function checkResult(
  check: { explanation: string; incorrectExplanation: string | null },
  isCorrect: boolean
) {
  return {
    correct: isCorrect,
    explanation: isCorrect
      ? check.explanation
      : check.incorrectExplanation ?? check.explanation
  };
}

export async function getLessonCheckSequenceState(
  userId: string,
  lessonId: string
) {
  const db = getDatabase();
  const checkRows = await db
    .select({
      id: lessonChecks.id,
      type: lessonChecks.type,
      required: lessonChecks.required,
      explanation: lessonChecks.explanation,
      incorrectExplanation: lessonChecks.incorrectExplanation
    })
    .from(lessonChecks)
    .where(
      and(
        eq(lessonChecks.lessonId, lessonId),
        eq(lessonChecks.status, "PUBLISHED")
      )
    )
    .orderBy(asc(lessonChecks.order));

  const checkIds = checkRows.map((check) => check.id);
  const responseRows =
    checkIds.length === 0
      ? []
      : await db
          .select({
            checkId: lessonCheckResponses.checkId,
            answer: lessonCheckResponses.answer,
            answers: lessonCheckResponses.answers,
            isCorrect: lessonCheckResponses.isCorrect,
            attempts: lessonCheckResponses.attempts
          })
          .from(lessonCheckResponses)
          .where(
            and(
              eq(lessonCheckResponses.userId, userId),
              inArray(lessonCheckResponses.checkId, checkIds)
            )
          );

  const responses = new Map(responseRows.map((row) => [row.checkId, row]));
  const checks = checkRows.map((check) => {
    const response = responses.get(check.id);
    const storedAnswers = response ? asAnswerArray(response.answers) : [];
    return {
      id: check.id,
      state: response
        ? {
            answer: response.answer,
            answers: storedAnswers.length > 0 ? storedAnswers : [response.answer],
            isCorrect: response.isCorrect,
            attempts: response.attempts,
            explanation: response.isCorrect
              ? check.explanation
              : check.incorrectExplanation ?? check.explanation
          }
        : null
    };
  });
  const requiredIds = checkRows
    .filter((check) => check.required)
    .map((check) => check.id);
  const stateById = new Map(checks.map((check) => [check.id, check.state]));

  return {
    checks,
    passed:
      requiredIds.length > 0 &&
      requiredIds.every((id) => stateById.get(id)?.isCorrect === true),
    requiredIds
  };
}

export async function resetLessonChecksForRelearn(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  currentStep?: number
) {
  const timing = createRuntimeTiming("check_reset");
  const db = getDatabase();
  const [access, requiredChecks] = await Promise.all([
    getLessonAccess(userId, courseSlug, lessonSlug),
    db
      .select({
        id: lessonChecks.id,
        lessonId: lessons.id
      })
      .from(lessonChecks)
      .innerJoin(lessons, eq(lessonChecks.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(stages, eq(modules.stageId, stages.id))
      .where(
        and(
          eq(stages.slug, courseSlug),
          eq(lessons.slug, lessonSlug),
          eq(lessons.status, "PUBLISHED"),
          eq(lessonChecks.required, true),
          eq(lessonChecks.status, "PUBLISHED")
        )
      )
  ]);

  if (!access.allowed) {
    throw new Error(
      access.reason === "PREREQUISITE_STAGE_REQUIRED"
        ? "STAGE_PREREQUISITE_REQUIRED"
        : "LESSON_LOCKED"
    );
  }
  if (requiredChecks.length === 0) throw new Error("CHECK_NOT_FOUND");

  const lessonId = requiredChecks[0].lessonId;
  const requiredIds = requiredChecks.map((item) => item.id);
  timing.mark("lookup_required_ms");

  const now = new Date();
  await Promise.all([
    db
      .delete(lessonCheckResponses)
      .where(
        and(
          eq(lessonCheckResponses.userId, userId),
          inArray(lessonCheckResponses.checkId, requiredIds)
        )
      ),
    typeof currentStep === "number"
      ? db
          .insert(lessonProgress)
          .values({
            userId,
            lessonId,
            status: "IN_PROGRESS",
            currentStep,
            startedAt: now,
            completedAt: null,
            updatedAt: now
          })
          .onConflictDoUpdate({
            target: [lessonProgress.userId, lessonProgress.lessonId],
            set: { currentStep, updatedAt: now }
          })
      : Promise.resolve(null)
  ]);
  timing.mark("reset_and_progress_ms");

  await Promise.all([
    recordLearningEvent({
      userId,
      lessonId,
      eventName: "check_relearn_started",
      targetType: "LESSON",
      targetId: lessonId,
      properties: { requiredCheckCount: requiredIds.length }
    }),
    dispatchLearningBehaviorRefresh(lessonId, "CHECK")
  ]);
  timing.mark("event_outbox_ms");
  timing.finish();

  return {
    reset: true,
    checkCount: requiredIds.length,
    checkState: {
      checks: requiredIds.map((id) => ({ id, state: null })),
      passed: false,
      requiredIds
    }
  };
}

export async function previewLessonCheck(
  checkId: string,
  answer: unknown
) {
  const { check, isCorrect } = await evaluateCheckAnswer(null, checkId, answer);
  return checkResult(check, isCorrect);
}

export async function answerLessonCheck(
  userId: string,
  checkId: string,
  answer: unknown
) {
  const timing = createRuntimeTiming("check_answer");
  const { check, normalized, answers, isCorrect } = await evaluateCheckAnswer(
    userId,
    checkId,
    answer
  );
  timing.mark("lookup_evaluate_ms");
  const now = new Date();
  const db = getDatabase();

  const [storedResponse] = await db
    .insert(lessonCheckResponses)
    .values({
      checkId,
      userId,
      answer: normalized,
      answers,
      isCorrect,
      attempts: 1,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [lessonCheckResponses.userId, lessonCheckResponses.checkId],
      set: {
        answer: normalized,
        answers,
        isCorrect,
        attempts: sql`${lessonCheckResponses.attempts} + 1`,
        updatedAt: now
      }
    })
    .returning({
      answer: lessonCheckResponses.answer,
      answers: lessonCheckResponses.answers,
      isCorrect: lessonCheckResponses.isCorrect,
      attempts: lessonCheckResponses.attempts
    });

  timing.mark("response_write_ms");
  const parallelStartedAt = performance.now();
  const [, , gateRows] = await Promise.all([
    recordLearningEvent({
      userId,
      lessonId: check.lessonId,
      eventName: "check_answered",
      targetType: "LESSON_CHECK",
      targetId: checkId,
      properties: { correct: isCorrect }
    }),
    dispatchLearningBehaviorRefresh(check.lessonId, "CHECK"),
    db
      .select({
        id: lessonChecks.id,
        isCorrect: lessonCheckResponses.isCorrect
      })
      .from(lessonChecks)
      .leftJoin(
        lessonCheckResponses,
        and(
          eq(lessonCheckResponses.checkId, lessonChecks.id),
          eq(lessonCheckResponses.userId, userId)
        )
      )
      .where(
        and(
          eq(lessonChecks.lessonId, check.lessonId),
          eq(lessonChecks.required, true),
          eq(lessonChecks.status, "PUBLISHED")
        )
      )
  ]);
  timing.set("event_outbox_gate_parallel_ms", Math.round(performance.now() - parallelStartedAt));
  const requiredIds = gateRows.map((row) => row.id);
  const result = checkResult(check, isCorrect);
  const storedAnswers = storedResponse ? asAnswerArray(storedResponse.answers) : answers;
  const checkState = {
    checks: [
      {
        id: checkId,
        state: {
          answer: storedResponse?.answer ?? normalized,
          answers: storedAnswers,
          isCorrect: storedResponse?.isCorrect ?? isCorrect,
          attempts: storedResponse?.attempts ?? 1,
          explanation: result.explanation
        }
      }
    ],
    passed:
      requiredIds.length > 0 &&
      gateRows.every((row) => row.isCorrect === true),
    requiredIds
  };
  timing.finish({ correct: isCorrect });

  return {
    ...result,
    checkState
  };
}

async function getPracticeForUser(userId: string, practiceId: string) {
  const { practice } = await getPracticeForSubmission(userId, practiceId);
  return practice;
}
async function persistEvaluation(
  userId: string,
  row: ResolvedPracticeSubmission,
  evaluation: EvaluationResult
) {
  const db = getDatabase();
  await db.transaction(async (tx) => {
    await tx.insert(practiceEvaluations).values({
      submissionId: row.submissionId,
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
      .where(eq(practiceSubmissions.id, row.submissionId));
    await tx.insert(learningEvents).values([
      {
        userId,
        lessonId: row.lessonId,
        eventName: "evaluation_completed",
        targetType: "PRACTICE_SUBMISSION",
        targetId: row.submissionId,
        properties: {
          practiceId: row.practiceId,
          attempt: row.attempt,
          score: evaluation.score,
          passed: evaluation.passed
        }
      },
      {
        userId,
        lessonId: row.lessonId,
        eventName: evaluation.passed ? "practice_passed" : "practice_needs_revision",
        targetType: "PRACTICE",
        targetId: row.practiceId,
        properties: {
          submissionId: row.submissionId,
          attempt: row.attempt,
          score: evaluation.score
        }
      }
    ]);
  });
}

type ResolvedPracticeSubmission = {
  submissionId: string;
  practiceId: string;
  lessonId: string | null;
  attempt: number;
  content: unknown;
  rubric: unknown;
  passScore: number;
  submissionSchema: unknown;
};

async function evaluateResolvedPracticeSubmission(
  userId: string,
  row: ResolvedPracticeSubmission,
  evaluator: PracticeEvaluator
) {
  const db = getDatabase();
  try {
    const evaluation = await evaluator({
      content: validatePracticeSubmission(row.submissionSchema, row.content),
      rubric: asRubric(row.rubric),
      passScore: row.passScore
    });
    await persistEvaluation(userId, row, evaluation);
    if (row.lessonId) {
      await dispatchLearningBehaviorRefresh(row.lessonId, "PRACTICE");
    }
    return {
      submissionId: row.submissionId,
      status: evaluation.passed ? "PASSED" as const : "NEEDS_REVISION" as const,
      evaluation
    };
  } catch (error) {
    await db
      .update(practiceSubmissions)
      .set({ status: "EVALUATION_FAILED", updatedAt: new Date() })
      .where(eq(practiceSubmissions.id, row.submissionId));
    await recordLearningEvent({
      userId,
      lessonId: row.lessonId,
      eventName: "evaluation_failed",
      targetType: "PRACTICE_SUBMISSION",
      targetId: row.submissionId,
      properties: { practiceId: row.practiceId, attempt: row.attempt }
    });
    throw error;
  }
}

export async function evaluatePracticeSubmission(
  userId: string,
  submissionId: string,
  evaluator: PracticeEvaluator = rulePracticeEvaluator
) {
  const [row] = await getDatabase()
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
  return evaluateResolvedPracticeSubmission(userId, row, evaluator);
}

export async function submitPractice(
  userId: string,
  practiceId: string,
  rawContent: unknown,
  evaluator: PracticeEvaluator = rulePracticeEvaluator
) {
  const timing = createRuntimeTiming("practice_submit");
  const db = getDatabase();
  const [practice, latestRows] = await Promise.all([
    getPracticeForUser(userId, practiceId),
    db
      .select({ attempt: practiceSubmissions.attempt })
      .from(practiceSubmissions)
      .where(
        and(
          eq(practiceSubmissions.userId, userId),
          eq(practiceSubmissions.practiceId, practiceId)
        )
      )
      .orderBy(desc(practiceSubmissions.attempt))
      .limit(1)
  ]);
  const [latest] = latestRows;
  const content = validatePracticeSubmission(practice.submissionSchema, rawContent);
  timing.mark("practice_resolve_attempt_ms");

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
  timing.mark("attempt_and_submission_write_ms");

  try {
    const evaluationStartedAt = performance.now();
    const [, evaluated] = await Promise.all([
      recordLearningEvent({
        userId,
        lessonId: practice.lessonId,
        eventName: "submission_created",
        targetType: "PRACTICE_SUBMISSION",
        targetId: submission.id,
        properties: { practiceId, practiceType: practice.type, attempt: submission.attempt }
      }),
      evaluateResolvedPracticeSubmission(
        userId,
        {
          submissionId: submission.id,
          practiceId,
          lessonId: practice.lessonId,
          attempt: submission.attempt,
          content,
          rubric: practice.rubric,
          passScore: practice.passScore,
          submissionSchema: practice.submissionSchema
        },
        evaluator
      )
    ]);
    timing.set("evaluation_chain_ms", Math.round(performance.now() - evaluationStartedAt));
    timing.finish({ status: evaluated.status });
    return {
      attempt: submission.attempt,
      content,
      ...evaluated
    };
  } catch {
    timing.finish({ status: "EVALUATION_FAILED" });
    return {
      submissionId: submission.id,
      attempt: submission.attempt,
      content,
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
  const db = getDatabase();
  if (!userId) {
    const required = await db
      .select({ id: lessonChecks.id })
      .from(lessonChecks)
      .where(
        and(
          eq(lessonChecks.lessonId, lessonId),
          eq(lessonChecks.required, true),
          eq(lessonChecks.status, "PUBLISHED")
        )
      )
      .orderBy(asc(lessonChecks.order));
    return {
      configured: required.length > 0,
      passed: false,
      requiredIds: required.map((item) => item.id)
    };
  }

  const rows = await db
    .select({
      id: lessonChecks.id,
      isCorrect: lessonCheckResponses.isCorrect
    })
    .from(lessonChecks)
    .leftJoin(
      lessonCheckResponses,
      and(
        eq(lessonCheckResponses.checkId, lessonChecks.id),
        eq(lessonCheckResponses.userId, userId)
      )
    )
    .where(
      and(
        eq(lessonChecks.lessonId, lessonId),
        eq(lessonChecks.required, true),
        eq(lessonChecks.status, "PUBLISHED")
      )
    )
    .orderBy(asc(lessonChecks.order));

  return {
    configured: rows.length > 0,
    passed: rows.length > 0 && rows.every((row) => row.isCorrect === true),
    requiredIds: rows.map((row) => row.id)
  };
}

export async function getRequiredPracticeGateState(
  userId: string | null,
  lessonId: string
): Promise<RequiredGateState> {
  const db = getDatabase();
  if (!userId) {
    const required = await db
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
    return {
      configured: required.length > 0,
      passed: false,
      requiredIds: required.map((item) => item.id)
    };
  }

  const rows = await db
    .select({
      id: practices.id,
      passedSubmissionId: practiceSubmissions.id
    })
    .from(practices)
    .leftJoin(
      practiceSubmissions,
      and(
        eq(practiceSubmissions.practiceId, practices.id),
        eq(practiceSubmissions.userId, userId),
        eq(practiceSubmissions.status, "PASSED")
      )
    )
    .where(
      and(
        eq(practices.lessonId, lessonId),
        eq(practices.type, "LESSON_PRACTICE"),
        eq(practices.required, true),
        eq(practices.status, "PUBLISHED")
      )
    );

  const requiredIds = [...new Set(rows.map((row) => row.id))];
  const passedIds = new Set(
    rows.filter((row) => row.passedSubmissionId).map((row) => row.id)
  );
  return {
    configured: requiredIds.length > 0,
    passed:
      requiredIds.length > 0 &&
      requiredIds.every((practiceId) => passedIds.has(practiceId)),
    requiredIds
  };
}

export async function hasPassedRequiredChecks(userId: string, lessonId: string) {
  const state = await getRequiredCheckGateState(userId, lessonId);
  return !state.configured || state.passed;
}

export async function hasPassedRequiredPractices(userId: string, lessonId: string) {
  const state = await getRequiredPracticeGateState(userId, lessonId);
  return !state.configured || state.passed;
}


















