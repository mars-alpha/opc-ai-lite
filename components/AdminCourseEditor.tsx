"use client";

import { useEffect, useMemo, useState } from "react";

type TreeItem = {
  stageId: string;
  stageSlug: string;
  stageTitle: string;
  stageOrder: number;
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  moduleOrder: number;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonOrder: number;
  lessonStatus: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  lessonVersion: number;
};

type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number | null;
  content: Record<string, unknown>;
  order: number;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  version: number;
  updatedAt: string;
  moduleId: string;
  moduleTitle: string;
  stageId: string;
  stageTitle: string;
  stageSlug: string;
};

const statuses = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;

export function AdminCourseEditor() {
  const [items, setItems] = useState<TreeItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [contentText, setContentText] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTree() {
    const response = await fetch("/api/admin/courses", { cache: "no-store" });
    if (!response.ok) throw new Error("课程目录读取失败");
    const data = await response.json();
    setItems(data.items);
    if (!selectedId && data.items[0]?.lessonId) {
      setSelectedId(data.items[0].lessonId);
    }
  }

  useEffect(() => {
    loadTree()
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    setMessage(null);
    fetch("/api/admin/lessons/" + encodeURIComponent(selectedId), {
      cache: "no-store"
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Lesson 读取失败");
        return response.json();
      })
      .then((data) => {
        setLesson(data.lesson);
        setContentText(JSON.stringify(data.lesson.content, null, 2));
      })
      .catch((error) => setMessage(error.message));
  }, [selectedId]);

  const grouped = useMemo(() => {
    const stages = new Map<string, {
      title: string;
      modules: Map<string, { title: string; lessons: TreeItem[] }>;
    }>();

    for (const item of items) {
      if (!stages.has(item.stageId)) {
        stages.set(item.stageId, { title: item.stageTitle, modules: new Map() });
      }
      const stage = stages.get(item.stageId)!;
      if (!stage.modules.has(item.moduleId)) {
        stage.modules.set(item.moduleId, { title: item.moduleTitle, lessons: [] });
      }
      stage.modules.get(item.moduleId)!.lessons.push(item);
    }

    return Array.from(stages.entries());
  }, [items]);

  async function saveLesson() {
    if (!lesson) return;

    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(contentText);
    } catch {
      setMessage("教学内容 JSON 格式不正确。");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/lessons/" + encodeURIComponent(lesson.id),
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: lesson.title,
            summary: lesson.summary,
            durationMinutes: lesson.durationMinutes,
            status: lesson.status,
            content: parsedContent
          })
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "保存失败");
      }

      setLesson((current) =>
        current
          ? {
              ...current,
              version: data.lesson.version,
              updatedAt: data.lesson.updatedAt
            }
          : current
      );
      await loadTree();
      setMessage(
        lesson.status === "PUBLISHED"
          ? "已保存并发布，前台会优先读取这版 PostgreSQL 内容。"
          : "已保存为 " + lesson.status + "，前台不会读取未发布正文。"
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="admin-empty">正在读取课程数据…</div>;
  }

  return (
    <div className="admin-course-grid">
      <aside className="admin-course-tree">
        <div className="admin-panel-head">
          <div>
            <div className="kicker">Course tree</div>
            <h2>课程目录</h2>
          </div>
          <span>{items.length} Lessons</span>
        </div>

        <div className="admin-tree-scroll">
          {grouped.map(([stageId, stage]) => (
            <div className="admin-stage-group" key={stageId}>
              <strong>{stage.title}</strong>
              {Array.from(stage.modules.entries()).map(([moduleId, module]) => (
                <div className="admin-module-group" key={moduleId}>
                  <small>{module.title}</small>
                  {module.lessons.map((item) => (
                    <button
                      key={item.lessonId}
                      type="button"
                      className={
                        "admin-lesson-row " +
                        (selectedId === item.lessonId ? "is-active" : "")
                      }
                      onClick={() => setSelectedId(item.lessonId)}
                    >
                      <span>{item.lessonTitle}</span>
                      <em className={"status-" + item.lessonStatus.toLowerCase()}>
                        {item.lessonStatus}
                      </em>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <section className="admin-editor-panel">
        {!lesson ? (
          <div className="admin-empty">选择一个 Lesson 开始编辑。</div>
        ) : (
          <>
            <div className="admin-editor-head">
              <div>
                <div className="kicker">
                  {lesson.stageTitle} / {lesson.moduleTitle}
                </div>
                <h1>{lesson.title}</h1>
              </div>
              <div className="admin-version">
                <span>Version</span>
                <strong>v{lesson.version}</strong>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field-wide">
                <span>标题</span>
                <input
                  value={lesson.title}
                  maxLength={180}
                  onChange={(event) =>
                    setLesson({ ...lesson, title: event.target.value })
                  }
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>摘要</span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={lesson.summary}
                  onChange={(event) =>
                    setLesson({ ...lesson, summary: event.target.value })
                  }
                />
              </label>

              <label className="admin-field">
                <span>预计时长（分钟）</span>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={lesson.durationMinutes ?? ""}
                  onChange={(event) =>
                    setLesson({
                      ...lesson,
                      durationMinutes: event.target.value
                        ? Number(event.target.value)
                        : null
                    })
                  }
                />
              </label>

              <label className="admin-field">
                <span>状态</span>
                <select
                  value={lesson.status}
                  onChange={(event) =>
                    setLesson({
                      ...lesson,
                      status: event.target.value as LessonDetail["status"]
                    })
                  }
                >
                  {statuses.map((status) => (
                    <option value={status} key={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field admin-field-wide">
                <span>教学内容 JSON</span>
                <textarea
                  className="admin-json-editor"
                  rows={26}
                  value={contentText}
                  spellCheck={false}
                  onChange={(event) => setContentText(event.target.value)}
                />
                <small>
                  当前 MVP 暂时直接维护 Lesson Read Model JSON。后续再拆成更友好的结构化编辑器。
                </small>
              </label>
            </div>

            <div className="admin-editor-footer">
              <div>
                {message && <p className="admin-message">{message}</p>}
                <small>
                  DRAFT / REVIEW 不会进入前台；只有 PUBLISHED 会覆盖静态 fallback。
                </small>
              </div>
              <button
                className="btn btn-primary"
                type="button"
                onClick={saveLesson}
                disabled={saving}
              >
                {saving ? "保存中…" : "保存 Lesson"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

