"use client";

import { useEffect, useMemo, useState } from "react";

type Decision = "select" | "reject" | "either";
type ContentType =
  | "MODEL_RELEASE"
  | "PRODUCT_LAUNCH"
  | "TOOL_OR_PROMPT"
  | "RESEARCH_PAPER"
  | "INDUSTRY_EVENT"
  | "OPINION_ANALYSIS"
  | "TUTORIAL_EXPLAINER";

type ReviewItem = {
  caseId: string;
  eventId: string;
  titleSnapshot: string;
  sourceType: string;
  material: {
    title: string;
    summary: string | null;
    eventType: string;
    eventAt: string | null;
    evidence: Array<{ title: string; excerpt: string | null; publishedAt: string | null }>;
  };
  gold: { decision: Decision; contentType?: ContentType | null };
  reviewStatus: "PROVISIONAL" | "HUMAN_APPROVED";
  reviewerId: string | null;
  reviewedAt: string | null;
  reason: string;
};

type Payload = {
  counts: { total: number; reviewed: number; pending: number; select: number; reject: number; either: number };
  items: ReviewItem[];
};

const contentTypes: Array<{ value: ContentType; label: string }> = [
  { value: "MODEL_RELEASE", label: "模型发布" },
  { value: "PRODUCT_LAUNCH", label: "产品发布" },
  { value: "TOOL_OR_PROMPT", label: "工具 / Prompt" },
  { value: "RESEARCH_PAPER", label: "研究论文" },
  { value: "INDUSTRY_EVENT", label: "行业事件" },
  { value: "OPINION_ANALYSIS", label: "观点 / 分析" },
  { value: "TUTORIAL_EXPLAINER", label: "教程 / 讲解" }
];

async function readJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error ?? "请求失败");
  return data;
}

function dateText(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(date);
}

export function AdminSelectionShadowReview({
  apiPath = "/api/admin/content/selection-shadow-review",
  emptyMessage = "没有可审核样本。"
}: {
  apiPath?: string;
  emptyMessage?: string;
} = {}) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<"PENDING" | "REVIEWED" | "ALL">("PENDING");
  const [decision, setDecision] = useState<Decision>("either");
  const [contentType, setContentType] = useState<ContentType | "">("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(true);

  async function load(preferredId?: string) {
    setBusy(true);
    try {
      const data = await readJson(apiPath) as Payload;
      setPayload(data);
      const candidate = preferredId && data.items.some((item) => item.caseId === preferredId)
        ? preferredId
        : data.items.find((item) => item.reviewStatus !== "HUMAN_APPROVED")?.caseId ?? data.items[0]?.caseId ?? "";
      setSelectedId(candidate);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "审核数据读取失败");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const items = useMemo(() => {
    const all = payload?.items ?? [];
    if (filter === "PENDING") return all.filter((item) => item.reviewStatus !== "HUMAN_APPROVED");
    if (filter === "REVIEWED") return all.filter((item) => item.reviewStatus === "HUMAN_APPROVED");
    return all;
  }, [payload, filter]);

  const selected = useMemo(
    () => payload?.items.find((item) => item.caseId === selectedId) ?? null,
    [payload, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setDecision(selected.gold.decision ?? "either");
    setContentType(selected.gold.contentType ?? "");
    setReason(selected.reason ?? "");
    setMessage("");
  }, [selectedId, selected?.reviewStatus]);

  function nextPendingId(currentId: string) {
    const all = payload?.items ?? [];
    const current = all.findIndex((item) => item.caseId === currentId);
    const after = all.slice(current + 1).find((item) => item.reviewStatus !== "HUMAN_APPROVED");
    const before = all.slice(0, current).find((item) => item.reviewStatus !== "HUMAN_APPROVED");
    return after?.caseId ?? before?.caseId ?? currentId;
  }

  async function save() {
    if (!selected) return;
    if (!reason.trim()) {
      setMessage("请填写一句判断理由，避免 Gold 标签不可审计。");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const nextId = nextPendingId(selected.caseId);
      await readJson(apiPath, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caseId: selected.caseId,
          decision,
          contentType: contentType || null,
          reason
        })
      });
      await load(nextId === selected.caseId ? undefined : nextId);
      setMessage("已保存人工 Gold 标签。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="selection-gold-summary">
        <span>总样本 {payload?.counts.total ?? 0}</span>
        <span>已审核 {payload?.counts.reviewed ?? 0}</span>
        <span>待审核 {payload?.counts.pending ?? 0}</span>
        <span>精选 {payload?.counts.select ?? 0}</span>
        <span>不精选 {payload?.counts.reject ?? 0}</span>
        <span>两可 {payload?.counts.either ?? 0}</span>
      </div>
      <section className="selection-gold-shell">
        <aside className="selection-gold-list">
          <div className="selection-gold-filters">
            {([
              ["PENDING", "待审核"],
              ["REVIEWED", "已审核"],
              ["ALL", "全部"]
            ] as const).map(([key, label]) => (
              <button key={key} type="button" className={filter === key ? "is-active" : ""} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
          <div className="selection-gold-items">
            {busy && !payload ? <div className="selection-gold-item">正在读取…</div> : null}
            {items.map((item) => (
              <button
                type="button"
                key={item.caseId}
                className={"selection-gold-item " + (item.caseId === selectedId ? "is-active" : "")}
                onClick={() => setSelectedId(item.caseId)}
              >
                <strong>{item.material.title || item.titleSnapshot}</strong>
                <span>{item.reviewStatus === "HUMAN_APPROVED" ? "已审核" : "待审核"} · {item.material.eventType}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="selection-gold-main">
          {!selected ? <div className="selection-gold-muted">{emptyMessage}</div> : (
            <>
              <div className="selection-gold-muted">
                {selected.material.eventType} · {dateText(selected.material.eventAt)}
              </div>
              <h2>{selected.material.title || selected.titleSnapshot}</h2>
              <p className="selection-gold-summary-text">{selected.material.summary || "暂无摘要。"}</p>

              <div className="selection-gold-evidence">
                {selected.material.evidence.map((item, index) => (
                  <article key={index}>
                    <strong>证据 {index + 1}：{item.title}</strong>
                    <p>{item.excerpt || "暂无摘录。"}</p>
                  </article>
                ))}
              </div>

              <div className="selection-gold-form">
                <strong>独立判断：这条信息是否应该进入“精选”？</strong>
                <div className="selection-gold-actions">
                  <button type="button" className={decision === "select" ? "is-active" : ""} onClick={() => setDecision("select")}>精选</button>
                  <button type="button" className={decision === "reject" ? "is-active" : ""} onClick={() => setDecision("reject")}>不精选</button>
                  <button type="button" className={decision === "either" ? "is-active" : ""} onClick={() => setDecision("either")}>两可</button>
                </div>
                <label>
                  <span className="selection-gold-muted">内容类型（可选，用于后续按类型校准）</span>
                  <select value={contentType} onChange={(event) => setContentType(event.target.value as ContentType | "")}>
                    <option value="">不判断类型</option>
                    {contentTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className="selection-gold-muted">判断理由（必填，一句话即可）</span>
                  <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：这是重要模型能力变化，对多数 AI 用户有直接决策价值。" />
                </label>
                <button className="selection-gold-save" type="button" disabled={busy} onClick={() => void save()}>
                  {busy ? "保存中…" : "保存并继续下一条"}
                </button>
                {message ? <div className="selection-gold-muted">{message}</div> : null}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
