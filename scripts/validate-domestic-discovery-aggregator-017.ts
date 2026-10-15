import fs from "node:fs";
import {
  DAILYHOT_DOMESTIC_EXCLUDED_ROUTES,
  DAILYHOT_DOMESTIC_RUNTIME_ROUTES,
  isStrictDomesticAiSignal
} from "../lib/server/content/trend-discovery";
import { RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("DOMESTIC_DISCOVERY_AGGREGATOR_017_FAILED:" + code);
  console.log(code + "=PASS");
}

const runtimeRoutes = new Set<string>(DAILYHOT_DOMESTIC_RUNTIME_ROUTES.map((item) => item.route));
const excludedRoutes = new Map(DAILYHOT_DOMESTIC_EXCLUDED_ROUTES.map((item) => [item.route, item.reason]));
const portfolio = RADAR_SOURCE_PORTFOLIO.filter((item) => item.key === "dailyhot_domestic");
const trend = fs.readFileSync("lib/server/content/trend-discovery.ts", "utf8");
const qualification = fs.readFileSync("lib/server/content/source-qualification-runtime.ts", "utf8");
const localDev = fs.readFileSync("scripts/start-local-dev.cjs", "utf8");

assert(runtimeRoutes.size === 6, "DAILYHOT_RUNTIME_ROUTE_COUNT_6");
for (const route of ["36kr", "juejin", "huxiu", "hellogithub", "weibo", "zhihu"]) {
  assert(runtimeRoutes.has(route), "DAILYHOT_KEEP_ROUTE_" + route.toUpperCase().replace(/\W/g, "_"));
}
assert(excludedRoutes.get("kuaishou") === "LIVE_HTTP_500", "DAILYHOT_KUAISHOU_FAIL_CLOSED");
assert(excludedRoutes.get("ifanr") === "DIRECT_RSS_DUPLICATE", "DAILYHOT_IFANR_DUPLICATE_EXITED");
assert(excludedRoutes.get("sspai") === "DIRECT_RSS_DUPLICATE", "DAILYHOT_SSPAI_DUPLICATE_EXITED");
assert(!runtimeRoutes.has("ifanr") && !runtimeRoutes.has("sspai"), "DAILYHOT_DIRECT_RSS_NOT_DUPLICATED");

assert(isStrictDomesticAiSignal("AI Agent 工作流更新"), "STRICT_AI_BOUNDARY_POSITIVE");
assert(isStrictDomesticAiSignal("DeepSeek 发布新模型"), "STRICT_AI_ENTITY_POSITIVE");
assert(!isStrictDomesticAiSignal("Air 产品线更新"), "STRICT_AI_NO_AIR_FALSE_POSITIVE");
assert(!isStrictDomesticAiSignal("aijing 妈妈报警"), "STRICT_AI_NO_AIJING_FALSE_POSITIVE");

assert(portfolio.length === 1, "DAILYHOT_SINGLE_SOURCE_IDENTITY");
assert(portfolio[0]?.providerRef === "DAILYHOT_DOMESTIC", "DAILYHOT_AGGREGATOR_PROVIDER");
assert(portfolio[0]?.factualSource === false && portfolio[0]?.referenceOnly === true, "DAILYHOT_SIGNAL_ONLY_BOUNDARY");
assert(portfolio[0]?.coverage?.sourceUniverseRole === "DISCOVERY_AGGREGATOR", "DAILYHOT_DISCOVERY_AGGREGATOR_ROLE");
assert(!RADAR_SOURCE_PORTFOLIO.some((item) => [
  "DAILYHOT_WEIBO",
  "DAILYHOT_ZHIHU",
  "DAILYHOT_DOUYIN",
  "DAILYHOT_BILIBILI",
  "DAILYHOT_BAIDU",
  "DAILYHOT_36KR",
  "DAILYHOT_ITHOME",
  "DAILYHOT_JUEJIN",
  "DAILYHOT_HELLOGITHUB"
].includes(item.providerRef)), "DAILYHOT_NO_PLATFORM_SOURCE_EXPLOSION");

assert(trend.includes("collectDailyHotDomestic") && trend.includes("Promise.allSettled"), "DAILYHOT_MULTI_ROUTE_FAIL_SOFT");
assert(trend.includes("normalizedDomesticTitle") && trend.includes("seen.has"), "DAILYHOT_INTRA_AGGREGATOR_DEDUPE");
assert(qualification.includes("configuredProviderHosts") && qualification.includes("DAILYHOT_API_BASE_URL"), "DAILYHOT_INTERNAL_ROUTE_QUALIFICATION_DECLARED");
assert(localDev.includes("DAILYHOT_LOCAL_PORT = 16688") && localDev.includes("ensureTunnel"), "DAILYHOT_DEVELOPMENT_TUNNEL_OWNER");

console.log("DOMESTIC_DISCOVERY_AGGREGATOR_017_CONTRACT=PASS");
