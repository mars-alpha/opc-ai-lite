import fs from "node:fs";
import { courses, getAllLessons, getCourse } from "../lib/courses";
import { learningTracks, track02Catalog } from "../lib/learning/track-catalog";
import { getCrossTrackNextLesson, learningPathHrefForCourse } from "../lib/learning/track-navigation";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK02_LEARNING_PATH_ACCESS_FAILED:" + code);
}

const track02Lessons = track02Catalog.flatMap((stage) => stage.lessons);
assert(track02Catalog.length === 6, "TRACK02_SIX_GROUPS_REQUIRED");
assert(track02Lessons.length === 15, "TRACK02_FIFTEEN_LESSONS_REQUIRED");
assert(
  track02Lessons.slice(0, 3).every(
    (lesson) =>
      lesson.curriculumStatus === "AVAILABLE" &&
      lesson.availability === "AVAILABLE" &&
      lesson.runtimeCourseSlug === "ai-work" &&
      lesson.runtimeLessonId === lesson.lessonId
  ),
  "TRACK02_BATCH_A_RUNTIME_AVAILABLE_REQUIRED"
);
assert(
  track02Lessons.slice(3).every((lesson) =>
    lesson.curriculumStatus === "AVAILABLE" && lesson.availability === "AVAILABLE" &&
    lesson.runtimeCourseSlug === "ai-work" && lesson.runtimeLessonId === lesson.lessonId
  ),
  "TRACK02_ALL_FIFTEEN_RUNTIME_AVAILABLE_REQUIRED"
);

assert(learningTracks["foundation-ai"].stages.flatMap((stage) => stage.lessons).length === 20, "TRACK01_TWENTY_LESSONS_REQUIRED");
assert(learningPathHrefForCourse("ai-work") === "/learning-path?track=ai-work#foundation-catalog", "TRACK02_RETURN_MAP_QUERY_REQUIRED");
assert(learningPathHrefForCourse("foundation-ai") === "/learning-path?track=foundation-ai#foundation-catalog", "TRACK01_RETURN_MAP_QUERY_REQUIRED");

const aiWork = getCourse("ai-work");
assert(Boolean(aiWork), "TRACK02_RUNTIME_COURSE_REQUIRED");
assert(aiWork ? getAllLessons(aiWork).length === 15 : false, "TRACK02_FORMAL_DIRECTORY_FIFTEEN_PUBLISHED_REQUIRED");

const foundation = getCourse("foundation-ai");
const foundationLast = foundation ? getAllLessons(foundation).at(-1) : null;
assert(Boolean(foundationLast), "TRACK01_LAST_LESSON_REQUIRED");
const crossTrack = foundationLast ? getCrossTrackNextLesson("foundation-ai", foundationLast.id) : null;
assert(Boolean(crossTrack), "TRACK01_T120_TRACK02_CONTINUE_REQUIRED");
assert(crossTrack?.href === "/courses/ai-work/lessons/t2-01-research-question-scope", "TRACK01_T120_CONTINUE_TARGET_DRIFT");
assert(courses.some((course) => course.slug === "ai-work"), "TRACK02_RUNTIME_COURSE_MUST_EXIST");

const learningPathPage = fs.readFileSync("app/learning-path/page.tsx", "utf8");
assert(learningPathPage.includes('"/learning-path?track=" + slug + "#foundation-catalog"'), "TRACK_SWITCH_LINKS_REQUIRED");
assert(learningPathPage.includes("学习顺序是推荐路径，不等于访问权限"), "LEARNING_ORDER_ACCESS_SEPARATION_COPY_REQUIRED");
assert(learningPathPage.includes('cookieStore.get("opc_learning_track")'), "TRACK_PREFERENCE_RESTORE_REQUIRED");

