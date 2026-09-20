import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  evaluateCourseBuilderCheck,
  validateCourseBuilderOutput
} from "../lib/learning/course-builder";
import { skillFoundationsBuildDraft } from "../fixtures/course-builder/skill-foundations";
import { promptFoundationsBuildDraft } from "../fixtures/course-builder/prompt-foundations";
import { meetingActionListBuildDraft } from "../fixtures/course-builder/meeting-action-list";
import { aiWorkflowProjectBuildDraft } from "../fixtures/course-builder/ai-workflow-project";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const drafts = [
  skillFoundationsBuildDraft,
  promptFoundationsBuildDraft,
  meetingActionListBuildDraft,
  aiWorkflowProjectBuildDraft
];

for (const draft of drafts) {
  const parsed = validateCourseBuilderOutput(draft);
  if (parsed.mode !== "BUILD") throw new Error("BUILD_REQUIRED");
  assert(parsed.pedagogy.conceptMasteryBeforePractice, "CONCEPT_MASTERY_CONTRACT_REQUIRED");
  assert(
    parsed.lessonSpec.steps.slice(0, 3).map((step) => step.kind).join(">") ===
      "EXPLAIN>EXAMPLE>CHECK",
    "FIRST_THREE_STEPS_MUST_BUILD_MASTERY"
  );
  assert(
    parsed.pedagogy.sixStepResponsibilities.PRACTICE.avoid.includes("核心概念"),
    "PRACTICE_MUST_NOT_INTRODUCE_CORE_THEORY"
  );
}

const base = promptFoundationsBuildDraft;

const single = validateCourseBuilderOutput({
  ...base,
  checkSequence: null,
  check: {
    id: "single-choice",
    question: "哪一个最清楚？",
    options: [
      { value: "A", label: "模糊表达" },
      { value: "B", label: "明确表达" }
    ],
    correctValue: "B",
    explanation: "B 明确说明了任务和结果。"
  }
});
if (single.mode !== "BUILD" || !single.check) throw new Error("SINGLE_CHECK_REQUIRED");
assert(single.check.questionType === "SINGLE_CHOICE", "SINGLE_CHOICE_DEFAULT");
assert(evaluateCourseBuilderCheck(single.check, ["B"]), "SINGLE_CHOICE_EVALUATION");

const trueFalse = validateCourseBuilderOutput({
  ...base,
  checkSequence: null,
  check: {
    id: "true-false",
    questionType: "TRUE_FALSE",
    question: "Prompt 越长一定越好吗？",
    options: [
      { value: "TRUE", label: "对" },
      { value: "FALSE", label: "错" }
    ],
    correctValues: ["FALSE"],
    explanation: "错。重点是减少 AI 猜测，而不是单纯增加长度。"
  }
});
if (trueFalse.mode !== "BUILD" || !trueFalse.check) throw new Error("TRUE_FALSE_CHECK_REQUIRED");
assert(trueFalse.check.questionType === "TRUE_FALSE", "TRUE_FALSE_TYPE");
assert(evaluateCourseBuilderCheck(trueFalse.check, ["FALSE"]), "TRUE_FALSE_EVALUATION");

const multi = validateCourseBuilderOutput({
  ...base,
  checkSequence: null,
  check: {
    id: "multi-select",
    questionType: "MULTI_SELECT",
    question: "哪些信息有助于减少 AI 猜测？",
    options: [
      { value: "TASK", label: "明确任务" },
      { value: "CONTEXT", label: "必要上下文" },
      { value: "FORMAT", label: "结果格式" },
      { value: "FLUFF", label: "堆很多形容词" }
    ],
    correctValues: ["TASK", "CONTEXT", "FORMAT"],
    explanation: "任务、必要上下文和结果要求都会减少猜测；堆形容词不会自动提升清晰度。"
  }
});
if (multi.mode !== "BUILD" || !multi.check) throw new Error("MULTI_CHECK_REQUIRED");
assert(multi.check.questionType === "MULTI_SELECT", "MULTI_SELECT_TYPE");
assert(
  evaluateCourseBuilderCheck(multi.check, ["FORMAT", "TASK", "CONTEXT"]),
  "MULTI_SELECT_SET_EVALUATION"
);
assert(
  !evaluateCourseBuilderCheck(multi.check, ["TASK", "CONTEXT"]),
  "MULTI_SELECT_PARTIAL_MUST_FAIL"
);
assert(
  !evaluateCourseBuilderCheck(multi.check, ["TASK", "CONTEXT", "FORMAT", "FLUFF"]),
  "MULTI_SELECT_EXTRA_MUST_FAIL"
);

assert(
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES.CHECK.purpose.includes("单选") &&
    COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES.CHECK.purpose.includes("判断") &&
    COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES.CHECK.purpose.includes("多选"),
  "CHECK_QUESTION_TYPES_DOCUMENTED"
);

console.log("CONCEPT_MASTERY_BEFORE_PRACTICE=PASS");
console.log("FIRST_THREE_STEPS_MASTERY_LOOP=PASS");
console.log("STEP4_NO_NEW_CORE_THEORY=PASS");
console.log("CHECK_SINGLE_CHOICE=PASS");
console.log("CHECK_TRUE_FALSE=PASS");
console.log("CHECK_MULTI_SELECT=PASS");
console.log("CHECK_DETERMINISTIC_EVALUATION=PASS");
console.log("FOUR_LESSON_TYPES_CONTRACT=PASS");
