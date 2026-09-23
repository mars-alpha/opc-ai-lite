"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Course } from "../lib/courses";
import { useProgress } from "./ProgressProvider";

const SIDEBAR_COLLAPSE_STORAGE_PREFIX = "opc:lesson-sidebar:collapsed:";

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
  const [collapsedStageIds, setCollapsedStageIds] = useState<string[]>([]);
  const { ready, completedCount, isCompleted } = useProgress();
  const lessons = course.modules.flatMap((module) => module.lessons);
  const done = ready ? completedCount(course.slug) : 0;
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const currentIndex = Math.max(0, lessons.findIndex((item) => item.id === currentLessonId));
  const locked = new Set(lockedLessonIds);
  const storageKey = SIDEBAR_COLLAPSE_STORAGE_PREFIX + course.slug;

  const currentStageId = useMemo(
    () =>
      course.modules.find((module) =>
        module.lessons.some((lesson) => lesson.id === currentLessonId)
      )?.id ?? null,
    [course.modules, currentLessonId]
  );

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      setCollapsedStageIds(
        parsed.filter(
          (value): value is string =>
            typeof value === "string" && value !== currentStageId
        )
      );
    } catch {
      // Sidebar collapse state is optional UI state. Ignore unavailable storage.
    }
  }, [currentStageId, storageKey]);

  useEffect(() => {
    if (!currentStageId) return;
    setCollapsedStageIds((current) =>
      current.includes(currentStageId)
        ? current.filter((id) => id !== currentStageId)
        : current
    );
  }, [currentStageId]);

  function toggleStage(stageId: string) {
    if (stageId === currentStageId) return;

    setCollapsedStageIds((current) => {
      const next = current.includes(stageId)
        ? current.filter((id) => id !== stageId)
        : [...current, stageId];

      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // UI preference persistence must never block course navigation.
      }

      return next;
    });
  }

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
          {course.modules.map((module, moduleIndex) => {
            const lessonOffset = course.modules
              .slice(0, moduleIndex)
              .reduce((total, item) => total + item.lessons.length, 0);
            const isCurrentStage = module.id === currentStageId;
            const collapsed =
              !isCurrentStage && collapsedStageIds.includes(module.id);
            const moduleDone = ready
              ? module.lessons.filter((item) => isCompleted(course.slug, item.id)).length
              : 0;
            const lessonListId = "lesson-side-stage-" + module.id;

            return (
              <div
                className={"lesson-side-stage " + (collapsed ? "is-collapsed" : "is-expanded")}
                key={module.id}
              >
                <button
                  type="button"
                  className="lesson-side-stage-title"
                  aria-expanded={!collapsed}
                  aria-controls={lessonListId}
                  aria-label={
                    isCurrentStage
                      ? module.title + "，当前学习阶段，保持展开"
                      : module.title + (collapsed ? "，展开阶段" : "，折叠阶段")
                  }
                  disabled={isCurrentStage}
                  onClick={() => toggleStage(module.id)}
                >
                  <i aria-hidden="true" />
                  <strong>{module.title}</strong>
                  <span className="lesson-side-stage-progress">
                    {moduleDone} / {module.lessons.length}
                  </span>
                  <span className="lesson-side-stage-chevron" aria-hidden="true">
                    {collapsed ? "›" : "⌄"}
                  </span>
                </button>

                {!collapsed && (
                  <div className="lesson-side-stage-lessons" id={lessonListId}>
                    {module.lessons.map((item, itemIndex) => {
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
                                : String(lessonOffset + itemIndex + 1).padStart(2, "0")}
                          </span>
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
