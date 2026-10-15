import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentArtifacts,
  contentEventRawItems,
  contentEvents,
  contentItems,
  contentRawItems,
  contentSources
} from "../db/schema";
import {
  TOPIC_DIAGNOSIS_SCHEMA_VERSION,
  validateTopicDiagnosisPayload,
  type TopicDiagnosisPayload
} from "./artifact-contract";
import { getEventClusterResearchPack } from "./event-clustering";
import {
  runTopicDiagnosisSkill,
  topicDiagnosisModelConfigured,
  TOPIC_DIAGNOSIS_SKILL_VERSION
} from "./topic-diagnosis-skill";
import { recordContentAudit } from "./workbench";

function hashPayload(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function timeLevel(lastSeenAt: Date): TopicDiagnosisPayload["timeliness"] {
  const ageHours = Math.max(0, (Date.now() - lastSeenAt.getTime()) / 3_600_000);
  if (ageHours <= 24) return "HIGH";
  if (ageHours <= 72) return "MEDIUM";
  return "LOW";
}

function scoreLevel(score: number | null): TopicDiagnosisPayload["differentiation"] {
  if (score === null) return "MEDIUM";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

async function getEventSourceContext(eventId: string) {
  const db = getDatabase();
  const pack = await getEventClusterResearchPack(eventId);
  if (pack) {
    const sourceIds = [...new Set(pack.rawItems.map((item) => item.sourceId))];
    const sources = sourceIds.length
      ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds))
      : [];
    return { rawItems: pack.rawItems, sources, sourceIds };
  }

  const links = await db
    .select({ rawItemId: contentEventRawItems.rawItemId })
    .from(contentEventRawItems)
    .where(eq(contentEventRawItems.eventId, eventId));
  const rawIds = links.map((item) => item.rawItemId);
  const rawItems = rawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds))
    : [];
  const sourceIds = [...new Set(rawItems.map((item) => item.sourceId))];
  const sources = sourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds))
    : [];
  return { rawItems, sources, sourceIds };
}

export async function getCurrentTopicDiagnosis(eventId: string) {
  const [artifact] = await getDatabase()
    .select()
    .from(contentArtifacts)
    .where(
      and(
        eq(contentArtifacts.eventId, eventId),
        eq(contentArtifacts.artifactType, "TOPIC_DIAGNOSIS")
      )
    )
    .orderBy(desc(contentArtifacts.version))
    .limit(1);
  return artifact ?? null;
}

export async function assertTopicDiagnosisReady(eventId: string) {
  const artifact = await getCurrentTopicDiagnosis(eventId);
  if (!artifact) throw new Error("TOPIC_DIAGNOSIS_REQUIRED");
  return artifact;
}

