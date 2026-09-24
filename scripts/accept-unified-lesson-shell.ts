import fs from "node:fs";
import path from "node:path";
import {
  UNIFIED_LESSON_MASTERY_SEQUENCE,
  UNIFIED_LESSON_SHELL_STATUS,
  UNIFIED_LESSON_SHELL_VERSION,
  UNIFIED_LESSON_STEP_LABELS,
  UNIFIED_LESSON_STEP_NAV_DESCRIPTIONS,
  UNIFIED_LESSON_STEP_ORDER
} from "../lib/learning/unified-lesson-shell";
import {
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES,
  validateCourseBuilderOutput
} from "../lib/learning/course-builder";
import { validateLessonSpec } from "../lib/learning/lesson-spec";
import { promptFoundationsBuildDraft } from "../fixtures/course-builder/prompt-foundations";
import { track01FormalLessonSpecs } from "../lib/learning/track01-phase1-runtime";
import { track02BatchADrafts } from "../fixtures/course-builder/track02-batch-a";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error(code);
}

const root = process.cwd();
const panelSource = fs.readFileSync(
  path.join(root, "components", "GenericLessonRuntimePanel.tsx"),
  "utf8"
);
const cssSource = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");

assert(UNIFIED_LESSON_SHELL_VERSION === "1.0.0", "SHELL_VERSION");
assert(UNIFIED_LESSON_SHELL_STATUS === "FROZEN_V1", "SHELL_STATUS");
assert(
  UNIFIED_LESSON_STEP_ORDER.join(">") ===
    "EXPLAIN>EXAMPLE>CHECK>PRACTICE>REVIEW>CAPABILITY",
  "SHELL_STEP_ORDER"
);
assert(
  UNIFIED_LESSON_STEP_ORDER.map((kind) => UNIFIED_LESSON_STEP_LABELS[kind]).join(">") ===
    "建立直觉>讲透方法>检查理解>动手实操>复盘框架>能力获得",
  "SHELL_STEP_LABELS"
);
assert(
  UNIFIED_LESSON_STEP_ORDER.map((kind) => UNIFIED_LESSON_STEP_NAV_DESCRIPTIONS[kind]).join(">") ===
    "从真实问题出发\n抓住核心判断>跟着案例看\n方法怎样起作用>做题检验理解\n找出判断误区>亲手完成任务\n检查实际结果>整理判断框架\n记住适用边界>确认自己会做\n知道何时使用",
  "SHELL_STEP_NAV_DESCRIPTIONS"
);
assert(
  Object.values(UNIFIED_LESSON_STEP_NAV_DESCRIPTIONS as Record<string, string>).every((value) =>
    value.split("\n").length === 2 && value.split("\n").every((line) => line.length <= 9)
  ),
  "SHELL_STEP_NAV_DESCRIPTION_TOO_LONG"
);

const responsibilityKeys = Object.keys(COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES);
assert(
  responsibilityKeys.join(">") === UNIFIED_LESSON_STEP_ORDER.join(">"),
  "SHELL_RESPONSIBILITY_ORDER"
);
assert(
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES.PRACTICE.avoid.includes("首次") &&
    COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES.PRACTICE.avoid.includes("核心概念"),
  "SHELL_PRACTICE_NO_NEW_CORE_THEORY"
);
assert(
  COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES.CAPABILITY.include.includes("触发") &&
    COURSE_BUILDER_SIX_STEP_RESPONSIBILITIES.CAPABILITY.include.includes("具体情境"),
  "SHELL_CAPABILITY_TRANSFER"
);

assert(
  UNIFIED_LESSON_MASTERY_SEQUENCE
    .map((item) => item.questionType + "/" + item.masteryRole)
    .join(">") ===
    "SINGLE_CHOICE/BEST_JUDGMENT>TRUE_FALSE/MISCONCEPTION>MULTI_SELECT/BOUNDARY_CONDITIONS",
  "SHELL_MASTERY_SEQUENCE"
);

