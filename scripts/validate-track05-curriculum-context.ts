import fs from "node:fs";

function assert(value:unknown,code:string):asserts value{if(!value)throw new Error("TRACK05_CONTEXT_FAILED:"+code);}

const owner=fs.readFileSync("docs/learning/TRACK05_CATALOG_CONTEXT_V1.md","utf8");
const audit=fs.readFileSync("docs/learning/TRACK05_SIX_STEP_AUDIT_V1.md","utf8");
const continuity=fs.readFileSync("docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md","utf8");
const deferred=fs.readFileSync("docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md","utf8");
const formal=fs.readFileSync("docs/learning/FORMAL_CURRICULUM_V1.md","utf8");
const facts=fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md","utf8");
const status=fs.readFileSync("PROJECT_STATUS.md","utf8");
const tasks=fs.readFileSync("TASKS.md","utf8");
const batchA=fs.readFileSync("docs/learning/TRACK05_BATCH_A_T5_01_T5_03_FORMAL_BRIEFS_V1.md","utf8");
const packageJson=fs.readFileSync("package.json","utf8");

assert(owner.includes("DIRECTORY_APPROVED_V1 / T5-01～T5-16 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS / 6 BATCHES"),"OWNER_STATUS");
assert(audit.includes("HUMAN_REVIEW_PASS / DIRECTORY_APPROVED_V1"),"AUDIT_STATUS");
for(let i=1;i<=16;i++){
 const id="T5-"+String(i).padStart(2,"0");
 assert(owner.includes(id),"OWNER_ID:"+id);
 assert(audit.includes(id),"AUDIT_ID:"+id);
}
for(const phase of [
 "Phase 1 — 看清真实问题",
 "Phase 2 — 定义目标与价值",
 "Phase 3 — 设计可落地方案",
 "Phase 4 — 用最小试点验证",
 "Phase 5 — 用证据决定并推动采用",
 "Phase 6 — 完成解决方案落地交付"
]) assert(owner.includes(phase),"PHASE:"+phase);

