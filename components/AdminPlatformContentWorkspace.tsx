"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminContentStudioWorkspace } from "./AdminContentStudioWorkspace";

type View = "INTELLIGENCE" | "WORKBENCH";
type PublicationStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

type DiscoveryEvent = {
  id: string;
  title: string;
  summary: string | null;
  keywords: string[];
  entities: string[];
  discoveryStatus: string;
  firstSeenAt: string;
  lastSeenAt: string;
  clusterId: string | null;
  clusterSourceCount: number;
  clusterPlatformCount: number;
  clusterRawItemCount: number;
  clusterHotnessScore: number | null;
  clusterVelocityScore: number | null;
  clusterAuthorityScore: number | null;
};

type RawItem = {
  id: string;
  title: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string | null;
  sourceTopics: string[];
  platform: string;
  originalUrl: string | null;
  author: string | null;
  excerpt: string | null;
  metadata: Record<string, unknown>;
  platformMetrics: Record<string, unknown>;
  collectedAt: string;
  publishedAt: string | null;
  eventId: string | null;
  clusterId: string | null;
  keywords: string[];
  entities: string[];
  observations: Array<{
    id: string;
    sourceId: string;
    sourceName: string;
    platform: string;
    observedUrl: string | null;
    observedAt: string;
    platformMetrics: Record<string, unknown>;
  }>;
};

function reviewLocalization(raw: RawItem) {
  const value = raw.metadata?.reviewLocalization;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  return {
    originalTitle: typeof item.originalTitle === "string" ? item.originalTitle : raw.title,
    originalExcerpt: typeof item.originalExcerpt === "string" ? item.originalExcerpt : raw.excerpt,
    displayTitleZh: typeof item.displayTitleZh === "string" ? item.displayTitleZh : null,
    displayExcerptZh: typeof item.displayExcerptZh === "string" ? item.displayExcerptZh : null,
    translationStatus: typeof item.translationStatus === "string" ? item.translationStatus : "UNAVAILABLE"
  };
}

function reviewTitle(raw: RawItem) {
  return reviewLocalization(raw)?.displayTitleZh || raw.title;
}

function reviewExcerpt(raw: RawItem) {
  return reviewLocalization(raw)?.displayExcerptZh || raw.excerpt;
}

type TopicDiagnosisPayload = {
  verdict: "ADOPT_RECOMMENDED" | "WATCH_RECOMMENDED" | "REJECT_RECOMMENDED";
  whyItMatters: string;
  readerValue: string;
  suggestedAngle: string;
  duplicationRisk: "LOW" | "MEDIUM" | "HIGH";
  timeliness: "LOW" | "MEDIUM" | "HIGH";
  evidenceReadiness: "INSUFFICIENT" | "PARTIAL" | "SUFFICIENT";
  differentiation: "LOW" | "MEDIUM" | "HIGH";
  evidenceGaps: string[];
  risks: string[];
};

type TopicDiagnosisArtifact = {
  id: string;
  version: number;
  generatedMode: "AI" | "HUMAN" | "CORE";
  payload: TopicDiagnosisPayload;
  createdAt: string;
};

type DemandSignal = {
  id: string;
  demandType: "QUESTION" | "PAIN_POINT" | "REQUEST" | "OPINION";
  titleZh: string;
  summaryZh: string;
  sampleCount: number;
  uniqueAuthorCount: number;
  representativeComments: Array<{ text: string; platform: string; author: string | null }>;
  sourcePlatforms: string[];
  confidence: number;
  generatedMode: string;
};

const views: Array<{ key: View; label: string; description: string }> = [
  { key: "WORKBENCH", label: "内容工作台", description: "把已采用选题推进到审核发布" }
];

function todayKey(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function eventStatusLabel(value: string) {
  if (value === "ADOPTED") return "已采用";
  if (value === "WATCHING") return "观察中";
  if (value === "IGNORED") return "已忽略";
  return "待判断";
}

function uniqueTags(...groups: Array<string[] | undefined>) {
  return [...new Set(groups.flatMap((group) => group ?? []).map((item) => item.trim()).filter(Boolean))]
    .filter((item) => item !== "event-discovery-e2e" && item !== "event-expansion")
    .slice(0, 8);
}

function siteLabel(raw: RawItem) {
  const value = raw.originalUrl || raw.sourceUrl;
  if (!value) return raw.sourceName || raw.platform;
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return raw.sourceName || raw.platform;
  }
}

