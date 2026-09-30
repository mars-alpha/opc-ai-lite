import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_BUILD_ENTRY_FAILED:" + code);
}

const entry = fs.readFileSync("docs/learning/COURSE_BUILD_START_HERE.md", "utf8");
const agents = fs.readFileSync("AGENTS.md", "utf8");

for (const required of [
  "docs/CURRENT_SYSTEM_FACTS.md",
  "FORMAL_CURRICULUM_V1.md",
  "COURSE_BUILD_STANDARD_V1.md",
  "UNIFIED_LESSON_SHELL_V1.md",
  "COURSE_PRODUCTION_WORKFLOW_V1.md",
  "course-production-contract.ts",
  "skills/course-builder/index.ts",
  "TRACK_CONTEXTS_V1.md",
  "GenericLessonRuntimePanel",
  "learning:course-current-state:check"
]) {
  assert(entry.includes(required), "ENTRY_REQUIRED_REFERENCE_MISSING:" + required);
}

assert(entry.includes("Track 01～05 已正式上线并冻结"), "ENTRY_FREEZE_GATE_MISSING");
assert(entry.includes("产品负责人显式重新开启"), "ENTRY_REOPEN_GATE_MISSING");
assert(entry.includes("Track switch = Context switch"), "ENTRY_CONTEXT_SWITCH_RULE_MISSING");
assert(agents.includes("COURSE_BUILD_START_HERE.md"), "AGENTS_ENTRY_REFERENCE_MISSING");
assert(agents.includes("COURSE_BUILD_STANDARD_V1.md"), "AGENTS_STANDARD_REFERENCE_MISSING");

for (const stale of [
  "LESSON_OUTPUT_CONTRACT_V1.md",
  "BEGINNER_LESSON_QUALITY_STANDARD_V1.md",
  "COURSE_PRODUCTION_GOVERNANCE_V1.md",
  "docs/task-results"
]) {
  assert(!entry.includes(stale), "ENTRY_STALE_REFERENCE:" + stale);
}

console.log("COURSE_BUILD_UNIQUE_ENTRY=PASS");
console.log("COURSE_BUILD_ENTRY_CURRENT_OWNERS=PASS");
console.log("COURSE_BUILD_ENTRY_FROZEN_REOPEN_GATE=PASS");
console.log("COURSE_BUILD_ENTRY_NO_HISTORICAL_CONTEXT=PASS");
