import type { CourseBuilderBuildDraft } from "./course-builder";
import { track03BatchADrafts } from "../../fixtures/course-builder/track03-batch-a";

export const track03BatchALessonSpecs = track03BatchADrafts.map(
  (draft) => (draft as CourseBuilderBuildDraft).lessonSpec
);
