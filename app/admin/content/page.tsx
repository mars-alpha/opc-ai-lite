import Link from "next/link";
import { cookies } from "next/headers";
import "./official-content.css";
import { AdminPlatformContentWorkspace } from "../../../components/AdminPlatformContentWorkspace";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const initialView = params.view === "strategy" ? "STRATEGY" : params.view === "workbench" ? "WORKBENCH" : "INTELLIGENCE";
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/content");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入内容运营后台</h1>
          <p>内容采集、情报判断与内容生产只对管理员开放。</p>
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
    <main className="admin-page admin-content-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>PLATFORM / CONTENT</span>
          <h1>内容采集</h1>
          <p>先判断今天值得关注什么，再整理内容；采集规则单独配置，不把所有动作堆在同一屏。</p>
        </div>
      </div>
      <AdminPlatformContentWorkspace initialView={initialView} />
    </main>
  );
}
