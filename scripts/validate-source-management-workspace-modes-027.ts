import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_MANAGEMENT_WORKSPACE_MODES_027_FAILED:" + code);
  console.log(code + "=PASS");
}

const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const css = fs.readFileSync("app/admin/sources/sources.css", "utf8");

assert(ui.includes('useState<"SOURCES" | "ADD" | "POLICY">("SOURCES")'), "SOURCE_DIRECTORY_DEFAULT_MODE");
assert(ui.includes('setManagementMode("SOURCES")') && ui.includes('setManagementMode("ADD")') && ui.includes('setManagementMode("POLICY")'), "THREE_MANAGEMENT_MODES");
assert(ui.includes("source-mode-switch") && css.includes(".source-mode-switch button.is-active"), "MODE_SWITCH_VISIBLE");
assert(!ui.includes("source-management-tools"), "PERMANENT_BOTTOM_TOOL_AREA_RETIRED");
assert(ui.includes("source-source-directory") && css.includes("grid-template-rows: auto minmax(0,1fr)"), "SOURCE_DIRECTORY_FULL_HEIGHT_DEFAULT");
assert(ui.includes("source-filter-toolbar") && !ui.includes("source-more-filters"), "FILTERS_COMPACTED");
assert(css.includes("grid-template-columns: minmax(0,3fr) repeat(3,minmax(0,2fr))") && !css.includes(".source-filter-toolbar > input"), "PRIMARY_FILTERS_SINGLE_ROW_RATIO");
assert(ui.indexOf("全部语言") < ui.indexOf("全部状态") && ui.indexOf("全部状态") < ui.indexOf("全部采集方式") && !ui.includes("全部资格") && !ui.includes("全部分类") && !ui.includes("全部平台") && !ui.includes("全部内容价值"), "DIRECTORY_FILTERS_MINIMAL");
assert(ui.includes("source-tool-workspace") && ui.includes('managementMode === "ADD" ? renderAddSource() : renderPolicy()'), "TOOLS_RENDER_ON_DEMAND");
assert(ui.includes("source-discovery-flow") && !ui.includes("source-discovery-section"), "DISCOVERY_CONTINUOUS_FLOW");
assert(ui.includes("发现覆盖") && ui.includes("发现渠道") && !ui.includes("<strong>平台能力</strong>") && !ui.includes("<strong>DailyHot Route</strong>"), "DISCOVERY_SINGLE_CHANNEL_GROUP");
assert(!ui.includes("<details className=\"source-discovery-group\"") && ui.includes("button") && ui.includes("setDiscoveryRoute"), "DISCOVERY_CHANNELS_ALWAYS_VISIBLE");
assert(css.includes(".source-discovery-flow") && css.includes("overflow-y: auto"), "DISCOVERY_SINGLE_SCROLL");
assert(css.includes("grid-template-columns: minmax(300px,31%) minmax(0,69%)"), "WORKSPACE_31_69");
assert(css.includes("height: min(700px, calc(100vh - 330px))") && css.includes("align-items: stretch"), "BOTTOM_ALIGNED");
assert(css.includes(".source-summary-grid strong") && css.includes("color: #2f67c8"), "SUMMARY_NUMBERS_BLUE");
assert(ui.includes("source-management-title-row") && ui.includes("{visible.length} / {data.summary.sourceCount}"), "SOURCE_COUNT_NEXT_TO_DIRECTORY_TITLE");
assert(css.includes(".source-tool-workspace .source-rule-board") && css.includes("grid-template-rows: auto minmax(0,1fr)"), "POLICY_WORKSPACE_FULL_HEIGHT");
assert(css.includes(".source-rule-column") && css.includes("grid-template-rows: auto auto minmax(0,1fr)"), "POLICY_COLUMNS_FILL_REMAINDER");
assert(css.includes(".source-term-list") && !css.includes("max-height: 72px") && css.includes("overflow-y: auto"), "POLICY_SCROLL_ONLY_ON_OVERFLOW");
assert(ui.includes("renderOverview()"), "TOP_SUMMARY_PRESERVED");
assert(!ui.includes("<span>03</span>") && !ui.includes("<span>04</span>"), "LEGACY_NUMBERING_ABSENT");

console.log("SOURCE_MANAGEMENT_WORKSPACE_MODES_027=PASS");
