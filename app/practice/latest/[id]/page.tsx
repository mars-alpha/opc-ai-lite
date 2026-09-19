import Link from "next/link";
import { notFound } from "next/navigation";
import { knowledgeItems } from "../../../../lib/contentDemo";

export function generateStaticParams() {
  return knowledgeItems.map((item) => ({ id: item.id }));
}

export default async function LatestPracticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = knowledgeItems.find((entry) => entry.id === id);
  if (!item) notFound();

  const courseHref =
    item.courseSlug && item.lessonId
      ? "/courses/" + item.courseSlug + "/lessons/" + item.lessonId
      : null;

  return (
    <main className="latest-article-page">
      <div className="container latest-article-shell">
        <Link className="back-link" href="/practice/latest">← 返回最新技术实操</Link>

        <header className="latest-article-head">
          <div className="eyebrow">{item.stageLabel} · {item.category}</div>
          <h1>{item.title.replace(/^示例：/, "")}</h1>
          <p>{item.summary}</p>
          <div className="course-tags">
            <span>{item.impactLabel}</span>
            <span>{item.readingTime}</span>
            <span>来源：AI Daily</span>
          </div>
        </header>

        <div className="latest-article-layout">
          <article className="latest-article-body">
            {(item.body ?? [item.summary]).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>

          <aside className="latest-article-aside">
            <div className="kicker">Next step</div>
            <h2>{courseHref ? "继续进入课程" : "继续理解这次变化"}</h2>
            <p>
              {courseHref
                ? "这条最新内容已经有关联课程。先读完文稿，再进入课程理解完整知识与操作方法。"
                : "当前没有对应课程，因此这篇独立文稿就是主要学习入口。后续如形成正式课程，会从这里建立关联。"}
            </p>
            {courseHref ? <Link className="btn btn-primary full-btn" href={courseHref}>查看课程 →</Link> : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
