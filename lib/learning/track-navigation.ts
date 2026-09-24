import { getAllLessons, getCourse } from "../courses";

export function learningPathHrefForCourse(courseSlug: string) {
  const track = courseSlug === "ai-work" ? "ai-work" : "foundation-ai";
  return "/learning-path?track=" + track + "#foundation-catalog";
}

export function getCrossTrackNextLesson(courseSlug: string, lessonId: string) {
  if (courseSlug !== "foundation-ai") return null;
  const foundation = getCourse("foundation-ai");
  const foundationLessons = foundation ? getAllLessons(foundation) : [];
  if (!foundationLessons.length || foundationLessons.at(-1)?.id !== lessonId) return null;

  const track02 = getCourse("ai-work");
  const firstTrack02Lesson = track02 ? getAllLessons(track02)[0] : null;
  if (!firstTrack02Lesson) return null;

  return {
    id: firstTrack02Lesson.id,
    title: firstTrack02Lesson.title,
    href: "/courses/ai-work/lessons/" + firstTrack02Lesson.id,
    label: "继续：AI 工作应用"
  };
}
