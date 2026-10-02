import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  courseInsights,
  learningEvents,
  learningFeedback,
  lessonCheckResponses,
  lessonChecks,
  practiceEvaluations,
  practiceSubmissions,
  practices,
  userIdentities,
  users
} from "../db/schema";

export type EffectiveEvidenceMode = "PRODUCTION" | "ACCEPTANCE";
export type EffectiveEvidenceStatus =
  | "VALID"
  | "SUPPORTING_ONLY"
  | "INSUFFICIENT_SAMPLE"
  | "EXCLUDED"
  | "UNAVAILABLE";

export type EffectiveEvidenceItem = {
  evidence_ref: string;
  source_type:
    | "LEARNING_ISSUE"
    | "TRUSTED_REVIEW_FEEDBACK"
    | "LEARNER_FEEDBACK"
    | "HELPFULNESS"
    | "CHECK"
    | "PRACTICE"
    | "LEARNING_EVENT";
  human_readable_source: string;
  evidence_status: "VALID" | "SUPPORTING_ONLY";
  content: unknown;
  occurred_at: string | null;
  source_owner: string;
};

export type EffectiveIssueItem = {
  issue_id: string;
  issue_type: string;
  status: string;
  occurred_at: string;
  updated_at: string;
  evidence_refs: string[];
};

export type EffectiveEvidenceExclusion = {
  source_type: string;
  reason:
    | "NON_PRODUCTION_ORIGIN"
    | "INELIGIBLE_USER"
    | "INSUFFICIENT_SAMPLE"
    | "EMPTY_CONTENT"
    | "EVENT_NOT_ALLOWED"
    | "BELOW_SIGNAL_THRESHOLD";
  count: number;
};

export type EffectiveLearningEvidenceSet = {
  courseKey: string;
  mode: EffectiveEvidenceMode;
  issues: EffectiveIssueItem[];
  evidence_catalog: EffectiveEvidenceItem[];
  deterministic_metrics: Record<string, number | null>;
  data_availability: {
    available_fields: string[];
    unavailable_fields: string[];
    source_owners: Record<string, string>;
    evidence_governance: {
      mode: EffectiveEvidenceMode;
      eligible_evidence_count: number;
      excluded_evidence_count: number;
      exclusions: EffectiveEvidenceExclusion[];
      feedback_min_users: number;
      behavior_min_users: number;
      check_difficulty_threshold: number;
      practice_first_pass_threshold: number;
      hint_usage_threshold: number;
      helpfulness_threshold: number;
    };
  };
};

const ACTIVE_ISSUE_STATUSES = ["OPEN", "ANALYSIS_READY", "UNDER_REVIEW", "REVIEW_REQUIRED"];
const ACTIVE_REVIEW_STATUSES = ["OPEN", "UNDER_REVIEW"];
const ALLOWED_EVENT_NAMES = ["hint_revealed", "still_confused", "real_ai_evidence_recorded"];
const FEEDBACK_MIN_USERS = 3;
const BEHAVIOR_MIN_USERS = 10;
const CHECK_DIFFICULTY_THRESHOLD = 35;
const PRACTICE_FIRST_PASS_THRESHOLD = 50;
const HINT_USAGE_THRESHOLD = 50;
const HELPFULNESS_THRESHOLD = 25;

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function containsDirtyFlag(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsDirtyFlag);
  if (!value || typeof value !== "object") return false;
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (
      ["acceptance", "simulation", "humanReview", "visualReview", "testOnly", "demo"].includes(key) &&
      item === true
    ) {
      return true;
    }
    if (containsDirtyFlag(item)) return true;
  }
  return false;
}

function dirtyMarker(value: string | null | undefined) {
  if (!value) return false;
  return /(^|[:/_-])(acceptance|demo|simulation|visual-review|human-review|test)([:/_-]|$)/i.test(
    value
  );
}

