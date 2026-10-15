import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentEventExpansionEvidence,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../db/schema";
import { EVENT_EXPANSION_TYPES, type EventExpansionType } from "./event-expansion";

export const AI_DAILY_EXPANSION_OUTPUT_SCHEMA_VERSION = "event-expansion-output-v1";

export const AI_DAILY_EXPANSION_OUTPUT_SECTION_KEYS = [
  "WHAT_HAPPENED",
  "HOW_TO_EXPERIENCE",
  "HOW_TO_LEARN",
  "HOW_TO_USE",
  "WORK_IMPACT",
  "WHY_SHARE"
] as const;

export type AiDailyExpansionOutputSectionKey =
  (typeof AI_DAILY_EXPANSION_OUTPUT_SECTION_KEYS)[number];

type OutputAuthority = "FACT" | "REFERENCE_ONLY";
type SectionStatus = "SUPPORTED" | "EMPTY";

export type EventExpansionOutputFactInput = {
  rawItemId: string;
  sourceId: string;
  sourceName?: string | null;
  title: string;
  excerpt?: string | null;
  originalUrl?: string | null;
  publishedAt?: Date | string | null;
  role?: string | null;
};

export type EventExpansionOutputReferenceInput = {
  rawItemId: string;
  sourceId: string;
  sourceName?: string | null;
  title: string;
  excerpt?: string | null;
  originalUrl?: string | null;
  publishedAt?: Date | string | null;
  expansionType: EventExpansionType;
  mediaType: string;
  language: string;
  rankScore: number;
};

export type EventExpansionDailyOutputInput = {
  eventId: string;
  eventTitle: string;
  eventSummary?: string | null;
  factEvidence: EventExpansionOutputFactInput[];
  expansionEvidence: EventExpansionOutputReferenceInput[];
};

export type EventExpansionDailyOutputEvidence = {
  rawItemId: string;
  sourceId: string;
  sourceName: string | null;
  title: string;
  excerpt: string | null;
  originalUrl: string | null;
  publishedAt: string | null;
  expansionType: EventExpansionType | null;
  mediaType: string | null;
  language: string | null;
  rankScore: number | null;
  authority: OutputAuthority;
};

export type EventExpansionDailyOutputSection = {
  key: AiDailyExpansionOutputSectionKey;
  label: string;
  authorityPolicy: "FACT_ONLY" | "REFERENCE_ONLY";
  status: SectionStatus;
  items: EventExpansionDailyOutputEvidence[];
};

export type EventExpansionDailyOutput = {
  schemaVersion: typeof AI_DAILY_EXPANSION_OUTPUT_SCHEMA_VERSION;
  eventId: string;
  eventTitle: string;
  eventSummary: string | null;
  sections: EventExpansionDailyOutputSection[];
  missingSectionKeys: AiDailyExpansionOutputSectionKey[];
  unmappedExpansionEvidenceCount: number;
  warnings: string[];
};

const SECTION_DEFINITIONS: ReadonlyArray<{
  key: AiDailyExpansionOutputSectionKey;
  label: string;
  authorityPolicy: EventExpansionDailyOutputSection["authorityPolicy"];
  expansionTypes: readonly EventExpansionType[];
  maxItems: number;
}> = [
  {
    key: "WHAT_HAPPENED",
    label: "发生了什么",
    authorityPolicy: "FACT_ONLY",
    expansionTypes: [],
    maxItems: 3
  },
  {
    key: "HOW_TO_EXPERIENCE",
    label: "怎么体验",
    authorityPolicy: "REFERENCE_ONLY",
    expansionTypes: ["EXPERIENCE", "DEMO"],
    maxItems: 2
  },
  {
    key: "HOW_TO_LEARN",
    label: "怎么学",
    authorityPolicy: "REFERENCE_ONLY",
    expansionTypes: ["TUTORIAL"],
    maxItems: 2
  },
  {
    key: "HOW_TO_USE",
    label: "怎么用",
    authorityPolicy: "REFERENCE_ONLY",
    expansionTypes: ["USE_CASE"],
    maxItems: 2
  },
  {
    key: "WORK_IMPACT",
    label: "对什么工作有帮助",
    authorityPolicy: "REFERENCE_ONLY",
    expansionTypes: ["WORK_IMPACT"],
    maxItems: 2
  },
  {
    key: "WHY_SHARE",
    label: "为什么值得分享",
    authorityPolicy: "REFERENCE_ONLY",
    expansionTypes: ["SHAREABLE"],
    maxItems: 2
  }
];

