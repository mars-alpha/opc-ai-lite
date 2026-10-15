import "server-only";

import { canonicalizeOriginalUrl } from "./discovery";

export const SOURCE_TARGET_PLATFORMS = [
  "X", "FACEBOOK", "YOUTUBE", "WEIBO", "DOUYIN", "XIAOHONGSHU", "ZHIHU", "BILIBILI",
  "GITHUB", "REDDIT", "HACKER_NEWS", "ARXIV", "HUGGING_FACE", "WEB"
] as const;

export type SourceTargetPlatform = (typeof SOURCE_TARGET_PLATFORMS)[number];
export type SourceTargetObjectType = "ACCOUNT" | "PAGE" | "CHANNEL" | "CONTENT" | "SOURCE";

export function detectSourcePlatform(inputUrl: string): SourceTargetPlatform {
  const host = new URL(inputUrl).hostname.toLowerCase().replace(/^www\./, "");
  if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) return "X";
  if (host === "facebook.com" || host.endsWith(".facebook.com")) return "FACEBOOK";
  if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "YOUTUBE";
  if (host === "weibo.com" || host.endsWith(".weibo.com")) return "WEIBO";
  if (host === "douyin.com" || host.endsWith(".douyin.com")) return "DOUYIN";
  if (host === "xiaohongshu.com" || host.endsWith(".xiaohongshu.com")) return "XIAOHONGSHU";
  if (host === "zhihu.com" || host.endsWith(".zhihu.com")) return "ZHIHU";
  if (host === "bilibili.com" || host.endsWith(".bilibili.com")) return "BILIBILI";
  if (host === "github.com" || host.endsWith(".github.com")) return "GITHUB";
  if (host === "reddit.com" || host.endsWith(".reddit.com")) return "REDDIT";
  if (host === "news.ycombinator.com") return "HACKER_NEWS";
  if (host === "arxiv.org" || host.endsWith(".arxiv.org")) return "ARXIV";
  if (host === "huggingface.co" || host.endsWith(".huggingface.co")) return "HUGGING_FACE";
  return "WEB";
}

function targetObjectType(url: URL, platform: SourceTargetPlatform): SourceTargetObjectType {
  const parts = url.pathname.split("/").filter(Boolean);
  if (platform === "X") return parts.includes("status") ? "CONTENT" : "ACCOUNT";
  if (platform === "YOUTUBE") {
    if (url.hostname === "youtu.be" || parts[0] === "watch" || url.searchParams.has("v")) return "CONTENT";
    if (parts[0]?.startsWith("@") || ["channel", "c", "user"].includes(parts[0] ?? "")) return "CHANNEL";
    return "SOURCE";
  }
  if (platform === "FACEBOOK") return parts.some((part) => ["posts", "reel", "videos", "watch"].includes(part)) ? "CONTENT" : "PAGE";
  if (platform === "DOUYIN") return parts.includes("video") ? "CONTENT" : "ACCOUNT";
  if (platform === "WEIBO") return parts.includes("status") && parts.length > 1 ? "CONTENT" : "ACCOUNT";
  if (platform === "XIAOHONGSHU") return parts.includes("explore") || parts.includes("discovery") ? "CONTENT" : "ACCOUNT";
  if (platform === "ZHIHU") return parts.includes("question") || parts.includes("p") ? "CONTENT" : parts.includes("people") || parts.includes("org") ? "ACCOUNT" : "SOURCE";
  if (parts.length === 0) return "SOURCE";
  const last = (parts.at(-1) ?? "").toLowerCase();
  if (["news", "blog", "updates", "press", "releases", "articles", "posts", "insights", "feed", "rss"].includes(last)) return "SOURCE";
  return platform === "WEB" ? "SOURCE" : "CONTENT";
}

export function resolveSourceTarget(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 2000) {
    throw new Error("SOURCE_TARGET_REQUIRED");
  }
  const canonicalUrl = canonicalizeOriginalUrl(value.trim());
  if (!canonicalUrl) throw new Error("SOURCE_TARGET_INVALID");
  const url = new URL(canonicalUrl);
  const platform = detectSourcePlatform(canonicalUrl);
  const objectType = targetObjectType(url, platform);
  const parts = url.pathname.split("/").filter(Boolean);
  const displayName = decodeURIComponent(
    ["X", "YOUTUBE"].includes(platform) ? (parts[0] ?? url.hostname) : (parts.at(-1) ?? url.hostname)
  ).replace(/^@/, "").slice(0, 120);
  return {
    canonicalUrl,
    platform,
    objectType,
    displayName: displayName || url.hostname,
    longTermEligible: objectType !== "CONTENT"
  };
}
