import { auditSourceGovernanceExecution } from "../lib/server/content/source-runtime-governance-execution";
import { closeDatabase } from "../lib/server/db";

async function main() {
  const windowDays = Math.max(1, Math.min(90, Number(process.argv[2] ?? 14) || 14));
  const results = await auditSourceGovernanceExecution({ windowDays });
  console.log(JSON.stringify({
    version: "source-runtime-governance-execution-v1",
    windowDays,
    sourceCount: results.length,
    actions: results.reduce<Record<string, number>>((acc, item) => {
      acc[item.execution.action] = (acc[item.execution.action] ?? 0) + 1;
      return acc;
    }, {}),
    sources: results.map((item) => ({
      sourceId: item.source.id,
      name: item.source.name,
      governancePlan: item.governance.plan,
      action: item.execution.action,
      baseIntervalMinutes: item.execution.baseIntervalMinutes,
      effectiveIntervalMinutes: item.execution.effectiveIntervalMinutes,
      due: item.execution.due,
      nextDueAt: item.execution.nextDueAt,
      requiresHumanReview: item.execution.requiresHumanReview,
      coverageCritical: item.governance.coverageCritical,
      reason: item.execution.reason
    }))
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
