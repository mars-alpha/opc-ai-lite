"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProgress } from "./ProgressProvider";

export function LessonCompleteButton({
  courseSlug,
  lessonId,
  requiresPractice = false,
  inline = false,
  disabled = false
}: {
  courseSlug: string;
  lessonId: string;
  requiresPractice?: boolean;
  inline?: boolean;
  disabled?: boolean;
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
      if (cause instanceof Error && cause.message === "CHECK_REQUIRED") {
        setError("还不能完成：请先通过本课必做的理解检查。");
      } else if (cause instanceof Error && cause.message === "PRACTICE_REQUIRED") {
        setError("还不能完成：请先把上方必做实操做到“已通过”。");
      } else if (cause instanceof Error && cause.message === "REAL_AI_REQUIRED") {
        setError("还不能完成：请先完成本课要求的真实 AI 操作，并提交对应完成证据。");
      } else if (cause instanceof Error && cause.message === "STAGE_PREREQUISITE_REQUIRED") {
        setError("当前阶段还有前置课程未完成。请先按学习路径完成前置内容，再回来继续。");
      } else if (cause instanceof Error && cause.message === "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED") {
        setError("当前课程需要先完成对应解锁条件。请查看页面上的解锁说明。");
      } else if (cause instanceof Error && cause.message === "UNAUTHENTICATED") {
        setError("登录后才能保存正式学习进度。");
      } else {
        setError("这次进度没有保存成功。请刷新后重试；如果仍失败，前面的学习内容不会丢失。");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={inline ? "lesson-complete-control is-inline" : "lesson-complete-control"}>
    <button
      type="button"
      className={"btn lesson-complete " + (done ? "is-complete" : "btn-primary")}
      onClick={handleToggle}
      aria-pressed={done}
      disabled={!ready || saving || disabled || (inline && done)}
    >
      {saving
        ? "正在确认学习结果…"
        : !authenticated
          ? "加入学习后标记完成"
          : done
            ? "✓ 本课已完成"
            : "完成本课"}
    </button>
    {error && <p className="lesson-complete-error">{error}</p>}
    </div>
  );
}

