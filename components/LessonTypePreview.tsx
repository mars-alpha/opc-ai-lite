"use client";

import { useMemo, useState } from "react";

type PreviewKind = "concept" | "application" | "practice";

type PreviewConfig = {
  kind: PreviewKind;
  badge: string;
  title: string;
  subtitle: string;
  runtime: string;
  steps: Array<{ key: string; label: string; title: string }>;
};

const configs: Record<PreviewKind, PreviewConfig> = {
  concept: {
    kind: "concept",
    badge: "CONCEPT · Spec + Runtime 已验证",
    title: "Memory 与 RAG",
    subtitle: "体验概念课：理解 → 案例 → 检查 → 回顾 → 能力获得",
    runtime: "真实 required Check Runtime 已正式 provision；本页面只体验 UX，不记录进度。",
    steps: [
      { key: "explain", label: "理解", title: "Memory 和 RAG 分别解决什么问题？" },
      { key: "example", label: "案例", title: "为什么客服知识不能只靠 Memory？" },
      { key: "check", label: "理解检查", title: "这个场景应该用什么？" },
      { key: "review", label: "学习回顾", title: "把三个概念的边界收回来" },
      { key: "capability", label: "能力获得", title: "你现在可以判断知识应该从哪里来" }
    ]
  },
  application: {
    kind: "application",
    badge: "APPLICATION · Spec PASS / UX Preview",
    title: "写作与文件处理",
    subtitle: "体验应用课：理解 → 案例 → 检查 → 实操 → 回顾 → 能力获得",
    runtime: "当前 ARTIFACT evidence Runtime 尚未完成，所以这里只预览课程体验，不伪造真实 AI 通过状态。",
    steps: [
      { key: "explain", label: "理解", title: "文件任务为什么要先抽取、再生成？" },
      { key: "example", label: "案例", title: "把会议记录变成项目更新" },
      { key: "check", label: "理解检查", title: "哪些内容可以写进结果？" },
      { key: "practice", label: "自己做", title: "把一份文件任务拆成抽取与输出要求" },
      { key: "review", label: "学习回顾", title: "检查事实来源与输出适配" },
      { key: "capability", label: "能力获得", title: "你现在会把真实文件变成可用成品" }
    ]
  },
  practice: {
    kind: "practice",
    badge: "PRACTICE · Spec + Runtime 已验证",
    title: "任务拆解与节点设计",
    subtitle: "体验实操课：理解 → 案例 → 自己做 → 回顾 → 能力获得",
    runtime: "真实 STRUCTURED_TEXT_V1 Practice Runtime 已正式 provision；本页面只体验 UX，不记录提交。",
    steps: [
      { key: "explain", label: "理解", title: "为什么不能把完整流程塞进一个超级 Prompt？" },
      { key: "example", label: "案例", title: "内容发布流程应该怎样拆？" },
      { key: "practice", label: "自己做", title: "把一个重复任务拆成 4–7 个节点" },
      { key: "review", label: "学习回顾", title: "检查节点有没有清晰边界" },
      { key: "capability", label: "能力获得", title: "你现在能把重复任务变成工作流结构" }
    ]
  }
};

