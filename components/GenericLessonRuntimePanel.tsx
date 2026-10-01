"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { RealAiEvidence } from "../lib/learning/lesson-spec";
import type { LessonRuntimePlan } from "../lib/learning/lesson-runtime";
import type { Lesson } from "../lib/courses";
import {
  rulePracticeEvaluator,
  type EvaluationResult,
  type PracticeContent
} from "../lib/learning/practice-evaluator";
import { evaluateCourseBuilderCheck } from "../lib/learning/course-builder";
import {
  isThreeQuestionMasteryComplete,
  isThreeQuestionMasterySequence
} from "../lib/learning/check-evaluator";
import { buildPracticeCopyText } from "../lib/learning/practice-copy";
import {
  lessonStepNavigationDescription,
  unifiedLessonStepLabel,
} from "../lib/learning/unified-lesson-shell";
import { useProgress } from "./ProgressProvider";

type InteractiveData = {
  authenticated: boolean;
  checks: Array<{
    id: string;
    type: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    question: string;
    options: Array<{ value: string; label: string }>;
    required: boolean;
    state: null | {
      answer: string;
      answers: string[];
      isCorrect: boolean;
      attempts: number;
      explanation: string | null;
    };
  }>;
  practices: Array<{
    id: string;
    title: string;
    goal: string;
    instructions: Array<{ key: string; label: string; prompt: string }>;
    hints: string[];
    rubric: Array<{
      key: string;
      label: string;
      maxScore: number;
      minScore: number;
      example: string;
    }>;
    passScore: number;
    required: boolean;
    state: null | {
      submissionId: string;
      attempt: number;
      status: "SUBMITTED" | "NEEDS_REVISION" | "PASSED" | "EVALUATION_FAILED";
      content: unknown;
      evaluation: EvaluationResult | null;
    };
  }>;
};

type CheckCommandState = {
  checks: Array<{
    id: string;
    state: InteractiveData["checks"][number]["state"];
  }>;
  passed: boolean;
  requiredIds: string[];
};

type PracticeCommandResult = {
  submissionId: string;
  attempt: number;
  content: PracticeContent;
  status: "SUBMITTED" | "NEEDS_REVISION" | "PASSED" | "EVALUATION_FAILED";
  evaluation: EvaluationResult | null;
};

export type RuntimeData = {
  registered: boolean;
  configurationReady: boolean;
  enforcementActive: boolean;
  blockers: string[];
  progress?: {
    currentStep: number;
    completed: boolean;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  };
  interactive?: InteractiveData;
  canComplete?: boolean;
  canRate?: boolean;
  gates: {
    realAi: {
      required: boolean;
      satisfied: boolean;
      evidenceKind: RealAiEvidence;
    };
  };
};

type PreviewCheck = {
  id: string;
  questionType?: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
  question: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  correctValue?: string;
  correctValues?: ReadonlyArray<string>;
  explanation: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
};

type PreviewActivity = {
  kind?: "CHOOSE" | "CLASSIFY" | "SHORT_RESPONSE" | "COPY_TO_AI" | "COMPARE" | "REVEAL" | "MINI_TASK";
  title: string;
  instruction: string;
  prompt: string | null;
  fields?: ReadonlyArray<{ key: string; label: string; prompt: string }>;
  reflection: string;
};


type PreviewPractice = {
  id: string;
  title: string;
  goal: string;
  instructions: ReadonlyArray<{ key: string; label: string; prompt: string }>;
  hints: ReadonlyArray<string>;
  rubric: ReadonlyArray<{
    key: string;
    label: string;
    maxScore: number;
    minScore: number;
    example: string;
  }>;
  passScore: number;
};

type PreviewReferenceFill = Record<string, string>;

type PreviewIntroComparison = {
  title?: string;
  situation: string;
  approaches: ReadonlyArray<{
    label: string;
    text: string;
  }>;
  comparison: ReadonlyArray<{
    term: string;
    meaning: string;
  }>;
  comparisonPlacement?: "MIDDLE" | "BOTTOM";
  bottomDetails?: ReadonlyArray<{
    title: string;
    text: string;
  }>;
  takeaway: string;
};

type PreviewKnowledgeDepth = {
  example: ReadonlyArray<{ title: string; text: string }>;
  review: ReadonlyArray<{ title: string; text: string }>;
};

export type ApprovedPresentation = {
  activity: PreviewActivity;
  introComparison: PreviewIntroComparison;
  referenceAnswer: string | null;
  referenceFill: PreviewReferenceFill;
  knowledgeDepth: PreviewKnowledgeDepth;
  reviewItems: ReadonlyArray<string>;
  reviewLabels: { primary: string; secondary: string } | null;
  reviewCardFill: boolean;
  practiceHintsGrouped: boolean;
  practiceCopyValuesOnly: boolean;
  selfAssessment: ReadonlyArray<string>;
  triggerScenario?: string | null;
  capabilityTitle?: string | null;
};

function emptyPracticeContent(
  instructions: Array<{ key: string }>
): PracticeContent {
  return Object.fromEntries(instructions.map((item) => [item.key, ""]));
}

function asPracticeContent(value: unknown): PracticeContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] =>
      typeof entry[1] === "string"
    )
  );
}

function getRestoredCheck(interactive: InteractiveData | null | undefined) {
  if (!interactive) return null;
  const requiredChecks = interactive.checks.filter((item) => item.required);
  const checks = requiredChecks.length ? requiredChecks : interactive.checks;
  if (!checks.length) return null;
  if (!isThreeQuestionMasterySequence(checks)) return checks[0] ?? null;
  const firstUnpassedIndex = checks.findIndex((item) => item.state?.isCorrect !== true);
  return checks[firstUnpassedIndex === -1 ? checks.length - 1 : firstUnpassedIndex] ?? null;
}

function getRestoredPracticeContent(interactive: InteractiveData | null | undefined) {
  if (!interactive) return {};
  const practice =
    interactive.practices.find((item) => item.required) ?? interactive.practices[0];
  if (!practice) return {};
  return {
    ...emptyPracticeContent(practice.instructions),
    ...asPracticeContent(practice.state?.content)
  };
}

function evidenceLabel(kind: RealAiEvidence) {
  if (kind === "USER_CONFIRMATION") return "真实操作确认";
  if (kind === "ARTIFACT") return "真实操作产物";
  if (kind === "SYSTEM_RESULT") return "系统验证结果";
  return "无需真实 AI 证据";
}

