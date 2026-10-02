"use client";

import { AdminLearningEvidenceDetail } from "../AdminLearningEvidenceDetail";
import { type CourseLearningHealthView, isGovernanceIssueCategory } from "./learning-insight-view";

export function AdminLearningEvidencePanel({
  course
}: {
  course: CourseLearningHealthView;
}) {
  const dataAnchor = course.issues.find(
    (issue) =>
      issue.sourceType === "INSIGHT" &&
      !isGovernanceIssueCategory(issue.issueCategory)
  );

  return (
    <section className="admin-learning-panel admin-learning-evidence-panel-v2">
      <div className="admin-learning-panel-head admin-learning-evidence-head">
        <div>
          <span>02</span>
          <strong>真实数据</strong>
        </div>
      </div>

      <div className="admin-learning-evidence-direct">
        {dataAnchor ? (
          <AdminLearningEvidenceDetail
            key={course.courseKey}
            insightId={dataAnchor.id}
            embedded
          />
        ) : (
          <div className="admin-learning-evidence-empty">
            当前课程暂无可读取的学习反馈或学习行为数据。
          </div>
        )}
      </div>
    </section>
  );
}
