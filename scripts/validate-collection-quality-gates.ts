import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("COLLECTION_QUALITY_GATES_CONTRACT_FAILED:" + code);
  console.log(code + "=PASS");
}

const gate = fs.readFileSync("lib/server/content/pollution-syndication-gate.ts", "utf8");
const runtime = fs.readFileSync("lib/server/content/source-qualification-runtime.ts", "utf8");
const budget = fs.readFileSync("lib/server/content/event-expansion-budget.ts", "utf8");
const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const portfolio = fs.readFileSync("lib/server/content/source-portfolio-runtime.ts", "utf8");
const eventPolicy = fs.readFileSync("lib/server/content/event-policy.ts", "utf8");
const expansion = fs.readFileSync("lib/server/content/collection-expansion.ts", "utf8");
const adapterQualification = fs.readFileSync("lib/server/content/adapter-qualification.ts", "utf8");
const automaticCycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
const owner = fs.readFileSync("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md", "utf8");

assert(gate.includes("independentOriginKey"), "INDEPENDENT_ORIGIN_KEY");
assert(gate.includes("syndicatedFrom"), "SYNDICATION_TRACE");
assert(gate.includes("DECLARED_SYNDICATION"), "DECLARED_SYNDICATION_PRIORITY");
assert(gate.includes("evaluateDeterministicQualityGate"), "DETERMINISTIC_GATE_OWNER");
assert(gate.includes("evaluatePollutionGate"), "POLLUTION_GATE_OWNER");
assert(gate.includes("evaluateEventEvidenceRelevance"), "EVIDENCE_RELEVANCE_OWNER");
assert(runtime.includes("QUALIFICATION_RUNTIME_CONDITIONAL_FAILURES = 3"), "RUNTIME_3_FAILURE_DOWNGRADE");
assert(runtime.includes("QUALIFICATION_RUNTIME_DISABLED_FAILURES = 6"), "RUNTIME_6_FAILURE_DISABLE");
assert(runtime.includes("QUALIFICATION_TARGET_HOST_NOT_DECLARED"), "QUALIFICATION_HOST_BOUNDARY");
assert(runtime.includes("QUALIFICATION_TARGET_PATH_ESCAPE"), "QUALIFICATION_PATH_BOUNDARY");
assert(runtime.includes("RUNTIME_RECOVERED_FROM_CONDITIONAL"), "RUNTIME_DEGRADE_RECOVERY");
assert(runtime.includes("RECERTIFICATION_REQUIRED_AFTER_DISABLE"), "RUNTIME_DISABLE_STICKY");
assert(runtime.includes("checkpoint"), "QUALIFICATION_CHECKPOINT");
assert(budget.includes("MARGINAL_UTILITY_BELOW_THRESHOLD"), "BUDGET_MARGINAL_STOP");
assert(budget.includes("COVERAGE_SATISFIED"), "BUDGET_COVERAGE_STOP");
assert(owner.includes("syndication 不贡献 Evidence Count"), "CONTRACT_SYNDICATION_NO_EVIDENCE_COUNT");
assert(owner.includes("Pollution Gate + Deterministic Quality Gate"), "CONTRACT_PRE_AI_GATES");
assert(owner.includes("边际效用"), "CONTRACT_ADAPTIVE_BUDGET");
assert(runner.indexOf("filterCheapDiscoveryCandidates") < runner.indexOf("resolveKnownEntities"), "CHEAP_RELEVANCE_BEFORE_ENTITY");
assert(runner.indexOf("evaluateDeterministicQualityGate(item)") < runner.indexOf("resolveEntitiesForContent({"), "PRE_AI_DETERMINISTIC_GATE_ORDER");
assert(runner.indexOf("evaluatePollutionGate(item)") < runner.indexOf("resolveEntitiesForContent({"), "PRE_AI_POLLUTION_GATE_ORDER");
assert(runner.includes("validateQualificationPreviewTarget"), "LIVE_QUALIFICATION_PREVIEW_BOUNDARY");
assert(runner.includes("lastCollectedAt: finished.finishedAt ?? new Date()"), "SOURCE_LAST_COLLECTED_AT_ON_SUCCESS");
assert(runner.includes("TRANSIENT_FETCH_RETRY_DELAYS_MS = [250, 750]"), "TRANSIENT_FETCH_RETRY_BOUNDED");
assert(runner.includes('code === "ECONNRESET"') && runner.includes('code === "UND_ERR_SOCKET"') && runner.includes('code === "EAI_AGAIN"'), "TRANSIENT_FETCH_RETRY_CODES");
assert(/fetchWithTransientRetry\(current, accept(?:, signal(?:, [^)]+)?)?\)/.test(runner), "TRANSIENT_FETCH_RETRY_WIRED");
assert(eventPolicy.includes("evaluateEventEvidenceRelevance"), "EVENT_POLICY_RELEVANCE_BEFORE_INDEPENDENCE");
assert(eventPolicy.includes("independentOriginKey"), "EVENT_POLICY_INDEPENDENT_COUNT");
assert(eventPolicy.includes("item.relevance.pass"), "INDEPENDENT_COUNT_RELEVANCE_ONLY");
assert(expansion.includes("evaluateAdaptiveExpansionBudget"), "EXPANSION_ADAPTIVE_BUDGET_WIRED");
assert(expansion.includes("adaptiveBudget"), "EXPANSION_BUDGET_AUDIT");
assert(expansion.includes("evaluateEventEvidenceRelevance"), "BUDGET_RELEVANCE_BEFORE_INDEPENDENCE");
assert(expansion.includes("preEvidenceGate"), "EXPANSION_PRE_EVIDENCE_GATE_AUDIT");
assert(adapterQualification.includes("qualificationCheckpoint"), "QUALIFICATION_CHECKPOINT_PERSISTED");
assert(portfolio.includes("runSourceCollection"), "CURRENT_PORTFOLIO_UNIFIED_RUNNER");
assert(portfolio.includes('status: "FAILED"'), "SOURCE_FAILURE_ISOLATION");
assert(automaticCycle.includes("listDueSourceIdsForAutomaticCycle"), "AUTOMATIC_CYCLE_DUE_SELECTION");
assert(automaticCycle.includes("runSystemSourcePortfolio"), "AUTOMATIC_CYCLE_SINGLE_PORTFOLIO_OWNER");
assert(automaticCycle.includes("listCurrentSystemCollectionSourceIds"), "AUTOMATIC_CYCLE_UNIFIED_SOURCE_DISCOVERY");
assert(!automaticCycle.includes("OPERATOR_SOURCE_PORTFOLIO"), "NO_OPERATOR_PARALLEL_RUNTIME");
assert(automaticCycle.includes("reconcileSourceRuntimeQualifications"), "AUTOMATIC_CYCLE_RECONCILES_QUALIFICATION");
assert(!automaticCycle.includes('runSection("MEDIA"') && !automaticCycle.includes('runSection("RESEARCH"') && !automaticCycle.includes('runSection("TREND"'), "NO_PARALLEL_MEDIA_RESEARCH_TREND_RUNTIME");

console.log("COLLECTION_QUALITY_GATES_CONTRACT=PASS");
