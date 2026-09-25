import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import {
  track01T110Draft,
  track01T110ReferenceFill
} from "../fixtures/course-builder/track01-phase3-t110";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const packet = createCourseBuilderReviewPacket(
  track01T110Draft,
  new Date("2026-09-23T09:30:00.000Z"),
  "0.2.0"
);

assert(packet.status === "PENDING_REVIEW", "T110_STATUS_INVALID");
assert(packet.output.mode === "BUILD", "T110_BUILD_REQUIRED");
if (packet.output.mode !== "BUILD") throw new Error("T110_BUILD_REQUIRED");

assert(packet.output.lessonSpec.lessonId === "t1-10-search-rag", "T110_ID_INVALID");
assert(packet.output.lessonSpec.lessonType === "CONCEPT", "T110_TYPE_INVALID");
assert(packet.output.lessonSpec.practiceMode === "NONE", "T110_PRACTICE_MODE_INVALID");
assert(
  JSON.stringify(packet.output.lessonSpec.completionGates) === JSON.stringify(["CHECK"]),
  "T110_GATE_INVALID"
);
assert(
  JSON.stringify(packet.output.lessonSpec.prerequisites) === JSON.stringify(["T1-05","T1-09"]),
  "T110_PREREQUISITE_INVALID"
);
assert(
  packet.output.checkSequence !== null && packet.output.checkSequence.length === 3,
  "T110_MASTERY_SEQUENCE_INVALID"
);
assert(
  packet.output.practice !== null && packet.output.practice.instructions.length === 4,
  "T110_PRACTICE_FIELDS_INVALID"
);
assert(packet.output.pedagogy.participation.kind === "COPY_TO_AI", "T110_PARTICIPATION_INVALID");
assert(packet.output.content.example.before?.trim(), "T110_EXAMPLE_BEFORE_REQUIRED");
assert(packet.output.content.example.after?.trim(), "T110_EXAMPLE_AFTER_REQUIRED");
assert(packet.output.review.length >= 1, "T110_REVIEW_REQUIRED");
assert(
  packet.output.review.every((item) => {
    const [fit, boundary] = item.split("｜");
    return Boolean(fit?.trim()) && Boolean(boundary?.trim());
  }),
  "T110_REVIEW_TWO_QUESTIONS_REQUIRED"
);

assert(
  packet.output.referenceAnswer === Object.values(track01T110ReferenceFill).join("\n"),
  "T110_REFERENCE_ANSWER_MUST_MATCH_FILL"
);
for (const title of ["当前问题：","检索范围：","必须找到的证据：","回答规则："]) {
  assert(
    !packet.output.referenceAnswer?.includes(title),
    "T110_REFERENCE_ANSWER_MUST_NOT_INCLUDE_FIELD_TITLE:" + title
  );
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

assert(visible.includes("搜索（Search）"), "T110_SEARCH_NOT_TAUGHT");
assert(
  visible.includes("RAG"),
  "T110_RAG_NOT_TAUGHT"
);
assert(visible.includes("检索（Retrieval）"), "T110_RETRIEVAL_NOT_TAUGHT");
assert(!visible.includes("Retrieval-Augmented Generation"), "T110_RAG_ENGLISH_FULL_EXPANSION_FORBIDDEN");
assert(packet.output.lessonSpec.title.includes("检索增强生成（RAG）"), "T110_RAG_CHINESE_LABEL_REQUIRED");
assert(
  packet.output.lessonSpec.title.includes("搜索（Search）"),
  "T110_TITLE_SEARCH_INVALID"
);
assert(
  packet.output.lessonSpec.title.includes("RAG"),
  "T110_TITLE_RAG_INVALID"
);

const chain = packet.output.content.points.join(" ");
for (const part of ["问题","找到相关证据","放进当前回答可用的信息","基于证据回答"]) {
  assert(chain.includes(part), "T110_MINIMUM_CHAIN_MISSING:" + part);
}

for (const term of [
  "Embedding",
  "Vector Search",
  "Vector Database",
  "Chunk",
  "Top-K",
  "Reranking",
  "Hybrid Search",
  "Query Rewrite",
  "Indexing",
  "Tool Use",
  "Function Calling",
  "MCP",
  "Agent"
]) {
  assert(!visible.includes(term), "T110_DEFERRED_TERM_LEAK:" + term);
}

assert(packet.output.checkSequence[0]?.correctValues[0] === "B", "T110_BEST_JUDGMENT_INVALID");
assert(packet.output.checkSequence[1]?.correctValues[0] === "FALSE", "T110_MISCONCEPTION_INVALID");
assert(
  JSON.stringify(packet.output.checkSequence[2]?.correctValues) ===
    JSON.stringify(["LATEST_POLICY","INTERNAL_DOCS","EVIDENCE"]),
  "T110_BOUNDARY_CHECK_INVALID"
);

assert(
  visible.includes("RAG 不是永久记忆") ||
    visible.includes("不是永久记忆"),
  "T110_NOT_MEMORY_BOUNDARY_MISSING"
);
assert(
  visible.includes("不代表") || visible.includes("不会因为用了检索就自动保证答案正确"),
  "T110_NOT_AUTO_CORRECT_BOUNDARY_MISSING"
);

console.log("T1_10_COURSE_BUILDER_V02_PACKET=PASS");
console.log("T1_10_SEARCH_RAG_MINIMUM_CHAIN=PASS");
console.log("T1_10_CONCEPT_CHECK_ONLY_GATE=PASS");
console.log("T1_10_STANDARD_STEP4_PRACTICE=PASS");
console.log("T1_10_RETRIEVAL_QUALITY_BOUNDARY=PASS");
console.log("T1_10_DEFERRED_ENGINEERING_BOUNDARY=PASS");
console.log("T1_10_DRAFT_CODE_VALIDATION=PASS");
