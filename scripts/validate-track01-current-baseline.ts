import fs from "node:fs";
import {
  getTrack01Phase1RuntimePresentation,
  track01FormalLessonSpecs
} from "../lib/learning/track01-phase1-runtime";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("TRACK01_BASELINE_FAILED:" + code);
}

for (const retired of [
  "docs/learning/FIVE_TRACK_CORE_CURRICULUM_AUDIT_V1.md",
  "docs/learning/TRACK01_CANONICAL_REALIGNMENT_V1.md",
  "docs/learning/FOUNDATION_CATALOG_METADATA_V1.md"
]) {
  assert(!fs.existsSync(retired), "RETIRED_CURRICULUM_REINTRODUCED:" + retired);
}

const catalogOwner = fs.readFileSync("docs/learning/TRACK01_CATALOG_METADATA_V2.md", "utf8");
const catalogCode = fs.readFileSync("lib/learning/foundation-catalog.ts", "utf8");
const entry = fs.readFileSync("docs/learning/COURSE_BUILD_START_HERE.md", "utf8");
const runtime = fs.readFileSync("lib/learning/track01-phase1-runtime.ts", "utf8");
const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
const runtimeResult = fs.readFileSync("docs/task-results/TRACK01-T1-09-RUNTIME-001.md", "utf8");
const t110RuntimeResult = fs.readFileSync("docs/task-results/TRACK01-T1-10-RUNTIME-001.md", "utf8");
const t111T120RuntimeResult = fs.readFileSync("docs/task-results/TRACK01-T11-T20-RUNTIME-001.md", "utf8");

assert(catalogOwner.includes("Curriculum owner: **this file**"), "CURRENT_OWNER_MARKER_MISSING");
assert(catalogOwner.includes("| 9 | T1-09 | Knowledge Base 与 Source of Truth"), "T109_CANONICAL_IDENTITY_DRIFT");
assert(catalogOwner.includes("| 10 | T1-10 | Search 与 RAG"), "T110_CANONICAL_IDENTITY_DRIFT");
assert(entry.includes("TRACK01_CATALOG_METADATA_V2.md`（当前 Track 01 唯一目录 owner）"), "COURSE_ENTRY_OWNER_MISSING");

assert(catalogCode.includes('lessonId:"t1-09-knowledge-source"'), "T109_CATALOG_ENTRY_MISSING");
assert(catalogCode.includes('curriculumStatus: "AVAILABLE" as const'), "TRACK01_AVAILABLE_CURRICULUM_STATUS_MISSING");
assert(catalogCode.includes('availability: "AVAILABLE" as const'), "TRACK01_AVAILABLE_STATUS_MISSING");
assert(catalogCode.includes('runtimeAvailable("t1-09-knowledge-source")'), "T109_RUNTIME_MAPPING_MISSING");

assert(runtime.includes("track01T109Draft"), "T109_FORMAL_RUNTIME_MISSING");
assert(runtime.includes("track01T109Spec"), "T109_SPEC_REGISTRY_MISSING");
assert(runtime.includes("track01T109RuntimeDefinition"), "T109_RUNTIME_DEFINITION_MISSING");
assert(fs.existsSync("docs/task-results/TRACK01-T1-09-HUMAN-REVIEW-001.md"), "T109_HUMAN_REVIEW_RESULT_MISSING");
const humanReview = fs.readFileSync("docs/task-results/TRACK01-T1-09-HUMAN-REVIEW-001.md", "utf8");
assert(humanReview.includes("HUMAN_REVIEW_PASS"), "T109_HUMAN_REVIEW_PASS_MISSING");
assert(catalogCode.includes('runtimeAvailable("t1-09-knowledge-source")'), "T109_AVAILABLE_FACT_MISSING");
assert(runtimeResult.includes("AVAILABLE"), "T109_AVAILABLE_RESULT_MISSING");
assert(runtimeResult.includes("T1_09_RUNTIME_ACCEPTANCE=PASS"), "T109_RUNTIME_ACCEPTANCE_EVIDENCE_MISSING");
assert(fs.existsSync("scripts/accept-track01-t109-runtime.ts"), "T109_ACCEPTANCE_SCRIPT_MISSING");

