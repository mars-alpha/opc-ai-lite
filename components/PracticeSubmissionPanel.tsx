"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type PracticeContent = {
  goal: string;
  context: string;
  input: string;
  constraint: string;
  output: string;
};

type PracticeReadModel = {
  id: string;
  type: "LESSON_PRACTICE" | "STAGE_PROJECT" | "LATEST_PRACTICE";
  accessTier: "INHERIT" | "FREE" | "MEMBER";
  title: string;
  goal: string;
  access: { allowed: boolean; reason: string; requiredCourseSlug?: string };
  content: null | {
    instructions: Array<{ key: keyof PracticeContent; label: string; prompt: string }>;
    hints: string[];
    rubric: Array<{ key: keyof PracticeContent; label: string; maxScore: number; minScore: number; example: string }>;
    submissionSchema: { kind: string };
    passScore: number;
    required: boolean;
  };
  latestSubmission: null | {
    id: string;
    attempt: number;
    status: "SUBMITTED" | "NEEDS_REVISION" | "PASSED" | "EVALUATION_FAILED";
    content: PracticeContent;
    evaluation: null | {
      evaluatorType: "RULE" | "AI";
      score: number;
      passed: boolean;
      result: {
        criteria?: Array<{ key: string; label: string; score: number; maxScore: number; reason: string; suggestion: string }>;
        nextAction?: string;
      };
    };
  };
};

const emptyContent: PracticeContent = { goal: "", context: "", input: "", constraint: "", output: "" };

export function PracticeSubmissionPanel({ practiceId, compact = false }: { practiceId: string; compact?: boolean }) {
  const [data, setData] = useState<PracticeReadModel | null>(null);
  const [content, setContent] = useState<PracticeContent>(emptyContent);
  const [open, setOpen] = useState(!compact);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/learning/practices/" + practiceId, { cache: "no-store" });
    if (!response.ok) throw new Error("PRACTICE_READ_FAILED");
    const next = (await response.json()) as PracticeReadModel;
    setData(next);
    if (next.latestSubmission?.content) {
      setContent({ ...emptyContent, ...next.latestSubmission.content });
    }
  }, [practiceId]);

  useEffect(() => {
    refresh().catch(() => setMessage("实操暂时读取失败，请稍后刷新。"));
  }, [refresh]);

  const evaluation = data?.latestSubmission?.evaluation ?? null;
  const passed = data?.latestSubmission?.status === "PASSED" || evaluation?.passed === true;
  const title = useMemo(() => data?.title ?? "实操", [data?.title]);

  async function submit() {
    if (!data?.content) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/learning/practices/" + practiceId + "/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content })
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        setMessage("登录后即可提交并保存实操记录。");
        return;
      }
      if (response.status === 403 && result?.error === "MEMBERSHIP_REQUIRED") {
        setMessage("该实操属于 OPC 会员权益。当前支付尚未接入，请先使用已开放内容。");
        return;
      }
      if (!response.ok) {
        if (result?.error === "INVALID_PRACTICE_CONTENT") {
          setMessage("请把五个任务简报字段填写完整后再提交。");
          return;
        }
        throw new Error("SUBMIT_FAILED");
      }
      await refresh();
      setOpen(true);
    } catch {
      setMessage("提交失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return <div className="interactive-message">{message ?? "正在读取实操…"}</div>;
  }

  if (!data.access.allowed || !data.content) {
    return (
      <div className="interactive-login-note">
        <strong>{data.access.reason === "MEMBERSHIP_REQUIRED" ? "会员实操" : "当前实操暂不可用"}</strong>
        <p>
          {data.access.reason === "MEMBERSHIP_REQUIRED"
            ? "该 Stage Project 属于 OPC 会员权益。支付功能尚未接入，系统不会伪造订阅状态。"
            : data.access.reason === "STAGE_PREREQUISITE_REQUIRED"
              ? "请先完成前置学习阶段，再开始这个项目。"
              : "当前访问条件尚未满足。"}
        </p>
        {data.access.requiredCourseSlug ? <Link href={"/courses/" + data.access.requiredCourseSlug}>先完成前置课程 →</Link> : null}
      </div>
    );
  }

  if (compact && !open) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        {passed ? "查看已通过实操" : "开始实操"}
      </button>
    );
  }

  return (
    <section className="interactive-lesson">
      <div className="interactive-head">
        <div>
          <div className="kicker">{data.type.replaceAll("_", " ")}</div>
          <h2>{title}</h2>
          <p>{data.goal}</p>
        </div>
        {passed ? <span className="interactive-pass">PASSED ✓</span> : null}
      </div>

      <div className="guided-practice-fields">
        {data.content.instructions.map((item) => (
          <label key={item.key}>
            <span>{item.label}</span>
            <small>{item.prompt}</small>
            <textarea
              value={content[item.key]}
              onChange={(event) => setContent((current) => ({ ...current, [item.key]: event.target.value }))}
              rows={3}
              maxLength={3000}
            />
          </label>
        ))}
      </div>

      <div className="interactive-actions">
        <button type="button" className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? "正在检查…" : data.latestSubmission ? "修改后重新提交" : "提交检查"}
        </button>
        {compact ? <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>收起</button> : null}
      </div>

      {evaluation ? (
        <div className="evaluation-panel">
          <div className="evaluation-summary">
            <div><span>本次任务得分</span><strong>{evaluation.score}<small> / 100</small></strong></div>
            <div><span>结果</span><strong className={evaluation.passed ? "passed" : "revision"}>{evaluation.passed ? "已通过" : "需要修改"}</strong></div>
          </div>
          {evaluation.result?.nextAction ? <p className="evaluation-next">{evaluation.result.nextAction}</p> : null}
        </div>
      ) : null}

      {message ? <div className="interactive-message">{message}</div> : null}
    </section>
  );
}
