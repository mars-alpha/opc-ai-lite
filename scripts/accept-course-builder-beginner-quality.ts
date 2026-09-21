import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  createCourseBuilderReviewPacket
} from "../lib/learning/course-builder";
import { beginnerAiUseCasesDraft } from "../fixtures/course-builder/beginner-foundation-batch-a";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const base = {
  ...beginnerAiUseCasesDraft,
  pedagogy: {
    ...beginnerAiUseCasesDraft.pedagogy,
    qualityProfile: {
      id: "BEGINNER_QUALITY_V1",
      mainLearnerQuestion: "我第一次接触 AI，它到底能帮我做什么？",
      mainConcept: "从低风险、容易检查的小任务开始让 AI 协助。",
      allowedCoreTerms: [],
      deferredTerms: ["Training", "Inference", "Token", "API", "Tool", "MCP", "RAG", "Evaluation"]
    }
  }
} as const;

const accepted = createCourseBuilderReviewPacket(base, new Date("2026-09-21T00:00:00.000Z"), "0.2.0");
assert(accepted.skill.version === "0.2.0", "QUALITY_V02_VERSION");
assert(accepted.output.mode === "BUILD", "QUALITY_V02_BUILD");

let missingProfileRejected = false;
try {
  createCourseBuilderReviewPacket(beginnerAiUseCasesDraft, new Date("2026-09-21T00:00:00.000Z"), "0.2.0");
} catch (error) {
  missingProfileRejected =
    error instanceof Error && error.message === "COURSE_BUILDER_V02_BEGINNER_QUALITY_PROFILE_REQUIRED";
}
assert(missingProfileRejected, "QUALITY_V02_PROFILE_REQUIRED");

const fourReviewAccepted = createCourseBuilderReviewPacket(
  { ...base, review: ["规则1", "规则2", "规则3", "规则4"] },
  new Date("2026-09-21T00:00:00.000Z"),
  "0.2.0"
);
assert(fourReviewAccepted.skill.version === "0.2.0", "QUALITY_FOUR_REVIEW_ITEMS_REJECTED");

let reviewBudgetRejected = false;
try {
  createCourseBuilderReviewPacket(
    { ...base, review: ["规则1", "规则2", "规则3", "规则4", "规则5"] },
    new Date("2026-09-21T00:00:00.000Z"),
    "0.2.0"
  );
} catch (error) {
  reviewBudgetRejected =
    error instanceof Error && error.message === "BEGINNER_QUALITY_REVIEW_BUDGET_EXCEEDED";
}
assert(reviewBudgetRejected, "QUALITY_REVIEW_BUDGET_NOT_ENFORCED");

let deferredTermRejected = false;
try {
  createCourseBuilderReviewPacket(
    {
      ...base,
      content: {
        ...base.content,
        summary: base.content.summary + " 这里提前讲 Token。"
      }
    },
    new Date("2026-09-21T00:00:00.000Z"),
    "0.2.0"
  );
} catch (error) {
  deferredTermRejected =
    error instanceof Error && error.message === "BEGINNER_QUALITY_DEFERRED_TERM_LEAK:Token";
}
assert(deferredTermRejected, "QUALITY_DEFERRED_TERM_NOT_ENFORCED");

const tokenLesson = {
  ...base,
  pedagogy: {
    ...base.pedagogy,
    qualityProfile: {
      ...base.pedagogy.qualityProfile,
      mainLearnerQuestion: "AI 为什么不是一次查出整段答案？",
      mainConcept: "Token 与逐步生成的基本直觉。",
      allowedCoreTerms: ["Token"],
      deferredTerms: ["Training", "Inference", "Token", "Embedding"]
    }
  },
  content: {
    ...base.content,
    summary: "这一课正式学习 Token，用一个简单例子理解 AI 怎样逐步生成内容。"
  }
} as const;
const tokenAccepted = createCourseBuilderReviewPacket(
  tokenLesson,
  new Date("2026-09-21T00:00:00.000Z"),
  "0.2.0"
);
assert(tokenAccepted.skill.version === "0.2.0", "QUALITY_ALLOWED_TERM_REJECTED");

const legacy = createCourseBuilderReviewPacket(
  {
    ...beginnerAiUseCasesDraft,
    pedagogy: {
      ...beginnerAiUseCasesDraft.pedagogy,
      sixStepResponsibilities: COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES
    }
  },
  new Date("2026-09-21T00:00:00.000Z")
);
assert(legacy.skill.version === "0.1.0", "QUALITY_V01_COMPATIBILITY");

console.log("COURSE_BUILDER_V02_PROFILE_REQUIRED=PASS");
console.log("COURSE_BUILDER_V02_REVIEW_BUDGET=PASS");
console.log("COURSE_BUILDER_V02_DEFERRED_TERMS=PASS");
console.log("COURSE_BUILDER_V02_ALLOWED_TERMS=PASS");
console.log("COURSE_BUILDER_V01_COMPATIBILITY=PASS");
