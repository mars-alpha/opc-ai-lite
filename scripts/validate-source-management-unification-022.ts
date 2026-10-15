import fs from "node:fs";
import { testSourceAiRelevance } from "../lib/server/content/source-management-policy";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_MANAGEMENT_UNIFICATION_022_FAILED:" + code);
  console.log(code + "=PASS");
}

const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const api = fs.readFileSync("app/api/admin/content/source-management/route.ts", "utf8");
const policy = fs.readFileSync("lib/server/content/source-management-policy.ts", "utf8");

assert(ui.includes("source-governance-grid") && ui.includes("renderDiscoveryPanel") && ui.includes("renderSources") && !ui.includes("source-tabs"), "SOURCE_AND_DISCOVERY_SINGLE_WORKSPACE");
assert(ui.includes("发现覆盖") && ui.includes("发现渠道") && ui.includes("已有来源：") && ui.includes("setDiscoveryRoute") && ui.includes('discoveryRoute === "ALL" || item.discoveryRouteIds.includes(discoveryRoute)'), "DISCOVERY_CHANNEL_FILTERS_OWN_SOURCES");
assert(!ui.includes("<strong>平台能力</strong>") && !ui.includes("<strong>DailyHot Route</strong>"), "DISCOVERY_DUPLICATE_LISTS_REMOVED");
assert(!ui.includes("全部平台") && !ui.includes("全部分类") && !ui.includes("全部内容价值") && ui.includes("item.platform") && ui.includes("platformRuntimeLabel"), "SOURCE_DIRECTORY_FILTERS_SIMPLIFIED");
assert(ui.includes("data.aggregators.dailyHot.keepRoutes") && ui.includes("启用 Route") && !ui.includes("data.aggregators.dailyHot.excludedRoutes.map"), "DAILYHOT_ROUTES_MOVED_TO_SOURCE_DETAIL");
assert(ui.includes("稳定自动") && ui.includes("观察中") && !ui.includes("全部资格"), "STATUS_AND_QUALIFICATION_MERGED");
assert(ui.includes("新增词") && ui.includes("排除词"), "FILTER_RULE_TWO_LISTS");
assert(ui.includes('addPolicyTerm("INCLUDE")') && ui.includes('addPolicyTerm("EXCLUDE")'), "FILTER_RULE_ADD_ACTIONS");
assert(ui.includes("deletePolicyTerm") && ui.includes("persistPolicy"), "FILTER_RULE_DELETE_AUTO_SAVE");
assert(!ui.includes("newTermKind") && !ui.includes("newTermMatchType") && !ui.includes("policyTest"), "FILTER_RULE_OLD_UI_REMOVED");
assert(!api.includes("TEST_AI_POLICY") && api.includes("SAVE_AI_POLICY"), "FILTER_RULE_API_SAVE_ONLY");
assert(policy.includes('SOURCE_AI_RELEVANCE_POLICY_VERSION = "source-ai-relevance-policy-v2"'), "FILTER_RULE_POLICY_V2");
assert(policy.includes('AiRelevanceTermKind = "INCLUDE" | "EXCLUDE"'), "FILTER_RULE_ONLY_INCLUDE_EXCLUDE");
assert(!policy.includes("matchType") && !policy.includes("enabled:"), "FILTER_RULE_OLD_FIELDS_REMOVED");

const terms = [
  { id:"ai", value:"AI", kind:"INCLUDE" as const },
  { id:"openai", value:"OpenAI", kind:"INCLUDE" as const },
  { id:"air", value:"Air", kind:"EXCLUDE" as const }
];
assert(testSourceAiRelevance("OpenAI 发布 AI Agent", terms).relevant, "FILTER_RULE_INCLUDE_RUNTIME");
assert(!testSourceAiRelevance("Apple Air 新产品", terms).relevant, "FILTER_RULE_EXCLUDE_RUNTIME");

console.log("SOURCE_MANAGEMENT_UNIFICATION_022=PASS");
