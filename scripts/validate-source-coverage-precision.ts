import { RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";
import {
  SOURCE_COVERAGE_MINIMUMS,
  buildSourceCoverageMatrix,
  resolvePortfolioCoverage
} from "../lib/server/content/source-coverage-matrix";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_COVERAGE_PRECISION_FAILED:" + code);
  console.log(code + "=PASS");
}

const matrix = buildSourceCoverageMatrix();

for (const [key, minimum] of Object.entries(SOURCE_COVERAGE_MINIMUMS.roles)) {
  assert((matrix.roleCoverage[key] ?? 0) >= minimum, "ROLE_" + key + "_MINIMUM");
}
for (const [key, minimum] of Object.entries(SOURCE_COVERAGE_MINIMUMS.evidence)) {
  assert((matrix.evidenceCoverage[key] ?? 0) >= minimum, "EVIDENCE_" + key + "_MINIMUM");
}
for (const [key, minimum] of Object.entries(SOURCE_COVERAGE_MINIMUMS.languages)) {
  assert((matrix.languageCoverage[key] ?? 0) >= minimum, "LANGUAGE_" + key + "_MINIMUM");
}

const byKey = new Map(RADAR_SOURCE_PORTFOLIO.map((entry) => [entry.key, entry]));
for (const key of ["opml_baoyu", "opml_simon_willison"]) {
  const source = byKey.get(key);
  assert(Boolean(source), "SOURCE_PRESENT_" + key);
  assert(resolvePortfolioCoverage(source!).sourceUniverseRole === "CREATOR", "CREATOR_ROLE_" + key);
}
for (const key of ["ai_hot", "product_hunt"]) {
  const source = byKey.get(key);
  assert(Boolean(source), "SOURCE_PRESENT_" + key);
  assert(
    resolvePortfolioCoverage(source!).sourceUniverseRole === "DISCOVERY_AGGREGATOR",
    "AGGREGATOR_ROLE_" + key
  );
}

const githubChangelog = byKey.get("official_github_changelog");
assert(Boolean(githubChangelog?.keywordPolicy?.mustIncludeAny?.length), "GITHUB_CHANGELOG_AI_GUARD_PRESENT");
assert(
  githubChangelog!.keywordPolicy!.mustIncludeAny!.includes("ai") &&
  githubChangelog!.keywordPolicy!.mustIncludeAny!.some((term) => ["copilot", "agent"].includes(term)),
  "GITHUB_CHANGELOG_AI_GUARD_SPECIFIC"
);

assert(matrix.gaps.length === 0, "CURRENT_COVERAGE_CONTRACT_SATISFIED");
assert(matrix.veryHighCostDefaultSources.length === 0, "NO_VERY_HIGH_COST_DEFAULT_SOURCE");
assert(matrix.lowMaintenanceSourceCount === matrix.totalSources, "ALL_DEFAULT_SOURCES_LOW_OR_MEDIUM_COST");

console.log(JSON.stringify({
  roleCoverage: matrix.roleCoverage,
  evidenceCoverage: matrix.evidenceCoverage,
  languageCoverage: matrix.languageCoverage,
  costCoverage: matrix.costCoverage,
  gaps: matrix.gaps
}, null, 2));
console.log("SOURCE_COVERAGE_PRECISION=PASS");
