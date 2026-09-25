import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import {
  track02BatchDDrafts,
  track02BatchDIntroComparisons,
  track02BatchDKnowledgeDepth,
  track02BatchDTriggerScenarios
} from "../fixtures/course-builder/track02-batch-d";

function assert(value: unknown, code: string): asserts value {
  if (!value) throw new Error("TRACK02_BATCH_D_DRAFT_FAILED:" + code);
}

const expectedIds = [
  "t2-10-metric-definition",
  "t2-11-data-quality",
  "t2-12-data-analysis",
  "t2-13-knowledge-capture",
  "t2-14-knowledge-organization",
  "t2-15-reusable-method"
];

const mustRetainJudgments: Record<string, string[]> = {
  "t2-10-metric-definition": ["口径", "分子", "分母", "时间", "统计对象"],
  "t2-11-data-quality": ["缺失", "重复", "单位", "异常", "业务确认", "停止分析"],
  "t2-12-data-analysis": ["业务问题", "复核", "事实", "因果", "样本", "图表"],
  "t2-13-knowledge-capture": ["复用", "稳定", "来源", "生命周期", "待验证"],
  "t2-14-knowledge-organization": ["来源", "版本", "状态", "Source of Truth", "冲突", "归档"],
  "t2-15-reusable-method": ["固定步骤", "变量", "人工判断", "完成标准", "稳定", "自动化"]
};

const batchDSource = fs.readFileSync("fixtures/course-builder/track02-batch-d.ts", "utf8");
assert(!batchDSource.includes("situation: lesson.example.situation"), "STEP_1_2_OVERLAP_AUTO_SITUATION");
assert(!batchDSource.includes("text: lesson.example.before"), "STEP_1_2_OVERLAP_AUTO_BEFORE");
assert(!batchDSource.includes("text: lesson.example.after"), "STEP_1_2_OVERLAP_AUTO_AFTER");
assert(!batchDSource.includes("lesson.mistakes.slice"), "STEP5_MISTAKES_AUTO_REVIEW_FORBIDDEN");

const packets = track02BatchDDrafts.map((draft, i) =>
  createCourseBuilderReviewPacket(
    draft,
    new Date("2026-09-25T08:" + String(10 + i).padStart(2, "0") + ":00.000Z"),
    CURRENT_COURSE_BUILDER_SKILL.version
  )
);

assert(packets.length === 6, "SIX_DRAFTS_REQUIRED");
const ids = packets.map((p) => p.output.mode === "BUILD" ? p.output.lessonSpec.lessonId : "");
assert(JSON.stringify(ids) === JSON.stringify(expectedIds), "LESSON_IDS_OR_ORDER");

for (const packet of packets) {
  assert(
    packet.status === "PENDING_REVIEW" &&
      packet.validation.schema === "PASS" &&
      packet.validation.rules === "PASS" &&
      packet.validation.warnings.length === 0,
    "REVIEW_PACKET"
  );
  assert(packet.output.mode === "BUILD", "BUILD_MODE");
  const d = packet.output;
  const id = d.lessonSpec.lessonId;
  assert(d.lessonSpec.lessonType === "APPLICATION", id + ":TYPE");
  assert(JSON.stringify(d.lessonSpec.completionGates) === JSON.stringify(["CHECK", "PRACTICE"]), id + ":GATES");
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
  assert(d.review.length >= 2 && d.selfAssessment.length >= 2, id + ":REVIEW_MIN_TWO_AND_CAPABILITY");
  assert(
    d.review.every((item) => {
      const [fit, boundary] = item.split("｜");
      return Boolean(fit?.trim() && boundary?.trim());
    }),
    id + ":REVIEW_TWO_DIRECTIONS"
  );
  const intro = track02BatchDIntroComparisons[
    id as keyof typeof track02BatchDIntroComparisons
  ];
  const depth = track02BatchDKnowledgeDepth[
    id as keyof typeof track02BatchDKnowledgeDepth
  ];
  const trigger = track02BatchDTriggerScenarios[id];
  assert(intro?.title !== d.content.example.title, id + ":STEP_1_2_OVERLAP_TITLE");
  assert(intro?.situation !== d.content.example.situation, id + ":STEP_1_2_OVERLAP_SITUATION");
  assert(
    !intro?.approaches.some(
      (item: { text: string }) =>
        item.text === d.content.example.before ||
        item.text === d.content.example.after ||
        item.text === d.content.example.result
    ),
    id + ":STEP_1_2_OVERLAP_CARDS"
  );
  assert(intro?.bottomDetails.length === 2, id + ":STEP1_BOTTOM");
  assert(depth?.example.length >= 1 && depth.review.length >= 1, id + ":DEPTH");
  const reviewCoverageText = JSON.stringify({
    main: d.review,
    explanation: depth.review
  });
  for (const keyword of mustRetainJudgments[id] ?? []) {
    assert(reviewCoverageText.includes(keyword), id + ":STEP5_KNOWLEDGE_COVERAGE:" + keyword);
  }
  assert(
    Boolean(trigger?.trim()) &&
      !trigger.includes("下一课") &&
      !trigger.includes("下一板块") &&
      trigger.includes("这节课用于"),
    id + ":TRIGGER"
  );
  const visible = JSON.stringify({
    title: d.lessonSpec.title,
    content: d.content,
    practice: d.practice,
    checks: d.checkSequence,
    review: d.review,
    selfAssessment: d.selfAssessment
  });
  for (const forbidden of ["Schema", "Beginner"]) {
    assert(!visible.includes(forbidden), id + ":ENGLISH_INTERNAL_TERM");
  }
}

const serialized = track02BatchDDrafts.map((d) => JSON.stringify(d));
assert(serialized[0]?.includes("指标") && serialized[0]?.includes("口径"), "T210_METRIC");
assert(serialized[1]?.includes("缺失") && serialized[1]?.includes("异常"), "T211_QUALITY");
assert(serialized[2]?.includes("业务问题") && serialized[2]?.includes("复核"), "T212_ANALYSIS");
assert(serialized[3]?.includes("沉淀") && serialized[3]?.includes("权威"), "T213_CAPTURE");
assert(serialized[4]?.includes("版本") && serialized[4]?.includes("Source of Truth"), "T214_GOVERNANCE");
assert(serialized[5]?.includes("固定步骤") && serialized[5]?.includes("人工判断"), "T215_REUSE");

console.log("TRACK02_BATCH_D_STEP_1_2_OVERLAP_GUARD=PASS");
console.log("TRACK02_BATCH_D_STEP5_KNOWLEDGE_COVERAGE=PASS");
console.log("TRACK02_BATCH_D_SIX_DRAFTS=PASS");
console.log("TRACK02_BATCH_D_SIX_STEP_AND_TWO_LINE_NAV=PASS");
console.log("TRACK02_BATCH_D_DIRECT_COPY_REFERENCE=PASS");
console.log("TRACK02_BATCH_D_STEP1_BOTTOM_AND_DEPTH=PASS");
console.log("TRACK02_BATCH_D_SEPARATE_CAPABILITIES=PASS");
console.log("TRACK02_BATCH_D_REVIEW_PACKET_VALIDATION=PASS");
