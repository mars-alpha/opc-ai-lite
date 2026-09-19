import Link from "next/link";
import { cookies } from "next/headers";
import { AdminCourseEditor } from "../../../components/AdminCourseEditor";
import {
  getSessionUser,
  SESSION_COOKIE
} from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/courses");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入课程后台</h1>
          <p>课程维护只对明确配置的管理员账号开放。</p>
          <Link className="btn btn-primary" href={"/auth?mode=login&returnTo=" + returnTo}>
            登录 →
          </Link>
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
          <div className="kicker">OPC Admin</div>
          <h1>课程维护</h1>
          <p>维护 PostgreSQL 中的 Lesson，并通过 Draft → Review → Published 控制前台发布。</p>
        </div>
        <div className="admin-page-actions">
          <Link className="btn btn-secondary" href="/admin/content">内容运营</Link>
          <Link className="btn btn-secondary" href="/admin/learning">学习洞察</Link>
          <Link className="btn btn-secondary" href="/">查看前台</Link>
        </div>
      </div>
      <AdminCourseEditor />
    </main>
  );
}


