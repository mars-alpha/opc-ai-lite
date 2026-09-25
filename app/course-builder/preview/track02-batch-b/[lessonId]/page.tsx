import Link from "next/link";
import { notFound } from "next/navigation";
import { GenericLessonRuntimePanel } from "../../../../../components/GenericLessonRuntimePanel";
import { buildLessonRuntimePlan } from "../../../../../lib/learning/lesson-runtime";
import { track02BatchBRuntimeDefinitions, getTrack02BatchBRuntimePresentation } from "../../../../../lib/learning/track02-batch-b-runtime";
import { track02BatchBDrafts } from "../../../../../fixtures/course-builder/track02-batch-b";

export const dynamic = "force-static";

export function generateStaticParams() {
  return track02BatchBRuntimeDefinitions.map(({ lesson }) => ({ lessonId: lesson.id }));
}

export default async function Track02BatchBReviewPage({
  params
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const definition = track02BatchBRuntimeDefinitions.find(({ lesson }) => lesson.id === lessonId);
  const draft = track02BatchBDrafts.find((item) => item.lessonSpec.lessonId === lessonId);
  const presentation = getTrack02BatchBRuntimePresentation("ai-work", lessonId);
  if (!definition || !draft || !presentation) notFound();
  const { lesson, spec } = definition;
  const plan = buildLessonRuntimePlan(spec);

  return (
    <section className="lesson-page">
      <div className="container lesson-shell guided-learning-shell draft-preview-shell">
        <aside className="lesson-sidebar draft-preview-sidebar">
          <Link className="lesson-logo" href="/learning-path?track=ai-work#foundation-catalog">
            <img src="/opc-logo.png" alt="OPC AI" />
            <span>OPC AI</span>
          </Link>
          <div className="kicker">Course Builder · APPLICATION Review</div>
          <h2>第 2 板块课程审阅</h2>
          <div className="draft-preview-status">
            <span>状态</span>
            <strong>PENDING REVIEW</strong>
            <p>课程内容与交互供检查；不保存正式学习进度。</p>
          </div>
          <div className="lesson-side-list">
            {track02BatchBRuntimeDefinitions.map(({ canonicalId, lesson: item }) => (
              <Link key={item.id} className={item.id === lessonId ? "active" : ""} href={"/course-builder/preview/track02-batch-b/" + item.id}>
                <span>{canonicalId.replace("T2-", "")}</span>{item.title}
              </Link>
            ))}
          </div>
        </aside>
        <article className="lesson-content lesson-content-guided">
          <div className="lesson-topbar">
            <Link className="back-link" href="/learning-path?track=ai-work#foundation-catalog">← 返回学习地图</Link>
            <span>Draft Preview · 不保存正式学习状态</span>
          </div>
          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · APPLICATION · DRAFT</div>
            <h1>{lesson.title}</h1>
            <p>{lesson.whyItMatters || lesson.summary}</p>
            <div className="guided-lesson-outcome">
              <span>完成后你会获得</span>
              <strong>{plan.capabilityGain[0]}</strong>
            </div>
            {spec.learningRecommendation ? (
              <div className="guided-runtime-read-note">
                <span>学习建议：{spec.learningRecommendation}</span>
              </div>
            ) : null}
          </div>
          <GenericLessonRuntimePanel
            courseSlug={spec.courseSlug}
            lessonSlug={lesson.id}
            plan={plan}
            lesson={lesson}
            previewMode
            previewCheckSequence={draft.checkSequence}
            previewPractice={draft.practice}
            previewReferenceAnswer={presentation.referenceAnswer}
            previewReferenceFill={presentation.referenceFill}
            previewKnowledgeDepth={presentation.knowledgeDepth}
            previewReviewCardFill={presentation.reviewCardFill}
            previewReviewItems={presentation.reviewItems}
            previewReviewLabels={presentation.reviewLabels}
            previewPracticeHintsGrouped={presentation.practiceHintsGrouped}
            previewPracticeCopyValuesOnly={presentation.practiceCopyValuesOnly}
            previewSelfAssessment={presentation.selfAssessment}
            previewActivity={presentation.activity}
            previewIntroComparison={presentation.introComparison}
          />
        </article>
      </div>
    </section>
  );
}
