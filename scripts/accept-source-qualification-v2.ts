import {
  evaluateSourceQualification,
  inferSourceAdapterFamilies,
  inferSourceEvidenceRoles,
  inferSourceUniverseRole,
  type SourceQualificationInput
} from "../lib/server/content/source-qualification";
import { buildQualificationCheckpoint } from "../lib/server/content/source-qualification-runtime";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_QUALIFICATION_V2_ACCEPT_FAILED:" + code);
  console.log(code + "=PASS");
}

function base(overrides: Partial<SourceQualificationInput> = {}): SourceQualificationInput {
  return {
    sourceId: "source_test",
    name: "Test Source",
    sourceType: "MEDIA",
    platform: "WEB",
    collectionMethod: "RSS",
    canonicalUrl: "https://example.com/feed.xml",
    providerRef: "TEST_PROVIDER",
    status: "ACTIVE",
    enabled: true,
    metadata: {},
    collectionConfig: {},
    signalConfig: {},
    liveRunCount: 0,
    successfulLiveRunCount: 0,
    ...overrides
  };
}

const completeEvidence = {
  stableBackend: true,
  requiresManualLoginPerRun: false,
  continuousRuntimeAvailable: true,
  stableIdentity: true,
  timeSemanticsKnown: true,
  provenanceVerified: true,
  dedupeVerified: true,
  sourceFailureIsolated: true,
  manualIsolationVerified: true,
  capabilityOutputVerified: true,
  rerunnableAcceptance: true,
  runtimeDependency: null
};

const autoInput = base({
  sourceId: "source_auto",
  sourceType: "OFFICIAL",
  metadata: { sourceQualification: completeEvidence },
  liveRunCount: 5,
  successfulLiveRunCount: 4
});
const autoCheckpoint = buildQualificationCheckpoint(autoInput);
autoInput.metadata = {
  sourceQualification: {
    ...completeEvidence,
    qualificationCheckpoint: autoCheckpoint.checkpoint
  }
};
const auto = evaluateSourceQualification(autoInput);
assert(auto.qualification === "AUTO_READY", "AUTO_READY_WITH_COMPLETE_EVIDENCE");
assert(auto.sourceRole === "OFFICIAL", "OFFICIAL_ROLE");
assert(auto.evidenceRoles.includes("PRIMARY_FACT"), "OFFICIAL_PRIMARY_FACT");
assert(auto.adapterFamilies.includes("FEED_WEB"), "RSS_FEED_WEB_FAMILY");

const fourRunsInput = base({
  sourceId: "source_four_runs",
  metadata: { sourceQualification: completeEvidence },
  liveRunCount: 4,
  successfulLiveRunCount: 4
});
const fourRunsCheckpoint = buildQualificationCheckpoint(fourRunsInput);
fourRunsInput.metadata = {
  sourceQualification: {
    ...completeEvidence,
    qualificationCheckpoint: fourRunsCheckpoint.checkpoint
  }
};
const fourRuns = evaluateSourceQualification(fourRunsInput);
assert(fourRuns.qualification === "CONDITIONAL", "FOUR_RUNS_NOT_AUTO_READY");
assert(fourRuns.reasons.includes("LIVE_RUNS_BELOW_5"), "FOUR_RUNS_REASON");

const staleCheckpoint = evaluateSourceQualification(base({
  sourceId: "source_stale_checkpoint",
  metadata: {
    sourceQualification: {
      ...completeEvidence,
      qualificationCheckpoint: "stale-checkpoint"
    }
  },
  liveRunCount: 5,
  successfulLiveRunCount: 5
}));
assert(staleCheckpoint.qualification === "CONDITIONAL", "STALE_CHECKPOINT_NOT_AUTO_READY");
assert(
  staleCheckpoint.reasons.includes("QUALIFICATION_CHECKPOINT_MISSING_OR_STALE"),
  "STALE_CHECKPOINT_REASON"
);

const manual = evaluateSourceQualification(base({
  sourceId: "source_manual",
  sourceType: "CREATOR",
  platform: "WEB",
  collectionMethod: "MANUAL",
  metadata: { sourceQualification: { manualOperationOnly: true } }
}));
assert(manual.qualification === "MANUAL_ONLY", "EXPLICIT_MANUAL_ONLY");

