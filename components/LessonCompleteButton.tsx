"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProgress } from "./ProgressProvider";

export function LessonCompleteButton({
  courseSlug,
  lessonId,
  requiresPractice = false
}: {
  courseSlug: string;
  lessonId: string;
  requiresPractice?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ready, authenticated, isCompleted, toggleLesson } = useProgress();
  const done = ready && isCompleted(courseSlug, lessonId);

  async function handleToggle() {
    if (!authenticated) {
      const returnTo = "/courses/" + courseSlug + "/lessons/" + lessonId;
      const params = new URLSearchParams({
        mode: "register",
        courseSlug,
        returnTo
      });
      router.push("/auth?" + params.toString());
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await toggleLesson(courseSlug, lessonId);
    } catch (cause) {
      if (cause instanceof Error && cause.message === "PRACTICE_REQUIRED") {
        setError("先完成并通过上方必做实操，再标记本课完成。");
      } else {
        setError("学习状态保存失败，请稍后重试。");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lesson-complete-control">
    <button
      type="button"
      className={"btn lesson-complete " + (done ? "is-complete" : "btn-primary")}
      onClick={handleToggle}
      aria-pressed={done}
      disabled={!ready || saving}
    >
      {saving
        ? "正在保存…"
        : !authenticated
          ? "加入学习后标记完成"
          : done
            ? "✓ 已完成 · 点击撤销"
            : requiresPractice
              ? "通过实操后完成本课"
              : "标记本课完成"}
    </button>
    {error && <p className="lesson-complete-error">{error}</p>}
    </div>
  );
}

