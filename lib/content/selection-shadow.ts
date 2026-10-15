export const SELECTION_SHADOW_RULE_VERSION = "aihot-selection-shadow-v1";
export const SELECTION_SHADOW_PROMPT_VERSION = "aihot-selection-shadow-prompt-v2-attention-rubric";

export const SELECTION_SHADOW_CONTENT_TYPES = [
  "MODEL_RELEASE",
  "PRODUCT_LAUNCH",
  "TOOL_OR_PROMPT",
  "RESEARCH_PAPER",
  "INDUSTRY_EVENT",
  "OPINION_ANALYSIS",
  "TUTORIAL_EXPLAINER"
] as const;

export type SelectionShadowContentType = (typeof SELECTION_SHADOW_CONTENT_TYPES)[number];

export const SELECTION_SHADOW_SOURCE_TIERS = ["T1", "T1_5", "T2"] as const;
export type SelectionShadowSourceTier = (typeof SELECTION_SHADOW_SOURCE_TIERS)[number];

export type SelectionShadowAxes = {
  sig: number;
  nov: number;
  cred: number;
  reson: number;
  act: number;
};

export type SelectionShadowModelOutput = SelectionShadowAxes & {
  contentType: SelectionShadowContentType;
  reasonSummary: string;
};

export type SelectionShadowScore = SelectionShadowModelOutput & {
  attentionScore: number;
};

export const SELECTION_SHADOW_THRESHOLDS: Record<SelectionShadowSourceTier, number> = {
  T1: 60,
  T1_5: 65,
  T2: 76
};

export const SELECTION_SHADOW_WEIGHTS: Record<SelectionShadowContentType, SelectionShadowAxes> = {
  MODEL_RELEASE: { sig: 3, nov: 2, cred: 2, reson: 2, act: 1 },
  PRODUCT_LAUNCH: { sig: 2, nov: 2, cred: 1, reson: 2, act: 3 },
  TOOL_OR_PROMPT: { sig: 1, nov: 2, cred: 1, reson: 2, act: 4 },
  RESEARCH_PAPER: { sig: 5, nov: 3, cred: 1, reson: 0, act: 1 },
  INDUSTRY_EVENT: { sig: 3, nov: 1, cred: 2, reson: 4, act: 0 },
  OPINION_ANALYSIS: { sig: 1, nov: 3, cred: 1, reson: 4, act: 1 },
  TUTORIAL_EXPLAINER: { sig: 1, nov: 1, cred: 1, reson: 3, act: 4 }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function axis(value: unknown, field: keyof SelectionShadowAxes) {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 10) {
    throw new Error("SELECTION_SHADOW_INVALID_AXIS:" + field);
  }
  return Number(value);
}

function text(value: unknown, field: string, max = 800) {
  if (typeof value !== "string") throw new Error("SELECTION_SHADOW_INVALID_TEXT:" + field);
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new Error("SELECTION_SHADOW_INVALID_TEXT:" + field);
  return normalized;
}

export function calculateSelectionAttentionScore(
  contentType: SelectionShadowContentType,
  axes: SelectionShadowAxes
) {
  const weights = SELECTION_SHADOW_WEIGHTS[contentType];
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        axes.sig * weights.sig +
        axes.nov * weights.nov +
        axes.cred * weights.cred +
        axes.reson * weights.reson +
        axes.act * weights.act
      )
    )
  );
}

export function validateSelectionShadowModelOutput(value: unknown): SelectionShadowScore {
  if (!isRecord(value)) throw new Error("SELECTION_SHADOW_INVALID_OUTPUT");
  if (!SELECTION_SHADOW_CONTENT_TYPES.includes(value.contentType as SelectionShadowContentType)) {
    throw new Error("SELECTION_SHADOW_INVALID_CONTENT_TYPE");
  }
  const contentType = value.contentType as SelectionShadowContentType;
  const axes = {
    sig: axis(value.sig, "sig"),
    nov: axis(value.nov, "nov"),
    cred: axis(value.cred, "cred"),
    reson: axis(value.reson, "reson"),
    act: axis(value.act, "act")
  };
  return {
    contentType,
    ...axes,
    reasonSummary: text(value.reasonSummary, "reasonSummary"),
    attentionScore: calculateSelectionAttentionScore(contentType, axes)
  };
}

