import type { CourseBuilderBuildDraft } from "./course-builder";
import { track03BatchBDrafts } from "./course-content/track03-batch-b";
import { track03BatchCDrafts } from "./course-content/track03-batch-c";
import { track03BatchDDrafts } from "./course-content/track03-batch-d";
import { track03BatchEDrafts } from "./course-content/track03-batch-e";

export const track03BatchesBELessonSpecs = [
  ...track03BatchBDrafts,
  ...track03BatchCDrafts,
  ...track03BatchDDrafts,
  ...track03BatchEDrafts
].map((draft) => (draft as CourseBuilderBuildDraft).lessonSpec);
