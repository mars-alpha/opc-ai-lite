import { auditSourceRuntimeGovernance } from "../lib/server/content/source-runtime-governance";
import { closeDatabase } from "../lib/server/db";

async function main() {
  const windowDays = Math.max(1, Math.min(90, Number(process.argv[2] ?? 14) || 14));
  const results = await auditSourceRuntimeGovernance({ windowDays });
  const compact = results.map((item) => ({
    sourceId: item.source.id,
    name: item.source.name,
    platform: item.source.platform,
    qualification: item.governance.qualification,
    runtimeHealth: item.governance.runtimeHealth,
    utilityRecommendation: item.governance.utilityRecommendation,
    governancePlan: item.governance.plan,
    recommendedIntervalMultiplier: item.governance.recommendedIntervalMultiplier,
    humanReviewRequired: item.governance.humanReviewRequired,
    automaticMutationAllowed: item.governance.automaticMutationAllowed,
    runCount: item.facts.runCount,
    fallbackRate: Number(item.facts.fallbackRate.toFixed(4)),
    independentEventContributionCount: item.facts.independentEventContributionCount,
    coverageCritical: item.governance.coverageCritical,
    coverageRiskReasons: item.governance.coverageRiskReasons,
    reasons: item.governance.reasons
  }));

  console.log(JSON.stringify({
    version: "source-runtime-governance-v1",
    windowDays,
    sourceCount: compact.length,
    plans: compact.reduce<Record<string, number>>((acc, item) => {
      acc[item.governancePlan] = (acc[item.governancePlan] ?? 0) + 1;
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