export function resolveSelectionShadowSourceTier(input: {
  sourceType?: string | null;
  metadata?: unknown;
}): SelectionShadowSourceTier {
  const metadata = isRecord(input.metadata) ? input.metadata : {};
  const explicit = metadata.selectionTier;
  if (SELECTION_SHADOW_SOURCE_TIERS.includes(explicit as SelectionShadowSourceTier)) {
    return explicit as SelectionShadowSourceTier;
  }
  const sourceType = (input.sourceType ?? "").trim().toUpperCase();
  const sourceUniverseRole = typeof metadata.sourceUniverseRole === "string"
    ? metadata.sourceUniverseRole.trim().toUpperCase()
    : "";
  if (sourceType === "OFFICIAL" || sourceUniverseRole === "OFFICIAL") return "T1";
  if (sourceType === "RESEARCH" || sourceUniverseRole === "RESEARCH") return "T1_5";
  return "T2";
}

function normalizedToken(value: unknown) {
  return typeof value === "string"
    ? value.normalize("NFKC").toLocaleLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim()
    : "";
}

function domainToken(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    return new URL(value).hostname
      .toLocaleLowerCase()
      .replace(/^www\./, "")
      .replace(/^(blog|developers|developer|docs|news)\./, "")
      .split(".")[0]
      .replace(/[^a-z0-9]+/g, "");
  } catch {
    return "";
  }
}

function resolvedEntities(metadata: unknown) {
  const raw = isRecord(metadata) && Array.isArray(metadata.resolvedEntities)
    ? metadata.resolvedEntities
    : [];
  return raw.filter(isRecord);
}

function hasStrongOriginEntityMatch(input: {
  rawMetadata?: unknown;
  originalUrl?: string | null;
}) {
  const metadata = isRecord(input.rawMetadata) ? input.rawMetadata : {};
  const publisher = normalizedToken(metadata.originPublisher);
  const hostToken = domainToken(input.originalUrl);
  if (!publisher && !hostToken) return false;
  return resolvedEntities(metadata).some((entity) => {
    if (entity.status !== "KNOWN" || entity.referenceStrength !== "STRONG") return false;
    const names = [entity.canonicalName, entity.displayNameZh, entity.matchedTerm]
      .map(normalizedToken)
      .filter(Boolean);
    return names.some((name) => {
      const compact = name.replace(/\s+/g, "");
      return Boolean(
        (publisher && (publisher.includes(name) || name.includes(publisher))) ||
        (hostToken && compact.length >= 3 && (hostToken.includes(compact) || compact.includes(hostToken)))
      );
    });
  });
}

export type SelectionShadowEvidenceAuthorityInput = {
  sourceType?: string | null;
  sourceMetadata?: unknown;
  rawMetadata?: unknown;
  originalUrl?: string | null;
};

export function resolveSelectionShadowOriginTier(
  evidence: SelectionShadowEvidenceAuthorityInput[]
): SelectionShadowSourceTier {
  let best: SelectionShadowSourceTier = "T2";
  for (const item of evidence) {
    const sourceMetadata = isRecord(item.sourceMetadata) ? item.sourceMetadata : {};
    const rawMetadata = isRecord(item.rawMetadata) ? item.rawMetadata : {};
    const explicit = rawMetadata.selectionTier ?? sourceMetadata.selectionTier;
    if (SELECTION_SHADOW_SOURCE_TIERS.includes(explicit as SelectionShadowSourceTier)) {
      if (explicit === "T1") return "T1";
      if (explicit === "T1_5") best = "T1_5";
      continue;
    }

    const role = normalizedToken(sourceMetadata.sourceUniverseRole).toUpperCase().replace(/\s+/g, "_");
    const sourceType = (item.sourceType ?? "").trim().toUpperCase();
    const referenceOnly = rawMetadata.referenceOnly === true || sourceMetadata.referenceOnly === true;

    if (!referenceOnly && (role === "OFFICIAL" || sourceType === "OFFICIAL")) return "T1";

    if (referenceOnly && hasStrongOriginEntityMatch(item)) return "T1";

    if (
      role === "RESEARCH" ||
      role === "ACADEMIC" ||
      role === "RESEARCH_INSTITUTION" ||
      role === "ACADEMIC_RESEARCH"
    ) {
      best = "T1_5";
    }
  }
  return best;
}

