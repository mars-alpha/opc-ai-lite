import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track02BatchBDrafts, track02BatchBIntroComparisons, track02BatchBKnowledgeDepth, track02BatchBTriggerScenarios } from "../fixtures/course-builder/track02-batch-b";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK02_BATCH_B_DRAFT_FAILED:" + code);
}
const expectedIds = ["t2-04-audience-purpose", "t2-05-source-to-deliverable", "t2-06-editorial-revision"];
const packets = track02BatchBDrafts.map((draft, i) => createCourseBuilderReviewPacket(draft, new Date("2026-09-24T06:1" + i + ":00.000Z"), CURRENT_COURSE_BUILDER_SKILL.version));
assert(packets.length === 3, "THREE_DRAFTS_REQUIRED");
const ids = packets.map((p) => p.output.mode === "BUILD" ? p.output.lessonSpec.lessonId : "");
assert(JSON.stringify(ids) === JSON.stringify(expectedIds), "LESSON_IDS_OR_ORDER");
for (const packet of packets) {
  assert(packet.status === "PENDING_REVIEW" && packet.validation.schema === "PASS" && packet.validation.rules === "PASS" && packet.validation.warnings.length === 0, "REVIEW_PACKET");
  assert(packet.output.mode === "BUILD", "BUILD_MODE");
  const d = packet.output, id = d.lessonSpec.lessonId;
  assert(d.lessonSpec.lessonType === "APPLICATION", id + ":TYPE");
  assert(JSON.stringify(d.lessonSpec.completionGates) === JSON.stringify(["CHECK","PRACTICE"]), id + ":GATES");
  assert(d.lessonSpec.steps.length === 6, id + ":STEPS");
  const advice = d.lessonSpec.learningRecommendation ?? "";
  assert(advice.endsWith("。") && advice.split("。").length === 2 && advice.length <= 52, id + ":ADVICE");
  for (const step of d.lessonSpec.steps) {
    const lines = step.navigationDescription?.split("\n") ?? [];
    assert(lines.length === 2 && lines.every((line) => line.length > 0 && line.length <= 9), id + ":NAV:" + step.kind);
    assert(step.title.length <= 30 && step.objective.length >= 20 && step.objective.length <= 80, id + ":STEP:" + step.kind);
  }
  assert(d.checkSequence?.length === 3 && d.practice !== null, id + ":CHECK_PRACTICE");
  const reference = d.practice.rubric.map((item) => item.example.trim()).join("\n");
  assert(d.referenceAnswer === reference && reference.length >= 220 && reference.includes("请"), id + ":DIRECT_COPY_REFERENCE");
  assert(d.review.length >= 2 && d.selfAssessment.length >= 2, id + ":REVIEW_CAPABILITY");
  const intro = track02BatchBIntroComparisons[id as keyof typeof track02BatchBIntroComparisons];
  const depth = track02BatchBKnowledgeDepth[id as keyof typeof track02BatchBKnowledgeDepth];
  const trigger = track02BatchBTriggerScenarios[id as keyof typeof track02BatchBTriggerScenarios];
  assert(intro?.bottomDetails.length === 2 && intro.bottomDetails.every((item) => item.title.trim() && item.text.trim()), id + ":STEP1_BOTTOM");
  assert(intro.title !== d.content.example.title && intro.situation !== d.content.example.situation, id + ":INTRO_EXAMPLE_DUPLICATE");
  assert(depth?.example.length >= 2 && depth?.review.length >= 2, id + ":DEPTH");
  assert(Boolean(trigger?.trim()) && !trigger.includes("下一课"), id + ":TRIGGER");
  const visible = JSON.stringify({title:d.lessonSpec.title,content:d.content,practice:d.practice,checks:d.checkSequence,review:d.review,selfAssessment:d.selfAssessment});
  for (const forbidden of ["Research Brief","Evidence Pack","Evidence Synthesis","Schema","Beginner"]) assert(!visible.includes(forbidden), id + ":ENGLISH_INTERNAL_TERM");
}
const [first, second, third] = track02BatchBDrafts.map((d) => JSON.stringify(d));
assert(first.includes("接收者") && first.includes("事实") && first.includes("目的"), "T204_AUDIENCE_PURPOSE");
assert(second.includes("资料") && second.includes("交付") && second.includes("待确认"), "T205_SOURCE_DELIVERABLE");
assert(third.includes("诊断") && third.includes("修订") && third.includes("验收"), "T206_DIAGNOSIS_REVISION");
assert(new Set(track02BatchBDrafts.map((d) => d.lessonSpec.learningRecommendation)).size === 3, "ADVICE_MUST_BE_PER_LESSON");
console.log("TRACK02_BATCH_B_THREE_DRAFTS=PASS");
console.log("TRACK02_BATCH_B_SIX_STEP_AND_TWO_LINE_NAV=PASS");
console.log("TRACK02_BATCH_B_ONE_SENTENCE_ADVICE=PASS");
console.log("TRACK02_BATCH_B_DIRECT_COPY_REFERENCE=PASS");
console.log("TRACK02_BATCH_B_STEP1_BOTTOM_AND_DEPTH=PASS");
console.log("TRACK02_BATCH_B_SEPARATE_CAPABILITIES=PASS");
console.log("TRACK02_BATCH_B_REVIEW_PACKET_VALIDATION=PASS");