const lessonPage = fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx", "utf8");
assert(lessonPage.includes('course.slug === "ai-work"'), "TRACK02_FIRST_LESSON_MAP_NAV_REQUIRED");
assert(lessonPage.includes('title: "学习地图"'), "TRACK02_PREVIOUS_LEARNING_MAP_REQUIRED");
assert(lessonPage.includes("registeredSpec.learningRecommendation"), "LESSON_SPEC_RECOMMENDATION_REQUIRED");
assert(lessonPage.includes("getTrack02BatchARuntimePresentation"), "TRACK02_PRESENTATION_REQUIRED");
assert(lessonPage.includes("getTrack02BatchBRuntimePresentation"), "TRACK02_BATCH_B_PRESENTATION_REQUIRED");
assert(lessonPage.includes("getTrack02BatchCRuntimePresentation"), "TRACK02_BATCH_C_PRESENTATION_REQUIRED");
assert(lessonPage.includes("getTrack02BatchDRuntimePresentation"), "TRACK02_BATCH_D_PRESENTATION_REQUIRED");

const runtimeShell = fs.readFileSync("components/AsyncLessonRuntimeShell.tsx", "utf8");
assert(runtimeShell.includes("previous.href ??"), "EXTERNAL_PREVIOUS_LINK_REQUIRED");
assert(runtimeShell.includes("next.href ??"), "EXTERNAL_NEXT_LINK_REQUIRED");
assert(runtimeShell.includes('next.label ?? "继续下一课"'), "CROSS_TRACK_NEXT_LABEL_REQUIRED");
assert(runtimeShell.includes("learningPathHrefForCourse(courseSlug)"), "FINAL_LESSON_TRACK_AWARE_RETURN_REQUIRED");

const entitlement = fs.readFileSync("lib/server/entitlements/service.ts", "utf8");
assert(entitlement.includes('if (courseSlug === "ai-work") return { allowed: true };'), "TRACK02_T1_COMPLETION_MUST_NOT_BLOCK");
assert(entitlement.includes("getLearningPrerequisiteRecommendation"), "LEARNING_PREREQUISITE_SEPARATION_REQUIRED");
assert(entitlement.includes('reason: "MEMBERSHIP_REQUIRED"'), "TRACK02_MEMBERSHIP_GATE_REQUIRED");

const lockedView = fs.readFileSync("components/LessonLockedView.tsx", "utf8");
assert(lockedView.includes("继续把 AI 用进真实工作"), "MEMBER_VALUE_COPY_REQUIRED");
assert(!lockedView.includes("前置课程只作为学习建议，不作为访问门槛"), "INTERNAL_ACCESS_EXPLANATION_MUST_NOT_RENDER");
assert(!lockedView.includes("当前访问规则"), "INTERNAL_ACCESS_RULE_MUST_NOT_RENDER");

const sidebar = fs.readFileSync("components/LessonCourseSidebar.tsx", "utf8");
assert(sidebar.includes("course.modules.map"), "SIDEBAR_CURRENT_COURSE_ONLY_REQUIRED");
assert(sidebar.includes("learningPathHrefForCourse(course.slug)"), "SIDEBAR_TRACK_AWARE_RETURN_REQUIRED");

console.log("TRACK02_LEARNING_MAP_SWITCH=PASS");
console.log("TRACK02_FIFTEEN_LESSON_CATALOG=PASS");
console.log("TRACK02_BATCH_A_RUNTIME_AVAILABLE=PASS");
console.log("TRACK02_ALL_FIFTEEN_RUNTIME_AVAILABLE=PASS");
console.log("TRACK02_MEMBER_ACCESS_SEPARATED_FROM_T1=PASS");
console.log("TRACK02_PREREQUISITE_RECOMMENDATION_ONLY=PASS");
console.log("TRACK02_T201_PREVIOUS_LEARNING_MAP=PASS");
console.log("TRACK01_T120_CROSS_TRACK_CONTINUE=PASS");
console.log("TRACK02_TRACK_AWARE_RETURN=PASS");
console.log("TRACK02_SIDEBAR_CURRENT_TRACK_ONLY=PASS");
