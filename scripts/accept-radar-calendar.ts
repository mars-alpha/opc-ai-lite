import assert from "node:assert/strict";
import { eq, sql } from "drizzle-orm";
import { calendarWindow, beijingDay, previousDay, selectCalendarItems } from "../lib/content/radar-calendar";
import { getDatabase, closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { contentRadarSnapshots, contentEvents } from "../lib/server/db/schema";
import { listRadarTimelinePage } from "../lib/server/content/intelligence-read-model";
import { listSourceRuntimeSummary } from "../lib/server/content/source-runtime-operations";

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment === "production") assert(process.argv.includes("--production-read-only"), "production requires explicit read-only mode");
  const started = Date.now();
  // No getRadarSnapshot/refresh, registrations, AI or writes in this acceptance.
  const [persisted] = await getDatabase().select().from(contentRadarSnapshots).where(eq(contentRadarSnapshots.key, "CURRENT"));
  const old = (persisted?.payload ?? {}) as Record<string, any>;
  const asOf = process.argv.includes("--stored-as-of") && typeof old.generatedAt === "string" ? new Date(old.generatedAt) : new Date();
  const window = calendarWindow(asOf);
  const page = await listRadarTimelinePage({ asOf });
  assert.equal(page.items.length, new Set(page.items.map(item => item.eventId)).size, "unique canonical events");
  const daily: Record<string, number> = {};
  for (const item of page.items) daily[beijingDay(item.timelineAt)] = (daily[beijingDay(item.timelineAt)] ?? 0) + 1;
  assert.equal(Object.values(daily).reduce((a, b) => a + b, 0), page.total);
  assert.equal(selectCalendarItems(page.items, window).length, page.total);
  const historyDay = page.nextCursor ?? previousDay(window.firstDay);
  const history = await listRadarTimelinePage({ day: historyDay, asOf });
  assert(history.items.every(item => beijingDay(item.timelineAt) === historyDay));
  assert(!history.items.some(item => page.items.some(current => current.eventId === item.eventId)));
  const historicalIds = new Set(history.items.map(item => item.eventId));
  let terminal = history;
  let historicalDays = history.items.length ? 1 : 0;
  while (terminal.nextCursor) {
    const nextDay = terminal.nextCursor;
    assert(nextDay < (terminal.day ?? historyDay), "history cursor strictly descends");
    terminal = await listRadarTimelinePage({ day: nextDay, asOf });
    assert(terminal.items.length > 0, "history cursor must skip empty/excluded-only days");
    for (const item of terminal.items) {
      assert(!historicalIds.has(item.eventId));
      historicalIds.add(item.eventId);
    }
    historicalDays += 1;
  }
  assert.equal(terminal.hasMore, false, "last visible historical day reaches bottom");
  const duplicateTimeCounts = new Map<string, number>();
  page.items.forEach(item => duplicateTimeCounts.set(item.eventLastSeenAt.toISOString(), (duplicateTimeCounts.get(item.eventLastSeenAt.toISOString()) ?? 0) + 1));
  const allCounts = await getDatabase().select({ reason: sql<string>`case
    when ${contentEvents.archivedAt} is not null then 'ARCHIVED'
    when ${contentEvents.discoveryStatus} = 'IGNORED' then 'IGNORED'
    when ${contentEvents.metadata}->'eventPolicy'->>'systemObserved' is distinct from 'true' then 'NO_SYSTEM_POLICY'
    when ${contentEvents.metadata}->'eventPolicy'->>'aiRelevant' is distinct from 'true' then 'NOT_AI_RELEVANT'
    when ${contentEvents.metadata}->'eventPolicy'->'operationalUsefulness'->>'eligible' = 'false' then 'OPERATIONAL_EXCLUDED'
    else 'POLICY_CANDIDATE_REQUIRES_CANONICAL_EVIDENCE_CHECK' end`, count: sql<number>`count(*)::int` })
    .from(contentEvents).groupBy(sql`1`);
  const summary = await listSourceRuntimeSummary(100, asOf);
  const oldItems = Array.isArray(old.items) ? old.items : [];
  const oldDays: Record<string, number> = {};
  oldItems.forEach((item: any) => { const day = beijingDay(item.publishedAt || item.collectedAt); oldDays[day] = (oldDays[day] ?? 0) + 1; });
  const oldIndex = Array.isArray(old.windowEventIndex) ? old.windowEventIndex : [];
  console.log(JSON.stringify({ database: target.databaseName, asOf, timeZone: window.timeZone,
    oldSnapshot: { schema: old.schemaVersion, generatedAt: old.generatedAt, total: old.totalEventCount7d, initial: oldItems.length, hasMore: old.hasMore, index: oldIndex.length, days: oldDays, collection: old.collectionHealth?.summary },
    calendar: { from: window.from, to: window.to, total: page.total, unique: new Set(page.items.map(item => item.eventId)).size, daily, sameLastSeenGroups: [...duplicateTimeCounts.values()].filter(count => count > 1), historyDay, historyCount: history.total, nextDay: history.nextCursor, historicalDays, historicalUnique: historicalIds.size, reachedBottom: !terminal.hasMore },
    eventTableReasonBuckets: allCounts, windows: summary.windows, elapsedMs: Date.now() - started }, null, 2));
  console.log("RADAR_CALENDAR_LIVE_READ_ONLY=PASS");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "RADAR_CALENDAR_ACCEPT_FAILED"); process.exitCode = 1; }).finally(closeDatabase);
