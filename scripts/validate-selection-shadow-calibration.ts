import {
  calculateSelectionAttentionScore,
  combineSelectionShadowScores,
  applySelectionShadowT2Policy,
  resolveSelectionShadowOriginTier,
  resolveSelectionShadowSourceTier,
  selectionShadowBinaryMetrics,
  validateSelectionShadowModelOutput
} from "../lib/content/selection-shadow";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const model = validateSelectionShadowModelOutput({
  contentType: "TOOL_OR_PROMPT",
  sig: 5,
  nov: 8,
  cred: 7,
  reson: 8,
  act: 9,
  reasonSummary: "可直接复用的方法，信息增量和可操作性较强。"
});

assert(model.attentionScore === calculateSelectionAttentionScore("TOOL_OR_PROMPT", model), "ATTENTION_SCORE_DETERMINISTIC");
assert(model.attentionScore === 80, "AIHOT_WEIGHT_REFERENCE_DRIFT");
assert(resolveSelectionShadowSourceTier({ sourceType: "OFFICIAL" }) === "T1", "OFFICIAL_TIER");
assert(resolveSelectionShadowSourceTier({ sourceType: "RESEARCH" }) === "T1_5", "RESEARCH_TIER");
assert(resolveSelectionShadowSourceTier({ sourceType: "MEDIA" }) === "T2", "MEDIA_TIER");
assert(resolveSelectionShadowSourceTier({ sourceType: "MEDIA", metadata: { selectionTier: "T1_5" } }) === "T1_5", "EXPLICIT_TIER_OVERRIDE");

assert(resolveSelectionShadowOriginTier([{
  sourceType: "MEDIA",
  sourceMetadata: { sourceUniverseRole: "DISCOVERY_AGGREGATOR", referenceOnly: true },
  rawMetadata: {
    referenceOnly: true,
    originPublisher: "Comfy Blog",
    resolvedEntities: [{
      status: "KNOWN",
      referenceStrength: "STRONG",
      canonicalName: "ComfyUI",
      displayNameZh: "ComfyUI",
      matchedTerm: "comfyui"
    }]
  },
  originalUrl: "https://blog.comfy.org/p/example"
}]) === "T1", "ORIGIN_OFFICIAL_AGGREGATOR_MUST_PROMOTE_T1");

assert(resolveSelectionShadowOriginTier([{
  sourceType: "RESEARCH",
  sourceMetadata: { portfolioGroup: "Curated Media" },
  rawMetadata: { originPublisher: "MarkTechPost Research" },
  originalUrl: "https://www.marktechpost.com/example"
}]) === "T2", "RESEARCH_LABEL_ALONE_MUST_NOT_PROMOTE_T1_5");

assert(resolveSelectionShadowOriginTier([{
  sourceType: "RESEARCH",
  sourceMetadata: { sourceUniverseRole: "ACADEMIC_RESEARCH" },
  rawMetadata: {},
  originalUrl: "https://example.edu/paper"
}]) === "T1_5", "EXPLICIT_RESEARCH_ROLE_MUST_MAP_T1_5");

const scoreA = validateSelectionShadowModelOutput({
  contentType: "PRODUCT_LAUNCH",
  sig: 7, nov: 8, cred: 8, reson: 8, act: 8,
  reasonSummary: "产品变化明确且可直接使用。"
});
const scoreB = validateSelectionShadowModelOutput({
  contentType: "PRODUCT_LAUNCH",
  sig: 7, nov: 7, cred: 8, reson: 8, act: 8,
  reasonSummary: "新能力对目标读者有直接使用价值。"
});
const combined = combineSelectionShadowScores(scoreA, scoreB, "T1");
assert(combined.selectedShadow, "DOUBLE_SCORE_THRESHOLD");
assert(combined.authority === "SHADOW_ONLY", "SHADOW_AUTHORITY");

const strongFactRelease = applySelectionShadowT2Policy("T2_80_STRONG_PRACTICAL_FACT_V2", {
  sourceTier: "T2",
  contentType: "MODEL_RELEASE",
  averageScore: 68,
  scoreA: validateSelectionShadowModelOutput({
    contentType: "MODEL_RELEASE",
    sig: 8, nov: 7, cred: 5, reson: 8, act: 7,
    reasonSummary: "release"
  }),
  scoreB: validateSelectionShadowModelOutput({
    contentType: "MODEL_RELEASE",
    sig: 7, nov: 6, cred: 5, reson: 8, act: 6,
    reasonSummary: "release"
  }),
  materialText: "Benchmarks, pricing, available now, how to use, 1M context capability",
  directFactSupport: true
});
assert(strongFactRelease.selected === true, "STRONG_FACT_RELEASE_SUPPLEMENT");

const signalOnlyRelease = applySelectionShadowT2Policy("T2_80_STRONG_PRACTICAL_FACT_V2", {
  sourceTier: "T2",
  contentType: "MODEL_RELEASE",
  averageScore: 79,
  scoreA: validateSelectionShadowModelOutput({
    contentType: "MODEL_RELEASE",
    sig: 8, nov: 8, cred: 7, reson: 8, act: 7,
    reasonSummary: "signal"
  }),
  scoreB: validateSelectionShadowModelOutput({
    contentType: "MODEL_RELEASE",
    sig: 8, nov: 9, cred: 8, reson: 9, act: 8,
    reasonSummary: "signal"
  }),
  materialText: "Benchmark pricing available capability update",
  directFactSupport: false
});
assert(signalOnlyRelease.selected === false, "SIGNAL_ONLY_RELEASE_MUST_NOT_SUPPLEMENT");

const metrics = selectionShadowBinaryMetrics([
  { predicted: true, expected: true },
  { predicted: true, expected: false },
  { predicted: false, expected: true },
  { predicted: false, expected: false }
]);
assert(metrics.truePositive === 1 && metrics.falsePositive === 1 && metrics.falseNegative === 1, "BINARY_COUNTS");
assert(metrics.precision === 50 && metrics.recall === 50 && metrics.f1 === 50, "BINARY_METRICS");

let rejected = false;
try {
  validateSelectionShadowModelOutput({
    contentType: "PRODUCT_LAUNCH",
    sig: 11, nov: 1, cred: 1, reson: 1, act: 1,
    reasonSummary: "invalid"
  });
} catch {
  rejected = true;
}
assert(rejected, "INVALID_AXIS_FAIL_CLOSED");

console.log(JSON.stringify({
  task: "AIHOT-SELECTION-CALIBRATION-001",
  rule: "AIHOT five-axis weights adapted for OPC AI",
  referenceAttentionScore: model.attentionScore,
  thresholds: { T1: 60, T1_5: 65, T2: 76 },
  shadowAuthorityOnly: true,
  metricsFixture: metrics,
  status: "PASS"
}, null, 2));
