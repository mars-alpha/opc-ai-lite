import fs from "node:fs";
import { RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";
import { resolveSourceAcquisitionPlan } from "../lib/server/content/source-acquisition-plan";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SERVER_ONLY_SOURCE_CLEANUP_019_FAILED:" + code);
  console.log(code + "=PASS");
}

const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const onboarding = fs.readFileSync("lib/server/content/source-onboarding.ts", "utf8");
const capability = fs.readFileSync("lib/server/content/collection-capability-router.ts", "utf8");
const platform = fs.readFileSync("lib/content/source-platform-capabilities.ts", "utf8");
const expansion = fs.readFileSync("lib/server/content/collection-expansion.ts", "utf8");
const trends = fs.readFileSync("lib/server/content/trend-discovery.ts", "utf8");
const relay = fs.readFileSync("lib/content/overseas-collector-relay-core.ts", "utf8");
const pkg = fs.readFileSync("package.json", "utf8");
const regression = fs.readFileSync("scripts/run-discovery-collection-full-regression.ts", "utf8");

for (const path of [
  "lib/server/content/source-connection.ts",
  "lib/server/content/x-browser-runner.ts",
  "lib/server/content/xiaohongshu-browser-runner.ts",
  "lib/server/content/xiaohongshu-auto-browser-session.ts",
  "lib/server/content/xiaohongshu-rsshub-auto.ts",
  "lib/content/xiaohongshu-local-runner-contract.ts",
  "lib/server/content/x-ai-relevance-gate.ts",
  "app/api/admin/content/source-connections",
  "lib/server/content/china-trend-runner.ts"
]) {
  assert(!fs.existsSync(path), "RETIRED_ABSENT_" + path.replace(/[^a-z0-9]+/gi, "_").toUpperCase());
}

assert(!ui.includes("connectionAction") && !ui.includes("source-connections") && !ui.includes("17371") && !ui.includes("17372"), "LOGIN_UI_ABSENT");
assert(
  ui.includes("发现渠道") &&
  ui.includes("已有来源：") &&
  !ui.includes("全部 Signal Source") &&
  ui.includes("discoveryCoverageLabel(channel.status)") &&
  ui.includes("channel.activeSourceCount") &&
  ui.includes("platformRuntimeLabel") &&
  ui.includes("data.platformCapabilities") &&
  !ui.includes("<strong>平台能力</strong>") &&
  !ui.includes("<strong>DailyHot Route</strong>"),
  "DISCOVERY_RUNTIME_STATUS_VISIBLE_WITHOUT_SOURCE_DUPLICATION"
);
assert(!onboarding.includes("SOCIAL_BROWSER") && !onboarding.includes("SOURCE_AUTH_DEPENDENCY_REQUIRED") && !onboarding.includes("CREATOR_TARGET_PROBE_REQUIRED"), "ONBOARDING_SERVER_ONLY");
assert(onboarding.includes("NO_SERVER_RUNNABLE_PUBLIC_ROUTE"), "ONBOARDING_FAILS_CLOSED_WITHOUT_SERVER_ROUTE");
assert(!capability.includes("BROWSER_SESSION") && !capability.includes("LOGIN_REQUIRED"), "CAPABILITY_ROUTER_NO_LOGIN");
assert(capability.includes('"BILIBILI"') && capability.includes('"YOUTUBE"') && !capability.includes('"XIAOHONGSHU"') && !capability.includes('"ZHIHU"'), "CAPABILITY_ROUTER_SERVER_PLATFORMS_ONLY");
assert(!platform.includes('platform:"X"') && !platform.includes('platform:"XIAOHONGSHU"') && !platform.includes('platform:"REDDIT"') && !platform.includes("loginRequired"), "PLATFORM_MATRIX_NO_LOGIN_OAUTH_OWNER");
assert(!expansion.includes('"X_SEARCH"'), "EVENT_EXPANSION_X_SEARCH_RETIRED");
assert(!trends.includes('"X_AI_TREND"') && !relay.includes('"X_AI_TREND"'), "X_ACTIVE_PROVIDER_RETIRED");
assert(!pkg.includes("x-browser") && !pkg.includes("xiaohongshu-runner") && !pkg.includes("source-connection:accept"), "PACKAGE_LOGIN_SCRIPTS_RETIRED");
assert(!regression.includes("content:x-browser:check") && !regression.includes("content:xiaohongshu-rsshub:auto:check"), "REGRESSION_LOGIN_GATES_RETIRED");

for (const key of ["official_cohere", "official_cloudflare_ai", "official_langchain_blog", "official_ollama_blog", "official_openrouter_blog", "official_together_ai", "official_fireworks_ai"]) {
  assert(RADAR_SOURCE_PORTFOLIO.some((item) => item.key === key), "NEW_VERIFIED_SOURCE_" + key.toUpperCase());
}

for (const source of RADAR_SOURCE_PORTFOLIO) {
  const plan = resolveSourceAcquisitionPlan({
    collectionMethod: source.collectionMethod,
    platform: source.platform,
    providerRef: source.providerRef,
    canonicalUrl: source.canonicalUrl,
    collectionConfig: { acquisition: source.acquisition }
  });
  assert(
    plan.routes.some((route) => route.enabled && route.serverRuntimeSupported),
    "SERVER_RUNTIME_SOURCE_" + source.key.toUpperCase()
  );
  assert(
    !plan.routes.some((route) => route.kind === "SOCIAL_BROWSER"),
    "NO_BROWSER_ROUTE_" + source.key.toUpperCase()
  );
}

console.log("SERVER_ONLY_SOURCE_CLEANUP_019=PASS");
