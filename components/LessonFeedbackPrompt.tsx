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
  nextLabel = "下一课",
  showRating = false,
  canRate = false
}: {
  courseSlug: string;
  lessonSlug: string;
  nextHref: string;
  nextTitle: string;
  nextLabel?: string;
  showRating?: boolean;
  canRate?: boolean;
}) {
  const router = useRouter();
  const { ready, authenticated, isCompleted, getCompletionResult } = useProgress();
  const completed = ready && isCompleted(courseSlug, lessonSlug);
  const completionResult = getCompletionResult(courseSlug, lessonSlug);
  const effectiveCanRate = completionResult?.canRate ?? canRate;
  const effectiveShowRating = showRating || completionResult?.completed === true;
  const [rating, setRating] = useState<"NOT_CLEAR" | "HELPFUL" | "VERY_HELPFUL" | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function toggleReason(reason: string) {
    setReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  }

  async function submitRating() {
    if (!rating) {
      setMessage("先选择一个课程评价。");
      return;
    }

    if (!authenticated) {
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
          helpfulness: rating === "NOT_CLEAR" ? "NOT_HELPFUL" : "HELPFUL",
          reasons: ["课程评分：" + ratingLabel, ...reasons],
          comment,
          resolutionStatus: rating === "NOT_CLEAR" || reasons.length > 0 || comment.trim()
            ? "UNRESOLVED"
            : "RESOLVED"
        })
      });
      if (!response.ok) throw new Error("FEEDBACK_FAILED");
      setRating(null);
      setReasons([]);
      setComment("");
      setSubmitted(true);
    } catch {
      setMessage("课程评分暂时没有保存成功，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={"lesson-next-feedback-trigger next " + (completed ? "" : "is-disabled")}
        onClick={() => completed && router.push(nextHref)}
        disabled={!ready || !completed}
        aria-disabled={!completed}
      >
        <small>{completed ? nextLabel : "完成本课后继续"}</small>
        <strong>{nextTitle} →</strong>
      </button>

      {completed && effectiveShowRating && effectiveCanRate && !submitted && (
        <section className="lesson-next-rating-panel">
          <div className="lesson-feedback-after-nav-head">
            <div>
              <span>可选 · 课程评分</span>
              <strong>这节课对你有帮助吗？</strong>
            </div>
          </div>

          <p>评分只用于改进课程，不影响学习进度。</p>

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
                <button type="button" className="btn btn-primary" onClick={submitRating} disabled={busy}>
                  {busy ? "正在提交…" : "提交评分"}
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