export function LessonTypePreview() {
  const [kind, setKind] = useState<PreviewKind>("concept");
  const [stepIndex, setStepIndex] = useState(0);
  const [conceptAnswer, setConceptAnswer] = useState("");
  const [conceptChecked, setConceptChecked] = useState(false);
  const [applicationAnswer, setApplicationAnswer] = useState("");
  const [applicationChecked, setApplicationChecked] = useState(false);
  const [applicationDraft, setApplicationDraft] = useState({ source: "", extract: "", output: "" });
  const [practiceDraft, setPracticeDraft] = useState({ trigger: "", nodes: "", review: "" });
  const [practiceChecked, setPracticeChecked] = useState(false);

  const config = configs[kind];
  const step = config.steps[stepIndex];

  const practiceReady = useMemo(
    () =>
      practiceDraft.trigger.trim().length >= 8 &&
      practiceDraft.nodes.trim().split(/\n+/).filter(Boolean).length >= 4 &&
      practiceDraft.review.trim().length >= 8,
    [practiceDraft]
  );

  function switchKind(next: PreviewKind) {
    setKind(next);
    setStepIndex(0);
  }

  const canContinue =
    kind === "concept" && step.key === "check"
      ? conceptChecked && conceptAnswer === "rag"
      : kind === "application" && step.key === "check"
        ? applicationChecked && applicationAnswer === "source"
        : kind === "practice" && step.key === "practice"
          ? practiceChecked && practiceReady
          : true;

  return (
    <main className="learning-preview-page">
      <section className="learning-preview-head">
        <div>
          <span>OPC Guided Lesson · UX Preview</span>
          <h1>三种课程形式体验</h1>
          <p>只体验课程结构与交互，不记录进度、不改变正式课程状态。</p>
        </div>
        <a className="btn btn-secondary" href="/learning-path#progress">返回学习路径</a>
      </section>

      <div className="learning-preview-tabs" role="tablist" aria-label="Lesson type preview">
        {([
          ["concept", "CONCEPT", "概念课"],
          ["application", "APPLICATION", "应用课"],
          ["practice", "PRACTICE", "实操课"]
        ] as const).map(([value, code, label]) => (
          <button
            key={value}
            type="button"
            className={kind === value ? "is-active" : ""}
            onClick={() => switchKind(value)}
          >
            <small>{code}</small>
            <strong>{label}</strong>
          </button>
        ))}
      </div>

      <section className="guided-lesson-hero learning-preview-hero">
        <div>
          <span className="guided-step-label">{config.badge}</span>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <div className="guided-preview-mode-note">
          <strong>Runtime 状态</strong>
          <p>{config.runtime}</p>
        </div>
      </section>

      <section className="guided-lesson interactive-panel">
        <div className="guided-lesson-top">
          <div>
            <span className="eyebrow">当前学习任务</span>
            <h2>{step.title}</h2>
            <p>单 Step 只完成一个认知或操作任务，完成后再进入下一步。</p>
          </div>
          <div className="guided-progress-copy">
            <strong>{stepIndex + 1}/{config.steps.length}</strong>
            <span>{step.label}</span>
          </div>
        </div>

        <div
          className="guided-progress-track learning-preview-progress"
          style={{ gridTemplateColumns: `repeat(${config.steps.length}, minmax(0, 1fr))` }}
        >
          {config.steps.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className={index === stepIndex ? "is-current" : index < stepIndex ? "is-done" : ""}
              onClick={() => index <= stepIndex && setStepIndex(index)}
            >
              <span>{index < stepIndex ? "✓" : index + 1}</span>
              <small>{item.label}</small>
            </button>
          ))}
        </div>

        <div className="guided-step-panel">
          {kind === "concept" && (
            <ConceptPreview
              stepKey={step.key}
              answer={conceptAnswer}
              checked={conceptChecked}
              onAnswer={(value) => {
                setConceptAnswer(value);
                setConceptChecked(false);
              }}
              onCheck={() => setConceptChecked(true)}
            />
          )}
          {kind === "application" && (
            <ApplicationPreview
              stepKey={step.key}
              answer={applicationAnswer}
              checked={applicationChecked}
              draft={applicationDraft}
              onAnswer={(value) => {
                setApplicationAnswer(value);
                setApplicationChecked(false);
              }}
              onCheck={() => setApplicationChecked(true)}
              onDraft={setApplicationDraft}
            />
          )}
          {kind === "practice" && (
            <PracticePreview
              stepKey={step.key}
              draft={practiceDraft}
              checked={practiceChecked}
              ready={practiceReady}
              onDraft={(value) => {
                setPracticeDraft(value);
                setPracticeChecked(false);
              }}
              onCheck={() => setPracticeChecked(true)}
            />
          )}
        </div>

        <div className="guided-step-nav learning-preview-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
            disabled={stepIndex === 0}
          >
            ← 上一步
          </button>
          <div>
            <span>{step.label}</span>
            <small>体验模式</small>
          </div>
          {stepIndex < config.steps.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStepIndex((value) => Math.min(config.steps.length - 1, value + 1))}
              disabled={!canContinue}
            >
              {!canContinue ? "完成当前任务后继续" : "下一步 →"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setStepIndex(0)}>
              再体验一次
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function ConceptPreview({
  stepKey,
  answer,
  checked,
  onAnswer,
  onCheck
}: {
  stepKey: string;
  answer: string;
  checked: boolean;
  onAnswer: (value: string) => void;
  onCheck: () => void;
}) {
  if (stepKey === "explain") {
    return <div className="guided-step-content"><div className="guided-step-label">第 1 步 · 理解</div><h3>Memory 记“持续状态”，RAG 找“外部知识里的证据”</h3><p>Memory 适合保存用户偏好、任务状态和持续上下文；RAG 适合从知识库、文档或业务资料中检索与当前问题相关的信息，再交给模型回答。</p><div className="guided-review-points"><div><strong>Memory</strong><p>保存持续状态和个性化上下文。</p></div><div><strong>Knowledge Base</strong><p>存放业务知识、文档与事实材料。</p></div><div><strong>RAG</strong><p>按当前问题检索相关材料并带入上下文。</p></div></div></div>;
  }
  if (stepKey === "example") {
    return <div className="guided-step-content"><div className="guided-step-label">第 2 步 · 案例</div><h3>客服机器人要回答“退款政策”，为什么不能只靠 Memory？</h3><div className="guided-case-compare"><div><span>只用 Memory</span><p>记得这个用户以前买过什么，但不一定知道公司今天最新的退款政策。</p></div><div><span>使用 RAG</span><p>先从最新客服知识库检索退款政策，再基于检索内容回答，并可以保留来源。</p></div></div></div>;
  }
  if (stepKey === "check") {
    const correct = checked && answer === "rag";
    return <div className="guided-step-content"><div className="guided-step-label">第 3 步 · 理解检查</div><h3>用户问“公司 2026 年最新报销标准”，系统应该优先依赖什么？</h3><div className="learning-preview-choice-list">{[["memory","Memory，因为它会记住之前的对话"],["rag","RAG，从最新制度资料中检索相关规定"],["model","直接让模型凭已有知识回答"]].map(([value,label]) => <button key={value} type="button" className={answer===value?"is-selected":""} onClick={() => onAnswer(value)}>{label}</button>)}</div><button type="button" className="btn btn-primary" onClick={onCheck} disabled={!answer}>检查答案</button>{checked && <div className={correct?"learning-preview-feedback is-pass":"learning-preview-feedback is-revision"}>{correct?"正确。最新制度属于外部可更新知识，应先检索证据再回答。":"还差一点：关键是“最新制度”会变化，不能只依赖对话记忆或模型旧知识。"}</div>}</div>;
  }
  if (stepKey === "review") {
    return <div className="guided-step-content"><div className="guided-step-label">学习回顾</div><h3>三个概念只记一个判断方法</h3><div className="guided-review-card"><strong>问自己：我需要的是“记住状态”，还是“找到证据”？</strong><p>持续状态 → Memory；长期资料 → Knowledge Base；针对当前问题找资料 → RAG。</p></div></div>;
  }
  return <CapabilityPreview gains={["能区分 Memory 与 RAG","能判断何时需要检索外部知识","不会把 RAG 误解成模型训练"]} next="下一课：API、Tool、MCP 与 Agent 如何连接外部世界" />;
}

