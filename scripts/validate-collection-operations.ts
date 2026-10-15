import assert from "node:assert/strict";
import * as snapshot from "../lib/server/content/radar-snapshot";
import * as onboarding from "../lib/server/content/source-onboarding";

const freshness = Reflect.get(snapshot, "radarSnapshotFreshness");
assert.equal(typeof freshness, "function", "SNAPSHOT_MUST_EXPOSE_REAL_FRESHNESS");
const now = new Date("2026-10-15T04:00:00.000Z");
assert.equal(freshness("2026-10-15T03:31:00.000Z", now).stale, false);
assert.equal(freshness("2026-10-15T03:29:00.000Z", now).stale, true);
assert.equal(freshness("invalid", now).reason, "INVALID_GENERATED_AT");
assert.equal(freshness("2026-10-15T04:01:00.000Z", now).stale, true);
const overlay = Reflect.get(snapshot, "applyRadarOperations");
assert.equal(typeof overlay, "function", "PERSISTED_SNAPSHOT_MUST_OVERLAY_CURRENT_STATES");
const items = [{ eventId: "a", category: "模型", discoveryStatus: "DISCOVERED" }, { eventId: "b", category: "产品", discoveryStatus: "DISCOVERED" }];
const base = { items, featured: items, currentHot: items, worthPracticing: items, totalEventCount7d: 2, categoryCounts7d: { 全部: 2, 模型: 1, 产品: 1 } };
const result = overlay(base, [{ id: "a", discoveryStatus: "IGNORED", archivedAt: null }, { id: "b", discoveryStatus: "SHORTLISTED", archivedAt: null }]);
for (const field of ["items", "featured", "currentHot", "worthPracticing"] as const) {
  assert.deepEqual(result[field].map((x: { eventId: string }) => x.eventId), ["a", "b"]);
}
assert.equal(base.items.length, 2, "CACHE_PAYLOAD_NOT_MUTATED");
assert.equal(overlay(base, []).items.length, 0, "DELETED_EVENT_FAILS_CLOSED");
const full = overlay({ ...base, windowEventIndex: [...items, { eventId: "c", category: "论文" }], totalEventCount7d: 3, categoryCounts7d: { 全部: 3, 模型: 1, 产品: 1, 论文: 1 } }, [{ id: "a", discoveryStatus: "IGNORED", archivedAt: null }, { id: "b", discoveryStatus: "ADOPTED", archivedAt: null }, { id: "c", discoveryStatus: "DISCOVERED", archivedAt: null }]);
assert.equal(full.totalEventCount7d, 3, "COUNTS_USE_FULL_WINDOW_NOT_FIRST_PAGE");
assert.equal(full.categoryCounts7d.论文, 1);
assert.equal(full.categoryCounts7d.模型, 1);
assert.equal(overlay(base, [{ id: "a", discoveryStatus: "DISCOVERED", archivedAt: new Date() }]).items.length, 0);
const stage = Reflect.get(onboarding, "resolveOnboardingStage");
assert.equal(typeof stage, "function", "PROBE_MUST_NOT_GRANT_QUALIFIED");
assert.equal(stage({ qualification: "CONDITIONAL", evidence: { liveRunCount: 0 } }, true), "PROBED");
assert.equal(stage({ qualification: "CONDITIONAL", evidence: { liveRunCount: 2 } }, true), "OBSERVING");
assert.equal(stage({ qualification: "AUTO_READY", evidence: { liveRunCount: 5 } }, true), "QUALIFIED");
assert.equal(stage(null, false), "REGISTERED");
console.log("COLLECTION_OPERATIONS_FRESHNESS_OVERLAY_QUALIFICATION=PASS");
