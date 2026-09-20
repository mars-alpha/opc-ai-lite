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
import { evaluateCourseBuilderCheck } from "../lib/learning/course-builder";
import {
  isThreeQuestionMasteryComplete,
  isThreeQuestionMasterySequence
} from "../lib/learning/check-evaluator";

type InteractiveData = {
  authenticated: boolean;
  checks: Array<{
    id: string;
    type: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    question: string;
    options: Array<{ value: string; label: string }>;
    required: boolean;
    state: null | {
      answer: string;
      answers: string[];
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
  questionType?: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
  question: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  correctValue?: string;
  correctValues?: ReadonlyArray<string>;
  explanation: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
};

type PreviewActivity = {
  kind?: "CHOOSE" | "CLASSIFY" | "SHORT_RESPONSE" | "COPY_TO_AI" | "COMPARE" | "REVEAL" | "MINI_TASK";
  title: string;
  instruction: string;
  prompt: string | null;
  reflection: string;
};


type PreviewPractice = {
  id: string;
  title: string;
  goal: string;
  instructions: ReadonlyArray<{ key: string; label: string; prompt: string }>;
  hints: ReadonlyArray<string>;
  rubric: ReadonlyArray<{
    key: string;
    label: string;
    maxScore: number;
    minScore: number;
    example: string;
  }>;
  passScore: number;
};

type PreviewReferenceFill = Record<string, string>;

type PreviewIntroComparison = {
  situation: string;
  approaches: ReadonlyArray<{
    label: string;
    text: string;
  }>;
  comparison: ReadonlyArray<{
    term: string;
    meaning: string;
  }>;
  comparisonPlacement?: "MIDDLE" | "BOTTOM";
  bottomDetails?: ReadonlyArray<{
    title: string;
    text: string;
  }>;
  takeaway: string;
};

type PreviewKnowledgeDepth = {
  example: ReadonlyArray<{ title: string; text: string }>;
  review: ReadonlyArray<{ title: string; text: string }>;
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

function stepPedagogyLabel(kind: LessonRuntimePlan["steps"][number]["kind"]) {
  if (kind === "EXPLAIN") return "建立直觉";
  if (kind === "EXAMPLE") return "讲透方法";
  if (kind === "CHECK") return "检查理解";
  if (kind === "PRACTICE") return "动手实操";
  if (kind === "REVIEW") return "复盘框架";
  return "能力获得";
}

function runtimeBlockerMessage(blocker: string) {
  if (blocker === "CHECK_NOT_CONFIGURED") {
    return "本课 required Check 尚未完成正式配置，因此理解检查不会伪造为可用。";
  }
  if (blocker === "PRACTICE_NOT_CONFIGURED") {
    return "本课 required Practice 尚未完成正式配置，因此实操提交与评分不会伪造为可用。";
  }
  if (blocker === "DELIVERABLE_RUNTIME_NOT_SUPPORTED") {
    return "本课要求正式 Deliverable（项目交付物）作为 Completion Gate。当前 Deliverable Runtime 尚未接入，因此这里只能验证项目草稿质量，不会伪造正式项目完成状态。";
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
  previewCheckSequence = null,
  previewActivity = null,
  previewPractice = null,
  previewReferenceAnswer = null,
  previewReferenceFill = null,
  previewKnowledgeDepth = null,
  previewReviewCardFill = false,
  previewIntroComparison = null
}: {
  courseSlug: string;
  lessonSlug: string;
  plan: LessonRuntimePlan;
  lesson: Lesson;
  previewMode?: boolean;
  previewCheck?: PreviewCheck | null;
  previewCheckSequence?: ReadonlyArray<PreviewCheck> | null;
  previewActivity?: PreviewActivity | null;
  previewPractice?: PreviewPractice | null;
  previewReferenceAnswer?: string | null;
  previewReferenceFill?: PreviewReferenceFill | null;
  previewKnowledgeDepth?: PreviewKnowledgeDepth | null;
  previewReviewCardFill?: boolean;
  previewIntroComparison?: PreviewIntroComparison | null;
}) {
  const [interactive, setInteractive] = useState<InteractiveData | null>(() =>
    previewMode
      ? {
          authenticated: false,
          checks: previewCheckSequence?.length
            ? previewCheckSequence.map((item) => ({
                id: item.id,
                type: item.questionType ?? "SINGLE_CHOICE",
                question: item.question,
                options: [...item.options],
                required: true,
                state: null
              }))
            : previewCheck
              ? [{
                  id: previewCheck.id,
                  type: previewCheck.questionType ?? "SINGLE_CHOICE",
                  question: previewCheck.question,
                  options: [...previewCheck.options],
                  required: true,
                  state: null
                }]
              : [],
          practices: previewPractice
            ? [{
                id: previewPractice.id,
                title: previewPractice.title,
                goal: previewPractice.goal,
                instructions: [...previewPractice.instructions],
                hints: [...previewPractice.hints],
                rubric: [...previewPractice.rubric],
                passScore: previewPractice.passScore,
                required: true,
                state: null
              }]
            : []
        }
      : null
  );
  const [runtime, setRuntime] = useState<RuntimeData | null>(() =>
    previewMode
      ? {
          registered: false,
          configurationReady: true,
          enforcementActive: false,
          blockers: plan.requiresDeliverable ? ["DELIVERABLE_RUNTIME_NOT_SUPPORTED"] : [],
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
  const [previewAnswers, setPreviewAnswers] = useState<string[]>([]);
  const [localCheckCorrect, setLocalCheckCorrect] = useState<boolean | null>(null);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0);
  const [localPassedCheckIds, setLocalPassedCheckIds] = useState<string[]>([]);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);
  const [content, setContent] = useState<PracticeContent>({});
  const [previewEvaluation, setPreviewEvaluation] =
    useState<EvaluationResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [confusedOpen, setConfusedOpen] = useState(false);
  const [copiedActivity, setCopiedActivity] = useState(false);
  const [copiedReferenceAnswer, setCopiedReferenceAnswer] = useState(false);
  const [filledReferenceAnswer, setFilledReferenceAnswer] = useState(false);

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

    const requiredChecks = nextInteractive.checks.filter((item) => item.required);
    const nextChecks = requiredChecks.length ? requiredChecks : nextInteractive.checks;
    const masterySequence = isThreeQuestionMasterySequence(nextChecks);
    const firstUnpassedIndex = masterySequence
      ? nextChecks.findIndex((item) => item.state?.isCorrect !== true)
      : 0;
    const nextIndex =
      masterySequence && firstUnpassedIndex === -1
        ? Math.max(0, nextChecks.length - 1)
        : Math.max(0, firstUnpassedIndex);
    setCurrentCheckIndex(nextIndex);
    const nextCheck = nextChecks[nextIndex];
    if (nextCheck?.state) {
      setAnswer(nextCheck.state.answer);
      setPreviewAnswers(
        nextCheck.state.answers?.length
          ? nextCheck.state.answers
          : nextCheck.state.answer
            ? [nextCheck.state.answer]
            : []
      );
      setCheckFeedback(nextCheck.state.explanation);
      setLocalCheckCorrect(nextCheck.state.isCorrect);
    }

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

  const checkSequence = useMemo(() => {
    const requiredChecks = interactive?.checks.filter((item) => item.required) ?? [];
    return requiredChecks.length ? requiredChecks : interactive?.checks ?? [];
  }, [interactive]);
  const isMasterySequence = isThreeQuestionMasterySequence(checkSequence);
  const check = useMemo(
    () => checkSequence[currentCheckIndex] ?? checkSequence[0] ?? null,
    [checkSequence, currentCheckIndex]
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
  const checkPassed = isMasterySequence
    ? isThreeQuestionMasteryComplete(
        checkSequence.map((item) => ({
          type: item.type,
          required: item.required,
          isCorrect:
            item.state?.isCorrect === true || localPassedCheckIds.includes(item.id)
        }))
      )
    : check?.state?.isCorrect || localCheckCorrect === true;
  const practicePassed =
    practice?.state?.status === "PASSED" || evaluation?.passed === true;
  const projectDraftPassed =
    plan.lessonType === "PROJECT" && evaluation?.passed === true;
  const realAiPassed =
    !plan.requiresRealAi || runtime?.gates.realAi.satisfied === true;

  const requiredGateStates = [
    ...(plan.requiresCheck ? [Boolean(checkPassed)] : []),
    ...(plan.requiresPractice ? [Boolean(practicePassed)] : []),
    ...(plan.requiresRealAi ? [Boolean(realAiPassed)] : []),
    ...(plan.requiresDeliverable ? [false] : [])
  ];

  const step = plan.steps[currentStep];
  const canAdvance =
    step?.kind === "CHECK"
      ? Boolean(checkPassed)
      : step?.kind === "PRACTICE"
        ? plan.lessonType === "PROJECT"
          ? Boolean(projectDraftPassed)
          : !plan.requiresPractice || (Boolean(practicePassed) && Boolean(realAiPassed))
        : step?.kind === "CAPABILITY"
          ? requiredGateStates.every(Boolean)
          : true;

  async function submitCheck() {
    if (!check || (!answer && previewAnswers.length === 0)) return;
    if (previewMode) {
      const previewSource = isMasterySequence
        ? previewCheckSequence?.[currentCheckIndex]
        : previewCheck;
      const questionType = previewSource?.questionType ?? "SINGLE_CHOICE";
      const correctValues =
        previewSource?.correctValues ??
        (previewSource?.correctValue ? [previewSource.correctValue] : []);
      const correct = evaluateCourseBuilderCheck(
        { questionType, correctValues: [...correctValues] },
        previewAnswers.length > 0 ? previewAnswers : [answer]
      );
      setLocalCheckCorrect(correct);
      if (correct) {
        setLocalPassedCheckIds((current) =>
          current.includes(check.id) ? current : [...current, check.id]
        );
      }
      setCheckFeedback(
        correct
          ? previewSource?.correctFeedback ?? previewSource?.explanation ?? "判断正确。"
          : previewSource?.incorrectFeedback ?? previewSource?.explanation ?? "这个判断需要调整。"
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
          body: JSON.stringify(
            check.type === "MULTI_SELECT"
              ? { answers: previewAnswers }
              : { answer: previewAnswers[0] ?? answer }
          )
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error("CHECK_FAILED");

      const correct = result?.correct === true;
      setLocalCheckCorrect(correct);
      if (correct) {
        setLocalPassedCheckIds((current) =>
          current.includes(check.id) ? current : [...current, check.id]
        );
      }
      setCheckFeedback(result?.explanation ?? (correct ? "判断正确。" : "这个判断需要调整。"));
    } catch {
      setMessage("理解检查提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  function goToNextMasteryQuestion() {
    if (
      !isMasterySequence ||
      currentCheckIndex >= checkSequence.length - 1 ||
      !(localCheckCorrect === true || check?.state?.isCorrect === true)
    ) {
      return;
    }
    setCurrentCheckIndex((current) => current + 1);
    setAnswer("");
    setPreviewAnswers([]);
    setLocalCheckCorrect(null);
    setCheckFeedback(null);
    setMessage(null);
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
                setMessage(null);
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
      {step.kind === "EXPLAIN" && previewMode && previewIntroComparison ? (
        <div className="guided-step-content guided-intro-comparison">
          <div className="guided-step-label">从一个真实场景开始</div>
          <h3>{previewIntroComparison.situation}</h3>
          <div className="guided-intro-approaches">
            {previewIntroComparison.approaches.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          {previewIntroComparison.comparison.length > 0 && previewIntroComparison.comparisonPlacement !== "BOTTOM" && (
            <div className="guided-intro-compare">
              {previewIntroComparison.comparison.map((item) => (
                <div key={item.term}>
                  <span>{item.term}</span>
                  <strong>{item.meaning}</strong>
                </div>
              ))}
            </div>
          )}
          <div className="guided-key-highlight guided-intro-takeaway">
            <strong>记住这一句</strong>
            <p>{previewIntroComparison.takeaway}</p>
          </div>
          {previewIntroComparison.comparison.length > 0 && previewIntroComparison.comparisonPlacement === "BOTTOM" && (
            <div className="guided-knowledge-depth guided-knowledge-depth-review">
              {previewIntroComparison.comparison.map((item) => (
                <div key={item.term}>
                  <strong>{item.term}</strong>
                  <p>{item.meaning}</p>
                </div>
              ))}
            </div>
          )}
          {previewIntroComparison.bottomDetails?.length ? (
            <div className="guided-knowledge-depth guided-knowledge-depth-review">
              {previewIntroComparison.bottomDetails.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          ) : null}
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
          {previewMode && previewKnowledgeDepth?.example.length ? (
            <div className="guided-knowledge-depth">
              {previewKnowledgeDepth.example.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          ) : null}

        </div>
      )}

      {step.kind === "CHECK" && plan.requiresCheck && check && (
        <div className="interactive-block">
          <div className="kicker">
            {isMasterySequence
              ? `理解检查 · ${currentCheckIndex + 1}/3`
              : "理解检查"}
          </div>
          <h3>{check.question}</h3>
          <div className="interactive-options">
            {check.options.map((option) => {
              const multiSelect = check.type === "MULTI_SELECT";
              const checked = multiSelect
                ? previewAnswers.includes(option.value)
                : answer === option.value;
              return (
                <label key={option.value}>
                  <input
                    type={multiSelect ? "checkbox" : "radio"}
                    name={"check-" + check.id}
                    value={option.value}
                    checked={checked}
                    onChange={(event) => {
                      if (multiSelect) {
                        setPreviewAnswers((current) =>
                          event.target.checked
                            ? [...current, option.value]
                            : current.filter((value) => value !== option.value)
                        );
                      } else {
                        setAnswer(event.target.value);
                        setPreviewAnswers([event.target.value]);
                      }
                      setLocalCheckCorrect(null);
                      setCheckFeedback(null);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitCheck}
              disabled={
                (!answer && previewAnswers.length === 0) ||
                busy === "check" ||
                (isMasterySequence
                  ? localCheckCorrect === true || check.state?.isCorrect === true
                  : checkPassed)
              }
            >
              {!isMasterySequence && checkPassed
                ? "✓ 理解检查已通过"
                : busy === "check"
                  ? "正在检查…"
                  : "检查答案"}
            </button>
          </div>
          {checkFeedback && (
            <div className="guided-gain">
              <strong>
                {localCheckCorrect === true || check.state?.isCorrect === true
                  ? "为什么这个判断正确"
                  : "为什么这个判断不成立"}
              </strong>
              <p>{checkFeedback}</p>
            </div>
          )}
          {isMasterySequence &&
            checkFeedback &&
            !(localCheckCorrect === true || check.state?.isCorrect === true) && (
              <div className="guided-key-highlight">
                <strong>根据反馈再选一次</strong>
                <p>先理解上面的判断依据，再重新选择。答对后才会进入下一题。</p>
              </div>
            )}
          {isMasterySequence &&
            checkFeedback &&
            (localCheckCorrect === true || check.state?.isCorrect === true) &&
            currentCheckIndex < checkSequence.length - 1 && (
              <div className="interactive-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={goToNextMasteryQuestion}
                >
                  下一题
                </button>
              </div>
            )}
          {isMasterySequence &&
            checkPassed &&
            currentCheckIndex === checkSequence.length - 1 && (
              <div className="guided-key-highlight">
                <strong>理解检查已完成</strong>
                <p>三道题都已答对，可以进入下一步实操。</p>
              </div>
            )}
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

      {step.kind === "PRACTICE" && (plan.requiresPractice || (previewMode && plan.lessonType === "PROJECT")) && practice && (
        <div className="interactive-block" id="interactive-practice">
          <div className="kicker">{plan.lessonType === "PROJECT" ? "项目草稿验收" : "实操验收"}</div>
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
              disabled={busy === "practice" || (plan.lessonType === "PROJECT" ? projectDraftPassed : practicePassed)}
            >
              {(plan.lessonType === "PROJECT" ? projectDraftPassed : practicePassed)
                ? plan.lessonType === "PROJECT"
                  ? "✓ 项目草稿已通过"
                  : "✓ 实操已通过"
                : busy === "practice"
                  ? "正在检查…"
                  : evaluation
                    ? "修改后重新检查"
                    : "检查我的结果"}
            </button>
          </div>

          {previewMode && previewActivity?.kind === "COPY_TO_AI" && (
            <div className="guided-preview-activity guided-application-test">
              <div className="guided-step-label">放进你的 AI 软件试一下</div>
              <p>{previewActivity.instruction}</p>
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  const combined = practice.instructions
                    .map((item) => item.label + "：" + (content[item.key] ?? "").trim())
                    .filter((item) => !item.endsWith("："))
                    .join("\n");
                  if (!combined) {
                    setMessage("先把上面的练习内容填好，再复制。");
                    return;
                  }
                  await navigator.clipboard.writeText(combined);
                  setCopiedActivity(true);
                }}
              >
                {copiedActivity ? "✓ 已复制我的提示词" : "复制我的提示词"}
              </button>
              <div className="guided-gain">
                <strong>比较两次结果</strong>
                <p>{previewActivity.reflection}</p>
              </div>
            </div>
          )}

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

          {previewMode && evaluation && !evaluation.passed && previewReferenceAnswer && (
            <div className="guided-reference-answer">
              <div className="guided-step-label">还是卡住？先参考一个完整答案</div>
              <p>你可以先看懂它为什么合格，再修改自己的版本。复制参考答案不会自动判定练习通过。</p>
              <div className="guided-preview-prompt">{previewReferenceAnswer}</div>
              <div className="interactive-actions">
                {previewReferenceFill && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setContent((current) => ({ ...current, ...previewReferenceFill }));
                      setPreviewEvaluation(null);
                      setMessage("参考答案已填入。你可以继续修改，然后重新检查。");
                      setFilledReferenceAnswer(true);
                    }}
                  >
                    {filledReferenceAnswer ? "✓ 已填入参考答案" : "一键填充参考答案"}
                  </button>
                )}
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    await navigator.clipboard.writeText(previewReferenceAnswer);
                    setCopiedReferenceAnswer(true);
                  }}
                >
                  {copiedReferenceAnswer ? "✓ 已复制参考答案" : "复制参考答案"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step.kind === "PRACTICE" && (plan.requiresPractice || (previewMode && plan.lessonType === "PROJECT")) && !practice && (
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
          <div
            className={`guided-misconception-grid${previewReviewCardFill ? " is-fill-layout" : ""}`}
          >
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
          {previewMode && previewKnowledgeDepth?.review.length ? (
            <div className="guided-knowledge-depth guided-knowledge-depth-review">
              {previewKnowledgeDepth.review.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          ) : null}
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
        <button type="button" className="btn btn-secondary" onClick={() => {
          setCurrentStep((value) => Math.max(0, value - 1));
          setMessage(null);
          setConfusedOpen(false);
        }} disabled={currentStep === 0}>← 上一步</button>
        <div><span>{stepPedagogyLabel(step.kind)}</span><small>{currentStep + 1} / {plan.steps.length}</small></div>
        <button type="button" className="guided-confused-button" onClick={() => setConfusedOpen((value) => !value)}>还是不懂</button>
        {currentStep < plan.steps.length - 1 && (
          <button type="button" className="btn btn-primary" disabled={!canAdvance} onClick={() => {
            if (!canAdvance) return;
            setCurrentStep((value) => Math.min(plan.steps.length - 1, value + 1));
            setConfusedOpen(false);
            setMessage(null);
          }}>下一步 →</button>
        )}
      </div>
    </section>
  );
}
