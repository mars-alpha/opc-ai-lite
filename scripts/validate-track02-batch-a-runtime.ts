import { getAllLessons, getCourse } from "../lib/courses";
import { FORMAL_RUNTIME_COURSE_SLUGS } from "../lib/learning/course-runtime-boundaries";
import { track02Catalog } from "../lib/learning/track-catalog";
import {
  TRACK02_RUNTIME_COURSE_SLUG,
  getTrack02BatchARuntimePresentation,
  track02BatchARuntimeDefinitions
} from "../lib/learning/track02-batch-a-runtime";
import { getCrossTrackNextLesson } from "../lib/learning/track-navigation";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK02_RUNTIME_VALIDATION_FAILED:" + code);
}

assert(TRACK02_RUNTIME_COURSE_SLUG === "ai-work", "COURSE_SLUG");
assert(FORMAL_RUNTIME_COURSE_SLUGS.includes("ai-work"), "FORMAL_RUNTIME_BOUNDARY");
assert(track02BatchARuntimeDefinitions.length === 3, "THREE_RUNTIME_DEFINITIONS");

for (const definition of track02BatchARuntimeDefinitions) {
  assert(definition.checks.length === 3, "THREE_CHECKS:" + definition.lesson.id);
  assert(definition.checks.every((check) => check.required && check.status === "PUBLISHED"), "CHECKS_REQUIRED_PUBLISHED:" + definition.lesson.id);
  assert(definition.practice.required && definition.practice.status === "PUBLISHED", "PRACTICE_REQUIRED_PUBLISHED:" + definition.lesson.id);
  assert(definition.practice.submissionSchema.kind === "STRUCTURED_TEXT_V1", "PRACTICE_SCHEMA:" + definition.lesson.id);
  assert(Boolean(getTrack02BatchARuntimePresentation("ai-work", definition.lesson.id)), "PRESENTATION:" + definition.lesson.id);
}

const course = getCourse("ai-work");
assert(Boolean(course), "COURSE_EXISTS");
assert(course ? getAllLessons(course).slice(0, 3).every((lesson, index) => lesson.id === track02BatchARuntimeDefinitions[index]?.lesson.id) : false, "BATCH_A_FORMAL_RUNTIME_UNCHANGED");

const catalogLessons = track02Catalog.flatMap((stage) => stage.lessons);
assert(catalogLessons.slice(0, 3).every((lesson) => lesson.availability === "AVAILABLE" && lesson.runtimeCourseSlug === "ai-work"), "BATCH_A_CATALOG_AVAILABLE");
assert(catalogLessons.slice(3, 6).every((lesson) => lesson.availability === "AVAILABLE" && lesson.runtimeCourseSlug === "ai-work") && catalogLessons.slice(6).every((lesson) => lesson.availability === "COMING_SOON" && !lesson.runtimeCourseSlug), "T204_T206_AVAILABLE_T207_T215_NOT_PUBLISHED");

const foundation = getCourse("foundation-ai");
const t120 = foundation ? getAllLessons(foundation).at(-1) : null;
const next = t120 ? getCrossTrackNextLesson("foundation-ai", t120.id) : null;
assert(next?.href === "/courses/ai-work/lessons/t2-01-research-question-scope", "T120_CONTINUE_TO_T201");

console.log("TRACK02_RUNTIME_DEFINITIONS=PASS");
console.log("TRACK02_RUNTIME_FORMAL_BOUNDARY=PASS");
console.log("TRACK02_RUNTIME_PRESENTATIONS=PASS");
console.log("TRACK02_RUNTIME_CATALOG_DELIVERY=PASS");
console.log("TRACK02_RUNTIME_BATCH_A_FIRST_THREE=PASS");
console.log("TRACK02_RUNTIME_T120_CONTINUE=PASS");
