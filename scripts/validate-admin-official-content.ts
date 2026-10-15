import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ADMIN_OFFICIAL_CONTENT_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const page = read("app/admin/content/page.tsx");
const workspace = read("components/AdminPlatformContentWorkspace.tsx");
const studioUi = read("components/AdminContentStudioWorkspace.tsx");
const policy = read("lib/content/intelligence-policy.ts");
const runner = read("lib/server/content/collection-runner.ts");

assert(page.includes("AdminPlatformContentWorkspace"), "WORKSPACE_ENTRY_MISSING");
assert(page.includes('params.view !== "workbench"'), "LEGACY_STRATEGY_DEEP_LINK_REMAINS");
assert(!page.includes('view === "strategy"'), "LEGACY_STRATEGY_VIEW_PRESENT");
assert(workspace.includes('type View = "INTELLIGENCE" | "WORKBENCH"'), "OPS_VIEW_MODEL_INVALID");
assert(!workspace.includes("STRATEGY"), "LEGACY_STRATEGY_UI_PRESENT");
assert(!workspace.includes("采集策略："), "LEGACY_STRATEGY_PROVENANCE_PRESENT");
assert(workspace.includes("查看原文"), "ORIGINAL_SOURCE_LINK_MISSING");
assert(workspace.includes("来源与原文"), "SOURCE_FACTS_MISSING");
assert(workspace.includes("观察"), "EVENT_WATCH_MISSING");
assert(workspace.includes("忽略"), "EVENT_IGNORE_MISSING");
assert(studioUi.includes("内容工作台"), "CONTENT_WORKBENCH_MISSING");
assert(policy.includes("SOURCE_ROLES"), "SOURCE_ROLE_POLICY_MISSING");
assert(policy.includes("CONFIRMATION_SCOPES"), "CONFIRMATION_SCOPE_POLICY_MISSING");
assert(policy.includes("CONFIRMATION_AUTHORITIES"), "CONFIRMATION_AUTHORITY_POLICY_MISSING");
assert(runner.includes("sourceContentRule"), "RUNNER_POLICY_NOT_APPLIED");
assert(!workspace.includes("采用并进入内容工作台"), "OLD_ADOPTION_CONTROL_REMAINS");

console.log("ADMIN_CONTENT_FINAL_PATH=PASS");
console.log("LEGACY_STRATEGY_UI_REMOVED=PASS");
console.log("EVENT_SOURCE_TRACEABILITY=PASS");
