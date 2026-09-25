import fs from "node:fs";
import { getAllLessons, getCourse } from "../lib/courses";
import {
  getTrack02BatchCReviewPresentation,
  track02BatchCReviewDefinitions
} from "../lib/learning/track02-batch-c-review";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK02_BATCH_C_REVIEW_FAILED:" + code);
}

const ids = [
  "t2-07-targeted-document-reading",
  "t2-08-cross-document-comparison",
  "t2-09-information-to-action"
];

assert(
  JSON.stringify(track02BatchCReviewDefinitions.map((item) => item.lesson.id)) ===
    JSON.stringify(ids),
  "REVIEW_IDS"
);

for (const definition of track02BatchCReviewDefinitions) {
  const id = definition.lesson.id;
  assert(
    getTrack02BatchCReviewPresentation("ai-work", id),
    "PRESENTATION:" + id
  );
  assert(
    getLessonSpec("ai-work", id) === null,
    "MUST_NOT_REGISTER_FORMAL_SPEC:" + id
  );
}

const course = getCourse("ai-work");
assert(course && getAllLessons(course).length === 6, "FORMAL_COURSE_MUST_STAY_AT_SIX");

const route = fs.readFileSync(
  "app/course-builder/preview/track02-batch-c/[lessonId]/page.tsx",
  "utf8"
);
assert(route.includes("previewMode"), "PREVIEW_MODE_REQUIRED");
assert(route.includes('canonicalId.replace("T2-", "")'), "LEARNER_NORMAL_SEQUENCE_REQUIRED");
assert(route.includes("previewTriggerScenario={presentation.triggerScenario}"), "PREVIEW_TRIGGER_SCENARIO_REQUIRED");
assert(
  route.includes("不保存正式学习状态"),
  "NO_FORMAL_PROGRESS_COPY_REQUIRED"
);
assert(
  !route.includes("lesson-spec-registry") &&
    !route.includes("provision") &&
    !route.includes("runtimeAcceptance"),
  "PREVIEW_MUST_NOT_MUTATE_FORMAL_RUNTIME"
);

console.log("TRACK02_BATCH_C_PREVIEW_THREE_LESSONS=PASS");
console.log("TRACK02_BATCH_C_PREVIEW_PRESENTATION=PASS");
console.log("TRACK02_BATCH_C_NO_FORMAL_SPEC_REGISTRATION=PASS");
console.log("TRACK02_BATCH_C_FORMAL_COURSE_STILL_SIX=PASS");
