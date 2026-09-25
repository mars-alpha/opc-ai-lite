import type { CourseBuilderBuildDraft } from "./course-builder";
import { track02BatchCDrafts } from "../../fixtures/course-builder/track02-batch-c";

export const track02BatchCLessonSpecs = track02BatchCDrafts.map(
  (draft) => (draft as CourseBuilderBuildDraft).lessonSpec
);
