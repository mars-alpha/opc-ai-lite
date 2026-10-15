import {
  evaluateDeterministicQualityGate,
  evaluateEventEvidenceRelevance,
  evaluatePollutionGate,
  resolveIndependentOrigins
} from "../lib/server/content/pollution-syndication-gate";
import { evaluateAdaptiveExpansionBudget } from "../lib/server/content/event-expansion-budget";
import {
  buildQualificationCheckpoint,
  evaluateRuntimeQualificationWindow,
  validateQualificationPreviewTarget
} from "../lib/server/content/source-qualification-runtime";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("POLLUTION_SYNDICATION_022C_FAILED:" + code);
  console.log(code + "=PASS");
}

assert(
  evaluateDeterministicQualityGate({
    title: "OpenAI releases new API capability",
    originalUrl: "https://openai.com/news/example"
  }).pass,
  "DETERMINISTIC_QUALITY_PASS"
);
assert(
  !evaluatePollutionGate({
    title: "Access denied",
    excerpt: "Enable JavaScript to continue",
    originalUrl: "https://example.com/challenge"
  }).pass,
  "POLLUTION_GATE_BLOCKS_ACCESS_WALL"
);

const origins = resolveIndependentOrigins([
  {
    sourceId: "a",
    sourceName: "Original Media",
    canonicalUrl: "https://original.example",
    author: "Alice",
    title: "OpenAI launches Example Agent for developers",
    excerpt: "OpenAI launches Example Agent with a new developer workflow.",
    publishedAt: "2026-10-10T00:00:00Z"
  },
  {
    sourceId: "b",
    sourceName: "Syndicated Portal",
    canonicalUrl: "https://portal.example",
    author: "Alice",
    title: "OpenAI launches Example Agent for developers",
    excerpt: "OpenAI launches Example Agent with a new developer workflow.",
    publishedAt: "2026-10-10T00:10:00Z"
  },
  {
    sourceId: "c",
    sourceName: "Independent Media",
    canonicalUrl: "https://independent.example",
    author: "Bob",
    title: "Developers test OpenAI Example Agent in production",
    excerpt: "Independent testing finds new behavior and tradeoffs.",
    publishedAt: "2026-10-10T00:20:00Z"
  }
]);
assert(new Set(origins.map((item) => item.independentOriginKey)).size === 2, "SYNDICATION_COLLAPSES_EVIDENCE_COUNT");
assert(origins.find((item) => item.sourceId === "b")?.syndicatedFrom === "a", "SYNDICATION_TRACEABLE");

const declaredOrigins = resolveIndependentOrigins([
  {
    sourceId: "root-source",
    sourceName: "Root Publisher",
    canonicalUrl: "https://root.example",
    title: "OpenAI Example Agent launch",
    excerpt: "Original reporting.",
    publishedAt: "2026-10-10T00:00:00Z"
  },
  {
    sourceId: "portal-source",
    sourceName: "Portal Publisher",
    canonicalUrl: "https://portal.example",
    sourceMetadata: { syndicatedFromSourceId: "root-source" },
    title: "A rewritten portal headline",
    excerpt: "Different wording but explicitly syndicated.",
    publishedAt: "2026-10-10T00:05:00Z"
  }
]);
assert(
  declaredOrigins.find((item) => item.sourceId === "portal-source")?.independenceReason ===
    "DECLARED_SYNDICATION",
  "DECLARED_SYNDICATION_COLLAPSES_ORIGIN"
);

assert(
  evaluateEventEvidenceRelevance({
    eventTitle: "OpenAI launches Example Agent",
    eventKeywords: ["OpenAI", "Example Agent"],
    eventEntities: ["OpenAI"],
    candidateTitle: "OpenAI Example Agent hands-on test",
    candidateExcerpt: "We tested the new Example Agent workflow."
  }).pass,
  "EVENT_EVIDENCE_RELEVANCE_PASS"
);
assert(
  !evaluateEventEvidenceRelevance({
    eventTitle: "OpenAI launches Example Agent",
    eventKeywords: ["OpenAI", "Example Agent"],
    eventEntities: ["OpenAI"],
    candidateTitle: "Microsoft announces new Surface hardware",
    candidateExcerpt: "A laptop release unrelated to the event."
  }).pass,
  "EVENT_EVIDENCE_RELEVANCE_REJECT"
);
assert(
  !evaluateEventEvidenceRelevance({
    eventTitle: "A Multi-Agent LLM System for Automated Tuning of Specialized Neural Network Models",
    candidateTitle: "Sakana AI’s LLM Peer Review System Catches 73% of Core-Claim Errors",
    candidateExcerpt: "A 3-agent reviewer catches core-claim errors."
  }).pass,
  "EVENT_EVIDENCE_GENERIC_LLM_OVERLAP_REJECT"
);

