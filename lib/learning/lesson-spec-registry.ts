import { lessonSpecValidationSamples } from "./lesson-spec-samples";
import type { LessonSpec } from "./lesson-spec";

const runtimeRegisteredLessonKeys = new Set([
  "chatgpt-worker/task-brief",
  "ai-literacy/memory-rag",
  "ai-workflow/task-decomposition"
]);

export function getLessonSpec(courseSlug: string, lessonId: string): LessonSpec | null {
  const key = courseSlug + "/" + lessonId;
  if (!runtimeRegisteredLessonKeys.has(key)) return null;

  return (
    lessonSpecValidationSamples.find(
      (spec) => spec.courseSlug === courseSlug && spec.lessonId === lessonId
    ) ?? null
  );
}
