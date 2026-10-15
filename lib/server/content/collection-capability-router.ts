import "server-only";

import { isOverseasRelayConfigured } from "./overseas-collector-relay-client";

export const COLLECTION_CAPABILITY_PLATFORMS = [
  "BILIBILI",
  "YOUTUBE"
] as const;

export const COLLECTION_CAPABILITIES = [
  "SEARCH",
  "READ",
  "TRANSCRIPT",
  "COMMENTS",
  "METRICS"
] as const;

export type CollectionCapabilityPlatform =
  (typeof COLLECTION_CAPABILITY_PLATFORMS)[number];
export type CollectionCapability =
  (typeof COLLECTION_CAPABILITIES)[number];

export type CollectionBackendAuthMode =
  | "ZERO_CONFIG"
  | "API_KEY"
  | "RELAY";

export type CollectionBackendHealthStatus =
  | "READY"
  | "DEGRADED"
  | "CONFIG_REQUIRED"
  | "UNAVAILABLE";

export type CollectionCapabilityBackend = {
  id: string;
  label: string;
  authMode: CollectionBackendAuthMode;
  purpose: string;
};

export type CollectionCapabilityDefinition = {
  backends: readonly CollectionCapabilityBackend[];
  expansionProvider: "BILIBILI_SEARCH" | "YOUTUBE_SEARCH" | null;
};

type PlatformDefinition = Partial<Record<CollectionCapability, CollectionCapabilityDefinition>>;

const backend = (
  id: string,
  label: string,
  authMode: CollectionBackendAuthMode,
  purpose: string
): CollectionCapabilityBackend => ({ id, label, authMode, purpose });

export const COLLECTION_CAPABILITY_REGISTRY: Record<
  CollectionCapabilityPlatform,
  PlatformDefinition
> = {
  BILIBILI: {
    SEARCH: {
      backends: [
        backend("BILIBILI_PUBLIC_SEARCH_API", "B站公共搜索 API", "ZERO_CONFIG", "公开搜索")
      ],
      expansionProvider: "BILIBILI_SEARCH"
    },
    READ: {
      backends: [
        backend("BILIBILI_PUBLIC_DETAIL", "B站公开详情", "ZERO_CONFIG", "视频详情")
      ],
      expansionProvider: null
    },
    METRICS: {
      backends: [
        backend("BILIBILI_PUBLIC_METRICS", "B站公开指标", "ZERO_CONFIG", "公开互动指标")
      ],
      expansionProvider: null
    }
  },
  YOUTUBE: {
    SEARCH: {
      backends: [
        backend("YOUTUBE_DATA_API_SEARCH", "YouTube Data API", "API_KEY", "视频搜索"),
        backend("YOUTUBE_RELAY_SEARCH", "YouTube Overseas Relay", "RELAY", "搜索兜底")
      ],
      expansionProvider: "YOUTUBE_SEARCH"
    },
    READ: {
      backends: [
        backend("YOUTUBE_DATA_API_READ", "YouTube Data API", "API_KEY", "视频详情"),
        backend("YOUTUBE_RELAY_READ", "YouTube Overseas Relay", "RELAY", "详情兜底")
      ],
      expansionProvider: null
    },
    TRANSCRIPT: {
      backends: [
        backend("YOUTUBE_TRANSCRIPT_ADAPTER", "YouTube Transcript Adapter", "ZERO_CONFIG", "字幕")
      ],
      expansionProvider: null
    },
    COMMENTS: {
      backends: [
        backend("YOUTUBE_DATA_API_COMMENTS", "YouTube Data API", "API_KEY", "评论")
      ],
      expansionProvider: null
    },
    METRICS: {
      backends: [
        backend("YOUTUBE_DATA_API_METRICS", "YouTube Data API", "API_KEY", "播放/互动指标"),
        backend("YOUTUBE_RELAY_METRICS", "YouTube Overseas Relay", "RELAY", "指标兜底")
      ],
      expansionProvider: null
    }
  }
};

export type CollectionCapabilityHealthInput = {
  env: Record<string, string | undefined>;
  overseasRelayConfigured: boolean;
};

export type CollectionBackendHealth = {
  backendId: string;
  status: CollectionBackendHealthStatus;
  reason: string;
};

export type CollectionCapabilityHealthSnapshot = {
  generatedAt: string;
  backends: Record<string, CollectionBackendHealth>;
};

function backendHealth(
  id: string,
  input: CollectionCapabilityHealthInput
): CollectionBackendHealth {
  const ready = (reason: string): CollectionBackendHealth => ({
    backendId: id,
    status: "READY",
    reason
  });
  const config = (reason: string): CollectionBackendHealth => ({
    backendId: id,
    status: "CONFIG_REQUIRED",
    reason
  });
  const unavailable = (reason: string): CollectionBackendHealth => ({
    backendId: id,
    status: "UNAVAILABLE",
    reason
  });

  if (id === "BILIBILI_PUBLIC_SEARCH_API" || id === "BILIBILI_PUBLIC_DETAIL" || id === "BILIBILI_PUBLIC_METRICS") {
    return ready("zero-config-public-capability");
  }
  if (id.startsWith("YOUTUBE_DATA_API_")) {
    return input.env.YOUTUBE_DATA_API_KEY?.trim()
      ? ready("youtube-api-key-configured")
      : config("youtube-api-key-missing");
  }
  if (id.startsWith("YOUTUBE_RELAY_")) {
    return input.overseasRelayConfigured
      ? ready("overseas-relay-configured")
      : config("overseas-relay-not-configured");
  }
  if (id === "YOUTUBE_TRANSCRIPT_ADAPTER") {
    return ready("zero-config-transcript-adapter");
  }

  return unavailable("backend-health-probe-not-implemented");
}

