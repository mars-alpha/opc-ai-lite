import "server-only";

import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { courses, getAllLessons, getCourse } from "../../courses";
import { OPC_MEMBERSHIP_PRODUCT } from "../../membership/policy";
import { getDatabase } from "../db";
import { entitlements, lessonProgress, lessons, modules, stages, userIdentities } from "../db/schema";

export const OFFICIAL_FOLLOW_UNLOCK = {
  courseSlug: "ai-literacy",
  moduleId: "foundation",
  resourceType: "MODULE",
  resourceId: "module_ai_literacy_foundation",
  freeLessonCount: 3
} as const;

export type LessonAccess = {
  allowed: boolean;
  reason:
    | "PUBLIC"
    | "ENTITLED"
    | "MEMBERSHIP_REQUIRED"
    | "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED"
    | "PREREQUISITE_STAGE_REQUIRED";
  unlockType?: "OFFICIAL_ACCOUNT_FOLLOW";
  requiredCourseSlug?: string;
};

export async function hasActiveEntitlement(
  userId: string,
  input: {
    type: "COURSE_ACCESS" | "CHAPTER_ACCESS" | "LESSON_ACCESS" | "MEMBERSHIP";
    resourceType: string;
    resourceId: string;
  }
) {
  const [row] = await getDatabase()
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.type, input.type),
        eq(entitlements.resourceType, input.resourceType),
        eq(entitlements.resourceId, input.resourceId),
        isNull(entitlements.revokedAt),
        or(isNull(entitlements.expiresAt), gt(entitlements.expiresAt, new Date()))
      )
    )
    .limit(1);

  return Boolean(row);
}

export async function hasActiveMembership(userId: string | null) {
  if (!userId) return false;
  return hasActiveEntitlement(userId, {
    type: OPC_MEMBERSHIP_PRODUCT.entitlementType,
    resourceType: OPC_MEMBERSHIP_PRODUCT.resourceType,
    resourceId: OPC_MEMBERSHIP_PRODUCT.resourceId
  });
}

export async function hasOfficialAccountFollowEntitlement(userId: string | null) {
  if (!userId) return false;
  return hasActiveEntitlement(userId, {
    type: "CHAPTER_ACCESS",
    resourceType: OFFICIAL_FOLLOW_UNLOCK.resourceType,
    resourceId: OFFICIAL_FOLLOW_UNLOCK.resourceId
  });
}

export async function getStageAccess(
  userId: string | null,
  courseSlug: string
): Promise<{ allowed: boolean; requiredCourseSlug?: string }> {
  if (courseSlug === "ai-work") return { allowed: true };
  if (courseSlug === "foundation-ai") return { allowed: true };
  const currentIndex = courses.findIndex((course) => course.slug === courseSlug);
  if (currentIndex <= 0) return { allowed: true };
  if (!userId) {
    return { allowed: false, requiredCourseSlug: courses[currentIndex - 1]?.slug };
  }

  const priorCourses = courses.slice(0, currentIndex);
  const completedRows = await getDatabase()
    .select({
      courseSlug: stages.slug,
      lessonSlug: lessons.slug
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.status, "COMPLETED")
      )
    );

  const completedByCourse = new Map<string, Set<string>>();
  for (const row of completedRows) {
    const set = completedByCourse.get(row.courseSlug) ?? new Set<string>();
    set.add(row.lessonSlug);
    completedByCourse.set(row.courseSlug, set);
  }

  for (const priorCourse of priorCourses) {
    const completed = completedByCourse.get(priorCourse.slug) ?? new Set<string>();
    const requiredLessons = getAllLessons(priorCourse);
    if (!requiredLessons.every((lesson) => completed.has(lesson.id))) {
      return { allowed: false, requiredCourseSlug: priorCourse.slug };
    }
  }

  return { allowed: true };
}

export async function getLearningPrerequisiteRecommendation(
  userId: string | null,
  courseSlug: string
): Promise<{ recommendedCourseSlug?: string; satisfied: boolean }> {
  if (courseSlug !== "ai-work") return { satisfied: true };
  const foundation = getCourse("foundation-ai");
  if (!foundation || !userId) {
    return { satisfied: false, recommendedCourseSlug: "foundation-ai" };
  }

  const requiredLessons = getAllLessons(foundation);
  const completedRows = await getDatabase()
    .select({ lessonSlug: lessons.slug })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.status, "COMPLETED"),
        eq(stages.slug, "foundation-ai")
      )
    );
  const completed = new Set(completedRows.map((row) => row.lessonSlug));
  const satisfied = requiredLessons.every((lesson) => completed.has(lesson.id));
  return satisfied
    ? { satisfied: true }
    : { satisfied: false, recommendedCourseSlug: "foundation-ai" };
}

