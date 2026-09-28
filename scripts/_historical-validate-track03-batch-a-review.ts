import fs from "node:fs";
import { getCourse } from "../lib/courses";
import {
  getTrack03BatchAReviewPresentation,
  track03BatchAReviewDefinitions
} from "../lib/learning/track03-batch-a-review";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK03_BATCH_A_REVIEW_FAILED:" + code);
}

const ids = [
  "t3-01-icp-audience-fit",
  "t3-02-use-case-fit",
  "t3-03-message-hierarchy"
];

assert(
  JSON.stringify(track03BatchAReviewDefinitions.map((item) => item.lesson.id)) === JSON.stringify(ids),
  "REVIEW_IDS"
);

for (const definition of track03BatchAReviewDefinitions) {
  const id = definition.lesson.id;
  assert(getTrack03BatchAReviewPresentation("ai-growth", id), "PRESENTATION:" + id);
  assert(getLessonSpec("ai-growth", id) === null, "MUST_NOT_REGISTER_FORMAL_SPEC:" + id);
}

assert(!getCourse("ai-growth"), "FORMAL_AI_GROWTH_COURSE_MUST_NOT_EXIST");

const route = fs.readFileSync(
  "app/course-builder/preview/track03-batch-a/[lessonId]/page.tsx",
  "utf8"
);
assert(route.includes("previewMode"), "PREVIEW_MODE_REQUIRED");
assert(route.includes('canonicalId.replace("T3-", "")'), "LEARNER_NORMAL_SEQUENCE_REQUIRED");
assert(route.includes("previewTriggerScenario={presentation.triggerScenario}"), "PREVIEW_TRIGGER_SCENARIO_REQUIRED");
assert(route.includes("不保存正式学习状态"), "NO_FORMAL_PROGRESS_COPY_REQUIRED");
assert(
  !route.includes("lesson-spec-registry") &&
    !route.includes("provision") &&
    !route.includes("runtimeAcceptance"),
  "PREVIEW_MUST_NOT_MUTATE_FORMAL_RUNTIME"
);

console.log("TRACK03_BATCH_A_PREVIEW_THREE_LESSONS=PASS");
console.log("TRACK03_BATCH_A_PREVIEW_PRESENTATION=PASS");
console.log("TRACK03_BATCH_A_NO_FORMAL_SPEC_REGISTRATION=PASS");
console.log("TRACK03_BATCH_A_NO_FORMAL_COURSE=PASS");
