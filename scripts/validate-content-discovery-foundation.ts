import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_DISCOVERY_FOUNDATION_FAILED:" + code);
}

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}

const schema = read("lib/server/db/schema.ts");
const discovery = read("lib/server/content/discovery.ts");
const contract = read("lib/server/content/discovery-contract.ts");

for (const name of [
  "contentRawItems",
  "contentRawItemObservations",
  "contentEvents",
  "contentEventRawItems",
  "contentEventSignals",
  "contentCandidateDecisions"
]) {
  assert(schema.includes("export const " + name), "SCHEMA_MISSING:" + name);
}

for (const field of [
  'platform: text("platform")',
  'collectionMethod: text("collection_method")',
  'authorityScore: integer("authority_score")',
  'topics: jsonb("topics")',
  'collectionConfig: jsonb("collection_config")',
  'signalConfig: jsonb("signal_config")'
]) {
  assert(schema.includes(field), "SOURCE_CONFIG_FIELD_MISSING:" + field);
}

assert(discovery.includes("ingestRawItem"), "RAW_INGEST_MISSING");
assert(discovery.includes("createEventSeed"), "EVENT_SEED_MISSING");
assert(discovery.includes("attachRawItemToEvent"), "EVENT_LINK_MISSING");
assert(discovery.includes("recordEventSignal"), "EVENT_SIGNAL_MISSING");
assert(discovery.includes("recordCandidateDecision"), "CANDIDATE_DECISION_MISSING");

assert(discovery.includes("contentHash"), "RAW_HASH_DEDUPE_MISSING");
assert(discovery.includes("externalId"), "EXTERNAL_ID_DEDUPE_MISSING");
assert(discovery.includes("originalUrl"), "URL_DEDUPE_MISSING");
assert(discovery.includes("canonicalizeOriginalUrl"), "CANONICAL_URL_DEDUPE_MISSING");
assert(discovery.includes("contentRawItemObservations"), "SOURCE_OBSERVATION_MISSING");

assert(contract.includes("buildExpansionQueries"), "EXPANSION_CONTRACT_MISSING");
assert(contract.includes("keywords"), "EXPANSION_KEYWORDS_MISSING");
assert(contract.includes("entities"), "EXPANSION_ENTITIES_MISSING");
assert(contract.includes("ADOPT"), "ADOPT_DECISION_MISSING");
assert(contract.includes("WATCH"), "WATCH_DECISION_MISSING");
assert(contract.includes("IGNORE"), "IGNORE_DECISION_MISSING");

assert(!discovery.includes("createAdminContentItem"), "DISCOVERY_MUST_NOT_CREATE_CONTENT");
assert(!discovery.includes("insert(contentItems)"), "DISCOVERY_MUST_NOT_INSERT_CONTENT");

console.log("CONTENT_DISCOVERY_SOURCE_CONFIG=PASS");
console.log("CONTENT_DISCOVERY_RAW_DEDUPE=PASS");
console.log("CONTENT_DISCOVERY_EVENT_MODEL=PASS");
console.log("CONTENT_DISCOVERY_EXPANSION_CONTRACT=PASS");
console.log("CONTENT_DISCOVERY_HUMAN_DECISION_BOUNDARY=PASS");
