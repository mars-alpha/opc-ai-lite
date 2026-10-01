"use client";

import { useEffect, useMemo, useState } from "react";

type AiMode = "NONE" | "SYSTEM_DEFAULT" | "CUSTOM";

type CollectionStrategy = {
  id: string;
  name: string;
  description: string | null;
  aiMode: AiMode;
  modelRef: string | null;
  topics: string[];
  competitorAccounts: string[];
  collectComments: boolean;
  filters: {
    minLikes?: number | null;
    minComments?: number | null;
    minFavorites?: number | null;
    minViews?: number | null;
    minFollowers?: number | null;
    minPlayFollowerRatio?: number | null;
  };
  advancedConfig: {
    windowHours?: number;
    languagePolicy?: string;
    updateFrequency?: string;
  };
  status: string;
  enabled: boolean;
  testStatus: string;
  testResult: Record<string, unknown>;
  lastTestedAt: string | null;
  updatedAt: string;
};

type StrategyForm = {
  id: string;
  name: string;
  aiMode: AiMode;
  modelRef: string;
  description: string;
  topics: string;
  competitorAccounts: string;
  collectComments: boolean;
  minLikes: string;
  minComments: string;
  minFavorites: string;
  minViews: string;
  minFollowers: string;
  minPlayFollowerRatio: string;
  windowHours: number;
  languagePolicy: "ZH_PREFERRED" | "ZH_EN" | "ANY";
  updateFrequency: "SYSTEM_DEFAULT" | "HOURLY" | "THREE_HOURLY" | "DAILY" | "MANUAL";
};

const EMPTY_FORM: StrategyForm = {
  id: "",
  name: "",
  aiMode: "NONE",
  modelRef: "",
  description: "",
  topics: "",
  competitorAccounts: "",
  collectComments: false,
  minLikes: "",
  minComments: "",
  minFavorites: "",
  minViews: "",
  minFollowers: "",
  minPlayFollowerRatio: "",
  windowHours: 72,
  languagePolicy: "ZH_EN",
  updateFrequency: "SYSTEM_DEFAULT"
};

function parseTags(value: string) {
  return value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean);
}

function parseLines(value: string) {
  return value.split(/\r?\n|[,，]/).map((item) => item.trim()).filter(Boolean);
}

