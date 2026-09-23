import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { track01T106Draft } from "../fixtures/course-builder/track01-phase2-t106";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const packet = createCourseBuilderReviewPacket(
  track01T106Draft,
  new Date("2026-09-22T00:00:00.000Z"),
  "0.2.0"
);

assert(packet.status === "PENDING_REVIEW", "T106_STATUS_INVALID");
assert(packet.output.mode === "BUILD", "T106_BUILD_REQUIRED");

if (packet.output.mode !== "BUILD") {
  throw new Error("T106_BUILD_REQUIRED");
}

assert(packet.output.lessonSpec.lessonType === "CONCEPT", "T106_TYPE_INVALID");
assert(packet.output.lessonSpec.practiceMode === "NONE", "T106_CONCEPT_PRACTICE_MODE_INVALID");
assert(
  JSON.stringify(packet.output.lessonSpec.completionGates) === JSON.stringify(["CHECK"]),
  "T106_GATE_INVALID"
);
assert(
  packet.output.checkSequence !== null && packet.output.checkSequence.length === 3,
  "T106_MASTERY_SEQUENCE_INVALID"
);
assert(packet.output.practice !== null, "T106_STANDARD_PRACTICE_REQUIRED");
assert(packet.output.practice.instructions.length === 3, "T106_STANDARD_PRACTICE_FIELDS_INVALID");
assert(packet.output.pedagogy.participation.kind === "COPY_TO_AI", "T106_PARTICIPATION_INVALID");
assert(packet.output.content.example.before?.trim(), "T106_EXAMPLE_BEFORE_CARD_REQUIRED");
assert(packet.output.content.example.after?.trim(), "T106_EXAMPLE_AFTER_CARD_REQUIRED");
assert(packet.output.review.length >= 1, "T106_REVIEW_REQUIRED");
assert(packet.output.review.every((item) => {
  const [aiFit, humanBoundary] = item.split("｜");
  return Boolean(aiFit?.trim()) && Boolean(humanBoundary?.trim());
}), "T106_REVIEW_TWO_QUESTIONS_REQUIRED");
const t106Review = packet.output.review.join(" ");
assert(t106Review.includes("模型") && t106Review.includes("完整 AI 产品"), "T106_REVIEW_MODEL_PRODUCT_BOUNDARY");
assert(t106Review.includes("不确定"), "T106_REVIEW_UNCERTAINTY_BOUNDARY");
assert(t106Review.includes("不要") || t106Review.includes("不能"), "T106_REVIEW_HUMAN_BOUNDARY");
assert(packet.output.content.related[0]?.trim(), "T106_CAPABILITY_TRIGGER_REQUIRED");

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

for (const term of ["Token", "Probability", "RAG", "Function Calling", "MCP", "Agent", "Vector DB", "Fine-tuning", "Transformer"]) {
  assert(!visible.includes(term), "T106_DEFERRED_TERM_LEAK:" + term);
}

assert(
  packet.output.lessonSpec.prerequisites.length === 1 &&
    packet.output.lessonSpec.prerequisites[0] === "T1-05",
  "T106_PREREQUISITE_INVALID"
);

console.log("T1_06_COURSE_BUILDER_V02_PACKET=PASS");
console.log("T1_06_CONCEPT_CHECK_ONLY_GATE=PASS");
console.log("T1_06_STANDARD_STEP4_PRACTICE=PASS");
console.log("T1_06_MASTERY_SEQUENCE=PASS");
console.log("T1_06_BEGINNER_QUALITY=PASS");
console.log("T1_06_DEFERRED_BOUNDARIES=PASS");
console.log("T1_06_DRAFT_CODE_VALIDATION=PASS");
