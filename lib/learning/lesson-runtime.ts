import type {
  CompletionGate,
  LessonSpec,
  RealAiEvidence
} from "./lesson-spec";

export const SUPPORTED_REAL_AI_EVIDENCE_KINDS = [
  "NONE",
  "USER_CONFIRMATION",
  "SYSTEM_RESULT"
] as const satisfies readonly RealAiEvidence[];

export function isRealAiEvidenceRuntimeSupported(kind: RealAiEvidence) {
  return SUPPORTED_REAL_AI_EVIDENCE_KINDS.includes(
    kind as (typeof SUPPORTED_REAL_AI_EVIDENCE_KINDS)[number]
  );
}

export type LessonRuntimePlan = {
  key: string;
  lessonType: LessonSpec["lessonType"];
  steps: LessonSpec["steps"];
  completionGates: CompletionGate[];
  requiresCheck: boolean;
  requiresPractice: boolean;
  requiresRealAi: boolean;
  realAiEvidence: RealAiEvidence;
  realAiEvidenceSupported: boolean;
};

export function buildLessonRuntimePlan(spec: LessonSpec): LessonRuntimePlan {
  return {
    key: spec.courseSlug + "/" + spec.lessonId,
    lessonType: spec.lessonType,
    steps: spec.steps,
    completionGates: [...new Set(spec.completionGates)],
    requiresCheck: spec.completionGates.includes("CHECK"),
    requiresPractice: spec.completionGates.includes("PRACTICE"),
    requiresRealAi: spec.completionGates.includes("REAL_AI"),
    realAiEvidence: spec.realAiEvidence,
    realAiEvidenceSupported: isRealAiEvidenceRuntimeSupported(spec.realAiEvidence)
  };
}
