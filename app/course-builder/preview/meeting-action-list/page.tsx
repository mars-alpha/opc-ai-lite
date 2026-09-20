import Link from "next/link";
import { GenericLessonRuntimePanel } from "../../../../components/GenericLessonRuntimePanel";
import { buildLessonRuntimePlan } from "../../../../lib/learning/lesson-runtime";
import { createCourseBuilderReviewPacket } from "../../../../lib/learning/course-builder";
import type { Lesson } from "../../../../lib/courses";
import {
  meetingActionListBuildDraft,
  meetingActionListIntroPreview,
  meetingActionListKnowledgeDepth,
  meetingActionListReferenceFill
} from "../../../../fixtures/course-builder/meeting-action-list";

export const dynamic = "force-static";

export default function MeetingActionListDraftPreviewPage() {
  const packet = createCourseBuilderReviewPacket(meetingActionListBuildDraft);
  if (packet.output.mode !== "BUILD") throw new Error("COURSE_BUILDER_PREVIEW_BUILD_REQUIRED");
  const draft = packet.output;
  const plan = buildLessonRuntimePlan(draft.lessonSpec);

  const lesson: Lesson = {
    id: draft.lessonSpec.lessonId,
    title: draft.lessonSpec.title,
    duration: "约 15 分钟",
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
          <div className="kicker">Course Builder · PRACTICE Review</div>
          <h2>实操课草稿预览</h2>
          <div className="draft-preview-status">
            <span>状态</span>
            <strong>PENDING REVIEW</strong>
            <p>这是 PRACTICE 验收样本，不是正式课程。</p>
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
              <strong>这次重点验证“实操课”是不是真的以做为主</strong>
              <p>说明要短，练习要真，失败后要有逐层帮助，但不能用参考答案自动过关。</p>
            </div>
            <span>PRACTICE</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · PRACTICE · DRAFT</div>
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
            previewCheck={meetingActionListBuildDraft.check}
            previewPractice={meetingActionListBuildDraft.practice}
            previewReferenceAnswer={meetingActionListBuildDraft.referenceAnswer}
            previewReferenceFill={meetingActionListReferenceFill}
            previewKnowledgeDepth={meetingActionListKnowledgeDepth}
            previewActivity={meetingActionListBuildDraft.pedagogy.participation}
            previewIntroComparison={meetingActionListIntroPreview}
          />

          <div className="draft-human-review-card">
            <div className="kicker">Human Review</div>
            <h2>体验后重点判断 4 件事</h2>
            <ol>
              <li>前两步是否足够短，没有抢掉实操的主角位置？</li>
              <li>第 4 步是否真的像在完成一个工作任务，而不是填教学表格？</li>
              <li>本地检查、Hint、参考答案是否能帮助卡住的人继续完成？</li>
              <li>完成以后是否感觉自己真的会把会议讨论变成行动清单？</li>
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}
