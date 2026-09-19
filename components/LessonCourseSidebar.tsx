"use client";

import Link from "next/link";
import { useState } from "react";
import type { Course } from "../lib/courses";
import { getAllLessons } from "../lib/courses";
import { useProgress } from "./ProgressProvider";

export function LessonCourseSidebar({
  course,
  currentLessonId,
  lockedLessonIds = []
}: {
  course: Course;
  currentLessonId: string;
  lockedLessonIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const { ready, completedCount, isCompleted } = useProgress();
  const lessons = course.modules.flatMap((module) => module.lessons);
  const done = ready ? completedCount(course.slug) : 0;
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const currentIndex = Math.max(0, lessons.findIndex((item) => item.id === currentLessonId));
  const locked = new Set(lockedLessonIds);

  return (
    <aside className="lesson-sidebar">
      <button
        className="lesson-mobile-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="lesson-course-directory"
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          <small>{course.stageLabel}</small>
          <strong>第 {currentIndex + 1} / {lessons.length} 课</strong>
        </span>
        <span className="lesson-mobile-toggle-action">{open ? "收起" : "查看目录"} {open ? "↑" : "↓"}</span>
      </button>

      <div
        id="lesson-course-directory"
        className={"lesson-sidebar-details " + (open ? "is-open" : "")}
      >
        <Link className="lesson-logo" href="/learning-path#progress">
          <img src="/opc-logo.png" alt="OPC AI" />
          <span>OPC AI</span>
        </Link>

        <div className="kicker">{course.stageLabel}</div>
        <h2>{course.title}</h2>

        <div className="lesson-sidebar-progress">
          <div>
            <span>课程进度</span>
            <strong>{percent}%</strong>
          </div>
          <div className="mini-progress"><span style={{ width: percent + "%" }} /></div>
          <small>{done} / {lessons.length} 课时完成</small>
        </div>

        <div className="lesson-side-list">
          {lessons.map((item, itemIndex) => {
            const complete = ready && isCompleted(course.slug, item.id);
            const isLocked = locked.has(item.id);
            return (
              <Link
                key={item.id}
                href={"/courses/" + course.slug + "/lessons/" + item.id}
                className={
                  (item.id === currentLessonId ? "active " : "") +
                  (complete ? "is-complete " : "") +
                  (isLocked ? "is-locked" : "")
                }
                onClick={() => setOpen(false)}
              >
                <span>
                  {complete
                    ? "✓"
                    : isLocked
                      ? "🔒"
                      : String(itemIndex + 1).padStart(2, "0")}
                </span>
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}



