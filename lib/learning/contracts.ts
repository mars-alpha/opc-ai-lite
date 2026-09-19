export type UserId = string;
export type StageId = string;
export type CourseId = StageId;
export type LessonId = string;

export type ProgressMap = Record<string, LessonId[]>;
export type LearningStorageMode = "api" | "local";

export type LessonProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type CourseEnrollmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type UserRecord = {
  id: UserId;
  displayName: string | null;
  createdAt: string;
};

export type PublishedCourseRecord = {
  id: CourseId;
  slug: string;
  title: string;
  status: "PUBLISHED";
  version: number;
  updatedAt: string;
};

export type CourseEnrollmentRecord = {
  userId: UserId;
  stageId: StageId;
  status: CourseEnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  updatedAt: string;
};

export type LessonProgressRecord = {
  userId: UserId;
  lessonId: LessonId;
  status: LessonProgressStatus;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
};

export type LessonResourceType = "INTERNAL" | "OFFICIAL" | "FEISHU";

export type LessonResourceRecord = {
  id: string;
  lessonId: LessonId;
  type: LessonResourceType;
  title: string;
  summary: string | null;
  sourceName: string | null;
  url: string;
};

export type LearningSnapshot = {
  authenticated: boolean;
  enrolledCourses: string[];
  completed: ProgressMap;
  storageMode: LearningStorageMode;
  warning?: string;
};

export type LocalProgressSnapshot = LearningSnapshot;

export type LearningStateResponse = {
  enrolledCourses: string[];
  completed: ProgressMap;
};