export function combineSelectionShadowScores(
  scoreA: SelectionShadowScore,
  scoreB: SelectionShadowScore,
  sourceTier: SelectionShadowSourceTier
) {
  const threshold = SELECTION_SHADOW_THRESHOLDS[sourceTier];
  const scoreSum = scoreA.attentionScore + scoreB.attentionScore;
  const averageScore = Math.floor(scoreSum / 2);
  const contentType = scoreA.contentType === scoreB.contentType ? scoreA.contentType : "MIXED";
  return {
    sourceTier,
    threshold,
    scoreA: scoreA.attentionScore,
    scoreB: scoreB.attentionScore,
    scoreSum,
    averageScore,
    spread: Math.abs(scoreA.attentionScore - scoreB.attentionScore),
    contentType,
    typeDisagreement: scoreA.contentType !== scoreB.contentType,
    selectedShadow: scoreSum >= threshold * 2,
    authority: "SHADOW_ONLY" as const
  };
}

export const SELECTION_SHADOW_T2_POLICY_VERSIONS = [
  "BASELINE_76",
  "GLOBAL_72",
  "GLOBAL_70",
  "GLOBAL_68",
  "TYPE_RELEASE_72",
  "STRONG_PRACTICAL_RELEASE_V1",
  "T2_80_STRONG_PRACTICAL_FACT_V2"
] as const;

export type SelectionShadowT2PolicyVersion = (typeof SELECTION_SHADOW_T2_POLICY_VERSIONS)[number];

export type SelectionShadowPolicyInput = {
  sourceTier: SelectionShadowSourceTier;
  contentType: string;
  averageScore: number;
  scoreA: SelectionShadowScore;
  scoreB: SelectionShadowScore;
  materialText: string;
  directFactSupport: boolean;
};

function normalizedMaterialText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase();
}

export function selectionShadowPracticalReleaseSignals(materialText: string) {
  const text = normalizedMaterialText(materialText);
  const signals = {
    benchmark: /benchmark|基准|评测|测试结果|性能|score|速度|latency|吞吐|accuracy|准确率/.test(text),
    pricing: /pricing|price|cost|价格|定价|费用|免费|\$\s*\d|美元|元\b/.test(text),
    availability: /available|availability|上线|发布|开放|推出|rollout|rolling out|public preview|beta|ga\b|api\b/.test(text),
    howToUse: /how to use|how-to|使用方法|怎么用|如何使用|教程|步骤|getting started|quickstart|try it|试用|上手/.test(text),
    capabilityDelta: /new capability|capability|支持|新增|改进|提升|升级|可实现|can now|now supports|相比|vs\.?\b|versus|超分|补帧|hdr|agent|reasoning|context/.test(text),
    limitation: /limit|限制|requirement|要求|only available|仅限|暂不支持|不支持|quota|rate limit/.test(text)
  };
  return {
    ...signals,
    count: Object.values(signals).filter(Boolean).length
  };
}

export function selectionShadowHasDirectFactSupport(
  evidence: SelectionShadowEvidenceAuthorityInput[]
) {
  return evidence.some((item) => {
    const sourceMetadata = isRecord(item.sourceMetadata) ? item.sourceMetadata : {};
    const rawMetadata = isRecord(item.rawMetadata) ? item.rawMetadata : {};
    const intelligencePolicy = isRecord(rawMetadata.intelligencePolicy)
      ? rawMetadata.intelligencePolicy
      : {};
    const referenceOnly = rawMetadata.referenceOnly === true || sourceMetadata.referenceOnly === true;
    const factualSource = sourceMetadata.factualSource === true;
    const sourceRole = typeof intelligencePolicy.sourceRole === "string"
      ? intelligencePolicy.sourceRole.trim().toUpperCase()
      : "";
    const requiresFactConfirmation = intelligencePolicy.requiresFactConfirmation === true;
    const confirmationAuthority = typeof intelligencePolicy.confirmationAuthority === "string"
      ? intelligencePolicy.confirmationAuthority.trim().toUpperCase()
      : "";

    return Boolean(
      !referenceOnly &&
      !requiresFactConfirmation &&
      (
        factualSource ||
        sourceRole === "FACT" ||
        confirmationAuthority === "PRIMARY" ||
        confirmationAuthority === "HIGH"
      )
    );
  });
}

