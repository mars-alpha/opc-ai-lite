import { auditSourceRuntimeUtility } from "../lib/server/content/source-runtime-utility";
import { closeDatabase } from "../lib/server/db";

async function main() {
  const windowDays = Math.max(1, Math.min(90, Number(process.argv[2] ?? 14) || 14));
  const results = await auditSourceRuntimeUtility({ windowDays });

  const compact = results.map((item) => ({
    sourceId: item.source.id,
    name: item.source.name,
    platform: item.source.platform,
    runCount: item.facts.runCount,
    receivedCount: item.facts.receivedCount,
    keptCount: item.facts.keptCount,
    keepRatio: Number(item.facts.keepRatio.toFixed(4)),
    emptyRunCount: item.facts.emptyRunCount,
    duplicateRatio: Number(item.facts.duplicateRatio.toFixed(4)),
    noiseDropRatio: Number(item.facts.noiseDropRatio.toFixed(4)),
    fallbackRate: Number(item.facts.fallbackRate.toFixed(4)),
    independentEventContributionCount: item.facts.independentEventContributionCount,
    lastSuccessAt: item.facts.lastSuccessAt,
    lastNewItemAt: item.facts.lastNewItemAt,
    freshnessLagHours: item.facts.freshnessLagHours === null
      ? null
      : Number(item.facts.freshnessLagHours.toFixed(1)),
    recommendation: item.decision.recommendation,
    reasons: item.decision.reasons,
    coverageCritical: item.decision.coverageCritical,
    coverageRiskReasons: item.decision.coverageRiskReasons
  }));

  console.log(JSON.stringify({
    version: "source-runtime-utility-v1",
    windowDays,
    sourceCount: compact.length,
    recommendations: compact.reduce<Record<string, number>>((acc, item) => {
      acc[item.recommendation] = (acc[item.recommendation] ?? 0) + 1;
      return acc;
    }, {}),
    sources: compact
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await closeDatabase(); } catch {}
  });
