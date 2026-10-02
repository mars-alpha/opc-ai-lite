"use client";

import { AdminLearningCourseDecision } from "./AdminLearningCourseDecision";
import { AdminLearningCourseDiagnosis } from "./AdminLearningCourseDiagnosis";
import { AdminLearningCourseHeader } from "./AdminLearningCourseHeader";
import { AdminLearningEvidencePanel } from "./AdminLearningEvidencePanel";
import { AdminLearningIssueSummary } from "./AdminLearningIssueSummary";
import { type CourseLearningHealthView } from "./learning-insight-view";

export function AdminLearningCourseHealthDetail({
  course,
  busy,
  message,
  onDecision,
  onManualEdit,
  analysisRunning,
  comparisonReady,
  analysisCompleted,
  analysisRunToken,
  analysisRunCourseKey,
  compareOpenToken,
  compareOpenCourseKey,
  onOpenCompare,
  onAnalysisStateChange,
  onPublished
}: {
  course: CourseLearningHealthView | null;
  busy: boolean;
  message: string | null;
  onDecision: (decision: "ANALYZE" | "WATCH" | "DISMISS") => void;
  onManualEdit: () => void;
  analysisRunning: boolean;
  comparisonReady: boolean;
  analysisCompleted: boolean;
  analysisRunToken: number;
  analysisRunCourseKey: string | null;
  compareOpenToken: number;
  compareOpenCourseKey: string | null;
  onOpenCompare: () => void;
  onAnalysisStateChange: (state: { running: boolean; ready: boolean; completed: boolean }) => void;
  onPublished: () => void;
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
          onManualEdit={onManualEdit}
        analysisRunning={analysisRunning}
        comparisonReady={comparisonReady}
        analysisCompleted={analysisCompleted}
          onOpenCompare={onOpenCompare}
        />

      <AdminLearningCourseDiagnosis
        course={course}
        analysisRunToken={analysisRunToken}
        analysisRunCourseKey={analysisRunCourseKey}
        compareOpenToken={compareOpenToken}
        compareOpenCourseKey={compareOpenCourseKey}
        onAnalysisStateChange={onAnalysisStateChange}
        onPublished={onPublished}
      />
      </div>
    </section>
  );
}
