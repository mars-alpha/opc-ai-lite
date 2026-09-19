import Link from "next/link";
import { notFound } from "next/navigation";
import { getStageProject, stageProjects } from "../../../lib/stageProjects";
import { PracticeSubmissionPanel } from "../../../components/PracticeSubmissionPanel";

export function generateStaticParams() {
  return stageProjects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getStageProject(slug);
  if (!project) notFound();

  return (
    <section className="project-page">
      <div className="container project-hero-grid">
        <div>
          <Link className="back-link" href="/learning-path">← 返回学习路径</Link>
          <div className="course-brand-lockup"><img src="/opc-logo.png" alt="OPC AI" /><span>{project.stages} · Stage Project</span></div>
          <h1>{project.title}</h1>
          <p className="project-lead">{project.summary}</p>
          <div className="course-tags"><span>{project.stageRange}</span><span>{project.difficulty}</span><span>{project.duration}</span></div>
        </div>
        <aside className="project-goal-card">
          <div className="kicker">Project goal</div>
          <h2>项目目标</h2>
          <p>{project.goal}</p>
          <a className="btn btn-primary full-btn" href="#deliverables">查看交付要求 ↓</a>
        </aside>
      </div>

      {project.practiceId ? (
        <div className="container">
          <PracticeSubmissionPanel practiceId={project.practiceId} />
        </div>
      ) : null}
      <div className="container project-detail-grid" id="deliverables">
        <section className="project-section-card">
          <div className="kicker">Deliverables</div>
          <h2>你需要交付</h2>
          <div className="project-check-list">
            {project.deliverables.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
          </div>
        </section>
        <section className="project-section-card">
          <div className="kicker">Acceptance</div>
          <h2>验收标准</h2>
          <div className="project-check-list acceptance">
            {project.acceptance.map((item, index) => <div key={item}><span>✓</span><p>{item}</p></div>)}
          </div>
        </section>
      </div>
    </section>
  );
}