function normalizedText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function nullableText(value: unknown, max: number) {
  const text = normalizedText(value, max);
  return text || null;
}

function requiredText(value: unknown, code: string, max: number) {
  const text = normalizedText(value, max);
  if (!text) throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:" + code);
  return text;
}

function isoDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function factPriority(role: string | null | undefined) {
  const value = (role ?? "").toUpperCase();
  if (value === "PRIMARY") return 0;
  if (value === "SUPPORTING") return 1;
  return 2;
}

function factItem(input: EventExpansionOutputFactInput): EventExpansionDailyOutputEvidence {
  return {
    rawItemId: requiredText(input.rawItemId, "FACT_RAW_ITEM_ID", 160),
    sourceId: requiredText(input.sourceId, "FACT_SOURCE_ID", 160),
    sourceName: nullableText(input.sourceName, 240),
    title: requiredText(input.title, "FACT_TITLE", 1000),
    excerpt: nullableText(input.excerpt, 5000),
    originalUrl: nullableText(input.originalUrl, 3000),
    publishedAt: isoDate(input.publishedAt),
    expansionType: null,
    mediaType: null,
    language: null,
    rankScore: null,
    authority: "FACT"
  };
}

function referenceItem(
  input: EventExpansionOutputReferenceInput
): EventExpansionDailyOutputEvidence {
  return {
    rawItemId: requiredText(input.rawItemId, "REFERENCE_RAW_ITEM_ID", 160),
    sourceId: requiredText(input.sourceId, "REFERENCE_SOURCE_ID", 160),
    sourceName: nullableText(input.sourceName, 240),
    title: requiredText(input.title, "REFERENCE_TITLE", 1000),
    excerpt: nullableText(input.excerpt, 5000),
    originalUrl: nullableText(input.originalUrl, 3000),
    publishedAt: isoDate(input.publishedAt),
    expansionType: input.expansionType,
    mediaType: requiredText(input.mediaType, "REFERENCE_MEDIA_TYPE", 80),
    language: requiredText(input.language, "REFERENCE_LANGUAGE", 40),
    rankScore: Number.isFinite(input.rankScore) ? Math.round(input.rankScore) : 0,
    authority: "REFERENCE_ONLY"
  };
}

