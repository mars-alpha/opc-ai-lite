import { cookies } from "next/headers";
import { AdminUserManagement } from "../../../components/AdminUserManagement";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);
  if (!user || !isAdminUser(user)) return null;

  return (
    <main className="admin-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>PLATFORM / USERS & ENTITLEMENTS</span>
          <h1>用户与权益</h1>
          <p>以用户为主实体，在同一处管理账号、学习概况、会员权益和管理员操作记录。</p>
        </div>
      </div>
      <AdminUserManagement />
    </main>
  );
}
