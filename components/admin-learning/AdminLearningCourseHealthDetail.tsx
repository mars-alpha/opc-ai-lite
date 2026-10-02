"use client";

import { AdminLearningCourseDecision } from "./AdminLearningCourseDecision";
import { AdminLearningCourseHeader } from "./AdminLearningCourseHeader";
import { AdminLearningEvidencePanel } from "./AdminLearningEvidencePanel";
import { AdminLearningIssueSummary } from "./AdminLearningIssueSummary";
import { type CourseLearningHealthView } from "./learning-insight-view";

export function AdminLearningCourseHealthDetail({
  course,
  busy,
  message,
  onDecision
}: {
  course: CourseLearningHealthView | null;
  busy: boolean;
  message: string | null;
  onDecision: (decision: "ANALYZE" | "WATCH" | "DISMISS") => void;
}) {
  if (!course) {
    return (
      <section className="admin-learning-issue-workspace admin-learning-health-detail">
        <div className="admin-learning-no-selection">选择左侧一门课程查看健康详情。</div>
      </section>
    );
  }

  return (
    <section className="admin-learning-issue-workspace admin-learning-health-detail">
      <AdminLearningCourseHeader course={course} />

      <div className="admin-learning-detail-body">
        <AdminLearningIssueSummary course={course} />

        <AdminLearningEvidencePanel course={course} />

        <AdminLearningCourseDecision
          course={course}
          busy={busy}
          message={message}
          onDecision={onDecision}
        />
      </div>
    </section>
  );
}
