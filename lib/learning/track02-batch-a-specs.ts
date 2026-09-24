import type { CourseBuilderBuildDraft } from "./course-builder";
import { track02BatchADrafts } from "../../fixtures/course-builder/track02-batch-a";

type ApprovedTrack02Draft = CourseBuilderBuildDraft;

export const TRACK02_COURSE_SLUG = "ai-work";

export const track02BatchALessonSpecs = track02BatchADrafts.map(
  (draft) => (draft as ApprovedTrack02Draft).lessonSpec
);

export const track02BatchALessonIds = track02BatchALessonSpecs.map(
  (spec) => spec.lessonId
);
