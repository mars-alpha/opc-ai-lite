import "server-only";

import type { Lesson } from "../../courses";
import { getSessionUser } from "../auth/service";
import { getPublishedLessonFromDatabase } from "../courses/reader";
import { getLessonPageAccess } from "../entitlements/service";
import { measureServerTask } from "../perf";

export async function getLessonPageContext(input: {
  sessionToken: string | null;
  courseSlug: string;
  lessonSlug: string;
  staticLesson: Lesson;
  preferStaticLesson?: boolean;
}) {
  const [databaseLesson, user] = await Promise.all([
    input.preferStaticLesson
      ? Promise.resolve(null)
      : measureServerTask("lesson.content", () =>
          getPublishedLessonFromDatabase(input.courseSlug, input.lessonSlug)
        ),
    measureServerTask("lesson.session", () => getSessionUser(input.sessionToken))
  ]);

  const lesson = databaseLesson ?? input.staticLesson;
  const { access, lockedLessonIds } = await measureServerTask(
    "lesson.access",
    () => getLessonPageAccess(user?.id ?? null, input.courseSlug, lesson.id)
  );

  return {
    user,
    lesson,
    access,
    lockedLessonIds
  };
}
