import { CORE_ENTITY_SEEDS } from "../../content/intelligence-policy";
import { canonicalHotParticipantName } from "./topic-momentum";

export const PARTICIPANT_IDENTITY_VERSION = "participant-identity-v1-owner-account-publisher";

export type ParticipantIdentityType =
  | "OWNER_ENTITY"
  | "MEDIA_PUBLISHER"
  | "CREATOR_ACCOUNT"
  | "COMMUNITY_ACCOUNT"
  | "PUBLISHER"
  | "SIGNAL_SOURCE";

export type ParticipantIdentityRole = "EDITORIAL" | "SIGNAL" | "ISOLATED";

export type ParticipantIdentityInput = {
  sourceId: string;
  sourceType: string;
  sourceName: string;
  platform: string;
  canonicalUrl?: string | null;
  author?: string | null;
  metadata?: unknown;
  sourceMetadata?: unknown;
  referenceOnly?: boolean;
  signalOnly?: boolean;
  resolvedOriginPublisher?: boolean;
};

export type ResolvedParticipantIdentity = {
  version: typeof PARTICIPANT_IDENTITY_VERSION;
  participantKey: string | null;
  participantName: string | null;
  participantType: ParticipantIdentityType | null;
  ownerEntityId: string | null;
  accountId: string | null;
  platform: string;
  role: ParticipantIdentityRole;
  resolutionBasis: string;
  confidence: number;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function normalize(value: string) { return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase(); }
function host(value: string | null | undefined) { if (!value) return ""; try { return new URL(value).hostname.toLocaleLowerCase().replace(/^www\./, ""); } catch { return ""; } }
function sourceOwnerByDomain(input: ParticipantIdentityInput) {
  const sourceHost = host(input.canonicalUrl);
  if (!sourceHost) return null;
  return CORE_ENTITY_SEEDS.find((entity) => entity.officialDomains.some((domain) => sourceHost === domain || sourceHost.endsWith("." + domain))) ?? null;
}
function explicitOwnerEntityId(input: ParticipantIdentityInput) {
  const source = record(input.sourceMetadata); const raw = record(input.metadata);
  return text(raw.ownerEntityId || raw.participantOwnerEntityId || source.ownerEntityId || source.participantOwnerEntityId) || null;
}
function accountIdentity(input: ParticipantIdentityInput) {
  const raw = record(input.metadata); const source = record(input.sourceMetadata);
  return [raw.accountId, raw.account_id, raw.username, raw.userName, raw.channelId, raw.channel_id, raw.creatorId, raw.creator_id, raw.handle, raw.by, source.accountId, source.channelId, source.creatorId, source.handle, input.author].map(text).find(Boolean) ?? null;
}
function originPublisher(input: ParticipantIdentityInput) { return text(record(input.metadata).originPublisher); }
function canonicalPublisher(input: ParticipantIdentityInput) {
  const source = record(input.sourceMetadata); const raw = record(input.metadata);
  return text(raw.canonicalPublisher) || text(raw.publisherIdentity) || text(source.canonicalPublisher) || text(source.publisherIdentity) || originPublisher(input) || input.sourceName;
}
function parentPublisher(input: ParticipantIdentityInput) {
  const source = record(input.sourceMetadata); const raw = record(input.metadata);
  return text(raw.parentOrganization) || text(raw.parentPublisher) || text(source.parentOrganization) || text(source.parentPublisher);
}
function explicitRole(input: ParticipantIdentityInput): ParticipantIdentityRole | null {
  const raw = record(input.metadata); const source = record(input.sourceMetadata);
  const value = [raw.heatParticipation, raw.intelligenceParticipation, source.heatParticipation, source.intelligenceParticipation].map((item) => text(item).toUpperCase()).find(Boolean);
  if (value === "ISOLATED") return "ISOLATED";
  if (value === "SIGNAL" || value === "HOT_SIGNAL") return "SIGNAL";
  if (value === "EDITORIAL") return "EDITORIAL";
  return null;
}
function roleFor(input: ParticipantIdentityInput): ParticipantIdentityRole {
  const explicit = explicitRole(input); if (explicit) return explicit;
  if (input.resolvedOriginPublisher || (input.referenceOnly && Boolean(originPublisher(input)))) return "EDITORIAL";
  if (input.signalOnly || input.referenceOnly) return "SIGNAL";
  return "EDITORIAL";
}
function communityPlatform(platform: string) { return ["HACKER_NEWS", "REDDIT", "DEV_TO", "DEV.TO", "LOBSTERS"].includes(platform.toUpperCase()); }
function creatorLike(input: ParticipantIdentityInput) {
  const sourceType = input.sourceType.toUpperCase(); const platform = input.platform.toUpperCase();
  return ["SOCIAL", "DEVELOPER", "CREATOR"].includes(sourceType) || ["X", "TWITTER", "YOUTUBE", "BILIBILI", "WECHAT", "WEIXIN", "SUBSTACK", "XIAOHONGSHU", "DOUYIN"].includes(platform);
}

export function resolveParticipantIdentity(input: ParticipantIdentityInput): ResolvedParticipantIdentity {
  const role = roleFor(input);
  if (role === "ISOLATED") return { version:PARTICIPANT_IDENTITY_VERSION, participantKey:null, participantName:null, participantType:null, ownerEntityId:null, accountId:null, platform:input.platform, role, resolutionBasis:"EXPLICIT_ISOLATED", confidence:100 };

  const origin = originPublisher(input);
  if ((input.referenceOnly || input.signalOnly) && !origin && !input.author) {
    const name = canonicalHotParticipantName(input.sourceName || input.sourceId);
    return { version:PARTICIPANT_IDENTITY_VERSION, participantKey:"signal:"+normalize(name), participantName:name, participantType:"SIGNAL_SOURCE", ownerEntityId:null, accountId:null, platform:input.platform, role:"SIGNAL", resolutionBasis:"UNRESOLVED_SIGNAL_SOURCE", confidence:90 };
  }
  if (origin && (input.referenceOnly || input.resolvedOriginPublisher)) {
    const name = canonicalHotParticipantName(origin);
    return { version:PARTICIPANT_IDENTITY_VERSION, participantKey:"publisher:"+normalize(parentPublisher(input)||name), participantName:name, participantType:"PUBLISHER", ownerEntityId:null, accountId:null, platform:input.platform, role:"EDITORIAL", resolutionBasis:"RESOLVED_ORIGIN_PUBLISHER", confidence:95 };
  }

  const explicitOwner = explicitOwnerEntityId(input); const domainOwner = sourceOwnerByDomain(input); const ownerEntityId = explicitOwner || domainOwner?.entityId || null;
  if (ownerEntityId) {
    const owner = CORE_ENTITY_SEEDS.find((item) => item.entityId === ownerEntityId) ?? domainOwner;
    const name = owner?.canonicalName ?? canonicalHotParticipantName(input.sourceName);
    return { version:PARTICIPANT_IDENTITY_VERSION, participantKey:"owner:"+ownerEntityId, participantName:name, participantType:"OWNER_ENTITY", ownerEntityId, accountId:null, platform:input.platform, role, resolutionBasis:explicitOwner?"EXPLICIT_OWNER_ENTITY":"OFFICIAL_DOMAIN_OWNER", confidence:explicitOwner?100:98 };
  }

  const accountId = accountIdentity(input);
  if (communityPlatform(input.platform) && accountId) {
    return { version:PARTICIPANT_IDENTITY_VERSION, participantKey:"community:"+normalize(input.platform)+":"+normalize(accountId), participantName:accountId, participantType:"COMMUNITY_ACCOUNT", ownerEntityId:null, accountId, platform:input.platform, role, resolutionBasis:"COMMUNITY_ACCOUNT", confidence:98 };
  }
  if (creatorLike(input) && accountId) {
    const source = record(input.sourceMetadata); const crossPlatformCreatorId = text(source.creatorIdentityId || source.crossPlatformCreatorId);
    const key = crossPlatformCreatorId ? "creator:"+normalize(crossPlatformCreatorId) : "account:"+normalize(input.platform)+":"+normalize(accountId);
    return { version:PARTICIPANT_IDENTITY_VERSION, participantKey:key, participantName:accountId, participantType:"CREATOR_ACCOUNT", ownerEntityId:null, accountId, platform:input.platform, role, resolutionBasis:crossPlatformCreatorId?"EXPLICIT_CROSS_PLATFORM_CREATOR":"PLATFORM_ACCOUNT", confidence:crossPlatformCreatorId?100:95 };
  }

  const publisher = parentPublisher(input) || canonicalPublisher(input); const name = canonicalHotParticipantName(publisher || input.sourceName || input.sourceId);
  return { version:PARTICIPANT_IDENTITY_VERSION, participantKey:"publisher:"+normalize(name), participantName:name, participantType:input.sourceType.toUpperCase()==="MEDIA"?"MEDIA_PUBLISHER":"PUBLISHER", ownerEntityId:null, accountId:null, platform:input.platform, role, resolutionBasis:parentPublisher(input)?"PARENT_PUBLISHER":"CANONICAL_PUBLISHER", confidence:parentPublisher(input)?98:90 };
}
