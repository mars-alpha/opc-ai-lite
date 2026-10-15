import { evaluateBoleDailyCuration, rerankBoleDailyFeatured } from "../lib/server/content/bole-daily-curation";
import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("BOLE_DAILY_CURATION_FAILED:" + code);
  console.log(code + "=PASS");
}

const majorOfficial = evaluateBoleDailyCuration({
  ageHours: 6,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_OFFICIAL",
  practicalEvidenceCount: 0,
  independentOriginCount: 1,
  factSourceCount: 1,
  sourceQuality: 100,
  changeMagnitude: "MAJOR"
});
assert(majorOfficial.selected, "MAJOR_OFFICIAL_FEATURED");
assert(majorOfficial.score >= majorOfficial.threshold, "MAJOR_OFFICIAL_SCORE_ABOVE_THRESHOLD");
assert(majorOfficial.tier === "FEATURED", "SINGLE_SOURCE_MAJOR_NOT_AUTOMATIC_TOP_PICK");
assert(majorOfficial.timeliness === "HIGH", "FRESHNESS_HIGH");
assert(majorOfficial.evidenceStatus === "TRUSTED", "EVIDENCE_TRUSTED");

const corroboratedMajor = evaluateBoleDailyCuration({
  ageHours: 4,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_OFFICIAL",
  practicalEvidenceCount: 1,
  independentOriginCount: 2,
  factSourceCount: 2,
  sourceQuality: 100,
  changeMagnitude: "MAJOR"
});
assert(corroboratedMajor.selected, "CORROBORATED_MAJOR_SELECTED");
assert(corroboratedMajor.tier === "TOP_PICK", "CORROBORATED_MAJOR_TOP_PICK");
assert(corroboratedMajor.topPickEligible, "CORROBORATED_MAJOR_TOP_PICK_GATE");

const practicalMedia = evaluateBoleDailyCuration({
  ageHours: 40,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_MEDIA",
  practicalEvidenceCount: 2,
  independentOriginCount: 2,
  factSourceCount: 2,
  sourceQuality: 82,
  changeMagnitude: "NORMAL"
});
assert(practicalMedia.selected, "PRACTICAL_MEDIA_SELECTED");
assert(practicalMedia.practicalValue, "PRACTICAL_SIGNAL");

const ordinaryOfficial = evaluateBoleDailyCuration({
  ageHours: 3,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_OFFICIAL",
  practicalEvidenceCount: 0,
  independentOriginCount: 1,
  factSourceCount: 1,
  sourceQuality: 100,
  changeMagnitude: "NORMAL"
});
assert(ordinaryOfficial.selected, "NORMAL_OFFICIAL_CAN_BE_FEATURED_WITHOUT_PRACTICAL_EVIDENCE");
assert(ordinaryOfficial.tier === "FEATURED", "NORMAL_OFFICIAL_FEATURED_BY_COMBINED_SCORE");
assert(ordinaryOfficial.editorialValueGatePassed, "PRACTICAL_EVIDENCE_NOT_MANDATORY_GATE");

const practicalOfficial = evaluateBoleDailyCuration({
  ageHours: 5,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_OFFICIAL",
  practicalEvidenceCount: 2,
  independentOriginCount: 2,
  factSourceCount: 2,
  sourceQuality: 100,
  changeMagnitude: "NORMAL"
});
assert(practicalOfficial.selected, "PRACTICAL_OFFICIAL_SELECTED");
assert(practicalOfficial.tier === "TOP_PICK", "PRACTICAL_OFFICIAL_TOP_PICK");
assert(practicalOfficial.topPickEligible, "PRACTICAL_OFFICIAL_TOP_PICK_GATE");

const stale = evaluateBoleDailyCuration({
  ageHours: 90,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_OFFICIAL",
  practicalEvidenceCount: 3,
  independentOriginCount: 3,
  factSourceCount: 1,
  sourceQuality: 100,
  changeMagnitude: "MAJOR"
});
assert(!stale.selected, "STALE_NOT_DAILY_SELECTED");

