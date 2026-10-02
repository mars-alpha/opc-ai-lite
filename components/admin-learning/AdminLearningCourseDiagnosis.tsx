"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdminLearningCourseCompareModal,
  type LearningChangeProposal
} from "./AdminLearningCourseCompareModal";
import { formatDate, issueLabel, type CourseLearningHealthView } from "./learning-insight-view";

type Diagnosis = {
  schema_version: "learning_issue_diagnosis_v2";
  decision: "CHANGE_RECOMMENDED" | "CONTINUE_OBSERVING" | "NO_CHANGE_NEEDED" | "INSUFFICIENT_EVIDENCE";
  problem_summary: string;
  root_causes: Array<{
    type: string;
    description: string;
    evidence_refs: string[];
  }>;
  courses: Array<{
    course_id: string;
    action: "MODIFY" | "REVIEW_ONLY" | "NOT_RELEVANT";
    reason: string;
    evidence_refs: string[];
  }>;
  targets: Array<{
    course_id: string;
    step: number;
    area: string;
    problem: string;
    change_goal: string;
    evidence_refs: string[];
  }>;
  observation_note: string | null;
};

type CurrentDiagnosis = {
  aiRunId: string;
  diagnosis: Diagnosis;
  modelProvider: string;
  model: string;
  createdAt: string;
  completedAt: string | null;
};

function decisionLabel(value: Diagnosis["decision"]) {
  if (value === "CHANGE_RECOMMENDED") return "建议调整";
  if (value === "CONTINUE_OBSERVING") return "继续观察";
  if (value === "NO_CHANGE_NEEDED") return "暂不调整";
  return "证据不足";
}

function actionLabel(value: Diagnosis["courses"][number]["action"]) {
  if (value === "MODIFY") return "建议修改";
  if (value === "REVIEW_ONLY") return "建议检查";
  return "暂不相关";
}

function rootCauseLabel(value: string) {
  const labels: Record<string, string> = {
    EXPLANATION_GAP: "讲解不够清楚",
    EXAMPLE_GAP: "例子不够贴近真实任务",
    BOUNDARY_CONFUSION: "概念边界不清",
    PRACTICE_INSTRUCTION_GAP: "实操指引不够明确",
    ASSESSMENT_WORDING_PROBLEM: "检查题表达有歧义",
    CONTENT_OUTDATED: "内容需要更新",
    CONTENT_POSSIBLY_INCORRECT: "内容需要核查",
    PREREQUISITE_GAP: "前置知识不足",
    COURSE_OVERLAP: "课程内容有重叠",
    OTHER: "其它原因"
  };
  return labels[value] ?? "其它原因";
}

function operatorText(value: string) {
  return value
    .replace(/有效证据支持的主要问题是\s*[：:]/g, "目前主要问题是：")
    .replace(/（\s*notHelpfulRate\s*\d+(?:\.\d+)?\s*）/gi, "")
    .replace(/（\s*hintUsageRate\s*\d+(?:\.\d+)?\s*）/gi, "")
    .replace(/（\s*有效实操首过率\s*\d+(?:\.\d+)?\s*）/g, "")
    .replace(/（\s*第\s*\d+\s*题错误率\s*\d+(?:\.\d+)?\s*）/g, "")
    .replace(/\bDONT_UNDERSTAND\b/g, "学员表示没看懂")
    .replace(/\bDONT_KNOW_HOW\b/g, "学员表示不知道怎么做")
    .replace(/\bLOW_HELPFULNESS\b/g, "课程帮助度偏低")
    .replace(/\bHIGH_HINT_USAGE\b/g, "提示使用偏高")
    .replace(/\bPRACTICE_DIFFICULTY\b/g, "实操通过困难")
    .replace(/\bCHECK_DIFFICULTY\b/g, "检查理解错误率偏高")
    .replace(/\bEffective Evidence Set\b/gi, "有效学习证据")
    .replace(/\bPrompt\b/gi, "提示词")
    .replace(/\bContext\b/gi, "上下文")
    .replace(/(?:^|[\s（(])(?:app|src|lib|components|docs|scripts)[\\/][^，。；;\s）)]+/gi, " ")
    .replace(/\b[\w.-]+\.(?:ts|tsx|js|jsx|cjs|mjs|md|json|sql)\b/gi, "")
    .replace(/\b(?:schema|source_owner|evidence_ref|candidate|validator|registry|snapshot)\b/gi, "")
    .replace(/\b[A-Z][A-Z0-9_]{2,}\b/g, "")
    .replace(/\b[a-z]+[A-Z][A-Za-z0-9_]*\b/g, "")
    .replace(/\s*[,，;；]\s*[,，;；]+/g, "；")
    .replace(/\s+/g, " ")
    .replace(/^[，。；：:\-\s]+|[，；：:\-\s]+$/g, "")
    .trim();
}

