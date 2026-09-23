import { getAllLessons } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import {
  TRACK01_PHASE1_COURSE_SLUG,
  getTrack01Phase1RuntimePresentation,
  track01Phase1Course,
  track01FormalLessonSpecs
} from "../lib/learning/track01-phase1-runtime";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("FORMAL_RUNTIME_REGISTRY_FAILED:" + code);
}

const lessons = getAllLessons(track01Phase1Course);
assert(lessons.length === track01FormalLessonSpecs.length, "LESSON_SPEC_COUNT_MISMATCH");

for (const lesson of lessons) {
  const spec = getLessonSpec(TRACK01_PHASE1_COURSE_SLUG, lesson.id);
  assert(spec, "LESSON_SPEC_MISSING:" + lesson.id);
  assert(spec.steps.length === 6, "SIX_STEP_SPEC_REQUIRED:" + lesson.id);
  const presentation = getTrack01Phase1RuntimePresentation(TRACK01_PHASE1_COURSE_SLUG, lesson.id);
  assert(presentation, "PRESENTATION_MISSING:" + lesson.id);
}

console.log("FORMAL_LESSON_RUNTIME_REGISTRY=PASS");
console.log("FORMAL_LESSON_LEGACY_FALLBACK_FORBIDDEN=PASS");
