import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { track01T107Draft, track01T107ReferenceFill } from "../fixtures/course-builder/track01-phase2-t107";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const packet = createCourseBuilderReviewPacket(
  track01T107Draft,
  new Date("2026-09-22T00:00:00.000Z"),
  "0.2.0"
);

assert(packet.status === "PENDING_REVIEW", "T107_STATUS_INVALID");
assert(packet.output.mode === "BUILD", "T107_BUILD_REQUIRED");

if (packet.output.mode !== "BUILD") {
  throw new Error("T107_BUILD_REQUIRED");
}

assert(packet.output.lessonSpec.lessonType === "CONCEPT", "T107_TYPE_INVALID");
assert(packet.output.lessonSpec.practiceMode === "NONE", "T107_CONCEPT_PRACTICE_MODE_INVALID");
assert(
  JSON.stringify(packet.output.lessonSpec.completionGates) === JSON.stringify(["CHECK"]),
  "T107_GATE_INVALID"
);
assert(
  packet.output.checkSequence !== null && packet.output.checkSequence.length === 3,
  "T107_MASTERY_SEQUENCE_INVALID"
);
assert(packet.output.practice !== null, "T107_STANDARD_PRACTICE_REQUIRED");
assert(packet.output.practice.instructions.length === 3, "T107_PRACTICE_FIELDS_INVALID");
assert(packet.output.pedagogy.participation.kind === "COPY_TO_AI", "T107_PARTICIPATION_INVALID");
assert(
  packet.output.pedagogy.participation.title.includes("完全相同的提示词") &&
    packet.output.pedagogy.participation.instruction.includes("运行两次"),
  "T107_REPEAT_SAME_PROMPT_FLOW_INVALID"
);
assert(
  packet.output.referenceAnswer === Object.values(track01T107ReferenceFill).join("\n"),
  "T107_REFERENCE_ANSWER_MUST_MATCH_REFERENCE_FILL"
);
assert(
  packet.output.referenceAnswer !== null &&
    !packet.output.referenceAnswer.includes("任务和原始信息：") &&
    !packet.output.referenceAnswer.includes("必须保持的事实和边界：") &&
    !packet.output.referenceAnswer.includes("输出和比较要求："),
  "T107_REFERENCE_ANSWER_MUST_NOT_INCLUDE_FIELD_TITLES"
);
assert(packet.output.content.example.before?.trim(), "T107_EXAMPLE_BEFORE_CARD_REQUIRED");
assert(packet.output.content.example.after?.trim(), "T107_EXAMPLE_AFTER_CARD_REQUIRED");
assert(packet.output.review.length >= 1, "T107_REVIEW_REQUIRED");
assert(packet.output.review.every((item) => {
  const [aiFit, humanBoundary] = item.split("｜");
  return Boolean(aiFit?.trim()) && Boolean(humanBoundary?.trim());
}), "T107_REVIEW_TWO_QUESTIONS_REQUIRED");
assert(packet.output.content.related[0]?.trim(), "T107_CAPABILITY_TRIGGER_REQUIRED");
assert(
  packet.output.lessonSpec.prerequisites.length === 1 &&
    packet.output.lessonSpec.prerequisites[0] === "T1-06",
  "T107_PREREQUISITE_INVALID"
);

const visible = [
  packet.output.content.summary,
  packet.output.content.plainExplanation,
  packet.output.content.whyItMatters,
  ...packet.output.content.points,
  ...packet.output.content.content,
  packet.output.content.example.title,
  packet.output.content.example.situation,
  packet.output.content.example.before ?? "",
  packet.output.content.example.after ?? "",
  packet.output.content.example.result,
  ...packet.output.content.mistakes,
  ...packet.output.content.related,
  ...packet.output.review,
  ...packet.output.selfAssessment
].join(" ");

for (const term of [
  "Temperature",
  "Top-p",
  "Top-k",
  "Seed",
  "Sampling",
  "Transformer",
  "Attention",
  "Memory",
  "RAG",
  "Context Window",
  "logits",
  "softmax"
]) {
  assert(!visible.includes(term), "T107_DEFERRED_TERM_LEAK:" + term);
}

assert(visible.includes("Token"), "T107_TOKEN_NOT_TAUGHT");
assert(visible.includes("Probability"), "T107_PROBABILITY_NOT_TAUGHT");
assert(visible.includes("词元（Token）"), "T107_TOKEN_TERM_READABILITY_INVALID");
assert(visible.includes("概率（Probability）"), "T107_PROBABILITY_TERM_READABILITY_INVALID");
assert(
  packet.output.lessonSpec.title.includes("词元（Token）") &&
    packet.output.lessonSpec.title.includes("概率（Probability）"),
  "T107_TITLE_TERM_READABILITY_INVALID"
);
assert(
  packet.output.checkSequence[1]?.correctValues[0] === "FALSE",
  "T107_VERIFICATION_BOUNDARY_INVALID"
);
assert(
  JSON.stringify(packet.output.checkSequence[2]?.correctValues) ===
    JSON.stringify(["TIME", "OMIT_FREE"]),
  "T107_STEP3_MUST_ONLY_TEST_TAUGHT_BOUNDARIES"
);

console.log("T1_07_COURSE_BUILDER_V02_PACKET=PASS");
console.log("T1_07_CONCEPT_CHECK_ONLY_GATE=PASS");
console.log("T1_07_STANDARD_STEP4_PRACTICE=PASS");
console.log("T1_07_REFERENCE_ANSWER_WITHOUT_MAIN_TITLES=PASS");
console.log("T1_07_EXECUTABLE_REFERENCE_PROMPT=PASS");
console.log("T1_07_MASTERY_SEQUENCE=PASS");
console.log("T1_07_BEGINNER_QUALITY=PASS");
console.log("T1_07_DEFERRED_BOUNDARIES=PASS");
console.log("T1_07_DRAFT_CODE_VALIDATION=PASS");
