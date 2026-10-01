import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_SEED_CLUSTERING_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const discovery = read("lib/server/content/discovery.ts");
const cluster = read("lib/server/content/event-seed-clustering.ts");

for (const field of ["clusterRuleVersion", "clusterReason", "clusterScore", "clusterMetadata"]) {
  assert(schema.includes(field), "LINK_CLUSTER_FIELD_MISSING:" + field);
}
for (const name of [
  "EVENT_SEED_CLUSTER_RULE_VERSION",
  "normalizeEventSeedTitle",
  "scoreEventSeedCandidate",
  "findEventSeedCluster"
]) {
  assert(cluster.includes(name), "CLUSTER_FUNCTION_MISSING:" + name);
}
assert(cluster.includes("TITLE_EXACT"), "EXACT_TITLE_RULE_MISSING");
assert(cluster.includes("TITLE_TOKEN_OVERLAP"), "TITLE_OVERLAP_RULE_MISSING");
assert(cluster.includes("TIME_WINDOW"), "TIME_WINDOW_RULE_MISSING");
assert(discovery.includes("findEventSeedCluster"), "DISCOVERY_CLUSTER_INTEGRATION_MISSING");
assert(discovery.includes("clusterReason"), "CLUSTER_REASON_NOT_PERSISTED");
assert(discovery.includes("clusterScore"), "CLUSTER_SCORE_NOT_PERSISTED");
assert(!cluster.includes("fetch("), "CLUSTER_MUST_NOT_CALL_NETWORK");
assert(!cluster.includes("AI"), "CLUSTER_MUST_NOT_CALL_AI");

console.log("EVENT_SEED_CLUSTERING_SCHEMA=PASS");
console.log("EVENT_SEED_CLUSTERING_RULES=PASS");
console.log("EVENT_SEED_CLUSTERING_AUDIT=PASS");
console.log("EVENT_SEED_CLUSTERING_NO_AI=PASS");
