import type { CourseBuilderBuildDraft } from "./course-builder";
import { track05BatchADrafts } from "../../fixtures/course-builder/track05-batch-a";
import { track05BatchBDrafts } from "../../fixtures/course-builder/track05-batch-b";
import { track05BatchCDrafts } from "../../fixtures/course-builder/track05-batch-c";
import { track05BatchDDrafts } from "../../fixtures/course-builder/track05-batch-d";
import { track05BatchEDrafts } from "../../fixtures/course-builder/track05-batch-e";
import { track05BatchFDrafts } from "../../fixtures/course-builder/track05-batch-f";

const drafts=[
  ...track05BatchADrafts,
  ...track05BatchBDrafts,
  ...track05BatchCDrafts,
  ...track05BatchDDrafts,
  ...track05BatchEDrafts,
  ...track05BatchFDrafts
] as CourseBuilderBuildDraft[];

export const track05LessonSpecs=drafts.map(d=>d.lessonSpec);