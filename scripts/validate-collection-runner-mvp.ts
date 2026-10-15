import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_RUNNER_MVP_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const runner = read("lib/server/content/collection-runner.ts");
const searchAdapter = read("lib/server/content/search-discovery.ts");
const collectorContract = read("lib/server/content/discovery-contract.ts");
const policy = read("lib/content/intelligence-policy.ts");
const discovery = read("lib/server/content/discovery.ts");

assert(schema.includes("export const contentCollectionRuns"), "RUN_SCHEMA_MISSING");
assert(schema.includes("export const contentEntities"), "ENTITY_SCHEMA_MISSING");
for (const name of ["runSourceCollection", "collectRss", "collectSitemap", "collectHttpPage"]) {
  assert(runner.includes(name), "RUNNER_FUNCTION_MISSING:" + name);
}
assert(runner.includes("runFreshScan"), "RUNNER_MUST_USE_FRESH_SCAN");
assert(runner.includes("SYSTEM_COLLECTION_RUNTIME_ONLY"), "SYSTEM_ONLY_RUNTIME_GUARD_MISSING");
assert(!runner.includes("collectManualUrl"), "MANUAL_COLLECTOR_MUST_BE_RETIRED");
assert(!runner.includes("manualResultOnly"), "MANUAL_RESULT_BRANCH_MUST_BE_RETIRED");
assert(runner.includes("sourceContentRule"), "SOURCE_POLICY_GATE_MISSING");
assert(runner.includes("sourceFreshnessHours"), "SOURCE_FRESHNESS_POLICY_MISSING");
assert(runner.includes("resolveKnownEntities"), "ENTITY_RESOLUTION_MISSING");
assert(runner.includes("evaluateEventPolicy"), "EVENT_POLICY_MISSING");
assert(!runner.includes("contentCollectionStrategies"), "LEGACY_STRATEGY_DEPENDENCY_PRESENT");
assert(runner.includes("assertPublicHttpUrl"), "SSRF_GUARD_MISSING");
assert(runner.includes("COLLECTION_INTERNAL_SERVICE_ORIGINS"), "INTERNAL_SERVICE_ALLOWLIST_MISSING");
assert(runner.includes("MAX_RESPONSE_BYTES"), "RESPONSE_LIMIT_MISSING");
assert(runner.includes("AbortSignal.timeout"), "FETCH_TIMEOUT_MISSING");
assert(runner.includes('redirect: "manual"'), "REDIRECT_GUARD_MISSING");
assert(runner.includes("OPC-AI-Collector"), "USER_AGENT_MISSING");
assert(runner.includes("assertCollectorReferenceOnly"), "REFERENCE_ONLY_RUNTIME_GUARD_MISSING");
assert(runner.includes("parseSitemapDocument"), "SITEMAP_PARSER_MISSING");
assert(runner.includes("discoveryOnly: true") && runner.includes("referenceOnly: true"), "SITEMAP_DISCOVERY_ONLY_BOUNDARY_MISSING");
assert(runner.includes("scopePath") && runner.includes("url.hostname.toLowerCase() !== scope.hostname.toLowerCase()"), "SITEMAP_SCOPE_GUARD_MISSING");
assert(collectorContract.includes('COLLECTOR_MEDIA_POLICY = "REFERENCE_ONLY"'), "REFERENCE_ONLY_POLICY_MISSING");

for (const value of ["collectSearchDiscovery", "HN_ALGOLIA", "GITHUB_SEARCH", "windowHours", "resultLimit", "searchQuery"]) {
  assert(searchAdapter.includes(value), "SEARCH_ADAPTER_CONTRACT_MISSING:" + value);
}
assert(runner.includes('method === "SEARCH"'), "SEARCH_RUNNER_BRANCH_MISSING");
assert(discovery.includes("listCollectionRuns"), "RUN_LIST_MISSING");
assert(policy.includes("INITIAL_SOURCE_POLICIES"), "SOURCE_POLICY_REGISTRY_MISSING");
assert(policy.includes("CORE_ENTITY_SEEDS"), "ENTITY_REGISTRY_SEEDS_MISSING");

console.log("COLLECTION_RUNNER_UNIFIED_PIPELINE=PASS");
console.log("COLLECTION_RUNNER_POLICY_GATE=PASS");
console.log("COLLECTION_RUNNER_SSRF_GUARD=PASS");
console.log("COLLECTION_RUNNER_REFERENCE_ONLY=PASS");
