"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PublicationStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

type ContentItem = {
  id: string;
  title: string;
  summary: string;
  audience: string | null;
  purpose: string | null;
  tags: string[];
  category: string;
  destination: string;
  sourceType: string;
  sourceRef: string | null;
  sourceUrl: string | null;
  sourcePublishedAt: string | null;
  readingMinutes: number | null;
  status: PublicationStatus;
  version: number;
  updatedAt: string;
};

type Draft = {
  title: string;
  summary: string;
  audience: string;
  purpose: string;
  tags: string;
  category: string;
  destination: string;
  sourceType: string;
  sourceRef: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  readingMinutes: string;
};

type OutputId =
  | "AI_DAILY"
  | "WECHAT"
  | "XIAOHONGSHU"
  | "ZHIHU"
  | "COVER"
  | "ILLUSTRATION"
  | "STEP_GRAPHIC"
  | "VIDEO_SCRIPT"
  | "MOTION_VIDEO";

type AuditRecord = {
  id: string;
  action: string;
  actorEmail: string;
  createdAt: string;
};

type LocalAsset = {
  id: string;
  file: File;
  url: string;
  kind: "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
};

type DirectoryHandleLike = {
  name: string;
};

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<DirectoryHandleLike>;
  }
}

const outputGroups: Array<{
  title: string;
  items: Array<{ id: OutputId; label: string }>;
}> = [
  {
    title: "文章",
    items: [
      { id: "AI_DAILY", label: "AI 日报" },
      { id: "WECHAT", label: "公众号" },
      { id: "XIAOHONGSHU", label: "小红书" },
      { id: "ZHIHU", label: "知乎" }
    ]
  },
  {
    title: "图片",
    items: [
      { id: "COVER", label: "封面" },
      { id: "ILLUSTRATION", label: "插图" },
      { id: "STEP_GRAPHIC", label: "说明图" }
    ]
  },
  {
    title: "视频",
    items: [
      { id: "VIDEO_SCRIPT", label: "视频脚本" },
      { id: "MOTION_VIDEO", label: "图片动效" }
    ]
  }
];

