import "server-only";
import { unstable_cache } from "next/cache";

import { and, asc, desc, eq, ne } from "drizzle-orm";
import type { KnowledgeItem as ContentReadItem } from "../../contentDemo";
import { knowledgeItems as fallbackItems } from "../../contentDemo";
import { getDatabase } from "../db";
import { contentItems, knowledgeItems, lessons, stages } from "../db/schema";

const impactLabelByDestination: Record<ContentReadItem["destination"], string> = {
  DAILY_ITEM: "值得关注",
  KNOWLEDGE_CAPSULE: "形成知识胶囊",
  PRACTICE_CANDIDATE: "值得做实操",
  COURSE_UPDATE_CANDIDATE: "可能影响课程"
};

function destinationForRead(
  value: "IGNORE" | "DAILY_ITEM" | "KNOWLEDGE_CAPSULE" | "PRACTICE_CANDIDATE" | "COURSE_UPDATE_CANDIDATE"
): ContentReadItem["destination"] {
  if (value === "IGNORE") return "DAILY_ITEM";
  return value;
}

export async function listPublishedContentItems(): Promise<ContentReadItem[]> {
  const db = getDatabase();

  const rows = await db
    .select({
      contentId: contentItems.id,
      contentTitle: contentItems.title,
      contentSummary: contentItems.summary,
      contentCategory: contentItems.category,
      contentDestination: contentItems.destination,
      contentReadingMinutes: contentItems.readingMinutes,
      knowledgeId: knowledgeItems.id,
      knowledgeTitle: knowledgeItems.title,
      knowledgeSummary: knowledgeItems.summary,
      knowledgeCategory: knowledgeItems.category,
      knowledgeReadingMinutes: knowledgeItems.readingMinutes,
      stageSlug: stages.slug,
      stageTitle: stages.title,
      stageOutcome: stages.outcome,
      stageOrder: stages.order,
      lessonSlug: lessons.slug
    })
    .from(contentItems)
    .leftJoin(
      knowledgeItems,
      and(
        eq(knowledgeItems.sourceContentId, contentItems.id),
        eq(knowledgeItems.status, "PUBLISHED")
      )
    )
    .leftJoin(stages, eq(knowledgeItems.stageId, stages.id))
    .leftJoin(lessons, eq(knowledgeItems.lessonId, lessons.id))
    .where(
      and(
        eq(contentItems.status, "PUBLISHED"),
        ne(contentItems.destination, "IGNORE")
      )
    )
    .orderBy(desc(contentItems.publishedAt), desc(contentItems.updatedAt), asc(contentItems.title));

  return rows.map((row) => {
    const destination = destinationForRead(row.contentDestination);
    const stage = row.stageTitle ?? "AI";
    const stageLabel = row.stageOrder
      ? "Stage " + row.stageOrder + " · " + (row.stageOutcome ?? row.stageTitle ?? "AI")
      : "AI 更新";

    return {
      id: row.knowledgeId ?? row.contentId,
      title: row.knowledgeTitle ?? row.contentTitle,
      category: row.knowledgeCategory ?? row.contentCategory,
      summary: row.knowledgeSummary ?? row.contentSummary,
      destination,
      impactLabel: impactLabelByDestination[destination],
      stage,
      stageLabel,
      courseSlug: row.stageSlug ?? undefined,
      lessonId: row.lessonSlug ?? undefined,
      readingTime: ((row.knowledgeReadingMinutes ?? row.contentReadingMinutes) || 5) + " 分钟"
    };
  });
}

const listPublishedContentItemsCached = unstable_cache(
  listPublishedContentItems,
  ["opc-published-content-items"],
  { revalidate: 60, tags: ["opc-published-content"] }
);

export async function listPublishedContentItemsWithFallback(): Promise<ContentReadItem[]> {
  try {
    const items = await listPublishedContentItemsCached();
    return items.length > 0 ? items : fallbackItems;
  } catch (error) {
    console.warn("[OPC AI] Published content read failed; using static fallback.", error);
    return fallbackItems;
  }
}


