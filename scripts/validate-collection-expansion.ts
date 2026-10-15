import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_EXPANSION_FAILED:" + code);
}
function read(path: string) { return fs.readFileSync(path, "utf8"); }

const schema = read("lib/server/db/schema.ts");
const expansion = read("lib/server/content/collection-expansion.ts");
const contract = read("lib/server/content/event-expansion.ts");
const route = read("app/api/admin/content/discovery/events/[eventId]/expansion/route.ts");
const workspace = read("components/AdminPlatformContentWorkspace.tsx");
const migration = read("drizzle/0034_event_expansion_evidence.sql");
const snapshot = JSON.parse(read("drizzle/meta/0034_snapshot.json")) as { tables?: Record<string, unknown> };
const journal = JSON.parse(read("drizzle/meta/_journal.json")) as { entries?: Array<{ tag?: string }> };

assert(schema.includes("contentExpansionRuns"), "EXPANSION_RUN_SCHEMA_MISSING");
assert(schema.includes("contentEventExpansionEvidence"), "EXPANSION_EVIDENCE_SCHEMA_MISSING");
assert(migration.includes('CREATE TABLE IF NOT EXISTS "content_event_expansion_evidence"'), "EXPANSION_MIGRATION_MISSING");
assert(Boolean(snapshot.tables?.["public.content_event_expansion_evidence"]), "EXPANSION_SNAPSHOT_MISSING");
assert(journal.entries?.some((entry) => entry.tag === "0034_event_expansion_evidence"), "EXPANSION_JOURNAL_MISSING");
for (const field of ["eventId", "query", "provider", "windowHours", "resultLimit", "receivedCount", "createdCount", "duplicateCount", "status"]) {
  assert(schema.includes(field), "EXPANSION_RUN_FIELD_MISSING:" + field);
}
for (const name of ["refreshSourceManagedEventExpansion", "refreshEventExpansionEvidenceFromRecentRaw", "listEventExpansionRuns", "listEventExpansionEvidence"]) {
  assert(expansion.includes(name), "EXPANSION_FUNCTION_MISSING:" + name);
}
assert(expansion.includes("runEventExpansion") && expansion.includes("ensureExpansionSource"), "LEGACY_EXPANSION_TOOLING_RETAINED_NON_PRODUCTION");
assert(expansion.includes("collectSearchDiscovery"), "SEARCH_ADAPTER_NOT_REUSED");
assert(expansion.includes("collectTrendDiscovery"), "TREND_QUERY_ADAPTER_NOT_REUSED");
for (const provider of ["BILIBILI_SEARCH", "YOUTUBE_SEARCH"]) {
  assert(expansion.includes(provider), "EXPANSION_SEARCH_PROVIDER_MISSING:" + provider);
}
assert(expansion.includes("search/all/v2"), "BILIBILI_EVENT_SEARCH_ENDPOINT_MISSING");
assert(expansion.includes("providerQueryPlan"), "PROVIDER_QUERY_ROUTING_MISSING");
assert(expansion.includes("DEFAULT_EVENT_EXPANSION_SEARCH_PROVIDERS"), "DEFAULT_PROVIDER_POLICY_MISSING");
assert(!expansion.includes('"X_SEARCH"') && contract.includes("NO_CURRENT_SERVER_ROUTE"), "X_ACTIVE_SEARCH_RETIRED");
assert(expansion.includes("ingestRawItem"), "UNIFIED_RAW_INGEST_NOT_REUSED");
assert(!expansion.includes("runFreshScan"), "EXPANSION_MUST_NOT_CREATE_FACT_EVENTS");
assert(!expansion.includes("runEventClustering"), "EXPANSION_MUST_NOT_RECLUSTER_FACT_EVENTS");
assert(!expansion.includes("calculateEventClusterSignals"), "EXPANSION_MUST_NOT_CHANGE_FORMAL_SIGNALS");
for (const type of ["EXPERIENCE", "TUTORIAL", "USE_CASE", "WORK_IMPACT", "DEMO", "DISCUSSION", "SHAREABLE"]) {
  assert(contract.includes(type), "EXPANSION_TYPE_MISSING:" + type);
}
for (const media of ["ARTICLE", "VIDEO", "IMAGE_TEXT", "POST", "REPO"]) {
  assert(contract.includes(media), "EXPANSION_MEDIA_TYPE_MISSING:" + media);
}
assert(contract.includes("chinesePriorityApplied"), "CHINESE_PRIORITY_AUDIT_MISSING");
assert(contract.includes("formalHotspotPromotion: false"), "FORMAL_HOTSPOT_GUARD_MISSING");
assert(route.includes("export async function POST"), "EXPANSION_POST_MISSING");
assert(route.includes("refreshSourceManagedEventExpansion") && !route.includes("runEventExpansion"), "EXPANSION_POST_SOURCE_MANAGEMENT_ONLY");
assert(route.includes("SOURCE_MANAGEMENT_SYSTEM_COLLECTION_ONLY"), "EXPANSION_API_SINGLE_SOURCE_OWNER");
assert(route.includes("listEventExpansionEvidence"), "EXPANSION_EVIDENCE_READ_MISSING");
assert(!workspace.includes("扩展采集"), "EXPANSION_INTERNAL_ACTION_MUST_NOT_RETURN_TO_PRIMARY_UI");
assert(!workspace.includes("expansionRuns"), "EXPANSION_INTERNAL_STATUS_MUST_NOT_RETURN_TO_PRIMARY_UI");
for (const forbidden of ["aiRuns", "analyzeWithAi", "generateCandidate", "modelProvider", "promptVersion"]) {
  assert(!expansion.includes(forbidden), "EXPANSION_MUST_NOT_CALL_AI:" + forbidden);
}
assert(!expansion.includes("createAdminContentItem"), "EXPANSION_MUST_NOT_CREATE_CONTENT");

console.log("COLLECTION_EXPANSION_MIGRATION_CHAIN=PASS");
console.log("COLLECTION_EXPANSION_SCHEMA=PASS");
console.log("COLLECTION_EXPANSION_RUNNER=PASS");
console.log("COLLECTION_EXPANSION_REUSE=PASS");
console.log("COLLECTION_EXPANSION_INTERNAL_UI_BOUNDARY=PASS");
console.log("COLLECTION_EXPANSION_BOUNDARY=PASS");
