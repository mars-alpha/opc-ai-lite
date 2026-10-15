import {
  ADAPTER_QUALIFICATION_REQUIRED_RUNS,
  evaluateAdapterQualificationSession
} from "../lib/server/content/adapter-qualification";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("ADAPTER_QUALIFICATION_FAILED:" + code);
  console.log(code + "=PASS");
}

const runKind = "SOURCE_QUALIFICATION:test";
const rawItems = Array.from({ length: 3 }, (_, index) => ({
  id: "raw-" + index,
  publishedAt: new Date("2026-10-10T00:0" + index + ":00Z")
}));
const runs = Array.from({ length: ADAPTER_QUALIFICATION_REQUIRED_RUNS }, (_, index) => ({
  id: "run-" + index,
  status: index < 4 ? "SUCCEEDED" : "FAILED",
  collectionMethod: "RSS",
  receivedCount: index < 4 ? 3 : 0,
  duplicateCount: index > 0 && index < 4 ? 3 : 0,
  metadata: {
    collectionOrigin: "SYSTEM",
    collectionRunKind: runKind,
    manualTaskId: null,
    rawItemIds: index < 4 ? ["raw-0", "raw-1", "raw-2"] : []
  }
}));

const result = evaluateAdapterQualificationSession({
  source: {
    id: "source-test-feed",
    name: "Test Feed",
    sourceType: "MEDIA",
    platform: "WEB",
    collectionMethod: "RSS",
    canonicalUrl: "https://example.com/feed.xml",
    providerRef: "TEST_FEED",
    status: "ACTIVE",
    enabled: true,
    metadata: {},
    collectionConfig: {},
    signalConfig: {}
  },
  runKind,
  runs,
  rawItems,
  contractEvidence: {
    failureIsolationVerified: true,
    manualIsolationVerified: true,
    rerunnableAcceptance: true
  }
});

assert(result.qualification === "AUTO_READY", "FOUR_OF_FIVE_CAN_AUTO_READY");
assert(result.evidence.liveRunCount === 5, "SESSION_EXACTLY_FIVE_RUNS");
assert(result.evidence.successfulLiveRunCount === 4, "SESSION_FOUR_SUCCESS");
assert(result.evidence.provenanceVerified, "SESSION_SYSTEM_PROVENANCE");
assert(result.evidence.dedupeVerified, "SESSION_DEDUPE_OBSERVED");
assert(result.evidence.timeSemanticsKnown, "SESSION_TIME_SEMANTICS");
assert(result.evidence.capabilityOutputVerified, "SESSION_OUTPUT_VERIFIED");

const qualificationOnlyRuns = runs.map((run) => ({
  ...run,
  duplicateCount: 0,
  metadata: {
    collectionOrigin: "SYSTEM",
    collectionRunKind: runKind,
    manualTaskId: null,
    qualificationOnly: true,
    qualificationCandidateKeys: ["key-a", "key-b", "key-c"],
    qualificationPublishedCoverage: 1
  }
}));
const qualificationOnly = evaluateAdapterQualificationSession({
  source: {
    id: "source-qualification-only",
    name: "Qualification Only Feed",
    sourceType: "OFFICIAL",
    platform: "WEB",
    collectionMethod: "RSS",
    canonicalUrl: "https://example.com/feed.xml",
    providerRef: "QUALIFICATION_ONLY",
    status: "ACTIVE",
    enabled: true,
    metadata: {},
    collectionConfig: {},
    signalConfig: {}
  },
  runKind,
  runs: qualificationOnlyRuns,
  rawItems: [],
  contractEvidence: {
    failureIsolationVerified: true,
    manualIsolationVerified: true,
    rerunnableAcceptance: true
  }
});
assert(
  qualificationOnly.qualification === "AUTO_READY",
  "QUALIFICATION_ONLY_CAN_AUTO_READY_WITHOUT_RAW_MUTATION"
);
assert(
  qualificationOnly.qualificationCandidateCount === 3,
  "QUALIFICATION_ONLY_CANDIDATE_COUNT"
);
assert(
  qualificationOnly.referencedRawItemCount === 0,
  "QUALIFICATION_ONLY_NO_RAW_REQUIRED"
);

const historyOnly = evaluateAdapterQualificationSession({
  source: {
    id: "source-history",
    name: "History Only",
    sourceType: "MEDIA",
    platform: "WEB",
    collectionMethod: "RSS",
    canonicalUrl: "https://example.com/feed.xml",
    providerRef: "HISTORY",
    status: "ACTIVE",
    enabled: true,
    metadata: {},
    collectionConfig: {},
    signalConfig: {}
  },
  runKind,
  runs: runs.map((run) => ({
    ...run,
    metadata: {
      ...run.metadata,
      collectionRunKind: "OLD_HISTORY"
    }
  })),
  rawItems,
  contractEvidence: {
    failureIsolationVerified: true,
    manualIsolationVerified: true,
    rerunnableAcceptance: true
  }
});
assert(historyOnly.qualification === "CONDITIONAL", "HISTORICAL_RUNS_NOT_COUNTED");
assert(historyOnly.evidence.liveRunCount === 0, "HISTORY_SESSION_ZERO");

console.log("ADAPTER_QUALIFICATION_ACCEPTANCE=PASS");
