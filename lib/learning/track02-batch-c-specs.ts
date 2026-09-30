import type { CourseBuilderBuildDraft } from "./course-builder";
import { track02BatchCDrafts } from "./course-content/track02-batch-c";

export const track02BatchCLessonSpecs = track02BatchCDrafts.map(
  (draft) => (draft as CourseBuilderBuildDraft).lessonSpec
);
