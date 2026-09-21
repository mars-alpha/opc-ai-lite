import Link from "next/link";
import type { ComponentProps } from "react";
import { GenericLessonRuntimePanel } from "./GenericLessonRuntimePanel";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import type { Lesson } from "../lib/courses";

type RuntimeProps = ComponentProps<typeof GenericLessonRuntimePanel>;

export function BeginnerFoundationDraftPreview({
  buildDraft,
  introPreview,
  referenceFill = null,
  knowledgeDepth = null,
  reviewCardFill = true,
  skillVersion = "0.1.0",
  batchLabel = "Beginner Batch A",
  duration,
  reviewItems
}: {
  buildDraft: Parameters<typeof createCourseBuilderReviewPacket>[0];
  introPreview: NonNullable<RuntimeProps["previewIntroComparison"]>;
  referenceFill?: RuntimeProps["previewReferenceFill"];
  knowledgeDepth?: RuntimeProps["previewKnowledgeDepth"];
  reviewCardFill?: boolean;
  skillVersion?: "0.1.0" | "0.2.0";
  batchLabel?: string;
  duration: string;
  reviewItems: string[];
}) {
  const packet = createCourseBuilderReviewPacket(buildDraft, new Date(), skillVersion);
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

  const isApplication = draft.lessonSpec.lessonType === "APPLICATION";

  return (
    <section className="lesson-page">
      <div className="container lesson-shell guided-learning-shell draft-preview-shell">
        <aside className="lesson-sidebar draft-preview-sidebar">
          <Link className="lesson-logo" href="/learning-path#foundation-catalog">
            <img src="/opc-logo.png" alt="OPC AI" />
            <span>OPC AI</span>
          </Link>
          <div className="kicker">{batchLabel} · {draft.lessonSpec.lessonType} Review</div>
          <h2>零基础课程草稿预览</h2>
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
              <strong>这次只判断：一个第一次接触 AI 的人能不能自然学下去</strong>
              <p>{isApplication ? "先看懂真实场景，再亲手完成一个很小的任务。" : "先从生活场景建立直觉，不要求先背技术定义。"}</p>
            </div>
            <span>{draft.lessonSpec.lessonType}</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 零基础 AI 课 · FOUNDATION · DRAFT</div>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="guided-lesson-outcome">
              <span>学完以后，你可以</span>
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
            previewPractice={draft.practice}
            previewReferenceAnswer={draft.referenceAnswer}
            previewReferenceFill={referenceFill}
            previewKnowledgeDepth={knowledgeDepth}
            previewReviewCardFill={reviewCardFill}
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
