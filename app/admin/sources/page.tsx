import Link from "next/link";
import { cookies } from "next/headers";
import "./sources.css";
import { AdminSourceManagementWorkspace } from "../../../components/AdminSourceManagementWorkspace";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/sources");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入来源管理</h1>
          <p>来源身份、采集资格、平台连接与运行健康只对管理员开放。</p>
          <Link className="btn btn-primary" href={"/auth?mode=login&returnTo=" + returnTo}>登录 →</Link>
        </div>
      </main>
    );
  }

  if (!isAdminUser(user)) {
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">403</div>
          <h1>当前账号没有后台权限</h1>
          <p>管理员邮箱必须在服务端 OPC_ADMIN_EMAILS 中明确配置。</p>
          <Link className="btn btn-secondary" href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page admin-sources-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>SOURCES / OPERATIONS</span>
          <h1>来源管理</h1>
          <p>统一查看当前信息源、采集方式、资格与运行健康；新增来源必须经过探测、检查和预览后才能进入自动采集。</p>
        </div>
      </div>
      <AdminSourceManagementWorkspace />
    </main>
  );
}
