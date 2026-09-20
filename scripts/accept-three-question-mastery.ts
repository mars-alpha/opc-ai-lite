import {
  courseBuilderCheckSequenceToRuntimeSeeds,
  validateCourseBuilderOutput
} from "../lib/learning/course-builder";
import {
  evaluateLessonCheckAnswers,
  isThreeQuestionMasterySequence,
  isThreeQuestionMasteryComplete
} from "../lib/learning/check-evaluator";
import { promptFoundationsBuildDraft } from "../fixtures/course-builder/prompt-foundations";
import { skillFoundationsBuildDraft } from "../fixtures/course-builder/skill-foundations";
import { meetingActionListBuildDraft } from "../fixtures/course-builder/meeting-action-list";
import { aiWorkflowProjectBuildDraft } from "../fixtures/course-builder/ai-workflow-project";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const parsed = validateCourseBuilderOutput(promptFoundationsBuildDraft);
if (parsed.mode !== "BUILD") throw new Error("MASTERY_BUILD_REQUIRED");

assert(parsed.check === null, "MASTERY_LEGACY_CHECK_NULL");
assert(parsed.checkSequence?.length === 3, "MASTERY_THREE_QUESTIONS");
if (!parsed.checkSequence) throw new Error("MASTERY_SEQUENCE_REQUIRED");

assert(
  parsed.checkSequence.map((item) => item.questionType).join(">") ===
    "SINGLE_CHOICE>TRUE_FALSE>MULTI_SELECT",
  "MASTERY_SEQUENCE_ORDER"
);
assert(
  parsed.checkSequence.map((item) => item.masteryRole).join(">") ===
    "BEST_JUDGMENT>MISCONCEPTION>BOUNDARY_CONDITIONS",
  "MASTERY_SEQUENCE_ROLES"
);
assert(
  parsed.checkSequence.every(
    (item) => item.correctFeedback.length > 0 && item.incorrectFeedback.length > 0
  ),
  "MASTERY_PER_QUESTION_FEEDBACK"
);
assert(
  new Set(parsed.checkSequence.map((item) => item.question)).size === 3,
  "MASTERY_QUESTIONS_MUST_DIFFER"
);

const seeds = courseBuilderCheckSequenceToRuntimeSeeds(parsed.checkSequence);
assert(seeds.length === 3, "MASTERY_RUNTIME_SEED_COUNT");
assert(seeds.map((seed) => seed.order).join(",") === "0,1,2", "MASTERY_RUNTIME_ORDER");
assert(seeds.every((seed) => seed.required), "MASTERY_RUNTIME_REQUIRED");
assert(
  isThreeQuestionMasterySequence(
    seeds.map((seed) => ({ type: seed.type, required: seed.required }))
  ),
  "MASTERY_RUNTIME_SEQUENCE_DETECTED"
);
assert(
  seeds.every(
    (seed) => Boolean(seed.explanation) && Boolean(seed.incorrectExplanation)
  ),
  "MASTERY_RUNTIME_FEEDBACK_READY"
);

const first = parsed.checkSequence[0];
const wrong = evaluateLessonCheckAnswers(
  first.questionType,
  first.correctValues,
  ["A"]
);
assert(!wrong.isCorrect, "MASTERY_WRONG_MUST_RETRY");
const corrected = evaluateLessonCheckAnswers(
  first.questionType,
  first.correctValues,
  first.correctValues
);
assert(corrected.isCorrect, "MASTERY_CORRECT_CAN_ADVANCE");

const third = parsed.checkSequence[2];
assert(
  !evaluateLessonCheckAnswers(
    third.questionType,
    third.correctValues,
    third.correctValues.slice(0, -1)
  ).isCorrect,
  "MASTERY_MULTI_PARTIAL_FAIL"
);
assert(
  evaluateLessonCheckAnswers(
    third.questionType,
    third.correctValues,
    third.correctValues
  ).isCorrect,
  "MASTERY_MULTI_EXACT_PASS"
);

assert(
  !isThreeQuestionMasteryComplete([
    { type: "SINGLE_CHOICE", required: true, isCorrect: true },
    { type: "TRUE_FALSE", required: true, isCorrect: false },
    { type: "MULTI_SELECT", required: true, isCorrect: true }
  ]),
  "MASTERY_SEQUENCE_WRONG_BLOCKS_COMPLETION"
);
assert(
  isThreeQuestionMasteryComplete([
    { type: "SINGLE_CHOICE", required: true, isCorrect: true },
    { type: "TRUE_FALSE", required: true, isCorrect: true },
    { type: "MULTI_SELECT", required: true, isCorrect: true }
  ]),
  "MASTERY_SEQUENCE_ALL_CORRECT_COMPLETES"
);

for (const draft of [
  skillFoundationsBuildDraft,
  meetingActionListBuildDraft,
  aiWorkflowProjectBuildDraft
]) {
  const supported = validateCourseBuilderOutput({
    ...draft,
    check: null,
    checkSequence: promptFoundationsBuildDraft.checkSequence
  });
  if (supported.mode !== "BUILD") throw new Error("MASTERY_CROSS_TYPE_BUILD_REQUIRED");
  assert(Boolean(supported.checkSequence), "MASTERY_CROSS_TYPE_SEQUENCE_SUPPORTED");
}

const legacy = validateCourseBuilderOutput(skillFoundationsBuildDraft);
if (legacy.mode !== "BUILD") throw new Error("LEGACY_BUILD_REQUIRED");
assert(Boolean(legacy.check), "LEGACY_SINGLE_CHECK_SUPPORTED");
assert(legacy.checkSequence === null, "LEGACY_SEQUENCE_NULL");

console.log("MASTERY_THREE_QUESTION_ORDER=PASS");
console.log("MASTERY_DISTINCT_ROLES=PASS");
console.log("MASTERY_CORRECT_INCORRECT_FEEDBACK=PASS");
console.log("MASTERY_WRONG_REQUIRES_RETRY=PASS");
console.log("MASTERY_CORRECT_ADVANCES=PASS");
console.log("MASTERY_MULTI_EXACT_SET=PASS");
console.log("MASTERY_ALL_THREE_CORRECT_TO_COMPLETE=PASS");
console.log("MASTERY_LEGACY_SINGLE_CHECK=PASS");
console.log("MASTERY_RUNTIME_SEEDS=PASS");
