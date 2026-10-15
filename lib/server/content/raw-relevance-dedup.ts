import "server-only";

import { createHash } from "node:crypto";

export const RAW_RELEVANCE_DEDUP_VERSION = "raw-relevance-dedup-v1";
export const RAW_TITLE_DEDUP_WINDOW_HOURS = 24 * 14;

export function normalizeRawTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function rawNormalizedTitleHash(value: string) {
  const normalized = normalizeRawTitle(value);
  if (normalized.length < 12) return null;
  return createHash("sha256").update(normalized).digest("hex");
}

const EVENT_ACTIONS: Array<[string, RegExp]> = [
  ["RELEASE", /\b(release|released|releases|launch|launched|launches|introduce|introduced|unveil|unveiled)\b|发布|推出|上线/iu],
  ["UPDATE", /\b(update|updated|updates|upgrade|upgraded)\b|更新|升级/iu],
  ["OPEN_SOURCE", /\bopen[ -]?source(?:d)?\b|开源/iu],
  ["INTEGRATE", /\b(integrate|integrated|integration|adopt|adopted|deploy|deployed)\b|接入|集成|采用|部署/iu]
];

export function extractEventAction(value: string) {
  return EVENT_ACTIONS.find(([, pattern]) => pattern.test(value))?.[0] ?? null;
}

export function extractVersionTokens(value: string) {
  const normalized = value.normalize("NFKC").toLocaleLowerCase();
  return [...new Set(
    normalized.match(/\b(?:v?\d+(?:\.\d+){1,3}|gpt-?\d+(?:\.\d+)?|claude-?\d+(?:\.\d+)?|gemini-?\d+(?:\.\d+)?)\b/gi) ?? []
  )].map((item) => {
    const lower = item.toLocaleLowerCase();
    const numeric = lower.match(/\d+(?:\.\d+)+/);
    return numeric?.[0] ?? lower.replace(/^v/, "");
  }).sort();
}

export function buildEntityActionVersionKey(input: {
  title: string;
  entities?: string[];
  eventType?: string | null;
}) {
  const entities = [...new Set((input.entities ?? []).map((item) => item.trim().toLocaleLowerCase()).filter(Boolean))].sort();
  const action = extractEventAction(input.title);
  const versions = extractVersionTokens(input.title);
  if (!entities.length || !action || !versions.length) return null;
  const payload = [
    entities.join("|"),
    action,
    versions.join("|"),
    (input.eventType ?? "").trim().toLocaleUpperCase()
  ].join("\n");
  return createHash("sha256").update(payload).digest("hex");
}
