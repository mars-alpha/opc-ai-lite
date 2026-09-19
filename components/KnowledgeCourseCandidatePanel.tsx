"use client";

import { useEffect, useState } from "react";

type KnowledgeForCandidate = {
  id: string;
  title: string;
  summary: string;
  lessonId: string | null;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  validity: "NEW" | "ACTIVE" | "WATCH" | "OUTDATED" | "DEPRECATED";
};

type Candidate = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  sourceType: string;
  disposition: string;
  proposal: unknown;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export function KnowledgeCourseCandidatePanel({ knowledge }: { knowledge: KnowledgeForCandidate }) {
  const [items, setItems] = useState<Candidate[]>([]);
  const [lessonId, setLessonId] = useState(knowledge.lessonId ?? "");
  const [disposition, setDisposition] = useState("CONTENT_UPDATE");
  const [proposedChange, setProposedChange] = useState("");
  const [rationale, setRationale] = useState("");
  const [affectedArea, setAffectedArea] = useState("Lesson content");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(
      "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/course-candidate",
      { cache: "no-store" }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "课程更新候选读取失败");
    setItems((data.items ?? []) as Candidate[]);
  }

  useEffect(() => {
    setLessonId(knowledge.lessonId ?? "");
    setMessage(null);
    setLoading(true);
    load()
      .catch((error) => setMessage(error instanceof Error ? error.message : "课程更新候选读取失败"))
      .finally(() => setLoading(false));
  }, [knowledge.id, knowledge.lessonId]);

  async function create() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/course-candidate",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lessonId: lessonId || null,
            disposition,
            proposedChange,
            rationale,
            affectedArea
          })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages: Record<string, string> = {
          KNOWLEDGE_NOT_PUBLISHED: "Knowledge 尚未 PUBLISHED，不能生成课程更新候选。",
          KNOWLEDGE_NOT_ACTIVE: "Knowledge 已过时或废弃，不能生成课程更新候选。",
          LESSON_REQUIRED: "请先确认目标 Lesson ID。",
          LESSON_NOT_FOUND: "目标 Lesson 不存在，请检查 Lesson ID。"
        };
        throw new Error(messages[data.error] ?? data.error ?? "课程更新候选创建失败");
      }

      await load();
      setMessage(
        data.created
          ? "课程更新候选已创建，并进入 /admin/learning 人工审核。"
          : "该 Knowledge 对此 Lesson 已有课程更新候选，未重复创建。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "课程更新候选创建失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-routing-panel admin-course-candidate-routing">
      <div className="admin-routing-head">
        <div>
          <div className="kicker">Course Update Routing</div>
          <h2>Knowledge → Course Update Candidate</h2>
          <p>只生成审核候选，不自动修改 Lesson。目标 Lesson 由管理员明确确认。</p>
        </div>
      </div>

      {loading ? <p className="admin-routing-note">正在检查已有课程更新候选…</p> : (
        <>
          {items.length > 0 ? (
            <div className="admin-candidate-linked-list">
              {items.map((item) => (
                <div className="admin-routing-linked" key={item.id}>
                  <div>
                    <span>已有关联 Candidate</span>
                    <strong>{item.lessonTitle}</strong>
                    <small>{item.disposition} · {item.status}</small>
                  </div>
                  <em>{item.id}</em>
                </div>
              ))}
            </div>
          ) : null}

          <div className="admin-form-grid admin-routing-form">
            <label className="admin-field">
              <span>目标 Lesson ID</span>
              <input
                value={lessonId}
                onChange={(event) => setLessonId(event.target.value)}
                placeholder="Knowledge 已有关联时会自动预填"
              />
            </label>

            <label className="admin-field">
              <span>Disposition</span>
              <select value={disposition} onChange={(event) => setDisposition(event.target.value)}>
                <option value="CONTENT_UPDATE">CONTENT_UPDATE</option>
                <option value="CONTENT_CLARIFICATION">CONTENT_CLARIFICATION</option>
                <option value="NEW_CONTENT_CANDIDATE">NEW_CONTENT_CANDIDATE</option>
                <option value="PRACTICE_IMPROVEMENT">PRACTICE_IMPROVEMENT</option>
                <option value="EVALUATION_REVIEW">EVALUATION_REVIEW</option>
              </select>
            </label>

            <label className="admin-field admin-field-wide">
              <span>建议改什么</span>
              <textarea
                rows={5}
                value={proposedChange}
                onChange={(event) => setProposedChange(event.target.value)}
                placeholder="只写课程更新 Proposal，不直接改 Published Lesson。"
              />
            </label>

            <label className="admin-field admin-field-wide">
              <span>为什么需要更新</span>
              <textarea
                rows={4}
                value={rationale}
                onChange={(event) => setRationale(event.target.value)}
                placeholder="说明这条 Knowledge 为什么影响目标 Lesson。"
              />
            </label>

            <label className="admin-field">
              <span>影响区域</span>
              <input
                value={affectedArea}
                onChange={(event) => setAffectedArea(event.target.value)}
                placeholder="Lesson content / Practice / Evaluation"
              />
            </label>
          </div>

          <div className="admin-routing-actions">
            <small>
              {knowledge.status !== "PUBLISHED"
                ? "当前 Knowledge 尚未发布，服务端会拒绝创建正式 Candidate。"
                : "创建后统一进入课程改进工作台审核；批准也不会自动修改课程。"}
            </small>
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy || knowledge.status !== "PUBLISHED"}
              onClick={create}
            >
              {busy ? "创建中…" : "创建课程更新候选"}
            </button>
          </div>
        </>
      )}

      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}
