import "server-only";

import { randomUUID } from "node:crypto";

type TimingFields = Record<string, number | string | boolean | null>;
type RuntimeTimingEntry = TimingFields & {
  trace_id: string;
  operation: string;
  total_ms: number;
  recorded_at: string;
};

const recentTimingsKey = "__opcRuntimeTimings";

function enabled() {
  return process.env.NODE_ENV !== "production" || process.env.OPC_RUNTIME_TIMING === "1";
}

function recentTimings() {
  const holder = globalThis as typeof globalThis & {
    [recentTimingsKey]?: RuntimeTimingEntry[];
  };
  holder[recentTimingsKey] ??= [];
  return holder[recentTimingsKey]!;
}

export function getRecentRuntimeTimings() {
  return [...recentTimings()];
}

export function clearRecentRuntimeTimings() {
  recentTimings().splice(0);
}

export function createRuntimeTiming(operation: string) {
  const traceId = randomUUID();
  const startedAt = performance.now();
  let markAt = startedAt;
  const fields: TimingFields = {};

  return {
    mark(name: string) {
      const now = performance.now();
      fields[name] = Math.round(now - markAt);
      markAt = now;
    },
    set(name: string, value: number | string | boolean | null) {
      fields[name] = value;
    },
    finish(extra: TimingFields = {}) {
      if (!enabled()) return;
      const entry: RuntimeTimingEntry = {
        trace_id: traceId,
        operation,
        ...fields,
        ...extra,
        total_ms: Math.round(performance.now() - startedAt),
        recorded_at: new Date().toISOString()
      };
      const buffer = recentTimings();
      buffer.push(entry);
      if (buffer.length > 100) buffer.splice(0, buffer.length - 100);
      console.info("[OPC PERF]", JSON.stringify(entry));
    }
  };
}
