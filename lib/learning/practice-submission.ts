import type { PracticeContent } from "./practice-evaluator";

export type StructuredTextField = {
  key: string;
  label: string;
  minLength: number;
  maxLength: number;
};

export type PracticeSubmissionSchema =
  | {
      kind: "TASK_BRIEF_V1";
    }
  | {
      kind: "STRUCTURED_TEXT_V1";
      fields: StructuredTextField[];
    };

export type SupportedSubmissionKind = PracticeSubmissionSchema["kind"];

const fieldKeyPattern = /^[a-z][a-z0-9_]{0,63}$/;

const taskBriefFields: StructuredTextField[] = [
  { key: "goal", label: "Goal", minLength: 1, maxLength: 3000 },
  { key: "context", label: "Context", minLength: 1, maxLength: 3000 },
  { key: "input", label: "Input", minLength: 1, maxLength: 3000 },
  { key: "constraint", label: "Constraint", minLength: 1, maxLength: 3000 },
  { key: "output", label: "Output", minLength: 1, maxLength: 3000 }
];

function parseStructuredFields(value: unknown): StructuredTextField[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    throw new Error("INVALID_SUBMISSION_SCHEMA");
  }

  const seen = new Set<string>();
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("INVALID_SUBMISSION_SCHEMA");
    }

    const source = item as Record<string, unknown>;
    const key = typeof source.key === "string" ? source.key.trim() : "";
    const label = typeof source.label === "string" ? source.label.trim() : "";
    const minLength =
      typeof source.minLength === "number" && Number.isInteger(source.minLength)
        ? source.minLength
        : 1;
    const maxLength =
      typeof source.maxLength === "number" && Number.isInteger(source.maxLength)
        ? source.maxLength
        : 3000;

    if (
      !fieldKeyPattern.test(key) ||
      !label ||
      label.length > 120 ||
      seen.has(key) ||
      minLength < 1 ||
      maxLength > 12000 ||
      minLength > maxLength
    ) {
      throw new Error("INVALID_SUBMISSION_SCHEMA");
    }

    seen.add(key);
    return { key, label, minLength, maxLength };
  });
}

export function parsePracticeSubmissionSchema(input: unknown): PracticeSubmissionSchema {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_SUBMISSION_SCHEMA");
  }

  const source = input as Record<string, unknown>;
  if (source.kind === "TASK_BRIEF_V1") return { kind: "TASK_BRIEF_V1" };
  if (source.kind === "STRUCTURED_TEXT_V1") {
    return {
      kind: "STRUCTURED_TEXT_V1",
      fields: parseStructuredFields(source.fields)
    };
  }

  throw new Error("UNSUPPORTED_SUBMISSION_SCHEMA");
}

function fieldsForSchema(schema: PracticeSubmissionSchema): StructuredTextField[] {
  return schema.kind === "TASK_BRIEF_V1" ? taskBriefFields : schema.fields;
}

export function validatePracticeSubmission(
  schemaInput: unknown,
  contentInput: unknown
): PracticeContent {
  const schema = parsePracticeSubmissionSchema(schemaInput);
  if (!contentInput || typeof contentInput !== "object" || Array.isArray(contentInput)) {
    throw new Error("INVALID_PRACTICE_CONTENT");
  }

  const source = contentInput as Record<string, unknown>;
  const content: PracticeContent = {};

  for (const field of fieldsForSchema(schema)) {
    const value = source[field.key];
    if (typeof value !== "string") throw new Error("INVALID_PRACTICE_CONTENT");

    const normalized = value.trim();
    if (
      normalized.length < field.minLength ||
      normalized.length > field.maxLength
    ) {
      throw new Error("INVALID_PRACTICE_CONTENT");
    }
    content[field.key] = normalized;
  }

  return content;
}
