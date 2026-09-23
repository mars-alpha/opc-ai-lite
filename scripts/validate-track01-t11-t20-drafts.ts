import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import {
  track01T111T120Drafts,
  track01T111T120TriggerScenarios
} from "../fixtures/course-builder/track01-t111-t120";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK01_T11_T20_DRAFT_FAILED:" + code);
}

const packets = track01T111T120Drafts.map((draft, index) =>
  createCourseBuilderReviewPacket(
    draft,
    new Date("2026-09-23T12:" + String(index).padStart(2, "0") + ":00.000Z"),
    "1.0.0"
  )
);

assert(packets.length === 10, "TEN_DRAFTS_REQUIRED");
assert(packets.every((packet) => packet.status === "PENDING_REVIEW"), "HUMAN_REVIEW_GATE_REQUIRED");
assert(packets.every((packet) => packet.skill.version === "1.0.0"), "COURSE_BUILDER_V1_REQUIRED");
assert(
  packets.every((packet) => packet.output.mode === "BUILD"),
  "BUILD_MODE_REQUIRED"
);

const ids = packets.map((packet) =>
  packet.output.mode === "BUILD" ? packet.output.lessonSpec.lessonId : ""
);
assert(new Set(ids).size === 10, "LESSON_IDS_MUST_BE_UNIQUE");
assert(Object.keys(track01T111T120TriggerScenarios).length === 10, "TEN_TRIGGER_SCENARIOS_REQUIRED");

for (const packet of packets) {
  if (packet.output.mode !== "BUILD") throw new Error("BUILD_REQUIRED");
  const draft = packet.output;
  assert(draft.lessonSpec.steps.length === 6, "SIX_STEPS_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(draft.checkSequence?.length === 3, "THREE_CHECKS_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(draft.practice !== null, "STEP4_PRACTICE_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(draft.referenceAnswer?.trim(), "REFERENCE_ANSWER_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(draft.practice !== null, "STEP4_PRACTICE_REQUIRED_FOR_REFERENCE:" + draft.lessonSpec.lessonId);
  const expectedReferenceAnswer = draft.practice.rubric.map((item) => item.example.trim()).join("\n");
  assert(
    draft.referenceAnswer === expectedReferenceAnswer,
    "REFERENCE_ANSWER_MUST_MATCH_REFERENCE_FILL:" + draft.lessonSpec.lessonId
  );
  assert(
    expectedReferenceAnswer.length >= 80 && expectedReferenceAnswer.includes("请"),
    "REFERENCE_ANSWER_MUST_BE_COPY_READY_AI_TASK:" + draft.lessonSpec.lessonId
  );
  assert(draft.review.length >= 2, "REVIEW_BOUNDARY_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(draft.selfAssessment.length >= 2, "SELF_ASSESSMENT_REQUIRED:" + draft.lessonSpec.lessonId);
  const learnerVisible = JSON.stringify({
    title: draft.lessonSpec.title,
    steps: draft.lessonSpec.steps,
    content: draft.content,
    practice: draft.practice,
    checkSequence: draft.checkSequence,
    review: draft.review,
    selfAssessment: draft.selfAssessment,
    capabilityGain: draft.lessonSpec.capabilityGain,
    nextLessonValue: draft.lessonSpec.nextLessonValue,
    participation: draft.pedagogy.participation
  });
  assert(!learnerVisible.includes("Beginner"), "LEARNER_VISIBLE_BEGINNER_FORBIDDEN:" + draft.lessonSpec.lessonId);
  assert(!learnerVisible.includes("Schema"), "LEARNER_VISIBLE_SCHEMA_FORBIDDEN:" + draft.lessonSpec.lessonId);
  for (const ordinaryEnglish of ["Goal", "Observe", "Decide", "Act", "Stop", "GUI", "JSON Schema"]) {
    assert(
      !learnerVisible.includes(ordinaryEnglish),
      "LEARNER_VISIBLE_ORDINARY_ENGLISH_FORBIDDEN:" + draft.lessonSpec.lessonId + ":" + ordinaryEnglish
    );
  }
  assert(
    draft.review.every((item) => !item.startsWith("AI适合做什么") && !item.startsWith("AI不应该替你做什么")),
    "REVIEW_GENERIC_CARD_TITLE_FORBIDDEN:" + draft.lessonSpec.lessonId
  );
  const trigger = track01T111T120TriggerScenarios[draft.lessonSpec.lessonId];
  assert(Boolean(trigger?.trim()), "TRIGGER_SCENARIO_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(!trigger.includes("下一课") && !trigger.includes("后续课程"), "TRIGGER_MUST_NOT_BE_NEXT_LESSON_COPY:" + draft.lessonSpec.lessonId);
  assert(
    draft.pedagogy.qualityProfile?.allowedCoreTerms.length &&
      draft.pedagogy.qualityProfile.allowedCoreTerms.length <= 2,
    "CORE_TERM_BUDGET_INVALID:" + draft.lessonSpec.lessonId
  );
  assert(
    !draft.lessonSpec.title.includes("Retrieval-Augmented Generation") &&
      !draft.lessonSpec.title.includes("Model Context Protocol"),
    "COMMON_ABBREVIATION_ENGLISH_EXPANSION_FORBIDDEN:" + draft.lessonSpec.lessonId
  );
}

const reviewCounts = track01T111T120Drafts.map((draft) => draft.review.length);
assert(new Set(reviewCounts).size > 1, "REVIEW_CARD_COUNT_MUST_FOLLOW_KNOWLEDGE_DENSITY");
assert(reviewCounts.some((count) => count >= 4), "DENSE_LESSON_REVIEW_MUST_ALLOW_MORE_CARDS");

const titles = packets.map((packet) =>
  packet.output.mode === "BUILD" ? packet.output.lessonSpec.title : ""
).join(" ");

for (const expected of [
  "应用程序编程接口（API）",
  "结构化输出（Structured Output）",
  "函数调用（Function Calling）",
  "模型上下文协议（MCP）",
  "技能（Skill）",
  "工作流（Workflow）",
  "智能体（Agent）",
  "多模态（Multimodal）",
  "计算机操作（Computer Use）",
  "人在回路（Human-in-the-loop）"
]) {
  assert(titles.includes(expected), "TERM_PRESENTATION_MISSING:" + expected);
}

console.log("TRACK01_T11_T20_WORKFLOW_BATCH_DRAFTS=PASS");
console.log("TRACK01_T11_T20_COURSE_BUILDER_V1=PASS");
console.log("TRACK01_T11_T20_SIX_STEP_DRAFTS=PASS");
console.log("TRACK01_T11_T20_DETERMINISTIC_VALIDATION=PASS");
console.log("TRACK01_T11_T20_REVIEW_PACKET_GATE_STATE=PASS");
console.log("TRACK01_T11_T20_CHINESE_FIRST_LEARNER_COPY=PASS");
console.log("TRACK01_T11_T20_COPY_READY_REFERENCE_ANSWER=PASS");
console.log("TRACK01_T11_T20_REVIEW_DENSITY_VARIATION=PASS");
console.log("TRACK01_T11_T20_TRIGGER_SCENARIOS=PASS");
