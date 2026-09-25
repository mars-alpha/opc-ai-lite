import {
  foundationCatalog,
  type FoundationAvailability,
  type FoundationCatalogLesson,
  type FoundationCatalogStage,
  type FoundationCatalogStatus,
  type FoundationLessonType
} from "./foundation-catalog";

export type LearningTrackSlug = "foundation-ai" | "ai-work";
export type TrackCatalogLesson = FoundationCatalogLesson;
export type TrackCatalogStage = FoundationCatalogStage;

export type LearningTrackCatalog = {
  slug: LearningTrackSlug;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  stageLabel: string;
  stages: TrackCatalogStage[];
};

function plannedLesson(
  lessonId: string,
  title: string,
  subtitle: string,
  order: number,
  prerequisites: string[],
  status: FoundationCatalogStatus = "PLANNED",
  type: FoundationLessonType = "APPLICATION",
  estimatedMinutes = 18
): TrackCatalogLesson {
  return {
    lessonId,
    title,
    subtitle,
    learnerOutcome: subtitle,
    lessonType: type,
    estimatedMinutes,
    curriculumStatus: status,
    availability: "COMING_SOON" satisfies FoundationAvailability,
    prerequisites,
    badge: status === "IN_PRODUCTION" ? "准备开放" : "规划中",
    order
  };
}

export const track02Catalog: TrackCatalogStage[] = [
  {
    stageId: "work-research",
    title: "会找答案",
    promise: "需要资料时，知道怎么把问题问清楚、判断证据，并处理多个来源的差异。",
    order: 1,
    lessons: [
      { ...plannedLesson("t2-01-research-question-scope", "问题太大？先把它变成真正能查清楚的问题", "把模糊工作主题整理成可研究、可核验的问题。", 1, ["T1-02", "T1-03", "T1-05"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-01-research-question-scope", badge: "已上线" },
      { ...plannedLesson("t2-02-source-evidence-judgment", "AI 给了来源，怎么判断这些证据真的靠得住", "判断来源实际能证明什么、适用于谁，以及还缺什么。", 2, ["T2-01", "T1-05", "T1-09", "T1-10"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-02-source-evidence-judgment", badge: "已上线" },
      { ...plannedLesson("t2-03-multi-source-synthesis", "几个来源说法不一样，怎么判断差异到底在哪里", "先对齐定义、对象、时间和方法，再形成有边界的综合判断。", 3, ["T2-01", "T2-02"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-03-multi-source-synthesis", badge: "已上线" }
    ]
  },
  {
    stageId: "work-deliverable",
    title: "会做成品",
    promise: "把已经查清的信息，变成适合真实对象和用途的可交付结果。",
    order: 2,
    lessons: [
      { ...plannedLesson("t2-04-audience-purpose", "同样的信息，怎么针对不同人表达", "根据对象、目的和预期行动调整表达。", 1, ["T2-03"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-04-audience-purpose", badge: "已上线" },
      { ...plannedLesson("t2-05-source-to-deliverable", "一堆资料，怎么变成能交付的成品", "把来源、结构、草稿和交付结果连起来。", 2, ["T2-04"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-05-source-to-deliverable", badge: "已上线" },
      { ...plannedLesson("t2-06-editorial-revision", "AI 已经写出来了，但“不好”，到底怎么改", "先诊断问题层级，再做有目标的修改。", 3, ["T2-05"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-06-editorial-revision", badge: "已上线" }
    ]
  },
  {
    stageId: "work-documents",
    title: "会处理复杂资料",
    promise: "文件多、内容长时，仍然知道怎样定位、比较，并把信息推进成行动。",
    order: 3,
    lessons: [
      { ...plannedLesson("t2-07-targeted-document-reading", "文件太长，怎么快速找到真正需要的信息", "围绕目标字段和问题做定向阅读。", 1, ["T2-06"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-07-targeted-document-reading", badge: "已上线" },
      { ...plannedLesson("t2-08-cross-document-comparison", "多份文件怎么比较，差异在哪里", "先定义比较维度，再抽取、对齐和解释差异。", 2, ["T2-07"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-08-cross-document-comparison", badge: "已上线" },
      { ...plannedLesson("t2-09-information-to-action", "看完资料以后，下一步到底该做什么", "把信息整理成决定、行动、负责人、时间和风险。", 3, ["T2-08"], "AVAILABLE"), availability: "AVAILABLE", runtimeCourseSlug: "ai-work", runtimeLessonId: "t2-09-information-to-action", badge: "已上线" }
    ]
  },
  {
    stageId: "work-data",
    title: "会看数据",
    promise: "面对表格和数字时，先把口径与质量搞清楚，再让 AI 帮你形成可信判断。",
    order: 4,
    lessons: [
      plannedLesson("t2-10-metric-definition", "一个数字到底是什么意思，先把口径搞清楚", "明确指标对象、范围、时间和计算定义。", 1, ["T2-09"]),
      plannedLesson("t2-11-data-quality", "数据很乱，先别急着让 AI 分析", "先判断缺失、重复、格式、单位和异常。", 2, ["T2-10"]),
      plannedLesson("t2-12-data-analysis", "怎么从数据里得到一个可信的判断", "把问题、指标、计算、比较、解释和核验串起来。", 3, ["T2-10", "T2-11"])
    ]
  },
  {
    stageId: "work-knowledge",
    title: "会积累知识",
    promise: "把值得复用的资料和经验留下来，并知道以后怎样找到可信版本。",
    order: 5,
    lessons: [
      plannedLesson("t2-13-knowledge-capture", "哪些东西值得留下来，哪些不用存", "区分临时信息与值得沉淀的稳定知识。", 1, ["T2-12"]),
      plannedLesson("t2-14-knowledge-organization", "怎么让知识以后找得到，而且知道哪份可信", "用主题、来源、日期、版本和事实源维护知识。", 2, ["T2-13"])
    ]
  },
  {
    stageId: "work-reuse",
    title: "会复用方法",
    promise: "把一次做成功的真实工作提炼成以后可以继续使用的方法。",
    order: 6,
    lessons: [
      plannedLesson("t2-15-reusable-method", "这次做得不错，怎么让下次不用重新来", "把成功过程留下成模板、检查清单或轻量流程。", 1, ["T2-14"])
    ]
  }
];

export const learningTracks: Record<LearningTrackSlug, LearningTrackCatalog> = {
  "foundation-ai": {
    slug: "foundation-ai",
    index: "01",
    eyebrow: "AI Foundation",
    title: "AI 基础认知",
    description: "先把最常用的 AI 协作方法练会，再逐步理解模型、知识、工具与现代 AI 能力。",
    stageLabel: "6 个学习阶段",
    stages: foundationCatalog
  },
  "ai-work": {
    slug: "ai-work",
    index: "02",
    eyebrow: "AI Work",
    title: "AI 工作应用",
    description: "把已经理解的 AI 基础能力用到研究、写作、文件、数据、知识和可复用工作方法。",
    stageLabel: "6 个能力分组",
    stages: track02Catalog
  }
};

export function getLearningTrack(slug: string | undefined): LearningTrackCatalog {
  return slug === "ai-work" ? learningTracks["ai-work"] : learningTracks["foundation-ai"];
}

export function isTrackRuntimeLesson(lesson: TrackCatalogLesson) {
  return Boolean(
    (lesson.availability === "AVAILABLE" || lesson.availability === "RUNTIME_PREVIEW") &&
      lesson.runtimeCourseSlug &&
      lesson.runtimeLessonId
  );
}
