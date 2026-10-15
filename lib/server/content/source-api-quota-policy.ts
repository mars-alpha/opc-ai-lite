export const SOURCE_API_QUOTA_POLICY_VERSION = "source-api-quota-policy-v1";

export type ApiQuotaCadenceInput = {
  limit: number;
  used: number;
  baseIntervalMinutes: number;
};

export type ApiQuotaCadenceDecision = {
  version: typeof SOURCE_API_QUOTA_POLICY_VERSION;
  remaining: number;
  remainingRatio: number;
  multiplier: 1 | 2 | 4 | null;
  action: "NORMAL" | "REDUCE" | "CONSERVE" | "PAUSE_EXPENSIVE_API";
  effectiveIntervalMinutes: number | null;
  preferFeedFallback: boolean;
};

export function resolveApiQuotaCadence(input: ApiQuotaCadenceInput): ApiQuotaCadenceDecision {
  const limit = Math.max(0, Math.floor(input.limit));
  const used = Math.max(0, Math.floor(input.used));
  const base = Math.max(1, Math.floor(input.baseIntervalMinutes));
  const remaining = Math.max(0, limit - used);
  const remainingRatio = limit > 0 ? remaining / limit : 0;

  if (limit <= 0 || remainingRatio <= 0.05) {
    return {
      version: SOURCE_API_QUOTA_POLICY_VERSION,
      remaining,
      remainingRatio,
      multiplier: null,
      action: "PAUSE_EXPENSIVE_API",
      effectiveIntervalMinutes: null,
      preferFeedFallback: true
    };
  }
  if (remainingRatio <= 0.2) {
    return {
      version: SOURCE_API_QUOTA_POLICY_VERSION,
      remaining,
      remainingRatio,
      multiplier: 4,
      action: "CONSERVE",
      effectiveIntervalMinutes: base * 4,
      preferFeedFallback: true
    };
  }
  if (remainingRatio <= 0.5) {
    return {
      version: SOURCE_API_QUOTA_POLICY_VERSION,
      remaining,
      remainingRatio,
      multiplier: 2,
      action: "REDUCE",
      effectiveIntervalMinutes: base * 2,
      preferFeedFallback: true
    };
  }
  return {
    version: SOURCE_API_QUOTA_POLICY_VERSION,
    remaining,
    remainingRatio,
    multiplier: 1,
    action: "NORMAL",
    effectiveIntervalMinutes: base,
    preferFeedFallback: false
  };
}