const STEP_LABELS = ["", "建立直觉", "讲透方法", "检查理解", "实操", "复盘判断框架", "能力获得"];

function courseDisplayName(courseId: string, course: CourseLearningHealthView) {
  return courseId === course.lessonId ? "当前课程" : "关联课程";
}

function areaLabel(area: string, step: number) {
  const normalized = area.toUpperCase();
  if (normalized.includes("EXAMPLE")) return "示例";
  if (normalized.includes("CHECK")) return "检查题";
  if (normalized.includes("PRACTICE")) return "实操";
  if (normalized.includes("REVIEW")) return "复盘内容";
  if (normalized.includes("CAPABILITY")) return "能力获得";
  if (normalized.includes("EXPLAIN")) return "讲解内容";
  const fallback = ["", "讲解内容", "方法内容", "检查题", "实操", "复盘内容", "能力获得"];
  return fallback[step] ?? "课程内容";
}

function evidenceLabel(ref: string, course: CourseLearningHealthView) {
  const match = /^(issue|risk|feedback|check|practice|event):(\d+)$/.exec(ref);
  if (!match) return "相关证据";
  const index = Number(match[2]);
  if (match[1] === "issue" || match[1] === "risk") {
    const sourceType = match[1] === "issue" ? "INSIGHT" : "QUALITY_RISK";
    const items = course.issues
      .filter((item) => item.sourceType === sourceType)
      .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
    const item = items[index - 1];
    return item
      ? "问题 " + index + " · " + issueLabel(item.issueCategory) + " · " + formatDate(item.createdAt)
      : "问题 " + index;
  }
  if (match[1] === "feedback") return "学员反馈";
  if (match[1] === "check") return "检查理解 · 第 " + index + " 项证据";
  if (match[1] === "practice") return "实操 · 第 " + index + " 项证据";
  return "学习行为 · 第 " + index + " 项证据";
}

