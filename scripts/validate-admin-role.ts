import fs from "node:fs";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("ADMIN_ROLE_FAILED:" + code);
}

const schema = fs.readFileSync("lib/server/db/schema.ts", "utf8");
const adminService = fs.readFileSync("lib/server/admin/service.ts", "utf8");
const usersService = fs.readFileSync("lib/server/admin/users.ts", "utf8");
const entitlementService = fs.readFileSync("lib/server/entitlements/service.ts", "utf8");
const userRoute = fs.readFileSync("app/api/admin/users/[userId]/route.ts", "utf8");
const component = fs.readFileSync("components/AdminUserManagement.tsx", "utf8");
const migration = fs.readFileSync("drizzle/0016_careful_nicolaos.sql", "utf8");

assert(schema.includes('pgEnum("user_role", ["USER", "ADMIN"])'), "ROLE_ENUM");
assert(schema.includes('role: userRole("role").notNull().default("USER")'), "ROLE_DEFAULT_USER");
assert(adminService.includes('user.role === "ADMIN" || isBootstrapAdminEmail(user.email)'), "DB_ROLE_OR_BOOTSTRAP");
assert(entitlementService.includes("export async function hasMembershipAccess"), "MEMBERSHIP_ACCESS_HELPER");
assert(entitlementService.includes('user.role === "ADMIN" || isBootstrapAdminEmail(user.email)'), "ADMIN_GETS_MEMBER_ACCESS");
assert(usersService.includes("if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;"), "ADMIN_SORT_FIRST");
assert(usersService.includes('throw new Error("LAST_ADMIN")'), "LAST_ADMIN_GUARD");
assert(usersService.includes('throw new Error("LAST_ACTIVE_ADMIN")'), "LAST_ACTIVE_ADMIN_GUARD");
assert(userRoute.includes("CANNOT_REMOVE_SELF_ADMIN"), "SELF_DEMOTION_GUARD");
assert(component.includes('settingsRole === "USER"'), "USER_ROLE_SETTING");
assert(component.includes('settingsRole === "ADMIN"'), "ADMIN_ROLE_SETTING");
assert(component.includes("确认取消该用户的管理员身份"), "REMOVE_ADMIN_CONFIRM");
assert(component.includes("全部身份"), "ROLE_FILTER");
assert(!component.includes("管理员权益"), "ADMIN_ENTITLEMENT_LABEL_MUST_NOT_EXIST");
assert(!component.includes("系统管理员"), "SYSTEM_ADMIN_LABEL_MUST_NOT_EXIST");
assert(component.includes("openUserSettings"), "ROLE_SETTINGS_MUST_START_FROM_USER_SETTINGS");
assert(!component.includes("编辑备注"), "NO_USER_NOTE_ACTION");
assert(!component.includes("adminNote"), "NO_USER_NOTE_RUNTIME_IN_COMPONENT");
assert(!usersService.includes("USER_NOTE_UPDATED"), "NO_USER_NOTE_AUDIT_ACTION");
assert(!component.includes("admin-user-head-actions"), "NO_RIGHT_SIDE_IDENTITY_ACTIONS");
assert(component.includes('detail.isAdmin ? "is-admin-user" : ""'), "ADMIN_BUSINESS_SUMMARY_LAYOUT");
assert(component.includes("!detail.isAdmin ? ("), "ADMIN_MUST_NOT_RENDER_MEMBERSHIP_CARD");
assert(!component.includes("管理会员 →"), "NO_DUPLICATE_MEMBERSHIP_CARD_ACTION");
assert(migration.includes('CREATE TYPE "public"."user_role" AS ENUM(\'USER\', \'ADMIN\')'), "ROLE_MIGRATION_ENUM");
assert(migration.includes('ALTER TABLE "users" ADD COLUMN "role"'), "ROLE_MIGRATION_COLUMN");

console.log("ADMIN_ROLE_MODEL=PASS");
console.log("ADMIN_ROLE_SAFETY_GUARDS=PASS");
console.log("ADMIN_ROLE_MEMBER_ACCESS=PASS");
console.log("ADMIN_ROLE_UI=PASS");
