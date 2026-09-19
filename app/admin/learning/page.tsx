import Link from "next/link";
import { cookies } from "next/headers";
import { AdminLearningWorkbench } from "../../../components/AdminLearningWorkbench";
import {
  getSessionUser,
  SESSION_COOKIE
} from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";
import { listLearningInsightWorkbench } from "../../../lib/server/learning-insights/service";

export const dynamic = "force-dynamic";

export default async function AdminLearningPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/learning");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入学习洞察后台</h1>
          <p>学习反馈、AI 诊断与课程更新候选只对管理员开放。</p>
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

  const data = await listLearningInsightWorkbench();
  const serializeDate = (value: Date) => value.toISOString();

  return (
    <main className="admin-page">
      <div className="admin-page-head">
        <div>
          <div className="kicker">OPC Admin · Learning Insight</div>
          <h1>课程改进工作台</h1>
          <p>先解决用户问题，只把仍未解决且达到价值条件的问题送进 AI 诊断与人工审核。</p>
        </div>
        <div className="admin-page-actions">
          <Link className="btn btn-secondary" href="/admin/courses">课程维护</Link>
          <Link className="btn btn-secondary" href="/">查看前台</Link>
        </div>
      </div>

      <AdminLearningWorkbench
        insights={data.insights.map((item) => ({
          ...item,
          updatedAt: serializeDate(item.updatedAt)
        }))}
        candidates={data.candidates.map((item) => ({
          ...item,
          createdAt: serializeDate(item.createdAt)
        }))}
        qualityRisks={data.qualityRisks.map((item) => ({
          ...item,
          createdAt: serializeDate(item.createdAt)
        }))}
      />
    </main>
  );
}
