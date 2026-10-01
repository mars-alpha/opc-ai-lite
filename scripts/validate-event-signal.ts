import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_SIGNAL_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const signal = read("lib/server/content/event-signal.ts");
const discovery = read("lib/server/content/discovery.ts");
const route = read("app/api/admin/content/discovery/events/[eventId]/signals/route.ts");
const workspace = read("components/AdminPlatformContentWorkspace.tsx");

assert(schema.includes("contentEventClusterSignals"), "CLUSTER_SIGNAL_TABLE_MISSING");
for (const field of [
  "hotnessScore",
  "velocityScore",
  "authorityScore",
  "adapterVersion",
  "rawValue",
  "breakdown",
  "calculatedAt"
]) {
  assert(schema.includes(field), "CLUSTER_SIGNAL_FIELD_MISSING:" + field);
}
for (const name of [
  "EVENT_SIGNAL_ADAPTER_VERSION",
  "normalizeHnSignal",
  "normalizeGithubSignal",
  "calculateEventClusterSignals",
  "upsertClusterSignal"
]) {
  assert(signal.includes(name), "SIGNAL_FUNCTION_MISSING:" + name);
}
assert(signal.includes("Math.log1p"), "PLATFORM_NORMALIZATION_MISSING");
assert(signal.includes("freshnessScore"), "TIME_DECAY_MISSING");
assert(signal.includes("authorityScore"), "AUTHORITY_INPUT_MISSING");
assert(signal.includes("sourceCoverage"), "CROSS_SOURCE_COVERAGE_MISSING");
assert(route.includes("calculateEventClusterSignals"), "SIGNAL_ROUTE_NOT_CLUSTER_BASED");
assert(discovery.includes("clusterVelocityScore"), "EVENT_LIST_VELOCITY_MISSING");
assert(discovery.includes("clusterAuthorityScore"), "EVENT_LIST_AUTHORITY_MISSING");
assert(workspace.includes("spreadLabel"), "SIGNAL_HUMAN_READABLE_SUMMARY_MISSING");
assert(!workspace.includes("传播速度"), "SIGNAL_INTERNAL_VELOCITY_LABEL_MUST_NOT_RETURN_TO_PRIMARY_UI");
assert(!workspace.includes("来源权威"), "SIGNAL_INTERNAL_AUTHORITY_LABEL_MUST_NOT_RETURN_TO_PRIMARY_UI");
for (const forbidden of ["aiRuns", "analyzeWithAi", "generateCandidate", "createAdminContentItem"]) {
  assert(!signal.includes(forbidden), "SIGNAL_BOUNDARY_VIOLATION:" + forbidden);
}

console.log("EVENT_SIGNAL_SCHEMA=PASS");
console.log("EVENT_SIGNAL_ADAPTERS=PASS");
console.log("EVENT_SIGNAL_CLUSTER_AGGREGATION=PASS");
console.log("EVENT_SIGNAL_HUMAN_READABLE_UI=PASS");
console.log("EVENT_SIGNAL_BOUNDARY=PASS");
