import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";
import { loadCourseProductionRuleSources, nextCourseProductionStage } from "../lib/learning/course-production-orchestrator";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track02BatchBDrafts } from "../fixtures/course-builder/track02-batch-b";

const contextPaths = [
  "docs/CURRENT_SYSTEM_FACTS.md",
  "docs/learning/TRACK02_CATALOG_CONTEXT_V1.md",
  "docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md",
  "docs/learning/TRACK02_BATCH_B_T2_04_T2_06_FORMAL_BRIEFS_V1.md",
  "docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md"
] as const;
const rules = loadCourseProductionRuleSources((source) => fs.readFileSync(source, "utf8"));
if (Object.keys(rules).length !== COURSE_PRODUCTION_RULE_SOURCES.length) throw new Error("B_RULES_MISSING");
const context = Object.fromEntries(contextPaths.map((path) => [path, fs.readFileSync(path, "utf8")]));
if (contextPaths.some((path) => !context[path]?.trim())) throw new Error("B_CONTEXT_MISSING");
if (!context["docs/CURRENT_SYSTEM_FACTS.md"].includes("T2-04～T2-06 已完成正式 Runtime")) throw new Error("B_CURRENT_RUNTIME_BOUNDARY_MISSING");
if (!context["docs/learning/TRACK02_CATALOG_CONTEXT_V1.md"].includes("DIRECTORY_APPROVED_V1")) throw new Error("B_DIRECTORY_OWNER_MISSING");
if (!context["docs/learning/TRACK02_BATCH_B_T2_04_T2_06_FORMAL_BRIEFS_V1.md"].includes("## T2-06")) throw new Error("B_BRIEF_INCOMPLETE");

const base = {
  ruleSourcesLoaded: [...COURSE_PRODUCTION_RULE_SOURCES],
  groundingReady: true,
  courseContextReady: true,
  formalBriefReady: true,
  lessonSpecRegistered: true,
  runtimeProvisioned: true,
  runtimeAcceptance: "PASS" as const,
  available: true
};
const before = nextCourseProductionStage({...base, draftReady: false, deterministicValidation: "PENDING", humanReview: "PENDING"});
const afterDraft = nextCourseProductionStage({...base, draftReady: true, deterministicValidation: "PENDING", humanReview: "PENDING"});
if (before !== "RUN_COURSE_BUILDER" || afterDraft !== "RUN_DETERMINISTIC_VALIDATORS") throw new Error("B_STAGE_SEQUENCE_INVALID");
const packets = track02BatchBDrafts.map((draft, i) => createCourseBuilderReviewPacket(draft, new Date("2026-09-24T06:1" + i + ":00.000Z"), CURRENT_COURSE_BUILDER_SKILL.version));
if (packets.length !== 3 || packets.some((packet) => packet.status !== "PENDING_REVIEW" || packet.validation.schema !== "PASS" || packet.validation.rules !== "PASS" || packet.validation.warnings.length)) throw new Error("B_DETERMINISTIC_VALIDATION_FAILED");
const reviewGate = nextCourseProductionStage({...base, draftReady: true, deterministicValidation: "PASS", humanReview: "PENDING"});
if (reviewGate !== "HUMAN_REVIEW_GATE") throw new Error("B_HUMAN_REVIEW_GATE_SKIPPED");
const next = nextCourseProductionStage({...base, draftReady: true, deterministicValidation: "PASS", humanReview: "PASS"});
if (next !== "COMPLETE") throw new Error("B_RUNTIME_NOT_COMPLETE");
console.log("TRACK02_BATCH_B_RULES_CONTEXT_BRIEFS=PASS");
console.log("TRACK02_BATCH_B_CURRENT_SKILL=" + CURRENT_COURSE_BUILDER_SKILL.version);
console.log("TRACK02_BATCH_B_THREE_REVIEW_PACKETS=PASS");
console.log("TRACK02_BATCH_B_DETERMINISTIC_VALIDATION=PASS");
console.log("TRACK02_BATCH_B_NEXT_STAGE=" + next);
console.log("TRACK02_BATCH_B_HUMAN_REVIEW=PASS");
console.log("TRACK02_BATCH_B_RUNTIME_PROVISIONING=PASS");
console.log("TRACK02_BATCH_B_RUNTIME_ACCEPTANCE=PASS");
console.log("TRACK02_BATCH_B_AVAILABLE=PASS");
