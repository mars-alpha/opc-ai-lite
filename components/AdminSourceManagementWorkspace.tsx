"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COLLECTION_QUALITY_REASON_NAMES, type CollectionQualityReason } from "../lib/content/collection-quality-feedback-contract";

type SourceItem = {
  sourceId: string;
  name: string;
  group: string;
  registrationOrigin: "SYSTEM_BASELINE" | "OPERATOR_ADDED";
  sourceType: string;
  sourceRole: string;
  sourceCategory: string;
  evidenceRoles: string[];
  languageScope?: string;
  platform: string;
  collectionMethod: string;
  canonicalUrl: string | null;
  providerRef: string;
  priority: number;
  factualSource: boolean;
  signalSource: boolean;
  referenceOnly: boolean;
  discoveryRouteIds: string[];
  status: string;
  enabled: boolean;
  acquisition: {
    kind: string;
    costLevel?: string;
    runtimeOwner: string | null;
    serverRuntimeSupported: boolean;
    reason?: string | null;
    primaryRouteId: string;
    fallbackRouteCount: number;
    fallbackReason?: string | null;
    routes?: Array<{
      id: string;
      role: string;
      kind: string;
      runtimeOwner: string | null;
      costLevel: string;
      enabled: boolean;
      serverRuntimeSupported: boolean;
      health: string;
      lastSuccessAt: string | null;
      lastErrorCode: string | null;
      fallbackReason: string | null;
    }>;
  };
  qualification?: string;
  effectiveQualification: string;
  qualificationReasons?: string[];
  evidenceSufficiency?: "MATURE" | "EARLY" | "INSUFFICIENT";
  governance?: {
    plan: "KEEP_CADENCE" | "REDUCE_CADENCE" | "PAUSE_AUTO_REVIEW" | "DISABLE_REVIEW_REQUIRED";
    runtimeHealth: "HEALTHY" | "DEGRADED" | "FAILED" | "UNKNOWN";
    recommendedIntervalMultiplier: 1 | 2 | 4 | null;
    action: "RUN_WHEN_DUE" | "WAIT_UNTIL_DUE" | "HUMAN_REVIEW_REQUIRED" | "BLOCKED_INVALID_INPUT";
    baseIntervalMinutes: number;
    effectiveIntervalMinutes: number | null;
    nextDueAt: string | null;
    due: boolean;
    humanReviewRequired: boolean;
    reasons: string[];
  } | null;
  health: "MISSING" | "FAILED" | "RUNNING" | "HEALTHY" | "READY" | "DISABLED";
  lastCollectedAt?: string | null;
  latestRun?: {
    status: string;
    startedAt: string;
    finishedAt: string | null;
    receivedCount: number;
    createdCount: number;
    duplicateCount: number;
    errorCode: string | null;
  } | null;
  recent?: {
    runCount: number;
    successRate: number | null;
    lastSuccessAt: string | null;
  };
};

type Payload = {
  summary: {
    sourceCount: number;
    radarSourceCount: number;
    operatorAddedSourceCount: number;
    healthyCount: number;
    attentionCount: number;
    autoReadyCount: number;
    conditionalCount: number;
  };
  items: SourceItem[];
  optionalCapabilities: Array<{
    key: string;
    name: string;
    status: string;
    reason: string;
  }>;
  platformCapabilities: Array<{
    platform: string; label: string; region: "DOMESTIC" | "OVERSEAS"; discoveryOwner: string; creatorRoute: string;
    defaultMode: string; freeAccess: string; schedulePolicy: string;
    status: "ACTIVE" | "CONDITIONAL"; runtimeState: "SUPPORTED" | "QUALIFIED" | "ACTIVE" | "BLOCKED"; reason: string;
    sourceCount: number; supportedSourceCount: number; qualifiedSourceCount: number; activeSourceCount: number; discoveryRouteIds: string[];
    productionPath: "DIRECT_SOURCE" | "AGGREGATED_ROUTE" | "NONE"; backingSourceIds: string[]; aggregatorRoute: string | null;
  }>;
  discoveryRoutes: Array<{
    id: string; label: string; purpose: string; authority: string;
    sourceCount: number; activeSourceCount: number; platformCount: number; sourceIds: string[];
    status: "ACTIVE" | "CONDITIONAL" | "EMPTY";
  }>;
  aggregators: {
    dailyHot: { sourceId: string; label: string; keepRoutes: Array<{ route: string; platform: string; role: string }>; excludedRoutes: Array<{ route: string; reason: string }> };
    aiHot: { sourceId: string; label: string; role: string };
    hackerNews: { sourceId: string; label: string; role: string };
    github: { sourceId: string; label: string; role: string };
    productHunt: { sourceId: string; label: string; role: string };
  };
  apiQuota: {
    YOUTUBE: {
      day: string;
      limit: number;
      used: number;
      remaining: number;
      remainingRatio: number;
      action: "NORMAL" | "REDUCE" | "CONSERVE" | "PAUSE_EXPENSIVE_API";
      effectiveIntervalMinutes: number | null;
      preferFeedFallback: boolean;
    };
  };
};

