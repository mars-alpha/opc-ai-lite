import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

import { courses, getAllLessons, getCourse } from "../lib/courses";
import { OPC_MEMBERSHIP_PRODUCT } from "../lib/membership/policy";
import { resolveResourceAccess } from "../lib/server/access/service";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { entitlements, lessonProgress, lessons, modules, stages, users } from "../lib/server/db/schema";
import {
  OFFICIAL_FOLLOW_UNLOCK,
  getLessonAccess,
  grantOfficialAccountFollowEntitlement
} from "../lib/server/entitlements/service";

const BASE_URL =
  process.argv.find((item) => item.startsWith("--base-url="))?.slice("--base-url=".length) ||
  "http://127.0.0.1:3001";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ACCEPTANCE_FAILED:" + code);
}

async function createUser(label: string) {
  const [user] = await getDatabase()
    .insert(users)
    .values({ displayName: "__ACCESS_RESUME_" + label + "__" })
    .returning({ id: users.id });
  assert(user?.id, "CREATE_USER_" + label);
  return user;
}

async function satisfyCoursePrerequisites(userId: string, targetCourseSlug: string) {
  const targetIndex = courses.findIndex((course) => course.slug === targetCourseSlug);
  if (targetIndex <= 0) return;

  for (const course of courses.slice(0, targetIndex)) {
    for (const lesson of getAllLessons(course)) {
      const [row] = await getDatabase()
        .select({ lessonId: lessons.id })
        .from(lessons)
        .innerJoin(modules, eq(lessons.moduleId, modules.id))
        .innerJoin(stages, eq(modules.stageId, stages.id))
        .where(and(eq(stages.slug, course.slug), eq(lessons.slug, lesson.id)))
        .limit(1);
      assert(row?.lessonId, "PREREQ_LESSON_EXISTS_" + course.slug + "_" + lesson.id);
      await getDatabase()
        .insert(lessonProgress)
        .values({
          userId,
          lessonId: row.lessonId,
          status: "COMPLETED",
          currentStep: 6,
          startedAt: new Date(),
          completedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [lessonProgress.userId, lessonProgress.lessonId],
          set: { status: "COMPLETED", currentStep: 6, completedAt: new Date(), updatedAt: new Date() }
        });
    }
  }
}

