"use client";
import type {AiHotspotPracticeRecord} from "../lib/server/content/ai-hotspot-practice";

import { useEffect, useRef, useState } from "react";
import { beijingDay, dayStart, previousDay } from "../lib/content/radar-calendar";
import { COLLECTION_QUALITY_REASON_NAMES, type CollectionQualityReason } from "../lib/content/collection-quality-feedback-contract";

type QualityView = { eventLabel: string | null; sources: Array<{ sourceId: string; label: string }>; sourceOptions: Array<{ sourceId: string; name: string }> };

type HotTrackingMode = "FEATURED" | "ALL";
type RadarCategory = "全部" | "模型" | "产品" | "开发者" | "行业" | "论文" | "社区" | "自媒体";

type EventItem = {
  eventId: string;
  eventLastSeenAt?: string;
  timelineAt?: string;
  clusterId: string | null;
  title: string;
  excerpt: string | null;
  originalUrl: string | null;
  publishedAt: string | null;
  collectedAt: string;
  sourceName: string;
  sourceCount: number;
  publicReadableSourceCount?: number;
  hotParticipants?: Array<{ name: string; platform: string; role: string }>;
  practicalEvidenceLinks?: Array<{ sourceName: string; title: string | null; presentation?: { displayTitleZh?: string | null }; originalUrl: string; publishedAt: string | null; expansionType: string }>;

  eventType: string | null;
  category: Exclude<RadarCategory, "全部">;
  radarState?: "LATEST" | "PRACTICING" | "UNVERIFIED";
  verificationStatus: string;
  discoveryStatus?: string | null;
  factSourceCount: number;
  signalSourceCount: number;
  evidenceLinks: Array<{ sourceName: string; title: string; presentation?: { displayTitleZh?: string | null }; originalUrl: string | null; publishedAt: string | null }>;
  story?: {
    version: string;
    authority: "DERIVED_READ_MODEL";
    overview: string;
    latest: { text: string; reportId: string; sourceName: string; originalUrl: string | null; publishedAt: string | null; authority: "PRIMARY" | "HIGH" | "SIGNAL" } | null;
    latestReport: { reportId: string; title: string; titleZh: string | null; sourceName: string; sourceType: string; originalUrl: string | null; publishedAt: string | null; authority: "PRIMARY" | "HIGH" | "SIGNAL" } | null;
    digest: { text: string; mode: "DETERMINISTIC_DERIVED"; aiGenerated: false };
    developments: Array<{ id: string; at: string | null; title: string; sourceName: string; originalUrl: string | null; authority: "PRIMARY" | "HIGH" | "SIGNAL" }>;
    reportTimeline: Array<{ reportId: string; title: string; titleZh: string | null; sourceName: string; sourceType: string; originalUrl: string | null; publishedAt: string | null; authority: "PRIMARY" | "HIGH" | "SIGNAL"; participant: { participantName: string | null; participantType: string | null; role: string; platform: string } }>;
    relatedEvents: Array<{ eventId: string; title: string; reason: string; score: number }>;
    heatSeries: { mode: "DERIVED_REPLAY"; persistedHistory: false; intervalHours: number; windowHours: number; points: Array<{ at: string; score: number; participantCount: number; editorialParticipantCount: number; signalParticipantCount: number }> };
  };
  presentation?: { displayTitleZh?: string | null; displaySummaryZh?: string | null; translationStatus?: string; editorialJudgmentZh?: string | null; itemType?: string | null; tags?: string[]; fullTextTranslationStatus?: string };
  curation: {
    curated: boolean;
    score: number;
    threshold: number;
    tier: "TOP_PICK" | "FEATURED" | "QUALIFIED" | "REJECTED";
    gatePassed: boolean;
    featuredRank?: number | null;
    rerankAuthority?: "PRESENTATION_ONLY";
    components: {
      relevance: number;
      freshness: number;
      evidenceQuality: number;
      importance: number;
      practicalValue: number;
      independence: number;
    };
    reasons: string[];
    recommendationReason?: string | null;
  };
  currentHot: { eligible: boolean; formalRanking: true; authority: "PRESENTATION_ONLY"; status: "RISING" | "SUSTAINED" | "OBSERVING" | "EXPIRED"; score: number };
  topicMomentum: {
    phase: "EARLY_OBSERVATION" | "MOMENTUM_WINDOW" | "EXPIRED_WINDOW";
    status: "RISING" | "SUSTAINED" | "OBSERVING" | "EXPIRED";
    eligible: boolean;
    score: number;
    independentSourceCount: number;
    independentParticipantCount?: number;
    publicReadableSourceCount?: number;
    halfLifeHours?: number;
    trendComparable?: boolean;
    trend?: { direction: "UP" | "DOWN" | "FLAT"; changePercent: number; currentItemCount: number; previousItemCount: number; comparableParticipantCount: number; basis: "SAME_CONTINUOUS_PARTICIPANT_COHORT" } | null;
    creatorCount: number;
    activeDayCount: number;
    platformCount: number;
    practicalTypeCount: number;
    criteria: { multiSource: boolean; multiCreator: boolean; multiDay: boolean; crossPlatformOrPracticalDiversity: boolean; hasEngagementEvidence: boolean };
  };
  evidenceScore: { value: null; status: "TRUSTED" | "UNVERIFIED"; factSourceCount: number; independentOriginCount: number };
  opcValue: { status: "AVAILABLE" | "NOT_EVALUATED"; value: number | null; whyItMatters: string | null; suggestedContentTypes: string[] };
  coverage: { evidenceCount: number; practicalEvidenceCount: number; actionablePracticalEvidenceCount?: number; actionablePracticalOriginCount?: number; actionablePracticalTypeCount?: number; chinesePracticalEvidenceCount?: number; actionableChinesePracticalEvidenceCount?: number; presentExpansionTypes: string[]; missingExpansionTypes: string[]; needsExpansion: boolean };
};

