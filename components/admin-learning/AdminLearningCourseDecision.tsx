"use client";

import { type CourseLearningHealthView } from "./learning-insight-view";

export function AdminLearningCourseDecision({
  course,
  busy,
  message,
  onDecision,
  onManualEdit,
  analysisRunning,
  comparisonReady,
  analysisCompleted,
  onOpenCompare
}: {
  course: CourseLearningHealthView;
  busy: boolean;
  message: string | null;
  onDecision: (decision: "ANALYZE" | "WATCH" | "DISMISS") => void;
  onManualEdit: () => void;
  analysisRunning: boolean;
  comparisonReady: boolean;
  analysisCompleted: boolean;
  onOpenCompare: () => void;
}) {
  return (
    <section className="admin-learning-panel admin-learning-decision-panel">
      <div className="admin-learning-panel-head">
        <div><span>03</span><strong>处理这门课程</strong></div>
        <small>人工确认 · 第 1 关</small>
      </div>
      <div className="admin-learning-decision-body">
        <div className="admin-learning-decision-control">
          <div className="admin-learning-gate1-actions">
            <button
              className="btn admin-learning-dismiss-btn"
              type="button"
              disabled={busy || analysisRunning || course.simulation}
              onClick={() => onDecision("DISMISS")}
            >
              无需处理
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={busy || analysisRunning || course.simulation}
              onClick={() => onDecision("WATCH")}
            >
              继续观察
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={busy || analysisRunning || !course.maintenanceKey || course.simulation}
              onClick={onManualEdit}
              title={course.simulation ? "模拟测试数据不创建正式课程草稿" : undefined}
            >
              人工修正
            </button>
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy || analysisRunning}
              onClick={comparisonReady ? onOpenCompare : () => onDecision("ANALYZE")}
            >
              {analysisRunning ? "AI分析中…" : comparisonReady ? "更新对照" : analysisCompleted ? "重新分析" : "AI分析"}
            </button>
          </div>
          <p>
            {comparisonReady
              ? "AI 已完成整课综合诊断和修改建议，可打开更新对照，按学员实际观感审核、修改后发布。"
              : analysisCompleted
                ? "AI 已完成整课综合诊断，本次没有生成课程更新对照。可查看下方诊断结果，或在证据变化后重新分析。"
              : "确认现有有效证据后，AI 会一次完成整课综合诊断和具体修改建议。"}
          </p>
        </div>
        {course.simulation && (
          <small className="admin-learning-next-stage-note">
            模拟测试允许本地运行 AI 和查看更新对照，但不会执行人工草稿或正式发布。
          </small>
        )}
        {message && <div className="admin-message">{message}</div>}
      </div>
    </section>
  );
}
