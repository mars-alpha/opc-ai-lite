import "server-only";

import {
  resolveSelectionShadowOriginTier,
  selectionShadowBinaryMetrics,
  selectionShadowHasDirectFactSupport,
  type SelectionShadowContentType,
  type SelectionShadowSourceTier
} from "../../content/selection-shadow";
import { listRadarTimelineWindow } from "./intelligence-read-model";
import { runSelectionShadowPair } from "./selection-shadow-skill";

export type SelectionShadowCalibrationCase = {
  caseId: string;
  eventId: string;
  titleSnapshot: string;
  sourceTier: SelectionShadowSourceTier;
  sourceType: string;
  currentCuration: {
    curated: boolean;
    score: number;
    threshold: number;
    tier: string;
  };
  material: {
    title: string;
    summary: string | null;
    eventType: string;
    eventAt: string | null;
    evidence: Array<{
      rawItemId?: string;
      title: string;
      excerpt: string | null;
      publishedAt: string | null;
      originalUrl?: string | null;
      sourceType?: string | null;
      sourceMetadata?: unknown;
      rawMetadata?: unknown;
    }>;
  };
};

export type SelectionShadowGoldCase = SelectionShadowCalibrationCase & {
  gold: {
    decision: "select" | "reject" | "either";
    contentType?: SelectionShadowContentType | null;
  };
  reviewStatus: "PROVISIONAL" | "HUMAN_APPROVED";
  reviewerId: string;
  reviewedAt: string;
  reason: string;
};

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function eventDate(item: { publishedAt: Date | null; collectedAt: Date }) {
  return (item.publishedAt ?? item.collectedAt).toISOString();
}

function calibrationCaseFromTimelineItem(
  item: Awaited<ReturnType<typeof listRadarTimelineWindow>>[number]
): SelectionShadowCalibrationCase {
  const evidence = item.evidenceLinks.slice(0, 6).map((link) => ({
    title: link.presentation.displayTitleZh || link.title,
    excerpt: stringOrNull(link.presentation.displaySummaryZh),
    publishedAt: link.publishedAt ? new Date(link.publishedAt).toISOString() : null,
    originalUrl: link.originalUrl,
    sourceType: link.sourceType,
    sourceMetadata: link.sourceMetadata,
    rawMetadata: link.rawMetadata
  }));
  const sourceTier = resolveSelectionShadowOriginTier(evidence);
  if (!evidence.length) {
    evidence.push({
      title: item.presentation.displayTitleZh || item.title,
      excerpt: stringOrNull(item.presentation.displaySummaryZh ?? item.excerpt),
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : null,
      originalUrl: item.originalUrl,
      sourceType: item.sourceType,
      sourceMetadata: {},
      rawMetadata: {}
    });
  }
  return {
    caseId: "selection-" + item.eventId,
    eventId: item.eventId,
    titleSnapshot: item.title,
    sourceTier,
    sourceType: item.sourceType,
    currentCuration: {
      curated: item.curation.curated,
      score: item.curation.score,
      threshold: item.curation.threshold,
      tier: item.curation.tier
    },
    material: {
      title: item.presentation.displayTitleZh || item.title,
      summary: stringOrNull(item.presentation.displaySummaryZh ?? item.excerpt),
      eventType: item.eventType,
      eventAt: eventDate(item),
      evidence
    }
  };
}

function balancedTake(cases: SelectionShadowCalibrationCase[], limit: number) {
  const buckets = new Map<string, SelectionShadowCalibrationCase[]>();
  for (const item of cases) {
    const key = item.sourceTier + "|" + item.material.eventType;
    const bucket = buckets.get(key) ?? [];
    bucket.push(item);
    buckets.set(key, bucket);
  }
  for (const bucket of buckets.values()) {
    bucket.sort((a, b) => {
      const hardA = Math.abs(a.currentCuration.score - a.currentCuration.threshold);
      const hardB = Math.abs(b.currentCuration.score - b.currentCuration.threshold);
      return hardA - hardB || a.titleSnapshot.localeCompare(b.titleSnapshot);
    });
  }
  const keys = [...buckets.keys()].sort();
  const out: SelectionShadowCalibrationCase[] = [];
  while (out.length < limit) {
    let added = false;
    for (const key of keys) {
      const next = buckets.get(key)?.shift();
      if (!next) continue;
      out.push(next);
      added = true;
      if (out.length >= limit) break;
    }
    if (!added) break;
  }
  return out;
}

export async function listSelectionShadowCalibrationPool(windowDays = 7) {
  const normalizedWindowDays = Math.max(1, Math.min(14, Math.round(windowDays)));
  const timeline = await listRadarTimelineWindow(normalizedWindowDays);
  return timeline.map(calibrationCaseFromTimelineItem);
}

