"use client";

import { useEffect, useState } from "react";

type KnowledgeSource = {
  id: string;
  contentId: string;
  role: "PRIMARY" | "SUPPORTING";
  contentTitle: string;
  contentStatus: string;
  evidence: Array<{
    id: string;
    title: string | null;
    originalUrl: string | null;
    verificationStatus: string;
    sourceId: string;
    sourceName: string;
    sourceType: string;
  }>;
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
          CONTENT_NOT_PUBLISHED: "Supporting Content 必须先完成审核与正式发布。",
          CONTENT_VERIFIED_EVIDENCE_REQUIRED: "Supporting Content 必须至少关联一条已验证证据。",
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
          <p>Primary / Supporting 关系仍以正式 Content 为单位；每条 Content 的真实来源来自已关联 Evidence。</p>
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
                    <small>{item.contentId} · {item.contentStatus} · {item.evidence.length} 条证据</small>
                  </div>
                  <em>
                    {item.evidence.length
                      ? Array.from(new Set(item.evidence.map((entry) => entry.sourceName))).join(" / ")
                      : "未关联证据"}
                  </em>
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