export async function getLessonAccess(
  userId: string | null,
  courseSlug: string,
  lessonSlug: string
): Promise<LessonAccess> {
  const course = getCourse(courseSlug);
  if (!course) {
    return { allowed: true, reason: "PUBLIC" };
  }

  if (courseSlug === "ai-work") {
    return (await hasActiveMembership(userId))
      ? { allowed: true, reason: "ENTITLED" }
      : { allowed: false, reason: "MEMBERSHIP_REQUIRED" };
  }

  const stageAccess = await getStageAccess(userId, courseSlug);
  if (!stageAccess.allowed) {
    return {
      allowed: false,
      reason: "PREREQUISITE_STAGE_REQUIRED",
      requiredCourseSlug: stageAccess.requiredCourseSlug
    };
  }

  if (courseSlug !== OFFICIAL_FOLLOW_UNLOCK.courseSlug) {
    return { allowed: true, reason: "PUBLIC" };
  }

  const freeLessonIds = new Set(
    getAllLessons(course)
      .slice(0, OFFICIAL_FOLLOW_UNLOCK.freeLessonCount)
      .map((lesson) => lesson.id)
  );

  if (freeLessonIds.has(lessonSlug)) {
    return { allowed: true, reason: "PUBLIC" };
  }

  const [memberActive, chapterEntitled] = userId
    ? await Promise.all([
        hasActiveMembership(userId),
        hasActiveEntitlement(userId, {
          type: "CHAPTER_ACCESS",
          resourceType: OFFICIAL_FOLLOW_UNLOCK.resourceType,
          resourceId: OFFICIAL_FOLLOW_UNLOCK.resourceId
        })
      ])
    : [false, false];

  if (memberActive || chapterEntitled) {
    return { allowed: true, reason: "ENTITLED" };
  }

  return {
    allowed: false,
    reason: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED",
    unlockType: "OFFICIAL_ACCOUNT_FOLLOW"
  };
}

export async function getLockedLessonIds(
  userId: string | null,
  courseSlug: string
) {
  const course = getCourse(courseSlug);
  if (!course) return [];

  const courseLessons = course.modules.flatMap((module) => module.lessons);
  if (courseSlug === "ai-work") {
    return (await hasActiveMembership(userId))
      ? []
      : courseLessons.map((lesson) => lesson.id);
  }

  const stageAccess = await getStageAccess(userId, courseSlug);
  if (!stageAccess.allowed) return courseLessons.map((lesson) => lesson.id);
  if (courseSlug !== OFFICIAL_FOLLOW_UNLOCK.courseSlug) return [];

  const freeLessonIds = new Set(
    courseLessons.slice(0, OFFICIAL_FOLLOW_UNLOCK.freeLessonCount).map((lesson) => lesson.id)
  );

  if (userId) {
    const [memberActive, chapterEntitled] = await Promise.all([
      hasActiveMembership(userId),
      hasActiveEntitlement(userId, {
        type: "CHAPTER_ACCESS",
        resourceType: OFFICIAL_FOLLOW_UNLOCK.resourceType,
        resourceId: OFFICIAL_FOLLOW_UNLOCK.resourceId
      })
    ]);
    if (memberActive || chapterEntitled) return [];
  }

  return courseLessons.filter((lesson) => !freeLessonIds.has(lesson.id)).map((lesson) => lesson.id);
}

