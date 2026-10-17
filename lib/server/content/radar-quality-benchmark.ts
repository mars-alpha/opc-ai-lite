/** Frozen, source-backed regression cohorts; never grants runtime authority. */
export type RadarBenchmark = {
  version: string;
  capturedAt: string;
  scope: 'OBSERVED_ONLY';
  limitations: string[];
  reports: {
    id: string; title: string; originalUrl: string; publishedAt: string;
    sourceId: string; clusterId: string | null;
    event: { id: string; title: string; summary: string | null; primaryEntityId: string | null; subjectEntityId: string | null; keywords: unknown; entities: unknown; eventType: string; firstSeenAt: string; lastSeenAt: string };
  }[];
  pairs: { left: string; right: string; relation: 'SAME_EVENT' | 'SUPPORTING_REPORT' | 'RELATED_EVENT' | 'UNRELATED' | 'UNKNOWN'; rationale: string }[];
  references: { reportId: string; basis: string }[];
};

export function validateRadarBenchmark(input: RadarBenchmark) {
  const captured = Date.parse(input.capturedAt);
  if (!Number.isFinite(captured)) throw Error('BENCHMARK_DATE');
  if (input.scope !== 'OBSERVED_ONLY') throw Error('BENCHMARK_SCOPE');
  const reports = new Set<string>();
  for (const report of input.reports) {
    if (reports.has(report.id)) throw Error('DUPLICATE_REPORT');
    reports.add(report.id);
    let url: URL;
    try { url = new URL(report.originalUrl); } catch { throw Error('BENCHMARK_CITATION'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw Error('BENCHMARK_CITATION');
    for (const date of [report.publishedAt, report.event.firstSeenAt, report.event.lastSeenAt]) {
      if (!Number.isFinite(Date.parse(date)) || Date.parse(date) > captured) throw Error('BENCHMARK_DATE');
    }
    if (!report.title || !report.event.id) throw Error('BENCHMARK_REPORT');
    if (report.event.summary !== null && typeof report.event.summary !== 'string') throw Error('BENCHMARK_SCORER_INPUT');
    for (const entity of [report.event.primaryEntityId, report.event.subjectEntityId]) if (entity !== null && typeof entity !== 'string') throw Error('BENCHMARK_SCORER_INPUT');
    if (Date.parse(report.event.firstSeenAt) > Date.parse(report.event.lastSeenAt)) throw Error('BENCHMARK_DATE_ORDER');
  }
  const seen = new Set<string>();
  const relations = new Set(['SAME_EVENT', 'SUPPORTING_REPORT', 'RELATED_EVENT', 'UNRELATED', 'UNKNOWN']);
  for (const pair of input.pairs) {
    if (pair.left === pair.right || !reports.has(pair.left) || !reports.has(pair.right)) throw Error('BENCHMARK_PAIR_REFERENCE');
    const key = JSON.stringify([pair.left, pair.right].sort());
    if (seen.has(key)) throw Error('DUPLICATE_PAIR');
    seen.add(key);
    if (!relations.has(pair.relation) || !pair.rationale.trim()) throw Error('BENCHMARK_LABEL');
  }
  const references = new Set<string>();
  for (const reference of input.references) {
    if (!reports.has(reference.reportId) || !reference.basis.trim() || references.has(reference.reportId)) throw Error('BENCHMARK_REFERENCE');
    references.add(reference.reportId);
  }
}

export function evaluateRelationPairs(input: RadarBenchmark, predict: (left: RadarBenchmark['reports'][number], right: RadarBenchmark['reports'][number]) => boolean) {
  validateRadarBenchmark(input);
  const reports = new Map(input.reports.map(r => [r.id, r]));
  let truePositive = 0, falsePositive = 0, falseNegative = 0, trueNegative = 0, unknown = 0;
  for (const pair of input.pairs) {
    if (pair.relation === 'UNKNOWN') { unknown++; continue; }
    const positive = pair.relation === 'SAME_EVENT' || pair.relation === 'SUPPORTING_REPORT';
    const predicted = predict(reports.get(pair.left)!, reports.get(pair.right)!);
    if (positive && predicted) truePositive++;
    else if (predicted) falsePositive++;
    else if (positive) falseNegative++;
    else trueNegative++;
  }
  return {
    truePositive, falsePositive, falseNegative, trueNegative, unknown,
    evaluated: truePositive + falsePositive + falseNegative + trueNegative,
    precision: truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : null,
    recall: truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : null,
    discoveryRecall: null,
    discoveryRecallStatus: 'UNKNOWN_OBSERVED_ONLY' as const
  };
}

export function summarizeRadarQuality(items: { featured: boolean; hot: boolean; featuredReasons: string[]; hotCriteria: Record<string, boolean> }[]) {
  const featuredRejections: Record<string, number> = {}, featuredNonSelectedReasons: Record<string, number> = {}, hotMissingCriteria: Record<string, number> = {};
  const rejectionCodes = new Set(['AI_RELEVANCE_GATE_FAILED', 'DAILY_FRESHNESS_GATE_FAILED', 'TRUST_GATE_FAILED', 'MATERIAL_CHANGE_NOT_ESTABLISHED', 'BELOW_FEATURED_SCORE']);
  for (const item of items) {
    if (!item.featured) for (const reason of new Set(item.featuredReasons)) {
      featuredNonSelectedReasons[reason] = (featuredNonSelectedReasons[reason] ?? 0) + 1;
      if (rejectionCodes.has(reason)) featuredRejections[reason] = (featuredRejections[reason] ?? 0) + 1;
    }
    if (!item.hot) for (const [key, passed] of Object.entries(item.hotCriteria)) if (!passed) hotMissingCriteria[key] = (hotMissingCriteria[key] ?? 0) + 1;
  }
  return { population: 'RADAR_VISIBLE_ONLY' as const, events: items.length, featured: items.filter(i => i.featured).length, hot: items.filter(i => i.hot).length, featuredRejections, featuredNonSelectedReasons, hotMissingCriteria, discoveryRecall: null };
}
