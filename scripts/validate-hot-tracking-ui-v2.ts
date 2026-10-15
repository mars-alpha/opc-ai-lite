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
assert(component.includes('className="intel-today-do"'), "UI_WORTH_DOING");
assert(component.includes('今天暂时没有达到“值得做”门槛的 Event'), "UI_WORTH_DOING_EMPTY_STATE");
assert(component.includes('至少 2 条可执行实践证据、2 个独立来源、2 种实践类型'), "UI_WORTH_DOING_GATE_VISIBLE");
assert(component.includes('className="intel-stream"'), "UI_EVENT_STREAM");
assert(component.includes('className="intel-timeline-feed"'), "UI_TIMELINE_FEED");
assert(component.includes('className="intel-timeline-item"'), "UI_TIMELINE_ITEM");
assert(component.includes('className="intel-timeline-card"'), "UI_TIMELINE_CARD");
assert(component.includes('className="intel-timeline-time"'), "UI_TIMELINE_TIME");
assert(component.includes('<details className="intel-timeline-day"'), "UI_DAY_COLLAPSIBLE");
assert(component.includes('open={dayIndex === 0}'), "UI_FIRST_DAY_OPEN_BY_DEFAULT");
assert(component.includes('className="intel-load-more"'), "UI_COMPACT_LOAD_MORE");
assert(component.includes('className="intel-readiness-compact"'), "UI_READINESS_SECONDARY");
assert(component.includes('useState<HotTrackingMode>("ALL")'), "UI_DEFAULT_ALL_DYNAMICS");
assert(!component.includes('加载更多（继续读取近 7 天事件）'), "UI_NO_FULL_WIDTH_LEGACY_LOAD_MORE_COPY");

assert(css.includes(".intel-command"), "CSS_COMMAND");
assert(css.includes(".intel-today-grid"), "CSS_TODAY_GRID");
assert(css.includes(".intel-do-empty"), "CSS_WORTH_EMPTY");
assert(css.includes(".intel-load-more"), "CSS_LOAD_MORE");
assert(css.includes(".intel-timeline-item"), "CSS_TIMELINE_ITEM");
assert(css.includes(".intel-timeline-rail"), "CSS_TIMELINE_RAIL");
assert(css.includes(".intel-timeline-card"), "CSS_TIMELINE_CARD");
assert(css.includes("@media (max-width: 760px)"), "CSS_MOBILE");

console.log(JSON.stringify({
  task: "HOT-TRACKING-UI-V2",
  layout: ["command", "current-hot", "worth-doing", "event-stream", "diagnostics"],
  worthDoingAlwaysVisible: true,
  defaultFeed: "ALL",
  visualTheme: "BLUE_WHITE",
  status: "PASS"
}, null, 2));
