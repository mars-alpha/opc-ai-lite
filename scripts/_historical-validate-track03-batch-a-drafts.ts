import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import {
  track03BatchADrafts,
  track03BatchAIntroComparisons,
  track03BatchAKnowledgeDepth,
  track03BatchATriggerScenarios
} from "../fixtures/course-builder/track03-batch-a";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK03_BATCH_A_DRAFT_FAILED:" + code);
}

const expectedIds = [
  "t3-01-icp-audience-fit",
  "t3-02-use-case-fit",
  "t3-03-message-hierarchy"
];

const mustRetainJudgments: Record<string, string[]> = {
  "t3-01-icp-audience-fit": ["优先", "问题", "帮上", "证据", "待验证", "预算"],
  "t3-02-use-case-fit": ["目标人群", "发生", "现在怎么做", "想得到", "效率", "证据", "紧迫度"],
  "t3-03-message-hierarchy": ["功能", "核心价值", "对象", "需求场景", "依据", "下一步", "客户结果"]
};

const source = fs.readFileSync("fixtures/course-builder/track03-batch-a.ts", "utf8");
assert(!source.includes("situation: lesson.example.situation"), "STEP_1_2_OVERLAP_AUTO_SITUATION");
assert(!source.includes("text: lesson.example.before"), "STEP_1_2_OVERLAP_AUTO_BEFORE");
assert(!source.includes("text: lesson.example.after"), "STEP_1_2_OVERLAP_AUTO_AFTER");
assert(!source.includes("lesson.mistakes.slice"), "STEP5_MISTAKES_AUTO_REVIEW_FORBIDDEN");

const packets = track03BatchADrafts.map((draft, index) =>
  createCourseBuilderReviewPacket(
    draft,
    new Date("2026-09-28T02:" + String(20 + index).padStart(2, "0") + ":00.000Z"),
    CURRENT_COURSE_BUILDER_SKILL.version
  )
);

assert(packets.length === 3, "THREE_DRAFTS_REQUIRED");
const ids = packets.map((packet) => packet.output.mode === "BUILD" ? packet.output.lessonSpec.lessonId : "");
assert(JSON.stringify(ids) === JSON.stringify(expectedIds), "LESSON_IDS_OR_ORDER");

const reviewCounts: number[] = [];