function ApplicationPreview({
  stepKey,
  answer,
  checked,
  draft,
  onAnswer,
  onCheck,
  onDraft
}: {
  stepKey: string;
  answer: string;
  checked: boolean;
  draft: { source: string; extract: string; output: string };
  onAnswer: (value: string) => void;
  onCheck: () => void;
  onDraft: (value: { source: string; extract: string; output: string }) => void;
}) {
  if (stepKey === "explain") return <div className="guided-step-content"><div className="guided-step-label">第 1 步 · 理解</div><h3>处理文件时，先抽取事实，再生成成品</h3><p>把“读文件”和“写成品”拆成两步，可以更容易发现遗漏、来源错误和模型自己补充的内容。</p><div className="guided-gain"><strong>核心方法</strong><p>Source → Extract → Verify → Generate。</p></div></div>;
  if (stepKey === "example") return <div className="guided-step-content"><div className="guided-step-label">第 2 步 · 案例</div><h3>会议记录 → 项目更新</h3><div className="guided-case-compare"><div><span>直接生成</span><p>“把这个会议记录写成项目周报。”容易混入模型猜测的负责人、日期和结论。</p></div><div><span>先抽取再生成</span><p>先抽取“事项 / 决策 / 负责人 / 截止时间”，核对后再生成周报。</p></div></div></div>;
  if (stepKey === "check") {
    const correct = checked && answer === "source";
    return <div className="guided-step-content"><div className="guided-step-label">第 3 步 · 理解检查</div><h3>生成项目更新时，哪一类信息可以被当作确定事实？</h3><div className="learning-preview-choice-list">{[["source","原文件明确写出的决策、负责人和截止时间"],["guess","模型根据上下文推测出来但原文没写的信息"],["common","行业里通常会有、但当前文件没有说明的信息"]].map(([value,label]) => <button key={value} type="button" className={answer===value?"is-selected":""} onClick={() => onAnswer(value)}>{label}</button>)}</div><button type="button" className="btn btn-primary" onClick={onCheck} disabled={!answer}>检查答案</button>{checked && <div className={correct?"learning-preview-feedback is-pass":"learning-preview-feedback is-revision"}>{correct?"正确。文件任务的事实边界由 Source 决定。":"不对。原文件没有的事实必须标记未知，不能让模型自动补全。"}</div>}</div>;
  }
  if (stepKey === "practice") return <div className="guided-step-content"><div className="guided-step-label">第 4 步 · 自己做</div><h3>设计一个“文件 → 成品”的任务简报</h3><div className="learning-preview-form"><label><span>原始材料</span><textarea value={draft.source} onChange={(e)=>onDraft({...draft,source:e.target.value})} placeholder="例如：本周项目会议记录" /></label><label><span>先抽取什么</span><textarea value={draft.extract} onChange={(e)=>onDraft({...draft,extract:e.target.value})} placeholder="例如：事项、决策、负责人、截止时间、风险" /></label><label><span>最终输出</span><textarea value={draft.output} onChange={(e)=>onDraft({...draft,output:e.target.value})} placeholder="例如：按项目周报格式输出，不能补充原文没有的事实" /></label></div><div className="guided-preview-mode-note"><strong>真实 AI Gate 还未开放</strong><p>正式 APPLICATION 课需要 ARTIFACT evidence。当前系统没有可信 Artifact Resolver，所以这里不会显示“已完成真实 AI 操作”。</p></div></div>;
  if (stepKey === "review") return <div className="guided-step-content"><div className="guided-step-label">学习回顾</div><h3>文件任务最容易错的不是“写不好”，而是“事实边界失控”</h3><div className="guided-review-points"><div><strong>先抽取</strong><p>把真正存在于文件里的事实拉出来。</p></div><div><strong>再核对</strong><p>明确哪些字段缺失或待确认。</p></div><div><strong>最后生成</strong><p>让成品服从来源，而不是让模型自由发挥。</p></div></div></div>;
  return <CapabilityPreview gains={["能把文件任务拆成抽取与生成","能控制模型不补充文件外事实","理解真实 AI 产物为什么需要证据"]} next="下一课：把文件方法扩展到数据、表格与办公分析" note="这一课目前是 UX Preview，ARTIFACT Runtime 未完成。" />;
}

