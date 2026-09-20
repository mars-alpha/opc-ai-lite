"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealAiEvidence } from "../lib/learning/lesson-spec";
import type { LessonRuntimePlan } from "../lib/learning/lesson-runtime";
import {
  rulePracticeEvaluator,
  type EvaluationResult,
  type PracticeContent
} from "../lib/learning/practice-evaluator";

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
    instructions: Array<{ key: string; label: string; prompt: string }>;
    hints: string[];
    rubric: Array<{
      key: string;
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
      evaluation: EvaluationResult | null;
    };
  }>;
};

type RuntimeData = {
  registered: boolean;
  configurationReady: boolean;
  enforcementActive: boolean;
  gates: {
    realAi: {
      required: boolean;
      satisfied: boolean;
      evidenceKind: RealAiEvidence;
    };
  };
};

function emptyPracticeContent(
  instructions: Array<{ key: string }>
): PracticeContent {
  return Object.fromEntries(instructions.map((item) => [item.key, ""]));
}

function evidenceLabel(kind: RealAiEvidence) {
  if (kind === "USER_CONFIRMATION") return "真实操作确认";
  if (kind === "ARTIFACT") return "真实操作产物";
  if (kind === "SYSTEM_RESULT") return "系统验证结果";
  return "无需真实 AI 证据";
}

