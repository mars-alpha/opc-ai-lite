import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { track01T109Draft, track01T109ReferenceFill } from "../fixtures/course-builder/track01-phase3-t109";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const packet = createCourseBuilderReviewPacket(
  track01T109Draft,
  new Date("2026-09-23T08:30:00.000Z"),
  "0.2.0"
);

assert(packet.status === "PENDING_REVIEW", "T109_STATUS_INVALID");
assert(packet.output.mode === "BUILD", "T109_BUILD_REQUIRED");
if (packet.output.mode !== "BUILD") throw new Error("T109_BUILD_REQUIRED");

assert(packet.output.lessonSpec.lessonId === "t1-09-knowledge-source", "T109_ID_INVALID");
assert(packet.output.lessonSpec.lessonType === "CONCEPT", "T109_TYPE_INVALID");
assert(packet.output.lessonSpec.practiceMode === "NONE", "T109_PRACTICE_MODE_INVALID");
assert(JSON.stringify(packet.output.lessonSpec.completionGates) === JSON.stringify(["CHECK"]), "T109_GATE_INVALID");
assert(packet.output.lessonSpec.prerequisites.length === 1 && packet.output.lessonSpec.prerequisites[0] === "T1-08", "T109_PREREQUISITE_INVALID");
assert(packet.output.checkSequence !== null && packet.output.checkSequence.length === 3, "T109_MASTERY_SEQUENCE_INVALID");
assert(packet.output.practice !== null && packet.output.practice.instructions.length === 4, "T109_PRACTICE_FIELDS_INVALID");
assert(packet.output.pedagogy.participation.kind === "COPY_TO_AI", "T109_PARTICIPATION_INVALID");
assert(packet.output.content.example.before?.trim(), "T109_EXAMPLE_BEFORE_REQUIRED");
assert(packet.output.content.example.after?.trim(), "T109_EXAMPLE_AFTER_REQUIRED");
assert(packet.output.review.length >= 1, "T109_REVIEW_REQUIRED");
assert(packet.output.review.every((item) => {
  const [fit, boundary] = item.split("｜");
  return Boolean(fit?.trim()) && Boolean(boundary?.trim());
}), "T109_REVIEW_TWO_QUESTIONS_REQUIRED");

assert(
  packet.output.referenceAnswer === Object.values(track01T109ReferenceFill).join("\n"),
  "T109_REFERENCE_ANSWER_MUST_MATCH_FILL"
);
for (const title of ["业务问题：", "可参考资料：", "正式事实源：", "冲突规则："]) {
  assert(!packet.output.referenceAnswer?.includes(title), "T109_REFERENCE_ANSWER_MUST_NOT_INCLUDE_FIELD_TITLE:" + title);
}

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

assert(visible.includes("知识库（Knowledge Base）"), "T109_KNOWLEDGE_BASE_NOT_TAUGHT");
assert(visible.includes("事实源（Source of Truth）"), "T109_SOURCE_OF_TRUTH_NOT_TAUGHT");
assert(packet.output.lessonSpec.title.includes("知识库（Knowledge Base）"), "T109_TITLE_KB_INVALID");
assert(packet.output.lessonSpec.title.includes("事实源（Source of Truth）"), "T109_TITLE_SOT_INVALID");

for (const term of ["RAG","Search","Retrieval","Vector Database","Embedding","Vector Search","Chunk","Top-K","Reranking","API","Tool Use","MCP"]) {
  assert(!visible.includes(term), "T109_DEFERRED_TERM_LEAK:" + term);
}

assert(packet.output.checkSequence[0]?.correctValues[0] === "B", "T109_BEST_JUDGMENT_INVALID");
assert(packet.output.checkSequence[1]?.correctValues[0] === "FALSE", "T109_MISCONCEPTION_INVALID");
assert(
  JSON.stringify(packet.output.checkSequence[2]?.correctValues) === JSON.stringify(["PRICE","REFUND","DEADLINE"]),
  "T109_BOUNDARY_CHECK_INVALID"
);

console.log("T1_09_COURSE_BUILDER_V02_PACKET=PASS");
console.log("T1_09_KNOWLEDGE_BASE_SOURCE_OF_TRUTH_BOUNDARY=PASS");
console.log("T1_09_CONCEPT_CHECK_ONLY_GATE=PASS");
console.log("T1_09_STANDARD_STEP4_PRACTICE=PASS");
console.log("T1_09_DEFERRED_SEARCH_RAG_BOUNDARY=PASS");
console.log("T1_09_DRAFT_CODE_VALIDATION=PASS");
