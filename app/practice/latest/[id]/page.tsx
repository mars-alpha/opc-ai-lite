import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticeSubmissionPanel } from "../../../../components/PracticeSubmissionPanel";
import { getPublishedLatestPracticeItemWithFallback } from "../../../../lib/server/practices/latest-reader";

export const dynamic = "force-dynamic";

export default async function LatestPracticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getPublishedLatestPracticeItemWithFallback(id);
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
            <span>来源：Knowledge</span>
          </div>
        </header>

        <div className="latest-article-layout">
          <article className="latest-article-body">
            {(item.body ?? [item.summary]).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>

          <aside className="latest-article-aside">
            <div className="kicker">Next step</div>
            <h2>{item.practiceId ? "把知识变成实操" : courseHref ? "继续进入课程" : "继续理解这次变化"}</h2>
            <p>
              {item.practiceId
                ? "这条 Knowledge 已经形成正式 Latest Practice。完成文稿阅读后，可以直接进入提交与评价。"
                : courseHref
                  ? "这条最新内容已经有关联课程。先读完文稿，再进入课程理解完整知识与操作方法。"
                  : "当前没有对应课程或正式 Practice，因此这篇独立文稿就是主要学习入口。"}
            </p>
            {courseHref ? <Link className="btn btn-secondary full-btn" href={courseHref}>查看课程 →</Link> : null}
            {item.practiceId ? <PracticeSubmissionPanel practiceId={item.practiceId} compact /> : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
