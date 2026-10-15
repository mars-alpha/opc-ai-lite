import {
  calculateTopicMomentum,
  canonicalHotParticipantName,
  resolveTopicMomentumFollowUpHours,
  TOPIC_MOMENTUM_MAX_AGE_HOURS,
  TOPIC_MOMENTUM_MIN_AGE_HOURS,
  TOPIC_MOMENTUM_HALF_LIFE_HOURS
} from "../lib/server/content/topic-momentum";
import { qualifyCreatorCoverage } from "../lib/server/content/creator-coverage-qualification";
import fs from "node:fs";
import { isTopicMomentumFollowUpEligible } from "../lib/server/content/topic-momentum-runtime";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("TOPIC_MOMENTUM_FAILED:" + code);
  console.log(code + "=PASS");
}

const now = new Date("2026-10-12T00:00:00.000Z");
const digestMomentum = calculateTopicMomentum({ firstSeenAt: now, now, raws: [{ sourceId:"digest", sourceType:"MEDIA", sourceName:"Digest", platform:"WEB", title:"AI早报：模型发布；公司融资；产品上线", collectedAt:now, publishedAt:now }], evidence:[] });
assert(digestMomentum.independentParticipantCount === 0, "MULTI_NEWS_ROUNDUP_NOT_MOMENTUM_PARTICIPANT");
assert(isTopicMomentumFollowUpEligible({ metadata: {} }), "UNKNOWN_POLICY_RETAINED_FOR_FOLLOW_UP");
assert(!isTopicMomentumFollowUpEligible({ metadata: { eventPolicy: { aiRelevant: false } } }), "REJECTED_EVENT_NOT_REENROLLED_FROM_DUE_QUERY");
assert(!isTopicMomentumFollowUpEligible({ metadata: { eventPolicy: { operationalUsefulness: { eligible: false } } } }), "OPERATIONALLY_REJECTED_EVENT_NO_EXPANSION");
assert(!isTopicMomentumFollowUpEligible({ archivedAt: now, metadata: {} }), "ARCHIVED_EVENT_NO_FOLLOW_UP");

function raw(sourceId: string, platform: string, publishedAt: string, author: string) {
  return {
    sourceId,
    sourceType: "SOCIAL",
    sourceName: author,
    platform,
    author,
    publishedAt,
    collectedAt: publishedAt,
    metadata: { contentType: "SOCIAL_POST", originPublisher: author },
    platformMetrics: { likes: 12, comments: 3 }
  };
}

const strongRaws = [
  raw("creator-a", "YOUTUBE", "2026-10-10T08:00:00.000Z", "Creator A"),
  raw("creator-b", "X", "2026-10-11T08:00:00.000Z", "Creator B"),
  raw("creator-a", "YOUTUBE", "2026-10-11T14:00:00.000Z", "Creator A")
];
const practical = [
  { expansionType: "TUTORIAL", createdAt: "2026-10-10T10:00:00.000Z" },
  { expansionType: "EXPERIENCE", createdAt: "2026-10-11T10:00:00.000Z" }
];

const early = calculateTopicMomentum({
  firstSeenAt: "2026-10-11T12:00:00.000Z",
  raws: [
    raw("creator-a", "YOUTUBE", "2026-10-11T14:00:00.000Z", "Creator A"),
    raw("creator-b", "X", "2026-10-11T16:00:00.000Z", "Creator B")
  ],
  evidence: [{ expansionType: "TUTORIAL", createdAt: "2026-10-11T18:00:00.000Z" }],
  now
});
assert(early.phase === "EARLY_OBSERVATION", "EARLY_UNDER_24H_PHASE");
assert(early.eligible === true && early.status === "RISING", "EARLY_RISING_HOT");
assert(early.independentSourceCount >= 2, "EARLY_MULTI_SOURCE");

