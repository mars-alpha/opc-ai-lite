"use client";

import { useEffect, useMemo, useState } from "react";

type IntelligenceView = "OFFICIAL" | "HOTSPOT" | "UNVERIFIED";
type EventItem = {
  eventId: string;
  title: string;
  excerpt: string | null;
  originalUrl: string | null;
  publishedAt: string | null;
  collectedAt: string;
  sourceName: string;
  eventType: string | null;
  verificationStatus: string;
  factSourceCount: number;
  signalSourceCount: number;
};

type Evidence = {
  rawItemId: string;
  sourceId: string;
  sourceName: string | null;
  title: string;
  excerpt: string | null;
  originalUrl: string | null;
  publishedAt: string | null;
  expansionType: string | null;
  mediaType: string | null;
  language: string | null;
  rankScore: number | null;
  authority: "FACT" | "REFERENCE_ONLY";
};

type OutputSection = {
  key: string;
  label: string;
  authorityPolicy: string;
  status: "SUPPORTED" | "EMPTY";
  items: Evidence[];
};

type OutputPayload = {
  eventId: string;
  eventTitle: string;
  eventSummary: string | null;
  sections: OutputSection[];
  missingSectionKeys: string[];
  unmappedExpansionEvidenceCount: number;
  warnings: string[];
};

type Synthesis = {
  sections: Array<{
    key: string;
    items: Array<{ text: string; evidenceRawItemIds: string[] }>;
  }>;
  warnings: string[];
};

const views: Array<{ key: IntelligenceView; label: string }> = [
  { key: "OFFICIAL", label: "官方动态" },
  { key: "HOTSPOT", label: "AI 热点" },
  { key: "UNVERIFIED", label: "待验证" }
];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(date);
}

async function readJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error ?? "请求失败");
  return data;
}

