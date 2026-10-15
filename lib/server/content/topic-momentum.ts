import { isMultiNewsRoundup } from "./practical-evidence-actionability";
export const TOPIC_MOMENTUM_VERSION = "topic-momentum-v7-independent-institutions-decay";
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
  title?: string | null;
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

const PARTICIPANT_ALIASES: Array<[RegExp, string]> = [
  [/\b(openai|chatgpt)\b/i, "OpenAI"],
  [/\b(anthropic|claude)\b/i, "Anthropic"],
  [/\bgoogle\s*deepmind\b|\bdeepmind\b/i, "Google DeepMind"],
  [/\bgoogle\s+ai\b/i, "Google AI"],
  [/\bmicrosoft\b/i, "Microsoft"],
  [/\bgithub\b/i, "GitHub"],
  [/\bnvidia\b/i, "NVIDIA"],
  [/\bmistral(?:\s+ai)?\b/i, "Mistral AI"],
  [/\bhugging\s*face\b/i, "Hugging Face"],
  [/\b(qwen|通义千问|阿里云.*通义)\b/i, "Qwen"],
  [/\b(meta\s+ai|meta)\b/i, "Meta"],
  [/\b(xai|x\.ai|grok)\b/i, "xAI"],
  [/\bamazon\s+web\s+services\b|\baws\b/i, "AWS"]
];

export function canonicalHotParticipantName(value: string) {
  const normalized = value.normalize("NFKC").replace(/\s+/g, " ").trim();
  for (const [pattern, canonical] of PARTICIPANT_ALIASES) {
    if (pattern.test(normalized)) return canonical;
  }
  return normalized;
}

function participantName(raw: TopicMomentumRaw) {
  const metadata = record(raw.metadata);
  const origin = typeof metadata.originPublisher === "string" ? metadata.originPublisher.trim() : "";
  const author = raw.author?.trim() ?? "";
  if (raw.referenceOnly === true && !origin && !author) return null;
  return canonicalHotParticipantName(origin || author || raw.sourceName || raw.sourceId);
}

function normalizedParticipantKey(raw: TopicMomentumRaw) {
  const name = participantName(raw);
  return name ? name.normalize("NFKC").toLocaleLowerCase() : null;
}