type SourceHealthItem = {
  sourceId: string;
  sourceName: string;
  platform: string;
  adapter: string | null;
  acquisitionKind: string;
  acquisitionReason: string;
  acquisitionRuntimeOwner: string | null;
  serverRuntimeSupported: boolean;
  qualification: string;
  effectiveQualification: string;
  runtimeQualificationReason: string | null;
  sourceRole: string;
  portfolioGroup: string;
  status: string;
  detail: string | null;
  lastSuccessAt: string | null;
  utility: {
    recentRunCount: number;
    successRate: number | null;
    aiRelevantKeepRate: number | null;
    duplicateRate: number | null;
    receivedTotal: number;
    keptTotal: number;
  };
};

type FunnelWindow = {
  label: string; from: string | null; to: string; runCount: number; received: number; filterKept: number | null;
  rawCreated: number; rawDuplicate: number; eventCreated: number | null; eventMerged: number | null;
  policyRejected: number | null; ingestCapacityExcluded: number | null; historicalWithoutEvent: number | null; failedRuns: number;
  unrecordedEventRuns: number; unrecordedFilterRuns: number; filterReasons: Record<string, number>; policyReasons: Record<string, number>;
};
type CollectionHealth = {
  windows?: Record<"today" | "sevenDays" | "recent", FunnelWindow>;
  summary: {
    runCount: number;
    successCount: number;
    failedCount: number;
    configuredSourceCount: number;
    monitoredSourceCount: number;
    healthySourceCount: number;
    failedSourceCount: number;
    degradedSourceCount: number;
    runtimeGapCount: number;
    receivedTotal: number;
    keptTotal: number;
    aiRelevantKeepRate: number | null;
  };
  sourceGroups: Array<{
    groupName: string;
    sourceCount: number;
    healthyCount: number;
    failedCount: number;
    runCount: number;
    successRate: number | null;
    receivedTotal: number;
    keptTotal: number;
    aiRelevantKeepRate: number | null;
    lastSuccessAt: string | null;
  }>;
  optionalCapabilities: Array<{
    key: string;
    name: string;
    status: string;
    reason: string;
  }>;
  sourceHealth?: SourceHealthItem[];
};

const categories: RadarCategory[] = ["全部", "模型", "产品", "开发者", "行业", "论文", "社区", "自媒体"];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDay(value: string | null | undefined) {
  if (!value) return "未知日期";
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).format(new Date(value));
}

function shortSummary(item: EventItem) {
  const value = item.presentation?.displaySummaryZh || item.excerpt || "暂无摘要";
  return value.length > 100 ? value.slice(0, 100) + "…" : value;
}

function shortText(value: string, limit = 100) {
  return value.length > limit ? value.slice(0, limit) + "…" : value;
}

function evidenceTimeline(item: EventItem) {
  return [...item.evidenceLinks].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}

function latestProgressText(item: EventItem) {
  return item.story?.latest?.text || evidenceTimeline(item)[0]?.presentation?.displayTitleZh || evidenceTimeline(item)[0]?.title || shortSummary(item);
}

function hotTrendText(item: EventItem) {
  if (!item.topicMomentum.trendComparable || !item.topicMomentum.trend) return "—";
  const trend = item.topicMomentum.trend;
  const mark = trend.direction === "UP" ? "↑" : trend.direction === "DOWN" ? "↓" : "→";
  return mark + " " + Math.abs(trend.changePercent) + "%";
}





function verificationLabel(value: string) {
  if (value === "CONFIRMED_OFFICIAL") return "官方确认";
  if (value === "CONFIRMED_MEDIA") return "媒体确认";
  if (value === "UNVERIFIED") return "待验证";
  return value;
}

function sourceGroupLabel(value: string) {
  const labels: Record<string, string> = {
    "Official AI Updates": "官方 AI 更新",
    "Curated Media": "精选媒体",
    "AI_HOT": "AI HOT",
    "AI HOT": "AI HOT",
    "Hacker News": "Hacker News",
    "GitHub Trending": "GitHub 热门",
    "Product Hunt": "Product Hunt",
    "OPML RSS": "订阅源"
  };
  return labels[value] ?? value;
}

function sourceStatusLabel(value: string) {
  const labels: Record<string, string> = {
    HEALTHY: "正常",
    READY: "待运行",
    FAILED: "失败",
    DEGRADED: "降级",
    AUTO_READY: "稳定自动",
    CONDITIONAL: "观察中",
    DISABLED: "已停用",
    SUPPORTED: "可接入"
  };
  return labels[value] ?? value;
}

function acquisitionLabel(value: string) {
  const labels: Record<string, string> = {
    RSS_ATOM: "RSS / Atom",
    PUBLIC_JSON_API: "公开 API",
    SITEMAP: "站点地图",
    JINA_READER: "网页读取",
    STATIC_PAGE: "网页",
    CUSTOM_RUNTIME: "专用采集"
  };
  return labels[value] ?? value;
}

function sourceRoleLabel(value: string) {
  const labels: Record<string, string> = {
    OFFICIAL: "官方",
    MEDIA: "媒体",
    RESEARCH: "研究",
    DEVELOPER: "开发者",
    SOCIAL: "社区 / 社交",
    CREATOR: "创作者",
    MANAGED_SOURCE: "托管来源"
  };
  return labels[value] ?? value;
}

