"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminCollectionStrategyPanel } from "./AdminCollectionStrategyPanel";
import { AdminContentStudioWorkspace } from "./AdminContentStudioWorkspace";

type View = "INTELLIGENCE" | "WORKBENCH" | "STRATEGY";
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
  platformMetrics: Record<string, unknown>;
  collectedAt: string;
  publishedAt: string | null;
  eventId: string | null;
  clusterId: string | null;
  keywords: string[];
  entities: string[];
  collectionStrategies: Array<{
    id: string;
    name: string;
    topics: string[];
    languagePolicy: "ZH_PREFERRED" | "ZH_EN" | "ANY";
  }>;
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

const views: Array<{ key: View; label: string; description: string }> = [
  { key: "STRATEGY", label: "采集策略", description: "决定系统去哪里找、找什么" },
  { key: "INTELLIGENCE", label: "今日情报", description: "先判断今天什么值得关注" },
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

function languagePolicyLabel(value: RawItem["collectionStrategies"][number]["languagePolicy"]) {
  if (value === "ZH_PREFERRED") return "中文优先";
  if (value === "ZH_EN") return "中文 + 英文";
  return "不限制";
}

function spreadLabel(score: number | null) {
  if (score === null) return "待积累";
  if (score >= 70) return "正在升温";
  if (score >= 40) return "持续传播";
  return "传播平稳";
}

export function AdminPlatformContentWorkspace({ initialView = "INTELLIGENCE" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [events, setEvents] = useState<DiscoveryEvent[]>([]);
  const [rawItems, setRawItems] = useState<RawItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedContentId, setSelectedContentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyEventId, setBusyEventId] = useState("");
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

  useEffect(() => { void loadAll(); }, []);

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
        ),
        collectionStrategies: [...existing.collectionStrategies, ...item.collectionStrategies].filter(
          (strategy, index, list) => list.findIndex((candidate) => candidate.id === strategy.id) === index
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
  const selectedStrategyTopics = useMemo(() => uniqueTags(
    ...selectedEventRaw.map((raw) => raw.collectionStrategies.flatMap((strategy) => strategy.topics))
  ), [selectedEventRaw]);
  const selectedStrategies = useMemo(() => [...new Map(
    selectedEventRaw.flatMap((raw) => raw.collectionStrategies).map((strategy) => [strategy.id, strategy])
  ).values()], [selectedEventRaw]);

  useEffect(() => {
    if (view !== "INTELLIGENCE") return;
    if (visibleHotspotEvents.some((item) => item.id === selectedEventId)) return;
    setSelectedEventId(visibleHotspotEvents[0]?.id ?? "");
  }, [view, visibleHotspotEvents, selectedEventId]);
  async function openEvent(eventId: string) {
    setSelectedEventId(eventId);
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
                    <div className="official-tag-row">{uniqueTags(selectedEvent.entities, selectedEvent.keywords, selectedStrategyTopics).map((tag) => <span key={tag}>{tag}</span>)}</div>
                    {selectedStrategies.length ? (
                      <div className="official-intelligence-provenance">
                        <span>{"采集策略：" + selectedStrategies.map((strategy) => strategy.name).join(" · ")}</span>
                        <span>{"语言：" + [...new Set(selectedStrategies.map((strategy) => languagePolicyLabel(strategy.languagePolicy)))].join(" · ")}</span>
                      </div>
                    ) : null}
                  </section>

                  <section className="official-detail-section">
                    <div className="official-section-title"><strong>来源与原文</strong><span>{selectedEventRaw.length} 条资讯</span></div>
                    <div className="official-source-list">
                      {selectedEventRaw.length ? selectedEventRaw.map((raw) => (
                        <article key={raw.id}>
                          <div><strong>{raw.title}</strong><span>{siteLabel(raw)} · {formatDate(raw.publishedAt || raw.collectedAt)}</span></div>
                          {raw.excerpt ? <p>{raw.excerpt}</p> : null}
                          <footer>
                            <div className="official-source-facts">
                              <span>{"发现来源：" + discoverySourceNames(raw).join(" · ")}</span>
                              {raw.collectionStrategies.length ? <span>{"采集策略：" + raw.collectionStrategies.map((strategy) => strategy.name).join(" · ")}</span> : null}
                              <span>{interactionText(raw) || "暂无互动数据"}</span>
                            </div>
                            {raw.originalUrl ? <a href={raw.originalUrl} target="_blank" rel="noreferrer">查看原文 ↗</a> : null}
                          </footer>
                        </article>
                      )) : <div className="admin-empty">暂无可展示原文。</div>}
                    </div>
                  </section>

                  <footer className="official-decision-bar">
                    <div><strong>人工判断</strong><small>核对来源后决定是否采用</small></div>
                    <div>
                      <button type="button" className="btn btn-secondary" disabled={busyEventId === selectedEvent.id} onClick={() => void decide(selectedEvent.id, "WATCH")}>观察</button>
                      <button type="button" className="btn btn-secondary" disabled={busyEventId === selectedEvent.id} onClick={() => void decide(selectedEvent.id, "IGNORE")}>忽略</button>
                      <button type="button" className="btn btn-primary" disabled={busyEventId === selectedEvent.id} onClick={() => void decide(selectedEvent.id, "ADOPT")}>采用并进入内容工作台</button>
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

      {view === "STRATEGY" ? (
        <AdminCollectionStrategyPanel />
      ) : null}
    </div>
  );
}
