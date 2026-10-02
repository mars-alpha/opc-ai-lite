"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "../../lib/courses";
import type { LessonRuntimePlan } from "../../lib/learning/lesson-runtime";
import { GenericLessonRuntimePanel } from "../GenericLessonRuntimePanel";
import { type CourseLearningHealthView } from "./learning-insight-view";

type StepKind = "EXPLAIN" | "EXAMPLE" | "CHECK" | "PRACTICE" | "REVIEW" | "CAPABILITY";

type Snapshot = {
  courseHeader: {
    title: string;
    lessonPageLead: string;
    catalogTitle?: string;
    catalogSubtitle?: string;
  };
  stepMeta: Array<{
    id: string;
    kind: StepKind;
    title: string;
    objective: string;
    navigationDescription: string;
  }>;
  intro: {
    title: string;
    situation: string;
    takeaway: string;
    approaches: Array<{ label: string; text: string }>;
    bottomDetails: Array<{ title: string; text: string }>;
  };
  example: {
    title: string;
    situation: string;
    before: string;
    after: string;
    result: string;
    knowledgeDepth: Array<{ title: string; text: string }>;
  };
  checks: Array<{
    id: string;
    questionType?: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    question: string;
    options: Array<{ value: string; label: string }>;
    correctValues?: string[];
    explanation?: string;
    correctFeedback?: string;
    incorrectFeedback?: string;
  }>;
  practice: {
    id?: string;
    title: string;
    goal: string;
    referenceAnswer?: string;
    referenceFill?: Record<string, string>;
    activity?: {
      title: string;
      instruction: string;
      prompt?: string | null;
      reflection: string;
    };
    instructions: Array<{ key?: string; label: string; prompt: string }>;
    hints: string[];
    rubric: Array<{
      key?: string;
      label: string;
      maxScore?: number;
      minScore?: number;
      example?: string;
    }>;
    passScore?: number;
  };
  review: {
    items: string[];
    labels?: { primary: string; secondary: string };
    knowledgeDepth?: Array<{ title: string; text: string }>;
    mistakes?: string[];
    related?: string[];
  };
  capability: {
    title: string;
    gain: string[];
    selfAssessment: string[];
    triggerScenario: string;
    nextLessonValue: string;
  };
};

export type LearningChangeProposal = {
  aiRunId: string;
  patch: {
    decision: "PATCH_PROPOSED" | "NO_CHANGE_NEEDED" | "REQUIRES_MANUAL_STRUCTURE_CHANGE";
    manual_structure_reason: string | null;
  };
  beforeSnapshot: Snapshot;
  afterSnapshot: Snapshot;
  changes: Array<{
    patch_id: string;
    path: string;
    current_value: string;
    proposed_value: string;
    reason: string;
    display_label: string;
  }>;
};

function pathSegments(path: string) {
  const result: Array<string | number> = [];
  const regex = /([^.\[\]]+)|\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(path))) {
    result.push(match[2] === undefined ? match[1] : Number(match[2]));
  }
  return result;
}

function setPath(snapshot: Snapshot, path: string, value: string) {
  const segments = pathSegments(path);
  let cursor: any = snapshot;
  for (let index = 0; index < segments.length - 1; index += 1) {
    cursor = cursor[segments[index] as any];
  }
  cursor[segments[segments.length - 1] as any] = value;
}

function getPath(snapshot: Snapshot, path: string) {
  const segments = pathSegments(path);
  let cursor: any = snapshot;
  for (const segment of segments) cursor = cursor?.[segment as any];
  return typeof cursor === "string" ? cursor : "";
}

function manualPathLabel(path: string) {
  if (path.startsWith("courseHeader.")) return "课程顶部信息";
  const stepMeta = /^stepMeta\[(\d+)\]\.(title|objective|navigationDescription)$/.exec(path);
  if (stepMeta) {
    const names = { title: "步骤标题", objective: "步骤说明", navigationDescription: "步骤卡片说明" } as const;
    return "第 " + (Number(stepMeta[1]) + 1) + " 步 · " + names[stepMeta[2] as keyof typeof names];
  }
  if (path.startsWith("intro.")) return "第 1 步 · 人工修改";
  if (path.startsWith("example.")) return "第 2 步 · 人工修改";
  if (path.startsWith("checks[")) return "第 3 步 · 人工修改";
  if (path.startsWith("practice.")) return "第 4 步 · 人工修改";
  if (path.startsWith("review.")) return "第 5 步 · 人工修改";
  if (path.startsWith("capability.")) return "第 6 步 · 人工修改";
  return "课程内容 · 人工修改";
}

function runtimeIdentity(course: CourseLearningHealthView) {
  const [courseSlug, lessonSlug] = course.maintenanceKey.split("/");
  return {
    courseSlug: courseSlug || "preview-course",
    lessonSlug: lessonSlug || course.lessonId
  };
}

function buildPreviewPlan(course: CourseLearningHealthView, snapshot: Snapshot): LessonRuntimePlan {
  return {
    key: course.maintenanceKey || course.courseKey,
    lessonType: "APPLICATION",
    steps: snapshot.stepMeta.map((step) => ({
      id: step.id,
      kind: step.kind,
      title: step.title,
      objective: step.objective,
      navigationDescription: step.navigationDescription
    })),
    completionGates: [],
    requiresCheck: snapshot.checks.length > 0,
    requiresPractice: true,
    requiresDeliverable: false,
    requiresRealAi: false,
    realAiEvidence: "NONE",
    realAiEvidenceSupported: true,
    capabilityGain: [...snapshot.capability.gain],
    nextLessonValue: snapshot.capability.nextLessonValue
  };
}