const coverageStop = evaluateAdaptiveExpansionBudget({
  budgetUsed: 4,
  budgetLimit: 6,
  recentSamples: [{ budgetUnits: 1, independentEvidenceGained: 1 }],
  independentOriginCount: 3,
  evidenceTypeCount: 3
});
assert(coverageStop.action === "STOP" && coverageStop.reason === "COVERAGE_SATISFIED", "BUDGET_STOPS_ON_COVERAGE");

const lowUtilityStop = evaluateAdaptiveExpansionBudget({
  budgetUsed: 3,
  budgetLimit: 6,
  recentSamples: [
    { budgetUnits: 1, independentEvidenceGained: 0 },
    { budgetUnits: 1, independentEvidenceGained: 0 },
    { budgetUnits: 1, independentEvidenceGained: 0 }
  ],
  independentOriginCount: 0,
  evidenceTypeCount: 0
});
assert(lowUtilityStop.action === "STOP", "BUDGET_STOPS_ON_LOW_MARGINAL_UTILITY");

const extend = evaluateAdaptiveExpansionBudget({
  budgetUsed: 6,
  budgetLimit: 6,
  maxBudget: 12,
  recentSamples: [
    { budgetUnits: 1, independentEvidenceGained: 1 },
    { budgetUnits: 1, independentEvidenceGained: 1 },
    { budgetUnits: 1, independentEvidenceGained: 1 }
  ],
  independentOriginCount: 2,
  evidenceTypeCount: 2
});
assert(extend.action === "EXTEND" && extend.budgetLimit === 8, "BUDGET_EXTENDS_HIGH_EFFICIENCY");

assert(
  evaluateRuntimeQualificationWindow({
    baselineQualification: "AUTO_READY",
    statuses: ["FAILED", "FAILED", "FAILED"]
  }).effectiveQualification === "CONDITIONAL",
  "QUALIFICATION_DEGRADES_AFTER_3_FAILURES"
);
assert(
  evaluateRuntimeQualificationWindow({
    baselineQualification: "AUTO_READY",
    statuses: ["FAILED", "FAILED", "FAILED", "FAILED", "FAILED", "FAILED"]
  }).effectiveQualification === "DISABLED",
  "QUALIFICATION_DISABLES_AFTER_6_FAILURES"
);
assert(
  evaluateRuntimeQualificationWindow({
    baselineQualification: "CONDITIONAL",
    statuses: ["SUCCEEDED"]
  }).effectiveQualification === "CONDITIONAL",
  "QUALIFICATION_RECOVERY_REQUIRES_RECERTIFICATION"
);
assert(
  evaluateRuntimeQualificationWindow({
    baselineQualification: "AUTO_READY",
    statuses: ["SUCCEEDED"],
    priorEffectiveQualification: "CONDITIONAL"
  }).effectiveQualification === "AUTO_READY",
  "AUTO_DEGRADE_RECOVERS_AFTER_CURRENT_RECERTIFICATION"
);
assert(
  evaluateRuntimeQualificationWindow({
    baselineQualification: "AUTO_READY",
    statuses: ["SUCCEEDED"],
    priorEffectiveQualification: "DISABLED"
  }).effectiveQualification === "DISABLED",
  "AUTO_DISABLE_IS_STICKY_UNTIL_RECERTIFICATION"
);

validateQualificationPreviewTarget({
  canonicalUrl: "https://example.com/feed",
  targetUrl: "https://example.com/feed/latest",
  allowedPathPrefixes: ["/feed"]
});
let hostBlocked = false;
try {
  validateQualificationPreviewTarget({
    canonicalUrl: "https://example.com/feed",
    targetUrl: "https://evil.example/feed"
  });
} catch {
  hostBlocked = true;
}
assert(hostBlocked, "QUALIFICATION_REJECTS_UNDECLARED_HOST");
let pathEscapeBlocked = false;
try {
  validateQualificationPreviewTarget({
    canonicalUrl: "https://example.com/feed",
    targetUrl: "https://example.com/feed/%2e%2e/admin"
  });
} catch {
  pathEscapeBlocked = true;
}
assert(pathEscapeBlocked, "QUALIFICATION_REJECTS_ENCODED_PATH_ESCAPE");

const checkpointA = buildQualificationCheckpoint({
  sourceId: "s",
  platform: "WEB",
  collectionMethod: "RSS",
  canonicalUrl: "https://example.com/feed",
  metadata: { runtimeVersion: "v1", sourceSchemaVersion: "1" }
});
const checkpointB = buildQualificationCheckpoint({
  sourceId: "s",
  platform: "WEB",
  collectionMethod: "RSS",
  canonicalUrl: "https://example.com/feed",
  metadata: { runtimeVersion: "v2", sourceSchemaVersion: "1" }
});
assert(checkpointA.checkpoint !== checkpointB.checkpoint, "QUALIFICATION_CHECKPOINT_BINDS_ADAPTER_VERSION");

console.log("COLLECTION_QUALITY_GATES_ACCEPTANCE=PASS");

