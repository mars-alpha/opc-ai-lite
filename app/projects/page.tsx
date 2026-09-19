import Link from "next/link";
import { HeroVisual } from "../../components/HeroVisual";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { stageProjects } from "../../lib/stageProjects";

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Practice Projects"
        title={<>全部实操项目</>}
        description="这里集中展示学习路径中的综合实操项目。每个项目都对应明确阶段、交付要求与验收标准，用来把多个知识点真正组合起来。"
        actions={<Link className="btn btn-secondary" href="/learning-path#projects">返回学习路径</Link>}
        metrics={[
          { value: String(stageProjects.length), label: "当前实操项目" },
          { value: "Stage 1–6", label: "覆盖完整学习路径" },
          { value: "Deliverable", label: "以真实交付结果验收" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "Stage 1–2", value: "知识助手", detail: "把资料、检索与问答做成真实项目。" },
              { title: "Stage 3–4", value: "内容工作流", detail: "把单点使用升级为可重复流程。" },
              { title: "Stage 5–6", value: "解决方案", detail: "围绕业务问题完成方案与验证。" }
            ]}
            eyebrow="Project based learning"
            caption="从知识点走向真实交付"
          />
        }
      />

      <section className="section compact">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">All projects</div>
              <h2 className="section-title">选择一个项目继续</h2>
              <p className="section-subtitle">项目不是进阶练习的替代入口，而是学习路径中的独立综合应用层。</p>
            </div>
          </Reveal>

          <div className="project-link-grid project-index-grid">
            {stageProjects.map((project) => (
              <Link className="project-link-card project-index-card" key={project.slug} href={"/projects/" + project.slug}>
                <div>
                  <span>{project.stages} · {project.difficulty}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <small>{project.stageRange} · {project.duration}</small>
                </div>
                <strong>查看项目 →</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
