import { assertValidLessonSpec, validateLessonSpec } from "../lib/learning/lesson-spec";
import {
  lessonSpecValidationSamples,
  validateCurrentRuntimeSupport
} from "../lib/learning/lesson-spec-samples";

let failed = false;

for (const spec of lessonSpecValidationSamples) {
  try {
    assertValidLessonSpec(spec);
  } catch (error) {
    failed = true;
    console.error("SPEC_INVALID", spec.courseSlug + "/" + spec.lessonId, error);
    continue;
  }

  const warnings = validateLessonSpec(spec).filter((item) => item.severity === "WARNING");
  const runtime = validateCurrentRuntimeSupport(spec);

  console.log(
    [
      spec.courseSlug + "/" + spec.lessonId,
      "TYPE=" + spec.lessonType,
      "REAL_AI=" + spec.realAiOperation,
      "SPEC=PASS",
      "RUNTIME=" + (runtime.ready ? "READY" : "NEEDS_RUNTIME")
    ].join(" ")
  );

  for (const warning of warnings) console.log("  WARNING", warning.code, warning.message);
  for (const blocker of runtime.blockers) console.log("  BLOCKER", blocker);
}

if (failed) process.exit(1);
