import { lessonSpecValidationSamples } from "./lesson-spec-samples";
import type { LessonSpec } from "./lesson-spec";
import { track01FormalLessonSpecs } from "./track01-phase1-runtime";
import { track02BatchALessonSpecs } from "./track02-batch-a-specs";
import { track02BatchBLessonSpecs } from "./track02-batch-b-specs";

// Register new Tracks here so the shared formal presentation gate covers them.
export const formalLessonSpecs: readonly LessonSpec[] = [
  ...track01FormalLessonSpecs,
  ...track02BatchALessonSpecs,
  ...track02BatchBLessonSpecs
];

const registeredLessonSpecKeys = new Set([
  "chatgpt-worker/task-brief",
  "chatgpt-worker/writing-files",
  "ai-literacy/memory-rag",
  "ai-workflow/task-decomposition",
  ...formalLessonSpecs.map((spec) => spec.courseSlug + "/" + spec.lessonId)
]);

export function getLessonSpec(courseSlug: string, lessonId: string): LessonSpec | null {
  const key = courseSlug + "/" + lessonId;
  if (!registeredLessonSpecKeys.has(key)) return null;

  return (
    [...lessonSpecValidationSamples, ...formalLessonSpecs].find(
      (spec) => spec.courseSlug === courseSlug && spec.lessonId === lessonId
    ) ?? null
  );
}
