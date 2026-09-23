import fs from "node:fs";

const entryPath = "docs/learning/COURSE_BUILD_START_HERE.md";
const agentsPath = "AGENTS.md";
const skillRegistryPath = "skills/course-builder/index.ts";
const workflowPath = "docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_BUILD_ENTRY_FAILED:" + code);
}

assert(fs.existsSync(entryPath), "ENTRY_FILE_MISSING");

const entry = fs.readFileSync(entryPath, "utf8");
const agents = fs.readFileSync(agentsPath, "utf8");
const skillRegistry = fs.readFileSync(skillRegistryPath, "utf8");
const workflow = fs.readFileSync(workflowPath, "utf8");

for (const required of [
  "docs/CURRENT_SYSTEM_FACTS.md",
  "docs/learning/FORMAL_CURRICULUM_V1.md",
  "docs/learning/LESSON_OUTPUT_CONTRACT_V1.md",
  "docs/learning/UNIFIED_LESSON_SHELL_V1.md",
  "docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md",
  "lib/learning/course-production-contract.ts",
  "skills/course-builder/index.ts",
  "learning:course-current-state:check",
  "LessonSpec Registry",
  "GenericLessonRuntimePanel",
  "learning:formal-registry:check",
  "上一课 → 本课 → 下一课",
  "Deferred Boundaries"
]) {
  assert(entry.includes(required), "ENTRY_REQUIRED_REFERENCE_MISSING:" + required);
}

assert(
  agents.includes("docs/learning/COURSE_BUILD_START_HERE.md"),
  "AGENTS_ENTRY_REFERENCE_MISSING"
);
assert(
  workflow.includes("READ_LATEST_AT_RUN_START") || workflow.includes("read-latest"),
  "COURSE_WORKFLOW_READ_LATEST_RULE_MISSING"
);
assert(
  skillRegistry.includes("CURRENT_COURSE_BUILDER_SKILL"),
  "CURRENT_SKILL_REGISTRY_MISSING"
);

assert(!entry.includes("RUNTIME_FALLBACK 作为允许"), "FALLBACK_MUST_NOT_BE_ALLOWED");

console.log("COURSE_BUILD_UNIQUE_ENTRY=PASS");
console.log("COURSE_BUILD_ENTRY_REFERENCES=PASS");
console.log("COURSE_BUILD_ENTRY_GOVERNANCE=PASS");
