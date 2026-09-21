"use client";

import type { CSSProperties } from "react";
import { foundationCatalog } from "../lib/learning/foundation-catalog";
import { useProgress } from "./ProgressProvider";

export function LearningBlockProgress() {
  const { ready, isCompleted } = useProgress();
  const lessons = foundationCatalog.flatMap((stage) => stage.lessons);
  const available = lessons.filter(
    (lesson) => lesson.availability === "AVAILABLE" && lesson.runtimeCourseSlug && lesson.runtimeLessonId
  );
  const done = ready
    ? available.filter((lesson) =>
        isCompleted(lesson.runtimeCourseSlug!, lesson.runtimeLessonId!)
      ).length
    : 0;
  const percent = available.length ? Math.round((done / available.length) * 100) : 0;

  return (
    <aside className="learning-block-progress" aria-label="当前学习板块进度">
      <div
        className="learning-progress-ring"
        style={{ "--learning-progress": percent } as CSSProperties}
        aria-label={"AI 基础认知完成 " + percent + "%"}
      >
        <div className="learning-progress-ring-inner">
          <strong>{percent}%</strong>
          <span>完成</span>
        </div>
      </div>

      <div className="learning-block-progress-copy">
        <span className="learning-progress-kicker">当前学习板块</span>
        <h3>AI 基础认知</h3>
        <p>7 个学习阶段 · 28 节基础课程</p>
      </div>

      <div className="learning-progress-stats">
        <div><strong>{done}</strong><span>已完成</span></div>
        <div><strong>{available.length}</strong><span>已开放</span></div>
        <div><strong>{lessons.length}</strong><span>总课程</span></div>
      </div>

      <p className="learning-progress-note">
        {available.length
          ? "进度只统计已经正式开放并可完成的课程。"
          : "课程正在按批次开放；未开放课程不会计入完成进度。"}
      </p>
    </aside>
  );
}
