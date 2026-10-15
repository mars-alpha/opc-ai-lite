import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("COMMENT_DEMAND_FAILED:" + code);
  console.log(code + "=PASS");
}

const core = fs.readFileSync("lib/server/content/comment-insight.ts", "utf8");
const api = fs.readFileSync("app/api/admin/content/discovery/events/[eventId]/demand-signals/route.ts", "utf8");
const contract = fs.readFileSync("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md", "utf8");

assert(core.includes('"QUESTION"') && core.includes('"PAIN_POINT"') && core.includes('"REQUEST"') && core.includes('"OPINION"'), "COMMENT_DEMAND_FOUR_DEMAND_TYPES");
assert(!core.includes('"HOW_TO"') && !core.includes('"CONCEPT"') && !core.includes('"COST"'), "COMMENT_DEMAND_LEGACY_TYPES_EXIT_RUNTIME");
assert(core.includes("resolveCommentDemandTrigger") && core.includes("COMMENT_DEMAND_TRIGGER_REQUIRED"), "COMMENT_DEMAND_TRIGGER_GATE");
assert(core.includes("MAX_COMMENT_TARGET_RAWS") && core.includes("MAX_CLEANED_COMMENTS") && core.includes("MAX_DEMAND_CLUSTERS"), "COMMENT_DEMAND_BOUNDED_BUDGET");
assert(core.includes("factEvidence: false") && core.includes("verificationAuthority: false") && core.includes("hotspotAuthority: false"), "COMMENT_DEMAND_FACT_ISOLATION");
assert(core.includes("demandClusterKey") && core.includes("commentFingerprint") && core.includes("runtimeVersion"), "COMMENT_DEMAND_IDEMPOTENCY_PROVENANCE");
assert(core.includes("runtimeVersion === COMMENT_DEMAND_RUNTIME_VERSION"), "COMMENT_DEMAND_LEGACY_ROWS_EXCLUDED_FROM_CURRENT_READ_MODEL");
assert(core.includes('["HACKER_NEWS", "REDDIT", "GITHUB", "YOUTUBE"].includes(raw.platform)'), "COMMENT_DEMAND_SUPPORTED_TARGETS_BEFORE_BUDGET");
assert(core.includes("commentIds") && core.includes("collectedAt") && core.includes("triggerReasons"), "COMMENT_DEMAND_COMMENT_PROVENANCE");
assert(core.includes("TUTORIAL") && core.includes("FAQ") && core.includes("PRACTICE") && core.includes("PROJECT"), "COMMENT_DEMAND_DOWNSTREAM_CANDIDATES");
assert(api.includes("trigger") && api.includes("runCommentDemandMining"), "COMMENT_DEMAND_API_TRIGGER_INPUT");
assert(contract.includes("Trigger-based Comment Collection") && contract.includes("Demand Cluster"), "COMMENT_DEMAND_CONTRACT_OWNER");
console.log("COMMENT_DEMAND_CONTRACT=PASS");