export function GenericLessonRuntimePanel({
  courseSlug,
  lessonSlug,
  plan
}: {
  courseSlug: string;
  lessonSlug: string;
  plan: LessonRuntimePlan;
}) {
  const [interactive, setInteractive] = useState<InteractiveData | null>(null);
  const [runtime, setRuntime] = useState<RuntimeData | null>(null);
  const [answer, setAnswer] = useState("");
  const [localCheckCorrect, setLocalCheckCorrect] = useState<boolean | null>(null);
  const [content, setContent] = useState<PracticeContent>({});
  const [previewEvaluation, setPreviewEvaluation] =
    useState<EvaluationResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams({ courseSlug, lessonSlug });
    const [runtimeResponse, interactiveResponse] = await Promise.all([
      fetch("/api/learning/runtime?" + params.toString(), { cache: "no-store" }),
      fetch("/api/learning/interactive?" + params.toString(), { cache: "no-store" })
    ]);
    if (!runtimeResponse.ok || !interactiveResponse.ok) {
      throw new Error("GENERIC_RUNTIME_READ_FAILED");
    }

    const nextRuntime = (await runtimeResponse.json()) as RuntimeData;
    const nextInteractive = (await interactiveResponse.json()) as InteractiveData;
    setRuntime(nextRuntime);
    setInteractive(nextInteractive);

    const nextCheck =
      nextInteractive.checks.find((item) => item.required) ??
      nextInteractive.checks[0];
    if (nextCheck?.state?.answer) setAnswer(nextCheck.state.answer);

    const nextPractice =
      nextInteractive.practices.find((item) => item.required) ??
      nextInteractive.practices[0];
    if (nextPractice) {
      setContent({
        ...emptyPracticeContent(nextPractice.instructions),
        ...(nextPractice.state?.content ?? {})
      });
    }
  }, [courseSlug, lessonSlug]);

  useEffect(() => {
    refresh().catch(() =>
      setMessage("互动学习暂时读取失败，请稍后刷新。")
    );
  }, [refresh]);

  const check = useMemo(
    () =>
      interactive?.checks.find((item) => item.required) ??
      interactive?.checks[0] ??
      null,
    [interactive]
  );
  const practice = useMemo(
    () =>
      interactive?.practices.find((item) => item.required) ??
      interactive?.practices[0] ??
      null,
    [interactive]
  );
  const evaluation =
    previewEvaluation ?? practice?.state?.evaluation ?? null;
  const checkPassed = check?.state?.isCorrect || localCheckCorrect === true;
  const practicePassed =
    practice?.state?.status === "PASSED" || evaluation?.passed === true;
  const realAiPassed =
    !plan.requiresRealAi || runtime?.gates.realAi.satisfied === true;

  const requiredGateStates = [
    ...(plan.requiresCheck ? [Boolean(checkPassed)] : []),
    ...(plan.requiresPractice ? [Boolean(practicePassed)] : []),
    ...(plan.requiresRealAi ? [Boolean(realAiPassed)] : [])
  ];

  async function submitCheck() {
    if (!check || !answer) return;
    setBusy("check");
    setMessage(null);
    try {
      const response = await fetch(
        "/api/learning/checks/" + check.id + "/answer",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answer })
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error("CHECK_FAILED");

      if (!interactive?.authenticated) {
        setLocalCheckCorrect(result?.correct === true);
      } else {
        await refresh();
      }
      setMessage(
        result?.correct === true
          ? "理解检查已通过。"
          : "还没有通过。对照本课说明后再试一次。"
      );
    } catch {
      setMessage("理解检查提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function submitPractice() {
    if (!practice) return;
    setBusy("practice");
    setMessage(null);
    try {
      if (!interactive?.authenticated) {
        const result = await rulePracticeEvaluator({
          content,
          rubric: practice.rubric,
          passScore: practice.passScore
        });
        setPreviewEvaluation(result);
        setMessage(
          result.passed
            ? "本地检查已通过。登录后提交可保存正式学习记录。"
            : "本地检查完成。根据下面反馈修改后再试一次。"
        );
        return;
      }

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
          setMessage("请先把本练习要求的字段填写完整。");
          return;
        }
        throw new Error("PRACTICE_SUBMIT_FAILED");
      }
      await refresh();
      setPreviewEvaluation(null);
      setMessage(
        result?.status === "EVALUATION_FAILED"
          ? "内容已保存，但本次检查暂时失败，请稍后重试。"
          : null
      );
    } catch {
      setMessage("练习提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function submitRealAiEvidence() {
    if (!plan.requiresRealAi || plan.realAiEvidence === "NONE") return;
    if (!interactive?.authenticated) {
      setMessage("登录后才能保存真实 AI 操作证据。");
      return;
    }
    if (plan.realAiEvidence === "ARTIFACT") {
      setMessage("当前还没有正式 Artifact Resolver，手填链接或引用不会被当作完成证据。");
      return;
    }
    if (plan.realAiEvidence === "SYSTEM_RESULT") {
      setMessage("本课由系统自动记录真实工具结果，无需手动提交。");
      return;
    }

    setBusy("real-ai");
    setMessage(null);
    try {
      const response = await fetch("/api/learning/real-ai-evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          evidenceKind: plan.realAiEvidence,
          confirmed:
            plan.realAiEvidence === "USER_CONFIRMATION" ? confirmed : undefined
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (
          result?.error === "REAL_AI_CONFIRMATION_REQUIRED"
        ) {
          setMessage("请先提供本课要求的真实 AI 操作证据。");
          return;
        }
        throw new Error("REAL_AI_EVIDENCE_FAILED");
      }
      await refresh();
      setMessage("真实 AI 操作证据已记录。");
    } catch {
      setMessage("真实 AI 操作证据暂时无法保存，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="interactive-panel" id="lesson-runtime">
      <div className="interactive-head">
        <div>
          <div className="kicker">Runtime learning</div>
          <h2>完成本课验收</h2>
          <p>按本课类型完成必要的理解检查、实操或真实 AI 操作。</p>
        </div>
        <span>
          {requiredGateStates.filter(Boolean).length}/{requiredGateStates.length} 条件就绪
        </span>
      </div>

      {plan.requiresCheck && check && (
        <div className="interactive-block">
          <div className="kicker">理解检查</div>
          <h3>{check.question}</h3>
          <div className="interactive-options">
            {check.options.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name={"check-" + check.id}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setLocalCheckCorrect(null);
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitCheck}
              disabled={!answer || busy === "check" || checkPassed}
            >
              {checkPassed
                ? "✓ 理解检查已通过"
                : busy === "check"
                  ? "正在检查…"
                  : "检查答案"}
            </button>
          </div>
        </div>
      )}

      {plan.requiresPractice && practice && (
        <div className="interactive-block" id="interactive-practice">
          <div className="kicker">实操验收</div>
          <h3>{practice.title}</h3>
          <p>{practice.goal}</p>
          <div className="guided-practice-fields">
            {practice.instructions.map((item) => (
              <label key={item.key}>
                <span>{item.label}</span>
                <small>{item.prompt}</small>
                <textarea
                  rows={3}
                  maxLength={12000}
                  value={content[item.key] ?? ""}
                  onChange={(event) => {
                    setContent((current) => ({
                      ...current,
                      [item.key]: event.target.value
                    }));
                    setPreviewEvaluation(null);
                  }}
                />
              </label>
            ))}
          </div>
          {practice.hints.length > 0 && (
            <div className="interactive-hints">
              <strong>提示</strong>
              {practice.hints.map((hint) => (
                <p key={hint}>{hint}</p>
              ))}
            </div>
          )}
          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitPractice}
              disabled={busy === "practice" || practicePassed}
            >
              {practicePassed
                ? "✓ 实操已通过"
                : busy === "practice"
                  ? "正在检查…"
                  : evaluation
                    ? "修改后重新检查"
                    : "检查我的结果"}
            </button>
          </div>

          {evaluation && (
            <div className="interactive-evaluation">
              <div className="interactive-score">
                <strong>{evaluation.score}</strong>
                <span>/ 100</span>
              </div>
              <div>
                {evaluation.criteria.map((criterion) => (
                  <p key={criterion.key}>
                    <b>{criterion.label}</b> · {criterion.score}/{criterion.maxScore}
                    {criterion.score < criterion.minScore && criterion.problem
                      ? " · " + criterion.problem
                      : ""}
                  </p>
                ))}
                <p>{evaluation.nextAction}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {plan.requiresRealAi && (
        <div className="interactive-block">
          <div className="kicker">真实 AI 操作</div>
          <h3>{evidenceLabel(plan.realAiEvidence)}</h3>
          {plan.realAiEvidence === "USER_CONFIRMATION" && (
            <label className="interactive-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span>我已经在真实 AI 产品中完成本课要求的操作。</span>
            </label>
          )}
          {plan.realAiEvidence === "ARTIFACT" && (
            <p>本课需要可验证的真实产物。当前 Artifact Resolver 尚未接入，因此不会接受手填链接或引用作为完成证据。</p>
          )}
          {plan.realAiEvidence === "SYSTEM_RESULT" && (
            <p>该证据只能由已接入的受信工具 Runtime 写入，用户不能手动伪造。</p>
          )}
          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitRealAiEvidence}
              disabled={
                realAiPassed ||
                busy === "real-ai" ||
                plan.realAiEvidence === "SYSTEM_RESULT" ||
                plan.realAiEvidence === "ARTIFACT"
              }
            >
              {realAiPassed
                ? "✓ 真实 AI 操作已验证"
                : busy === "real-ai"
                  ? "正在保存…"
                  : "提交完成证据"}
            </button>
          </div>
        </div>
      )}

      {message && <div className="interactive-message">{message}</div>}
    </section>
  );
}
