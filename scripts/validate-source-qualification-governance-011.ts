import fs from "node:fs";
import {
  evaluateSourceQualification,
  type SourceQualificationInput
} from "../lib/server/content/source-qualification";
import { buildQualificationCheckpoint } from "../lib/server/content/source-qualification-runtime";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_QUALIFICATION_GOVERNANCE_011_FAILED:" + code);
  console.log(code + "=PASS");
}

function source(overrides: Partial<SourceQualificationInput> = {}): SourceQualificationInput {
  return {
    sourceId: "source-011",
    name: "Official Test Source",
    sourceType: "OFFICIAL",
    platform: "WEB",
    collectionMethod: "RSS",
    canonicalUrl: "https://example.com/feed.xml",
    providerRef: "OFFICIAL_TEST",
    status: "ACTIVE",
    enabled: true,
    metadata: {},
    collectionConfig: {
      acquisition: {
        routes: [{
          id: "primary",
          role: "PRIMARY",
          kind: "RSS_ATOM",
          url: "https://example.com/feed.xml",
          costLevel: "LOW",
          enabled: true
        }]
      }
    },
    signalConfig: {},
    liveRunCount: 5,
    successfulLiveRunCount: 4,
    runtimeEvidence: {
      currentRuntimeContractObserved: true,
      checkpointCurrent: true,
      stableRouteExecution: true,
      systemProvenanceVerified: true,
      timeSemanticsKnown: true,
      capabilityOutputVerified: true
    },
    ...overrides
  };
}

const checkpointBase = source();
const first = buildQualificationCheckpoint(checkpointBase);
const withQualificationResult = buildQualificationCheckpoint({
  ...checkpointBase,
  metadata: {
    sourceQualification: {
      qualification: "AUTO_READY",
      qualificationVersion: "adapter-qualification-v99"
    }
  }
});
assert(
  first.checkpoint === withQualificationResult.checkpoint,
  "CHECKPOINT_NOT_SELF_INVALIDATED_BY_QUALIFICATION_RESULT"
);

const changedRoute = buildQualificationCheckpoint({
  ...checkpointBase,
  collectionConfig: {
    acquisition: {
      routes: [{
        id: "primary",
        role: "PRIMARY",
        kind: "RSS_ATOM",
        url: "https://example.com/v2/feed.xml",
        costLevel: "LOW",
        enabled: true
      }]
    }
  }
});
assert(first.checkpoint !== changedRoute.checkpoint, "CHECKPOINT_BOUND_TO_ACQUISITION_ROUTE");

const mature = evaluateSourceQualification(source());
assert(mature.evidenceSufficiency === "MATURE", "MATURE_EVIDENCE_5_RUNS_4_SUCCESS");
assert(mature.qualification === "AUTO_READY", "MATURE_RUNTIME_EVIDENCE_AUTO_READY");

const early = evaluateSourceQualification(source({
  liveRunCount: 2,
  successfulLiveRunCount: 1
}));
assert(early.evidenceSufficiency === "EARLY", "EARLY_EVIDENCE_BEFORE_FIVE_RUNS");
assert(early.qualification === "CONDITIONAL", "EARLY_EVIDENCE_NO_AUTO_PROMOTION");

const insufficient = evaluateSourceQualification(source({
  liveRunCount: 1,
  successfulLiveRunCount: 1
}));
assert(insufficient.evidenceSufficiency === "INSUFFICIENT", "INSUFFICIENT_EVIDENCE_EXPLICIT");

const degraded = evaluateSourceQualification(source({
  metadata: {
    runtimeQualification: {
      checkpoint: first.checkpoint,
      effectiveQualification: "CONDITIONAL",
      reason: "CONSECUTIVE_FAILURES_3"
    }
  }
}));
assert(degraded.qualification === "CONDITIONAL", "TRUE_RUNTIME_DEGRADE_BLOCKS_AUTO_READY");

const lowFrequencyOfficial = evaluateSourceQualification(source({
  name: "Low Frequency Official Source"
}));
assert(
  lowFrequencyOfficial.qualification === "AUTO_READY",
  "LOW_FREQUENCY_OFFICIAL_NOT_PENALIZED_FOR_ITEM_VOLUME"
);

const core = fs.readFileSync("lib/server/content/source-qualification.ts", "utf8");
const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const runtime = fs.readFileSync("lib/server/content/source-qualification-runtime.ts", "utf8");
assert(core.includes("SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS"), "TIME_WINDOW_IS_QUERY_SAFETY_BOUND");
assert(core.includes("SOURCE_QUALIFICATION_RECENT_RUN_LIMIT = 5"), "BUSINESS_MATURITY_USES_RECENT_FIVE_RUNS");
assert(core.includes("SOURCE_QUALIFICATION_SCAN_LIMIT = 12"), "QUERY_SAMPLE_BOUNDED_AT_TWELVE_RUNS");
assert(!core.includes("Date.now() - 30 * 86_400_000"), "NO_THIRTY_DAY_HARD_FILTER");
assert(runner.includes("collectionRuntimeVersion"), "RUN_WRITES_RUNTIME_CONTRACT_VERSION");
assert(runner.includes("qualificationCheckpoint"), "RUN_WRITES_QUALIFICATION_CHECKPOINT");
assert(
  !runtime.includes("record(meta.sourceQualification).qualificationVersion"),
  "CHECKPOINT_DOES_NOT_READ_QUALIFICATION_RESULT_VERSION"
);

console.log("SOURCE_QUALIFICATION_GOVERNANCE_011=PASS");
