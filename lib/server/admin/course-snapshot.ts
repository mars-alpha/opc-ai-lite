import "server-only";

import type { CourseBuilderBuildDraft } from "../../learning/course-builder";
import {
  track01T101Draft,
  track01T102Draft,
  track01T103Draft,
  track01T104Draft,
  track01T105Draft
} from "../../learning/course-content/track01-batch-a";
import { track01T106Draft } from "../../learning/course-content/track01-phase2-t106";
import { track01T107Draft } from "../../learning/course-content/track01-phase2-t107";
import { track01T108Draft } from "../../learning/course-content/track01-phase3-t108";
import { track01T109Draft } from "../../learning/course-content/track01-phase3-t109";
import { track01T110Draft } from "../../learning/course-content/track01-phase3-t110";
import { track01T111T120Drafts } from "../../learning/course-content/track01-t111-t120";
import { track02BatchADrafts } from "../../learning/course-content/track02-batch-a";
import { track02BatchBDrafts } from "../../learning/course-content/track02-batch-b";
import { track02BatchCDrafts } from "../../learning/course-content/track02-batch-c";
import { track02BatchDDrafts } from "../../learning/course-content/track02-batch-d";
import { track03BatchADrafts } from "../../learning/course-content/track03-batch-a";
import { track03BatchBDrafts } from "../../learning/course-content/track03-batch-b";
import { track03BatchCDrafts } from "../../learning/course-content/track03-batch-c";
import { track03BatchDDrafts } from "../../learning/course-content/track03-batch-d";
import { track03BatchEDrafts } from "../../learning/course-content/track03-batch-e";
import { track04BatchADrafts } from "../../learning/course-content/track04-batch-a";
import { track04BatchBDrafts } from "../../learning/course-content/track04-batch-b";
import { track04BatchCDrafts } from "../../learning/course-content/track04-batch-c";
import { track04BatchDDrafts } from "../../learning/course-content/track04-batch-d";
import { track04BatchEDrafts } from "../../learning/course-content/track04-batch-e";
import { track05BatchADrafts } from "../../learning/course-content/track05-batch-a";
import { track05BatchBDrafts } from "../../learning/course-content/track05-batch-b";
import { track05BatchCDrafts } from "../../learning/course-content/track05-batch-c";
import { track05BatchDDrafts } from "../../learning/course-content/track05-batch-d";
import { track05BatchEDrafts } from "../../learning/course-content/track05-batch-e";
import { track05BatchFDrafts } from "../../learning/course-content/track05-batch-f";
import { getTrack01Phase1RuntimePresentation } from "../../learning/track01-phase1-runtime";
import { getTrack02BatchARuntimePresentation } from "../../learning/track02-batch-a-runtime";
import { getTrack02BatchBRuntimePresentation } from "../../learning/track02-batch-b-runtime";
import { getTrack02BatchCRuntimePresentation } from "../../learning/track02-batch-c-runtime";
import { getTrack02BatchDRuntimePresentation } from "../../learning/track02-batch-d-runtime";
import { getTrack03BatchARuntimePresentation } from "../../learning/track03-batch-a-runtime";
import { getTrack03BatchesBERuntimePresentation } from "../../learning/track03-batches-b-e-runtime";
import { getTrack04RuntimePresentation } from "../../learning/track04-runtime";
import { getTrack05RuntimePresentation } from "../../learning/track05-runtime";
import type { LessonSpec } from "../../learning/lesson-spec";

export type AdminCourseSnapshot = {
  courseHeader: {
    title: string;
    catalogTitle?: string;
    catalogSubtitle: string;
    lessonPageLead: string;
  };
  stepMeta: Array<{
    id: string;
    kind: LessonSpec["steps"][number]["kind"];
    title: string;
    objective: string;
    navigationDescription: string;
  }>;
  intro: {
    title: string;
    situation: string;
    approaches: Array<{ label: string; text: string }>;
    takeaway: string;
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
    questionType: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    masteryRole?: "BEST_JUDGMENT" | "MISCONCEPTION" | "BOUNDARY_CONDITIONS";
    question: string;
    options: Array<{ value: string; label: string }>;
    correctValues: string[];
    explanation: string;
    correctFeedback: string;
    incorrectFeedback: string;
  }>;
  practice: {
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
    activity: {
      title: string;
      instruction: string;
      prompt: string;
      reflection: string;
    };
    referenceAnswer: string;
    referenceFill: Record<string, string>;
  };
  review: {
    items: string[];
    labels: { primary: string; secondary: string };
    knowledgeDepth: Array<{ title: string; text: string }>;
    mistakes: string[];
    related: string[];
  };
  capability: {
    title: string;
    gain: string[];
    selfAssessment: string[];
    triggerScenario: string;
    nextLessonValue: string;
  };
};