export async function runTopicDiagnosis(user: AuthUser, eventId: string) {
  const db = getDatabase();
  const [event] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const context = await getEventSourceContext(eventId);

  const [existingContent] = await db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(and(eq(contentItems.sourceType, "DISCOVERY_EVENT"), eq(contentItems.sourceRef, eventId)))
    .limit(1);

  const sourceCount = context.sourceIds.length;
  const hasOfficialOrHighAuthority = context.sources.some(
    (source) => source.authorityScore >= 80 || /official|官方/i.test(source.name)
  );
  const evidenceReadiness: TopicDiagnosisPayload["evidenceReadiness"] =
    sourceCount >= 3 && hasOfficialOrHighAuthority
      ? "SUFFICIENT"
      : sourceCount >= 1
        ? "PARTIAL"
        : "INSUFFICIENT";
  const duplicationRisk: TopicDiagnosisPayload["duplicationRisk"] = existingContent ? "HIGH" : "LOW";
  const fallbackVerdict: TopicDiagnosisPayload["verdict"] =
    duplicationRisk === "HIGH"
      ? "REJECT_RECOMMENDED"
      : event.relevanceScore !== null && event.relevanceScore <= 35
        ? "REJECT_RECOMMENDED"
        : event.relevanceScore !== null && event.relevanceScore >= 70 && evidenceReadiness !== "INSUFFICIENT"
          ? "ADOPT_RECOMMENDED"
          : "WATCH_RECOMMENDED";

  const evidenceGaps: string[] = [];
  if (sourceCount === 0) evidenceGaps.push("当前事件还没有可追溯来源。");
  if (sourceCount === 1) evidenceGaps.push("只有单一来源，需要补充第二个独立来源。");
  if (!hasOfficialOrHighAuthority) evidenceGaps.push("尚未发现高权威或官方来源，关键事实需要继续核对。");
  if (!context.rawItems.some((item) => Boolean(item.originalUrl))) evidenceGaps.push("缺少可直接核对的原文链接。");
  const timeliness = timeLevel(event.lastSeenAt);
  const differentiation = scoreLevel(event.noveltyScore);
  const sourceById = new Map(context.sources.map((source) => [source.id, source]));

  let skillResult: Awaited<ReturnType<typeof runTopicDiagnosisSkill>> | null = null;
  if (topicDiagnosisModelConfigured()) {
    try {
      skillResult = await runTopicDiagnosisSkill({
        eventId,
        nowIso: new Date().toISOString(),
        event: {
          title: event.title,
          summary: event.summary,
          relevanceScore: event.relevanceScore,
          noveltyScore: event.noveltyScore,
          firstSeenAt: event.firstSeenAt.toISOString(),
          lastSeenAt: event.lastSeenAt.toISOString()
        },
        deterministic: {
          duplicationRisk,
          timeliness,
          evidenceReadiness,
          differentiation,
          sourceCount,
          hasOfficialOrHighAuthority
        },
        sources: context.rawItems.slice(0, 30).map((item) => {
          const source = sourceById.get(item.sourceId);
          return {
            sourceId: item.sourceId,
            sourceName: source?.name ?? null,
            authorityScore: source?.authorityScore ?? null,
            title: item.title,
            excerpt: item.excerpt,
            originalUrl: item.originalUrl,
            platform: item.platform,
            publishedAt: item.publishedAt?.toISOString() ?? null,
            collectedAt: item.collectedAt.toISOString()
          };
        })
      });
    } catch {
      skillResult = null;
    }
  }

  let verdict = skillResult?.output.verdict ?? fallbackVerdict;
  if (duplicationRisk === "HIGH") verdict = "REJECT_RECOMMENDED";
  if (evidenceReadiness === "INSUFFICIENT" && verdict === "ADOPT_RECOMMENDED") {
    verdict = "WATCH_RECOMMENDED";
  }

  const payload = validateTopicDiagnosisPayload(
    {
      verdict,
      whyItMatters:
        skillResult?.output.whyItMatters ??
        event.summary ??
        "这是当前已被采集系统识别的 AI 相关事件，需要结合来源覆盖与时效判断是否进入日报。",
      readerValue:
        skillResult?.output.readerValue ??
        "帮助读者快速确认这件事是否值得投入注意力，并明确它与实际 AI 使用、工作或学习的关系。",
      suggestedAngle:
        skillResult?.output.suggestedAngle ??
        event.summary ??
        "先说明发生了什么，再判断它对普通 AI 使用者与实际工作有什么影响。",
      duplicationRisk,
      timeliness,
      evidenceReadiness,
      differentiation,
      evidenceGaps: [...new Set([
        ...evidenceGaps,
        ...(skillResult?.output.evidenceGaps ?? [])
      ])].slice(0, 12),
      risks: skillResult?.output.risks ?? [],
      supportingSourceIds: context.sourceIds,
      reasoningSummary:
        skillResult?.output.reasoningSummary ??
        (
          "当前覆盖 " +
          sourceCount +
          " 个来源；时效为 " +
          timeliness +
          "；证据准备度为 " +
          evidenceReadiness +
          (existingContent ? "；该 Event 已存在 Content，需避免重复生产。" : "；尚未发现同 Event 的正式 Content。")
        )
    },
    { allowedSourceIds: context.sourceIds }
  );

  const [latest] = await db
    .select({ version: contentArtifacts.version })
    .from(contentArtifacts)
    .where(
      and(
        eq(contentArtifacts.eventId, eventId),
        eq(contentArtifacts.artifactType, "TOPIC_DIAGNOSIS")
      )
    )
    .orderBy(desc(contentArtifacts.version))
    .limit(1);
  const version = (latest?.version ?? 0) + 1;

  const [artifact] = await db
    .insert(contentArtifacts)
    .values({
      artifactType: "TOPIC_DIAGNOSIS",
      schemaVersion: TOPIC_DIAGNOSIS_SCHEMA_VERSION,
      eventId,
      contentId: existingContent?.id ?? null,
      version,
      parentArtifactIds: [],
      payload,
      contentHash: hashPayload(payload),
      generatedMode: skillResult ? "AI" : "CORE",
      adapterId: skillResult ? "opc-topic-diagnosis-adapter-v1" : "topic-diagnosis-core-v1",
      skillId: skillResult ? "topic-diagnosis" : null,
      skillVersion: skillResult ? TOPIC_DIAGNOSIS_SKILL_VERSION : null,
      modelProfileId: skillResult?.config.model ?? null,
      aiRunId: skillResult?.aiRunId ?? null
    })
    .returning();

  await recordContentAudit(user, {
    action: "TOPIC_DIAGNOSIS_CREATED",
    entityType: "DISCOVERY_EVENT",
    entityId: eventId,
    entityVersion: version,
    after: {
      artifactId: artifact.id,
      artifactType: artifact.artifactType,
      version: artifact.version,
      generatedMode: artifact.generatedMode
    }
  });

  return artifact;
}
