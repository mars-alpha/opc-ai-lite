import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { inArray } from "drizzle-orm";
import { loadGroundTruthBenchmark } from "../lib/content/ground-truth";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentEventClusterMembers } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("AI_CLUSTER_COVERAGE_ACCEPT_FAILED:" + code);
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");

  const benchmark = loadGroundTruthBenchmark(path.join(process.cwd(), "data/content/ground-truth/benchmark-v2.json"));
  assert(benchmark.clusterCases.length === 14, "CLUSTER_CASE_COUNT");
  assert(benchmark.clusterCases.filter((x) => x.expectedRelation === "SAME_EVENT").length === 4, "SAME_EVENT_COUNT");
  assert(benchmark.clusterCases.filter((x) => x.expectedRelation === "RELATED_EVENT").length === 4, "RELATED_EVENT_COUNT");
  assert(benchmark.clusterCases.filter((x) => x.expectedRelation === "NEW_EVENT").length === 6, "NEW_EVENT_COUNT");

  const areas = new Set(benchmark.clusterCases.flatMap((x) => x.coverageAreas));
  for (const required of ["MODEL_RELEASE", "FINANCE", "POLICY_SAFETY", "OPEN_SOURCE", "RESEARCH"] as const) {
    assert(areas.has(required), "COVERAGE_AREA_" + required);
  }

  const ids = [...new Set(benchmark.clusterCases.flatMap((x) => x.eventIds))];
  const memberships = await getDatabase()
    .select()
    .from(contentEventClusterMembers)
    .where(inArray(contentEventClusterMembers.eventId, ids));
  const clusterByEvent = new Map(memberships.map((x) => [x.eventId, x.clusterId]));

  const fragmentedSame = benchmark.clusterCases
    .filter((x) => x.expectedRelation === "SAME_EVENT")
    .filter((x) => new Set(x.eventIds.map((id) => clusterByEvent.get(id))).size !== 1)
    .map((x) => x.caseId)
    .sort();

  const wronglyMergedNonSame = benchmark.clusterCases
    .filter((x) => x.expectedRelation === "NEW_EVENT" || x.expectedRelation === "RELATED_EVENT")
    .filter((x) => new Set(x.eventIds.map((id) => clusterByEvent.get(id))).size === 1)
    .map((x) => x.caseId);

  assert(wronglyMergedNonSame.length === 0, "NON_SAME_FALSE_MERGE:" + wronglyMergedNonSame.join(","));
  assert(fragmentedSame.length === 0, "FRAGMENTATION_REMAINING:" + fragmentedSame.join(","));

  console.log("AI_CLUSTER_COVERAGE_14_CASES=PASS");
  console.log("AI_CLUSTER_COVERAGE_5_AREAS=PASS");
  console.log("AI_CLUSTER_COVERAGE_NO_FALSE_MERGE=PASS");
  console.log("AI_CLUSTER_COVERAGE_FRAGMENTATION=0");
  console.log("AI_CLUSTER_COVERAGE_ALL_SAME_EVENT_MERGED=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });