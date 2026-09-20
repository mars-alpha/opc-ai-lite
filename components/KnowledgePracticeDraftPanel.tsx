"use client";

import { useEffect, useState } from "react";

type KnowledgeItem = {
  id: string;
  title: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
};

type DraftRow = {
  id: string;
  sourceKnowledgeId: string;
  sourceDeepResourceId: string | null;
  generationMode: "RULE" | "AI";
  generationError: string | null;
  draft: Record<string, unknown>;
  status: "PENDING_REVIEW" | "NEEDS_REVISION" | "APPROVED" | "DISMISSED";
  reviewNote: string | null;
  resultPracticeId: string | null;
};

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function KnowledgePracticeDraftPanel({ knowledge }: { knowledge: KnowledgeItem }) {
  const [item, setItem] = useState<DraftRow | null>(null);
  const [deepResourceId, setDeepResourceId] = useState("");
  const [draftText, setDraftText] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(
      "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/practice-draft",
      { cache: "no-store" }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Practice Draft 读取失败");
    const next = (data.item ?? null) as DraftRow | null;
    setItem(next);
    setDeepResourceId(next?.sourceDeepResourceId ?? "");
    setDraftText(next ? pretty(next.draft) : "");
    setReviewNote(next?.reviewNote ?? "");
  }

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    load()
      .catch((error) => setMessage(error instanceof Error ? error.message : "Practice Draft 读取失败"))
      .finally(() => setLoading(false));
  }, [knowledge.id]);

  async function generate() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/practice-draft",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sourceDeepResourceId: deepResourceId || null })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages: Record<string, string> = {
          KNOWLEDGE_NOT_PUBLISHED: "只有 Published Knowledge 才能生成 Practice Draft。",
          KNOWLEDGE_NOT_ACTIVE: "当前 Knowledge 已过时或废弃，不能生成 Practice Draft。",
          DEEP_RESOURCE_NOT_FOUND: "Deep Resource 不存在或不属于当前 Knowledge。",
          DEEP_RESOURCE_NOT_PUBLISHED: "只有 Published Deep Resource 才能作为 Draft 来源。"
        };
        throw new Error(messages[data.error] ?? data.error ?? "Practice Draft 生成失败");
      }
      await load();
      const row = data.item as DraftRow;
      setMessage(
        row.generationMode === "AI"
          ? "AI Practice Draft 已生成，等待人工审核。"
          : "已生成 RULE Draft。当前未使用真实 AI Provider；请人工检查和修改。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Practice Draft 生成失败");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    setBusy(true);
    setMessage(null);
    try {
      let draft: unknown;
      try {
        draft = JSON.parse(draftText);
      } catch {
        throw new Error("Draft JSON 格式不正确。");
      }
      const response = await fetch(
        "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/practice-draft",
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sourceDeepResourceId: deepResourceId || null,
            draft
          })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Practice Draft 保存失败");
      await load();
      setMessage("Practice Draft 已保存并重新进入 PENDING_REVIEW。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Practice Draft 保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function review(status: "APPROVED" | "NEEDS_REVISION" | "DISMISSED") {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/practice-draft/review",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status, reviewNote })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.error === "LATEST_PRACTICE_EXISTS") {
          throw new Error("当前 Knowledge 已有正式 Latest Practice，AI Draft 不允许覆盖；请使用现有人工编辑入口。");
        }
        throw new Error(data.error ?? "Practice Draft 审核失败");
      }
      await load();
      setMessage(
        status === "APPROVED"
          ? "Draft 已批准，并创建正式 Latest Practice DRAFT；仍需人工检查后再发布。"
          : status === "NEEDS_REVISION"
            ? "Draft 已标记需要修改。"
            : "Draft 已驳回。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Practice Draft 审核失败");
    } finally {
      setBusy(false);
    }
  }

  const final = item?.status === "APPROVED" || item?.status === "DISMISSED";

  return (
    <section className="admin-routing-panel">
      <div className="admin-routing-head">
        <div>
          <div className="kicker">Practice Draft Skill v0.1</div>
          <h2>Knowledge → Practice Draft</h2>
          <p>Skill 只生成候选。APPROVE 最多创建正式 Practice DRAFT，不会直接发布，也不会覆盖已有 Practice。</p>
        </div>
      </div>

      {loading ? (
        <p className="admin-routing-note">正在读取 Practice Draft…</p>
      ) : (
        <>
          <div className="admin-routing-actions">
            <label className="admin-field">
              <span>Published Deep Resource ID（可选）</span>
              <input
                value={deepResourceId}
                onChange={(event) => setDeepResourceId(event.target.value)}
                placeholder="uuid"
                disabled={Boolean(final)}
              />
            </label>
            <button className="btn btn-primary" type="button" onClick={generate} disabled={busy || Boolean(final)}>
              {busy ? "处理中…" : item ? "重新生成 Draft" : "生成 Practice Draft"}
            </button>
          </div>

          {item ? (
            <>
              <div className="admin-routing-linked">
                <div>
                  <span>{item.status} · {item.generationMode}</span>
                  <strong>{item.resultPracticeId ?? "尚未形成正式 Practice"}</strong>
                  <small>{item.generationError ?? "generation ok"}</small>
                </div>
              </div>

              <label className="admin-field admin-field-wide">
                <span>Draft JSON（人工可修改）</span>
                <textarea
                  rows={22}
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  disabled={Boolean(final)}
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>审核备注</span>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  disabled={Boolean(final)}
                />
              </label>

              <div className="admin-routing-actions">
                <button className="btn btn-ghost" type="button" onClick={saveDraft} disabled={busy || Boolean(final)}>
                  保存修改
                </button>
                <div>
                  <button className="btn btn-ghost" type="button" onClick={() => review("NEEDS_REVISION")} disabled={busy || Boolean(final)}>
                    需要修改
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => review("DISMISSED")} disabled={busy || Boolean(final)}>
                    驳回
                  </button>
                  <button className="btn btn-primary" type="button" onClick={() => review("APPROVED")} disabled={busy || Boolean(final)}>
                    批准为 Practice DRAFT
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="admin-routing-note">
              当前没有 Draft。{knowledge.status !== "PUBLISHED" ? "Knowledge 尚未 PUBLISHED，暂不能生成。" : ""}
            </p>
          )}
        </>
      )}

      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}
