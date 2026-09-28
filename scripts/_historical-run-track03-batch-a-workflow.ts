import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";
import {
  loadCourseProductionRuleSources,
  nextCourseProductionStage
} from "../lib/learning/course-production-orchestrator";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track03BatchADrafts } from "../fixtures/course-builder/track03-batch-a";

const contextPaths = [
  "docs/CURRENT_SYSTEM_FACTS.md",
  "docs/learning/TRACK03_CATALOG_CONTEXT_V1.md",
  "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
  "docs/learning/TRACK03_BATCH_A_T3_01_T3_03_FORMAL_BRIEFS_V1.md",
  "docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md"
] as const;

const rules = loadCourseProductionRuleSources((source) => fs.readFileSync(source, "utf8"));
if (Object.keys(rules).length !== COURSE_PRODUCTION_RULE_SOURCES.length) throw new Error("T3A_RULES_MISSING");

const context = Object.fromEntries(
  contextPaths.map((path) => [path, fs.readFileSync(path, "utf8")])
);
if (contextPaths.some((path) => !context[path]?.trim())) throw new Error("T3A_CONTEXT_MISSING");
if (!context["docs/CURRENT_SYSTEM_FACTS.md"].includes("Track 03 Batch A              PREVIEW_READY / DETERMINISTIC_PASS / HUMAN_REVIEW_PENDING")) throw new Error("T3A_CURRENT_BATCH_GATE_MISSING");
if (!context["docs/learning/TRACK03_CATALOG_CONTEXT_V1.md"].includes("BATCH_A_HUMAN_REVIEW_PENDING")) throw new Error("T3A_DIRECTORY_OWNER_GATE_MISSING");
if (!context["docs/learning/TRACK03_BATCH_A_T3_01_T3_03_FORMAL_BRIEFS_V1.md"].includes("# T3-03")) throw new Error("T3A_BRIEF_INCOMPLETE");

const base = {
  ruleSourcesLoaded: [...COURSE_PRODUCTION_RULE_SOURCES],
  groundingReady: true,
  courseContextReady: true,
  formalBriefReady: true,
  lessonSpecRegistered: false,
  runtimeProvisioned: false,
  runtimeAcceptance: "PENDING" as const,
  available: false
};

const before = nextCourseProductionStage({
  ...base,
  draftReady: false,
  deterministicValidation: "PENDING",
  humanReview: "PENDING"
});
const afterDraft = nextCourseProductionStage({
  ...base,
  draftReady: true,
  deterministicValidation: "PENDING",
  humanReview: "PENDING"
});
if (before !== "RUN_COURSE_BUILDER" || afterDraft !== "RUN_DETERMINISTIC_VALIDATORS") {
  throw new Error("T3A_STAGE_SEQUENCE_INVALID");
}

const packets = track03BatchADrafts.map((draft, index) =>
  createCourseBuilderReviewPacket(
    draft,
    new Date("2026-09-28T02:" + String(10 + index).padStart(2, "0") + ":00.000Z"),
    CURRENT_COURSE_BUILDER_SKILL.version
  )
);

if (
  packets.length !== 3 ||
  packets.some(
    (packet) =>
      packet.status !== "PENDING_REVIEW" ||
      packet.validation.schema !== "PASS" ||
      packet.validation.rules !== "PASS" ||
      packet.validation.warnings.length
  )
) {
  throw new Error("T3A_DETERMINISTIC_VALIDATION_FAILED");
}

const next = nextCourseProductionStage({
  ...base,
  draftReady: true,
  deterministicValidation: "PASS",
  humanReview: "PENDING"
});
if (next !== "HUMAN_REVIEW_GATE") throw new Error("T3A_HUMAN_REVIEW_GATE_NOT_REACHED");

console.log("TRACK03_BATCH_A_RULES_CONTEXT_BRIEFS=PASS");
console.log("TRACK03_BATCH_A_CURRENT_SKILL=" + CURRENT_COURSE_BUILDER_SKILL.version);
console.log("TRACK03_BATCH_A_THREE_REVIEW_PACKETS=PASS");
console.log("TRACK03_BATCH_A_DETERMINISTIC_VALIDATION=PASS");
console.log("TRACK03_BATCH_A_NEXT_STAGE=" + next);
console.log("TRACK03_BATCH_A_HUMAN_REVIEW=PENDING");
console.log("TRACK03_BATCH_A_RUNTIME_PROVISIONING=NOT_STARTED");
console.log("TRACK03_BATCH_A_AVAILABLE=NO");
