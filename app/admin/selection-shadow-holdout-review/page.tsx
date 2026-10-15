import Link from "next/link";
import { cookies } from "next/headers";
import "../selection-shadow-review/selection-shadow-review.css";
import { AdminSelectionShadowReview } from "../../../components/AdminSelectionShadowReview";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";
import { isAdminUser } from "../../../lib/server/admin/service";
import { readSelectionShadowHoldoutManifest } from "../../../lib/server/content/selection-shadow-holdout";

export const dynamic = "force-dynamic";

export default async function AdminSelectionShadowHoldoutReviewPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);

  if (!user) {
    const returnTo = encodeURIComponent("/admin/selection-shadow-holdout-review");
    return (
      <main className="admin-access-page">
        <div className="admin-access-card">
          <div className="kicker">Holdout</div>
          <h1>登录后进入新窗口 Holdout 审核</h1>
          <p>这是冻结 Selection Policy 后的新样本盲审，不影响正式精选结果。</p>
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
          <p>Shadow Holdout Human Review 只允许管理员访问。</p>
          <Link className="btn btn-secondary" href="/">返回首页</Link>
        </div>
      </main>
    );
  }

  const manifest = readSelectionShadowHoldoutManifest();
  const waiting = !manifest || manifest.status === "WAITING_NEW_WINDOW";
  const cutoffText = manifest ? " Cutoff：" + manifest.cutoff : "";

  return (
    <main className="admin-page selection-gold-review-page">
      <div className="admin-view-head admin-page-titlebar">
        <div>
          <span>INTERNAL / AIHOT SELECTION HOLDOUT</span>
          <h1>精选 Shadow 新窗口 Holdout</h1>
          <p>冻结规则后盲审：不展示 Shadow 分数、Tier 或 Policy。{cutoffText}</p>
        </div>
        <div className="selection-gold-status">{waiting ? "WAITING NEW WINDOW" : "HOLDOUT ONLY"}</div>
      </div>
      <AdminSelectionShadowReview
        apiPath="/api/admin/content/selection-shadow-holdout-review"
        emptyMessage={waiting ? "当前没有晚于冻结 cutoff 的新 Event。等待下一轮系统采集后重新生成 Holdout。" : "没有可审核 Holdout 样本。"}
      />
    </main>
  );
}
