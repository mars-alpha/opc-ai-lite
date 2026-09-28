import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK03_CONTEXT_FAILED:" + code);
}

const ownerPath = "docs/learning/TRACK03_CATALOG_CONTEXT_V1.md";
const auditPath = "docs/learning/TRACK03_SIX_STEP_AUDIT_V1.md";
const formalPath = "docs/learning/FORMAL_CURRICULUM_V1.md";
const continuityPath = "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md";
const deferredPath = "docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md";
const factsPath = "docs/CURRENT_SYSTEM_FACTS.md";
const statusPath = "PROJECT_STATUS.md";

for (const path of [ownerPath, auditPath, formalPath, continuityPath, deferredPath, factsPath, statusPath]) {
  assert(fs.existsSync(path), "REQUIRED_FILE_MISSING:" + path);
}

const owner = fs.readFileSync(ownerPath, "utf8");
const audit = fs.readFileSync(auditPath, "utf8");
const formal = fs.readFileSync(formalPath, "utf8");
const continuity = fs.readFileSync(continuityPath, "utf8");
const deferred = fs.readFileSync(deferredPath, "utf8");
const facts = fs.readFileSync(factsPath, "utf8");
const status = fs.readFileSync(statusPath, "utf8");

assert(owner.includes("当前唯一的课程上下文 owner"), "CURRENT_OWNER_MARKER_MISSING");
assert(owner.includes("DIRECTORY_APPROVED_V1 / 15 KEEP / T3-01～T3-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"), "OWNER_STATUS_DRIFT");

const lessonIds = Array.from(owner.matchAll(/^\| \d+ \| (T3-\d{2}) \|/gm), (match) => match[1]);
assert(lessonIds.length === 15, "FIFTEEN_CANDIDATES_REQUIRED");
assert(new Set(lessonIds).size === 15, "CANDIDATE_IDS_MUST_BE_UNIQUE");
for (let index = 1; index <= 15; index += 1) {
  const expected = "T3-" + String(index).padStart(2, "0");
  assert(lessonIds.includes(expected), "CANDIDATE_ID_MISSING:" + expected);
}

assert(audit.includes("PASS / 15 KEEP / DIRECTORY_APPROVED_V1"), "AUDIT_STATUS_DRIFT");
assert(audit.includes("15 KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE"), "AUDIT_DISPOSITION_DRIFT");
assert(formal.includes("docs/learning/TRACK03_CATALOG_CONTEXT_V1.md"), "FORMAL_OWNER_LINK_MISSING");
assert(!formal.includes("### Module 3.1 — 内容运营") && !formal.includes("### Module 3.6 — 渠道实战"), "LEGACY_STAGE3_DIRECTORY_REINTRODUCED");
assert(continuity.includes("当前唯一 Track 03 Context Owner"), "CONTINUITY_OWNER_LINK_MISSING");
assert(continuity.includes("找对业务对象 → 做成内容资产 → 发布并承接线索 → 推进销售 → 做好客服 → 用数据复盘增长"), "CONTINUITY_PHASES_DRIFT");
assert(deferred.includes("Track 03 planning resolution — TRACK03-CURRICULUM-CONTEXT-001"), "DEFERRED_RESOLUTION_MISSING");
assert(facts.includes("Track 03 canonical path          T3-01～T3-15 / 6 Phases / DIRECTORY_APPROVED_V1"), "CURRENT_FACT_TRACK03_DIRECTORY_MISSING");
assert(facts.includes("Next Gate                       Track 04 planning / Formal Curriculum Context"), "CURRENT_FACT_NEXT_GATE_DRIFT");
assert(status.includes("Track 03 Directory                       T3-01～T3-15 DIRECTORY_APPROVED_V1 / 15 KEEP"), "PROJECT_STATUS_TRACK03_MISSING");
for (const brief of [
  "TRACK03_BATCH_A_T3_01_T3_03_FORMAL_BRIEFS_V1.md",
  "TRACK03_BATCH_B_T3_04_T3_06_FORMAL_BRIEFS_V1.md",
  "TRACK03_BATCH_C_T3_07_T3_09_FORMAL_BRIEFS_V1.md",
  "TRACK03_BATCH_D_T3_10_T3_13_FORMAL_BRIEFS_V1.md",
  "TRACK03_BATCH_E_T3_14_T3_15_FORMAL_BRIEFS_V1.md"
]) assert(owner.includes(brief) && owner.includes("RELEASED FORMAL BRIEF"), "RELEASED_FORMAL_BRIEF_LINK_MISSING:" + brief);
assert(status.includes("Track 03 Formal Curriculum               T3-01～T3-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS"), "PROJECT_STATUS_TRACK03_COMPLETE_MISSING");
assert(status.includes("Track 03 Runtime                         15 LESSONS PROVISIONED / ACCEPTANCE PASS"), "PROJECT_STATUS_TRACK03_RUNTIME_MISSING");
assert(status.includes("CURRENT                                  TRACK04 / PLANNING"), "PROJECT_STATUS_CURRENT_GATE_DRIFT");

for (const forbidden of ["新增营销专属 Renderer", "新增 CRM / Funnel Builder", "修改课程 CSS"]) {
  assert(owner.includes(forbidden), "UI_FREEZE_BOUNDARY_MISSING:" + forbidden);
}

console.log("TRACK03_CONTEXT_OWNER=PASS");
console.log("TRACK03_15_CANDIDATES=PASS");
console.log("TRACK03_SIX_STEP_AUDIT=PASS");
console.log("TRACK03_CROSS_TRACK_CONTEXT=PASS");
console.log("TRACK03_DEFERRED_RESOLUTION=PASS");
console.log("TRACK03_UI_FREEZE=PASS");
console.log("TRACK03_STATUS_SYNC=PASS");
console.log("TRACK03_RUNTIME_COMPLETE=PASS");
