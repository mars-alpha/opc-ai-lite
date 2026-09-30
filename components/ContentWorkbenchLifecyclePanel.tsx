"use client";

import { useEffect, useMemo, useState } from "react";

type ContentStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

type ContentRef = {
  id: string;
  status: ContentStatus;
  version: number;
};

type Source = {
  id: string;
  name: string;
  sourceType: string;
  canonicalUrl: string | null;
  status: string;
};

type Evidence = {
  id: string;
  sourceId: string;
  title: string | null;
  excerpt: string | null;
  originalUrl: string | null;
  verificationStatus: string;
  collectedAt: string;
};

type LinkedEvidence = {
  linkId: string;
  role: string;
  evidence: Evidence;
  source: Source;
};

type AuditRecord = {
  id: string;
  action: string;
  actorEmail: string;
  entityVersion: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function messageForError(code: string) {
  const labels: Record<string, string> = {
    CONTENT_EVIDENCE_REQUIRED: "审核通过前至少需要关联一条证据。",
    CONTENT_VERIFIED_EVIDENCE_REQUIRED: "至少需要一条已验证证据。",
    CONTENT_APPROVAL_REQUIRED: "发布前必须先人工审核通过。",
    CONTENT_REVIEW_STALE: "内容在审核后发生了修改，需要重新审核。",
    CONTENT_NOT_REVIEW_READY: "当前内容还没有进入已审核待发布状态。",
    CONTENT_PUBLISHED_IMMUTABLE: "已发布内容不能直接覆盖修改。",
    CONTENT_ARCHIVED_IMMUTABLE: "已归档内容不能直接覆盖修改。"
  };
  return labels[code] ?? code;
}

type LifecycleProps = {
  mode: "ITEM";
  focus: "CANDIDATE" | "REVIEW" | "PUBLISH";
  item: ContentRef;
  onChanged: () => Promise<void> | void;
};

export function ContentWorkbenchLifecyclePanel(props: LifecycleProps) {
  const item = props.mode === "ITEM" ? props.item : null;
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [linked, setLinked] = useState<LinkedEvidence[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const linkedIds = useMemo(() => new Set(linked.map((entry) => entry.evidence.id)), [linked]);
  const verifiedLinkedCount = useMemo(
    () => linked.filter((entry) => entry.evidence.verificationStatus === "VERIFIED").length,
    [linked]
  );
  const latestReview = useMemo(
    () =>
      audit.find(
        (entry) =>
          entry.action === "CONTENT_REVIEWED" &&
          entry.entityVersion === item?.version
      ) ?? null,
    [audit, item?.version]
  );
  const latestReviewDecision =
    typeof latestReview?.metadata?.decision === "string"
      ? latestReview.metadata.decision
      : null;

  async function readJson(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(messageForError(data.error ?? "REQUEST_FAILED"));
    return data;
  }

  async function loadSources(preferred?: string) {
    const data = await readJson(await fetch("/api/admin/content/sources", { cache: "no-store" }));
    const next = (data.items ?? []) as Source[];
    setSources(next);
    const target = preferred || sourceId || next[0]?.id || "";
    setSourceId(target);
    return target;
  }

  async function loadEvidence(targetSourceId: string) {
    if (!targetSourceId) {
      setEvidence([]);
      return;
    }
    const data = await readJson(
      await fetch("/api/admin/content/sources/" + encodeURIComponent(targetSourceId) + "/evidence", {
        cache: "no-store"
      })
    );
    setEvidence((data.items ?? []) as Evidence[]);
  }

  async function loadLinked() {
    if (!item) {
      setLinked([]);
      return;
    }
    const data = await readJson(
      await fetch("/api/admin/content/items/" + encodeURIComponent(item.id) + "/evidence", {
        cache: "no-store"
      })
    );
    setLinked((data.items ?? []) as LinkedEvidence[]);
  }

  async function loadAudit() {
    if (!item) {
      setAudit([]);
      return;
    }
    const data = await readJson(
      await fetch("/api/admin/content/items/" + encodeURIComponent(item.id) + "/audit", {
        cache: "no-store"
      })
    );
    setAudit((data.items ?? []) as AuditRecord[]);
  }

  async function refresh(preferredSource?: string) {
    const target = await loadSources(preferredSource);
    await Promise.all([loadEvidence(target), loadLinked(), loadAudit()]);
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(error instanceof Error ? error.message : "工作流读取失败"));
  }, [item?.id, props.mode]);

  useEffect(() => {
    if (!sourceId) return;
    loadEvidence(sourceId).catch((error) =>
      setMessage(error instanceof Error ? error.message : "证据读取失败")
    );
  }, [sourceId]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  async function verifyEvidence(evidenceId: string) {
    await run(async () => {
      await readJson(
        await fetch("/api/admin/content/evidence/" + encodeURIComponent(evidenceId) + "/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ verificationStatus: "VERIFIED" })
        })
      );
      await loadEvidence(sourceId);
      await loadLinked();
      setMessage("证据已验证。");
    });
  }

  async function linkEvidence(evidenceId: string) {
    if (!item) return;
    await run(async () => {
      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(item.id) + "/evidence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ evidenceId, role: linked.length ? "SUPPORTING" : "PRIMARY" })
        })
      );
      await Promise.all([loadLinked(), loadAudit()]);
      setMessage("证据已关联到当前内容。");
    });
  }

  async function review(decision: "APPROVED" | "NEEDS_CHANGES" | "REJECTED") {
    if (!item || props.mode !== "ITEM") return;
    await run(async () => {
      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(item.id) + "/review", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ decision, note: reviewNote || null })
        })
      );
      setReviewNote("");
      await props.onChanged();
      await loadAudit();
      setMessage(
        decision === "APPROVED"
          ? "审核已通过，可以发布。"
          : decision === "NEEDS_CHANGES"
            ? "已退回修改。"
            : "已拒绝并归档。"
      );
    });
  }

  async function publish() {
    if (!item || props.mode !== "ITEM") return;
    await run(async () => {
      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(item.id) + "/publish", {
          method: "POST"
        })
      );
      await props.onChanged();
      await loadAudit();
      setMessage("已通过 Core Gate 正式发布。");
    });
  }

  async function confirmAndPublish() {
    if (!item || props.mode !== "ITEM") return;
    await run(async () => {
      for (const entry of linked) {
        if (entry.evidence.verificationStatus === "VERIFIED") continue;
        await readJson(
          await fetch("/api/admin/content/evidence/" + encodeURIComponent(entry.evidence.id) + "/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ verificationStatus: "VERIFIED" })
          })
        );
      }

      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(item.id) + "/review", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ decision: "APPROVED", note: reviewNote || null })
        })
      );

      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(item.id) + "/publish", {
          method: "POST"
        })
      );

      setReviewNote("");
      await props.onChanged();
      await Promise.all([loadLinked(), loadAudit()]);
      setMessage("已完成一次人工确认，并通过 Core Gate 进入平台正式状态。");
    });
  }

  return (
    <div className="admin-content-lifecycle-panel admin-content-lifecycle-item">
      <>
          <div className="admin-item-evidence-head">
            <label className="admin-field">
              <span>证据来源</span>
              <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
                <option value="">选择来源</option>
                {sources.map((source) => (
                  <option value={source.id} key={source.id}>{source.name} · {source.sourceType}</option>
                ))}
              </select>
            </label>
            <div className="admin-evidence-summary">
              <div><span>已关联</span><strong>{linked.length}</strong></div>
              <div><span>已验证</span><strong>{verifiedLinkedCount}</strong></div>
              <div><span>当前版本</span><strong>v{item?.version}</strong></div>
            </div>
          </div>

          <div className="admin-evidence-list admin-evidence-list-item">
            {evidence.length === 0 ? (
              <div className="admin-empty">当前来源还没有证据。</div>
            ) : (
              evidence.map((entry) => (
                <div className="admin-evidence-row" key={entry.id}>
                  <div className="admin-content-row-top">
                    <em className={entry.verificationStatus === "VERIFIED" ? "is-verified" : ""}>
                      {entry.verificationStatus === "VERIFIED" ? "已验证" : "待验证"}
                    </em>
                    <small>{formatDate(entry.collectedAt)}</small>
                  </div>
                  <strong>{entry.title || entry.originalUrl || entry.id}</strong>
                  <p>{entry.excerpt || "未填写原文关键内容"}</p>
                  <div className="admin-page-actions">
                    {entry.verificationStatus !== "VERIFIED" ? (
                      <button className="btn btn-secondary" type="button" onClick={() => verifyEvidence(entry.id)} disabled={busy}>标记已验证</button>
                    ) : null}
                    <button className="btn btn-secondary" type="button" onClick={() => linkEvidence(entry.id)} disabled={busy || linkedIds.has(entry.id)}>
                      {linkedIds.has(entry.id) ? "已关联" : "关联当前内容"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {props.focus === "REVIEW" ? (
            <section className="admin-review-decision">
              <div className="admin-subsection-head">
                <strong>最终人工确认</strong>
                <span>当前版本 v{item?.version}</span>
              </div>
              <label className="admin-field">
                <span>确认说明</span>
                <textarea rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="记录为什么采用、退回或拒绝。" />
              </label>
              <div className="admin-review-gates">
                <div className={linked.length > 0 ? "is-pass" : ""}><span>证据已关联</span><strong>{linked.length > 0 ? "通过" : "未满足"}</strong></div>
                <div className={linked.length > 0 ? "is-pass" : ""}><span>证据待确认</span><strong>{linked.length > 0 ? "可确认" : "未满足"}</strong></div>
              </div>
              <div className="admin-editor-footer">
                <small>这是平台内部内容唯一默认 Human Gate：确认时同时核对证据、候选内容和去向；通过后直接进入平台正式状态。</small>
                <div className="admin-page-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => review("NEEDS_CHANGES")} disabled={busy}>退回修改</button>
                  <button className="btn btn-secondary" type="button" onClick={() => review("REJECTED")} disabled={busy}>拒绝</button>
                  <button className="btn btn-primary" type="button" onClick={confirmAndPublish} disabled={busy || linked.length === 0}>确认并发布到平台</button>
                </div>
              </div>
            </section>
          ) : null}

          {props.focus === "PUBLISH" ? (
            <section className="admin-publish-decision">
              <div className="admin-subsection-head">
                <strong>发布条件</strong>
                <span>由 Core Gate 最终判定</span>
              </div>
              <div className="admin-review-gates">
                <div className={verifiedLinkedCount > 0 ? "is-pass" : ""}><span>已验证证据</span><strong>{verifiedLinkedCount > 0 ? "通过" : "未满足"}</strong></div>
                <div className={latestReviewDecision === "APPROVED" ? "is-pass" : ""}><span>当前版本审核</span><strong>{latestReviewDecision === "APPROVED" ? "已通过" : "未通过"}</strong></div>
                <div className={item?.status === "PUBLISHED" ? "is-pass" : ""}><span>发布状态</span><strong>{item?.status === "PUBLISHED" ? "已发布" : "待发布"}</strong></div>
              </div>
              <div className="admin-editor-footer">
                <small>页面不会直接改状态；点击发布后仍由服务端校验证据、审核版本与状态。</small>
                {item?.status === "REVIEW" ? (
                  <button className="btn btn-primary" type="button" onClick={publish} disabled={busy || verifiedLinkedCount === 0 || latestReviewDecision !== "APPROVED"}>
                    正式发布
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {message ? <p className="admin-message">{message}</p> : null}

          {props.focus !== "CANDIDATE" ? (
            <section className="admin-content-audit">
              <div className="admin-subsection-head">
                <strong>操作记录</strong>
                <span>最近 12 条</span>
              </div>
              <div className="admin-audit-list">
                {audit.length === 0 ? (
                  <div className="admin-empty">暂无审计记录。</div>
                ) : (
                  audit.slice(0, 12).map((entry) => (
                    <div key={entry.id}>
                      <div><strong>{entry.action}</strong><small>{formatDate(entry.createdAt)}</small></div>
                      <span>{entry.actorEmail}{entry.entityVersion ? " · v" + entry.entityVersion : ""}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : null}
      </>
    </div>
  );
}
