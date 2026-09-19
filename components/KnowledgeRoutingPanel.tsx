"use client";

import { useEffect, useState } from "react";
import { LatestPracticeRoutingPanel } from "./LatestPracticeRoutingPanel";

type ContentForKnowledge = {
  id: string;
  title: string;
  summary: string;
  category: string;
  readingMinutes: number | null;
  destination: string;
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
    title: content.title,
    summary: content.summary,
    body: "",
    category: content.category,
    validity: "NEW",
    stageId: "",
    lessonId: "",
    readingMinutes: content.readingMinutes ?? 5,
    status: "DRAFT"
  });

  useEffect(() => {
    setForm({
      title: content.title,
      summary: content.summary,
      body: "",
      category: content.category,
      validity: "NEW",
      stageId: "",
      lessonId: "",
      readingMinutes: content.readingMinutes ?? 5,
      status: "DRAFT"
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
  }, [content.id, content.title, content.summary, content.category, content.readingMinutes]);

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
            ...form,
            stageId: form.stageId || null,
            lessonId: form.lessonId || null,
            body: form.body || null
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
          <p>这是人工确认动作。不会自动改课程，也不会自动进入 Practice。</p>
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
            <em>sourceContentId = {content.id}</em>
          </div>
          <LatestPracticeRoutingPanel knowledge={linked} />
        </>
      ) : (
        <>
          <div className="admin-form-grid admin-routing-form">
            <label className="admin-field admin-field-wide">
              <span>Knowledge 标题</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>Knowledge 摘要</span>
              <textarea rows={4} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>正文（可选）</span>
              <textarea rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="整理后的 Knowledge Capsule 正文" />
            </label>

            <label className="admin-field">
              <span>分类</span>
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            </label>

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

            <label className="admin-field">
              <span>阅读时间（分钟）</span>
              <input type="number" min={1} max={120} value={form.readingMinutes} onChange={(event) => setForm({ ...form, readingMinutes: Number(event.target.value) || 1 })} />
            </label>

            <label className="admin-field">
              <span>Knowledge 状态</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </label>
          </div>

          <div className="admin-routing-actions">
            <small>title / summary / category / readingMinutes 已从 Content 预填；Stage / Lesson 只做人工确认，不自动猜测。</small>
            <button className="btn btn-primary" type="button" onClick={route} disabled={routing}>
              {routing ? "生成中…" : "生成 Knowledge"}
            </button>
          </div>
        </>
      )}

      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}
