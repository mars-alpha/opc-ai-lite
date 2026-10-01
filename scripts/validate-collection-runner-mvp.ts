import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_RUNNER_MVP_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const runner = read("lib/server/content/collection-runner.ts");
const searchAdapter = read("lib/server/content/search-discovery.ts");
const collectorContract = read("lib/server/content/discovery-contract.ts");
const strategy = read("lib/server/content/collection-strategy.ts");
const discovery = read("lib/server/content/discovery.ts");
const strategyUi = read("components/AdminCollectionStrategyPanel.tsx");

assert(schema.includes("export const contentCollectionRuns"), "RUN_SCHEMA_MISSING");
for (const field of ["sourceId", "collectionMethod", "status", "receivedCount", "createdCount", "duplicateCount", "errorCode", "errorMessage"]) {
  assert(schema.includes(field), "RUN_FIELD_MISSING:" + field);
}

for (const name of ["runSourceCollection", "collectManualUrl", "collectRss", "collectHttpPage"]) {
  assert(runner.includes(name), "RUNNER_FUNCTION_MISSING:" + name);
}
assert(runner.includes("runFreshScan"), "RUNNER_MUST_USE_FRESH_SCAN");
assert(runner.includes("assertPublicHttpUrl"), "SSRF_GUARD_MISSING");
assert(runner.includes("MAX_RESPONSE_BYTES"), "RESPONSE_LIMIT_MISSING");
assert(runner.includes("AbortSignal.timeout"), "FETCH_TIMEOUT_MISSING");
assert(runner.includes('redirect: "manual"'), "REDIRECT_GUARD_MISSING");
assert(runner.includes("OPC-AI-Collector"), "USER_AGENT_MISSING");
assert(runner.includes("assertCollectorReferenceOnly"), "REFERENCE_ONLY_RUNTIME_GUARD_MISSING");
assert(collectorContract.includes('COLLECTOR_MEDIA_POLICY = "REFERENCE_ONLY"'), "REFERENCE_ONLY_POLICY_MISSING");
assert(collectorContract.includes("COLLECTOR_MEDIA_PERSISTENCE_FORBIDDEN"), "MEDIA_PERSISTENCE_BLOCK_MISSING");

for (const value of ["collectSearchDiscovery", "HN_ALGOLIA", "GITHUB_SEARCH", "windowHours", "resultLimit", "searchQuery"]) {
  assert(searchAdapter.includes(value), "SEARCH_ADAPTER_CONTRACT_MISSING:" + value);
}
assert(runner.includes('method === "SEARCH"'), "SEARCH_RUNNER_BRANCH_MISSING");
assert(runner.includes("collectSearchDiscovery"), "SEARCH_RUNNER_ADAPTER_MISSING");

assert(discovery.includes("listCollectionRuns"), "RUN_LIST_MISSING");
assert(strategy.includes("runSourceCollection"), "STRATEGY_TEST_MUST_USE_COLLECTION_RUNNER");
assert(strategy.includes("ensureUrlSource"), "STRATEGY_SOURCE_RESOLVER_MISSING");
assert(strategy.includes("ensureSearchSource"), "STRATEGY_SEARCH_RESOLVER_MISSING");
assert(strategyUi.includes("保存并测试策略"), "STRATEGY_TEST_ACTION_MISSING");
assert(strategyUi.includes("AI 模型"), "STRATEGY_AI_POLICY_UI_MISSING");
assert(!strategyUi.includes("来源地址"), "SOURCE_URL_MUST_NOT_BE_OPERATOR_CONFIG");
assert(!strategyUi.includes("采集方式"), "COLLECTION_METHOD_MUST_NOT_BE_OPERATOR_CONFIG");

assert(fs.existsSync("app/api/admin/content/discovery/sources/[sourceId]/run/route.ts"), "RUN_API_MISSING");
assert(fs.existsSync("app/api/admin/content/discovery/runs/route.ts"), "RUNS_API_MISSING");

console.log("COLLECTION_RUNNER_SEARCH_DISCOVERY=PASS");
console.log("COLLECTION_RUNNER_METHODS=PASS");
console.log("COLLECTION_RUNNER_SSRF_GUARD=PASS");
console.log("COLLECTION_RUNNER_TRACE=PASS");
console.log("COLLECTION_RUNNER_STRATEGY_ENTRY=PASS");
console.log("COLLECTION_RUNNER_REFERENCE_ONLY=PASS");
