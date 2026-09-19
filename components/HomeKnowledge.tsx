import Link from "next/link";
import { destinationLabel, knowledgeItems } from "../lib/contentDemo";
import { stageProjects } from "../lib/stageProjects";

export function HomeKnowledge() {
  const knowledge = knowledgeItems[0];
  const project = stageProjects[0];

  return (
    <div className="home-focus-grid">
      <Link className="home-focus-card" href="/ai-daily">
        <div className="focus-topline"><span>今日值得知道</span><small>界面示例</small></div>
        <h3>{knowledge.title}</h3>
        <p>{knowledge.summary}</p>
        <div className="focus-footer">
          <span>{knowledge.stageLabel}</span>
          <strong>{destinationLabel[knowledge.destination]} →</strong>
        </div>
      </Link>

      <Link className="home-focus-card project-focus" href={"/projects/" + project.slug}>
        <div className="focus-topline"><span>当前阶段项目</span><small>{project.stages}</small></div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="focus-footer">
          <span>{project.duration}</span>
          <strong>查看项目 →</strong>
        </div>
      </Link>
    </div>
  );
}

