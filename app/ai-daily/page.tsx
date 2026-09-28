import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { DailyFeed } from "../../components/DailyFeed";
import { HeroVisual } from "../../components/HeroVisual";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { resolveResourceAccess } from "../../lib/server/access/service";
import { getSessionUser, SESSION_COOKIE } from "../../lib/server/auth/service";
import { listPublishedContentItemsWithFallback } from "../../lib/server/content/reader";
import { measureServerTask } from "../../lib/server/perf";

export const dynamic = "force-dynamic";

async function DailyFeedContent() {
  const cookieStore = await cookies();
  const [items, user] = await Promise.all([
    measureServerTask("ai-daily.content", () => listPublishedContentItemsWithFallback()),
    getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null)
  ]);
  const [access, courseEntryAccess] = await Promise.all([
    resolveResourceAccess(user?.id ?? null, "AI_DAILY_FULL"),
    resolveResourceAccess(user?.id ?? null, "ADVANCED_COURSE_ENTRY")
  ]);
  return (
    <DailyFeed
      items={items}
      fullAccess={access}
      lockedFrom={access.allowed ? items.length : Math.min(3, items.length)}
      courseEntryAllowed={courseEntryAccess.allowed}
    />
  );
}

export default function AIDailyPage() {
  return (
    <>
      <PageHero
        eyebrow="AI Daily · Knowledge Radar"
        title={<>知道发生了什么<br /><span className="accent">更要知道是否与你有关</span></>}
        description="AI 日报不是新闻堆砌，而是帮你筛选真正重要的变化，提炼成值得掌握的知识，再判断哪些值得实践、哪些会影响正在学习的课程。"
        actions={<><Link className="btn btn-primary" href="#feed">查看示例内容</Link><Link className="btn btn-secondary" href="/learning-path">回到学习路径</Link></>}
        metrics={[
          { value: "每日精选", label: "免费用户每天可查看 3 条精选" },
          { value: "关注或会员", label: "关注公众号或 OPC 会员可查看全部日报" },
          { value: "课程影响", label: "判断新变化是否影响已学知识与课程" }
        ]}
        visual={<HeroVisual
          cards={[
            { title: "Daily Item", value: "值得关注吗？", detail: "不是所有变化都需要进入知识库。" },
            { title: "Knowledge", value: "形成新知识吗？", detail: "把变化压缩成普通人能理解的结构。" },
            { title: "Course Impact", value: "影响已学内容吗？", detail: "只生成更新建议，不自动改课程。" }
          ]}
          eyebrow="Knowledge Engine"
          caption="让变化回到学习本身"
        />}
      />
      <section className="section" id="feed">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Knowledge radar</div>
              <h2 className="section-title">值得知道的变化</h2>
              <p className="section-subtitle">Top 3 免费；公众号关注权益或 OPC 会员可查看全部已发布 AI Daily。</p>
            </div>
          </Reveal>
          <div className="panel daily-main-panel">
            <Suspense fallback={<div className="empty-state"><strong>正在读取今日 AI 动态…</strong><p>页面已打开，内容会在准备好后立即出现。</p></div>}>
              <DailyFeedContent />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
