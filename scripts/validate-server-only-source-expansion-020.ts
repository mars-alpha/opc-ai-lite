import fs from "node:fs";
import { RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";
import { resolveSourceAcquisitionPlan } from "../lib/server/content/source-acquisition-plan";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SERVER_ONLY_SOURCE_EXPANSION_020_FAILED:" + code);
  console.log(code + "=PASS");
}

const sourceUi = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const comments = fs.readFileSync("lib/server/content/comment-insight.ts", "utf8");
const adminApi = fs.readFileSync("lib/server/admin/api.ts", "utf8");

assert(!fs.existsSync("lib/server/content/china-trend-runner.ts"), "CHINA_BROWSER_RUNNER_REMOVED");
assert(!comments.includes("BROWSER_REQUIRED") && !comments.includes("PUBLIC_OR_BROWSER_FALLBACK"), "COMMENT_BROWSER_FALLBACK_REMOVED");
assert(!adminApi.includes("SOURCE_CONNECTION_") && !adminApi.includes("CHINA_TREND_RUNNER_"), "RETIRED_ERROR_NAMES_REMOVED");
assert(sourceUi.includes("source-discovery-column") && sourceUi.includes("source-discovery-flow") && sourceUi.includes("发现渠道") && sourceUi.includes("已有来源：") && sourceUi.includes("data.aggregators.dailyHot") && !sourceUi.includes("<strong>平台能力</strong>") && !sourceUi.includes("<strong>DailyHot Route</strong>") && !sourceUi.includes("全部 Signal Source") && !sourceUi.includes("source-tabs"), "DISCOVERY_VIEW_NO_SOURCE_DUPLICATION");

for (const key of [
  "official_ollama_blog",
  "official_openrouter_blog",
  "official_together_ai",
  "official_fireworks_ai"
]) {
  const source = RADAR_SOURCE_PORTFOLIO.find((item) => item.key === key);
  assert(Boolean(source), "SOURCE_PRESENT_" + key.toUpperCase());
  const plan = resolveSourceAcquisitionPlan({
    collectionMethod: source!.collectionMethod,
    platform: source!.platform,
    providerRef: source!.providerRef,
    canonicalUrl: source!.canonicalUrl,
    collectionConfig: { acquisition: source!.acquisition }
  });
  assert(plan.routes.some((route) => route.enabled && route.serverRuntimeSupported), "SERVER_RUNTIME_" + key.toUpperCase());
  assert(!plan.routes.some((route) => String(route.kind) === "SOCIAL_BROWSER"), "NO_BROWSER_" + key.toUpperCase());
}

assert(RADAR_SOURCE_PORTFOLIO.length > 0 && new Set(RADAR_SOURCE_PORTFOLIO.map((item) => item.sourceId)).size === RADAR_SOURCE_PORTFOLIO.length, "BASELINE_NON_EMPTY_UNIQUE_SOURCE_IDS");
console.log("SERVER_ONLY_SOURCE_EXPANSION_020=PASS");