export function AdminEventExpansionOutputReview() {
  const [view, setView] = useState<IntelligenceView>("OFFICIAL");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [output, setOutput] = useState<OutputPayload | null>(null);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [busy, setBusy] = useState<"events" | "output" | "expand" | "synthesis" | null>("events");
  const [message, setMessage] = useState<string>("");

  const selected = useMemo(
    () => events.find((item) => item.eventId === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  async function loadEvents(nextView: IntelligenceView) {
    setBusy("events");
    setMessage("");
    setSynthesis(null);
    try {
      const endpoint = nextView === "OFFICIAL" ? "official" : nextView === "HOTSPOT" ? "hotspot" : "unverified";
      const data = await readJson("/api/admin/content/intelligence?view=" + endpoint + "&limit=80");
      const next = (data.items ?? []) as EventItem[];
      setEvents(next);
      const eventId = next[0]?.eventId ?? "";
      setSelectedEventId(eventId);
      if (eventId) await loadOutput(eventId);
      else setOutput(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "真实 Event 读取失败");
    } finally {
      setBusy(null);
    }
  }

  async function loadOutput(eventId: string) {
    if (!eventId) return;
    setBusy("output");
    setMessage("");
    try {
      const data = await readJson("/api/admin/content/discovery/events/" + eventId + "/expansion-output");
      setOutput(data.output as OutputPayload);
      setSynthesis(null);
    } catch (error) {
      setOutput(null);
      setMessage(error instanceof Error ? error.message : "六栏目读取失败");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void loadEvents("OFFICIAL");
  }, []);

  async function switchView(nextView: IntelligenceView) {
    setView(nextView);
    await loadEvents(nextView);
  }

  async function selectEvent(eventId: string) {
    setSelectedEventId(eventId);
    await loadOutput(eventId);
  }

  async function runExpansion() {
    if (!selectedEventId) return;
    setBusy("expand");
    setMessage("");
    setSynthesis(null);
    try {
      const result = await readJson(
        "/api/admin/content/discovery/events/" + selectedEventId + "/expansion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ windowHours: 72, resultLimit: 12, maxQueries: 3 })
        }
      );
      const evidenceCount = Array.isArray(result.evidencePack) ? result.evidencePack.length : 0;
      const totalRuns = Number(result?.summary?.total ?? 0);
      const failedRuns = Number(result?.summary?.failed ?? 0);
      await loadOutput(selectedEventId);
      setMessage(
        evidenceCount > 0
          ? "真实 Expansion 完成：得到 " + evidenceCount + " 条高置信参考资料；运行 " + totalRuns + " 次，失败 " + failedRuns + " 次。"
          : "真实 Expansion 完成：当前没有达到高置信门槛的参考资料。保持 0 条，不凑数。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "真实 Expansion 运行失败");
    } finally {
      setBusy(null);
    }
  }

  async function runSynthesis() {
    if (!selectedEventId || !output) return;
    setBusy("synthesis");
    setMessage("");
    try {
      const data = await readJson(
        "/api/admin/content/discovery/events/" + selectedEventId + "/expansion-output",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "SYNTHESIZE" })
        }
      );
      setSynthesis(data.synthesis as Synthesis);
      setMessage("AI 表达已生成并通过 014 Validator。模型：" + String(data.model ?? "—"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 表达生成失败");
    } finally {
      setBusy(null);
    }
  }

  const synthesisByKey = useMemo(
    () => new Map((synthesis?.sections ?? []).map((section) => [section.key, section.items])),
    [synthesis]
  );

  return (
    <section className="output-review-shell">
      <aside className="output-review-events">
        <div className="output-review-view-tabs">
          {views.map((item) => (
            <button
              key={item.key}
              type="button"
              className={view === item.key ? "is-active" : ""}
              onClick={() => void switchView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="output-review-event-list">
          {busy === "events" ? <div className="output-review-muted">正在读取真实 Event…</div> : null}
          {!events.length && busy !== "events" ? <div className="output-review-muted">当前视图没有 Event。</div> : null}
          {events.map((item) => (
            <button
              key={item.eventId}
              type="button"
              className={item.eventId === selectedEventId ? "is-selected" : ""}
              onClick={() => void selectEvent(item.eventId)}
            >
              <strong>{item.title}</strong>
              <span>{item.verificationStatus} · 事实源 {item.factSourceCount} · 信号源 {item.signalSourceCount}</span>
              <small>{formatDate(item.publishedAt || item.collectedAt)}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="output-review-main">
        {!selected ? <div className="output-review-empty">请选择一个真实 Event。</div> : (
          <>
            <header className="output-review-event-head">
              <div>
                <span>REAL EVENT / {selected.verificationStatus}</span>
                <h2>{selected.title}</h2>
                <p>{selected.excerpt || "暂无摘要"}</p>
                <small>{selected.sourceName} · {selected.eventType || "OTHER"} · {formatDate(selected.publishedAt || selected.collectedAt)}</small>
              </div>
              <div className="output-review-actions">
                {selected.originalUrl ? <a href={selected.originalUrl} target="_blank" rel="noreferrer">事实原文 ↗</a> : null}
                <button type="button" disabled={Boolean(busy)} onClick={() => void runExpansion()}>
                  {busy === "expand" ? "真实扩展中…" : "运行真实 Expansion"}
                </button>
                <button
                  type="button"
                  disabled={Boolean(busy) || !output}
                  onClick={() => void runSynthesis()}
                >
                  {busy === "synthesis" ? "AI 表达中…" : "生成 AI 表达"}
                </button>
              </div>
            </header>

            {message ? <div className="output-review-message">{message}</div> : null}
            {busy === "output" ? <div className="output-review-muted">正在生成六栏目派生视图…</div> : null}

            {output ? (
              <>
                <div className="output-review-audit">
                  <span>缺失栏目 {output.missingSectionKeys.length}</span>
                  <span>未映射 Expansion {output.unmappedExpansionEvidenceCount}</span>
                  <span>规则：发生了什么=FACT，其余=REFERENCE_ONLY</span>
                </div>
                <div className="output-review-sections">
                  {output.sections.map((section) => {
                    const synthesisItems = synthesisByKey.get(section.key) ?? [];
                    return (
                      <article key={section.key} className={"output-review-section " + (section.status === "EMPTY" ? "is-empty" : "")}>
                        <div className="output-review-section-head">
                          <div>
                            <span>{section.key}</span>
                            <h3>{section.label}</h3>
                          </div>
                          <small>{section.status} · {section.authorityPolicy}</small>
                        </div>

                        {synthesisItems.length ? (
                          <div className="output-review-synthesis">
                            <strong>AI 表达</strong>
                            {synthesisItems.map((item, index) => (
                              <p key={index}>{item.text}</p>
                            ))}
                          </div>
                        ) : null}

                        {section.items.length ? (
                          <div className="output-review-evidence-list">
                            {section.items.map((item) => (
                              <div className="output-review-evidence" key={item.rawItemId}>
                                <div>
                                  <b>{item.sourceName || item.sourceId}</b>
                                  <span>{item.authority}{item.expansionType ? " · " + item.expansionType : ""}{item.mediaType ? " · " + item.mediaType : ""}</span>
                                </div>
                                <strong>{item.title}</strong>
                                {item.excerpt ? <p>{item.excerpt}</p> : null}
                                <footer>
                                  <small>{formatDate(item.publishedAt)}{item.rankScore !== null ? " · Rank " + item.rankScore : ""}</small>
                                  {item.originalUrl ? <a href={item.originalUrl} target="_blank" rel="noreferrer">查看原文 ↗</a> : null}
                                </footer>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="output-review-empty-section">当前没有足够高置信证据。保持为空，不由 AI 补齐。</div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            ) : null}
          </>
        )}
      </section>
    </section>
  );
}
