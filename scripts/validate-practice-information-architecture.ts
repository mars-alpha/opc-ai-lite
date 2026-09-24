import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("PRACTICE_IA_VALIDATION_FAILED:" + code);
}

const learningPath = fs.readFileSync("app/learning-path/page.tsx", "utf8");
const practice = fs.readFileSync("app/practice/page.tsx", "utf8");
const hotspotPracticeList = fs.readFileSync("components/HotspotPracticeList.tsx", "utf8");
const practiceDetail = fs.readFileSync("app/practice/latest/[id]/page.tsx", "utf8");
const projects = fs.readFileSync("app/projects/page.tsx", "utf8");

assert(!learningPath.includes("stageProjects"), "LEARNING_PATH_MUST_NOT_RENDER_PROJECTS");
assert(!learningPath.includes('id="projects"'), "LEARNING_PATH_PROJECT_SECTION_MUST_NOT_RETURN");

assert(practice.includes('id="projects"'), "PRACTICE_PROJECT_SECTION_REQUIRED");
assert(practice.includes('id="tasks"'), "PRACTICE_SINGLE_CAPABILITY_SECTION_REQUIRED");
assert(practice.includes("AI 热点能力练习"), "HOTSPOT_CAPABILITY_TITLE_REQUIRED");
assert(
  practice.includes("AI 日报与热点采集") &&
    practice.includes("一次只练一个明确能力"),
  "HOTSPOT_TO_CAPABILITY_PIPELINE_REQUIRED"
);
assert(practice.includes("<HotspotPracticeList items={latestPractice} />"), "INLINE_EXPAND_LIST_REQUIRED");
assert(!practice.includes('href="/practice/latest">查看更多</Link>'), "MORE_MUST_NOT_NAVIGATE_TO_NEW_LIST_PAGE");
assert(hotspotPracticeList.includes('className="practice-list"'), "ORIGINAL_PRACTICE_LIST_UI_REQUIRED");
assert(hotspotPracticeList.includes('className="practice-row"'), "ORIGINAL_PRACTICE_ROW_UI_REQUIRED");
assert(hotspotPracticeList.includes("useState(3)"), "DEFAULT_THREE_ITEMS_REQUIRED");
assert(hotspotPracticeList.includes("items.slice(0, visibleCount)"), "INCREMENTAL_VISIBLE_COUNT_REQUIRED");
assert(hotspotPracticeList.includes("Math.min(count + 3, items.length)"), "LOAD_THREE_MORE_REQUIRED");
assert(hotspotPracticeList.includes("visibleCount < items.length"), "MORE_HIDES_AT_END_REQUIRED");
assert(hotspotPracticeList.includes("<span>查看更多</span>"), "INLINE_MORE_TEXT_REQUIRED");
assert(hotspotPracticeList.includes("— 已展示全部内容 —"), "ALL_CONTENT_END_MARKER_REQUIRED");
assert(!hotspotPracticeList.includes('className="btn btn-secondary"'), "MORE_BUTTON_FRAME_MUST_NOT_RENDER");
assert(!hotspotPracticeList.includes("收起"), "MORE_MUST_NOT_COLLAPSE_AFTER_EXPAND");
assert(!hotspotPracticeList.includes('latest-practice-grid'), "LATEST_CARD_GRID_MUST_NOT_REPLACE_PRACTICE_LIST");
assert(practice.includes("stageProjects.map"), "PROJECTS_MUST_LIVE_IN_PRACTICE");

assert(projects.includes('href="/practice#projects"'), "PROJECTS_BACK_TO_PRACTICE_REQUIRED");
assert(!projects.includes("学习路径中的综合实操项目"), "PROJECTS_OLD_OWNERSHIP_MUST_NOT_RETURN");

assert(!fs.existsSync("app/practice/latest/page.tsx"), "STANDALONE_PRACTICE_LIST_MUST_STAY_REMOVED");
assert(!fs.existsSync("components/LatestPracticeCard.tsx"), "OBSOLETE_LATEST_PRACTICE_CARD_MUST_STAY_REMOVED");
assert(!practiceDetail.includes("返回最新技术实操"), "DETAIL_OLD_BACK_LABEL_MUST_NOT_RENDER");
assert(practiceDetail.includes("返回 AI 热点能力练习"), "DETAIL_NEW_BACK_LABEL_REQUIRED");
assert(practiceDetail.includes('href="/practice#tasks"'), "DETAIL_BACK_TO_INLINE_PRACTICE_REQUIRED");

console.log("PRACTICE_IA_PROJECT_OWNERSHIP=PASS");
console.log("PRACTICE_IA_HOTSPOT_CAPABILITY=PASS");
console.log("PRACTICE_IA_OLD_LATEST_TECH_LABEL_REMOVED=PASS");
console.log("PRACTICE_IA_UI_FRAMEWORK_PRESERVED=PASS");
