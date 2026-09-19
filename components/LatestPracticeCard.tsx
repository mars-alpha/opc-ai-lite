import Link from "next/link";
import type { KnowledgeItem } from "../lib/contentDemo";

export function LatestPracticeCard({ item }: { item: KnowledgeItem }) {
  const detailHref = "/practice/latest/" + item.id;
  const courseHref =
    item.courseSlug && item.lessonId
      ? "/courses/" + item.courseSlug + "/lessons/" + item.lessonId
      : null;

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
          <small>来源：AI 日报 · {item.readingTime}</small>
        </div>
      </Link>
      <div className="latest-practice-card-action">
        {courseHref ? (
          <Link className="btn btn-secondary" href={courseHref}>查看课程</Link>
        ) : (
          <Link className="btn btn-secondary" href={detailHref}>查看文稿</Link>
        )}
      </div>
    </article>
  );
}