const aggregatorDuplicate = calculateTopicMomentum({
  firstSeenAt: "2026-10-11T12:00:00.000Z",
  raws: [
    {
      sourceId: "source-direct-techcrunch",
      sourceType: "MEDIA",
      sourceName: "TechCrunch",
      platform: "WEB",
      author: null,
      publishedAt: "2026-10-11T14:00:00.000Z",
      collectedAt: "2026-10-11T14:01:00.000Z",
      metadata: { originPublisher: "TechCrunch" },
      platformMetrics: {}
    },
    {
      sourceId: "source_radar_ai_hot",
      sourceType: "MEDIA",
      sourceName: "AI HOT",
      platform: "AI_HOT",
      author: null,
      publishedAt: "2026-10-11T14:00:00.000Z",
      collectedAt: "2026-10-11T14:02:00.000Z",
      metadata: { originPublisher: "TechCrunch", referenceOnly: true },
      platformMetrics: { score: 88 }
    }
  ],
  evidence: [],
  now
});
assert(aggregatorDuplicate.independentSourceCount === 1, "AGGREGATOR_ORIGIN_NOT_DOUBLE_COUNTED");
assert(aggregatorDuplicate.independentParticipantCount === 1, "AGGREGATOR_ORIGIN_PARTICIPANT_NOT_DOUBLE_COUNTED");

const aggregatorWrapperOnly = calculateTopicMomentum({
  firstSeenAt: "2026-10-11T12:00:00.000Z",
  raws: [{
    sourceId: "source_radar_ai_hot",
    sourceType: "MEDIA",
    sourceName: "AI HOT",
    platform: "AI_HOT",
    author: null,
    publishedAt: "2026-10-11T14:00:00.000Z",
    collectedAt: "2026-10-11T14:02:00.000Z",
    metadata: { referenceOnly: true },
    referenceOnly: true,
    signalOnly: true,
    platformMetrics: { score: 88 }
  }],
  evidence: [],
  now
});
assert(aggregatorWrapperOnly.independentParticipantCount === 0, "AGGREGATOR_WRAPPER_NOT_HOT_PARTICIPANT");

const mature = calculateTopicMomentum({
  firstSeenAt: "2026-10-08T00:00:00.000Z",
  raws: strongRaws,
  evidence: practical,
  now
});
assert(mature.phase === "MOMENTUM_WINDOW", "MATURE_96H_PHASE");
assert(mature.creatorCount >= 2, "MATURE_MULTI_CREATOR");
assert(mature.activeDayCount >= 2, "MATURE_MULTI_DAY");
assert(mature.platformCount >= 2, "MATURE_CROSS_PLATFORM");
assert(mature.eligible === true && mature.status === "SUSTAINED", "MATURE_SUSTAINED_MOMENTUM_ELIGIBLE");
assert(mature.authority === "PRESENTATION_ONLY", "MOMENTUM_NO_FACT_AUTHORITY");
assert(mature.decayFactor < 1 && mature.baseScore >= mature.score, "MOMENTUM_TIME_DECAY_APPLIED");
const matureCoverage = qualifyCreatorCoverage({
  creatorCount: mature.creatorCount,
  creatorItemCount: mature.creatorItemCount,
  platformCount: mature.platformCount,
  activeDayCount: mature.activeDayCount,
  practicalTypeCount: mature.practicalTypeCount,
  engagedCreatorItemCount: mature.engagedCreatorItemCount
});
assert(matureCoverage.status === "QUALIFIED", "CREATOR_COVERAGE_QUALIFIED");

const singleCreator = calculateTopicMomentum({
  firstSeenAt: "2026-10-08T00:00:00.000Z",
  raws: [
    raw("creator-a", "YOUTUBE", "2026-10-10T08:00:00.000Z", "Creator A"),
    raw("creator-a", "YOUTUBE", "2026-10-11T08:00:00.000Z", "Creator A")
  ],
  evidence: practical,
  now
});
assert(singleCreator.creatorCount === 1 && singleCreator.status !== "RISING", "SINGLE_CREATOR_NOT_EARLY_RISING");
const singleCoverage = qualifyCreatorCoverage({
  creatorCount: singleCreator.creatorCount,
  creatorItemCount: singleCreator.creatorItemCount,
  platformCount: singleCreator.platformCount,
  activeDayCount: singleCreator.activeDayCount,
  practicalTypeCount: singleCreator.practicalTypeCount,
  engagedCreatorItemCount: singleCreator.engagedCreatorItemCount
});
assert(singleCoverage.status === "CONDITIONAL", "SINGLE_CREATOR_COVERAGE_CONDITIONAL");

