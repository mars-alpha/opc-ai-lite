import assert from "node:assert/strict";
import fs from "node:fs";

async function main() {
const snapshot = fs.readFileSync("lib/server/content/radar-snapshot.ts", "utf8");
const readModel = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");
assert(readModel.includes("nextHistoryDay"), "history cursor must be based on visible events, not the oldest excluded database row");
assert(!snapshot.includes("limit: 120"), "initial timeline must contain all seven calendar days, not 120 items");
const { beijingDay, calendarWindow, previousDay, nextHistoryDay, selectCalendarItems } = await import("../lib/content/radar-calendar");
const anchor = new Date("2026-10-15T16:01:00Z");
assert.equal(beijingDay(anchor), "2026-10-16");
const window = calendarWindow(anchor, 7);
assert.equal(window.from.toISOString(), "2026-10-09T16:00:00.000Z");
assert.equal(window.to.toISOString(), anchor.toISOString());
assert.equal(previousDay(window.firstDay), "2026-10-09");
const items = Array.from({ length: 400 }, (_, i) => ({ eventId: String(i), timelineAt: "2026-10-15T16:00:00Z" }));
assert.equal(selectCalendarItems(items, window).length, 400, "no arbitrary count cap");
assert.equal(selectCalendarItems([...items, items[0]], window).length, 400, "unique events");
assert.equal(selectCalendarItems([{ eventId: "old", timelineAt: "2026-10-09T15:59:59Z" }, { eventId: "future", timelineAt: "2026-10-15T16:02:00Z" }], window).length, 0);
assert.throws(() => previousDay("2026-02-30"));
assert.equal(nextHistoryDay([], window.from), null, "no visible history means reached bottom");
assert.equal(nextHistoryDay([{ timelineAt: "2026-10-07T01:00:00Z" }, { timelineAt: "2026-10-01T01:00:00Z" }], window.from), "2026-10-07", "skip empty days without hiding older visible content");
assert.equal(nextHistoryDay(items, window.from), null, "current window never keeps history cursor alive");
const { summarizeCollectionRuns } = await import("../lib/server/content/collection-funnel");
const base = { status: "SUCCEEDED", receivedCount: 10, createdCount: 2, duplicateCount: 3, startedAt: anchor, metadata: { collectionOrigin: "SYSTEM", discoveryFilter: { kept: 7 }, collectionFunnel: { version: 1, policyAccepted: 5, eventCreated: 1, eventMerged: 1, historicalWithoutEvent: 0, filterReasons: { UNRELATED: 3 }, policyReasons: { POLLUTION: 2 } } } };
const summary = summarizeCollectionRuns([base]);
assert.equal(summary.received, 10);
assert.equal(summary.filterKept, 7);
assert.equal(summary.rawCreated, 2);
assert.equal(summary.rawDuplicate, 3);
assert.equal(summary.eventCreated, 1);
assert.equal(summary.policyRejected, 2);
assert.equal(summary.unrecordedEventRuns, 0);
assert.equal(summary.received, summary.filterKept! + Object.values(summary.filterReasons).reduce((a, b) => a + b, 0));
assert.equal(summary.filterKept, summary.rawCreated + summary.rawDuplicate + summary.policyRejected!);
assert.equal(summary.rawCreated, summary.eventCreated! + summary.eventMerged! + summary.historicalWithoutEvent!);
assert.equal(summarizeCollectionRuns([{ ...base, metadata: { collectionFunnel: { version: 1 } } }]).eventCreated, null, "incomplete metadata is unknown, not zero");
assert.equal(selectCalendarItems([], window).length, 0, "empty calendar day is valid");
const legacy = summarizeCollectionRuns([{ ...base, metadata: { collectionOrigin: "SYSTEM" } }]);
assert.equal(legacy.eventCreated, null, "legacy event counts must not be invented");
assert.equal(legacy.filterKept, null, "missing filter counters are not inferred from raw counts");
console.log("RADAR_CALENDAR_AND_FUNNEL=PASS");

}
main().catch(error => { console.error(error); process.exitCode = 1; });
