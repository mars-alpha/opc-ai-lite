import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";
import { loadCourseProductionRuleSources } from "../lib/learning/course-production-orchestrator";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track01T111T120Drafts } from "../fixtures/course-builder/track01-t111-t120";

const rules = loadCourseProductionRuleSources((source) => fs.readFileSync(source, "utf8"));
if (Object.keys(rules).length !== COURSE_PRODUCTION_RULE_SOURCES.length) {
  throw new Error("BATCH_RULE_SOURCE_LOAD_FAILED");
}
if (CURRENT_COURSE_BUILDER_SKILL.version !== "1.0.0") {
  throw new Error("CURRENT_COURSE_BUILDER_SKILL_V1_REQUIRED");
}

const packets = track01T111T120Drafts.map((draft, index) =>
  createCourseBuilderReviewPacket(
    draft,
    new Date("2026-09-23T13:" + String(index).padStart(2, "0") + ":00.000Z"),
    CURRENT_COURSE_BUILDER_SKILL.version
  )
);

const result = packets.map((packet) => {
  if (packet.output.mode !== "BUILD") throw new Error("BUILD_REQUIRED");
  return {
    lessonId: packet.output.lessonSpec.lessonId,
    title: packet.output.lessonSpec.title,
    skillVersion: packet.skill.version,
    validation: packet.validation,
    status: packet.status,
    nextGate: "HUMAN_REVIEW_GATE"
  };
});

fs.writeFileSync(
  "docs/task-results/TRACK01-T11-T20-WORKFLOW-BATCH-001.json",
  JSON.stringify({
    workflow: "course-production-workflow@1.0.0",
    skill: CURRENT_COURSE_BUILDER_SKILL.version,
    scope: "T1-11..T1-20",
    result
  }, null, 2) + "\n",
  "utf8"
);

console.log("TRACK01_T11_T20_WORKFLOW_RULES_LOADED=PASS");
console.log("TRACK01_T11_T20_WORKFLOW_BATCH_GENERATION=PASS");
console.log("TRACK01_T11_T20_WORKFLOW_STOPPED_AT_HUMAN_REVIEW=PASS");
