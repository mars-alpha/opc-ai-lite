import fs from "node:fs";
import path from "node:path";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_INTERACTION_ARCH_FAILED:" + code);
}

function read(file: string) {
  return fs.readFileSync(file, "utf8");
}

const page = read("app/courses/[slug]/lessons/[lessonId]/page.tsx");
const formalView = read("components/FormalGuidedLessonView.tsx");
const asyncShell = read("components/AsyncLessonRuntimeShell.tsx");
const panel = read("components/GenericLessonRuntimePanel.tsx");
const boundaries = read("lib/learning/course-runtime-boundaries.ts");

assert(page.includes("<FormalGuidedLessonView"), "FORMAL_VIEW_ROUTE_MISSING");
assert(page.includes("<LessonLockedView"), "LOCKED_VIEW_ROUTE_MISSING");
assert(page.includes("isFormalRuntimeCourse"), "FORMAL_BOUNDARY_CHECK_MISSING");
assert(!page.includes("LegacyStaticLessonView"), "LEGACY_VIEW_ROUTE_PRESENT");
assert(!page.includes("isLegacyStaticCourse"), "LEGACY_BOUNDARY_CHECK_PRESENT");

for (const oldInline of [
  "lesson-reading",
  "lesson-practice-box",
  "<LegacyLessonHelpPanel",
  "<LegacyCopyableGuide"
]) {
  assert(!page.includes(oldInline), "LEGACY_INTERACTION_LEAKED_INTO_ROUTE:" + oldInline);
}

assert(formalView.includes("<AsyncLessonRuntimeShell"), "FORMAL_ASYNC_RUNTIME_MISSING");
assert(!formalView.includes("legacy-learning"), "FORMAL_VIEW_IMPORTS_LEGACY");
assert(asyncShell.includes("<GenericLessonRuntimePanel"), "GENERIC_RUNTIME_PANEL_MISSING");
assert(panel.includes("const currentCheckLocked = currentCheckCorrect"), "CHECK_CORRECT_LOCK_STATE_MISSING");
assert(panel.includes("disabled={currentCheckLocked || busy === \"check\"}"), "CHECK_CORRECT_OPTION_LOCK_MISSING");
assert(panel.includes("if (currentCheckLocked || !check"), "CHECK_CORRECT_RESUBMIT_GUARD_MISSING");
assert(/currentCheckLocked\s*&&\s*currentCheckIndex\s*<\s*checkSequence\.length\s*-\s*1/.test(panel), "CHECK_NEXT_QUESTION_ENTRY_MISSING");
assert(!panel.includes("onChange={(event) => {\n                    if (currentCheckCorrect) return;\n                    setContent"), "CHECK_LOCK_MUST_NOT_LEAK_TO_PRACTICE");
assert(asyncShell.includes("<LessonCompleteButton"), "FORMAL_COMPLETION_CONTROL_MISSING");
assert(asyncShell.includes("<LessonFeedbackPrompt"), "FORMAL_FEEDBACK_NAV_MISSING");
assert(asyncShell.includes("正在读取学习进度…"), "FORMAL_PRELOAD_HINT_MISSING");

assert(boundaries.includes('"foundation-ai"'), "FOUNDATION_FORMAL_BOUNDARY_MISSING");
assert(!boundaries.includes("LEGACY_STATIC_COURSE_SLUGS"), "LEGACY_BOUNDARY_PRESENT");
assert(!fs.existsSync("components/legacy-learning"), "LEGACY_LEARNING_COMPONENTS_PRESENT");

for (const removed of [
  "components/StageProgress.tsx",
  "components/CopyableGuide.tsx",
  "components/LessonHelpPanel.tsx",
  "components/CourseCompletionBadge.tsx",
  "components/CourseProgress.tsx",
  "components/LessonStatus.tsx"
]) {
  assert(!fs.existsSync(removed), "RETIRED_INTERACTION_COMPONENT_REINTRODUCED:" + removed);
}

function walk(dir: string, result: string[] = []) {
  for (const name of fs.readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, result);
    else if (/\.(ts|tsx)$/.test(name)) result.push(file);
  }
  return result;
}

for (const file of [...walk("app"), ...walk("components"), ...walk("lib")]) {
  const source = read(file);
  assert(!source.includes("RUNTIME_FALLBACK"), "RUNTIME_FALLBACK_REINTRODUCED:" + file);
  assert(!source.includes("localInteractiveFallback"), "LOCAL_INTERACTIVE_FALLBACK_REINTRODUCED:" + file);
}

console.log("COURSE_INTERACTION_FORMAL_PATH=PASS");
console.log("COURSE_INTERACTION_LEGACY_ISOLATION=PASS");
console.log("COURSE_INTERACTION_RETIRED_COMPONENTS_ABSENT=PASS");
console.log("COURSE_INTERACTION_FALLBACK_FORBIDDEN=PASS");
console.log("COURSE_INTERACTION_CHECK_CORRECT_LOCK=PASS");
