import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ADMIN_SHELL_DASHBOARD_FAILED:" + code);
}

const nav = fs.readFileSync("components/AdminWorkspaceNav.tsx", "utf8");
const layout = fs.readFileSync("app/admin/layout.tsx", "utf8");
const dashboard = fs.readFileSync("app/admin/page.tsx", "utf8");
const dashboardData = fs.readFileSync("lib/server/admin/users.ts", "utf8");

for (const token of [
  'label: "平台"',
  'label: "运营总览"',
  'label: "内容"',
  'label: "来源管理"',
  'label: "热点追踪"',
  'label: "课程"',
  'label: "课程维护"',
  'label: "学习洞察"',
  'label: "用户"',
  'label: "用户与权益"'
]) {
  assert(nav.includes(token), "NAV_REQUIRED:" + token);
}

for (const [before, after] of [
  ['label: "平台"', 'label: "内容"'],
  ['label: "内容"', 'label: "课程"'],
  ['label: "课程"', 'label: "用户"'],
  ['href: "/admin/sources"', 'href: "/admin/intelligence"'],
  ['href: "/admin/courses"', 'href: "/admin/learning"']
]) {
  assert(nav.indexOf(before) < nav.indexOf(after), "NAV_ORDER:" + before + ">" + after);
}

for (const token of [
  'label: "会员"',
  'href: "/admin/memberships"',
  'href: "/workspace"',
  'Workflow / Prompt / Skill',
  '模型与连接',
  '系统状态与审计',
  'label: "内部"',
  'href: "/admin/cluster-review"',
  'label: "Cluster 审核"',
  'label: "人工采集"'
]) {
  assert(!nav.includes(token), "NAV_SUPERSEDED:" + token);
}

assert(!layout.includes('href="/workspace"'), "LAYOUT_WORKSPACE_LINK_MUST_NOT_EXIST");
assert(dashboard.includes("getAdminPlatformSummary"), "DASHBOARD_MUST_USE_REAL_SUMMARY");
assert(dashboard.includes("listLearningInsightWorkbench"), "DASHBOARD_MUST_USE_CURRENT_COURSE_HEALTH");
assert(dashboard.includes('course.healthStatus === "ATTENTION"'), "DASHBOARD_ATTENTION_COURSE_COUNT_REQUIRED");
assert(dashboard.includes("需要检查的课程"), "DASHBOARD_CURRENT_LEARNING_LABEL_REQUIRED");
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
assert(!dashboardData.includes("qualityRisks"), "DASHBOARD_LEGACY_QUALITY_RISK_SUMMARY_MUST_BE_REMOVED");
assert(nav.includes('href: "/admin/intelligence"'), "INTELLIGENCE_NAV_REQUIRED");
assert(dashboard.includes('href: "/admin/intelligence"'), "INTELLIGENCE_SHORTCUT_REQUIRED");
assert(dashboard.includes('href: "/admin/content?view=workbench"'), "PENDING_CONTENT_MUST_OPEN_WORKBENCH");
console.log("ADMIN_SHELL_NAVIGATION=PASS");
console.log("ADMIN_DASHBOARD_REAL_DATA=PASS");
console.log("ADMIN_DASHBOARD_NO_ARCHITECTURE_TEACHING=PASS");
