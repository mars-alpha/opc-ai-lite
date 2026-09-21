import Link from "next/link";
import type { ComponentProps } from "react";
import { GenericLessonRuntimePanel } from "./GenericLessonRuntimePanel";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import type { Lesson } from "../lib/courses";

type RuntimeProps = ComponentProps<typeof GenericLessonRuntimePanel>;

export function FoundationConceptDraftPreview({
  buildDraft,
  introPreview,
  duration,
  reviewItems
}: {
  buildDraft: Parameters<typeof createCourseBuilderReviewPacket>[0];
  introPreview: NonNullable<RuntimeProps["previewIntroComparison"]>;
  duration: string;
  reviewItems: string[];
}) {
  const packet = createCourseBuilderReviewPacket(buildDraft);
  if (packet.output.mode !== "BUILD") throw new Error("COURSE_BUILDER_PREVIEW_BUILD_REQUIRED");
  const draft = packet.output;
  const plan = buildLessonRuntimePlan(draft.lessonSpec);
  const lesson: Lesson = {
    id: draft.lessonSpec.lessonId,
    title: draft.lessonSpec.title,
    duration,
    summary: draft.content.summary,
    plainExplanation: draft.content.plainExplanation,
    whyItMatters: draft.content.whyItMatters,
    points: [...draft.content.points],
    content: [...draft.content.content],
    example: { ...draft.content.example },
    guides: [],
    practice: { goal: "", steps: [], acceptance: [] },
    mistakes: [...draft.content.mistakes],
    related: [...draft.content.related]
  };

  return (
    <section className="lesson-page">
      <div className="container lesson-shell guided-learning-shell draft-preview-shell">
        <aside className="lesson-sidebar draft-preview-sidebar">
          <Link className="lesson-logo" href="/learning-path#foundation-catalog">
            <img src="/opc-logo.png" alt="OPC AI" />
            <span>OPC AI</span>
          </Link>
          <div className="kicker">Foundation Batch A · CONCEPT Review</div>
          <h2>基础概念课草稿预览</h2>
          <div className="draft-preview-status">
            <span>状态</span>
            <strong>PENDING REVIEW</strong>
            <p>这是正式课程候选 Draft，不保存正式学习状态。</p>
          </div>
          <div className="lesson-side-list">
            {plan.steps.map((step, index) => (
              <div key={step.id} className={index === 0 ? "active" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.title}
              </div>
            ))}
          </div>
        </aside>

        <article className="lesson-content lesson-content-guided">
          <div className="lesson-topbar">
            <Link className="back-link" href="/learning-path#foundation-catalog">← 返回学习地图</Link>
            <span>Draft Preview · 不保存正式学习状态</span>
          </div>

          <div className="draft-review-banner">
            <div>
              <strong>这次重点判断：概念是不是真的讲明白，而不是讲得多</strong>
              <p>前三步负责理解，第四步只用轻量参与巩固，不增加新的 Completion Gate。</p>
            </div>
            <span>CONCEPT</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · FOUNDATION · DRAFT</div>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="guided-lesson-outcome">
              <span>完成后你会获得</span>
              <strong>{plan.capabilityGain[0]}</strong>
            </div>
          </div>

          <GenericLessonRuntimePanel
            courseSlug={draft.lessonSpec.courseSlug}
            lessonSlug={draft.lessonSpec.lessonId}
            plan={plan}
            lesson={lesson}
            previewMode
            previewCheckSequence={draft.checkSequence}
            previewActivity={draft.pedagogy.participation}
            previewIntroComparison={introPreview}
          />

          <div className="draft-human-review-card">
            <div className="kicker">Human Review</div>
            <h2>体验后重点判断</h2>
            <ol>{reviewItems.map((item) => <li key={item}>{item}</li>)}</ol>
          </div>
        </article>
      </div>
    </section>
  );
}
