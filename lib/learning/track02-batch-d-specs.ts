import type { CourseBuilderBuildDraft } from "./course-builder";
import { track02BatchDDrafts } from "../../fixtures/course-builder/track02-batch-d";

export const track02BatchDLessonSpecs = track02BatchDDrafts.map(
  (draft) => (draft as CourseBuilderBuildDraft).lessonSpec
);
