"use client";

import {
  type CourseLearningHealthView,
  courseStatus,
  formatDate,
  healthLabel
} from "./learning-insight-view";

export function AdminLearningCourseQueue({
  courses,
  selectedCourseKey,
  totalCount,
  page,
  totalPages,
  search,
  statusFilter,
  onSearch,
  onStatusFilter,
  onSelect,
  onPage
}: {
  courses: CourseLearningHealthView[];
  selectedCourseKey: string | null;
  totalCount: number;
  page: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSelect: (courseKey: string) => void;
  onPage: (page: number) => void;
}) {
  return (
    <aside className="admin-learning-queue admin-learning-health-queue">
      <div className="admin-learning-queue-head">
        <div>
          <span>课程健康队列</span>
          <strong>{totalCount} 门</strong>
        </div>
        <small>优先看需要检查的课程</small>
      </div>

      <div className="admin-learning-queue-filters">
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="搜索课程"
          aria-label="搜索课程"
        />
        <select
          className="admin-learning-risk-filter"
          value={statusFilter}
          onChange={(event) => onStatusFilter(event.target.value)}
        >
          <option value="ALL">全部风险</option>
          <option value="ATTENTION">需要检查</option>
          <option value="WATCH">关注</option>
          <option value="NORMAL">正常</option>
        </select>
      </div>

      <div className="admin-learning-queue-list">
        {courses.length === 0 && <div className="admin-empty">当前筛选条件下没有课程。</div>}
        {courses.map((course) => (
          <button
            key={course.courseKey}
            type="button"
            className={
              "admin-learning-queue-item admin-learning-course-row " +
              (selectedCourseKey === course.courseKey ? "is-active " : "") +
              (course.healthStatus === "ATTENTION" ? "is-alert" : "")
            }
            onClick={() => onSelect(course.courseKey)}
          >
            <div className="admin-learning-queue-item-top">
              <strong>{course.lessonTitle}</strong>
              {course.simulation && <em>模拟测试</em>}
            </div>
            <div className="admin-learning-course-row-main">
              <span><b>{course.openIssueCount}</b> 个未处理</span>
              <span className={"admin-learning-health-state health-" + course.healthStatus.toLowerCase()}>
                <i className={"admin-learning-health-dot health-" + course.healthStatus.toLowerCase()} aria-hidden="true" />
                {healthLabel(course.healthStatus)}
              </span>
              {courseStatus(course) === "已进入分析" && <i>已进入分析</i>}
            </div>
            <small>
              {course.oldestOpenIssueAt ? "未处理自 " + formatDate(course.oldestOpenIssueAt) : "暂无未处理问题"}
              {course.affectedUserCount > 0 ? " · 学员影响 " + course.affectedUserCount + " 位" : ""}
            </small>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="admin-learning-pagination">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>上一页</button>
          <span>{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>下一页</button>
        </div>
      )}
    </aside>
  );
}
