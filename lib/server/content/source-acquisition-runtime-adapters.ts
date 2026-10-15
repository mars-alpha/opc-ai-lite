import "server-only";

import type { NormalizedCollectedItem } from "./collection-runner";

type RuntimeAdapterDependencies = {
  fetchJson: (url: string) => Promise<unknown>;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function collectAiHot(
  fetchJson: RuntimeAdapterDependencies["fetchJson"]
): Promise<NormalizedCollectedItem[]> {
  const payload = record(await fetchJson("https://aihot.virxact.com/api/public/items"));
  const items = Array.isArray(payload.items) ? payload.items : [];
  return items.slice(0, 120).flatMap((raw) => {
    const item = record(raw);
    const score = Number(item.score ?? item.card_score ?? item.ai_score ?? 0);
    if (Number.isFinite(score) && score > 0 && score < 60) return [];
    const originalUrl = text(item.url) ?? text(item.link);
    const title = text(item.title) ?? text(item.name);
    if (!originalUrl || !title) return [];
    return [{
      externalId: text(item.id) ?? originalUrl,
      originalUrl,
      title,
      author: text(item.source) ?? text(item.author),
      excerpt: text(item.summary) ?? text(item.description),
      publishedAt: text(item.published_at) ?? text(item.publishedAt) ?? text(item.created_at),
      platformMetrics: { score },
      metadata: {
        collector: "ai-hot",
        contentType: "NEWS_ARTICLE",
        originPublisher: text(item.source) ?? "AI HOT",
        upstreamScore: score,
        referenceOnly: true
      }
    }];
  });
}

export const SOURCE_RUNTIME_ADAPTER_OWNERS = ["RADAR_AI_HOT"] as const;

export function hasSourceRuntimeAdapter(runtimeOwner: string | null | undefined) {
  return SOURCE_RUNTIME_ADAPTER_OWNERS.includes(
    String(runtimeOwner ?? "").trim().toUpperCase() as (typeof SOURCE_RUNTIME_ADAPTER_OWNERS)[number]
  );
}

export async function collectSourceRuntimeAdapter(input: {
  runtimeOwner: string;
  fetchJson: RuntimeAdapterDependencies["fetchJson"];
}) {
  const owner = input.runtimeOwner.trim().toUpperCase();
  if (owner === "RADAR_AI_HOT") {
    return collectAiHot(input.fetchJson);
  }
  throw new Error("COLLECTION_RUNTIME_ADAPTER_NOT_REGISTERED:" + owner);
}
