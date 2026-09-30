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
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>PLATFORM / COURSES</span>
          <h1>课程维护</h1>
          <p>课程属于平台管理域。这里只维护正式 Lesson 数据与发布状态。</p>
        </div>
      </div>
      <div className="admin-platform-flow admin-platform-flow-course">
        <div><b>01</b><strong>选择课程</strong><span>从左侧目录定位 Lesson</span></div>
        <div><b>02</b><strong>维护内容</strong><span>编辑标题、摘要和教学内容</span></div>
        <div><b>03</b><strong>确认状态</strong><span>Draft / Review / Published</span></div>
        <div><b>04</b><strong>正式生效</strong><span>只有 Published 才进入前台</span></div>
      </div>
      <AdminCourseEditor />
    </main>
  );
}


