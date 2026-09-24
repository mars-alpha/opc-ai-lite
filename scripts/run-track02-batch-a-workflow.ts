import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";
import { loadCourseProductionRuleSources, nextCourseProductionStage } from "../lib/learning/course-production-orchestrator";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track02BatchADrafts } from "../fixtures/course-builder/track02-batch-a";

const contextPaths = [
  "docs/CURRENT_SYSTEM_FACTS.md",
  "docs/learning/TRACK02_CATALOG_CONTEXT_V1.md",
  "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
  "docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md",
  "docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md"
] as const;

const rules = loadCourseProductionRuleSources((source) => fs.readFileSync(source, "utf8"));
if (Object.keys(rules).length !== COURSE_PRODUCTION_RULE_SOURCES.length) {
  throw new Error("TRACK02_BATCH_A_RULE_SOURCE_LOAD_FAILED");
}

const context = Object.fromEntries(
  contextPaths.map((path) => {
    const value = fs.readFileSync(path, "utf8");
    if (!value.trim()) throw new Error("TRACK02_BATCH_A_CONTEXT_EMPTY:" + path);
    return [path, value];
  })
);

if (
  !context["docs/CURRENT_SYSTEM_FACTS.md"].includes(
    "BATCH_A_LESSONSPEC_REGISTERED / RUNTIME_PROVISIONING_PENDING"
  )
) {
  throw new Error("TRACK02_BATCH_A_CURRENT_FACT_NOT_READY");
}
if (!context["docs/learning/TRACK02_CATALOG_CONTEXT_V1.md"].includes("DIRECTORY_APPROVED_V1 / BATCH_A_BRIEF_READY_V1")) {
  throw new Error("TRACK02_BATCH_A_OWNER_NOT_READY");
}
if (!context["docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md"].includes("BRIEF_READY_V1 / COURSE_BUILDER_PENDING")) {
  throw new Error("TRACK02_BATCH_A_FORMAL_BRIEF_NOT_READY");
}

const preBuildStage = nextCourseProductionStage({
  ruleSourcesLoaded: [...COURSE_PRODUCTION_RULE_SOURCES],
  groundingReady: true,
  courseContextReady: true,
  formalBriefReady: true,
  draftReady: false,
  deterministicValidation: "PENDING",
  humanReview: "PENDING",
  lessonSpecRegistered: false,
  runtimeProvisioned: false,
  runtimeAcceptance: "PENDING",
  available: false
});
if (preBuildStage !== "RUN_COURSE_BUILDER") {
  throw new Error("TRACK02_BATCH_A_WORKFLOW_DID_NOT_REACH_COURSE_BUILDER:" + preBuildStage);
}

const packets = track02BatchADrafts.map((draft, index) =>
  createCourseBuilderReviewPacket(
    draft,
    new Date("2026-09-24T06:" + String(index).padStart(2, "0") + ":00.000Z"),
    CURRENT_COURSE_BUILDER_SKILL.version
  )
);

if (packets.length !== 3 || packets.some((packet) => packet.status !== "PENDING_REVIEW")) {
  throw new Error("TRACK02_BATCH_A_REVIEW_PACKET_GATE_INVALID");
}
if (
  packets.some(
    (packet) =>
      packet.validation.schema !== "PASS" ||
      packet.validation.rules !== "PASS" ||
      packet.validation.warnings.length > 0
  )
) {
  throw new Error("TRACK02_BATCH_A_DETERMINISTIC_VALIDATION_FAILED");
}

const postRegistrationStage = nextCourseProductionStage({
  ruleSourcesLoaded: [...COURSE_PRODUCTION_RULE_SOURCES],
  groundingReady: true,
  courseContextReady: true,
  formalBriefReady: true,
  draftReady: true,
  deterministicValidation: "PASS",
  humanReview: "PASS",
  lessonSpecRegistered: true,
  runtimeProvisioned: false,
  runtimeAcceptance: "PENDING",
  available: false
});
if (postRegistrationStage !== "PROVISION_RUNTIME") {
  throw new Error("TRACK02_BATCH_A_MUST_ADVANCE_TO_RUNTIME_PROVISION:" + postRegistrationStage);
}

console.log("TRACK02_BATCH_A_WORKFLOW_RULES_LOADED=PASS");
console.log("TRACK02_BATCH_A_CONTEXT_RESOLVED=PASS");
console.log("TRACK02_BATCH_A_FORMAL_BRIEF_RESOLVED=PASS");
console.log("TRACK02_BATCH_A_CURRENT_SKILL=" + CURRENT_COURSE_BUILDER_SKILL.version);
console.log("TRACK02_BATCH_A_COURSE_BUILDER_GENERATION=PASS");
console.log("TRACK02_BATCH_A_DETERMINISTIC_VALIDATION=PASS");
console.log("TRACK02_BATCH_A_HUMAN_REVIEW=PASS");
console.log("TRACK02_BATCH_A_LESSONSPEC_REGISTERED=PASS");
console.log("TRACK02_BATCH_A_NEXT_STAGE_PROVISION_RUNTIME=PASS");
