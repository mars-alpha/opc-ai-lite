"use client";

import { useEffect, useState } from "react";

type Source = {
  id: string;
  name: string;
  sourceType: string;
  canonicalUrl: string | null;
};

type Analysis = {
  title: string;
  summary: string;
  facts: string[];
  doubts: string[];
  evidenceQuotes: string[];
  worthFollowing: boolean;
  reason: string;
};

function makeSourceId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return "source_" + stamp + "_" + Math.random().toString(36).slice(2, 7);
}

export function AdminContentAnalysisPanel() {
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function readJson(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "REQUEST_FAILED");
    return data;
  }

  async function loadSources(preferred?: string) {
    const data = await readJson(await fetch("/api/admin/content/sources", { cache: "no-store" }));
    const next = (data.items ?? []) as Source[];
    setSources(next);
    const target = preferred || sourceId || next[0]?.id || "";
    setSourceId(target);
  }

  useEffect(() => {
    loadSources().catch(() => setMessage("来源读取失败。"));
  }, []);

  async function createSource() {
    if (!newSourceName.trim()) {
      setMessage("先填写来源名称。");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const data = await readJson(
        await fetch("/api/admin/content/sources", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: makeSourceId(),
            name: newSourceName.trim(),
            sourceType: "web",
            canonicalUrl: newSourceUrl.trim() || null,
            status: "ACTIVE"
          })
        })
      );
      const created = data.item as Source;
      setNewSourceName("");
      setNewSourceUrl("");
      await loadSources(created.id);
      setMessage("来源已建立，可以开始分析具体原文。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建来源失败。");
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    if (!sourceId) {
      setMessage("请先选择或创建来源。");
      return;
    }
    if (rawText.trim().length < 20) {
      setMessage("请先提供原文、公告正文或视频转写文本。");
      return;
    }
    setBusy(true);
    setMessage(null);
    setAnalysis(null);
    setProviderUnavailable(false);
    try {
      const data = await readJson(
        await fetch("/api/admin/content/ai/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ originalUrl, rawText })
        })
      );
      if (data.mode === "UNAVAILABLE") {
        setProviderUnavailable(true);
        setMessage("平台 AI Provider 尚未配置。当前结构已接通，配置后即可直接运行分析。");
        return;
      }
      setAnalysis(data.analysis as Analysis);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 分析失败。");
    } finally {
      setBusy(false);
    }
  }

  async function saveAnalysisResult() {
    if (!analysis || !sourceId) return;
    setBusy(true);
    setMessage(null);
    try {
      await readJson(
        await fetch("/api/admin/content/sources/" + encodeURIComponent(sourceId) + "/evidence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: analysis.title,
            originalUrl: originalUrl.trim() || null,
            excerpt: analysis.evidenceQuotes.join("\n"),
            verificationStatus: "UNVERIFIED",
            metadata: { analysis }
          })
        })
      );
      setAnalysis(null);
      setOriginalUrl("");
      setRawText("");
      setMessage("AI 分析结果已保存为待确认素材，可进入第 02 步生成候选；最终人工确认时再统一验证。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存证据失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-ai-analysis-workspace">
      <section className="admin-ai-input-pane">
        <div className="admin-operation-pane-head">
          <div><span>CORE / ADAPTER</span><strong>采集输入</strong></div>
          <small>这里只负责把原始资料带进系统</small>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field admin-field-wide">
            <span>来源</span>
            <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              <option value="">选择已有来源</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-source-create">
          <div className="admin-subsection-head">
            <strong>没有这个来源？</strong>
            <span>只需登记一次</span>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>来源名称</span>
              <input value={newSourceName} onChange={(event) => setNewSourceName(event.target.value)} placeholder="例如 OpenAI 官方博客" />
            </label>
            <label className="admin-field">
              <span>来源主页</span>
              <input value={newSourceUrl} onChange={(event) => setNewSourceUrl(event.target.value)} placeholder="https://..." />
            </label>
          </div>
          <div className="admin-editor-footer">
            <small>来源是长期信息源，不是每篇文章都重新创建。</small>
            <button className="btn btn-secondary" type="button" onClick={createSource} disabled={busy}>创建来源</button>
          </div>
        </div>

        <div className="admin-analysis-input">
          <div className="admin-subsection-head">
            <strong>要进入系统的原始内容</strong>
            <span>当前为人工输入，未来由采集 Adapter 自动带入</span>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field admin-field-wide">
              <span>原始 URL</span>
              <input value={originalUrl} onChange={(event) => setOriginalUrl(event.target.value)} placeholder="https://..." />
            </label>
            <label className="admin-field admin-field-wide">
              <span>原文 / 公告正文 / 视频转写</span>
              <textarea rows={11} value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="当前先粘贴原始内容。后续接入采集 Adapter 后，这一步会由系统自动填充。" />
            </label>
          </div>
          <div className="admin-editor-footer">
            <small>采集层只负责原始输入，不做价值判断；右侧 AI / Skill 负责理解。</small>
            <button className="btn btn-primary" type="button" onClick={analyze} disabled={busy || !sourceId}>{busy ? "分析中…" : "AI 分析"}</button>
          </div>
        </div>
        {message ? <p className="admin-message">{message}</p> : null}
      </section>

      <section className="admin-ai-output-pane">
        <div className="admin-operation-pane-head">
          <div><span>AI / SKILL</span><strong>分析结果</strong></div>
          <small>事实提取、疑点识别和价值判断由 AI 完成</small>
        </div>

        {!analysis ? (
          <div className="admin-ai-empty">
            <strong>{providerUnavailable ? "AI Provider 尚未配置" : "等待 AI 分析"}</strong>
            <p>{providerUnavailable ? "当前 .env.local 未配置 OPC_AI_ANALYSIS_*。配置后无需改页面即可直接使用。" : "输入原始内容后，AI 会在这里区分事实、疑点、关键原文和是否值得继续跟进。"}</p>
          </div>
        ) : (
          <div className="admin-analysis-result">
            <div className="admin-analysis-summary">
              <span>{analysis.worthFollowing ? "建议继续" : "建议暂不进入候选"}</span>
              <h3>{analysis.title}</h3>
              <p>{analysis.summary}</p>
              <small>{analysis.reason}</small>
            </div>

            <div className="admin-analysis-columns">
              <section>
                <div className="admin-subsection-head"><strong>明确事实</strong><span>{analysis.facts.length} 条</span></div>
                {analysis.facts.map((item, index) => <p key={index}>{index + 1}. {item}</p>)}
              </section>
              <section>
                <div className="admin-subsection-head"><strong>疑点 / 待核对</strong><span>{analysis.doubts.length} 条</span></div>
                {analysis.doubts.length ? analysis.doubts.map((item, index) => <p key={index}>{index + 1}. {item}</p>) : <p>未识别到明显疑点。</p>}
              </section>
            </div>

            <section className="admin-analysis-evidence">
              <div className="admin-subsection-head"><strong>AI 建议保留的关键原文</strong><span>{analysis.evidenceQuotes.length} 条</span></div>
              {analysis.evidenceQuotes.map((item, index) => <blockquote key={index}>{item}</blockquote>)}
            </section>

            <div className="admin-editor-footer">
              <small>这里只保存 AI 分析结果，不产生人工审核结论。最终 Human Gate 会同时核对证据和候选内容。</small>
              <button className="btn btn-primary" type="button" onClick={saveAnalysisResult} disabled={busy}>保存分析结果</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
