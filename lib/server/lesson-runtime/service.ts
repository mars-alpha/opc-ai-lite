import "server-only";

import { and, desc, eq } from "drizzle-orm";
import type { RealAiEvidence } from "../../learning/lesson-spec";
import { getLessonSpec } from "../../learning/lesson-spec-registry";
import {
  buildLessonRuntimePlan,
  isRealAiEvidenceRuntimeSupported
} from "../../learning/lesson-runtime";
import { getDatabase } from "../db";
import {
  learningEvents,
  lessons,
  modules,
  stages
} from "../db/schema";
import { getLessonAccess } from "../entitlements/service";
import {
  getRequiredCheckGateState,
  getRequiredPracticeGateState
} from "../interactive/service";
import { recordLearningEvent } from "../learning-insights/service";

type EvidenceProperties = {
  evidenceKind?: unknown;
  source?: unknown;
  confirmed?: unknown;
  artifactRef?: unknown;
  resultRef?: unknown;
};

async function getPublishedLessonIdentity(courseSlug: string, lessonSlug: string) {
  const [row] = await getDatabase()
    .select({
      lessonId: lessons.id,
      lessonSlug: lessons.slug,
      courseSlug: stages.slug
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

  if (!row) throw new Error("LESSON_NOT_FOUND");
  return row;
}

async function assertLessonRuntimeAccess(
  userId: string | null,
  courseSlug: string,
  lessonSlug: string
) {
  const access = await getLessonAccess(userId, courseSlug, lessonSlug);
  if (access.allowed) return;
  throw new Error(
    access.reason === "PREREQUISITE_STAGE_REQUIRED"
      ? "STAGE_PREREQUISITE_REQUIRED"
      : "LESSON_LOCKED"
  );
}

function evidenceMatches(
  properties: unknown,
  evidenceKind: RealAiEvidence
) {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    return false;
  }

  const value = properties as EvidenceProperties;
  if (value.evidenceKind !== evidenceKind) return false;

  if (evidenceKind === "USER_CONFIRMATION") {
    return value.source === "USER" && value.confirmed === true;
  }
  if (evidenceKind === "ARTIFACT") {
    return false;
  }
  if (evidenceKind === "SYSTEM_RESULT") {
    return (
      value.source === "SYSTEM" &&
      typeof value.resultRef === "string" &&
      Boolean(value.resultRef.trim())
    );
  }

  return evidenceKind === "NONE";
}

export async function getRealAiEvidenceState(
  userId: string | null,
  lessonId: string,
  evidenceKind: RealAiEvidence
) {
  if (evidenceKind === "NONE") {
    return { required: false, satisfied: true, evidenceKind, latest: null };
  }
  if (!userId) {
    return { required: true, satisfied: false, evidenceKind, latest: null };
  }

  const rows = await getDatabase()
    .select({
      properties: learningEvents.properties,
      createdAt: learningEvents.createdAt
    })
    .from(learningEvents)
    .where(
      and(
        eq(learningEvents.userId, userId),
        eq(learningEvents.lessonId, lessonId),
        eq(learningEvents.eventName, "real_ai_evidence_recorded"),
        eq(learningEvents.targetType, "LESSON"),
        eq(learningEvents.targetId, lessonId)
      )
    )
    .orderBy(desc(learningEvents.createdAt));

  const latest = rows.find((row) => evidenceMatches(row.properties, evidenceKind)) ?? null;
  return {
    required: true,
    satisfied: Boolean(latest),
    evidenceKind,
    latest
  };
}

export async function getLessonRuntimeReadModel(
  userId: string | null,
  courseSlug: string,
  lessonSlug: string
) {
  const lesson = await getPublishedLessonIdentity(courseSlug, lessonSlug);
  await assertLessonRuntimeAccess(userId, courseSlug, lessonSlug);
  const spec = getLessonSpec(courseSlug, lessonSlug);
  const [checkGate, practiceGate] = await Promise.all([
    getRequiredCheckGateState(userId, lesson.lessonId),
    getRequiredPracticeGateState(userId, lesson.lessonId)
  ]);

  if (!spec) {
    return {
      registered: false,
      lessonId: lesson.lessonId,
      spec: null,
      plan: null,
      gates: {
        check: checkGate,
        practice: practiceGate,
        realAi: { required: false, satisfied: true, evidenceKind: "NONE", latest: null }
      },
      configurationReady: true,
      enforcementActive: false,
      blockers: [] as string[]
    };
  }

  const plan = buildLessonRuntimePlan(spec);
  const realAi = await getRealAiEvidenceState(
    userId,
    lesson.lessonId,
    plan.realAiEvidence
  );
  const blockers: string[] = [];

  if (plan.requiresCheck && !checkGate.configured) {
    blockers.push("CHECK_NOT_CONFIGURED");
  }
  if (plan.requiresPractice && !practiceGate.configured) {
    blockers.push("PRACTICE_NOT_CONFIGURED");
  }
  if (plan.requiresRealAi && !plan.realAiEvidenceSupported) {
    blockers.push("REAL_AI_EVIDENCE_RUNTIME_NOT_SUPPORTED:" + plan.realAiEvidence);
  }

  return {
    registered: true,
    lessonId: lesson.lessonId,
    spec,
    plan,
    gates: {
      check: checkGate,
      practice: practiceGate,
      realAi
    },
    configurationReady: blockers.length === 0,
    enforcementActive: blockers.length === 0,
    blockers
  };
}

function validateReference(value: unknown, errorCode: string) {
  if (typeof value !== "string") throw new Error(errorCode);
  const normalized = value.trim();
  if (!normalized || normalized.length > 1000) throw new Error(errorCode);
  return normalized;
}

export async function recordUserRealAiEvidence(
  userId: string,
  input: {
    courseSlug: string;
    lessonSlug: string;
    evidenceKind: RealAiEvidence;
    confirmed?: boolean;
    artifactRef?: string;
  }
) {
  const lesson = await getPublishedLessonIdentity(input.courseSlug, input.lessonSlug);
  await assertLessonRuntimeAccess(userId, input.courseSlug, input.lessonSlug);
  const spec = getLessonSpec(input.courseSlug, input.lessonSlug);
  if (!spec || spec.realAiOperation !== "REQUIRED") {
    throw new Error("REAL_AI_EVIDENCE_NOT_REQUIRED");
  }
  if (spec.realAiEvidence !== input.evidenceKind || input.evidenceKind === "NONE") {
    throw new Error("REAL_AI_EVIDENCE_KIND_MISMATCH");
  }
  if (input.evidenceKind === "ARTIFACT") {
    throw new Error("ARTIFACT_EVIDENCE_REQUIRES_RESOLVER");
  }
  if (input.evidenceKind === "SYSTEM_RESULT") {
    throw new Error("SYSTEM_RESULT_REQUIRES_TRUSTED_SOURCE");
  }

  const properties: Record<string, unknown> = {
    evidenceKind: input.evidenceKind,
    source: "USER"
  };

  if (input.evidenceKind === "USER_CONFIRMATION") {
    if (input.confirmed !== true) throw new Error("REAL_AI_CONFIRMATION_REQUIRED");
    properties.confirmed = true;
  }

  await recordLearningEvent({
    userId,
    lessonId: lesson.lessonId,
    eventName: "real_ai_evidence_recorded",
    targetType: "LESSON",
    targetId: lesson.lessonId,
    properties
  });

  return getRealAiEvidenceState(
    userId,
    lesson.lessonId,
    spec.realAiEvidence
  );
}

export async function recordTrustedSystemRealAiEvidence(input: {
  userId: string;
  courseSlug: string;
  lessonSlug: string;
  resultRef: string;
}) {
  const lesson = await getPublishedLessonIdentity(input.courseSlug, input.lessonSlug);
  await assertLessonRuntimeAccess(
    input.userId,
    input.courseSlug,
    input.lessonSlug
  );
  const spec = getLessonSpec(input.courseSlug, input.lessonSlug);
  if (
    !spec ||
    spec.realAiOperation !== "REQUIRED" ||
    spec.realAiEvidence !== "SYSTEM_RESULT"
  ) {
    throw new Error("SYSTEM_RESULT_NOT_REQUIRED");
  }

  const resultRef = validateReference(input.resultRef, "INVALID_REAL_AI_RESULT_REF");

  await recordLearningEvent({
    userId: input.userId,
    lessonId: lesson.lessonId,
    eventName: "real_ai_evidence_recorded",
    targetType: "LESSON",
    targetId: lesson.lessonId,
    properties: {
      evidenceKind: "SYSTEM_RESULT",
      source: "SYSTEM",
      resultRef
    }
  });
}

export async function hasRequiredRealAiEvidence(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  lessonId: string
) {
  const spec = getLessonSpec(courseSlug, lessonSlug);
  if (!spec || !spec.completionGates.includes("REAL_AI")) return true;
  if (!isRealAiEvidenceRuntimeSupported(spec.realAiEvidence)) return false;
  const state = await getRealAiEvidenceState(userId, lessonId, spec.realAiEvidence);
  return state.satisfied;
}
