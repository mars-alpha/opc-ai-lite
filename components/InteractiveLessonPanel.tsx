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
  const [currentStep, setCurrentStep] = useState(0);

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

  const steps = [
    "先理解",
    "看案例",
    "理解检查",
    "跟着做",
    "反馈与复习",
    "下一步"
  ];
  const canGoNext =
    currentStep === 2
      ? Boolean(check.state?.isCorrect)
      : currentStep === 4
        ? Boolean(evaluation?.passed)
        : true;

  function goNext() {
    if (!canGoNext) return;
    setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrevious() {
    setCurrentStep((value) => Math.max(value - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <h3>Prompt（提示词）不是“神奇句式”，而是把任务说明清楚</h3>
            <p>一个稳定的 AI 任务，至少要让模型知道五件事：要完成什么、背景是什么、根据什么材料做、哪些边界不能违反、最后要交付什么。</p>
            <div className="guided-five-grid">
              <div><strong>Goal</strong><span>最终要完成什么</span></div>
              <div><strong>Context</strong><span>背景和使用场景</span></div>
              <div><strong>Input</strong><span>依据哪些材料</span></div>
              <div><strong>Constraint</strong><span>必须遵守的边界</span></div>
              <div><strong>Output</strong><span>最终交付格式</span></div>
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
                <p>Goal：整理给项目负责人看的行动摘要。Context：用于明早项目会。Input：只依据会议记录。Constraint：不得补充原文没有的事实。Output：按“决策 / 负责人 / 截止时间 / 风险”四栏输出。</p>
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
            <h3>{check.question}</h3>
            <p>先自己判断，不用返回上一页找答案。</p>
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
              className="btn btn-primary"
              onClick={submitCheck}
              disabled={!answer || busy === "check"}
            >
              {busy === "check" ? "正在检查…" : check.state?.isCorrect ? "✓ 已理解" : "检查答案"}
            </button>

            {check.state && (
              <div className={"check-feedback " + (check.state.isCorrect ? "is-correct" : "is-wrong")}>
                <strong>{check.state.isCorrect ? "理解正确 ✓" : "这里需要补一下基础"}</strong>
                <p>
                  {check.state.isCorrect
                    ? check.state.explanation
                    : "Constraint（约束）负责定义 AI 必须遵守的规则、禁止事项和边界。"}
                </p>
              </div>
            )}

            {check.state && !check.state.isCorrect && (
              <div className="guided-review-card">
                <span>建议复习</span>
                <strong>Context、Token 与提示词</strong>
                <p>你现在的问题不是不会写 Prompt，而是还没有完全区分 Goal、Context 与 Constraint 的职责。先复习这一个基础点，再回来重试。</p>
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
                      setContent((current) => ({ ...current, [item.key]: event.target.value }))
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
                    if (next > current) recordClientEvent("hint_revealed", { practiceId: practice.id, hintIndex: next });
                    return next;
                  });
                }}
              >
                {hintCount < practice.hints.length ? "给我一个提示" : "提示已全部展开"}
              </button>
              <button type="button" className="btn btn-primary" onClick={submitPractice} disabled={busy === "practice"}>
                {busy === "practice" ? "正在检查…" : practice.state ? "修改后重新提交" : "提交并检查"}
              </button>
            </div>

            {hintCount > 0 && (
              <div className="interactive-hints">
                {practice.hints.slice(0, hintCount).map((hint, index) => (
                  <p key={hint}><strong>提示 {index + 1}</strong>{hint}</p>
                ))}
              </div>
            )}

            <div className="external-ai-check">
              <div>
                <span>真实工具验证</span>
                <h3>把它拿到你自己的 AI 工具里执行</h3>
                <p>OPC 负责教方法和检查结构，不伪造模型运行结果。你可以复制当前任务简报，在 ChatGPT、Claude、Gemini 或其他工具中实际验证。</p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={copyForExternalAI}>
                {copied ? "已复制 ✓" : "复制任务简报"}
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 5 步 · 即时反馈</div>
            <h3>{evaluation ? (evaluation.passed ? "你已经完成一次可用的任务简报" : "还差一点，按反馈修改") : "提交实操后，这里会告诉你具体哪里需要改"}</h3>

            {!evaluation && (
              <div className="guided-empty-feedback">
                <p>回到上一步完成实操并提交。系统会按 Goal / Context / Input / Constraint / Output 分项检查，而不是只给一个总分。</p>
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(3)}>返回实操 →</button>
              </div>
            )}

            {evaluation && (
              <div className="evaluation-panel">
                <div className="evaluation-summary">
                  <div><span>本次得分</span><strong>{evaluation.score}<small> / 100</small></strong></div>
                  <div><span>结果</span><strong className={evaluation.passed ? "passed" : "revision"}>{evaluation.passed ? "已通过" : "需要修改"}</strong></div>
                </div>
                <p className="evaluation-next">{evaluation.nextAction}</p>
                <div className="evaluation-criteria">
                  {evaluation.criteria.map((item) => (
                    <article key={item.key}>
                      <div className="criterion-head"><strong>{item.label}</strong><span>{item.score}/{item.maxScore}</span></div>
                      <p><b>为什么：</b>{item.reason}</p>
                      {item.problem && <p><b>问题：</b>{item.problem}</p>}
                      <p><b>怎么改：</b>{item.suggestion}</p>
                      <p className="criterion-example"><b>参考：</b>{item.example}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {evaluation && !evaluation.passed && (
              <div className="guided-review-card">
                <span>没有通过不是重新从头学</span>
                <strong>先看最低分的部分，再回到第 4 步修改</strong>
                <p>如果你分不清 Goal / Context / Constraint，优先复习「Context、Token 与提示词」；如果只是内容不够具体，直接按上面的“怎么改”修改即可。</p>
                <div className="interactive-actions">
                  <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(3)}>回去修改实操</button>
                  <Link className="btn btn-secondary" href="/courses/ai-literacy/lessons/context-token">复习基础课程</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="guided-step-content">
            <div className="guided-step-label">第 6 步 · 你现在会什么</div>
            <h3>不是“看完一课”，而是已经获得一个能反复使用的方法</h3>
            <div className="guided-achievement-list">
              <div><span>✓</span><p>能把模糊需求拆成 Goal / Context / Input / Constraint / Output</p></div>
              <div><span>✓</span><p>知道 Constraint（约束）为什么能减少 AI 自行猜测</p></div>
              <div><span>✓</span><p>已经用自己的真实任务完成至少一次结构化任务简报</p></div>
            </div>

            <div className="guided-next-value">
              <div>
                <span>继续学习，你接下来可以获得</span>
                <strong>从“会写一个任务”升级到“会处理真实文件、研究和工作流”</strong>
                <p>后续课程会继续把这个任务简报方法用于文件处理、研究、数据分析和自动化工作流。</p>
              </div>
              <div className="guided-tier-grid">
                <div><span>免费体验</span><strong>基础 Guided Learning</strong><p>完成核心概念、案例和基础练习。</p></div>
                <div><span>关注公众号</span><strong>持续跟进</strong><p>解锁完整 AI Daily 与指定基础章节。</p></div>
                <div className="is-member"><span>OPC 会员</span><strong>系统进阶</strong><p>Knowledge 正文、Deep Resource、正式实操与进阶课程。</p></div>
              </div>
              <div className="interactive-actions">
                <Link className="btn btn-primary" href="/#membership">查看 OPC 会员学习路径</Link>
                <Link className="btn btn-secondary" href="/#official-account">查看公众号权益</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {message && <div className="interactive-message">{message}</div>}

      <div className="guided-step-nav">
        <button type="button" className="btn btn-secondary" onClick={goPrevious} disabled={currentStep === 0}>← 上一步</button>
        <div>
          <span>{steps[currentStep]}</span>
          <small>{currentStep + 1} / {steps.length}</small>
        </div>
        {currentStep < steps.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={goNext} disabled={!canGoNext}>
            {currentStep === 2 && !check.state?.isCorrect
              ? "通过检查后继续"
              : currentStep === 4 && !evaluation?.passed
                ? "实操通过后继续"
                : "下一步 →"}
          </button>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}