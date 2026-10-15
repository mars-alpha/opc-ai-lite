import "server-only";

export type DiscoveryKeywordPolicy = {
  mustIncludeAll?: string[];
  mustIncludeAny?: string[];
  excludeAny?: string[];
};

export type DiscoveryKeywordDecision = {
  passed: boolean;
  reason:
    | "NO_KEYWORD_POLICY"
    | "KEYWORD_POLICY_PASS"
    | "MISSING_REQUIRED_ALL"
    | "MISSING_REQUIRED_ANY"
    | "EXCLUDED_KEYWORD";
  matched: string[];
  missing: string[];
};

function normalize(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
}

function cleanTerms(value: unknown, limit = 40) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map(normalize)
      .filter(Boolean)
  )].slice(0, limit);
}

export function normalizeDiscoveryKeywordPolicy(value: unknown): DiscoveryKeywordPolicy | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const policy = {
    mustIncludeAll: cleanTerms(raw.mustIncludeAll),
    mustIncludeAny: cleanTerms(raw.mustIncludeAny),
    excludeAny: cleanTerms(raw.excludeAny)
  };
  if (!policy.mustIncludeAll.length && !policy.mustIncludeAny.length && !policy.excludeAny.length) return null;
  return policy;
}

export function evaluateDiscoveryKeywordPolicy(
  textParts: Array<string | null | undefined>,
  policy: DiscoveryKeywordPolicy | null | undefined
): DiscoveryKeywordDecision {
  if (!policy) return {
    passed: true,
    reason: "NO_KEYWORD_POLICY",
    matched: [],
    missing: []
  };

  const text = normalize(textParts.filter(Boolean).join("\n"));
  const mustAll = cleanTerms(policy.mustIncludeAll);
  const mustAny = cleanTerms(policy.mustIncludeAny);
  const excludes = cleanTerms(policy.excludeAny);

  const excluded = excludes.filter((term) => text.includes(term));
  if (excluded.length) return {
    passed: false,
    reason: "EXCLUDED_KEYWORD",
    matched: excluded,
    missing: []
  };

  const missingAll = mustAll.filter((term) => !text.includes(term));
  if (missingAll.length) return {
    passed: false,
    reason: "MISSING_REQUIRED_ALL",
    matched: mustAll.filter((term) => text.includes(term)),
    missing: missingAll
  };

  if (mustAny.length) {
    const matchedAny = mustAny.filter((term) => text.includes(term));
    if (!matchedAny.length) return {
      passed: false,
      reason: "MISSING_REQUIRED_ANY",
      matched: [],
      missing: mustAny
    };
  }

  return {
    passed: true,
    reason: "KEYWORD_POLICY_PASS",
    matched: [...mustAll, ...mustAny.filter((term) => text.includes(term))],
    missing: []
  };
}
