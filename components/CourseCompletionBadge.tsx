"use client";

import type { Course } from "../lib/courses";
import { useProgress } from "./ProgressProvider";

export function CourseCompletionBadge({ course }: { course: Course }) {
  const { ready, completedCount } = useProgress();
  const total = course.modules.flatMap((module) => module.lessons).length;
  const done = ready ? completedCount(course.slug) : 0;
  const complete = ready && total > 0 && done === total;

  return (
    <div className={"course-completion-badge " + (complete ? "is-complete" : "")}>
      <span>{complete ? "✓" : "○"}</span>
      <div>
        <strong>{complete ? "课程已完成" : done > 0 ? "课程学习中" : "课程未开始"}</strong>
        <small>{done} / {total} 课时完成</small>
      </div>
    </div>
  );
}


