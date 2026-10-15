import Link from "next/link";
import { cookies } from "next/headers";
import "./intelligence.css";
import { AdminIntelligenceWorkspace } from "../../../components/AdminIntelligenceWorkspace";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminIntelligencePage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/intelligence");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入热点追踪</h1>
          <p>系统自动采集结果只对管理员开放。</p>
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
    <main className="admin-page admin-intelligence-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>HOT TRACKING / EVENTS</span>
          <h1>热点追踪</h1>
          <p>从来源管理的真实 Source 统一采集，按 Event 查看今日值得看、精选、全部动态与热点榜；事实可信与关注热度分别判断。</p>
        </div>
      </div>
      <AdminIntelligenceWorkspace />
    </main>
  );
}
