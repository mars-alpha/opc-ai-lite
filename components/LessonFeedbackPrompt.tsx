"use client";

import { useState } from "react";

const options = [
  "有些地方没讲清楚",
  "专业术语还是偏多",
  "案例不够贴近实际",
  "操作步骤不够明确",
  "提示还不够",
  "通过标准不够直观",
  "练习难度不合适",
  "内容太长",
  "我还是不知道实际工作中怎么用"
] as const;

export function LessonFeedbackPrompt({
  courseSlug,
  lessonSlug,
  authenticated
}: {
  courseSlug: string;
  lessonSlug: string;
  authenticated: boolean;
}) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"submitted" | "skipped" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function toggleReason(reason: string) {
    setReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  }

  async function submitFeedback() {
    if (!authenticated) {
      setMessage("登录后才能把反馈保存给课程团队。你也可以直接跳过，不影响学习进度。");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/learning/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          issueType: "LESSON_HELPFULNESS",
          reasons,
          comment,
          resolutionStatus: reasons.length > 0 || comment.trim() ? "UNRESOLVED" : "RESOLVED"
        })
      });
      if (!response.ok) throw new Error("FEEDBACK_FAILED");
      setDone("submitted");
    } catch {
      setMessage("反馈暂时没有保存成功。你可以稍后再试，也可以直接继续下一课。");
    } finally {
      setBusy(false);
    }
  }

  function skipFeedback() {
    setDone("skipped");
    if (!authenticated) return;
    fetch("/api/learning/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseSlug,
        lessonSlug,
        eventName: "lesson_feedback_skipped",
        targetType: "LESSON",
        targetId: lessonSlug,
        properties: {}
      })
    }).catch(() => undefined);
  }

  if (done) {
    return (
      <section className="lesson-feedback-after-nav is-done">
        {done === "submitted" ? "✓ 已收到你的反馈，谢谢。" : "已跳过反馈，不影响学习进度。"}
      </section>
    );
  }

  return (
    <section className="lesson-feedback-after-nav">
      <div className="lesson-feedback-after-nav-head">
        <div>
          <span>可选 · 课程反馈</span>
          <strong>这节课有哪些地方还可以讲得更清楚？</strong>
        </div>
        <button type="button" className="lesson-feedback-skip" onClick={skipFeedback}>
          暂时跳过
        </button>
      </div>

      <p>你的反馈只用于后续课程优化，不影响课程完成或下一课学习。</p>

      <div className="guided-feedback-options">
        {options.map((reason) => (
          <button
            key={reason}
            type="button"
            className={reasons.includes(reason) ? "is-selected" : ""}
            onClick={() => toggleReason(reason)}
          >
            {reason}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        maxLength={1200}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="还有其他想说的？（可选）"
      />

      <div className="interactive-actions">
        <button type="button" className="btn btn-secondary" onClick={submitFeedback} disabled={busy}>
          {busy ? "正在提交…" : "提交反馈"}
        </button>
      </div>

      {message && <div className="interactive-message">{message}</div>}
    </section>
  );
}
