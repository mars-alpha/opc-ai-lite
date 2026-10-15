import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("COLLECTION_REALIGNMENT_FAILED:" + code);
  console.log(code + "=PASS");
}

const nav = fs.readFileSync("components/AdminWorkspaceNav.tsx", "utf8");
const manualPage = fs.readFileSync("app/admin/manual-collection/page.tsx", "utf8");
const manualApi = fs.readFileSync("app/api/admin/manual-collection/route.ts", "utf8");
const sourceUi = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const sourceModel = fs.readFileSync("lib/server/content/source-management.ts", "utf8");
const intelUi = fs.readFileSync("components/AdminIntelligenceWorkspace.tsx", "utf8");
const intelApi = fs.readFileSync("app/api/admin/content/intelligence/route.ts", "utf8");
const intelModel = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");
const readiness = fs.readFileSync("lib/server/content/today-intelligence-readiness.ts", "utf8");
const policy = fs.readFileSync("lib/server/content/event-policy.ts", "utf8");
const expansion = fs.readFileSync("lib/server/content/collection-expansion.ts", "utf8");
const momentum = fs.readFileSync("lib/server/content/topic-momentum.ts", "utf8");
const momentumRuntime = fs.readFileSync("lib/server/content/topic-momentum-runtime.ts", "utf8");
const snapshot = fs.readFileSync("lib/server/content/radar-snapshot.ts", "utf8");
const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
const momentumAcceptance = fs.readFileSync("scripts/accept-topic-momentum-runtime-live.ts", "utf8");
const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
const tasks = fs.readFileSync("TASKS.md", "utf8");
const owner = fs.readFileSync("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md", "utf8");
const agents = fs.readFileSync("AGENTS.md", "utf8");

assert(nav.includes('href: "/admin/sources"'), "SOURCE_MANAGEMENT_NAV_PRESENT");
assert(!nav.includes('href: "/admin/manual-collection"'), "MANUAL_COLLECTION_NAV_RETIRED");
assert(manualPage.includes('redirect("/admin/sources")'), "MANUAL_COLLECTION_ROUTE_REDIRECTS_SOURCE_MANAGEMENT");
assert(manualApi.includes("MANUAL_COLLECTION_PRODUCT_RETIRED"), "MANUAL_COLLECTION_API_RETIRED");
assert(!manualApi.includes("createManualCollectionTask"), "MANUAL_COLLECTION_API_NO_CREATE");
assert(!manualApi.includes("runManualCollectionTask"), "MANUAL_COLLECTION_API_NO_RUN");
assert(!manualApi.includes("reviewManualCollectionResult"), "MANUAL_COLLECTION_API_NO_REVIEW");
assert(
  !sourceUi.includes("平台与账号") &&
  !sourceUi.includes("connectionAction") &&
  !sourceModel.includes("listSourceConnections") &&
  !fs.existsSync("lib/server/content/source-connection.ts"),
  "LOGIN_CONNECTION_RUNTIME_RETIRED"
);
assert(!sourceUi.includes("/admin/manual-collection"), "SOURCE_MANAGEMENT_NO_MANUAL_BACKLINK");
assert(sourceModel.includes("isOperatorAddedSource") && sourceModel.includes("OPERATOR_ADDED"), "OPERATOR_ADDED_SOURCES_VISIBLE");

assert(!intelUi.includes('key: "RISING"'), "RISING_UI_RETIRED");
assert(!intelUi.includes("上升趋势"), "RISING_LABEL_RETIRED");
assert(!intelApi.includes('view === "rising"'), "RISING_API_RETIRED");
assert(!intelModel.includes("Rising") && !intelModel.includes("risingScore") && !intelModel.includes("risingSignalSourceCount"), "RISING_READ_MODEL_PHYSICALLY_RETIRED");
assert(!intelModel.includes("calculateTrendRisingScore"), "RISING_RUNTIME_CALCULATION_REMOVED");
assert(!intelModel.includes("listRisingEventCandidatesShadow"), "RISING_SHADOW_QUERY_REMOVED");
assert(!readiness.includes("formalRising") && !readiness.includes("FORMAL_RISING"), "FORMAL_RISING_READINESS_RETIRED");
assert(readiness.includes("CREATOR_SUSTAINED_MOMENTUM"), "TOPIC_MOMENTUM_READINESS_PRESENT");
assert(!policy.includes('from "./trend-rising"'), "EVENT_POLICY_NO_RISING_DEPENDENCY");
assert(!policy.includes("minimumRisingSources"), "EVENT_POLICY_NO_MINIMUM_RISING_GATE");

assert(expansion.includes("const DEFAULT_WINDOW_HOURS = 168"), "EXPANSION_DEFAULT_WINDOW_168H");
assert(expansion.includes("24, 168"), "EXPANSION_BOUND_MAX_168H");
assert(momentum.includes("TOPIC_MOMENTUM_MIN_AGE_HOURS = 24"), "TOPIC_MOMENTUM_MIN_24H");
assert(momentum.includes("TOPIC_MOMENTUM_MAX_AGE_HOURS = 168"), "TOPIC_MOMENTUM_MAX_168H");
assert(momentum.includes('authority: "PRESENTATION_ONLY"'), "TOPIC_MOMENTUM_PRESENTATION_ONLY");
assert(/RADAR_SNAPSHOT_SCHEMA_VERSION = "radar-snapshot-v\d+-/.test(snapshot) && snapshot.includes("windowDays: 7"), "RADAR_SNAPSHOT_HOT_TRACKING_VERSIONED");
assert(
  momentumRuntime.includes("TOPIC_MOMENTUM_MAX_EVENTS_PER_RUN = 3") &&
  momentumRuntime.includes("Math.min(10") &&
  momentumRuntime.includes("refreshSourceManagedEventExpansion") &&
  !momentumRuntime.includes("runEventExpansion("),
  "TOPIC_MOMENTUM_FOLLOW_UP_BOUNDED"
);
assert(
  momentumRuntime.includes("TOPIC_MOMENTUM_MIN_FOLLOW_UP_HOURS = 6") &&
  cycle.includes("runTopicMomentumRuntime") &&
  cycle.includes("refreshRadarSnapshot") &&
  momentumAcceptance.includes('executionOwner: "SERVER_NATIVE_AUTOMATIC_CYCLE"'),
  "TOPIC_MOMENTUM_SINGLE_SCHEDULER_OWNER"
);

assert(tasks.includes("SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE"), "TASKS_HOT_TRACKING_OWNER");
assert(facts.includes("热点追踪") && facts.includes("Source Management 是唯一 Source 资产入口") && facts.includes("SYSTEM Collection 是唯一正式采集执行基准"), "FACTS_HOT_TRACKING_OWNER");
assert(owner.includes("Unified Collection — SYSTEM Runtime"), "CONTRACT_UNIFIED_SYSTEM_RUNTIME");
assert(owner.includes("0–24h") && owner.includes("24–168h"), "CONTRACT_EVENT_MOMENTUM_WINDOWS");
assert(agents.includes("不再存在独立“人工采集”产品 Owner"), "AGENTS_MANUAL_PRODUCT_RETIRED");
assert(agents.includes("旧 Rising / Formal Rising 算法已退出"), "AGENTS_RISING_RETIRED");

console.log("COLLECTION_ARCHITECTURE_REALIGNMENT=PASS");