type Presentation = {
  activity: {
    title: string;
    instruction: string;
    prompt?: string | null;
    reflection: string;
  };
  introComparison: {
    title: string;
    situation: string;
    approaches: Array<{ label: string; text: string }>;
    takeaway: string;
    bottomDetails: Array<{ title: string; text: string }>;
  };
  referenceAnswer?: string | null;
  referenceFill?: Record<string, string>;
  knowledgeDepth: {
    example: Array<{ title: string; text: string }>;
    review: Array<{ title: string; text: string }>;
  };
  reviewItems: string[];
  reviewLabels?: { primary: string; secondary: string };
  selfAssessment: string[];
  triggerScenario?: string | null;
  capabilityTitle?: string | null;
};

const track01Drafts = [
  track01T101Draft,
  track01T102Draft,
  track01T103Draft,
  track01T104Draft,
  track01T105Draft,
  track01T106Draft,
  track01T107Draft,
  track01T108Draft,
  track01T109Draft,
  track01T110Draft,
  ...track01T111T120Drafts
] as unknown as CourseBuilderBuildDraft[];

const drafts = [
  ...track01Drafts,
  ...track02BatchADrafts,
  ...track02BatchBDrafts,
  ...track02BatchCDrafts,
  ...track02BatchDDrafts,
  ...track03BatchADrafts,
  ...track03BatchBDrafts,
  ...track03BatchCDrafts,
  ...track03BatchDDrafts,
  ...track03BatchEDrafts,
  ...track04BatchADrafts,
  ...track04BatchBDrafts,
  ...track04BatchCDrafts,
  ...track04BatchDDrafts,
  ...track04BatchEDrafts,
  ...track05BatchADrafts,
  ...track05BatchBDrafts,
  ...track05BatchCDrafts,
  ...track05BatchDDrafts,
  ...track05BatchEDrafts,
  ...track05BatchFDrafts
] as CourseBuilderBuildDraft[];

const draftByKey = new Map(
  drafts.map((draft) => [
    draft.lessonSpec.courseSlug + "/" + draft.lessonSpec.lessonId,
    draft
  ] as const)
);

const presentationGetters = [
  getTrack01Phase1RuntimePresentation,
  getTrack02BatchARuntimePresentation,
  getTrack02BatchBRuntimePresentation,
  getTrack02BatchCRuntimePresentation,
  getTrack02BatchDRuntimePresentation,
  getTrack03BatchARuntimePresentation,
  getTrack03BatchesBERuntimePresentation,
  getTrack04RuntimePresentation,
  getTrack05RuntimePresentation
];

function presentationFor(courseSlug: string, lessonSlug: string) {
  for (const getter of presentationGetters) {
    const value = getter(courseSlug, lessonSlug);
    if (value) return value as Presentation;
  }
  return null;
}

