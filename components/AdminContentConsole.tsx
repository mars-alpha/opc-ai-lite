"use client";

import { useEffect, useMemo, useState } from "react";
import { KnowledgeRoutingPanel } from "./KnowledgeRoutingPanel";

type PublicationStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
type Destination =
  | "IGNORE"
  | "DAILY_ITEM"
  | "KNOWLEDGE_CAPSULE"
  | "PRACTICE_CANDIDATE"
  | "COURSE_UPDATE_CANDIDATE";

type ContentItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  destination: Destination;
  sourceType: string;
  sourceRef: string | null;
  sourceUrl: string | null;
  sourcePublishedAt: string | null;
  collectedAt: string;
  reviewedAt: string | null;
  reviewer: string | null;
  readingMinutes: number | null;
  status: PublicationStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const publicationStatuses: PublicationStatus[] = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"];
const statuses = ["ALL", ...publicationStatuses] as const;
const destinations: Array<{ value: Destination; label: string }> = [
  { value: "DAILY_ITEM", label: "AI Daily" },
  { value: "KNOWLEDGE_CAPSULE", label: "Knowledge Capsule" },
  { value: "PRACTICE_CANDIDATE", label: "Practice Candidate" },
  { value: "COURSE_UPDATE_CANDIDATE", label: "Course Update Candidate" },
  { value: "IGNORE", label: "Ignore" }
];

function emptyItem(): ContentItem {
  const now = new Date().toISOString();
  return {
    id: "",
    title: "",
    summary: "",
    category: "AI 更新",
    destination: "DAILY_ITEM",
    sourceType: "manual",
    sourceRef: null,
    sourceUrl: null,
    sourcePublishedAt: null,
    collectedAt: now,
    reviewedAt: null,
    reviewer: null,
    readingMinutes: 5,
    status: "DRAFT",
    publishedAt: null,
    createdAt: now,
    updatedAt: now
  };
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function makeContentId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return "content_" + stamp + "_" + Math.random().toString(36).slice(2, 7);
}

