import "server-only";

import type { TopicDiagnosisPayload } from "./artifact-contract";

type DiagnosisArtifactLike = {
  id: string;
  version: number;
  generatedMode: string;
  createdAt: Date;
  payload: unknown;
};

const INTERNAL_PATTERNS = [
  /\bdeterministic\b/i,
  /\bauthorityScore\b/i,
  /\bhasOfficialOrHighAuthority\b/i,
  /\bevidenceReadiness\b/i,
  /\brelevanceScore\b/i,
  /\bnoveltyScore\b/i,
  /\bsourceCount\b/i,
  /\bcontentId\b/i,
  /\beventId\b/i,
  /\badapter(?:Id|Version)?\b/i,
  /\bvalidator(?:Result)?\b/i,
  /\bschemaVersion\b/i
];

const FIXTURE_PATTERN =
  /视觉验收|Development Fixture|测试夹具|占位(?:地址|路径|URL)|example\.com|github\.com\/example|news\.ycombinator\.com\/item\?id=1/i;

function payload(value: unknown): TopicDiagnosisPayload {
  return value as TopicDiagnosisPayload;
}

function hasInternalDetail(value: string) {
  return INTERNAL_PATTERNS.some((pattern) => pattern.test(value));
}

function cleanText(value: string, fallback: string) {
  const normalized = value
    .replace(/https?:\/\/[^\s，。；、)）]+/gi, "相关来源")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized || hasInternalDetail(normalized)) return fallback;
  if (FIXTURE_PATTERN.test(normalized)) return fallback;
  return normalized;
}

function presentNotes(
  values: string[],
  fixtureFallback: string
) {
  const output: string[] = [];
  let fixtureSeen = false;
  for (const raw of values) {
    const value = raw.trim();
    if (!value || hasInternalDetail(value)) continue;
    if (FIXTURE_PATTERN.test(value)) {
      fixtureSeen = true;
      continue;
    }
    const cleaned = value
      .replace(/https?:\/\/[^\s，。；、)）]+/gi, "相关来源")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned) output.push(cleaned);
  }
  if (fixtureSeen) output.unshift(fixtureFallback);
  return [...new Set(output)].slice(0, 8);
}

export function presentTopicDiagnosisArtifact(artifact: DiagnosisArtifactLike | null) {
  if (!artifact) return null;
  const source = payload(artifact.payload);
  const fixtureContext = [
    source.whyItMatters,
    source.readerValue,
    source.suggestedAngle,
    ...source.evidenceGaps,
    ...source.risks
  ].some((item) => FIXTURE_PATTERN.test(item));

  const whyFallback = fixtureContext
    ? "当前资料还不足以支持正式选题，需要先补充可核验的真实来源。"
    : "当前信息仍需结合来源覆盖和关键事实进一步判断。";
  const readerFallback = fixtureContext
    ? "在真实来源和关键事实补齐前，这条信息暂不适合直接提供给读者。"
    : "需要先确认它对读者是否有明确、可验证的实际价值。";
  const angleFallback = fixtureContext
    ? "先核验真实来源、关键事实和影响范围，再决定是否进入内容生产。"
    : "先说明发生了什么，再基于已核验事实判断实际影响。";

  return {
    id: artifact.id,
    version: artifact.version,
    generatedMode: artifact.generatedMode,
    createdAt: artifact.createdAt,
    payload: {
      verdict: source.verdict,
      whyItMatters: cleanText(source.whyItMatters, whyFallback),
      readerValue: cleanText(source.readerValue, readerFallback),
      suggestedAngle: cleanText(source.suggestedAngle, angleFallback),
      duplicationRisk: source.duplicationRisk,
      timeliness: source.timeliness,
      evidenceReadiness: source.evidenceReadiness,
      differentiation: source.differentiation,
      evidenceGaps: presentNotes(
        source.evidenceGaps,
        "部分来源属于测试或占位资料，不能作为正式事实依据。"
      ),
      risks: presentNotes(
        source.risks,
        "当前资料包含非真实或不可核验来源，需补充真实来源后再判断。"
      )
    }
  };
}
