import {resolveParticipantIdentity} from './participant-identity';
import {canonicalHotParticipantName} from './participant-name';
export {canonicalHotParticipantName} from './participant-name';
import {DEFAULT_RADAR_ALGORITHM_POLICY,columnTextDecision,type RadarAlgorithmPolicy} from '../../content/radar-algorithm-policy';
import { isMultiNewsRoundup } from "./content-evidence-signals";
export const TOPIC_MOMENTUM_VERSION = "topic-momentum-v9-signal-time-identity";
export const TOPIC_MOMENTUM_MIN_AGE_HOURS = 24;
export const TOPIC_MOMENTUM_MAX_AGE_HOURS = 168;
export const TOPIC_MOMENTUM_HALF_LIFE_HOURS = 72;

export function resolveTopicMomentumFollowUpHours(input: { day: number; eligible: boolean }) {
  if (input.eligible) return 6;
  if (input.day <= 2) return 6;
  if (input.day <= 5) return 12;
  return 24;
}

export type TopicMomentumRaw = {
  canonicalUrl?:string|null;
  originalUrl?:string|null;
  sourceMetadata?:unknown;
  title?: string | null;
  excerpt?:string|null;
  /** Assigned only by the qualified, original-URL reporting projection. */
  discussionPublisher?:string|null;
  sourceId: string;
  sourceType: string;
  sourceName: string;
  platform: string;
  author?: string | null;
  publishedAt?: Date | string | null;
  collectedAt: Date | string;
  metadata?: unknown;
  platformMetrics?: unknown;
  referenceOnly?: boolean;
  signalOnly?: boolean;
};

