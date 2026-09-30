import type { CourseBuilderBuildDraft } from "./course-builder";
import { track02BatchBDrafts } from "./course-content/track02-batch-b";

export const track02BatchBLessonSpecs = track02BatchBDrafts.map(
  (draft) => (draft as CourseBuilderBuildDraft).lessonSpec
);
