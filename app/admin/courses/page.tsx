import Link from "next/link";
import { cookies } from "next/headers";
import { AdminCourseRegistry } from "../../../components/AdminCourseRegistry";
import {
  getSessionUser,
  SESSION_COOKIE
} from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({
  searchParams
}: {
  searchParams: Promise<{ course?: string; intent?: string }>;
}) {
  const params = await searchParams;
  const initialTargetKey = typeof params.course === "string" ? params.course : "";
  const initialIntent = params.intent === "edit" ? "EDIT" : "";
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
    <main className="admin-page admin-course-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>PLATFORM / COURSES</span>
          <h1>课程维护</h1>
          <p>查看正式课程、发起更新、审核新版，并在需要时恢复最近的历史版本。</p>
        </div>
      </div>
      <div className="admin-platform-flow admin-platform-flow-course">
        <div><b>01</b><strong>选择课程</strong><span>从当前课程目录找到需要维护的课程</span></div>
        <div><b>02</b><strong>编辑新版</strong><span>基于当前正式版创建更新内容</span></div>
        <div><b>03</b><strong>审核差异</strong><span>确认本次具体修改后再决定上线</span></div>
        <div><b>04</b><strong>版本管理</strong><span>保留最近 6 版，可查看、对比或恢复</span></div>
      </div>
      <AdminCourseRegistry
        initialTargetKey={initialTargetKey}
        initialIntent={initialIntent}
      />
    </main>
  );
}
