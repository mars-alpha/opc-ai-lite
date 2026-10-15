import "server-only";

export const POLLUTION_SYNDICATION_VERSION = "pollution-syndication-v1";

export type DeterministicGateInput = {
  title: string;
  excerpt?: string | null;
  originalUrl?: string | null;
  externalId?: string | null;
};

export type OriginCandidate = {
  sourceId: string;
  sourceName: string;
  canonicalUrl?: string | null;
  sourceMetadata?: unknown;
  author?: string | null;
  title: string;
  excerpt?: string | null;
  publishedAt?: Date | string | null;
};

export type EventEvidenceRelevanceInput = {
  eventTitle: string;
  eventKeywords?: unknown;
  eventEntities?: unknown;
  candidateTitle: string;
  candidateExcerpt?: string | null;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function host(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLocaleLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function tokenSet(value: string) {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 2));
}

function stringList(value: unknown, limit = 24) {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const cleaned = item.trim().replace(/\s+/g, " ");
    const key = normalize(cleaned);
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
    if (result.length >= limit) break;
  }
  return result;
}

function containsNormalized(text: string, term: string) {
  const haystack = normalize(text);
  const needle = normalize(term);
  if (!needle) return false;
  if (/^[a-z0-9][a-z0-9._\/-]*$/i.test(term)) {
    const escaped = needle
      .replace(/[-\/_]+/g, " ")
      .replace(/[.*+?^$(){}|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    return new RegExp("(^|[^a-z0-9])" + escaped + "([^a-z0-9]|$)", "i")
      .test(haystack.replace(/[-\/_]+/g, " "));
  }
  return haystack.includes(needle);
}

export function evaluateEventEvidenceRelevance(input: EventEvidenceRelevanceInput) {
  const title = input.candidateTitle;
  const fullText = [title, input.candidateExcerpt ?? ""].join(" ");
  const eventTitleTokens = normalize(input.eventTitle)
    .split(" ")
    .filter((token) => token.length >= 3)
    .filter((token) => !["the", "and", "with", "from", "into", "for", "system", "systems", "llm", "llms", "ai", "agent", "agents", "model", "models", "new", "using", "framework", "platform", "发布", "推出", "更新", "模型", "人工智能", "系统", "平台", "框架"].includes(token))
    .slice(0, 16);
  const entityTerms = stringList(input.eventEntities, 16);
  const keywordTerms = stringList(input.eventKeywords, 16)
    .filter((term) => normalize(term).length >= 3);
  const anchors = [...new Set([...entityTerms, ...keywordTerms])];
  const matchedTitleAnchors = anchors.filter((term) => containsNormalized(title, term));
  const matchedBodyAnchors = anchors.filter((term) => containsNormalized(fullText, term));
  const matchedTitleTokens = eventTitleTokens.filter((term) => containsNormalized(title, term));
  const strongAnchor = matchedTitleAnchors.some((term) => {
    const normalizedTerm = normalize(term);
    const compact = normalizedTerm.replace(/\s+/g, "");
    const wordCount = normalizedTerm.split(/\s+/).filter(Boolean).length;
    return /\d/.test(normalizedTerm) || compact.length >= 12 || (wordCount >= 2 && compact.length >= 10);
  });
  const pass =
    strongAnchor ||
    matchedTitleAnchors.length >= 2 ||
    (matchedTitleAnchors.length >= 1 && matchedTitleTokens.length >= 1) ||
    (anchors.length === 0 && matchedTitleTokens.length >= 2) ||
    (matchedBodyAnchors.length >= 2 && matchedTitleTokens.length >= 1);
  return {
    version: POLLUTION_SYNDICATION_VERSION,
    pass,
    reason: pass ? "EVENT_RELEVANCE_PASS" : "EVENT_RELEVANCE_INSUFFICIENT",
    matchedTitleAnchors,
    matchedBodyAnchors,
    matchedTitleTokens
  };
}

function jaccard(left: string, right: string) {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

export function evaluateDeterministicQualityGate(input: DeterministicGateInput) {
  const title = normalize(input.title);
  const excerpt = normalize(input.excerpt);
  const reasons: string[] = [];
  if (title.length < 4) reasons.push("TITLE_TOO_SHORT");
  if (/^(404|not found|page not found|error|登录|登陆|sign in|cookie|privacy policy)$/.test(title)) {
    reasons.push("PLACEHOLDER_OR_NAVIGATION");
  }
  if (!input.originalUrl && !input.externalId) reasons.push("IDENTITY_MISSING");
  if (excerpt && excerpt.length < 8 && title.length < 10) reasons.push("CONTENT_TOO_THIN");
  return {
    version: POLLUTION_SYNDICATION_VERSION,
    pass: reasons.length === 0,
    reasons
  };
}

export function evaluatePollutionGate(input: DeterministicGateInput) {
  const text = normalize([input.title, input.excerpt ?? ""].join(" "));
  const reasons: string[] = [];
  if (/cookie preferences|accept all cookies|privacy policy|terms of service/.test(text)) {
    reasons.push("BOILERPLATE_LEGAL_NAVIGATION");
  }
  if (/subscribe to continue|enable javascript|access denied|captcha/.test(text)) {
    reasons.push("ACCESS_WALL_OR_CHALLENGE");
  }
  if (/^home\s*(page)?$|^homepage$/.test(normalize(input.title))) {
    reasons.push("HOMEPAGE_PLACEHOLDER");
  }
  return {
    version: POLLUTION_SYNDICATION_VERSION,
    pass: reasons.length === 0,
    reasons
  };
}

function publisherIdentity(item: OriginCandidate) {
  const meta = record(item.sourceMetadata);
  const explicit = normalize(String(meta.canonicalPublisher ?? meta.publisherIdentity ?? ""));
  const parent = normalize(String(meta.parentOrganization ?? meta.parentPublisher ?? ""));
  const canonicalHost = host(item.canonicalUrl);
  const creatorHost = canonicalHost && [
    "youtube.com",
    "youtu.be",
    "bilibili.com",
    "github.com",
    "x.com",
    "reddit.com"
  ].some((value) => canonicalHost === value || canonicalHost.endsWith("." + value));
  const canonicalPublisher =
    explicit ||
    (creatorHost && normalize(item.author)
      ? canonicalHost + ":" + normalize(item.author)
      : canonicalHost) ||
    normalize(item.sourceName) ||
    item.sourceId;
  return {
    canonicalPublisher,
    parentOrganization: parent || null
  };
}

function timeValue(value: Date | string | null | undefined) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
  }
  return Number.MAX_SAFE_INTEGER;
}

export function resolveIndependentOrigins(items: OriginCandidate[]) {
  const ordered = [...items].sort((a, b) => timeValue(a.publishedAt) - timeValue(b.publishedAt));
  const roots: Array<{
    item: OriginCandidate;
    canonicalPublisher: string;
    parentOrganization: string | null;
    author: string;
    originKey: string;
  }> = [];

  return ordered.map((item) => {
    const identity = publisherIdentity(item);
    const sourceMetadata = record(item.sourceMetadata);
    const declaredSyndication = normalize(String(
      sourceMetadata.syndicatedFromSourceId ??
      sourceMetadata.syndicatedFromPublisher ??
      sourceMetadata.syndicatedFrom ??
      ""
    ));
    const author = normalize(item.author);
    const title = normalize(item.title);
    const excerpt = normalize(item.excerpt);
    let matched: typeof roots[number] | null = null;
    let reason: string | null = null;

    for (const root of roots) {
      const declaredRootMatch =
        Boolean(declaredSyndication) &&
        (
          declaredSyndication === normalize(root.item.sourceId) ||
          declaredSyndication === root.canonicalPublisher
        );
      const samePublisher = identity.canonicalPublisher === root.canonicalPublisher;
      const sameParent =
        Boolean(identity.parentOrganization) &&
        identity.parentOrganization === root.parentOrganization;
      const titleSimilarity = jaccard(title, root.item.title);
      const excerptSimilarity = excerpt && root.item.excerpt
        ? jaccard(excerpt, root.item.excerpt)
        : 0;
      const sameAuthor =
        Boolean(author) &&
        author === root.author &&
        titleSimilarity >= 0.65;
      const mirroredContent = titleSimilarity >= 0.9 && excerptSimilarity >= 0.72;

      if (declaredRootMatch) {
        matched = root;
        reason = "DECLARED_SYNDICATION";
      } else if (samePublisher) {
        matched = root;
        reason = "SAME_PUBLISHER";
      } else if (sameParent) {
        matched = root;
        reason = "SAME_PARENT_ORGANIZATION";
      } else if (sameAuthor) {
        matched = root;
        reason = "SHARED_AUTHOR_SAME_STORY";
      } else if (mirroredContent) {
        matched = root;
        reason = "CONTENT_SYNDICATION";
      }
      if (matched) break;
    }

    if (!matched) {
      const originKey = "origin:" + identity.canonicalPublisher;
      const root = {
        item,
        canonicalPublisher: identity.canonicalPublisher,
        parentOrganization: identity.parentOrganization,
        author,
        originKey
      };
      roots.push(root);
      return {
        sourceId: item.sourceId,
        canonicalPublisher: identity.canonicalPublisher,
        originalPublisher: identity.canonicalPublisher,
        syndicatedFrom: null,
        independentOriginKey: originKey,
        independenceReason: "INDEPENDENT_ORIGIN" as const,
        contributesEvidenceCount: true
      };
    }

    return {
      sourceId: item.sourceId,
      canonicalPublisher: identity.canonicalPublisher,
      originalPublisher: matched.canonicalPublisher,
      syndicatedFrom: matched.item.sourceId,
      independentOriginKey: matched.originKey,
      independenceReason: reason!,
      contributesEvidenceCount: false
    };
  });
}

