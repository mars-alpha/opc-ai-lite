import { listCurrentHotTodayIntelligence } from "../lib/server/content/intelligence-read-model";
import { listSourceRuntimeOperations } from "../lib/server/content/source-runtime-operations";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("RADAR_COLLECTION_ACCEPTANCE_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const [hot, automatic] = await Promise.all([
    listCurrentHotTodayIntelligence(100),
    listSourceRuntimeOperations(120)
  ]);

  assert(hot.every((item) =>
    item.currentHot.authority === "PRESENTATION_ONLY" &&
    item.currentHot.formalRanking === true &&
    item.topicMomentum.eligible
  ), "CURRENT_HOT_AUTHORITY_BOUNDARY");
  assert(hot.every((item, index) =>
    index === 0 || hot[index - 1].topicMomentum.score >= item.topicMomentum.score
  ), "CURRENT_HOT_SORT");
  assert(automatic.sourceHealth.length > 0, "SOURCE_HEALTH_NONEMPTY");
  assert(automatic.sourceHealth.every((item) => {
    const values = [
      item.utility.successRate,
      item.utility.aiRelevantKeepRate,
      item.utility.duplicateRate
    ].filter((value): value is number => value !== null);
    return values.every((value) => value >= 0 && value <= 100);
  }), "SOURCE_UTILITY_BOUNDED");
  assert(automatic.sourceHealth.every((item) =>
    item.qualification !== "AUTO_READY" || item.acquisitionKind !== "UNRESOLVED"
  ), "AUTO_READY_ACQUISITION_RESOLVED");
  assert(automatic.sourceHealth.every((item) =>
    item.qualification !== "AUTO_READY" || item.serverRuntimeSupported
  ), "AUTO_READY_RUNTIME_TRUTHFUL");
  assert(automatic.summary.runtimeGapCount === automatic.sourceHealth.filter((item) =>
    !item.serverRuntimeSupported
  ).length, "RUNTIME_GAP_SUMMARY_MATCHES");

  console.log("CURRENT_HOT_COUNT=" + hot.length);
  console.log("MONITORED_SOURCE_COUNT=" + automatic.summary.monitoredSourceCount);
  console.log("HEALTHY_SOURCE_COUNT=" + automatic.summary.healthySourceCount);
  console.log("RUNTIME_GAP_COUNT=" + automatic.summary.runtimeGapCount);
  console.log("RECENT_RECEIVED_TOTAL=" + automatic.summary.receivedTotal);
  console.log("RECENT_KEPT_TOTAL=" + automatic.summary.keptTotal);
  console.log("ACQUISITION_KIND_DISTRIBUTION=" + JSON.stringify(
    automatic.sourceHealth.reduce<Record<string, number>>((acc, item) => {
      acc[item.acquisitionKind] = (acc[item.acquisitionKind] ?? 0) + 1;
      return acc;
    }, {})
  ));
  console.log("RADAR_COLLECTION_REARCHITECTURE_ACCEPTANCE=PASS");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