type PolicyPayload = {
  version: string;
  terms: Array<{ id: string; value: string; kind: "INCLUDE" | "EXCLUDE" }>;
  updatedAt: string | null;
};

type SourceDetailPayload = {
  item: SourceItem;
  utility: {
    facts: {
      runCount: number;
      receivedCount: number;
      keptCount: number;
      keepRatio: number;
      duplicateRatio: number;
      noiseDropRatio: number;
      independentEventContributionCount: number;
      lastNewItemAt: string | null;
    };
    decision: {
      recommendation: string;
      reasons: string[];
      coverageCritical: boolean;
      coverageRiskReasons: string[];
    };
  };
};

type OnboardingCandidate = {
  canonicalUrl: string;
  name: string;
  platform: string;
  objectType: string;
  kind: "WEBSITE" | "CREATOR";
  acquisition: string;
  acquisitionUrl: string | null;
  check: { passed: boolean; reason: string; sampleCount: number };
  samples: Array<{ title: string; url: string; publishedAt: string | null }>;
};

function dateLabel(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function qualificationLabel(value: string) {
  if (value === "AUTO_READY") return "自动可用";
  if (value === "MANUAL_ONLY") return "仅人工";
  if (value === "DISABLED") return "已停用";
  return "待资格";
}

function healthLabel(value: SourceItem["health"]) {
  if (value === "HEALTHY") return "正常";
  if (value === "FAILED") return "失败";
  if (value === "RUNNING") return "运行中";
  if (value === "MISSING") return "未注册";
  if (value === "DISABLED") return "已停用";
  return "待运行";
}

function evidenceSufficiencyLabel(value: SourceItem["evidenceSufficiency"]) {
  if (value === "MATURE") return "成熟";
  if (value === "EARLY") return "早期";
  return "不足";
}

function governanceLabel(value: NonNullable<SourceItem["governance"]>["plan"]) {
  if (value === "KEEP_CADENCE") return "保持频率";
  if (value === "REDUCE_CADENCE") return "降低频率";
  if (value === "PAUSE_AUTO_REVIEW") return "暂停待审核";
  return "建议停用";
}

function executionActionLabel(value: NonNullable<SourceItem["governance"]>["action"]) {
  if (value === "RUN_WHEN_DUE") return "到期运行";
  if (value === "WAIT_UNTIL_DUE") return "等待到期";
  if (value === "HUMAN_REVIEW_REQUIRED") return "需要人工审核";
  return "输入异常，已阻断";
}

function routeHealthLabel(value: string) {
  if (value === "HEALTHY") return "正常";
  if (value === "FAILED") return "失败";
  if (value === "DEGRADED") return "降级";
  if (value === "DISABLED") return "停用";
  if (value === "RUNTIME_REQUIRED") return "需要运行时";
  return "待运行";
}

function roleLabel(value: string) {
  const labels: Record<string, string> = {
    OFFICIAL: "官方",
    PROFESSIONAL_MEDIA: "专业媒体",
    RESEARCH: "研究",
    CREATOR: "创作者",
    DEVELOPER_COMMUNITY: "开发者社区",
    DISCOVERY_AGGREGATOR: "发现聚合",
    SOCIAL: "社交"
  };
  return labels[value] ?? value;
}

function discoveryCoverageLabel(value: "ACTIVE" | "CONDITIONAL" | "EMPTY") {
  if (value === "ACTIVE") return "充足";
  if (value === "CONDITIONAL") return "观察";
  return "缺口";
}

function platformRuntimeLabel(value: "SUPPORTED" | "QUALIFIED" | "ACTIVE" | "BLOCKED") {
  if (value === "ACTIVE") return "生产中";
  if (value === "QUALIFIED") return "已资格";
  if (value === "SUPPORTED") return "可接入，未生产";
  return "未接入";
}

function unifiedSourceState(item: SourceItem) {
  if (!item.enabled || item.health === "DISABLED" || item.effectiveQualification === "DISABLED") return "DISABLED";
  if (item.health === "FAILED") return "FAILED";
  if (item.effectiveQualification === "CONDITIONAL") return "CONDITIONAL";
  if (item.health === "READY") return "READY";
  if (item.effectiveQualification === "AUTO_READY" && item.health === "HEALTHY") return "AUTO_READY";
  return "OTHER";
}

function acquisitionLabel(value: string) {
  const labels: Record<string, string> = {
    RSS_ATOM: "RSS / Atom",
    SITEMAP: "Sitemap",
    PUBLIC_JSON_API: "公开 API / JSON",
    TREND_DISCOVERY: "趋势发现",
    GENERATED_FEED: "生成 Feed",
    CUSTOM_RUNTIME: "专用 Adapter"
  };
  return labels[value] ?? value;
}

async function loadJson<T = Payload>(suffix = "") {
  const response = await fetch("/api/admin/content/source-management" + suffix, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "来源管理读取失败");
  return data as T;
}

async function postAction(body: Record<string, unknown>) {
  const response = await fetch("/api/admin/content/source-management", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "来源操作失败");
  return data as Record<string, any>;
}

export function AdminSourceManagementWorkspace() {
  const sourceReadEpoch = useRef(0);
  const lastSourceRequestAt = useRef(0);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [discoveryRoute, setDiscoveryRoute] = useState("ALL");
  const [sourceState, setSourceState] = useState("ALL");
  const [language, setLanguage] = useState("ALL");
  const [routeKind, setRouteKind] = useState("ALL");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SourceDetailPayload | null>(null);
  const [qualitySummary, setQualitySummary] = useState<{ evaluatedCount: number; negativeCount: number; reasons: Record<string, number>; samples: Array<{ id: number; eventId: string; reason: string | null; note: string | null; at: string; context: { title?: string } }> } | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [policy, setPolicy] = useState<PolicyPayload | null>(null);
  const [policyBusy, setPolicyBusy] = useState(false);
  const [newIncludeValue, setNewIncludeValue] = useState("");
  const [newExcludeValue, setNewExcludeValue] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addKind, setAddKind] = useState<"WEBSITE" | "CREATOR">("WEBSITE");
  const [candidate, setCandidate] = useState<OnboardingCandidate | null>(null);
  const [duplicate, setDuplicate] = useState<Record<string, unknown> | null>(null);
  const [registeredSourceId, setRegisteredSourceId] = useState<string | null>(null);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [managementMode, setManagementMode] = useState<"SOURCES" | "ADD" | "POLICY">("SOURCES");

  async function refresh() {
    const epoch = ++sourceReadEpoch.current;
    lastSourceRequestAt.current = Date.now();
    const payload = await loadJson<Payload>();
    if (epoch === sourceReadEpoch.current) setData(payload);
  }

  async function loadDetail(sourceId: string) {
    setSelectedSourceId(sourceId);
    setDetailBusy(true);
    setDetail(null);
    setQualitySummary(null);
    try {
      const [sourceDetail, feedbackResponse] = await Promise.all([
        loadJson<SourceDetailPayload>("?mode=detail&sourceId=" + encodeURIComponent(sourceId)),
        fetch("/api/admin/content/quality-feedback?sourceId=" + encodeURIComponent(sourceId), { cache: "no-store" })
      ]);
      setDetail(sourceDetail);
      if (feedbackResponse.ok) setQualitySummary(await feedbackResponse.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "来源详情读取失败");
    } finally {
      setDetailBusy(false);
    }
  }

  async function ensurePolicy() {
    if (policy) return policy;
    const loaded = await loadJson<PolicyPayload>("?mode=policy");
    setPolicy(loaded);
    return loaded;
  }

  async function persistPolicy(terms: PolicyPayload["terms"], successMessage: string) {
    setPolicyBusy(true);
    try {
      const saved = await postAction({ action: "SAVE_AI_POLICY", terms }) as unknown as PolicyPayload;
      setPolicy(saved);
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "规则保存失败");
    } finally {
      setPolicyBusy(false);
    }
  }

  async function addPolicyTerm(kind: PolicyPayload["terms"][number]["kind"]) {
    const value = (kind === "INCLUDE" ? newIncludeValue : newExcludeValue).trim();
    if (!value || !policy) return;
    const duplicate = policy.terms.some((item) => item.kind === kind && item.value.toLowerCase() === value.toLowerCase());
    if (duplicate) {
      setMessage(kind === "INCLUDE" ? "这个新增词已经存在。" : "这个排除词已经存在。");
      return;
    }
    const terms = [...policy.terms, { id: "custom-" + Date.now(), value, kind }];
    if (kind === "INCLUDE") setNewIncludeValue("");
    else setNewExcludeValue("");
    await persistPolicy(terms, kind === "INCLUDE" ? "新增词已加入并立即启用。" : "排除词已加入并立即启用。");
  }

  async function deletePolicyTerm(termId: string) {
    if (!policy) return;
    const terms = policy.terms.filter((item) => item.id !== termId);
    if (!terms.some((item) => item.kind === "INCLUDE")) {
      setMessage("至少需要保留 1 个新增词。");
      return;
    }
    await persistPolicy(terms, "规则词已删除。");
  }

  async function onboarding(action: "DISCOVER" | "PREVIEW" | "REGISTER" | "QUALIFY" | "COLLECT") {
    setOnboardingBusy(true);
    setMessage(null);
    try {
      const result = await postAction(
        action === "QUALIFY" || action === "COLLECT"
          ? { action, sourceId: registeredSourceId }
          : { action, url: addUrl, kind: addKind }
      );
      if (action === "DISCOVER") {
        setCandidate(result as unknown as OnboardingCandidate);
        setDuplicate(null);
        setRegisteredSourceId(null);
      } else if (action === "PREVIEW") {
        setCandidate(result.candidate as OnboardingCandidate);
        setDuplicate((result.duplicate as Record<string, unknown> | null) ?? null);
      } else if (action === "REGISTER") {
        const item = result.item as { id: string };
        setRegisteredSourceId(item.id);
        setMessage("已注册到来源管理，下一步执行资格验证。");
        await refresh();
      } else if (action === "QUALIFY") {
        setMessage("资格验证完成；已记录真实 Check / Probe 证据。");
        await refresh();
      } else {
        setMessage("SYSTEM Collection 已完成，本来源已进入统一采集链路。");
        await refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "来源操作失败");
    } finally {
      setOnboardingBusy(false);
    }
  }

  async function manageSource(source: SourceItem, action: "DISABLE_SOURCE" | "ENABLE_SOURCE" | "ARCHIVE_SOURCE" | "RESTORE_SOURCE") {
    setMessage(null);
    try {
      await postAction({ action, sourceId: source.sourceId });
      setSelectedSourceId(null);
      setDetail(null);
      setMessage(
        action === "DISABLE_SOURCE" ? "来源已停用，历史 Run / Evidence 保留。" :
        action === "RESTORE_SOURCE" ? "来源已恢复为停用，请重新检查资格后启用。" :
        action === "ENABLE_SOURCE" ? "来源已启用，按现有资格和调度条件运行。" :
        "管理员新增来源已归档，历史 Run / Evidence 保留。"
      );
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "来源状态更新失败");
    }
  }

  useEffect(() => {
    const started = performance.now();
    void refresh()
      .then(() => {
        console.info("[SOURCE_MANAGEMENT_INDEX_MS]", Math.round(performance.now() - started));
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "来源管理读取失败"))
      .finally(() => setLoading(false));
    const refreshIfVisible = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastSourceRequestAt.current < 60_000) return;
      void refresh().catch(() => {});
    };
    const timer = window.setInterval(refreshIfVisible, 5 * 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, []);

  useEffect(() => {
    void ensurePolicy().catch((error) =>
      setMessage(error instanceof Error ? error.message : "规则读取失败")
    );
  }, []);

  const routeKinds = useMemo(
    () => [...new Set((data?.items ?? []).map((item) => item.acquisition.kind))].sort(),
    [data]
  );

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.items ?? []).filter((item) =>
      (!normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.platform.toLowerCase().includes(normalized) ||
        item.providerRef.toLowerCase().includes(normalized) ||
        item.canonicalUrl?.toLowerCase().includes(normalized)) &&
      (discoveryRoute === "ALL" || item.discoveryRouteIds.includes(discoveryRoute)) &&
      (sourceState === "ALL" || unifiedSourceState(item) === sourceState) &&
      (language === "ALL" || item.languageScope === language || item.languageScope === "MIXED") &&
      (routeKind === "ALL" || item.acquisition.kind === routeKind)
    );
  }, [data, discoveryRoute, language, query, routeKind, sourceState]);

  function renderOverview() {
    return (
      <div className="source-summary-grid">
        <article><span>当前来源</span><strong>{data?.summary.sourceCount ?? 0}</strong><small>系统 {data?.summary.radarSourceCount ?? 0} · 新增 {data?.summary.operatorAddedSourceCount ?? 0}</small></article>
        <article><span>稳定自动</span><strong>{data?.summary.autoReadyCount ?? 0}</strong><small>成熟运行证据</small></article>
        <article><span>观察中</span><strong>{data?.summary.conditionalCount ?? 0}</strong><small>新来源 / 证据未成熟</small></article>
        <article><span>需处理 / 停用</span><strong>{data?.summary.attentionCount ?? 0}</strong><small>不进入自动调度</small></article>
      </div>
    );
  }

  function renderDiscoveryPanel() {
    if (!data) return null;
    const discoveryChannels = data.discoveryRoutes;
    return (
      <aside className="source-discovery-column">
        <header className="source-column-head">
          <div><span>发现覆盖</span><strong>发现渠道</strong></div>
          <small>{discoveryChannels.length} 个渠道 · 点击查看对应来源</small>
        </header>
        <div className="source-discovery-flow">
          {discoveryChannels.map((channel) => {
            const channelSources = data.items.filter((item) => item.discoveryRouteIds.includes(channel.id));
            const active = discoveryRoute === channel.id;
            return (
              <button
                type="button"
                className={"source-discovery-flow-row " + (active ? "is-active" : "")}
                key={channel.id}
                onClick={() => setDiscoveryRoute(active ? "ALL" : channel.id)}
              >
                <div>
                  <strong>{channel.label}</strong>
                  <span>{channel.purpose} · {channel.activeSourceCount}/{channel.sourceCount} 可用来源</span>
                  <span>已有来源：{channelSources.map((item) => item.name).join("、") || "暂无"}</span>
                </div>
                <b>{discoveryCoverageLabel(channel.status)}</b>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  function renderSources() {
    if (!data) return null;
    return (
      <section className="source-management-column">
        <header className="source-column-head source-management-head">
          <div>
            <span>来源管理</span>
            <div className="source-management-title-row">
              <strong>{managementMode === "SOURCES" ? "来源目录" : managementMode === "ADD" ? "新增来源" : "筛选规则"}</strong>
              {managementMode === "SOURCES" ? <small>{visible.length} / {data.summary.sourceCount}</small> : null}
            </div>
          </div>
          <div className="source-management-actions">
            <div className="source-mode-switch">
              <button type="button" className={managementMode === "SOURCES" ? "is-active" : ""} onClick={() => setManagementMode("SOURCES")}>来源目录</button>
              <button type="button" className={managementMode === "ADD" ? "is-active" : ""} onClick={() => setManagementMode("ADD")}>新增来源</button>
              <button type="button" className={managementMode === "POLICY" ? "is-active" : ""} onClick={() => setManagementMode("POLICY")}>筛选规则</button>
            </div>
          </div>
        </header>
        <div className="source-management-body">
          {managementMode === "SOURCES" ? (
            <div className="source-source-directory">
              <div className="source-filter-toolbar">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索来源、平台、URL…" />
                <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                  <option value="ALL">全部语言</option><option value="ZH">中文</option><option value="EN">英文</option>
                </select>
                <select value={sourceState} onChange={(event) => setSourceState(event.target.value)}>
                  <option value="ALL">全部状态</option><option value="AUTO_READY">稳定自动</option><option value="CONDITIONAL">观察中</option><option value="READY">待运行</option><option value="FAILED">失败</option><option value="DISABLED">已停用</option>
                </select>
                <select value={routeKind} onChange={(event) => setRouteKind(event.target.value)}>
                  <option value="ALL">全部采集方式</option>
                  {routeKinds.map((item) => <option value={item} key={item}>{acquisitionLabel(item)}</option>)}
                </select>
              </div>
              <div className="source-learning-queue-list source-management-source-list">
                {visible.map((item) => (
                  <div key={item.sourceId}>
                    <button
                      type="button"
                      className={"source-learning-row " + (selectedSourceId === item.sourceId ? "is-active " : "") + (item.health === "FAILED" ? "is-alert" : "")}
                      onClick={() => void loadDetail(item.sourceId)}
                    >
                      <div className="source-learning-row-top">
                        <strong>{item.name}</strong>
                        <span>{qualificationLabel(item.effectiveQualification)}</span>
                      </div>
                      <div className="source-learning-row-main">
                        <span>{acquisitionLabel(item.acquisition.kind)}</span>
                        <span className={"source-health health-" + item.health.toLowerCase()}><i />{healthLabel(item.health)}</span>
                      </div>
                      <small>{item.platform} · {item.sourceCategory} · {item.discoveryRouteIds.map((routeId) => data.discoveryRoutes.find((route) => route.id === routeId)?.label ?? routeId).join(" / ")} · {dateLabel(item.lastCollectedAt ?? null)}</small>
                    </button>
                    {selectedSourceId === item.sourceId ? renderSourceDetail(item) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="source-tool-workspace">
              {managementMode === "ADD" ? renderAddSource() : renderPolicy()}
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderSourceDetail(item: SourceItem) {
    if (!data) return null;
    if (detailBusy) return <div className="source-detail source-lazy-detail"><div className="source-detail-wide"><span>运行详情</span><strong>正在按需读取…</strong></div></div>;
    if (!detail || detail.item.sourceId !== item.sourceId) return null;
    return (
      <div className="source-detail source-lazy-detail">
        <div><span>平台</span><strong>{item.platform}</strong></div>
        <div><span>平台接入</span><strong>{platformRuntimeLabel(data.platformCapabilities.find((entry) => entry.platform === item.platform)?.runtimeState ?? "BLOCKED")}</strong></div>
        <div><span>最近运行</span><strong>{detail.item.latestRun?.status ?? "—"} · 成功率 {detail.item.recent?.successRate ?? "—"}%</strong></div>
        <div><span>证据成熟度</span><strong>{evidenceSufficiencyLabel(detail.item.evidenceSufficiency)}</strong></div>
        <div><span>治理决策</span><strong>{detail.item.governance ? governanceLabel(detail.item.governance.plan) : "待评估"}</strong></div>
        <div><span>有效频率</span><strong>{detail.item.governance?.effectiveIntervalMinutes ? detail.item.governance.effectiveIntervalMinutes + " 分钟" : "—"}</strong></div>
        <div><span>14天 Run</span><strong>{detail.utility.facts.runCount}</strong></div>
        <div><span>保留率</span><strong>{Math.round(detail.utility.facts.keepRatio * 100)}%</strong></div>
        <div><span>重复率</span><strong>{Math.round(detail.utility.facts.duplicateRatio * 100)}%</strong></div>
        <div><span>独立 Event 贡献</span><strong>{detail.utility.facts.independentEventContributionCount}</strong></div>
        <div><span>近30日人工评价</span><strong>{qualitySummary?.evaluatedCount ?? "—"} 条（仅已评价样本）</strong></div>
        <div><span>其中负向</span><strong>{qualitySummary?.negativeCount ?? "—"} 条</strong></div>
        {qualitySummary ? <div className="source-detail-wide"><span>主要问题</span><strong>{Object.entries(qualitySummary.reasons).sort((a,b) => b[1] - a[1]).map(([reason, count]) => `${COLLECTION_QUALITY_REASON_NAMES[reason as CollectionQualityReason] ?? reason} ${count}`).join(" · ") || "暂无负向原因"}</strong></div> : null}
        {qualitySummary?.samples.length ? <details className="source-detail-wide"><summary>查看负向样本（最近 {qualitySummary.samples.length} 条）</summary>{qualitySummary.samples.map(sample => <div key={sample.id}><strong>{sample.context?.title || sample.eventId}</strong><span>{sample.reason ? COLLECTION_QUALITY_REASON_NAMES[sample.reason as CollectionQualityReason] ?? sample.reason : "未选择原因"} · {new Date(sample.at).toLocaleString("zh-CN")} {sample.note || ""}</span></div>)}</details> : null}
        {item.sourceId === data.aggregators.dailyHot.sourceId ? (
          <div className="source-detail-wide"><span>启用 Route</span><strong>{data.aggregators.dailyHot.keepRoutes.map((route) => route.platform).join(" · ") || "—"}</strong></div>
        ) : null}
        <div className="source-detail-wide source-action-row">
          <button type="button" onClick={() => void manageSource(item, item.status === "ARCHIVED" ? "RESTORE_SOURCE" : item.enabled ? "DISABLE_SOURCE" : "ENABLE_SOURCE")}>
            {item.status === "ARCHIVED" ? "恢复归档来源" : item.enabled ? "停用来源" : "启用来源"}
          </button>
          {item.registrationOrigin === "OPERATOR_ADDED" && item.status !== "ARCHIVED" ? (
            <button type="button" onClick={() => void manageSource(item, "ARCHIVE_SOURCE")}>归档来源</button>
          ) : null}
        </div>
        <div className="source-detail-wide"><span>资格缺口</span><strong>{detail.item.qualificationReasons?.join(" · ") || "已满足"}</strong></div>
      </div>
    );
  }

  function renderPolicy() {
    const includeTerms = policy?.terms.filter((item) => item.kind === "INCLUDE") ?? [];
    const excludeTerms = policy?.terms.filter((item) => item.kind === "EXCLUDE") ?? [];
    return (
      <section className="source-workbench-block source-rule-board">
          <header className="source-workbench-block-head"><div><strong>筛选规则</strong></div><small>{policy?.terms.length ?? 0} 条 · 加入即启用</small></header>
          {!policy ? <div className="source-loading">正在读取规则…</div> : (
            <div className="source-rule-columns">
              <section className="source-rule-column">
                <header><strong>新增词</strong><span>{includeTerms.length} 个</span></header>
                <div className="source-rule-add">
                  <input value={newIncludeValue} onChange={(event) => setNewIncludeValue(event.target.value)} placeholder="例如：Sora、AI Agent、生成式搜索" />
                  <button type="button" disabled={policyBusy || !newIncludeValue.trim()} onClick={() => void addPolicyTerm("INCLUDE")}>加入新增词</button>
                </div>
                <div className="source-term-list">
                  {includeTerms.map((term) => (
                    <div key={term.id}><strong>{term.value}</strong><button type="button" disabled={policyBusy} onClick={() => void deletePolicyTerm(term.id)}>删除</button></div>
                  ))}
                </div>
              </section>
              <section className="source-rule-column">
                <header><strong>排除词</strong><span>{excludeTerms.length} 个</span></header>
                <div className="source-rule-add">
                  <input value={newExcludeValue} onChange={(event) => setNewExcludeValue(event.target.value)} placeholder="例如：Air（避免非 AI 内容误命中）" />
                  <button type="button" disabled={policyBusy || !newExcludeValue.trim()} onClick={() => void addPolicyTerm("EXCLUDE")}>加入排除词</button>
                </div>
                <div className="source-term-list">
                  {excludeTerms.map((term) => (
                    <div key={term.id}><strong>{term.value}</strong><button type="button" disabled={policyBusy} onClick={() => void deletePolicyTerm(term.id)}>删除</button></div>
                  ))}
                  {!excludeTerms.length ? <p>暂无排除词。</p> : null}
                </div>
              </section>
            </div>
          )}
      </section>
    );
  }

  function renderAddSource() {
    return (
      <section className="source-workbench-block">
        <header className="source-workbench-block-head">
          <div><strong>新增来源</strong></div>
          <small>先检测，再允许加入</small>
        </header>
        <div className="source-add-workbench">
          <select value={addKind} onChange={(event) => setAddKind(event.target.value as "WEBSITE" | "CREATOR")}>
            <option value="WEBSITE">网站 / Feed</option>
            <option value="CREATOR">Creator / 账号</option>
          </select>
          <input value={addUrl} onChange={(event) => setAddUrl(event.target.value)} placeholder="输入网站、Feed 或 Creator 主页 URL" />
          <button className="source-btn source-btn-primary" type="button" disabled={onboardingBusy || !addUrl.trim()} onClick={() => void onboarding("DISCOVER")}>
            {onboardingBusy ? "检测中…" : "检测来源"}
          </button>
        </div>
        {candidate ? (
          <div className="source-candidate-card">
            <div><span>识别对象</span><strong>{candidate.name} · {candidate.platform}</strong></div>
            <div><span>采集方式</span><strong>{candidate.acquisition}</strong></div>
            <div><span>实时检测</span><strong>{candidate.check.passed ? "可采集" : "不可加入"} · {candidate.check.reason}</strong></div>
            <div><span>样本</span><strong>{candidate.check.sampleCount || "—"}</strong></div>
            <div className="source-candidate-wide"><span>实际采集地址</span><strong>{candidate.acquisitionUrl ?? "未找到当前可运行的免费 / 低维护路径"}</strong></div>
            <div className="source-candidate-wide source-action-row">
              <button className="source-btn" type="button" disabled={onboardingBusy} onClick={() => void onboarding("PREVIEW")}>查看预览</button>
              <button className="source-btn source-btn-primary" type="button" disabled={onboardingBusy || !candidate.check.passed || Boolean(duplicate) || Boolean(registeredSourceId)} onClick={() => void onboarding("REGISTER")}>加入信息源</button>
              <button className="source-btn" type="button" disabled={onboardingBusy || !registeredSourceId} onClick={() => void onboarding("QUALIFY")}>验证资格</button>
            </div>
            {duplicate ? <div className="source-candidate-wide"><span>重复来源</span><strong>已存在，不重复注册：{String(duplicate.name ?? duplicate.sourceId)}</strong></div> : null}
          </div>
        ) : null}
      </section>
    );
  }

  if (loading) return <div className="source-loading">正在读取来源索引…</div>;
  if (!data) return <div className="source-loading">{message ?? "来源管理读取失败"}</div>;

  return (
    <section className="source-workspace">
      {message ? <div className="source-message">{message}</div> : null}
      {renderOverview()}
      <div className="source-governance-grid">
        {renderDiscoveryPanel()}
        {renderSources()}
      </div>
    </section>
  );
}
