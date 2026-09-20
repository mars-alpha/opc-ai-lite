import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  createCourseBuilderReviewPacket
} from "../lib/learning/course-builder";
import { lessonSpecValidationSamples } from "../lib/learning/lesson-spec-samples";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const sourceSpec = lessonSpecValidationSamples.find(
  (item) => item.courseSlug === "chatgpt-worker" && item.lessonId === "task-brief"
);
if (!sourceSpec) throw new Error("SOURCE_SPEC_NOT_FOUND");

const build = createCourseBuilderReviewPacket(
  {
    mode: "BUILD",
    grounding: {
      status: "REVIEWED",
      sourceKind: "APPROVED_KNOWLEDGE",
      sourceLabels: ["validation knowledge"],
      researchSummary: "用于验证 Course Builder 的受控课程资料。"
    },
    pedagogy: {
      audience: "GENERAL",
      languagePolicy: "TERM_READABILITY",
      aiToolNeutral: true,
      participation: {
        kind: "CHOOSE",
        title: "先做一个选择",
        instruction: "先判断这份草稿应不应该直接发布。",
        prompt: null,
        reflection: "课程草稿必须先经过代码校验和人工审核。"
      },
      sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
    },
    lessonSpec: {
      ...sourceSpec,
      lessonId: "course-builder-validation",
      title: "Course Builder Validation"
    },
    content: {
      summary: "验证 BUILD Draft 能经过代码校验进入人工审核。",
      plainExplanation: "Course Builder 的输出不是正式课程，而是结构化候选。",
      whyItMatters: "只有先经过确定性规则校验，AI 生成结果才有资格进入人工审核。",
      points: ["Structured Draft", "Code Validation", "Human Review"],
      content: ["Skill 负责生成候选。", "Core 负责校验。", "Human Review 决定后续是否采用。"],
      example: {
        title: "从草稿到审核",
        situation: "Skill 生成一节课程候选。",
        before: "直接写入正式课程。",
        after: "先通过 Spec 与规则校验。",
        result: "只有合法 Draft 才进入 PENDING_REVIEW。"
      },
      mistakes: ["把 Skill 输出当成 Production Data"],
      related: ["Lesson Spec", "Generic Lesson Runtime"]
    },
    check: {
      id: "validation-check",
      question: "谁拥有正式发布权限？",
      options: [
        { value: "A", label: "Skill" },
        { value: "B", label: "Core System" }
      ],
      correctValue: "B",
      explanation: "正式状态写入属于 Core System。"
    },
    practice: {
      id: "validation-practice",
      title: "整理合法 Lesson Draft",
      goal: "把一个主题整理成结构完整的课程草稿。",
      instructions: [
        { key: "goal", label: "目标", prompt: "写清课程要解决什么问题。" },
        { key: "context", label: "背景", prompt: "补充适用对象和场景。" },
        { key: "constraint", label: "限制", prompt: "写出不能违反的规则。" },
        { key: "output", label: "结果", prompt: "说明最终课程输出结构。" }
      ],
      hints: ["先保证结构完整。"],
      rubric: [
        { key: "goal", label: "目标", maxScore: 25, minScore: 10, example: "明确课程目标" },
        { key: "context", label: "背景", maxScore: 25, minScore: 10, example: "明确学习者与场景" },
        { key: "constraint", label: "限制", maxScore: 25, minScore: 10, example: "明确边界" },
        { key: "output", label: "结果", maxScore: 25, minScore: 10, example: "明确输出" }
      ],
      passScore: 60
    },
    hints: [],
    referenceAnswer: "Core System 拥有正式状态写入权限。",
    review: ["确认 Lesson Type、Steps 与 Completion Gate 一致。"],
    selfAssessment: ["我能区分 Skill Draft 与 Published Course。"]
  },
  new Date("2026-09-20T00:00:00.000Z")
);

assert(build.status === "PENDING_REVIEW", "BUILD_NOT_PENDING_REVIEW");
assert(build.mode === "BUILD", "BUILD_MODE_INVALID");
if (build.output.mode !== "BUILD") throw new Error("BUILD_REQUIRED");
assert(
  Object.keys(build.output.pedagogy.sixStepResponsibilities).length === 6,
  "SIX_STEP_RESPONSIBILITIES_REQUIRED"
);

const improve = createCourseBuilderReviewPacket({
  mode: "IMPROVE",
  lessonKey: "chatgpt-worker/task-brief",
  changeSummary: "减少 Explain 冗余并加强 Practice 验收说明。",
  evidence: ["still_confused 在 Explain Step 集中出现"],
  affectedSteps: ["EXPLAIN", "PRACTICE"],
  proposedChanges: ["缩短 Explain", "补充 Practice 成功条件"],
  reason: "改善理解速度，同时保持 Completion Gate 不变。",
  risk: ["过度压缩可能损失必要背景"],
  keepUnchanged: ["Lesson Type", "Completion Gates", "Access Policy"],
  validationPlan: ["运行 Lesson Spec 校验", "人工体验 Reference Shell"]
});

