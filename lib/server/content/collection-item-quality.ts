export const COLLECTION_ITEM_QUALITY_VERSION = "collection-item-quality-v1";
export function assessCollectionItemQuality(item: { title?: string | null; excerpt?: string | null; author?: string | null; originalUrl?: string | null; publishedAt?: string | Date | null }) {
  const bodyCharacters = (item.excerpt ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().length;
  let originalLinkPresent = false;
  try { originalLinkPresent = ["http:", "https:"].includes(new URL(item.originalUrl ?? "").protocol); } catch {}
  return { version: COLLECTION_ITEM_QUALITY_VERSION, titlePresent: Boolean(item.title?.trim()),
    authorPresent: Boolean(item.author?.trim()), originalLinkPresent,
    publishedAtPresent: Boolean(item.publishedAt && Number.isFinite(new Date(item.publishedAt).getTime())),
    bodyCharacters, bodyLevel: bodyCharacters === 0 ? "TITLE_ONLY" : bodyCharacters < 500 ? "SHORT_EXCERPT" : "UNVERIFIED_EXCERPT",
    fullTextVerified: false, fullTranslationEligible: false };
}
export function selectBackfillWindow<T extends { publishedAt?: string | null }>(items: T[], from: Date, to: Date) {
  const kept: T[] = []; let missingTime = 0; let outsideWindow = 0;
  for (const item of items) {
    const time = item.publishedAt ? Date.parse(item.publishedAt) : NaN;
    if (!Number.isFinite(time)) { missingTime++; continue; }
    if (time < from.getTime() || time > to.getTime()) { outsideWindow++; continue; }
    kept.push(item);
  }
  return { items: kept, received: items.length, missingTime, outsideWindow,
    from: from.toISOString(), to: to.toISOString(), historyCompleteness: "AVAILABLE_WINDOW_ONLY_NO_ARCHIVE_GUARANTEE" };
}
