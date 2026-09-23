import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  practiceEvaluations,
  practiceSubmissions,
  practices
} from "../db/schema";
import {
  readPracticeAccessRow,
  resolvePracticeAccess,
  resolvePracticeAccessRow
} from "./access";

export async function getLatestPracticeSubmission(userId: string, practiceId: string) {
  const [submission] = await getDatabase()
    .select({
      id: practiceSubmissions.id,
      attempt: practiceSubmissions.attempt,
      content: practiceSubmissions.content,
      status: practiceSubmissions.status,
      createdAt: practiceSubmissions.createdAt,
      updatedAt: practiceSubmissions.updatedAt
    })
    .from(practiceSubmissions)
    .where(
      and(
        eq(practiceSubmissions.userId, userId),
        eq(practiceSubmissions.practiceId, practiceId)
      )
    )
    .orderBy(desc(practiceSubmissions.attempt))
    .limit(1);

  if (!submission) return null;

  const [evaluation] = await getDatabase()
    .select({
      evaluatorType: practiceEvaluations.evaluatorType,
      score: practiceEvaluations.score,
      passed: practiceEvaluations.passed,
      result: practiceEvaluations.result,
      createdAt: practiceEvaluations.createdAt
    })
    .from(practiceEvaluations)
    .where(eq(practiceEvaluations.submissionId, submission.id))
    .orderBy(desc(practiceEvaluations.createdAt))
    .limit(1);

  return {
    ...submission,
    evaluation: evaluation ?? null
  };
}

export async function getPracticeForSubmission(userId: string, practiceId: string) {
  const row = await readPracticeAccessRow(practiceId);
  if (!row) throw new Error("PRACTICE_NOT_FOUND");

  const access = await resolvePracticeAccessRow(userId, row);
  if (!access.allowed) {
    if (access.reason === "MEMBERSHIP_REQUIRED") throw new Error("MEMBERSHIP_REQUIRED");
    if (access.reason === "STAGE_PREREQUISITE_REQUIRED") throw new Error("STAGE_PREREQUISITE_REQUIRED");
    if (access.reason === "LESSON_LOCKED") throw new Error("LESSON_LOCKED");
    if (access.reason === "SOURCE_NOT_PUBLISHED") throw new Error("PRACTICE_SOURCE_NOT_PUBLISHED");
    throw new Error("PRACTICE_OWNERSHIP_INVALID");
  }

  return {
    practice: {
      id: row.id,
      type: row.type,
      accessTier: row.accessTier,
      lessonId: row.lessonId,
      stageId: row.stageId,
      sourceContentId: row.sourceContentId,
      sourceKnowledgeId: row.sourceKnowledgeId,
      title: row.title,
      goal: row.goal,
      instructions: row.instructions,
      hints: row.hints,
      rubric: row.rubric,
      submissionSchema: row.submissionSchema,
      passScore: row.passScore,
      required: row.required
    },
    access
  };
}
export async function getPracticeReadModel(userId: string | null, practiceId: string) {
  const access = await resolvePracticeAccess(userId, practiceId);
  const [practice] = await getDatabase()
    .select({
      id: practices.id,
      type: practices.type,
      accessTier: practices.accessTier,
      title: practices.title,
      goal: practices.goal,
      instructions: practices.instructions,
      hints: practices.hints,
      rubric: practices.rubric,
      submissionSchema: practices.submissionSchema,
      passScore: practices.passScore,
      required: practices.required,
      lessonId: practices.lessonId,
      stageId: practices.stageId,
      sourceContentId: practices.sourceContentId,
      sourceKnowledgeId: practices.sourceKnowledgeId
    })
    .from(practices)
    .where(and(eq(practices.id, practiceId), eq(practices.status, "PUBLISHED")))
    .limit(1);

  if (!practice) throw new Error("PRACTICE_NOT_FOUND");

  const latestSubmission = userId
    ? await getLatestPracticeSubmission(userId, practiceId)
    : null;

  if (!access.allowed) {
    return {
      id: practice.id,
      type: practice.type,
      accessTier: practice.accessTier,
      title: practice.title,
      goal: practice.goal,
      ownership: {
        lessonId: practice.lessonId,
        stageId: practice.stageId,
        sourceContentId: practice.sourceContentId,
        sourceKnowledgeId: practice.sourceKnowledgeId
      },
      access,
      content: null,
      latestSubmission
    };
  }

  return {
    id: practice.id,
    type: practice.type,
    accessTier: practice.accessTier,
    title: practice.title,
    goal: practice.goal,
    ownership: {
      lessonId: practice.lessonId,
      stageId: practice.stageId,
      sourceContentId: practice.sourceContentId,
      sourceKnowledgeId: practice.sourceKnowledgeId
    },
    access,
    content: {
      instructions: practice.instructions,
      hints: practice.hints,
      rubric: practice.rubric,
      submissionSchema: practice.submissionSchema,
      passScore: practice.passScore,
      required: practice.required
    },
    latestSubmission
  };
}
