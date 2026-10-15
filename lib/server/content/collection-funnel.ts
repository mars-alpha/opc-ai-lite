type Run = { status: string; receivedCount: number; createdCount: number; duplicateCount: number; startedAt: Date; metadata: unknown };
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function count(value: unknown) { return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null; }
export function summarizeCollectionRuns(runs: Run[]) {
  const succeeded = runs.filter(run => run.status === "SUCCEEDED");
  const filters = succeeded.map(run => count(record(record(run.metadata).discoveryFilter).kept));
  const funnels = succeeded.map(run => record(record(run.metadata).collectionFunnel));
  const missingFilters = filters.filter(value => value === null).length;
  const missingEvents = funnels.filter(value => value.version !== 1 || ["policyAccepted", "eventCreated", "eventMerged", "historicalWithoutEvent"].some(key => count(value[key]) === null)).length;
  const sum = (key: string) => funnels.reduce((total, item) => total + (count(item[key]) ?? 0), 0);
  const reasons = (key: string) => {
    const totals: Record<string, number> = {};
    for (const item of funnels) for (const [reason, value] of Object.entries(record(item[key]))) totals[reason] = (totals[reason] ?? 0) + (count(value) ?? 0);
    return totals;
  };
  return { runCount: runs.length, succeededRuns: succeeded.length, failedRuns: runs.filter(run => run.status === "FAILED").length,
    received: succeeded.reduce((sum, run) => sum + run.receivedCount, 0),
    filterKept: missingFilters ? null : filters.reduce<number>((sum, value) => sum + (value ?? 0), 0),
    filterKeptRecorded: filters.reduce<number>((sum, value) => sum + (value ?? 0), 0), unrecordedFilterRuns: missingFilters,
    rawCreated: succeeded.reduce((sum, run) => sum + run.createdCount, 0), rawDuplicate: succeeded.reduce((sum, run) => sum + run.duplicateCount, 0),
    eventCreated: missingEvents ? null : sum("eventCreated"), eventMerged: missingEvents ? null : sum("eventMerged"),
    eventCreatedRecorded: sum("eventCreated"), eventMergedRecorded: sum("eventMerged"), unrecordedEventRuns: missingEvents,
    policyRejected: missingEvents ? null : funnels.reduce((total, item, i) => total + Math.max(0, (filters[i] ?? 0) - (count(item.policyAccepted) ?? 0)), 0),
    ingestCapacityExcluded: missingEvents ? null : sum("ingestCapacityExcluded"),
    historicalWithoutEvent: missingEvents ? null : sum("historicalWithoutEvent"), filterReasons: reasons("filterReasons"), policyReasons: reasons("policyReasons"),
    partialWriteRuns: runs.filter(run => run.status !== "SUCCEEDED").length,
    firstRunAt: runs.at(-1)?.startedAt.toISOString() ?? null, lastRunAt: runs[0]?.startedAt.toISOString() ?? null };
}
