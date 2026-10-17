import assert from "node:assert/strict";
import { evaluateAiHotspotPractice, shouldExpandHotDiscussion, type AiHotspotPracticeCandidate } from "../lib/server/content/ai-hotspot-practice";

const now = Date.parse("2026-10-16T08:00:00Z");
async function main() {
const officialSeed = { title: "Gemini 4 发布", independentParticipants: 1, lastAttemptAt: null, importantOfficialSeed: true };
assert.equal(shouldExpandHotDiscussion(officialSeed, now).eligible, true, "OFFICIAL_SEED_CAN_SEARCH_BEFORE_SECOND_PUBLISHER");

const { aiHotspotPracticePublishers } = await import("../lib/server/content/ai-hotspot-practice");
const { practiceDiscoveryDecision, readPracticeDiscoveryCheckpoint, rankPracticeDiscoveryCandidates, isSourceManagedRefreshDue, selectDiscoveryExpansionCycleCandidates } = await import("../lib/server/content/practice-discovery-policy");
const base: AiHotspotPracticeCandidate = {
  eventId: "event-1", title: "Gemini 4 发布", excerpt: "新模型正式发布", category: "模型",
  originalUrl: "https://example.org/release", hotParticipants: [{ name: "Signal A" }, { name: "Signal B" }],
  aiPracticeParticipants: [{ name: "Author A" }, { name: "Author B" }], evidenceLinks: []
};
assert.equal(evaluateAiHotspotPractice(base).eligible, false, "RELEASE_ALONE_IS_STILL_NOT_PRACTICE");
assert.equal(practiceDiscoveryDecision(base, null, now).eligible, true, "TWO_REPORTS_CAN_FIND_MISSING_TUTORIAL_WITHOUT_PRACTICE_RECORD");
const temporary={...base,evidenceLinks:[{sourceName:'Author A',originalUrl:'https://example.org/a',acquisitionFailure:'HTTP_429'}]};
assert.equal(practiceDiscoveryDecision(temporary,null,now).reason,'RETRY_EXISTING_ROUTE','FETCH_FAILURE_NOT_A_SEARCH_GAP');
assert.equal(practiceDiscoveryDecision({...temporary,evidenceLinks:temporary.evidenceLinks.map(l=>({...l,acquisitionFailure:'LOGIN_REQUIRED'}))},null,now).reason,'ACCESS_BLOCKED','AI_CANNOT_BYPASS_ACCESS');
assert.deepEqual(aiHotspotPracticePublishers({ ...base, aiPracticeParticipants: [] }), [], "EXPLICIT_EMPTY_PUBLISHERS_NEVER_FALL_BACK_TO_SIGNALS");
assert.equal(practiceDiscoveryDecision({ ...base, aiPracticeParticipants: [] }, null, now).eligible, false, "SIGNALS_CANNOT_UNLOCK_SEARCH");
assert.equal(aiHotspotPracticePublishers({ ...base, aiPracticeParticipants: [{ name: "Google AI" }, { name: "Gemini API" }] }).length, 1, "ONE_INSTITUTION_ACROSS_BRANDS");
const single = { ...base, aiPracticeParticipants: [{ name: "Google", role: "OFFICIAL" }], verificationStatus: "CONFIRMED_OFFICIAL", changeMagnitude: "NORMAL" };
assert.equal(practiceDiscoveryDecision(single, null, now).eligible, true, "IMPORTANT_SINGLE_OFFICIAL_CAN_EXPAND");
assert.equal(evaluateAiHotspotPractice(single).eligible, false, "OFFICIAL_SEED_DOES_NOT_LOWER_COLUMN_GATE");
assert.equal(practiceDiscoveryDecision({ ...single, changeMagnitude: "MINOR" }, null, now).eligible, false, "MINOR_SINGLE_SOURCE_DOES_NOT_FORCE_SEARCH");
assert.equal(practiceDiscoveryDecision({ ...base, coverage: { actionablePracticalEvidenceCount: 1 } }, null, now).reason, "MATERIALS_ALREADY_AVAILABLE");
assert.equal(practiceDiscoveryDecision({ ...base, title: "早报：Gemini 发布；Claude 上线" }, null, now).eligible, false);
const checkpoint = (status: "SUCCEEDED" | "FAILED" | "RUNNING", hoursAgo: number) => ({ status, lastAttemptAt: new Date(now - hoursAgo * 3_600_000).toISOString() });
assert.equal(practiceDiscoveryDecision(base, checkpoint("SUCCEEDED", 5), now).reason, "SEARCH_COOLDOWN");
assert.equal(practiceDiscoveryDecision(base, checkpoint("SUCCEEDED", 6), now).eligible, true);
assert.equal(practiceDiscoveryDecision(base, checkpoint("FAILED", 0.5), now).eligible, false);
assert.equal(practiceDiscoveryDecision(base, checkpoint("FAILED", 1), now).eligible, true);
assert.equal(practiceDiscoveryDecision(base, checkpoint("RUNNING", 0.1), now).eligible, false, "RUNNING_LEASE_PREVENTS_DOUBLE_REQUEST");
assert.equal(practiceDiscoveryDecision(base, checkpoint("RUNNING", 0.5), now).eligible, true, "STALE_ATTEMPT_CAN_RECOVER");
assert.equal(practiceDiscoveryDecision(base, { status: "SUCCEEDED", lastAttemptAt: "bad-date" }, now).eligible, false);
assert.equal(practiceDiscoveryDecision(base, checkpoint("SUCCEEDED", -1), now).eligible, false, "FUTURE_ATTEMPT_FAILS_CLOSED");
assert.equal(readPracticeDiscoveryCheckpoint({ sourceManagedExpansionRuntime: checkpoint("SUCCEEDED", 0) }), null, "ORDINARY_REFRESH_NEVER_SETS_SEARCH_COOLDOWN");
assert.equal(practiceDiscoveryDecision(base, readPracticeDiscoveryCheckpoint({ sourceManagedExpansionRuntime: checkpoint("SUCCEEDED", 0) }), now).eligible, true);
assert.equal(isSourceManagedRefreshDue(checkpoint("SUCCEEDED", 0), now), false);
assert.equal(isSourceManagedRefreshDue(checkpoint("FAILED", 1), now), true);
const recent = { ...base, eventId: "new", collectedAt: new Date(now), discoveryExpansion: { priority: 130 } };
const waiting = { ...base, eventId: "old", collectedAt: new Date(now - 48 * 3_600_000), discoveryExpansion: { priority: 110 } };
assert.equal(rankPracticeDiscoveryCandidates([recent, waiting], now)[0].eventId, "old", "AGING_PREVENTS_PERMANENT_NEW_EVENT_PREFERENCE");
const searchOnly={...recent,discoveryExpansion:{priority:130,trigger:"CONFIRMED_EVENT_FOLLOW_UP"},coverage:{needsExpansion:false},sourceManagedExpansionRuntime:{status:"SUCCEEDED",lastAttemptAt:new Date(now).toISOString()}};
const refresh={...searchOnly,eventId:"refresh",aiPracticeParticipants:[],coverage:{needsExpansion:true},sourceManagedExpansionRuntime:{status:"NEVER",lastAttemptAt:null}};
assert.equal(selectDiscoveryExpansionCycleCandidates([searchOnly,refresh],{searchReady:false,maxEvents:1,now})[0].eventId,"refresh","UNAVAILABLE_SEARCH_CANNOT_CONSUME_REFRESH_SLOT");
assert.equal(selectDiscoveryExpansionCycleCandidates([searchOnly,refresh],{searchReady:true,maxEvents:1,now})[0].eventId,"new");
assert.deepEqual(selectDiscoveryExpansionCycleCandidates([searchOnly,{...searchOnly,eventId:"search-2"},{...searchOnly,eventId:"search-3"},refresh],{searchReady:true,maxEvents:3,now}).map(item=>item.eventId),["new","refresh"],"ONE_SEARCH_SLOT_OTHER_SLOTS_ARE_REAL_REFRESH_WORK");
console.log("PRACTICE_DISCOVERY_POLICY=PASS");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
