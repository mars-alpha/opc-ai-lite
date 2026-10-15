import path from "node:path";
import {
  FIXED_BENCHMARK_VERSION,
  GROUND_TRUTH_SCHEMA_VERSION,
  loadGroundTruthBenchmark
} from "../lib/content/ground-truth";
import { LABELING_GUIDE_VERSION } from "../lib/content/intelligence-policy";

const benchmarkPath = path.join(process.cwd(), "data/content/ground-truth/benchmark-v2.json");
const benchmark = loadGroundTruthBenchmark(benchmarkPath);

if (benchmark.labelingGuideVersion !== LABELING_GUIDE_VERSION) throw new Error("GROUND_TRUTH_LABELING_GUIDE_DRIFT");
if (benchmark.schemaVersion !== GROUND_TRUTH_SCHEMA_VERSION) throw new Error("GROUND_TRUTH_SCHEMA_DRIFT");
if (benchmark.benchmarkVersion !== FIXED_BENCHMARK_VERSION) throw new Error("GROUND_TRUTH_BENCHMARK_DRIFT");

const contentLabels = new Set(benchmark.eventCases.map((item) => item.contentLabel));
const dispositions = new Set(benchmark.eventCases.map((item) => item.expectedDisposition));
for (const required of ["AI_RELEVANT", "NOT_AI_RELEVANT", "LOW_VALUE"] as const) {
  if (!contentLabels.has(required)) throw new Error("GROUND_TRUTH_LABEL_COVERAGE_MISSING:" + required);
}
for (const required of ["OFFICIAL_NEWS", "UNVERIFIED", "IGNORE"] as const) {
  if (!dispositions.has(required)) throw new Error("GROUND_TRUTH_DISPOSITION_COVERAGE_MISSING:" + required);
}

const discoveryActual = new Set(benchmark.discoveryCases.map((item) => item.actualDecision));
const discoveryExpected = new Set(benchmark.discoveryCases.map((item) => item.expectedDecision));
for (const required of ["KEEP", "REJECT"] as const) {
  if (!discoveryActual.has(required)) throw new Error("GROUND_TRUTH_DISCOVERY_ACTUAL_COVERAGE_MISSING:" + required);
}
for (const required of ["KEEP_NOW", "REJECT_NOW"] as const) {
  if (!discoveryExpected.has(required)) throw new Error("GROUND_TRUTH_DISCOVERY_EXPECTED_COVERAGE_MISSING:" + required);
}
const discoverySourceIds = new Set(benchmark.discoveryCases.map((item) => item.sourceId));
for (const required of ["source_media_qbitai", "source_official_openai_news", "source_research_arxiv_ai", "source_runtime_trend_hn_top", "source_runtime_trend_github_trend_proxy"] as const) {
  if (!discoverySourceIds.has(required)) throw new Error("GROUND_TRUTH_DISCOVERY_SOURCE_COVERAGE_MISSING:" + required);
}

if (benchmark.clusterCases.length) {
  const relations = new Set(benchmark.clusterCases.map((item) => item.expectedRelation));
  for (const required of ["SAME_EVENT", "NEW_EVENT", "RELATED_EVENT"] as const) {
    if (!relations.has(required)) throw new Error("GROUND_TRUTH_CLUSTER_RELATION_COVERAGE_MISSING:" + required);
  }
  const sameCount = benchmark.clusterCases.filter((item) => item.expectedRelation === "SAME_EVENT").length;
  const relatedCount = benchmark.clusterCases.filter((item) => item.expectedRelation === "RELATED_EVENT").length;
  const newCount = benchmark.clusterCases.filter((item) => item.expectedRelation === "NEW_EVENT").length;
  if (benchmark.clusterCases.length < 14) throw new Error("GROUND_TRUTH_CLUSTER_COVERAGE_TOO_SMALL");
  if (sameCount < 4) throw new Error("GROUND_TRUTH_CLUSTER_SAME_EVENT_SAMPLE_TOO_SMALL");
  if (relatedCount < 4) throw new Error("GROUND_TRUTH_CLUSTER_RELATED_EVENT_SAMPLE_TOO_SMALL");
  if (newCount < 6) throw new Error("GROUND_TRUTH_CLUSTER_NEW_EVENT_SAMPLE_TOO_SMALL");
  const coverageAreas = new Set(benchmark.clusterCases.flatMap((item) => item.coverageAreas));
  for (const required of ["MODEL_RELEASE", "FINANCE", "POLICY_SAFETY", "OPEN_SOURCE", "RESEARCH"] as const) {
    if (!coverageAreas.has(required)) throw new Error("GROUND_TRUTH_CLUSTER_COVERAGE_AREA_MISSING:" + required);
  }
}

console.log("GROUND_TRUTH_SCHEMA=PASS");
console.log("GROUND_TRUTH_LABELING_GUIDE_LOCK=PASS");
console.log("GROUND_TRUTH_FIXED_BENCHMARK=" + benchmark.eventCases.length);
console.log("GROUND_TRUTH_DISCOVERY_BENCHMARK=" + benchmark.discoveryCases.length);
console.log("GROUND_TRUTH_DISCOVERY_SOURCE_COVERAGE=PASS");
console.log("GROUND_TRUTH_REVIEW_STATUS=" + benchmark.reviewStatus);
console.log("GROUND_TRUTH_CLUSTER_CASES=" + benchmark.clusterCases.length);
console.log("GROUND_TRUTH_CLUSTER_SAME_EVENT=" + benchmark.clusterCases.filter((item) => item.expectedRelation === "SAME_EVENT").length);
console.log("GROUND_TRUTH_CLUSTER_RELATED_EVENT=" + benchmark.clusterCases.filter((item) => item.expectedRelation === "RELATED_EVENT").length);
console.log("GROUND_TRUTH_CLUSTER_NEW_EVENT=" + benchmark.clusterCases.filter((item) => item.expectedRelation === "NEW_EVENT").length);
console.log("GROUND_TRUTH_CLUSTER_COVERAGE_AREAS=" + [...new Set(benchmark.clusterCases.flatMap((item) => item.coverageAreas))].sort().join(","));
