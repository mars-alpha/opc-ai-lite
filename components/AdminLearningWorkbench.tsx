"use client";

import { useState } from "react";

type Insight = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  issueKey: string;
  issueCategory: string;
  status: string;
  distinctUserCount: number;
  evidence: unknown;
  diagnosis: unknown;
  analysisMode: string;
  updatedAt: string;
};

type Candidate = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  sourceType: string;
  insightId: string | null;
  sourceKnowledgeId: string | null;
  disposition: string;
  proposal: unknown;
  status: string;
  createdAt: string;
};

type QualityRisk = {
  id: string;
  lessonTitle: string;
  issueType: string;
  issueKey: string;
  comment: string | null;
  qualityRisk: boolean;
  reviewStatus: string;
  createdAt: string;
};

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function AdminLearningWorkbench({
  insights,
  candidates,
  qualityRisks
}: {
  insights: Insight[];
  candidates: Candidate[];
  qualityRisks: QualityRisk[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function review(candidateId: string, status: "APPROVED" | "DISMISSED" | "NEEDS_REVISION") {
    setBusyId(candidateId);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/learning/candidates/" + encodeURIComponent(candidateId) + "/review",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status })
        }
      );
      if (!response.ok) throw new Error("REVIEW_FAILED");
      window.location.reload();
    } catch {
      setMessage("审核保存失败，请稍后重试。");
      setBusyId(null);
    }
  }

  return (
    <div className="admin-learning-workbench">
      <div className="admin-learning-grid">
        <div className="admin-learning-column admin-learning-column-left">
      <section className={"admin-insight-section " + (insights.length === 0 ? "is-empty" : "")}>
        <div className="admin-section-head">
          <div>
            <div className="kicker">学习问题</div>
            <h2>需要关注的学习问题</h2>
          </div>
          <span>{insights.length} 条</span>
        </div>

        <div className="admin-insight-list">
          {insights.length === 0 && <p className="admin-empty">当前没有达到关注条件的问题。</p>}
          {insights.map((insight) => {
            const diagnosis = asRecord(insight.diagnosis);
            const evidence = asRecord(insight.evidence);
            return (
              <article className="admin-insight-card" key={insight.id}>
                <div className="admin-insight-meta">
                  <span>{insight.status}</span>
                  <span>{insight.analysisMode}</span>
                  <span>{insight.distinctUserCount} 位独立用户</span>
                </div>
                <h3>{insight.lessonTitle}</h3>
                <p><b>问题：</b>{insight.issueCategory} · {insight.issueKey}</p>
                <p>
                  <b>触发：</b>
                  {String(evidence?.analysisThreshold ?? 3)} 人进入分析，
                  {String(evidence?.highPriorityThreshold ?? 5)} 人提高优先级
                </p>
                {diagnosis ? (
                  <div className="admin-diagnosis">
                    <p><b>根因：</b>{String(diagnosis.rootCause ?? "—")}</p>
                    <p><b>处置：</b>{String(diagnosis.disposition ?? "—")}</p>
                    <p><b>置信度：</b>{String(diagnosis.confidence ?? "—")}</p>
                    {stringArray(diagnosis.facts).length > 0 && (
                      <div><b>事实证据</b><ul>{stringArray(diagnosis.facts).map((item) => <li key={item}>{item}</li>)}</ul></div>
                    )}
                    {stringArray(diagnosis.interpretation).length > 0 && (
                      <div><b>AI 判断</b><ul>{stringArray(diagnosis.interpretation).map((item) => <li key={item}>{item}</li>)}</ul></div>
                    )}
                  </div>
                ) : (
                  <p className="admin-muted">
                    {insight.status === "ANALYSIS_READY"
                      ? "已达到分析条件；若后台 AI Provider 已配置，将进行课程覆盖与根因诊断。"
                      : "当前由规则聚合，未形成 AI 诊断。"}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className={"admin-insight-section " + (qualityRisks.length === 0 ? "is-empty" : "")}>
        <div className="admin-section-head">
          <div>
            <div className="kicker">质量风险</div>
            <h2>错误 / 过时风险</h2>
          </div>
          <span>{qualityRisks.length} 条</span>
        </div>
        <div className="admin-insight-list">
          {qualityRisks.length === 0 && <p className="admin-empty">当前没有用户报告的内容质量风险。</p>}
          {qualityRisks.map((risk) => (
            <article className="admin-insight-card" key={risk.id}>
              <div className="admin-insight-meta">
                <span>REVIEW_REQUIRED</span>
                <span>{risk.reviewStatus}</span>
              </div>
              <h3>{risk.lessonTitle}</h3>
              <p>{risk.comment || "用户未补充说明。"}</p>
              <small>质量风险 1 次即可进入人工确认，但不会自动判定课程有错。</small>
            </article>
          ))}
        </div>
      </section>

        </div>
        <div className="admin-learning-column admin-learning-column-right">
      <section className={"admin-insight-section " + (candidates.length === 0 ? "is-empty" : "")}>
        <div className="admin-section-head">
          <div>
            <div className="kicker">人工审核</div>
            <h2>课程更新候选</h2>
          </div>
          <span>{candidates.length} 待审核</span>
        </div>

        <div className="admin-insight-list">
          {candidates.length === 0 && <p className="admin-empty">当前没有待人工审核的课程更新候选。</p>}
          {candidates.map((candidate) => {
            const proposal = asRecord(candidate.proposal);
            const diagnosis = asRecord(proposal?.diagnosis);
            return (
              <article className="admin-insight-card" key={candidate.id}>
                <div className="admin-insight-meta">
                  <span>{candidate.sourceType === "KNOWLEDGE" ? "KNOWLEDGE" : "LEARNING_INSIGHT"}</span>
                  <span>{candidate.disposition}</span>
                  <span>{candidate.status}</span>
                </div>
                <h3>{candidate.lessonTitle}</h3>
                {candidate.sourceType === "KNOWLEDGE" ? (
                  <div className="admin-diagnosis">
                    <b>Knowledge 更新建议（仅 Proposal）</b>
                    <p><b>来源：</b>{String(proposal?.knowledgeTitle ?? candidate.sourceKnowledgeId ?? "—")}</p>
                    <p><b>摘要：</b>{String(proposal?.knowledgeSummary ?? "—")}</p>
                    <p><b>影响区域：</b>{String(proposal?.affectedArea ?? "—")}</p>
                    <p><b>为什么：</b>{String(proposal?.rationale ?? "—")}</p>
                    <p><b>建议调整：</b>{String(proposal?.proposedChange ?? "—")}</p>
                  </div>
                ) : diagnosis && stringArray(diagnosis.recommendation).length > 0 ? (
                  <div className="admin-diagnosis">
                    <b>AI 更新建议（仅 Proposal）</b>
                    <ul>{stringArray(diagnosis.recommendation).map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                ) : null}
                <div className="admin-review-actions">
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={busyId === candidate.id}
                    onClick={() => review(candidate.id, "APPROVED")}
                  >
                    批准为更新任务
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={busyId === candidate.id}
                    onClick={() => review(candidate.id, "NEEDS_REVISION")}
                  >
                    {candidate.sourceType === "KNOWLEDGE" ? "需要修改" : "需要重新分析"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={busyId === candidate.id}
                    onClick={() => review(candidate.id, "DISMISSED")}
                  >
                    驳回
                  </button>
                </div>
                <small>批准只改变审核状态，不会自动修改或发布课程。</small>
              </article>
            );
          })}
        </div>
      </section>


        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}
    </div>
  );
}
