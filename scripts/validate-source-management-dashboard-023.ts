import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_MANAGEMENT_DASHBOARD_023_FAILED:" + code);
  console.log(code + "=PASS");
}

const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const css = fs.readFileSync("app/admin/sources/sources.css", "utf8");

assert(!ui.includes("source-tabs") && !ui.includes("setTab(") && !ui.includes("tab ==="), "NO_TAB_NAVIGATION");
assert(ui.includes("全部采集方式") && ui.includes("acquisitionLabel") && !ui.includes("renderAcquisitionBoard"), "ACQUISITION_MAP_VISIBLE");
assert(ui.includes("value={routeKind}") && ui.includes("setRouteKind(event.target.value)"), "ACQUISITION_MAP_FILTERS_REGISTRY");
assert(ui.includes("来源目录") && ui.includes("source-management-column"), "SOURCE_REGISTRY_CENTER_STAGE");
assert(css.includes(".source-learning-queue-list") && css.includes("overflow-y: auto") && css.includes("scrollbar-gutter: stable"), "SOURCE_REGISTRY_INTERNAL_SCROLL");
assert(ui.includes("source-add-workbench") && ui.includes("检测来源") && ui.includes("加入信息源"), "ADD_SOURCE_BOUNDED_DRAWER");
assert(css.includes("grid-template-columns: minmax(300px,31%) minmax(0,69%)"), "LAST_COLUMN_SCROLLBAR_SAFE_ZONE");
assert(css.includes(".source-column-head strong") && css.includes("font-size: 18px") && css.includes(".source-learning-row-top strong") && css.includes("font-size: 13px"), "READABLE_FONT_SCALE");
assert(ui.includes("发现渠道") && ui.includes("已有来源：") && ui.includes("source-discovery-column") && !ui.includes("<strong>平台能力</strong>"), "DISCOVERY_VISIBLE");
assert(ui.includes("source-btn-primary") && css.includes(".source-btn-primary"), "ADD_SOURCE_ACTION_TOGGLE");
assert(ui.includes("筛选规则") && ui.includes("source-rule-board") && ui.includes("新增词") && ui.includes("排除词"), "FILTER_RULE_VISIBLE");
assert(css.includes("@media (max-width: 980px)"), "RESPONSIVE_FALLBACK");

console.log("SOURCE_MANAGEMENT_DASHBOARD_023=PASS");
