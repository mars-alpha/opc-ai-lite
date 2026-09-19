"use client";

import Link from "next/link";
import { useState } from "react";

type IssueType =
  | "DONT_UNDERSTAND"
  | "DONT_KNOW_HOW"
  | "EVALUATION_DISPUTE"
  | "FIND_RELATED_COURSE"
  | "CONTENT_OUTDATED"
  | "OTHER";

type Resolution = {
  kind: "COURSE_LINK" | "STANDARD_REPLY" | "FEEDBACK_ELIGIBLE";
  title: string;
  message: string;
  href?: string;
  relatedLessonId?: string;
  canSubmitFeedback: boolean;
};

const issueOptions: Array<{ value: IssueType; label: string }> = [
  { value: "DONT_UNDERSTAND", label: "有地方没看懂" },
  { value: "DONT_KNOW_HOW", label: "知道概念，但不知道怎么做" },
  { value: "EVALUATION_DISPUTE", label: "评分 / 反馈看起来不对" },
  { value: "FIND_RELATED_COURSE", label: "想找相关课程" },
  { value: "CONTENT_OUTDATED", label: "内容可能错误或过时" },
  { value: "OTHER", label: "其他问题" }
];

export function LessonHelpPanel({
  courseSlug,
  lessonSlug,
  authenticated
}: {
  courseSlug: string;
  lessonSlug: string;
  authenticated: boolean;
}) {
  const [helpfulness, setHelpfulness] = useState<"HELPFUL" | "NOT_HELPFUL" | null>(null);
  const [issueType, setIssueType] = useState<IssueType>("DONT_UNDERSTAND");
  const [detail, setDetail] = useState("");
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submitHelpfulness(value: "HELPFUL" | "NOT_HELPFUL") {
    setHelpfulness(value);
    if (!authenticated) return;
    try {
      await fetch("/api/learning/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          issueType: "LESSON_HELPFULNESS",
          helpfulness: value,
          resolutionStatus: "RESOLVED"
        })
      });
    } catch {
      // Helpfulness is non-blocking; specific unresolved issues use the explicit feedback flow below.
    }
  }

  async function resolveIssue() {
    if (detail.trim().length < 2 && ["DONT_UNDERSTAND", "FIND_RELATED_COURSE", "OTHER"].includes(issueType)) {
      setMessage("补充一句具体问题，系统才能先判断现有课程是否已经有答案。");
      return;
    }

    setBusy("resolve");
    setMessage(null);
    setResolution(null);
    setSubmitted(false);

    try {
      const response = await fetch("/api/learning/help/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonSlug, issueType, detail })
      });
      if (!response.ok) throw new Error("HELP_RESOLVE_FAILED");
      setResolution((await response.json()) as Resolution);
    } catch {
      setMessage("暂时无法匹配现有答案，请稍后再试。");
    } finally {
      setBusy("");
    }
  }

  async function markResolved() {
    setMessage("已解决，这个问题不会进入后台审核。");
    if (!authenticated) return;
    fetch("/api/learning/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseSlug,
        lessonSlug,
        eventName: "help_resolved",
        targetType: "LESSON",
        properties: { issueType, resolutionKind: resolution?.kind ?? null }
      })
    }).catch(() => undefined);
  }

  async function submitUnresolved() {
    if (!authenticated) {
      setMessage("登录后才能把未解决问题提交给课程团队。");
      return;
    }
    if (detail.trim().length < 2 && issueType !== "EVALUATION_DISPUTE") {
      setMessage("请补充具体问题，避免后台收到无法判断的空泛反馈。");
      return;
    }

    setBusy("feedback");
    setMessage(null);
    try {
      const response = await fetch("/api/learning/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          issueType,
          comment: detail,
          resolutionStatus: "UNRESOLVED",
          relatedLessonId: resolution?.relatedLessonId ?? null
        })
      });
      if (!response.ok) throw new Error("FEEDBACK_FAILED");
      setSubmitted(true);
      setMessage("已记录。相似问题会按独立用户聚合，达到分析条件后进入后台诊断。");
    } catch {
      setMessage("提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="lesson-help-panel">
      <div className="lesson-help-head">
        <div>
          <div className="kicker">Help · Feedback</div>
          <h2>有问题，先帮你解决</h2>
          <p>系统先用现有课程和标准答案处理；只有仍未解决、对课程改进有价值的问题才进入后台。</p>
        </div>
        <div className="lesson-helpfulness">
          <span>这节课对你有帮助吗？</span>
          <div>
            <button
              type="button"
              className={helpfulness === "HELPFUL" ? "is-selected" : ""}
              onClick={() => submitHelpfulness("HELPFUL")}
            >
              有帮助
            </button>
            <button
              type="button"
              className={helpfulness === "NOT_HELPFUL" ? "is-selected" : ""}
              onClick={() => submitHelpfulness("NOT_HELPFUL")}
            >
              需要改进
            </button>
          </div>
          {!authenticated && helpfulness && (
            <small>登录后才会保存课程帮助度。当前选择不会进入后台审核。</small>
          )}
        </div>
      </div>

      <div className="lesson-help-form">
        <label>
          <span>你遇到什么问题？</span>
          <select
            value={issueType}
            onChange={(event) => {
              setIssueType(event.target.value as IssueType);
              setResolution(null);
              setSubmitted(false);
            }}
          >
            {issueOptions.map((item) => (
              <option value={item.value} key={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="lesson-help-detail">
          <span>具体一点，方便先匹配已有答案</span>
          <textarea
            rows={3}
            maxLength={2000}
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="例如：我知道 Constraint 是限制条件，但不知道真实工作里应该写哪些限制。"
          />
        </label>
        <button
          type="button"
          className="btn btn-primary lesson-help-submit"
          onClick={resolveIssue}
          disabled={busy === "resolve"}
        >
          {busy === "resolve" ? "正在查找…" : "先帮我解决"}
        </button>
      </div>

      {!resolution && !message && (
        <p className="lesson-help-note">
          <span aria-hidden="true">i</span>
          补充一句具体问题，系统才能先判断现有课程是否已经有答案。
        </p>
      )}

      {resolution && (
        <div className={"lesson-help-resolution is-" + resolution.kind.toLowerCase()}>
          <strong>{resolution.title}</strong>
          <p>{resolution.message}</p>
          <div className="lesson-help-actions">
            {resolution.href && <Link className="btn btn-secondary" href={resolution.href}>查看对应内容 →</Link>}
            <button type="button" className="btn btn-secondary" onClick={markResolved}>已经解决</button>
            {resolution.canSubmitFeedback && !submitted && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitUnresolved}
                disabled={busy === "feedback"}
              >
                {busy === "feedback" ? "正在提交…" : authenticated ? "还是没解决，提交给课程团队" : "登录后提交未解决问题"}
              </button>
            )}
          </div>
        </div>
      )}

      {message && <div className="lesson-help-message">{message}</div>}
    </section>
  );
}


