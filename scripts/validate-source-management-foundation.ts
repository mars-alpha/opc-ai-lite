import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_MANAGEMENT_FOUNDATION_FAILED:" + code);
  console.log(code + "=PASS");
}

const nav = fs.readFileSync("components/AdminWorkspaceNav.tsx", "utf8");
const page = fs.readFileSync("app/admin/sources/page.tsx", "utf8");
const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const api = fs.readFileSync("app/api/admin/content/source-management/route.ts", "utf8");
const model = fs.readFileSync("lib/server/content/source-management.ts", "utf8");
const onboarding = fs.readFileSync("lib/server/content/source-onboarding.ts", "utf8");

assert(nav.includes('href: "/admin/sources"') && nav.includes('label: "来源管理"'), "SOURCE_MANAGEMENT_MAIN_NAV");
assert(page.includes("<h1>来源管理</h1>") && page.includes("AdminSourceManagementWorkspace"), "SOURCE_MANAGEMENT_PAGE");
assert(api.includes("getSourceManagementIndex") && api.includes('mode === "detail"') && api.includes("export async function GET"), "SOURCE_MANAGEMENT_READ_API");
assert(api.includes("export async function POST") && api.includes("registerOnboardedSource"), "SOURCE_MANAGEMENT_ONBOARDING_API");
assert(model.includes("RADAR_SOURCE_PORTFOLIO") && model.includes("listSourceQualificationSnapshots"), "SOURCE_MANAGEMENT_CURRENT_PORTFOLIO_AND_QUALIFICATION");
assert(!model.includes("listSourceConnections") && model.includes("resolveSourceAcquisitionPlan"), "SOURCE_MANAGEMENT_SERVER_ONLY_ACQUISITION");
assert(model.includes("auditSourceGovernanceExecution") && model.includes("governance") && model.includes("execution"), "SOURCE_MANAGEMENT_GOVERNANCE_READ_MODEL");
assert(model.includes("evidenceSufficiency"), "SOURCE_MANAGEMENT_EVIDENCE_SUFFICIENCY_READ_MODEL");
assert(model.includes('addFlow: ["DISCOVER", "CHECK", "PREVIEW", "REGISTER", "QUALIFY", "SYSTEM_COLLECTION"]'), "SOURCE_MANAGEMENT_MATURE_LIFECYCLE");
assert(ui.includes("搜索来源、平台、URL") && ui.includes("全部语言") && ui.includes("全部状态") && ui.includes("全部采集方式") && !ui.includes("全部分类") && !ui.includes("全部资格") && !ui.includes("全部内容价值") && !ui.includes("全部平台"), "SOURCE_MANAGEMENT_FILTERS");
assert(ui.includes("发现渠道") && ui.includes("已有来源：") && ui.includes("discoveryCoverageLabel"), "SOURCE_MANAGEMENT_CHANNEL_PRESENTATION");
assert(ui.includes("新增来源") && ui.includes("检测来源") && ui.includes("加入信息源") && ui.includes("验证资格"), "SOURCE_MANAGEMENT_ONBOARDING_UI");
assert(ui.includes("source-discovery-column") && ui.includes("source-discovery-flow") && ui.includes("发现渠道") && ui.includes("setDiscoveryRoute") && ui.includes("data.aggregators.dailyHot") && ui.includes("data.platformCapabilities") && !ui.includes("<strong>平台能力</strong>") && !ui.includes("<strong>DailyHot Route</strong>") && !ui.includes("source-tabs"), "SOURCE_MANAGEMENT_DISCOVERY_INTEGRATED");
assert(ui.includes("新增词") && ui.includes("排除词") && ui.includes('addPolicyTerm("INCLUDE")') && ui.includes('addPolicyTerm("EXCLUDE")') && !ui.includes("newTermMatchType") && !ui.includes("规则即时测试"), "SOURCE_MANAGEMENT_SIMPLE_FILTER_RULE_UI");
assert(ui.includes("资格缺口") && ui.includes("14天 Run") && ui.includes("独立 Event 贡献"), "SOURCE_MANAGEMENT_DIAGNOSTICS");
assert(ui.includes("source-learning-row") && ui.includes("loadDetail(item.sourceId)") && ui.includes("?mode=detail&sourceId="), "SOURCE_MANAGEMENT_ROUTE_VISIBILITY");
assert(ui.includes("证据成熟度") && ui.includes("保留率") && ui.includes("重复率"), "SOURCE_MANAGEMENT_RUNTIME_EVIDENCE_VISIBILITY");
assert(ui.includes("治理决策") && ui.includes("有效频率"), "SOURCE_MANAGEMENT_GOVERNANCE_VISIBILITY");
assert(model.includes("getSourceManagementDetail") && model.includes("auditSourceGovernanceExecution"), "SOURCE_MANAGEMENT_GOVERNANCE_EXECUTION_VISIBILITY");
assert(ui.includes("治理决策") && ui.includes("有效频率"), "SOURCE_MANAGEMENT_DECISION_LABELS_LOCALIZED");
assert(api.includes('mode === "detail"'), "SOURCE_MANAGEMENT_EXECUTION_ACTION_LOCALIZED");
assert(ui.includes("全部采集方式") && !ui.includes("renderAcquisitionBoard") && !ui.includes("<summary><strong>认证连接</strong>"), "SOURCE_MANAGEMENT_NO_STANDALONE_AUTH_PANEL");
assert(ui.includes("启用 Route") && !ui.includes("<strong>DailyHot Route</strong>") && !ui.includes("connectionAction"), "SOURCE_MANAGEMENT_SERVER_ONLY_UI");
assert(!fs.existsSync("lib/server/content/source-connection.ts"), "SOURCE_CONNECTION_CORE_RETIRED");
assert(onboarding.includes('SOURCE_ONBOARDING_VERSION = "source-onboarding-v2"'), "SOURCE_ONBOARDING_V2");
assert(onboarding.includes("NO_SERVER_RUNNABLE_PUBLIC_ROUTE") && !onboarding.includes("SOURCE_AUTH_DEPENDENCY_REQUIRED"), "SOURCE_ONBOARDING_SERVER_ROUTE_REQUIRED");
assert(onboarding.includes("candidate.check.sampleCount < 1"), "SOURCE_ONBOARDING_SAMPLE_REQUIRED");
assert(!fs.existsSync("lib/server/content/china-trend-runner.ts"), "SOURCE_MANAGEMENT_DUPLICATE_CHINA_TREND_RUNNER_REMOVED");
assert(!ui.includes("/admin/manual-collection"), "SOURCE_MANAGEMENT_NO_MANUAL_COLLECTION_LINK");
assert(model.includes("isOperatorAddedSource") && model.includes("Operator Added"), "SOURCE_MANAGEMENT_OPERATOR_ADDED_VISIBLE");
assert(!fs.existsSync("lib/server/content/manual-collection.ts"), "SOURCE_MANAGEMENT_MANUAL_CORE_REMOVED");

console.log("SOURCE_MANAGEMENT_FOUNDATION_CONTRACT=PASS");