export async function buildSelectionShadowCalibrationSample(
  input: { limit?: number; windowDays?: number } = {}
) {
  const limit = Math.max(20, Math.min(200, Math.round(input.limit ?? 160)));
  const windowDays = Math.max(1, Math.min(14, Math.round(input.windowDays ?? 7)));
  const cases = await listSelectionShadowCalibrationPool(windowDays);
  return {
    generatedAt: new Date().toISOString(),
    windowDays,
    poolSize: cases.length,
    requestedLimit: limit,
    cases: balancedTake(cases, limit)
  };
}

export async function refreshSelectionShadowGoldAuthority(
  goldCases: SelectionShadowGoldCase[],
  windowDays = 7
) {
  const timeline = await listRadarTimelineWindow(windowDays);
  const currentByEvent = new Map(
    timeline.map((item) => {
      const current = calibrationCaseFromTimelineItem(item);
      return [current.eventId, current] as const;
    })
  );
  let changedTierCount = 0;
  let missingEventCount = 0;
  const rows = goldCases.map((gold) => {
    const current = currentByEvent.get(gold.eventId);
    if (!current) {
      missingEventCount += 1;
      return gold;
    }
    if (current.sourceTier !== gold.sourceTier) changedTierCount += 1;
    return {
      ...gold,
      sourceTier: current.sourceTier,
      sourceType: current.sourceType,
      material: current.material
    };
  });
  return {
    version: "selection-shadow-origin-tier-refresh-v1",
    windowDays,
    changedTierCount,
    missingEventCount,
    rows
  };
}

export async function evaluateSelectionShadowGold(
  goldCases: SelectionShadowGoldCase[],
  options: { force?: boolean; limit?: number } = {}
) {
  const labeled = goldCases
    .filter((item) => item.gold.decision !== "either")
    .slice(0, Math.max(1, Math.min(200, options.limit ?? goldCases.length)));
  const rows: Array<{
    caseId: string;
    eventId: string;
    title: string;
    sourceTier: SelectionShadowSourceTier;
    contentType: string;
    predicted: boolean;
    expected: boolean;
    scoreA: number;
    scoreB: number;
    averageScore: number;
    threshold: number;
    spread: number;
    typeDisagreement: boolean;
    currentCurated: boolean;
    reusedA: boolean;
    reusedB: boolean;
    passA: Awaited<ReturnType<typeof runSelectionShadowPair>>["passA"]["score"];
    passB: Awaited<ReturnType<typeof runSelectionShadowPair>>["passB"]["score"];
    materialText: string;
    directFactSupport: boolean;
  }> = [];

  for (const item of labeled) {
    const result = await runSelectionShadowPair({
      eventId: item.eventId,
      currentTime: new Date().toISOString(),
      sourceTier: item.sourceTier,
      material: item.material
    }, { force: options.force });
    rows.push({
      caseId: item.caseId,
      eventId: item.eventId,
      title: item.titleSnapshot,
      sourceTier: item.sourceTier,
      contentType: result.combined.contentType,
      predicted: result.combined.selectedShadow,
      expected: item.gold.decision === "select",
      scoreA: result.combined.scoreA,
      scoreB: result.combined.scoreB,
      averageScore: result.combined.averageScore,
      threshold: result.combined.threshold,
      spread: result.combined.spread,
      typeDisagreement: result.combined.typeDisagreement,
      currentCurated: item.currentCuration.curated,
      reusedA: result.passA.reused,
      reusedB: result.passB.reused,
      passA: result.passA.score,
      passB: result.passB.score,
      materialText: [
        item.material.title,
        item.material.summary ?? "",
        ...item.material.evidence.flatMap((evidence) => [evidence.title, evidence.excerpt ?? ""])
      ].join("\n"),
      directFactSupport: selectionShadowHasDirectFactSupport(item.material.evidence)
    });
  }

  const groupMetrics = <K extends string>(keys: K[], pick: (row: typeof rows[number]) => K) =>
    keys.map((key) => {
      const scoped = rows.filter((row) => pick(row) === key);
      return { key, ...selectionShadowBinaryMetrics(scoped) };
    });

  const sourceTiers = [...new Set(rows.map((row) => row.sourceTier))].sort();
  const contentTypes = [...new Set(rows.map((row) => row.contentType))].sort();
  const mismatches = rows.filter((row) => row.predicted !== row.expected);

  return {
    version: "aihot-selection-calibration-evaluation-v1",
    evaluatedAt: new Date().toISOString(),
    cases: rows.length,
    metrics: selectionShadowBinaryMetrics(rows),
    bySourceTier: groupMetrics(sourceTiers, (row) => row.sourceTier),
    byContentType: groupMetrics(contentTypes, (row) => row.contentType),
    typeDisagreementCount: rows.filter((row) => row.typeDisagreement).length,
    reusedPassCount: rows.reduce((sum, row) => sum + Number(row.reusedA) + Number(row.reusedB), 0),
    mismatches,
    rows,
    formalCurationChanged: false
  };
}
