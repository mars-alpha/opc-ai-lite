import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_SIDEBAR_UX_FAILED:" + code);
}

const sidebar = fs.readFileSync("components/LessonCourseSidebar.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

assert(sidebar.includes("SIDEBAR_COLLAPSE_STORAGE_PREFIX"), "SESSION_COLLAPSE_STORAGE_MISSING");
assert(sidebar.includes("window.sessionStorage"), "SESSION_STORAGE_MISSING");
assert(sidebar.includes("currentStageId"), "CURRENT_STAGE_DETECTION_MISSING");
assert(sidebar.includes("stageId === currentStageId"), "CURRENT_STAGE_FORCE_OPEN_MISSING");
assert(sidebar.includes("moduleDone"), "STAGE_PROGRESS_SUMMARY_MISSING");
assert(sidebar.includes("aria-expanded={!collapsed}"), "STAGE_DISCLOSURE_ACCESSIBILITY_MISSING");
assert(sidebar.includes("collapsedStageIds.includes(module.id)"), "INDEPENDENT_MULTI_STAGE_COLLAPSE_MISSING");
assert(css.includes(".lesson-side-stage-progress"), "STAGE_PROGRESS_STYLE_MISSING");
assert(css.includes(".lesson-side-stage-chevron"), "STAGE_CHEVRON_STYLE_MISSING");

console.log("COURSE_SIDEBAR_STAGE_ACCORDION=PASS");
console.log("COURSE_SIDEBAR_CURRENT_STAGE_AUTO_OPEN=PASS");
console.log("COURSE_SIDEBAR_SESSION_STATE=PASS");