function formatDate(value: string | null) {
  if (!value) return "尚未测试";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function testStatusLabel(value: string) {
  if (value === "PASSED") return "测试通过";
  if (value === "PARTIAL") return "部分可用";
  if (value === "FAILED") return "测试失败";
  return "尚未测试";
}

function toForm(item: CollectionStrategy): StrategyForm {
  return {
    id: item.id,
    name: item.name ?? "",
    aiMode: item.aiMode ?? "NONE",
    modelRef: item.modelRef ?? "",
    description: item.description ?? "",
    topics: (item.topics ?? []).join("，"),
    competitorAccounts: (item.competitorAccounts ?? []).join("\n"),
    collectComments: item.collectComments === true,
    minLikes: item.filters?.minLikes?.toString() ?? "",
    minComments: item.filters?.minComments?.toString() ?? "",
    minFavorites: item.filters?.minFavorites?.toString() ?? "",
    minViews: item.filters?.minViews?.toString() ?? "",
    minFollowers: item.filters?.minFollowers?.toString() ?? "",
    minPlayFollowerRatio: item.filters?.minPlayFollowerRatio?.toString() ?? "",
    windowHours: item.advancedConfig?.windowHours ?? 72,
    languagePolicy: (item.advancedConfig?.languagePolicy as StrategyForm["languagePolicy"]) ?? "ZH_EN",
    updateFrequency: (item.advancedConfig?.updateFrequency as StrategyForm["updateFrequency"]) ?? "SYSTEM_DEFAULT"
  };
}

export function AdminCollectionStrategyPanel() {
  const [strategies, setStrategies] = useState<CollectionStrategy[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<StrategyForm>(EMPTY_FORM);
  const [newTopic, setNewTopic] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => strategies.find((item) => item.id === selectedId) ?? null,
    [strategies, selectedId]
  );

  async function readJson(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "操作失败");
    return data;
  }

  async function loadStrategies(preferredId?: string) {
    const data = await readJson(
      await fetch("/api/admin/content/discovery/strategies", { cache: "no-store" })
    );
    const items = (data.items ?? []) as CollectionStrategy[];
    setStrategies(items);
    const nextId =
      preferredId && items.some((item) => item.id === preferredId)
        ? preferredId
        : selectedId && items.some((item) => item.id === selectedId)
          ? selectedId
          : "";
    setSelectedId(nextId);
  }

  useEffect(() => {
    loadStrategies().catch((error) =>
      setMessage(error instanceof Error ? error.message : "采集策略读取失败")
    );
  }, []);

  function editStrategy(item: CollectionStrategy) {
    setSelectedId(item.id);
    setForm(toForm(item));
    setNewTopic("");
    setMessage(null);
  }

  function resetForm() {
    setSelectedId("");
    setForm(EMPTY_FORM);
    setNewTopic("");
    setMessage(null);
  }

  function addTopic() {
    if (!newTopic.trim()) return;
    const next = [...new Set([...parseTags(form.topics), newTopic.trim()])];
    setForm((current) => ({ ...current, topics: next.join("，") }));
    setNewTopic("");
  }

  function removeTopic(tag: string) {
    setForm((current) => ({
      ...current,
      topics: parseTags(current.topics).filter((item) => item !== tag).join("，")
    }));
  }

  async function saveAndTest() {
    if (!form.name.trim()) {
      setMessage("请先填写采集策略名称，用于保存到已配置策略列表。");
      return;
    }
    if (form.aiMode !== "NONE" && !form.description.trim()) {
      setMessage("选择 AI 模型后，请先写清楚要持续采集什么。");
      return;
    }
    if (
      form.aiMode === "NONE" &&
      parseTags(form.topics).length === 0 &&
      parseLines(form.competitorAccounts).length === 0
    ) {
      setMessage("不使用 AI 时，请至少填写标签关键词或竞品主页。");
      return;
    }
    if (form.aiMode === "CUSTOM" && !form.modelRef.trim()) {
      setMessage("请选择或填写要使用的模型。");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const data = await readJson(
        await fetch("/api/admin/content/discovery/strategies", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: form.id || undefined,
            name: form.name.trim(),
            aiMode: form.aiMode,
            modelRef: form.aiMode === "CUSTOM" ? form.modelRef.trim() : null,
            description: form.aiMode === "NONE" ? null : form.description.trim(),
            topics: parseTags(form.topics),
            competitorAccounts: parseLines(form.competitorAccounts),
            collectComments: form.collectComments,
            filters: {
              minLikes: form.minLikes || null,
              minComments: form.minComments || null,
              minFavorites: form.minFavorites || null,
              minViews: form.minViews || null,
              minFollowers: form.minFollowers || null,
              minPlayFollowerRatio: form.minPlayFollowerRatio || null
            },
            advancedConfig: {
              windowHours: form.windowHours,
              languagePolicy: form.languagePolicy,
              updateFrequency: form.updateFrequency
            },
            enabled: true,
            test: true
          })
        })
      );
      const item = data.item as CollectionStrategy;
      await loadStrategies(item.id);
      setForm(toForm(item));
      setSelectedId(item.id);
      setMessage(
        item.testStatus === "PASSED"
          ? "策略已保存，测试通过。"
          : item.testStatus === "PARTIAL"
            ? "策略已保存，部分来源可用。"
            : "策略已保存，但当前测试未通过；可调整后再次保存测试。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "采集策略保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function setEnabled(item: CollectionStrategy, enabled: boolean) {
    setBusy(true);
    setMessage(null);
    try {
      await readJson(
        await fetch("/api/admin/content/discovery/strategies", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ strategyId: item.id, enabled })
        })
      );
      await loadStrategies(item.id);
      setMessage(enabled ? "采集策略已启用。" : "采集策略已停用。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "策略状态更新失败");
    } finally {
      setBusy(false);
    }
  }

  async function removeStrategy(item: CollectionStrategy) {
    if (!window.confirm("删除后将从当前策略列表移除，历史采集事实仍保留。确定删除吗？")) return;
    setBusy(true);
    setMessage(null);
    try {
      await readJson(
        await fetch("/api/admin/content/discovery/strategies", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ strategyId: item.id })
        })
      );
      if (selectedId === item.id) resetForm();
      await loadStrategies();
      setMessage("采集策略已删除，历史采集事实仍保留。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "采集策略删除失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="official-strategy">
      <aside className="official-strategy-list">
        <div className="official-panel-head">
          <div><span>采集策略</span><strong>已配置策略</strong></div>
          <small>{strategies.length} 个</small>
        </div>

        <div className="official-strategy-source-list">
          {strategies.length ? strategies.map((item) => (
            <article key={item.id} className={selectedId === item.id ? "is-active" : ""}>
              <button type="button" onClick={() => editStrategy(item)}>
                <div><strong>{item.name}</strong></div>
                <span>{(item.topics ?? []).slice(0, 3).join(" · ") || (item.aiMode === "NONE" ? "确定性规则" : "AI 语义策略")}</span>
                <small>{testStatusLabel(item.testStatus)} · {formatDate(item.lastTestedAt)}</small>
              </button>
              <div className="official-source-side">
                <em>{item.enabled ? "启用" : "停用"}</em>
                <button type="button" disabled={busy} onClick={() => void setEnabled(item, !item.enabled)}>{item.enabled ? "停用" : "启用"}</button>
                <button type="button" disabled={busy} onClick={() => void removeStrategy(item)}>删除</button>
              </div>
            </article>
          )) : <div className="admin-empty">还没有采集策略。右侧配置后保存并测试。</div>}
        </div>
      </aside>

      <div className="official-strategy-editor">
        <div className="official-strategy-form">
          <div className="official-stage-intro compact">
            <span>{selected ? "编辑策略" : "采集策略"}</span>
            <h2>{selected ? selected.name : "配置系统要持续找什么"}</h2>
            <p>管理员只配置采集意图和筛选规则；Source、RSS、RSSHub、Search、Creator / Comment Collector 由系统自动路由。</p>
          </div>

          <section className="official-config-section">
            <div className="official-section-title"><strong>策略设置</strong><span>AI 可选</span></div>
            <div className="official-form-grid">
              <label>
                <span>采集策略名称</span>
                <input
                  value={form.name}
                  maxLength={80}
                  placeholder="例如：AI Agent 与模型更新"
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label>
                <span>AI 模型</span>
                <select value={form.aiMode} onChange={(event) => setForm({ ...form, aiMode: event.target.value as AiMode })}>
                  <option value="NONE">无</option>
                  <option value="SYSTEM_DEFAULT">跟随系统默认</option>
                  <option value="CUSTOM">指定模型</option>
                </select>
              </label>
              {form.aiMode === "CUSTOM" ? (
                <label className="wide">
                  <span>模型</span>
                  <input value={form.modelRef} placeholder="例如 gpt-5.6" onChange={(event) => setForm({ ...form, modelRef: event.target.value })} />
                </label>
              ) : null}
              {form.aiMode !== "NONE" ? (
                <label className="wide">
                  <span>采集描述</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    placeholder="例如：持续寻找 OpenAI、Anthropic 和 Google DeepMind 最近 3 天的 Agent、模型能力和 API 更新，优先保留有明显讨论增长的内容。"
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </label>
              ) : (
                <div className="official-config-note wide">
                  不使用 AI：系统仍会按关键词、竞品主页、互动阈值、时间范围等确定性规则运行。
                </div>
              )}
            </div>
          </section>

          <section className="official-config-section">
            <div className="official-section-title"><strong>标签与关键词</strong><span>可增减</span></div>
            <div className="official-tag-editor">
              <div className="official-tag-row">
                {parseTags(form.topics).length
                  ? parseTags(form.topics).map((tag) => (
                    <button type="button" key={tag} onClick={() => removeTopic(tag)}>{tag}<span>×</span></button>
                  ))
                  : <small>还没有标签。关键词同时用于 Search Collector 和后续主题管理。</small>}
              </div>
              <div className="official-tag-add">
                <input
                  value={newTopic}
                  placeholder="例如 Agent、MCP、Claude Code"
                  onChange={(event) => setNewTopic(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTopic();
                    }
                  }}
                />
                <button type="button" className="btn btn-secondary" onClick={addTopic}>添加</button>
              </div>
            </div>
          </section>

          <details className="official-config-section official-config-optional">
            <summary><strong>竞品监控与评论挖需</strong><span>按需要配置</span></summary>
            <div className="official-form-grid">
              <label className="wide">
                <span>竞品主页</span>
                <textarea
                  rows={3}
                  value={form.competitorAccounts}
                  placeholder={"每行一个主页链接，例如：\nhttps://www.youtube.com/@...\nhttps://www.xiaohongshu.com/user/profile/..."}
                  onChange={(event) => setForm({ ...form, competitorAccounts: event.target.value })}
                />
              </label>
              <label className="official-toggle-row wide">
                <input
                  type="checkbox"
                  checked={form.collectComments}
                  onChange={(event) => setForm({ ...form, collectComments: event.target.checked })}
                />
                <span><strong>评论挖需</strong><small>由 Comment Collector 执行；Adapter 不支持时不会伪造评论数据。</small></span>
              </label>
            </div>
          </details>

          <details className="official-config-section official-config-optional">
            <summary><strong>互动与粉丝筛选</strong><span>全部可选</span></summary>
            <div className="official-form-grid">
              <label><span>最低点赞</span><input type="number" min={0} value={form.minLikes} placeholder="不限制" onChange={(event) => setForm({ ...form, minLikes: event.target.value })} /></label>
              <label><span>最低评论</span><input type="number" min={0} value={form.minComments} placeholder="不限制" onChange={(event) => setForm({ ...form, minComments: event.target.value })} /></label>
              <label><span>最低收藏</span><input type="number" min={0} value={form.minFavorites} placeholder="不限制" onChange={(event) => setForm({ ...form, minFavorites: event.target.value })} /></label>
              <label><span>最低播放</span><input type="number" min={0} value={form.minViews} placeholder="不限制" onChange={(event) => setForm({ ...form, minViews: event.target.value })} /></label>
              <label><span>最低粉丝数</span><input type="number" min={0} value={form.minFollowers} placeholder="不限制" onChange={(event) => setForm({ ...form, minFollowers: event.target.value })} /></label>
              <label><span>播放 ÷ 粉丝数</span><input type="number" min={0} step="0.1" value={form.minPlayFollowerRatio} placeholder="例如 3" onChange={(event) => setForm({ ...form, minPlayFollowerRatio: event.target.value })} /></label>
            </div>
          </details>

          <details className="official-config-section official-config-optional">
            <summary><strong>高级设置</strong><span>时间 / 语言 / 更新频率</span></summary>
            <div className="official-form-grid">
              <label>
                <span>时间范围</span>
                <select value={form.windowHours} onChange={(event) => setForm({ ...form, windowHours: Number(event.target.value) })}>
                  <option value={24}>最近 24 小时</option>
                  <option value={72}>最近 3 天</option>
                  <option value={168}>最近 7 天</option>
                  <option value={720}>最近 30 天</option>
                </select>
              </label>
              <label>
                <span>内容语言</span>
                <select value={form.languagePolicy} onChange={(event) => setForm({ ...form, languagePolicy: event.target.value as StrategyForm["languagePolicy"] })}>
                  <option value="ZH_PREFERRED">中文优先</option>
                  <option value="ZH_EN">中文 + 英文</option>
                  <option value="ANY">不限制</option>
                </select>
              </label>
              <label>
                <span>更新频率</span>
                <select value={form.updateFrequency} onChange={(event) => setForm({ ...form, updateFrequency: event.target.value as StrategyForm["updateFrequency"] })}>
                  <option value="SYSTEM_DEFAULT">跟随系统默认</option>
                  <option value="HOURLY">每小时</option>
                  <option value="THREE_HOURLY">每 3 小时</option>
                  <option value="DAILY">每天</option>
                  <option value="MANUAL">手动</option>
                </select>
              </label>
            </div>
          </details>

          <div className="official-config-note">
            Collector 默认只返回引用、摘要、平台指标和 metadata；不拥有长期下载或保存图片、视频、音频媒体的权限。
          </div>

          {message ? <div className="official-content-message">{message}</div> : null}

          <footer className="official-strategy-actions">
            <span>{selected ? "修改后会重新解析并测试当前策略。" : "保存前会自动解析来源并做一次真实测试。"}</span>
            <div>
              {selected ? <button type="button" className="btn btn-secondary" disabled={busy} onClick={resetForm}>取消编辑</button> : null}
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void saveAndTest()}>
                {busy ? "正在测试…" : "保存并测试策略"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
