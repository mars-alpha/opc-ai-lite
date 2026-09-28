import fs from "node:fs";
function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK04_CONTEXT_FAILED:"+code);}
const owner=fs.readFileSync("docs/learning/TRACK04_CATALOG_CONTEXT_V1.md","utf8");
const audit=fs.readFileSync("docs/learning/TRACK04_SIX_STEP_AUDIT_V1.md","utf8");
const facts=fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md","utf8");
const status=fs.readFileSync("PROJECT_STATUS.md","utf8");
for(let i=1;i<=15;i++){const id="T4-"+String(i).padStart(2,"0");assert(owner.includes(id),"OWNER_ID:"+id);assert(audit.includes(id),"AUDIT_ID:"+id);}
assert(owner.includes("DIRECTORY_APPROVED_V1 / 15 KEEP / T4-01～T4-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),"OWNER_STATUS");
assert(owner.includes("lib/learning/track04-runtime.ts")&&owner.includes("track04-specs.ts"),"CURRENT_RUNTIME_OWNER");
assert(owner.includes("T4-01～T4-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS → TRACK 05 CURRICULUM PLANNING"),"OWNER_GATE");
assert(owner.includes("学员界面展示规则：学习路径和正式课程左侧阶段卡片只显示阶段名称本身"),"LEARNER_STAGE_DISPLAY_RULE");
for(const mapping of ["阶段 1：T4-01","阶段 2：T4-02～T4-05","阶段 3：T4-06～T4-08","阶段 4：T4-09","阶段 5：T4-10～T4-13","阶段 6：T4-14～T4-15"])assert(owner.includes(mapping),"STAGE_MAPPING:"+mapping);
assert(audit.includes("15 KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE / DIRECTORY_APPROVED_V1"),"AUDIT_RESULT");
assert(audit.includes("T4-01～T4-15 全部 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),"AUDIT_RELEASE");
assert(facts.includes("Track 04 T4-01～T4-15          AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),"CURRENT_FACTS_RELEASE");
assert(facts.includes("Next Gate                       Track 05 curriculum planning"),"CURRENT_FACTS_NEXT");
assert(status.includes("Track 04 Formal Curriculum               T4-01～T4-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS"),"PROJECT_STATUS_RELEASE");
assert(status.includes("Track 04 Runtime                         15 LESSONS PROVISIONED / ACCEPTANCE PASS"),"PROJECT_STATUS_RUNTIME");
assert(status.includes("Track 04 Learning Map                    15 LESSON DIRECTORY / ALL AVAILABLE"),"PROJECT_STATUS_MAP");
const factSnapshot=facts.split("## 1.")[0]??facts; const statusSnapshot=status.split("## 当前系统健康")[0]??status; const ownerStatus=owner.split("\n").slice(0,20).join("\n");
assert(!factSnapshot.includes("PENDING")&&!statusSnapshot.includes("COMING SOON")&&!ownerStatus.includes("PENDING"),"TRACK04_CURRENT_STATE_MUST_BE_FINAL");
console.log("TRACK04_CONTEXT_OWNER=PASS");
console.log("TRACK04_15_KEEP=PASS");
console.log("TRACK04_SIX_STEP_AUDIT=PASS");
console.log("TRACK04_STAGE_MAPPING=PASS");
console.log("TRACK04_LEARNER_STAGE_DISPLAY_RULE=PASS");
console.log("TRACK04_RUNTIME_COMPLETE=PASS");
console.log("TRACK04_CURRENT_STATE_CLEAN=PASS");
