"use client";

import {
  type CourseLearningHealthView,
  healthLabel
} from "./learning-insight-view";

export function AdminLearningCourseHeader({ course }: { course: CourseLearningHealthView }) {
  return (
    <>
      <header className="admin-learning-course-header">
        <div>
          <span>课程健康详情</span>
          <h2>{course.lessonTitle}</h2>
        </div>
        <div className="admin-learning-course-header-status">
          {course.simulation && <span>模拟测试</span>}
          <strong className={"health-" + course.healthStatus.toLowerCase()}>
            {healthLabel(course.healthStatus)}
          </strong>
        </div>
      </header>

      <div className="admin-learning-course-stats admin-learning-course-stats-compact">
        <div><span>累计反馈</span><strong>{course.feedbackCount} 条</strong></div>
        <div><span>学员影响</span><strong>{course.affectedUserCount > 0 ? course.affectedUserCount + " 位" : "—"}</strong></div>
        <div><span>处理次数</span><strong>{course.updateCount} 次</strong></div>
      </div>
    </>
  );
}