export function getFormalAdminCourseSnapshot(
  courseSlug: string,
  lessonSlug: string,
  catalogSubtitle: string
): AdminCourseSnapshot {
  const draft = draftByKey.get(courseSlug + "/" + lessonSlug);
  if (!draft) throw new Error("ADMIN_COURSE_DRAFT_MISSING:" + courseSlug + "/" + lessonSlug);
  if (!draft.checkSequence || draft.checkSequence.length === 0) {
    throw new Error("ADMIN_COURSE_CHECKS_MISSING:" + courseSlug + "/" + lessonSlug);
  }
  if (!draft.practice) {
    throw new Error("ADMIN_COURSE_PRACTICE_MISSING:" + courseSlug + "/" + lessonSlug);
  }

  const presentation = presentationFor(courseSlug, lessonSlug);
  if (!presentation?.introComparison) {
    throw new Error("ADMIN_COURSE_PRESENTATION_MISSING:" + courseSlug + "/" + lessonSlug);
  }
  if (!presentation.knowledgeDepth) {
    throw new Error("ADMIN_COURSE_KNOWLEDGE_DEPTH_MISSING:" + courseSlug + "/" + lessonSlug);
  }
  if (!presentation.selfAssessment?.length) {
    throw new Error("ADMIN_COURSE_SELF_ASSESSMENT_MISSING:" + courseSlug + "/" + lessonSlug);
  }
  const triggerScenario =
    presentation.triggerScenario ??
    "当真实任务中再次出现本课解决的问题时，这节课学到的能力就适用于识别问题、判断边界并完成对应处理。";
  const nextLessonValue = draft.lessonSpec.nextLessonValue;
  if (!nextLessonValue) throw new Error("ADMIN_COURSE_NEXT_LESSON_VALUE_MISSING:" + courseSlug + "/" + lessonSlug);

  const capabilityStep = draft.lessonSpec.steps.find((step) => step.kind === "CAPABILITY");
  if (!capabilityStep) {
    throw new Error("ADMIN_COURSE_CAPABILITY_STEP_MISSING:" + courseSlug + "/" + lessonSlug);
  }

  return {
    courseHeader: {
      title: draft.lessonSpec.title,
      catalogTitle: draft.lessonSpec.title,
      catalogSubtitle,
      lessonPageLead: draft.content.whyItMatters || draft.content.summary
    },
    stepMeta: draft.lessonSpec.steps.map((step) => ({
      id: step.id,
      kind: step.kind,
      title: step.title,
      objective: step.objective,
      navigationDescription: step.navigationDescription ?? step.objective
    })),
    intro: {
      title: presentation.introComparison.title,
      situation: presentation.introComparison.situation,
      approaches: presentation.introComparison.approaches.map((item) => ({ ...item })),
      takeaway: presentation.introComparison.takeaway,
      bottomDetails: presentation.introComparison.bottomDetails.map((item) => ({ ...item }))
    },
    example: {
      title: draft.content.example.title,
      situation: draft.content.example.situation,
      before: draft.content.example.before ?? "",
      after: draft.content.example.after ?? "",
      result: draft.content.example.result,
      knowledgeDepth: presentation.knowledgeDepth.example.map((item) => ({ ...item }))
    },
    checks: draft.checkSequence.map((check) => ({
      id: check.id,
      questionType: check.questionType,
      masteryRole: check.masteryRole,
      question: check.question,
      options: check.options.map((option) => ({ ...option })),
      correctValues: [...check.correctValues],
      explanation: check.explanation,
      correctFeedback: check.correctFeedback,
      incorrectFeedback: check.incorrectFeedback
    })),
    practice: {
      id: draft.practice.id,
      title: draft.practice.title,
      goal: draft.practice.goal,
      instructions: draft.practice.instructions.map((item) => ({ ...item })),
      hints: [...draft.practice.hints],
      rubric: draft.practice.rubric.map((item) => ({ ...item })),
      passScore: draft.practice.passScore,
      activity: {
        title: presentation.activity.title,
        instruction: presentation.activity.instruction,
        prompt: presentation.activity.prompt ?? "",
        reflection: presentation.activity.reflection
      },
      referenceAnswer: presentation.referenceAnswer ?? draft.referenceAnswer ?? "",
      referenceFill: { ...(presentation.referenceFill ?? {}) }
    },
    review: {
      items: [...presentation.reviewItems],
      labels: presentation.reviewLabels ?? {
        primary: "AI适合做什么",
        secondary: "AI不应该替你做什么"
      },
      knowledgeDepth: presentation.knowledgeDepth.review.map((item) => ({ ...item })),
      mistakes: [...draft.content.mistakes],
      related: [...draft.content.related]
    },
    capability: {
      title: presentation.capabilityTitle ?? capabilityStep.title,
      gain: [...draft.lessonSpec.capabilityGain],
      selfAssessment: [...presentation.selfAssessment],
      triggerScenario,
      nextLessonValue
    }
  };
}

export function getFormalAdminCourseSnapshotCount() {
  return draftByKey.size;
}
