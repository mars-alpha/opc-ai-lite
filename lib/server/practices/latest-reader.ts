import "server-only";

import { and, desc, eq, notInArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { KnowledgeItem } from "../../contentDemo";
import { knowledgeItems as fallbackItems } from "../../contentDemo";
import { getDatabase } from "../db";
import { contentItems, knowledgeItems, lessons, practices, stages } from "../db/schema";

function splitBody(body: string | null) {
  if (!body) return undefined;
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [body.trim()];
}

function impactLabel(destination: KnowledgeItem["destination"], practiceId?: string) {
  if (practiceId) return "值得做实操";
  if (destination === "COURSE_UPDATE_CANDIDATE") return "可能影响课程";
  if (destination === "PRACTICE_CANDIDATE") return "值得做实操";
  if (destination === "DAILY_ITEM") return "值得关注";
  return "形成知识胶囊";
}

export async function listPublishedLatestPracticeItems(): Promise<KnowledgeItem[]> {
  const rows = await getDatabase()
    .select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      summary: knowledgeItems.summary,
      body: knowledgeItems.body,
      category: knowledgeItems.category,
      readingMinutes: knowledgeItems.readingMinutes,
      publishedAt: knowledgeItems.publishedAt,
      contentDestination: contentItems.destination,
      stageSlug: stages.slug,
      stageTitle: stages.title,
      stageOutcome: stages.outcome,
      stageOrder: stages.order,
      lessonSlug: lessons.slug,
      practiceId: practices.id
    })
    .from(knowledgeItems)
    .leftJoin(contentItems, eq(knowledgeItems.sourceContentId, contentItems.id))
    .leftJoin(stages, eq(knowledgeItems.stageId, stages.id))
    .leftJoin(lessons, eq(knowledgeItems.lessonId, lessons.id))
    .leftJoin(
      practices,
      and(
        eq(practices.sourceKnowledgeId, knowledgeItems.id),
        eq(practices.type, "LATEST_PRACTICE"),
        eq(practices.status, "PUBLISHED")
      )
    )
    .where(
      and(
        eq(knowledgeItems.status, "PUBLISHED"),
        notInArray(knowledgeItems.validity, ["OUTDATED", "DEPRECATED"])
      )
    )
    .orderBy(desc(knowledgeItems.publishedAt), desc(knowledgeItems.updatedAt));

  return rows.map((row) => {
    const rawDestination = row.contentDestination;
    const destination: KnowledgeItem["destination"] =
      rawDestination && rawDestination !== "IGNORE"
        ? rawDestination
        : row.practiceId
          ? "PRACTICE_CANDIDATE"
          : "KNOWLEDGE_CAPSULE";
    const stageLabel = row.stageOrder
      ? "Stage " + row.stageOrder + " · " + (row.stageOutcome ?? row.stageTitle ?? "AI")
      : "AI 更新";

    return {
      id: row.id,
      title: row.title,
      category: row.category,
      summary: row.summary,
      body: splitBody(row.body),
      destination,
      impactLabel: impactLabel(destination, row.practiceId ?? undefined),
      stage: row.stageTitle ?? "AI",
      stageLabel,
      courseSlug: row.stageSlug ?? undefined,
      lessonId: row.lessonSlug ?? undefined,
      readingTime: (row.readingMinutes || 5) + " 分钟",
      practiceId: row.practiceId ?? undefined
    };
  });
}

const listPublishedLatestPracticeItemsCached = unstable_cache(
  listPublishedLatestPracticeItems,
  ["opc-latest-practice-items"],
  { revalidate: 60, tags: ["opc-latest-practice"] }
);

export async function listPublishedLatestPracticeItemsWithFallback(): Promise<KnowledgeItem[]> {
  try {
    const items = await listPublishedLatestPracticeItemsCached();
    return items.length > 0 ? items : fallbackItems;
  } catch (error) {
    console.warn("[OPC AI] Latest Practice read failed; using static fallback.", error);
    return fallbackItems;
  }
}

export async function getPublishedLatestPracticeItemWithFallback(id: string) {
  const items = await listPublishedLatestPracticeItemsWithFallback();
  return items.find((item) => item.id === id) ?? null;
}