function productionOriginAllowed(
  mode: EffectiveEvidenceMode,
  input: { issueKey?: string | null; evidence?: unknown; properties?: unknown }
) {
  if (mode === "ACCEPTANCE") return true;
  return (
    !dirtyMarker(input.issueKey) &&
    !containsDirtyFlag(input.evidence) &&
    !containsDirtyFlag(input.properties)
  );
}

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !/user|email|secret|api.?key|decidedby/i.test(key))
      .filter(([key]) => !["acceptance", "simulation", "humanReview", "visualReview", "testOnly"].includes(key))
      .map(([key, item]) => [key, sanitize(item)])
  );
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

function increment(
  map: Map<string, EffectiveEvidenceExclusion>,
  sourceType: string,
  reason: EffectiveEvidenceExclusion["reason"],
  count = 1
) {
  const key = sourceType + ":" + reason;
  const current = map.get(key);
  map.set(key, {
    source_type: sourceType,
    reason,
    count: (current?.count ?? 0) + count
  });
}

function issueAllowed(item: {
  issueKey: string;
  issueCategory: string;
  distinctUserCount: number;
  evidence: unknown;
}) {
  const evidence = asRecord(item.evidence);
  if (item.issueKey === "behavior:check_difficulty") {
    return (
      item.distinctUserCount >= BEHAVIOR_MIN_USERS &&
      typeof evidence.incorrectRate === "number" &&
      evidence.incorrectRate >= CHECK_DIFFICULTY_THRESHOLD
    );
  }
  if (item.issueKey === "behavior:practice_difficulty") {
    return (
      item.distinctUserCount >= BEHAVIOR_MIN_USERS &&
      typeof evidence.firstPassRate === "number" &&
      evidence.firstPassRate < PRACTICE_FIRST_PASS_THRESHOLD
    );
  }
  if (item.issueKey === "behavior:high_hint_usage") {
    return (
      item.distinctUserCount >= BEHAVIOR_MIN_USERS &&
      typeof evidence.hintUsageRate === "number" &&
      evidence.hintUsageRate >= HINT_USAGE_THRESHOLD
    );
  }
  if (item.issueKey === "behavior:low_helpfulness") {
    return (
      item.distinctUserCount >= BEHAVIOR_MIN_USERS &&
      typeof evidence.notHelpfulRate === "number" &&
      evidence.notHelpfulRate >= HELPFULNESS_THRESHOLD
    );
  }
  return item.distinctUserCount >= FEEDBACK_MIN_USERS;
}

function latestByKey<T extends { createdAt: Date }>(rows: T[], keyFor: (row: T) => string) {
  const map = new Map<string, T>();
  for (const row of [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())) {
    const key = keyFor(row);
    if (!map.has(key)) map.set(key, row);
  }
  return Array.from(map.values());
}

