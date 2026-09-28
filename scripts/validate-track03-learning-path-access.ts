import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import { learningTracks, track03Catalog } from "../lib/learning/track-catalog";
import { getCrossTrackNextLesson, learningPathHrefForCourse } from "../lib/learning/track-navigation";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK03_LEARNING_PATH_ACCESS_FAILED:" + code);
}

const lessons = track03Catalog.flatMap((stage) => stage.lessons);
assert(track03Catalog.length === 6, "TRACK03_SIX_GROUPS_REQUIRED");
assert(lessons.length === 15, "TRACK03_FIFTEEN_LESSONS_REQUIRED");
assert(learningTracks["ai-growth"].stages === track03Catalog, "TRACK03_LEARNING_TRACK_REGISTERED");
assert(
  lessons.every(
    (lesson) =>
      lesson.availability === "AVAILABLE" &&
      lesson.runtimeCourseSlug === "ai-growth" &&
      lesson.runtimeLessonId === lesson.lessonId
  ),
  "TRACK03_ALL_RUNTIME_AVAILABLE_REQUIRED"
);
assert(
  learningPathHrefForCourse("ai-growth") === "/learning-path?track=ai-growth#foundation-catalog",
  "TRACK03_RETURN_MAP_QUERY_REQUIRED"
);

const growth = getCourse("ai-growth");
assert(Boolean(growth), "TRACK03_RUNTIME_COURSE_REQUIRED");
assert(growth ? getAllLessons(growth).length === 15 : false, "TRACK03_FORMAL_DIRECTORY_FIFTEEN_PUBLISHED_REQUIRED");

const aiWork = getCourse("ai-work");
const aiWorkLast = aiWork ? getAllLessons(aiWork).at(-1) : null;
assert(Boolean(aiWorkLast), "TRACK02_LAST_LESSON_REQUIRED");
const crossTrack = aiWorkLast ? getCrossTrackNextLesson("ai-work", aiWorkLast.id) : null;
assert(crossTrack?.href === "/courses/ai-growth/lessons/t3-01-icp-audience-fit", "TRACK02_TO_TRACK03_CONTINUE_TARGET");

const learningPathPage = fs.readFileSync("app/learning-path/page.tsx", "utf8");
assert(learningPathPage.includes('["03", "ai-growth"'), "TRACK03_MAP_SWITCH_REQUIRED");

const lessonPage = fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx", "utf8");
assert(lessonPage.includes("getTrack03BatchARuntimePresentation") && lessonPage.includes("getTrack03BatchesBERuntimePresentation"), "TRACK03_PRESENTATION_ROUTE_REQUIRED");
assert(lessonPage.includes('course.slug === "ai-work" || course.slug === "ai-growth"'), "TRACK03_FIRST_LESSON_MAP_NAV_REQUIRED");

const entitlement = fs.readFileSync("lib/server/entitlements/service.ts", "utf8");
assert(entitlement.includes('courseSlug === "ai-work" || courseSlug === "ai-growth"'), "TRACK03_MEMBERSHIP_ACCESS_REQUIRED");
assert(entitlement.includes('courseSlug === "ai-growth" ? "ai-work"'), "TRACK03_PREREQUISITE_RECOMMENDATION_REQUIRED");

console.log("TRACK03_LEARNING_MAP_SWITCH=PASS");
console.log("TRACK03_FIFTEEN_LESSON_CATALOG=PASS");
console.log("TRACK03_ALL_RUNTIME_AVAILABLE=PASS");
console.log("TRACK03_FORMAL_DIRECTORY_FIFTEEN=PASS");
console.log("TRACK03_MEMBER_ACCESS_SEPARATED_FROM_TRACK02=PASS");
console.log("TRACK03_PREREQUISITE_RECOMMENDATION_ONLY=PASS");
console.log("TRACK02_TRACK03_CROSS_TRACK_CONTINUE=PASS");
console.log("TRACK03_TRACK_AWARE_RETURN=PASS");
