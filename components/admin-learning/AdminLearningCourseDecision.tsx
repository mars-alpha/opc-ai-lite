"use client";

import { type CourseLearningHealthView } from "./learning-insight-view";

export function AdminLearningCourseDecision({
  course,
  busy,
  message,
  onDecision
}: {
  course: CourseLearningHealthView;
  busy: boolean;
  message: string | null;
  onDecision: (decision: "ANALYZE" | "WATCH" | "DISMISS") => void;
}) {
  const analysisReady = course.issues.some((issue) =>
    ["ANALYSIS_READY", "UNDER_REVIEW"].includes(issue.status)
  );

  return (
    <section className="admin-learning-panel admin-learning-decision-panel">
      <div className="admin-learning-panel-head">
        <div><span>03</span><strong>处理这门课程</strong></div>
        <small>人工确认 · 第 1 关</small>
      </div>
      <div className="admin-learning-decision-body">
        <div className="admin-learning-decision-control">
          <div className="admin-learning-gate1-actions">
            <button className="btn admin-learning-dismiss-btn" type="button" disabled={busy || course.simulation} onClick={() => onDecision("DISMISS")}>
              无需处理
            </button>
            <button className="btn btn-secondary" type="button" disabled={busy || course.simulation} onClick={() => onDecision("WATCH")}>
              继续观察
            </button>
            <button className="btn btn-primary" type="button" disabled={busy || course.simulation} onClick={() => onDecision("ANALYZE")}>
              AI 综合分析课程
            </button>
          </div>
          <p>确认现有证据是否足够，再决定是否把整门课程的累计问题一次性交给 AI 综合诊断。</p>
        </div>
        {course.simulation && <small className="admin-learning-next-stage-note">模拟测试数据仅用于界面审核，真实业务动作已禁用。</small>}
        {message && <div className="admin-message">{message}</div>}
        {analysisReady && (
          <small className="admin-learning-next-stage-note">
            已完成第一关人工确认。AI 综合诊断尚未接入，不会自动修改课程。
          </small>
        )}
      </div>
    </section>
  );
}
