import { lessonSpecValidationSamples } from "./lesson-spec-samples";
import type { LessonSpec } from "./lesson-spec";
import { track01Phase1Specs } from "./track01-phase1-runtime";

const runtimeRegisteredLessonKeys = new Set([
  "chatgpt-worker/task-brief",
  "chatgpt-worker/writing-files",
  "ai-literacy/memory-rag",
  "ai-workflow/task-decomposition",
  ...track01Phase1Specs.map((spec) => spec.courseSlug + "/" + spec.lessonId)
]);

export function getLessonSpec(courseSlug: string, lessonId: string): LessonSpec | null {
  const key = courseSlug + "/" + lessonId;
  if (!runtimeRegisteredLessonKeys.has(key)) return null;

  return (
    [...lessonSpecValidationSamples, ...track01Phase1Specs].find(
      (spec) => spec.courseSlug === courseSlug && spec.lessonId === lessonId
    ) ?? null
  );
}
