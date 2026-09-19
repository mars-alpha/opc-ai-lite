"use client";

import { useEffect, useMemo, useState } from "react";

type KnowledgeForPractice = {
  id: string;
  sourceContentId: string | null;
  title: string;
  summary: string;
  stageId: string | null;
  lessonId: string | null;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
};

type PracticeItem = {
  id: string;
  accessTier: "INHERIT" | "FREE" | "MEMBER";
  title: string;
  goal: string;
  instructions: unknown;
  hints: unknown;
  rubric: unknown;
  submissionSchema: unknown;
  passScore: number;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
};

const defaultInstructions = [
  { key: "goal", label: "Goal", prompt: "你要通过这次实操验证什么真实结果？" },
  { key: "context", label: "Context", prompt: "谁会使用、在哪个场景中使用？" },
  { key: "input", label: "Input", prompt: "这次验证基于哪些真实输入、资料或样本？" },
  { key: "constraint", label: "Constraint", prompt: "哪些失败条件、边界或人工检查点必须保留？" },
  { key: "output", label: "Output", prompt: "最终要交付什么可验证结果？" }
];

const defaultRubric = [
  { key: "goal", label: "Goal", maxScore: 20, minScore: 12, example: "写清最终要验证的真实结果。" },
  { key: "context", label: "Context", maxScore: 20, minScore: 12, example: "说明真实使用者与业务场景。" },
  { key: "input", label: "Input", maxScore: 20, minScore: 12, example: "列出可验证的真实输入或样本。" },
  { key: "constraint", label: "Constraint", maxScore: 20, minScore: 12, example: "明确失败条件、边界与人工复核点。" },
  { key: "output", label: "Output", maxScore: 20, minScore: 12, example: "定义最终输出、指标或验收结果。" }
];

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseJson(value: string, label: string) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(label + " JSON 格式不正确。");
  }
}

export function LatestPracticeRoutingPanel({ knowledge }: { knowledge: KnowledgeForPractice }) {
  const [existing, setExisting] = useState<PracticeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const defaults = useMemo(() => ({
    title: knowledge.title.replace(/^示例：/, ""),
    goal: "把这条最新知识转成一个可执行、可提交、可验收的真实任务。",
    instructions: pretty(defaultInstructions),
    hints: pretty(["先定义真实结果，不要从工具开始。", "至少保留一个失败条件或人工复核点。"]),
    rubric: pretty(defaultRubric),
    submissionSchema: pretty({ kind: "TASK_BRIEF_V1" }),
    passScore: 80,
    accessTier: "FREE",
    status: "DRAFT"
  }), [knowledge.id, knowledge.title]);

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    fetch("/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/practice", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Latest Practice 关联读取失败");
        const item = (data.item ?? null) as PracticeItem | null;
        setExisting(item);
        if (item) {
          setForm({
            title: item.title,
            goal: item.goal,
            instructions: pretty(item.instructions),
            hints: pretty(item.hints),
            rubric: pretty(item.rubric),
            submissionSchema: pretty(item.submissionSchema),
            passScore: item.passScore,
            accessTier: item.accessTier,
            status: item.status
          });
        } else {
          setForm(defaults);
        }
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Latest Practice 关联读取失败"))
      .finally(() => setLoading(false));
  }, [knowledge.id, defaults]);

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const payload = {
        title: form.title,
        goal: form.goal,
        instructions: parseJson(form.instructions, "Instructions"),
        hints: parseJson(form.hints, "Hints"),
        rubric: parseJson(form.rubric, "Rubric"),
        submissionSchema: parseJson(form.submissionSchema, "Submission Schema"),
        passScore: Number(form.passScore),
        accessTier: form.accessTier,
        status: form.status
      };

      const response = await fetch(
        "/api/admin/knowledge/items/" + encodeURIComponent(knowledge.id) + "/practice",
        {
          method: existing ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.error === "KNOWLEDGE_NOT_PUBLISHED") {
          throw new Error("Knowledge 尚未 PUBLISHED，不能发布 Latest Practice。可以先保存为 DRAFT / REVIEW。");
        }
        throw new Error(data.error ?? "Latest Practice 保存失败");
      }

      const item = (data.item ?? null) as PracticeItem | null;
      if (item) setExisting(item);
      setMessage(data.created === false
        ? "该 Knowledge 已有关联 Latest Practice，未重复创建。"
        : existing
          ? "Latest Practice 已更新。"
          : "Latest Practice 已创建并绑定当前 Knowledge。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Latest Practice 保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-routing-panel admin-practice-routing">
      <div className="admin-routing-head">
        <div>
          <div className="kicker">Latest Practice Routing</div>
          <h2>Knowledge → Latest Practice</h2>
          <p>人工定义实操任务。Published Practice 会进入正式 Practice Runtime 与前台最新技术实操。</p>
        </div>
        {existing ? <span className="admin-practice-id">{existing.id}</span> : null}
      </div>

      {loading ? <p className="admin-routing-note">正在检查已有 Latest Practice…</p> : (
        <>
          <div className="admin-form-grid admin-routing-form">
            <label className="admin-field admin-field-wide">
              <span>Practice 标题</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>Goal</span>
              <textarea rows={3} value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>Instructions JSON</span>
              <textarea rows={10} value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>Hints JSON</span>
              <textarea rows={5} value={form.hints} onChange={(event) => setForm({ ...form, hints: event.target.value })} />
            </label>

            <label className="admin-field admin-field-wide">
              <span>Rubric JSON</span>
              <textarea rows={12} value={form.rubric} onChange={(event) => setForm({ ...form, rubric: event.target.value })} />
            </label>

            <label className="admin-field">
              <span>Submission Schema</span>
              <textarea rows={3} value={form.submissionSchema} onChange={(event) => setForm({ ...form, submissionSchema: event.target.value })} />
            </label>

            <label className="admin-field">
              <span>Pass Score</span>
              <input type="number" min={1} max={100} value={form.passScore} onChange={(event) => setForm({ ...form, passScore: Number(event.target.value) || 80 })} />
            </label>

            <label className="admin-field">
              <span>Access Tier</span>
              <select value={form.accessTier} onChange={(event) => setForm({ ...form, accessTier: event.target.value })}>
                <option value="FREE">FREE</option>
                <option value="MEMBER">MEMBER</option>
                <option value="INHERIT">INHERIT</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Status</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </label>
          </div>

          <div className="admin-routing-actions">
            <small>
              来源固定为当前 Knowledge；sourceContentId / stageId / lessonId 会从 Knowledge 继承。
              {knowledge.status !== "PUBLISHED" ? " 当前 Knowledge 尚未发布，因此 Practice 不能设为 PUBLISHED。" : ""}
            </small>
            <button className="btn btn-primary" type="button" onClick={save} disabled={busy}>
              {busy ? "保存中…" : existing ? "保存 Practice" : "创建 Latest Practice"}
            </button>
          </div>
        </>
      )}

      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}
