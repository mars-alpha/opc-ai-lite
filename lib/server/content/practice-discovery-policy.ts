import { aiHotspotPracticePublishers, shouldExpandHotDiscussion, type AiHotspotPracticeCandidate } from "./ai-hotspot-practice";

export const PRACTICE_DISCOVERY_PURPOSE = "PRACTICAL_MATERIAL_DISCOVERY";
export const PRACTICE_DISCOVERY_VERSION = "practice-discovery-v1";
export type PracticeDiscoveryCheckpoint = {
  status: "RUNNING" | "SUCCEEDED" | "FAILED";
  lastAttemptAt: string;
};
export type PracticeDiscoveryCandidate = AiHotspotPracticeCandidate & {
  verificationStatus?: string;
  changeMagnitude?: unknown;
  collectedAt?: Date | string;
  coverage?: { actionablePracticalEvidenceCount?: number };
};

/** This key belongs only to actual material searches, never ordinary evidence refresh. */
export function readPracticeDiscoveryCheckpoint(metadata: unknown): PracticeDiscoveryCheckpoint | null {
  const value = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>).practiceDiscovery : null;
  if (!value || typeof value !== "object") return null;
  const state = value as Record<string, unknown>;
  if (!["RUNNING", "SUCCEEDED", "FAILED"].includes(String(state.status))) return null;
  return { status: state.status as PracticeDiscoveryCheckpoint["status"], lastAttemptAt: typeof state.lastAttemptAt === "string" ? state.lastAttemptAt : "" };
}

export function practiceDiscoveryDecision(input: PracticeDiscoveryCandidate, checkpoint: PracticeDiscoveryCheckpoint | null, now = Date.now()) {
  if ((input.coverage?.actionablePracticalEvidenceCount ?? 0) > 0) return { eligible: false, reason: "MATERIALS_ALREADY_AVAILABLE" };
  const seed = shouldExpandHotDiscussion({
    title: input.title, excerpt: input.excerpt, category: input.category,
    independentParticipants: aiHotspotPracticePublishers(input).length,
    importantOfficialSeed: input.verificationStatus === "CONFIRMED_OFFICIAL" && typeof input.changeMagnitude === "string" && ["MAJOR", "NORMAL"].includes(input.changeMagnitude),
    lastAttemptAt: null
  }, now);
  if (!seed.eligible) return seed;
  if (checkpoint) {
    const at = Date.parse(checkpoint.lastAttemptAt);
    if (!Number.isFinite(at) || at > now) return { eligible: false, reason: "INVALID_SEARCH_CHECKPOINT" };
    const hours = checkpoint.status === "FAILED" ? 1 : checkpoint.status === "RUNNING" ? 0.25 : 6;
    if (now - at < hours * 3_600_000) return { eligible: false, reason: "SEARCH_COOLDOWN" };
  }
  return seed;
}

export function isSourceManagedRefreshDue(state: { status: string; lastAttemptAt: string | null }, now = Date.now()) {
  if (!state.lastAttemptAt) return true;
  const at = Date.parse(state.lastAttemptAt);
  return Number.isFinite(at) && at <= now && now - at >= (state.status === "FAILED" ? 1 : 6) * 3_600_000;
}

/** Stable ordering with bounded aging; last serviced time is persisted on Event. */
export function rankPracticeDiscoveryCandidates<T extends PracticeDiscoveryCandidate & {
  discoveryExpansion: { priority: number };
  sourceManagedExpansionRuntime?: { lastAttemptAt: string | null };
  practiceDiscovery?: PracticeDiscoveryCheckpoint | null;
}>(candidates: T[], now = Date.now()): T[] {
  const score = (item: T) => {
    const timestamp = item.practiceDiscovery?.lastAttemptAt ?? item.sourceManagedExpansionRuntime?.lastAttemptAt ?? item.collectedAt;
    const at = timestamp ? new Date(timestamp).getTime() : now;
    const waitingHours = Number.isFinite(at) ? Math.max(0, Math.min(168, (now - at) / 3_600_000)) : 0;
    return item.discoveryExpansion.priority + waitingHours * 2;
  };
  return [...candidates].sort((a, b) => score(b) - score(a) || a.eventId.localeCompare(b.eventId));
}

export function selectDiscoveryExpansionCycleCandidates<T extends PracticeDiscoveryCandidate & {
  coverage:{needsExpansion:boolean;actionablePracticalEvidenceCount?:number};
  discoveryExpansion:{priority:number;trigger:string};
  sourceManagedExpansionRuntime:{status:string;lastAttemptAt:string|null};
  practiceDiscovery?:PracticeDiscoveryCheckpoint|null;
}>(candidates:T[],options:{searchReady:boolean;maxEvents:number;now?:number}):T[]{
  const now=options.now??Date.now(),selected:T[]=[];
  const refreshDue=(item:T)=>item.coverage.needsExpansion && isSourceManagedRefreshDue(item.sourceManagedExpansionRuntime,now);
  const refreshCandidates=candidates.filter(refreshDue);
  const push=(item:T|undefined)=>{if(item && selected.length<options.maxEvents && !selected.some(x=>x.eventId===item.eventId))selected.push(item);};
  if(options.searchReady)push(candidates.find(item=>practiceDiscoveryDecision(item,item.practiceDiscovery??null,now).eligible));
  push(refreshCandidates.find(item=>item.discoveryExpansion.trigger==="CONFIRMED_EVENT_FOLLOW_UP" && !selected.some(x=>x.eventId===item.eventId)));
  push(refreshCandidates.find(item=>item.discoveryExpansion.trigger==="UNVERIFIED_VERIFICATION_FOLLOW_UP" && !selected.some(x=>x.eventId===item.eventId)));
  for(const candidate of refreshCandidates)push(candidate);
  return selected;
}
