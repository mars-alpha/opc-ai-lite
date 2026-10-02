export const FEEDBACK_CYCLE_REOPEN_THRESHOLD = 3;
export const BEHAVIOR_CYCLE_REOPEN_THRESHOLD = 10;

export type LearningIssueCycleState =
  | "OPEN"
  | "WATCHING"
  | "DISMISSED"
  | "REVIEWED";

export type LearningIssueCycle = {
  cycleNumber: number;
  state: LearningIssueCycleState;
  openedAt: string | null;
  baselineAt: string | null;
  closedAt: string | null;
  reopenThreshold: number;
  baselineSampleSize: number;
  previousCycleSampleSize: number;
};

export function asEvidenceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function issueCycleFromEvidence(
  evidence: unknown,
  fallback: Partial<LearningIssueCycle> = {}
): LearningIssueCycle {
  const record = asEvidenceRecord(evidence);
  const raw = asEvidenceRecord(record.issueCycle);
  return {
    cycleNumber:
      typeof raw.cycleNumber === "number" && raw.cycleNumber >= 1
        ? raw.cycleNumber
        : fallback.cycleNumber ?? 1,
    state:
      raw.state === "WATCHING" ||
      raw.state === "DISMISSED" ||
      raw.state === "REVIEWED"
        ? raw.state
        : fallback.state ?? "OPEN",
    openedAt:
      typeof raw.openedAt === "string" ? raw.openedAt : fallback.openedAt ?? null,
    baselineAt:
      typeof raw.baselineAt === "string" ? raw.baselineAt : fallback.baselineAt ?? null,
    closedAt:
      typeof raw.closedAt === "string" ? raw.closedAt : fallback.closedAt ?? null,
    reopenThreshold:
      typeof raw.reopenThreshold === "number" && raw.reopenThreshold > 0
        ? raw.reopenThreshold
        : fallback.reopenThreshold ?? FEEDBACK_CYCLE_REOPEN_THRESHOLD,
    baselineSampleSize:
      typeof raw.baselineSampleSize === "number" && raw.baselineSampleSize >= 0
        ? raw.baselineSampleSize
        : fallback.baselineSampleSize ?? 0,
    previousCycleSampleSize:
      typeof raw.previousCycleSampleSize === "number" && raw.previousCycleSampleSize >= 0
        ? raw.previousCycleSampleSize
        : fallback.previousCycleSampleSize ?? 0
  };
}

export function cycleReopenThreshold(issueKey: string) {
  return issueKey.startsWith("behavior:")
    ? BEHAVIOR_CYCLE_REOPEN_THRESHOLD
    : FEEDBACK_CYCLE_REOPEN_THRESHOLD;
}

export function closeIssueCycleEvidence(input: {
  evidence: unknown;
  issueKey: string;
  state: Exclude<LearningIssueCycleState, "OPEN">;
  sampleSize: number;
  at: Date;
}) {
  const evidence = asEvidenceRecord(input.evidence);
  const previous = issueCycleFromEvidence(evidence, {
    reopenThreshold: cycleReopenThreshold(input.issueKey)
  });
  const at = input.at.toISOString();
  return {
    ...evidence,
    issueCycle: {
      ...previous,
      state: input.state,
      baselineAt: at,
      closedAt: at,
      reopenThreshold: cycleReopenThreshold(input.issueKey),
      baselineSampleSize: input.sampleSize,
      previousCycleSampleSize: input.sampleSize
    } satisfies LearningIssueCycle
  };
}

