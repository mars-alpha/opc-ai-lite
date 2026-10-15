import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("ADAPTER_QUALIFICATION_CONTRACT_FAILED:" + code);
  console.log(code + "=PASS");
}

const core = fs.readFileSync("lib/server/content/adapter-qualification.ts", "utf8");
const sourceQualification = fs.readFileSync("lib/server/content/source-qualification.ts", "utf8");
const portfolio = fs.readFileSync("lib/server/content/source-portfolio-runtime.ts", "utf8");
const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");

assert(core.includes("ADAPTER_QUALIFICATION_REQUIRED_RUNS = 5"), "REQUIRES_FIVE_SESSION_RUNS");
assert(core.includes("ADAPTER_QUALIFICATION_REQUIRED_SUCCESSES = 4"), "REQUIRES_FOUR_SUCCESSES");
assert(core.includes("collectionRunKind === runKind"), "SESSION_RUN_KIND_ISOLATION");
assert(core.includes('metadata.collectionOrigin === "SYSTEM"'), "SYSTEM_PROVENANCE_REQUIRED");
assert(core.includes("publishedTimeCoverage >= 0.8"), "TIME_SEMANTICS_THRESHOLD");
assert(core.includes("dedupeObserved"), "DEDUPE_EVIDENCE_REQUIRED");
assert(core.includes("qualificationCandidateKeys"), "QUALIFICATION_ONLY_CANDIDATE_EVIDENCE");
assert(core.includes("qualificationPublishedCoverage"), "QUALIFICATION_ONLY_TIME_EVIDENCE");
assert(core.includes("persistAdapterQualificationResult"), "QUALIFICATION_METADATA_PERSISTENCE");
assert(core.includes("sourceQualification:"), "SOURCE_QUALIFICATION_NAMESPACE_REUSED");
assert(!core.includes("content_source_qualifications"), "NO_SECOND_QUALIFICATION_TABLE");
assert(portfolio.includes("qualificationOnly"), "PORTFOLIO_QUALIFICATION_MODE");
assert(portfolio.includes("qualificationRunKind"), "PORTFOLIO_QUALIFICATION_RUN_KIND");
assert(portfolio.includes("runSourceCollection"), "PORTFOLIO_USES_UNIFIED_COLLECTION_RUNNER");
assert(runner.includes('startsWith("SOURCE_QUALIFICATION:")'), "GENERIC_QUALIFICATION_NAMESPACE");
assert(runner.includes("qualificationOnly: true") || runner.includes("input.qualificationOnly === true"), "QUALIFICATION_NO_EVENT_MUTATION_PATH");
assert(sourceQualification.includes("AUTO_READY"), "QUALIFICATION_CORE_REUSED");

console.log("ADAPTER_QUALIFICATION_CONTRACT=PASS");