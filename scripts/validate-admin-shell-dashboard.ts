import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ADMIN_SHELL_DASHBOARD_FAILED:" + code);
}

const nav = fs.readFileSync("components/AdminWorkspaceNav.tsx", "utf8");
const layout = fs.readFileSync("app/admin/layout.tsx", "utf8");
const dashboard = fs.readFileSync("app/admin/page.tsx", "utf8");
const dashboardData = fs.readFileSync("lib/server/admin/users.ts", "utf8");

for (const token of [
  'label: "运营总览"',
  'label: "内容采集"',
  'label: "课程维护"',
  'label: "学习洞察"',
  'label: "用户与权益"'
]) {
  assert(nav.includes(token), "NAV_REQUIRED:" + token);
}

for (const token of [
  'label: "会员"',
  'href: "/admin/memberships"',
  'href: "/workspace"',
  'Workflow / Prompt / Skill',
  '模型与连接',
  '系统状态与审计'
]) {
  assert(!nav.includes(token), "NAV_SUPERSEDED:" + token);
}

assert(!layout.includes('href="/workspace"'), "LAYOUT_WORKSPACE_LINK_MUST_NOT_EXIST");
assert(dashboard.includes("getAdminPlatformSummary"), "DASHBOARD_MUST_USE_REAL_SUMMARY");
assert(dashboard.includes("待处理"), "DASHBOARD_ATTENTION_REQUIRED");
assert(dashboard.includes("关键指标"), "DASHBOARD_METRICS_REQUIRED");

for (const token of [
  "responsibilityMap",
  "AI / Skill",
  "人工 Gate",
  "HUMAN GATE RULE",
  "默认只保留一次必要人工确认",
  'href="/workspace"'
]) {
  assert(!dashboard.includes(token), "DASHBOARD_CONCEPT_UI_MUST_NOT_EXIST:" + token);
}

assert(dashboardData.includes("CURRENT_CURRICULUM_SLUGS"), "DASHBOARD_COURSE_COUNT_MUST_USE_CURRENT_CURRICULUM");
assert(dashboardData.includes('inArray(contentItems.status, ["DRAFT", "REVIEW"])'), "DASHBOARD_PENDING_CONTENT_MUST_MATCH_WORKBENCH");
assert(dashboardData.includes('["OPEN", "ANALYSIS_READY", "UNDER_REVIEW"]'), "DASHBOARD_ACTIVE_INSIGHTS_MUST_USE_ACTIONABLE_STATES");
assert(nav.includes('href: "/admin/content?view=strategy"'), "CONTENT_NAV_MUST_OPEN_STRATEGY");
assert(dashboard.includes('href: "/admin/content?view=strategy"'), "CONTENT_SHORTCUT_MUST_OPEN_STRATEGY");
assert(dashboard.includes('href: "/admin/content?view=workbench"'), "PENDING_CONTENT_MUST_OPEN_WORKBENCH");
console.log("ADMIN_SHELL_NAVIGATION=PASS");
console.log("ADMIN_DASHBOARD_REAL_DATA=PASS");
console.log("ADMIN_DASHBOARD_NO_ARCHITECTURE_TEACHING=PASS");
