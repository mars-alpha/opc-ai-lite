import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { getTrack02BatchDRuntimePresentation, track02BatchDRuntimeDefinitions } from "../lib/learning/track02-batch-d-runtime";
import { track02Catalog } from "../lib/learning/track-catalog";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK02_BATCH_D_REGISTRATION_FAILED:" + code);
}

const expectedIds = [
  "t2-10-metric-definition",
  "t2-11-data-quality",
  "t2-12-data-analysis",
  "t2-13-knowledge-capture",
  "t2-14-knowledge-organization",
  "t2-15-reusable-method"
];

assert(
  JSON.stringify(track02BatchDRuntimeDefinitions.map((item) => item.lesson.id)) === JSON.stringify(expectedIds),
  "SIX_RUNTIME_DEFINITIONS"
);

for (const id of expectedIds) {
  assert(getLessonSpec("ai-work", id), "SPEC_REGISTERED:" + id);
  assert(getTrack02BatchDRuntimePresentation("ai-work", id), "PRESENTATION_REGISTERED:" + id);
}

const course = getCourse("ai-work");
assert(course && getAllLessons(course).length === 15, "FORMAL_COURSE_FIFTEEN_LESSONS");
assert(
  track02Catalog.flatMap((stage) => stage.lessons).every(
    (lesson) =>
      lesson.curriculumStatus === "AVAILABLE" &&
      lesson.availability === "AVAILABLE" &&
      lesson.runtimeCourseSlug === "ai-work" &&
      lesson.runtimeLessonId === lesson.lessonId
  ),
  "TRACK02_ALL_AVAILABLE"
);

console.log("TRACK02_BATCH_D_SIX_RUNTIME_DEFINITIONS=PASS");
console.log("TRACK02_BATCH_D_LESSON_SPEC_REGISTRATION=PASS");
console.log("TRACK02_BATCH_D_FORMAL_PRESENTATION=PASS");
console.log("TRACK02_FORMAL_COURSE_FIFTEEN_LESSONS=PASS");
console.log("TRACK02_ALL_FIFTEEN_AVAILABLE=PASS");
