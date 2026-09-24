import { courses, getAllLessons, getCourse } from "../lib/courses";
import { nextCourseProductionStage } from "../lib/learning/course-production-orchestrator";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { validateLessonSpec } from "../lib/learning/lesson-spec";
import {
  TRACK02_COURSE_SLUG,
  track02BatchALessonIds,
  track02BatchALessonSpecs
} from "../lib/learning/track02-batch-a-specs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK02_LESSONSPEC_REGISTRATION_FAILED:" + code);
}

const expectedIds = [
  "t2-01-research-question-scope",
  "t2-02-source-evidence-judgment",
  "t2-03-multi-source-synthesis"
];

assert(TRACK02_COURSE_SLUG === "ai-work", "COURSE_SLUG_DRIFT");
assert(track02BatchALessonSpecs.length === 3, "THREE_SPECS_REQUIRED");
assert(JSON.stringify(track02BatchALessonIds) === JSON.stringify(expectedIds), "LESSON_ORDER_DRIFT");

for (const spec of track02BatchALessonSpecs) {
  assert(spec.courseSlug === TRACK02_COURSE_SLUG, "SPEC_COURSE_SLUG_DRIFT:" + spec.lessonId);
  assert(spec.lessonType === "APPLICATION", "APPLICATION_REQUIRED:" + spec.lessonId);
  assert(spec.steps.length === 6, "SIX_STEPS_REQUIRED:" + spec.lessonId);
  assert(JSON.stringify(spec.completionGates) === JSON.stringify(["CHECK", "PRACTICE"]), "COMPLETION_GATE_DRIFT:" + spec.lessonId);
  const issues = validateLessonSpec(spec);
  assert(issues.every((issue) => issue.severity !== "ERROR"), "SPEC_VALIDATION_ERROR:" + spec.lessonId);
  const registered = getLessonSpec(TRACK02_COURSE_SLUG, spec.lessonId);
  assert(registered, "REGISTRY_LOOKUP_MISSING:" + spec.lessonId);
  assert(registered === spec, "REGISTRY_MUST_RETURN_CANONICAL_SPEC:" + spec.lessonId);
}

assert(getLessonSpec(TRACK02_COURSE_SLUG, "t2-04-audience-purpose") === null, "UNAPPROVED_TRACK02_SPEC_MUST_NOT_REGISTER");
const course = getCourse(TRACK02_COURSE_SLUG);
assert(Boolean(course), "TRACK02_RUNTIME_COURSE_REQUIRED");
assert(course ? getAllLessons(course).length === 3 : false, "TRACK02_RUNTIME_ONLY_BATCH_A_REQUIRED");
assert(courses.some((item) => item.slug === TRACK02_COURSE_SLUG), "TRACK02_RUNTIME_COURSE_MUST_EXIST");

const nextStage = nextCourseProductionStage({
  ruleSourcesLoaded: [...COURSE_PRODUCTION_RULE_SOURCES],
  groundingReady: true,
  courseContextReady: true,
  formalBriefReady: true,
  draftReady: true,
  deterministicValidation: "PASS",
  humanReview: "PASS",
  lessonSpecRegistered: true,
  runtimeProvisioned: true,
  runtimeAcceptance: "PASS",
  available: true
});
assert(nextStage === "COMPLETE", "WORKFLOW_MUST_BE_COMPLETE_AFTER_RUNTIME_ACCEPTANCE");

console.log("TRACK02_BATCH_A_LESSONSPEC_COUNT=PASS");
console.log("TRACK02_BATCH_A_LESSONSPEC_VALIDATION=PASS");
console.log("TRACK02_BATCH_A_REGISTRY_LOOKUP=PASS");
console.log("TRACK02_BATCH_A_UNAPPROVED_SPECS_EXCLUDED=PASS");
console.log("TRACK02_BATCH_A_RUNTIME_PROVISIONED=PASS");
console.log("TRACK02_BATCH_A_WORKFLOW_COMPLETE=PASS");