export async function buildEffectiveLearningEvidenceSet(
  courseKey: string,
  options: { mode?: EffectiveEvidenceMode } = {}
): Promise<EffectiveLearningEvidenceSet> {
  const mode = options.mode ?? "PRODUCTION";
  const db = getDatabase();
  const exclusions = new Map<string, EffectiveEvidenceExclusion>();

  const [
    identityRows,
    userRows,
    insightRows,
    feedbackRows,
    checkRows,
    practiceRows,
    evaluationRows,
    eventRows
  ] = await Promise.all([
    db.select({ userId: userIdentities.userId }).from(userIdentities),
    db.select({
      id: users.id,
      role: users.role,
      accountStatus: users.accountStatus,
      displayName: users.displayName
    }).from(users),
    db.select({
      id: courseInsights.id,
      issueKey: courseInsights.issueKey,
      issueCategory: courseInsights.issueCategory,
      status: courseInsights.status,
      distinctUserCount: courseInsights.distinctUserCount,
      evidence: courseInsights.evidence,
      createdAt: courseInsights.createdAt,
      updatedAt: courseInsights.updatedAt
    })
      .from(courseInsights)
      .where(
        and(
          eq(courseInsights.lessonId, courseKey),
          inArray(courseInsights.status, ACTIVE_ISSUE_STATUSES)
        )
      )
      .orderBy(courseInsights.createdAt),
    db.select({
      id: learningFeedback.id,
      userId: learningFeedback.userId,
      issueType: learningFeedback.issueType,
      issueKey: learningFeedback.issueKey,
      resolutionStatus: learningFeedback.resolutionStatus,
      helpfulness: learningFeedback.helpfulness,
      reasons: learningFeedback.reasons,
      comment: learningFeedback.comment,
      qualityRisk: learningFeedback.qualityRisk,
      reviewStatus: learningFeedback.reviewStatus,
      createdAt: learningFeedback.createdAt,
      updatedAt: learningFeedback.updatedAt
    })
      .from(learningFeedback)
      .where(eq(learningFeedback.lessonId, courseKey))
      .orderBy(desc(learningFeedback.createdAt)),
    db.select({
      checkId: lessonChecks.id,
      question: lessonChecks.question,
      order: lessonChecks.order,
      status: lessonChecks.status,
      userId: lessonCheckResponses.userId,
      isCorrect: lessonCheckResponses.isCorrect,
      attempts: lessonCheckResponses.attempts
    })
      .from(lessonCheckResponses)
      .innerJoin(lessonChecks, eq(lessonCheckResponses.checkId, lessonChecks.id))
      .where(eq(lessonChecks.lessonId, courseKey)),
    db.select({
      submissionId: practiceSubmissions.id,
      practiceId: practices.id,
      title: practices.title,
      practiceStatus: practices.status,
      userId: practiceSubmissions.userId,
      attempt: practiceSubmissions.attempt,
      status: practiceSubmissions.status
    })
      .from(practiceSubmissions)
      .innerJoin(practices, eq(practiceSubmissions.practiceId, practices.id))
      .where(eq(practices.lessonId, courseKey)),
    db.select({
      submissionId: practiceEvaluations.submissionId,
      score: practiceEvaluations.score
    }).from(practiceEvaluations),
    db.select({
      userId: learningEvents.userId,
      eventName: learningEvents.eventName,
      targetType: learningEvents.targetType,
      properties: learningEvents.properties
    })
      .from(learningEvents)
      .where(eq(learningEvents.lessonId, courseKey))
  ]);

  const identityUsers = new Set(identityRows.map((row) => row.userId));
  const eligibleUsers = new Set(
    userRows
      .filter((row) => {
        if (mode === "ACCEPTANCE") return row.accountStatus === "ACTIVE";
        return (
          row.role === "USER" &&
          row.accountStatus === "ACTIVE" &&
          identityUsers.has(row.id) &&
          !/(acceptance|simulation|visual review|human review|\btest\b|\bdemo\b)/i.test(
            row.displayName ?? ""
          )
        );
      })
      .map((row) => row.id)
  );

  const evidenceCatalog: EffectiveEvidenceItem[] = [];
  const issues: EffectiveIssueItem[] = [];

  const productionInsights = insightRows.filter((row) => {
    if (!productionOriginAllowed(mode, { issueKey: row.issueKey, evidence: row.evidence })) {
      increment(exclusions, "LEARNING_ISSUE", "NON_PRODUCTION_ORIGIN");
      return false;
    }
    if (!issueAllowed(row)) {
      increment(exclusions, "LEARNING_ISSUE", "INSUFFICIENT_SAMPLE");
      return false;
    }
    return true;
  });

  productionInsights.forEach((row, index) => {
    const ref = "issue:" + (index + 1);
    issues.push({
      issue_id: ref,
      issue_type: row.issueCategory,
      status: row.status,
      occurred_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      evidence_refs: [ref]
    });
    evidenceCatalog.push({
      evidence_ref: ref,
      source_type: "LEARNING_ISSUE",
      human_readable_source: "课程问题 · " + row.issueCategory,
      evidence_status: "VALID",
      content: {
        issue_type: row.issueCategory,
        distinct_users: row.distinctUserCount,
        evidence: sanitize(row.evidence)
      },
      occurred_at: row.createdAt.toISOString(),
      source_owner: "courseInsights"
    });
  });

  const trustedRisks = feedbackRows.filter((row) => {
    if (!row.qualityRisk || !ACTIVE_REVIEW_STATUSES.includes(row.reviewStatus)) return false;
    if (!productionOriginAllowed(mode, { issueKey: row.issueKey })) {
      increment(exclusions, "TRUSTED_REVIEW_FEEDBACK", "NON_PRODUCTION_ORIGIN");
      return false;
    }
    if (!row.comment?.trim()) {
      increment(exclusions, "TRUSTED_REVIEW_FEEDBACK", "EMPTY_CONTENT");
      return false;
    }
    return true;
  });

  trustedRisks.forEach((row, index) => {
    const ref = "risk:" + (index + 1);
    issues.push({
      issue_id: ref,
      issue_type: row.issueType,
      status: row.reviewStatus,
      occurred_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      evidence_refs: [ref]
    });
    evidenceCatalog.push({
      evidence_ref: ref,
      source_type: "TRUSTED_REVIEW_FEEDBACK",
      human_readable_source: "人工核查问题",
      evidence_status: "VALID",
      content: {
        issue_type: row.issueType,
        comment: row.comment?.trim()
      },
      occurred_at: row.createdAt.toISOString(),
      source_owner: "learningFeedback"
    });
  });

  const learnerFeedback = feedbackRows.filter((row) => {
    if (row.qualityRisk) return false;
    if (!productionOriginAllowed(mode, { issueKey: row.issueKey })) {
      increment(exclusions, "LEARNER_FEEDBACK", "NON_PRODUCTION_ORIGIN");
      return false;
    }
    if (!eligibleUsers.has(row.userId)) {
      increment(exclusions, "LEARNER_FEEDBACK", "INELIGIBLE_USER");
      return false;
    }
    return true;
  });

  const latestFeedback = latestByKey(
    learnerFeedback,
    (row) => row.userId + ":" + row.issueType + ":" + row.issueKey
  );

  const helpfulnessRows = latestFeedback.filter((row) => row.issueType === "LESSON_HELPFULNESS");
  if (helpfulnessRows.length > 0) {
    const latestHelpfulnessByUser = latestByKey(helpfulnessRows, (row) => row.userId);
    if (latestHelpfulnessByUser.length >= BEHAVIOR_MIN_USERS) {
      const notHelpful = latestHelpfulnessByUser.filter(
        (row) => row.helpfulness === "NOT_HELPFUL"
      ).length;
      const notHelpfulRate = percent(notHelpful, latestHelpfulnessByUser.length) ?? 0;
      evidenceCatalog.push({
        evidence_ref: "helpfulness:1",
        source_type: "HELPFULNESS",
        human_readable_source: "课程帮助度",
        evidence_status:
          notHelpfulRate >= HELPFULNESS_THRESHOLD ? "VALID" : "SUPPORTING_ONLY",
        content: {
          users: latestHelpfulnessByUser.length,
          not_helpful_rate: notHelpfulRate,
          threshold: HELPFULNESS_THRESHOLD
        },
        occurred_at: null,
        source_owner: "learningFeedback"
      });
    } else {
      increment(
        exclusions,
        "HELPFULNESS",
        "INSUFFICIENT_SAMPLE",
        latestHelpfulnessByUser.length
      );
    }
  }

  const commentRows = latestFeedback.filter(
    (row) => row.issueType !== "LESSON_HELPFULNESS" && Boolean(row.comment?.trim())
  );
  const feedbackGroups = new Map<string, typeof commentRows>();
  for (const row of commentRows) {
    const current = feedbackGroups.get(row.issueKey) ?? [];
    current.push(row);
    feedbackGroups.set(row.issueKey, current);
  }
  let feedbackIndex = 0;
  for (const rows of feedbackGroups.values()) {
    const distinctUsers = new Set(rows.map((row) => row.userId)).size;
    if (distinctUsers < FEEDBACK_MIN_USERS) {
      increment(exclusions, "LEARNER_FEEDBACK", "INSUFFICIENT_SAMPLE", rows.length);
      continue;
    }
    feedbackIndex += 1;
    const comments = Array.from(
      new Set(rows.map((row) => row.comment?.trim()).filter((value): value is string => Boolean(value)))
    ).slice(0, 10);
    const reasons = Array.from(
      new Set(
        rows.flatMap((row) =>
          Array.isArray(row.reasons)
            ? row.reasons.filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
            : []
        )
      )
    ).slice(0, 10);
    evidenceCatalog.push({
      evidence_ref: "feedback:" + feedbackIndex,
      source_type: "LEARNER_FEEDBACK",
      human_readable_source:
        rows[0].issueType === "DONT_UNDERSTAND"
          ? "学员反馈：没看懂"
          : rows[0].issueType === "DONT_KNOW_HOW"
            ? "学员反馈：不知道怎么做"
            : rows[0].issueType === "EVALUATION_DISPUTE"
              ? "学员反馈：对检查或评分有疑问"
              : rows[0].issueType === "FIND_RELATED_COURSE"
                ? "学员反馈：想找到相关课程"
                : "学员反馈：其它问题",
      evidence_status: "VALID",
      content: {
        issue_type: rows[0].issueType,
        distinct_users: distinctUsers,
        comments,
        reasons
      },
      occurred_at: rows[0].createdAt.toISOString(),
      source_owner: "learningFeedback"
    });
  }

  const validCheckRows = checkRows.filter((row) => {
    if (row.status !== "PUBLISHED") return false;
    if (!eligibleUsers.has(row.userId)) {
      increment(exclusions, "CHECK", "INELIGIBLE_USER");
      return false;
    }
    return true;
  });
  const checks = new Map<string, {
    question: string;
    order: number;
    users: Set<string>;
    responses: number;
    incorrect: number;
    attempts: number;
  }>();
  for (const row of validCheckRows) {
    const current = checks.get(row.checkId) ?? {
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
    checks.set(row.checkId, current);
  }
  let checkIndex = 0;
  for (const item of Array.from(checks.values()).sort((a, b) => a.order - b.order)) {
    if (item.users.size < BEHAVIOR_MIN_USERS) {
      increment(exclusions, "CHECK", "INSUFFICIENT_SAMPLE", item.users.size);
      continue;
    }
    checkIndex += 1;
    const incorrectRate = percent(item.incorrect, item.responses) ?? 0;
    evidenceCatalog.push({
      evidence_ref: "check:" + checkIndex,
      source_type: "CHECK",
      human_readable_source: "检查理解 · 第 " + item.order + " 题",
      evidence_status:
        incorrectRate >= CHECK_DIFFICULTY_THRESHOLD ? "VALID" : "SUPPORTING_ONLY",
      content: {
        question: item.question,
        users: item.users.size,
        responses: item.responses,
        incorrect_rate: incorrectRate,
        threshold: CHECK_DIFFICULTY_THRESHOLD,
        attempts: item.attempts
      },
      occurred_at: null,
      source_owner: "lessonCheckResponses"
    });
  }

  const validPracticeRows = practiceRows.filter((row) => {
    if (row.practiceStatus !== "PUBLISHED") return false;
    if (!eligibleUsers.has(row.userId)) {
      increment(exclusions, "PRACTICE", "INELIGIBLE_USER");
      return false;
    }
    return true;
  });
  const evaluationBySubmission = new Map(
    evaluationRows.map((row) => [row.submissionId, row.score])
  );
  const practiceGroups = new Map<string, {
    title: string;
    users: Set<string>;
    submissions: number;
    firstAttempts: number;
    firstPasses: number;
    retryUsers: Set<string>;
    scores: number[];
  }>();
  for (const row of validPracticeRows) {
    const current = practiceGroups.get(row.practiceId) ?? {
      title: row.title,
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
    } else {
      current.retryUsers.add(row.userId);
    }
    const score = evaluationBySubmission.get(row.submissionId);
    if (typeof score === "number") current.scores.push(score);
    practiceGroups.set(row.practiceId, current);
  }
  let practiceIndex = 0;
  for (const item of practiceGroups.values()) {
    if (item.users.size < BEHAVIOR_MIN_USERS) {
      increment(exclusions, "PRACTICE", "INSUFFICIENT_SAMPLE", item.users.size);
      continue;
    }
    practiceIndex += 1;
    const firstPassRate = percent(item.firstPasses, item.firstAttempts);
    evidenceCatalog.push({
      evidence_ref: "practice:" + practiceIndex,
      source_type: "PRACTICE",
      human_readable_source: "实操 · " + item.title,
      evidence_status:
        firstPassRate !== null && firstPassRate < PRACTICE_FIRST_PASS_THRESHOLD
          ? "VALID"
          : "SUPPORTING_ONLY",
      content: {
        participants: item.users.size,
        submissions: item.submissions,
        first_pass_rate: firstPassRate,
        threshold: PRACTICE_FIRST_PASS_THRESHOLD,
        retry_users: item.retryUsers.size,
        average_score:
          item.scores.length > 0
            ? Math.round(item.scores.reduce((sum, value) => sum + value, 0) / item.scores.length)
            : null
      },
      occurred_at: null,
      source_owner: "practiceSubmissions"
    });
  }

  const allowedEvents = eventRows.filter((row) => {
    if (!ALLOWED_EVENT_NAMES.includes(row.eventName)) {
      increment(exclusions, "LEARNING_EVENT", "EVENT_NOT_ALLOWED");
      return false;
    }
    if (!productionOriginAllowed(mode, { properties: row.properties })) {
      increment(exclusions, "LEARNING_EVENT", "NON_PRODUCTION_ORIGIN");
      return false;
    }
    if (!eligibleUsers.has(row.userId)) {
      increment(exclusions, "LEARNING_EVENT", "INELIGIBLE_USER");
      return false;
    }
    return true;
  });

  const eventGroups = new Map<string, {
    users: Set<string>;
    count: number;
    targetTypes: Set<string>;
  }>();
  for (const row of allowedEvents) {
    const current = eventGroups.get(row.eventName) ?? {
      users: new Set<string>(),
      count: 0,
      targetTypes: new Set<string>()
    };
    current.users.add(row.userId);
    current.count += 1;
    if (row.targetType) current.targetTypes.add(row.targetType);
    eventGroups.set(row.eventName, current);
  }

  let eventIndex = 0;
  for (const [eventName, item] of eventGroups.entries()) {
    let status: "VALID" | "SUPPORTING_ONLY" | null = null;
    const content: Record<string, unknown> = {
      event_name: eventName,
      count: item.count,
      distinct_users: item.users.size,
      target_types: Array.from(item.targetTypes)
    };

    if (eventName === "hint_revealed") {
      const practiceUsers = new Set(validPracticeRows.map((row) => row.userId)).size;
      if (practiceUsers < BEHAVIOR_MIN_USERS) {
        increment(exclusions, "LEARNING_EVENT", "INSUFFICIENT_SAMPLE", item.users.size);
        continue;
      }
      const rate = percent(item.users.size, practiceUsers) ?? 0;
      content.hint_usage_rate = rate;
      content.practice_users = practiceUsers;
      content.threshold = HINT_USAGE_THRESHOLD;
      status = rate >= HINT_USAGE_THRESHOLD ? "VALID" : "SUPPORTING_ONLY";
    } else {
      if (item.users.size < FEEDBACK_MIN_USERS) {
        increment(exclusions, "LEARNING_EVENT", "INSUFFICIENT_SAMPLE", item.users.size);
        continue;
      }
      status = "SUPPORTING_ONLY";
    }

    eventIndex += 1;
    evidenceCatalog.push({
      evidence_ref: "event:" + eventIndex,
      source_type: "LEARNING_EVENT",
      human_readable_source:
        eventName === "hint_revealed"
          ? "学习行为 · 使用提示"
          : eventName === "still_confused"
            ? "学习行为 · 仍然困惑"
            : "学习行为 · AI 实操证据",
      evidence_status: status,
      content,
      occurred_at: null,
      source_owner: "learningEvents"
    });
  }

  issues.sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));

  const checkUsers = new Set(validCheckRows.map((row) => row.userId)).size;
  const checkIncorrectRate = percent(
    validCheckRows.filter((row) => !row.isCorrect).length,
    validCheckRows.length
  );
  const practiceUsers = new Set(validPracticeRows.map((row) => row.userId)).size;
  const firstAttempts = validPracticeRows.filter((row) => row.attempt === 1);
  const eventUsers = new Set(allowedEvents.map((row) => row.userId)).size;

  const deterministicMetrics: Record<string, number | null> = {
    feedback_count: learnerFeedback.length,
    feedback_users: new Set(learnerFeedback.map((row) => row.userId)).size,
    check_users: checkUsers,
    check_incorrect_rate: checkIncorrectRate,
    check_attempts: validCheckRows.reduce((sum, row) => sum + row.attempts, 0),
    practice_users: practiceUsers,
    practice_submissions: validPracticeRows.length,
    practice_first_pass_rate: percent(
      firstAttempts.filter((row) => row.status === "PASSED").length,
      firstAttempts.length
    ),
    practice_retry_users: new Set(
      validPracticeRows.filter((row) => row.attempt > 1).map((row) => row.userId)
    ).size,
    learning_event_users: eventUsers,
    learning_event_count: allowedEvents.length
  };

  const hasFeedbackEvidence = evidenceCatalog.some(
    (item) => item.source_type === "LEARNER_FEEDBACK" || item.source_type === "HELPFULNESS"
  );
  const hasBehaviorEvidence = evidenceCatalog.some((item) =>
    ["CHECK", "PRACTICE", "LEARNING_EVENT"].includes(item.source_type)
  );
  const availableFields = ["effective_evidence_set"];
  const unavailableFields = ["recent_7d_count", "recent_30d_count", "completion_rate"];

  if (issues.length > 0) {
    availableFields.push("course_issue_bundle", "course_issue_timeline");
  } else {
    unavailableFields.push("course_issue_bundle", "course_issue_timeline");
  }

  if (evidenceCatalog.length > 0) availableFields.push("evidence_catalog");
  else unavailableFields.push("evidence_catalog");

  if (hasFeedbackEvidence) availableFields.push("learning_feedback");
  else unavailableFields.push("learning_feedback");

  if (hasBehaviorEvidence) {
    availableFields.push("learning_behavior", "deterministic_metrics");
  } else {
    unavailableFields.push("learning_behavior", "deterministic_metrics");
  }

  return {
    courseKey,
    mode,
    issues,
    evidence_catalog: evidenceCatalog,
    deterministic_metrics: deterministicMetrics,
    data_availability: {
      available_fields: availableFields,
      unavailable_fields: unavailableFields,
      source_owners: {
        course_issue_bundle: "courseInsights + learningFeedback",
        course_issue_timeline: "courseInsights + learningFeedback",
        effective_evidence_set: "learning-insights/effective-evidence",
        evidence_catalog: "learning-insights/effective-evidence",
        deterministic_metrics: "learning-insights/effective-evidence"
      },
      evidence_governance: {
        mode,
        eligible_evidence_count: evidenceCatalog.length,
        excluded_evidence_count: Array.from(exclusions.values()).reduce(
          (sum, item) => sum + item.count,
          0
        ),
        exclusions: Array.from(exclusions.values()).sort((a, b) =>
          (a.source_type + a.reason).localeCompare(b.source_type + b.reason)
        ),
        feedback_min_users: FEEDBACK_MIN_USERS,
        behavior_min_users: BEHAVIOR_MIN_USERS,
        check_difficulty_threshold: CHECK_DIFFICULTY_THRESHOLD,
        practice_first_pass_threshold: PRACTICE_FIRST_PASS_THRESHOLD,
        hint_usage_threshold: HINT_USAGE_THRESHOLD,
        helpfulness_threshold: HELPFULNESS_THRESHOLD
      }
    }
  };
}