function optionalCapabilityStatusLabel(value: string) {
  const labels: Record<string, string> = {
    LIVE_SELF_HOSTED_QUALIFIED: "自托管已验证",
    DISABLED_UNSTABLE: "暂不启用",
    CONDITIONAL: "观察中"
  };
  return labels[value] ?? value;
}

function optionalCapabilityReasonLabel(value: string) {
  const labels: Record<string, string> = {
    "Reference runtime currently returns 403 through Jina.": "参考运行链经 Jina 当前返回 403。",
    "Requires a dedicated Feishu update-log parser before AUTO.": "进入稳定自动采集前，需要专用飞书更新日志解析器。",
    "GitHub releases Atom recent success rate was 29%; official repository feed.xml is not reachable from the current server network path, so it is excluded from the stable baseline.": "GitHub Releases Atom 最近成功率约 29%；当前服务器网络无法访问官方仓库 feed.xml，因此暂不纳入稳定基线。"
  };
  return labels[value] ?? value;
}

async function readJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "操作失败");
  return data;
}

export function AdminIntelligenceWorkspace() {
  const [trackingMode, setTrackingMode] = useState<HotTrackingMode>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<RadarCategory>("全部");
  const [sourceFilter, setSourceFilter] = useState("全部来源");
  const [qualityFilter, setQualityFilter] = useState<"ALL" | "UNREVIEWED" | "POSITIVE" | "NEGATIVE">("ALL");
  const [qualityByEvent, setQualityByEvent] = useState<Record<string, QualityView>>({});
  const [qualityEditingId, setQualityEditingId] = useState<string | null>(null);
  const [qualityAction, setQualityAction] = useState<"POSITIVE" | "NEGATIVE" | "CLEAR">("NEGATIVE");
  const [qualitySourceId, setQualitySourceId] = useState("");
  const [qualityReason, setQualityReason] = useState<CollectionQualityReason | "">("");
  const [qualityNote, setQualityNote] = useState("");
  const [items, setItems] = useState<EventItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<EventItem[]>([]);
  const [currentHot, setCurrentHot] = useState<EventItem[]>([]);
  const [aiHotspotPractices, setAiHotspotPractices] = useState<AiHotspotPracticeRecord[]>([]);
  const [query, setQuery] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [timelineWindow, setTimelineWindow] = useState<{ from: string; to: string; today: string; firstDay: string } | null>(null);
  const [loadedDays, setLoadedDays] = useState<string[]>([]);
  const [categoryCounts7d, setCategoryCounts7d] = useState<Partial<Record<RadarCategory, number>>>({});
  const [collectionHealth, setCollectionHealth] = useState<CollectionHealth | null>(null);
  const [sourceHealthLoaded, setSourceHealthLoaded] = useState(false);
  const [sourceHealthLoading, setSourceHealthLoading] = useState(false);
  const [busy, setBusy] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<{
    readyForTodayIntelligence: boolean;
    status: string;
    discoverySignals: {
      recentSourceCount: number;
      recentPlatformCount: number;
      qualifiedRecentSourceCount: number;
      qualifiedRecentPlatformCount: number;
    };
    topicMomentum: { minAgeHours: number; windowHours: number; mode: string };
  } | null>(null);

  const readEpoch = useRef(0);
  const qualityReadEpoch = useRef(0);
  const [clockNow, setClockNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setClockNow(Date.now()), 60000); return () => window.clearInterval(timer); }, []);
  const [snapshotStatus, setSnapshotStatus] = useState<{ generatedAt: string; freshness: { stale: boolean; reason: string } } | null>(null);
  const [snapshotReadFailed, setSnapshotReadFailed] = useState(false);

  async function loadQualityFeedback(eventIds: string[]) {
    const epoch = ++qualityReadEpoch.current;
    const uniqueIds = [...new Set(eventIds)];
    for (let start = 0; start < uniqueIds.length; start += 100) {
      const group = uniqueIds.slice(start, start + 100);
      const data = await readJson("/api/admin/content/quality-feedback?eventIds=" + group.join(","));
      if (epoch !== qualityReadEpoch.current) return;
      setQualityByEvent(current => ({ ...current, ...(data.events ?? {}) }));
    }
  }

  async function loadSnapshot(clearMessage = true) {
    const epoch = ++readEpoch.current;
    setBusy(true);
    if (clearMessage) setMessage(null);
    try {
      const data = await readJson("/api/admin/content/intelligence?view=snapshot");
      if (epoch !== readEpoch.current) return;
      setSnapshotReadFailed(false);
      setSnapshotStatus({ generatedAt: data.generatedAt, freshness: data.freshness ?? { stale: true, reason: "UNKNOWN" } });
      setItems((data.items ?? []) as EventItem[]);
      setTimelineWindow(data.timelineWindow ?? null);
      const days: string[] = [];
      if (data.timelineWindow) { let day = data.timelineWindow.today; for (let i = 0; i < 7; i++) { days.push(day); day = previousDay(day); } }
      setLoadedDays(days);
      setFeaturedItems((data.featured ?? []) as EventItem[]);
      setNextCursor(data.hasMore && data.nextCursor ? data.nextCursor : null);
      setCategoryCounts7d((data.categoryCounts7d ?? {}) as Partial<Record<RadarCategory, number>>);
      setCurrentHot((data.currentHot ?? []) as EventItem[]);
      setAiHotspotPractices((data.aiHotspotPractices ?? []) as AiHotspotPracticeRecord[]);
      setReadiness(data.readiness ?? null);
      setCollectionHealth(data.collectionHealth ?? null);
      void loadQualityFeedback([...(data.items ?? []), ...(data.featured ?? []), ...(data.currentHot ?? []), ].map((item: EventItem) => item.eventId)).catch(() => setMessage("评价状态读取失败，请刷新重试。"));
    } catch (error) {
      if (epoch === readEpoch.current) { setSnapshotReadFailed(true); setMessage(error instanceof Error ? error.message : "热点追踪读取失败"); }
    } finally {
      if (epoch === readEpoch.current) setBusy(false);
    }
  }

  useEffect(() => {
    void loadSnapshot();
  }, []);

  async function loadMoreEvents() {
    if (!nextCursor || loadingMore || !timelineWindow) return;
    setLoadingMore(true);
    const epoch = readEpoch.current;
    try {
      const data = await readJson(`/api/admin/content/intelligence?view=timeline&day=${encodeURIComponent(nextCursor)}&asOf=${encodeURIComponent(timelineWindow.to)}`);
      if (epoch !== readEpoch.current) return;
      const more = (data.items ?? []) as EventItem[];
      if (more.length) setLoadedDays(current => [...new Set([...current, data.day as string])]);
      setItems((current) => {
        const byEvent = new Map([...current, ...more].map((item) => [item.eventId, item]));
        return [...byEvent.values()].sort((a, b) => new Date(b.timelineAt || b.publishedAt || b.collectedAt).getTime() - new Date(a.timelineAt || a.publishedAt || a.collectedAt).getTime());
      });
      void loadQualityFeedback([...items, ...more].map(item => item.eventId)).catch(() => setMessage("历史评价状态读取失败。"));
      setNextCursor(data.hasMore && data.nextCursor ? data.nextCursor : null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载更多失败");
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadSourceHealthDetails() {
    if (sourceHealthLoaded || sourceHealthLoading) return;
    setSourceHealthLoading(true);
    try {
      const data = await readJson("/api/admin/content/intelligence?view=source-health&limit=120");
      setCollectionHealth(current => current ? { ...current, sourceHealth: data.sourceHealth } : data as CollectionHealth);
      setSourceHealthLoaded(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "采集状态读取失败");
    } finally {
      setSourceHealthLoading(false);
    }
  }

  async function saveQuality(eventId: string, label: "POSITIVE" | "NEGATIVE" | "CLEAR", sourceChoice = qualitySourceId) {
    setActingId(eventId);
    setMessage(null);
    ++qualityReadEpoch.current;
    try {
      const options = qualityByEvent[eventId]?.sourceOptions ?? [];
      const sourceId = sourceChoice || (options.length === 1 ? options[0].sourceId : null);
      await readJson(`/api/admin/content/discovery/events/${eventId}/quality-feedback`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label, sourceId, reason: label === "NEGATIVE" ? qualityReason || null : null, note: label === "NEGATIVE" ? qualityNote || null : null, requestId: crypto.randomUUID() })
      });
      await loadQualityFeedback([eventId]);
      setQualityEditingId(null);
      setMessage(label === "CLEAR" ? "已撤销评价，历史记录保留。" : "已记录采集质量评价；自动栏目与采集不受影响。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "评价保存失败");
    } finally {
      setActingId(null);
    }
  }

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const modeItems = trackingMode === "FEATURED" ? featuredItems : items;
  const visibleItems = modeItems.filter((item) => {
    if (trackingMode === "FEATURED" && !item.curation.curated) return false;
    if (categoryFilter !== "全部" && item.category !== categoryFilter) return false;
    if (sourceFilter !== "全部来源" && item.sourceName !== sourceFilter && !item.evidenceLinks.some((link) => link.sourceName === sourceFilter)) return false;
    const feedback = qualityByEvent[item.eventId];
    const labels = [feedback?.eventLabel, ...(feedback?.sources.map(source => source.label) ?? [])].filter(Boolean);
    if (qualityFilter === "UNREVIEWED" && labels.length) return false;
    if ((qualityFilter === "POSITIVE" || qualityFilter === "NEGATIVE") && !labels.includes(qualityFilter)) return false;
    if (!normalizedQuery) return true;
    return [
      item.title,
      item.excerpt ?? "",
      item.sourceName,
      item.eventType ?? "",
      ...item.evidenceLinks.flatMap((link) => [link.sourceName, link.title])
    ].join("\n").toLocaleLowerCase().includes(normalizedQuery);
  }).sort((left, right) =>
    trackingMode === "FEATURED"
      ? (left.curation.featuredRank ?? Number.MAX_SAFE_INTEGER) - (right.curation.featuredRank ?? Number.MAX_SAFE_INTEGER) || right.curation.score - left.curation.score
      : new Date(right.timelineAt || right.publishedAt || right.collectedAt).getTime() - new Date(left.timelineAt || left.publishedAt || left.collectedAt).getTime()
  );
  const sourceOptions = [...new Set(modeItems.flatMap((item) => [item.sourceName, ...item.evidenceLinks.map((link) => link.sourceName)]))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const categoryCounts = Object.fromEntries(categories.map((category) => [
    category,
    trackingMode === "ALL" && categoryCounts7d[category] !== undefined
      ? categoryCounts7d[category]
      : category === "全部" ? modeItems.length : modeItems.filter((item) => item.category === category).length
  ])) as Record<RadarCategory, number>;
  const itemsByDay = visibleItems.reduce((map, item) => {
    const day = beijingDay(item.timelineAt || item.publishedAt || item.collectedAt);
    map.set(day, [...(map.get(day) ?? []), item]);
    return map;
  }, new Map<string, EventItem[]>());
  const dayGroups = [...new Set([...loadedDays, ...itemsByDay.keys()])].sort().reverse().map(day => [day, itemsByDay.get(day) ?? []] as const);


  return (
    <section className="intel-workspace">
      <section className="intel-command">
        <div className="intel-command-copy">
          <span>HOT TRACKING</span>
          <div><h2>值得关注</h2><small>热点看讨论活跃度 · 精选看内容价值 · AI热点练习看多人分析与运用</small></div>
        </div>
        <div className="intel-command-tools">
          <nav className="intel-category-tabs" aria-label="情报栏目">
            {categories.map((category) => (
              <button type="button" key={category} className={categoryFilter === category ? "is-active" : ""} onClick={() => setCategoryFilter(category)}>
                {category}<span>{categoryCounts[category]}</span>
              </button>
            ))}
          </nav>
          <div className="intel-command-search">
            <select value={qualityFilter} onChange={(event) => setQualityFilter(event.target.value as typeof qualityFilter)} aria-label="人工评价筛选">
              <option value="ALL">全部评价</option><option value="UNREVIEWED">未评价</option><option value="POSITIVE">已采用</option><option value="NEGATIVE">已忽略</option>
            </select>
            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} aria-label="来源筛选">
              <option>全部来源</option>
              {sourceOptions.map((source) => <option key={source}>{source}</option>)}
            </select>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索事件 / 来源" aria-label="搜索事件或来源" />
          </div>
        </div>
      </section>

      <section className="intel-today-grid">
        <section className="intel-today-hot">
          <header>
            <div><span>NOW</span><h3>当前热点</h3></div>
            <div><small>近 7 天正式热点榜</small></div>
          </header>
          <div className="intel-today-hot-list" tabIndex={0} aria-label="当前热点，可滚动查看">
            {currentHot.length ? currentHot.map((item, index) => (
              <article key={item.eventId}>
                <b>{index + 1}</b>
                <div>
                  <strong>{item.presentation?.displayTitleZh || item.title}</strong>
                  <p>{shortText(latestProgressText(item), 92)}</p>
                </div>
                <div className="intel-today-hot-stats">
                  <strong>{Math.round(item.topicMomentum.score)}</strong>
                  <span>{item.topicMomentum.independentParticipantCount ?? item.topicMomentum.independentSourceCount} 参与者</span>
                  <span>{item.publicReadableSourceCount ?? item.evidenceLinks.length} 信源</span>
                  <em className={item.topicMomentum.trend?.direction === "UP" ? "is-up" : item.topicMomentum.trend?.direction === "DOWN" ? "is-down" : ""}>{hotTrendText(item)}</em>
                </div>
              </article>
            )) : <div className="intel-empty">当前没有达到正式热点门槛的 Event。</div>}
          </div>
        </section>

        <div className="intel-today-side">
          <section className="intel-hotspot-practice">
            <header><div><span>AI HOTSPOT PRACTICE</span><h3>AI热点练习</h3></div><small>{aiHotspotPractices.length} 项 · 触发后持续展示</small></header>
            <div className="intel-hotspot-practice-list" tabIndex={0} aria-label="AI热点练习，可滚动查看">
              {aiHotspotPractices.map((item) => (
                <article key={item.eventId}>
                  <strong>{item.title}</strong>
                  <p>{item.summary || "围绕该热点查看分析、实测与运用资料。"}</p>
                  <span>首次触发 {new Date(item.firstTriggeredAt).toLocaleDateString("zh-CN", {timeZone:"Asia/Shanghai"})} · {item.participants.length} 个独立发布者 · {item.materialStatus === "VERIFIED_MATERIAL_AVAILABLE" ? "已有验证材料" : "操作材料待补齐"}</span>
                  <details className="intel-practice-materials">
                    <summary>资料详情 · {item.links.filter((link) => link.originalUrl).length} 篇</summary>
                    <ol>
                      {item.links.map((link) => link.originalUrl ? (
                        <li key={link.originalUrl}><a href={link.originalUrl} target="_blank" rel="noreferrer">{link.title || link.sourceName} · {link.sourceName} ↗</a></li>
                      ) : null)}
                    </ol>
                  </details>
                </article>
              ))}
              {!aiHotspotPractices.length ? <div className="intel-hotspot-practice-empty"><strong>暂无触发的AI热点练习</strong><p>明确AI主题、至少两个独立发布者，并有分析或应用内容即可触发；独立于精选，触发后持续展示。</p></div> : null}
            </div>
          </section>
        </div>
      </section>

      <div className="intel-feed-head">
        <div className="intel-feed-mode" aria-label="热点追踪视图">
          <button type="button" className={trackingMode === "ALL" ? "is-active" : ""} onClick={() => setTrackingMode("ALL")}>全部动态</button>
          <button type="button" className={trackingMode === "FEATURED" ? "is-active" : ""} onClick={() => setTrackingMode("FEATURED")}>只看精选</button>
        </div>
        <div><strong>{trackingMode === "FEATURED" ? "精选事件" : "全部动态"}</strong><span>{trackingMode === "FEATURED" ? "事实门槛通过后按精选分排序" : "北京时间今天及前六日全部 AI 相关 Event · 按事件时间"}</span></div>
      </div>



      {readiness ? (
        <details className="intel-readiness-compact">
          <summary>信号状态 · {readiness.readyForTodayIntelligence ? "可用" : "仍有缺口"} · {readiness.discoverySignals.qualifiedRecentSourceCount} 个合格来源 / {readiness.discoverySignals.qualifiedRecentPlatformCount} 个平台</summary>
          <p>近期观测 {readiness.discoverySignals.recentSourceCount} 来源 / {readiness.discoverySignals.recentPlatformCount} 平台 · 热点窗口 {readiness.topicMomentum.minAgeHours / 24}–{readiness.topicMomentum.windowHours / 24} 天。该状态只用于诊断，不改变 Event 排序。</p>
        </details>
      ) : null}
      {collectionHealth ? (
        <details
          className="intel-source-health"
          onToggle={(event) => {
            if (event.currentTarget.open) void loadSourceHealthDetails();
          }}
        >
          <summary>
            <div>
              <strong>采集状态</strong>
              <span>
                来源 {collectionHealth.summary.healthySourceCount}/{collectionHealth.summary.monitoredSourceCount} 正常 ·
                北京时间今日返回 {collectionHealth.windows?.today.received ?? "未记录"} 条次 ·
                新增Raw {collectionHealth.windows?.today.rawCreated ?? "未记录"} ·
                过滤保留 {collectionHealth.windows?.today.filterKept ?? "未完整记录"} ·
                失败 {collectionHealth.summary.failedSourceCount}
              </span>
            </div>
            <small>只读维护信息 · 不影响 Event 排序与事实权力</small>
          </summary>
          <div className="intel-source-group-grid">
            {collectionHealth.windows ? (["today", "sevenDays", "recent"] as const).map(key => { const window = collectionHealth.windows![key]; return (
              <article key={key}>
                <strong>{window.label} · {window.runCount} 次运行</strong>
                <small>{formatDate(window.from)} — {formatDate(window.to)}（北京时间）</small>
                <span>返回 {window.received} 条次 → 过滤保留 {window.filterKept ?? "未完整记录"}</span>
                <span>新增Raw {window.rawCreated} ／ 重复Raw {window.rawDuplicate} → 新建Event {window.eventCreated ?? "未完整记录"} ／ 归并Event {window.eventMerged ?? "未完整记录"}</span>
                <small>后置规则排除 {window.policyRejected ?? "未记录"} · 入库批量排除 {window.ingestCapacityExcluded ?? "未记录"} · 无发布日期历史材料 {window.historicalWithoutEvent ?? "未记录"} · 失败/可能部分写入 {window.failedRuns} 次</small>
                <small>过滤原因：{Object.entries(window.filterReasons).map(([reason, count]) => `${reason}: ${count}`).join("；") || "无已记录原因"}</small>
                <small>后置排除原因：{Object.entries(window.policyReasons).map(([reason, count]) => `${reason}: ${count}`).join("；") || "无已记录原因"}</small>
                {window.unrecordedEventRuns || window.unrecordedFilterRuns ? <small>历史缺口：{window.unrecordedEventRuns} 次未记录事件漏斗、{window.unrecordedFilterRuns} 次未记录过滤计数；不反推历史。</small> : null}
              </article>
            ); }) : null}
          </div>
          <p>七日可见事件 {categoryCounts7d["全部"] ?? 0} 个（存量，按事件时间）；上方采集漏斗按运行开始时间统计，重复轮询不等于新增内容。重复Raw复用规范URL、外部ID、内容/标题哈希；不再新建Event。失败运行可能部分写入，未计入成功漏斗。</p>
          <p>口径说明：“过滤保留”是多次采集留下的条次，含重复；“新增Raw”是首次保存的原始文章/材料；“全部动态”统计近七日独立事件，同一事件的多篇报道会归并。因此三者不应相等，今天新增原文也不等于近七日全部事件。</p>
          <p>可见事件排除：七日窗口外或未来日期、已归档、非当前SYSTEM策略、非AI相关、运营用途不合格、非聚类主事件、缺少SYSTEM原始证据。人工采集质量评价不改变可见性。</p>
          <div className="intel-source-group-grid">
            {collectionHealth.sourceGroups.map((group) => (
              <article key={group.groupName}>
                <div>
                  <strong>{sourceGroupLabel(group.groupName)}</strong>
                  <span>{group.healthyCount}/{group.sourceCount} 可用</span>
                </div>
                <b className={group.failedCount ? "is-warn" : "is-ok"}>
                  {group.failedCount ? group.failedCount + " 异常" : "正常"}
                </b>
                <small>
                  AI强相关 {group.aiRelevantKeepRate === null ? "—" : group.aiRelevantKeepRate + "%"} ·
                  成功 {group.successRate === null ? "—" : group.successRate + "%"}
                </small>
              </article>
            ))}
          </div>
          <div className="intel-advanced-sources">
            <strong>高级 / 待资格来源</strong>
            <div>
              {collectionHealth.optionalCapabilities.map((item) => (
                <span key={item.key}><b>{item.name}</b> · {optionalCapabilityStatusLabel(item.status)} · {optionalCapabilityReasonLabel(item.reason)}</span>
              ))}
            </div>
          </div>
          <div className="intel-source-health-list">
            {sourceHealthLoading ? <div className="intel-loading">正在读取单源运行状态…</div> : null}
            {(collectionHealth.sourceHealth ?? []).map((source) => (
              <article key={source.sourceId}>
                <div>
                  <strong>{source.sourceName}</strong>
                  <span>{sourceGroupLabel(source.portfolioGroup)} · {source.platform} · {sourceRoleLabel(source.sourceRole)}</span>
                </div>
                <div>
                  <b>{acquisitionLabel(source.acquisitionKind)}</b>
                  <span>
                    {source.serverRuntimeSupported ? (source.acquisitionRuntimeOwner ?? source.adapter ?? source.acquisitionReason) : "Runtime 未接通"}
                  </span>
                </div>
                <div>
                  <span>AI/原始 {source.utility.aiRelevantKeepRate === null ? "—" : source.utility.aiRelevantKeepRate + "%"}</span>
                  <span>成功 {source.utility.successRate === null ? "—" : source.utility.successRate + "%"}</span>
                  <span>重复 {source.utility.duplicateRate === null ? "—" : source.utility.duplicateRate + "%"}</span>
                </div>
                <div>
                  <b className={source.effectiveQualification === "AUTO_READY" && source.status === "HEALTHY" ? "is-ok" : source.effectiveQualification === "DISABLED" || source.status === "FAILED" ? "is-bad" : ""}>{sourceStatusLabel(source.status)}</b>
                  <span>{source.runtimeQualificationReason || (source.lastSuccessAt ? formatDate(source.lastSuccessAt) : source.detail || "暂无成功运行")}</span>
                </div>
              </article>
            ))}
            {!sourceHealthLoading && !sourceHealthLoaded ? (
              <div className="intel-empty">展开后按需读取 25 条单源详情，首屏不再预加载。</div>
            ) : null}
          </div>
        </details>
      ) : null}
      {snapshotStatus ? <div className="intel-message" role="status">快照生成：{new Date(snapshotStatus.generatedAt).toLocaleString("zh-CN")} · {(snapshotStatus.freshness.stale || clockNow - new Date(snapshotStatus.generatedAt).getTime() > 1800000) ? "数据已过期或时间异常，当前保留最近成功结果" : "快照有效"}</div> : null}
      {snapshotReadFailed ? <button type="button" disabled={busy} onClick={() => void loadSnapshot()}>读取失败，重试</button> : null}
      {message ? <div className="intel-message">{message}</div> : null}
      {busy ? <div className="intel-loading">正在读取 Event / Evidence / Coverage…</div> : null}

      {!busy ? (
        <>
        <section className="intel-stream">
          <div className="intel-stream-meta"><span>{categoryFilter}</span><span>近七日 {categoryCounts7d["全部"] ?? 0} 个事件 · 当前筛选 {visibleItems.length} 条（含已加载历史）</span></div>
          <div className="intel-timeline-feed">
            {dayGroups.length ? dayGroups.map(([day, dayItems]) => (
              <details className="intel-timeline-day" key={day} open={day === timelineWindow?.today}>
                <summary className="intel-timeline-date"><strong>{formatDay(dayStart(day).toISOString())}</strong><span>{dayItems.length} 条</span><em>展开 / 收起</em></summary>
                <div className="intel-timeline-items">
                  {dayItems.map((item) => (
                    <div className="intel-timeline-item" key={item.eventId}>
                      <time className="intel-timeline-time">{new Date(item.timelineAt || item.publishedAt || item.collectedAt).toLocaleTimeString("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hour12: false })}</time>
                      <div className="intel-timeline-rail" aria-hidden="true"><span /></div>
                      <article className="intel-timeline-card">
                        <div className="intel-timeline-card-head">
                          <div>
                            <span className="intel-timeline-meta">{item.sourceName} · {item.category} · {verificationLabel(item.verificationStatus)}</span>
                            <strong>{item.presentation?.displayTitleZh || item.title}</strong>
                          </div>
                          <div className="intel-timeline-badges">
                            <span>热度 {Math.round(item.topicMomentum.score)}</span>
                            {item.curation.curated ? <span className="is-featured">精选 {item.curation.score}</span> : null}
                          </div>
                        </div>
                        <p>{shortSummary(item)}</p>
                        {item.curation.curated && (item.presentation?.editorialJudgmentZh || item.curation.recommendationReason) ? <p className="intel-recommendation-reason"><b>推荐理由：</b>{item.presentation?.editorialJudgmentZh || item.curation.recommendationReason}</p> : null}
                        <div className="intel-timeline-facts">
                          <span>公开信源 {item.publicReadableSourceCount ?? item.evidenceLinks.length}</span>
                          <span>参与者 {item.topicMomentum.independentParticipantCount ?? item.topicMomentum.independentSourceCount}</span>
                          <span>{item.evidenceScore.status === "TRUSTED" ? "证据已验证" : "证据待验证"}</span>
                          <span>{item.topicMomentum.status === "SUSTAINED" ? "持续" : item.topicMomentum.status === "RISING" ? "升温" : "观察"}</span>
                        </div>
                        <details className="intel-story-detail">
                          <summary>事件详情 · 最新进展 / 综述 / 时间线 / 热度走势</summary>
                          <div className="intel-story-overview">
                            <div><b>事件概览</b><p>{item.story?.overview || shortSummary(item)}</p></div>
                            <div><b>最新进展</b><p>{item.story?.latest?.text || latestProgressText(item)}</p>{item.story?.latest ? <small>{item.story.latest.sourceName} · {formatDate(item.story.latest.publishedAt)} · {item.story.latest.authority === "PRIMARY" ? "一手来源" : item.story.latest.authority === "HIGH" ? "高权威媒体" : "信号"}</small> : null}</div>
                          </div>
                          <div className="intel-story-digest"><b>事件综述</b><p>{item.story?.digest.text || shortSummary(item)}</p><small>{item.story ? "确定性派生 · 非 AI 新事实" : "兼容旧快照 · 正在等待新 Story 快照"}</small></div>
                          {item.story?.latestReport ? <div className="intel-story-latest-report"><b>优先报道</b><a href={item.story.latestReport.originalUrl ?? undefined} target={item.story.latestReport.originalUrl ? "_blank" : undefined} rel={item.story.latestReport.originalUrl ? "noreferrer" : undefined}>{item.story.latestReport.sourceName} · {item.story.latestReport.titleZh || item.story.latestReport.title}</a></div> : null}
                          {item.story?.heatSeries.points.length ? <div className="intel-story-heat"><div><b>48 小时热度走势</b><small>6 小时步长 · 派生重放，不是持久化历史</small></div><div className="intel-story-heat-bars">{item.story.heatSeries.points.map((point) => { const max = Math.max(1, ...item.story!.heatSeries.points.map((value) => value.score)); return <span key={point.at} title={`${formatDate(point.at)} · 热度 ${point.score} · ${point.participantCount} 参与者`} style={{ height: `${Math.max(8, Math.round((point.score / max) * 48))}px` }} />; })}</div></div> : null}
                          {item.story?.developments.length ? <div className="intel-story-developments"><b>进展节点</b>{item.story.developments.slice(0, 6).map((development) => <a key={development.id} href={development.originalUrl ?? undefined} target={development.originalUrl ? "_blank" : undefined} rel={development.originalUrl ? "noreferrer" : undefined}><time>{formatDate(development.at)}</time><span>{development.title}</span></a>)}</div> : null}
                          {item.story?.reportTimeline.length ? <div className="intel-story-timeline"><b>报道时间线</b>{item.story.reportTimeline.slice(0, 20).map((report) => <a key={report.reportId} href={report.originalUrl ?? undefined} target={report.originalUrl ? "_blank" : undefined} rel={report.originalUrl ? "noreferrer" : undefined}><time>{formatDate(report.publishedAt)}</time><strong>{report.sourceName}</strong><span>{report.titleZh || report.title}</span></a>)}</div> : null}
                          {item.story?.relatedEvents.length ? <div className="intel-story-related"><b>相关事件</b><div>{item.story.relatedEvents.map((related) => <span key={related.eventId}>{related.title}</span>)}</div></div> : null}
                        </details>
                        <div className="intel-event-actions">
                          {item.originalUrl ? <a href={item.originalUrl} target="_blank" rel="noreferrer">原文 ↗</a> : null}
                          {qualityByEvent[item.eventId]?.eventLabel || qualityByEvent[item.eventId]?.sources.length ? <span>人工评价：{qualityByEvent[item.eventId]?.eventLabel === "POSITIVE" || qualityByEvent[item.eventId]?.sources.some(source => source.label === "POSITIVE") ? "已采用" : "已忽略"}</span> : null}
                          <button className="is-primary" disabled={actingId === item.eventId} onClick={() => void saveQuality(item.eventId, "POSITIVE", "")}>采用 · 记正向样本</button>
                          <button disabled={actingId === item.eventId} onClick={() => { setQualityEditingId(item.eventId); setQualityAction("NEGATIVE"); setQualitySourceId(""); setQualityReason(""); setQualityNote(""); }}>忽略 · 记负向样本</button>
                          {(qualityByEvent[item.eventId]?.sourceOptions.length ?? 0) > 1 ? <button disabled={actingId === item.eventId} onClick={() => { setQualityEditingId(item.eventId); setQualityAction("POSITIVE"); setQualitySourceId(""); }}>指定来源采用</button> : null}
                          {qualityByEvent[item.eventId]?.eventLabel || qualityByEvent[item.eventId]?.sources.length ? <button disabled={actingId === item.eventId} onClick={() => { setQualityEditingId(item.eventId); setQualityAction("CLEAR"); setQualitySourceId(qualityByEvent[item.eventId]?.sources[0]?.sourceId ?? ""); }}>撤销评价</button> : null}
                        </div>
                        {qualityEditingId === item.eventId ? <div className="intel-event-actions" aria-label="采集质量评价详情">
                          {(qualityByEvent[item.eventId]?.sourceOptions.length ?? 0) > 1 ? <select value={qualitySourceId} onChange={event => setQualitySourceId(event.target.value)} aria-label="评价归属来源"><option value="">仅评价这条动态</option>{qualityByEvent[item.eventId].sourceOptions.map(source => <option key={source.sourceId} value={source.sourceId}>{source.name}</option>)}</select> : null}
                          {qualityAction === "NEGATIVE" ? <><select value={qualityReason} onChange={event => setQualityReason(event.target.value as CollectionQualityReason | "")} aria-label="负向原因"><option value="">原因可选</option>{Object.entries(COLLECTION_QUALITY_REASON_NAMES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select><input value={qualityNote} onChange={event => setQualityNote(event.target.value)} maxLength={500} placeholder="备注（可选，最多500字）" aria-label="评价备注" /></> : null}
                          <button disabled={actingId === item.eventId} onClick={() => void saveQuality(item.eventId, qualityAction)}>{qualityAction === "CLEAR" ? "确认撤销" : qualityAction === "POSITIVE" ? "保存采用" : "保存忽略"}</button>
                          <button onClick={() => setQualityEditingId(null)}>取消</button>
                        </div> : null}
                      </article>
                    </div>
                  ))}
                </div>
              </details>
            )) : <div className="intel-empty">{trackingMode === "FEATURED" ? "当前没有符合精选门槛的 Event，可查看“全部动态”。" : "当前没有符合筛选条件的 Event。"}</div>}
            {trackingMode === "ALL" ? <div className="intel-load-more">{nextCursor ? <><button type="button" disabled={loadingMore} onClick={() => void loadMoreEvents()}>{loadingMore ? "正在加载…" : "加载更多"}</button><span>读取 {nextCursor} 全天（北京时间），每次一天</span></> : <span role="status">已经到底</span>}</div> : null}
          </div>
        </section>
        </>
      ) : null}
    </section>
  );
}
