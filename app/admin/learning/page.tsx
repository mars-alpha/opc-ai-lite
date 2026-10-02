import Link from "next/link";
import { cookies } from "next/headers";
import { AdminLearningWorkbenchV2 } from "../../../components/AdminLearningWorkbenchV2";
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
          <div className="kicker">后台管理</div>
          <h1>登录后进入学习洞察后台</h1>
          <p>学习问题、真实证据与人工处理工作台只对管理员开放。</p>
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
          <span>平台运营 / 学习洞察</span>
          <h1>学习洞察</h1>
          <p>用真实学习数据持续观察课程健康，先综合判断整门课程，再决定是否进入 AI 诊断与课程维护。</p>
        </div>
      </div>
      <div className="admin-platform-flow admin-platform-flow-learning">
        <div><b>01</b><strong>系统发现</strong><span>机械规则聚合真实学习问题</span></div>
        <div><b>02</b><strong>人工确认</strong><span>交给 AI / 继续观察 / 无需处理</span></div>
        <div><b>03</b><strong>AI 诊断</strong><span>下一阶段：诊断问题并列课程</span></div>
        <div><b>04</b><strong>课程维护</strong><span>采纳后才进入课程草稿</span></div>
      </div>

      <AdminLearningWorkbenchV2
        courses={data.courseHealth.map((course) => ({
          ...course,
          firstIssueAt: serializeDate(course.firstIssueAt),
          oldestOpenIssueAt: course.oldestOpenIssueAt ? serializeDate(course.oldestOpenIssueAt) : null,
          latestIssueAt: serializeDate(course.latestIssueAt),
          issueGroups: course.issueGroups.map((group) => ({
            ...group,
            firstSeenAt: serializeDate(group.firstSeenAt),
            lastSeenAt: serializeDate(group.lastSeenAt)
          })),
          issues: course.issues.map((issue) => ({
            id: issue.id,
            sourceType: issue.sourceType,
            issueCategory: issue.issueCategory,
            issueKey: issue.issueKey,
            status: issue.status,
            distinctUserCount: issue.distinctUserCount,
            evidence: issue.evidence,
            directComment: issue.directComment,
            createdAt: serializeDate(issue.createdAt),
            updatedAt: serializeDate(issue.updatedAt),
            simulation: issue.simulation
          }))
        }))}
      />
    </main>
  );
}