function statusLabel(status: PublicationStatus) {
  const labels: Record<PublicationStatus, string> = {
    DRAFT: "草稿",
    REVIEW: "待审核",
    PUBLISHED: "已发布",
    ARCHIVED: "已归档"
  };
  return labels[status];
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function AdminContentConsole() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("ALL");
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<ContentItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadItems(preferredId?: string) {
    const response = await fetch("/api/admin/content/items", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "内容队列读取失败");

    const nextItems = (data.items ?? []) as ContentItem[];
    setItems(nextItems);
    const targetId = preferredId || selectedId || nextItems[0]?.id || "";
    if (targetId && nextItems.some((item) => item.id === targetId)) {
      setSelectedId(targetId);
    } else if (!creating) {
      setSelectedId(nextItems[0]?.id ?? "");
    }
  }

  useEffect(() => {
    loadItems()
      .catch((error) => setMessage(error instanceof Error ? error.message : "内容队列读取失败"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (creating) return;
    const selected = items.find((item) => item.id === selectedId) ?? null;
    setDraft(selected ? { ...selected } : null);
  }, [creating, items, selectedId]);

  const filteredItems = useMemo(
    () =>
      items
        .filter((item) => filter === "ALL" || item.status === filter)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [filter, items]
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: items.length };
    for (const status of statuses.slice(1)) {
      result[status] = items.filter((item) => item.status === status).length;
    }
    return result;
  }, [items]);

  function startCreate() {
    setCreating(true);
    setSelectedId("");
    setDraft(emptyItem());
    setMessage(null);
  }

  function selectItem(id: string) {
    setCreating(false);
    setSelectedId(id);
    setMessage(null);
  }

  function updateDraft(patch: Partial<ContentItem>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.summary.trim() || !draft.category.trim() || !draft.sourceType.trim()) {
      setMessage("标题、摘要、分类和来源类型不能为空。");
      return;
    }

    setSaving(true);
    setMessage(null);

    const now = new Date().toISOString();
    const reviewedAt =
      draft.status === "REVIEW" || draft.status === "PUBLISHED"
        ? draft.reviewedAt ?? now
        : draft.reviewedAt;

    const payload = {
      id: creating ? makeContentId() : draft.id,
      title: draft.title,
      summary: draft.summary,
      category: draft.category,
      destination: draft.destination,
      sourceType: draft.sourceType,
      sourceRef: draft.sourceRef,
      sourceUrl: draft.sourceUrl,
      sourcePublishedAt: draft.sourcePublishedAt,
      reviewedAt,
      reviewer: draft.reviewer,
      readingMinutes: draft.readingMinutes,
      status: draft.status,
      publishedAt: draft.status === "PUBLISHED" ? draft.publishedAt : null
    };

    try {
      const response = await fetch(
        creating
          ? "/api/admin/content/items"
          : "/api/admin/content/items/" + encodeURIComponent(draft.id),
        {
          method: creating ? "POST" : "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "保存失败");

      const saved = data.item as ContentItem;
      setCreating(false);
      setSelectedId(saved.id);
      setDraft(saved);
      await loadItems(saved.id);
      setMessage(
        saved.status === "PUBLISHED"
          ? "已发布。AI Daily 会在 Published 内容缓存刷新后读取这条内容。"
          : "已保存为 " + statusLabel(saved.status) + "。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="admin-empty">正在读取 Content Queue…</div>;
  }

  return (
    <div className="admin-content-console">
      <aside className="admin-content-queue">
        <div className="admin-panel-head">
          <div>
            <div className="kicker">Content Queue</div>
            <h2>内容队列</h2>
          </div>
          <button className="btn btn-primary admin-create-content" type="button" onClick={startCreate}>
            新建内容
          </button>
        </div>

        <div className="admin-content-filters">
          {statuses.map((status) => (
            <button
              type="button"
              key={status}
              className={filter === status ? "is-active" : ""}
              onClick={() => setFilter(status)}
            >
              <span>{status === "ALL" ? "全部" : statusLabel(status)}</span>
              <strong>{counts[status] ?? 0}</strong>
            </button>
          ))}
        </div>

        <div className="admin-content-scroll">
          {filteredItems.length === 0 ? (
            <div className="admin-empty admin-content-empty">当前筛选下没有内容。</div>
          ) : (
            filteredItems.map((item) => (
              <button
                className={"admin-content-row " + (selectedId === item.id && !creating ? "is-active" : "")}
                type="button"
                key={item.id}
                onClick={() => selectItem(item.id)}
              >
                <div className="admin-content-row-top">
                  <em className={"status-" + item.status.toLowerCase()}>{statusLabel(item.status)}</em>
                  <small>{formatDate(item.updatedAt)}</small>
                </div>
                <strong>{item.title}</strong>
                <span>{item.category} · {item.sourceType}</span>
                <small>{destinations.find((entry) => entry.value === item.destination)?.label ?? item.destination}</small>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="admin-editor-panel admin-content-editor">
        {!draft ? (
          <div className="admin-empty">选择一条内容，或新建 Content Item。</div>
        ) : (
          <>
            <div className="admin-editor-head">
              <div>
                <div className="kicker">{creating ? "New Content Item" : draft.id}</div>
                <h1>{draft.title || "未命名内容"}</h1>
              </div>
              <div className="admin-content-state">
                <span>Status</span>
                <strong className={"status-" + draft.status.toLowerCase()}>{statusLabel(draft.status)}</strong>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field-wide">
                <span>标题</span>
                <input
                  value={draft.title}
                  maxLength={180}
                  onChange={(event) => updateDraft({ title: event.target.value })}
                  placeholder="这条 AI 信息发生了什么？"
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>摘要</span>
                <textarea
                  rows={5}
                  maxLength={1200}
                  value={draft.summary}
                  onChange={(event) => updateDraft({ summary: event.target.value })}
                  placeholder="用 OPC 的语言说明为什么值得关注。"
                />
              </label>

              <label className="admin-field">
                <span>分类</span>
                <input
                  value={draft.category}
                  maxLength={120}
                  onChange={(event) => updateDraft({ category: event.target.value })}
                  placeholder="模型与能力 / 工具 / 行业"
                />
              </label>

              <label className="admin-field">
                <span>去向</span>
                <select
                  value={draft.destination}
                  onChange={(event) => updateDraft({ destination: event.target.value as Destination })}
                >
                  {destinations.map((item) => (
                    <option value={item.value} key={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>来源类型</span>
                <input
                  value={draft.sourceType}
                  maxLength={120}
                  onChange={(event) => updateDraft({ sourceType: event.target.value })}
                  placeholder="manual / youtube / official"
                />
              </label>

              <label className="admin-field">
                <span>来源标识</span>
                <input
                  value={draft.sourceRef ?? ""}
                  onChange={(event) => updateDraft({ sourceRef: event.target.value || null })}
                  placeholder="原始内容 ID，可留空"
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>来源 URL</span>
                <input
                  type="url"
                  value={draft.sourceUrl ?? ""}
                  onChange={(event) => updateDraft({ sourceUrl: event.target.value || null })}
                  placeholder="https://..."
                />
              </label>

              <label className="admin-field">
                <span>来源发布时间</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(draft.sourcePublishedAt)}
                  onChange={(event) => updateDraft({ sourcePublishedAt: fromDateTimeLocal(event.target.value) })}
                />
              </label>

              <label className="admin-field">
                <span>阅读时间（分钟）</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={draft.readingMinutes ?? ""}
                  onChange={(event) =>
                    updateDraft({ readingMinutes: event.target.value ? Number(event.target.value) : null })
                  }
                />
              </label>

              <label className="admin-field">
                <span>审核人</span>
                <input
                  value={draft.reviewer ?? ""}
                  onChange={(event) => updateDraft({ reviewer: event.target.value || null })}
                  placeholder="管理员名称 / 标识"
                />
              </label>

              <label className="admin-field">
                <span>状态</span>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    updateDraft({ status: event.target.value as PublicationStatus })
                  }
                >
                  {publicationStatuses.map((status) => (
                    <option value={status} key={status}>{statusLabel(status)}</option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>审核时间</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(draft.reviewedAt)}
                  onChange={(event) => updateDraft({ reviewedAt: fromDateTimeLocal(event.target.value) })}
                />
              </label>

              <label className="admin-field">
                <span>发布时间</span>
                <input
                  type="datetime-local"
                  disabled={draft.status !== "PUBLISHED"}
                  value={toDateTimeLocal(draft.publishedAt)}
                  onChange={(event) => updateDraft({ publishedAt: fromDateTimeLocal(event.target.value) })}
                />
                <small>PUBLISHED 且留空时，服务端会自动使用当前时间。</small>
              </label>
            </div>

            <div className="admin-content-lifecycle">
              <span className={draft.status === "DRAFT" ? "is-current" : ""}>DRAFT</span>
              <i>→</i>
              <span className={draft.status === "REVIEW" ? "is-current" : ""}>REVIEW</span>
              <i>→</i>
              <span className={draft.status === "PUBLISHED" ? "is-current" : ""}>PUBLISHED</span>
              <i>→</i>
              <span className={draft.status === "ARCHIVED" ? "is-current" : ""}>ARCHIVED</span>
            </div>

            {!creating && draft.destination === "KNOWLEDGE_CAPSULE" ? (
              <KnowledgeRoutingPanel content={draft} />
            ) : null}

            <div className="admin-editor-footer">
              <div>
                {message && <p className="admin-message">{message}</p>}
                <small>
                  只有 PUBLISHED 且 destination 不是 IGNORE 的 Content 才会进入 AI Daily 读取边界。
                </small>
              </div>
              <button className="btn btn-primary" type="button" onClick={save} disabled={saving}>
                {saving ? "保存中…" : creating ? "创建 Content" : "保存 Content"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
