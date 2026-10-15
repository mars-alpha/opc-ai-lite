import {
  AIHOT_HEAT_HALF_LIFE_HOURS,
  AIHOT_HEAT_WINDOW_HOURS,
  calculateAihotHeatShadow,
  type AihotHeatShadowRaw
} from "../lib/server/content/aihot-heat-shadow";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

const now = new Date("2026-10-15T12:00:00.000Z");
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000);

function raw(input: Partial<AihotHeatShadowRaw> & Pick<AihotHeatShadowRaw, "sourceId" | "sourceName">): AihotHeatShadowRaw {
  return {
    sourceId: input.sourceId,
    sourceType: input.sourceType ?? "MEDIA",
    sourceName: input.sourceName,
    platform: input.platform ?? "WEB",
    author: input.author ?? null,
    publishedAt: Object.prototype.hasOwnProperty.call(input, "publishedAt") ? input.publishedAt : now,
    metadata: input.metadata ?? {},
    sourceMetadata: input.sourceMetadata ?? { factualSource: true },
    referenceOnly: input.referenceOnly ?? false,
    signalOnly: input.signalOnly ?? false,
    resolvedOriginPublisher: input.resolvedOriginPublisher ?? false
  };
}

const halfLife = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", publishedAt: now }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(24) })
  ]
});
assert(AIHOT_HEAT_WINDOW_HOURS === 48, "HEAT_WINDOW_48H");
assert(AIHOT_HEAT_HALF_LIFE_HOURS === 24, "HEAT_HALF_LIFE_24H");
assert(halfLife.rawHeat === 1.5, "HEAT_DECAY_EXACT_24H");
assert(halfLife.score === 15, "HEAT_INDEX_SCALE_10");

const latestOnly = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", author: "same", publishedAt: hoursAgo(20) }),
    raw({ sourceId: "a", sourceName: "A", author: "same", publishedAt: hoursAgo(1) }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(2) })
  ]
});
assert(latestOnly.participantCount === 2, "PARTICIPANT_LATEST_ONLY_COUNT");
assert(latestOnly.participants.find((item) => item.sourceId === "a")?.activityAt === hoursAgo(1).toISOString(), "PARTICIPANT_LATEST_ONLY_TIME");

const noCollectionFallback = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", publishedAt: null }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(2) })
  ]
});
assert(noCollectionFallback.participantCount === 1, "NO_COLLECTION_TIME_FALLBACK");

const observedTime = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", publishedAt: null, metadata: { observedAt: hoursAgo(3).toISOString() } }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(2) })
  ]
});
assert(observedTime.participantCount === 2, "SOURCE_OBSERVATION_TIME_ALLOWED");

const oldExcluded = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", publishedAt: hoursAgo(49) }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(1) })
  ]
});
assert(oldExcluded.participantCount === 1, "OLDER_THAN_48H_EXCLUDED");

const signalGate = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "s1", sourceName: "Signal A", signalOnly: true, publishedAt: hoursAgo(1) }),
    raw({ sourceId: "s2", sourceName: "Signal B", signalOnly: true, publishedAt: hoursAgo(2) })
  ]
});
assert(signalGate.signalParticipantCount === 2, "SIGNAL_PARTICIPANTS_COUNTED");
assert(signalGate.editorialParticipantCount === 0, "SIGNAL_NOT_EDITORIAL");
assert(signalGate.eligible === false, "EDITORIAL_GATE_REQUIRED");

const originFromAggregator = calculateAihotHeatShadow({
  now,
  raws: [
    raw({
      sourceId: "agg",
      sourceName: "AI HOT",
      referenceOnly: true,
      signalOnly: true,
      resolvedOriginPublisher: true,
      metadata: { originPublisher: "The Decoder" },
      publishedAt: hoursAgo(1)
    }),
    raw({ sourceId: "official", sourceName: "OpenAI", publishedAt: hoursAgo(2) })
  ]
});
assert(originFromAggregator.editorialParticipantCount === 2, "RESOLVED_ORIGIN_IS_EDITORIAL");

const isolated = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", publishedAt: hoursAgo(1) }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(2), sourceMetadata: { intelligenceParticipation: "ISOLATED" } })
  ]
});
assert(isolated.participantCount === 1, "ISOLATED_EXCLUDED");

const surge = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", publishedAt: hoursAgo(1) }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(2) }),
    raw({ sourceId: "c", sourceName: "C", publishedAt: hoursAgo(3) }),
    raw({ sourceId: "d", sourceName: "D", publishedAt: hoursAgo(20) })
  ]
});
assert(surge.surge === true, "SURGE_RECENT_6H_THREE_AND_HALF");
assert(surge.recent6hParticipantCount === 3, "SURGE_RECENT_PARTICIPANTS");

const comparable = calculateAihotHeatShadow({
  now,
  raws: [
    raw({ sourceId: "a", sourceName: "A", publishedAt: hoursAgo(1) }),
    raw({ sourceId: "a", sourceName: "A", author: "A old", publishedAt: hoursAgo(8) }),
    raw({ sourceId: "b", sourceName: "B", publishedAt: hoursAgo(2) }),
    raw({ sourceId: "b", sourceName: "B", author: "B old", publishedAt: hoursAgo(9) }),
    raw({ sourceId: "new", sourceName: "New source", publishedAt: hoursAgo(1) })
  ]
});
assert(comparable.trend.comparable === true, "SAME_SOURCE_COHORT_COMPARABLE");
assert(comparable.trend.comparableSourceCount === 2, "NEW_SOURCE_EXCLUDED_FROM_COMPARABLE_COHORT");

console.log(JSON.stringify({
  task: "AIHOT-HOT-HEAT-SHADOW-002-A",
  version: halfLife.version,
  windowHours: halfLife.windowHours,
  halfLifeHours: halfLife.halfLifeHours,
  compareLagHours: halfLife.compareLagHours,
  latestParticipantOnly: true,
  publicationOrObservationTimeOnly: true,
  editorialSignalSplit: true,
  sameSourceCohortTrendOnly: true,
  status: "PASS"
}, null, 2));