const outputLabels = Object.fromEntries(
  outputGroups.flatMap((group) => group.items.map((item) => [item.id, item.label]))
) as Record<OutputId, string>;

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function makeDraft(item: ContentItem): Draft {
  return {
    title: item.title,
    summary: item.summary,
    audience: item.audience ?? "",
    purpose: item.purpose ?? "",
    tags: (item.tags ?? []).join("，"),
    category: item.category,
    destination: item.destination,
    sourceType: item.sourceType,
    sourceRef: item.sourceRef ?? "",
    sourceUrl: item.sourceUrl ?? "",
    sourcePublishedAt: toDateTimeLocal(item.sourcePublishedAt),
    readingMinutes: item.readingMinutes?.toString() ?? ""
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function fileKind(file: File): LocalAsset["kind"] {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type.startsWith("audio/")) return "AUDIO";
  return "FILE";
}

function isTextOutput(id: OutputId | null) {
  return id === "AI_DAILY" || id === "WECHAT" || id === "XIAOHONGSHU" || id === "ZHIHU" || id === "VIDEO_SCRIPT";
}

function needsSaveFolder(id: OutputId | null) {
  return id === "COVER" || id === "ILLUSTRATION" || id === "STEP_GRAPHIC" || id === "VIDEO_SCRIPT" || id === "MOTION_VIDEO";
}

export function AdminContentStudioWorkspace({ initialSelectedId = "" }: { initialSelectedId?: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selectedOutputs, setSelectedOutputs] = useState<OutputId[]>([]);
  const [activeOutput, setActiveOutput] = useState<OutputId | null>(null);
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [motionAssetIds, setMotionAssetIds] = useState<string[]>([]);
  const [editorValue, setEditorValue] = useState("");
  const [folderName, setFolderName] = useState("");
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const assetsRef = useRef<LocalAsset[]>([]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId]
  );

  async function readJson(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "操作失败");
    return data;
  }

  async function loadItems(preferredId?: string) {
    const data = await readJson(await fetch("/api/admin/content/items", { cache: "no-store" }));
    const next = (data.items ?? []) as ContentItem[];
    setItems(next);
    const nextId =
      preferredId && next.some((item) => item.id === preferredId)
        ? preferredId
        : selectedId && next.some((item) => item.id === selectedId)
          ? selectedId
          : next[0]?.id ?? "";
    setSelectedId(nextId);
  }

  async function loadAudit(contentId: string) {
    const data = await readJson(
      await fetch("/api/admin/content/items/" + encodeURIComponent(contentId) + "/audit", { cache: "no-store" })
    );
    setAudit((data.items ?? []) as AuditRecord[]);
  }

  useEffect(() => {
    loadItems(initialSelectedId).catch((error) =>
      setMessage(error instanceof Error ? error.message : "内容读取失败")
    );
  }, [initialSelectedId]);

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      setSelectedOutputs([]);
      setActiveOutput(null);
      setAssets([]);
      setAudit([]);
      return;
    }

    setDraft(makeDraft(selected));

    const planRaw = window.localStorage.getItem("opc-content-output-plan:" + selected.id);
    let plan: OutputId[] = [];
    if (planRaw) {
      try {
        const parsed = JSON.parse(planRaw);
        if (Array.isArray(parsed)) {
          plan = parsed.filter((item): item is OutputId =>
            typeof item === "string" && Object.prototype.hasOwnProperty.call(outputLabels, item)
          );
        }
      } catch {}
    }

    setSelectedOutputs(plan);
    setActiveOutput(plan[0] ?? null);
    setAssets([]);
    setMotionAssetIds([]);
    setFolderName("");
    loadAudit(selected.id).catch(() => setAudit([]));
  }, [selected?.id, selected?.version]);

  useEffect(() => {
    if (!selected || !activeOutput || !isTextOutput(activeOutput)) {
      setEditorValue("");
      return;
    }
    setEditorValue(
      window.localStorage.getItem("opc-content-output-draft:" + selected.id + ":" + activeOutput) ?? ""
    );
  }, [selected?.id, activeOutput]);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    return () => {
      assetsRef.current.forEach((asset) => URL.revokeObjectURL(asset.url));
    };
  }, []);

  function persistEditor(value: string) {
    setEditorValue(value);
    if (selected && activeOutput && isTextOutput(activeOutput)) {
      window.localStorage.setItem("opc-content-output-draft:" + selected.id + ":" + activeOutput, value);
    }
  }

  function toggleOutput(id: OutputId) {
    if (!selected) return;
    const next = selectedOutputs.includes(id)
      ? selectedOutputs.filter((item) => item !== id)
      : [...selectedOutputs, id];
    setSelectedOutputs(next);
    if (!next.includes(activeOutput as OutputId)) setActiveOutput(next[0] ?? null);
    if (!selectedOutputs.includes(id)) setActiveOutput(id);
    window.localStorage.setItem("opc-content-output-plan:" + selected.id, JSON.stringify(next));
  }

  function addFiles(files: File[]) {
    const next = files.map((file, index) => ({
      id: file.name + ":" + file.size + ":" + file.lastModified + ":" + index,
      file,
      url: URL.createObjectURL(file),
      kind: fileKind(file)
    }));
    setAssets((current) => [...current, ...next]);
  }

  function insertAsset(asset: LocalAsset) {
    if (!activeOutput) {
      setMessage("先选择一个生成结果。");
      return;
    }

    if (activeOutput === "MOTION_VIDEO") {
      if (asset.kind !== "IMAGE") {
        setMessage("图片动效只接受图片素材。");
        return;
      }
      setMotionAssetIds((current) =>
        current.includes(asset.id) ? current : [...current, asset.id]
      );
      return;
    }

    if (isTextOutput(activeOutput)) {
      const token = "\n[素材：" + asset.file.name + "]\n";
      const textarea = editorRef.current;
      if (!textarea) {
        persistEditor(editorValue + token);
        return;
      }
      const start = textarea.selectionStart ?? editorValue.length;
      const end = textarea.selectionEnd ?? start;
      persistEditor(editorValue.slice(0, start) + token + editorValue.slice(end));
      requestAnimationFrame(() => {
        textarea.focus();
        const position = start + token.length;
        textarea.setSelectionRange(position, position);
      });
      return;
    }

    setMessage("该素材已加入当前结果，可用于后续图片生成/替换。");
  }

  async function chooseFolder() {
    if (!window.showDirectoryPicker) {
      setMessage("当前浏览器不支持直接选择本地文件夹；后续会退化为下载保存。");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker();
      setFolderName(handle.name);
      setMessage("已选择保存文件夹：" + handle.name);
    } catch {
      // User cancelled the directory picker.
    }
  }

  async function saveBrief() {
    if (!selected || !draft || selected.status !== "DRAFT") return;
    setBusy(true);
    setMessage(null);
    try {
      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(selected.id), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...draft,
            tags: draft.tags.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean),
            sourceRef: draft.sourceRef || null,
            sourceUrl: draft.sourceUrl || null,
            sourcePublishedAt: draft.sourcePublishedAt || null,
            readingMinutes: draft.readingMinutes ? Number(draft.readingMinutes) : null
          })
        })
      );
      await loadItems(selected.id);
      setMessage("基础信息已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function review(decision: "APPROVED" | "NEEDS_CHANGES" | "REJECTED") {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(selected.id) + "/review", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ decision, note: null })
        })
      );
      await loadItems(selected.id);
      await loadAudit(selected.id);
      setMessage(
        decision === "APPROVED"
          ? "已审核通过，可以发布。"
          : decision === "NEEDS_CHANGES"
            ? "已退回修改。"
            : "已放弃该内容。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "审核失败");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      await readJson(
        await fetch("/api/admin/content/items/" + encodeURIComponent(selected.id) + "/publish", { method: "POST" })
      );
      await loadItems(selected.id);
      await loadAudit(selected.id);
      setMessage("已正式发布。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "发布失败");
    } finally {
      setBusy(false);
    }
  }

  const motionAssets = motionAssetIds
    .map((id) => assets.find((asset) => asset.id === id))
    .filter((asset): asset is LocalAsset => Boolean(asset));
  const hasReviewableResult = isTextOutput(activeOutput) && editorValue.trim().length > 0;

  return (
    <div className="content-studio">
      <aside className="content-studio-list">
        <header>
          <strong>内容工作台</strong>
          <span>{items.length} 条</span>
        </header>
        <div>
          {items.length ? items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={selected?.id === item.id ? "is-active" : ""}
              onClick={() => setSelectedId(item.id)}
            >
              <strong>{item.title}</strong>
              <span>{item.category || "未分类"} · {formatDate(item.updatedAt)}</span>
            </button>
          )) : <div className="admin-empty">还没有内容。先从“今日情报”采用一个选题。</div>}
        </div>
      </aside>

      {!selected || !draft ? (
        <main className="content-studio-empty">
          <strong>选择一条内容开始创作</strong>
        </main>
      ) : (
        <>
          <main className="content-studio-center">
            <details className="content-studio-brief">
              <summary>基础信息 <span>{selected.title}</span></summary>
              <div className="content-studio-brief-form">
                <label className="wide"><span>标题</span><input value={draft.title} disabled={selected.status !== "DRAFT"} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
                <label className="wide"><span>核心观点</span><textarea rows={4} value={draft.summary} disabled={selected.status !== "DRAFT"} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
                <label><span>写给谁</span><input value={draft.audience} disabled={selected.status !== "DRAFT"} placeholder="例如：想了解 AI 应用的普通用户" onChange={(event) => setDraft({ ...draft, audience: event.target.value })} /></label>
                <label><span>内容目的</span><input value={draft.purpose} disabled={selected.status !== "DRAFT"} placeholder="例如：解释、分析、教程、观点" onChange={(event) => setDraft({ ...draft, purpose: event.target.value })} /></label>
                <label className="wide"><span>标签</span><input value={draft.tags} disabled={selected.status !== "DRAFT"} placeholder="例如：Agent，内容工作流，多模态" onChange={(event) => setDraft({ ...draft, tags: event.target.value })} /></label>
              </div>
              {selected.status === "DRAFT" ? <div className="content-studio-brief-save"><button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void saveBrief()}>保存基础信息</button></div> : null}
            </details>

            <section className="content-studio-create">
              <div className="content-studio-section-title">
                <div><strong>生成什么</strong><span>只选择这次真正需要的输出</span></div>
                <small>{selectedOutputs.length ? "已选 " + selectedOutputs.length + " 项" : "未选择"}</small>
              </div>
              <div className="content-output-picker">
                {outputGroups.map((group) => (
                  <div key={group.title}>
                    <span>{group.title}</span>
                    <div>
                      {group.items.map((output) => (
                        <button
                          type="button"
                          key={output.id}
                          className={selectedOutputs.includes(output.id) ? "is-selected" : ""}
                          onClick={() => toggleOutput(output.id)}
                        >
                          {output.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-result-stage">
              <div className="content-studio-section-title">
                <div><strong>生成结果</strong><span>生成后直接在这里编辑、调用素材和预览</span></div>
                <div className="content-result-actions">
                  {activeOutput && (activeOutput === "AI_DAILY" || activeOutput === "WECHAT" || activeOutput === "XIAOHONGSHU" || activeOutput === "ZHIHU") ? (
                    <button type="button" className="btn btn-secondary" disabled title="飞书连接接通后启用">推送到飞书</button>
                  ) : null}
                  {needsSaveFolder(activeOutput) ? (
                    <button type="button" className="btn btn-secondary" onClick={() => void chooseFolder()}>
                      {folderName ? "保存到：" + folderName : "选择保存文件夹"}
                    </button>
                  ) : null}
                </div>
              </div>

              {selectedOutputs.length ? (
                <>
                  <div className="content-result-tabs">
                    {selectedOutputs.map((id) => (
                      <button type="button" key={id} className={activeOutput === id ? "is-active" : ""} onClick={() => setActiveOutput(id)}>
                        {outputLabels[id]}
                      </button>
                    ))}
                  </div>

                  {isTextOutput(activeOutput) ? (
                    <div className="content-result-editor">
                      <textarea
                        ref={editorRef}
                        value={editorValue}
                        onChange={(event) => persistEditor(event.target.value)}
                        placeholder={"这里显示并编辑" + (activeOutput ? outputLabels[activeOutput] : "生成内容") + "。生成 Workflow 接入后会自动填入初稿。"}
                      />
                      <footer>
                        <span>右侧素材可直接插入当前编辑器</span>
                        <span>当前内容仅保存在浏览器草稿缓存</span>
                      </footer>
                    </div>
                  ) : activeOutput === "MOTION_VIDEO" ? (
                    <div className="content-motion-editor">
                      <div>
                        <strong>图生视频素材</strong>
                        <span>从右侧素材中选择图片，按顺序生成动效。</span>
                      </div>
                      {motionAssets.length ? (
                        <div className="content-motion-assets">
                          {motionAssets.map((asset, index) => (
                            <article key={asset.id}>
                              <img src={asset.url} alt={asset.file.name} />
                              <span>{index + 1}</span>
                              <strong>{asset.file.name}</strong>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="content-result-empty">
                          <strong>还没有选择图片</strong>
                          <p>先在右侧添加图片素材，再点击素材上的“用于当前结果”。</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="content-result-empty">
                      <strong>{activeOutput ? outputLabels[activeOutput] : "生成结果"}</strong>
                      <p>生成 Workflow 接入后，图片结果会直接出现在这里；右侧素材可以作为输入或替换素材。</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="content-result-empty">
                  <strong>先选择需要生成的内容</strong>
                  <p>选择后，中间区域会切换为对应的文章编辑器、图片结果区或图生视频编辑区。</p>
                </div>
              )}
            </section>

            {message ? <p className="production-message">{message}</p> : null}
          </main>

          <aside className="content-studio-side">
            <section className="content-studio-assets-panel">
              <header><strong>素材</strong><span>{assets.length ? assets.length + " 个" : "当前内容"}</span></header>
              <label className="content-studio-upload">
                <input type="file" accept="image/*,video/*,audio/*" multiple onChange={(event) => addFiles(Array.from(event.target.files ?? []))} />
                <strong>添加素材</strong>
                <span>图片、视频、音频</span>
              </label>

              {assets.length ? (
                <div className="content-studio-assets">
                  {assets.map((asset) => (
                    <article key={asset.id}>
                      {asset.kind === "IMAGE" ? <img src={asset.url} alt={asset.file.name} /> : <div className="content-asset-file">{asset.kind}</div>}
                      <div>
                        <strong>{asset.file.name}</strong>
                        <span>{Math.max(1, Math.round(asset.file.size / 1024))} KB</span>
                      </div>
                      <button type="button" onClick={() => insertAsset(asset)}>
                        {activeOutput === "MOTION_VIDEO" ? "用于当前结果" : isTextOutput(activeOutput) ? "插入编辑器" : "用于当前结果"}
                      </button>
                    </article>
                  ))}
                </div>
              ) : <p className="content-studio-side-empty">上传的素材和后续 AI 生成素材都会集中在这里。</p>}
            </section>

            <section className="content-studio-review-panel">
              <header><strong>审核与发布</strong></header>
              {selected.status === "DRAFT" ? (
                <div className="content-studio-review-actions">
                  <button type="button" className="btn btn-primary" disabled={busy || !hasReviewableResult} onClick={() => void review("APPROVED")}>审核通过</button>
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void review("NEEDS_CHANGES")}>退回修改</button>
                  {!hasReviewableResult ? <span>先生成或编辑出实际内容，再进行审核。</span> : null}
                  <div className="content-studio-review-bottom">
                    <button type="button" className="content-studio-text-action" disabled={busy} onClick={() => void review("REJECTED")}>放弃内容</button>
                  </div>
                </div>
              ) : null}
              {selected.status === "REVIEW" ? (
                <div className="content-studio-review-actions">
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void publish()}>正式发布</button>
                </div>
              ) : null}
              {selected.status === "PUBLISHED" ? <p className="content-studio-side-empty">当前版本已发布。</p> : null}
              {selected.status === "ARCHIVED" ? <p className="content-studio-side-empty">当前内容已归档。</p> : null}
            </section>

            <section className="content-studio-audit-stream">
              <header><strong>操作记录</strong><span>{audit.length} 条</span></header>
              <div>
                {audit.length ? audit.slice(0, 30).map((entry) => (
                  <p key={entry.id}><strong>{entry.action}</strong><span>{formatDate(entry.createdAt)}</span></p>
                )) : <span>暂无记录</span>}
              </div>
            </section>
          </aside>
        </>
      )}
    </div>
  );
}
