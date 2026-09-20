import "server-only";

import type { PracticeContent } from "../../learning/practice-evaluator";

export type PracticeSubmissionSchema = {
  kind: "TASK_BRIEF_V1";
};

export type SupportedSubmissionKind = PracticeSubmissionSchema["kind"];

export function parsePracticeSubmissionSchema(input: unknown): PracticeSubmissionSchema {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_SUBMISSION_SCHEMA");
  }

  const kind = (input as { kind?: unknown }).kind;
  if (kind === "TASK_BRIEF_V1") return { kind };
  throw new Error("UNSUPPORTED_SUBMISSION_SCHEMA");
}

function validateTaskBriefV1(input: unknown): PracticeContent {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_PRACTICE_CONTENT");
  }

  const source = input as Record<string, unknown>;
  const keys: (keyof PracticeContent)[] = [
    "goal",
    "context",
    "input",
    "constraint",
    "output"
  ];
  const content = {} as PracticeContent;

  for (const key of keys) {
    const value = source[key];
    if (typeof value !== "string") throw new Error("INVALID_PRACTICE_CONTENT");
    const normalized = value.trim();
    if (!normalized || normalized.length > 3000) {
      throw new Error("INVALID_PRACTICE_CONTENT");
    }
    content[key] = normalized;
  }

  return content;
}

const validators: Record<
  SupportedSubmissionKind,
  (input: unknown) => PracticeContent
> = {
  TASK_BRIEF_V1: validateTaskBriefV1
};

export function validatePracticeSubmission(
  schemaInput: unknown,
  contentInput: unknown
): PracticeContent {
  const schema = parsePracticeSubmissionSchema(schemaInput);
  return validators[schema.kind](contentInput);
}
