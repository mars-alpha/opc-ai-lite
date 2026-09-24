import Link from "next/link";
import type { Course, Lesson } from "../lib/courses";
import type { LessonRuntimePlan } from "../lib/learning/lesson-runtime";
import { AsyncLessonRuntimeShell } from "./AsyncLessonRuntimeShell";
import type { ApprovedPresentation } from "./GenericLessonRuntimePanel";
import { LessonCourseSidebar } from "./LessonCourseSidebar";
import { learningPathHrefForCourse } from "../lib/learning/track-navigation";

type LessonLink = { id: string; title: string; href?: string; label?: string } | null;

export function FormalGuidedLessonView({
  course,
  lesson,
  plan,
  approvedPresentation,
  index,
  lessonsLength,
  previous,
  next,
  lockedLessonIds,
  learningRecommendation = null
}: {
  course: Course;
  lesson: Lesson;
  plan: LessonRuntimePlan;
  approvedPresentation: ApprovedPresentation;
  index: number;
  lessonsLength: number;
  previous: LessonLink;
  next: LessonLink;
  lockedLessonIds: string[];
  learningRecommendation?: { title: string; href: string } | null;
}) {
  return (
    <section className="lesson-page">
      <div className="container lesson-shell guided-learning-shell">
        <LessonCourseSidebar
          course={course}
          currentLessonId={lesson.id}
          lockedLessonIds={lockedLessonIds}
        />

        <article className="lesson-content lesson-content-guided">
          <div className="lesson-topbar">
            <Link className="back-link" href={learningPathHrefForCourse(course.slug)}>← 返回学习路径</Link>
            <span>第 {index + 1} / {lessonsLength} 课 · 引导式学习</span>
          </div>

          <div className="guided-lesson-hero">
            <div className="kicker">OPC 引导式课程 · {plan.lessonType}</div>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="guided-lesson-outcome">
              <span>完成后你会获得</span>
              <strong>{plan.capabilityGain[0]}</strong>
            </div>
            {learningRecommendation ? (
              <div className="guided-runtime-read-note">
                学习建议：如果这些基础概念还不熟，可以先回到{" "}
                <Link href={learningRecommendation.href}>{learningRecommendation.title}</Link>{" "}
                补基础；这不会影响你继续学习当前课程。
              </div>
            ) : null}
          </div>

          <AsyncLessonRuntimeShell
            courseSlug={course.slug}
            lesson={lesson}
            plan={plan}
            approvedPresentation={approvedPresentation}
            previous={previous}
            next={next}
          />
        </article>
      </div>
    </section>
  );
}