function runtimeBlockerMessage(blocker: string) {
  if (blocker === "CHECK_NOT_CONFIGURED") {
    return "本课 required Check 尚未完成正式配置，因此理解检查不会伪造为可用。";
  }
  if (blocker === "PRACTICE_NOT_CONFIGURED") {
    return "本课 required Practice 尚未完成正式配置，因此实操提交与评分不会伪造为可用。";
  }
  if (blocker === "DELIVERABLE_RUNTIME_NOT_SUPPORTED") {
    return "本课要求正式 Deliverable（项目交付物）作为 Completion Gate。当前 Deliverable Runtime 尚未接入，因此这里只能验证项目草稿质量，不会伪造正式项目完成状态。";
  }
  if (blocker.startsWith("REAL_AI_EVIDENCE_RUNTIME_NOT_SUPPORTED:")) {
    return "本课真实 AI 证据链尚未受 Runtime 支持；系统不会用用户手填引用绕过 Completion Gate。";
  }
  return "本课有一项 required Runtime 配置尚未准备完成。";
}

export function GenericLessonRuntimePanel({
  courseSlug,
  lessonSlug,
  plan,
  initialRuntime = null,
  lesson,
  approvedPresentation = null,
  previewMode = false,
  previewCheck = null,
  previewCheckSequence = null,
  previewActivity = null,
  previewPractice = null,
  previewReferenceAnswer = null,
  previewReferenceFill = null,
  previewKnowledgeDepth = null,
  previewReviewCardFill = false,
  previewReviewItems = null,
  previewReviewLabels = null,
  previewPracticeHintsGrouped = false,
  previewPracticeCopyValuesOnly = true,
  previewSelfAssessment = null,
  previewTriggerScenario = null,
  previewCapabilityTitle = null,
  previewIntroComparison = null,
  completionControl = null,
  onRuntimeChange = null
}: {
  courseSlug: string;
  lessonSlug: string;
  plan: LessonRuntimePlan;
  initialRuntime?: RuntimeData | null;
  lesson: Lesson;
  approvedPresentation?: ApprovedPresentation | null;
  previewMode?: boolean;
  previewCheck?: PreviewCheck | null;
  previewCheckSequence?: ReadonlyArray<PreviewCheck> | null;
  previewActivity?: PreviewActivity | null;
  previewPractice?: PreviewPractice | null;
  previewReferenceAnswer?: string | null;
  previewReferenceFill?: PreviewReferenceFill | null;
  previewKnowledgeDepth?: PreviewKnowledgeDepth | null;
  previewReviewCardFill?: boolean;
  previewReviewItems?: ReadonlyArray<string> | null;
  previewReviewLabels?: { primary: string; secondary: string } | null;
  previewPracticeHintsGrouped?: boolean;
  previewPracticeCopyValuesOnly?: boolean;
  previewSelfAssessment?: ReadonlyArray<string> | null;
  previewTriggerScenario?: string | null;
  previewCapabilityTitle?: string | null;
  previewIntroComparison?: PreviewIntroComparison | null;
  completionControl?: ReactNode;
  onRuntimeChange?: ((runtime: RuntimeData) => void) | null;
}) {
  const {
    getStatus,
    getCurrentStep,
    markCurrentStep,
    markLessonStatus
  } = useProgress();
  const cachedResumeStep = previewMode ? null : getCurrentStep(courseSlug, lessonSlug);
  const presentationActivity = previewMode
    ? previewActivity
    : approvedPresentation?.activity ?? null;
  const presentationIntroComparison = previewMode
    ? previewIntroComparison
    : approvedPresentation?.introComparison ?? null;
  const presentationReferenceAnswer = previewMode
    ? previewReferenceAnswer
    : approvedPresentation?.referenceAnswer ?? null;
  const presentationReferenceFill = previewMode
    ? previewReferenceFill
    : approvedPresentation?.referenceFill ?? null;
  const presentationKnowledgeDepth = previewMode
    ? previewKnowledgeDepth
    : approvedPresentation?.knowledgeDepth ?? null;
  const presentationReviewItems = previewMode
    ? previewReviewItems
    : approvedPresentation?.reviewItems ?? null;
  const presentationReviewLabels = previewMode
    ? previewReviewLabels
    : approvedPresentation?.reviewLabels ?? null;
  const presentationReviewCardFill = previewMode
    ? previewReviewCardFill
    : approvedPresentation?.reviewCardFill ?? false;
  const presentationPracticeHintsGrouped = previewMode
    ? previewPracticeHintsGrouped
    : approvedPresentation?.practiceHintsGrouped ?? false;
  const presentationPracticeCopyValuesOnly = previewMode
    ? previewPracticeCopyValuesOnly
    : approvedPresentation?.practiceCopyValuesOnly ?? true;
  const presentationSelfAssessment = previewMode
    ? previewSelfAssessment
    : approvedPresentation?.selfAssessment ?? null;
  const presentationTriggerScenario = previewMode
    ? previewTriggerScenario
    : approvedPresentation?.triggerScenario ?? null;
  const presentationCapabilityTitle = previewMode
    ? previewCapabilityTitle
    : approvedPresentation?.capabilityTitle ?? null;
  const richPresentationEnabled = previewMode || Boolean(approvedPresentation);

  const [interactive, setInteractive] = useState<InteractiveData | null>(() =>
    previewMode
      ? {
          authenticated: false,
          checks: previewCheckSequence?.length
            ? previewCheckSequence.map((item) => ({
                id: item.id,
                type: item.questionType ?? "SINGLE_CHOICE",
                question: item.question,
                options: [...item.options],
                required: true,
                state: null
              }))
            : previewCheck
              ? [{
                  id: previewCheck.id,
                  type: previewCheck.questionType ?? "SINGLE_CHOICE",
                  question: previewCheck.question,
                  options: [...previewCheck.options],
                  required: true,
                  state: null
                }]
              : [],
          practices: previewPractice
            ? [{
                id: previewPractice.id,
                title: previewPractice.title,
                goal: previewPractice.goal,
                instructions: [...previewPractice.instructions],
                hints: [...previewPractice.hints],
                rubric: [...previewPractice.rubric],
                passScore: previewPractice.passScore,
                required: true,
                state: null
              }]
            : []
        }
      : initialRuntime?.interactive ?? null
  );
  const [runtime, setRuntime] = useState<RuntimeData | null>(() =>
    previewMode
      ? {
          registered: false,
          configurationReady: true,
          enforcementActive: false,
          blockers: plan.requiresDeliverable ? ["DELIVERABLE_RUNTIME_NOT_SUPPORTED"] : [],
          gates: {
            realAi: {
              required: false,
              satisfied: true,
              evidenceKind: "NONE"
            }
          }
        }
      : initialRuntime
  );
  const restoredCheck = previewMode ? null : getRestoredCheck(initialRuntime?.interactive);
  const [answer, setAnswer] = useState(() => restoredCheck?.state?.answer ?? "");
  const [previewAnswers, setPreviewAnswers] = useState<string[]>(() =>
    restoredCheck?.state?.answers?.length
      ? restoredCheck.state.answers
      : restoredCheck?.state?.answer
        ? [restoredCheck.state.answer]
        : []
  );
  const [localCheckCorrect, setLocalCheckCorrect] = useState<boolean | null>(() =>
    restoredCheck?.state?.isCorrect ?? null
  );
  const [previewCheckIndex, setPreviewCheckIndex] = useState(0);
  const [checkDisplayIndex, setCheckDisplayIndex] = useState<number | null>(null);
  const [previewPassedCheckIds, setPreviewPassedCheckIds] = useState<string[]>([]);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(() =>
    restoredCheck?.state?.explanation ?? null
  );
  const [content, setContent] = useState<PracticeContent>(() =>
    previewMode ? {} : getRestoredPracticeContent(initialRuntime?.interactive)
  );
  const [previewEvaluation, setPreviewEvaluation] =
    useState<EvaluationResult | null>(null);
  const [practiceRetakeActive, setPracticeRetakeActive] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(() =>
    previewMode
      ? 0
      : initialRuntime?.progress
        ? Math.max(0, Math.min(plan.steps.length - 1, initialRuntime.progress.currentStep - 1))
        : cachedResumeStep
          ? Math.max(0, Math.min(plan.steps.length - 1, cachedResumeStep - 1))
          : 0
  );
  useEffect(() => {
    if (previewMode || runtime || !cachedResumeStep) return;
    setCurrentStep(
      Math.max(0, Math.min(plan.steps.length - 1, cachedResumeStep - 1))
    );
  }, [cachedResumeStep, plan.steps.length, previewMode, runtime]);

  const [confusedOpen, setConfusedOpen] = useState(false);
  const [copiedActivity, setCopiedActivity] = useState(false);
  const [copiedReferenceAnswer, setCopiedReferenceAnswer] = useState(false);
  const [filledReferenceAnswer, setFilledReferenceAnswer] = useState(false);
  const [previewActivityResponse, setPreviewActivityResponse] = useState("");
  const [activityFieldValues, setActivityFieldValues] = useState<Record<string, string>>({});
  const [previewActivityCompleted, setPreviewActivityCompleted] = useState(false);
  const [copiedActivityResponse, setCopiedActivityResponse] = useState(false);
  const stepSaveTargetRef = useRef<number | null>(null);
  const stepSaveRunningRef = useRef(false);
  const stepSaveGenerationRef = useRef(0);

  const refresh = useCallback(async (syncProgressPosition = false) => {
    if (previewMode) return;
    const params = new URLSearchParams({ courseSlug, lessonSlug });
    const runtimeResponse = await fetch(
      "/api/learning/runtime?" + params.toString(),
      { cache: "no-store" }
    );
    if (!runtimeResponse.ok) {
      throw new Error("GENERIC_RUNTIME_READ_FAILED");
    }

    const nextRuntime = (await runtimeResponse.json()) as RuntimeData;
    const nextInteractive = nextRuntime.interactive;
    if (!nextInteractive) throw new Error("GENERIC_RUNTIME_INTERACTIVE_MISSING");
    setRuntime(nextRuntime);
    onRuntimeChange?.(nextRuntime);
    setInteractive(nextInteractive);
    if (nextRuntime.progress) {
      markCurrentStep(courseSlug, lessonSlug, nextRuntime.progress.currentStep);
    }
    if (syncProgressPosition && nextRuntime.progress) {
      setCurrentStep(Math.max(0, Math.min(plan.steps.length - 1, nextRuntime.progress.currentStep - 1)));
    }

    const requiredChecks = nextInteractive.checks.filter((item) => item.required);
    const nextChecks = requiredChecks.length ? requiredChecks : nextInteractive.checks;
    const masterySequence = isThreeQuestionMasterySequence(nextChecks);
    const firstUnpassedIndex = masterySequence
      ? nextChecks.findIndex((item) => item.state?.isCorrect !== true)
      : 0;
    const nextIndex =
      masterySequence && firstUnpassedIndex === -1
        ? Math.max(0, nextChecks.length - 1)
        : Math.max(0, firstUnpassedIndex);
    const nextCheck = nextChecks[nextIndex];
    if (nextCheck?.state) {
      setAnswer(nextCheck.state.answer);
      setPreviewAnswers(
        nextCheck.state.answers?.length
          ? nextCheck.state.answers
          : nextCheck.state.answer
            ? [nextCheck.state.answer]
            : []
      );
      setCheckFeedback(nextCheck.state.explanation);
      setLocalCheckCorrect(nextCheck.state.isCorrect);
    } else {
      setAnswer("");
      setPreviewAnswers([]);
      setCheckFeedback(null);
      setLocalCheckCorrect(null);
    }

    const nextPractice =
      nextInteractive.practices.find((item) => item.required) ??
      nextInteractive.practices[0];
    if (nextPractice) {
      setContent({
        ...emptyPracticeContent(nextPractice.instructions),
        ...asPracticeContent(nextPractice.state?.content)
      });
    }
  }, [courseSlug, lessonSlug, markCurrentStep, onRuntimeChange, plan.steps.length, previewMode]);

  useEffect(() => {
    if (previewMode || initialRuntime) return;
    refresh(true).catch(() =>
      setMessage("互动学习暂时读取失败，请稍后刷新。")
    );
  }, [initialRuntime, previewMode, refresh]);

  const applyCheckCommandState = useCallback((checkState: CheckCommandState) => {
    const stateById = new Map(checkState.checks.map((item) => [item.id, item.state]));
    setInteractive((current) =>
      current
        ? {
            ...current,
            checks: current.checks.map((item) =>
              stateById.has(item.id)
                ? { ...item, state: stateById.get(item.id) ?? null }
                : item
            )
          }
        : current
    );
  }, []);

  const checkSequence = useMemo(() => {
    const requiredChecks = interactive?.checks.filter((item) => item.required) ?? [];
    return requiredChecks.length ? requiredChecks : interactive?.checks ?? [];
  }, [interactive]);
  const isMasterySequence = isThreeQuestionMasterySequence(checkSequence);
  const firstIncompleteCheckIndex = isMasterySequence
    ? checkSequence.findIndex((item) => item.state?.isCorrect !== true)
    : 0;
  const derivedCheckIndex = isMasterySequence
    ? firstIncompleteCheckIndex === -1
      ? Math.max(0, checkSequence.length - 1)
      : Math.max(0, firstIncompleteCheckIndex)
    : 0;
  const currentCheckIndex = previewMode
    ? previewCheckIndex
    : checkDisplayIndex === null
      ? derivedCheckIndex
      : Math.max(0, Math.min(checkSequence.length - 1, checkDisplayIndex));
  const check = useMemo(
    () => checkSequence[currentCheckIndex] ?? checkSequence[0] ?? null,
    [checkSequence, currentCheckIndex]
  );
  const currentCheckCorrect =
    localCheckCorrect === true || check?.state?.isCorrect === true;
  const currentCheckLocked = currentCheckCorrect;
  const practice = useMemo(
    () =>
      interactive?.practices.find((item) => item.required) ??
      interactive?.practices[0] ??
      null,
    [interactive]
  );
  const evaluation = practiceRetakeActive
    ? previewEvaluation
    : previewEvaluation ?? practice?.state?.evaluation ?? null;
  const checkPassed = isMasterySequence
    ? isThreeQuestionMasteryComplete(
        checkSequence.map((item) => ({
          type: item.type,
          required: item.required,
          isCorrect: previewMode
            ? item.state?.isCorrect === true || previewPassedCheckIds.includes(item.id)
            : item.state?.isCorrect === true
        }))
      )
    : previewMode
      ? check?.state?.isCorrect || localCheckCorrect === true
      : check?.state?.isCorrect === true;
  const practicePassed = practiceRetakeActive
    ? evaluation?.passed === true
    : practice?.state?.status === "PASSED" || evaluation?.passed === true;
  const projectDraftPassed =
    plan.lessonType === "PROJECT" && evaluation?.passed === true;
  const realAiPassed =
    !plan.requiresRealAi || runtime?.gates.realAi.satisfied === true;

  const requiredGateStates = [
    ...(plan.requiresCheck ? [Boolean(checkPassed)] : []),
    ...(plan.requiresPractice ? [Boolean(practicePassed)] : []),
    ...(plan.requiresRealAi ? [Boolean(realAiPassed)] : []),
    ...(plan.requiresDeliverable ? [false] : [])
  ];

  const step = plan.steps[currentStep];
  const runtimeHydrated = previewMode || Boolean(runtime && interactive);
  const nextStep = plan.steps[currentStep + 1];
  const nextStepNeedsRuntime =
    nextStep?.kind === "CHECK" ||
    nextStep?.kind === "PRACTICE" ||
    nextStep?.kind === "CAPABILITY";
  const stepGateSatisfied =
    step?.kind === "CHECK"
      ? Boolean(checkPassed)
      : step?.kind === "PRACTICE"
        ? plan.lessonType === "PROJECT"
          ? Boolean(projectDraftPassed)
          : practice ? Boolean(practicePassed) && Boolean(realAiPassed) : !plan.requiresPractice
        : step?.kind === "CAPABILITY"
          ? requiredGateStates.every(Boolean)
          : true;
  const interactionLocked = !runtimeHydrated;
  const canAdvance =
    runtimeHydrated && stepGateSatisfied && (!nextStepNeedsRuntime || runtimeHydrated);

  const canRestartCheck = !previewMode && Boolean(checkPassed);
  const canRestartPractice =
    plan.lessonType !== "PROJECT" && Boolean(practicePassed) && !practiceRetakeActive;

  function queueCurrentStepSave(stepNumber: number) {
    stepSaveTargetRef.current = stepNumber;
    stepSaveGenerationRef.current += 1;
    if (stepSaveRunningRef.current) return;

    stepSaveRunningRef.current = true;
    void (async () => {
      try {
        while (stepSaveTargetRef.current !== null) {
          const target = stepSaveTargetRef.current;
          const generation = stepSaveGenerationRef.current;
          stepSaveTargetRef.current = null;
          try {
            const response = await fetch("/api/learning/progress", {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              keepalive: true,
              body: JSON.stringify({
                courseSlug,
                lessonSlug,
                currentStep: target
              })
            });
            if (!response.ok) throw new Error("CURRENT_STEP_SAVE_FAILED");
          } catch {
            if (generation === stepSaveGenerationRef.current) {
              setMessage("当前学习位置暂时没有保存成功；本页仍可继续学习。");
            }
          }
        }
      } finally {
        stepSaveRunningRef.current = false;
        if (stepSaveTargetRef.current !== null) {
          queueCurrentStepSave(stepSaveTargetRef.current);
        }
      }
    })();
  }

  function moveToStep(nextIndex: number) {
    const boundedIndex = Math.max(0, Math.min(plan.steps.length - 1, nextIndex));
    setCurrentStep(boundedIndex);
    setConfusedOpen(false);
    setMessage(null);

    if (previewMode || !interactive?.authenticated) return;
    markCurrentStep(courseSlug, lessonSlug, boundedIndex + 1);
    if (getStatus(courseSlug, lessonSlug) !== "COMPLETED") {
      markLessonStatus(courseSlug, lessonSlug, "IN_PROGRESS");
    }
    queueCurrentStepSave(boundedIndex + 1);
  }

  async function submitCheck() {
    if (currentCheckLocked || !check || (!answer && previewAnswers.length === 0)) return;
    if (previewMode) {
      const previewSource = isMasterySequence
        ? previewCheckSequence?.[currentCheckIndex]
        : previewCheck;
      const questionType = previewSource?.questionType ?? "SINGLE_CHOICE";
      const correctValues =
        previewSource?.correctValues ??
        (previewSource?.correctValue ? [previewSource.correctValue] : []);
      const correct = evaluateCourseBuilderCheck(
        { questionType, correctValues: [...correctValues] },
        previewAnswers.length > 0 ? previewAnswers : [answer]
      );
      setLocalCheckCorrect(correct);
      if (correct) {
        setPreviewPassedCheckIds((current) =>
          current.includes(check.id) ? current : [...current, check.id]
        );
      }
      setCheckFeedback(
        correct
          ? previewSource?.correctFeedback ?? previewSource?.explanation ?? "判断正确。"
          : previewSource?.incorrectFeedback ?? previewSource?.explanation ?? "这个判断需要调整。"
      );
      return;
    }
    setBusy("check");
    setMessage(null);
    try {
      const response = await fetch(
        "/api/learning/checks/" + check.id + "/answer",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            check.type === "MULTI_SELECT"
              ? {
                  answers: previewAnswers.filter((value) =>
                    check.options.some((option) => option.value === value)
                  )
                }
              : { answer: previewAnswers[0] ?? answer }
          )
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error("CHECK_FAILED");

      const correct = result?.correct === true;
      if (result?.checkState) {
        applyCheckCommandState(result.checkState as CheckCommandState);
      }
      setCheckDisplayIndex(currentCheckIndex);
      setLocalCheckCorrect(correct);
      setCheckFeedback(result?.explanation ?? (correct ? "判断正确。" : "这个判断需要调整。"));

      // 多选题通常是三题 Mastery 的最后一题。答对后重新读取整组
      // Check 状态，以数据库为最终事实源，避免局部前端状态或旧答题记录
      // 造成“答案正确但无法通过”的卡住情况。
      if (correct && check.type === "MULTI_SELECT") {
        await refresh(false);
        setCheckDisplayIndex(currentCheckIndex);
      }
    } catch {
      setMessage("理解检查提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function restartCheckStep() {
    if (previewMode) return;
    setBusy("check-reset");
    setMessage(null);
    try {
      const response = await fetch("/api/learning/checks/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonSlug, currentStep: currentStep + 1 })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error("CHECK_RELEARN_RESET_FAILED");
      if (result?.checkState) {
        applyCheckCommandState(result.checkState as CheckCommandState);
      }
      setCheckDisplayIndex(null);
      setAnswer("");
      setPreviewAnswers([]);
      setLocalCheckCorrect(null);
      setCheckFeedback(null);
    } catch {
      setMessage("重新学习初始化失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function goToNextMasteryQuestion() {
    if (
      !isMasterySequence ||
      currentCheckIndex >= checkSequence.length - 1 ||
      !currentCheckCorrect
    ) {
      return;
    }
    if (previewMode) {
      setPreviewCheckIndex((current) => current + 1);
    } else {
      setCheckDisplayIndex(null);
    }
    setAnswer("");
    setPreviewAnswers([]);
    setLocalCheckCorrect(null);
    setCheckFeedback(null);
    setMessage(null);
  }

  function restartPracticeStep() {
    if (!practice) return;
    setPracticeRetakeActive(true);
    setContent(emptyPracticeContent(practice.instructions));
    setPreviewEvaluation(null);
    setFilledReferenceAnswer(false);
    setCopiedActivity(false);
    setMessage(null);
  }

  async function submitPractice() {
    if (!practice) return;
    setBusy("practice");
    setMessage(null);
    try {
      if (!interactive?.authenticated) {
        const result = await rulePracticeEvaluator({
          content,
          rubric: practice.rubric,
          passScore: practice.passScore
        });
        setPreviewEvaluation(result);
        setMessage(
          result.passed
            ? "本地检查已通过。登录后提交可保存正式学习记录。"
            : "本地检查完成。根据下面反馈修改后再试一次。"
        );
        return;
      }

      const response = await fetch(
        "/api/learning/practices/" + practice.id + "/submissions",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content })
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (result?.error === "INVALID_PRACTICE_CONTENT") {
          setMessage("请先把本练习要求的字段填写完整。");
          return;
        }
        throw new Error("PRACTICE_SUBMIT_FAILED");
      }
      const practiceResult = result as PracticeCommandResult;
      setInteractive((current) =>
        current
          ? {
              ...current,
              practices: current.practices.map((item) =>
                item.id === practice.id
                  ? {
                      ...item,
                      state: {
                        submissionId: practiceResult.submissionId,
                        attempt: practiceResult.attempt,
                        status: practiceResult.status,
                        content: practiceResult.content,
                        evaluation: practiceResult.evaluation
                      }
                    }
                  : item
              )
            }
          : current
      );
      setPracticeRetakeActive(false);
      setPreviewEvaluation(practiceResult.evaluation);
      setMessage(
        practiceResult.status === "EVALUATION_FAILED"
          ? "内容已保存，但本次检查暂时失败，请稍后重试。"
          : null
      );
    } catch {
      setMessage("练习提交失败，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  async function submitRealAiEvidence() {
    if (!plan.requiresRealAi || plan.realAiEvidence === "NONE") return;
    if (!interactive?.authenticated) {
      setMessage("登录后才能保存真实 AI 操作证据。");
      return;
    }
    if (plan.realAiEvidence === "ARTIFACT") {
      setMessage("当前还没有正式 Artifact Resolver，手填链接或引用不会被当作完成证据。");
      return;
    }
    if (plan.realAiEvidence === "SYSTEM_RESULT") {
      setMessage("本课由系统自动记录真实工具结果，无需手动提交。");
      return;
    }

    setBusy("real-ai");
    setMessage(null);
    try {
      const response = await fetch("/api/learning/real-ai-evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          evidenceKind: plan.realAiEvidence,
          confirmed:
            plan.realAiEvidence === "USER_CONFIRMATION" ? confirmed : undefined
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (
          result?.error === "REAL_AI_CONFIRMATION_REQUIRED"
        ) {
          setMessage("请先提供本课要求的真实 AI 操作证据。");
          return;
        }
        throw new Error("REAL_AI_EVIDENCE_FAILED");
      }
      await refresh();
      setMessage("真实 AI 操作证据已记录。");
    } catch {
      setMessage("真实 AI 操作证据暂时无法保存，请稍后重试。");
    } finally {
      setBusy("");
    }
  }

  if (!runtimeHydrated || !step) return null;

  return (
    <section className="interactive-lesson guided-lesson" id="lesson-runtime">
      <div className="guided-lesson-top">
        <div>
          <div className="kicker">引导式学习</div>
          <h2>{step.title}</h2>
          <p>{step.objective}</p>
        </div>
        <div className="guided-progress-copy">
          <strong>{currentStep + 1} / {plan.steps.length}</strong>
          <span>{step.kind}</span>
        </div>
      </div>

      <div className="guided-progress-track" aria-label="学习进度">
        {previewMode && (
          <div className="guided-preview-mode-note">
            <strong>Human Review 预览</strong>
            <span>本页只用于体验课程草稿，不保存进度、不产生完成状态、不会发布。</span>
          </div>
        )}
        {plan.steps.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={index === currentStep ? "is-current" : index < currentStep ? "is-done" : ""}
            onClick={() => {
              if (index <= currentStep || (index === currentStep + 1 && canAdvance)) {
                void moveToStep(index);
              }
            }}
          >
            <span>{index + 1}</span>
            <small>{lessonStepNavigationDescription(item)}</small>
          </button>
        ))}
      </div>

      {runtime && !runtime.configurationReady && (
        <div className="interactive-message">
          <strong>当前课程 Runtime 尚未全部准备完成</strong>
          {runtime.blockers.map((blocker) => (
            <p key={blocker}>{runtimeBlockerMessage(blocker)}</p>
          ))}
        </div>
      )}

      <div className="guided-step-panel">
      {step.kind === "EXPLAIN" && presentationIntroComparison ? (
        <div className="guided-step-content guided-intro-comparison">
          <div className="guided-step-label">从一个真实场景开始</div>
          <h3>{presentationIntroComparison.title ?? "先看一个常见情况"}</h3>
          <p className="guided-intro-lead">{presentationIntroComparison.situation}</p>
          <div className="guided-intro-approaches">
            {presentationIntroComparison.approaches.map((item, index) => (
              <div key={`${index}-${item.label}`}>
                <span>{item.label}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          {presentationIntroComparison.comparison.length > 0 && presentationIntroComparison.comparisonPlacement !== "BOTTOM" && (
            <div className="guided-intro-compare">
              {presentationIntroComparison.comparison.map((item) => (
                <div key={item.term}>
                  <span>{item.term}</span>
                  <strong>{item.meaning}</strong>
                </div>
              ))}
            </div>
          )}
          <div className="guided-key-highlight guided-intro-takeaway">
            <strong>记住这一句</strong>
            <p>{presentationIntroComparison.takeaway}</p>
          </div>
          {presentationIntroComparison.comparison.length > 0 && presentationIntroComparison.comparisonPlacement === "BOTTOM" && (
            <div className="guided-knowledge-depth guided-knowledge-depth-review">
              {presentationIntroComparison.comparison.map((item) => (
                <div key={item.term}>
                  <strong>{item.term}</strong>
                  <p>{item.meaning}</p>
                </div>
              ))}
            </div>
          )}
          {presentationIntroComparison.bottomDetails?.length ? (
            <div className="guided-knowledge-depth guided-knowledge-depth-review">
              {presentationIntroComparison.bottomDetails.map((item, index) => (
                <div key={`${index}-${item.title}`}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : step.kind === "EXPLAIN" && (
        <div className="guided-step-content">
          <div className="guided-step-label">理解核心概念</div>
          <h3>{lesson.plainExplanation}</h3>
          <div className="guided-key-highlight">
            <strong>为什么值得学</strong>
            <p>{lesson.whyItMatters}</p>
          </div>
          <div className="guided-review-points">
            {lesson.points.map((point) => <div key={point}><strong>{point}</strong></div>)}
          </div>
          <div className="guided-explain-notes">
            {lesson.content.map((paragraph) => <div key={paragraph}>{paragraph}</div>)}
          </div>
        </div>
      )}

      {step.kind === "EXAMPLE" && (
        <div className="guided-step-content">
          <div className="guided-step-label">案例</div>
          <h3>{lesson.example.title}</h3>
          <p>{lesson.example.situation}</p>
          {(lesson.example.before || lesson.example.after) && <div className="guided-case-compare">
            {lesson.example.before && <div><span>原来的做法</span><p>{lesson.example.before}</p></div>}
            {lesson.example.after && <div><span>调整后的做法</span><p>{lesson.example.after}</p></div>}
          </div>}
          <div className="guided-gain"><strong>结果</strong><p>{lesson.example.result}</p></div>
          {presentationKnowledgeDepth?.example.length ? (
            <div className="guided-knowledge-depth">
              {presentationKnowledgeDepth.example.map((item, index) => (
                <div key={`${index}-${item.title}`}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          ) : null}

        </div>
      )}

      {step.kind === "CHECK" && plan.requiresCheck && check && (
        <div className="interactive-block">
          <div className="kicker">
            {isMasterySequence
              ? `理解检查 · ${currentCheckIndex + 1}/3`
              : "理解检查"}
          </div>
          <h3>{check.question}</h3>
          <div className="interactive-options">
            {check.options.map((option) => {
              const multiSelect = check.type === "MULTI_SELECT";
              const checked = multiSelect
                ? previewAnswers.includes(option.value)
                : answer === option.value;
              return (
                <label key={option.value}>
                  <input
                    type={multiSelect ? "checkbox" : "radio"}
                    name={"check-" + check.id}
                    value={option.value}
                    checked={checked}
                    disabled={currentCheckLocked || busy === "check"}
                    onChange={(event) => {
                      if (currentCheckLocked) return;
                      if (multiSelect) {
                        setPreviewAnswers((current) => {
                          const validValues = new Set(
                            check.options.map((item) => item.value)
                          );
                          const scoped = current.filter((value) =>
                            validValues.has(value)
                          );
                          return event.target.checked
                            ? [...scoped, option.value]
                            : scoped.filter((value) => value !== option.value);
                        });
                      } else {
                        setAnswer(event.target.value);
                        setPreviewAnswers([event.target.value]);
                      }
                      setLocalCheckCorrect(null);
                      setCheckFeedback(null);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={canRestartCheck ? restartCheckStep : submitCheck}
              disabled={
                busy === "check-reset" ||
                (!canRestartCheck && (
                  (!answer && previewAnswers.length === 0) ||
                  busy === "check" ||
                  (isMasterySequence
                     ? currentCheckLocked
                     : checkPassed)
                ))
              }
            >
              {canRestartCheck
                ? busy === "check-reset" ? "正在重置…" : "重新学习"                : isMasterySequence && currentCheckCorrect
                  ? "✓ 本题已答对"

                : !isMasterySequence && checkPassed
                  ? "✓ 理解检查已通过"
                : busy === "check"
                  ? "正在检查…"
                  : "检查答案"}
            </button>
          </div>
          {checkFeedback && (
            <div className="guided-gain">
              <strong>
                {currentCheckCorrect
                  ? "为什么这个判断正确"
                  : "为什么这个判断不成立"}
              </strong>
              <p>{checkFeedback}</p>
            </div>
          )}
          {isMasterySequence &&
            checkFeedback &&
            !currentCheckCorrect && (
              <div className="guided-key-highlight">
                <strong>根据反馈再选一次</strong>
                <p>先理解上面的判断依据，再重新选择。答对后才会进入下一题。</p>
              </div>
            )}
          {isMasterySequence &&
            currentCheckLocked &&
            currentCheckIndex < checkSequence.length - 1 && (
              <div className="interactive-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={goToNextMasteryQuestion}
                >
                  下一题
                </button>
              </div>
            )}
          {isMasterySequence &&
            checkPassed &&
            currentCheckIndex === checkSequence.length - 1 && (
              <div className="guided-key-highlight">
                <strong>理解检查已完成</strong>
                <p>三道题都已答对，可以进入下一步练习。</p>
              </div>
            )}
        </div>
      )}

      {step.kind === "CHECK" && plan.requiresCheck && runtimeHydrated && !check && (
        <div className="interactive-block">
          <div className="kicker">理解检查</div>
          <h3>Required Check 尚未配置</h3>
          <p>{runtimeBlockerMessage("CHECK_NOT_CONFIGURED")}</p>
        </div>
      )}

      {step.kind === "PRACTICE" && practice && (
        <div className="interactive-block" id="interactive-practice">
          <div className="kicker">{plan.lessonType === "PROJECT" ? "项目草稿验收" : "实操验收"}</div>
          <h3>{practice.title}</h3>
          <p>{practice.goal}</p>
          <div className="guided-practice-fields">
            {practice.instructions.map((item) => (
              <label key={item.key}>
                <span>{item.label}</span>
                <small>{item.prompt}</small>
                <textarea
                  rows={3}
                  maxLength={12000}
                  value={content[item.key] ?? ""}
                  onChange={(event) => {
                    setContent((current) => ({
                      ...current,
                      [item.key]: event.target.value
                    }));
                    setPreviewEvaluation(null);
                  }}
                />
              </label>
            ))}
          </div>
          {practice.hints.length > 0 && (
            <div className={`interactive-hints guided-numbered-hints${presentationPracticeHintsGrouped ? " is-single-box" : ""}`}>
              <strong>提示</strong>
              <div className="guided-numbered-list">
                {practice.hints.map((hint, index) => (
                  <div key={`${index}-${hint}`} className="guided-numbered-item">
                    <span>{index + 1}</span>
                    <p>{hint.replace(/^\s*\d+\s*(?:[｜|、.．]|\))\s*/, "")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={canRestartPractice ? restartPracticeStep : submitPractice}
              disabled={interactionLocked || busy === "practice" || (plan.lessonType === "PROJECT" && projectDraftPassed)}
            >
              {canRestartPractice
                ? "重新练习"
                : (plan.lessonType === "PROJECT" ? projectDraftPassed : practicePassed)
                ? plan.lessonType === "PROJECT"
                  ? "✓ 项目草稿已通过"
                  : "✓ 实操已通过"
                : busy === "practice"
                  ? "正在检查你的结果…"
                  : evaluation
                    ? "修改后重新检查"
                    : "检查我的结果"}
            </button>
          </div>

          {presentationActivity?.kind === "COPY_TO_AI" && (
            <div className="guided-preview-activity guided-application-test">
              <div className="guided-step-label">放进你的 AI 软件试一下</div>
              <p>{presentationActivity.instruction}</p>
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  const combined = buildPracticeCopyText(
                    practice.instructions,
                    content,
                    presentationPracticeCopyValuesOnly
                  );
                  if (!combined) {
                    setMessage("先把上面的练习内容填好，再复制。");
                    return;
                  }
                  await navigator.clipboard.writeText(combined);
                  setCopiedActivity(true);
                }}
              >
                {copiedActivity ? "✓ 已复制我的提示词" : "复制我的提示词"}
              </button>
              <div className="guided-gain">
                <strong>比较两次结果</strong>
                <p>{presentationActivity.reflection}</p>
              </div>
            </div>
          )}

          {evaluation && (
            <div className="interactive-evaluation">
              <div className="interactive-score">
                <strong>{evaluation.score}</strong>
                <span>/ 100</span>
              </div>
              <div>
                {evaluation.criteria.map((criterion) => (
                  <p key={criterion.key}>
                    <b>{criterion.label}</b> · {criterion.score}/{criterion.maxScore}
                    {criterion.score < criterion.minScore && criterion.problem
                      ? " · " + criterion.problem
                      : ""}
                  </p>
                ))}
                <p>{evaluation.nextAction}</p>
              </div>
            </div>
          )}

          {evaluation && !evaluation.passed && presentationReferenceAnswer && (
            <div className="guided-reference-answer">
              <div className="guided-step-label">还是卡住？先参考一个完整答案</div>
              <p>你可以先看懂它为什么合格，再修改自己的版本。复制参考答案不会自动判定练习通过。</p>
              <div className="guided-preview-prompt">{presentationReferenceAnswer}</div>
              <div className="interactive-actions">
                {presentationReferenceFill && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setContent((current) => ({ ...current, ...presentationReferenceFill }));
                      setPreviewEvaluation(null);
                      setMessage("参考答案已填入。你可以继续修改，然后重新检查。");
                      setFilledReferenceAnswer(true);
                    }}
                  >
                    {filledReferenceAnswer ? "✓ 已填入参考答案" : "一键填充参考答案"}
                  </button>
                )}
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    await navigator.clipboard.writeText(presentationReferenceAnswer);
                    setCopiedReferenceAnswer(true);
                  }}
                >
                  {copiedReferenceAnswer ? "✓ 已复制参考答案" : "复制参考答案"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step.kind === "PRACTICE" && plan.requiresPractice && !practice && (
        <div className="interactive-block" id="interactive-practice">
          <div className="kicker">实操验收</div>
          <h3>Required Practice 尚未配置</h3>
          <p>{runtimeBlockerMessage("PRACTICE_NOT_CONFIGURED")}</p>
        </div>
      )}

      {step.kind === "PRACTICE" && plan.requiresRealAi && (
        <div className="interactive-block">
          <div className="kicker">真实 AI 操作</div>
          <h3>{evidenceLabel(plan.realAiEvidence)}</h3>
          {plan.realAiEvidence === "USER_CONFIRMATION" && (
            <label className="interactive-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span>我已经在真实 AI 产品中完成本课要求的操作。</span>
            </label>
          )}
          {plan.realAiEvidence === "ARTIFACT" && (
            <p>本课需要可验证的真实产物。当前 Artifact Resolver 尚未接入，因此不会接受手填链接或引用作为完成证据。</p>
          )}
          {plan.realAiEvidence === "SYSTEM_RESULT" && (
            <p>该证据只能由已接入的受信工具 Runtime 写入，用户不能手动伪造。</p>
          )}
          <div className="interactive-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitRealAiEvidence}
              disabled={
                realAiPassed ||
                busy === "real-ai" ||
                plan.realAiEvidence === "SYSTEM_RESULT" ||
                plan.realAiEvidence === "ARTIFACT"
              }
            >
              {realAiPassed
                ? "✓ 真实 AI 操作已验证"
                : busy === "real-ai"
                  ? "正在保存…"
                  : "提交完成证据"}
            </button>
          </div>
        </div>
      )}

      {step.kind === "REVIEW" && (
        <div className="guided-step-content">
          <div className="guided-step-label">复盘框架</div>
          <h3>把这一课真正值得带走的判断留下来</h3>
          {presentationReviewItems?.length ? (
            <div className={`guided-misconception-grid${presentationReviewCardFill ? " is-fill-layout" : ""}`}>
              {presentationReviewItems.map((item, index) => {
                const [title, description] = item.split("｜");
                return (
                  <div key={`${index}-${item}`} className="guided-misconception-card">
                    <div>
                      <span>{presentationReviewLabels?.primary ?? "核心判断"}</span>
                      <p><strong>{title}</strong></p>
                    </div>
                    <div>
                      <span>{presentationReviewLabels?.secondary ?? "怎么理解"}</span>
                      <p>{description ?? title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`guided-misconception-grid${presentationReviewCardFill ? " is-fill-layout" : ""}`}>
              {lesson.mistakes.map((item, index) => {
                const [misconception, correction] = item.split("｜");
                return (
                  <div key={`${index}-${item}`} className="guided-misconception-card">
                    <div><span>容易误解</span><p>{misconception.replace(/^误区：/, "")}</p></div>
                    <div><span>正确理解</span><p>{(correction ?? "").replace(/^正确理解：/, "")}</p></div>
                  </div>
                );
              })}
            </div>
          )}
          {presentationKnowledgeDepth?.review.length ? (
            <div className="guided-knowledge-depth guided-knowledge-depth-review">
              {presentationKnowledgeDepth.review.map((item, index) => (
                <div key={`${index}-${item.title}`}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          ) : null}
          {richPresentationEnabled && lesson.mistakes.length > 0 && (
            <div className="guided-pitfall-section">
              <strong>容易踩的坑</strong>
              <div className="guided-pitfall-list">
                {lesson.mistakes.map((item, index) => {
                  const [misconception, correction] = item.split("｜");
                  return (
                    <div key={`${index}-${item}`} className="guided-pitfall-card">
                      <span>{index + 1}</span>
                      <div>
                        <strong>{misconception.replace(/^误区：/, "")}</strong>
                        {correction && <p>{correction.replace(/^正确理解：/, "")}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {lesson.related.length > 0 && (
            <div className="guided-gain">
              <strong>下一步关联</strong>
              <p>{lesson.related.join(" · ")}</p>
            </div>
          )}
        </div>
      )}

      {step.kind === "CAPABILITY" && (
        <div className="guided-step-content">
          <div className="guided-step-label">能力获得</div>
          <h3>{presentationCapabilityTitle ?? "把“学过”变成你现在真的能做的事情"}</h3>
          <div className="guided-achievement-list">
            {plan.capabilityGain.map((item, index) => <div key={`${index}-${item}`}><span>✓</span><p>{item}</p></div>)}
          </div>
          {presentationSelfAssessment?.length ? (
            <div className="guided-knowledge-depth guided-knowledge-depth-review">
              <div>
                <strong>怎么知道自己真的会了</strong>
                {presentationSelfAssessment.map((item, index) => <p key={`${index}-${item}`}>✓ {item}</p>)}
              </div>
              <div>
                <strong>遇到什么情况，我应该想到这节课？</strong>
                <p>{presentationTriggerScenario ?? "当真实任务中再次出现本课解决的问题时，这节课学到的能力就适用于识别问题、判断边界并完成对应处理。"}</p>
              </div>
            </div>
          ) : null}
          {plan.nextLessonValue && <div className="guided-next-value"><div><span>下一步为什么值得继续</span><strong>{plan.nextLessonValue}</strong></div></div>}
        </div>
      )}
      </div>

      {confusedOpen && (
        <div className="guided-confused-panel">
          <span>提示</span>
          <strong>{step.objective}</strong>
          <p>先只完成当前这一步，不需要一次理解整课。对照上面的目标，再检查你缺的是概念、判断还是练习结果。</p>
        </div>
      )}

      {message && <div className="interactive-message">{message}</div>}

      <div className="guided-step-nav">
        <button type="button" className="btn btn-secondary" onClick={() => {
          void moveToStep(currentStep - 1);
        }} disabled={interactionLocked || currentStep === 0}>← 上一步</button>
        <div className="guided-step-nav-center">
          <span>{unifiedLessonStepLabel(step.kind)}</span>
          <small>{currentStep + 1} / {plan.steps.length}</small>
        </div>
        <div className="guided-step-nav-actions">
          <button type="button" className="guided-confused-button" onClick={() => setConfusedOpen((value) => !value)}>还是不懂</button>
          {currentStep < plan.steps.length - 1 && (
            <button type="button" className="btn btn-primary" disabled={interactionLocked || !canAdvance} onClick={() => {
              if (!canAdvance) return;
              void moveToStep(currentStep + 1);
            }}>下一步 →</button>
          )}
          {currentStep === plan.steps.length - 1 && completionControl}
        </div>
      </div>
    </section>
  );
}