export function buildEventExpansionDailyOutput(
  input: EventExpansionDailyOutputInput
): EventExpansionDailyOutput {
  const eventId = requiredText(input.eventId, "EVENT_ID", 160);
  const eventTitle = requiredText(input.eventTitle, "EVENT_TITLE", 1200);
  const eventSummary = nullableText(input.eventSummary, 6000);

  const usedRawItemIds = new Set<string>();
  const sortedFacts = [...input.factEvidence].sort((a, b) => {
    const roleDiff = factPriority(a.role) - factPriority(b.role);
    if (roleDiff !== 0) return roleDiff;
    return (isoDate(b.publishedAt) ?? "").localeCompare(isoDate(a.publishedAt) ?? "");
  });
  const factItems: EventExpansionDailyOutputEvidence[] = [];
  for (const item of sortedFacts) {
    if (usedRawItemIds.has(item.rawItemId)) continue;
    factItems.push(factItem(item));
    usedRawItemIds.add(item.rawItemId);
    if (factItems.length >= 3) break;
  }

  const expansionSorted = [...input.expansionEvidence].sort((a, b) =>
    Number(b.language === "ZH") - Number(a.language === "ZH") ||
    b.rankScore - a.rankScore ||
    (isoDate(b.publishedAt) ?? "").localeCompare(isoDate(a.publishedAt) ?? "")
  );

  const sectionItems = new Map<AiDailyExpansionOutputSectionKey, EventExpansionDailyOutputEvidence[]>();
  for (const definition of SECTION_DEFINITIONS) sectionItems.set(definition.key, []);
  sectionItems.set("WHAT_HAPPENED", factItems);

  let unmappedExpansionEvidenceCount = 0;
  for (const inputItem of expansionSorted) {
    if (usedRawItemIds.has(inputItem.rawItemId)) {
      unmappedExpansionEvidenceCount += 1;
      continue;
    }
    const definition = SECTION_DEFINITIONS.find((item) =>
      item.expansionTypes.includes(inputItem.expansionType)
    );
    if (!definition || definition.key === "WHAT_HAPPENED") {
      unmappedExpansionEvidenceCount += 1;
      continue;
    }
    const items = sectionItems.get(definition.key)!;
    if (items.length >= definition.maxItems) {
      unmappedExpansionEvidenceCount += 1;
      continue;
    }
    items.push(referenceItem(inputItem));
    usedRawItemIds.add(inputItem.rawItemId);
  }

  const sections = SECTION_DEFINITIONS.map((definition) => {
    const items = sectionItems.get(definition.key) ?? [];
    return {
      key: definition.key,
      label: definition.label,
      authorityPolicy: definition.authorityPolicy,
      status: items.length ? "SUPPORTED" as const : "EMPTY" as const,
      items
    };
  });

  const missingSectionKeys = sections
    .filter((section) => section.status === "EMPTY")
    .map((section) => section.key);
  const warnings: string[] = [];
  if (factItems.length === 0) warnings.push("NO_FACT_EVIDENCE");
  if (input.expansionEvidence.length === 0) warnings.push("NO_EXPANSION_EVIDENCE");
  if (unmappedExpansionEvidenceCount > 0) {
    warnings.push("UNMAPPED_EXPANSION_EVIDENCE:" + unmappedExpansionEvidenceCount);
  }

  return validateEventExpansionDailyOutput({
    schemaVersion: AI_DAILY_EXPANSION_OUTPUT_SCHEMA_VERSION,
    eventId,
    eventTitle,
    eventSummary,
    sections,
    missingSectionKeys,
    unmappedExpansionEvidenceCount,
    warnings
  }, {
    allowedFactRawItemIds: input.factEvidence.map((item) => item.rawItemId),
    allowedExpansionRawItemIds: input.expansionEvidence.map((item) => item.rawItemId)
  });
}

