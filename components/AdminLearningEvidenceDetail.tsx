"use client";

import { useEffect, useState } from "react";

type EvidenceDetail = {
  summary: {
    feedbackUsers: number;
    feedbackCount: number;
  };
  behaviors: {
    reachedUsers: number;
    completedUsers: number;
    checkRetryUsers: number;
    practiceUsers: number;
    practiceRetryUsers: number;
    aiEvidenceUsers: number;
    aiEvidenceCount: number;
  };
  feedback: Array<{
    issueType: string;
    resolutionStatus: string;
    reasons: string[];
    comment: string | null;
    createdAt: string;
  }>;
};

function feedbackIssueLabel(value: string) {
  const labels: Record<string, string> = {
    DONT_UNDERSTAND: "理解困难",
    DONT_KNOW_HOW: "不知道怎么做",
    EVALUATION_DISPUTE: "评分疑问",
    FIND_RELATED_COURSE: "寻找相关课程",
    OTHER: "其它学习问题"
  };
  return labels[value] ?? "学习问题";
}

function resolutionLabel(value: string) {
  const labels: Record<string, string> = {
    UNRESOLVED: "尚未解决",
    RESOLVED: "已解决",
    ROUTED: "已引导处理"
  };
  return labels[value] ?? "待处理";
}

function dateText(value: string) {
  return new Date(value).toLocaleDateString("zh-CN");
}

export function AdminLearningEvidenceDetail({
  insightId,
  embedded = false
}: {
  insightId: string;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(embedded);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<EvidenceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [dataView, setDataView] = useState<"FEEDBACK" | "BEHAVIOR">("FEEDBACK");

  async function loadDetail() {
    if (detail || loading) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(
        "/api/admin/learning/insights/" + encodeURIComponent(insightId)
      );
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.detail) throw new Error("EVIDENCE_FAILED");
      setDetail(result.detail as EvidenceDetail);
    } catch {
      setError("真实数据读取失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (embedded) void loadDetail();
  }, [embedded, insightId]);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    await loadDetail();
  }

  const visibleFeedback = detail
    ? detail.feedback.slice(0, feedbackExpanded ? detail.feedback.length : 5)
    : [];

  const behaviorCards = detail
    ? [
        {
          label: "进入学习",
          value: detail.behaviors.reachedUsers + " 位",
          hint: "已有课程进度记录"
        },
        {
          label: "完成课程",
          value: detail.behaviors.completedUsers + " 位",
          hint: "正式完成本课"
        },
        {
          label: "检查重试",
          value: detail.behaviors.checkRetryUsers + " 位",
          hint: "检查理解重复尝试"
        },
        {
          label: "实操参与",
          value: detail.behaviors.practiceUsers + " 位",
          hint: "提交过本课实操"
        },
        {
          label: "实操重试",
          value: detail.behaviors.practiceRetryUsers + " 位",
          hint: "实操提交次数 > 1"
        },
        {
          label: "AI 实操证据",
          value: detail.behaviors.aiEvidenceCount + " 次",
          hint: detail.behaviors.aiEvidenceUsers + " 位学员"
        }
      ]
    : [];

  return (
    <div className="admin-learning-evidence">
      {!embedded && (
        <button className="btn btn-secondary" type="button" disabled={loading} onClick={toggle}>
          {loading ? "正在读取…" : open ? "收起真实数据" : "查看真实数据"}
        </button>
      )}

      {open && (
        <div className="admin-learning-learning-data">
          {error && <div className="admin-message">{error}</div>}
          {!error && !detail && <p className="admin-muted">正在读取真实学习数据…</p>}

          {detail && (
            <>
              <div className="admin-learning-data-switch" role="tablist" aria-label="真实数据视图">
                <button
                  type="button"
                  className={dataView === "FEEDBACK" ? "is-active" : ""}
                  onClick={() => setDataView("FEEDBACK")}
                >
                  学习反馈
                </button>
                <button
                  type="button"
                  className={dataView === "BEHAVIOR" ? "is-active" : ""}
                  onClick={() => setDataView("BEHAVIOR")}
                >
                  学习行为
                </button>
              </div>

              {dataView === "FEEDBACK" && (
              <section className="admin-learning-feedback-section">
                <div className="admin-learning-data-section-head">
                  <div>
                    <strong>学习反馈</strong>
                    <span>{detail.summary.feedbackCount} 条 · {detail.summary.feedbackUsers} 位学员</span>
                  </div>
                  {detail.feedback.length > 5 && (
                    <button type="button" onClick={() => setFeedbackExpanded((value) => !value)}>
                      {feedbackExpanded ? "收起" : "查看全部"}
                    </button>
                  )}
                </div>

                {visibleFeedback.length === 0 ? (
                  <div className="admin-learning-data-empty-flat">暂无直接学习反馈。</div>
                ) : (
                  <div className="admin-learning-feedback-rows">
                    {visibleFeedback.map((item, index) => (
                      <article key={item.createdAt + "-" + index}>
                        <div>
                          <strong>{feedbackIssueLabel(item.issueType)}</strong>
                          <span>{resolutionLabel(item.resolutionStatus)}</span>
                          <time>{dateText(item.createdAt)}</time>
                        </div>
                        <p>{item.comment || "学员未填写补充说明。"}</p>
                        {item.reasons.length > 0 && <small>原因：{item.reasons.join("、")}</small>}
                      </article>
                    ))}
                  </div>
                )}
              </section>
              )}

              {dataView === "BEHAVIOR" && (
              <section className="admin-learning-behavior-section">
                <div className="admin-learning-data-section-head">
                  <div>
                    <strong>学习行为</strong>
                    <span>基于当前正式课程真实数据</span>
                  </div>
                </div>
                <div className="admin-learning-behavior-grid">
                  {behaviorCards.map((card) => (
                    <div key={card.label}>
                      <span>{card.label}</span>
                      <strong>{card.value}</strong>
                      <small>{card.hint}</small>
                    </div>
                  ))}
                </div>
              </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