function buildPreviewLesson(course: CourseLearningHealthView, snapshot: Snapshot): Lesson {
  const { lessonSlug } = runtimeIdentity(course);
  return {
    id: lessonSlug,
    title: snapshot.courseHeader.title,
    duration: "",
    summary: snapshot.courseHeader.lessonPageLead,
    plainExplanation: snapshot.example.title,
    whyItMatters: snapshot.courseHeader.lessonPageLead,
    points: [...snapshot.capability.gain],
    content: [...snapshot.review.items],
    example: {
      title: snapshot.example.title,
      situation: snapshot.example.situation,
      before: snapshot.example.before,
      after: snapshot.example.after,
      result: snapshot.example.result
    },
    guides: [],
    practice: {
      goal: snapshot.practice.goal,
      steps: snapshot.practice.instructions.map((item) => item.prompt),
      acceptance: snapshot.practice.rubric.map((item) => item.label)
    },
    mistakes: [...(snapshot.review.mistakes ?? [])],
    related: [...(snapshot.review.related ?? [])]
  };
}

function orderedReferenceFillEntries(practice: Snapshot["practice"]) {
  const instructionOrder = new Map(
    practice.instructions
      .map((item, index) => [item.key, index] as const)
      .filter((item): item is [string, number] => Boolean(item[0]))
  );
  return Object.entries(practice.referenceFill ?? {})
    .map((entry, sourceIndex) => ({ entry, sourceIndex }))
    .sort((left, right) => {
      const leftOrder = instructionOrder.get(left.entry[0]) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = instructionOrder.get(right.entry[0]) ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.sourceIndex - right.sourceIndex;
    })
    .map(({ entry }) => entry);
}

function RuntimeStudentPreview({
  course,
  snapshot,
  currentStep,
  onStepChange
}: {
  course: CourseLearningHealthView;
  snapshot: Snapshot;
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
}) {
  const { courseSlug, lessonSlug } = runtimeIdentity(course);
  const plan = useMemo(() => buildPreviewPlan(course, snapshot), [course, snapshot]);
  const lesson = useMemo(() => buildPreviewLesson(course, snapshot), [course, snapshot]);
  const runtimeKey = useMemo(() => JSON.stringify(snapshot), [snapshot]);

  return (
    <div className="admin-learning-runtime-preview">
      <div className="lesson-content lesson-content-guided">
        <div className="guided-lesson-hero">
          <div className="kicker">OPC 引导式课程</div>
          <h1>{snapshot.courseHeader.title}</h1>
          <p>{snapshot.courseHeader.lessonPageLead}</p>
          <div className="guided-lesson-outcome">
            <span>完成后你会获得</span>
            <strong>{snapshot.capability.gain[0] ?? snapshot.capability.title}</strong>
          </div>
        </div>

        <GenericLessonRuntimePanel
          key={runtimeKey}
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          plan={plan}
          lesson={lesson}
          previewMode
          previewFreeNavigation
          previewCurrentStep={currentStep}
          onPreviewStepChange={onStepChange}
          previewCheckSequence={snapshot.checks.map((item) => ({
            id: item.id,
            questionType: item.questionType ?? "SINGLE_CHOICE",
            question: item.question,
            options: item.options,
            correctValues: item.correctValues ?? [],
            explanation: item.explanation ?? "",
            correctFeedback: item.correctFeedback,
            incorrectFeedback: item.incorrectFeedback
          }))}
          previewActivity={{
            title: snapshot.practice.activity?.title ?? snapshot.practice.title,
            instruction: snapshot.practice.activity?.instruction ?? snapshot.practice.goal,
            prompt: snapshot.practice.activity?.prompt ?? snapshot.practice.referenceAnswer ?? null,
            reflection: snapshot.practice.activity?.reflection ?? ""
          }}
          previewPractice={{
            id: snapshot.practice.id ?? "preview-practice",
            title: snapshot.practice.title,
            goal: snapshot.practice.goal,
            instructions: snapshot.practice.instructions.map((item, index) => ({
              key: item.key ?? "field-" + (index + 1),
              label: item.label,
              prompt: item.prompt
            })),
            hints: snapshot.practice.hints,
            rubric: snapshot.practice.rubric.map((item, index) => ({
              key: item.key ?? "rubric-" + (index + 1),
              label: item.label,
              maxScore: item.maxScore ?? 100,
              minScore: item.minScore ?? 0,
              example: item.example ?? ""
            })),
            passScore: snapshot.practice.passScore ?? 80
          }}
          previewReferenceAnswer={snapshot.practice.referenceAnswer ?? null}
          previewReferenceFill={snapshot.practice.referenceFill ?? {}}
          previewKnowledgeDepth={{
            example: snapshot.example.knowledgeDepth,
            review: snapshot.review.knowledgeDepth ?? []
          }}
          previewReviewCardFill
          previewReviewItems={snapshot.review.items}
          previewReviewLabels={
            snapshot.review.labels ?? {
              primary: "AI适合做什么",
              secondary: "AI不应该替你做什么"
            }
          }
          previewPracticeHintsGrouped
          previewPracticeCopyValuesOnly
          previewSelfAssessment={snapshot.capability.selfAssessment}
          previewTriggerScenario={snapshot.capability.triggerScenario}
          previewCapabilityTitle={snapshot.capability.title}
          previewIntroComparison={{
            title: snapshot.intro.title,
            situation: snapshot.intro.situation,
            approaches: snapshot.intro.approaches,
            comparison: [],
            bottomDetails: snapshot.intro.bottomDetails,
            takeaway: snapshot.intro.takeaway
          }}
        />
      </div>
    </div>
  );
}

function stepIndexForPath(path: string) {
  if (path.startsWith("courseHeader.") || path === "capability.gain[0]") return -1;
  const stepMeta = /^stepMeta\[(\d+)\]/.exec(path);
  if (stepMeta) return Number(stepMeta[1]);
  if (path.startsWith("intro.")) return 0;
  if (path.startsWith("example.")) return 1;
  if (path.startsWith("checks[")) return 2;
  if (path.startsWith("practice.")) return 3;
  if (path.startsWith("review.")) return 4;
  if (path.startsWith("capability.")) return 5;
  return null;
}

