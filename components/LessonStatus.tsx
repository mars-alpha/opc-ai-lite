"use client";

import { useProgress } from "./ProgressProvider";

export function LessonStatus({ courseSlug, lessonId }: { courseSlug: string; lessonId: string }) {
  const { ready, isCompleted } = useProgress();
  const complete = ready && isCompleted(courseSlug, lessonId);
  return <span className={"lesson-status " + (complete ? "is-complete" : "")}>{complete ? "✓ 已完成" : "未完成"}</span>;
}

