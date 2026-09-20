import Link from "next/link";
import { GenericLessonRuntimePanel } from "../../../../components/GenericLessonRuntimePanel";
import { buildLessonRuntimePlan } from "../../../../lib/learning/lesson-runtime";
import { createCourseBuilderReviewPacket } from "../../../../lib/learning/course-builder";
import type { Lesson } from "../../../../lib/courses";
import {
  aiWorkflowProjectBuildDraft,
  aiWorkflowProjectIntroPreview,
  aiWorkflowProjectKnowledgeDepth,
  aiWorkflowProjectReferenceFill
} from "../../../../fixtures/course-builder/ai-workflow-project";

export const dynamic = "force-static";

export default function AiWorkflowProjectDraftPreviewPage() {
  const packet = createCourseBuilderReviewPacket(aiWorkflowProjectBuildDraft);
  if (packet.output.mode !== "BUILD") throw new Error("COURSE_BUILDER_PREVIEW_BUILD_REQUIRED");
  const draft = packet.output;
  const plan = buildLessonRuntimePlan(draft.lessonSpec);

  const lesson: Lesson = {
    id: draft.lessonSpec.lessonId,
    title: draft.lessonSpec.title,
    duration: "约 20 分钟",
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
          <div className="kicker">Course Builder · PROJECT Review</div>
          <h2>项目课草稿预览</h2>
          <div className="draft-preview-status">
            <span>状态</span>
            <strong>PENDING REVIEW</strong>
            <p>项目草稿可体验；正式 Deliverable Runtime 尚未接入。</p>
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
            <span>PROJECT Draft · 不保存正式交付状态</span>
          </div>

          <div className="draft-review-banner">
            <div>
              <strong>这次验证“项目课”能不能让用户完成一个完整方案</strong>
              <p>项目草稿会被本地检查，但 Draft PASS 不等于正式 Deliverable Completion。</p>
            </div>
            <span>PROJECT</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · PROJECT · DRAFT</div>
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
            previewCheck={aiWorkflowProjectBuildDraft.check}
            previewPractice={aiWorkflowProjectBuildDraft.practice}
            previewReferenceAnswer={aiWorkflowProjectBuildDraft.referenceAnswer}
            previewReferenceFill={aiWorkflowProjectReferenceFill}
            previewKnowledgeDepth={aiWorkflowProjectKnowledgeDepth}
            previewActivity={aiWorkflowProjectBuildDraft.pedagogy.participation}
            previewIntroComparison={aiWorkflowProjectIntroPreview}
          />

          <div className="draft-human-review-card">
            <div className="kicker">Human Review</div>
            <h2>体验后重点判断 4 件事</h2>
            <ol>
              <li>是否明显感觉这是一个“小项目”，而不是把 PRACTICE 拉长？</li>
              <li>第 4 步五个部分是否能共同形成一份完整工作流方案？</li>
              <li>参考项目能否帮助卡住的人理解结构，同时又不会自动完成正式项目？</li>
              <li>最后是否感觉自己已经能独立设计一个最小 AI 工作流？</li>
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}