function previewOrderForPath(path: string) {
  const numberAt = (pattern: RegExp, fallback = 0) => {
    const match = pattern.exec(path);
    return match ? Number(match[1]) : fallback;
  };

  if (path === "courseHeader.title") return 10;
  if (path === "courseHeader.lessonPageLead") return 20;
  if (path === "courseHeader.catalogTitle") return 30;
  if (path === "courseHeader.catalogSubtitle") return 40;

  const stepMeta = /^stepMeta\[(\d+)\]\.(navigationDescription|title|objective)$/.exec(path);
  if (stepMeta) {
    const fieldOrder = {
      navigationDescription: 0,
      title: 1,
      objective: 2
    } as const;
    return 100 + Number(stepMeta[1]) * 10 + fieldOrder[stepMeta[2] as keyof typeof fieldOrder];
  }

  if (path === "intro.title") return 1000;
  if (path === "intro.situation") return 1010;
  if (/^intro\.approaches\[\d+\]\.label$/.test(path)) return 1020 + numberAt(/^intro\.approaches\[(\d+)\]/) * 2;
  if (/^intro\.approaches\[\d+\]\.text$/.test(path)) return 1021 + numberAt(/^intro\.approaches\[(\d+)\]/) * 2;
  if (path === "intro.takeaway") return 1100;
  if (/^intro\.bottomDetails\[\d+\]\.title$/.test(path)) return 1110 + numberAt(/^intro\.bottomDetails\[(\d+)\]/) * 2;
  if (/^intro\.bottomDetails\[\d+\]\.text$/.test(path)) return 1111 + numberAt(/^intro\.bottomDetails\[(\d+)\]/) * 2;

  if (path === "example.title") return 2000;
  if (path === "example.situation") return 2010;
  if (path === "example.before") return 2020;
  if (path === "example.after") return 2030;
  if (path === "example.result") return 2040;
  if (/^example\.knowledgeDepth\[\d+\]\.title$/.test(path)) return 2050 + numberAt(/^example\.knowledgeDepth\[(\d+)\]/) * 2;
  if (/^example\.knowledgeDepth\[\d+\]\.text$/.test(path)) return 2051 + numberAt(/^example\.knowledgeDepth\[(\d+)\]/) * 2;

  const check = /^checks\[(\d+)\]\.(question|explanation|correctFeedback|incorrectFeedback)$/.exec(path);
  if (check) {
    const fieldOrder = {
      question: 0,
      explanation: 70,
      correctFeedback: 80,
      incorrectFeedback: 90
    } as const;
    return 3000 + Number(check[1]) * 100 + fieldOrder[check[2] as keyof typeof fieldOrder];
  }
  const option = /^checks\[(\d+)\]\.options\[(\d+)\]\.label$/.exec(path);
  if (option) return 3010 + Number(option[1]) * 100 + Number(option[2]);

  if (path === "practice.title") return 4000;
  if (path === "practice.goal") return 4010;
  const instruction = /^practice\.instructions\[(\d+)\]\.(label|prompt)$/.exec(path);
  if (instruction) return 4020 + Number(instruction[1]) * 2 + (instruction[2] === "prompt" ? 1 : 0);
  if (/^practice\.hints\[\d+\]$/.test(path)) return 4200 + numberAt(/^practice\.hints\[(\d+)\]/);
  if (/^practice\.rubric\[\d+\]\.label$/.test(path)) return 4300 + numberAt(/^practice\.rubric\[(\d+)\]/) * 2;
  if (/^practice\.rubric\[\d+\]\.example$/.test(path)) return 4301 + numberAt(/^practice\.rubric\[(\d+)\]/) * 2;
  if (path === "practice.activity.title") return 4400;
  if (path === "practice.activity.instruction") return 4410;
  if (path === "practice.activity.prompt") return 4420;
  if (path === "practice.activity.reflection") return 4430;
  if (path.startsWith("practice.referenceFill.")) return 4500;
  if (path === "practice.referenceAnswer") return 4600;

  if (path === "review.labels.primary") return 5000;
  if (path === "review.labels.secondary") return 5001;
  if (/^review\.items\[\d+\]$/.test(path)) return 5010 + numberAt(/^review\.items\[(\d+)\]/);
  if (/^review\.knowledgeDepth\[\d+\]\.title$/.test(path)) return 5100 + numberAt(/^review\.knowledgeDepth\[(\d+)\]/) * 2;
  if (/^review\.knowledgeDepth\[\d+\]\.text$/.test(path)) return 5101 + numberAt(/^review\.knowledgeDepth\[(\d+)\]/) * 2;
  if (/^review\.mistakes\[\d+\]$/.test(path)) return 5200 + numberAt(/^review\.mistakes\[(\d+)\]/);
  if (/^review\.related\[\d+\]$/.test(path)) return 5300 + numberAt(/^review\.related\[(\d+)\]/);

  if (path === "capability.title") return 6000;
  if (/^capability\.gain\[\d+\]$/.test(path)) return 6010 + numberAt(/^capability\.gain\[(\d+)\]/);
  if (/^capability\.selfAssessment\[\d+\]$/.test(path)) return 6100 + numberAt(/^capability\.selfAssessment\[(\d+)\]/);
  if (path === "capability.triggerScenario") return 6200;
  if (path === "capability.nextLessonValue") return 6300;

  return 99999;
}

