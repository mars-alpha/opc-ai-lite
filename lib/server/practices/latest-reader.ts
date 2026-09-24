import "server-only";

import { and, desc, eq, notInArray, sql } from "drizzle-orm";
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

function impactLabel(destination: KnowledgeItem["destination"], hasPractice = false) {
  if (hasPractice) return "值得做实操";
  if (destination === "COURSE_UPDATE_CANDIDATE") return "可能影响课程";
  if (destination === "PRACTICE_CANDIDATE") return "值得做实操";
  if (destination === "DAILY_ITEM") return "值得关注";
  return "形成知识胶囊";
}

function toPublicFallback(item: KnowledgeItem): KnowledgeItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    summary: item.summary,
    destination: item.destination,
    impactLabel: item.impactLabel,
    stage: item.stage,
    stageLabel: item.stageLabel,
    readingTime: item.readingTime
  };
}

export async function listPublishedLatestPracticeItems(): Promise<KnowledgeItem[]> {
  const rows = await getDatabase()
    .select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      summary: knowledgeItems.summary,
      category: knowledgeItems.category,
      readingMinutes: knowledgeItems.readingMinutes,
      publishedAt: knowledgeItems.publishedAt,
      contentDestination: contentItems.destination,
      stageTitle: stages.title,
      stageOutcome: stages.outcome,
      stageOrder: stages.order,
      hasPractice: sql<boolean>`${practices.id} is not null`
    })
    .from(knowledgeItems)
    .leftJoin(contentItems, eq(knowledgeItems.sourceContentId, contentItems.id))
    .leftJoin(stages, eq(knowledgeItems.stageId, stages.id))
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
        : row.hasPractice
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
      destination,
      impactLabel: impactLabel(destination, row.hasPractice),
      stage: row.stageTitle ?? "AI",
      stageLabel,
      readingTime: (row.readingMinutes || 5) + " 分钟"
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
    if (items.length >= 7) return items;
    const existingIds = new Set(items.map((item) => item.id));
    const fallback = fallbackItems
      .filter((item) => !existingIds.has(item.id))
      .map(toPublicFallback);
    return [...items, ...fallback].slice(0, 7);
  } catch (error) {
    console.warn("[OPC AI] Latest Practice read failed; using static public fallback.", error);
    return fallbackItems.map(toPublicFallback);
  }
}

export async function getPublishedLatestPracticeItemWithFallback(id: string) {
  try {
    const items = await listPublishedLatestPracticeItems();
    const current = items.find((item) => item.id === id);
    if (current) return current;
  } catch (error) {
    console.warn("[OPC AI] Latest Practice preview read failed; checking static fallback.", error);
  }

  const fallback = fallbackItems.find((item) => item.id === id);
  return fallback ? toPublicFallback(fallback) : null;
}

export async function getPublishedLatestPracticeMemberItemWithFallback(id: string) {
  try {
    const [row] = await getDatabase()
      .select({
        id: knowledgeItems.id,
        title: knowledgeItems.title,
        summary: knowledgeItems.summary,
        body: knowledgeItems.body,
        category: knowledgeItems.category,
        readingMinutes: knowledgeItems.readingMinutes,
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
          eq(knowledgeItems.id, id),
          eq(knowledgeItems.status, "PUBLISHED"),
          notInArray(knowledgeItems.validity, ["OUTDATED", "DEPRECATED"])
        )
      )
      .limit(1);

    if (row) {
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
        impactLabel: impactLabel(destination, Boolean(row.practiceId)),
        stage: row.stageTitle ?? "AI",
        stageLabel,
        courseSlug: row.stageSlug ?? undefined,
        lessonId: row.lessonSlug ?? undefined,
        readingTime: (row.readingMinutes || 5) + " 分钟",
        practiceId: row.practiceId ?? undefined
      } satisfies KnowledgeItem;
    }
  } catch (error) {
    console.warn("[OPC AI] Latest Practice member detail read failed; checking static fallback.", error);
  }

  return fallbackItems.find((item) => item.id === id) ?? null;
}
