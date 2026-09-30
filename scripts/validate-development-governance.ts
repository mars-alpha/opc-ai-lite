import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("DEVELOPMENT_GOVERNANCE_FAILED:" + code);
}

const manual = "docs/DEVELOPMENT_OPERATING_MANUAL.md";
assert(fs.existsSync(manual), "OPERATING_MANUAL_MISSING");
assert(!fs.existsSync("docs/DEVELOPMENT_ROADMAP.md"), "LEGACY_DEVELOPMENT_ROADMAP_PRESENT");

const required = [
  "AGENTS.md",
  "docs/CURRENT_SYSTEM_FACTS.md",
  "docs/ARCHITECTURE.md",
  "PROJECT_STATUS.md",
  "TASKS.md",
  "README.md",
  manual
];

const banned = [
  "ADMIN-WORKBENCH-RESTRUCTURE-001",
  "docs/DEVELOPMENT_ROADMAP.md"
];

for (const file of required) {
  assert(fs.existsSync(file), "REQUIRED_FILE_MISSING:" + file);
  const source = fs.readFileSync(file, "utf8");
  if (file !== manual) {
    for (const token of banned) {
      assert(!source.includes(token), "SUPERSEDED_CURRENT_REFERENCE:" + file + ":" + token);
    }
  }
}

const manualSource = fs.readFileSync(manual, "utf8");
for (const token of [
  "独立个人 AI 工作台",
  "个人 AI 工作台使用权",
  "平台运营",
  "AI 能力配置",
  "Code / AI / Skill / Workflow / Human",
  "Decision Brief",
  "TDD 规则",
  "Definition of Done"
]) {
  assert(manualSource.includes(token), "OPERATING_MANUAL_CONTRACT_MISSING:" + token);
}

const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
assert(facts.includes("个人 AI 工作台") && facts.includes("会员"), "WORKSPACE_MEMBERSHIP_FACT_MISSING");

const architecture = fs.readFileSync("docs/ARCHITECTURE.md", "utf8");
assert(architecture.includes("独立个人 AI 工作台"), "ARCHITECTURE_WORKSPACE_BOUNDARY_MISSING");
assert(architecture.includes("管理后台"), "ARCHITECTURE_ADMIN_BOUNDARY_MISSING");

console.log("DEVELOPMENT_GOVERNANCE_OPERATING_MANUAL=PASS");
console.log("DEVELOPMENT_GOVERNANCE_NO_LEGACY_ROADMAP=PASS");
console.log("DEVELOPMENT_GOVERNANCE_THREE_PRODUCT_BOUNDARY=PASS");
console.log("DEVELOPMENT_GOVERNANCE_MEMBERSHIP_WORKSPACE=PASS");