function interactionText(raw: RawItem) {
  const metrics = raw.platformMetrics ?? {};
  const values: string[] = [];
  const add = (label: string, key: string) => {
    const value = metrics[key];
    if (typeof value === "number" && Number.isFinite(value)) values.push(label + " " + value);
  };
  add("播放", "views");
  add("点赞", "likes");
  add("评论", "comments");
  add("收藏", "favorites");
  add("星标", "stars");
  add("热度", "points");
  return values.slice(0, 3).join(" · ");
}

function discoverySourceNames(raw: RawItem) {
  return [...new Set([
    raw.sourceName,
    ...raw.observations.map((item) => item.sourceName)
  ].map((item) => item.trim()).filter(Boolean))];
}

function spreadLabel(score: number | null) {
  if (score === null) return "待积累";
  if (score >= 70) return "正在升温";
  if (score >= 40) return "持续传播";
  return "传播平稳";
}

function diagnosisVerdictLabel(value: TopicDiagnosisPayload["verdict"]) {
  if (value === "ADOPT_RECOMMENDED") return "建议采用";
  if (value === "REJECT_RECOMMENDED") return "建议忽略";
  return "建议观察";
}

function levelLabel(value: "LOW" | "MEDIUM" | "HIGH") {
  if (value === "HIGH") return "高";
  if (value === "MEDIUM") return "中";
  return "低";
}

function evidenceLabel(value: TopicDiagnosisPayload["evidenceReadiness"]) {
  if (value === "SUFFICIENT") return "较充分";
  if (value === "PARTIAL") return "部分充分";
  return "不足";
}

function demandTypeLabel(value: DemandSignal["demandType"]) {
  const labels: Record<DemandSignal["demandType"], string> = {
    QUESTION: "问题",
    PAIN_POINT: "痛点",
    REQUEST: "需求",
    OPINION: "观点"
  };
  return labels[value];
}