export function applySelectionShadowT2Policy(
  policy: SelectionShadowT2PolicyVersion,
  input: SelectionShadowPolicyInput
) {
  if (input.sourceTier !== "T2") {
    const threshold = SELECTION_SHADOW_THRESHOLDS[input.sourceTier];
    return {
      selected: input.averageScore >= threshold,
      threshold,
      reason: "NON_T2_BASELINE"
    };
  }

  const type = input.contentType;
  const releaseType =
    type === "MODEL_RELEASE" ||
    type === "PRODUCT_LAUNCH" ||
    type === "TOOL_OR_PROMPT";
  const threshold =
    policy === "GLOBAL_72" ? 72 :
    policy === "GLOBAL_70" ? 70 :
    policy === "GLOBAL_68" ? 68 :
    policy === "TYPE_RELEASE_72" && releaseType ? 72 :
    policy === "T2_80_STRONG_PRACTICAL_FACT_V2" ? 80 :
    76;

  if (policy !== "STRONG_PRACTICAL_RELEASE_V1" && policy !== "T2_80_STRONG_PRACTICAL_FACT_V2") {
    return {
      selected: input.averageScore >= threshold,
      threshold,
      reason: threshold === 76 ? "BASELINE_T2" : "LOWERED_T2_THRESHOLD"
    };
  }

  const baselineThreshold = policy === "T2_80_STRONG_PRACTICAL_FACT_V2" ? 80 : 76;
  if (input.averageScore >= baselineThreshold) {
    return { selected: true, threshold: baselineThreshold, reason: "BASELINE_T2" };
  }

  const signals = selectionShadowPracticalReleaseSignals(input.materialText);
  const axisAverage = (field: keyof SelectionShadowAxes) =>
    (input.scoreA[field] + input.scoreB[field]) / 2;
  const strongPracticalRelease =
    releaseType &&
    input.averageScore >= (policy === "T2_80_STRONG_PRACTICAL_FACT_V2" ? 64 : 66) &&
    signals.count >= (policy === "T2_80_STRONG_PRACTICAL_FACT_V2" ? 2 : 3) &&
    signals.capabilityDelta &&
    (signals.benchmark || signals.pricing || signals.availability || signals.howToUse) &&
    axisAverage("nov") >= 6.5 &&
    axisAverage("reson") >= 6 &&
    axisAverage("act") >= 5.5 &&
    axisAverage("cred") >= (policy === "T2_80_STRONG_PRACTICAL_FACT_V2" ? 5 : 5.5) &&
    (policy !== "T2_80_STRONG_PRACTICAL_FACT_V2" || input.directFactSupport);

  return {
    selected: strongPracticalRelease,
    threshold: 76,
    reason: strongPracticalRelease ? "STRONG_PRACTICAL_RELEASE_SUPPLEMENT" : "BASELINE_T2_REJECT",
    signals
  };
}

function percent(num: number, den: number) {
  return den ? Math.round((num / den) * 10_000) / 100 : null;
}

export function selectionShadowBinaryMetrics(rows: Array<{ predicted: boolean; expected: boolean }>) {
  const truePositive = rows.filter((row) => row.predicted && row.expected).length;
  const falsePositive = rows.filter((row) => row.predicted && !row.expected).length;
  const trueNegative = rows.filter((row) => !row.predicted && !row.expected).length;
  const falseNegative = rows.filter((row) => !row.predicted && row.expected).length;
  const precision = percent(truePositive, truePositive + falsePositive);
  const recall = percent(truePositive, truePositive + falseNegative);
  const f1 = precision === null || recall === null || precision + recall === 0
    ? null
    : Math.round((2 * precision * recall / (precision + recall)) * 100) / 100;
  return {
    cases: rows.length,
    truePositive,
    falsePositive,
    trueNegative,
    falseNegative,
    precision,
    recall,
    f1,
    accuracy: percent(truePositive + trueNegative, rows.length),
    falsePositiveRate: percent(falsePositive, falsePositive + trueNegative),
    falseNegativeRate: percent(falseNegative, falseNegative + truePositive)
  };
}
