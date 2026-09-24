"use client";

import type { CSSProperties } from "react";
import { isTrackRuntimeLesson, type LearningTrackCatalog } from "../lib/learning/track-catalog";
import { useProgress } from "./ProgressProvider";

export function LearningBlockProgress({ track }: { track: LearningTrackCatalog }) {
  const { ready, isCompleted } = useProgress();
  const lessons = track.stages.flatMap((stage) => stage.lessons);
  const activeLessons = lessons.filter(isTrackRuntimeLesson);
  const done = ready
    ? activeLessons.filter((lesson) => isCompleted(lesson.runtimeCourseSlug!, lesson.runtimeLessonId!)).length
    : 0;
  const percent = activeLessons.length ? Math.round((done / activeLessons.length) * 100) : 0;

  return (
    <aside className="learning-block-progress" aria-label="当前学习板块进度">
      <div className="learning-progress-ring" style={{ "--learning-progress": percent } as CSSProperties} aria-label={track.title + "完成 " + percent + "%"}>
        <div className="learning-progress-ring-inner"><strong>{percent}%</strong><span>完成</span></div>
      </div>
      <div className="learning-block-progress-copy">
        <span className="learning-progress-kicker">当前学习板块</span>
        <h3>{track.title}</h3>
        <p>{track.stages.length} 个学习分组 · {lessons.length} 节核心课程</p>
      </div>
      <div className="learning-progress-stats">
        <div><strong>{done}</strong><span>已完成</span></div>
        <div><strong>{activeLessons.length}</strong><span>已开放</span></div>
        <div><strong>{lessons.length}</strong><span>总课程</span></div>
      </div>
      <p className="learning-progress-note">
        {activeLessons.length ? "进度只统计当前板块已经开放并可记录正式学习状态的课程。" : "课程目录已经确定；Runtime 尚未开放的课程不会制造假进度。"}
      </p>
    </aside>
  );
}
