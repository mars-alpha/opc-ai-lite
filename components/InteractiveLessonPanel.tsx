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

type CriterionResult = {
  key: keyof PracticeContent;
  label: string;
  score: number;
  maxScore: number;
  minScore: number;
  reason: string;
  problem: string | null;
  suggestion: string;
  example: string;
};

type Evaluation = {
  evaluatorType: "RULE" | "AI";
  score: number;
  passed: boolean;
  criteria: CriterionResult[];
  nextAction: string;
};

type InteractiveData = {
  authenticated: boolean;
  checks: Array<{
    id: string;
    question: string;
    options: Array<{ value: string; label: string }>;
    required: boolean;
    state: null | {
      answer: string;
      isCorrect: boolean;
      attempts: number;
      explanation: string | null;
    };
  }>;
  practices: Array<{
    id: string;
    title: string;
    goal: string;
    instructions: Array<{
      key: keyof PracticeContent;
      label: string;
      prompt: string;
    }>;
    hints: string[];
    rubric: Array<{
      key: keyof PracticeContent;
      label: string;
      maxScore: number;
      minScore: number;
      example: string;
    }>;
    passScore: number;
    required: boolean;
    state: null | {
      submissionId: string;
      attempt: number;
      status: "SUBMITTED" | "NEEDS_REVISION" | "PASSED" | "EVALUATION_FAILED";
      content: PracticeContent;
      evaluation: Evaluation | null;
    };
  }>;
};

type PracticeReadModel = {
  id: string;
  type: "LESSON_PRACTICE" | "STAGE_PROJECT" | "LATEST_PRACTICE";
  accessTier: "INHERIT" | "FREE" | "MEMBER";
  title: string;
  goal: string;
  access: { allowed: boolean; reason: string };
  content: null | {
    instructions: Array<{ key: keyof PracticeContent; label: string; prompt: string }>;
    hints: string[];
    rubric: Array<{
      key: keyof PracticeContent;
      label: string;
      maxScore: number;
      minScore: number;
      example: string;
    }>;
    submissionSchema: { kind: string };
    passScore: number;
    required: boolean;
  };
  latestSubmission: null | {
    id: string;
    attempt: number;
    status: "SUBMITTED" | "NEEDS_REVISION" | "PASSED" | "EVALUATION_FAILED";
    content: PracticeContent;
    evaluation: null | { result: Evaluation };
  };
};
const emptyContent: PracticeContent = {
  goal: "",
  context: "",
  input: "",
  constraint: "",
  output: ""
};

