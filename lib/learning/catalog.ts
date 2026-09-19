export type LearningCatalogLesson = {
  id: string;
  title: string;
  summary: string;
};

export type LearningCatalogCourse = {
  slug: string;
  title: string;
  stageLabel: string;
  lessons: LearningCatalogLesson[];
};
