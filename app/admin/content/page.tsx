import Link from "next/link";
import { cookies } from "next/headers";
import { AdminContentConsole } from "../../../components/AdminContentConsole";
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
      <div className="admin-page-head">
        <div>
          <div className="kicker">OPC Admin · Content Operations</div>
          <h1>AI 内容运营</h1>
          <p>把候选 AI 信息整理、审核并发布到 AI Daily；本阶段不做自动采集与自动派生。</p>
        </div>
        <div className="admin-page-actions">
          <Link className="btn btn-secondary" href="/admin/courses">课程维护</Link>
          <Link className="btn btn-secondary" href="/admin/learning">学习洞察</Link>
          <Link className="btn btn-secondary" href="/ai-daily">查看 AI Daily</Link>
        </div>
      </div>
      <AdminContentConsole />
    </main>
  );
}
