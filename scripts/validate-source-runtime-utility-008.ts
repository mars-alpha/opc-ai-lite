import {
  buildSourceRuntimeUtilityFacts,
  evaluateSourceRuntimeUtility
} from "../lib/server/content/source-runtime-utility";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_RUNTIME_UTILITY_008_FAILED:" + code);
  console.log(code + "=PASS");
}

function run(overrides: Partial<ReturnType<typeof buildSourceRuntimeUtilityFacts>>) {
  const base = {
    runCount: 10,
    succeededRunCount: 10,
    failedRunCount: 0,
    receivedCount: 100,
    keptCount: 30,
    keepRatio: 0.3,
    emptyRunCount: 0,
    emptyRunRatio: 0,
    duplicateCount: 10,
    duplicateRatio: 0.1,
    noiseDropCount: 20,
    noiseDropRatio: 0.2,
    fallbackAttemptCount: 0,
    fallbackRunCount: 0,
    fallbackRate: 0,
    independentEventContributionCount: 8,
    lastSuccessAt: "2026-10-12T04:00:00.000Z",
    lastNewItemAt: "2026-10-12T03:00:00.000Z",
    freshnessLagHours: 1,
    ...overrides
  };
  return evaluateSourceRuntimeUtility({ facts: base });
}

assert(run({}).recommendation === "AUTO_KEEP", "HEALTHY_HIGH_YIELD_AUTO_KEEP");

const lowYield = run({
  receivedCount: 120,
  keptCount: 5,
  keepRatio: 5 / 120,
  noiseDropCount: 60,
  noiseDropRatio: 0.5,
  independentEventContributionCount: 2
});
assert(lowYield.recommendation === "REDUCE_FREQUENCY", "HEALTHY_LOW_YIELD_REDUCE_FREQUENCY");

const repeatedEmpty = run({
  succeededRunCount: 10,
  receivedCount: 20,
  keptCount: 0,
  keepRatio: 0,
  emptyRunCount: 9,
  emptyRunRatio: 0.9,
  duplicateCount: 0,
  duplicateRatio: 0,
  noiseDropCount: 20,
  noiseDropRatio: 1,
  independentEventContributionCount: 0,
  lastNewItemAt: null,
  freshnessLagHours: null
});
assert(repeatedEmpty.recommendation === "DISABLE_CANDIDATE", "REPEATED_EMPTY_DISABLE_CANDIDATE");

const highFallback = run({
  fallbackAttemptCount: 8,
  fallbackRunCount: 7,
  fallbackRate: 0.7,
  independentEventContributionCount: 5
});
assert(highFallback.recommendation === "CONDITIONAL", "HIGH_FALLBACK_CONDITIONAL");

const duplicateChurn = run({
  receivedCount: 100,
  keptCount: 90,
  keepRatio: 0.9,
  duplicateCount: 90,
  duplicateRatio: 0.9,
  independentEventContributionCount: 0,
  lastNewItemAt: null,
  freshnessLagHours: null
});
assert(duplicateChurn.recommendation === "DISABLE_CANDIDATE", "DUPLICATE_CHURN_DISABLE_CANDIDATE");

const coverageCritical = evaluateSourceRuntimeUtility({
  facts: {
    ...({
      runCount: 10,
      succeededRunCount: 10,
      failedRunCount: 0,
      receivedCount: 20,
      keptCount: 0,
      keepRatio: 0,
      emptyRunCount: 9,
      emptyRunRatio: 0.9,
      duplicateCount: 0,
      duplicateRatio: 0,
      noiseDropCount: 20,
      noiseDropRatio: 1,
      fallbackAttemptCount: 0,
      fallbackRunCount: 0,
      fallbackRate: 0,
      independentEventContributionCount: 0,
      lastSuccessAt: null,
      lastNewItemAt: null,
      freshnessLagHours: null
    })
  },
  coverageCritical: true,
  coverageRiskReasons: ["ROLE_MINIMUM:RESEARCH"]
});
assert(coverageCritical.recommendation !== "DISABLE_CANDIDATE", "COVERAGE_CRITICAL_DISABLE_PROTECTED");
assert(coverageCritical.coverageRiskReasons.length === 1, "COVERAGE_CRITICAL_REASON_PRESERVED");

const insufficient = run({ runCount: 3, succeededRunCount: 3 });
assert(insufficient.recommendation === "AUTO_KEEP", "INSUFFICIENT_HISTORY_NO_AUTO_DOWNGRADE");

const facts = buildSourceRuntimeUtilityFacts({
  now: new Date("2026-10-12T12:00:00.000Z"),
  independentEventContributionCount: 3,
  lastNewItemAt: new Date("2026-10-12T06:00:00.000Z"),
  runs: [
    {
      status: "SUCCEEDED",
      receivedCount: 10,
      createdCount: 4,
      duplicateCount: 2,
      startedAt: new Date("2026-10-12T01:00:00.000Z"),
      finishedAt: new Date("2026-10-12T01:01:00.000Z"),
      metadata: {
        storedCount: 6,
        discoveryFilter: { cheapGate: { dropped: 2 }, dropped: 1 },
        rejectedSampleCapture: { totalRejected: 3 },
        acquisitionRouteRole: "FALLBACK",
        acquisitionFallbackReason: "PRIMARY_FAILED",
        acquisitionRouteAttempts: [
          { role: "PRIMARY", status: "FAILED" },
          { role: "FALLBACK", status: "SUCCEEDED" }
        ]
      }
    },
    {
      status: "SUCCEEDED",
      receivedCount: 10,
      createdCount: 0,
      duplicateCount: 8,
      startedAt: new Date("2026-10-11T01:00:00.000Z"),
      finishedAt: new Date("2026-10-11T01:01:00.000Z"),
      metadata: {
        storedCount: 8,
        discoveryFilter: { cheapGate: { dropped: 2 }, dropped: 0 },
        rejectedSampleCapture: { totalRejected: 2 }
      }
    },
    {
      status: "SUCCEEDED",
      receivedCount: 99,
      createdCount: 99,
      duplicateCount: 0,
      startedAt: new Date("2026-10-10T01:00:00.000Z"),
      metadata: { qualificationOnly: true }
    }
  ]
});
assert(facts.runCount === 2, "QUALIFICATION_RUN_EXCLUDED");
assert(facts.receivedCount === 20 && facts.keptCount === 14, "RUN_FACTS_AGGREGATED");
assert(facts.duplicateCount === 10 && facts.duplicateRatio === 0.5, "DUPLICATE_FACTS_AGGREGATED");
assert(facts.noiseDropCount === 5 && facts.noiseDropRatio === 0.25, "NOISE_FACTS_AGGREGATED");
assert(facts.fallbackRunCount === 1 && facts.fallbackRate === 0.5, "FALLBACK_FACTS_AGGREGATED");
assert(facts.emptyRunCount === 0 && facts.emptyRunRatio === 0, "EMPTY_RUN_FACTS_AGGREGATED");
assert(facts.independentEventContributionCount === 3, "EVENT_CONTRIBUTION_PRESERVED");
assert(facts.freshnessLagHours === 6, "FRESHNESS_LAG_CALCULATED");

console.log("SOURCE_RUNTIME_UTILITY_008=PASS");
