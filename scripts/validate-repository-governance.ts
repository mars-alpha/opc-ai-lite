import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("REPOSITORY_GOVERNANCE_FAILED:" + code);
}

const required = [
  "AGENTS.md",
  "docs/CURRENT_SYSTEM_FACTS.md",
  "PROJECT_STATUS.md",
  "TASKS.md",
  "docs/CONTEXT_GOVERNANCE.md",
  "docs/DEVELOPMENT_OPERATING_MANUAL.md",
  "docs/runbooks/TENCENTDB_POSTGRESQL.md",
  "docs/learning/COURSE_BUILD_START_HERE.md",
  "docs/learning/COURSE_BUILD_STANDARD_V1.md",
  "docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md",
  "docs/learning/FORMAL_CURRICULUM_V1.md",
  "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
  "docs/learning/TRACK_CONTEXTS_V1.md",
  "docs/learning/UNIFIED_LESSON_SHELL_V1.md"
];
for (const file of required) assert(fs.existsSync(file), "REQUIRED_OWNER_MISSING:" + file);

const agents = fs.readFileSync("AGENTS.md", "utf8");
assert(agents.includes("VISUAL_HUMAN_REVIEW_GATE"), "VISUAL_HUMAN_REVIEW_GATE_MISSING");
assert(agents.includes("EXPLICIT USER APPROVAL"), "VISUAL_USER_APPROVAL_REQUIREMENT_MISSING");

const architecture = fs.readFileSync("docs/ARCHITECTURE.md", "utf8");
assert(!architecture.includes("Supabase/PostgreSQL 作为当前数据库服务"), "LEGACY_SUPABASE_CURRENT_TARGET_PRESENT");
assert(architecture.includes("TencentDB for PostgreSQL"), "TENCENTDB_TARGET_BOUNDARY_MISSING");

const learningWhitelist = new Set([
  "COURSE_BUILD_START_HERE.md",
  "COURSE_BUILD_STANDARD_V1.md",
  "COURSE_PRODUCTION_WORKFLOW_V1.md",
  "FORMAL_CURRICULUM_V1.md",
  "FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
  "TRACK_CONTEXTS_V1.md",
  "UNIFIED_LESSON_SHELL_V1.md"
]);
for (const file of fs.readdirSync("docs/learning")) {
  assert(learningWhitelist.has(file), "NON_CURRENT_LEARNING_DOC:" + file);
}

assert(!fs.existsSync("docs/task-results"), "TASK_RESULTS_SHOULD_USE_GIT_HISTORY");

for (const file of [
  "index.html",
  "learning-path.html",
  "ai-daily.html",
  "practice.html",
  "styles.css",
  "script.js",
  "README.txt"
]) {
  assert(!fs.existsSync(file), "LEGACY_ROOT_PROTOTYPE_PRESENT:" + file);
}

for (const file of [
  "docs/learning/LESSON_OUTPUT_CONTRACT_V1.md",
  "docs/learning/BEGINNER_LESSON_QUALITY_STANDARD_V1.md",
  "docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md",
  "skills/course-builder/_historical-v0.1.ts",
  "skills/course-builder/_historical-v0.2.ts"
]) {
  assert(!fs.existsSync(file), "SUPERSEDED_FILE_PRESENT:" + file);
}

assert(!fs.existsSync("app/course-builder"), "HISTORICAL_PREVIEW_ROUTE_SURFACE_PRESENT");
assert(!fs.existsSync("components/BeginnerFoundationDraftPreview.tsx"), "HISTORICAL_PREVIEW_COMPONENT_PRESENT");

const courseContentDir = "lib/learning/course-content";
assert(fs.existsSync(courseContentDir), "PRODUCTION_COURSE_CONTENT_DIR_MISSING");
const courseContentFiles = fs.readdirSync(courseContentDir).filter((file) => file.endsWith(".ts"));
assert(courseContentFiles.length === 32, "PRODUCTION_COURSE_CONTENT_EXPECTED_32_SOURCE_FILES");

const fixtureFiles = fs.readdirSync("fixtures/course-builder").filter((file) => file.endsWith(".ts"));
assert(
  fixtureFiles.length === 1 && fixtureFiles[0] === "prompt-foundations.ts",
  "COURSE_BUILDER_FIXTURES_MUST_BE_VALIDATION_ONLY"
);

const historicalOwnerToken = /[A-Z0-9_-]*(?:FORMAL_BRIEFS?|SIX_STEP_AUDIT|DEFERRED_KNOWLEDGE_LEDGER|RESEARCH_PACKET)[A-Z0-9_-]*\.md/g;
for (const file of courseContentFiles) {
  const source = fs.readFileSync(`${courseContentDir}/${file}`, "utf8");
  for (const match of source.matchAll(historicalOwnerToken)) {
    const markerStart = Math.max(0, (match.index ?? 0) - "git-history:".length);
    const marker = source.slice(markerStart, match.index);
    assert(marker === "git-history:", "UNMARKED_HISTORICAL_PROVENANCE:" + file);
  }
}

const scriptFiles = fs.readdirSync("scripts").filter((file) => file.endsWith(".ts"));
for (const file of scriptFiles) {
  assert(!file.startsWith("_historical-"), "HISTORICAL_SCRIPT_PRESENT:" + file);
  assert(!/^(accept-track|provision-track|validate-track|run-track)/.test(file), "TRACK_ONESHOT_SCRIPT_PRESENT:" + file);
}

console.log("REPOSITORY_GOVERNANCE_CURRENT_OWNERS=PASS");
console.log("REPOSITORY_GOVERNANCE_LEARNING_DOC_WHITELIST=PASS");
console.log("REPOSITORY_GOVERNANCE_GIT_HISTORY_BOUNDARY=PASS");
console.log("REPOSITORY_GOVERNANCE_NO_LEGACY_ROOT_PROTOTYPE=PASS");
console.log("REPOSITORY_GOVERNANCE_NO_SUPERSEDED_COURSE_RULES=PASS");
console.log("REPOSITORY_GOVERNANCE_NO_HISTORICAL_PREVIEW_ROUTES=PASS");
console.log("REPOSITORY_GOVERNANCE_PRODUCTION_COURSE_CONTENT_BOUNDARY=PASS");
console.log("REPOSITORY_GOVERNANCE_HISTORICAL_PROVENANCE_MARKED=PASS");
console.log("REPOSITORY_GOVERNANCE_SCRIPT_SURFACE=PASS");
console.log("REPOSITORY_GOVERNANCE_VISUAL_HUMAN_REVIEW_GATE=PASS");
console.log("REPOSITORY_GOVERNANCE_DATABASE_TARGET_BOUNDARY=PASS");
