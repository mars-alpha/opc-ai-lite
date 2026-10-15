import assert from "node:assert/strict";
import fs from "node:fs";
import { parseQualityFeedbackInput } from "../lib/content/collection-quality-feedback-contract";

const eventId = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";
assert.deepEqual(parseQualityFeedbackInput(eventId, { label: "NEGATIVE", requestId, sourceId: null, reason: "IRRELEVANT", note: "  test  " }), {
  eventId, label: "NEGATIVE", requestId, sourceId: null, reason: "IRRELEVANT", note: "test"
});
for (const payload of [
  { label: "POSITIVE", requestId, reason: "IRRELEVANT" },
  { label: "CLEAR", requestId, note: "x" },
  { label: "NEGATIVE", requestId, sourceId: "not-a-source" },
  { label: "NEGATIVE", requestId, reason: "UNKNOWN" },
  { label: "NEGATIVE", requestId, note: "x".repeat(501) },
  { label: "NEGATIVE", requestId: "not-uuid" }
]) assert.throws(() => parseQualityFeedbackInput(eventId, payload));

const read = (path: string) => fs.readFileSync(path, "utf8");
const service = read("lib/server/content/collection-quality-feedback.ts");
const comment = read("lib/server/content/comment-insight.ts");
const expansion = read("app/api/admin/content/discovery/events/[eventId]/expansion/route.ts");
const system = read("lib/server/content/topic-momentum-runtime.ts");
const radar = read("lib/server/content/radar-snapshot.ts");
const intelligence = read("lib/server/content/intelligence-read-model.ts");
assert.ok(service.includes("for(\"update\")") || service.includes('.for("update")'), "EVENT_LOCK_REQUIRED");
assert.ok(service.includes("recordContentAudit"), "ATOMIC_AUDIT_REQUIRED");
assert.ok(!service.includes("contentCandidateDecisions") && !service.includes(".update(contentEvents)"), "FEEDBACK_MUST_NOT_CHANGE_EVENT");
assert.ok(!fs.existsSync("app/api/admin/content/discovery/events/[eventId]/decision/route.ts"), "OLD_DECISION_ROUTE_REMAINS");
assert.ok(!expansion.includes("export async function POST"), "MANUAL_EXPANSION_POST_REMAINS");
assert.ok(system.includes("refreshSourceManagedEventExpansion"), "SYSTEM_EXPANSION_MUST_REMAIN");
assert.ok(!comment.includes("contentCandidateDecisions") && !comment.includes("EVENT_ADOPTED"), "OLD_COMMENT_TRIGGER_REMAINS");
assert.ok(!radar.includes('state.discoveryStatus !== "IGNORED"'), "OLD_SNAPSHOT_IGNORE_REMAINS");
assert.ok(!intelligence.includes('event.discoveryStatus === "IGNORED"'), "OLD_READ_IGNORE_REMAINS");
console.log("COLLECTION_QUALITY_FEEDBACK_DETERMINISTIC=PASS");