const weak = evaluateBoleDailyCuration({
  ageHours: 8,
  aiRelevant: true,
  verificationStatus: "UNVERIFIED",
  practicalEvidenceCount: 0,
  independentOriginCount: 1,
  factSourceCount: 1,
  sourceQuality: 55,
  changeMagnitude: "NORMAL"
});
assert(!weak.selected, "WEAK_UNVERIFIED_NOT_SELECTED");
assert(!weak.gatePassed, "WEAK_UNVERIFIED_HARD_GATE");

const multiOriginUnverified = evaluateBoleDailyCuration({
  ageHours: 5,
  aiRelevant: true,
  verificationStatus: "UNVERIFIED",
  practicalEvidenceCount: 4,
  independentOriginCount: 4,
  factSourceCount: 0,
  sourceQuality: 40,
  changeMagnitude: "MAJOR"
});
assert(!multiOriginUnverified.selected, "MULTI_ORIGIN_SOCIAL_CANNOT_BYPASS_VERIFICATION");

const minorOfficial = evaluateBoleDailyCuration({
  ageHours: 2,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_OFFICIAL",
  practicalEvidenceCount: 2,
  independentOriginCount: 2,
  factSourceCount: 1,
  sourceQuality: 100,
  changeMagnitude: "MINOR"
});
assert(!minorOfficial.selected, "MINOR_OFFICIAL_NOT_FEATURED");

const unknownMagnitude = evaluateBoleDailyCuration({
  ageHours: 2,
  aiRelevant: true,
  verificationStatus: "CONFIRMED_OFFICIAL",
  practicalEvidenceCount: 3,
  independentOriginCount: 3,
  factSourceCount: 3,
  sourceQuality: 100,
  changeMagnitude: null
});
assert(!unknownMagnitude.gatePassed, "UNKNOWN_MATERIALITY_FAILS_CURATION_GATE");
assert(!unknownMagnitude.selected, "UNKNOWN_MATERIALITY_NOT_FEATURED");

const reranked = rerankBoleDailyFeatured([
  { eventId: "a1", selected: true, score: 96, sourceId: "source-a", category: "官方", publishedAt: "2026-10-14T01:00:00Z", collectedAt: "2026-10-14T01:01:00Z" },
  { eventId: "a2", selected: true, score: 94, sourceId: "source-a", category: "官方", publishedAt: "2026-10-14T00:50:00Z", collectedAt: "2026-10-14T00:51:00Z" },
  { eventId: "a3", selected: true, score: 93, sourceId: "source-a", category: "官方", publishedAt: "2026-10-14T00:40:00Z", collectedAt: "2026-10-14T00:41:00Z" },
  { eventId: "b1", selected: true, score: 92, sourceId: "source-b", category: "媒体", publishedAt: "2026-10-14T00:30:00Z", collectedAt: "2026-10-14T00:31:00Z" },
  { eventId: "c1", selected: false, score: 99, sourceId: "source-c", category: "社区", publishedAt: "2026-10-14T01:10:00Z", collectedAt: "2026-10-14T01:11:00Z" }
]);
assert(reranked.map((item) => item.eventId).join(",") === "a1,a2,b1,a3", "FEATURED_RERANK_DIVERSIFIES_TOP_POSITIONS");
assert(!reranked.some((item) => item.eventId === "c1"), "RERANK_CANNOT_PROMOTE_INELIGIBLE_ITEM");

assert(majorOfficial.authority === "PRESENTATION_ONLY", "NO_FACT_AUTHORITY");

const discovery = fs.readFileSync("lib/server/content/discovery.ts", "utf8");
assert(discovery.includes("safeEventAt"), "FUTURE_PUBLISHED_AT_GUARD");
assert(discovery.includes("eventAt: safeEventAt.toISOString()"), "EVENT_SEED_SAFE_TIMESTAMP");
const filter = fs.readFileSync("lib/server/content/discovery-filter.ts", "utf8");
assert(filter.includes("即将开幕") && filter.includes("确认出席"), "PROMOTION_NOISE_TERMS");

console.log("BOLE_DAILY_CURATION=PASS");

