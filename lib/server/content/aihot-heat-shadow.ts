import { resolveParticipantIdentity, type ResolvedParticipantIdentity } from "./participant-identity";
import { canonicalHotParticipantName } from "./topic-momentum";

export const AIHOT_HEAT_SHADOW_VERSION = "aihot-heat-shadow-v1-48h-halflife24h";
export const AIHOT_HEAT_WINDOW_HOURS = 48;
export const AIHOT_HEAT_HALF_LIFE_HOURS = 24;
export const AIHOT_HEAT_COMPARE_LAG_HOURS = 6;
export const AIHOT_HEAT_MIN_PARTICIPANTS = 2;
export const AIHOT_HEAT_MIN_EDITORIAL_PARTICIPANTS = 1;

export type AihotHeatParticipantRole = "EDITORIAL" | "SIGNAL" | "ISOLATED";

export type AihotHeatShadowRaw = {
  sourceId: string;
  sourceType: string;
  sourceName: string;
  platform: string;
  canonicalUrl?: string | null;
  author?: string | null;
  publishedAt?: Date | string | null;
  metadata?: unknown;
  sourceMetadata?: unknown;
  referenceOnly?: boolean;
  signalOnly?: boolean;
  resolvedOriginPublisher?: boolean;
};

export type AihotHeatShadowTrend = {
  comparable: boolean;
  direction: "UP" | "DOWN" | "FLAT" | "UNKNOWN";
  changePercent: number | null;
  currentHeat: number | null;
  previousHeat: number | null;
  comparableSourceCount: number;
  comparableParticipantCount: number;
  basis: "SAME_SOURCE_COHORT" | "INSUFFICIENT_COMPARABLE_COHORT";
};

type SnapshotParticipant = {
  key: string;
  name: string;
  sourceId: string;
  platform: string;
  role: Exclude<AihotHeatParticipantRole, "ISOLATED">;
  identity: ResolvedParticipantIdentity;
  activityAt: number;
  weight: number;
};

