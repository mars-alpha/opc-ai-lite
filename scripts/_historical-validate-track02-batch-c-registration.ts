import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { track02Catalog } from "../lib/learning/track-catalog";
import {
  getTrack02BatchCRuntimePresentation,
  track02BatchCRuntimeDefinitions
} from "../lib/learning/track02-batch-c-runtime";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK02_BATCH_C_REGISTRATION_FAILED:" + code);
}

const ids = [
  "t2-07-targeted-document-reading",
  "t2-08-cross-document-comparison",
  "t2-09-information-to-action"
];

assert(
  JSON.stringify(track02BatchCRuntimeDefinitions.map((d) => d.lesson.id)) === JSON.stringify(ids),
  "APPROVED_CATALOG_IDS"
);

const course = getCourse("ai-work");
assert(course && getAllLessons(course).length === 9, "NINE_FORMAL_LESSONS");

for (const definition of track02BatchCRuntimeDefinitions) {
  const id = definition.lesson.id;
  assert(getLessonSpec("ai-work", id) === definition.spec, "SPEC:" + id);
  assert(getTrack02BatchCRuntimePresentation("ai-work", id), "PRESENTATION:" + id);
  assert(definition.checks.length === 3 && definition.practice.required, "CHECK_PRACTICE:" + id);
  assert(definition.practice.submissionSchema.kind === "STRUCTURED_TEXT_V1", "PRACTICE_SCHEMA:" + id);
}

const catalog = track02Catalog.flatMap((stage) => stage.lessons);
assert(
  catalog.slice(6, 9).every(
    (d, i) =>
      d.lessonId === ids[i] &&
      d.curriculumStatus === "AVAILABLE" &&
      d.availability === "AVAILABLE" &&
      d.runtimeCourseSlug === "ai-work" &&
      d.runtimeLessonId === ids[i]
  ),
  "BATCH_C_AVAILABLE"
);
assert(catalog.slice(9).every((d) => d.availability === "COMING_SOON"), "LATER_COURSES_UNTOUCHED");

const formalPage = fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx", "utf8");
assert(formalPage.includes('item.availability !== "AVAILABLE"'), "FORMAL_ROUTE_CLOSED_UNTIL_PUBLISHED");
assert(formalPage.includes("getTrack02BatchCRuntimePresentation"), "FORMAL_ROUTE_PRESENTATION");

console.log("TRACK02_BATCH_C_LESSON_SPEC_REGISTERED=PASS");
console.log("TRACK02_BATCH_C_FORMAL_COURSE_PRESENTATION_REGISTERED=PASS");
console.log("TRACK02_BATCH_C_CATALOG_AVAILABLE=PASS");
console.log("TRACK02_BATCH_C_RUNTIME_DEFINITION=PASS");
