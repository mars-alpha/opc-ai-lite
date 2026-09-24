import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { FormalGuidedLessonView } from "../../../../../components/FormalGuidedLessonView";
import { LessonLockedView } from "../../../../../components/LessonLockedView";
import { LegacyStaticLessonView } from "../../../../../components/legacy-learning/LegacyStaticLessonView";
import { courses, getAllLessons, getCourse, getLesson } from "../../../../../lib/courses";
import {
  isFormalRuntimeCourse,
  isLegacyStaticCourse
} from "../../../../../lib/learning/course-runtime-boundaries";
import { getLessonSpec } from "../../../../../lib/learning/lesson-spec-registry";
import { buildLessonRuntimePlan } from "../../../../../lib/learning/lesson-runtime";
import { getTrack01Phase1RuntimePresentation } from "../../../../../lib/learning/track01-phase1-runtime";
import { getTrack02BatchARuntimePresentation } from "../../../../../lib/learning/track02-batch-a-runtime";
import {
  getCrossTrackNextLesson,
  learningPathHrefForCourse
} from "../../../../../lib/learning/track-navigation";
import { SESSION_COOKIE } from "../../../../../lib/server/auth/service";
import { getLessonPageContext } from "../../../../../lib/server/lesson-page/service";
import { getLearningPrerequisiteRecommendation } from "../../../../../lib/server/entitlements/service";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return courses.flatMap((course) =>
    getAllLessons(course).map((lesson) => ({ slug: course.slug, lessonId: lesson.id }))
  );
}

export default async function LessonPage({
  params
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const staticLesson = getLesson(course, lessonId);
  if (!staticLesson) notFound();

  const formalRuntimeCourse = isFormalRuntimeCourse(course.slug);
  const cookieStore = await cookies();
  const { user, lesson, access, lockedLessonIds } = await getLessonPageContext({
    sessionToken: cookieStore.get(SESSION_COOKIE)?.value ?? null,
    courseSlug: course.slug,
    lessonSlug: lessonId,
    staticLesson,
    preferStaticLesson: formalRuntimeCourse
  });

  const lessons = getAllLessons(course);
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = index > 0 ? lessons[index - 1] : null;
  const nextLesson = index < lessons.length - 1 ? lessons[index + 1] : null;
  const previous =
    previousLesson
      ? { id: previousLesson.id, title: previousLesson.title }
      : course.slug === "ai-work"
        ? {
            id: "learning-map",
            title: "学习地图",
            href: learningPathHrefForCourse(course.slug),
            label: "上一项"
          }
        : null;
  const next =
    nextLesson
      ? { id: nextLesson.id, title: nextLesson.title }
      : getCrossTrackNextLesson(course.slug, lesson.id);
  const currentPath = "/courses/" + course.slug + "/lessons/" + lesson.id;

  if (!user) {
    redirect("/auth?mode=login&returnTo=" + encodeURIComponent(currentPath));
  }

  if (!access.allowed) {
    return (
      <LessonLockedView
        course={course}
        lesson={lesson}
        index={index}
        lessonsLength={lessons.length}
        lockedLessonIds={lockedLessonIds}
        accessReason={access.reason}
      />
    );
  }

  if (formalRuntimeCourse) {
    const prerequisiteRecommendation =
      course.slug === "ai-work"
        ? await getLearningPrerequisiteRecommendation(user.id, course.slug)
        : { satisfied: true as const };
    const registeredSpec = getLessonSpec(course.slug, lesson.id);
    const approvedPresentation =
      getTrack01Phase1RuntimePresentation(course.slug, lesson.id) ??
      getTrack02BatchARuntimePresentation(course.slug, lesson.id);

    if (!registeredSpec) {
      throw new Error("FORMAL_LESSON_SPEC_NOT_REGISTERED:" + course.slug + "/" + lesson.id);
    }
    if (!approvedPresentation) {
      throw new Error("FORMAL_LESSON_PRESENTATION_NOT_REGISTERED:" + course.slug + "/" + lesson.id);
    }

    return (
      <FormalGuidedLessonView
        course={course}
        lesson={lesson}
        plan={buildLessonRuntimePlan(registeredSpec)}
        approvedPresentation={approvedPresentation}
        index={index}
        lessonsLength={lessons.length}
        previous={previous}
        next={next}
        lockedLessonIds={lockedLessonIds}
        learningRecommendation={
          prerequisiteRecommendation.satisfied
            ? null
            : {
                title: "AI 基础认知",
                href: "/learning-path?track=foundation-ai#foundation-catalog",
                concepts: "提示词、上下文、结果核验和知识来源这些基础能力"
              }
        }
      />
    );
  }

  if (!isLegacyStaticCourse(course.slug)) {
    throw new Error("LESSON_RENDERER_NOT_REGISTERED:" + course.slug + "/" + lesson.id);
  }

  return (
    <LegacyStaticLessonView
      course={course}
      lesson={lesson}
      lessons={lessons}
      index={index}
      previous={previousLesson}
      next={nextLesson}
      lockedLessonIds={lockedLessonIds}
      authenticated
    />
  );
}
