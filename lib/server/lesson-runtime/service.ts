import "server-only";

import { unstable_cache } from "next/cache";

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
  getInteractiveLesson,
  getRequiredCheckGateState,
  getRequiredPracticeGateState
} from "../interactive/service";
import {
  getLessonHelpfulnessStateByLessonId,
  recordLearningEvent
} from "../learning-insights/service";
import { getLessonProgressRuntimeState } from "../learning/service";
import { createRuntimeTiming } from "../runtime-performance";

type EvidenceProperties = {
  evidenceKind?: unknown;
  source?: unknown;
  confirmed?: unknown;
  artifactRef?: unknown;
  resultRef?: unknown;
};

const readPublishedLessonIdentity = unstable_cache(
  async (courseSlug: string, lessonSlug: string) => {
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

    return row ?? null;
  },
  ["published-lesson-runtime-identity"],
  { revalidate: 60 }
);

async function getPublishedLessonIdentity(courseSlug: string, lessonSlug: string) {
  const row = await readPublishedLessonIdentity(courseSlug, lessonSlug);
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

function deriveInteractiveGates(interactive: Awaited<ReturnType<typeof getInteractiveLesson>>) {
  const requiredChecks = interactive.checks.filter((check) => check.required);
  const requiredPractices = interactive.practices.filter((practice) => practice.required);
  return {
    checkGate: {
      configured: requiredChecks.length > 0,
      passed:
        requiredChecks.length > 0 &&
        requiredChecks.every((check) => check.state?.isCorrect === true),
      requiredIds: requiredChecks.map((check) => check.id)
    },
    practiceGate: {
      configured: requiredPractices.length > 0,
      passed:
        requiredPractices.length > 0 &&
        requiredPractices.every((practice) => practice.state?.status === "PASSED"),
      requiredIds: requiredPractices.map((practice) => practice.id)
    }
  };
}

export async function getLessonRuntimeReadModel(
  userId: string | null,
  courseSlug: string,
  lessonSlug: string
) {
  const timing = createRuntimeTiming("lesson_runtime_read");
  const lesson = await getPublishedLessonIdentity(courseSlug, lessonSlug);
  timing.mark("lesson_identity_ms");
  await assertLessonRuntimeAccess(userId, courseSlug, lessonSlug);
  timing.mark("access_ms");
  const spec = getLessonSpec(courseSlug, lessonSlug);
  const stateStartedAt = performance.now();
  const [interactive, progress] = await Promise.all([
    getInteractiveLesson(userId, courseSlug, lessonSlug, {
      lessonId: lesson.lessonId,
      accessChecked: true
    }),
    getLessonProgressRuntimeState(userId, courseSlug, lessonSlug, lesson.lessonId)
  ]);
  timing.set("interactive_progress_ms", Math.round(performance.now() - stateStartedAt));
  const { checkGate, practiceGate } = deriveInteractiveGates(interactive);
  const ratingStartedAt = performance.now();
  const ratingState =
    userId && progress.completed
      ? await getLessonHelpfulnessStateByLessonId(userId, lesson.lessonId)
      : { canRate: false, submittedAt: null, latestInteractionAt: null };
  timing.set("rating_ms", Math.round(performance.now() - ratingStartedAt));

  timing.set("completed", progress.completed);
  if (!spec) {
    timing.finish({ registered: false });
    return {
      registered: false,
      lessonId: lesson.lessonId,
      spec: null,
      plan: null,
      gates: {
        check: checkGate,
        practice: practiceGate,
        realAi: { required: false, satisfied: true, evidenceKind: "NONE" as const, latest: null }
      },
      progress,
      interactive,
      canComplete: false,
      canRate: ratingState.canRate,
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

  timing.finish({ registered: true });
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
    progress,
    interactive,
    canComplete:
      blockers.length === 0 &&
      (!plan.requiresCheck || checkGate.passed) &&
      (!plan.requiresPractice || practiceGate.passed) &&
      (!plan.requiresRealAi || realAi.satisfied),
    canRate: progress.completed && ratingState.canRate,
    configurationReady: blockers.length === 0,
    enforcementActive: blockers.length === 0,
    blockers
  };
}

export async function assertLessonStepCanEnter(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  currentStep: number
) {
  const lesson = await getPublishedLessonIdentity(courseSlug, lessonSlug);
  await assertLessonRuntimeAccess(userId, courseSlug, lessonSlug);
  const spec = getLessonSpec(courseSlug, lessonSlug);
  if (!spec) return;

  const plan = buildLessonRuntimePlan(spec);
  const targetIndex = currentStep - 1;
  const checkIndex = plan.steps.findIndex((step) => step.kind === "CHECK");
  const practiceIndex = plan.steps.findIndex((step) => step.kind === "PRACTICE");

  if (plan.requiresCheck && checkIndex >= 0 && targetIndex > checkIndex) {
    const checkGate = await getRequiredCheckGateState(userId, lesson.lessonId);
    if (!checkGate.passed) throw new Error("CHECK_REQUIRED");
  }

  if (plan.requiresPractice && practiceIndex >= 0 && targetIndex > practiceIndex) {
    const practiceGate = await getRequiredPracticeGateState(userId, lesson.lessonId);
    if (!practiceGate.passed) throw new Error("PRACTICE_REQUIRED");
  }

  if (plan.requiresRealAi && practiceIndex >= 0 && targetIndex > practiceIndex) {
    const realAi = await getRealAiEvidenceState(
      userId,
      lesson.lessonId,
      plan.realAiEvidence
    );
    if (!realAi.satisfied) throw new Error("REAL_AI_REQUIRED");
  }
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
