import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import {
  track01T101Draft, track01T101ReferenceFill,
  track01T102Draft, track01T102ReferenceFill,
  track01T103Draft, track01T103ReferenceFill,
  track01T104Draft, track01T104ReferenceFill,
  track01T105Draft, track01T105ReferenceFill
} from "../fixtures/course-builder/track01-batch-a";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const expectedOrder = "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY";
const drafts = [
  ["T1-01", track01T101Draft],
  ["T1-02", track01T102Draft],
  ["T1-03", track01T103Draft],
  ["T1-04", track01T104Draft],
  ["T1-05", track01T105Draft]
] as const;

for (const [id, source] of drafts) {
  const packet = createCourseBuilderReviewPacket(source, new Date("2026-09-23T00:00:00.000Z"), "0.2.0");
  assert(packet.output.mode === "BUILD", id + "_BUILD_REQUIRED");
  if (packet.output.mode !== "BUILD") throw new Error(id + "_BUILD_REQUIRED");
  const draft = packet.output;
  assert(draft.lessonSpec.steps.map((step) => step.kind).join(">") === expectedOrder, id + "_SIX_STEP_ORDER");
  assert(draft.pedagogy.qualityProfile?.id === "BEGINNER_QUALITY_V1", id + "_BEGINNER_QUALITY");
  assert(draft.pedagogy.conceptMasteryBeforePractice === true, id + "_MASTERY_BEFORE_PRACTICE");
  assert(draft.checkSequence?.length === 3, id + "_MASTERY_SEQUENCE");
  assert(draft.practice !== null, id + "_PRACTICE_REQUIRED");
  assert(draft.content.example.before?.trim(), id + "_EXAMPLE_BEFORE_CARD_REQUIRED");
  assert(draft.content.example.after?.trim(), id + "_EXAMPLE_AFTER_CARD_REQUIRED");
  assert(draft.review.length >= 1, id + "_REVIEW_REQUIRED");
  assert(draft.review.every((item) => {
    const [aiFit, humanBoundary] = item.split("｜");
    return Boolean(aiFit?.trim()) && Boolean(humanBoundary?.trim());
  }), id + "_REVIEW_TWO_QUESTIONS_REQUIRED");
  assert(draft.content.related[0]?.trim(), id + "_CAPABILITY_TRIGGER_REQUIRED");
  assert(draft.selfAssessment.length >= 2, id + "_SELF_ASSESSMENT");
  assert(!draft.content.example.situation.includes("OPC AI 学习站"), id + "_EXAMPLE_INDUSTRY_NEUTRAL");
  assert(!draft.content.example.situation.includes("自媒体"), id + "_EXAMPLE_NO_CASE_THREAD_LEAK");
  assert(!draft.review.some((item) => item.includes("AI适合做什么") || item.includes("AI不应该替你做什么")), id + "_REVIEW_LABELS_NOT_EMBEDDED_IN_CONTENT");
}

const t101 = createCourseBuilderReviewPacket(track01T101Draft, new Date("2026-09-23T00:00:00.000Z"), "0.2.0").output;
assert(t101.mode === "BUILD", "T101_BUILD");
if (t101.mode === "BUILD") {
  assert(t101.lessonSpec.lessonId === "t1-01-ai-task-fit", "T101_ID");
  assert(t101.lessonSpec.completionGates.join(",") === "CHECK,PRACTICE", "T101_GATES");
  assert(t101.practice?.instructions.map((item) => item.key).join(",") === "task,help", "T101_PRACTICE_KEYS");
  const review = t101.review.join(" ");
  assert(review.includes("起草") && review.includes("整理"), "T101_REVIEW_TASK_FIT");
  assert(review.includes("重要事实"), "T101_REVIEW_FACTS");
  assert(review.includes("最终取舍") || review.includes("真实后果"), "T101_REVIEW_HUMAN_BOUNDARY");
}
assert(!track01T101ReferenceFill.task.includes("OPC"), "T101_REFERENCE_INDUSTRY_NEUTRAL");
assert(!track01T101ReferenceFill.task.includes("自媒体"), "T101_REFERENCE_NO_SELF_MEDIA");

