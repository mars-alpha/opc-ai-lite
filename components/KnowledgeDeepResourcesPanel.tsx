"use client";

import { useEffect, useState } from "react";

type KnowledgeItem = {
  id: string;
  title: string;
  summary: string;
  lessonId: string | null;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
};

type DeepResource = {
  id: string;
  knowledgeId: string;
  lessonId: string | null;
  practiceId: string | null;
  provider: "FEISHU";
  title: string;
  summary: string | null;
  resourceRef: string | null;
  url: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
};

function emptyForm(knowledge: KnowledgeItem) {
  return {
    title: knowledge.title + " · 深度资料",
    summary: knowledge.summary,
    resourceRef: "",
    url: "",
    lessonId: knowledge.lessonId ?? "",
    practiceId: "",
    status: "DRAFT" as DeepResource["status"]
  };
}

export function KnowledgeDeepResourcesPanel({ knowledge }: { knowledge: KnowledgeItem }) {
  const [items, setItems] = useState<DeepResource[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(() => emptyForm(knowledge));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(
      "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/deep-resources",
      { cache: "no-store" }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "深度资料读取失败");
    setItems((data.items ?? []) as DeepResource[]);
  }

  useEffect(() => {
    setSelectedId(null);
    setForm(emptyForm(knowledge));
    setMessage(null);
    setLoading(true);
    load()
      .catch((error) => setMessage(error instanceof Error ? error.message : "深度资料读取失败"))
      .finally(() => setLoading(false));
  }, [knowledge.id, knowledge.title, knowledge.summary, knowledge.lessonId, knowledge.status]);

  function edit(item: DeepResource) {
    setSelectedId(item.id);
    setForm({
      title: item.title,
      summary: item.summary ?? "",
      resourceRef: item.resourceRef ?? "",
      url: item.url,
      lessonId: item.lessonId ?? "",
      practiceId: item.practiceId ?? "",
      status: item.status
    });
    setMessage(null);
  }

  function reset() {
    setSelectedId(null);
    setForm(emptyForm(knowledge));
    setMessage(null);
  }

  async function save() {
    setBusy(true);
    setMessage(null);

    try {
      const base = "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/deep-resources";
      const response = await fetch(selectedId ? base + "/" + encodeURIComponent(selectedId) : base, {
        method: selectedId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          summary: form.summary || null,
          resourceRef: form.resourceRef || null,
          lessonId: form.lessonId || null,
          practiceId: form.practiceId || null
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const messages: Record<string, string> = {
          KNOWLEDGE_NOT_PUBLISHED: "只有 Published Knowledge 才能发布可用的 Deep Resource。",
          LESSON_NOT_FOUND: "Lesson 不存在，请检查 Lesson ID。",
          PRACTICE_NOT_FOUND: "Practice 不存在，请检查 Practice ID。",
          DEEP_RESOURCE_URL_EXISTS: "该 Knowledge 已有关联相同 URL 的 Deep Resource。",
          INVALID_DEEP_RESOURCE_URL: "请输入有效的 HTTPS 飞书资料 URL。"
        };
        throw new Error(messages[data.error] ?? data.error ?? "深度资料保存失败");
      }

      await load();
      const item = data.item as DeepResource;
      setSelectedId(item.id);
      setForm({
        title: item.title,
        summary: item.summary ?? "",
        resourceRef: item.resourceRef ?? "",
        url: item.url,
        lessonId: item.lessonId ?? "",
        practiceId: item.practiceId ?? "",
        status: item.status
      });
      setMessage(data.created === false ? "该飞书 URL 已存在，已返回现有资料。" : "Deep Resource 已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "深度资料保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-routing-panel">
      <div className="admin-routing-head">
        <div>
          <div className="kicker">Deep Resource / Feishu</div>
          <h2>Knowledge → 飞书深度资料</h2>
          <p>这里只保存 OPC 对飞书资料的正式引用；飞书不是 Production Source of Truth，也不会自动同步。</p>
        </div>
      </div>

      {loading ? (
        <p className="admin-routing-note">正在读取 Deep Resource…</p>
      ) : (
        <>
          <div className="admin-candidate-linked-list">
            {items.length === 0 ? (
              <p className="admin-routing-note">当前还没有 Deep Resource。</p>
            ) : (
              items.map((item) => (
                <div className="admin-routing-linked" key={item.id}>
                  <div>
                    <span>{item.status} · FEISHU</span>
                    <strong>{item.title}</strong>
                    <small>{item.lessonId ?? "no lesson"} · {item.practiceId ?? "no practice"}</small>
                  </div>
                  <button className="btn btn-ghost" type="button" onClick={() => edit(item)}>
                    编辑
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="admin-form-grid admin-routing-form">
            <label className="admin-field admin-field-wide">
              <span>资料标题</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>摘要（可选）</span>
              <textarea rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>飞书 URL</span>
              <input
                type="url"
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                placeholder="https://..."
              />
            </label>

            <label className="admin-field">
              <span>Resource Ref（可选）</span>
              <input
                value={form.resourceRef}
                onChange={(event) => setForm({ ...form, resourceRef: event.target.value })}
                placeholder="doc/wiki/token..."
              />
            </label>

            <label className="admin-field">
              <span>Lesson ID（可选）</span>
              <input
                value={form.lessonId}
                onChange={(event) => setForm({ ...form, lessonId: event.target.value })}
                placeholder="lesson_..."
              />
            </label>

            <label className="admin-field">
              <span>Practice ID（可选）</span>
              <input
                value={form.practiceId}
                onChange={(event) => setForm({ ...form, practiceId: event.target.value })}
                placeholder="practice_..."
              />
            </label>

            <label className="admin-field">
              <span>状态</span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as DeepResource["status"] })}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </label>
          </div>

          <div className="admin-routing-actions">
            <small>
              {knowledge.status === "PUBLISHED"
                ? "Knowledge 已发布，可将 Deep Resource 发布为 PUBLISHED。"
                : "Knowledge 尚未发布；Deep Resource 可保存草稿，但不能进入 PUBLISHED。"}
            </small>
            <div>
              {selectedId ? (
                <button className="btn btn-ghost" type="button" onClick={reset} disabled={busy}>
                  新建
                </button>
              ) : null}
              <button className="btn btn-primary" type="button" onClick={save} disabled={busy}>
                {busy ? "保存中…" : selectedId ? "更新 Deep Resource" : "创建 Deep Resource"}
              </button>
            </div>
          </div>
        </>
      )}

      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}
