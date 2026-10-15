import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_QUALIFICATION_V2_FAILED:" + code);
  console.log(code + "=PASS");
}

const core = fs.readFileSync("lib/server/content/source-qualification.ts", "utf8");
const schema = fs.readFileSync("lib/server/db/schema.ts", "utf8");
const router = fs.readFileSync("lib/server/content/collection-capability-router.ts", "utf8");
const audit = fs.readFileSync("lib/server/content/source-capability-audit.ts", "utf8");
const owner = fs.readFileSync("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md", "utf8");
const mapping = fs.readFileSync("docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md", "utf8");
assert(core.includes("row_number() over") && core.includes("lte(rankedRuns.runRank, SOURCE_QUALIFICATION_SCAN_LIMIT)"), "QUALIFICATION_RUN_PAYLOAD_BOUNDED_IN_DATABASE");

for (const status of ["AUTO_READY", "CONDITIONAL", "MANUAL_ONLY", "DISABLED"]) {
  assert(core.includes('"' + status + '"'), "QUALIFICATION_STATUS_" + status);
}

for (const family of [
  "FEED_WEB",
  "NEWS_TREND_DISCOVERY",
  "PLATFORM_API",
  "SOCIAL_BROWSER",
  "MEDIA_TRANSCRIPT"
]) {
  assert(core.includes('"' + family + '"'), "ADAPTER_FAMILY_" + family);
}

for (const role of [
  "OFFICIAL",
  "PROFESSIONAL_MEDIA",
  "RESEARCH",
  "CREATOR",
  "DEVELOPER_COMMUNITY",
  "DISCOVERY_AGGREGATOR",
  "SOCIAL"
]) {
  assert(core.includes('"' + role + '"'), "SOURCE_ROLE_" + role);
}

assert(core.includes("liveRunCount >= 5"), "AUTO_REQUIRES_FIVE_RUNS");
assert(core.includes("successfulLiveRunCount >= 4"), "AUTO_REQUIRES_FOUR_SUCCESSES");
assert(core.includes("requiresManualLoginPerRun"), "AUTO_REJECTS_MANUAL_LOGIN");
assert(core.includes("continuousRuntimeAvailable"), "AUTO_REQUIRES_CONTINUOUS_RUNTIME");
assert(core.includes("runtimeDependency"), "CONDITIONAL_RUNTIME_DEPENDENCY");
assert(core.includes("manualOperationOnly"), "MANUAL_ONLY_EXPLICIT");
assert(core.includes("sourceQualification"), "QUALIFICATION_METADATA_NAMESPACE");

assert(!schema.includes("content_source_qualifications"), "NO_SECOND_SOURCE_QUALIFICATION_TABLE");
assert(schema.includes('pgTable(\n  "content_sources"'), "CONTENT_SOURCES_REMAINS_IDENTITY_OWNER");
assert(router.includes("CollectionBackendHealthStatus"), "RUNTIME_HEALTH_OWNER_REMAINS_ROUTER");
assert(audit.includes("SourceCapabilityStatus"), "AUDIT_HEALTH_OWNER_REMAINS_AUDIT");
assert(!router.includes("AUTO_READY"), "ROUTER_DOES_NOT_OWN_QUALIFICATION");
assert(!audit.includes("AUTO_READY"), "AUDIT_DOES_NOT_OWN_QUALIFICATION");

assert(owner.includes("AUTO_READY") && owner.includes("MANUAL_ONLY"), "CONTRACT_QUALIFICATION_FOUR_STATE");
assert(mapping.includes("Runtime Health/Audit 状态"), "MAPPING_HEALTH_QUALIFICATION_SEPARATION");

console.log("SOURCE_QUALIFICATION_V2_CONTRACT=PASS");