export function feedbackCycleState(input: {
  evidence: unknown;
  status: string | null;
  issueKey: string;
  rows: Array<{ userId: string; createdAt: Date }>;
  now: Date;
}) {
  const evidence = asEvidenceRecord(input.evidence);
  const firstObservedAt =
    [...input.rows]
      .map((row) => row.createdAt)
      .sort((left, right) => left.getTime() - right.getTime())[0]
      ?.toISOString() ?? input.now.toISOString();
  const previous = issueCycleFromEvidence(evidence, {
    reopenThreshold: FEEDBACK_CYCLE_REOPEN_THRESHOLD,
    openedAt: firstObservedAt
  });
  const baselineAt = previous.baselineAt ? new Date(previous.baselineAt) : null;
  const cycleRows = baselineAt
    ? input.rows.filter((row) => row.createdAt.getTime() > baselineAt.getTime())
    : input.rows;
  const lifetimeDistinctUserCount = new Set(input.rows.map((row) => row.userId)).size;
  const cycleDistinctUserCount = new Set(cycleRows.map((row) => row.userId)).size;
  const closed = ["DISMISSED", "WATCHING", "REVIEWED"].includes(input.status ?? "");
  const reopen = closed && cycleDistinctUserCount >= FEEDBACK_CYCLE_REOPEN_THRESHOLD;
  const status = reopen
    ? "OPEN"
    : closed
      ? input.status!
      : input.status && input.status !== "ANALYZED"
        ? input.status
        : "OPEN";
  const openedAt = reopen
    ? cycleRows
        .map((row) => row.createdAt)
        .sort((left, right) => left.getTime() - right.getTime())[0]
        ?.toISOString() ?? input.now.toISOString()
    : previous.openedAt;

  return {
    status,
    distinctUserCount: baselineAt ? cycleDistinctUserCount : lifetimeDistinctUserCount,
    evidence: {
      ...evidence,
      lifetimeDistinctUserCount,
      cycleDistinctUserCount: baselineAt ? cycleDistinctUserCount : lifetimeDistinctUserCount,
      issueCycle: {
        ...previous,
        cycleNumber: reopen ? previous.cycleNumber + 1 : previous.cycleNumber,
        state: reopen ? "OPEN" : previous.state,
        openedAt,
        closedAt: reopen ? null : previous.closedAt,
        reopenThreshold: FEEDBACK_CYCLE_REOPEN_THRESHOLD
      } satisfies LearningIssueCycle
    }
  };
}

export function behaviorCycleState(input: {
  evidence: unknown;
  status: string | null;
  issueKey: string;
  sampleSize: number;
  signalEvidence: Record<string, unknown>;
  now: Date;
}) {
  const evidence = asEvidenceRecord(input.evidence);
  const previous = issueCycleFromEvidence(evidence, {
    reopenThreshold: BEHAVIOR_CYCLE_REOPEN_THRESHOLD
  });
  const closed = ["DISMISSED", "WATCHING", "REVIEWED"].includes(input.status ?? "");
  const newSampleSize = Math.max(0, input.sampleSize - previous.baselineSampleSize);
  const reopen = closed && newSampleSize >= BEHAVIOR_CYCLE_REOPEN_THRESHOLD;
  const status = reopen
    ? "OPEN"
    : closed
      ? input.status!
      : input.status && input.status !== "ANALYZED"
        ? input.status
        : "OPEN";

  return {
    status,
    distinctUserCount:
      previous.baselineAt || closed || reopen ? newSampleSize : input.sampleSize,
    evidence: {
      ...evidence,
      ...input.signalEvidence,
      lifetimeSampleSize: input.sampleSize,
      cycleSampleSize:
        previous.baselineAt || closed || reopen ? newSampleSize : input.sampleSize,
      issueCycle: {
        ...previous,
        cycleNumber: reopen ? previous.cycleNumber + 1 : previous.cycleNumber,
        state: reopen ? "OPEN" : previous.state,
        openedAt: reopen ? input.now.toISOString() : previous.openedAt,
        closedAt: reopen ? null : previous.closedAt,
        reopenThreshold: BEHAVIOR_CYCLE_REOPEN_THRESHOLD
      } satisfies LearningIssueCycle
    }
  };
}

export function currentIssueCycleOpenedAt(
  evidence: unknown,
  fallback: Date
) {
  const cycle = issueCycleFromEvidence(evidence);
  const parsed = cycle.openedAt ? new Date(cycle.openedAt) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : fallback;
}
