import { getAllLessons, getCourse } from "../courses";

export function learningPathHrefForCourse(courseSlug: string) {
  const track = courseSlug === "ai-workflow" ? "ai-workflow" : courseSlug === "ai-growth" ? "ai-growth" : courseSlug === "ai-work" ? "ai-work" : "foundation-ai";
  return "/learning-path?track=" + track + "#foundation-catalog";
}

export function getCrossTrackNextLesson(courseSlug: string, lessonId: string) {
  const current = getCourse(courseSlug);
  const currentLessons = current ? getAllLessons(current) : [];
  if (!currentLessons.length || currentLessons.at(-1)?.id !== lessonId) return null;

  const nextCourseSlug = courseSlug === "foundation-ai" ? "ai-work" : courseSlug === "ai-work" ? "ai-growth" : courseSlug === "ai-growth" ? "ai-workflow" : null;
  if (!nextCourseSlug) return null;
  const nextCourse = getCourse(nextCourseSlug);
  const firstLesson = nextCourse ? getAllLessons(nextCourse)[0] : null;
  if (!firstLesson) return null;

  return {
    id: firstLesson.id,
    title: firstLesson.title,
    href: "/courses/" + nextCourseSlug + "/lessons/" + firstLesson.id,
    label: nextCourseSlug === "ai-work" ? "继续：AI 工作应用" : nextCourseSlug === "ai-growth" ? "继续：AI 推广运营与业务增长" : "继续：AI Workflow 与自动化"
  };
}
