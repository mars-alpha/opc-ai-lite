import Link from "next/link";
import { cookies } from "next/headers";
import "./selection-shadow-review.css";
import { AdminSelectionShadowReview } from "../../../components/AdminSelectionShadowReview";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminSelectionShadowReviewPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/selection-shadow-review");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Calibration</div>
          <h1>登录后进入精选 Gold 审核</h1>
          <p>这是 AIHOT Selection Shadow 的独立人工校准页面，不影响正式精选结果。</p>
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
          <p>Human Gold Calibration 只允许管理员访问。</p>
          <Link className="btn btn-secondary" href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page selection-gold-review-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>INTERNAL / AIHOT SELECTION CALIBRATION</span>
          <h1>精选 Gold 人工审核</h1>
          <p>盲审：这里只看事件事实与证据，不展示当前精选、Shadow 分数和门槛。</p>
        </div>
        <div className="selection-gold-status">CALIBRATION ONLY</div>
      </div>
      <AdminSelectionShadowReview />
    </main>
  );
}
