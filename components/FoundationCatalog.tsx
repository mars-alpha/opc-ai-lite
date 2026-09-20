import { curriculumStatusLabel, foundationCatalog, lessonTypeLabel } from "../lib/learning/foundation-catalog";

export function FoundationCatalog() {
  return (
    <div className="foundation-catalog">
      <div className="foundation-catalog-legend" aria-label="课程目录状态说明">
        <span><i className="catalog-dot is-ready" />准备中：课程 Brief 已完成</span>
        <span><i className="catalog-dot is-planned" />规划中：已进入正式课程地图</span>
      </div>
      {foundationCatalog.map((stage) => (
        <section className="foundation-stage" key={stage.stageId}>
          <div className="foundation-stage-head">
            <div className="foundation-stage-index">{String(stage.order).padStart(2, "0")}</div>
            <div className="foundation-stage-copy"><h3>{stage.title}</h3><p>{stage.promise}</p></div>
            <div className="foundation-stage-count">{stage.lessons.length} 节</div>
          </div>
          <div className="foundation-lesson-list">
            {stage.lessons.map((lesson) => (
              <article className="foundation-lesson-row is-coming-soon" key={lesson.lessonId}>
                <div className="foundation-lesson-number">{String(lesson.order).padStart(2, "0")}</div>
                <div className="foundation-lesson-main">
                  <div className="foundation-lesson-title-row">
                    <h4>{lesson.title}</h4>
                    <div className="foundation-lesson-meta"><span>{lessonTypeLabel[lesson.lessonType]}</span><span>{lesson.estimatedMinutes} 分钟</span></div>
                  </div>
                  <p>{lesson.subtitle}</p>
                </div>
                <div className={"foundation-status " + (lesson.curriculumStatus === "BRIEF_READY" ? "is-ready" : "is-planned")}>
                  <strong>{curriculumStatusLabel[lesson.curriculumStatus]}</strong><span>即将开放</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
