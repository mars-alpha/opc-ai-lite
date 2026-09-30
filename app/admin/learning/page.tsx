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
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>PLATFORM / LEARNING</span>
          <h1>学习洞察</h1>
          <p>聚合真实学习问题、课程更新候选与质量风险；批准不会自动修改课程。</p>
        </div>
      </div>
      <div className="admin-platform-flow admin-platform-flow-learning">
        <div><b>01</b><strong>发现问题</strong><span>聚合真实学习反馈</span></div>
        <div><b>02</b><strong>分析原因</strong><span>规则先聚合，必要时再用 AI</span></div>
        <div><b>03</b><strong>形成候选</strong><span>只保留值得处理的课程更新建议</span></div>
        <div><b>04</b><strong>人工决定</strong><span>批准只形成任务，不自动改课</span></div>
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