assert(owner.includes("DIRECTORY_APPROVED_V1 / T5-01～T5-16 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS / 6 BATCHES"),"OWNER_GATE");
assert(owner.includes("Next Gate：**Track 05 COMPLETE / Ready for Git Commit**"),"NEXT_GATE");
assert(owner.includes("| 1 | T5-01")&&owner.includes("| AVAILABLE |"),"BATCH_A_DIRECTORY_AVAILABLE");
assert(!owner.includes("APPROVED / PLANNED"),"NO_STALE_PLANNED_DIRECTORY");
assert((owner.match(/AVAILABLE \/ FORMAL_RUNTIME/g)??[]).length>=12,"DIRECTORY_ALL_FORMAL_RUNTIME");
assert(!owner.includes("Next Gate：**Batch A（T5-01～T5-03）Course Builder Draft**"),"NO_STALE_BATCH_A_GATE");
assert(owner.includes("15 个 Primary Knowledge Home + 1 个 Capstone Integration Lesson"),"KNOWLEDGE_HOME_CAPSTONE_CLASSIFICATION");
assert(owner.includes("Track 05 does not reteach Track 04"),"ANTI_REPEAT_BOUNDARY");
assert(owner.includes("Technical / Enterprise stays optional"),"TECHNICAL_BOUNDARY");
assert(owner.includes("Learner-facing 阶段标题只显示阶段名称本身"),"STAGE_TITLE_RULE");
for(const batch of ["A | T5-01～T5-03","B | T5-04～T5-06","C | T5-07～T5-09","D | T5-10～T5-12","E | T5-13～T5-15","F | T5-16"]) assert(owner.includes(batch),"BATCH:"+batch);
assert(owner.includes("T5-01～T5-16 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS → READY FOR GIT COMMIT"),"BATCHING_GATE");
assert(batchA.includes("FORMAL_BRIEF_APPROVED_V1 / READY_FOR_COURSE_BUILDER"),"BATCH_A_BRIEF_STATUS");
for(const home of ["真实问题发现 / 症状与根问题区分","Stakeholder / User / Owner / Approver Map","Current-State Baseline / Cost-of-Problem"]) assert(batchA.includes(home),"BATCH_A_HOME:"+home);
for(const artifact of ["Problem Observation Notes","Stakeholder Map","Current-State Baseline"]) assert(batchA.includes(artifact),"BATCH_A_ARTIFACT:"+artifact);
assert(batchA.includes("T5-01 不提前定义 Problem Statement / Solution"),"BATCH_A_T501_BOUNDARY");
assert(batchA.includes("T5-03 不提前做 Target / ROI / Business Case"),"BATCH_A_T503_BOUNDARY");
assert(audit.includes("15 PRIMARY KNOWLEDGE HOMES KEEP + 1 CAPSTONE KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE / 0 REORDER"),"HUMAN_REVIEW_RESULT");
assert(audit.includes("CROSS_TRACK_KNOWLEDGE_OVERLAP_FAIL"),"CROSS_TRACK_GATE");
assert(continuity.includes("当前唯一 Track 05 Context Owner：\`docs/learning/TRACK05_CATALOG_CONTEXT_V1.md\`"),"CONTINUITY_OWNER");
assert(formal.includes("当前 Track 05 详细目录、Primary Knowledge Home、Six-step Audit"),"FORMAL_OWNER_LINK");
assert(deferred.includes("## 5.4 Track 05 planning resolution — TRACK05-CURRICULUM-001"),"DEFERRED_RESOLUTION");
assert(facts.includes("Track 05 canonical path          T5-01～T5-16 / 6 Phases / DIRECTORY_APPROVED_V1 / 6 PRODUCTION BATCHES"),"CURRENT_FACTS_APPROVED");
assert(facts.includes("Track 05 T5-01～T5-16          AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),"CURRENT_FACTS_ALL_AVAILABLE");
assert(facts.includes("Next Gate                       CURRENT RELEASE DEPLOYED / ENTRYPOINTS ITERATING"),"CURRENT_FACTS_GATE");
assert(status.includes("Track 05 Directory                       T5-01～T5-16 / 6 PHASES / 15 KNOWLEDGE HOMES + 1 CAPSTONE"),"PROJECT_STATUS");
assert(tasks.includes("ENTRYPOINTS-ITERATION"),"TASKS_CURRENT");
const batchAHumanReview=fs.readFileSync("docs/learning/TRACK05_BATCH_A_T5_01_T5_03_HUMAN_REVIEW_V1.md","utf8");
assert(batchAHumanReview.includes("HUMAN_REVIEW_PASS / 3 LESSONS / READY_FOR_LESSON_SPEC_REGISTRY")&&batchAHumanReview.includes("Post-release closure"),"BATCH_A_HUMAN_REVIEW");
const batchesBfHumanReview=fs.readFileSync("docs/learning/TRACK05_BATCHES_B_F_T5_04_T5_16_HUMAN_REVIEW_V1.md","utf8");
assert(batchesBfHumanReview.includes("HUMAN_REVIEW_PASS / 13 LESSONS / READY_FOR_LESSON_SPEC_REGISTRY")&&batchesBfHumanReview.includes("Post-release closure"),"BATCHES_BF_HUMAN_REVIEW");

const trackCatalog=fs.readFileSync("lib/learning/track-catalog.ts","utf8");
const registry=fs.readFileSync("lib/learning/lesson-spec-registry.ts","utf8");
assert(trackCatalog.includes("track05Catalog")&&trackCatalog.includes("t5-01-problem-discovery"),"BATCH_A_LEARNING_MAP_AVAILABLE");
for(const id of ["t5-04-problem-statement","t5-05-target-state","t5-06-value-hypothesis","t5-07-solution-options","t5-08-solution-readiness","t5-09-solution-scope","t5-10-prototype-hypothesis","t5-11-pilot-design","t5-12-pilot-learning","t5-13-evaluation-decision","t5-14-adoption","t5-15-rollout-ownership","t5-16-capstone"]) assert(trackCatalog.includes(id),"LEARNING_MAP_AVAILABLE:"+id);
assert(registry.includes("track05LessonSpecs"),"TRACK05_LESSON_SPECS_REGISTERED");
assert(!fs.existsSync("app/course-builder/preview/track05"),"NO_PREVIEW_CURRENT_PATH");
assert(!packageJson.includes("learning:track05-batch-a:build")&&!packageJson.includes("learning:track05-batch-a:human-review"),"BATCH_A_DRAFT_REVIEW_NOT_CURRENT_ENTRYPOINTS");

console.log("TRACK05_CONTEXT_OWNER=PASS");
console.log("TRACK05_16_LESSONS_15_KNOWLEDGE_HOMES_1_CAPSTONE=PASS");
console.log("TRACK05_DIRECTORY_HUMAN_REVIEW=PASS");
console.log("TRACK05_PRODUCTION_BATCHING=PASS");
console.log("TRACK05_BATCH_A_FORMAL_BRIEF=PASS");
console.log("TRACK05_BATCH_A_DRAFT_VALIDATION=PASS");
console.log("TRACK05_BATCH_A_HUMAN_REVIEW=PASS");
console.log("TRACK05_BATCHES_BF_HUMAN_REVIEW=PASS");
console.log("TRACK05_TRACK04_ANTI_REPEAT=PASS");
console.log("TRACK05_TECHNICAL_BOUNDARY=PASS");
console.log("TRACK05_CURRENT_STATE=PASS");
console.log("TRACK05_ALL_16_FORMAL_RUNTIME_AVAILABLE=PASS");
