import Link from "next/link";
import type { KnowledgeItem } from "../lib/contentDemo";

export function LatestPracticeCard({ item }: { item: KnowledgeItem }) {
  const detailHref = "/practice/latest/" + item.id;

  return (
    <article className="latest-practice-card latest-practice-card-linked">
      <Link className="latest-practice-card-main" href={detailHref}>
        <div>
          <span>{item.stageLabel} · {item.category}</span>
          <h3>{item.title.replace(/^示例：/, "")}</h3>
          <p>{item.summary}</p>
        </div>
        <div className="latest-practice-meta">
          <strong>{item.impactLabel}</strong>
          <small>公开卡片 · {item.readingTime}</small>
        </div>
      </Link>
      <div className="latest-practice-card-action">
        <Link className="btn btn-secondary" href={detailHref}>查看详情</Link>
      </div>
    </article>
  );
}
