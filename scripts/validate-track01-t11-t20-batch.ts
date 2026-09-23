import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK01_T11_T20_BATCH_FAILED:" + code);
}

const briefPath = "docs/learning/TRACK01_T11_T20_FORMAL_BRIEFS_V1.md";
const ledgerPath = "docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md";
const brief = fs.readFileSync(briefPath, "utf8");
const ledger = fs.readFileSync(ledgerPath, "utf8");

for (let i = 11; i <= 20; i += 1) {
  assert(brief.includes("T1-" + i), "FORMAL_BRIEF_MISSING:T1-" + i);
}

for (const id of [
  "T1-11","T1-12","T1-13","T1-14","T1-15",
  "T1-16","T1-17","T1-18","T1-19","T1-20"
]) {
  assert(ledger.includes("| " + id + " "), "DEFERRED_LEDGER_SOURCE_MISSING:" + id);
}

for (const required of [
  "不新增 UI",
  "不调整 CSS",
  "Unified Lesson Shell",
  "SUPPORTING_KNOWLEDGE",
  "DEFER_TO_LATER_TRACK",
  "OUT_OF_SCOPE"
]) {
  assert(
    brief.includes(required) || ledger.includes(required),
    "BATCH_GOVERNANCE_MISSING:" + required
  );
}

for (const track of ["Track 02","Track 03","Track 04","Track 05"]) {
  assert(ledger.includes(track), "FUTURE_TRACK_PLANNING_MISSING:" + track);
}

for (const forbidden of [
  "新增专属 Renderer",
  "调整 CSS 来表达",
  "新增交互控件来表达"
]) {
  assert(!brief.includes("必须" + forbidden), "UI_EXPANSION_REQUIRED:" + forbidden);
}

console.log("TRACK01_T11_T20_FORMAL_BRIEF_BATCH=PASS");
console.log("TRACK01_T11_T20_NO_NEW_UI_CSS=PASS");
console.log("TRACK01_T11_T20_DEFERRED_KNOWLEDGE_LEDGER=PASS");
console.log("TRACK01_T11_T20_FUTURE_TRACK_PLANNING=PASS");
