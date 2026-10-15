import assert from "node:assert/strict";
import { parseFeedDocument } from "../lib/server/content/collection-runner";
const [item] = parseFeedDocument('<rss><channel><item><title>Workflow tutorial</title><link>https://example.com/guide</link><description>Short summary</description><pubDate>Thu, 15 Oct 2026 00:00:00 GMT</pubDate></item></channel></rss>', 'https://example.com/feed');
const quality = item.metadata?.collectionQuality as Record<string, unknown> | undefined;
assert.equal(quality?.fullTextVerified, false, "FEED_SUMMARY_MUST_NOT_AUTHORIZE_FULL_TRANSLATION");
assert.equal(quality?.authorPresent, false);
assert.equal(quality?.originalLinkPresent, true);
console.log("COLLECTION_FEED_FIELD_COMPLETENESS=PASS");

import { selectBackfillWindow } from "../lib/server/content/collection-item-quality";
const from = new Date("2026-10-08T00:00:00Z"), to = new Date("2026-10-15T00:00:00Z");
const selection = selectBackfillWindow([{ publishedAt: null }, { publishedAt: "invalid" },
  { publishedAt: "2026-10-07T23:59:59Z" }, { publishedAt: "2026-10-15T00:00:01Z" },
  { publishedAt: from.toISOString() }, { publishedAt: to.toISOString() }], from, to);
assert.equal(selection.items.length, 2); assert.equal(selection.missingTime, 2); assert.equal(selection.outsideWindow, 2);
assert.equal(selection.historyCompleteness, "AVAILABLE_WINDOW_ONLY_NO_ARCHIVE_GUARANTEE");
console.log("COLLECTION_BACKFILL_PUBLISHED_TIME_WINDOW=PASS");

import { classifySourceAssetForCleanup } from "../lib/server/content/source-asset-cleanup";
assert.equal(classifySourceAssetForCleanup({ id: "legacy-browser", collectionMethod: "BROWSER", metadata: {} } as never).action, "ARCHIVE", "LOGIN_BROWSER_NOT_SERVER_SOURCE");

import { buildWorthPracticingFromPools } from "../lib/server/content/intelligence-read-model";
const oneTypePractice = { eventId: "one-type", opcValue: { status: "AVAILABLE" }, coverage: { practicalEvidenceCount: 2, actionablePracticalEvidenceCount: 2, actionablePracticalOriginCount: 2, actionablePracticalTypeCount: 1 } };
assert.equal(buildWorthPracticingFromPools([oneTypePractice] as never, [], [], 5).length, 0, "ONE_PRACTICAL_TYPE_CANNOT_ENTER_ANY_READ_PATH");

import { isWorthPracticingEligible } from "../lib/server/content/practical-evidence-actionability";
assert(isWorthPracticingEligible({ ...oneTypePractice, coverage: { ...oneTypePractice.coverage, actionablePracticalTypeCount: 2 } }));
assert(!isWorthPracticingEligible({ ...oneTypePractice, opcValue: { status: "NOT_ANALYZED" }, coverage: { ...oneTypePractice.coverage, actionablePracticalTypeCount: 2 } }));
console.log("WORTH_PRACTICING_SINGLE_OWNER_TWO_TYPES=PASS");

import fs from "node:fs";
const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
assert(/resolveEntitiesForContent\(\{[\s\S]*?publishedAt: item.publishedAt\s*\}, \{ allowAi: false \}\)/.test(runner), "SYSTEM_ENTITY_RESOLUTION_EXPLICIT_NO_AI");

import { runSourceCollection } from "../lib/server/content/collection-runner";
assert.rejects(runSourceCollection({} as never, "never-reached", { backfillWindow: {
  from: new Date(Date.now()-86400000).toISOString(), to: new Date(Date.now()+30000).toISOString()
} }), /COLLECTION_BACKFILL_WINDOW_INVALID/).then(()=>console.log("COLLECTION_BACKFILL_REJECTS_FUTURE_WINDOW=PASS")).catch(error=>{ console.error(error);process.exitCode=1; });

const [withContent] = parseFeedDocument('<rss><item><title>Tutorial</title><link>https://example.com/tutorial</link><description>Summary</description><content:encoded><![CDATA[<p>Install the node and configure the workflow.</p>]]></content:encoded></item></rss>', 'https://example.com/feed');
assert(withContent.excerpt?.includes("configure the workflow"), "PREFER_AVAILABLE_FEED_CONTENT_OVER_SUMMARY");