for (const packet of packets) {
  assert(
    packet.status === "PENDING_REVIEW" &&
      packet.validation.schema === "PASS" &&
      packet.validation.rules === "PASS" &&
      packet.validation.warnings.length === 0,
    "REVIEW_PACKET"
  );
  assert(packet.output.mode === "BUILD", "BUILD_MODE");
  const draft = packet.output;
  const id = draft.lessonSpec.lessonId;
  assert(draft.lessonSpec.courseSlug === "ai-growth", id + ":COURSE_SLUG");
  assert(draft.lessonSpec.lessonType === "APPLICATION", id + ":TYPE");
  assert(JSON.stringify(draft.lessonSpec.completionGates) === JSON.stringify(["CHECK", "PRACTICE"]), id + ":GATES");
  assert(draft.lessonSpec.steps.length === 6, id + ":STEPS");
  const advice = draft.lessonSpec.learningRecommendation ?? "";
  assert(advice.endsWith("。") && advice.length <= 60, id + ":ADVICE");
  for (const step of draft.lessonSpec.steps) {
    const lines = step.navigationDescription?.split("\n") ?? [];
    assert(lines.length === 2 && lines.every((line) => line.length > 0 && line.length <= 10), id + ":NAV:" + step.kind);
    assert(step.title.length <= 32 && step.objective.length >= 20 && step.objective.length <= 90, id + ":STEP:" + step.kind);
  }

  assert(draft.checkSequence?.length === 3 && draft.practice !== null, id + ":CHECK_PRACTICE");
  assert(
    draft.checkSequence[0]?.masteryRole === "BEST_JUDGMENT" &&
      draft.checkSequence[1]?.masteryRole === "MISCONCEPTION" &&
      draft.checkSequence[2]?.masteryRole === "BOUNDARY_CONDITIONS",
    id + ":THREE_QUESTION_ROLES"
  );
  const reference = draft.practice.rubric.map((item) => item.example.trim()).join("\n");
  assert(draft.referenceAnswer === reference && reference.length >= 350 && reference.includes("请"), id + ":DIRECT_COPY_REFERENCE");

  assert(draft.review.length >= 2 && draft.selfAssessment.length >= 2, id + ":REVIEW_MIN_TWO_AND_CAPABILITY");
  reviewCounts.push(draft.review.length);
  assert(
    draft.review.every((item) => {
      const [fit, boundary] = item.split("｜");
      return Boolean(fit?.trim() && boundary?.trim());
    }),
    id + ":REVIEW_TWO_DIRECTIONS"
  );

  const intro = track03BatchAIntroComparisons[
    id as keyof typeof track03BatchAIntroComparisons
  ];
  const depth = track03BatchAKnowledgeDepth[
    id as keyof typeof track03BatchAKnowledgeDepth
  ];
  const trigger = track03BatchATriggerScenarios[id];

  assert(intro?.title !== draft.content.example.title, id + ":STEP_1_2_OVERLAP_TITLE");
  assert(intro?.situation !== draft.content.example.situation, id + ":STEP_1_2_OVERLAP_SITUATION");
  assert(
    !intro?.approaches.some(
      (item: { text: string }) =>
        item.text === draft.content.example.before ||
        item.text === draft.content.example.after ||
        item.text === draft.content.example.result
    ),
    id + ":STEP_1_2_OVERLAP_CARDS"
  );
  assert(intro?.bottomDetails.length === 2, id + ":STEP1_BOTTOM");
  assert(depth?.example.length >= 1 && depth.review.length >= 1, id + ":DEPTH");

  const reviewCoverageText = JSON.stringify({
    main: draft.review,
    explanation: depth.review
  });
  for (const keyword of mustRetainJudgments[id] ?? []) {
    assert(reviewCoverageText.includes(keyword), id + ":STEP5_KNOWLEDGE_COVERAGE:" + keyword);
  }

  assert(
    Boolean(trigger?.trim()) &&
      !trigger.includes("下一课") &&
      !trigger.includes("下一阶段") &&
      trigger.includes("这节课用于"),
    id + ":TRIGGER"
  );

  const visible = JSON.stringify({
    title: draft.lessonSpec.title,
    content: draft.content,
    practice: draft.practice,
    checks: draft.checkSequence,
    review: draft.review,
    selfAssessment: draft.selfAssessment
  });
  for (const forbidden of [
    "Schema", "Beginner", "T3-01", "T3-02", "T3-03",
    "ICP", "Audience", "Business Fit", "Problem Fit", "Value Fit", "Evidence", "Assumption",
    "Priority", "Exclusion", "Use Case", "Use-case", "Trigger", "Current Behavior", "Friction",
    "Desired Outcome", "Value Proposition", "Message Hierarchy", "Primary Value", "Proof",
    "Secondary Detail", "Next Step"
  ]) {
    assert(!visible.includes(forbidden), id + ":LEARNER_LANGUAGE_FAIL:" + forbidden);
  }
  for (const forbiddenCase of ["OPC AI 工作应用", "课程中已有", "体验对应课程", "推广 AI 工作应用 课程"]) {
    assert(!visible.includes(forbiddenCase), id + ":COURSE_AS_CASE_FORBIDDEN:" + forbiddenCase);
  }
}

assert(new Set(reviewCounts).size > 1, "REVIEW_COUNT_MUST_REFLECT_LESSON_DENSITY_NOT_TEMPLATE");

const serialized = track03BatchADrafts.map((draft) => JSON.stringify(draft));
assert(serialized[0]?.includes("现在最值得") && serialized[0]?.includes("能不能帮上") && serialized[0]?.includes("优先"), "T301_AUDIENCE_PRIORITY");
assert(serialized[1]?.includes("什么时候") && serialized[1]?.includes("想得到") && serialized[1]?.includes("待验证"), "T302_REAL_SITUATION");
assert(serialized[2]?.includes("最核心价值") && serialized[2]?.includes("真实依据") && serialized[2]?.includes("下一步"), "T303_MESSAGE_ORDER");
assert(serialized.every((item) => item.includes("自媒体") || item.includes("内容账号") || item.includes("创作者")), "REAL_SELF_MEDIA_CASE_REQUIRED");

console.log("TRACK03_BATCH_A_STEP_1_2_OVERLAP_GUARD=PASS");
console.log("TRACK03_BATCH_A_LEARNER_LANGUAGE=PASS");
console.log("TRACK03_BATCH_A_REAL_SELF_MEDIA_CASES=PASS");
console.log("TRACK03_BATCH_A_STEP5_KNOWLEDGE_COVERAGE=PASS");
console.log("TRACK03_BATCH_A_THREE_DRAFTS=PASS");
console.log("TRACK03_BATCH_A_SIX_STEP_AND_NAV=PASS");
console.log("TRACK03_BATCH_A_DIRECT_COPY_REFERENCE=PASS");
console.log("TRACK03_BATCH_A_STEP1_BOTTOM_AND_DEPTH=PASS");
console.log("TRACK03_BATCH_A_SEPARATE_CAPABILITIES=PASS");
console.log("TRACK03_BATCH_A_REVIEW_PACKET_VALIDATION=PASS");
