import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_GOVERNANCE_FAILED:" + code);
}

const standard = fs.readFileSync("docs/learning/COURSE_BUILD_STANDARD_V1.md", "utf8");
const skill = fs.readFileSync("skills/course-builder/v1.ts", "utf8");
const panel = fs.readFileSync("components/GenericLessonRuntimePanel.tsx", "utf8");
const route = fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx", "utf8");

for (const phrase of [
  "STEP_1_2_OVERLAP_FAIL",
  "STEP5_KNOWLEDGE_COVERAGE_FAIL",
  "LESSON_TEMPLATE_DRIFT_FAIL",
  "CROSS_LESSON_KNOWLEDGE_OVERLAP_FAIL",
  "至少 2 张",
  "上限不固定",
  "AI适合做什么",
  "AI不应该替你做什么",
  "先说人话，再决定是否需要术语",
  "LEARNER_LANGUAGE_FAIL",
  "BEGINNER_PLAIN_LANGUAGE_FAIL",
  "字段值本身",
  "UNKNOWN"
]) {
  assert(standard.includes(phrase), "STANDARD_RULE_MISSING:" + phrase);
}

assert(
  standard.includes("我怎样知道自己会了") &&
    standard.includes("遇到什么真实情况，我应该想到这节课") &&
    standard.includes("下一课为什么值得继续"),
  "STEP6_RESPONSIBILITY_MISSING"
);

assert(
  standard.includes("正常课程序号") &&
    standard.includes("T2-07"),
  "LEARNER_NUMBERING_BOUNDARY_MISSING"
);

assert(
  skill.includes("STEP_1_2_OVERLAP_FAIL") &&
    skill.includes("STEP5_KNOWLEDGE_COVERAGE_FAIL") &&
    skill.includes("LESSON_TEMPLATE_DRIFT_FAIL") &&
    skill.includes("CROSS_LESSON_KNOWLEDGE_OVERLAP_FAIL"),
  "COURSE_BUILDER_CRITICAL_GATES_DRIFT"
);

assert(
  panel.includes("<small>{currentStep + 1} / {plan.steps.length}</small>"),
  "PURE_PAGE_NUMBER_RENDERING_MISSING"
);
assert(!route.includes("T2-07"), "FORMAL_ROUTE_INTERNAL_ID_DRIFT");

for (const stale of [
  "docs/learning/LESSON_OUTPUT_CONTRACT_V1.md",
  "docs/learning/BEGINNER_LESSON_QUALITY_STANDARD_V1.md",
  "docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md"
]) {
  assert(!fs.existsSync(stale), "SUPERSEDED_RULE_FILE_PRESENT:" + stale);
}

console.log("COURSE_GOVERNANCE_SINGLE_STANDARD_OWNER=PASS");
console.log("COURSE_GOVERNANCE_SIX_STEP_GATES=PASS");
console.log("COURSE_GOVERNANCE_COPY_TO_AI_BOUNDARY=PASS");
console.log("COURSE_GOVERNANCE_LANGUAGE_AND_ID_BOUNDARY=PASS");
console.log("COURSE_GOVERNANCE_BATCH_ANTI_DRIFT=PASS");
console.log("COURSE_GOVERNANCE_RUNTIME_PRESENTATION=PASS");