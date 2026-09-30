import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ADMIN_USERS_ENTITLEMENTS_FAILED:" + code);
}

const usersPage = fs.readFileSync("app/admin/users/page.tsx", "utf8");
const membershipsPage = fs.readFileSync("app/admin/memberships/page.tsx", "utf8");
const component = fs.readFileSync("components/AdminUserManagement.tsx", "utf8");
const nav = fs.readFileSync("components/AdminWorkspaceNav.tsx", "utf8");
const css = fs.readFileSync("app/admin/admin-v2.css", "utf8");

assert(usersPage.includes("用户与权益"), "USERS_PAGE_TITLE");
assert(!usersPage.includes('mode="users"'), "MODE_SPLIT_MUST_BE_REMOVED");
assert(membershipsPage.includes('redirect("/admin/users'), "MEMBERSHIP_ROUTE_REDIRECT");
assert(!nav.includes('label: "会员"'), "NO_MEMBER_NAV");

for (const token of [
  "全部用户",
  "有效会员",
  "30 天内到期",
  "已到期 / 已取消",
  "<strong>会员</strong><span>商业关系</span>",
  "学习",
  "个人 AI 工作台",
  "用户设置",
  "普通用户",
  "管理员",
  "非会员",
  "定时会员",
  "永久会员",
  "当前能力结果",
  "保存用户设置",
  "停用账号",
  "恢复账号",
  "管理员操作记录",
  "PLANNED",
  "用户原始素材",
  "完整 Prompt",
  "AI 完整回复",
  "文章全文",
  "图片 / 音频 / 视频",
  "每一步中间产物"
]) {
  assert(component.includes(token), "COMPONENT_REQUIRED:" + token);
}

assert(!component.includes('type Mode = "users" | "membership"'), "MODE_TYPE_MUST_BE_REMOVED");
assert(!component.includes("mode ==="), "MODE_BRANCHES_MUST_BE_REMOVED");
assert(!component.includes("admin-workspace-entitlement"), "WORKSPACE_CARD_MUST_NOT_BE_IN_MEMBERSHIP_PREVIEW");
assert(!component.includes(">生效预览<"), "PERSISTENT_MEMBERSHIP_PREVIEW_MUST_BE_REMOVED");
assert(!component.includes("admin-user-detail-tabs"), "DETAIL_TABS_MUST_BE_REMOVED");
assert(component.includes("window.confirm(`确认${actionLabel}该用户账号？`)"), "ACCOUNT_STATUS_CONFIRM_REQUIRED");
assert(component.includes("auditOpen ? ("), "AUDIT_MUST_BE_SECONDARY");
assert(!component.includes("管理会员 →"), "NO_DUPLICATE_MEMBERSHIP_CARD_ACTION");
assert(component.includes("admin-user-row-menu-trigger"), "ACCOUNT_ACTION_MENU_REQUIRED");
assert(!component.includes("系统管理员"), "NO_SYSTEM_ADMIN_PRODUCT_LABEL");
assert(!component.includes("管理员权益"), "NO_ADMIN_MEMBERSHIP_CARD");
assert(component.includes('!detail.isAdmin ? ('), "MEMBERSHIP_CARD_ONLY_FOR_NON_ADMIN");
assert(component.includes("admin-user-row-actions-inline"), "ACCOUNT_ACTIONS_INLINE_REQUIRED");
assert(css.includes(".admin-user-row-actions-inline"), "ACCOUNT_ACTIONS_INLINE_STYLE_REQUIRED");
assert(!css.includes(".admin-user-row-menu {\n  position: absolute"), "NO_CLIPPABLE_ABSOLUTE_ACCOUNT_MENU");
assert(!component.includes("编辑备注"), "USER_NOTE_UI_MUST_BE_REMOVED");
assert(!component.includes("adminNote"), "USER_NOTE_RUNTIME_MUST_BE_REMOVED_FROM_COMPONENT");
assert(!component.includes("admin-user-head-actions"), "RIGHT_HEADER_MUST_BE_STATUS_ONLY");
assert(component.includes('type DetailMode = "OVERVIEW" | "SETTINGS"'), "VIEW_SETTINGS_MODE_REQUIRED");
assert(component.includes("openUserSettings"), "USER_SETTINGS_MUST_START_FROM_LIST");
assert(component.includes('detailMode === "OVERVIEW"'), "OVERVIEW_MODE_REQUIRED");
assert(component.includes('detailMode === "SETTINGS"'), "SETTINGS_MODE_REQUIRED");
assert(component.includes("saveUserSettings"), "UNIFIED_USER_SETTINGS_SAVE_REQUIRED");
assert(component.includes('type MembershipMode = "NONE" | "TIMED" | "PERMANENT"'), "UNIFIED_MEMBERSHIP_MODE_REQUIRED");
assert(component.includes('setDetailMode("OVERVIEW")'), "SAVE_RETURNS_TO_OVERVIEW_REQUIRED");
assert(!component.includes("membershipEditorOpen"), "OLD_MEMBERSHIP_EDITOR_STATE_MUST_BE_REMOVED");
for (const oldEntry of ["设置会员", "管理会员", "重新设置会员"]) {
  assert(!component.includes(oldEntry), "OLD_MEMBERSHIP_ENTRY_MUST_BE_REMOVED:" + oldEntry);
}
assert(css.includes("height: clamp(560px, calc(100vh - 260px), 760px);"), "WORKSPACE_EQUAL_HEIGHT_REQUIRED");
assert(css.includes(".admin-user-list {\n  min-height: 0;\n  flex: 1;\n  overflow: auto;"), "USER_LIST_INTERNAL_SCROLL_REQUIRED");

console.log("ADMIN_USERS_ENTITLEMENTS_SINGLE_WORKSPACE=PASS");
console.log("ADMIN_MEMBERSHIP_ROUTE_REDIRECT=PASS");
console.log("ADMIN_PERSONAL_WORKSPACE_USAGE_BOUNDARY=PASS");
