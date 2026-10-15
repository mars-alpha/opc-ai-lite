import { classifyEventExpansionCoverageGap } from "../lib/server/content/event-expansion-coverage-gap";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_EXPANSION_COVERAGE_GAP_017_FAILED:" + code);
}

assert(classifyEventExpansionCoverageGap({
  creatorSearchEligible: true,
  referenceCount: 1,
  recentRuns: []
}).category === "COVERED", "COVERED");

assert(classifyEventExpansionCoverageGap({
  creatorSearchEligible: false,
  referenceCount: 0,
  recentRuns: []
}).category === "NOT_CREATOR_SEARCH_ELIGIBLE", "INELIGIBLE");

assert(classifyEventExpansionCoverageGap({
  creatorSearchEligible: true,
  referenceCount: 0,
  recentRuns: [{ status: "SUCCEEDED", receivedCount: 18, provider: "BILIBILI_SEARCH" }]
}).category === "PRECISION_FILTER_GAP", "PRECISION_FILTER");

assert(classifyEventExpansionCoverageGap({
  creatorSearchEligible: true,
  referenceCount: 0,
  recentRuns: [{ status: "SUCCEEDED", receivedCount: 0, provider: "BILIBILI_SEARCH" }]
}).category === "SOURCE_RESULT_GAP", "SOURCE_RESULT");

assert(classifyEventExpansionCoverageGap({
  creatorSearchEligible: true,
  referenceCount: 0,
  recentRuns: [{ status: "FAILED", receivedCount: 0, provider: "BILIBILI_SEARCH" }]
}).category === "RUN_FAILURE_GAP", "RUN_FAILURE");

assert(classifyEventExpansionCoverageGap({
  creatorSearchEligible: true,
  referenceCount: 0,
  recentRuns: []
}).category === "NOT_RUN", "NOT_RUN");

console.log("EVENT_EXPANSION_COVERAGE_GAP_017_CLASSIFIER=PASS");
console.log("EVENT_EXPANSION_COVERAGE_GAP_017_PRECISION_FIRST=PASS");
console.log("EVENT_EXPANSION_COVERAGE_GAP_017_NO_FORCED_SOURCE_EXPANSION=PASS");
