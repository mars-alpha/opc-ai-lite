import "server-only";
import { unstable_cache } from "next/cache";

import { and, eq } from "drizzle-orm";
import type { Lesson } from "../../courses";
import { getDatabase } from "../db";
import { lessons, modules, stages } from "../db/schema";

function asLessonContent(value: unknown): Omit<Lesson, "id" | "title" | "summary" | "duration"> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const content = value as Record<string, unknown>;

  if (
    typeof content.plainExplanation !== "string" ||
    typeof content.whyItMatters !== "string" ||
    !Array.isArray(content.points) ||
    !Array.isArray(content.content) ||
    !content.example ||
    typeof content.example !== "object" ||
    !Array.isArray(content.guides) ||
    !content.practice ||
    typeof content.practice !== "object" ||
    !Array.isArray(content.mistakes) ||
    !Array.isArray(content.related)
  ) {
    return null;
  }

  return content as Omit<Lesson, "id" | "title" | "summary" | "duration">;
}

async function readPublishedLessonFromDatabase(
  courseSlug: string,
  lessonSlug: string
): Promise<Lesson | null> {
  try {
    const [row] = await getDatabase()
      .select({
        id: lessons.slug,
        title: lessons.title,
        summary: lessons.summary,
        durationMinutes: lessons.durationMinutes,
        content: lessons.content
      })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(stages, eq(modules.stageId, stages.id))
      .where(
        and(
          eq(stages.slug, courseSlug),
          eq(lessons.slug, lessonSlug),
          eq(lessons.status, "PUBLISHED")
        )
      )
      .limit(1);

    if (!row) return null;
    const content = asLessonContent(row.content);
    if (!content) {
      console.warn("[OPC AI] Published lesson content is invalid; using static fallback.", {
        courseSlug,
        lessonSlug
      });
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      duration: row.durationMinutes ? row.durationMinutes + " 分钟" : "—",
      ...content
    };
  } catch (error) {
    console.warn("[OPC AI] Database lesson read failed; using static fallback.", error);
    return null;
  }
}


export const getPublishedLessonFromDatabase = unstable_cache(
  readPublishedLessonFromDatabase,
  ["published-lesson"],
  { revalidate: 60 }
);