async function main() {
  const anonymous = await fetch(BASE_URL + "/courses/foundation-ai", {
    redirect: "manual",
    signal: AbortSignal.timeout(15000)
  });
  assert(anonymous.status === 307 || anonymous.status === 308, "ANONYMOUS_COURSE_REDIRECT");
  const location = anonymous.headers.get("location") || "";
  assert(location.includes("/auth") && location.includes("returnTo="), "ANONYMOUS_REDIRECT_TARGET");
  console.log("ANONYMOUS_COURSE_GUARD=PASS");

  const freeUser = await createUser("FREE");
  const followerUser = await createUser("FOLLOWER");
  const memberUser = await createUser("MEMBER");

  try {
    const foundationCourse = getCourse("foundation-ai");
    assert(foundationCourse, "FOUNDATION_AI_EXISTS");
    const foundationFirstLesson = getAllLessons(foundationCourse)[0];
    assert(foundationFirstLesson, "FOUNDATION_AI_FIRST_LESSON_EXISTS");
    const freeFoundation = await getLessonAccess(freeUser.id, foundationCourse.slug, foundationFirstLesson.id);
    assert(freeFoundation.allowed === true, "FREE_FOUNDATION_AI_ALLOW");

    await Promise.all([
      satisfyCoursePrerequisites(freeUser.id, OFFICIAL_FOLLOW_UNLOCK.courseSlug),
      satisfyCoursePrerequisites(followerUser.id, OFFICIAL_FOLLOW_UNLOCK.courseSlug),
      satisfyCoursePrerequisites(memberUser.id, OFFICIAL_FOLLOW_UNLOCK.courseSlug)
    ]);
    await grantOfficialAccountFollowEntitlement(followerUser.id);
    await getDatabase().insert(entitlements).values({
      userId: memberUser.id,
      type: OPC_MEMBERSHIP_PRODUCT.entitlementType,
      resourceType: OPC_MEMBERSHIP_PRODUCT.resourceType,
      resourceId: OPC_MEMBERSHIP_PRODUCT.resourceId,
      source: "MEMBERSHIP"
    });

    const followCourse = getCourse(OFFICIAL_FOLLOW_UNLOCK.courseSlug);
    assert(followCourse, "FOLLOW_COURSE_EXISTS");
    const followLessons = getAllLessons(followCourse);
    assert(followLessons.length > OFFICIAL_FOLLOW_UNLOCK.freeLessonCount, "FOLLOW_LOCKED_LESSON_EXISTS");
    const publicLesson = followLessons[0];
    const lockedLesson = followLessons[OFFICIAL_FOLLOW_UNLOCK.freeLessonCount];

    const freePublic = await getLessonAccess(freeUser.id, followCourse.slug, publicLesson.id);
    assert(freePublic.allowed === true, "FREE_PUBLIC_LESSON_ALLOW");
    const freeLocked = await getLessonAccess(freeUser.id, followCourse.slug, lockedLesson.id);
    assert(freeLocked.allowed === false && freeLocked.reason === "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED", "FREE_FOLLOW_LESSON_LOCKED");

    const followerLocked = await getLessonAccess(followerUser.id, followCourse.slug, lockedLesson.id);
    assert(followerLocked.allowed === true, "FOLLOWER_STAGE1_UNLOCK");
    const memberLocked = await getLessonAccess(memberUser.id, followCourse.slug, lockedLesson.id);
    assert(memberLocked.allowed === true, "MEMBER_STAGE1_UNLOCK");

    const freeDaily = await resolveResourceAccess(freeUser.id, "AI_DAILY_FULL");
    assert(!freeDaily.allowed && freeDaily.mode === "PREVIEW", "FREE_FULL_DAILY_LOCKED");
    const freeKnowledge = await resolveResourceAccess(freeUser.id, "KNOWLEDGE_BODY");
    assert(!freeKnowledge.allowed, "FREE_KNOWLEDGE_LOCKED");
    const freeAdvanced = await resolveResourceAccess(freeUser.id, "ADVANCED_COURSE_ENTRY");
    assert(!freeAdvanced.allowed && freeAdvanced.mode === "DENY", "FREE_ADVANCED_DENY");
    console.log("FREE_ACCESS_MATRIX=PASS");

    const followerDaily = await resolveResourceAccess(followerUser.id, "AI_DAILY_FULL");
    assert(followerDaily.allowed && followerDaily.reason === "OFFICIAL_ACCOUNT_FOLLOW", "FOLLOWER_FULL_DAILY_ALLOW");
    const followerKnowledge = await resolveResourceAccess(followerUser.id, "KNOWLEDGE_BODY");
    assert(!followerKnowledge.allowed, "FOLLOWER_KNOWLEDGE_LOCKED");
    const followerAdvanced = await resolveResourceAccess(followerUser.id, "ADVANCED_COURSE_ENTRY");
    assert(!followerAdvanced.allowed, "FOLLOWER_ADVANCED_LOCKED");
    console.log("FOLLOWER_ACCESS_MATRIX=PASS");

    for (const target of ["AI_DAILY_FULL","KNOWLEDGE_BODY","DEEP_RESOURCE","LATEST_PRACTICE_DETAIL","ADVANCED_COURSE_ENTRY"] as const) {
      const access = await resolveResourceAccess(memberUser.id, target);
      assert(access.allowed === true && access.reason === "MEMBERSHIP", "MEMBER_ALLOW_" + target);
    }
    console.log("MEMBER_ACCESS_MATRIX=PASS");
    console.log("ACCESS_RESUME_ACCESS_ACCEPTANCE=PASS");
  } finally {
    await getDatabase().delete(users).where(eq(users.id, freeUser.id));
    await getDatabase().delete(users).where(eq(users.id, followerUser.id));
    await getDatabase().delete(users).where(eq(users.id, memberUser.id));
    console.log("ACCESS_TEST_DATA_CLEANUP=PASS");
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
