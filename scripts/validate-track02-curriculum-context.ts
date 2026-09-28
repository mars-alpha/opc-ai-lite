import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK02_CONTEXT_FAILED:" + code);
}

const ownerPath = "docs/learning/TRACK02_CATALOG_CONTEXT_V1.md";
const formalPath = "docs/learning/FORMAL_CURRICULUM_V1.md";
const continuityPath = "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md";
const deferredPath = "docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md";
const factsPath = "docs/CURRENT_SYSTEM_FACTS.md";
const statusPath = "PROJECT_STATUS.md";

for (const path of [
  ownerPath,
  formalPath,
  continuityPath,
  deferredPath,
  factsPath,
  statusPath
]) {
  assert(fs.existsSync(path), "REQUIRED_FILE_MISSING:" + path);
}

const owner = fs.readFileSync(ownerPath, "utf8");
const formal = fs.readFileSync(formalPath, "utf8");
const continuity = fs.readFileSync(continuityPath, "utf8");
const deferred = fs.readFileSync(deferredPath, "utf8");
const facts = fs.readFileSync(factsPath, "utf8");
const status = fs.readFileSync(statusPath, "utf8");

assert(owner.includes("当前唯一的课程上下文 owner"), "CURRENT_OWNER_MARKER_MISSING");
assert(owner.includes("Related-file authority map"), "RELATED_FILE_AUTHORITY_MAP_MISSING");
assert(
  owner.includes("T2-10～T2-15 lesson-boundary owner；生产已完成 / AVAILABLE") &&
    owner.includes("T2-01～T2-03 lesson-boundary owner；生产已完成 / AVAILABLE"),
  "RELATED_FILE_CURRENT_BRIEF_AUTHORITY_DRIFT"
);
assert(
  owner.includes("DIRECTORY_APPROVED_V1 / T2-01～T2-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),
  "OWNER_STATUS_DRIFT"
);

const lessonIds = Array.from(
  owner.matchAll(/^\| \d+ \| (T2-\d{2}) \|/gm),
  (match) => match[1]
);
assert(lessonIds.length === 15, "FIFTEEN_CANDIDATES_REQUIRED");
assert(new Set(lessonIds).size === 15, "CANDIDATE_IDS_MUST_BE_UNIQUE");
for (let index = 1; index <= 15; index += 1) {
  const expected = "T2-" + String(index).padStart(2, "0");
  assert(lessonIds.includes(expected), "CANDIDATE_ID_MISSING:" + expected);
}

assert(
  formal.includes("`docs/learning/TRACK02_CATALOG_CONTEXT_V1.md`"),
  "FORMAL_CURRICULUM_OWNER_LINK_MISSING"
);
assert(
  !formal.includes("### Module 2.1 — 搜索、研究与信息判断") &&
    !formal.includes("### Module 2.6 — 重复工作优化"),
  "LEGACY_TRACK02_MODULE_DIRECTORY_REINTRODUCED"
);
assert(
  continuity.includes("当前唯一 Track 02 Context Owner"),
  "CONTINUITY_OWNER_LINK_MISSING"
);
assert(
  deferred.includes("Track 02 planning resolution — TRACK02-CURRICULUM-CONTEXT-001"),
  "DEFERRED_TRACK02_RESOLUTION_MISSING"
);

assert(
  facts.includes("T1-01～T1-20                     AVAILABLE / FORMAL_RUNTIME"),
  "TRACK01_AVAILABLE_FACT_DRIFT"
);
assert(
  facts.includes("T2-01～T2-15                    AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),
  "TRACK02_CURRENT_FACT_MISSING"
);
assert(
  fs.existsSync("docs/learning/TRACK02_SIX_STEP_AUDIT_V1.md"),
  "TRACK02_SIX_STEP_AUDIT_MISSING"
);
const audit = fs.readFileSync("docs/learning/TRACK02_SIX_STEP_AUDIT_V1.md", "utf8");
assert(audit.includes("PASS / 15 KEEP / DIRECTORY_APPROVED_V1"), "TRACK02_AUDIT_STATUS_DRIFT");
assert(
  audit.includes("15 KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE"),
  "TRACK02_AUDIT_DISPOSITION_DRIFT"
);
assert(
  fs.existsSync("docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md"),
  "TRACK02_BATCH_A_BRIEF_MISSING"
);
const batchABrief = fs.readFileSync(
  "docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md",
  "utf8"
);
assert(
  batchABrief.includes("AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS") &&
    batchABrief.includes("_historical-run-track02-batch-a-workflow.ts"),
  "TRACK02_BATCH_A_BRIEF_STATUS_DRIFT"
);
assert(
  batchABrief.includes("Research Brief") &&
    batchABrief.includes("Evidence Pack") &&
    batchABrief.includes("Evidence Synthesis"),
  "TRACK02_BATCH_A_ARTIFACT_DRIFT"
);
assert(
  batchABrief.includes("不重新教学 Prompt foundations"),
  "TRACK02_T201_PROMPT_BOUNDARY_DRIFT"
);
assert(
  batchABrief.includes("不重复 T1-05 的“哪些内容必须核验”"),
  "TRACK02_T202_RELIABILITY_BOUNDARY_DRIFT"
);
assert(
  batchABrief.includes("不让 Course Builder 把“冲突处理”退化成“哪条来源更权威”的 T2-02 重复题"),
  "TRACK02_T203_SYNTHESIS_BOUNDARY_DRIFT"
);
assert(
  batchABrief.includes("不新增 UI、不调整 CSS"),
  "TRACK02_BATCH_A_UI_FREEZE_DRIFT"
);
assert(
  status.includes("T2-01～T2-03 AVAILABLE / FORMAL_RUNTIME") &&
    status.includes("Track 02 Batch A Runtime                 PROVISIONED / ACCEPTANCE PASS"),
  "PROJECT_STATUS_NEXT_TASK_DRIFT"
);

for (const forbidden of [
  "新增文件上传器",
  "新增 Spreadsheet / 图表编辑器",
  "新增 Knowledge Base / Obsidian 编辑器"
]) {
  assert(owner.includes(forbidden), "UI_FREEZE_BOUNDARY_MISSING:" + forbidden);
}

console.log("TRACK02_CONTEXT_OWNER=PASS");
console.log("TRACK02_15_CANDIDATES=PASS");
console.log("TRACK02_RELATED_FILE_AUTHORITY=PASS");
console.log("TRACK02_NO_HISTORICAL_RESULT_DEPENDENCY=PASS");
console.log("TRACK02_LEGACY_MODULE_DRIFT=PASS");
console.log("TRACK02_CROSS_TRACK_CONTEXT=PASS");
console.log("TRACK02_UI_FREEZE=PASS");
console.log("TRACK02_STATUS_SYNC=PASS");
