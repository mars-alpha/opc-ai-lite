import Link from "next/link";
import "./admin-v2.css";
import { cookies } from "next/headers";
import { AdminWorkspaceNav } from "../../components/AdminWorkspaceNav";
import { getSessionUser, SESSION_COOKIE } from "../../lib/server/auth/service";
import { isAdminUser } from "../../lib/server/admin/service";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user || !isAdminUser(user)) return children;

  return (
    <div className="admin-workspace-shell">
      <aside className="admin-workspace-sidebar">
        <Link href="/admin" className="admin-workspace-brand">
          <img src="/opc-logo.png" alt="" aria-hidden="true" />
          <div>
            <strong>OPC AI 管理后台</strong>
            <span>平台运营与管理</span>
          </div>
        </Link>
        <AdminWorkspaceNav />
        <div className="admin-workspace-account">
          <span>管理员</span>
          <strong>{user.email}</strong>
        </div>
      </aside>

      <section className="admin-workspace-main">
        <header className="admin-workspace-topbar">
          <div>
            <span className="admin-topbar-dot" />
            <strong>管理员控制台</strong>
          </div>
          <div className="admin-topbar-actions">
            <Link href="/" className="admin-topbar-link">查看前台 ↗</Link>
          </div>
        </header>
        <div className="admin-workspace-content">{children}</div>
      </section>
    </div>
  );
}
