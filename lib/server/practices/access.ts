import "server-only";

import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDatabase } from "../db";
import {
  contentItems,
  knowledgeItems,
  lessons,
  modules,
  practices,
  stages
} from "../db/schema";
import { getLessonAccess, getStageAccess } from "../entitlements/service";
import { resolveMembershipFeatureAccess } from "../membership/service";

export type PracticeType = "LESSON_PRACTICE" | "STAGE_PROJECT" | "LATEST_PRACTICE";
export type PracticeAccessTier = "INHERIT" | "FREE" | "MEMBER";

export type PracticeAccessReason =
  | "ALLOWED"
  | "MEMBERSHIP"
  | "MEMBERSHIP_REQUIRED"
  | "LESSON_LOCKED"
  | "STAGE_PREREQUISITE_REQUIRED"
  | "PRACTICE_OWNERSHIP_INVALID"
  | "SOURCE_NOT_PUBLISHED";

export type PracticeAccessResult = {
  allowed: boolean;
  reason: PracticeAccessReason;
  practiceId: string;
  type: PracticeType;
  accessTier: PracticeAccessTier;
  lessonId: string | null;
  stageId: string | null;
  sourceContentId: string | null;
  sourceKnowledgeId: string | null;
  requiredCourseSlug?: string;
};

const practiceStage = alias(stages, "practice_stage");

export type PracticeAccessRow = {
  id: string;
  type: PracticeType;
  accessTier: PracticeAccessTier;
  lessonId: string | null;
  lessonSlug: string | null;
  lessonCourseSlug: string | null;
  stageId: string | null;
  stageSlug: string | null;
  sourceContentId: string | null;
  sourceContentStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  sourceKnowledgeId: string | null;
  sourceKnowledgeStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  title: string;
  goal: string;
  instructions: unknown;
  hints: unknown;
  rubric: unknown;
  submissionSchema: unknown;
  passScore: number;
  required: boolean;
};

export async function readPracticeAccessRow(practiceId: string): Promise<PracticeAccessRow | null> {
  const [row] = await getDatabase()
    .select({
      id: practices.id,
      type: practices.type,
      accessTier: practices.accessTier,
      lessonId: practices.lessonId,
      lessonSlug: lessons.slug,
      lessonCourseSlug: stages.slug,
      stageId: practices.stageId,
      stageSlug: practiceStage.slug,
      sourceContentId: practices.sourceContentId,
      sourceContentStatus: contentItems.status,
      sourceKnowledgeId: practices.sourceKnowledgeId,
      sourceKnowledgeStatus: knowledgeItems.status,
      title: practices.title,
      goal: practices.goal,
      instructions: practices.instructions,
      hints: practices.hints,
      rubric: practices.rubric,
      submissionSchema: practices.submissionSchema,
      passScore: practices.passScore,
      required: practices.required
    })
    .from(practices)
    .leftJoin(lessons, eq(practices.lessonId, lessons.id))
    .leftJoin(modules, eq(lessons.moduleId, modules.id))
    .leftJoin(stages, eq(modules.stageId, stages.id))
    .leftJoin(practiceStage, eq(practices.stageId, practiceStage.id))
    .leftJoin(contentItems, eq(practices.sourceContentId, contentItems.id))
    .leftJoin(knowledgeItems, eq(practices.sourceKnowledgeId, knowledgeItems.id))
    .where(and(eq(practices.id, practiceId), eq(practices.status, "PUBLISHED")))
    .limit(1);

  return (row as PracticeAccessRow | undefined) ?? null;
}


function baseResult(row: PracticeAccessRow): Omit<PracticeAccessResult, "allowed" | "reason"> {
  return {
    practiceId: row.id,
    type: row.type,
    accessTier: row.accessTier,
    lessonId: row.lessonId,
    stageId: row.stageId,
    sourceContentId: row.sourceContentId,
    sourceKnowledgeId: row.sourceKnowledgeId
  };
}

async function requireMembership(
  userId: string | null,
  row: PracticeAccessRow
): Promise<PracticeAccessResult | null> {
  const requiresMembership = row.type === "LATEST_PRACTICE" || row.accessTier === "MEMBER";
  if (!requiresMembership) return null;
  const feature = row.type === "STAGE_PROJECT" ? "STAGE_PROJECT" : "PRACTICE";
  const membership = await resolveMembershipFeatureAccess(userId, feature);
  return membership.allowed
    ? { ...baseResult(row), allowed: true, reason: "MEMBERSHIP" }
    : { ...baseResult(row), allowed: false, reason: "MEMBERSHIP_REQUIRED" };
}

export async function resolvePracticeAccessRow(
  userId: string | null,
  row: PracticeAccessRow
): Promise<PracticeAccessResult> {
  if (row.type === "LESSON_PRACTICE") {
    if (!row.lessonId || !row.lessonSlug || !row.lessonCourseSlug) {
      return { ...baseResult(row), allowed: false, reason: "PRACTICE_OWNERSHIP_INVALID" };
    }

    const lessonAccess = await getLessonAccess(userId, row.lessonCourseSlug, row.lessonSlug);
    if (!lessonAccess.allowed) {
      return {
        ...baseResult(row),
        allowed: false,
        reason:
          lessonAccess.reason === "PREREQUISITE_STAGE_REQUIRED"
            ? "STAGE_PREREQUISITE_REQUIRED"
            : "LESSON_LOCKED",
        requiredCourseSlug: lessonAccess.requiredCourseSlug
      };
    }

    return (await requireMembership(userId, row)) ?? {
      ...baseResult(row),
      allowed: true,
      reason: "ALLOWED"
    };
  }

  if (row.type === "STAGE_PROJECT") {
    if (!row.stageId || !row.stageSlug) {
      return { ...baseResult(row), allowed: false, reason: "PRACTICE_OWNERSHIP_INVALID" };
    }

    const stageAccess = await getStageAccess(userId, row.stageSlug);
    if (!stageAccess.allowed) {
      return {
        ...baseResult(row),
        allowed: false,
        reason: "STAGE_PREREQUISITE_REQUIRED",
        requiredCourseSlug: stageAccess.requiredCourseSlug
      };
    }

    return (await requireMembership(userId, row)) ?? {
      ...baseResult(row),
      allowed: true,
      reason: "ALLOWED"
    };
  }

  const hasContentOwner = Boolean(row.sourceContentId);
  const hasKnowledgeOwner = Boolean(row.sourceKnowledgeId);
  if (!hasContentOwner && !hasKnowledgeOwner) {
    return { ...baseResult(row), allowed: false, reason: "PRACTICE_OWNERSHIP_INVALID" };
  }

  const publishedOwner =
    (hasContentOwner && row.sourceContentStatus === "PUBLISHED") ||
    (hasKnowledgeOwner && row.sourceKnowledgeStatus === "PUBLISHED");
  if (!publishedOwner) {
    return { ...baseResult(row), allowed: false, reason: "SOURCE_NOT_PUBLISHED" };
  }

  return (await requireMembership(userId, row)) ?? {
    ...baseResult(row),
    allowed: true,
    reason: "ALLOWED"
  };
}

export async function resolvePracticeAccess(
  userId: string | null,
  practiceId: string
): Promise<PracticeAccessResult> {
  const row = await readPracticeAccessRow(practiceId);
  if (!row) throw new Error("PRACTICE_NOT_FOUND");
  return resolvePracticeAccessRow(userId, row);
}