const t102 = createCourseBuilderReviewPacket(track01T102Draft, new Date("2026-09-23T00:00:00.000Z"), "0.2.0").output;
assert(t102.mode === "BUILD", "T102_BUILD");
if (t102.mode === "BUILD") {
  assert(t102.lessonSpec.prerequisites.join(",") === "T1-01", "T102_PREREQUISITE");
  assert(t102.practice?.instructions.map((item) => item.key).join(",") === "goal,audience,requirements,format", "T102_PRACTICE_KEYS");
  const review = t102.review.join(" ");
  for (const required of ["目标", "对象", "要求", "输出形式"]) {
    assert(review.includes(required), "T102_REVIEW_" + required);
  }
  assert(review.includes("不要替你"), "T102_REVIEW_HUMAN_BOUNDARY");
}
assert(!Object.values(track01T102ReferenceFill).join(" ").includes("OPC"), "T102_REFERENCE_INDUSTRY_NEUTRAL");

const t103 = createCourseBuilderReviewPacket(track01T103Draft, new Date("2026-09-23T00:00:00.000Z"), "0.2.0").output;
assert(t103.mode === "BUILD", "T103_BUILD");
if (t103.mode === "BUILD") {
  assert(t103.lessonSpec.prerequisites.join(",") === "T1-02", "T103_PREREQUISITE");
  assert(t103.practice?.instructions.map((item) => item.key).join(",") === "task,mustKnow", "T103_PRACTICE_KEYS");
  const review = t103.review.join(" ");
  assert(review.includes("必要背景") || review.includes("足够的上下文"), "T103_REVIEW_RELEVANCE");
  assert(review.includes("不要替你猜") && review.includes("资料是否真实可靠"), "T103_REVIEW_HUMAN_BOUNDARY");
}
assert(!Object.values(track01T103ReferenceFill).join(" ").includes("OPC"), "T103_REFERENCE_INDUSTRY_NEUTRAL");

const t104 = createCourseBuilderReviewPacket(track01T104Draft, new Date("2026-09-23T00:00:00.000Z"), "0.2.0").output;
assert(t104.mode === "BUILD", "T104_BUILD");
if (t104.mode === "BUILD") {
  assert(t104.lessonSpec.prerequisites.join(",") === "T1-03", "T104_PREREQUISITE");
  assert(t104.practice?.instructions.map((item) => item.key).join(",") === "desired,requirements", "T104_PRACTICE_KEYS");
  const review = t104.review.join(" ");
  assert(review.includes("定向修改"), "T104_REVIEW_TARGETED");
  assert(review.includes("可检查标准"), "T104_REVIEW_CHECKABLE");
  assert(review.includes("不要替你"), "T104_REVIEW_HUMAN_BOUNDARY");
}
assert(!Object.values(track01T104ReferenceFill).join(" ").includes("OPC"), "T104_REFERENCE_INDUSTRY_NEUTRAL");

const t105 = createCourseBuilderReviewPacket(track01T105Draft, new Date("2026-09-23T00:00:00.000Z"), "0.2.0").output;
assert(t105.mode === "BUILD", "T105_BUILD");
if (t105.mode === "BUILD") {
  assert(t105.lessonSpec.prerequisites.join(",") === "T1-04", "T105_PREREQUISITE");
  assert(t105.practice?.instructions.map((item) => item.key).join(",") === "claims,checks", "T105_PRACTICE_KEYS");
  const review = t105.review.join(" ");
  assert(review.includes("证据") || review.includes("核验"), "T105_REVIEW_EVIDENCE");
  assert(review.includes("最新官方状态"), "T105_REVIEW_FRESHNESS");
  assert(review.includes("最终判断") || review.includes("发布责任"), "T105_REVIEW_HUMAN_BOUNDARY");
}

console.log("TRACK01_T101_T105_RESTRUCTURE=PASS");
console.log("TRACK01_T101_T105_SIX_STEP_RESPONSIBILITIES=PASS");
console.log("TRACK01_T101_T105_REVIEW_FLEXIBLE=PASS");
console.log("TRACK01_T101_T105_INDUSTRY_NEUTRAL=PASS");