export type TopicMomentumEvidence = {
  expansionType: string;
  createdAt?: Date | string | null;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function timeOf(value: Date | string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function identity(raw:TopicMomentumRaw){return resolveParticipantIdentity({...raw,canonicalUrl:raw.canonicalUrl,resolvedOriginPublisher:raw.referenceOnly===true&&Boolean(record(raw.metadata).originPublisher)});}
function participantName(raw:TopicMomentumRaw){const value=identity(raw);return value.role==='EDITORIAL'?value.participantName:null;}
export function hotParticipantName(raw:TopicMomentumRaw){return participantName(raw);}
function normalizedParticipantKey(raw:TopicMomentumRaw){const value=identity(raw);return value.role==='EDITORIAL'?value.participantKey:null;}
function normalizedCreatorKey(raw:TopicMomentumRaw){return normalizedParticipantKey(raw);}
/** Publication only. Discovery, collection and update timestamps cannot renew a signal. */
export function momentumSignalTime(raw:TopicMomentumRaw){
 const meta=record(raw.metadata);
 if(meta.publicationTimeBasis==='UPDATED_ONLY'||meta.publicationTimePrecision==='UNKNOWN')return 0;
 return timeOf(raw.publishedAt);
}
function isCreatorLike(raw: TopicMomentumRaw) {
  const type = raw.sourceType.toUpperCase();
  const metadata = record(raw.metadata);
  const contentType = String(metadata.contentType ?? "").toUpperCase();
  return (
    ["SOCIAL", "DEVELOPER", "MANAGED_SOURCE"].includes(type) ||
    ["SOCIAL_POST", "VIDEO", "REPO_RELEASE", "TRENDING_REPO", "PRODUCT_LISTING"].includes(contentType) ||
    Boolean(raw.author?.trim()) && !["OFFICIAL", "MEDIA", "RESEARCH"].includes(type)
  );
}

function positiveMetricCount(value: unknown) {
  const metrics = record(value);
  return Object.values(metrics).filter((item) => typeof item === "number" && Number.isFinite(item) && item > 0).length;
}

function clampMomentumScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function momentumDecayFactor(ageHours: number, halfLifeHours=TOPIC_MOMENTUM_HALF_LIFE_HOURS) {
  if (ageHours < 0) return 1;
  if (ageHours > TOPIC_MOMENTUM_MAX_AGE_HOURS) return 0;
  return Math.pow(0.5, ageHours / halfLifeHours);
}

export function calculateTopicMomentum(input: {
  firstSeenAt: Date | string;
  raws: TopicMomentumRaw[];
  evidence: TopicMomentumEvidence[];
  now?: Date;
  policy?: RadarAlgorithmPolicy;
}) {
  const config=(input.policy??DEFAULT_RADAR_ALGORITHM_POLICY).hot;
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const firstSeenMs = timeOf(input.firstSeenAt);
  const ageHours = Math.max(0, (nowMs - firstSeenMs) / 3_600_000);
  const windowStart = nowMs - TOPIC_MOMENTUM_MAX_AGE_HOURS * 3_600_000;

  const uniqueSignals=new Map<string,TopicMomentumRaw>();
  for(const raw of input.raws){const meta=record(raw.metadata);const key=JSON.stringify(meta.syndicationOriginUrl||meta.originalContentHash?['SYNDICATION',meta.syndicationOriginUrl||meta.originalContentHash]:[normalizedParticipantKey(raw),raw.originalUrl||raw.title||momentumSignalTime(raw)]);const old=uniqueSignals.get(key);if(!old||momentumSignalTime(raw)<momentumSignalTime(old))uniqueSignals.set(key,raw);}
  const recentRaws = [...uniqueSignals.values()].filter((raw) => {
    if (isMultiNewsRoundup(raw.title)) return false;
    const time = momentumSignalTime(raw);
    return time > 0 && time >= windowStart && time <= nowMs;
  });
  const textRule=columnTextDecision(recentRaws.map(r=>`${r.title??''} ${r.excerpt??''}`).join('\n'),config);
  const participantRaws = recentRaws.filter((raw) => normalizedParticipantKey(raw) !== null);
  const creatorRaws = participantRaws.filter(isCreatorLike);
  const creatorKeys = new Set(creatorRaws.flatMap((raw) => {
    const key = normalizedCreatorKey(raw);
    return key ? [key] : [];
  }));
  const participantKeys = new Set(participantRaws.flatMap((raw) => {
    const key = normalizedParticipantKey(raw);
    return key ? [key] : [];
  }));
  const latestParticipantActivity = new Map<string, number>();
  for (const raw of participantRaws) {
    const key = normalizedParticipantKey(raw);
    if (!key) continue;
    const time = momentumSignalTime(raw);
    if (time > (latestParticipantActivity.get(key) ?? 0)) latestParticipantActivity.set(key, time);
  }
  const participantActivity = [...latestParticipantActivity.values()].reduce((sum, time) => {
    const participantAgeHours = Math.max(0, (nowMs - time) / 3_600_000);
    return sum + momentumDecayFactor(participantAgeHours,config.halfLifeHours);
  }, 0);
  const currentTrendStart = nowMs - 72 * 3_600_000;
  const previousTrendStart = nowMs - 144 * 3_600_000;
  const currentTrendRaws = participantRaws.filter((raw) => {
    const time = momentumSignalTime(raw);
    return time >= currentTrendStart && time <= nowMs;
  });
  const previousTrendRaws = participantRaws.filter((raw) => {
    const time = momentumSignalTime(raw);
    return time >= previousTrendStart && time < currentTrendStart;
  });
  const currentTrendKeys = new Set(currentTrendRaws.flatMap((raw) => {
    const key = normalizedParticipantKey(raw);
    return key ? [key] : [];
  }));
  const previousTrendKeys = new Set(previousTrendRaws.flatMap((raw) => {
    const key = normalizedParticipantKey(raw);
    return key ? [key] : [];
  }));
  const stableKeys=new Set([...currentTrendKeys].filter(key=>previousTrendKeys.has(key)));
  const currentStable=currentTrendRaws.filter(raw=>stableKeys.has(normalizedParticipantKey(raw)!));
  const previousStable=previousTrendRaws.filter(raw=>stableKeys.has(normalizedParticipantKey(raw)!));
  const trendComparable=stableKeys.size>=2;
  const trend = trendComparable && previousTrendRaws.length > 0
    ? (() => {
        const changePercent = Math.round(((currentStable.length - previousStable.length) / previousStable.length) * 100);
        return {
          direction: changePercent > 10 ? "UP" as const : changePercent < -10 ? "DOWN" as const : "FLAT" as const,
          changePercent,
          currentItemCount: currentStable.length,
          previousItemCount: previousStable.length,
          comparableParticipantCount: stableKeys.size,
          basis: "SAME_CONTINUOUS_PARTICIPANT_COHORT" as const
        };
      })()
    : null;
  const platforms = new Set(participantRaws.map((raw) => raw.platform).filter(Boolean));
  const activeDays = new Set(
    participantRaws.map((raw) => {
      const time = momentumSignalTime(raw);
      return new Date(time).toISOString().slice(0, 10);
    })
  );

  const practicalTypes = new Set(
    input.evidence
      .filter((item) => ["EXPERIENCE", "TUTORIAL", "USE_CASE", "WORK_IMPACT", "DEMO"].includes(item.expansionType))
      .map((item) => item.expansionType)
  );
  const engagedCreatorItems = creatorRaws.filter((raw) => positiveMetricCount(raw.platformMetrics) > 0).length;

  const latestSignalMs=Math.max(0,...participantRaws.map(momentumSignalTime));
  const recentSignalAge=latestSignalMs?(nowMs-latestSignalMs)/3600000:Infinity;
  const revived=ageHours>TOPIC_MOMENTUM_MAX_AGE_HOURS&&participantKeys.size>=2;
  const phase =
    ageHours < TOPIC_MOMENTUM_MIN_AGE_HOURS ? "EARLY_OBSERVATION" as const :
    (ageHours <= TOPIC_MOMENTUM_MAX_AGE_HOURS || revived) ? "MOMENTUM_WINDOW" as const :
    "EXPIRED_WINDOW" as const;

  const diversitySupport =
    Math.min(config.activeDayCap, activeDays.size * config.activeDayWeight) +
    Math.min(config.creatorCap, creatorKeys.size * config.creatorWeight) +
    Math.min(config.diversityCap, Math.max(platforms.size, practicalTypes.size) * config.diversityWeight) +
    (engagedCreatorItems > 0 ? config.engagementBonus : 0);
  const decayFactor = momentumDecayFactor(recentSignalAge,config.halfLifeHours);
  const baseScore = clampMomentumScore(Math.min(config.participantCap, participantActivity * config.participantWeight) + diversitySupport);
  // Participant activity decays independently at 72h. Diversity support uses the same
  // event-level half-life so old breadth cannot keep an inactive Event artificially hot.
  const score = clampMomentumScore(Math.min(config.participantCap, participantActivity * config.participantWeight) + diversitySupport * decayFactor);
  const discussionParticipants=new Set(participantRaws.flatMap(raw=>raw.discussionPublisher?[normalizedParticipantKey(raw)!]:[]));
  const hasSubstantiveDiscussion=participantRaws.some(raw=>raw.discussionPublisher&&/分析|解读|实测|评测|对比|实践|教程|工作流|analysis|review|benchmark|compar(?:e|ison)|evaluat|hands[- ]?on|tutorial|how to|use case|workflows?|deploy|configur/i.test(`${raw.title??''} ${raw.excerpt??''}`));
  const discussionSignal=discussionParticipants.size>=config.minSustainedPublishers&&hasSubstantiveDiscussion&&score>=config.discussionThreshold;
  const earlySignal =
    phase === "EARLY_OBSERVATION" &&
    score >= config.risingThreshold &&
    (participantKeys.size >= 2 || creatorKeys.size >= 2 || practicalTypes.size >= 1);
  const sustained =
    phase === "MOMENTUM_WINDOW" &&
    participantKeys.size >= config.minSustainedPublishers &&
    activeDays.size >= config.minActiveDays &&
    (creatorKeys.size >= 2 || platforms.size >= 2 || practicalTypes.size >= 1) &&
    score >= config.sustainedThreshold;
  const discussionRising=phase==='EARLY_OBSERVATION'&&discussionSignal;
  const discussionSustained=phase==='MOMENTUM_WINDOW'&&discussionSignal;
  const eligible = textRule.eligible && (earlySignal || sustained || discussionRising || discussionSustained);
  const status =
    phase === "EXPIRED_WINDOW" ? "EXPIRED" as const :
    textRule.eligible && (sustained || discussionSustained) ? "SUSTAINED" as const :
    textRule.eligible && (earlySignal || discussionRising) ? "RISING" as const :
    "OBSERVING" as const;

  return {
    version: TOPIC_MOMENTUM_VERSION,
    authority: "PRESENTATION_ONLY" as const,
    windowHours: TOPIC_MOMENTUM_MAX_AGE_HOURS,
    minAgeHours: TOPIC_MOMENTUM_MIN_AGE_HOURS,
    ageHours: Math.round(ageHours * 10) / 10,
    phase,
    eligible,
    status,
    score,
    baseScore,
    decayFactor,
    independentSourceCount: participantKeys.size,
    independentParticipantCount: participantKeys.size,
    publicReadableSourceCount: new Set(participantRaws.filter((raw) => raw.referenceOnly !== true && raw.signalOnly !== true).flatMap((raw) => {
      const key = normalizedParticipantKey(raw);
      return key ? [key] : [];
    })).size,
    participantActivity: Math.round(participantActivity * 100) / 100,
    halfLifeHours: config.halfLifeHours,
    textRule,
    trend,
    trendComparable,
    newParticipantCount:[...currentTrendKeys].filter(key=>!previousTrendKeys.has(key)).length,
    revived,
    asOf:now.toISOString(),
    latestSignalAt:latestSignalMs?new Date(latestSignalMs).toISOString():null,
    excludedUnknownTimeCount:input.raws.filter(raw=>!momentumSignalTime(raw)).length,
    creatorCount: creatorKeys.size,
    creatorItemCount: creatorRaws.length,
    activeDayCount: activeDays.size,
    platformCount: platforms.size,
    practicalTypeCount: practicalTypes.size,
    practicalTypes: [...practicalTypes].sort(),
    engagedCreatorItemCount: engagedCreatorItems,
    discussionParticipantCount:discussionParticipants.size,
    hasSubstantiveDiscussion,
    criteria: {
      multiSource: participantKeys.size >= 2,
      multiCreator: creatorKeys.size >= 2,
      multiDay: activeDays.size >= 2,
      crossPlatformOrPracticalDiversity: platforms.size >= 2 || practicalTypes.size >= 1,
      hasEngagementEvidence: engagedCreatorItems > 0
    },
    interpretation: "讨论活跃度，不是报道质量评分" as const
  };
}
