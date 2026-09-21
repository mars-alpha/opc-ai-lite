import Link from "next/link";
import { FoundationCatalog } from "../../components/FoundationCatalog";
import { LearningBlockProgress } from "../../components/LearningBlockProgress";
import { HeroVisual } from "../../components/HeroVisual";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { stageProjects } from "../../lib/stageProjects";

const stages = [
  ["01", "AI Foundation", "AI 基础认知", "真正看懂 AI、模型、Prompt、RAG、Tool、Agent 与现代 AI 能力边界"],
  ["02", "AI Work", "AI 工作应用", "把 AI 用进研究、写作、文件、数据、知识和重复工作"],
  ["03", "AI Growth", "AI 推广运营与业务增长", "把 AI 放进内容、获客、销售、客服与运营流程"],
  ["04", "AI Workflow", "AI Workflow 与自动化", "设计可控、可重复、可评估的 AI 工作系统"],
  ["05", "FDE", "FDE / AI 解决方案落地", "从真实业务问题出发，完成发现、设计、试点、评估与落地"]
];

export default function LearningPathPage() {
  return (
    <>
      <PageHero
        eyebrow="Learning Path"
        title={<>从看懂 AI，到把 AI 用进真实业务</>}
        description="OPC 的学习主线分成五大板块。AI 基础认知已经按 6 个学习阶段、20 节核心课程重新对齐；当前 Phase 1 的前 5 节已经开放体验，后续按批次推进。"
        actions={<Link className="btn btn-primary" href="#foundation-catalog">查看基础课程目录</Link>}
        metrics={[
          { value: "5", label: "五大长期学习板块" },
          { value: "6", label: "基础认知学习阶段" },
          { value: "20", label: "基础核心课程" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "FOUNDATION", value: "6 个阶段", detail: "先协作，再理解机制与系统" },
              { title: "CATALOG", value: "20 节", detail: "核心目录完整 · 内容分批开放" },
              { title: "PATH", value: "5 大板块", detail: "工作 → 业务 → Workflow → FDE" }
            ]}
            eyebrow="OPC Learning"
            caption="完整路径，分批开放"
          />
        }
      />

      <section className="section compact" id="foundation-catalog">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Learning Map</div>
              <h2 className="section-title">学习地图</h2>
              <p className="section-subtitle">五大长期学习板块按能力递进排列。当前先完成 AI 基础认知，其他板块会随着正式课程建设逐步开放。</p>
            </div>
          </Reveal>

          <nav className="learning-block-nav" aria-label="五大长期学习板块">
            {stages.map(([index, en, title, detail], i) => (
              <div className={"learning-block-nav-item " + (i === 0 ? "is-active" : "is-coming")} key={index}>
                <div className="learning-block-nav-index">{index}</div>
                <div className="learning-block-nav-copy">
                  <small>{en}</small>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
                <em>{i === 0 ? "当前" : "后续开放"}</em>
              </div>
            ))}
          </nav>

          <Reveal className="section-head foundation-catalog-heading">
            <div>
              <div className="eyebrow">AI Foundation</div>
              <h2 className="section-title">AI 基础认知</h2>
              <p className="section-subtitle">先把最常用的 AI 协作方法练会，再逐步理解模型、知识、工具与现代 AI 能力。已开放课程可以直接进入学习，未开放课程不会进入空页面。</p>
            </div>
            <div className="foundation-catalog-summary">
              <strong>6</strong><span>学习阶段</span>
              <strong>20</strong><span>核心课程</span>
            </div>
          </Reveal>

          <div className="foundation-learning-layout">
            <LearningBlockProgress />
            <FoundationCatalog />
          </div>
        </div>
      </section>

      <section className="section compact" id="projects">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Practice Projects</div>
              <h2 className="section-title">实操项目</h2>
              <p className="section-subtitle">课程学完之后，用真实项目把多个知识点组合起来，验证是否真正能用。</p>
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
    </>
  );
}
