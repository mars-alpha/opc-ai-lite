import {
  courseBuilderCheckToRuntimeSeed,
  validateCourseBuilderOutput
} from "../lib/learning/course-builder";
import { evaluateLessonCheckAnswers } from "../lib/learning/check-evaluator";
import { promptFoundationsBuildDraft } from "../fixtures/course-builder/prompt-foundations";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const single = evaluateLessonCheckAnswers("SINGLE_CHOICE", ["B"], "B");
assert(single.isCorrect, "FORMAL_SINGLE_CHOICE_PASS");
assert(single.answers.join(",") === "B", "FORMAL_SINGLE_CHOICE_NORMALIZED");

const trueFalse = evaluateLessonCheckAnswers("TRUE_FALSE", ["FALSE"], ["FALSE"]);
assert(trueFalse.isCorrect, "FORMAL_TRUE_FALSE_PASS");

const multi = evaluateLessonCheckAnswers(
  "MULTI_SELECT",
  ["TASK", "CONTEXT", "FORMAT"],
  ["FORMAT", "TASK", "CONTEXT"]
);
assert(multi.isCorrect, "FORMAL_MULTI_SELECT_PASS");
assert(
  multi.answers.join(",") === "CONTEXT,FORMAT,TASK",
  "FORMAL_MULTI_SELECT_CANONICAL_ORDER"
);
assert(
  !evaluateLessonCheckAnswers(
    "MULTI_SELECT",
    ["TASK", "CONTEXT", "FORMAT"],
    ["TASK", "CONTEXT"]
  ).isCorrect,
  "FORMAL_MULTI_SELECT_PARTIAL_FAIL"
);
assert(
  !evaluateLessonCheckAnswers(
    "MULTI_SELECT",
    ["TASK", "CONTEXT", "FORMAT"],
    ["TASK", "CONTEXT", "FORMAT", "FLUFF"]
  ).isCorrect,
  "FORMAL_MULTI_SELECT_EXTRA_FAIL"
);
assert(
  evaluateLessonCheckAnswers(
    "MULTI_SELECT",
    ["TASK", "CONTEXT"],
    ["TASK", "TASK", "CONTEXT"]
  ).isCorrect,
  "FORMAL_MULTI_SELECT_DUPLICATE_NORMALIZED"
);

let invalidSingleRejected = false;
try {
  evaluateLessonCheckAnswers("SINGLE_CHOICE", ["B"], ["A", "B"]);
} catch (error) {
  invalidSingleRejected =
    error instanceof Error && error.message === "INVALID_CHECK_ANSWER";
}
assert(invalidSingleRejected, "FORMAL_SINGLE_MULTIPLE_REJECTED");

const parsed = validateCourseBuilderOutput({
  ...promptFoundationsBuildDraft,
  checkSequence: null,
  check: {
    id: "formal-runtime-multi",
    questionType: "MULTI_SELECT",
    question: "哪些信息能减少 AI 猜测？",
    options: [
      { value: "TASK", label: "明确任务" },
      { value: "CONTEXT", label: "必要上下文" },
      { value: "FORMAT", label: "结果格式" },
      { value: "FLUFF", label: "堆形容词" }
    ],
    correctValues: ["TASK", "CONTEXT", "FORMAT"],
    explanation: "任务、上下文和结果格式能降低歧义。"
  }
});
if (parsed.mode !== "BUILD" || !parsed.check) throw new Error("FORMAL_RUNTIME_BUILD_CHECK_REQUIRED");
const runtimeSeed = courseBuilderCheckToRuntimeSeed(parsed.check);
assert(runtimeSeed.type === "MULTI_SELECT", "FORMAL_RUNTIME_SEED_TYPE");
assert(runtimeSeed.correctAnswer === "TASK", "FORMAL_RUNTIME_LEGACY_CORRECT_ANSWER");
assert(
  runtimeSeed.correctAnswers.join(",") === "TASK,CONTEXT,FORMAT",
  "FORMAL_RUNTIME_CORRECT_ANSWERS"
);

console.log("FORMAL_CHECK_SINGLE_CHOICE=PASS");
console.log("FORMAL_CHECK_TRUE_FALSE=PASS");
console.log("FORMAL_CHECK_MULTI_SELECT=PASS");
console.log("FORMAL_CHECK_EXACT_SET_EVALUATION=PASS");
console.log("FORMAL_CHECK_LEGACY_COMPATIBILITY=PASS");
console.log("COURSE_BUILDER_TO_RUNTIME_SEED=PASS");
console.log("FORMAL_CHECK_RUNTIME_STATUS=CODE_READY_MIGRATION_PENDING");
