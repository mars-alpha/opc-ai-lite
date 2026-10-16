import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_MANAGEMENT_LEARNING_STYLE_025_FAILED:" + code);
  console.log(code + "=PASS");
}

const ui = fs.readFileSync("components/AdminSourceManagementWorkspace.tsx", "utf8");
const css = fs.readFileSync("app/admin/sources/sources.css", "utf8");
const typography = fs.readFileSync("app/admin/content-typography.css", "utf8");

assert(ui.includes("source-governance-grid") && ui.includes("source-discovery-column") && ui.includes("source-management-column"), "LEARNING_INSIGHT_TWO_PANE_WORKBENCH");
assert(css.includes("grid-template-columns: minmax(300px,31%) minmax(0,69%)"), "LEARNING_INSIGHT_31_69_RATIO");
assert(css.includes(".source-column-head strong") && css.includes("font-size: var(--content-font-section)") && typography.includes("--content-font-section: 18px"), "LEARNING_INSIGHT_QUEUE_TITLE_SCALE");
assert(css.includes(".source-summary-grid strong") && css.includes("font-size: 28px"), "LEARNING_INSIGHT_DETAIL_TITLE_SCALE");
assert(css.includes("border-color: #bfd2f3") && css.includes("background: #f2f6fd"), "LEARNING_INSIGHT_ACTIVE_ROW_COLOR");
assert(css.includes(".source-btn-primary") && css.includes("background: #2f67c8"), "LEARNING_INSIGHT_PRIMARY_BUTTON");
assert(css.includes("border: 1px solid #dbe3ee") && css.includes("border-radius: 7px"), "LEARNING_INSIGHT_FORM_CONTROLS");
assert(ui.includes("source-health health-") && css.includes(".source-health.health-healthy i"), "SOURCE_HEALTH_STATUS_DOTS");
assert(ui.includes("source-workbench-block") && css.includes("border: 1px solid #e4eaf2") && css.includes("border-radius: 8px"), "LEARNING_INSIGHT_CONTENT_BLOCKS");
assert(css.includes(".source-learning-queue-list") && css.includes(".source-discovery-flow") && css.includes("overflow-y: auto"), "INDEPENDENT_WORKBENCH_SCROLL");
assert(ui.includes("新增来源") && ui.includes("筛选规则") && ui.includes("发现渠道") && ui.includes("全部采集方式") && ui.includes("启用 Route"), "ALL_GOVERNANCE_CAPABILITIES_PRESERVED");
assert(!ui.includes("source-capability-grid") && !ui.includes("source-registry-board") && !ui.includes("source-command-grid"), "OLD_SOURCE_LAYOUT_OWNERS_RETIRED");
assert(css.includes("@media (max-width: 980px)") && css.includes("grid-template-columns: 1fr"), "LEARNING_STYLE_RESPONSIVE_FALLBACK");

console.log("SOURCE_MANAGEMENT_LEARNING_STYLE_025=PASS");
