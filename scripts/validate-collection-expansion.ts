import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_EXPANSION_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const expansion = read("lib/server/content/collection-expansion.ts");
const contract = read("lib/server/content/discovery-contract.ts");
const route = read("app/api/admin/content/discovery/events/[eventId]/expansion/route.ts");
const workspace = read("components/AdminPlatformContentWorkspace.tsx");

assert(schema.includes("contentExpansionRuns"), "EXPANSION_RUN_SCHEMA_MISSING");
for (const field of ["eventId", "query", "provider", "windowHours", "resultLimit", "receivedCount", "createdCount", "duplicateCount", "status"]) {
  assert(schema.includes(field), "EXPANSION_RUN_FIELD_MISSING:" + field);
}
for (const name of ["runEventExpansion", "listEventExpansionRuns", "ensureExpansionSource"]) {
  assert(expansion.includes(name), "EXPANSION_FUNCTION_MISSING:" + name);
}
assert(expansion.includes("collectSearchDiscovery"), "SEARCH_ADAPTER_NOT_REUSED");
assert(expansion.includes("runFreshScan"), "FRESH_SCAN_NOT_REUSED");
assert(contract.includes("title?: unknown"), "TITLE_FALLBACK_CONTRACT_MISSING");
assert(route.includes("export async function POST"), "EXPANSION_POST_MISSING");
assert(route.includes("runEventExpansion"), "EXPANSION_POST_RUNNER_MISSING");
assert(!workspace.includes("扩展采集"), "EXPANSION_INTERNAL_ACTION_MUST_NOT_RETURN_TO_PRIMARY_UI");
assert(!workspace.includes("expansionRuns"), "EXPANSION_INTERNAL_STATUS_MUST_NOT_RETURN_TO_PRIMARY_UI");
for (const forbidden of ["aiRuns", "analyzeWithAi", "generateCandidate", "modelProvider", "promptVersion"]) {
  assert(!expansion.includes(forbidden), "EXPANSION_MUST_NOT_CALL_AI:" + forbidden);
}
assert(!expansion.includes("createAdminContentItem"), "EXPANSION_MUST_NOT_CREATE_CONTENT");

console.log("COLLECTION_EXPANSION_SCHEMA=PASS");
console.log("COLLECTION_EXPANSION_RUNNER=PASS");
console.log("COLLECTION_EXPANSION_REUSE=PASS");
console.log("COLLECTION_EXPANSION_INTERNAL_UI_BOUNDARY=PASS");
console.log("COLLECTION_EXPANSION_BOUNDARY=PASS");
