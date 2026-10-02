import "server-only";

import { formalLessonSpecs } from "../../learning/lesson-spec-registry";
import { learningTracks } from "../../learning/track-catalog";
import type { LessonSpec } from "../../learning/lesson-spec";
import { getFormalAdminCourseSnapshot, type AdminCourseSnapshot } from "./course-snapshot";

export type AdminCourseRegistryItem = {
  trackSlug: string;
  trackIndex: string;
  trackTitle: string;
  stageId: string;
  stageTitle: string;
  stageOrder: number;
  lessonId: string;
  lessonTitle: string;
  lessonSubtitle: string;
  learnerOutcome: string;
  lessonOrder: number;
  lessonType: LessonSpec["lessonType"];
  specVersion: string;
  runtimeCourseSlug: string;
  runtimeLessonId: string;
  availability: "AVAILABLE";
  contentState: "FROZEN";
  preview: AdminCourseSnapshot;
};

export type AdminCourseRegistrySummary = {
  tracks: number;
  stages: number;
  lessons: number;
  availableLessons: number;
  frozenLessons: number;
};

const specByKey = new Map(
  formalLessonSpecs.map((spec) => [spec.courseSlug + "/" + spec.lessonId, spec] as const)
);

export function listAdminCourseRegistry(): {
  summary: AdminCourseRegistrySummary;
  items: AdminCourseRegistryItem[];
} {
  const tracks = Object.values(learningTracks);
  const items = tracks.flatMap((track) =>
    track.stages.flatMap((stage) =>
      stage.lessons.map((lesson) => {
        const runtimeCourseSlug = lesson.runtimeCourseSlug;
        const runtimeLessonId = lesson.runtimeLessonId;

        if (
          lesson.curriculumStatus !== "AVAILABLE" ||
          lesson.availability !== "AVAILABLE" ||
          !runtimeCourseSlug ||
          !runtimeLessonId
        ) {
          throw new Error("ADMIN_COURSE_REGISTRY_NON_FORMAL_LESSON:" + lesson.lessonId);
        }

        const key = runtimeCourseSlug + "/" + runtimeLessonId;
        const spec = specByKey.get(key);
        if (!spec) {
          throw new Error("ADMIN_COURSE_REGISTRY_SPEC_MISSING:" + key);
        }

        return {
          trackSlug: track.slug,
          trackIndex: track.index,
          trackTitle: track.title,
          stageId: stage.stageId,
          stageTitle: stage.title,
          stageOrder: stage.order,
          lessonId: lesson.lessonId,
          lessonTitle: lesson.title,
          lessonSubtitle: lesson.subtitle,
          learnerOutcome: lesson.learnerOutcome,
          lessonOrder: lesson.order,
          lessonType: spec.lessonType,
          specVersion: spec.version,
          runtimeCourseSlug,
          runtimeLessonId,
          availability: "AVAILABLE" as const,
          contentState: "FROZEN" as const,
          preview: getFormalAdminCourseSnapshot(runtimeCourseSlug, runtimeLessonId, lesson.subtitle)
        };
      })
    )
  );

  return {
    summary: {
      tracks: tracks.length,
      stages: tracks.reduce((total, track) => total + track.stages.length, 0),
      lessons: items.length,
      availableLessons: items.filter((item) => item.availability === "AVAILABLE").length,
      frozenLessons: items.filter((item) => item.contentState === "FROZEN").length
    },
    items
  };
}