assert(catalogCode.includes('lessonId:"t1-10-search-rag"'), "T110_CATALOG_ENTRY_MISSING");
assert(catalogCode.includes('runtimeAvailable("t1-10-search-rag")'), "T110_RUNTIME_MAPPING_MISSING");
assert(runtime.includes("track01T110Draft"), "T110_FORMAL_RUNTIME_MISSING");
assert(runtime.includes("track01T110Spec"), "T110_SPEC_REGISTRY_MISSING");
assert(runtime.includes("track01T110RuntimeDefinition"), "T110_RUNTIME_DEFINITION_MISSING");
assert(fs.existsSync("docs/task-results/TRACK01-T1-10-HUMAN-REVIEW-001.md"), "T110_HUMAN_REVIEW_RESULT_MISSING");
const t110HumanReview = fs.readFileSync("docs/task-results/TRACK01-T1-10-HUMAN-REVIEW-001.md", "utf8");
assert(t110HumanReview.includes("HUMAN_REVIEW_PASS"), "T110_HUMAN_REVIEW_PASS_MISSING");
assert(t110RuntimeResult.includes("T1_10_RUNTIME_ACCEPTANCE=PASS"), "T110_RUNTIME_ACCEPTANCE_EVIDENCE_MISSING");
assert(fs.existsSync("scripts/accept-track01-t110-runtime.ts"), "T110_ACCEPTANCE_SCRIPT_MISSING");
assert(facts.includes("T1-01～T1-10"), "T110_CURRENT_FACT_MISSING");

const runtimeMappings = catalogCode.match(/\.\.\.runtimeAvailable\("t1-[^"]+"\)/g) ?? [];
assert(runtimeMappings.length === 20, "TRACK01_TWENTY_RUNTIME_MAPPINGS_REQUIRED");
assert(!catalogCode.includes("...planned"), "TRACK01_STALE_PLANNED_STATUS_PRESENT");
assert(!catalogCode.includes("phase1Preview"), "TRACK01_STALE_RUNTIME_PREVIEW_PRESENT");
assert(facts.includes("T1-11～T1-20                    AVAILABLE / FORMAL_RUNTIME"), "T111_T120_CURRENT_FACT_MISSING");
assert(t111T120RuntimeResult.includes("T1_11_T1_20_RUNTIME_ACCEPTANCE=PASS"), "T111_T120_RUNTIME_ACCEPTANCE_EVIDENCE_MISSING");
assert(t111T120RuntimeResult.includes("AVAILABLE"), "T111_T120_AVAILABLE_RESULT_MISSING");

for (const spec of track01FormalLessonSpecs) {
  const presentation = getTrack01Phase1RuntimePresentation("foundation-ai", spec.lessonId);
  assert(Boolean(presentation), "STEP5_PRESENTATION_MISSING:" + spec.lessonId);
  assert(Boolean(presentation?.reviewItems.length), "STEP5_REVIEW_CARDS_MISSING:" + spec.lessonId);
  assert(
    presentation?.reviewLabels?.primary === "AI适合做什么" &&
      presentation?.reviewLabels?.secondary === "AI不应该替你做什么",
    "STEP5_FIXED_REVIEW_DIRECTIONS_REQUIRED:" + spec.lessonId
  );
  assert(
    presentation?.reviewItems.every((item) => {
      const parts = item.split("｜");
      if (parts.length !== 2) return false;
      const [fitAnswer, boundaryAnswer] = parts;
      return Boolean(
        fitAnswer?.trim().length >= 12 &&
          boundaryAnswer?.trim().length >= 12 &&
          boundaryAnswer.trim().startsWith("不要")
      );
    }),
    "STEP5_REVIEW_BOTH_DIRECTIONS_CONCRETE_REQUIRED:" + spec.lessonId
  );
  assert(
    Boolean(presentation?.knowledgeDepth.review.length),
    "STEP5_REVIEW_SUPPLEMENT_REQUIRED:" + spec.lessonId
  );
  assert(
    presentation?.knowledgeDepth.review.every((item) => Boolean(item.title?.trim() && item.text?.trim())),
    "STEP5_REVIEW_SUPPLEMENT_CONTENT_REQUIRED:" + spec.lessonId
  );
}

console.log("TRACK01_CURRENT_OWNER=PASS");
console.log("TRACK01_T109_T110_IDENTITY=PASS");
console.log("TRACK01_RETIRED_CURRICULUM_ABSENT=PASS");
console.log("TRACK01_T109_AVAILABLE_BOUNDARY=PASS");
console.log("TRACK01_T110_AVAILABLE_BOUNDARY=PASS");
console.log("TRACK01_TWENTY_LEARNING_PATH_RUNTIME_MAPPINGS=PASS");
console.log("TRACK01_T11_T20_AVAILABLE_BOUNDARY=PASS");
console.log("TRACK01_STEP5_REVIEW_DESCRIPTION_LAYER=PASS");
