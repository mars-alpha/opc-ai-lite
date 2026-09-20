import Link from "next/link";
import { GenericLessonRuntimePanel } from "../../../../components/GenericLessonRuntimePanel";
import { buildLessonRuntimePlan } from "../../../../lib/learning/lesson-runtime";
import { createCourseBuilderReviewPacket } from "../../../../lib/learning/course-builder";
import type { Lesson } from "../../../../lib/courses";
import {
  skillFoundationsBuildDraft,
  skillFoundationsIntroPreview
} from "../../../../fixtures/course-builder/skill-foundations";

export const dynamic = "force-static";

export default function SkillFoundationsDraftPreviewPage() {
  const packet = createCourseBuilderReviewPacket(skillFoundationsBuildDraft);
  if (packet.output.mode !== "BUILD") {
    throw new Error("COURSE_BUILDER_PREVIEW_BUILD_REQUIRED");
  }
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
    example: {
      title: draft.content.example.title,
      situation: draft.content.example.situation,
      before: draft.content.example.before,
      after: draft.content.example.after,
      result: draft.content.example.result
    },
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
          <div className="kicker">Course Builder · Human Review</div>
          <h2>课程草稿预览</h2>
          <div className="draft-preview-status">
            <span>状态</span>
            <strong>PENDING REVIEW</strong>
            <p>这不是正式课程。你现在看到的是 Course Builder 生成后的真实 Draft。</p>
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
            <span>Draft Preview · 不保存任何学习状态</span>
          </div>

          <div className="draft-review-banner">
            <div>
              <strong>请像普通学员一样体验这节课</strong>
              <p>你只需要判断：看不看得懂、内容顺不顺、是不是 OPC 想要的课程风格。</p>
            </div>
            <span>只读预览</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · {plan.lessonType} · DRAFT</div>
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
            previewCheck={skillFoundationsBuildDraft.check}
            previewActivity={skillFoundationsBuildDraft.pedagogy.participation}
            previewIntroComparison={skillFoundationsIntroPreview}
          />

          <div className="draft-human-review-card">
            <div className="kicker">Human Review</div>
            <h2>体验完成后，只需要回答 4 个问题</h2>
            <ol>
              <li>这节课你能不能看懂？</li>
              <li>有没有哪一步太长、太技术化或重复？</li>
              <li>动手复制到自己的 AI 软件、案例和理解检查，有没有让你真正理解“技能”？</li>
              <li>如果这是正式课程，你愿不愿意继续下一课？</li>
            </ol>
            <p>你的反馈不会在这个页面自动保存。直接回到这里告诉我哪里需要改即可。</p>
          </div>
        </article>
      </div>
    </section>
  );
}
