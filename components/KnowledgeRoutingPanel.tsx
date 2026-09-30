"use client";

import { useEffect, useState } from "react";
import { LatestPracticeRoutingPanel } from "./LatestPracticeRoutingPanel";
import { KnowledgeCourseCandidatePanel } from "./KnowledgeCourseCandidatePanel";
import { KnowledgeSourcesPanel } from "./KnowledgeSourcesPanel";
import { KnowledgeDeepResourcesPanel } from "./KnowledgeDeepResourcesPanel";
import { KnowledgePracticeDraftPanel } from "./KnowledgePracticeDraftPanel";

type ContentForKnowledge = {
  id: string;
  title: string;
  summary: string;
  category: string;
  readingMinutes: number | null;
  destination: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
};

type KnowledgeItem = {
  id: string;
  sourceContentId: string | null;
  title: string;
  summary: string;
  body: string | null;
  category: string;
  validity: "NEW" | "ACTIVE" | "WATCH" | "OUTDATED" | "DEPRECATED";
  stageId: string | null;
  lessonId: string | null;
  readingMinutes: number | null;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
};

export function KnowledgeRoutingPanel({ content }: { content: ContentForKnowledge }) {
  const [linked, setLinked] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [routing, setRouting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    validity: "NEW",
    stageId: "",
    lessonId: ""
  });

  useEffect(() => {
    setForm({
      validity: "NEW",
      stageId: "",
      lessonId: ""
    });
    setMessage(null);
    setLoading(true);

    fetch("/api/admin/content/items/" + encodeURIComponent(content.id) + "/knowledge", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Knowledge 关联读取失败");
        setLinked((data.item ?? null) as KnowledgeItem | null);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Knowledge 关联读取失败"))
      .finally(() => setLoading(false));
  }, [content.id, content.title, content.summary, content.category, content.readingMinutes, content.status]);

  if (content.destination !== "KNOWLEDGE_CAPSULE") return null;

  async function route() {
    setRouting(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/content/items/" + encodeURIComponent(content.id) + "/knowledge",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            validity: form.validity,
            stageId: form.stageId || null,
            lessonId: form.lessonId || null
          })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "生成 Knowledge 失败");

      setLinked(data.item as KnowledgeItem);
      setMessage(data.created ? "Knowledge 已生成并绑定当前 Content。" : "该 Content 已有关联 Knowledge，未重复创建。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成 Knowledge 失败");
    } finally {
      setRouting(false);
    }
  }

  return (
    <section className="admin-routing-panel">
      <div className="admin-routing-head">
        <div>
          <div className="kicker">Knowledge Routing</div>
          <h2>Content → Knowledge</h2>
          <p>Knowledge 只从已审核并正式发布的 Content 派生；不会自动改课程，也不会自动进入 Practice。</p>
        </div>
      </div>

      {loading ? (
        <p className="admin-routing-note">正在检查已有 Knowledge…</p>
      ) : linked ? (
        <>
          <div className="admin-routing-linked">
            <div>
              <span>已关联 Knowledge</span>
              <strong>{linked.title}</strong>
              <small>{linked.id} · {linked.status} · {linked.validity}</small>
            </div>
            <em>primary sourceContentId = {linked.sourceContentId ?? "—"}</em>
          </div>
          <KnowledgeSourcesPanel knowledgeId={linked.id} primaryContentId={linked.sourceContentId} />
          <KnowledgeDeepResourcesPanel knowledge={linked} />
          <KnowledgePracticeDraftPanel knowledge={linked} />
          <LatestPracticeRoutingPanel knowledge={linked} />
          <KnowledgeCourseCandidatePanel knowledge={linked} />
        </>
      ) : (
        <>
          <div className="admin-form-grid admin-routing-form">
            <label className="admin-field">
              <span>Validity</span>
              <select value={form.validity} onChange={(event) => setForm({ ...form, validity: event.target.value })}>
                <option value="NEW">NEW</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="WATCH">WATCH</option>
                <option value="OUTDATED">OUTDATED</option>
                <option value="DEPRECATED">DEPRECATED</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Stage ID（可选）</span>
              <input value={form.stageId} onChange={(event) => setForm({ ...form, stageId: event.target.value })} placeholder="Content 当前没有 Stage 字段，需人工确认" />
            </label>

            <label className="admin-field">
              <span>Lesson ID（可选）</span>
              <input value={form.lessonId} onChange={(event) => setForm({ ...form, lessonId: event.target.value })} placeholder="关联已有 Lesson 时填写" />
            </label>

          </div>

          <div className="admin-routing-actions">
            <small>标题、摘要、分类和阅读时间固定继承已发布 Content；Stage / Lesson 只做人工确认，不自动猜测。</small>
            <button className="btn btn-primary" type="button" onClick={route} disabled={routing || content.status !== "PUBLISHED"}>
              {routing ? "生成中…" : content.status === "PUBLISHED" ? "生成正式 Knowledge" : "先完成 Content 审核与发布"}
            </button>
          </div>
        </>
      )}

      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}