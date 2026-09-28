"use client";

import Link from "next/link";
import { curriculumStatusLabel, lessonTypeLabel } from "../lib/learning/foundation-catalog";
import { isTrackRuntimeLesson, type LearningTrackCatalog } from "../lib/learning/track-catalog";
import { useProgress } from "./ProgressProvider";

export function TrackCatalog({ track }: { track: LearningTrackCatalog }) {
  const { getStatus } = useProgress();

  return (
    <div className="foundation-catalog">
      <div className="foundation-catalog-legend" aria-label="课程目录状态说明">
        <span><i className="catalog-dot is-ready" />已上线：可直接进入课程</span>
      </div>
      {track.stages.map((stage, stageIndex) => (
        <section className="foundation-stage" key={stage.stageId}>
          <div className="foundation-stage-head">
            <div className="foundation-stage-index" aria-hidden="true"><i /></div>
            <div className="foundation-stage-copy"><h3>{stage.title}</h3><p>{stage.promise}</p></div>
            <div className="foundation-stage-count">{stage.lessons.length} 节</div>
          </div>
          <div className="foundation-lesson-list">
            {stage.lessons.map((lesson, lessonIndex) => {
              const runtimeReady = isTrackRuntimeLesson(lesson);
              const continuousNumber =
                track.slug === "foundation-ai" || track.slug === "ai-work"
                  ? track.stages
                      .slice(0, stageIndex)
                      .reduce((total, item) => total + item.lessons.length, 0) +
                    lessonIndex +
                    1
                  : lesson.order;
              const status = runtimeReady ? getStatus(lesson.runtimeCourseSlug!, lesson.runtimeLessonId!) : "NOT_STARTED";
              const row = <>
                <div className="foundation-lesson-number">{String(continuousNumber).padStart(2, "0")}</div>
                <div className="foundation-lesson-main">
                  <div className="foundation-lesson-title-row">
                    <h4>{lesson.title}</h4>
                    <div className="foundation-lesson-meta"><span>{lessonTypeLabel[lesson.lessonType]}</span><span>{lesson.estimatedMinutes} 分钟</span></div>
                  </div>
                  <p>{lesson.subtitle}</p>
                </div>
                <div className={"foundation-status " + (runtimeReady ? "is-ready" : "is-planned")}>
                  {runtimeReady ? (
                    <strong>{status === "COMPLETED" ? "已完成 →" : status === "IN_PROGRESS" ? "继续课程 →" : "开始课程 →"}</strong>
                  ) : (
                    <>
                      <strong>{curriculumStatusLabel[lesson.curriculumStatus]}</strong>
                      <span>{lesson.curriculumStatus === "IN_PRODUCTION" ? "准备开放" : "即将开放"}</span>
                    </>
                  )}
                </div>
              </>;
              return runtimeReady ? (
                <Link prefetch={false} className="foundation-lesson-row" key={lesson.lessonId} href={"/courses/" + lesson.runtimeCourseSlug + "/lessons/" + lesson.runtimeLessonId}>
                  {row}
                </Link>
              ) : (
                <article className="foundation-lesson-row is-coming-soon" key={lesson.lessonId}>{row}</article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