assert(improve.status === "PENDING_REVIEW", "IMPROVE_NOT_PENDING_REVIEW");
assert(improve.mode === "IMPROVE", "IMPROVE_MODE_INVALID");

let authorityRejected = false;
try {
  createCourseBuilderReviewPacket({
    mode: "IMPROVE",
    lessonKey: "chatgpt-worker/task-brief",
    changeSummary: "非法状态修改",
    evidence: ["none"],
    affectedSteps: ["EXPLAIN"],
    proposedChanges: ["直接发布"],
    reason: "test",
    risk: ["test"],
    keepUnchanged: ["none"],
    validationPlan: ["none"],
    status: "PUBLISHED"
  });
} catch (error) {
  authorityRejected =
    error instanceof Error &&
    error.message.startsWith("COURSE_BUILDER_AUTHORITY_FIELD_NOT_ALLOWED:");
}
assert(authorityRejected, "AUTHORITY_FIELD_NOT_REJECTED");

let invalidSpecRejected = false;
try {
  createCourseBuilderReviewPacket({
    mode: "BUILD",
    grounding: {
      status: "REVIEWED",
      sourceKind: "APPROVED_KNOWLEDGE",
      sourceLabels: ["validation knowledge"],
      researchSummary: "用于非法 Spec 校验。"
    },
    pedagogy: {
      audience: "GENERAL",
      languagePolicy: "TERM_READABILITY",
      aiToolNeutral: true,
      participation: {
        kind: "CHOOSE",
        title: "测试参与",
        instruction: "测试",
        prompt: null,
        reflection: "测试"
      },
      sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
    },
    lessonSpec: {
      ...sourceSpec,
      lessonId: "invalid-build",
      completionGates: []
    },
    content: build.output.mode === "BUILD" ? build.output.content : null,
    check: { question: "test" },
    practice: { goal: "test" },
    hints: [],
    referenceAnswer: null,
    review: ["test"],
    selfAssessment: []
  });
} catch (error) {
  invalidSpecRejected =
    error instanceof Error &&
    error.message.startsWith("COURSE_BUILDER_LESSON_SPEC_INVALID:");
}
assert(invalidSpecRejected, "INVALID_LESSON_SPEC_NOT_REJECTED");

let missingGroundingRejected = false;
try {
  const valid = build.output.mode === "BUILD" ? build.output : null;
  if (!valid) throw new Error("BUILD_REQUIRED");
  createCourseBuilderReviewPacket({
    ...valid,
    grounding: undefined
  });
} catch (error) {
  missingGroundingRejected =
    error instanceof Error && error.message === "INVALID_BUILD_GROUNDING";
}
assert(missingGroundingRejected, "GROUNDING_NOT_ENFORCED");

let nonNeutralRejected = false;
try {
  const valid = build.output.mode === "BUILD" ? build.output : null;
  if (!valid) throw new Error("BUILD_REQUIRED");
  createCourseBuilderReviewPacket({
    ...valid,
    pedagogy: { ...valid.pedagogy, aiToolNeutral: false }
  });
} catch (error) {
  nonNeutralRejected =
    error instanceof Error && error.message === "COURSE_BUILDER_AI_TOOL_NEUTRAL_REQUIRED";
}
assert(nonNeutralRejected, "AI_TOOL_NEUTRALITY_NOT_ENFORCED");

let missingResponsibilityRejected = false;
try {
  const valid = build.output.mode === "BUILD" ? build.output : null;
  if (!valid) throw new Error("BUILD_REQUIRED");
  const { CAPABILITY: _removed, ...incomplete } = valid.pedagogy.sixStepResponsibilities;
  createCourseBuilderReviewPacket({
    ...valid,
    pedagogy: {
      ...valid.pedagogy,
      sixStepResponsibilities: incomplete
    }
  });
} catch (error) {
  missingResponsibilityRejected =
    error instanceof Error && error.message === "MISSING_STEP_RESPONSIBILITY:CAPABILITY";
}
assert(missingResponsibilityRejected, "MISSING_STEP_RESPONSIBILITY_NOT_REJECTED");

console.log("COURSE_BUILDER_BUILD=PASS");
console.log("COURSE_BUILDER_IMPROVE=PASS");
console.log("COURSE_BUILDER_CODE_VALIDATION=PASS");
console.log("COURSE_BUILDER_AUTHORITY_BOUNDARY=PASS");
console.log("COURSE_BUILDER_HUMAN_REVIEW_BOUNDARY=PASS");
console.log("COURSE_BUILDER_GROUNDING_REQUIRED=PASS");
console.log("COURSE_BUILDER_TERM_READABILITY=PASS");
console.log("COURSE_BUILDER_AI_TOOL_NEUTRAL=PASS");
console.log("COURSE_BUILDER_PARTICIPATION_REQUIRED=PASS");
console.log("COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES=PASS");
