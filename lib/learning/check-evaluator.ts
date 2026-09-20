export type LessonCheckQuestionType =
  | "SINGLE_CHOICE"
  | "TRUE_FALSE"
  | "MULTI_SELECT";

export function normalizeLessonCheckAnswers(
  type: LessonCheckQuestionType,
  answer: unknown
) {
  const raw = Array.isArray(answer)
    ? answer
    : typeof answer === "string"
      ? [answer]
      : [];
  const answers = [...new Set(
    raw
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
  )].sort();

  if (
    answers.length === 0 ||
    answers.some((item) => item.length > 120) ||
    (type !== "MULTI_SELECT" && answers.length !== 1)
  ) {
    throw new Error("INVALID_CHECK_ANSWER");
  }

  return answers;
}

export function evaluateLessonCheckAnswers(
  type: LessonCheckQuestionType,
  expected: readonly string[],
  submitted: unknown
) {
  const answers = normalizeLessonCheckAnswers(type, submitted);
  const target = [...new Set(expected)].sort();

  return {
    answers,
    isCorrect:
      target.length === answers.length &&
      target.every((value, index) => value === answers[index])
  };
}

export function isThreeQuestionMasterySequence(
  checks: readonly { type: LessonCheckQuestionType; required?: boolean }[]
) {
  const required = checks.filter((check) => check.required !== false);
  return (
    required.length === 3 &&
    required[0]?.type === "SINGLE_CHOICE" &&
    required[1]?.type === "TRUE_FALSE" &&
    required[2]?.type === "MULTI_SELECT"
  );
}

export function isThreeQuestionMasteryComplete(
  checks: readonly {
    type: LessonCheckQuestionType;
    required?: boolean;
    isCorrect: boolean;
  }[]
) {
  return (
    isThreeQuestionMasterySequence(checks) &&
    checks.filter((check) => check.required !== false).every((check) => check.isCorrect)
  );
}