const noCreatorCoverage = qualifyCreatorCoverage({
  creatorCount: 0,
  creatorItemCount: 0,
  platformCount: 0,
  activeDayCount: 0,
  practicalTypeCount: 0,
  engagedCreatorItemCount: 0
});
assert(noCreatorCoverage.status === "GAP", "NO_CREATOR_COVERAGE_GAP");

const expired = calculateTopicMomentum({
  firstSeenAt: "2026-10-04T00:00:00.000Z",
  raws: strongRaws,
  evidence: practical,
  now
});
assert(expired.phase === "EXPIRED_WINDOW", "EXPIRED_AFTER_168H");
assert(expired.eligible === false, "EXPIRED_NOT_CURRENT_HOT");

assert(resolveTopicMomentumFollowUpHours({ day: 1, eligible: false }) === 6, "FOLLOW_UP_DAY1_6H");
assert(resolveTopicMomentumFollowUpHours({ day: 4, eligible: false }) === 12, "FOLLOW_UP_DAY4_12H");
assert(resolveTopicMomentumFollowUpHours({ day: 7, eligible: false }) === 24, "FOLLOW_UP_DAY7_24H");
assert(resolveTopicMomentumFollowUpHours({ day: 6, eligible: true }) === 6, "FOLLOW_UP_HOT_RETURNS_6H");

const comparableTrend = calculateTopicMomentum({
  firstSeenAt: "2026-10-06T00:00:00.000Z",
  raws: [
    raw("creator-a", "YOUTUBE", "2026-10-07T12:00:00.000Z", "Creator A"),
    raw("creator-b", "X", "2026-10-07T14:00:00.000Z", "Creator B"),
    raw("creator-a", "YOUTUBE", "2026-10-10T12:00:00.000Z", "Creator A"),
    raw("creator-b", "X", "2026-10-10T14:00:00.000Z", "Creator B"),
    raw("creator-a", "YOUTUBE", "2026-10-11T12:00:00.000Z", "Creator A")
  ],
  evidence: practical,
  now
});
assert(comparableTrend.trendComparable === true && comparableTrend.trend?.direction === "UP", "TREND_SAME_COHORT_COMPARABLE");
assert(comparableTrend.trend?.basis === "SAME_CONTINUOUS_PARTICIPANT_COHORT", "TREND_SAME_COHORT_ONLY");

assert(TOPIC_MOMENTUM_MIN_AGE_HOURS === 24, "WINDOW_MIN_24");
assert(TOPIC_MOMENTUM_MAX_AGE_HOURS === 168, "WINDOW_MAX_168");
assert(TOPIC_MOMENTUM_HALF_LIFE_HOURS === 72, "MOMENTUM_HALF_LIFE_72H");
assert(mature.interpretation === "讨论活跃度，不是报道质量评分", "MOMENTUM_ACTIVITY_NOT_QUALITY");
assert(mature.trend === null && mature.trendComparable === false, "TREND_HIDDEN_WITHOUT_COMPARABLE_COHORT");
const runtimeSource = fs.readFileSync("lib/server/content/topic-momentum-runtime.ts", "utf8");
assert(runtimeSource.includes("refreshSourceManagedEventExpansion") && !runtimeSource.includes("runEventExpansion("), "MOMENTUM_RUNTIME_SOURCE_MANAGEMENT_ONLY");
assert(canonicalHotParticipantName("Claude") === "Anthropic" && canonicalHotParticipantName("Anthropic") === "Anthropic", "INSTITUTION_ALIAS_MERGE_ANTHROPIC");
assert(canonicalHotParticipantName("ChatGPT") === "OpenAI" && canonicalHotParticipantName("OpenAI") === "OpenAI", "INSTITUTION_ALIAS_MERGE_OPENAI");
console.log("TOPIC_MOMENTUM_CONTRACT=PASS");
