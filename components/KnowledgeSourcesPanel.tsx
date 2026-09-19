"use client";

import { useEffect, useState } from "react";

type KnowledgeSource = {
  id: string;
  contentId: string;
  role: "PRIMARY" | "SUPPORTING";
  contentTitle: string;
  sourceType: string;
  sourceRef: string | null;
  sourceUrl: string | null;
  contentStatus: string;
};

export function KnowledgeSourcesPanel({
  knowledgeId,
  primaryContentId
}: {
  knowledgeId: string;
  primaryContentId: string | null;
}) {
  const [items, setItems] = useState<KnowledgeSource[]>([]);
  const [contentId, setContentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(
      "/api/admin/knowledge/items/" + encodeURIComponent(knowledgeId) + "/sources",
      { cache: "no-store" }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Knowledge 来源读取失败");
    setItems((data.items ?? []) as KnowledgeSource[]);
  }

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    load()
      .catch((error) => setMessage(error instanceof Error ? error.message : "Knowledge 来源读取失败"))
      .finally(() => setLoading(false));
  }, [knowledgeId, primaryContentId]);

  async function addSource() {
    if (!contentId.trim()) {
      setMessage("请输入需要补充的 Content ID。");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/knowledge/items/" + encodeURIComponent(knowledgeId) + "/sources",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contentId: contentId.trim() })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages: Record<string, string> = {
          CONTENT_NOT_FOUND: "Content 不存在，请检查 Content ID。",
          KNOWLEDGE_NOT_FOUND: "Knowledge 不存在。",
          INVALID_CONTENT_ID: "Content ID 无效。"
        };
        throw new Error(messages[data.error] ?? data.error ?? "Knowledge 来源添加失败");
      }

      await load();
      setContentId("");
      setMessage(data.created ? "已添加 Supporting Source。" : "该来源已存在，未重复添加。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Knowledge 来源添加失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-routing-panel">
      <div className="admin-routing-head">
        <div>
          <div className="kicker">Knowledge Provenance</div>
          <h2>Knowledge 来源</h2>
          <p>Primary Source 保持兼容；其它 Content 只作为 Supporting Source，不替换主来源。</p>
        </div>
      </div>

      {loading ? (
        <p className="admin-routing-note">正在读取 Knowledge 来源…</p>
      ) : (
        <>
          <div className="admin-candidate-linked-list">
            {items.length === 0 ? (
              <p className="admin-routing-note">当前还没有正式来源关系。</p>
            ) : (
              items.map((item) => (
                <div className="admin-routing-linked" key={item.id}>
                  <div>
                    <span>{item.role}</span>
                    <strong>{item.contentTitle}</strong>
                    <small>{item.contentId} · {item.sourceType} · {item.contentStatus}</small>
                  </div>
                  <em>{item.sourceRef ?? item.sourceUrl ?? "—"}</em>
                </div>
              ))
            )}
          </div>

          <div className="admin-routing-actions">
            <label className="admin-field">
              <span>补充 Content ID</span>
              <input
                value={contentId}
                onChange={(event) => setContentId(event.target.value)}
                placeholder="content_..."
              />
            </label>
            <button className="btn btn-primary" type="button" onClick={addSource} disabled={busy}>
              {busy ? "添加中…" : "添加 Supporting Source"}
            </button>
          </div>
        </>
      )}

      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}