function validateOutputItem(
  value: unknown,
  definition: (typeof SECTION_DEFINITIONS)[number],
  seen: Set<string>,
  allowedFactRawItemIds: Set<string> | null,
  allowedExpansionRawItemIds: Set<string> | null
): EventExpansionDailyOutputEvidence {
  if (!isRecord(value)) throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:ITEM");
  const rawItemId = requiredText(value.rawItemId, "ITEM_RAW_ID", 160);
  if (seen.has(rawItemId)) throw new Error("EVENT_EXPANSION_OUTPUT_DUPLICATE_RAW_ITEM");
  seen.add(rawItemId);

  const authority = value.authority;
  if (definition.authorityPolicy === "FACT_ONLY") {
    if (authority !== "FACT") throw new Error("EVENT_EXPANSION_OUTPUT_FACT_AUTHORITY_REQUIRED");
    if (value.expansionType !== null) throw new Error("EVENT_EXPANSION_OUTPUT_FACT_EXPANSION_TYPE_FORBIDDEN");
    if (allowedFactRawItemIds && !allowedFactRawItemIds.has(rawItemId)) {
      throw new Error("EVENT_EXPANSION_OUTPUT_UNKNOWN_FACT_EVIDENCE");
    }
  } else {
    if (authority !== "REFERENCE_ONLY") throw new Error("EVENT_EXPANSION_OUTPUT_REFERENCE_ONLY_REQUIRED");
    const expansionType = value.expansionType as EventExpansionType;
    if (!definition.expansionTypes.includes(expansionType)) {
      throw new Error("EVENT_EXPANSION_OUTPUT_SECTION_TYPE_MISMATCH:" + definition.key);
    }
    if (allowedExpansionRawItemIds && !allowedExpansionRawItemIds.has(rawItemId)) {
      throw new Error("EVENT_EXPANSION_OUTPUT_UNKNOWN_REFERENCE_EVIDENCE");
    }
  }

  const originalUrl = nullableText(value.originalUrl, 3000);
  if (originalUrl && !/^https?:\/\//i.test(originalUrl)) {
    throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:ITEM_URL");
  }

  const rankScore = value.rankScore === null
    ? null
    : typeof value.rankScore === "number" && Number.isFinite(value.rankScore)
      ? Math.round(value.rankScore)
      : (() => { throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:RANK_SCORE"); })();
  if (rankScore !== null && (rankScore < 0 || rankScore > 100)) {
    throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:RANK_SCORE");
  }
  if (
    definition.authorityPolicy !== "FACT_ONLY" &&
    !EVENT_EXPANSION_TYPES.includes(value.expansionType as EventExpansionType)
  ) {
    throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:EXPANSION_TYPE");
  }

  return {
    rawItemId,
    sourceId: requiredText(value.sourceId, "ITEM_SOURCE_ID", 160),
    sourceName: nullableText(value.sourceName, 240),
    title: requiredText(value.title, "ITEM_TITLE", 1000),
    excerpt: nullableText(value.excerpt, 5000),
    originalUrl,
    publishedAt: typeof value.publishedAt === "string" ? isoDate(value.publishedAt) : null,
    expansionType: definition.authorityPolicy === "FACT_ONLY"
      ? null
      : value.expansionType as EventExpansionType,
    mediaType: definition.authorityPolicy === "FACT_ONLY"
      ? null
      : requiredText(value.mediaType, "ITEM_MEDIA_TYPE", 80),
    language: definition.authorityPolicy === "FACT_ONLY"
      ? null
      : requiredText(value.language, "ITEM_LANGUAGE", 40),
    rankScore: definition.authorityPolicy === "FACT_ONLY" ? null : rankScore,
    authority: authority as OutputAuthority
  };
}

export function validateEventExpansionDailyOutput(
  value: unknown,
  options: {
    allowedFactRawItemIds?: Iterable<string>;
    allowedExpansionRawItemIds?: Iterable<string>;
  } = {}
): EventExpansionDailyOutput {
  if (!isRecord(value)) throw new Error("EVENT_EXPANSION_OUTPUT_INVALID");
  if (value.schemaVersion !== AI_DAILY_EXPANSION_OUTPUT_SCHEMA_VERSION) {
    throw new Error("EVENT_EXPANSION_OUTPUT_SCHEMA_VERSION_MISMATCH");
  }
  if (!Array.isArray(value.sections) || value.sections.length !== SECTION_DEFINITIONS.length) {
    throw new Error("EVENT_EXPANSION_OUTPUT_SECTION_COUNT");
  }

  const allowedFactRawItemIds = options.allowedFactRawItemIds
    ? new Set(options.allowedFactRawItemIds)
    : null;
  const allowedExpansionRawItemIds = options.allowedExpansionRawItemIds
    ? new Set(options.allowedExpansionRawItemIds)
    : null;
  const seen = new Set<string>();

  const sections = value.sections.map((sectionValue, index) => {
    if (!isRecord(sectionValue)) throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:SECTION");
    const definition = SECTION_DEFINITIONS[index]!;
    if (sectionValue.key !== definition.key) {
      throw new Error("EVENT_EXPANSION_OUTPUT_SECTION_ORDER");
    }
    if (sectionValue.label !== definition.label) {
      throw new Error("EVENT_EXPANSION_OUTPUT_SECTION_LABEL");
    }
    if (sectionValue.authorityPolicy !== definition.authorityPolicy) {
      throw new Error("EVENT_EXPANSION_OUTPUT_SECTION_AUTHORITY_POLICY");
    }
    if (!Array.isArray(sectionValue.items) || sectionValue.items.length > definition.maxItems) {
      throw new Error("EVENT_EXPANSION_OUTPUT_SECTION_ITEM_LIMIT:" + definition.key);
    }
    const items = sectionValue.items.map((item) =>
      validateOutputItem(
        item,
        definition,
        seen,
        allowedFactRawItemIds,
        allowedExpansionRawItemIds
      )
    );
    const expectedStatus: SectionStatus = items.length ? "SUPPORTED" : "EMPTY";
    if (sectionValue.status !== expectedStatus) {
      throw new Error("EVENT_EXPANSION_OUTPUT_SECTION_STATUS:" + definition.key);
    }
    return {
      key: definition.key,
      label: definition.label,
      authorityPolicy: definition.authorityPolicy,
      status: expectedStatus,
      items
    };
  });

  const expectedMissing = sections
    .filter((section) => section.status === "EMPTY")
    .map((section) => section.key);
  if (
    !Array.isArray(value.missingSectionKeys) ||
    value.missingSectionKeys.some((item) => typeof item !== "string") ||
    value.missingSectionKeys.join("|") !== expectedMissing.join("|")
  ) {
    throw new Error("EVENT_EXPANSION_OUTPUT_MISSING_SECTION_MISMATCH");
  }

  const unmappedExpansionEvidenceCount = value.unmappedExpansionEvidenceCount;
  if (
    typeof unmappedExpansionEvidenceCount !== "number" ||
    !Number.isInteger(unmappedExpansionEvidenceCount) ||
    unmappedExpansionEvidenceCount < 0
  ) {
    throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:UNMAPPED_COUNT");
  }

  const warnings = Array.isArray(value.warnings)
    ? [...new Set(value.warnings.map((item) => requiredText(item, "WARNING", 300)))]
    : (() => { throw new Error("EVENT_EXPANSION_OUTPUT_INVALID:WARNINGS"); })();

  return {
    schemaVersion: AI_DAILY_EXPANSION_OUTPUT_SCHEMA_VERSION,
    eventId: requiredText(value.eventId, "EVENT_ID", 160),
    eventTitle: requiredText(value.eventTitle, "EVENT_TITLE", 1200),
    eventSummary: nullableText(value.eventSummary, 6000),
    sections,
    missingSectionKeys: expectedMissing,
    unmappedExpansionEvidenceCount,
    warnings
  };
}

export async function getEventExpansionDailyOutput(eventId: string) {
  const resolvedEventId = requiredText(eventId, "EVENT_ID", 160);
  const db = getDatabase();
  const [event] = await db
    .select()
    .from(contentEvents)
    .where(eq(contentEvents.id, resolvedEventId))
    .limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const factRows = await db
    .select({
      rawItemId: contentRawItems.id,
      sourceId: contentRawItems.sourceId,
      sourceName: contentSources.name,
      title: contentRawItems.title,
      excerpt: contentRawItems.excerpt,
      originalUrl: contentRawItems.originalUrl,
      publishedAt: contentRawItems.publishedAt,
      role: contentEventRawItems.role
    })
    .from(contentEventRawItems)
    .innerJoin(contentRawItems, eq(contentRawItems.id, contentEventRawItems.rawItemId))
    .innerJoin(contentSources, eq(contentSources.id, contentRawItems.sourceId))
    .where(eq(contentEventRawItems.eventId, resolvedEventId))
    .orderBy(desc(contentRawItems.publishedAt));

  const expansionRows = await db
    .select({
      rawItemId: contentRawItems.id,
      sourceId: contentRawItems.sourceId,
      sourceName: contentSources.name,
      title: contentRawItems.title,
      excerpt: contentRawItems.excerpt,
      originalUrl: contentRawItems.originalUrl,
      publishedAt: contentRawItems.publishedAt,
      expansionType: contentEventExpansionEvidence.expansionType,
      mediaType: contentEventExpansionEvidence.mediaType,
      language: contentEventExpansionEvidence.language,
      rankScore: contentEventExpansionEvidence.rankScore
    })
    .from(contentEventExpansionEvidence)
    .innerJoin(contentRawItems, eq(contentRawItems.id, contentEventExpansionEvidence.rawItemId))
    .innerJoin(contentSources, eq(contentSources.id, contentRawItems.sourceId))
    .where(eq(contentEventExpansionEvidence.eventId, resolvedEventId))
    .orderBy(desc(contentEventExpansionEvidence.rankScore));

  return buildEventExpansionDailyOutput({
    eventId: event.id,
    eventTitle: event.title,
    eventSummary: event.summary,
    factEvidence: factRows,
    expansionEvidence: expansionRows.map((row) => ({
      ...row,
      expansionType: row.expansionType as EventExpansionType
    }))
  });
}
