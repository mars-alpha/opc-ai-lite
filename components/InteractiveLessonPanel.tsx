"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  rulePracticeEvaluator,
  type EvaluationResult as Evaluation,
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
    instructions: Array<{
      key: string;
      label: string;
      prompt: string;
    }>;
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
    instructions: Array<{ key: string; label: string; prompt: string }>;
    hints: string[];
    rubric: Array<{
      key: string;
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

const referenceContent: PracticeContent = {
  goal: "把本周项目会议记录整理成一份可执行的行动摘要，帮助项目负责人快速安排后续工作。",
  context: "这份摘要用于明天上午的项目例会，阅读者是项目负责人和各任务负责人。",
  input: "只依据本周会议记录、现有任务清单和已确认的截止时间。",
  constraint: "不得补充原文没有的事实；不确定的信息必须标记“待确认”；必须保留负责人和截止时间。",
  output: "按“事项 / 决策 / 负责人 / 截止时间 / 风险”五栏表格输出，最后补充 3 条最需要关注的风险。"
};


export function InteractiveLessonPanel({
  courseSlug,
  lessonSlug,
  practiceId,
  previewMode = false
}: {
  courseSlug: string;
  lessonSlug: string;
  practiceId: string;
  previewMode?: boolean;
}) {
  const [data, setData] = useState<InteractiveData | null>(null);
  const [practiceData, setPracticeData] = useState<PracticeReadModel | null>(null);
  const [content, setContent] = useState<PracticeContent>(emptyContent);
  const [answer, setAnswer] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [localCheckCorrect, setLocalCheckCorrect] = useState<boolean | null>(null);
  const [previewEvaluation, setPreviewEvaluation] = useState<Evaluation | null>(null);
  const [referenceVisible, setReferenceVisible] = useState(false);
  const [savedUserContent, setSavedUserContent] = useState<PracticeContent | null>(null);
  const [stillConfusedOpen, setStillConfusedOpen] = useState(false);
  const [practiceDirty, setPracticeDirty] = useState(false);
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [finalAnswerVisible, setFinalAnswerVisible] = useState(false);
  const [selfAssessment, setSelfAssessment] = useState<"INDEPENDENT" | "WITH_REFERENCE" | "NEEDS_PRACTICE" | null>(null);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams({ courseSlug, lessonSlug });
    const [interactiveResponse, practiceResponse] = await Promise.all([
      fetch("/api/learning/interactive?" + params.toString(), { cache: "no-store" }),
      fetch("/api/learning/practices/" + practiceId, { cache: "no-store" })
    ]);
    if (!interactiveResponse.ok || (!previewMode && !practiceResponse.ok)) {
      throw new Error("INTERACTIVE_READ_FAILED");
    }
    const next = (await interactiveResponse.json()) as InteractiveData;
    const nextPractice = practiceResponse.ok
      ? ((await practiceResponse.json()) as PracticeReadModel)
      : null;
    setData(next);
    setPracticeData(nextPractice);
    const latest = nextPractice?.latestSubmission?.content;
    if (latest) setContent({ ...emptyContent, ...latest });
    if (nextPractice?.latestSubmission?.evaluation?.result) setPracticeChecked(true);
    const previousAnswer = next.checks[0]?.state?.answer;
    if (previousAnswer) setAnswer(previousAnswer);
  }, [courseSlug, lessonSlug, practiceId, previewMode]);

  useEffect(() => {
    refresh().catch(() => setMessage("互动练习暂时读取失败，请稍后刷新。"));
  }, [refresh]);

  const check = data?.checks[0] ?? null;
  const practice = useMemo(() => {
    if (practiceData?.content) {
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
    }

    return data?.practices.find((item) => item.id === practiceId) ?? data?.practices[0] ?? null;
  }, [data, practiceData, practiceId]);
  const evaluation = practiceDirty ? null : (previewEvaluation ?? practice?.state?.evaluation ?? null);

  async function submitCheck() {
    if (!check || !answer) return;
    setBusy("check");
    setMessage(null);
    try {
      const response = await fetch("/api/learning/checks/" + check.id + "/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer, preview: previewMode })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error("CHECK_FAILED");

      if (previewMode || !data?.authenticated) {
        const correct = result?.correct === true;
        setLocalCheckCorrect(correct);
        setMessage(
          correct
            ? "回答正确。当前为体验模式，登录后可以保存学习记录。"
            : "还差一点。先看下面的提示，再试一次。"
        );
        return;
      }

      await refresh();
    } catch {
      setMessage("理解检查提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function submitPractice() {
    if (!practice) return;
    if (previewMode) {
      setBusy("practice");
      setMessage(null);
      try {
        const result = await rulePracticeEvaluator({
          content,
          rubric: practice.rubric,
          passScore: practice.passScore
        });
        setPreviewEvaluation(result);
        setPracticeDirty(false);
        setPracticeChecked(true);
        setMessage(result.passed ? "检查通过。你可以继续学习。" : "检查完成。按下面的具体反馈修改后，再检查一次。");
      } finally {
        setBusy("");
      }
      return;
    }
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
      setPracticeDirty(false);
      setPracticeChecked(true);
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
    eventName:
      | "hint_revealed"
      | "still_confused"
      | "reference_viewed"
      | "reference_applied"
      | "reference_restored"
      | "learning_self_assessment"
      | "practice_retry_requested",
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

  function showStillConfused() {
    setStillConfusedOpen(true);
    recordClientEvent("still_confused", { step: currentStep + 1, practiceId: practice?.id ?? null });
  }

  function showReference() {
    setReferenceVisible((value) => !value);
    recordClientEvent("reference_viewed", { practiceId: practice?.id ?? null });
  }

  function applyReference() {
    if (!savedUserContent) setSavedUserContent(content);
    setReferenceVisible(true);
    setContent(referenceContent);
    setPreviewEvaluation(null);
    setPracticeDirty(true);
    recordClientEvent("reference_applied", { practiceId: practice?.id ?? null });
  }

  function restoreUserContent() {
    if (!savedUserContent) return;
    setContent(savedUserContent);
    setSavedUserContent(null);
    setPreviewEvaluation(null);
    setPracticeDirty(true);
    recordClientEvent("reference_restored", { practiceId: practice?.id ?? null });
  }


  if (!data) {
    return (
      <section className="interactive-lesson guided-lesson guided-loading-panel">
        <div className="kicker">引导式学习</div>
        <h2>{message ? "课程互动暂时没有准备好" : "正在准备这一课的互动内容…"}</h2>
        <p>{message ?? "正在读取案例、理解检查、提示和评分标准。"}</p>
      </section>
    );
  }

  if (!check || !practice) {
    return (
      <section className="interactive-lesson guided-lesson guided-loading-panel">
        <div className="kicker">引导式学习</div>
        <h2>这一课的互动数据暂时不完整</h2>
        <p>请刷新页面重试。课程正文不会丢失；如果持续出现，请检查 Interactive / Practice 数据。</p>
      </section>
    );
  }

  const steps = [
    "先理解",
    "看案例",
    "理解检查",
    "自己做",
    "学习回顾",
    "能力获得"
  ];
  const checkPassed = Boolean(check.state?.isCorrect) || localCheckCorrect === true;
  const canGoNext = currentStep === 2 ? checkPassed : currentStep === 3 ? Boolean(evaluation?.passed) : true;

  function goNext() {
    if (!canGoNext) return;
    setStillConfusedOpen(false);
    setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function goPrevious() {
    setStillConfusedOpen(false);
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  return (
    <section className="interactive-lesson guided-lesson" id="interactive-practice">
      <div className="guided-lesson-top">
        <div>
          <div className="kicker">引导式学习</div>
          <h2>把一个模糊任务，变成 AI 真正能执行的任务简报</h2>
          <p>这一课不要求一次看完。每一步只完成一个目标：先理解，再判断，再用你自己的任务做一次。</p>
        </div>
        <div className="guided-progress-copy">
          <strong>{currentStep + 1} / {steps.length}</strong>
          <span>{steps[currentStep]}</span>
        </div>
      </div>

      <div className="guided-progress-track" aria-label="学习进度">
        {steps.map((label, index) => (
          <button
            type="button"
            key={label}
            className={index === currentStep ? "is-current" : index < currentStep ? "is-done" : ""}
            onClick={() => {
              if (index <= currentStep || (index === currentStep + 1 && canGoNext)) setCurrentStep(index);
            }}
            aria-label={"第 " + (index + 1) + " 步：" + label}
          >
            <span>{index + 1}</span>
            <small>{label}</small>
          </button>
        ))}
      </div>

      {previewMode && (
        <div className="guided-preview-mode-note">
          <strong>样板体验模式</strong>
          <p>你可以完整体验 6 步学习和同规则评分；体验结果不会写入正式学习进度，也不会绕过课程前置条件。</p>
        </div>
      )}

      {!data.authenticated && (
        <div className="interactive-login-note">
          你可以完整体验课程结构；登录后才能保存理解检查、实操结果和重试记录。
          <Link href={"/auth?mode=login&returnTo=" + encodeURIComponent(
            "/courses/" + courseSlug + "/lessons/" + lessonSlug + "#interactive-practice"
          )}>登录后保存学习进度 →</Link>
        </div>
      )}

      <div className="guided-step-panel">
        {currentStep === 0 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 1 步 · 基础说明</div>
            <h3>提示词（Prompt）不是“神奇句式”，而是把任务说明清楚</h3>
            <p>一个稳定的 AI 任务，至少要让模型知道五件事：要完成什么、背景是什么、根据什么材料做、哪些边界不能违反、最后要交付什么。</p>
            <div className="guided-five-grid">
              <div><strong>任务目标</strong><span>Goal · 最终要完成什么</span></div>
              <div><strong>背景信息</strong><span>Context · 谁使用、为什么做</span></div>
              <div><strong>输入材料</strong><span>Input · 依据哪些资料或数据</span></div>
              <div><strong>限制条件</strong><span>Constraint · 不能做什么、必须遵守什么</span></div>
              <div><strong>输出要求</strong><span>Output · 最终交付成什么样</span></div>
            </div>
            <div className="guided-gain">
              <strong>这一步学会什么</strong>
              <p>你不需要背模板，只需要能判断：一个任务有没有把必要信息说明白。</p>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 2 步 · 案例对照</div>
            <h3>同一个任务，为什么第二种写法更稳定？</h3>
            <div className="guided-case-compare">
              <div>
                <span>模糊任务</span>
                <p>帮我把这份会议记录总结一下。</p>
              </div>
              <div>
                <span>可执行任务</span>
                <p><b>任务目标：</b>整理给项目负责人看的行动摘要。<br/><b>背景信息：</b>用于明早项目会。<br/><b>输入材料：</b>只依据会议记录。<br/><b>限制条件：</b>不得补充原文没有的事实。<br/><b>输出要求：</b>按“决策 / 负责人 / 截止时间 / 风险”四栏输出。</p>
              </div>
            </div>
            <div className="guided-gain">
              <strong>观察重点</strong>
              <p>第二种并不是更“高级”，而是减少了 AI 需要自行猜测的地方。</p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 3 步 · 理解检查</div>
            <h3>哪一项主要负责告诉 AI“不能做什么、必须遵守什么”？</h3>
            <p>先自己判断。答对后即可进入下一步；如果不确定，可以点底部“还是不懂”获取提示。</p>
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
                  <span>{({ GOAL: "任务目标（Goal）", CONTEXT: "背景信息（Context）", CONSTRAINT: "限制条件（Constraint）", OUTPUT: "输出要求（Output）" } as Record<string, string>)[option.value] ?? option.label}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitCheck}
              disabled={!answer || busy === "check"}
            >
              {busy === "check" ? "正在检查…" : checkPassed ? "✓ 已理解" : "检查答案"}
            </button>

            {(check.state || localCheckCorrect !== null) && (
              <div className={"check-feedback " + (checkPassed ? "is-correct" : "is-wrong")}>
                <strong>{checkPassed ? "理解正确 ✓" : "这里需要补一下基础"}</strong>
                <p>{checkPassed ? (check.state?.explanation ?? "限制条件（Constraint）就是任务的行为边界。") : "限制条件（Constraint）负责定义 AI 必须遵守的规则、禁止事项和边界。"}</p>
              </div>
            )}

            {(check.state || localCheckCorrect !== null) && !checkPassed && (
              <div className="guided-review-card">
                <span>建议复习</span>
                <strong>上下文（Context）、Token 与提示词</strong>
                <p>你现在主要是还没有完全区分“任务目标、背景信息、限制条件”的职责。先补这一小块，再回来重试，不需要整课从头学。</p>
                <Link className="btn btn-secondary" href="/courses/ai-literacy/lessons/context-token">
                  去复习对应课程 →
                </Link>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 4 步 · 跟着做，再自己做</div>
            <h3>用你自己的真实任务，写一份可执行任务简报</h3>
            <p>通过标准：总分至少 <b>{practice.passScore}/100</b>，并且五项每一项都至少达到 <b>12/20</b>。不是写得越长越好，而是让别人不需要猜就能执行。</p>
            <div className="guided-review-card"><span>先看一个能通过的方向</span><strong>五项都要具体</strong><p>任务目标写结果；背景信息写给谁用、为什么用；输入材料写依据什么；限制条件写不能做什么；输出要求写最终格式。</p></div>
            <div className="guided-reference-tools">
              <div>
                <strong>不知道第一版怎么写？</strong>
                <p>可以先看参考，或者一键带入一份完整示例，再把它改成你的真实任务。</p>
              </div>
              <div className="interactive-actions">
                <button type="button" className="btn btn-secondary" onClick={showReference}>{referenceVisible ? "收起参考" : "查看参考"}</button>
                <button type="button" className="btn btn-secondary" onClick={applyReference}>一键带入参考</button>
                {savedUserContent && <button type="button" className="btn btn-secondary" onClick={restoreUserContent}>恢复我的版本</button>}
              </div>
            </div>
            {referenceVisible && (
              <div className="guided-reference-card">
                <strong>参考写法 · 不是唯一答案</strong>
                <p>任务目标：{referenceContent.goal}</p>
                <p>背景信息：{referenceContent.context}</p>
                <p>输入材料：{referenceContent.input}</p>
                <p>限制条件：{referenceContent.constraint}</p>
                <p>输出要求：{referenceContent.output}</p>
              </div>
            )}
            <div className="guided-practice-fields">
              {practice.instructions.map((item) => (
                <label key={item.key}>
                  <span>{({ goal: "任务目标（Goal）", context: "背景信息（Context）", input: "输入材料（Input）", constraint: "限制条件（Constraint）", output: "输出要求（Output）" } as Record<string, string>)[item.key] ?? item.label}</span>
                  <small>{item.prompt}</small>
                  <textarea
                    value={content[item.key] ?? ""}
                    onChange={(event) => {
                      setPreviewEvaluation(null);
                      setPracticeDirty(true);
                      setContent((current) => ({ ...current, [item.key]: event.target.value }));
                    }}
                    rows={3}
                    maxLength={3000}
                  />
                </label>
              ))}
            </div>

            <div className="guided-pass-list"><strong>提交前自查</strong><ul><li>五项都已填写</li><li>每一项至少包含一个具体条件或结果</li><li>限制条件里写清至少一个“不能 / 不得 / 必须”</li><li>输出要求写清格式、栏目、长度或结构</li></ul></div>
            <div className="interactive-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setHintCount((current) => {
                    const next = Math.min(current + 1, practice.hints.length);
                    if (next > current) recordClientEvent("hint_revealed", { practiceId: practice.id, hintIndex: next });
                    return next;
                  });
                }}
              >
                {hintCount < practice.hints.length ? "给我一个提示" : "提示已全部展开"}
              </button>
              {evaluation?.passed ? (
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                  继续学习 →
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={submitPractice} disabled={busy === "practice"}>
                  {busy === "practice" ? "正在检查…" : practiceChecked ? "修改后重新检查" : "检查我的答案"}
                </button>
              )}
            </div>

            {hintCount > 0 && (
              <div className="interactive-hints">
                {practice.hints.slice(0, hintCount).map((hint, index) => (
                  <p key={hint}><strong>提示 {index + 1}</strong>{hint.replace("Constraint", "限制条件（Constraint）")}</p>
                ))}
              </div>
            )}

          </div>
        )}

        {currentStep === 4 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 5 步 · 学习回顾</div>
            <h3>回顾一下：你刚刚已经完成了一份可执行任务简报</h3>
            <p>这一课最重要的不是记住五个英文单词，而是知道怎样让 AI 少猜一步、让任务多清楚一步。</p>

            <div className="guided-review-points">
              <div><strong>任务目标</strong><p>先说清楚最终要得到什么结果。</p></div>
              <div><strong>限制条件</strong><p>明确哪些边界不能越过、哪些规则必须遵守。</p></div>
              <div><strong>输出要求</strong><p>把格式、栏目、结构或长度说清楚，减少返工。</p></div>
            </div>

            <div className="guided-final-answer">
              <button type="button" className="btn btn-secondary" onClick={() => setFinalAnswerVisible((value) => !value)}>
                {finalAnswerVisible ? "收起我的最终答案" : "查看我的最终答案"}
              </button>
              {finalAnswerVisible && (
                <div className="guided-reference-card">
                  <p><b>任务目标：</b>{content.goal}</p>
                  <p><b>背景信息：</b>{content.context}</p>
                  <p><b>输入材料：</b>{content.input}</p>
                  <p><b>限制条件：</b>{content.constraint}</p>
                  <p><b>输出要求：</b>{content.output}</p>
                </div>
              )}
            </div>

            <div className="guided-self-assessment">
              <span>学习自评 · 不影响课程完成</span>
              <strong>现在你觉得自己掌握了吗？</strong>
              <div className="guided-self-assessment-options">
                {[
                  ["INDEPENDENT", "我可以自己完成"],
                  ["WITH_REFERENCE", "我基本明白，但还需要参考"],
                  ["NEEDS_PRACTICE", "我还需要再练一次"]
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={selfAssessment === value ? "is-selected" : ""}
                    onClick={() => {
                      const assessment = value as "INDEPENDENT" | "WITH_REFERENCE" | "NEEDS_PRACTICE";
                      setSelfAssessment(assessment);
                      recordClientEvent("learning_self_assessment", { assessment, practiceId: practice.id });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selfAssessment === "NEEDS_PRACTICE" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setPracticeDirty(true);
                    setCurrentStep(3);
                    recordClientEvent("practice_retry_requested", { practiceId: practice.id });
                  }}
                >
                  再练一次 →
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 6 步 · 你现在会什么</div>
            <h3>不是“看完一课”，而是已经获得一个能反复使用的方法</h3>
            <div className="guided-achievement-list">
              <div><span>✓</span><p>能把模糊需求拆成任务目标、背景信息、输入材料、限制条件和输出要求</p></div>
              <div><span>✓</span><p>知道限制条件（Constraint）为什么能减少 AI 自行猜测</p></div>
              <div><span>✓</span><p>已经用自己的真实任务完成至少一次结构化任务简报</p></div>
            </div>

            <div className="guided-next-value">
              <div>
                <span>继续学习，你接下来可以获得</span>
                <strong>从“会写一个任务”升级到“会处理真实文件、研究和工作流”</strong>
                <p>后续课程会继续把这个任务简报方法用于文件处理、研究、数据分析和自动化工作流。</p>
              </div>
              <div className="guided-learning-path-action">
                <Link className="btn btn-secondary" href="/learning-path#progress">学习路径 →</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {stillConfusedOpen && (
        <div className="guided-confused-panel">
          <span>提示</span>
          <strong>{[
            "检查这五项里有没有缺少任务必要信息。",
            "对比两种写法，重点看第二种多补了哪些可以执行的信息。",
            "找出专门描述规则、禁止事项和必须遵守边界的那一项。",
            "先把你最终要得到的结果写清，再补使用场景、材料、边界和输出格式。",
            "先看最低分的那一项，只修改一个问题后再提交。",
            "回想这节课最核心的方法：让 AI 少猜一步，你就要多说明一步。"
          ][currentStep]}</strong>
          <div className="interactive-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStillConfusedOpen(false)}>知道了，我再试试</button>
          </div>
        </div>
      )}

      {message && <div className="interactive-message">{message}</div>}

      <div className="guided-step-nav">
        <button type="button" className="btn btn-secondary" onClick={goPrevious} disabled={currentStep === 0}>← 上一步</button>
        <div>
          <span>{steps[currentStep]}</span>
          <small>{currentStep + 1} / {steps.length}</small>
        </div>
        <button type="button" className="guided-confused-button" onClick={showStillConfused}>还是不懂</button>
        {currentStep < steps.length - 1 && currentStep !== 3 ? (
          <button type="button" className="btn btn-primary" onClick={goNext} disabled={!canGoNext}>
            {currentStep === 2 && !checkPassed ? "通过检查后继续" : "下一步 →"}
          </button>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}