import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK03_BATCH_A_BRIEF_FAILED:" + code);
}

const briefPath = "docs/learning/TRACK03_BATCH_A_T3_01_T3_03_FORMAL_BRIEFS_V1.md";
const ownerPath = "docs/learning/TRACK03_CATALOG_CONTEXT_V1.md";
const factsPath = "docs/CURRENT_SYSTEM_FACTS.md";
const statusPath = "PROJECT_STATUS.md";

for (const path of [briefPath, ownerPath, factsPath, statusPath]) {
  assert(fs.existsSync(path), "FILE_MISSING:" + path);
}

const brief = fs.readFileSync(briefPath, "utf8");
const owner = fs.readFileSync(ownerPath, "utf8");
const facts = fs.readFileSync(factsPath, "utf8");
const status = fs.readFileSync(statusPath, "utf8");

assert(brief.includes("PREVIEW_READY / DETERMINISTIC_PASS / HUMAN_REVIEW_PENDING"), "BRIEF_STATUS");
for (const id of ["T3-01", "T3-02", "T3-03"]) {
  assert(brief.includes("# " + id + " —"), "LESSON_SECTION:" + id);
}
assert((brief.match(/Primary Knowledge Home:/g) ?? []).length === 3, "PRIMARY_KNOWLEDGE_HOME_PER_LESSON");
assert(brief.includes("STEP_1_2_OVERLAP_FAIL"), "STEP1_STEP2_GATE");
assert(brief.includes("主 Review 固定围绕 **AI适合做什么 / AI不应该替你做什么**"), "STEP5_DIRECTIONS");
assert(brief.includes("主卡片至少 2 张，上限不固定"), "STEP5_MIN_TWO_FLEXIBLE_MAX");
assert((brief.match(/必须保留的判断：/g) ?? []).length === 3, "STEP5_MUST_RETAIN_PER_LESSON");
assert((brief.match(/固定 3 道题方向：/g) ?? []).length === 3, "THREE_CHECK_DIRECTIONS_PER_LESSON");
assert((brief.match(/参考填充必须/g) ?? []).length >= 3, "REFERENCE_FILL_PER_LESSON");
assert((brief.match(/^Trigger Scenario：/gm) ?? []).length === 3, "TRIGGER_PER_LESSON");
assert(brief.includes("≠ T2-04") && brief.includes("≠ T3-01") && brief.includes("≠ T2 Research"), "ANTI_REPEAT_BOUNDARIES");
assert(brief.includes("不注册 LessonSpec、不 Provision Runtime"), "NO_RUNTIME_BOUNDARY");
assert(brief.includes("先用普通中文讲懂") && brief.includes("不得直接成为学员学习门槛"), "PLAIN_LANGUAGE_BRIEF_GATE");
assert(brief.includes("真实自媒体 / 一人公司经营场景") && brief.includes("禁止拿本课程、课程推广或课程功能本身作为主要案例"), "REAL_SELF_MEDIA_CASE_BRIEF_GATE");
assert(!brief.includes("OPC AI 想推广“AI Work”课程"), "COURSE_AS_CASE_RESIDUE");

assert(owner.includes("Batch A：T3-01～T3-03") && owner.includes("BATCH_A_HUMAN_REVIEW_PENDING"), "OWNER_GATE_SYNC");
assert(facts.includes("Next Gate                       Track 03 Batch A Human Review / T3-01～T3-03"), "CURRENT_FACT_GATE_SYNC");
assert(status.includes("Track 03 Batch A                         T3-01～T3-03 PREVIEW_READY / DETERMINISTIC PASS / HUMAN REVIEW PENDING"), "PROJECT_STATUS_BATCH_A");
assert(status.includes("CURRENT                                  TRACK03 BATCH A / HUMAN REVIEW GATE"), "PROJECT_STATUS_CURRENT");

console.log("TRACK03_BATCH_A_FORMAL_BRIEF=PASS");
console.log("TRACK03_BATCH_A_STEP1_STEP2_BOUNDARY=PASS");
console.log("TRACK03_BATCH_A_PLAIN_LANGUAGE_BRIEF=PASS");
console.log("TRACK03_BATCH_A_REAL_SELF_MEDIA_CASE_BRIEF=PASS");
console.log("TRACK03_BATCH_A_CHECK_PLAN=PASS");
console.log("TRACK03_BATCH_A_PRACTICE_REFERENCE_FILL=PASS");
console.log("TRACK03_BATCH_A_STEP5_MUST_RETAIN=PASS");
console.log("TRACK03_BATCH_A_STEP6_CAPABILITY=PASS");
console.log("TRACK03_BATCH_A_NO_RUNTIME_SIDE_EFFECT=PASS");
