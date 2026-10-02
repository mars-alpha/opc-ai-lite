import Link from "next/link";
import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE } from "../../lib/server/auth/service";
import { isAdminUser } from "../../lib/server/admin/service";
import { getAdminPlatformSummary } from "../../lib/server/admin/users";
import { listLearningInsightWorkbench } from "../../lib/server/learning-insights/service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入 OPC AI 管理后台</h1>
          <p>平台运营和管理只对管理员开放。</p>
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
          <p>当前账号不是平台管理员。</p>
          <Link className="btn btn-secondary" href="/">返回 OPC AI</Link>
        </div>
      </main>
    );
  }

  const [summary, learningInsight] = await Promise.all([
    getAdminPlatformSummary(),
    listLearningInsightWorkbench()
  ]);
  const attentionCourses = learningInsight.courseHealth.filter(
    (course) => course.healthStatus === "ATTENTION"
  ).length;

  const metrics = [
    { label: "注册用户", value: summary.users, detail: "当前平台注册账号", href: "/admin/users" },
    { label: "有效会员", value: summary.activeMembers, detail: "当前有效 Membership", href: "/admin/users" },
    { label: "正式课程", value: summary.publishedLessons, detail: "当前五大板块正式课程", href: "/admin/courses" },
    { label: "待处理内容", value: summary.reviewContent, detail: "等待管理员处理的采集内容", href: "/admin/content?view=workbench" }
  ];

  const attention = [
    {
      label: "30 天内到期会员",
      value: summary.expiringMembers,
      detail: summary.expiringMembers > 0 ? "需要查看续期或权益安排" : "当前没有即将到期会员",
      href: "/admin/users"
    },
    {
      label: "开放学习问题",
      value: summary.openInsights,
      detail: summary.openInsights > 0 ? "需要查看学习洞察" : "当前没有开放学习问题",
      href: "/admin/learning"
    },
    {
      label: "需要检查的课程",
      value: attentionCourses,
      detail: attentionCourses > 0 ? "按课程诊断排列顺序检查" : "当前没有需要检查的课程",
      href: "/admin/learning"
    },
    {
      label: "待处理采集内容",
      value: summary.reviewContent,
      detail: summary.reviewContent > 0 ? "有内容等待管理员处理" : "当前没有待处理内容",
      href: "/admin/content?view=workbench"
    }
  ];

  const shortcuts = [
    { href: "/admin/users", title: "用户与权益", detail: "账号、学习概况、会员与 Entitlement" },
    { href: "/admin/content?view=strategy", title: "内容采集", detail: "配置采集策略与采集范围" },
    { href: "/admin/courses", title: "课程维护", detail: "查看课程状态与版本" },
    { href: "/admin/learning", title: "学习洞察", detail: "查看问题、风险与更新候选" }
  ];

  return (
    <main className="admin-page admin-platform-dashboard">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>ADMIN / OVERVIEW</span>
          <h1>运营总览</h1>
          <p>查看平台关键指标、待处理事项和需要关注的风险。</p>
        </div>
      </div>

      <section aria-labelledby="admin-key-metrics">
        <div className="admin-dashboard-section-title">
          <div>
            <span>OVERVIEW</span>
            <h2 id="admin-key-metrics">关键指标</h2>
          </div>
          <small>来自当前平台数据库</small>
        </div>
        <div className="admin-platform-metrics">
          {metrics.map((metric) => (
            <Link href={metric.href} className="admin-platform-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </Link>
          ))}
        </div>
      </section>

      <div className="admin-platform-dashboard-grid">
        <section className="admin-platform-dashboard-panel">
          <div className="admin-dashboard-panel-head">
            <div><span>ATTENTION</span><h2>待处理</h2></div>
            <small>只展示会影响下一步管理动作的状态</small>
          </div>
          <div className="admin-attention-list">
            {attention.map((item) => (
              <Link href={item.href} key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
                <b>{item.value}</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="admin-platform-dashboard-panel">
          <div className="admin-dashboard-panel-head">
            <div><span>MANAGEMENT</span><h2>快速进入</h2></div>
            <small>进入当前已经可管理的业务</small>
          </div>
          <div className="admin-management-links">
            {shortcuts.map((item) => (
              <Link href={item.href} key={item.href}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}