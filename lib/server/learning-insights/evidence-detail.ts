import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  courseInsights,
  learningEvents,
  learningFeedback,
  lessonProgress,
  lessonCheckResponses,
  lessonChecks,
  lessons,
  practiceEvaluations,
  practiceSubmissions,
  practices
} from "../db/schema";

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : null;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function getLearningInsightEvidenceDetail(insightId: string) {
  const db = getDatabase();
  const [insight] = await db
    .select({
      id: courseInsights.id,
      lessonId: courseInsights.lessonId,
      lessonTitle: lessons.title,
      issueKey: courseInsights.issueKey,
      issueCategory: courseInsights.issueCategory,
      status: courseInsights.status,
      distinctUserCount: courseInsights.distinctUserCount,
      evidence: courseInsights.evidence,
      diagnosis: courseInsights.diagnosis,
      analysisMode: courseInsights.analysisMode,
      updatedAt: courseInsights.updatedAt
    })
    .from(courseInsights)
    .innerJoin(lessons, eq(courseInsights.lessonId, lessons.id))
    .where(eq(courseInsights.id, insightId))
    .limit(1);

  if (!insight) throw new Error("INSIGHT_NOT_FOUND");

  const [feedbackRows, progressRows, checkRows, practiceRows, evaluationRows, eventRows] =
    await Promise.all([
      db
        .select({
          userId: learningFeedback.userId,
          issueType: learningFeedback.issueType,
          targetType: learningFeedback.targetType,
          targetId: learningFeedback.targetId,
          resolutionStatus: learningFeedback.resolutionStatus,
          helpfulness: learningFeedback.helpfulness,
          reasons: learningFeedback.reasons,
          comment: learningFeedback.comment,
          qualityRisk: learningFeedback.qualityRisk,
          createdAt: learningFeedback.createdAt
        })
        .from(learningFeedback)
        .where(eq(learningFeedback.lessonId, insight.lessonId))
        .orderBy(desc(learningFeedback.createdAt)),
      db
        .select({
          userId: lessonProgress.userId,
          status: lessonProgress.status,
          currentStep: lessonProgress.currentStep,
          startedAt: lessonProgress.startedAt,
          completedAt: lessonProgress.completedAt
        })
        .from(lessonProgress)
        .where(eq(lessonProgress.lessonId, insight.lessonId)),
      db
        .select({
          userId: lessonCheckResponses.userId,
          checkId: lessonChecks.id,
          question: lessonChecks.question,
          order: lessonChecks.order,
          isCorrect: lessonCheckResponses.isCorrect,
          attempts: lessonCheckResponses.attempts,
          updatedAt: lessonCheckResponses.updatedAt
        })
        .from(lessonCheckResponses)
        .innerJoin(lessonChecks, eq(lessonCheckResponses.checkId, lessonChecks.id))
        .where(eq(lessonChecks.lessonId, insight.lessonId))
        .orderBy(lessonChecks.order),
      db
        .select({
          submissionId: practiceSubmissions.id,
          userId: practiceSubmissions.userId,
          practiceId: practices.id,
          practiceTitle: practices.title,
          attempt: practiceSubmissions.attempt,
          status: practiceSubmissions.status,
          createdAt: practiceSubmissions.createdAt
        })
        .from(practiceSubmissions)
        .innerJoin(practices, eq(practiceSubmissions.practiceId, practices.id))
        .where(eq(practices.lessonId, insight.lessonId))
        .orderBy(desc(practiceSubmissions.createdAt)),
      db
        .select({
          submissionId: practiceEvaluations.submissionId,
          score: practiceEvaluations.score,
          passed: practiceEvaluations.passed
        })
        .from(practiceEvaluations)
        .innerJoin(
          practiceSubmissions,
          eq(practiceEvaluations.submissionId, practiceSubmissions.id)
        )
        .innerJoin(practices, eq(practiceSubmissions.practiceId, practices.id))
        .where(eq(practices.lessonId, insight.lessonId)),
      db
        .select({
          userId: learningEvents.userId,
          eventName: learningEvents.eventName,
          targetType: learningEvents.targetType,
          targetId: learningEvents.targetId,
          createdAt: learningEvents.createdAt
        })
        .from(learningEvents)
        .where(eq(learningEvents.lessonId, insight.lessonId))
        .orderBy(desc(learningEvents.createdAt))
        .limit(300)
    ]);

  const checksById = new Map<
    string,
    {
      checkId: string;
      question: string;
      order: number;
      users: Set<string>;
      responses: number;
      incorrect: number;
      attempts: number;
    }
  >();
  for (const row of checkRows) {
    const current = checksById.get(row.checkId) ?? {
      checkId: row.checkId,
      question: row.question,
      order: row.order,
      users: new Set<string>(),
      responses: 0,
      incorrect: 0,
      attempts: 0
    };
    current.users.add(row.userId);
    current.responses += 1;
    if (!row.isCorrect) current.incorrect += 1;
    current.attempts += row.attempts;
    checksById.set(row.checkId, current);
  }

  const evaluationBySubmission = new Map<string, { score: number; passed: boolean }>();
  for (const row of evaluationRows) {
    evaluationBySubmission.set(row.submissionId, {
      score: row.score,
      passed: row.passed
    });
  }

  const practicesById = new Map<
    string,
    {
      practiceId: string;
      title: string;
      users: Set<string>;
      submissions: number;
      firstAttempts: number;
      firstPasses: number;
      retryUsers: Set<string>;
      scores: number[];
    }
  >();
  for (const row of practiceRows) {
    const current = practicesById.get(row.practiceId) ?? {
      practiceId: row.practiceId,
      title: row.practiceTitle,
      users: new Set<string>(),
      submissions: 0,
      firstAttempts: 0,
      firstPasses: 0,
      retryUsers: new Set<string>(),
      scores: []
    };
    current.users.add(row.userId);
    current.submissions += 1;
    if (row.attempt === 1) {
      current.firstAttempts += 1;
      if (row.status === "PASSED") current.firstPasses += 1;
    }
    if (row.attempt > 1) current.retryUsers.add(row.userId);
    const evaluation = evaluationBySubmission.get(row.submissionId);
    if (evaluation) current.scores.push(evaluation.score);
    practicesById.set(row.practiceId, current);
  }

  const eventsByName = new Map<
    string,
    { eventName: string; users: Set<string>; count: number; targetTypes: Set<string> }
  >();
  for (const row of eventRows) {
    const current = eventsByName.get(row.eventName) ?? {
      eventName: row.eventName,
      users: new Set<string>(),
      count: 0,
      targetTypes: new Set<string>()
    };
    current.users.add(row.userId);
    current.count += 1;
    if (row.targetType) current.targetTypes.add(row.targetType);
    eventsByName.set(row.eventName, current);
  }

  const checkItems = Array.from(checksById.values())
    .map((item) => ({
      checkId: item.checkId,
      question: item.question,
      order: item.order,
      users: item.users.size,
      responses: item.responses,
      incorrectRate: percent(item.incorrect, item.responses),
      attempts: item.attempts
    }))
    .sort((left, right) => {
      const rateDiff = (right.incorrectRate ?? -1) - (left.incorrectRate ?? -1);
      return rateDiff !== 0 ? rateDiff : left.order - right.order;
    });

  const practiceItems = Array.from(practicesById.values()).map((item) => ({
    practiceId: item.practiceId,
    title: item.title,
    participants: item.users.size,
    submissions: item.submissions,
    firstPassRate: percent(item.firstPasses, item.firstAttempts),
    retryUsers: item.retryUsers.size,
    averageScore: average(item.scores)
  }));

  const eventItems = Array.from(eventsByName.values())
    .map((item) => ({
      eventName: item.eventName,
      count: item.count,
      distinctUsers: item.users.size,
      targetTypes: Array.from(item.targetTypes)
    }))
    .sort((left, right) => right.count - left.count);

  const checkRespondents = new Set(checkRows.map((row) => row.userId)).size;
  const checkIncorrect = checkRows.filter((row) => !row.isCorrect).length;
  const practiceParticipants = new Set(practiceRows.map((row) => row.userId)).size;
  const firstAttempts = practiceRows.filter((row) => row.attempt === 1);
  const retryUsers = new Set(
    practiceRows.filter((row) => row.attempt > 1).map((row) => row.userId)
  ).size;
  const reachedUsers = new Set(
    progressRows
      .filter((row) => row.startedAt !== null || row.status !== "NOT_STARTED")
      .map((row) => row.userId)
  ).size;
  const completedUsers = new Set(
    progressRows.filter((row) => row.status === "COMPLETED").map((row) => row.userId)
  ).size;
  const checkRetryUsers = new Set(
    checkRows.filter((row) => row.attempts > 1).map((row) => row.userId)
  ).size;
  const aiEvidenceRows = eventRows.filter(
    (row) => row.eventName === "real_ai_evidence_recorded"
  );
  const aiEvidenceUsers = new Set(aiEvidenceRows.map((row) => row.userId)).size;

  return {
    insight: {
      ...insight,
      updatedAt: insight.updatedAt.toISOString()
    },
    summary: {
      feedbackUsers: new Set(feedbackRows.map((row) => row.userId)).size,
      feedbackCount: feedbackRows.length,
      checkUsers: checkRespondents,
      checkIncorrectRate: percent(checkIncorrect, checkRows.length),
      checkAttempts: checkRows.reduce((sum, row) => sum + row.attempts, 0),
      practiceUsers: practiceParticipants,
      practiceSubmissions: practiceRows.length,
      practiceFirstPassRate: percent(
        firstAttempts.filter((row) => row.status === "PASSED").length,
        firstAttempts.length
      ),
      practiceRetryUsers: retryUsers,
      eventUsers: new Set(eventRows.map((row) => row.userId)).size,
      eventCount: eventRows.length
    },
    behaviors: {
      reachedUsers,
      completedUsers,
      checkRetryUsers,
      practiceUsers: practiceParticipants,
      practiceRetryUsers: retryUsers,
      aiEvidenceUsers,
      aiEvidenceCount: aiEvidenceRows.length
    },
    feedback: feedbackRows.map((row) => ({
      issueType: row.issueType,
      targetType: row.targetType,
      targetId: row.targetId,
      resolutionStatus: row.resolutionStatus,
      helpfulness: row.helpfulness,
      reasons: Array.isArray(row.reasons)
        ? row.reasons.filter((item): item is string => typeof item === "string")
        : [],
      comment: row.comment,
      qualityRisk: row.qualityRisk,
      createdAt: row.createdAt.toISOString()
    })),
    checks: checkItems,
    practices: practiceItems,
    events: eventItems
  };
}