function normalizedCreatorKey(raw: TopicMomentumRaw) {
  return normalizedParticipantKey(raw);
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

function momentumDecayFactor(ageHours: number) {
  if (ageHours < 0) return 1;
  if (ageHours > TOPIC_MOMENTUM_MAX_AGE_HOURS) return 0;
  return Math.pow(0.5, ageHours / TOPIC_MOMENTUM_HALF_LIFE_HOURS);
}

export function calculateTopicMomentum(input: {
  firstSeenAt: Date | string;
  raws: TopicMomentumRaw[];
  evidence: TopicMomentumEvidence[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const firstSeenMs = timeOf(input.firstSeenAt);
  const ageHours = Math.max(0, (nowMs - firstSeenMs) / 3_600_000);
  const windowStart = nowMs - TOPIC_MOMENTUM_MAX_AGE_HOURS * 3_600_000;

  const recentRaws = input.raws.filter((raw) => {
    if (isMultiNewsRoundup(raw.title)) return false;
    const time = timeOf(raw.publishedAt) || timeOf(raw.collectedAt);
    return time >= windowStart && time <= nowMs;
  });
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
    const time = timeOf(raw.publishedAt) || timeOf(raw.collectedAt);
    if (time > (latestParticipantActivity.get(key) ?? 0)) latestParticipantActivity.set(key, time);
  }
  const participantActivity = [...latestParticipantActivity.values()].reduce((sum, time) => {
    const participantAgeHours = Math.max(0, (nowMs - time) / 3_600_000);
    return sum + momentumDecayFactor(participantAgeHours);
  }, 0);
  const currentTrendStart = nowMs - 72 * 3_600_000;
  const previousTrendStart = nowMs - 144 * 3_600_000;
  const currentTrendRaws = participantRaws.filter((raw) => {
    const time = timeOf(raw.publishedAt) || timeOf(raw.collectedAt);
    return time >= currentTrendStart && time <= nowMs;
  });
  const previousTrendRaws = participantRaws.filter((raw) => {
    const time = timeOf(raw.publishedAt) || timeOf(raw.collectedAt);
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
  const trendComparable =
    currentTrendKeys.size >= 2 &&
    currentTrendKeys.size === previousTrendKeys.size &&
    [...currentTrendKeys].every((key) => previousTrendKeys.has(key));
  const trend = trendComparable && previousTrendRaws.length > 0
    ? (() => {
        const changePercent = Math.round(((currentTrendRaws.length - previousTrendRaws.length) / previousTrendRaws.length) * 100);
        return {
          direction: changePercent > 10 ? "UP" as const : changePercent < -10 ? "DOWN" as const : "FLAT" as const,
          changePercent,
          currentItemCount: currentTrendRaws.length,
          previousItemCount: previousTrendRaws.length,
          comparableParticipantCount: currentTrendKeys.size,
          basis: "SAME_CONTINUOUS_PARTICIPANT_COHORT" as const
        };
      })()
    : null;
  const platforms = new Set(participantRaws.map((raw) => raw.platform).filter(Boolean));
  const activeDays = new Set(
    participantRaws.map((raw) => {
      const time = timeOf(raw.publishedAt) || timeOf(raw.collectedAt);
      return new Date(time).toISOString().slice(0, 10);
    })
  );

  const practicalTypes = new Set(
    input.evidence
      .filter((item) => ["EXPERIENCE", "TUTORIAL", "USE_CASE", "WORK_IMPACT", "DEMO"].includes(item.expansionType))
      .map((item) => item.expansionType)
  );
  const engagedCreatorItems = creatorRaws.filter((raw) => positiveMetricCount(raw.platformMetrics) > 0).length;

  const phase =
    ageHours < TOPIC_MOMENTUM_MIN_AGE_HOURS ? "EARLY_OBSERVATION" as const :
    ageHours <= TOPIC_MOMENTUM_MAX_AGE_HOURS ? "MOMENTUM_WINDOW" as const :
    "EXPIRED_WINDOW" as const;

  const diversitySupport =
    Math.min(15, activeDays.size * 5) +
    Math.min(10, creatorKeys.size * 4) +
    Math.min(10, Math.max(platforms.size, practicalTypes.size) * 3) +
    (engagedCreatorItems > 0 ? 5 : 0);
  const decayFactor = momentumDecayFactor(ageHours);
  const baseScore = clampMomentumScore(Math.min(60, participantActivity * 18) + diversitySupport);
  // Participant activity decays independently at 72h. Diversity support uses the same
  // event-level half-life so old breadth cannot keep an inactive Event artificially hot.
  const score = clampMomentumScore(Math.min(60, participantActivity * 18) + diversitySupport * decayFactor);
  const earlySignal =
    phase === "EARLY_OBSERVATION" &&
    score >= 30 &&
    (participantKeys.size >= 2 || creatorKeys.size >= 2 || practicalTypes.size >= 1);
  const sustained =
    phase === "MOMENTUM_WINDOW" &&
    participantKeys.size >= 2 &&
    activeDays.size >= 2 &&
    (creatorKeys.size >= 2 || platforms.size >= 2 || practicalTypes.size >= 1) &&
    score >= 42;
  const eligible = earlySignal || sustained;
  const status =
    phase === "EXPIRED_WINDOW" ? "EXPIRED" as const :
    sustained ? "SUSTAINED" as const :
    earlySignal ? "RISING" as const :
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
    halfLifeHours: TOPIC_MOMENTUM_HALF_LIFE_HOURS,
    trend,
    trendComparable,
    creatorCount: creatorKeys.size,
    creatorItemCount: creatorRaws.length,
    activeDayCount: activeDays.size,
    platformCount: platforms.size,
    practicalTypeCount: practicalTypes.size,
    practicalTypes: [...practicalTypes].sort(),
    engagedCreatorItemCount: engagedCreatorItems,
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
