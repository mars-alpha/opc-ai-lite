import type { LessonSpec } from "./lesson-spec";
import { track01FormalLessonSpecs } from "./track01-phase1-runtime";
import { track02BatchALessonSpecs } from "./track02-batch-a-specs";
import { track02BatchBLessonSpecs } from "./track02-batch-b-specs";
import { track02BatchCLessonSpecs } from "./track02-batch-c-specs";
import { track02BatchDLessonSpecs } from "./track02-batch-d-specs";
import { track03BatchALessonSpecs } from "./track03-batch-a-specs";
import { track03BatchesBELessonSpecs } from "./track03-batches-b-e-specs";
import { track04LessonSpecs } from "./track04-specs";
import { track05LessonSpecs } from "./track05-specs";

// Register new Tracks here so the shared formal presentation gate covers them.
export const formalLessonSpecs: readonly LessonSpec[] = [
  ...track01FormalLessonSpecs,
  ...track02BatchALessonSpecs,
  ...track02BatchBLessonSpecs,
  ...track02BatchCLessonSpecs,
  ...track02BatchDLessonSpecs,
  ...track03BatchALessonSpecs,
  ...track03BatchesBELessonSpecs,
  ...track04LessonSpecs,
  ...track05LessonSpecs
];

export function getLessonSpec(courseSlug: string, lessonId: string): LessonSpec | null {
  return (
    formalLessonSpecs.find(
      (spec) => spec.courseSlug === courseSlug && spec.lessonId === lessonId
    ) ?? null
  );
}