type HeatSnapshot = {
  at: number;
  participants: SnapshotParticipant[];
  rawHeat: number;
  heatIndex: number;
  editorialParticipantCount: number;
  signalParticipantCount: number;
  participantCount: number;
  sourceIds: Set<string>;
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

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function participantIdentity(raw: AihotHeatShadowRaw) {
  return resolveParticipantIdentity(raw);
}

function legacyParticipantIdentity(raw: AihotHeatShadowRaw): ResolvedParticipantIdentity {
  const rawMeta = record(raw.metadata);
  const sourceMeta = record(raw.sourceMetadata);
  const origin = text(rawMeta.originPublisher);
  const author = raw.author?.trim() ?? "";
  const explicit = [rawMeta.heatParticipation, rawMeta.intelligenceParticipation, sourceMeta.heatParticipation, sourceMeta.intelligenceParticipation]
    .map((value) => text(value).toUpperCase()).find(Boolean);
  const role = explicit === "ISOLATED" ? "ISOLATED" as const :
    explicit === "SIGNAL" || explicit === "HOT_SIGNAL" ? "SIGNAL" as const :
    explicit === "EDITORIAL" ? "EDITORIAL" as const :
    raw.resolvedOriginPublisher === true || Boolean(origin) ? "EDITORIAL" as const :
    raw.signalOnly === true || raw.referenceOnly === true ? "SIGNAL" as const :
    "EDITORIAL" as const;
  if (role === "ISOLATED" || (raw.referenceOnly === true && !origin && !author)) {
    return { version:"participant-identity-v1-owner-account-publisher", participantKey:null, participantName:null, participantType:null, ownerEntityId:null, accountId:null, platform:raw.platform, role, resolutionBasis:"LEGACY", confidence:100 };
  }
  const name = canonicalHotParticipantName(origin || author || raw.sourceName || raw.sourceId);
  return { version:"participant-identity-v1-owner-account-publisher", participantKey:name.normalize("NFKC").toLocaleLowerCase(), participantName:name, participantType:"PUBLISHER", ownerEntityId:null, accountId:author||null, platform:raw.platform, role, resolutionBasis:"LEGACY", confidence:100 };
}

function identityFor(raw: AihotHeatShadowRaw, mode: "NORMALIZED" | "LEGACY") {
  return mode === "LEGACY" ? legacyParticipantIdentity(raw) : participantIdentity(raw);
}

function sourceActivityAt(raw: AihotHeatShadowRaw) {
  // Heat is based on source publication / observation time. Collection time is
  // deliberately excluded so a delayed collector cannot make old discussion look new.
  const published = timeOf(raw.publishedAt);
  if (published) return published;
  const meta = record(raw.metadata);
  return (
    timeOf(text(meta.observedAt)) ||
    timeOf(text(meta.sourceObservedAt)) ||
    timeOf(text(meta.originObservedAt)) ||
    0
  );
}

function decayWeight(ageHours: number) {
  if (ageHours < 0 || ageHours > AIHOT_HEAT_WINDOW_HOURS) return 0;
  return Math.pow(0.5, ageHours / AIHOT_HEAT_HALF_LIFE_HOURS);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function snapshot(
  raws: AihotHeatShadowRaw[],
  evaluationAt: number,
  sourceFilter?: Set<string>,
  identityMode: "NORMALIZED" | "LEGACY" = "NORMALIZED"
): HeatSnapshot {
  const windowStart = evaluationAt - AIHOT_HEAT_WINDOW_HOURS * 3_600_000;
  const latest = new Map<string, { raw: AihotHeatShadowRaw; at: number; role: Exclude<AihotHeatParticipantRole, "ISOLATED"> }>();

  for (const raw of raws) {
    if (sourceFilter && !sourceFilter.has(raw.sourceId)) continue;
    const identity = identityFor(raw, identityMode);
    const role = identity.role;
    if (role === "ISOLATED") continue;
    const key = identity.participantKey;
    if (!key) continue;
    const at = sourceActivityAt(raw);
    if (!at || at < windowStart || at > evaluationAt) continue;
    const current = latest.get(key);
    if (!current || at > current.at) latest.set(key, { raw, at, role });
  }

  const participants = [...latest.entries()].map(([key, item]) => {
    const ageHours = Math.max(0, (evaluationAt - item.at) / 3_600_000);
    return {
      key,
      name: identityFor(item.raw, identityMode).participantName ?? key,
      sourceId: item.raw.sourceId,
      platform: item.raw.platform,
      role: item.role,
      identity: identityFor(item.raw, identityMode),
      activityAt: item.at,
      weight: decayWeight(ageHours)
    };
  }).sort((a, b) => b.weight - a.weight || a.key.localeCompare(b.key));

  const rawHeat = participants.reduce((sum, item) => sum + item.weight, 0);
  return {
    at: evaluationAt,
    participants,
    rawHeat: round2(rawHeat),
    heatIndex: Math.round(rawHeat * 10),
    editorialParticipantCount: participants.filter((item) => item.role === "EDITORIAL").length,
    signalParticipantCount: participants.filter((item) => item.role === "SIGNAL").length,
    participantCount: participants.length,
    sourceIds: new Set(participants.map((item) => item.sourceId))
  };
}

function sourceIntersection(a: Set<string>, b: Set<string>) {
  return new Set([...a].filter((item) => b.has(item)));
}

function trendFor(raws: AihotHeatShadowRaw[], current: HeatSnapshot, evaluationAt: number, identityMode: "NORMALIZED" | "LEGACY" = "NORMALIZED"): AihotHeatShadowTrend {
  const previousAt = evaluationAt - AIHOT_HEAT_COMPARE_LAG_HOURS * 3_600_000;
  const previousAll = snapshot(raws, previousAt, undefined, identityMode);
  const comparableSources = sourceIntersection(current.sourceIds, previousAll.sourceIds);

  if (comparableSources.size < 2) {
    return {
      comparable: false,
      direction: "UNKNOWN",
      changePercent: null,
      currentHeat: null,
      previousHeat: null,
      comparableSourceCount: comparableSources.size,
      comparableParticipantCount: 0,
      basis: "INSUFFICIENT_COMPARABLE_COHORT"
    };
  }

  const currentComparable = snapshot(raws, evaluationAt, comparableSources, identityMode);
  const previousComparable = snapshot(raws, previousAt, comparableSources, identityMode);
  if (
    currentComparable.participantCount < 2 ||
    previousComparable.participantCount < 2 ||
    previousComparable.rawHeat <= 0
  ) {
    return {
      comparable: false,
      direction: "UNKNOWN",
      changePercent: null,
      currentHeat: null,
      previousHeat: null,
      comparableSourceCount: comparableSources.size,
      comparableParticipantCount: Math.min(currentComparable.participantCount, previousComparable.participantCount),
      basis: "INSUFFICIENT_COMPARABLE_COHORT"
    };
  }

  const changePercent = Math.round(
    ((currentComparable.rawHeat - previousComparable.rawHeat) / previousComparable.rawHeat) * 100
  );
  return {
    comparable: true,
    direction: changePercent > 10 ? "UP" : changePercent < -10 ? "DOWN" : "FLAT",
    changePercent,
    currentHeat: currentComparable.heatIndex,
    previousHeat: previousComparable.heatIndex,
    comparableSourceCount: comparableSources.size,
    comparableParticipantCount: Math.min(currentComparable.participantCount, previousComparable.participantCount),
    basis: "SAME_SOURCE_COHORT"
  };
}

export function calculateAihotHeatShadow(input: {
  raws: AihotHeatShadowRaw[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const current = snapshot(input.raws, nowMs);
  const trend = trendFor(input.raws, current, nowMs);
  const legacy = snapshot(input.raws, nowMs, undefined, "LEGACY");
  const firstActivityAt = current.participants.length
    ? Math.min(...current.participants.map((item) => item.activityAt))
    : 0;
  const isNew = Boolean(firstActivityAt && nowMs - firstActivityAt < AIHOT_HEAT_COMPARE_LAG_HOURS * 3_600_000);
  const recent6hParticipantCount = current.participants.filter(
    (item) => nowMs - item.activityAt <= AIHOT_HEAT_COMPARE_LAG_HOURS * 3_600_000
  ).length;
  const recent6hRatio = current.participantCount
    ? recent6hParticipantCount / current.participantCount
    : 0;
  const surge = recent6hParticipantCount >= 3 && recent6hRatio >= 0.5;
  const rising = !surge && trend.comparable && (trend.changePercent ?? 0) > 15;
  const eligible =
    current.participantCount >= AIHOT_HEAT_MIN_PARTICIPANTS &&
    current.editorialParticipantCount >= AIHOT_HEAT_MIN_EDITORIAL_PARTICIPANTS;

  return {
    version: AIHOT_HEAT_SHADOW_VERSION,
    authority: "SHADOW_ONLY" as const,
    interpretation: "纯讨论活跃度，不代表报道质量或精选价值" as const,
    windowHours: AIHOT_HEAT_WINDOW_HOURS,
    halfLifeHours: AIHOT_HEAT_HALF_LIFE_HOURS,
    compareLagHours: AIHOT_HEAT_COMPARE_LAG_HOURS,
    score: current.heatIndex,
    rawHeat: current.rawHeat,
    eligible,
    participantCount: current.participantCount,
    editorialParticipantCount: current.editorialParticipantCount,
    signalParticipantCount: current.signalParticipantCount,
    editorialSourceCount: new Set(current.participants.filter((item) => item.role === "EDITORIAL").map((item) => item.sourceId)).size,
    signalSourceCount: new Set(current.participants.filter((item) => item.role === "SIGNAL").map((item) => item.sourceId)).size,
    recent6hParticipantCount,
    recent6hRatio: round2(recent6hRatio),
    isNew,
    surge,
    rising,
    trend,
    identityAudit: {
      version: "participant-identity-v1-owner-account-publisher" as const,
      legacyScore: legacy.heatIndex,
      legacyParticipantCount: legacy.participantCount,
      normalizedScore: current.heatIndex,
      normalizedParticipantCount: current.participantCount,
      participantDelta: current.participantCount - legacy.participantCount,
      scoreDelta: current.heatIndex - legacy.heatIndex
    },
    participants: current.participants.map((item) => ({
      key: item.key,
      name: item.name,
      sourceId: item.sourceId,
      platform: item.platform,
      role: item.role,
      identity: item.identity,
      activityAt: new Date(item.activityAt).toISOString(),
      weight: round2(item.weight)
    })),
    criteria: {
      minParticipants: current.participantCount >= AIHOT_HEAT_MIN_PARTICIPANTS,
      hasEditorialParticipant: current.editorialParticipantCount >= AIHOT_HEAT_MIN_EDITORIAL_PARTICIPANTS,
      latestPerParticipantOnly: true,
      publicationOrObservationTimeOnly: true,
      sameSourceCohortTrendOnly: true
    }
  };
}
