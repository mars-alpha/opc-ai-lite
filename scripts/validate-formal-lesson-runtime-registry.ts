import { getAllLessons } from "../lib/courses";
import { formalLessonSpecs, getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { validateLessonSpec } from "../lib/learning/lesson-spec";
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

const navigationSets = new Set<string>();
for (const spec of formalLessonSpecs) {
  assert(getLessonSpec(spec.courseSlug, spec.lessonId) === spec, "FORMAL_SPEC_NOT_REGISTERED:" + spec.lessonId);
  assert(spec.steps.length === 6, "FORMAL_SIX_STEP_SPEC_REQUIRED:" + spec.lessonId);
  assert(
    validateLessonSpec(spec).every((issue) => issue.severity !== "ERROR"),
    "FORMAL_SPEC_INVALID:" + spec.lessonId
  );
  const descriptions = spec.steps.map((step) => step.navigationDescription);
  assert(descriptions.every(Boolean), "FORMAL_NAVIGATION_MISSING:" + spec.lessonId);
  assert(new Set(descriptions).size === 6, "FORMAL_NAVIGATION_REPEATED_STEP:" + spec.lessonId);
  const sequence = descriptions.join("|");
  assert(!navigationSets.has(sequence), "FORMAL_NAVIGATION_REPEATED_LESSON:" + spec.lessonId);
  navigationSets.add(sequence);
  // Track 01 predates the Hero learning advice; subsequent formal Tracks supply it.
  if (!track01FormalLessonSpecs.includes(spec)) {
    assert(spec.learningRecommendation?.trim(), "FORMAL_LEARNING_ADVICE_MISSING:" + spec.lessonId);
  }
}

const sample = formalLessonSpecs[0];
assert(
  validateLessonSpec({
    ...sample,
    steps: sample.steps.map((step, index) => index === 0 ? { ...step, navigationDescription: "只有一行" } : step)
  }).some((issue) => issue.code === "STEP_NAVIGATION_DESCRIPTION_INVALID"),
  "NAVIGATION_LINE_VALIDATOR_INACTIVE"
);
assert(
  validateLessonSpec({ ...sample, learningRecommendation: "先做准备。然后学习。" })
    .some((issue) => issue.code === "LEARNING_RECOMMENDATION_NOT_ONE_SENTENCE"),
  "LEARNING_ADVICE_SENTENCE_VALIDATOR_INACTIVE"
);

console.log("FORMAL_LESSON_RUNTIME_REGISTRY=PASS");
console.log("FORMAL_LESSON_PRESENTATION_COPY=PASS");
console.log("FORMAL_LESSON_LEGACY_FALLBACK_FORBIDDEN=PASS");
