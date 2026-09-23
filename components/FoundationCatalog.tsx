"use client";

import Link from "next/link";
import { curriculumStatusLabel, foundationCatalog, isFoundationRuntimeLesson, lessonTypeLabel } from "../lib/learning/foundation-catalog";
import { useProgress } from "./ProgressProvider";

export function FoundationCatalog() {
  const { getStatus } = useProgress();

  return (
    <div className="foundation-catalog">
      <div className="foundation-catalog-legend" aria-label="课程目录状态说明">
        <span><i className="catalog-dot is-ready" />已上线：可直接进入课程</span>
      </div>
      {foundationCatalog.map((stage) => (
        <section className="foundation-stage" key={stage.stageId}>
          <div className="foundation-stage-head">
            <div className="foundation-stage-index" aria-hidden="true"><i /></div>
            <div className="foundation-stage-copy"><h3>{stage.title}</h3><p>{stage.promise}</p></div>
            <div className="foundation-stage-count">{stage.lessons.length} 节</div>
          </div>
          <div className="foundation-lesson-list">
            {stage.lessons.map((lesson) => {
              const runtimeReady = isFoundationRuntimeLesson(lesson);
              const status = runtimeReady
                ? getStatus(lesson.runtimeCourseSlug!, lesson.runtimeLessonId!)
                : "NOT_STARTED";
              const row = <>
                <div className="foundation-lesson-number">{String(lesson.order).padStart(2, "0")}</div>
                <div className="foundation-lesson-main">
                  <div className="foundation-lesson-title-row">
                    <h4>{lesson.title}</h4>
                    <div className="foundation-lesson-meta"><span>{lessonTypeLabel[lesson.lessonType]}</span><span>{lesson.estimatedMinutes} 分钟</span></div>
                  </div>
                  <p>{lesson.subtitle}</p>
                </div>
                <div className={"foundation-status " + (lesson.availability === "COMING_SOON" ? "is-planned" : "is-ready")}>
                  {runtimeReady ? (
                    <strong>
                      {status === "COMPLETED"
                        ? "已完成 →"
                        : status === "IN_PROGRESS"
                          ? "继续课程 →"
                          : "开始课程 →"}
                    </strong>
                  ) : (
                    <>
                      <strong>{curriculumStatusLabel[lesson.curriculumStatus]}</strong>
                      <span>即将开放</span>
                    </>
                  )}
                </div>
              </>;
              return runtimeReady ? (
                <Link
                  prefetch={false}
                  className="foundation-lesson-row"
                  key={lesson.lessonId}
                  href={"/courses/" + lesson.runtimeCourseSlug + "/lessons/" + lesson.runtimeLessonId}
                >
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
