import Link from "next/link";
import { cookies } from "next/headers";
import { AdminPlatformContentWorkspace } from "../../../components/AdminPlatformContentWorkspace";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/content");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入内容运营后台</h1>
          <p>AI Daily 内容采编、审核与发布只对管理员开放。</p>
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
    <main className="admin-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>PLATFORM / CONTENT</span>
          <h1>官方内容</h1>
          <p>这里只处理 OPC AI 官方内容。用户工作台的素材、草稿和产物不进入这里。</p>
        </div>
      </div>
      <AdminPlatformContentWorkspace />
    </main>
  );
}