const prompt = validateCourseBuilderOutput(promptFoundationsBuildDraft);
assert(prompt.mode === "BUILD" && prompt.checkSequence?.length === 3, "SHELL_REAL_MASTERY_SAMPLE");
if (prompt.mode === "BUILD" && prompt.checkSequence) {
  assert(
    prompt.checkSequence.every((item, index) =>
      item.questionType === UNIFIED_LESSON_MASTERY_SEQUENCE[index]?.questionType &&
      item.masteryRole === UNIFIED_LESSON_MASTERY_SEQUENCE[index]?.masteryRole
    ),
    "SHELL_REAL_MASTERY_ORDER"
  );
}

const invalidOrderSpec =
  prompt.mode === "BUILD"
    ? { ...prompt.lessonSpec, steps: [...prompt.lessonSpec.steps].reverse() }
    : null;
assert(
  invalidOrderSpec !== null &&
    validateLessonSpec(invalidOrderSpec).some((issue) => issue.code === "STEP_ORDER_INVALID"),
  "SHELL_SPEC_ORDER_GUARD"
);

assert(panelSource.includes("unifiedLessonStepLabel(step.kind)"), "SHELL_RENDERER_USES_FROZEN_LABELS");
assert(
  panelSource.includes("<small>{lessonStepNavigationDescription(item)}</small>") &&
    !panelSource.includes("<small>{item.title}</small>"),
  "SHELL_PROGRESS_CARDS_USE_LESSON_DESCRIPTIONS"
);
assert(panelSource.includes("if (previewMode) return;"), "SHELL_PREVIEW_READ_BOUNDARY");
const formalSpecs = [
  ...track01FormalLessonSpecs,
  ...track02BatchADrafts.map((draft) => draft.lessonSpec)
];
assert(formalSpecs.length === 23, "SHELL_FORMAL_LESSON_COUNT");
const navigationSets = formalSpecs.map((spec) => {
  assert(spec.steps.length === 6, "SHELL_SIX_CARDS:" + spec.lessonId);
  const descriptions = spec.steps.map((step) => {
    const lines = step.navigationDescription?.split("\n") ?? [];
    assert(
      lines.length === 2 && lines.every((line) => line.length > 0 && line.length <= 9),
      "SHELL_TWO_LINE_CARD:" + spec.lessonId + ":" + step.kind
    );
    return step.navigationDescription;
  });
  assert(new Set(descriptions).size === 6, "SHELL_DISTINCT_STEPS:" + spec.lessonId);
  return descriptions.join("|");
});
assert(new Set(navigationSets).size === formalSpecs.length, "SHELL_LESSON_NAVIGATION_UNIQUE");
assert(
  !/if\s*\(\s*(?:lessonSlug|lessonId|courseSlug)\s*===/.test(panelSource),
  "SHELL_NO_SLUG_RENDER_BRANCH"
);
assert(
  !/switch\s*\(\s*(?:lessonSlug|lessonId|courseSlug)\s*\)/.test(panelSource),
  "SHELL_NO_SLUG_RENDER_SWITCH"
);
assert(cssSource.includes('"prev center next"'), "SHELL_MOBILE_PRIMARY_ROW");
assert(cssSource.includes('"help help help"'), "SHELL_MOBILE_HELP_ROW");
assert(
  !cssSource.includes(".guided-step-nav > div { display:none; }"),
  "SHELL_NO_LEGACY_NAV_HIDE"
);

console.log("UNIFIED_LESSON_SHELL_VERSION=1.0.0");
console.log("UNIFIED_LESSON_SHELL_STATUS=FROZEN_V1");
console.log("UNIFIED_LESSON_SIX_STEP_ORDER=PASS");
console.log("UNIFIED_LESSON_STEP_LABELS=PASS");
console.log("UNIFIED_LESSON_STEP_NAV_DESCRIPTIONS=PASS");
console.log("UNIFIED_LESSON_PERSONALIZED_PROGRESS_CARDS=PASS");
console.log("UNIFIED_LESSON_RESPONSIBILITIES=PASS");
console.log("UNIFIED_LESSON_MASTERY_SEQUENCE=PASS");
console.log("UNIFIED_LESSON_NO_SLUG_BRANCH=PASS");
console.log("UNIFIED_LESSON_PREVIEW_BOUNDARY=PASS");
console.log("UNIFIED_LESSON_RESPONSIVE_NAV=PASS");
