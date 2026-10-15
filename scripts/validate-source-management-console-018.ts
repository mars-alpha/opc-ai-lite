import fs from "node:fs";
import { RADAR_OPTIONAL_CAPABILITIES } from "../lib/content/radar-source-portfolio";
import { SOURCE_PLATFORM_CAPABILITIES } from "../lib/content/source-platform-capabilities";
import { DISCOVERY_ROUTE_DEFINITIONS, resolveDiscoveryRouteIds } from "../lib/content/discovery-routing";
import { resolveApiQuotaCadence } from "../lib/server/content/source-api-quota-policy";
import { testSourceAiRelevance } from "../lib/server/content/source-management-policy";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_MANAGEMENT_CONSOLE_018_FAILED:" + code);
  console.log(code + "=PASS");
}

const api = fs.readFileSync("app/api/admin/content/source-management/route.ts", "utf8");
const server = fs.readFileSync("lib/server/content/source-management.ts", "utf8");
const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const trend = fs.readFileSync("lib/server/content/trend-discovery.ts", "utf8");
const portfolio = fs.readFileSync("lib/content/radar-source-portfolio.ts", "utf8");
const quotaLedger = fs.readFileSync("lib/server/content/source-api-quota-ledger.ts", "utf8");
const governanceExecution = fs.readFileSync("lib/server/content/source-runtime-governance-execution.ts", "utf8");

assert(api.includes("getSourceManagementIndex") && api.includes('mode === "detail"') && api.includes('mode === "policy"'), "SOURCE_MANAGEMENT_FAST_INDEX_API");
assert(server.includes("export async function getSourceManagementIndex") && server.includes("export async function getSourceManagementDetail"), "SOURCE_MANAGEMENT_INDEX_DETAIL_SPLIT");
const indexBlock = server.slice(server.indexOf("export async function getSourceManagementIndex"), server.indexOf("export async function getSourceManagementDetail"));
assert(!indexBlock.includes("auditSourceGovernanceExecution") && !indexBlock.includes("listSourceQualificationSnapshots"), "SOURCE_MANAGEMENT_INDEX_NO_LIVE_GOVERNANCE");
const detailBlock = server.slice(server.indexOf("export async function getSourceManagementDetail"));
assert(!detailBlock.includes("getSourceManagementOverview()") && detailBlock.includes("readSourceRuntimeUtility(sourceId)"), "SOURCE_MANAGEMENT_DETAIL_SINGLE_SOURCE_ONLY");
for (const label of ["当前来源","来源管理","筛选规则"]) {
  assert(ui.includes(label), "SOURCE_MANAGEMENT_SECTION_" + label.replace(/\s/g,"_"));
}
assert(!ui.includes("source-tabs") && !ui.includes("setTab("), "SOURCE_MANAGEMENT_TABS_RETIRED");
assert(!ui.includes("平台与账号"), "SOURCE_MANAGEMENT_PLATFORM_TAB_RETIRED");
assert(ui.includes("loadDetail") && ui.includes("?mode=detail&sourceId="), "SOURCE_MANAGEMENT_DETAIL_LAZY_LOAD");
assert(ui.includes("全部语言") && ui.includes("全部状态") && ui.includes("全部采集方式") && !ui.includes("全部内容价值") && !ui.includes("全部分类") && !ui.includes("全部平台") && !ui.includes("全部资格"), "SOURCE_MANAGEMENT_DIRECTORY_FILTERS");
assert(api.includes("SAVE_AI_POLICY") && !api.includes("TEST_AI_POLICY"), "SOURCE_AI_POLICY_SAVE_ONLY");
assert(trend.includes("readSourceAiRelevancePolicy") && trend.includes("testSourceAiRelevance"), "DAILYHOT_USES_SHARED_AI_POLICY");
assert(!RADAR_OPTIONAL_CAPABILITIES.some((item) => ["redfox_social","socialdata_x","tikhub_douyin","tikhub_xiaohongshu"].includes(item.key)), "PAID_OPTIONAL_PROVIDERS_REMOVED");
assert(!portfolio.includes("OPTIONAL_PAID_DEEP_SOCIAL") && !portfolio.includes("SocialData X") && !portfolio.includes("TikHub"), "PAID_PROVIDER_COPY_REMOVED");

