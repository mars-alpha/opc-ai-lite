"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { Lesson } from "../lib/courses";
import type { LessonRuntimePlan } from "../lib/learning/lesson-runtime";
import {
  GenericLessonRuntimePanel,
  type ApprovedPresentation,
  type RuntimeData
} from "./GenericLessonRuntimePanel";
import { LessonCompleteButton } from "./LessonCompleteButton";
import { LessonFeedbackPrompt } from "./LessonFeedbackPrompt";

type LessonLink = { id: string; title: string } | null;

export function AsyncLessonRuntimeShell({
  courseSlug,
  lesson,
  plan,
  approvedPresentation,
  previous,
  next
}: {
  courseSlug: string;
  lesson: Lesson;
  plan: LessonRuntimePlan;
  approvedPresentation: ApprovedPresentation;
  previous: LessonLink;
  next: LessonLink;
}) {
  const [runtime, setRuntime] = useState<RuntimeData | null>(null);
  const handleRuntimeChange = useCallback((nextRuntime: RuntimeData) => {
    setRuntime(nextRuntime);
  }, []);

  return (
    <>
      {!runtime && (
        <div className="guided-runtime-read-note" role="status" aria-live="polite">
          正在读取学习进度…
        </div>
      )}

      <GenericLessonRuntimePanel
        courseSlug={courseSlug}
        lessonSlug={lesson.id}
        plan={plan}
        initialRuntime={null}
        lesson={lesson}
        approvedPresentation={approvedPresentation}
        onRuntimeChange={handleRuntimeChange}
        completionControl={
          <LessonCompleteButton
            courseSlug={courseSlug}
            lessonId={lesson.id}
            requiresPractice={plan.requiresPractice}
            inline
            disabled={runtime?.configurationReady !== true}
          />
        }
      />

      {runtime && (
        <nav className="lesson-nav lesson-nav-with-rating" aria-label="课时导航">
        {previous ? (
          <Link href={"/courses/" + courseSlug + "/lessons/" + previous.id}>
            <small>上一课</small>
            <strong>← {previous.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        <LessonFeedbackPrompt
          courseSlug={courseSlug}
          lessonSlug={lesson.id}
          nextHref={next ? "/courses/" + courseSlug + "/lessons/" + next.id : "/learning-path#progress"}
          nextTitle={next ? next.title : "返回学习路径"}
          nextLabel={next ? "继续下一课" : "本阶段课程完成"}
          showRating={runtime?.progress?.currentStep === 6}
          canRate={runtime?.canRate === true}
        />
        </nav>
      )}
    </>
  );
}
