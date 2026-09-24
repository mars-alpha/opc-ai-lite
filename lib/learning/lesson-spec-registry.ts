import { lessonSpecValidationSamples } from "./lesson-spec-samples";
import type { LessonSpec } from "./lesson-spec";
import { track01FormalLessonSpecs } from "./track01-phase1-runtime";
import { track02BatchALessonSpecs } from "./track02-batch-a-specs";

const registeredLessonSpecKeys = new Set([
  "chatgpt-worker/task-brief",
  "chatgpt-worker/writing-files",
  "ai-literacy/memory-rag",
  "ai-workflow/task-decomposition",
  ...track01FormalLessonSpecs.map((spec) => spec.courseSlug + "/" + spec.lessonId),
  ...track02BatchALessonSpecs.map((spec) => spec.courseSlug + "/" + spec.lessonId)
]);

export function getLessonSpec(courseSlug: string, lessonId: string): LessonSpec | null {
  const key = courseSlug + "/" + lessonId;
  if (!registeredLessonSpecKeys.has(key)) return null;

  return (
    [...lessonSpecValidationSamples, ...track01FormalLessonSpecs, ...track02BatchALessonSpecs].find(
      (spec) => spec.courseSlug === courseSlug && spec.lessonId === lessonId
    ) ?? null
  );
}
