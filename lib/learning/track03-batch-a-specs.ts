import type { CourseBuilderBuildDraft } from "./course-builder";
import { track03BatchADrafts } from "./course-content/track03-batch-a";

export const track03BatchALessonSpecs = track03BatchADrafts.map(
  (draft) => (draft as CourseBuilderBuildDraft).lessonSpec
);
