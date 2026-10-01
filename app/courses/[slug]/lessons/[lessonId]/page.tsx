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
import { getTrack02BatchBRuntimePresentation } from "../../../../../lib/learning/track02-batch-b-runtime";
import { getTrack02BatchCRuntimePresentation } from "../../../../../lib/learning/track02-batch-c-runtime";
import { getTrack02BatchDRuntimePresentation } from "../../../../../lib/learning/track02-batch-d-runtime";
import { getTrack03BatchARuntimePresentation } from "../../../../../lib/learning/track03-batch-a-runtime";
import { getTrack03BatchesBERuntimePresentation } from "../../../../../lib/learning/track03-batches-b-e-runtime";
import { getTrack04RuntimePresentation } from "../../../../../lib/learning/track04-runtime";
import { getTrack05RuntimePresentation } from "../../../../../lib/learning/track05-runtime";
import { track02Catalog, track03Catalog, track04Catalog, track05Catalog } from "../../../../../lib/learning/track-catalog";
import {
  getCrossTrackNextLesson,
  learningPathHrefForCourse
} from "../../../../../lib/learning/track-navigation";
import { SESSION_COOKIE } from "../../../../../lib/server/auth/service";
import { getLessonPageContext } from "../../../../../lib/server/lesson-page/service";
import { getPublishedAdminCourseOverride } from "../../../../../lib/server/admin/course-maintenance";

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
  // Registered lesson content is reviewable before publication; the formal runtime stays closed.
  const currentCatalog = course.slug === "ai-work" ? track02Catalog : course.slug === "ai-growth" ? track03Catalog : course.slug === "ai-workflow" ? track04Catalog : course.slug === "fde" ? track05Catalog : null;
  if (
    currentCatalog?.some((stage) =>
      stage.lessons.some((item) => item.lessonId === lessonId && item.availability !== "AVAILABLE")
    )
  ) notFound();

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
      : course.slug === "ai-work" || course.slug === "ai-growth" || course.slug === "ai-workflow" || course.slug === "fde"
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
    const registeredSpec = getLessonSpec(course.slug, lesson.id);
    const approvedPresentation =
      getTrack01Phase1RuntimePresentation(course.slug, lesson.id) ??
      getTrack02BatchARuntimePresentation(course.slug, lesson.id) ??
      getTrack02BatchBRuntimePresentation(course.slug, lesson.id) ??
      getTrack02BatchCRuntimePresentation(course.slug, lesson.id) ??
      getTrack02BatchDRuntimePresentation(course.slug, lesson.id) ??
      getTrack03BatchARuntimePresentation(course.slug, lesson.id) ??
      getTrack03BatchesBERuntimePresentation(course.slug, lesson.id) ??
      getTrack04RuntimePresentation(course.slug, lesson.id) ??
      getTrack05RuntimePresentation(course.slug, lesson.id);

    if (!registeredSpec) {
      throw new Error("FORMAL_LESSON_SPEC_NOT_REGISTERED:" + course.slug + "/" + lesson.id);
    }
    if (!approvedPresentation) {
      throw new Error("FORMAL_LESSON_PRESENTATION_NOT_REGISTERED:" + course.slug + "/" + lesson.id);
    }

    const publishedOverride = await getPublishedAdminCourseOverride(course.slug, lesson.id);
    const snapshot = publishedOverride?.snapshot ?? null;
    const effectiveLesson = snapshot
      ? {
          ...lesson,
          title: snapshot.courseHeader.title,
          summary: snapshot.courseHeader.catalogSubtitle,
          whyItMatters: snapshot.courseHeader.lessonPageLead,
          example: {
            title: snapshot.example.title,
            situation: snapshot.example.situation,
            before: snapshot.example.before,
            after: snapshot.example.after,
            result: snapshot.example.result
          },
          mistakes: [...snapshot.review.mistakes],
          related: [...snapshot.review.related]
        }
      : lesson;
    const effectiveSpec = snapshot
      ? {
          ...registeredSpec,
          title: snapshot.courseHeader.title,
          steps: snapshot.stepMeta.map((step) => ({
            id: step.id,
            kind: step.kind,
            title: step.title,
            objective: step.objective,
            navigationDescription: step.navigationDescription
          })),
          capabilityGain: [...snapshot.capability.gain],
          nextLessonValue: snapshot.capability.nextLessonValue
        }
      : registeredSpec;
    const effectivePresentation = snapshot
      ? {
          ...approvedPresentation,
          activity: {
            title: snapshot.practice.activity.title,
            instruction: snapshot.practice.activity.instruction,
            prompt: snapshot.practice.activity.prompt || null,
            fields: snapshot.practice.instructions.map((item) => ({ ...item })),
            reflection: snapshot.practice.activity.reflection
          },
          introComparison: {
            ...approvedPresentation.introComparison,
            title: snapshot.intro.title,
            situation: snapshot.intro.situation,
            approaches: snapshot.intro.approaches.map((item) => ({ ...item })),
            bottomDetails: snapshot.intro.bottomDetails.map((item) => ({ ...item })),
            takeaway: snapshot.intro.takeaway
          },
          referenceAnswer: snapshot.practice.referenceAnswer || null,
          referenceFill: { ...snapshot.practice.referenceFill },
          knowledgeDepth: {
            example: snapshot.example.knowledgeDepth.map((item) => ({ ...item })),
            review: snapshot.review.knowledgeDepth.map((item) => ({ ...item }))
          },
          reviewItems: [...snapshot.review.items],
          reviewLabels: { ...snapshot.review.labels },
          selfAssessment: [...snapshot.capability.selfAssessment],
          triggerScenario: snapshot.capability.triggerScenario,
          capabilityTitle: snapshot.capability.title
        }
      : approvedPresentation;

    return (
      <FormalGuidedLessonView
        course={course}
        lesson={effectiveLesson}
        plan={buildLessonRuntimePlan(effectiveSpec)}
        approvedPresentation={effectivePresentation}
        index={index}
        lessonsLength={lessons.length}
        previous={previous}
        next={next}
        lockedLessonIds={lockedLessonIds}
        learningRecommendation={effectiveSpec.learningRecommendation ?? null}
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
