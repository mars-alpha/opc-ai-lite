"use client";

import {
  type CourseLearningHealthView,
  formatDate,
  isGovernanceIssueCategory,
  issueLabel
} from "./learning-insight-view";

export function AdminLearningIssueSummary({
  course
}: {
  course: CourseLearningHealthView;
}) {
  const sortedGroups = [...course.issueGroups].sort((left, right) => {
    const leftGovernance = isGovernanceIssueCategory(left.category) ? 1 : 0;
    const rightGovernance = isGovernanceIssueCategory(right.category) ? 1 : 0;
    return leftGovernance - rightGovernance;
  });

  return (
    <section className="admin-learning-panel admin-learning-issue-summary admin-learning-issue-summary-classic">
      <div className="admin-learning-panel-head">
        <div>
          <span>01</span>
          <strong>问题汇总</strong>
        </div>
        <small>按课程累计统计</small>
      </div>

      <div className="admin-learning-category-table">
        <div className="admin-learning-category-table-head">
          <span>问题类型</span>
          <span>次数</span>
          <span>首次</span>
          <span>最近</span>
          <span>学员影响</span>
        </div>
        {sortedGroups.map((group) => (
          <div
            key={group.category}
            className={[
              "admin-learning-category-row",
              isGovernanceIssueCategory(group.category) ? "is-governance" : ""
            ].filter(Boolean).join(" ")}
          >
            <strong>{issueLabel(group.category)}</strong>
            <span>{group.occurrenceCount}</span>
            <span>{formatDate(group.firstSeenAt)}</span>
            <span>{formatDate(group.lastSeenAt)}</span>
            <span>{isGovernanceIssueCategory(group.category) ? "—" : "≥ " + group.affectedUserCount + " 位"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