export function AdminLearningCourseCompareModal({
  course,
  proposal,
  onClose,
  onPublished
}: {
  course: CourseLearningHealthView;
  proposal: LearningChangeProposal;
  onClose: () => void;
  onPublished: (version: number) => void;
}) {
  const firstChangedStep = useMemo(() => {
    for (const item of proposal.changes) {
      const stepIndex = stepIndexForPath(item.path);
      if (stepIndex !== null) return stepIndex;
    }
    return -1;
  }, [proposal.changes]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(proposal.changes.map((item) => [item.patch_id, item.proposed_value]))
  );
  const [publishing, setPublishing] = useState(false);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewStep, setPreviewStep] = useState(firstChangedStep);
  const [selectedPatchId, setSelectedPatchId] = useState<string | null>(null);
  const [editingPatchId, setEditingPatchId] = useState<string | null>(null);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [selectedManualPath, setSelectedManualPath] = useState<string | null>(null);
  const [savedHumanEditSignature, setSavedHumanEditSignature] = useState("[]|[]");
  const [draftSavedNotice, setDraftSavedNotice] = useState(false);

  const aiDirty = proposal.changes.some(
    (item) => values[item.patch_id] !== item.proposed_value
  );
  const activeChanges = useMemo(
    () =>
      proposal.changes.filter(
        (item) => (values[item.patch_id] ?? "").trim() !== item.current_value.trim()
      ),
    [proposal.changes, values]
  );
  const currentStepChanges = useMemo(
    () =>
      activeChanges.filter((item) => {
        const stepIndex = stepIndexForPath(item.path);
        return (stepIndex ?? -1) === previewStep;
      }),
    [activeChanges, previewStep]
  );
  const selectedChange = useMemo(
    () => currentStepChanges.find((item) => item.patch_id === selectedPatchId) ?? currentStepChanges[0] ?? null,
    [currentStepChanges, selectedPatchId]
  );
  const afterAi = useMemo(() => {
    const next = structuredClone(proposal.beforeSnapshot);
    for (const change of activeChanges) {
      setPath(next, change.path, values[change.patch_id] ?? change.proposed_value);
    }
    return next;
  }, [proposal.beforeSnapshot, activeChanges, values]);
  const manualChanges = useMemo(
    () =>
      Object.entries(manualValues)
        .map(([path, proposed_value]) => ({
          path,
          proposed_value,
          current_value: getPath(afterAi, path),
          display_label: manualPathLabel(path)
        }))
        .filter((item) => item.proposed_value.trim() !== item.current_value.trim()),
    [manualValues, afterAi]
  );
  const currentManualChanges = useMemo(
    () =>
      manualChanges.filter((item) => {
        const stepIndex = stepIndexForPath(item.path);
        return (stepIndex ?? -1) === previewStep;
      }),
    [manualChanges, previewStep]
  );
  const currentReviewChanges = useMemo(
    () =>
      [
        ...currentStepChanges.map((item) => ({
          kind: "AI" as const,
          path: item.path,
          item
        })),
        ...currentManualChanges.map((item) => ({
          kind: "HUMAN" as const,
          path: item.path,
          item
        }))
      ].sort((a, b) => {
        const rank = previewOrderForPath(a.path) - previewOrderForPath(b.path);
        return rank || a.path.localeCompare(b.path, "zh-CN");
      }),
    [currentStepChanges, currentManualChanges]
  );
  const dirty = aiDirty || manualChanges.length > 0;
  const humanEditSignature = useMemo(() => {
    const aiHumanEdits = proposal.changes
      .filter((item) => values[item.patch_id] !== item.proposed_value)
      .map((item) => [item.patch_id, values[item.patch_id] ?? ""] as const)
      .sort(([left], [right]) => left.localeCompare(right));
    const directHumanEdits = manualChanges
      .map((item) => [item.path, item.proposed_value] as const)
      .sort(([left], [right]) => left.localeCompare(right));
    return JSON.stringify(aiHumanEdits) + "|" + JSON.stringify(directHumanEdits);
  }, [proposal.changes, values, manualChanges]);
  const hasUnsavedHumanEdits = humanEditSignature !== savedHumanEditSignature;
  const stepChangeCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    for (const item of [...activeChanges, ...manualChanges]) {
      const stepIndex = stepIndexForPath(item.path);
      if (stepIndex !== null && stepIndex >= 0 && stepIndex < counts.length) {
        counts[stepIndex] += 1;
      }
    }
    return counts;
  }, [activeChanges, manualChanges]);
  const overviewChangeCount = useMemo(
    () =>
      [...activeChanges, ...manualChanges].filter(
        (item) => (stepIndexForPath(item.path) ?? -1) === -1
      ).length,
    [activeChanges, manualChanges]
  );
  const after = useMemo(() => {
    const next = structuredClone(afterAi);
    for (const item of manualChanges) setPath(next, item.path, item.proposed_value);
    return next;
  }, [afterAi, manualChanges]);
  const changeByPath = useMemo(
    () => new Map(activeChanges.map((item) => [item.path, item])),
    [activeChanges]
  );

  function selectChange(patchId: string) {
    const change = activeChanges.find((item) => item.patch_id === patchId);
    if (!change) return;
    setPreviewStep(stepIndexForPath(change.path) ?? -1);
    setSelectedPatchId(patchId);
    setEditingPatchId(null);
    window.setTimeout(() => {
      document.getElementById("learning-review-patch-" + patchId)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 0);
  }

  function selectStep(stepIndex: number) {
    setPreviewStep(stepIndex);
    setSelectedPatchId(null);
    setEditingPatchId(null);
    window.setTimeout(() => {
      document.getElementById(
        stepIndex === -1 ? "learning-review-overview" : "learning-review-step-" + stepIndex
      )?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 0);
  }

  function marked(path: string, text: string) {
    const change = changeByPath.get(path);
    if (!change) return text;
    const ordinal = activeChanges.findIndex((item) => item.patch_id === change.patch_id) + 1;
    return (
      <span
        id={"learning-review-patch-" + change.patch_id}
        className={"admin-learning-review-inline-change" + (selectedChange?.patch_id === change.patch_id ? " is-selected" : "")}
        onClick={() => selectChange(change.patch_id)}
      >
        {text}
        <em>{ordinal}</em>
      </span>
    );
  }

  function manualDomId(path: string) {
    return "learning-review-manual-" + path.replace(/[^a-zA-Z0-9]+/g, "-");
  }

  function selectManual(path: string) {
    setSelectedPatchId(null);
    setSelectedManualPath(path);
    setPreviewStep(stepIndexForPath(path) ?? -1);
    window.setTimeout(() => {
      document.getElementById(manualDomId(path))?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 0);
  }

  function editable(path: string, text: string) {
    if (changeByPath.has(path)) return marked(path, text);
    const changed = manualChanges.some((item) => item.path === path);
    return (
      <span
        id={manualDomId(path)}
        className={
          "admin-learning-review-manual-editable" +
          (changed ? " is-manual-changed" : "") +
          (selectedManualPath === path ? " is-selected" : "")
        }
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={() => {
          setSelectedPatchId(null);
          setSelectedManualPath(path);
        }}
        onBlur={(event) => {
          const nextValue = (event.currentTarget.textContent ?? "").trim();
          setManualValues((current) => {
            const next = { ...current };
            if (!nextValue || nextValue === getPath(afterAi, path)) delete next[path];
            else next[path] = nextValue;
            return next;
          });
        }}
      >
        {text}
      </span>
    );
  }

  useEffect(() => {
    if (!currentStepChanges.length) {
      setSelectedPatchId(null);
      setEditingPatchId(null);
      return;
    }
    if (!currentStepChanges.some((item) => item.patch_id === selectedPatchId)) {
      setSelectedPatchId(currentStepChanges[0].patch_id);
      setEditingPatchId(null);
    }
  }, [currentStepChanges, selectedPatchId]);

  function draftStorageKey() {
    return "learning-insight-draft:" + course.courseKey + ":" + proposal.aiRunId;
  }

  function saveDraft() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      draftStorageKey(),
      JSON.stringify({
        values,
        manualValues,
        savedAt: new Date().toISOString()
      })
    );
    setSavedHumanEditSignature(humanEditSignature);
    setMessage("草稿已保存。");
    setDraftSavedNotice(true);
    window.setTimeout(() => setDraftSavedNotice(false), 2200);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(draftStorageKey());
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { values?: Record<string, string>; manualValues?: Record<string, string> };
      if (!parsed.values) return;
      const restoredValues = {
        ...Object.fromEntries(proposal.changes.map((item) => [item.patch_id, item.proposed_value])),
        ...Object.fromEntries(
          proposal.changes
            .filter((item) => typeof parsed.values?.[item.patch_id] === "string")
            .map((item) => [item.patch_id, parsed.values?.[item.patch_id] ?? item.proposed_value])
        )
      };
      const restoredManualValues = parsed.manualValues ?? {};
      setValues(() => ({
        ...restoredValues
      }));
      setManualValues(restoredManualValues);
      const restoredAiHumanEdits = proposal.changes
        .filter((item) => restoredValues[item.patch_id] !== item.proposed_value)
        .map((item) => [item.patch_id, restoredValues[item.patch_id] ?? ""] as const)
        .sort(([left], [right]) => left.localeCompare(right));
      const restoredDirectHumanEdits = Object.entries(restoredManualValues)
        .sort(([left], [right]) => left.localeCompare(right));
      setSavedHumanEditSignature(
        JSON.stringify(restoredAiHumanEdits) + "|" + JSON.stringify(restoredDirectHumanEdits)
      );
      setMessage("已恢复上次保存的本机草稿。");
    } catch {
      window.localStorage.removeItem(draftStorageKey());
    }
  }, [course.courseKey, proposal.aiRunId, proposal.changes]);

  function close() {
    if (
      !publishedVersion &&
      hasUnsavedHumanEdits &&
      !window.confirm("有未保存的人工修改，确定关闭吗？")
    ) {
      return;
    }
    onClose();
  }

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", keydown);
    };
  }, [hasUnsavedHumanEdits, publishedVersion]);

  async function publish() {
    const acceptancePublishAllowed = Boolean(course.acceptanceTest);
    if ((course.simulation && !acceptancePublishAllowed) || publishing || publishedVersion) return;
    const empty = activeChanges.some((item) => !(values[item.patch_id] ?? "").trim());
    if (empty) {
      setMessage("保留的修改内容不能为空。");
      return;
    }
    if (activeChanges.length === 0 && manualChanges.length === 0) {
      setMessage("当前没有保留任何修改，无需发布。");
      return;
    }

    if (!window.confirm("确认发布这次课程反馈更新？发布后学员将直接看到新版本。")) {
      return;
    }

    setPublishing(true);
    setMessage(null);
    try {
      const response = await fetch(
        "/api/admin/learning/courses/" +
          encodeURIComponent(course.courseKey) +
          "/proposal" +
          (acceptancePublishAllowed ? "?review=1&acceptancePublish=1" : ""),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "PUBLISH",
            edits: activeChanges.map((item) => ({
              patch_id: item.patch_id,
              proposed_value: values[item.patch_id]
            })),
            manualEdits: manualChanges.map((item) => ({
              path: item.path,
              proposed_value: item.proposed_value
            }))
          })
        }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.result?.version) {
        throw new Error(payload?.error ?? "PUBLISH_FAILED");
      }
      const version = Number(payload.result.version);
      setPublishedVersion(version);
      setMessage("课程已发布，课程维护已记录“课程反馈更新”历史。");
      onPublished(version);
    } catch (error) {
      const code = error instanceof Error ? error.message : "PUBLISH_FAILED";
      setMessage(
        code === "CANDIDATE_ALREADY_ACTIVE"
          ? "这门课程已有人工草稿或审核版本，请先处理后再发布。"
          : code === "PATCH_BASELINE_CONFLICT"
            ? "正式课程在对照期间已经发生变化，请关闭后重新生成对照。"
            : "发布失败，正式课程没有改变。"
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="admin-course-modal-overlay admin-learning-compare-overlay" role="dialog" aria-modal="true" aria-label="课程更新对照">
      <section className="admin-learning-compare-modal admin-learning-review-modal-v4">
        <header className="admin-learning-compare-head admin-learning-compare-head-v3">
          <div>
            <small>课程反馈更新</small>
            <h2>{course.lessonTitle}</h2>
          </div>
          <button type="button" onClick={close}>关闭</button>
        </header>

        <div className="admin-learning-compare-workspace">
          <nav className="admin-learning-review-step-rail" aria-label="课程步骤">
            <button
              type="button"
              className={previewStep === -1 ? "is-active" : ""}
              onClick={() => selectStep(-1)}
              aria-label="首屏 · 课程概览"
              title="首屏 · 课程概览"
            >
              <span>首</span>
              {overviewChangeCount > 0 && <em>{overviewChangeCount}</em>}
            </button>
            {proposal.beforeSnapshot.stepMeta.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={previewStep === index ? "is-active" : ""}
                onClick={() => selectStep(index)}
                aria-label={"第 " + (index + 1) + " 步 · " + step.title}
                title={"第 " + (index + 1) + " 步 · " + step.title}
              >
                <span>{index + 1}</span>
                {stepChangeCounts[index] > 0 && <em>{stepChangeCounts[index]}</em>}
              </button>
            ))}
          </nav>

          <main className="admin-learning-review-preview">
            <div className="admin-learning-review-preview-head">
              <div>
                <strong>课程预览</strong>
                <span>已展开全部 6 步 · 修改位置已标注</span>
              </div>
              {selectedChange && (
                <span className="admin-learning-review-location">
                  当前定位：{selectedChange.display_label}
                </span>
              )}
            </div>
            <div className="admin-learning-review-preview-scroll">
              <div id="learning-review-overview" className="admin-course-preview-overview admin-learning-review-course-overview">
                <div className="admin-course-preview-hero">
                  <div className="kicker">OPC 引导式课程</div>
                  <h2>{editable("courseHeader.title", after.courseHeader.title)}</h2>
                  <p>{editable("courseHeader.lessonPageLead", after.courseHeader.lessonPageLead)}</p>
                </div>
                <div className="admin-course-preview-outcome">
                  <span>完成后你会获得</span>
                  <strong>{editable("capability.gain[0]", after.capability.gain[0])}</strong>
                </div>
                <div className="admin-course-preview-progress">
                  {after.stepMeta.map((step, index) => (
                    <div key={step.id}>
                      <span>{index + 1}</span>
                      <small>{editable("stepMeta[" + index + "].navigationDescription", step.navigationDescription)}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-course-real-preview admin-learning-review-expanded-preview">
                {after.stepMeta.map((step, index) => (
                  <section
                    key={step.id}
                    id={"learning-review-step-" + index}
                    className={previewStep === index ? "is-current-step" : ""}
                  >
                    <div className="admin-course-real-step-head">
                      <b>{index + 1}</b>
                      <div>
                        <span>{["建立直觉", "讲透方法", "检查理解", "实操", "复盘判断框架", "能力获得"][index]}</span>
                        <strong>{editable("stepMeta[" + index + "].title", step.title)}</strong>
                        <p>{editable("stepMeta[" + index + "].objective", step.objective)}</p>
                      </div>
                    </div>

                    {index === 0 && (
                      <div className="admin-course-preview-step-body">
                        <div className="admin-course-preview-label">从一个真实场景开始</div>
                        <h3>{editable("intro.title", after.intro.title)}</h3>
                        <p className="admin-course-preview-lead">{editable("intro.situation", after.intro.situation)}</p>
                        <div className="admin-course-real-cards">
                          {after.intro.approaches.map((item, itemIndex) => (
                            <div key={itemIndex}>
                              <strong>{editable("intro.approaches[" + itemIndex + "].label", item.label)}</strong>
                              <p>{editable("intro.approaches[" + itemIndex + "].text", item.text)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="admin-course-preview-highlight">
                          <strong>记住这一句</strong>
                          <p>{editable("intro.takeaway", after.intro.takeaway)}</p>
                        </div>
                        {after.intro.bottomDetails.length > 0 && (
                          <div className="admin-course-preview-depth">
                            {after.intro.bottomDetails.map((item, itemIndex) => (
                              <div key={itemIndex}>
                                <strong>{editable("intro.bottomDetails[" + itemIndex + "].title", item.title)}</strong>
                                <p>{editable("intro.bottomDetails[" + itemIndex + "].text", item.text)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {index === 1 && (
                      <div className="admin-course-preview-step-body">
                        <div className="admin-course-preview-label">案例</div>
                        <h3>{editable("example.title", after.example.title)}</h3>
                        <p className="admin-course-preview-lead">{editable("example.situation", after.example.situation)}</p>
                        <div className="admin-course-preview-compare">
                          <div><span>原来的做法</span><p>{editable("example.before", after.example.before)}</p></div>
                          <div><span>调整后的做法</span><p>{editable("example.after", after.example.after)}</p></div>
                        </div>
                        <div className="admin-course-preview-highlight"><strong>结果</strong><p>{editable("example.result", after.example.result)}</p></div>
                        {after.example.knowledgeDepth.length > 0 && (
                          <div className="admin-course-preview-depth">
                            {after.example.knowledgeDepth.map((item, itemIndex) => (
                              <div key={itemIndex}>
                                <strong>{editable("example.knowledgeDepth[" + itemIndex + "].title", item.title)}</strong>
                                <p>{editable("example.knowledgeDepth[" + itemIndex + "].text", item.text)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {index === 2 && (
                      <div className="admin-course-preview-step-body">
                        {after.checks.map((item, checkIndex) => (
                          <div className="admin-course-preview-question" key={item.id}>
                            <div className="admin-course-preview-label">理解检查 · {checkIndex + 1}/{after.checks.length}</div>
                            <h3>{editable("checks[" + checkIndex + "].question", item.question)}</h3>
                            <div className="admin-course-preview-options">
                              {item.options.map((option, optionIndex) => (
                                <div key={option.value}><span></span><p>{editable("checks[" + checkIndex + "].options[" + optionIndex + "].label", option.label)}</p></div>
                              ))}
                            </div>
                            {item.explanation && <p>{editable("checks[" + checkIndex + "].explanation", item.explanation)}</p>}
                            {item.correctFeedback && (
                              <div className="admin-course-preview-highlight">
                                <strong>答对反馈</strong>
                                <p>{editable("checks[" + checkIndex + "].correctFeedback", item.correctFeedback)}</p>
                              </div>
                            )}
                            {item.incorrectFeedback && (
                              <div className="admin-course-preview-highlight">
                                <strong>答错反馈</strong>
                                <p>{editable("checks[" + checkIndex + "].incorrectFeedback", item.incorrectFeedback)}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {index === 3 && (
                      <div className="admin-course-preview-step-body">
                        <div className="admin-course-preview-label">实操验收</div>
                        <h3>{editable("practice.title", after.practice.title)}</h3>
                        <p className="admin-course-preview-lead">{editable("practice.goal", after.practice.goal)}</p>
                        <div className="admin-course-preview-practice-fields">
                          {after.practice.instructions.map((item, itemIndex) => (
                            <div key={itemIndex}>
                              <strong>{editable("practice.instructions[" + itemIndex + "].label", item.label)}</strong>
                              <small>{editable("practice.instructions[" + itemIndex + "].prompt", item.prompt)}</small>
                            </div>
                          ))}
                        </div>
                        {after.practice.hints.length > 0 && (
                          <div className="admin-course-preview-hints">
                            <strong>提示</strong>
                            {after.practice.hints.map((hint, hintIndex) => (
                              <p key={hintIndex}><span>{hintIndex + 1}</span>{editable("practice.hints[" + hintIndex + "]", hint)}</p>
                            ))}
                          </div>
                        )}
                        {Object.keys(after.practice.referenceFill ?? {}).length > 0 && (
                          <div className="admin-learning-review-reference-fill">
                            <strong>一键填充参考答案</strong>
                            <div className="admin-learning-review-reference-fill-grid">
                              {orderedReferenceFillEntries(after.practice).map(([key, value]) => (
                                <div key={key}>
                                  <strong>{key}</strong>
                                  <p>{editable("practice.referenceFill." + key, value)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {after.practice.referenceAnswer && (
                          <div className="admin-course-preview-highlight">
                            <strong>参考答案</strong>
                            <p>{editable("practice.referenceAnswer", after.practice.referenceAnswer)}</p>
                          </div>
                        )}
                        {after.practice.activity && (
                          <div className="admin-course-preview-activity">
                            <span>{editable("practice.activity.title", after.practice.activity.title)}</span>
                            <p>{editable("practice.activity.instruction", after.practice.activity.instruction)}</p>
                            {after.practice.activity.prompt && (
                              <div>
                                <strong>给 AI 的输入</strong>
                                <p>{editable("practice.activity.prompt", after.practice.activity.prompt)}</p>
                              </div>
                            )}
                            <div><strong>比较两次结果</strong><p>{editable("practice.activity.reflection", after.practice.activity.reflection)}</p></div>
                          </div>
                        )}
                      </div>
                    )}

                    {index === 4 && (
                      <div className="admin-course-preview-step-body">
                        <div className="admin-course-preview-label">复盘框架</div>
                        <h3>把这一课真正值得带走的判断留下来</h3>
                        <div className="admin-course-preview-review-grid">
                          {after.review.items.map((item, itemIndex) => {
                            const [primary, secondary = ""] = item.split("｜");
                            return (
                              <div key={itemIndex}>
                                <span>{after.review.labels?.primary ?? "AI适合做什么"}</span>
                                <strong>{editable("review.items[" + itemIndex + "]", primary)}</strong>
                                <span>{after.review.labels?.secondary ?? "AI不应该替你做什么"}</span>
                                <p>{secondary}</p>
                              </div>
                            );
                          })}
                        </div>
                        {(after.review.knowledgeDepth?.length ?? 0) > 0 && (
                          <div className="admin-course-preview-depth">
                            {after.review.knowledgeDepth?.map((item, itemIndex) => (
                              <div key={itemIndex}>
                                <strong>{editable("review.knowledgeDepth[" + itemIndex + "].title", item.title)}</strong>
                                <p>{editable("review.knowledgeDepth[" + itemIndex + "].text", item.text)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {(after.review.mistakes?.length ?? 0) > 0 && (
                          <div className="admin-course-preview-pitfalls">
                            <strong>容易踩的坑</strong>
                            {after.review.mistakes?.map((item, itemIndex) => (
                              <p key={itemIndex}><span>{itemIndex + 1}</span>{editable("review.mistakes[" + itemIndex + "]", item)}</p>
                            ))}
                          </div>
                        )}
                        {(after.review.related?.length ?? 0) > 0 && (
                          <div className="admin-learning-review-related">
                            <strong>关联说明</strong>
                            <div>
                              {after.review.related?.map((item, itemIndex) => (
                                <p key={itemIndex}>
                                  {editable("review.related[" + itemIndex + "]", item)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {index === 5 && (
                      <div className="admin-course-preview-step-body">
                        <div className="admin-course-preview-label">能力获得</div>
                        <h3>{editable("capability.title", after.capability.title)}</h3>
                        <div className="admin-course-preview-achievements">
                          {after.capability.gain.map((item, itemIndex) => (
                            <p key={itemIndex}><span>✓</span>{editable("capability.gain[" + itemIndex + "]", item)}</p>
                          ))}
                        </div>
                        <div className="admin-course-preview-capability-grid">
                          <div>
                            <strong>怎么知道自己真的会了</strong>
                            {after.capability.selfAssessment.map((item, itemIndex) => (
                              <p key={itemIndex}>✓ {editable("capability.selfAssessment[" + itemIndex + "]", item)}</p>
                            ))}
                          </div>
                          <div><strong>遇到什么情况，我应该想到这节课？</strong><p>{editable("capability.triggerScenario", after.capability.triggerScenario)}</p></div>
                        </div>
                        <div className="admin-course-preview-next"><span>下一步为什么值得继续</span><strong>{editable("capability.nextLessonValue", after.capability.nextLessonValue)}</strong></div>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </main>

          <aside className="admin-learning-review-sidebar" aria-label="本步修改">
            <div className="admin-learning-review-sidebar-head">
              <div>
                <strong>{previewStep === -1 ? "首屏修改" : "第 " + (previewStep + 1) + " 步修改"}</strong>
                <span>{currentStepChanges.length + currentManualChanges.length} 处</span>
              </div>
              <small>点击修改项可定位，右侧可查看原文和修改后内容</small>
            </div>

            {currentReviewChanges.length === 0 ? (
              <div className="admin-learning-review-empty">当前步骤没有修改。</div>
            ) : (
              <div className="admin-learning-review-change-list">
                {currentReviewChanges.map((entry, index) => {
                  if (entry.kind === "AI") {
                    const change = entry.item;
                    const selected = selectedChange?.patch_id === change.patch_id;
                    const editing = editingPatchId === change.patch_id;
                    const humanEdited = values[change.patch_id] !== change.proposed_value;
                    return (
                      <section
                        key={"ai-" + change.patch_id}
                        className={"admin-learning-review-change-card" + (selected ? " is-selected" : "")}
                      >
                        <button
                          type="button"
                          className="admin-learning-review-change-title"
                          onClick={() => selectChange(change.patch_id)}
                        >
                          <span>{index + 1}</span>
                          <strong>{change.display_label}</strong>
                          <em>{humanEdited ? "AI + 人工" : "AI 修改"}</em>
                        </button>
                        <p>{change.reason}</p>
                        {selected && (
                          <div className="admin-learning-review-change-detail">
                            <div className="admin-learning-review-original">
                              <span>原文</span>
                              <p>{change.current_value}</p>
                            </div>
                            {editing ? (
                              <>
                                <textarea
                                  value={values[change.patch_id] ?? ""}
                                  onChange={(event) =>
                                    setValues((current) => ({
                                      ...current,
                                      [change.patch_id]: event.target.value
                                    }))
                                  }
                                />
                                <div className="admin-learning-review-edit-actions">
                                  <button type="button" onClick={() => {
                                    setValues((current) => ({
                                      ...current,
                                      [change.patch_id]: change.proposed_value
                                    }));
                                    setEditingPatchId(null);
                                  }}>恢复 AI 建议</button>
                                  <button type="button" className="is-primary" onClick={() => setEditingPatchId(null)}>保存修改</button>
                                </div>
                              </>
                            ) : (
                              <div className="admin-learning-review-proposed">
                                <span>修改后</span>
                                <p>{values[change.patch_id] ?? change.proposed_value}</p>
                                <button type="button" onClick={() => setEditingPatchId(change.patch_id)}>编辑</button>
                              </div>
                            )}
                          </div>
                        )}
                      </section>
                    );
                  }

                  const change = entry.item;
                  return (
                    <section
                      key={"human-" + change.path}
                      className={"admin-learning-review-change-card admin-learning-review-manual-card" + (selectedManualPath === change.path ? " is-selected" : "")}
                    >
                      <button
                        type="button"
                        className="admin-learning-review-change-title"
                        onClick={() => selectManual(change.path)}
                      >
                        <span>{index + 1}</span>
                        <strong>{change.display_label}</strong>
                        <em>人工修改</em>
                      </button>
                      <div className="admin-learning-review-change-detail">
                        <div className="admin-learning-review-original">
                          <span>原文</span>
                          <p>{change.current_value}</p>
                        </div>
                        <div className="admin-learning-review-proposed">
                          <span>修改后</span>
                          <p>{change.proposed_value}</p>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </aside>
        </div>

        <footer className="admin-learning-compare-actions">
          <div>
            {course.simulation && !course.acceptanceTest && (
              <span>模拟测试数据仅用于审核，不能发布正式课程。</span>
            )}
            {course.acceptanceTest && (
              <span>人工验收测试：允许在开发环境验证发布闭环，测试完成后需恢复并清理。</span>
            )}
            {message && <span>{message}</span>}
          </div>
          <button type="button" className="btn btn-secondary" onClick={close}>
            关闭
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={Boolean(publishedVersion)}
            onClick={saveDraft}
          >
            {draftSavedNotice ? "✓ 已保存" : "保存草稿"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              (course.simulation && !course.acceptanceTest) ||
              publishing ||
              Boolean(publishedVersion)
            }
            onClick={publish}
          >
            {publishedVersion
              ? "已发布第 " + publishedVersion + " 版"
              : publishing
                ? "正在发布…"
                : "发布"}
          </button>
        </footer>
      </section>
    </div>
  );
}
