import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import {
  track02BatchADrafts,
  track02BatchAIntroComparisons,
  track02BatchAKnowledgeDepth,
  track02BatchATriggerScenarios
} from "../fixtures/course-builder/track02-batch-a";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK02_BATCH_A_DRAFT_FAILED:" + code);
}

const packets = track02BatchADrafts.map((draft, index) =>
  createCourseBuilderReviewPacket(
    draft,
    new Date("2026-09-24T06:" + String(index).padStart(2, "0") + ":00.000Z"),
    CURRENT_COURSE_BUILDER_SKILL.version
  )
);

assert(packets.length === 3, "THREE_DRAFTS_REQUIRED");
assert(packets.every((packet) => packet.status === "PENDING_REVIEW"), "HUMAN_REVIEW_GATE_REQUIRED");
assert(
  packets.every((packet) => packet.skill.version === CURRENT_COURSE_BUILDER_SKILL.version),
  "CURRENT_COURSE_BUILDER_REQUIRED"
);

const expectedIds = [
  "t2-01-research-question-scope",
  "t2-02-source-evidence-judgment",
  "t2-03-multi-source-synthesis"
];
const ids = packets.map((packet) =>
  packet.output.mode === "BUILD" ? packet.output.lessonSpec.lessonId : ""
);
assert(JSON.stringify(ids) === JSON.stringify(expectedIds), "LESSON_ID_ORDER_DRIFT");

