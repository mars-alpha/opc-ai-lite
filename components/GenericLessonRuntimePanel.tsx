"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealAiEvidence } from "../lib/learning/lesson-spec";
import type { LessonRuntimePlan } from "../lib/learning/lesson-runtime";
import type { Lesson } from "../lib/courses";
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
  blockers: string[];
  gates: {
    realAi: {
      required: boolean;
      satisfied: boolean;
      evidenceKind: RealAiEvidence;
    };
  };
};

type PreviewCheck = {
  id: string;
  question: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  correctValue: string;
  explanation: string;
};

type PreviewActivity = {
  title: string;
  instruction: string;
  prompt: string | null;
  reflection: string;
};

type PreviewIntroChoice = {
  question: string;
  options: ReadonlyArray<{
    value: string;
    label: string;
    explanation: string;
  }>;
  comparison: ReadonlyArray<{
    term: string;
    meaning: string;
  }>;
  takeaway: string;
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

function runtimeBlockerMessage(blocker: string) {
  if (blocker === "CHECK_NOT_CONFIGURED") {
    return "本课 required Check 尚未完成正式配置，因此理解检查不会伪造为可用。";
  }
  if (blocker === "PRACTICE_NOT_CONFIGURED") {
    return "本课 required Practice 尚未完成正式配置，因此实操提交与评分不会伪造为可用。";
  }
  if (blocker.startsWith("REAL_AI_EVIDENCE_RUNTIME_NOT_SUPPORTED:")) {
    return "本课真实 AI 证据链尚未受 Runtime 支持；系统不会用用户手填引用绕过 Completion Gate。";
  }
  return "本课有一项 required Runtime 配置尚未准备完成。";
}

export function GenericLessonRuntimePanel({
  courseSlug,
  lessonSlug,
  plan,
  lesson,
  previewMode = false,
  previewCheck = null,
  previewActivity = null,
  previewIntroChoice = null
}: {
  courseSlug: string;
  lessonSlug: string;
  plan: LessonRuntimePlan;
  lesson: Lesson;
  previewMode?: boolean;
  previewCheck?: PreviewCheck | null;
  previewActivity?: PreviewActivity | null;
  previewIntroChoice?: PreviewIntroChoice | null;
}) {
  const [interactive, setInteractive] = useState<InteractiveData | null>(() =>
    previewMode
      ? {
          authenticated: false,
          checks: previewCheck
            ? [{
                id: previewCheck.id,
                question: previewCheck.question,
                options: [...previewCheck.options],
                required: true,
                state: null
              }]
            : [],
          practices: []
        }
      : null
  );
  const [runtime, setRuntime] = useState<RuntimeData | null>(() =>
    previewMode
      ? {
          registered: false,
          configurationReady: true,
          enforcementActive: false,
          blockers: [],
          gates: {
            realAi: {
              required: false,
              satisfied: true,
              evidenceKind: "NONE"
            }
          }
        }
      : null
  );
  const [answer, setAnswer] = useState("");
  const [localCheckCorrect, setLocalCheckCorrect] = useState<boolean | null>(null);
  const [content, setContent] = useState<PracticeContent>({});
  const [previewEvaluation, setPreviewEvaluation] =
    useState<EvaluationResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [confusedOpen, setConfusedOpen] = useState(false);
  const [copiedActivity, setCopiedActivity] = useState(false);
  const [introChoice, setIntroChoice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (previewMode) return;
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
  }, [courseSlug, lessonSlug, previewMode]);

  useEffect(() => {
    if (previewMode) return;
    refresh().catch(() =>
      setMessage("互动学习暂时读取失败，请稍后刷新。")
    );
  }, [previewMode, refresh]);

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

  const step = plan.steps[currentStep];
  const canAdvance =
    step?.kind === "CHECK"
      ? Boolean(checkPassed)
      : step?.kind === "PRACTICE"
        ? !plan.requiresPractice || (Boolean(practicePassed) && Boolean(realAiPassed))
        : step?.kind === "CAPABILITY"
          ? requiredGateStates.every(Boolean)
          : true;

  async function submitCheck() {
    if (!check || !answer) return;
    if (previewMode) {
      const correct = answer === previewCheck?.correctValue;
      setLocalCheckCorrect(correct);
      setMessage(
        correct
          ? "理解检查已通过。这只是 Draft Preview，不会保存学习记录。"
          : previewCheck?.explanation ?? "还没有通过。对照本课说明后再试一次。"
      );
      return;
    }
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

  if (!interactive || !runtime || !step) {
    return <section className="interactive-lesson guided-lesson guided-loading-panel">
      <div className="kicker">引导式学习</div>
      <h2>{message ? "课程互动暂时没有准备好" : "正在准备这一课…"}</h2>
      <p>{message ?? "正在读取本课 Step、互动内容和完成条件。"}</p>
    </section>;
  }

  return (
    <section className="interactive-lesson guided-lesson" id="lesson-runtime">
      <div className="guided-lesson-top">
        <div>
          <div className="kicker">引导式学习</div>
          <h2>{step.title}</h2>
          <p>{step.objective}</p>
        </div>
        <div className="guided-progress-copy">
          <strong>{currentStep + 1} / {plan.steps.length}</strong>
          <span>{step.kind}</span>
        </div>
      </div>

      <div className="guided-progress-track" aria-label="学习进度">
        {previewMode && (
          <div className="guided-preview-mode-note">
            <strong>Human Review 预览</strong>
            <span>本页只用于体验课程草稿，不保存进度、不产生完成状态、不会发布。</span>
          </div>
        )}
        {plan.steps.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={index === currentStep ? "is-current" : index < currentStep ? "is-done" : ""}
            onClick={() => {
              if (index <= currentStep || (index === currentStep + 1 && canAdvance)) {
                setCurrentStep(index);
                setConfusedOpen(false);
              }
            }}
          >
            <span>{index + 1}</span>
            <small>{item.title}</small>
          </button>
        ))}
      </div>

      {!runtime.configurationReady && (
        <div className="interactive-message">
          <strong>当前课程 Runtime 尚未全部准备完成</strong>
          {runtime.blockers.map((blocker) => (
            <p key={blocker}>{runtimeBlockerMessage(blocker)}</p>
          ))}
        </div>
      )}

      <div className="guided-step-panel">
      {step.kind === "EXPLAIN" && previewMode && previewIntroChoice ? (
        <div className="guided-step-content guided-intro-choice">
          <div className="guided-step-label">先做一个判断</div>
          <h3>{previewIntroChoice.question}</h3>
          <div className="guided-intro-options">
            {previewIntroChoice.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={introChoice === option.value ? "is-selected" : ""}
                onClick={() => setIntroChoice(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {introChoice && (
            <>
              <div className="guided-intro-reveal">
                <strong>为什么</strong>
                <p>{previewIntroChoice.options.find((option) => option.value === introChoice)?.explanation}</p>
              </div>
              <div className="guided-intro-compare">
                {previewIntroChoice.comparison.map((item) => (
                  <div key={item.term}>
                    <span>{item.term}</span>
                    <strong>{item.meaning}</strong>
                  </div>
                ))}
              </div>
              <div className="guided-key-highlight guided-intro-takeaway">
                <strong>记住这一句</strong>
                <p>{previewIntroChoice.takeaway}</p>
              </div>
            </>
          )}
        </div>
      ) : step.kind === "EXPLAIN" && (
        <div className="guided-step-content">
          <div className="guided-step-label">理解核心概念</div>
          <h3>{lesson.plainExplanation}</h3>
          <div className="guided-key-highlight">
            <strong>为什么值得学</strong>
            <p>{lesson.whyItMatters}</p>
          </div>
          <div className="guided-review-points">
            {lesson.points.map((point) => <div key={point}><strong>{point}</strong></div>)}
          </div>
          <div className="guided-explain-notes">
            {lesson.content.map((paragraph) => <div key={paragraph}>{paragraph}</div>)}
          </div>
        </div>
      )}

      {step.kind === "EXAMPLE" && (
        <div className="guided-step-content">
          <div className="guided-step-label">案例</div>
          <h3>{lesson.example.title}</h3>
          <p>{lesson.example.situation}</p>
          {(lesson.example.before || lesson.example.after) && <div className="guided-case-compare">
            {lesson.example.before && <div><span>原来的做法</span><p>{lesson.example.before}</p></div>}
            {lesson.example.after && <div><span>调整后的做法</span><p>{lesson.example.after}</p></div>}
          </div>}
          <div className="guided-gain"><strong>结果</strong><p>{lesson.example.result}</p></div>

        </div>
      )}

      {step.kind === "CHECK" && plan.requiresCheck && check && (
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

      {step.kind === "CHECK" && plan.requiresCheck && !check && (
        <div className="interactive-block">
          <div className="kicker">理解检查</div>
          <h3>Required Check 尚未配置</h3>
          <p>{runtimeBlockerMessage("CHECK_NOT_CONFIGURED")}</p>
        </div>
      )}

      {step.kind === "PRACTICE" && previewMode && !plan.requiresPractice && previewActivity && (
        <div className="guided-step-content guided-preview-activity">
          <div className="guided-step-label">动手体验</div>
          <h3>{previewActivity.title}</h3>
          <p>{previewActivity.instruction}</p>
          {previewActivity.prompt && (
            <>
              <div className="guided-preview-prompt">{previewActivity.prompt}</div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  await navigator.clipboard.writeText(previewActivity.prompt ?? "");
                  setCopiedActivity(true);
                }}
              >
                {copiedActivity ? "✓ 已复制，去你的 AI 软件试一下" : "复制这段话"}
              </button>
            </>
          )}
          <div className="guided-gain">
            <strong>你应该得到什么</strong>
            <p>{previewActivity.reflection}</p>
          </div>
        </div>
      )}

      {step.kind === "PRACTICE" && plan.requiresPractice && practice && (
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

      {step.kind === "PRACTICE" && plan.requiresPractice && !practice && (
        <div className="interactive-block" id="interactive-practice">
          <div className="kicker">实操验收</div>
          <h3>Required Practice 尚未配置</h3>
          <p>{runtimeBlockerMessage("PRACTICE_NOT_CONFIGURED")}</p>
        </div>
      )}

      {step.kind === "PRACTICE" && plan.requiresRealAi && (
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

      {step.kind === "REVIEW" && (
        <div className="guided-step-content">
          <div className="guided-step-label">学习回顾</div>
          <h3>用结果反查你是否真的理解</h3>
          <div className="guided-misconception-grid">
            {lesson.mistakes.map((item) => {
              const [misconception, correction] = item.split("｜");
              return (
                <div key={item} className="guided-misconception-card">
                  <div><span>容易误解</span><p>{misconception.replace(/^误区：/, "")}</p></div>
                  <div><span>正确理解</span><p>{(correction ?? "").replace(/^正确理解：/, "")}</p></div>
                </div>
              );
            })}
          </div>
          <div className="guided-gain">
            <strong>下一步关联</strong>
            <p>{lesson.related.join(" · ")}</p>
          </div>
        </div>
      )}

      {step.kind === "CAPABILITY" && (
        <div className="guided-step-content">
          <div className="guided-step-label">能力获得</div>
          <h3>这一课最终要留下的是可重复使用的能力</h3>
          <div className="guided-achievement-list">
            {plan.capabilityGain.map((item) => <div key={item}><span>✓</span><p>{item}</p></div>)}
          </div>
          {plan.nextLessonValue && <div className="guided-next-value"><div><span>继续学习</span><strong>{plan.nextLessonValue}</strong></div></div>}
        </div>
      )}
      </div>

      {confusedOpen && (
        <div className="guided-confused-panel">
          <span>提示</span>
          <strong>{step.objective}</strong>
          <p>先只完成当前这一步，不需要一次理解整课。对照上面的目标，再检查你缺的是概念、判断还是练习结果。</p>
        </div>
      )}

      {message && <div className="interactive-message">{message}</div>}

      <div className="guided-step-nav">
        <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep((value) => Math.max(0, value - 1))} disabled={currentStep === 0}>← 上一步</button>
        <div><span>{step.title}</span><small>{currentStep + 1} / {plan.steps.length}</small></div>
        <button type="button" className="guided-confused-button" onClick={() => setConfusedOpen((value) => !value)}>还是不懂</button>
        {currentStep < plan.steps.length - 1 && (
          <button type="button" className="btn btn-primary" disabled={!canAdvance} onClick={() => {
            if (!canAdvance) return;
            setCurrentStep((value) => Math.min(plan.steps.length - 1, value + 1));
            setConfusedOpen(false);
          }}>下一步 →</button>
        )}
      </div>
    </section>
  );
}
