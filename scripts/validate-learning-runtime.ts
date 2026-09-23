import {
  buildLessonRuntimePlan,
  isRealAiEvidenceRuntimeSupported
} from "../lib/learning/lesson-runtime";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { lessonSpecValidationSamples } from "../lib/learning/lesson-spec-samples";
import {
  taskBriefRuntimeFixture,
  taskDecompositionRuntimeFixture
} from "../lib/learning/lesson-runtime-samples";
import {
  parsePracticeSubmissionSchema,
  validatePracticeSubmission
} from "../lib/learning/practice-submission";
import { rulePracticeEvaluator } from "../lib/learning/practice-evaluator";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const taskBriefSchema = parsePracticeSubmissionSchema(taskBriefRuntimeFixture.schema);
assert(taskBriefSchema.kind === "TASK_BRIEF_V1", "TASK_BRIEF_SCHEMA");
const taskBriefContent = validatePracticeSubmission(
  taskBriefRuntimeFixture.schema,
  taskBriefRuntimeFixture.content
);
const taskBriefEvaluation = await rulePracticeEvaluator({
  content: taskBriefContent,
  rubric: taskBriefRuntimeFixture.rubric,
  passScore: taskBriefRuntimeFixture.passScore
});
assert(taskBriefEvaluation.passed, "TASK_BRIEF_EVALUATION");

const structuredSchema = parsePracticeSubmissionSchema(
  taskDecompositionRuntimeFixture.schema
);
assert(structuredSchema.kind === "STRUCTURED_TEXT_V1", "STRUCTURED_SCHEMA");
const structuredContent = validatePracticeSubmission(
  taskDecompositionRuntimeFixture.schema,
  taskDecompositionRuntimeFixture.content
);
const structuredEvaluation = await rulePracticeEvaluator({
  content: structuredContent,
  rubric: taskDecompositionRuntimeFixture.rubric,
  passScore: taskDecompositionRuntimeFixture.passScore
});
assert(structuredEvaluation.passed, "STRUCTURED_EVALUATION");

const camelCaseSchema = parsePracticeSubmissionSchema({
  kind: "STRUCTURED_TEXT_V1",
  fields: [
    { key: "mustKnow", label: "这次提供给 AI 的必要信息", minLength: 1, maxLength: 3000 }
  ]
});
assert(camelCaseSchema.kind === "STRUCTURED_TEXT_V1", "STRUCTURED_CAMEL_CASE_SCHEMA");
const camelCaseContent = validatePracticeSubmission(camelCaseSchema, {
  mustKnow: "只提供会直接影响当前任务结果的必要信息。"
});
assert(Boolean(camelCaseContent.mustKnow), "STRUCTURED_CAMEL_CASE_CONTENT");

let rejectedMissingField = false;
try {
  validatePracticeSubmission(taskDecompositionRuntimeFixture.schema, {
    ...taskDecompositionRuntimeFixture.content,
    failure: ""
  });
} catch (error) {
  rejectedMissingField =
    error instanceof Error && error.message === "INVALID_PRACTICE_CONTENT";
}
assert(rejectedMissingField, "STRUCTURED_MISSING_FIELD_REJECTED");

const plans = Object.fromEntries(
  lessonSpecValidationSamples.map((spec) => [
    spec.courseSlug + "/" + spec.lessonId,
    buildLessonRuntimePlan(spec)
  ])
);

const memoryPlan = plans["ai-literacy/memory-rag"];
assert(memoryPlan.requiresCheck, "MEMORY_RAG_CHECK");
assert(!memoryPlan.requiresPractice, "MEMORY_RAG_NO_PRACTICE");

const workflowPlan = plans["ai-workflow/task-decomposition"];
assert(workflowPlan.requiresPractice, "WORKFLOW_PRACTICE");
assert(!workflowPlan.requiresRealAi, "WORKFLOW_NO_REAL_AI");

const writingPlan = plans["chatgpt-worker/writing-files"];
assert(writingPlan.requiresCheck, "WRITING_CHECK");
assert(writingPlan.requiresPractice, "WRITING_PRACTICE");
assert(writingPlan.requiresRealAi, "WRITING_REAL_AI");
assert(writingPlan.realAiEvidence === "ARTIFACT", "WRITING_ARTIFACT");
assert(!writingPlan.realAiEvidenceSupported, "WRITING_ARTIFACT_NOT_SUPPORTED");
assert(
  isRealAiEvidenceRuntimeSupported("USER_CONFIRMATION"),
  "USER_CONFIRMATION_SUPPORTED"
);
assert(isRealAiEvidenceRuntimeSupported("SYSTEM_RESULT"), "SYSTEM_RESULT_SUPPORTED");
assert(!isRealAiEvidenceRuntimeSupported("ARTIFACT"), "ARTIFACT_REQUIRES_RESOLVER");
assert(
  getLessonSpec("ai-literacy", "memory-rag") !== null,
  "MEMORY_RAG_RUNTIME_REGISTERED"
);
assert(
  getLessonSpec("ai-workflow", "task-decomposition") !== null,
  "TASK_DECOMPOSITION_RUNTIME_REGISTERED"
);
assert(
  getLessonSpec("chatgpt-worker", "writing-files") !== null,
  "WRITING_FILES_REGISTERED_FOR_UNIFIED_APPLICATION_UX"
);
assert(
  !writingPlan.realAiEvidenceSupported,
  "WRITING_FILES_REGISTERED_BUT_NOT_RUNTIME_READY"
);

console.log("TASK_BRIEF_V1=PASS score=" + taskBriefEvaluation.score);
console.log("STRUCTURED_TEXT_V1=PASS score=" + structuredEvaluation.score);
console.log("STRUCTURED_TEXT_CAMEL_CASE=PASS");
console.log("MISSING_FIELD_REJECTED=PASS");
console.log("MEMORY_RAG_PLAN=PASS");
console.log("TASK_DECOMPOSITION_PLAN=PASS");
console.log("WRITING_FILES_REAL_AI_PLAN=PASS");
console.log("APPLICATION_UX_REGISTRATION_BOUNDARY=PASS");
console.log("REAL_AI_EVIDENCE_BOUNDARY=PASS");
console.log("RUNTIME_REGISTRY_BOUNDARY=PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
