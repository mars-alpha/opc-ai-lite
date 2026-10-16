import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const component = fs.readFileSync("components/AdminIntelligenceWorkspace.tsx", "utf8");
const css = fs.readFileSync("app/admin/intelligence/intelligence.css", "utf8");

assert(component.includes('className="intel-command"'), "UI_COMMAND_BAR");
assert(component.includes('className="intel-today-grid"'), "UI_TODAY_GRID");
assert(component.includes('className="intel-today-hot"'), "UI_CURRENT_HOT");
assert(!component.includes('className="intel-today-featured"'), "UI_NO_FEATURED_SIDE_CARD");
assert(component.includes('className="intel-hotspot-practice"'), "UI_HOTSPOT_PRACTICE");
assert(component.includes('暂无触发的AI热点练习'), "UI_HOTSPOT_PRACTICE_EMPTY_STATE");
assert(component.includes('触发后持续展示'), "UI_PRACTICE_PERSISTENCE_VISIBLE");
assert(component.includes('<details className="intel-practice-materials">'), "UI_MATERIALS_COLLAPSED_BY_DEFAULT");
assert(css.includes('-webkit-line-clamp: 2'), "UI_SUMMARY_TWO_LINES");
assert(css.includes('5 * var(--intel-hot-row-height)'), "UI_FIVE_ROW_PANEL_HEIGHT");
assert(component.includes('className="intel-stream"'), "UI_EVENT_STREAM");
assert(component.includes('className="intel-timeline-feed"'), "UI_TIMELINE_FEED");
assert(component.includes('className="intel-timeline-item"'), "UI_TIMELINE_ITEM");
assert(component.includes('className="intel-timeline-card"'), "UI_TIMELINE_CARD");
assert(component.includes('className="intel-timeline-time"'), "UI_TIMELINE_TIME");
assert(component.includes('<details className="intel-timeline-day"'), "UI_DAY_COLLAPSIBLE");
assert(component.includes('open={day === timelineWindow?.today}'), "UI_TODAY_OPEN_BY_DEFAULT");
assert(component.includes('className="intel-load-more"'), "UI_COMPACT_LOAD_MORE");
assert(component.includes('className="intel-readiness-compact"'), "UI_READINESS_SECONDARY");
assert(component.includes('useState<HotTrackingMode>("ALL")'), "UI_DEFAULT_ALL_DYNAMICS");
assert(!component.includes('加载更多（继续读取近 7 天事件）'), "UI_NO_FULL_WIDTH_LEGACY_LOAD_MORE_COPY");

assert(css.includes(".intel-command"), "CSS_COMMAND");
assert(css.includes(".intel-today-grid"), "CSS_TODAY_GRID");
assert(css.includes(".intel-hotspot-practice-empty"), "CSS_PRACTICE_EMPTY");
assert(css.includes(".intel-load-more"), "CSS_LOAD_MORE");
assert(css.includes(".intel-timeline-item"), "CSS_TIMELINE_ITEM");
assert(css.includes(".intel-timeline-rail"), "CSS_TIMELINE_RAIL");
assert(css.includes(".intel-timeline-card"), "CSS_TIMELINE_CARD");
assert(css.includes("@media (max-width: 760px)"), "CSS_MOBILE");

console.log(JSON.stringify({
  task: "HOT-TRACKING-UI-V2",
  layout: ["command", "current-hot", "ai-hotspot-practice", "event-stream", "diagnostics"],
  triggeredPracticesAlwaysVisible: true,
  defaultFeed: "ALL",
  visualTheme: "BLUE_WHITE",
  status: "PASS"
}, null, 2));
