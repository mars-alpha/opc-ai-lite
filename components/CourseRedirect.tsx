"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "../lib/courses";
import { getAllLessons } from "../lib/courses";
import { useProgress } from "./ProgressProvider";

export function CourseRedirect({ course }: { course: Course }) {
  const router = useRouter();
  const { ready, isCompleted } = useProgress();

  useEffect(() => {
    if (!ready) return;
    const lessons = course.modules.flatMap((module) => module.lessons);
    const next = lessons.find((lesson) => !isCompleted(course.slug, lesson.id)) ?? lessons[0];
    if (next) {
      router.replace("/courses/" + course.slug + "/lessons/" + next.id);
    } else {
      router.replace("/learning-path#progress");
    }
  }, [course, isCompleted, ready, router]);

  return (
    <section className="course-redirect">
      <div className="container">
        <div className="course-redirect-card">
          <img src="/opc-logo.png" alt="" />
          <span>正在进入你的学习进度…</span>
        </div>
      </div>
    </section>
  );
}



