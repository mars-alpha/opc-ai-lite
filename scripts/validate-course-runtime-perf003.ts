import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_RUNTIME_PERF003_FAILED:" + code);
}

const page = fs.readFileSync("app/courses/[slug]/lessons/[lessonId]/page.tsx", "utf8");
const formalView = fs.readFileSync("components/FormalGuidedLessonView.tsx", "utf8");
const asyncShell = fs.readFileSync("components/AsyncLessonRuntimeShell.tsx", "utf8");
const panel = fs.readFileSync("components/GenericLessonRuntimePanel.tsx", "utf8");
const progressProvider = fs.readFileSync("components/ProgressProvider.tsx", "utf8");

assert(!page.includes("getLessonRuntimeReadModel"), "SERVER_RUNTIME_READ_REINTRODUCED");
assert(page.includes("buildLessonRuntimePlan"), "STATIC_PLAN_BUILD_MISSING");
assert(page.includes("<FormalGuidedLessonView"), "FORMAL_GUIDED_VIEW_MISSING");
assert(formalView.includes("<AsyncLessonRuntimeShell"), "ASYNC_RUNTIME_SHELL_MISSING");
assert(asyncShell.includes("initialRuntime={null}"), "CLIENT_RUNTIME_HYDRATION_MISSING");
assert(asyncShell.includes("onRuntimeChange={handleRuntimeChange}"), "RUNTIME_STATE_BRIDGE_MISSING");
assert(asyncShell.includes("正在读取学习进度…"), "PRELOAD_PROGRESS_HINT_MISSING");
assert(asyncShell.includes("{!runtime && ("), "PRELOAD_HINT_MUST_HIDE_AFTER_RUNTIME");
assert(panel.includes("/api/learning/runtime?"), "RUNTIME_CLIENT_FETCH_MISSING");
assert(panel.includes("refresh(true)"), "PROGRESS_POSITION_RESTORE_MISSING");
assert(!panel.includes("正在准备这一课"), "BLOCKING_RUNTIME_LOADING_PANEL_FORBIDDEN");
assert(!panel.includes("正在读取本课 Step、互动内容和完成条件"), "BLOCKING_RUNTIME_LOADING_COPY_FORBIDDEN");
assert(panel.includes("const interactionLocked = !runtimeHydrated;"), "HYDRATION_INTERACTION_GUARD_MISSING");
assert(panel.includes("getCurrentStep"), "CURRENT_STEP_CACHE_MISSING");
assert(panel.includes("markCurrentStep"), "CURRENT_STEP_CACHE_UPDATE_MISSING");
assert(panel.includes("if (!runtimeHydrated || !step) return null;"), "GUIDED_LESSON_MUST_WAIT_FOR_RUNTIME");
assert(!panel.includes("progressSnapshotReady"), "PROGRESS_CACHE_MUST_NOT_REVEAL_GUIDED_LESSON");
assert(progressProvider.includes("refreshInFlightRef"), "LEARNING_STATE_REFRESH_DEDUP_MISSING");

console.log("COURSE_RUNTIME_STATIC_SHELL=PASS");
console.log("COURSE_RUNTIME_DYNAMIC_STATE_HYDRATION=PASS");
console.log("COURSE_RUNTIME_SERVER_BLOCKING_READ_FORBIDDEN=PASS");