export function AdminLearningCourseDiagnosis({
  course,
  analysisRunToken,
  analysisRunCourseKey,
  compareOpenToken,
  compareOpenCourseKey,
  onAnalysisStateChange,
  onPublished
}: {
  course: CourseLearningHealthView;
  analysisRunToken: number;
  analysisRunCourseKey: string | null;
  compareOpenToken: number;
  compareOpenCourseKey: string | null;
  onAnalysisStateChange: (state: { running: boolean; ready: boolean; completed: boolean }) => void;
  onPublished: () => void;
}) {
  const analysisReady = useMemo(
    () => course.issues.some((issue) => ["ANALYSIS_READY", "UNDER_REVIEW"].includes(issue.status)),
    [course.issues]
  );
  const [current, setCurrent] = useState<CurrentDiagnosis | null>(null);
  const [proposal, setProposal] = useState<LearningChangeProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const lastRunToken = useRef(0);
  const lastCompareToken = useRef(0);

  const suffix = course.simulation ? "?review=1" : "";

  useEffect(() => {
    let active = true;

    // A fresh analysis was just requested. Do not preload the previous
    // diagnosis/proposal while the new Task A / Task B run is starting,
    // otherwise the "更新对照" button can briefly show stale data and then
    // disappear when the fresh run clears proposal state.
    if (
      analysisRunCourseKey === course.courseKey &&
      analysisRunToken > lastRunToken.current
    ) {
      return () => {
        active = false;
      };
    }

    setCurrent(null);
    setProposal(null);
    setMessage(null);
    setCompareOpen(false);
    onAnalysisStateChange({ running: false, ready: false, completed: false });

    if (!analysisReady) {
      return () => {
        active = false;
      };
    }

    void fetch(
      "/api/admin/learning/courses/" +
        encodeURIComponent(course.courseKey) +
        "/diagnosis" +
        suffix
    )
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!active || !response.ok || !payload?.diagnosis) return;
        const loadedDiagnosis = payload.diagnosis as CurrentDiagnosis;
        setCurrent(loadedDiagnosis);

        const proposalResponse = await fetch(
          "/api/admin/learning/courses/" +
            encodeURIComponent(course.courseKey) +
            "/proposal" +
            suffix
        );
        const proposalPayload = await proposalResponse.json().catch(() => null);
        if (!active) return;
        if (!proposalResponse.ok || !proposalPayload?.proposal) {
          onAnalysisStateChange({ running: false, ready: false, completed: true });
          setMessage(
            loadedDiagnosis.diagnosis.decision === "CONTINUE_OBSERVING"
              ? "AI 已完成整课综合诊断：建议继续观察，本次不生成更新对照。"
              : loadedDiagnosis.diagnosis.decision === "NO_CHANGE_NEEDED"
                ? "AI 已完成整课综合诊断：当前课程无需修改，本次不生成更新对照。"
                : loadedDiagnosis.diagnosis.decision === "INSUFFICIENT_EVIDENCE"
                  ? "AI 已完成整课综合诊断：当前证据不足，本次不生成更新对照。"
                  : "AI 已完成整课综合诊断，本次没有生成更新对照。"
          );
          return;
        }
        const nextProposal = proposalPayload.proposal as LearningChangeProposal;
        setProposal(nextProposal);
        onAnalysisStateChange({
          running: false,
          ready: nextProposal.patch.decision === "PATCH_PROPOSED",
          completed: true
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [analysisReady, analysisRunCourseKey, analysisRunToken, course.courseKey, course.simulation]);

  async function runFullAnalysis() {
    if (loading || !analysisReady) return;
    setLoading(true);
    setMessage(null);
    setProposal(null);
    onAnalysisStateChange({ running: true, ready: false, completed: false });

    try {
      const diagnosisResponse = await fetch(
        "/api/admin/learning/courses/" +
          encodeURIComponent(course.courseKey) +
          "/diagnosis" +
          suffix,
        { method: "POST" }
      );
      const diagnosisPayload = await diagnosisResponse.json().catch(() => null);
      if (!diagnosisResponse.ok || !diagnosisPayload?.result?.diagnosis) {
        throw new Error(diagnosisPayload?.error ?? "TASK_A_FAILED");
      }

      const nextDiagnosis: CurrentDiagnosis = {
        aiRunId: diagnosisPayload.result.aiRunId,
        diagnosis: diagnosisPayload.result.diagnosis,
        modelProvider: "",
        model: "",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      setCurrent(nextDiagnosis);

      if (nextDiagnosis.diagnosis.decision !== "CHANGE_RECOMMENDED") {
        setMessage("AI 已完成整课综合诊断，本次没有生成课程更新对照。");
        onAnalysisStateChange({ running: false, ready: false, completed: true });
        return;
      }

      const proposalResponse = await fetch(
        "/api/admin/learning/courses/" +
          encodeURIComponent(course.courseKey) +
          "/proposal" +
          suffix,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "GENERATE" })
        }
      );
      const proposalPayload = await proposalResponse.json().catch(() => null);
      if (!proposalResponse.ok || !proposalPayload?.result?.patch) {
        throw new Error(proposalPayload?.error ?? "TASK_B_FAILED");
      }

      const nextProposal = proposalPayload.result as LearningChangeProposal;
      setProposal(nextProposal);
      const ready = nextProposal.patch.decision === "PATCH_PROPOSED";
      onAnalysisStateChange({ running: false, ready, completed: true });
      setMessage(
        ready
          ? "整课诊断与更新对照已生成，可点击上方“更新对照”查看学员观感。"
          : nextProposal.patch.decision === "REQUIRES_MANUAL_STRUCTURE_CHANGE"
            ? "AI 判断需要调整课程结构，当前不自动生成文本更新对照。"
            : "AI 完成诊断，但没有生成需要修改的文本。"
      );
    } catch (error) {
      const code = error instanceof Error ? error.message : "TASK_A_FAILED";
      setMessage(
        code === "AI_ANALYSIS_NOT_CONFIGURED"
          ? "当前 AI 模型不可用，请检查 DeepSeek 配置。"
          : code === "TASK_A_EFFECTIVE_EVIDENCE_EMPTY"
            ? "当前没有足够的有效证据，AI 未运行。"
            : "AI 综合诊断失败，请检查有效证据或模型状态后重试。"
      );
      onAnalysisStateChange({ running: false, ready: false, completed: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      analysisRunToken <= 0 ||
      analysisRunCourseKey !== course.courseKey ||
      analysisRunToken === lastRunToken.current ||
      !analysisReady
    ) {
      return;
    }
    lastRunToken.current = analysisRunToken;
    void runFullAnalysis();
  }, [analysisRunCourseKey, analysisRunToken, analysisReady, course.courseKey]);

  useEffect(() => {
    if (
      compareOpenToken <= 0 ||
      compareOpenCourseKey !== course.courseKey ||
      compareOpenToken === lastCompareToken.current ||
      proposal?.patch.decision !== "PATCH_PROPOSED"
    ) {
      return;
    }
    lastCompareToken.current = compareOpenToken;
    setCompareOpen(true);
  }, [compareOpenCourseKey, compareOpenToken, course.courseKey, proposal]);

  return (
    <>
      <section className="admin-learning-panel admin-learning-diagnosis-panel">
        <div className="admin-learning-panel-head">
          <div><span>04</span><strong>AI 综合诊断</strong></div>
          <small>整门课程诊断</small>
        </div>

        <div className="admin-learning-diagnosis-body">
          {loading && (
            <p className="admin-learning-diagnosis-empty">
              AI 正在根据有效证据分析整门课程并生成更新对照…
            </p>
          )}

          {!loading && !current && (
            <p className="admin-learning-diagnosis-empty">
              等待AI分析，给出整课综合诊断
            </p>
          )}

          {!loading && current && (
            <div className="admin-learning-diagnosis-result">
              <div className="admin-learning-diagnosis-summary">
                <div>
                  <span>{decisionLabel(current.diagnosis.decision)}</span>
                  <strong>整课判断</strong>
                </div>
                <p>{operatorText(current.diagnosis.problem_summary)}</p>
              </div>

              {current.diagnosis.root_causes.length > 0 && (
                <div className="admin-learning-diagnosis-section">
                  <h4>核心原因</h4>
                  {current.diagnosis.root_causes.map((item, index) => (
                    <div key={index} className="admin-learning-diagnosis-row">
                      <div className="admin-learning-diagnosis-tag-row">
                        <span className="admin-learning-diagnosis-tag">{rootCauseLabel(item.type)}</span>
                      </div>
                      <p>{operatorText(item.description)}</p>
                      <small>
                        依据：{item.evidence_refs.map((ref) => evidenceLabel(ref, course)).join("；")}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              {current.diagnosis.courses.length > 0 && (
                <div className="admin-learning-diagnosis-section">
                  <h4>课程判断</h4>
                  {current.diagnosis.courses.map((item) => (
                    <div key={item.course_id} className="admin-learning-diagnosis-course">
                      <div>
                        <strong>{courseDisplayName(item.course_id, course)}</strong>
                        <span>{actionLabel(item.action)}</span>
                      </div>
                      <p>{operatorText(item.reason)}</p>
                    </div>
                  ))}
                </div>
              )}

              {current.diagnosis.targets.length > 0 && (
                <div className="admin-learning-diagnosis-section">
                  <h4>建议关注范围</h4>
                  {current.diagnosis.targets.map((item, index) => (
                    <div key={index} className="admin-learning-diagnosis-target">
                      <div className="admin-learning-diagnosis-target-head">
                        <span className="admin-learning-diagnosis-step">
                          第 {item.step} 步 · {STEP_LABELS[item.step]}
                        </span>
                      </div>
                      <div className="admin-learning-diagnosis-target-copy">
                        <p>{operatorText(item.problem)}</p>
                        <small><b>建议调整：</b>{operatorText(item.change_goal)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {current.diagnosis.observation_note &&
                ["CONTINUE_OBSERVING", "INSUFFICIENT_EVIDENCE"].includes(
                  current.diagnosis.decision
                ) && (
                  <div className="admin-learning-diagnosis-note">
                    <strong>继续观察</strong>
                    <p>{current.diagnosis.observation_note}</p>
                  </div>
                )}

              {proposal?.patch.decision === "PATCH_PROPOSED" && (
                <small className="admin-learning-next-stage-note">
                  更新对照已准备完成，可点击上方“更新对照”查看、修改并发布。
                </small>
              )}
            </div>
          )}

          {message && <div className="admin-message">{message}</div>}
        </div>
      </section>

      {compareOpen && proposal?.patch.decision === "PATCH_PROPOSED" && (
        <AdminLearningCourseCompareModal
          course={course}
          proposal={proposal}
          onClose={() => setCompareOpen(false)}
          onPublished={() => {
            setMessage("课程已发布，课程维护已留下“课程反馈更新”历史记录。");
            onAnalysisStateChange({ running: false, ready: false, completed: true });
            onPublished();
          }}
        />
      )}
    </>
  );
}
