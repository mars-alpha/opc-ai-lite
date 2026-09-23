import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { track01T108Draft, track01T108ReferenceFill } from "../fixtures/course-builder/track01-phase3-t108";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const packet = createCourseBuilderReviewPacket(
  track01T108Draft,
  new Date("2026-09-23T00:00:00.000Z"),
  "0.2.0"
);

assert(packet.status === "PENDING_REVIEW", "T108_STATUS_INVALID");
assert(packet.output.mode === "BUILD", "T108_BUILD_REQUIRED");

if (packet.output.mode !== "BUILD") throw new Error("T108_BUILD_REQUIRED");

assert(packet.output.lessonSpec.lessonType === "CONCEPT", "T108_TYPE_INVALID");
assert(packet.output.lessonSpec.practiceMode === "NONE", "T108_CONCEPT_PRACTICE_MODE_INVALID");
assert(
  JSON.stringify(packet.output.lessonSpec.completionGates) === JSON.stringify(["CHECK"]),
  "T108_GATE_INVALID"
);
assert(
  packet.output.checkSequence !== null && packet.output.checkSequence.length === 3,
  "T108_MASTERY_SEQUENCE_INVALID"
);
assert(packet.output.practice !== null, "T108_STANDARD_PRACTICE_REQUIRED");
assert(packet.output.practice.instructions.length === 3, "T108_PRACTICE_FIELDS_INVALID");
assert(packet.output.pedagogy.participation.kind === "COPY_TO_AI", "T108_PARTICIPATION_INVALID");
assert(
  packet.output.referenceAnswer === Object.values(track01T108ReferenceFill).join("\n"),
  "T108_REFERENCE_ANSWER_MUST_MATCH_REFERENCE_FILL"
);
assert(
  packet.output.referenceAnswer !== null &&
    !packet.output.referenceAnswer.includes("当前任务与本次材料：") &&
    !packet.output.referenceAnswer.includes("必须从旧对话带入的要求：") &&
    !packet.output.referenceAnswer.includes("稳定偏好与执行边界："),
  "T108_REFERENCE_ANSWER_MUST_NOT_INCLUDE_FIELD_TITLES"
);
assert(packet.output.content.example.before?.trim(), "T108_EXAMPLE_BEFORE_CARD_REQUIRED");
assert(packet.output.content.example.after?.trim(), "T108_EXAMPLE_AFTER_CARD_REQUIRED");
assert(packet.output.review.length >= 1, "T108_REVIEW_REQUIRED");
assert(packet.output.review.every((item) => {
  const [aiFit, humanBoundary] = item.split("｜");
  return Boolean(aiFit?.trim()) && Boolean(humanBoundary?.trim());
}), "T108_REVIEW_TWO_QUESTIONS_REQUIRED");
assert(packet.output.content.related[0]?.trim(), "T108_CAPABILITY_TRIGGER_REQUIRED");
assert(
  packet.output.lessonSpec.prerequisites.length === 1 &&
    packet.output.lessonSpec.prerequisites[0] === "T1-07",
  "T108_PREREQUISITE_INVALID"
);

const visible = [
  packet.output.lessonSpec.title,
  ...packet.output.lessonSpec.steps.map((step) => step.title),
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
  "RAG",
  "Knowledge Base",
  "Source of Truth",
  "Search",
  "Vector Database",
  "Embedding",
  "Retrieval",
  "Context Window"
]) {
  assert(!visible.includes(term), "T108_DEFERRED_TERM_LEAK:" + term);
}

assert(visible.includes("对话历史（Conversation History）"), "T108_HISTORY_TERM_NOT_TAUGHT");
assert(visible.includes("长期记忆（Memory）"), "T108_MEMORY_TERM_NOT_TAUGHT");
assert(
  packet.output.lessonSpec.title.includes("对话历史（Conversation History）") &&
    packet.output.lessonSpec.title.includes("长期记忆（Memory）"),
  "T108_TITLE_TERM_READABILITY_INVALID"
);
assert(
  packet.output.checkSequence[1]?.correctValues[0] === "FALSE",
  "T108_MEMORY_MISCONCEPTION_INVALID"
);
assert(
  JSON.stringify(packet.output.checkSequence[2]?.correctValues) ===
    JSON.stringify(["FORMAT", "MATERIAL", "DEADLINE"]),
  "T108_STEP3_MUST_ONLY_TEST_TAUGHT_BOUNDARIES"
);

console.log("T1_08_COURSE_BUILDER_V02_PACKET=PASS");
console.log("T1_08_CONCEPT_CHECK_ONLY_GATE=PASS");
console.log("T1_08_STANDARD_STEP4_PRACTICE=PASS");
console.log("T1_08_REFERENCE_ANSWER_WITHOUT_MAIN_TITLES=PASS");
console.log("T1_08_EXECUTABLE_NEW_CHAT_HANDOFF=PASS");
console.log("T1_08_MASTERY_SEQUENCE=PASS");
console.log("T1_08_BEGINNER_QUALITY=PASS");
console.log("T1_08_DEFERRED_BOUNDARIES=PASS");
console.log("T1_08_DRAFT_CODE_VALIDATION=PASS");
