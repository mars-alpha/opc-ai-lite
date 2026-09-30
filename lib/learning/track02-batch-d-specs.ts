import type { CourseBuilderBuildDraft } from "./course-builder";
import { track02BatchDDrafts } from "./course-content/track02-batch-d";

export const track02BatchDLessonSpecs = track02BatchDDrafts.map(
  (draft) => (draft as CourseBuilderBuildDraft).lessonSpec
);
