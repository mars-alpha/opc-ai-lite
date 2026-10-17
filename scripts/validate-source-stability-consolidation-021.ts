import fs from "node:fs";
import { RADAR_OPTIONAL_CAPABILITIES, RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_STABILITY_CONSOLIDATION_021_FAILED:" + code);
  console.log(code + "=PASS");
}

const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const management = fs.readFileSync("lib/server/content/source-management.ts", "utf8");
const runtime = fs.readFileSync("lib/server/content/source-portfolio-runtime.ts", "utf8");
const qualificationRuntime = fs.readFileSync("lib/server/content/source-qualification-runtime.ts", "utf8");

for (const key of ["media_ai_news", "follow_builders", "official_openai_skills", "official_claude_code_releases"]) {
  assert(!RADAR_SOURCE_PORTFOLIO.some((item) => item.key === key), "UNSTABLE_EXITED_" + key.toUpperCase());
}
assert(
  RADAR_OPTIONAL_CAPABILITIES.some((item) => item.key === "claude_code_changelog" && item.status === "DISABLED_UNSTABLE"),
  "CLAUDE_CODE_RETAINED_AS_OPTIONAL_UNSTABLE"
);
assert(RADAR_SOURCE_PORTFOLIO.length > 0 && new Set(RADAR_SOURCE_PORTFOLIO.map((item) => item.sourceId)).size === RADAR_SOURCE_PORTFOLIO.length, "STABLE_BASELINE_NON_EMPTY_UNIQUE_SOURCE_IDS");
assert(!ui.includes('"platforms"') && !ui.includes("平台与账号"), "PLATFORM_TAB_RETIRED");
assert(ui.includes("source-discovery-column") && ui.includes("source-discovery-flow") && ui.includes("发现渠道") && ui.includes("已有来源：") && ui.includes("data.platformCapabilities") && !ui.includes("<strong>平台能力</strong>") && !ui.includes("<strong>DailyHot Route</strong>") && !ui.includes("全部 Signal Source") && !ui.includes("source-tabs"), "DISCOVERY_MERGED_WITH_SOURCE_REGISTRY");
assert(ui.includes("DISABLE_SOURCE") && ui.includes("ENABLE_SOURCE") && ui.includes("ARCHIVE_SOURCE"), "SOURCE_LIFECYCLE_ACTIONS");
assert(ui.includes("全部状态") && ui.includes("稳定自动") && ui.includes("观察中"), "STABILITY_FILTERS_VISIBLE");
assert(management.includes("managementDisabled") && management.includes("archiveOperatorSource"), "SOURCE_DISABLE_ARCHIVE_BACKEND");
assert(runtime.includes("managementDisabled") && runtime.includes("portfolioSeedRefreshAllowed(existing)") && runtime.includes(".where(portfolioSeedRefreshCondition(entry.sourceId))") && !runtime.includes("enabled: !managementDisabled"), "BASELINE_DISABLE_PERSISTS_ACROSS_SEED");
assert(qualificationRuntime.includes("listCurrentSystemCollectionSourceIds") && qualificationRuntime.includes("listSourceQualificationSnapshots(currentSourceIds)"), "QUALIFICATION_CURRENT_SOURCES_ONLY");
assert(management.indexOf('sourceRole === "DISCOVERY_AGGREGATOR"') < management.indexOf('sourceType === "MEDIA"'), "AGGREGATOR_CATEGORY_PRECEDENCE");
console.log("SOURCE_STABILITY_CONSOLIDATION_021=PASS");
