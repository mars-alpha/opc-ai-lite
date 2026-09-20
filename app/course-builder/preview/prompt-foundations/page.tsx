import Link from "next/link";
import { GenericLessonRuntimePanel } from "../../../../components/GenericLessonRuntimePanel";
import { buildLessonRuntimePlan } from "../../../../lib/learning/lesson-runtime";
import { createCourseBuilderReviewPacket } from "../../../../lib/learning/course-builder";
import type { Lesson } from "../../../../lib/courses";
import {
  promptFoundationsBuildDraft,
  promptFoundationsIntroPreview,
  promptFoundationsKnowledgeDepth,
  promptFoundationsReferenceFill
} from "../../../../fixtures/course-builder/prompt-foundations";

export const dynamic = "force-static";

export default function PromptFoundationsDraftPreviewPage() {
  const packet = createCourseBuilderReviewPacket(promptFoundationsBuildDraft);
  if (packet.output.mode !== "BUILD") throw new Error("COURSE_BUILDER_PREVIEW_BUILD_REQUIRED");
  const draft = packet.output;
  const plan = buildLessonRuntimePlan(draft.lessonSpec);

  const lesson: Lesson = {
    id: draft.lessonSpec.lessonId,
    title: draft.lessonSpec.title,
    duration: "约 18 分钟",
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
          <Link className="lesson-logo" href="/learning-path#progress">
            <img src="/opc-logo.png" alt="OPC AI" />
            <span>OPC AI</span>
          </Link>
          <div className="kicker">Course Builder · APPLICATION Review</div>
          <h2>应用课草稿预览</h2>
          <div className="draft-preview-status">
            <span>状态</span>
            <strong>PENDING REVIEW</strong>
            <p>这是 APPLICATION 验收样本，不是正式课程。</p>
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
            <Link className="back-link" href="/learning-path#progress">← 返回学习路径</Link>
            <span>Draft Preview · 不保存正式学习状态</span>
          </div>

          <div className="draft-review-banner">
            <div>
              <strong>这次重点体验“应用课”是不是真的让你做会一件事</strong>
              <p>不是看懂概念就结束，而是要完成一次提示词改写、检查并实际测试。</p>
            </div>
            <span>APPLICATION</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · APPLICATION · DRAFT</div>
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
            previewCheckSequence={promptFoundationsBuildDraft.checkSequence}
            previewPractice={promptFoundationsBuildDraft.practice}
            previewReferenceAnswer={promptFoundationsBuildDraft.referenceAnswer}
            previewReferenceFill={promptFoundationsReferenceFill}
            previewKnowledgeDepth={promptFoundationsKnowledgeDepth}
            previewReviewCardFill
            previewActivity={promptFoundationsBuildDraft.pedagogy.participation}
            previewIntroComparison={promptFoundationsIntroPreview}
          />

          <div className="draft-human-review-card">
            <div className="kicker">Human Review</div>
            <h2>体验后重点判断 4 件事</h2>
            <ol>
              <li>第一步是不是一眼就能理解“为什么提示会失败”？</li>
              <li>练习是不是够简单，但又真的需要你动手？</li>
              <li>把自己写的提示词复制到 AI 软件后，是否能感受到结果变化？</li>
              <li>完成后有没有“我现在真的会改提示词了”的获得感？</li>
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}
