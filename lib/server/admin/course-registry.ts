import "server-only";

import { formalLessonSpecs } from "../../learning/lesson-spec-registry";
import { learningTracks } from "../../learning/track-catalog";
import type { LessonSpec } from "../../learning/lesson-spec";
import { track01T101Draft, track01T101Intro } from "../../learning/course-content/track01-batch-a";
import { getTrack01Phase1RuntimePresentation } from "../../learning/track01-phase1-runtime";

export type AdminCourseRegistryItem = {
  trackSlug: string;
  trackIndex: string;
  trackTitle: string;
  stageId: string;
  stageTitle: string;
  stageOrder: number;
  lessonId: string;
  lessonTitle: string;
  lessonSubtitle: string;
  learnerOutcome: string;
  lessonOrder: number;
  lessonType: LessonSpec["lessonType"];
  specVersion: string;
  runtimeCourseSlug: string;
  runtimeLessonId: string;
  availability: "AVAILABLE";
  contentState: "FROZEN";
  preview?: {
    courseHeader: { title: string; catalogTitle?: string; catalogSubtitle: string; lessonPageLead: string };
    stepMeta: { id: string; kind: LessonSpec["steps"][number]["kind"]; title: string; objective: string; navigationDescription: string }[];
    intro: {
      title: string;
      situation: string;
      approaches: { label: string; text: string }[];
      takeaway: string;
      bottomDetails: { title: string; text: string }[];
    };
    example: {
      title: string;
      situation: string;
      before: string;
      after: string;
      result: string;
      knowledgeDepth: { title: string; text: string }[];
    };
    checks: {
      id: string;
      questionType: "SINGLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
      masteryRole?: "BEST_JUDGMENT" | "MISCONCEPTION" | "BOUNDARY_CONDITIONS";
      question: string;
      options: { value: string; label: string }[];
      correctValues: string[];
      explanation: string;
      correctFeedback: string;
      incorrectFeedback: string;
    }[];
    practice: {
      id: string;
      title: string;
      goal: string;
      instructions: { key: string; label: string; prompt: string }[];
      hints: string[];
      rubric: { key: string; label: string; maxScore: number; minScore: number; example: string }[];
      passScore: number;
      activity: { title: string; instruction: string; prompt: string; reflection: string };
      referenceAnswer: string;
      referenceFill: Record<string, string>;
    };
    review: {
      items: string[];
      labels: { primary: string; secondary: string };
      knowledgeDepth: { title: string; text: string }[];
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
};

export type AdminCourseRegistrySummary = {
  tracks: number;
  stages: number;
  lessons: number;
  availableLessons: number;
  frozenLessons: number;
};

const specByKey = new Map(
  formalLessonSpecs.map((spec) => [spec.courseSlug + "/" + spec.lessonId, spec] as const)
);

const t101FormalSpec = specByKey.get("foundation-ai/t1-01-ai-task-fit");
if (!t101FormalSpec) throw new Error("ADMIN_COURSE_T101_SPEC_MISSING");

const DEFAULT_TRIGGER_SCENARIO =
  "当真实任务中再次出现本课解决的问题时，这节课学到的能力就适用于识别问题、判断边界并完成对应处理。";

const t101Presentation = getTrack01Phase1RuntimePresentation("foundation-ai", "t1-01-ai-task-fit");
if (!t101Presentation) throw new Error("ADMIN_COURSE_T101_PRESENTATION_MISSING");
if (!t101Presentation.practice) throw new Error("ADMIN_COURSE_T101_PRACTICE_MISSING");

const t101Preview: NonNullable<AdminCourseRegistryItem["preview"]> = {
  courseHeader: {
    title: track01T101Draft.lessonSpec.title,
    catalogTitle: track01T101Draft.lessonSpec.title,
    catalogSubtitle: "先找到适合让 AI 协助的小步骤，同时保留事实核对和最终判断。",
    lessonPageLead: track01T101Draft.content.whyItMatters || track01T101Draft.content.summary
  },
  stepMeta: t101FormalSpec.steps.map((step) => ({
    id: step.id,
    kind: step.kind,
    title: step.title,
    objective: step.objective,
    navigationDescription: step.navigationDescription ?? step.objective
  })),
  intro: {
    title: track01T101Intro.title,
    situation: track01T101Intro.situation,
    approaches: track01T101Intro.approaches.map((item) => ({ label: item.label, text: item.text })),
    takeaway: track01T101Intro.takeaway,
    bottomDetails: track01T101Intro.bottomDetails.map((item) => ({ title: item.title, text: item.text }))
  },
  example: {
    ...track01T101Draft.content.example,
    knowledgeDepth: t101Presentation.knowledgeDepth.example.map((item) => ({ title: item.title, text: item.text }))
  },
  checks: track01T101Draft.checkSequence.map((item) => ({
    id: item.id,
    questionType: item.questionType,
    masteryRole: item.masteryRole,
    question: item.question,
    options: item.options.map((option) => ({ value: option.value, label: option.label })),
    correctValues: [...item.correctValues],
    explanation: item.explanation,
    correctFeedback: item.correctFeedback,
    incorrectFeedback: item.incorrectFeedback
  })),
  practice: {
    id: t101Presentation.practice.id,
    title: t101Presentation.practice.title,
    goal: t101Presentation.practice.goal,
    instructions: t101Presentation.practice.instructions.map((item) => ({ key: item.key, label: item.label, prompt: item.prompt })),
    hints: [...t101Presentation.practice.hints],
    rubric: t101Presentation.practice.rubric.map((item) => ({ ...item })),
    passScore: t101Presentation.practice.passScore,
    activity: {
      title: t101Presentation.activity.title,
      instruction: t101Presentation.activity.instruction,
      prompt: t101Presentation.activity.prompt ?? "",
      reflection: t101Presentation.activity.reflection
    },
    referenceAnswer: t101Presentation.referenceAnswer ?? "",
    referenceFill: { ...t101Presentation.referenceFill }
  },
  review: {
    items: [...t101Presentation.reviewItems],
    labels: {
      primary: t101Presentation.reviewLabels?.primary ?? "核心判断",
      secondary: t101Presentation.reviewLabels?.secondary ?? "怎么理解"
    },
    knowledgeDepth: t101Presentation.knowledgeDepth.review.map((item) => ({ title: item.title, text: item.text })),
    mistakes: [...track01T101Draft.content.mistakes],
    related: [...track01T101Draft.content.related]
  },
  capability: {
    title: t101Presentation.capabilityTitle ?? "把“学过”变成你现在真的能做的事情",
    gain: [...track01T101Draft.lessonSpec.capabilityGain],
    selfAssessment: [...t101Presentation.selfAssessment],
    triggerScenario: t101Presentation.triggerScenario ?? DEFAULT_TRIGGER_SCENARIO,
    nextLessonValue: track01T101Draft.lessonSpec.nextLessonValue
  }
};

export function listAdminCourseRegistry(): {
  summary: AdminCourseRegistrySummary;
  items: AdminCourseRegistryItem[];
} {
  const tracks = Object.values(learningTracks);
  const items = tracks.flatMap((track) =>
    track.stages.flatMap((stage) =>
      stage.lessons.map((lesson) => {
        const runtimeCourseSlug = lesson.runtimeCourseSlug;
        const runtimeLessonId = lesson.runtimeLessonId;

        if (
          lesson.curriculumStatus !== "AVAILABLE" ||
          lesson.availability !== "AVAILABLE" ||
          !runtimeCourseSlug ||
          !runtimeLessonId
        ) {
          throw new Error("ADMIN_COURSE_REGISTRY_NON_FORMAL_LESSON:" + lesson.lessonId);
        }

        const key = runtimeCourseSlug + "/" + runtimeLessonId;
        const spec = specByKey.get(key);
        if (!spec) {
          throw new Error("ADMIN_COURSE_REGISTRY_SPEC_MISSING:" + key);
        }

        return {
          trackSlug: track.slug,
          trackIndex: track.index,
          trackTitle: track.title,
          stageId: stage.stageId,
          stageTitle: stage.title,
          stageOrder: stage.order,
          lessonId: lesson.lessonId,
          lessonTitle: lesson.title,
          lessonSubtitle: lesson.subtitle,
          learnerOutcome: lesson.learnerOutcome,
          lessonOrder: lesson.order,
          lessonType: spec.lessonType,
          specVersion: spec.version,
          runtimeCourseSlug,
          runtimeLessonId,
          availability: "AVAILABLE" as const,
          contentState: "FROZEN" as const,
          preview: lesson.lessonId === "t1-01-ai-task-fit" ? t101Preview : undefined
        };
      })
    )
  );

  return {
    summary: {
      tracks: tracks.length,
      stages: tracks.reduce((total, track) => total + track.stages.length, 0),
      lessons: items.length,
      availableLessons: items.filter((item) => item.availability === "AVAILABLE").length,
      frozenLessons: items.filter((item) => item.contentState === "FROZEN").length
    },
    items
  };
}
