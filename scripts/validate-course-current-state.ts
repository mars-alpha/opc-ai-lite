import fs from "node:fs";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COURSE_CURRENT_STATE_FAILED:" + code);
}

const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
const entry = fs.readFileSync("docs/learning/COURSE_BUILD_START_HERE.md", "utf8");
const projectStatus = fs.readFileSync("PROJECT_STATUS.md", "utf8");
const catalog = fs.readFileSync("lib/learning/foundation-catalog.ts", "utf8");
const runtime = fs.readFileSync("lib/learning/track01-phase1-runtime.ts", "utf8");

assert(facts.includes("## 0. Current Course Production Snapshot"), "CURRENT_SNAPSHOT_MISSING");
assert(
  facts.includes("T1-11～T1-20                    AVAILABLE / FORMAL_RUNTIME"),
  "T11_T20_CURRENT_STATE_MISSING"
);
assert(facts.includes("Next Gate                       Track 04 planning / Formal Curriculum Context"), "TRACK04_NEXT_GATE_MISSING");
assert(!facts.includes("T1-11～T1-20 继续保持冻结目录规划状态"), "STALE_T11_T20_FROZEN_STATE_PRESENT");
assert(
  !facts.includes("T1-11～T1-20                     FORMAL_BRIEF_BATCH_READY / DRAFT_PRODUCTION_READY"),
  "STALE_T11_T20_BRIEF_READY_STATE_PRESENT"
);
assert(
  projectStatus.includes("Track 01 Formal Curriculum               T1-01～T1-20 AVAILABLE / FORMAL_RUNTIME"),
  "PROJECT_STATUS_RUNTIME_AVAILABLE_MISSING"
);
assert(
  facts.includes("Track 02 Context                 T2-01～T2-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),
  "TRACK02_CURRENT_STATE_MISSING"
);
assert(
  facts.includes("T2-01～T2-15                    AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS"),
  "TRACK02_FULL_CURRENT_STATE_MISSING"
);
assert(
  facts.includes("Track 03 canonical path          T3-01～T3-15 / 6 Phases / DIRECTORY_APPROVED_V1") &&
    projectStatus.includes("Track 03 Directory                       T3-01～T3-15 DIRECTORY_APPROVED_V1 / 15 KEEP"),
  "TRACK03_DIRECTORY_CURRENT_STATE_MISSING"
);
assert(
  facts.includes("Track 03 T3-01～T3-15          AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS") &&
    projectStatus.includes("Track 03 Formal Curriculum               T3-01～T3-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS") &&
    projectStatus.includes("Track 03 Runtime                         15 LESSONS PROVISIONED / ACCEPTANCE PASS") &&
    projectStatus.includes("Track 03 Learning Map                    15 LESSON DIRECTORY / ALL AVAILABLE") &&
    projectStatus.includes("CURRENT                                  TRACK04 / PLANNING"),
  "TRACK03_COMPLETE_CURRENT_STATE_MISSING"
);
assert(
  projectStatus.includes("Track 02 Batch A                         T2-01～T2-03 AVAILABLE / FORMAL_RUNTIME") &&
    projectStatus.includes("Track 02 Batch A Runtime                 PROVISIONED / ACCEPTANCE PASS"),
  "PROJECT_STATUS_TRACK02_BATCH_A_MISSING"
);
assert(
  projectStatus.includes("Track 02 Batch C                         T2-07～T2-09 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS") &&
    projectStatus.includes("Track 02 Batch C Runtime                 PROVISIONED / ACCEPTANCE PASS"),
  "TRACK02_BATCH_C_AVAILABLE_MISSING"
);
assert(
  facts.includes("T2-01～T2-15                    AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS") &&
    projectStatus.includes("Track 02 Batch D                         T2-10～T2-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS") &&
    projectStatus.includes("Track 02 Batch D Runtime                 PROVISIONED / ACCEPTANCE PASS"),
  "TRACK02_BATCH_D_AVAILABLE_MISSING"
);
assert(
  (catalog.match(/\.\.\.runtimeAvailable\("t1-[^"]+"\)/g) ?? []).length === 20,
  "TRACK01_TWENTY_RUNTIME_MAPPINGS_REQUIRED"
);
assert(
  runtime.includes("track01FormalLessonSpecs"),
  "TRACK01_FORMAL_RUNTIME_REGISTRY_MISSING"
);
assert(
  !COURSE_PRODUCTION_RULE_SOURCES.some(
    (source) =>
      source === ("docs/CURRENT_SYSTEM_FACTS.md" as never) ||
      source === ("docs/learning/COURSE_BUILD_START_HERE.md" as never)
  ),
  "BOOTSTRAP_OR_CURRENT_FACTS_MUST_NOT_BE_RULE_SOURCE"
);
assert(entry.includes("历史 task-result / legacy fixture / 旧测试课程"), "ENTRY_HISTORY_PRIORITY_RULE_MISSING");

console.log("COURSE_CURRENT_STATE_SNAPSHOT=PASS");
console.log("COURSE_CURRENT_STATE_T11_T20=PASS");
console.log("COURSE_CURRENT_STATE_T11_T20_AVAILABLE=PASS");
console.log("COURSE_CURRENT_STATE_TRACK01_RUNTIME_COMPLETE=PASS");
console.log("COURSE_CURRENT_STATE_TRACK02_CONTEXT=PASS");
console.log("COURSE_CURRENT_STATE_TRACK02_BATCH_B_AVAILABLE=PASS");
console.log("COURSE_CURRENT_STATE_TRACK02_BATCH_C_AVAILABLE=PASS");
console.log("COURSE_CURRENT_STATE_TRACK02_BATCH_D_AVAILABLE=PASS");
console.log("COURSE_CURRENT_STATE_TRACK03_DIRECTORY_APPROVED=PASS");
console.log("COURSE_CURRENT_STATE_TRACK03_COMPLETE=PASS");
console.log("COURSE_CURRENT_STATE_RULE_OWNER_SEPARATION=PASS");
console.log("COURSE_CURRENT_STATE_NO_HISTORICAL_RESULT_DEPENDENCY=PASS");
