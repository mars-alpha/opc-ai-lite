import fs from "node:fs";
import { courses } from "../lib/courses";
import { formalLessonSpecs } from "../lib/learning/lesson-spec-registry";
import {
  formalRuntimeLessonId,
  formalRuntimeModuleId,
  formalRuntimeStageId
} from "../lib/server/learning/formal-identity";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("FORMAL_LEARNING_IDENTITY_FAILED:" + code);
}

assert(formalLessonSpecs.length === 81, "FORMAL_SPEC_COUNT_NOT_81");

const lessonIds = new Set<string>();
for (const spec of formalLessonSpecs) {
  const course = courses.find((item) => item.slug === spec.courseSlug);
  assert(course, "COURSE_SOURCE_MISSING:" + spec.courseSlug);

  const module = course.modules.find((item) =>
    item.lessons.some((lesson) => lesson.id === spec.lessonId)
  );
  assert(module, "MODULE_SOURCE_MISSING:" + spec.courseSlug + "/" + spec.lessonId);

  const lesson = module.lessons.find((item) => item.id === spec.lessonId);
  assert(lesson, "LESSON_SOURCE_MISSING:" + spec.courseSlug + "/" + spec.lessonId);

  const lessonId = formalRuntimeLessonId(spec.courseSlug, spec.lessonId);
  assert(!lessonIds.has(lessonId), "LESSON_ID_DUPLICATE:" + lessonId);
  lessonIds.add(lessonId);

  assert(formalRuntimeStageId(spec.courseSlug).startsWith("stage_"), "STAGE_ID_INVALID");
  assert(
    formalRuntimeModuleId(spec.courseSlug, module.id).startsWith("module_"),
    "MODULE_ID_INVALID"
  );
}

const maintenance = fs.readFileSync("lib/server/admin/course-maintenance.ts", "utf8");
const owner = fs.readFileSync("lib/server/learning/formal-identity.ts", "utf8");
const provision = fs.readFileSync("scripts/provision-formal-learning-identities.ts", "utf8");

assert(
  maintenance.includes("ensureFormalLearningIdentity"),
  "COURSE_MAINTENANCE_NOT_USING_SHARED_IDENTITY_OWNER"
);
assert(
  !maintenance.includes("function runtimeLessonId("),
  "DUPLICATE_LESSON_ID_OWNER_FORBIDDEN"
);
assert(!owner.includes("lessonChecks"), "IDENTITY_OWNER_MUST_NOT_PROVISION_CHECKS");
assert(!owner.includes("practices"), "IDENTITY_OWNER_MUST_NOT_PROVISION_PRACTICES");
assert(
  provision.includes('const CONFIRM = "LEARNING-IDENTITY-001"'),
  "PROVISION_CONFIRM_GUARD_MISSING"
);
assert(provision.includes("DRY_RUN_ONLY=PASS"), "PROVISION_DRY_RUN_MISSING");

console.log("FORMAL_LEARNING_IDENTITY_SOURCE_81=PASS");
console.log("FORMAL_LEARNING_IDENTITY_IDS_UNIQUE=PASS");
console.log("FORMAL_LEARNING_IDENTITY_SHARED_OWNER=PASS");
console.log("FORMAL_LEARNING_IDENTITY_NO_FAKE_INTERACTIONS=PASS");
