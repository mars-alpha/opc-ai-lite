import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { track02Catalog } from "../lib/learning/track-catalog";
import { track02BatchBRuntimeDefinitions, getTrack02BatchBRuntimePresentation, track02CourseWithBatchB } from "../lib/learning/track02-batch-b-runtime";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK02_BATCH_B_REGISTRATION_FAILED:" + code);
}
const ids = ["t2-04-audience-purpose", "t2-05-source-to-deliverable", "t2-06-editorial-revision"];
assert(JSON.stringify(track02BatchBRuntimeDefinitions.map((d) => d.lesson.id)) === JSON.stringify(ids), "APPROVED_CATALOG_IDS");
const course = getCourse("ai-work");
assert(course && getAllLessons(course).length === 6, "SIX_FORMAL_LESSONS");
assert(JSON.stringify(getAllLessons(track02CourseWithBatchB).map((d) => d.id).slice(3)) === JSON.stringify(ids), "SIX_LESSON_SEQUENCE_READY_AFTER_REVIEW");
for (const definition of track02BatchBRuntimeDefinitions) {
  const id = definition.lesson.id;
  assert(getLessonSpec("ai-work", id) === definition.spec, "SPEC:" + id);
  assert(getTrack02BatchBRuntimePresentation("ai-work", id), "PRESENTATION:" + id);
  assert(definition.checks.length === 3 && definition.practice.required, "CHECK_PRACTICE:" + id);
  assert(definition.practice.submissionSchema.kind === "STRUCTURED_TEXT_V1", "PRACTICE_SCHEMA:" + id);
}
const catalog = track02Catalog.flatMap((stage) => stage.lessons);
assert(catalog.slice(3, 6).every((d, i) => d.lessonId === ids[i] && d.curriculumStatus === "AVAILABLE" && d.availability === "AVAILABLE" && d.runtimeCourseSlug === "ai-work" && d.runtimeLessonId === ids[i]), "BATCH_B_AVAILABLE");
assert(catalog.slice(6).every((d) => d.availability === "COMING_SOON"), "LATER_COURSES_UNTOUCHED");
const formalPage = fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx", "utf8");
assert(formalPage.includes('item.availability !== "AVAILABLE"'), "FORMAL_ROUTE_CLOSED_UNTIL_PUBLISHED");
assert(formalPage.includes("getTrack02BatchBRuntimePresentation"), "FORMAL_ROUTE_PRESENTATION");
console.log("TRACK02_BATCH_B_LESSON_SPEC_REGISTERED=PASS");
console.log("TRACK02_BATCH_B_FORMAL_COURSE_PRESENTATION_REGISTERED=PASS");
console.log("TRACK02_BATCH_B_CATALOG_AVAILABLE=PASS");
console.log("TRACK02_BATCH_B_RUNTIME_PUBLISHED=PASS");
