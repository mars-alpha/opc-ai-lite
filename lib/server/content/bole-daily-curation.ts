import "server-only";

export const BOLE_DAILY_CURATION_VERSION = "bole-daily-curation-v6-recall-balanced";
export const BOLE_DAILY_CURATION_THRESHOLD = 66;
export const BOLE_DAILY_TOP_PICK_THRESHOLD = 78;

export type BoleCurationInput = {
  ageHours: number;
  aiRelevant: boolean;
  verificationStatus: string;
  practicalEvidenceCount: number;
  independentOriginCount: number;
  factSourceCount: number;
  sourceQuality: number;
  changeMagnitude: string | null;
};

export type BoleFeaturedRerankInput = {
  eventId: string;
  selected: boolean;
  score: number;
  sourceId: string;
  category: string;
  publishedAt: Date | string | null;
  collectedAt: Date | string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function freshnessScore(ageHours: number) {
  if (ageHours <= 6) return 100;
  if (ageHours <= 12) return 92;
  if (ageHours <= 24) return 82;
  if (ageHours <= 48) return 65;
  if (ageHours <= 72) return 45;
  return 0;
}

function evidenceQualityScore(input: BoleCurationInput) {
  const statusBase =
    input.verificationStatus === "CONFIRMED_OFFICIAL" ? 100 :
    input.verificationStatus === "CONFIRMED_MEDIA" ? 88 :
    input.independentOriginCount >= 3 ? 80 :
    input.independentOriginCount >= 2 ? 72 :
    input.factSourceCount > 0 ? 55 :
    20;
  return clampScore(statusBase * 0.65 + clampScore(input.sourceQuality) * 0.35);
}

function importanceScore(changeMagnitude: string | null) {
  if (changeMagnitude === "MAJOR") return 100;
  if (changeMagnitude === "NORMAL") return 70;
  if (changeMagnitude === "MINOR") return 20;
  return 0;
}

function practicalValueScore(practicalEvidenceCount: number) {
  if (practicalEvidenceCount >= 3) return 100;
  if (practicalEvidenceCount === 2) return 85;
  if (practicalEvidenceCount === 1) return 65;
  return 0;
}

function independenceScore(independentOriginCount: number) {
  if (independentOriginCount >= 3) return 100;
  if (independentOriginCount === 2) return 75;
  if (independentOriginCount === 1) return 25;
  return 0;
}

function corroborationScore(factSourceCount: number) {
  if (factSourceCount >= 3) return 100;
  if (factSourceCount === 2) return 75;
  if (factSourceCount === 1) return 35;
  return 0;
}

function itemTime(item: BoleFeaturedRerankInput) {
  const value = item.publishedAt ?? item.collectedAt;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

/**
 * Final presentation re-ranking for already-eligible Featured items.
 *
 * Eligibility and the editorial score stay untouched. The first pass applies soft
 * diversity caps so one publisher or one category cannot consume the scarce top
 * positions; a second pass fills every remaining slot in score/freshness order.
 * This means diversity can change order, never Fact authority or Featured eligibility.
 */
export function rerankBoleDailyFeatured<T extends BoleFeaturedRerankInput>(items: T[]) {
  const ranked = items
    .filter((item) => item.selected)
    .sort((left, right) => right.score - left.score || itemTime(right) - itemTime(left));
  const preferred: T[] = [];
  const deferred: T[] = [];
  const sourceCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const item of ranked) {
    const sourceCount = sourceCounts.get(item.sourceId) ?? 0;
    const categoryCount = categoryCounts.get(item.category) ?? 0;
    if (sourceCount < 2 && categoryCount < 3) {
      preferred.push(item);
      sourceCounts.set(item.sourceId, sourceCount + 1);
      categoryCounts.set(item.category, categoryCount + 1);
    } else {
      deferred.push(item);
    }
  }

  return [...preferred, ...deferred].map((item, index) => ({
    eventId: item.eventId,
    featuredRank: index + 1
  }));
}

export function buildBoleRecommendationReason(input: {
  tier: "TOP_PICK" | "FEATURED" | "QUALIFIED" | "REJECTED";
  verificationStatus: string;
  changeMagnitude: string | null;
  practicalEvidenceCount: number;
  independentOriginCount: number;
  factSourceCount: number;
  ageHours: number;
}) {
  if (input.tier !== "TOP_PICK" && input.tier !== "FEATURED") return null;
  const parts: string[] = [];
  if (input.changeMagnitude === "MAJOR") parts.push("属于重要更新");
  else if (input.changeMagnitude === "NORMAL") parts.push("有明确实质变化");
  if (input.verificationStatus === "CONFIRMED_OFFICIAL") parts.push("官方一手信息已确认");
  else if (input.verificationStatus === "CONFIRMED_MEDIA") parts.push("可信媒体已确认");
  if (input.independentOriginCount >= 2) parts.push(String(input.independentOriginCount) + " 个独立来源相互印证");
  if (input.practicalEvidenceCount >= 2) parts.push("已有 " + String(input.practicalEvidenceCount) + " 条实践证据");
  else if (input.practicalEvidenceCount === 1) parts.push("已有可参考的实践证据");
  if (input.ageHours <= 24) parts.push("仍在 24 小时新鲜窗口内");
  return parts.slice(0, 3).join("，") + "。";
}

export function evaluateBoleDailyCuration(input: BoleCurationInput) {
  const timeliness =
    input.ageHours <= 24 ? "HIGH" as const :
    input.ageHours <= 72 ? "MEDIUM" as const :
    "LOW" as const;
  const practicalValue = input.practicalEvidenceCount > 0;
  const trustedEvidence =
    input.verificationStatus === "CONFIRMED_OFFICIAL" ||
    input.verificationStatus === "CONFIRMED_MEDIA";
  const materialChangeKnown =
    input.changeMagnitude === "MAJOR" ||
    input.changeMagnitude === "NORMAL";

  // Eligibility answers whether an Event is trustworthy and current enough to rank.
  // It does not answer whether the Event deserves scarce Featured placement.
  const gate = {
    aiRelevant: input.aiRelevant,
    freshEnough: timeliness !== "LOW",
    trustedEvidence,
    materialChange: materialChangeKnown
  };
  const gatePassed =
    gate.aiRelevant &&
    gate.freshEnough &&
    gate.trustedEvidence &&
    gate.materialChange;

  // Practical evidence is a bonus, not a mandatory precondition. A verified NORMAL
  // change can enter Featured when the combined score is strong enough; this prevents
  // fresh official/model/API updates from disappearing while tutorials are still absent.
  const editorialValueGatePassed = materialChangeKnown;

  const components = {
    freshness: freshnessScore(input.ageHours),
    evidenceQuality: evidenceQualityScore(input),
    importance: importanceScore(input.changeMagnitude),
    practicalValue: practicalValueScore(input.practicalEvidenceCount),
    independence: independenceScore(input.independentOriginCount),
    corroboration: corroborationScore(input.factSourceCount)
  };
  const score = clampScore(
    components.freshness * 0.23 +
    components.evidenceQuality * 0.28 +
    components.importance * 0.32 +
    components.practicalValue * 0.07 +
    components.independence * 0.07 +
    components.corroboration * 0.03
  );
  const selected =
    gatePassed &&
    editorialValueGatePassed &&
    score >= BOLE_DAILY_CURATION_THRESHOLD;

  const official = input.verificationStatus === "CONFIRMED_OFFICIAL";
  const topPickStrongValue =
    input.changeMagnitude === "MAJOR" ||
    input.practicalEvidenceCount >= 2;
  const topPickEvidenceSignal =
    (official && practicalValue) ||
    input.independentOriginCount >= 2 ||
    input.factSourceCount >= 2;
  const topPickEligible =
    selected &&
    score >= BOLE_DAILY_TOP_PICK_THRESHOLD &&
    topPickStrongValue &&
    topPickEvidenceSignal;

  const tier =
    !gatePassed ? "REJECTED" as const :
    topPickEligible ? "TOP_PICK" as const :
    selected ? "FEATURED" as const :
    "QUALIFIED" as const;

  const reasons = [
    ...(timeliness === "HIGH" ? ["FRESH_WITHIN_24H"] : []),
    ...(timeliness === "MEDIUM" ? ["FRESH_WITHIN_72H"] : []),
    ...(input.verificationStatus === "CONFIRMED_OFFICIAL" ? ["OFFICIAL_CONFIRMED"] : []),
    ...(input.verificationStatus === "CONFIRMED_MEDIA" ? ["MEDIA_CONFIRMED"] : []),
    ...(input.independentOriginCount >= 2 ? ["MULTI_ORIGIN"] : []),
    ...(practicalValue ? ["PRACTICAL_EVIDENCE"] : []),
    ...(input.changeMagnitude === "MAJOR" ? ["MAJOR_CHANGE"] : []),
    ...(topPickEligible ? ["TOP_PICK_STRONG_VALUE_AND_EVIDENCE_GATE"] : []),
    ...(selected && !topPickEligible ? ["FEATURED_NOT_TOP_PICK"] : []),
    ...(!input.aiRelevant ? ["AI_RELEVANCE_GATE_FAILED"] : []),
    ...(timeliness === "LOW" ? ["DAILY_FRESHNESS_GATE_FAILED"] : []),
    ...(!trustedEvidence ? ["TRUST_GATE_FAILED"] : []),
    ...(!materialChangeKnown ? ["MATERIAL_CHANGE_NOT_ESTABLISHED"] : []),
    ...(gatePassed && !selected ? ["BELOW_FEATURED_SCORE"] : [])
  ];

  const recommendationReason = buildBoleRecommendationReason({ tier, verificationStatus: input.verificationStatus, changeMagnitude: input.changeMagnitude, practicalEvidenceCount: input.practicalEvidenceCount, independentOriginCount: input.independentOriginCount, factSourceCount: input.factSourceCount, ageHours: input.ageHours });

  return {
    version: BOLE_DAILY_CURATION_VERSION,
    selected,
    timeliness,
    evidenceStatus: trustedEvidence ? "TRUSTED" as const : "UNVERIFIED" as const,
    practicalValue,
    gate,
    gatePassed,
    editorialValueGatePassed,
    score,
    threshold: BOLE_DAILY_CURATION_THRESHOLD,
    topPickThreshold: BOLE_DAILY_TOP_PICK_THRESHOLD,
    topPickEligible,
    tier,
    components,
    reasons,
    recommendationReason,
    authority: "PRESENTATION_ONLY" as const
  };
}

