import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_CLUSTERING_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const cluster = read("lib/server/content/event-clustering.ts");
const discovery = read("lib/server/content/discovery.ts");
const workspace = read("components/AdminPlatformContentWorkspace.tsx");

for (const table of ["contentEventClusters", "contentEventClusterMembers"]) {
  assert(schema.includes(table), "CLUSTER_TABLE_MISSING:" + table);
}
for (const field of [
  "canonicalTitle",
  "primaryEventId",
  "memberEventCount",
  "rawItemCount",
  "sourceCount",
  "platformCount",
  "clusterRuleVersion",
  "mergeReason",
  "mergeScore"
]) {
  assert(schema.includes(field), "CLUSTER_FIELD_MISSING:" + field);
}
for (const name of [
  "EVENT_CLUSTER_RULE_VERSION",
  "scoreEventClusterCandidate",
  "runEventClustering",
  "getEventClusterResearchPack"
]) {
  assert(cluster.includes(name), "CLUSTER_FUNCTION_MISSING:" + name);
}
assert(cluster.includes("TITLE_TOKEN_OVERLAP"), "TITLE_RULE_MISSING");
assert(cluster.includes("TIME_WINDOW"), "TIME_RULE_MISSING");
assert(cluster.includes("VERSION_CONFLICT"), "VERSION_GUARD_MISSING");
assert(discovery.includes("clusterId"), "EVENT_LIST_CLUSTER_ID_MISSING");
assert(discovery.includes("clusterMemberCount"), "EVENT_LIST_CLUSTER_COUNT_MISSING");
assert(!workspace.includes("成员事件"), "CLUSTER_INTERNAL_COUNT_MUST_NOT_RETURN_TO_PRIMARY_UI");
for (const forbidden of ["aiRuns", "analyzeWithAi", "generateCandidate", "createAdminContentItem"]) {
  assert(!cluster.includes(forbidden), "CLUSTER_BOUNDARY_VIOLATION:" + forbidden);
}

console.log("EVENT_CLUSTERING_SCHEMA=PASS");
console.log("EVENT_CLUSTERING_RULES=PASS");
console.log("EVENT_CLUSTERING_RESEARCH_PACK=PASS");
console.log("EVENT_CLUSTERING_INTERNAL_UI_BOUNDARY=PASS");
console.log("EVENT_CLUSTERING_BOUNDARY=PASS");
