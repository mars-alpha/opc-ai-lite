import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PracticeSubmissionPanel } from "../../../../components/PracticeSubmissionPanel";
import { LockedAccessCta } from "../../../../components/LockedAccessCta";
import { resolveResourceAccess } from "../../../../lib/server/access/service";
import { getSessionUser, SESSION_COOKIE } from "../../../../lib/server/auth/service";
import { listPublishedDeepResourcesForKnowledge } from "../../../../lib/server/content/deep-resources";
import {
  getPublishedLatestPracticeItemWithFallback,
  getPublishedLatestPracticeMemberItemWithFallback
} from "../../../../lib/server/practices/latest-reader";

export const dynamic = "force-dynamic";

export default async function LatestPracticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);
  const access = await resolveResourceAccess(user?.id ?? null, "LATEST_PRACTICE_DETAIL");
  const item = access.allowed
    ? await getPublishedLatestPracticeMemberItemWithFallback(id)
    : await getPublishedLatestPracticeItemWithFallback(id);
  if (!item) notFound();

  const deepResources = access.allowed
    ? (await listPublishedDeepResourcesForKnowledge(user?.id ?? null, item.id)).items
    : [];

  const courseHref =
    access.allowed && item.courseSlug && item.lessonId
      ? "/courses/" + item.courseSlug + "/lessons/" + item.lessonId
      : null;
  const currentPath = "/practice/latest/" + item.id;
  const loginHref = "/auth?mode=login&returnTo=" + encodeURIComponent(currentPath);

  return (
    <main className="latest-article-page">
      <div className="container latest-article-shell">
        <Link className="back-link" href="/practice#tasks">← 返回 AI 热点能力练习</Link>

        <header className="latest-article-head">
          <div className="eyebrow">{item.stageLabel} · {item.category}</div>
          <h1>{item.title.replace(/^示例：/, "")}</h1>
          <p>{item.summary}</p>
          <div className="course-tags">
            <span>{item.impactLabel}</span>
            <span>{item.readingTime}</span>
            <span>{access.allowed ? "会员内容" : "公开摘要"}</span>
          </div>
        </header>

        {!access.allowed ? (
          <div className="latest-article-layout">
            <article className="latest-article-body">
              <LockedAccessCta kind="MEMBER" loginHref={!user ? loginHref : undefined} />
            </article>
            <aside className="latest-article-aside">
              <div className="kicker">会员内容预览</div>
              <h2>内容已锁定，但价值保持可见</h2>
              <p>关注公众号可解锁基础课程全章节与完整 AI 日报；当前能力练习、实操项目与进阶内容仍按 OPC 会员权益开放。订阅会员后可继续阅读完整内容、使用深度学习资料并提交正式练习。</p>
            </aside>
          </div>
        ) : (
          <div className="latest-article-layout">
            <article className="latest-article-body">
              {(item.body ?? [item.summary]).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {deepResources.length > 0 ? (
                <section className="lesson-related">
                  <div className="kicker">深度学习资料</div>
                  <h2>会员深度资料</h2>
                  <ul>
                    {deepResources.map((resource) => (
                      <li key={resource.id}>
                        <a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a>
                        {resource.summary ? " · " + resource.summary : ""}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </article>

            <aside className="latest-article-aside">
              <div className="kicker">下一步</div>
              <h2>{item.practiceId ? "把知识变成实操" : courseHref ? "继续进入课程" : "继续理解这次变化"}</h2>
              <p>
                {item.practiceId
                  ? "这个知识点已经形成正式能力练习。完成内容阅读后，可以直接进入练习提交与评价。"
                  : courseHref
                    ? "这条最新内容已经有关联课程。会员可以继续进入课程理解完整知识与操作方法。"
                    : "当前没有对应课程或正式能力练习，这篇内容就是主要学习入口。"}
              </p>
              {courseHref ? <Link className="btn btn-secondary full-btn" href={courseHref}>查看课程 →</Link> : null}
              {item.practiceId ? <PracticeSubmissionPanel practiceId={item.practiceId} compact /> : null}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
