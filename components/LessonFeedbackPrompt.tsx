"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProgress } from "./ProgressProvider";

const ratings = [
  ["NOT_CLEAR", "没太学懂"],
  ["HELPFUL", "基本有帮助"],
  ["VERY_HELPFUL", "很有帮助"]
] as const;

const options = [
  "有些地方没讲清楚",
  "案例不够贴近实际",
  "操作步骤不够明确",
  "提示还不够",
  "通过标准不够直观",
  "练习难度不合适",
  "其他"
] as const;

export function LessonFeedbackPrompt({
  courseSlug,
  lessonSlug,
  nextHref,
  nextTitle,
  nextLabel = "下一课"
}: {
  courseSlug: string;
  lessonSlug: string;
  nextHref: string;
  nextTitle: string;
  nextLabel?: string;
}) {
  const router = useRouter();
  const { ready, authenticated, isCompleted } = useProgress();
  const completed = ready && isCompleted(courseSlug, lessonSlug);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<"NOT_CLEAR" | "HELPFUL" | "VERY_HELPFUL" | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggleReason(reason: string) {
    setReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  }

  function goNext() {
    router.push(nextHref);
  }

  async function submitAndContinue() {
    if (!rating) {
      setMessage("先选择一个课程评价，或者直接点击“暂时跳过”。");
      return;
    }

    if (!authenticated) {
      goNext();
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const ratingLabel = ratings.find(([value]) => value === rating)?.[1] ?? rating;
      const response = await fetch("/api/learning/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          issueType: "LESSON_HELPFULNESS",
          reasons: ["课程评分：" + ratingLabel, ...reasons],
          comment,
          resolutionStatus: rating === "NOT_CLEAR" || reasons.length > 0 || comment.trim()
            ? "UNRESOLVED"
            : "RESOLVED"
        })
      });
      if (!response.ok) throw new Error("FEEDBACK_FAILED");
      goNext();
    } catch {
      setMessage("课程评分暂时没有保存成功。你可以重试，也可以直接跳过进入下一课。");
    } finally {
      setBusy(false);
    }
  }

  function skipAndContinue() {
    if (authenticated) {
      fetch("/api/learning/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          eventName: "lesson_feedback_skipped",
          targetType: "LESSON",
          targetId: lessonSlug,
          properties: { exitFlow: true }
        })
      }).catch(() => undefined);
    }
    goNext();
  }

  return (
    <>
      <button
        type="button"
        className={"lesson-next-feedback-trigger next " + (completed ? "" : "is-disabled")}
        onClick={() => completed && setOpen(true)}
        disabled={!ready || !completed}
        aria-disabled={!completed}
      >
        <small>{completed ? nextLabel : "完成本课后继续"}</small>
        <strong>{nextTitle} →</strong>
      </button>

      {open && (
        <section className="lesson-next-rating-panel">
          <div className="lesson-feedback-after-nav-head">
            <div>
              <span>可选 · 课程评分</span>
              <strong>这节课对你有帮助吗？</strong>
            </div>
            <button type="button" className="lesson-feedback-skip" onClick={skipAndContinue}>
              暂时跳过 →
            </button>
          </div>

          <p>课程已经完成。这个评分只用于改进课程，不影响学习进度。</p>

          <div className="lesson-rating-options">
            {ratings.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={rating === value ? "is-selected" : ""}
                onClick={() => setRating(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {rating && (
            <>
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
                <button type="button" className="btn btn-primary" onClick={submitAndContinue} disabled={busy}>
                  {busy ? "正在提交…" : "提交并进入下一课 →"}
                </button>
              </div>
            </>
          )}

          {message && <div className="interactive-message">{message}</div>}
        </section>
      )}
    </>
  );
}
