import fs from "node:fs";
import { compactRadarSnapshotWire, expandRadarSnapshotWire, radarListingItem } from "../lib/content/radar-snapshot-wire";

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
assert(snapshot.includes("PREVIOUS_RADAR_SNAPSHOT_SCHEMA_VERSION") && snapshot.includes("expandRadarSnapshot") && snapshot.includes("compactRadarSnapshot"), "RADAR_SNAPSHOT_V16_READ_COMPATIBILITY_AND_V17_STORAGE");
assert(snapshot.includes("refreshRadarSnapshot") && snapshot.includes("RADAR_SNAPSHOT_TTL_MS = 30_000"), "RADAR_SNAPSHOT_REFRESH_AND_CACHE");
assert(cycle.includes('runSection("RADAR_SNAPSHOT"') && cycle.includes("refreshRadarSnapshot"), "RADAR_SNAPSHOT_REFRESHED_BY_CYCLE");
assert(
  model.includes("listPolicyEventCandidatePool") &&
  model.includes("listRadarTimeline") &&
  model.includes("item.currentHot.eligible"),
  "RADAR_UNIFIED_EVENT_POOL"
);
assert(model.includes("rawById") && model.includes("memberEventIdsByPrimary") && model.includes("selectCanonicalEventGroups"), "RADAR_EVENT_ASSEMBLY_MAPS");
assert(readiness.includes("qualifiedRecentSourceCount") && readiness.includes("qualifiedRecentPlatformCount"), "RADAR_OBSERVED_VS_QUALIFIED_SIGNALS");
assert(readiness.includes("RADAR_SOURCE_IDS"), "RADAR_READINESS_CURRENT_PORTFOLIO_ONLY");
assert(
  qualification.includes("SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS") &&
  qualification.includes("currentQualificationEvidencePredicate(source.id,") &&
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

const privateBody = 'upstream raw body '.repeat(10000);
const visiblePresentation = { displayTitleZh: '中文标题', displaySummaryZh: '答案先行摘要', translationStatus: 'AVAILABLE', editorialJudgmentZh: '推荐依据', tags: ['模型'] };
const heavyItem = { eventId: 'heavy', curation: { score: 90 }, title: 'Original',
  presentation: { ...visiblePresentation, originalSummary: privateBody, eventSummary: privateBody },
  evidenceLinks: [{ title: '原文', originalUrl: 'https://example.org/report', sourceName: 'Official', rawMetadata: { body: privateBody }, sourceMetadata: { unused: privateBody }, presentation: { ...visiblePresentation, originalSummary: privateBody } }],
  story: { overview: '事件概览', latest: { text: '最新进展' }, reportTimeline: [{ reportId: 'r', title: '原文', originalUrl: 'https://example.org/report', excerpt: privateBody, excerptZh: privateBody }], latestReport: { reportId: 'r', title: '原文', excerpt: privateBody, excerptZh: privateBody }, developments: [], heatSeries: { points: [] } }, heatShadow: { internal: privateBody } };
const projected = compactRadarSnapshotWire({ items: [heavyItem], featured: [heavyItem], currentHot: [heavyItem] });
const publicItem = projected.items[0];
assert(Buffer.byteLength(JSON.stringify(projected)) < Buffer.byteLength(JSON.stringify(heavyItem)) / 2, 'RADAR_WIRE_EXCLUDES_UNUSED_PRIVATE_PAYLOAD');
assert(publicItem.presentation.displaySummaryZh === heavyItem.presentation.displaySummaryZh && publicItem.story.overview === heavyItem.story.overview && publicItem.story.latest.text === heavyItem.story.latest.text, 'RADAR_WIRE_PRESERVES_VISIBLE_TEXT');
assert(publicItem.evidenceLinks[0].originalUrl === heavyItem.evidenceLinks[0].originalUrl && publicItem.story.reportTimeline[0].reportId === 'r', 'RADAR_WIRE_PRESERVES_CITATIONS');
assert(heavyItem.evidenceLinks[0].rawMetadata.body === privateBody && heavyItem.presentation.originalSummary === privateBody, 'RADAR_WIRE_PROJECTION_DOES_NOT_MUTATE_SNAPSHOT');
assert(JSON.stringify(expandRadarSnapshotWire(projected).featured[0]) === JSON.stringify(publicItem), 'RADAR_PROJECTED_REFERENCE_ROUND_TRIP');
console.log("RADAR_READ_PATH_CONTRACT=PASS");
const listing=radarListingItem(heavyItem) as typeof heavyItem & {latestProgressPreview:string};
assert(!('story' in (listing as Record<string,unknown>))&&listing.latestProgressPreview==='最新进展','RADAR_LIST_DEFERS_STORY_BUT_PRESERVES_PROGRESS');
assert(listing.presentation.displaySummaryZh===heavyItem.presentation.displaySummaryZh&&listing.evidenceLinks[0].originalUrl===heavyItem.evidenceLinks[0].originalUrl,'RADAR_LIST_PRESERVES_SUMMARY_AND_SOURCE_FILTER_CITATIONS');
assert(Buffer.byteLength(JSON.stringify(listing))<Buffer.byteLength(JSON.stringify(projected.items[0])),'RADAR_LIST_SMALLER_THAN_DETAIL');
assert(ui.includes('view=event-detail')&&ui.includes('detailInFlight')&&ui.includes('transport=listing'),'RADAR_UI_SINGLE_FLIGHT_LAZY_DETAILS');
assert(api.includes("view==='event-detail'")&&api.includes("EVENT_DETAIL_NOT_FOUND"),'RADAR_DETAIL_AUTHENTICATED_AND_MISSING_FAIL_CLOSED');
