"use client";

import { useEffect, useMemo, useState } from "react";
import { KnowledgeRoutingPanel } from "./KnowledgeRoutingPanel";
import { ContentWorkbenchLifecyclePanel } from "./ContentWorkbenchLifecyclePanel";

type PublicationStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
type ContentFocus = "CANDIDATE" | "REVIEW" | "PUBLISH";
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
  version: number;
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
    sourceType: "WORKBENCH",
    sourceRef: null,
    sourceUrl: null,
    sourcePublishedAt: null,
    collectedAt: now,
    reviewedAt: null,
    reviewer: null,
    readingMinutes: 5,
    status: "DRAFT",
    version: 1,
    publishedAt: null,
    createdAt: now,
    updatedAt: now
  };
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

export function AdminContentConsole({ focus }: { focus: ContentFocus }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<(typeof statuses)[number]>(
    focus === "PUBLISH" ? "REVIEW" : "DRAFT"
  );
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

  const focusCopy = {
    CANDIDATE: {
      kicker: "CANDIDATE",
      title: "候选内容",
      description: "左侧选择候选，右侧整理当前版本并关联证据。"
    },
    REVIEW: {
      kicker: "REVIEW",
      title: "待审核内容",
      description: "左侧选择待审核内容，右侧核对版本、证据和去向后作出人工决定。"
    },
    PUBLISH: {
      kicker: "PUBLISH",
      title: "待发布内容",
      description: "左侧选择已进入审核状态的内容，右侧确认发布条件与后续路由。"
    }
  }[focus];

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
    if (!draft.title.trim() || !draft.summary.trim() || !draft.category.trim()) {
      setMessage("标题、摘要和分类不能为空。");
      return;
    }

    setSaving(true);
    setMessage(null);

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
      readingMinutes: draft.readingMinutes
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
      setMessage(creating ? "候选内容已创建为草稿。" : "内容已保存为新版本，需要重新审核后才能发布。");
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
              <div className="kicker">{focusCopy.kicker}</div>
              <h2>{focusCopy.title}</h2>
              <p>{focusCopy.description}</p>
            </div>
            {focus === "CANDIDATE" ? (
              <button className="btn btn-primary admin-create-content" type="button" onClick={startCreate}>
                新建内容
              </button>
            ) : null}
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
                <span>{item.category} · v{item.version}</span>
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

            <div className="admin-operation-split">
              <section className="admin-operation-input">
                <div className="admin-operation-pane-head">
                  <div>
                    <span>{focus === "CANDIDATE" ? "EDIT" : "CONTENT"}</span>
                    <strong>{focus === "CANDIDATE" ? "内容编辑" : "当前内容"}</strong>
                  </div>
                  <small>{focus === "CANDIDATE" ? "只在这里修改当前版本" : "审核与发布阶段保持只读"}</small>
                </div>
                {focus === "CANDIDATE" ? (
                  <>
                    <div className="admin-form-grid">
                      <label className="admin-field admin-field-wide">
                        <span>标题</span>
                        <input value={draft.title} maxLength={180} onChange={(event) => updateDraft({ title: event.target.value })} placeholder="这条 AI 信息发生了什么？" />
                      </label>
                      <label className="admin-field admin-field-wide">
                        <span>摘要</span>
                        <textarea rows={7} maxLength={1200} value={draft.summary} onChange={(event) => updateDraft({ summary: event.target.value })} placeholder="用 OPC 的语言说明为什么值得关注。" />
                      </label>
                      <label className="admin-field">
                        <span>分类</span>
                        <input value={draft.category} maxLength={120} onChange={(event) => updateDraft({ category: event.target.value })} placeholder="模型与能力 / 工具 / 行业" />
                      </label>
                      <label className="admin-field">
                        <span>去向</span>
                        <select value={draft.destination} onChange={(event) => updateDraft({ destination: event.target.value as Destination })}>
                          {destinations.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
                        </select>
                      </label>
                      <label className="admin-field">
                        <span>阅读时间（分钟）</span>
                        <input type="number" min={1} max={120} value={draft.readingMinutes ?? ""} onChange={(event) => updateDraft({ readingMinutes: event.target.value ? Number(event.target.value) : null })} />
                      </label>
                    </div>
                    <div className="admin-editor-footer admin-operation-footer">
                      <div>
                        {message && <p className="admin-message">{message}</p>}
                        <small>保存后会形成新版本；已有审核结论自动失效。</small>
                      </div>
                      <button className="btn btn-primary" type="button" onClick={save} disabled={saving || (!creating && (draft.status === "PUBLISHED" || draft.status === "ARCHIVED"))}>
                        {saving ? "保存中…" : creating ? "创建候选内容" : "保存新版本"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="admin-content-readonly">
                    <div><span>标题</span><strong>{draft.title}</strong></div>
                    <div><span>摘要</span><p>{draft.summary}</p></div>
                    <dl>
                      <div><dt>分类</dt><dd>{draft.category}</dd></div>
                      <div><dt>去向</dt><dd>{destinations.find((item) => item.value === draft.destination)?.label ?? draft.destination}</dd></div>
                      <div><dt>版本</dt><dd>v{draft.version}</dd></div>
                      <div><dt>最近更新</dt><dd>{formatDate(draft.updatedAt)}</dd></div>
                    </dl>
                  </div>
                )}
              </section>

              <section className="admin-operation-output">
                <div className="admin-operation-pane-head">
                  <div>
                    <span>{focus}</span>
                    <strong>{focus === "CANDIDATE" ? "证据关联" : focus === "REVIEW" ? "审核判断" : "发布与路由"}</strong>
                  </div>
                  <small>{focus === "CANDIDATE" ? "关联可信证据后再进入审核" : focus === "REVIEW" ? "基于当前版本与证据作出决定" : "只在条件满足后执行正式发布"}</small>
                </div>
                <div className="admin-content-lifecycle">
                  <span className={draft.status === "DRAFT" ? "is-current" : ""}>DRAFT</span><i>→</i>
                  <span className={draft.status === "REVIEW" ? "is-current" : ""}>REVIEW</span><i>→</i>
                  <span className={draft.status === "PUBLISHED" ? "is-current" : ""}>PUBLISHED</span><i>→</i>
                  <span className={draft.status === "ARCHIVED" ? "is-current" : ""}>ARCHIVED</span>
                </div>
                {!creating ? (
                  <ContentWorkbenchLifecyclePanel mode="ITEM" focus={focus} item={{ id: draft.id, status: draft.status, version: draft.version }} onChanged={() => loadItems(draft.id)} />
                ) : (
                  <div className="admin-operation-placeholder">
                    <strong>创建后在这里展开</strong>
                    <p>保存候选内容后，右侧会显示证据关联、审核、发布和审计记录。</p>
                  </div>
                )}
                {!creating && focus === "PUBLISH" && draft.destination === "KNOWLEDGE_CAPSULE" && draft.status === "PUBLISHED" ? <KnowledgeRoutingPanel content={draft} /> : null}
              </section>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