function PracticePreview({
  stepKey,
  draft,
  checked,
  ready,
  onDraft,
  onCheck
}: {
  stepKey: string;
  draft: { trigger: string; nodes: string; review: string };
  checked: boolean;
  ready: boolean;
  onDraft: (value: { trigger: string; nodes: string; review: string }) => void;
  onCheck: () => void;
}) {
  if (stepKey === "explain") return <div className="guided-step-content"><div className="guided-step-label">第 1 步 · 理解</div><h3>Workflow 不是一个超级 Prompt，而是一组职责清晰的节点</h3><p>每个节点应该有明确输入、处理方式、输出和失败边界。节点越清晰，流程越容易调试、替换和自动化。</p></div>;
  if (stepKey === "example") return <div className="guided-step-content"><div className="guided-step-label">第 2 步 · 案例</div><h3>内容发布流程可以拆成这些节点</h3><div className="learning-preview-flow">{["收集素材","筛选主题","生成草稿","事实检查","人工审核","发布"].map((item,index)=><div key={item}><span>{index+1}</span><strong>{item}</strong></div>)}</div></div>;
  if (stepKey === "practice") return <div className="guided-step-content"><div className="guided-step-label">第 3 步 · 自己做</div><h3>拆一个你自己的重复任务</h3><div className="learning-preview-form"><label><span>触发条件 / 输入</span><textarea value={draft.trigger} onChange={(e)=>onDraft({...draft,trigger:e.target.value})} placeholder="什么时候开始这个流程？输入是什么？" /></label><label><span>4–7 个节点（每行一个）</span><textarea rows={6} value={draft.nodes} onChange={(e)=>onDraft({...draft,nodes:e.target.value})} placeholder={"1. 收集…\n2. 判断…\n3. 生成…\n4. 审核…"} /></label><label><span>人工检查 / 失败边界</span><textarea value={draft.review} onChange={(e)=>onDraft({...draft,review:e.target.value})} placeholder="哪一步必须人工确认？失败时怎么办？" /></label></div><button type="button" className="btn btn-primary" onClick={onCheck}>检查我的结构</button>{checked && <div className={ready?"learning-preview-feedback is-pass":"learning-preview-feedback is-revision"}>{ready?"已达到体验标准：有明确输入、至少 4 个节点，并定义了人工/失败边界。":"还需要补充：输入至少写清楚，节点至少 4 个，并说明一个人工检查或失败边界。"}</div>}</div>;
  if (stepKey === "review") return <div className="guided-step-content"><div className="guided-step-label">学习回顾</div><h3>检查一个 Workflow，只看三个问题</h3><div className="guided-review-points"><div><strong>输入清楚吗？</strong><p>节点开始时到底拿到什么？</p></div><div><strong>输出清楚吗？</strong><p>下一节点拿到的结果是什么？</p></div><div><strong>失败怎么办？</strong><p>哪些情况重试，哪些必须交给人？</p></div></div></div>;
  return <CapabilityPreview gains={["能把重复任务拆成节点","能区分 AI / 规则 / 人工节点","能为节点定义输入、输出和失败边界"]} next="下一课：Context Engineering，决定每个节点应该看到什么信息" />;
}

function CapabilityPreview({ gains, next, note }: { gains: string[]; next: string; note?: string }) {
  return <div className="guided-step-content"><div className="guided-step-label">最后一步 · 能力获得</div><h3>这一课你获得了什么？</h3><div className="guided-achievement-list">{gains.map((gain)=><div key={gain}><span>✓</span><p>{gain}</p></div>)}</div><div className="guided-next-value"><div><span>下一课价值</span><strong>{next}</strong>{note && <p>{note}</p>}</div></div></div>;
}