export async function getLessonPageAccess(
  userId: string | null,
  courseSlug: string,
  lessonSlug: string
): Promise<{ access: LessonAccess; lockedLessonIds: string[] }> {
  const course = getCourse(courseSlug);
  if (!course) {
    return {
      access: { allowed: true, reason: "PUBLIC" },
      lockedLessonIds: []
    };
  }

  const courseLessons = course.modules.flatMap((module) => module.lessons);
  if (courseSlug === "ai-work") {
    const entitled = await hasActiveMembership(userId);
    return {
      access: entitled
        ? { allowed: true, reason: "ENTITLED" }
        : { allowed: false, reason: "MEMBERSHIP_REQUIRED" },
      lockedLessonIds: entitled ? [] : courseLessons.map((lesson) => lesson.id)
    };
  }

  const stageAccess = await getStageAccess(userId, courseSlug);

  if (!stageAccess.allowed) {
    return {
      access: {
        allowed: false,
        reason: "PREREQUISITE_STAGE_REQUIRED",
        requiredCourseSlug: stageAccess.requiredCourseSlug
      },
      lockedLessonIds: courseLessons.map((lesson) => lesson.id)
    };
  }

  if (courseSlug !== OFFICIAL_FOLLOW_UNLOCK.courseSlug) {
    return {
      access: { allowed: true, reason: "PUBLIC" },
      lockedLessonIds: []
    };
  }

  const freeLessonIds = new Set(
    courseLessons
      .slice(0, OFFICIAL_FOLLOW_UNLOCK.freeLessonCount)
      .map((lesson) => lesson.id)
  );

  let entitled = false;
  if (userId) {
    const [memberActive, chapterEntitled] = await Promise.all([
      hasActiveMembership(userId),
      hasActiveEntitlement(userId, {
        type: "CHAPTER_ACCESS",
        resourceType: OFFICIAL_FOLLOW_UNLOCK.resourceType,
        resourceId: OFFICIAL_FOLLOW_UNLOCK.resourceId
      })
    ]);
    entitled = memberActive || chapterEntitled;
  }

  const lockedLessonIds = entitled
    ? []
    : courseLessons
        .filter((lesson) => !freeLessonIds.has(lesson.id))
        .map((lesson) => lesson.id);

  if (freeLessonIds.has(lessonSlug)) {
    return {
      access: { allowed: true, reason: "PUBLIC" },
      lockedLessonIds
    };
  }

  if (entitled) {
    return {
      access: { allowed: true, reason: "ENTITLED" },
      lockedLessonIds
    };
  }

  return {
    access: {
      allowed: false,
      reason: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED",
      unlockType: "OFFICIAL_ACCOUNT_FOLLOW"
    },
    lockedLessonIds
  };
}
export async function grantOfficialAccountFollowEntitlement(userId: string) {
  const now = new Date();

  await getDatabase()
    .insert(entitlements)
    .values({
      userId,
      type: "CHAPTER_ACCESS",
      resourceType: OFFICIAL_FOLLOW_UNLOCK.resourceType,
      resourceId: OFFICIAL_FOLLOW_UNLOCK.resourceId,
      source: "OFFICIAL_ACCOUNT_FOLLOW",
      grantedAt: now,
      revokedAt: null,
      expiresAt: null,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [
        entitlements.userId,
        entitlements.type,
        entitlements.resourceType,
        entitlements.resourceId
      ],
      set: {
        source: "OFFICIAL_ACCOUNT_FOLLOW",
        grantedAt: now,
        revokedAt: null,
        expiresAt: null,
        updatedAt: sql`now()`
      }
    });
}

export async function grantOfficialAccountFollowByOpenId(openId: string) {
  const normalizedOpenId = openId.trim();
  if (!normalizedOpenId) throw new Error("INVALID_OPENID");

  const [identity] = await getDatabase()
    .select({ userId: userIdentities.userId })
    .from(userIdentities)
    .where(
      and(
        eq(userIdentities.provider, "WECHAT_OFFICIAL_ACCOUNT"),
        eq(userIdentities.providerUserId, normalizedOpenId)
      )
    )
    .limit(1);

  if (!identity) throw new Error("WECHAT_IDENTITY_NOT_FOUND");

  await grantOfficialAccountFollowEntitlement(identity.userId);
  return identity.userId;
}
export async function revokeOfficialAccountFollowEntitlement(userId: string) {
  await getDatabase()
    .update(entitlements)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.type, "CHAPTER_ACCESS"),
        eq(entitlements.resourceType, OFFICIAL_FOLLOW_UNLOCK.resourceType),
        eq(entitlements.resourceId, OFFICIAL_FOLLOW_UNLOCK.resourceId),
        eq(entitlements.source, "OFFICIAL_ACCOUNT_FOLLOW")
      )
    );
}