const byPlatform = new Map(SOURCE_PLATFORM_CAPABILITIES.map((item) => [item.platform, item]));
assert(byPlatform.get("WEIBO")?.defaultMode === "AGGREGATOR_ONLY", "WEIBO_NO_STANDALONE_HOT_TASK");
assert(byPlatform.get("DOUYIN")?.defaultMode === "AGGREGATOR_ONLY", "DOUYIN_NO_STANDALONE_HOT_TASK");
assert(byPlatform.get("ZHIHU")?.defaultMode === "AGGREGATOR_ONLY", "ZHIHU_NO_STANDALONE_HOT_TASK");
assert(!byPlatform.has("XIAOHONGSHU") && !byPlatform.has("X") && !byPlatform.has("REDDIT"), "LOGIN_OR_OAUTH_PLATFORMS_RETIRED");
assert(byPlatform.get("GITHUB")?.defaultMode === "FEED_FIRST", "GITHUB_FEED_FIRST");
assert(byPlatform.get("YOUTUBE")?.defaultMode === "API_QUOTA_MANAGED", "YOUTUBE_QUOTA_MANAGED");
assert(trend.includes('dependencies.reserveQuota ?? reserveSourceApiQuota') && trend.includes('"relay.search.list+videos.list" : "search.list"') && trend.includes('operation: "videos.list"'), "YOUTUBE_QUOTA_LEDGER_RUNTIME");
assert(quotaLedger.includes("America/Los_Angeles") && quotaLedger.includes("usedUnits"), "API_QUOTA_LEDGER_DAILY_RESET_AND_USAGE");
assert(server.includes("apiQuota") && server.includes("YOUTUBE"), "API_QUOTA_REMAINS_BACKEND_CAPABILITY");
assert(
  ui.includes("发现渠道") && ui.includes("已有来源：") &&
  !ui.includes("<strong>平台能力</strong>") && !ui.includes("<strong>DailyHot Route</strong>") &&
  ui.includes("data.discoveryRoutes") &&
  server.includes("platformCapabilities") &&
  server.includes("discoveryRoutes"),
  "DISCOVERY_CHANNELS_INTEGRATED_WITH_SOURCE_REGISTRY"
);
assert(DISCOVERY_ROUTE_DEFINITIONS.length >= 6, "DISCOVERY_ROUTES_EXPLICIT");
assert(resolveDiscoveryRouteIds({ sourceRole: "OFFICIAL", evidenceRoles: ["PRIMARY_FACT"] }).includes("OFFICIAL_FACTS"), "OFFICIAL_SOURCE_ROUTE");
assert(resolveDiscoveryRouteIds({ sourceRole: "DISCOVERY_AGGREGATOR", evidenceRoles: ["SOCIAL_SIGNAL"] }).includes("AGGREGATED_DISCOVERY"), "AGGREGATOR_SOURCE_ROUTE");
assert(server.includes('runtimeState') && server.includes('"SUPPORTED"') && server.includes('"QUALIFIED"') && server.includes('"ACTIVE"'), "PLATFORM_RUNTIME_STATE_PRODUCTION_DERIVED");
assert(server.includes("activeViaAggregator") && server.includes('"AGGREGATED_ROUTE"') && server.includes("DAILYHOT_DOMESTIC_RUNTIME_ROUTES"), "PLATFORM_AGGREGATOR_ROUTE_PRODUCTION_DERIVED");
assert(ui.includes("item.discoveryRouteIds") && ui.includes("data.discoveryRoutes.find"), "SOURCE_DIRECTORY_DISCOVERY_ROUTE_VISIBLE");
assert(!ui.includes("source-connections") && !ui.includes("17371") && !ui.includes("17372") && !ui.includes("connectionAction"), "LOGIN_UI_PHYSICALLY_RETIRED");
assert(governanceExecution.includes("YOUTUBE_AI_TREND") && governanceExecution.includes("API_QUOTA_CONSERVE") && governanceExecution.includes("quotaInterval"), "API_QUOTA_GOVERNS_DUE_CADENCE");

const quotaNormal = resolveApiQuotaCadence({ limit: 100, used: 20, baseIntervalMinutes: 15 });
const quotaReduce = resolveApiQuotaCadence({ limit: 100, used: 60, baseIntervalMinutes: 15 });
const quotaConserve = resolveApiQuotaCadence({ limit: 100, used: 90, baseIntervalMinutes: 15 });
const quotaPause = resolveApiQuotaCadence({ limit: 100, used: 96, baseIntervalMinutes: 15 });
assert(quotaNormal.action === "NORMAL" && quotaNormal.multiplier === 1, "API_QUOTA_NORMAL");
assert(quotaReduce.action === "REDUCE" && quotaReduce.multiplier === 2, "API_QUOTA_REDUCE");
assert(quotaConserve.action === "CONSERVE" && quotaConserve.multiplier === 4, "API_QUOTA_CONSERVE");
assert(quotaPause.action === "PAUSE_EXPENSIVE_API" && quotaPause.preferFeedFallback, "API_QUOTA_PAUSE_EXPENSIVE");

const terms = [
  { id:"ai", value:"AI", kind:"INCLUDE" as const },
  { id:"openai", value:"OpenAI", kind:"INCLUDE" as const },
  { id:"air", value:"Air", kind:"EXCLUDE" as const }
];
assert(testSourceAiRelevance("OpenAI 发布 AI Agent", terms).relevant, "AI_POLICY_POSITIVE");
assert(!testSourceAiRelevance("Apple Air 新产品", terms).relevant, "AI_POLICY_AIR_NEGATIVE");

console.log("SOURCE_MANAGEMENT_CONSOLE_018_CONTRACT=PASS");
