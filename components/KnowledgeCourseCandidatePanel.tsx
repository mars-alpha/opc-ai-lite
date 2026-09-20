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

type ImpactSuggestion = {
  lessonId: string;
  lessonTitle: string;
  disposition: string;
  affectedArea: string;
  proposedChange: string;
  rationale: string;
  confidence: number;
};

type ImpactResult = {
  generationMode: "RULE" | "AI";
  generationError: string | null;
  suggestions: ImpactSuggestion[];
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
  const [analyzing, setAnalyzing] = useState(false);
  const [impact, setImpact] = useState<ImpactResult | null>(null);
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
    setImpact(null);
    setMessage(null);
    setLoading(true);
    load()
      .catch((error) => setMessage(error instanceof Error ? error.message : "课程更新候选读取失败"))
      .finally(() => setLoading(false));
  }, [knowledge.id, knowledge.lessonId]);

  async function analyzeImpact() {
    setAnalyzing(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/course-impact",
        { method: "POST" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages: Record<string, string> = {
          KNOWLEDGE_NOT_PUBLISHED: "Knowledge 尚未 PUBLISHED，不能执行课程影响分析。",
          KNOWLEDGE_NOT_ACTIVE: "Knowledge 已过时或废弃，不能执行课程影响分析。",
          NO_PUBLISHED_LESSONS: "当前没有可供分析的 Published Lesson。"
        };
        throw new Error(messages[data.error] ?? data.error ?? "课程影响分析失败");
      }

      const result = data as ImpactResult;
      setImpact(result);
      if (result.suggestions.length === 0) {
        setMessage(
          result.generationMode === "AI"
            ? "分析未发现明确需要更新的 Lesson；不会自动生成 Candidate。"
            : "RULE 分析没有足够课程关联，未生成建议；请人工判断目标 Lesson。"
        );
      } else {
        setMessage(
          result.generationMode === "AI"
            ? "AI 已给出课程影响建议；请人工确认后再创建 Candidate。"
            : "当前未使用真实 AI Provider，已给出 RULE 影响建议；请人工确认。"
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "课程影响分析失败");
    } finally {
      setAnalyzing(false);
    }
  }

  function applySuggestion(suggestion: ImpactSuggestion) {
    setLessonId(suggestion.lessonId);
    setDisposition(suggestion.disposition);
    setProposedChange(suggestion.proposedChange);
    setRationale(suggestion.rationale);
    setAffectedArea(suggestion.affectedArea);
    setMessage("已填入影响分析建议；请人工确认并按需修改后再创建 Candidate。");
  }

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
          <div className="admin-routing-actions">
            <small>
              影响分析只提供候选 Lesson 与修改建议；不会自动创建、批准或修改课程。
            </small>
            <button
              className="btn btn-ghost"
              type="button"
              disabled={analyzing || knowledge.status !== "PUBLISHED"}
              onClick={analyzeImpact}
            >
              {analyzing ? "分析中…" : "分析课程影响"}
            </button>
          </div>

          {impact ? (
            <div className="admin-candidate-linked-list">
              <div className="admin-routing-note">
                {impact.generationMode}
                {impact.generationError ? " · " + impact.generationError : ""}
              </div>
              {impact.suggestions.map((suggestion) => (
                <div className="admin-routing-linked" key={suggestion.lessonId}>
                  <div>
                    <span>
                      影响建议 · {Math.round(suggestion.confidence * 100)}%
                    </span>
                    <strong>{suggestion.lessonTitle}</strong>
                    <small>{suggestion.disposition} · {suggestion.affectedArea}</small>
                    <small>{suggestion.rationale}</small>
                  </div>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    采用
                  </button>
                </div>
              ))}
            </div>
          ) : null}

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