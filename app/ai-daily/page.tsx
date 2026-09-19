import Link from "next/link";
import { Suspense } from "react";
import { DailyFeed } from "../../components/DailyFeed";
import { HeroVisual } from "../../components/HeroVisual";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { listPublishedContentItemsWithFallback } from "../../lib/server/content/reader";
import { measureServerTask } from "../../lib/server/perf";

export const revalidate = 60;

async function DailyFeedContent() {
  const items = await measureServerTask("ai-daily.content", () => listPublishedContentItemsWithFallback());
  return <DailyFeed items={items} />;
}

export default function AIDailyPage() {
  return (
    <>
      <PageHero
        eyebrow="AI Daily · Knowledge Radar"
        title={<>知道发生了什么<br /><span className="accent">更要知道是否与你有关</span></>}
        description="AI Daily 不是新闻列表，而是 OPC Knowledge Engine 的雷达入口：筛选变化、形成知识、判断实操价值，并发现可能受影响的课程。"
        actions={
          <>
            <Link className="btn btn-primary" href="#feed">查看示例内容</Link>
            <Link className="btn btn-secondary" href="/learning-path">回到学习路径</Link>
          </>
        }
        metrics={[
          { value: "Radar", label: "先筛选，再进入内容体系" },
          { value: "3–8 min", label: "Knowledge Capsule 目标阅读时间" },
          { value: "Impact", label: "判断与 Stage / Lesson 的关系" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "Daily Item", value: "值得关注吗？", detail: "不是所有变化都需要进入知识库。" },
              { title: "Knowledge", value: "形成新知识吗？", detail: "把变化压缩成普通人能理解的结构。" },
              { title: "Course Impact", value: "影响已学内容吗？", detail: "只生成更新建议，不自动改课程。" }
            ]}
            eyebrow="Knowledge Engine"
            caption="让变化回到学习本身"
          />
        }
      />

      <section className="section compact">
        <div className="container">
          <div className="knowledge-pipeline">
            {[
              ["01", "发现变化", "Daily Item"],
              ["02", "形成知识", "Knowledge Capsule"],
              ["03", "值得动手", "Practice Candidate"],
              ["04", "影响课程", "Course Update Candidate"]
            ].map(([index, title, detail]) => (
              <div className="pipeline-step" key={index}>
                <span>{index}</span>
                <div><strong>{title}</strong><small>{detail}</small></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="feed">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Knowledge radar</div>
              <h2 className="section-title">值得知道的变化</h2>
              <p className="section-subtitle">每条内容都明确告诉你：属于哪个 Stage、会走向哪里、是否值得回到课程继续学习。</p>
            </div>
          </Reveal>
          <div className="panel daily-main-panel">
            <Suspense
              fallback={
                <div className="empty-state">
                  <strong>正在读取今日 AI 动态…</strong>
                  <p>页面已打开，内容会在准备好后立即出现。</p>
                </div>
              }
            >
              <DailyFeedContent />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="container cta-band">
          <Reveal>
            <div className="eyebrow">Keep moving</div>
            <h2 className="section-title">不用追完所有 AI 变化<br />先完成下一步</h2>
            <p className="section-subtitle">重要变化交给 OPC 帮你筛选。真正需要做的，是把值得学习的内容变成下一次行动。</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/learning-path#progress">继续学习</Link>
              <Link className="btn btn-secondary" href="/practice">去做一次实操</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
