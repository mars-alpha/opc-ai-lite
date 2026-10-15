import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("CONTENT_WORKSPACE_RESPONSIBILITY_FAILED:" + code);
  console.log(code + "=PASS");
}

const owner = fs.readFileSync("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md", "utf8");
const mapping = fs.readFileSync("docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md", "utf8");
const daily = fs.readFileSync("docs/content/CONTENT_AI_DAILY_PRODUCT_CONTRACT.md", "utf8");
const dailyMapping = fs.readFileSync("docs/content/CONTENT_AI_DAILY_IMPLEMENTATION_MAPPING.md", "utf8");
const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
const tasks = fs.readFileSync("TASKS.md", "utf8");
const agents = fs.readFileSync("AGENTS.md", "utf8");
const manual = fs.readFileSync("docs/DEVELOPMENT_OPERATING_MANUAL.md", "utf8");
const nav = fs.readFileSync("components/AdminWorkspaceNav.tsx", "utf8");
const manualPage = fs.readFileSync("app/admin/manual-collection/page.tsx", "utf8");
const manualApi = fs.readFileSync("app/api/admin/manual-collection/route.ts", "utf8");
const intelligenceModel = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");

for (const name of ["热点追踪", "来源管理", "内容工作台"]) {
  assert(owner.includes(name), "MODULE_" + name);
}
assert(owner.includes("Unified Collection — SYSTEM Runtime"), "RUNTIME_SYSTEM_COLLECTION");
assert(
  owner.includes("| Source identity / operator-added Source | source-management.ts + source-onboarding.ts |") &&
  owner.includes("Source Management / Source Onboarding"),
  "SOURCE_MANAGEMENT_SINGLE_OWNER"
);
assert(owner.includes("Topic Momentum current rule"), "TOPIC_MOMENTUM_OWNER");
assert(owner.includes("0–24h") && owner.includes("24–168h"), "EVENT_MOMENTUM_WINDOW");
assert(owner.includes("PRESENTATION_ONLY"), "TOPIC_MOMENTUM_NO_FACT_AUTHORITY");

assert(!nav.includes('href: "/admin/manual-collection"'), "NO_MANUAL_COLLECTION_MAIN_NAV");
assert(manualPage.includes('redirect("/admin/sources")'), "MANUAL_COLLECTION_COMPAT_REDIRECT");
assert(manualApi.includes("MANUAL_COLLECTION_PRODUCT_RETIRED"), "MANUAL_COLLECTION_API_RETIRED");
assert(!manualApi.includes("createManualCollectionTask"), "MANUAL_COLLECTION_API_NOT_AN_OWNER");
assert(mapping.includes("Legacy Manual Compatibility — RETIRED PRODUCT OWNER"), "MANUAL_PRODUCT_OWNER_RETIRED");
assert(mapping.includes("Unified SYSTEM Collection Boundary"), "MAPPING_UNIFIED_SYSTEM_COLLECTION");

assert(!daily.includes("Gate 1 — Topic Adoption"), "NO_OLD_AI_DAILY_TOPIC_GATE");
assert(daily.includes("Content Selection — Later Planning") && !daily.includes("Content Gate — Event Adoption"), "AI_DAILY_SELECTION_GATE_REPLANNED");
assert(!daily.includes("Human Gate 1: ADOPT / WATCH / IGNORE"), "NO_OLD_EVENT_DECISION_AS_CONTENT_GATE");
assert(daily.includes("独立人工采集产品已退役"), "AI_DAILY_MANUAL_PRODUCT_RETIRED");
assert(dailyMapping.includes("Event Momentum v2") && dailyMapping.includes("RISING") && dailyMapping.includes("SUSTAINED"), "AI_DAILY_EVENT_MOMENTUM_MAPPING");
assert(!dailyMapping.includes("→ Human ADOPT / WATCH / IGNORE"), "NO_OLD_EVENT_DECISION_IN_MAPPING");
assert(!owner.includes(">=2逐篇合格实践证据") && owner.includes("至少一篇原文独立满足"), "PRACTICE_RULE_SINGLE_COMPLETE_MATERIAL");

assert(!facts.includes("- - 内容发现与工作台职责边界"), "NO_FACTS_DOUBLE_BULLET");
assert(facts.includes("热点追踪") && facts.includes("/admin/intelligence"), "FACTS_HOT_TRACKING_OWNER");
assert(
  facts.includes("SYSTEM Collection") && facts.includes("唯一正式采集执行基准") &&
  !fs.existsSync("lib/server/content/manual-collection.ts") &&
  manualApi.includes("MANUAL_COLLECTION_PRODUCT_RETIRED"),
  "FACTS_NO_MANUAL_PRODUCT_CHAIN"
);
assert(
  !fs.existsSync("lib/server/content/trend-rising.ts") &&
  !intelligenceModel.includes("calculateTrendRisingScore") && intelligenceModel.includes("currentHot"),
  "FACTS_RISING_RETIRED"
);
assert(!intelligenceModel.includes("calculateTrendRisingScore"), "CURRENT_READ_MODEL_NO_RISING_CALCULATION");
assert(
  owner.includes("Topic Momentum") &&
  owner.includes("PRESENTATION_ONLY"),
  "FACTS_TOPIC_MOMENTUM_CURRENT"
);

assert(tasks.includes("SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE"), "TASKS_HOT_TRACKING_OWNER");
assert(tasks.includes("Source Management 是唯一来源 Owner"), "TASKS_SYSTEM_RUNTIME_BASELINE");
assert(tasks.includes("旧「今日情报」、旧 Rising、旧 Manual Collection"), "TASKS_OLD_PLANS_RETIRED");
assert(owner.includes("0–24h") && owner.includes("RISING") && owner.includes("24–168h") && owner.includes("SUSTAINED"), "OWNER_EVENT_MOMENTUM_WINDOW");
assert(tasks.includes("SOURCE-QUALITY-FEEDBACK") && tasks.includes("USER_APPROVED"), "HUMAN_REVIEW_GATE");

assert(agents.includes("不再存在独立“人工采集”产品 Owner"), "AGENTS_NO_MANUAL_PRODUCT_OWNER");
assert(agents.includes("旧 Rising / Formal Rising 算法已退出"), "AGENTS_RISING_RETIRED");
assert(agents.includes("SYSTEM Collection Runtime 是唯一采集执行基准"), "AGENTS_SYSTEM_RUNTIME_SINGLE_BASELINE");
assert(manual.includes("Source Management") && manual.includes("Event Momentum") && manual.includes("0–24h") && manual.includes("24–168h"), "OPERATING_MANUAL_REALIGNED");

for (const file of [
  "docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md",
  "docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md",
  "docs/content/CONTENT_AI_DAILY_PRODUCT_CONTRACT.md",
  "docs/content/CONTENT_AI_DAILY_IMPLEMENTATION_MAPPING.md",
  "docs/CURRENT_SYSTEM_FACTS.md",
  "TASKS.md",
  "AGENTS.md",
  "docs/DEVELOPMENT_OPERATING_MANUAL.md"
]) {
  const value = fs.readFileSync(file, "utf8");
  assert(!value.includes("CONTENT_DISCOVERY_WORKSPACE_RESPONSIBILITY_CONTRACT"), "NO_PARALLEL_OWNER_" + file.replace(/[^A-Za-z0-9]/g, "_"));
}

console.log("CONTENT_WORKSPACE_RESPONSIBILITY_BASELINE=PASS");

