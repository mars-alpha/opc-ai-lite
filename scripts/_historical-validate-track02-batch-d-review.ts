import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import {
  getTrack02BatchDReviewPresentation,
  track02BatchDReviewDefinitions
} from "../lib/learning/track02-batch-d-review";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK02_BATCH_D_REVIEW_FAILED:" + code);
}

const ids = [
  "t2-10-metric-definition",
  "t2-11-data-quality",
  "t2-12-data-analysis",
  "t2-13-knowledge-capture",
  "t2-14-knowledge-organization",
  "t2-15-reusable-method"
];

assert(
  JSON.stringify(track02BatchDReviewDefinitions.map((item) => item.lesson.id)) === JSON.stringify(ids),
  "REVIEW_IDS"
);

for (const definition of track02BatchDReviewDefinitions) {
  const id = definition.lesson.id;
  assert(getTrack02BatchDReviewPresentation("ai-work", id), "PRESENTATION:" + id);
  assert(getLessonSpec("ai-work", id) === null, "MUST_NOT_REGISTER_FORMAL_SPEC:" + id);
}

const course = getCourse("ai-work");
assert(course && getAllLessons(course).length === 9, "FORMAL_COURSE_MUST_STAY_AT_NINE");

const route = fs.readFileSync(
  "app/course-builder/preview/track02-batch-d/[lessonId]/page.tsx",
  "utf8"
);
assert(route.includes("previewMode"), "PREVIEW_MODE_REQUIRED");
assert(route.includes('canonicalId.replace("T2-", "")'), "LEARNER_NORMAL_SEQUENCE_REQUIRED");
assert(route.includes("previewTriggerScenario={presentation.triggerScenario}"), "PREVIEW_TRIGGER_SCENARIO_REQUIRED");
assert(route.includes("不保存正式学习状态"), "NO_FORMAL_PROGRESS_COPY_REQUIRED");
assert(
  !route.includes("lesson-spec-registry") &&
    !route.includes("provision") &&
    !route.includes("runtimeAcceptance"),
  "PREVIEW_MUST_NOT_MUTATE_FORMAL_RUNTIME"
);

console.log("TRACK02_BATCH_D_PREVIEW_SIX_LESSONS=PASS");
console.log("TRACK02_BATCH_D_PREVIEW_PRESENTATION=PASS");
console.log("TRACK02_BATCH_D_NO_FORMAL_SPEC_REGISTRATION=PASS");
console.log("TRACK02_BATCH_D_FORMAL_COURSE_STILL_NINE=PASS");
