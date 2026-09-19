"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LearningCatalogCourse } from "../lib/learning/catalog";
import { useProgress } from "./ProgressProvider";

const sixStages = [
  { index: "01", name: "AI Literacy", label: "看懂 AI", courseSlug: "ai-literacy" },
  { index: "02", name: "AI Worker", label: "用好 AI", courseSlug: "chatgpt-worker" },
  { index: "03", name: "AI Workflow", label: "建立工作流认知", courseSlug: "ai-workflow" },
  { index: "04", name: "AI Growth", label: "AI 运营与增长" },
  { index: "05", name: "AI Solution Builder", label: "做出 AI 解决方案" },
  { index: "06", name: "FDE", label: "真实业务落地" }
];

export function StageProgress({ catalog }: { catalog: LearningCatalogCourse[] }) {
  const router = useRouter();
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const {
    ready,
    authenticated,
    completedCount,
    isCompleted,
    isEnrolled,
    enrollCourse
  } = useProgress();

  const baseStageRows = sixStages.map((stage) => {
    const course = stage.courseSlug ? catalog.find((item) => item.slug === stage.courseSlug) : undefined;
    const lessons = course?.lessons ?? [];
    const total = lessons.length;
    const done = course && ready ? completedCount(course.slug) : 0;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const joined = Boolean(course && authenticated && isEnrolled(course.slug));
    const nextLesson = course
      ? lessons.find((lesson) => !isCompleted(course.slug, lesson.id)) ?? lessons[0]
      : undefined;
    const href = course && nextLesson
      ? "/courses/" + course.slug + "/lessons/" + nextLesson.id
      : undefined;
    const cta = joined ? "继续学习" : "加入学习";

    return { ...stage, course, total, done, percent, href, cta, joined };
  });

  const stageRows = baseStageRows.map((stage, index) => {
    const priorAvailableStages = baseStageRows
      .slice(0, index)
      .filter((item) => item.course);
    const prerequisiteMet = priorAvailableStages.every((item) => item.percent === 100);
    return {
      ...stage,
      prerequisiteMet,
      cta: prerequisiteMet ? stage.cta : "先完成上一阶段"
    };
  });

  const availableStages = stageRows.filter((stage) => stage.course);
  const completedStages = availableStages.filter((stage) => stage.percent === 100).length;
  const totalLessons = availableStages.reduce((sum, stage) => sum + stage.total, 0);
  const doneLessons = availableStages.reduce((sum, stage) => sum + stage.done, 0);
  const overall = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  async function openStage(stage: (typeof stageRows)[number]) {
    if (!stage.course || !stage.href || !stage.prerequisiteMet) return;

    if (!authenticated) {
      const params = new URLSearchParams({
        mode: "register",
        courseSlug: stage.course.slug,
        returnTo: stage.href
      });
      router.push("/auth?" + params.toString());
      return;
    }

    if (!stage.joined) {
      setJoiningSlug(stage.course.slug);
      try {
        await enrollCourse(stage.course.slug);
      } finally {
        setJoiningSlug(null);
      }
    }
    router.push(stage.href);
  }

  return (
    <div className="stage-progress-shell">
      <div className="stage-progress-summary">
        <div>
          <div className="kicker">Stage progress</div>
          <strong>{ready ? overall : 0}%</strong>
          <p>加入课程后从这里直接继续当前课时，不再经过课程中间页。</p>
        </div>
        <div className="stage-summary-stats">
          <span><b>{completedStages}</b> / 6 阶段完成</span>
          <span><b>{doneLessons}</b> / {totalLessons} 课时完成</span>
        </div>
      </div>

      <div className="stage-progress-list">
        {stageRows.map((stage) => {
          const complete = stage.percent === 100;
          const active = stage.course && !complete;
          const isJoining = stage.course && joiningSlug === stage.course.slug;

          const body = (
            <>
              <span className="stage-progress-index">{complete ? "✓" : stage.index}</span>
              <div className="stage-progress-copy">
                <small>{stage.name}</small>
                <h3>{stage.label}</h3>
                <div className="stage-mini-bar"><span style={{ width: stage.percent + "%" }} /></div>
              </div>
              <div className="stage-progress-state">
                {stage.course ? (
                  <>
                    <strong>{stage.percent}%</strong>
                    <span>{complete ? "阶段完成" : !stage.prerequisiteMet ? "未解锁" : stage.done > 0 ? "学习中" : stage.joined ? "已加入" : "可加入"}</span>
                  </>
                ) : (
                  <>
                    <strong>—</strong>
                    <span>后续开放</span>
                  </>
                )}
              </div>
              <span className="stage-progress-action">
                {stage.course ? (isJoining ? "正在加入…" : stage.prerequisiteMet ? stage.cta + " →" : stage.cta) : "规划中"}
              </span>
            </>
          );

          return stage.href && stage.prerequisiteMet ? (
            <button
              className={"stage-progress-row stage-progress-link stage-progress-button " + (complete ? "is-complete" : active ? "is-active" : "is-locked")}
              key={stage.index}
              type="button"
              onClick={() => openStage(stage)}
              disabled={Boolean(isJoining)}
            >
              {body}
            </button>
          ) : (
            <div className="stage-progress-row is-locked" key={stage.index}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}








