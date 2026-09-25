import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track02BatchCDrafts, track02BatchCIntroComparisons, track02BatchCKnowledgeDepth, track02BatchCTriggerScenarios } from "../fixtures/course-builder/track02-batch-c";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK02_BATCH_C_DRAFT_FAILED:" + code);
}

const expectedIds = ["t2-07-targeted-document-reading", "t2-08-cross-document-comparison", "t2-09-information-to-action"];
const packets = track02BatchCDrafts.map((draft, i) =>
  createCourseBuilderReviewPacket(draft, new Date("2026-09-25T05:2" + i + ":00.000Z"), CURRENT_COURSE_BUILDER_SKILL.version)
);

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
  assert(d.review.length >= 1 && d.selfAssessment.length >= 2, id + ":REVIEW_CAPABILITY");
  assert(d.review.every((item) => { const [fit, boundary] = item.split("｜"); return Boolean(fit?.trim() && boundary?.trim()); }), id + ":REVIEW_TWO_DIRECTIONS");
  const intro = track02BatchCIntroComparisons[id as keyof typeof track02BatchCIntroComparisons];
  const depth = track02BatchCKnowledgeDepth[id as keyof typeof track02BatchCKnowledgeDepth];
  const trigger = track02BatchCTriggerScenarios[id as keyof typeof track02BatchCTriggerScenarios];
  assert(intro?.bottomDetails.length === 2 && intro.bottomDetails.every((item) => item.title.trim() && item.text.trim()), id + ":STEP1_BOTTOM");
  assert(intro.title !== d.content.example.title && intro.situation !== d.content.example.situation, id + ":INTRO_EXAMPLE_DUPLICATE");
  assert(depth?.example.length >= 1 && Boolean(depth?.review.length), id + ":DEPTH");
  assert(
    Boolean(trigger?.trim()) &&
      !trigger.includes("下一课") &&
      !trigger.includes("我会先") &&
      !trigger.includes("你应该先") &&
      trigger.includes("这节课用于"),
    id + ":TRIGGER"
  );
  const visible = JSON.stringify({title:d.lessonSpec.title,content:d.content,practice:d.practice,checks:d.checkSequence,review:d.review,selfAssessment:d.selfAssessment});
  for (const forbidden of ["Research Brief","Evidence Pack","Evidence Synthesis","Schema","Beginner"]) assert(!visible.includes(forbidden), id + ":ENGLISH_INTERNAL_TERM");
}

const [first, second, third] = track02BatchCDrafts.map((d) => JSON.stringify(d));
assert(first.includes("定向") && first.includes("依据") && first.includes("未找到"), "T207_TARGETED_READING");
assert(second.includes("比较") && second.includes("维度") && second.includes("影响"), "T208_COMPARISON");
assert(third.includes("行动") && third.includes("责任") && third.includes("待决定"), "T209_ACTION");
assert(new Set(track02BatchCDrafts.map((d) => d.lessonSpec.learningRecommendation)).size === 3, "ADVICE_MUST_BE_PER_LESSON");

console.log("TRACK02_BATCH_C_THREE_DRAFTS=PASS");
console.log("TRACK02_BATCH_C_SIX_STEP_AND_TWO_LINE_NAV=PASS");
console.log("TRACK02_BATCH_C_ONE_SENTENCE_ADVICE=PASS");
console.log("TRACK02_BATCH_C_DIRECT_COPY_REFERENCE=PASS");
console.log("TRACK02_BATCH_C_STEP1_BOTTOM_AND_DEPTH=PASS");
console.log("TRACK02_BATCH_C_SEPARATE_CAPABILITIES=PASS");
console.log("TRACK02_BATCH_C_REVIEW_PACKET_VALIDATION=PASS");
