import Link from "next/link";
import { HeroVisual } from "../../components/HeroVisual";
import { HotspotPracticeList } from "../../components/HotspotPracticeList";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { listPublishedLatestPracticeItemsWithFallback } from "../../lib/server/practices/latest-reader";
import { stageProjects } from "../../lib/stageProjects";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const latestPractice = await listPublishedLatestPracticeItemsWithFallback();

  return (
    <>
      <PageHero
        eyebrow="Practice · Verify · Grow"
        title={<>把知识<br /><span className="accent">练成能力</span></>}
        description="从 AI 日报与热点知识中提炼单项能力练习，再通过实操项目把多个能力组合起来，形成真实成果。"
        actions={
          <>
            <Link className="btn btn-primary" href="#tasks">开始能力练习</Link>
            <Link className="btn btn-secondary" href="#projects">查看实操项目</Link>
          </>
        }
        metrics={[
          { value: "单项能力", label: "一次只练一个明确能力" },
          { value: "四项判断", label: "判断问题是否真实、值不值得、AI 是否适合、如何验证" },
          { value: "日报转练习", label: "从热点知识提炼可练习的单项能力" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "能力练习", value: "单项能力", detail: "从一个完整知识点出发，只练一个明确能力。" },
              { title: "验收标准", value: "明确验收", detail: "不是做过就算完成，要知道什么叫真正掌握。" },
              { title: "实操项目", value: "综合实操", detail: "把多个能力组合进真实项目，形成可交付结果。" }
            ]}
            eyebrow="Make it real"
            caption="用真实结果验证学习"
          />
        }
      />

      <section className="section" id="projects">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Practice Projects</div>
              <h2 className="section-title">实操项目</h2>
              <p className="section-subtitle">把多个已经练过的能力组合到真实项目中，完成更完整的任务、交付与验证。</p>
            </div>
            <Link className="btn btn-secondary" href="/projects">查看更多</Link>
          </Reveal>

          <div className="project-link-grid">
            {stageProjects.map((project) => (
              <Link className="project-link-card" key={project.slug} href={"/projects/" + project.slug}>
                <div>
                  <span>{project.stages}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>
                <strong>→</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="tasks">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">AI 日报 · 热点知识 · 单项能力</div>
              <h2 className="section-title">AI 热点能力练习</h2>
              <p className="section-subtitle">从 AI 日报与热点采集中发现值得掌握的新变化，先整理成相对完整的知识点，再拆成一次只练一个明确能力的练习。具体生成、筛选与更新流程后续继续完善。</p>
            </div>
          </Reveal>

          <HotspotPracticeList items={latestPractice} />
        </div>
      </section>
    </>
  );
}
