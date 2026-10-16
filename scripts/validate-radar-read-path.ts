import fs from "node:fs";
import { compactRadarSnapshotWire, expandRadarSnapshotWire } from "../lib/content/radar-snapshot-wire";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("RADAR_READ_PATH_FAILED:" + code);
  console.log(code + "=PASS");
}

const ui = fs.readFileSync("components/AdminIntelligenceWorkspace.tsx", "utf8");
const api = fs.readFileSync("app/api/admin/content/intelligence/route.ts", "utf8");
const snapshot = fs.readFileSync("lib/server/content/radar-snapshot.ts", "utf8");
const model = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");
const readiness = fs.readFileSync("lib/server/content/today-intelligence-readiness.ts", "utf8");
const qualification = fs.readFileSync("lib/server/content/source-qualification.ts", "utf8");
const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
const schema = fs.readFileSync("lib/server/db/schema.ts", "utf8");
const migration35 = fs.readFileSync("drizzle/0035_radar_read_path_indexes.sql", "utf8");
const migration36 = fs.readFileSync("drizzle/0036_radar_collection_run_indexes.sql", "utf8");

assert(ui.includes('view=snapshot'), "RADAR_INITIAL_SNAPSHOT_REQUEST");
assert(!ui.includes('readJson("/api/admin/content/intelligence?view=current-hot'), "RADAR_NO_INITIAL_CURRENT_HOT_REQUEST");
assert(!ui.includes('readJson("/api/admin/content/intelligence?view=readiness'), "RADAR_NO_INITIAL_READINESS_REQUEST");
assert(ui.includes('view=source-health') && ui.includes("onToggle"), "RADAR_SOURCE_DETAIL_LAZY_LOAD");
assert(api.includes('view === "snapshot"') && api.includes("getRadarSnapshot"), "RADAR_SNAPSHOT_API");
assert(snapshot.includes("contentRadarSnapshots") && snapshot.includes("readPersistedRadarSnapshot"), "RADAR_PERSISTED_SNAPSHOT_READ");
assert(snapshot.includes("RADAR_SNAPSHOT_SCHEMA_VERSION") && snapshot.includes("payload.schemaVersion !== RADAR_SNAPSHOT_SCHEMA_VERSION"), "RADAR_SNAPSHOT_SCHEMA_VERSION_GUARD");
assert(snapshot.includes("refreshRadarSnapshot") && snapshot.includes("RADAR_SNAPSHOT_TTL_MS = 30_000"), "RADAR_SNAPSHOT_REFRESH_AND_CACHE");
assert(cycle.includes('runSection("RADAR_SNAPSHOT"') && cycle.includes("refreshRadarSnapshot"), "RADAR_SNAPSHOT_REFRESHED_BY_CYCLE");
assert(
  model.includes("listPolicyEventCandidatePool") &&
  model.includes("listRadarTimeline") &&
  model.includes("item.currentHot.eligible"),
  "RADAR_UNIFIED_EVENT_POOL"
);
assert(model.includes("rawById") && model.includes("memberIdsByCluster"), "RADAR_EVENT_ASSEMBLY_MAPS");
assert(readiness.includes("qualifiedRecentSourceCount") && readiness.includes("qualifiedRecentPlatformCount"), "RADAR_OBSERVED_VS_QUALIFIED_SIGNALS");
assert(readiness.includes("RADAR_SOURCE_IDS"), "RADAR_READINESS_CURRENT_PORTFOLIO_ONLY");
assert(
  qualification.includes("SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS") &&
  qualification.includes("inArray(contentCollectionRuns.sourceId, sourceIds)") &&
  qualification.includes("SOURCE_QUALIFICATION_RECENT_RUN_LIMIT = 5") &&
  qualification.includes("SOURCE_QUALIFICATION_SCAN_LIMIT = 12"),
  "RADAR_QUALIFICATION_BOUNDED_RECENT_RUNS"
);
assert(!qualification.includes("count(*)::int"), "RADAR_QUALIFICATION_NO_UNBOUNDED_SQL_AGGREGATE");
assert(!qualification.includes("Date.now() - 30 * 86_400_000"), "RADAR_QUALIFICATION_NO_30_DAY_HARD_FILTER");
assert(schema.includes("content_raw_item_observations_source_observed_idx"), "RADAR_OBSERVATION_INDEX_SCHEMA");
assert(schema.includes("content_collection_runs_source_started_idx"), "RADAR_RUN_INDEX_SCHEMA");
assert(migration35.includes("content_raw_item_observations_source_observed_idx"), "RADAR_OBSERVATION_INDEX_MIGRATION");
assert(migration36.includes("content_collection_runs_source_started_idx"), "RADAR_RUN_INDEX_MIGRATION");
assert(!fs.existsSync("scripts/validate-today-intelligence-closure-026.ts"), "RADAR_OLD_026_VALIDATOR_REMOVED");
assert(!fs.existsSync("scripts/accept-today-intelligence-closure-026.ts"), "RADAR_OLD_026_ACCEPT_REMOVED");

const wireItems = Array.from({ length: 40 }, (_, index) => ({ eventId: `event-${index}`, curation: { score: index, featuredRank: 0 }, story: "evidence ".repeat(100) }));
const wireFeatured = wireItems.slice(0, 10).reverse().map((item, index) => ({ ...item, curation: { ...item.curation, featuredRank: index + 1 } }));
const fullWire = { items: wireItems, featured: wireFeatured, currentHot: wireItems.slice(10, 15).reverse() };
const compactWire = compactRadarSnapshotWire(fullWire);
const expandedWire = expandRadarSnapshotWire(compactWire);
assert(JSON.stringify(expandedWire.featured) === JSON.stringify(fullWire.featured) && JSON.stringify(expandedWire.currentHot) === JSON.stringify(fullWire.currentHot), "RADAR_COMPACT_ORDER_AND_CURATION_ROUND_TRIP");
assert(Buffer.byteLength(JSON.stringify(compactWire)) < Buffer.byteLength(JSON.stringify(fullWire)), "RADAR_COMPACT_AVOIDS_DUPLICATE_STORIES");
let missingReferenceRejected = false;
try { expandRadarSnapshotWire({ ...compactWire, currentHotIds: ["missing-event"] }); }
catch (error) { missingReferenceRejected = error instanceof Error && error.message === "RADAR_SNAPSHOT_WIRE_EVENT_MISSING"; }
assert(missingReferenceRejected, "RADAR_COMPACT_MISSING_REFERENCE_FAILS_CLOSED");
assert(JSON.stringify(expandRadarSnapshotWire(fullWire).featured) === JSON.stringify(fullWire.featured), "RADAR_FULL_RESPONSE_COMPATIBLE");

console.log("RADAR_READ_PATH_CONTRACT=PASS");