export function buildCollectionCapabilityHealthSnapshot(
  input: CollectionCapabilityHealthInput
): CollectionCapabilityHealthSnapshot {
  const backends: Record<string, CollectionBackendHealth> = {};
  for (const platform of COLLECTION_CAPABILITY_PLATFORMS) {
    const definitions = COLLECTION_CAPABILITY_REGISTRY[platform];
    for (const capability of COLLECTION_CAPABILITIES) {
      const definition = definitions[capability];
      if (!definition) continue;
      for (const item of definition.backends) {
        if (!backends[item.id]) backends[item.id] = backendHealth(item.id, input);
      }
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    backends
  };
}

export type CollectionCapabilityRoute = {
  platform: CollectionCapabilityPlatform;
  capability: CollectionCapability;
  status: CollectionBackendHealthStatus;
  activeBackend: CollectionCapabilityBackend | null;
  fallbackBackends: CollectionCapabilityBackend[];
  expansionProvider: CollectionCapabilityDefinition["expansionProvider"];
  backendHealth: CollectionBackendHealth[];
};

export function resolveCollectionCapabilityRoute(
  platform: CollectionCapabilityPlatform,
  capability: CollectionCapability,
  snapshot: CollectionCapabilityHealthSnapshot
): CollectionCapabilityRoute {
  const definition = COLLECTION_CAPABILITY_REGISTRY[platform][capability];
  if (!definition) {
    return {
      platform,
      capability,
      status: "UNAVAILABLE",
      activeBackend: null,
      fallbackBackends: [],
      expansionProvider: null,
      backendHealth: []
    };
  }

  const health = definition.backends.map((item) =>
    snapshot.backends[item.id] ?? {
      backendId: item.id,
      status: "UNAVAILABLE" as const,
      reason: "backend-health-missing"
    }
  );
  const readyIndexes = health
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.status === "READY" || item.status === "DEGRADED");
  const activeIndex = readyIndexes[0]?.index ?? -1;
  const activeBackend = activeIndex >= 0 ? definition.backends[activeIndex] ?? null : null;
  const fallbackBackends = activeIndex >= 0
    ? readyIndexes
        .filter(({ index }) => index > activeIndex)
        .map(({ index }) => definition.backends[index]!)
    : [];

  let status: CollectionBackendHealthStatus = activeBackend ? "READY" : "UNAVAILABLE";
  if (!activeBackend) {
    if (health.some((item) => item.status === "CONFIG_REQUIRED")) status = "CONFIG_REQUIRED";
    else if (health.some((item) => item.status === "DEGRADED")) status = "DEGRADED";
  }

  return {
    platform,
    capability,
    status,
    activeBackend,
    fallbackBackends,
    expansionProvider: definition.expansionProvider,
    backendHealth: health
  };
}

export async function getCurrentCollectionCapabilityHealthSnapshot() {
  return buildCollectionCapabilityHealthSnapshot({
    env: process.env,
    overseasRelayConfigured: isOverseasRelayConfigured()
  });
}

export async function getCurrentCollectionCapabilityRoutes() {
  const snapshot = await getCurrentCollectionCapabilityHealthSnapshot();
  return COLLECTION_CAPABILITY_PLATFORMS.flatMap((platform) =>
    COLLECTION_CAPABILITIES.flatMap((capability) => {
      if (!COLLECTION_CAPABILITY_REGISTRY[platform][capability]) return [];
      return [resolveCollectionCapabilityRoute(platform, capability, snapshot)];
    })
  );
}

export const DEFAULT_CREATOR_EXPANSION_PLATFORMS = [
  "BILIBILI",
  "YOUTUBE"
] as const;

export function creatorExpansionProvidersFromRegistry() {
  return DEFAULT_CREATOR_EXPANSION_PLATFORMS
    .map((platform) => COLLECTION_CAPABILITY_REGISTRY[platform].SEARCH?.expansionProvider ?? null)
    .filter((item): item is "BILIBILI_SEARCH" | "YOUTUBE_SEARCH" => Boolean(item));
}

export function healthyCreatorExpansionProviders(
  snapshot: CollectionCapabilityHealthSnapshot
) {
  return DEFAULT_CREATOR_EXPANSION_PLATFORMS.flatMap((platform) => {
    const route = resolveCollectionCapabilityRoute(platform, "SEARCH", snapshot);
    if (!route.activeBackend || !route.expansionProvider) return [];
    return [route.expansionProvider];
  }).filter(
    (item): item is "BILIBILI_SEARCH" | "YOUTUBE_SEARCH" =>
      item === "BILIBILI_SEARCH" || item === "YOUTUBE_SEARCH"
  );
}
