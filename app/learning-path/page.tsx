import Link from "next/link";
import { HeroVisual } from "../../components/HeroVisual";
import { PageHero } from "../../components/PageHero";
import { Reveal } from "../../components/Reveal";
import { StageProgress } from "../../components/StageProgress";
import { stageProjects } from "../../lib/stageProjects";
import { courses } from "../../lib/courses";

const progressCatalog = courses.map((course) => ({
  slug: course.slug,
  title: course.title,
  stageLabel: course.stageLabel,
  lessons: course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, summary: lesson.summary }))
  )
}));

const stages = [
  ["01", "AI Literacy", "看懂 AI", "理解 AI 的能力、边界与基本原理"],
  ["02", "AI Worker", "用好 AI", "把 AI 用到真实工作任务中"],
  ["03", "AI Workflow", "建立工作流认知", "把单点使用变成可重复的工作流程"],
  ["04", "AI Growth", "AI 运营与增长", "用 AI 支持内容、运营与增长"],
  ["05", "AI Solution Builder", "做出 AI 解决方案", "围绕真实问题设计并验证解决方案"],
  ["06", "FDE", "真实业务落地", "进入真实业务现场，交付、验证并持续优化"]
];

export default function LearningPathPage() {
  return (
    <>
      <PageHero
        eyebrow="Learning Path"
        title={<>六阶段学习路径</>}
        description="从看懂 AI、用好 AI，到把 AI 应用到真实工作、流程与业务场景。六个阶段逐步建立解决真实问题所需要的能力。"
        actions={<Link className="btn btn-primary" href="#progress">进入我的学习地图</Link>}
        metrics={[
          { value: "6", label: "六个能力阶段" },
          { value: "3", label: "当前已开放阶段" },
          { value: "Practice", label: "实操项目验证学习" }
        ]}
        visual={
          <HeroVisual
            cards={[
              { title: "01", value: "AI Literacy", detail: "看懂 AI · 理解能力与边界" },
              { title: "02", value: "AI Worker", detail: "用好 AI · 完成真实工作任务" },
              { title: "03", value: "AI Workflow", detail: "建立工作流 · 形成可重复流程" }
            ]}
            eyebrow="Better you"
            caption="从会用 AI，到解决真实问题"
          />
        }
      />

      <section className="section compact" id="progress">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Your learning map</div>
              <h2 className="section-title">Stage 总进度</h2>
              <p className="section-subtitle">这里就是你的主学习地图。进入阶段、继续课程、查看完成度，都从这一处完成，不再重复展示相同入口。</p>
            </div>
          </Reveal>
          <StageProgress catalog={progressCatalog} />
        </div>
      </section>

      <section className="section compact" id="projects">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Practice Projects</div>
              <h2 className="section-title">实操项目</h2>
              <p className="section-subtitle">课程学完之后，用一个真实项目把多个知识点组合起来，验证是否真正能用。</p>
            </div>
            <Link className="btn btn-secondary" href="/practice">查看更多</Link>
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

      <section className="section compact">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Learning Path</div>
              <h2 className="section-title">用 AI 解决真实业务问题</h2>
              <p className="section-subtitle">六个阶段从基础认知、真实工作、工作流，到增长、解决方案与业务落地，逐步建立可执行能力。</p>
            </div>
          </Reveal>
          <div className="path-strip">
            {stages.map(([index, en, title, detail], i) => (
              <Reveal className="path-item" key={index} delay={i * 45}>
                <div className="path-index">{index}</div>
                <span className="path-en">{en}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}