const temporaryManual = evaluateSourceQualification(base({
  sourceId: "source_temporary_manual",
  sourceType: "MANAGED_SOURCE",
  collectionMethod: "HTTP",
  metadata: {
    manualTarget: {
      objectType: "CONTENT",
      longTermEligible: false
    },
    sourceRegistry: {
      usageMode: "MANUAL",
      sourceRoles: ["COMMUNITY"]
    }
  }
}));
assert(temporaryManual.qualification === "MANUAL_ONLY", "TEMPORARY_MANUAL_SOURCE_NOT_AUTO_CANDIDATE");

const disabled = evaluateSourceQualification(base({
  sourceId: "source_disabled",
  enabled: false
}));
assert(disabled.qualification === "DISABLED", "DISABLED_SOURCE_DISABLED");

const restricted = evaluateSourceQualification(base({
  sourceId: "source_restricted",
  metadata: {
    sourceQualification: {
      commercialOrLegalRestriction: true
    }
  }
}));
assert(restricted.qualification === "DISABLED", "COMMERCIAL_RESTRICTION_DISABLED");

assert(
  inferSourceUniverseRole(base({ sourceType: "RESEARCH" })) === "RESEARCH",
  "RESEARCH_ROLE"
);
assert(
  inferSourceEvidenceRoles(base({ sourceType: "DEVELOPER" })).includes("ADOPTION"),
  "DEVELOPER_ADOPTION_ROLE"
);
assert(
  inferSourceAdapterFamilies(base({
    platform: "YOUTUBE",
    collectionMethod: "API"
  })).includes("PLATFORM_API"),
  "YOUTUBE_PLATFORM_API_FAMILY"
);

assert(
  inferSourceUniverseRole(base({
    sourceId: "source_legacy_media",
    sourceType: "MEDIA_DISCOVERY",
    collectionConfig: { sourceKind: "MEDIA" }
  })) === "PROFESSIONAL_MEDIA",
  "LEGACY_MEDIA_DISCOVERY_NORMALIZED"
);

assert(
  inferSourceUniverseRole(base({
    sourceId: "source_legacy_managed_official",
    sourceType: "MANAGED_SOURCE",
    canonicalUrl: "https://www.anthropic.com/news",
    providerRef: "MANUAL:https://www.anthropic.com/news",
    metadata: {
      sourceRegistry: {
        sourceRoles: ["OFFICIAL"]
      }
    }
  })) === "OFFICIAL",
  "LEGACY_MANAGED_OFFICIAL_NORMALIZED"
);

assert(
  inferSourceUniverseRole(base({
    sourceId: "source_legacy_arxiv",
    sourceType: "MANAGED_SOURCE",
    canonicalUrl: "https://export.arxiv.org/rss/cs.AI",
    providerRef: "MANUAL:https://export.arxiv.org/rss/cs.AI",
    metadata: {
      sourceRegistry: {
        sourceRoles: ["MEDIA"]
      }
    }
  })) === "RESEARCH",
  "ARXIV_STRUCTURED_ROLE_OVERRIDES_LEGACY_MEDIA"
);

const dailyHotDouyinFamilies = inferSourceAdapterFamilies(base({
  platform: "DOUYIN",
  collectionMethod: "TREND",
  collectionConfig: {
    provider: "DAILYHOT_DOUYIN"
  }
}));
assert(
  dailyHotDouyinFamilies.includes("NEWS_TREND_DISCOVERY"),
  "DAILYHOT_DOUYIN_TREND_DISCOVERY"
);
assert(
  !dailyHotDouyinFamilies.includes("SOCIAL_BROWSER"),
  "DAILYHOT_DOUYIN_NOT_BROWSER"
);

assert(
  inferSourceAdapterFamilies(base({
    platform: "HUGGING_FACE",
    collectionMethod: "RESEARCH"
  })).includes("PLATFORM_API"),
  "HUGGING_FACE_PLATFORM_API_FAMILY"
);

console.log("SOURCE_QUALIFICATION_V2_ACCEPTANCE=PASS");
