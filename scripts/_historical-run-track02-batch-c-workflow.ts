import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";
import { loadCourseProductionRuleSources, nextCourseProductionStage } from "../lib/learning/course-production-orchestrator";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track02BatchCDrafts } from "../fixtures/course-builder/track02-batch-c";

const contextPaths = [
  "docs/CURRENT_SYSTEM_FACTS.md",
  "docs/learning/TRACK02_CATALOG_CONTEXT_V1.md",
  "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
  "docs/learning/TRACK02_BATCH_C_T2_07_T2_09_FORMAL_BRIEFS_V1.md",
  "docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md"
] as const;

const rules = loadCourseProductionRuleSources((source) => fs.readFileSync(source, "utf8"));
if (Object.keys(rules).length !== COURSE_PRODUCTION_RULE_SOURCES.length) throw new Error("C_RULES_MISSING");
const context = Object.fromEntries(contextPaths.map((path) => [path, fs.readFileSync(path, "utf8")]));
if (contextPaths.some((path) => !context[path]?.trim())) throw new Error("C_CONTEXT_MISSING");
if (!context["docs/CURRENT_SYSTEM_FACTS.md"].includes("T2-07～T2-09                    PREVIEW_READY / DETERMINISTIC_PASS / HUMAN_REVIEW_PENDING")) throw new Error("C_CURRENT_BATCH_GATE_MISSING");
if (!context["docs/CURRENT_SYSTEM_FACTS.md"].includes("T2-10～T2-15                    DIRECTORY_APPROVED / COMING_SOON")) throw new Error("C_LATER_RUNTIME_BOUNDARY_MISSING");
if (!context["docs/learning/TRACK02_CATALOG_CONTEXT_V1.md"].includes("DIRECTORY_APPROVED_V1")) throw new Error("C_DIRECTORY_OWNER_MISSING");
if (!context["docs/learning/TRACK02_BATCH_C_T2_07_T2_09_FORMAL_BRIEFS_V1.md"].includes("## T2-09")) throw new Error("C_BRIEF_INCOMPLETE");

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

const before = nextCourseProductionStage({...base, draftReady: false, deterministicValidation: "PENDING", humanReview: "PENDING"});
const afterDraft = nextCourseProductionStage({...base, draftReady: true, deterministicValidation: "PENDING", humanReview: "PENDING"});
if (before !== "RUN_COURSE_BUILDER" || afterDraft !== "RUN_DETERMINISTIC_VALIDATORS") throw new Error("C_STAGE_SEQUENCE_INVALID");

const packets = track02BatchCDrafts.map((draft, i) =>
  createCourseBuilderReviewPacket(draft, new Date("2026-09-25T05:2" + i + ":00.000Z"), CURRENT_COURSE_BUILDER_SKILL.version)
);
if (packets.length !== 3 || packets.some((packet) => packet.status !== "PENDING_REVIEW" || packet.validation.schema !== "PASS" || packet.validation.rules !== "PASS" || packet.validation.warnings.length)) {
  throw new Error("C_DETERMINISTIC_VALIDATION_FAILED");
}

const next = nextCourseProductionStage({...base, draftReady: true, deterministicValidation: "PASS", humanReview: "PENDING"});
if (next !== "HUMAN_REVIEW_GATE") throw new Error("C_HUMAN_REVIEW_GATE_NOT_REACHED");

console.log("TRACK02_BATCH_C_RULES_CONTEXT_BRIEFS=PASS");
console.log("TRACK02_BATCH_C_CURRENT_SKILL=" + CURRENT_COURSE_BUILDER_SKILL.version);
console.log("TRACK02_BATCH_C_THREE_REVIEW_PACKETS=PASS");
console.log("TRACK02_BATCH_C_DETERMINISTIC_VALIDATION=PASS");
console.log("TRACK02_BATCH_C_NEXT_STAGE=" + next);
console.log("TRACK02_BATCH_C_HUMAN_REVIEW=PENDING");
console.log("TRACK02_BATCH_C_RUNTIME_PROVISIONING=NOT_STARTED");
console.log("TRACK02_BATCH_C_AVAILABLE=NO");