export function InteractiveLessonPanel({
  courseSlug,
  lessonSlug,
  practiceId
}: {
  courseSlug: string;
  lessonSlug: string;
  practiceId: string;
}) {
  const [data, setData] = useState<InteractiveData | null>(null);
  const [practiceData, setPracticeData] = useState<PracticeReadModel | null>(null);
  const [content, setContent] = useState<PracticeContent>(emptyContent);
  const [answer, setAnswer] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams({ courseSlug, lessonSlug });
    const [interactiveResponse, practiceResponse] = await Promise.all([
      fetch("/api/learning/interactive?" + params.toString(), { cache: "no-store" }),
      fetch("/api/learning/practices/" + practiceId, { cache: "no-store" })
    ]);
    if (!interactiveResponse.ok || !practiceResponse.ok) {
      throw new Error("INTERACTIVE_READ_FAILED");
    }
    const next = (await interactiveResponse.json()) as InteractiveData;
    const nextPractice = (await practiceResponse.json()) as PracticeReadModel;
    setData(next);
    setPracticeData(nextPractice);
    const latest = nextPractice.latestSubmission?.content;
    if (latest) setContent({ ...emptyContent, ...latest });
    const previousAnswer = next.checks[0]?.state?.answer;
    if (previousAnswer) setAnswer(previousAnswer);
  }, [courseSlug, lessonSlug, practiceId]);

  useEffect(() => {
    refresh().catch(() => setMessage("互动练习暂时读取失败，请稍后刷新。"));
  }, [refresh]);

  const check = data?.checks[0] ?? null;
  const practice = useMemo(() => {
    if (!practiceData?.content) return null;
    return {
      id: practiceData.id,
      title: practiceData.title,
      goal: practiceData.goal,
      instructions: practiceData.content.instructions,
      hints: practiceData.content.hints,
      rubric: practiceData.content.rubric,
      passScore: practiceData.content.passScore,
      required: practiceData.content.required,
      state: practiceData.latestSubmission
        ? {
            submissionId: practiceData.latestSubmission.id,
            attempt: practiceData.latestSubmission.attempt,
            status: practiceData.latestSubmission.status,
            content: practiceData.latestSubmission.content,
            evaluation: practiceData.latestSubmission.evaluation?.result ?? null
          }
        : null
    };
  }, [practiceData]);
  const evaluation = practice?.state?.evaluation ?? null;

  const copyText = useMemo(
    () =>
      [
        "请根据下面的任务简报完成任务。如果关键信息不足，请先指出缺失项，不要自行编造。",
        "",
        "Goal：\n" + content.goal,
        "",
        "Context：\n" + content.context,
        "",
        "Input：\n" + content.input,
        "",
        "Constraint：\n" + content.constraint,
        "",
        "Output：\n" + content.output
      ].join("\n"),
    [content]
  );

  async function submitCheck() {
    if (!check || !answer) return;
    if (!data?.authenticated) {
      setMessage("登录后即可保存理解检查和实操记录。");
      return;
    }
    setBusy("check");
    setMessage(null);
    try {
      const response = await fetch("/api/learning/checks/" + check.id + "/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer })
      });
      if (!response.ok) throw new Error("CHECK_FAILED");
      await refresh();
    } catch {
      setMessage("理解检查提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function submitPractice() {
    if (!practice) return;
    if (!data?.authenticated) {
      setMessage("登录后即可提交并保存你的练习。");
      return;
    }
    setBusy("practice");
    setMessage(null);
    try {
      const response = await fetch(
        "/api/learning/practices/" + practice.id + "/submissions",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content })
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (result?.error === "INVALID_PRACTICE_CONTENT") {
          setMessage("五个字段都需要填写后再提交。");
          return;
        }
        throw new Error("SUBMIT_FAILED");
      }
      await refresh();
      setMessage(
        result?.status === "EVALUATION_FAILED"
          ? "答案已经保存，但检查暂时失败。你可以点击“重新检查”。"
          : null
      );
    } catch {
      setMessage("提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function retryEvaluation() {
    const submissionId = practice?.state?.submissionId;
    if (!submissionId) return;
    setBusy("evaluate");
    setMessage(null);
    try {
      const response = await fetch(
        "/api/learning/submissions/" + submissionId + "/evaluate",
        { method: "POST" }
      );
      if (!response.ok) throw new Error("EVALUATE_FAILED");
      await refresh();
    } catch {
      setMessage("答案仍然保存在系统中，但检查暂时不可用，请稍后再试。");
    } finally {
      setBusy("");
    }
  }

  function recordClientEvent(
    eventName: "hint_revealed" | "external_ai_copy",
    properties: Record<string, unknown>
  ) {
    if (!data?.authenticated) return;
    fetch("/api/learning/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseSlug,
        lessonSlug,
        eventName,
        targetType: "PRACTICE",
        targetId: practice?.id,
        properties
      })
    }).catch(() => undefined);
  }

  async function copyForExternalAI() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      recordClientEvent("external_ai_copy", { practiceId: practice?.id ?? null });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setMessage("复制失败，请手动复制任务简报。");
    }
  }

  if (!data || !check || !practice) return null;

  return (
    <section className="interactive-lesson" id="interactive-practice">
      <div className="interactive-head">
        <div>
          <div className="kicker">Interactive lesson · MVP</div>
          <h2>从“看懂”到“会做”</h2>
          <p>
            先确认一个关键概念，再用你自己的真实任务完成一次任务简报。
            当前 MVP 使用规则检查，重点是帮你发现缺项并修改，不是 AI 能力总分。
          </p>
        </div>
        {practice.state?.status === "PASSED" && (
          <span className="interactive-pass">PASSED ✓</span>
        )}
      </div>

      {!data.authenticated && (
        <div className="interactive-login-note">
          你可以先查看练习结构；登录后才能保存答案、评分和重试记录。
          <Link href={"/auth?mode=login&returnTo=" + encodeURIComponent(
            "/courses/" + courseSlug + "/lessons/" + lessonSlug + "#interactive-practice"
          )}>登录 →</Link>
        </div>
      )}

      <div className="interactive-step">
        <div className="interactive-step-index">01</div>
        <div className="interactive-step-body">
          <span>理解检查</span>
          <h3>{check.question}</h3>
          <div className="interactive-options">
            {check.options.map((option) => (
              <label key={option.value} className={answer === option.value ? "is-selected" : ""}>
                <input
                  type="radio"
                  name={check.id}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={() => setAnswer(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={submitCheck}
            disabled={!answer || busy === "check"}
          >
            {busy === "check" ? "正在检查…" : check.state?.isCorrect ? "✓ 已理解" : "提交答案"}
          </button>
          {check.state && (
            <div className={"check-feedback " + (check.state.isCorrect ? "is-correct" : "is-wrong")}>
              <strong>{check.state.isCorrect ? "回答正确" : "再想一下"}</strong>
              <p>
                {check.state.isCorrect
                  ? check.state.explanation
                  : "Constraint 才是专门定义必须遵守、不能做什么和任务边界的部分。"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="interactive-step">
        <div className="interactive-step-index">02</div>
        <div className="interactive-step-body">
          <span>跟着做 · 再自己做</span>
          <h3>{practice.title}</h3>
          <p>{practice.goal}</p>

          <div className="guided-practice-fields">
            {practice.instructions.map((item) => (
              <label key={item.key}>
                <span>{item.label}</span>
                <small>{item.prompt}</small>
                <textarea
                  value={content[item.key]}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      [item.key]: event.target.value
                    }))
                  }
                  rows={3}
                  maxLength={3000}
                />
              </label>
            ))}
          </div>

          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setHintCount((current) => {
                  const next = Math.min(current + 1, practice.hints.length);
                  if (next > current) {
                    recordClientEvent("hint_revealed", { practiceId: practice.id, hintIndex: next });
                  }
                  return next;
                });
              }}
            >
              {hintCount < practice.hints.length ? "给我一个提示" : "提示已全部展开"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitPractice}
              disabled={busy === "practice"}
            >
              {busy === "practice"
                ? "正在检查…"
                : practice.state
                  ? "修改后重新提交"
                  : "提交检查"}
            </button>
          </div>

          {hintCount > 0 && (
            <div className="interactive-hints">
              {practice.hints.slice(0, hintCount).map((hint, index) => (
                <p key={hint}><strong>提示 {index + 1}</strong>{hint}</p>
              ))}
            </div>
          )}

          {practice.state?.status === "EVALUATION_FAILED" && (
            <div className="evaluation-failed">
              <strong>答案已经保存</strong>
              <p>检查暂时失败，不需要重新填写。稍后可以重新检查这一次提交。</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={retryEvaluation}
                disabled={busy === "evaluate"}
              >
                {busy === "evaluate" ? "重新检查中…" : "重新检查"}
              </button>
            </div>
          )}
        </div>
      </div>

      {evaluation && (
        <div className="evaluation-panel">
          <div className="evaluation-summary">
            <div>
              <span>本次任务得分</span>
              <strong>{evaluation.score}<small> / 100</small></strong>
            </div>
            <div>
              <span>结果</span>
              <strong className={evaluation.passed ? "passed" : "revision"}>
                {evaluation.passed ? "已通过" : "需要修改"}
              </strong>
            </div>
          </div>

          <p className="evaluation-next">{evaluation.nextAction}</p>

          <div className="evaluation-criteria">
            {evaluation.criteria.map((item) => (
              <article key={item.key}>
                <div className="criterion-head">
                  <strong>{item.label}</strong>
                  <span>{item.score}/{item.maxScore}</span>
                </div>
                <p><b>为什么：</b>{item.reason}</p>
                {item.problem && <p><b>错在哪里：</b>{item.problem}</p>}
                <p><b>怎么改：</b>{item.suggestion}</p>
                <p className="criterion-example"><b>示例：</b>{item.example}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="external-ai-check">
        <div>
          <span>去你的 AI 工具验证</span>
          <h3>OPC 教方法，不替你运行模型</h3>
          <p>
            把当前任务简报复制到你常用的 AI 工具里执行。这里不上传文件、不抓取外部结果，也不需要配置 API Key。
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={copyForExternalAI}>
          {copied ? "已复制 ✓" : "复制到我的 AI 工具"}
        </button>
      </div>

      {message && <div className="interactive-message">{message}</div>}
    </section>
  );
}





