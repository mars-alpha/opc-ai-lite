"use client";

import { useEffect, useMemo, useState } from "react";
import { type CourseLearningHealthView } from "./learning-insight-view";

type Status = "VALID" | "SUPPORTING_ONLY";
type Item = {
  evidence_ref: string;
  source_type: "LEARNING_ISSUE" | "TRUSTED_REVIEW_FEEDBACK" | "LEARNER_FEEDBACK" | "HELPFULNESS" | "CHECK" | "PRACTICE" | "LEARNING_EVENT";
  human_readable_source: string;
  evidence_status: Status;
  content: unknown;
  occurred_at: string | null;
};
type Evidence = {
  evidence_catalog: Item[];
};
type Feedback = { key: string; title: string; text: string; meta: string; occurredAt: string | null; status: Status };

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && Boolean(v.trim())) : [];
}
function dateText(value: string | null) {
  return value ? new Date(value).toLocaleDateString("zh-CN") : "";
}
function cleanFeedbackTitle(value: string) {
  return value.replace(/^学习反馈(?:汇总)?\s*#?\d*/i, "学员反馈").trim() || "学员反馈";
}
function feedbackRows(items: Item[]): Feedback[] {
  const rows: Feedback[] = [];
  for (const item of items) {
    const c = record(item.content);
    if (item.source_type === "LEARNER_FEEDBACK") {
      const comments = strings(c.comments);
      const reasons = strings(c.reasons);
      const base = {
        title: cleanFeedbackTitle(item.human_readable_source),
        occurredAt: item.occurred_at,
        status: item.evidence_status
      };
      if (!comments.length) {
        rows.push({ key: item.evidence_ref, ...base, text: "学员没有填写补充说明。", meta: String(c.distinct_users ?? 0) + " 位学员" });
      } else {
        comments.forEach((comment, index) => rows.push({
          key: item.evidence_ref + ":" + index,
          ...base,
          text: comment,
          meta: String(c.distinct_users ?? 0) + " 位学员" + (reasons.length ? " · 原因：" + reasons.join("、") : "")
        }));
      }
      continue;
    }
    if (item.source_type === "HELPFULNESS") {
      rows.push({
        key: item.evidence_ref,
        title: "课程帮助度",
        text: String(c.not_helpful_rate ?? 0) + "% 的学员认为本课帮助不大。",
        meta: String(c.users ?? 0) + " 位学员参与反馈",
        occurredAt: item.occurred_at,
        status: item.evidence_status
      });
      continue;
    }
    rows.push({
      key: item.evidence_ref,
      title: "人工核查反馈",
      text: typeof c.comment === "string" ? c.comment : "人工核查已记录。",
      meta: "",
      occurredAt: item.occurred_at,
      status: item.evidence_status
    });
  }
  return rows;
}
function behavior(item: Item) {
  const c = record(item.content);
  if (item.source_type === "CHECK") return { label: item.human_readable_source, value: String(c.incorrect_rate ?? 0) + "%", hint: String(c.users ?? 0) + " 位学员 · 检查错误率" };
  if (item.source_type === "PRACTICE") return { label: item.human_readable_source, value: typeof c.first_pass_rate === "number" ? c.first_pass_rate + "%" : "—", hint: String(c.participants ?? 0) + " 位学员 · 首次通过率" };
  if (c.event_name === "hint_revealed") return { label: "使用提示", value: String(c.hint_usage_rate ?? 0) + "%", hint: String(c.practice_users ?? 0) + " 位实操学员" };
  if (c.event_name === "still_confused") return { label: "仍然不懂", value: String(c.distinct_users ?? 0) + " 位", hint: String(c.count ?? 0) + " 次反馈 · 仅作辅助判断" };
  return { label: "真实 AI 实操", value: String(c.count ?? 0) + " 次", hint: String(c.distinct_users ?? 0) + " 位学员" };
}
function statusText(status: Status) {
  return status === "VALID" ? "用于判断" : "辅助参考";
}
export function AdminLearningEvidencePanel({ course }: { course: CourseLearningHealthView }) {
  const [tab, setTab] = useState<"FEEDBACK" | "BEHAVIOR">("FEEDBACK");
  const [data, setData] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [more, setMore] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setData(null);
    setMore(false);
    void fetch("/api/admin/learning/courses/" + encodeURIComponent(course.courseKey) + "/effective-evidence" + (course.simulation ? "?review=1" : ""))
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!active) return;
        if (!response.ok || !payload?.evidence) throw new Error("EVIDENCE_FAILED");
        setData(payload.evidence as Evidence);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [course.courseKey, course.simulation]);

  const feedback = useMemo(() => feedbackRows(data?.evidence_catalog.filter((i) => ["LEARNER_FEEDBACK", "HELPFULNESS", "TRUSTED_REVIEW_FEEDBACK"].includes(i.source_type)) ?? []), [data]);
  const behaviors = useMemo(() => data?.evidence_catalog.filter((i) => ["CHECK", "PRACTICE", "LEARNING_EVENT"].includes(i.source_type)) ?? [], [data]);
  const visible = feedback.slice(0, more ? feedback.length : 5);

  return (
    <section className="admin-learning-panel admin-learning-evidence-panel-v2">
      <div className="admin-learning-panel-head"><div><span>02</span><strong>真实数据</strong></div></div>
      <div className="admin-learning-learning-data admin-learning-evidence-clean">
        {loading && <div className="admin-learning-data-empty-flat">正在读取学习数据…</div>}
        {error && <div className="admin-message">学习数据读取失败，请稍后重试。</div>}

        {!loading && !error && data && <>
          <div className="admin-learning-data-switch" role="tablist" aria-label="学习数据">
            <button type="button" className={tab === "FEEDBACK" ? "is-active" : ""} onClick={() => setTab("FEEDBACK")}>学习反馈</button>
            <button type="button" className={tab === "BEHAVIOR" ? "is-active" : ""} onClick={() => setTab("BEHAVIOR")}>学习行为</button>
          </div>

          {tab === "FEEDBACK" && <section className="admin-learning-feedback-section">
            <div className="admin-learning-data-section-head">
              <div><strong>学习反馈</strong><span>直接看学员说了什么</span></div>
              {feedback.length > 5 && <button type="button" onClick={() => setMore((v) => !v)}>{more ? "收起" : "查看更多"}</button>}
            </div>
            {feedback.length === 0 ? <div className="admin-learning-data-empty-flat">当前没有可查看的学习反馈。</div> :
              <div className="admin-learning-feedback-rows">{visible.map((item) => <article key={item.key}>
                <div><strong>{item.title}</strong><span className={"admin-learning-evidence-status " + (item.status === "VALID" ? "is-valid" : "is-supporting")}>{statusText(item.status)}</span>{item.occurredAt && <time>{dateText(item.occurredAt)}</time>}</div>
                <p>{item.text}</p>{item.meta && <small>{item.meta}</small>}
              </article>)}</div>}
          </section>}

          {tab === "BEHAVIOR" && <section className="admin-learning-behavior-section">
            <div className="admin-learning-data-section-head"><div><strong>学习行为</strong><span>看学员在哪些步骤明显遇到困难</span></div></div>
            {behaviors.length === 0 ? <div className="admin-learning-data-empty-flat">当前没有达到统计条件的学习行为。</div> :
              <div className="admin-learning-behavior-grid">{behaviors.map((item) => {
                const card = behavior(item);
                return <div key={item.evidence_ref}><span>{card.label}</span><strong>{card.value}</strong><small>{card.hint}</small><em className={"admin-learning-evidence-status " + (item.evidence_status === "VALID" ? "is-valid" : "is-supporting")}>{statusText(item.evidence_status)}</em></div>;
              })}</div>}
          </section>}
        </>}
      </div>
    </section>
  );
}