for (const packet of packets) {
  assert(packet.output.mode === "BUILD", "BUILD_MODE_REQUIRED");
  const draft = packet.output;
  assert(draft.lessonSpec.lessonType === "APPLICATION", "APPLICATION_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(
    JSON.stringify(draft.lessonSpec.completionGates) === JSON.stringify(["CHECK", "PRACTICE"]),
    "CHECK_PRACTICE_GATES_REQUIRED:" + draft.lessonSpec.lessonId
  );
  assert(draft.lessonSpec.steps.length === 6, "SIX_STEPS_REQUIRED:" + draft.lessonSpec.lessonId);
  const advice = draft.lessonSpec.learningRecommendation ?? "";
  assert(
    advice.endsWith("。") && advice.split("。").length === 2 && advice.length <= 52,
    "ONE_SHORT_LEARNING_RECOMMENDATION_REQUIRED:" + draft.lessonSpec.lessonId
  );
  for (const step of draft.lessonSpec.steps) {
    assert(
      step.title.length <= 30 && step.objective.length >= 20 && step.objective.length <= 80 &&
        step.navigationDescription?.split("\n").length === 2 &&
        step.navigationDescription.split("\n").every((line) => line.length <= 9),
      "STEP_GUIDANCE_OR_NAV_INVALID:" + draft.lessonSpec.lessonId + ":" + step.kind
    );
  }
  assert(draft.checkSequence?.length === 3, "THREE_CHECKS_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(draft.practice !== null, "PRACTICE_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(draft.referenceAnswer?.trim(), "REFERENCE_ANSWER_REQUIRED:" + draft.lessonSpec.lessonId);

  const expectedReference = draft.practice.rubric.map((item) => item.example.trim()).join("\n");
  assert(
    draft.referenceAnswer === expectedReference,
    "REFERENCE_ANSWER_MUST_MATCH_FILL:" + draft.lessonSpec.lessonId
  );
  assert(
    expectedReference.length >= 220 && expectedReference.includes("请"),
    "COPY_READY_TASK_REQUIRED:" + draft.lessonSpec.lessonId
  );
  assert(draft.review.length >= 3, "REVIEW_DEPTH_REQUIRED:" + draft.lessonSpec.lessonId);
  const knowledgeDepth =
    track02BatchAKnowledgeDepth[
      draft.lessonSpec.lessonId as keyof typeof track02BatchAKnowledgeDepth
    ];
  assert(
    knowledgeDepth?.review.length >= 2,
    "STEP5_EXPLANATION_LAYER_REQUIRED:" + draft.lessonSpec.lessonId
  );
  assert(draft.selfAssessment.length >= 2, "SELF_ASSESSMENT_REQUIRED:" + draft.lessonSpec.lessonId);

  const learnerVisible = JSON.stringify({
    title: draft.lessonSpec.title,
    content: draft.content,
    practice: draft.practice,
    checks: draft.checkSequence,
    review: draft.review,
    selfAssessment: draft.selfAssessment,
    capability: draft.lessonSpec.capabilityGain,
    next: draft.lessonSpec.nextLessonValue
  });
  for (const forbidden of [
    "Research Brief",
    "Evidence Pack",
    "Evidence Synthesis",
    "Claim",
    "Beginner",
    "Schema"
  ]) {
    assert(!learnerVisible.includes(forbidden), "INTERNAL_TERM_LEAK:" + draft.lessonSpec.lessonId + ":" + forbidden);
  }

  const trigger = track02BatchATriggerScenarios[draft.lessonSpec.lessonId as keyof typeof track02BatchATriggerScenarios];
  assert(Boolean(trigger?.trim()), "TRIGGER_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(!trigger.includes("下一课"), "TRIGGER_NEXT_LESSON_CONFLATION:" + draft.lessonSpec.lessonId);

  const intro =
    track02BatchAIntroComparisons[
      draft.lessonSpec.lessonId as keyof typeof track02BatchAIntroComparisons
    ];
  assert(Boolean(intro), "STEP1_INTRO_REQUIRED:" + draft.lessonSpec.lessonId);
  assert(
    intro.bottomDetails.length === 2 &&
      intro.bottomDetails.every((item) => item.title.trim() && item.text.trim()),
    "STEP1_BOTTOM_EXPLANATION_REQUIRED:" + draft.lessonSpec.lessonId
  );
  assert(intro.title !== draft.content.example.title, "STEP1_STEP2_TITLE_OVERLAP:" + draft.lessonSpec.lessonId);
  assert(intro.situation !== draft.content.example.situation, "STEP1_STEP2_SITUATION_OVERLAP:" + draft.lessonSpec.lessonId);
  assert(
    !intro.approaches.some(
      (item) => item.text === draft.content.example.before || item.text === draft.content.example.after
    ),
    "STEP1_STEP2_BODY_OVERLAP:" + draft.lessonSpec.lessonId
  );
}

const t201 = packets[0].output;
const t202 = packets[1].output;
const t203 = packets[2].output;
if (t201.mode !== "BUILD" || t202.mode !== "BUILD" || t203.mode !== "BUILD") {
  throw new Error("BUILD_OUTPUT_REQUIRED");
}

const t201Visible = JSON.stringify(t201);
assert(t201Visible.includes("研究目的") && t201Visible.includes("对象和范围"), "T201_SCOPE_METHOD_MISSING");
assert(!t201.lessonSpec.title.includes("提示词"), "T201_MUST_NOT_RETEACH_PROMPT");
assert(t201Visible.includes("中国市场"), "T201_CHINA_MARKET_SCOPE_REQUIRED");
assert(
  t201.referenceAnswer?.includes("不要替我搜索或补充外部事实"),
  "T201_NO_FAKE_SEARCH_BOUNDARY_MISSING"
);
assert(
  t201.referenceAnswer?.includes("研究任务说明"),
  "T201_REFERENCE_MUST_PRODUCE_RESEARCH_BRIEF"
);

const t202Visible = JSON.stringify(t202);
assert(t202Visible.includes("能支持什么") && t202Visible.includes("原始"), "T202_EVIDENCE_JUDGMENT_MISSING");
assert(!t202.lessonSpec.title.includes("核验哪些内容"), "T202_MUST_NOT_REPEAT_T105");
assert(t202Visible.includes("中国市场") || t202Visible.includes("中国职场用户"), "T202_CHINA_MARKET_SCOPE_REQUIRED");

const t203Visible = JSON.stringify(t203);
assert(
  t203Visible.includes("定义") && t203Visible.includes("对象") && t203Visible.includes("时间") && t203Visible.includes("方法"),
  "T203_ALIGNMENT_DIMENSIONS_MISSING"
);
assert(t203Visible.includes("不要投票") || t203Visible.includes("多数票"), "T203_NO_MAJORITY_VOTE_BOUNDARY_MISSING");
assert(t203Visible.includes("中国市场") || t203Visible.includes("中国职场用户"), "T203_CHINA_MARKET_SCOPE_REQUIRED");
assert(!JSON.stringify(track02BatchADrafts).includes("新加坡"), "TRACK02_NON_CHINA_MARKET_SCOPE_DRIFT");

console.log("TRACK02_BATCH_A_THREE_DRAFTS=PASS");
console.log("TRACK02_BATCH_A_CURRENT_COURSE_BUILDER=PASS");
console.log("TRACK02_BATCH_A_SIX_STEP_APPLICATION=PASS");
console.log("TRACK02_BATCH_A_COPY_READY_REFERENCE=PASS");
console.log("TRACK02_BATCH_A_CHINESE_FIRST=PASS");
console.log("TRACK02_BATCH_A_ANTI_REPEAT=PASS");
console.log("TRACK02_BATCH_A_STEP1_STEP2_SEPARATED=PASS");
console.log("TRACK02_BATCH_A_CHINA_MARKET_SCOPE=PASS");
console.log("TRACK02_BATCH_A_DETERMINISTIC_VALIDATION=PASS");
console.log("TRACK02_BATCH_A_STOPPED_AT_HUMAN_REVIEW=PASS");
