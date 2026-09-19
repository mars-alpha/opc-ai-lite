"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LearningCatalogCourse } from "../lib/learning/catalog";
import { useProgress } from "./ProgressProvider";

function authHref(courseSlug: string, returnTo: string) {
  const params = new URLSearchParams({
    mode: "register",
    courseSlug,
    returnTo
  });
  return "/auth?" + params.toString();
}

export function ContinueLearning({ catalog }: { catalog: LearningCatalogCourse[] }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const {
    ready,
    authenticated,
    isCompleted,
    completedCount,
    isEnrolled,
    enrollCourse,
    storageMode,
    warning
  } = useProgress();

  if (!ready) {
    return <div className="continue-learning-card is-loading">正在读取你的学习进度…</div>;
  }

  const enrolled = catalog.filter((course) => isEnrolled(course.slug));
  const inProgress = enrolled.find((course) => {
    const total = course.lessons.length;
    return completedCount(course.slug) < total;
  });
  const course = inProgress ?? enrolled[0] ?? catalog[0];
  if (!course) return null;
  const lessons = course.lessons;
  const done = completedCount(course.slug);
  const next = lessons.find((lesson) => !isCompleted(course.slug, lesson.id)) ?? lessons[0];
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const joined = authenticated && isEnrolled(course.slug);

  async function handleAction() {
    if (!next) return;
    const href = "/courses/" + course.slug + "/lessons/" + next.id;

    if (!authenticated) {
      router.push(authHref(course.slug, href));
      return;
    }

    if (!joined) {
      setJoining(true);
      try {
        await enrollCourse(course.slug);
      } finally {
        setJoining(false);
      }
    }
    router.push(href);
  }

  return (
    <section className="continue-learning-card">
      <div className="continue-logo"><img src="/opc-logo.png" alt="" /></div>
      <div className="continue-copy">
        <div className="kicker">{joined ? "Continue learning" : "Join learning"}</div>
        <small>{course.stageLabel}</small>
        <h2>{joined && done > 0 ? "继续：" + next.title : course.title}</h2>
        <p>
          {joined
            ? next.summary
            : "注册并加入学习后，课程和进度会保存到你的账户中。"}
        </p>
        <div className="continue-progress"><span style={{ width: percent + "%" }} /></div>
        <div className="continue-meta">{done} / {lessons.length} 课时 · {percent}%</div>
        {storageMode === "local" && warning && (
          <div className="learning-storage-note">{warning}</div>
        )}
      </div>
      <button className="btn btn-primary" type="button" onClick={handleAction} disabled={joining}>
        {joining ? "正在加入…" : joined ? "继续学习" : "加入学习"} →
      </button>
    </section>
  );
}



