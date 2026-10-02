import fs from "node:fs";
import { formalLessonSpecs } from "../lib/learning/lesson-spec-registry";
import { learningTracks } from "../lib/learning/track-catalog";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_CURRENT_STATE_FAILED:" + code);
}

const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
const status = fs.readFileSync("PROJECT_STATUS.md", "utf8");
const contexts = fs.readFileSync("docs/learning/TRACK_CONTEXTS_V1.md", "utf8");
const entry = fs.readFileSync("docs/learning/COURSE_BUILD_START_HERE.md", "utf8");

const tracks = Object.values(learningTracks);
const catalogLessons = tracks.flatMap((track) =>
  track.stages.flatMap((stage) => stage.lessons)
);

assert(tracks.length === 5, "FIVE_TRACKS_REQUIRED");
assert(catalogLessons.length === 81, "EIGHTY_ONE_CATALOG_LESSONS_REQUIRED");
assert(formalLessonSpecs.length === 81, "EIGHTY_ONE_FORMAL_SPECS_REQUIRED");

const catalogKeys = new Set(
  catalogLessons.map((lesson) => lesson.runtimeCourseSlug + "/" + lesson.runtimeLessonId)
);
const specKeys = new Set(
  formalLessonSpecs.map((spec) => spec.courseSlug + "/" + spec.lessonId)
);
assert(catalogKeys.size === 81, "CATALOG_LESSON_IDENTITY_DUPLICATE");
assert(specKeys.size === 81, "FORMAL_SPEC_IDENTITY_DUPLICATE");
for (const key of catalogKeys) assert(specKeys.has(key), "FORMAL_SPEC_MISSING:" + key);

for (const lesson of catalogLessons) {
  assert(lesson.curriculumStatus === "AVAILABLE", "CATALOG_NOT_AVAILABLE:" + lesson.lessonId);
  assert(lesson.availability === "AVAILABLE", "LESSON_NOT_AVAILABLE:" + lesson.lessonId);
  assert(contexts.includes(lesson.lessonId), "TRACK_CONTEXT_MISSING:" + lesson.lessonId);
}

assert(facts.includes("Track 01～05 共 81 节正式课程"), "CURRENT_FACTS_81_LESSONS_MISSING");
assert(facts.includes("课程目录结构与六步 Runtime 继续冻结"), "CURRENT_FACTS_FREEZE_MISSING");
assert(facts.includes("课程正文采用正式版本受控更新"), "CURRENT_FACTS_VERSIONED_CONTENT_MISSING");
assert(status.includes("81 LESSONS / FROZEN"), "PROJECT_STATUS_FREEZE_MISSING");
assert(entry.includes("Track 01～05 已正式上线并冻结"), "COURSE_ENTRY_FREEZE_MISSING");

assert(
  JSON.stringify(COURSE_PRODUCTION_RULE_SOURCES) ===
    JSON.stringify([
      "docs/learning/FORMAL_CURRICULUM_V1.md",
      "docs/learning/COURSE_BUILD_STANDARD_V1.md",
      "docs/learning/UNIFIED_LESSON_SHELL_V1.md"
    ]),
  "COURSE_RULE_SOURCE_SET_DRIFT"
);

console.log("COURSE_CURRENT_STATE_5_TRACKS_81_LESSONS=PASS");
console.log("COURSE_CURRENT_STATE_ALL_AVAILABLE=PASS");
console.log("COURSE_CURRENT_STATE_FORMAL_REGISTRY_PARITY=PASS");
console.log("COURSE_CURRENT_STATE_FROZEN=PASS");
console.log("COURSE_CURRENT_STATE_RULE_SOURCES=PASS");