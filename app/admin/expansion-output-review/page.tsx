import Link from "next/link";
import { cookies } from "next/headers";
import "./expansion-output-review.css";
import { AdminEventExpansionOutputReview } from "../../../components/AdminEventExpansionOutputReview";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminExpansionOutputReviewPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/expansion-output-review");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Admin</div>
          <h1>登录后进入 Event Expansion Output 审核</h1>
          <p>该临时页面只读取真实 Event，并运行真实 Expansion 与 014 Output。</p>
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
          <p>Event Expansion Output Human Review 只允许管理员访问。</p>
          <Link className="btn btn-secondary" href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page expansion-output-review-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>INTERNAL / EVENT EXPANSION OUTPUT REVIEW</span>
          <h1>AI 日报扩展结果审核</h1>
          <p>只使用真实 Event。选择事件后先看事实，再运行真实 Expansion，最后审核六栏目与 AI 表达。</p>
        </div>
        <div className="output-review-status">UI_IMPLEMENTED / USER_REVIEW_PENDING</div>
      </div>
      <AdminEventExpansionOutputReview />
    </main>
  );
}
