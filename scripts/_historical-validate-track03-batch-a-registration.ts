import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import {
  getTrack03BatchARuntimePresentation,
  track03BatchARuntimeDefinitions
} from "../lib/learning/track03-batch-a-runtime";
import { track03Catalog } from "../lib/learning/track-catalog";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK03_BATCH_A_REGISTRATION_FAILED:" + code);
}

const expectedIds = [
  "t3-01-icp-audience-fit",
  "t3-02-use-case-fit",
  "t3-03-message-hierarchy"
];

assert(
  JSON.stringify(track03BatchARuntimeDefinitions.map((item) => item.lesson.id)) === JSON.stringify(expectedIds),
  "THREE_RUNTIME_DEFINITIONS"
);

for (const id of expectedIds) {
  assert(getLessonSpec("ai-growth", id), "SPEC_REGISTERED:" + id);
  assert(getTrack03BatchARuntimePresentation("ai-growth", id), "PRESENTATION_REGISTERED:" + id);
}

const course = getCourse("ai-growth");
assert(course && getAllLessons(course).length === 3, "FORMAL_COURSE_THREE_LESSONS");

const catalogLessons = track03Catalog.flatMap((stage) => stage.lessons);
assert(catalogLessons.length === 15, "TRACK03_FIFTEEN_CATALOG_LESSONS");
assert(
  catalogLessons.slice(0, 3).every(
    (lesson) =>
      lesson.curriculumStatus === "AVAILABLE" &&
      lesson.availability === "AVAILABLE" &&
      lesson.runtimeCourseSlug === "ai-growth" &&
      lesson.runtimeLessonId === lesson.lessonId
  ),
  "TRACK03_BATCH_A_AVAILABLE"
);
assert(
  catalogLessons.slice(3).every(
    (lesson) =>
      lesson.curriculumStatus === "PLANNED" &&
      lesson.availability === "COMING_SOON" &&
      !lesson.runtimeCourseSlug &&
      !lesson.runtimeLessonId
  ),
  "TRACK03_FUTURE_LESSONS_MUST_STAY_PLANNED"
);

console.log("TRACK03_BATCH_A_THREE_RUNTIME_DEFINITIONS=PASS");
console.log("TRACK03_BATCH_A_LESSON_SPEC_REGISTRATION=PASS");
console.log("TRACK03_BATCH_A_FORMAL_PRESENTATION=PASS");
console.log("TRACK03_FORMAL_COURSE_THREE_LESSONS=PASS");
console.log("TRACK03_FIFTEEN_LESSON_CATALOG=PASS");
console.log("TRACK03_ONLY_FIRST_THREE_AVAILABLE=PASS");
