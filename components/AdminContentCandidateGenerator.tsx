"use client";

import { useEffect, useMemo, useState } from "react";

type Source = { id: string; name: string; sourceType: string };
type Evidence = {
  id: string;
  title: string | null;
  excerpt: string | null;
  originalUrl: string | null;
  verificationStatus: string;
};
type Candidate = {
  title: string;
  summary: string;
  category: string;
  destination: "DAILY_ITEM" | "KNOWLEDGE_CAPSULE" | "PRACTICE_CANDIDATE" | "COURSE_UPDATE_CANDIDATE" | "IGNORE";
  angle: string;
};

const destinations = [
  ["DAILY_ITEM", "AI Daily"],
  ["KNOWLEDGE_CAPSULE", "知识内容"],
  ["PRACTICE_CANDIDATE", "练习候选"],
  ["COURSE_UPDATE_CANDIDATE", "课程更新候选"],
  ["IGNORE", "暂不采用"]
] as const;

function makeContentId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return "content_" + stamp + "_" + Math.random().toString(36).slice(2, 7);
}

export function AdminContentCandidateGenerator({ onCreated }: { onCreated: () => void }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draft, setDraft] = useState<Candidate | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function readJson(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "REQUEST_FAILED");
    return data;
  }

  useEffect(() => {
    fetch("/api/admin/content/sources", { cache: "no-store" })
      .then(readJson)
      .then((data) => {
        const next = (data.items ?? []) as Source[];
        setSources(next);
        setSourceId(next[0]?.id ?? "");
      })
      .catch(() => setMessage("来源读取失败。"));
  }, []);

  useEffect(() => {
    if (!sourceId) {
      setEvidence([]);
      setSelectedIds([]);
      return;
    }
    fetch("/api/admin/content/sources/" + encodeURIComponent(sourceId) + "/evidence", { cache: "no-store" })
      .then(readJson)
      .then((data) => {
        const next = (data.items ?? []) as Evidence[];
        setEvidence(next);
        setSelectedIds(next.map((item) => item.id));
      })
      .catch(() => setMessage("已验证证据读取失败。"));
  }, [sourceId]);

  const selectedEvidence = useMemo(() => evidence.filter((item) => selectedIds.includes(item.id)), [evidence, selectedIds]);

  function toggleEvidence(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function generate() {
    if (selectedIds.length === 0) {
      setMessage("至少选择一条已验证证据。");
      return;
    }
    setBusy(true);
    setMessage(null);
    setCandidates([]);
    setDraft(null);
    setProviderUnavailable(false);
    try {
      const data = await readJson(
        await fetch("/api/admin/content/ai/candidates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ evidenceIds: selectedIds })
        })
      );
      if (data.mode === "UNAVAILABLE") {
        setProviderUnavailable(true);
        setMessage("平台 AI Provider 尚未配置。配置后会在这里生成多个候选角度。");
        return;
      }
      const next = (data.candidates ?? []) as Candidate[];
      setCandidates(next);
      setSelectedIndex(0);
      setDraft(next[0] ? { ...next[0] } : null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 候选生成失败。");
    } finally {
      setBusy(false);
    }
  }

  function selectCandidate(index: number) {
    setSelectedIndex(index);
    setDraft({ ...candidates[index] });
  }

  async function createCandidate() {
    if (!draft) return;
    setBusy(true);
    setMessage(null);
    try {
      const contentId = makeContentId();
      await readJson(
        await fetch("/api/admin/content/items", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: contentId,
            title: draft.title,
            summary: draft.summary,
            category: draft.category,
            destination: draft.destination,
            sourceType: "AI_GENERATED",
            sourceRef: selectedIds.join(","),
            sourceUrl: selectedEvidence[0]?.originalUrl ?? null,
            sourcePublishedAt: null,
            readingMinutes: Math.max(1, Math.ceil((draft.title.length + draft.summary.length) / 300))
          })
        })
      );
      for (const evidenceId of selectedIds) {
        await readJson(
          await fetch("/api/admin/content/items/" + encodeURIComponent(contentId) + "/evidence", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ evidenceId, role: evidenceId === selectedIds[0] ? "PRIMARY" : "SUPPORTING" })
          })
        );
      }
      setMessage("候选内容已创建并关联已验证证据，进入人工审核。");
      onCreated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建候选内容失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-ai-candidate-workspace">
      <section className="admin-ai-candidate-input">
        <div className="admin-operation-pane-head">
          <div><span>AI / SKILL</span><strong>选择分析素材</strong></div>
          <small>候选只基于已经进入素材池的原始资料生成</small>
        </div>

        <label className="admin-field admin-field-wide admin-candidate-source">
          <span>来源</span>
          <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
            <option value="">选择来源</option>
            {sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
          </select>
        </label>

        <div className="admin-candidate-evidence-list">
          {evidence.length === 0 ? (
            <div className="admin-ai-empty">
              <strong>没有可用的分析素材</strong>
              <p>先回到第 01 步保存采集资料和 AI 分析结果。</p>
            </div>
          ) : evidence.map((item) => (
            <label className="admin-candidate-evidence-row" key={item.id}>
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleEvidence(item.id)} />
              <div>
                <strong>{item.title || "未命名证据"}</strong>
                <p>{item.excerpt || "无关键原文"}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="admin-editor-footer">
          <small>已选择 {selectedIds.length} 条。AI 不允许补充这些素材之外的事实；最终由人工一次性确认。</small>
          <button className="btn btn-primary" type="button" onClick={generate} disabled={busy || selectedIds.length === 0}>{busy ? "生成中…" : "AI 生成候选"}</button>
        </div>
        {message ? <p className="admin-message">{message}</p> : null}
      </section>

      <section className="admin-ai-candidate-output">
        <div className="admin-operation-pane-head">
          <div><span>AI CANDIDATES</span><strong>候选角度</strong></div>
          <small>Skill 生成多个角度，人工不需要从空白开始写</small>
        </div>

        {candidates.length === 0 ? (
          <div className="admin-ai-empty">
            <strong>{providerUnavailable ? "AI Provider 尚未配置" : "等待生成候选"}</strong>
            <p>{providerUnavailable ? "当前环境没有 OPC_AI_ANALYSIS_* 配置；配置后会直接生成 3 个候选角度。" : "AI 会根据已验证证据生成事实更新、影响判断、可行动价值等不同角度。"}</p>
          </div>
        ) : (
          <>
            <div className="admin-candidate-options">
              {candidates.map((item, index) => (
                <button className={selectedIndex === index ? "is-active" : ""} type="button" key={index} onClick={() => selectCandidate(index)}>
                  <span>候选 {index + 1} · {item.angle}</span>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </button>
              ))}
            </div>

            {draft ? (
              <div className="admin-candidate-edit">
                <div className="admin-subsection-head">
                  <strong>采用前确认</strong>
                  <span>AI 已生成，人工只做必要修正</span>
                </div>
                <div className="admin-form-grid">
                  <label className="admin-field admin-field-wide">
                    <span>标题</span>
                    <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                  </label>
                  <label className="admin-field admin-field-wide">
                    <span>为什么值得关注</span>
                    <textarea rows={5} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>分类</span>
                    <input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>建议去向</span>
                    <select value={draft.destination} onChange={(event) => setDraft({ ...draft, destination: event.target.value as Candidate["destination"] })}>
                      {destinations.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                    </select>
                  </label>
                </div>
                <div className="admin-editor-footer">
                  <small>采用后写入待确认队列并自动关联本次素材；此时仍不是正式发布。</small>
                  <button className="btn btn-primary" type="button" onClick={createCandidate} disabled={busy}>采用并进入人工确认</button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