export function AdminPlatformContentWorkspace({ initialView = "WORKBENCH" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [events, setEvents] = useState<DiscoveryEvent[]>([]);
  const [rawItems, setRawItems] = useState<RawItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedContentId, setSelectedContentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyEventId, setBusyEventId] = useState("");
  const [topicDiagnosis, setTopicDiagnosis] = useState<TopicDiagnosisArtifact | null>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosingEventId, setDiagnosingEventId] = useState("");
  const [demandSignals, setDemandSignals] = useState<DemandSignal[]>([]);
  const [demandLoading, setDemandLoading] = useState(false);
  const [demandBusyEventId, setDemandBusyEventId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [hotspotGroup, setHotspotGroup] = useState<"RISING" | "ACTIVE" | "NEW" | "ALL">("RISING");

  async function readJson(url: string) {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "读取失败");
    return data;
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [eventData, rawData] = await Promise.all([
        readJson("/api/admin/content/discovery/events"),
        readJson("/api/admin/content/discovery/raw-items?limit=500")
      ]);
      const nextEvents = (eventData.items ?? []) as DiscoveryEvent[];
      setEvents(nextEvents);
      setRawItems((rawData.items ?? []) as RawItem[]);
      if (!selectedEventId && nextEvents.length) setSelectedEventId(nextEvents[0].id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "内容采集数据读取失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadDemandSignals(eventId: string) {
    if (!eventId) {
      setDemandSignals([]);
      return;
    }
    setDemandLoading(true);
    try {
      const data = await readJson(
        "/api/admin/content/discovery/events/" + encodeURIComponent(eventId) + "/demand-signals"
      );
      setDemandSignals((data.items ?? []) as DemandSignal[]);
    } catch (error) {
      setDemandSignals([]);
      setMessage(error instanceof Error ? error.message : "需求信号读取失败");
    } finally {
      setDemandLoading(false);
    }
  }

  async function loadTopicDiagnosis(eventId: string) {
    if (!eventId) {
      setTopicDiagnosis(null);
      return;
    }
    setDiagnosisLoading(true);
    try {
      const data = await readJson(
        "/api/admin/content/discovery/events/" + encodeURIComponent(eventId) + "/topic-diagnosis"
      );
      setTopicDiagnosis((data.item ?? null) as TopicDiagnosisArtifact | null);
    } catch (error) {
      setTopicDiagnosis(null);
      setMessage(error instanceof Error ? error.message : "选题诊断读取失败");
    } finally {
      setDiagnosisLoading(false);
    }
  }

  useEffect(() => { void loadAll(); }, []);

  useEffect(() => {
    if (view !== "INTELLIGENCE" || !selectedEventId) {
      setTopicDiagnosis(null);
      return;
    }
    void loadTopicDiagnosis(selectedEventId);
    void loadDemandSignals(selectedEventId);
  }, [view, selectedEventId]);

  const todayEvents = useMemo(() => events.filter((item) => todayKey(item.lastSeenAt)), [events]);
  const intelligenceEvents = useMemo(() => {
    const base = todayEvents.length ? todayEvents : events;
    return [...base].sort(
      (a, b) =>
        (b.clusterHotnessScore ?? -1) - (a.clusterHotnessScore ?? -1) ||
        new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
    );
  }, [events, todayEvents]);
  const hotspotEvents = useMemo(() => intelligenceEvents.filter((item) => item.discoveryStatus !== "IGNORED").slice(0, 20), [intelligenceEvents]);
  const visibleHotspotEvents = useMemo(() => {
    const now = Date.now();
    if (hotspotGroup === "ALL") return hotspotEvents;
    if (hotspotGroup === "RISING") return hotspotEvents.filter((item) => (item.clusterVelocityScore ?? 0) >= 70);
    if (hotspotGroup === "ACTIVE") return hotspotEvents.filter((item) => {
      const score = item.clusterVelocityScore ?? 0;
      return score >= 40 && score < 70;
    });
    return hotspotEvents.filter((item) => now - new Date(item.firstSeenAt).getTime() <= 12 * 60 * 60 * 1000);
  }, [hotspotEvents, hotspotGroup]);
  const selectedEvent = useMemo(() => events.find((item) => item.id === selectedEventId) ?? null, [events, selectedEventId]);
  const selectedEventRaw = useMemo(() => {
    const matches = rawItems.filter((item) =>
      selectedEvent?.clusterId ? item.clusterId === selectedEvent.clusterId : item.eventId === selectedEventId
    );
    const unique = new Map<string, RawItem>();
    for (const item of matches) {
      const key = item.originalUrl
        ? item.originalUrl.replace(/#.*$/, "").replace(/\/$/, "").toLowerCase()
        : item.id;
      const existing = unique.get(key);
      if (!existing) {
        unique.set(key, item);
        continue;
      }
      unique.set(key, {
        ...existing,
        observations: [...existing.observations, ...item.observations].filter(
          (observation, index, list) =>
            list.findIndex((candidate) => candidate.sourceId === observation.sourceId) === index
        )
      });
    }
    return [...unique.values()];
  }, [rawItems, selectedEvent, selectedEventId]);
  const selectedEventSourceCount = useMemo(() => new Set(
    selectedEventRaw.flatMap((raw) => [raw.sourceId, ...raw.observations.map((item) => item.sourceId)])
  ).size, [selectedEventRaw]);
  const sourceCountByEventId = useMemo(() => new Map(events.map((event) => {
    const matches = rawItems.filter((raw) => event.clusterId ? raw.clusterId === event.clusterId : raw.eventId === event.id);
    const count = new Set(matches.flatMap((raw) => [raw.sourceId, ...raw.observations.map((item) => item.sourceId)])).size;
    return [event.id, count] as const;
  })), [events, rawItems]);
  useEffect(() => {
    if (view !== "INTELLIGENCE") return;
    if (visibleHotspotEvents.some((item) => item.id === selectedEventId)) return;
    setSelectedEventId(visibleHotspotEvents[0]?.id ?? "");
  }, [view, visibleHotspotEvents, selectedEventId]);
  async function openEvent(eventId: string) {
    setSelectedEventId(eventId);
  }

  async function generateTopicDiagnosis(eventId: string) {
    setDiagnosingEventId(eventId);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/content/discovery/events/" + encodeURIComponent(eventId) + "/topic-diagnosis",
        { method: "POST" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "选题诊断失败");
      setTopicDiagnosis((data.item ?? null) as TopicDiagnosisArtifact | null);
      setMessage("选题诊断已生成，请结合来源人工判断。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "选题诊断失败");
    } finally {
      setDiagnosingEventId("");
    }
  }

  async function generateDemandSignals(eventId: string) {
    setDemandBusyEventId(eventId);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/content/discovery/events/" + encodeURIComponent(eventId) + "/demand-signals",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ trigger: "ADMIN_EXPLICIT" })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "需求信号生成失败");
      setDemandSignals((data.items ?? []) as DemandSignal[]);
      setMessage("需求信号已生成。评论只用于判断大家在问什么，不作为事实依据。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "需求信号生成失败");
    } finally {
      setDemandBusyEventId("");
    }
  }

  async function decide(eventId: string, decision: "ADOPT" | "WATCH" | "IGNORE") {
    setBusyEventId(eventId);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/content/discovery/events/" + encodeURIComponent(eventId) + "/decision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, selectedTypes: [] })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "事件判断保存失败");
      if (decision === "ADOPT" && typeof data.contentId === "string" && data.contentId) {
        setSelectedContentId(data.contentId);
      }
      await loadAll();
      if (decision === "ADOPT") {
        setView("WORKBENCH");
        setMessage("已采用，并已直接进入内容工作区。来源依据已自动带入。");
      } else {
        setMessage(decision === "WATCH" ? "已加入观察。" : "已忽略。");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "事件判断保存失败");
    } finally {
      setBusyEventId("");
    }
  }

  return (
    <div className="official-content-v2">
      <nav className="official-content-nav" aria-label="内容采集">
        {views.map((item) => (
          <button key={item.key} type="button" className={view === item.key ? "is-active" : ""} onClick={() => setView(item.key)}>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </nav>

      {message ? <div className="official-content-message">{message}</div> : null}

      {view === "INTELLIGENCE" ? (
        <section className="official-intelligence">
          <div className="official-hotspot-layout">
            <aside className="official-hotspot-list">
              <div className="official-panel-head"><div><span>今日热点</span><strong>上升最快的话题</strong></div><small>{hotspotEvents.length} 个</small></div>
              <div className="official-hotspot-groups">
                <button type="button" className={hotspotGroup === "RISING" ? "is-active" : ""} onClick={() => setHotspotGroup("RISING")}>上升最快</button>
                <button type="button" className={hotspotGroup === "ACTIVE" ? "is-active" : ""} onClick={() => setHotspotGroup("ACTIVE")}>持续关注</button>
                <button type="button" className={hotspotGroup === "NEW" ? "is-active" : ""} onClick={() => setHotspotGroup("NEW")}>新出现</button>
                <button type="button" className={hotspotGroup === "ALL" ? "is-active" : ""} onClick={() => setHotspotGroup("ALL")}>全部</button>
              </div>
              <div className="official-list-scroll">
                {loading ? <div className="admin-empty">正在读取…</div> : visibleHotspotEvents.length ? visibleHotspotEvents.map((event) => (
                  <button key={event.id} type="button" className={selectedEventId === event.id ? "is-active" : ""} onClick={() => void openEvent(event.id)}>
                    <div><strong>{event.title}</strong><em>{eventStatusLabel(event.discoveryStatus)}</em></div>
                    <p>{event.summary || "查看来源后再判断是否采用。"}</p>
                    <footer><span>{sourceCountByEventId.get(event.id) ?? event.clusterSourceCount} 个来源</span><span>{spreadLabel(event.clusterVelocityScore)}</span><span>{formatDate(event.lastSeenAt)}</span></footer>
                  </button>
                )) : <div className="admin-empty">当前分类暂无话题，可切换“全部”查看。</div>}
              </div>
            </aside>

            <div className="official-hotspot-detail">
              {!selectedEvent ? <div className="admin-empty">选择左侧热点查看详情。</div> : (
                <>
                  <header className="official-detail-head">
                    <div><span>核对信息</span><h2>{selectedEvent.title}</h2><p>{selectedEvent.summary || "先看来源，再做判断。"}</p></div>
                    <div className="official-detail-status">{eventStatusLabel(selectedEvent.discoveryStatus)}</div>
                  </header>

                  <div className="official-detail-meta">
                    <div><span>来源</span><strong>{selectedEventSourceCount} 个</strong></div>
                    <div><span>传播</span><strong>{spreadLabel(selectedEvent.clusterVelocityScore)}</strong></div>
                    <div><span>更新时间</span><strong>{formatDate(selectedEvent.lastSeenAt)}</strong></div>
                  </div>

                  <section className="official-detail-section">
                    <div className="official-section-title"><strong>标签</strong><span>帮助快速理解主题</span></div>
                    <div className="official-tag-row">{uniqueTags(selectedEvent.entities, selectedEvent.keywords).map((tag) => <span key={tag}>{tag}</span>)}</div>
                  </section>

                  <section className="official-detail-section official-demand-signals">
                    <div className="official-section-title">
                      <strong>需求信号 · 大家在问什么</strong>
                      <span>评论只用于需求判断，不作为事实依据</span>
                    </div>
                    {demandLoading ? (
                      <div className="admin-empty">正在读取需求信号…</div>
                    ) : demandSignals.length ? (
                      <div className="official-demand-grid">
                        {demandSignals.map((signal) => (
                          <article key={signal.id}>
                            <header>
                              <div><span>{demandTypeLabel(signal.demandType)}</span><strong>{signal.titleZh}</strong></div>
                              <em>{signal.sampleCount + " 条"}</em>
                            </header>
                            <p>{signal.summaryZh}</p>
                            <footer>
                              <span>{signal.sourcePlatforms.join(" · ") || "评论来源"}</span>
                              <span>{signal.uniqueAuthorCount ? signal.uniqueAuthorCount + " 位用户" : "作者数未知"}</span>
                            </footer>
                            {signal.representativeComments.length ? (
                              <details>
                                <summary>查看代表性评论</summary>
                                {signal.representativeComments.map((item, index) => (
                                  <blockquote key={index}>{item.text}</blockquote>
                                ))}
                              </details>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="official-demand-empty">
                        <div><strong>还没有需求信号</strong><span>只在明确触发后按需采集有限评论，先清洗去重，再交给 AI 做需求归类。</span></div>
                        <button type="button" className="btn btn-secondary" disabled={demandBusyEventId === selectedEvent.id} onClick={() => void generateDemandSignals(selectedEvent.id)}>
                          {demandBusyEventId === selectedEvent.id ? "分析中…" : "采集需求信号"}
                        </button>
                      </div>
                    )}
                  </section>

                  <section className="official-detail-section official-topic-diagnosis">
                    <div className="official-section-title">
                      <strong>选题诊断</strong>
                      <span>AI / 规则只给建议，最终由你判断</span>
                    </div>
                    {diagnosisLoading ? (
                      <div className="admin-empty">正在读取选题诊断…</div>
                    ) : topicDiagnosis ? (
                      <>
                        <div className="official-diagnosis-head">
                          <div><span>当前建议</span><strong>{diagnosisVerdictLabel(topicDiagnosis.payload.verdict)}</strong></div>
                          <small>{"v" + topicDiagnosis.version + " · " + (topicDiagnosis.generatedMode === "AI" ? "AI 分析" : "规则分析")}</small>
                        </div>
                        <div className="official-diagnosis-grid">
                          <article className="wide"><span>为什么重要</span><p>{topicDiagnosis.payload.whyItMatters}</p></article>
                          <article className="wide"><span>对读者的价值</span><p>{topicDiagnosis.payload.readerValue}</p></article>
                          <article className="wide"><span>建议写作角度</span><p>{topicDiagnosis.payload.suggestedAngle}</p></article>
                          <article><span>证据充分度</span><strong>{evidenceLabel(topicDiagnosis.payload.evidenceReadiness)}</strong></article>
                          <article><span>重复风险</span><strong>{levelLabel(topicDiagnosis.payload.duplicationRisk)}</strong></article>
                          <article><span>时效</span><strong>{levelLabel(topicDiagnosis.payload.timeliness)}</strong></article>
                        </div>
                        {topicDiagnosis.payload.evidenceGaps.length || topicDiagnosis.payload.risks.length ? (
                          <div className="official-diagnosis-notes">
                            {topicDiagnosis.payload.evidenceGaps.length ? (
                              <div><strong>还缺什么</strong>{topicDiagnosis.payload.evidenceGaps.map((item) => <span key={item}>{item}</span>)}</div>
                            ) : null}
                            {topicDiagnosis.payload.risks.length ? (
                              <div><strong>需要注意</strong>{topicDiagnosis.payload.risks.map((item) => <span key={item}>{item}</span>)}</div>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="official-diagnosis-empty">
                        <div>
                          <strong>先生成选题诊断</strong>
                          <span>系统会结合当前事件、来源覆盖与已有分析给出建议，不会自动采用。</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={diagnosingEventId === selectedEvent.id}
                          onClick={() => void generateTopicDiagnosis(selectedEvent.id)}
                        >
                          {diagnosingEventId === selectedEvent.id ? "诊断中…" : "生成选题诊断"}
                        </button>
                      </div>
                    )}
                  </section>

                  <section className="official-detail-section">
                    <div className="official-section-title"><strong>来源与原文</strong><span>{selectedEventRaw.length} 条资讯</span></div>
                    <div className="official-source-list">
                      {selectedEventRaw.length ? selectedEventRaw.map((raw) => (
                        <article key={raw.id}>
                          <div><strong>{reviewTitle(raw)}</strong><span>{siteLabel(raw)} · {formatDate(raw.publishedAt || raw.collectedAt)}</span></div>
                          {reviewExcerpt(raw) ? <p>{reviewExcerpt(raw)}</p> : null}
                          {reviewLocalization(raw)?.translationStatus === "TRANSLATED" ? (
                            <details>
                              <summary>查看英文原文</summary>
                              <strong>{reviewLocalization(raw)?.originalTitle}</strong>
                              {reviewLocalization(raw)?.originalExcerpt ? <p>{reviewLocalization(raw)?.originalExcerpt}</p> : null}
                            </details>
                          ) : null}
                          <footer>
                            <div className="official-source-facts">
                              <span>{"发现来源：" + discoverySourceNames(raw).join(" · ")}</span>
                              <span>{interactionText(raw) || "暂无互动数据"}</span>
                            </div>
                            <div>
                              {reviewLocalization(raw)?.translationStatus === "TRANSLATED" ? <span title={reviewLocalization(raw)?.originalTitle}>中英对照</span> : null}
                              {raw.originalUrl ? <a href={raw.originalUrl} target="_blank" rel="noreferrer">查看原文 ↗</a> : null}
                            </div>
                          </footer>
                        </article>
                      )) : <div className="admin-empty">暂无可展示原文。</div>}
                    </div>
                  </section>

                  <footer className="official-decision-bar">
                    <div><strong>人工判断</strong><small>{topicDiagnosis ? "结合诊断与来源决定是否采用" : "完成选题诊断后再做决定"}</small></div>
                    <div>
                      <button type="button" className="btn btn-secondary" disabled={!topicDiagnosis || busyEventId === selectedEvent.id} onClick={() => void decide(selectedEvent.id, "WATCH")}>观察</button>
                      <button type="button" className="btn btn-secondary" disabled={!topicDiagnosis || busyEventId === selectedEvent.id} onClick={() => void decide(selectedEvent.id, "IGNORE")}>忽略</button>
                      <button type="button" className="btn btn-primary" disabled={!topicDiagnosis || busyEventId === selectedEvent.id} onClick={() => void decide(selectedEvent.id, "ADOPT")}>采用并进入内容工作台</button>
                    </div>
                  </footer>
                </>
              )}
            </div>
          </div>

        </section>
      ) : null}

      {view === "WORKBENCH" ? (
        <section className="official-workbench">
          <AdminContentStudioWorkspace initialSelectedId={selectedContentId} />
        </section>
      ) : null}

    </div>
  );
}
