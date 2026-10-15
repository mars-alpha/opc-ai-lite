import "server-only";

export const SOURCE_ACQUISITION_KINDS = [
  "RSS_ATOM",
  "SITEMAP",
  "PUBLIC_JSON_API",
  "PUBLIC_GENERATED_FEED",
  "STATIC_PAGE",
  "JINA_READER",
  "PLATFORM_API",
  "SOCIAL_BROWSER",
  "SEARCH_DISCOVERY",
  "TREND_DISCOVERY",
  "MEDIA_TRANSCRIPT",
  "MANUAL",
  "UNRESOLVED"
] as const;

export type SourceAcquisitionKind = (typeof SOURCE_ACQUISITION_KINDS)[number];

export type SourceAcquisitionPlanInput = {
  collectionMethod: string;
  platform: string;
  providerRef?: string | null;
  canonicalUrl?: string | null;
  metadata?: unknown;
  collectionConfig?: unknown;
};

export const SOURCE_ACQUISITION_COST_LEVELS = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;

export type SourceAcquisitionCostLevel = (typeof SOURCE_ACQUISITION_COST_LEVELS)[number];
export type SourceAcquisitionRouteRole = "PRIMARY" | "FALLBACK";

export type SourceAcquisitionRoute = {
  id: string;
  role: SourceAcquisitionRouteRole;
  kind: SourceAcquisitionKind;
  explicit: boolean;
  reason: string;
  targetUrl: string | null;
  runtimeOwner: string | null;
  costLevel: SourceAcquisitionCostLevel;
  enabled: boolean;
  serverRuntimeSupported: boolean;
};

export type SourceAcquisitionPlan = {
  routes: SourceAcquisitionRoute[];
  primaryRoute: SourceAcquisitionRoute;
  fallbackRoutes: SourceAcquisitionRoute[];
  kind: SourceAcquisitionKind;
  explicit: boolean;
  reason: string;
  fallbackKinds: SourceAcquisitionKind[];
  targetUrl: string | null;
  runtimeOwner: string | null;
  serverRuntimeSupported: boolean;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeKind(value: unknown): SourceAcquisitionKind | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return SOURCE_ACQUISITION_KINDS.includes(normalized as SourceAcquisitionKind)
    ? normalized as SourceAcquisitionKind
    : null;
}

function normalizeFallbacks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(normalizeKind).filter(
    (item): item is SourceAcquisitionKind => Boolean(item) && item !== "UNRESOLVED"
  ))];
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeRouteId(value: unknown, fallback: string) {
  const normalized = text(value)?.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function normalizeCostLevel(value: unknown, kind: SourceAcquisitionKind): SourceAcquisitionCostLevel {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (SOURCE_ACQUISITION_COST_LEVELS.includes(normalized as SourceAcquisitionCostLevel)) {
    return normalized as SourceAcquisitionCostLevel;
  }
  if (["RSS_ATOM", "SITEMAP", "PUBLIC_JSON_API"].includes(kind)) return "LOW";
  if (["PUBLIC_GENERATED_FEED", "STATIC_PAGE", "SEARCH_DISCOVERY", "TREND_DISCOVERY", "PLATFORM_API"].includes(kind)) return "MEDIUM";
  if (["JINA_READER", "MEDIA_TRANSCRIPT"].includes(kind)) return "HIGH";
  return "VERY_HIGH";
}

const GENERIC_SERVER_RUNTIME_KINDS: SourceAcquisitionKind[] = [
  "RSS_ATOM",
  "SITEMAP",
  "STATIC_PAGE",
  "JINA_READER",
  "SEARCH_DISCOVERY",
  "TREND_DISCOVERY"
];

export function acquisitionSupportsServerRuntime(
  kind: SourceAcquisitionKind,
  runtimeOwner?: string | null
) {
  if (GENERIC_SERVER_RUNTIME_KINDS.includes(kind)) return true;
  if (["PUBLIC_JSON_API", "PUBLIC_GENERATED_FEED", "PLATFORM_API", "MEDIA_TRANSCRIPT"].includes(kind)) {
    return Boolean(runtimeOwner?.trim());
  }
  return false;
}

function routeResult(input: {
  id?: string;
  role?: SourceAcquisitionRouteRole;
  kind: SourceAcquisitionKind;
  explicit: boolean;
  reason: string;
  targetUrl?: string | null;
  runtimeOwner?: string | null;
  costLevel?: SourceAcquisitionCostLevel;
  enabled?: boolean;
}): SourceAcquisitionRoute {
  const runtimeOwner = text(input.runtimeOwner);
  const role = input.role ?? "PRIMARY";
  return {
    id: normalizeRouteId(input.id, role === "PRIMARY" ? "primary" : "fallback-" + input.kind.toLowerCase()),
    role,
    kind: input.kind,
    explicit: input.explicit,
    reason: input.reason,
    targetUrl: text(input.targetUrl),
    runtimeOwner,
    costLevel: input.costLevel ?? normalizeCostLevel(null, input.kind),
    enabled: input.enabled !== false,
    serverRuntimeSupported: acquisitionSupportsServerRuntime(input.kind, runtimeOwner)
  };
}

function planFromRoutes(routes: SourceAcquisitionRoute[], reason: string, explicit: boolean): SourceAcquisitionPlan {
  const declared = routes.length ? routes : [routeResult({
    kind: "UNRESOLVED",
    explicit: false,
    reason: "NO_EXPLICIT_ACQUISITION_ROUTE"
  })];
  const primary = declared.find((route) => route.role === "PRIMARY") ?? declared[0]!;
  const normalizedRoutes = [
    { ...primary, role: "PRIMARY" as const },
    ...declared
      .filter((route) => route !== primary)
      .map((route) => ({ ...route, role: "FALLBACK" as const }))
  ];
  const fallbackRoutes = normalizedRoutes.slice(1);
  return {
    routes: normalizedRoutes,
    primaryRoute: normalizedRoutes[0]!,
    fallbackRoutes,
    kind: normalizedRoutes[0]!.kind,
    explicit,
    reason,
    fallbackKinds: fallbackRoutes.map((route) => route.kind),
    targetUrl: normalizedRoutes[0]!.targetUrl,
    runtimeOwner: normalizedRoutes[0]!.runtimeOwner,
    serverRuntimeSupported: normalizedRoutes[0]!.serverRuntimeSupported
  };
}

function planResult(input: {
  kind: SourceAcquisitionKind;
  explicit: boolean;
  reason: string;
  fallbackKinds?: SourceAcquisitionKind[];
  targetUrl?: string | null;
  runtimeOwner?: string | null;
}): SourceAcquisitionPlan {
  const targetUrl = text(input.targetUrl);
  const routes = [
    routeResult({
      id: "primary",
      role: "PRIMARY",
      kind: input.kind,
      explicit: input.explicit,
      reason: input.reason,
      targetUrl,
      runtimeOwner: input.runtimeOwner
    }),
    ...(input.fallbackKinds ?? []).map((kind, index) => routeResult({
      id: "fallback-" + (index + 1) + "-" + kind.toLowerCase(),
      role: "FALLBACK",
      kind,
      explicit: input.explicit,
      reason: "LEGACY_FALLBACK_KIND",
      targetUrl
    }))
  ];
  return planFromRoutes(routes, input.reason, input.explicit);
}

function explicitRoutes(acquisition: Record<string, unknown>, canonicalUrl?: string | null) {
  if (!Array.isArray(acquisition.routes)) return [];
  return acquisition.routes.flatMap((raw, index): SourceAcquisitionRoute[] => {
    const route = record(raw);
    const interactive = [route,acquisition].some(value => value.requiresLogin === true || value.requiresHuman === true || value.requiresFollow === true || value.requiresBrowserSession === true);
    const kind = normalizeKind(route.kind);
    if (!kind || kind === "UNRESOLVED") return [];
    const role = String(route.role ?? "").toUpperCase() === "PRIMARY" || index === 0 ? "PRIMARY" as const : "FALLBACK" as const;
    return [routeResult({
      id: text(route.id) ?? (role === "PRIMARY" ? "primary" : "fallback-" + index),
      role,
      kind,
      explicit: true,
      reason: interactive ? "INTERACTIVE_ACQUISITION_DEPENDENCY_REJECTED" : "EXPLICIT_ACQUISITION_ROUTE",
      targetUrl: text(route.url) ?? text(route.targetUrl) ?? text(acquisition.url) ?? canonicalUrl ?? null,
      runtimeOwner: text(route.runtimeOwner) ?? text(acquisition.runtimeOwner),
      costLevel: normalizeCostLevel(route.costLevel, kind),
      enabled: route.enabled !== false && !interactive
    })];
  });
}

export function resolveSourceAcquisitionPlan(
  input: SourceAcquisitionPlanInput
): SourceAcquisitionPlan {
  const method = input.collectionMethod.trim().toUpperCase();
  const platform = input.platform.trim().toUpperCase();
  const config = record(input.collectionConfig);
  const metadata = record(input.metadata);
  const acquisition = record(config.acquisition);
  if ([config,metadata,acquisition].some(value => value.requiresLogin === true || value.requiresHuman === true || value.requiresFollow === true || value.requiresBrowserSession === true)) {
    return planResult({kind:"UNRESOLVED",explicit:true,reason:"INTERACTIVE_ACQUISITION_DEPENDENCY_REJECTED"});
  }
  const routes = explicitRoutes(acquisition, input.canonicalUrl);
  if (routes.length) {
    return planFromRoutes(routes, "EXPLICIT_ACQUISITION_ROUTES", true);
  }
  const explicitKind = normalizeKind(acquisition.kind);
  if (explicitKind && explicitKind !== "UNRESOLVED") {
    return planResult({
      kind: explicitKind,
      explicit: true,
      reason: "EXPLICIT_ACQUISITION_KIND",
      fallbackKinds: normalizeFallbacks(acquisition.fallbackKinds),
      targetUrl: text(acquisition.url) ?? input.canonicalUrl ?? null,
      runtimeOwner: text(acquisition.runtimeOwner)
    });
  }

  const provider = String(config.provider ?? input.providerRef ?? "").toUpperCase();
  const sourceMode = String(metadata.sourceMode ?? config.sourceMode ?? "").toUpperCase();

  if (provider.includes("RSSHUB")) {
    return planResult({ kind: "RSS_ATOM", explicit: true, reason: "RSSHUB_PROVIDER", targetUrl: input.canonicalUrl ?? null });
  }
  if (provider === "ARXIV" || provider.includes("ARXIV")) {
    return planResult({ kind: "RSS_ATOM", explicit: true, reason: "ARXIV_ATOM_API", targetUrl: input.canonicalUrl ?? null });
  }
  if (provider === "HF" || provider.includes("HUGGING")) {
    return planResult({
      kind: "PUBLIC_JSON_API",
      explicit: true,
      reason: "HUGGING_FACE_PUBLIC_JSON_API",
      targetUrl: input.canonicalUrl ?? null,
      runtimeOwner: text(acquisition.runtimeOwner) ?? text(config.runtimeOwner)
    });
  }
  if (provider.includes("DAILYHOT") || provider.includes("TRENDRADAR")) {
    return planResult({ kind: "TREND_DISCOVERY", explicit: true, reason: "TREND_PROVIDER", targetUrl: input.canonicalUrl ?? null });
  }
  if (sourceMode.includes("BROWSER") || sourceMode.includes("LOGIN_REQUIRED") || method === "RUNNER") {
    return planResult({ kind: "UNRESOLVED", explicit: false, reason: "LOGIN_BROWSER_ROUTE_RETIRED", targetUrl: input.canonicalUrl ?? null });
  }

  if (method === "RSS" || method === "ATOM") {
    return planResult({ kind: "RSS_ATOM", explicit: true, reason: "LEGACY_EXPLICIT_FEED_METHOD", targetUrl: input.canonicalUrl ?? null });
  }
  if (method === "API") {
    return planResult({
      kind: "PUBLIC_JSON_API",
      explicit: true,
      reason: "LEGACY_EXPLICIT_API_METHOD",
      targetUrl: input.canonicalUrl ?? null,
      runtimeOwner: text(acquisition.runtimeOwner) ?? text(config.runtimeOwner)
    });
  }
  if (method === "SEARCH") {
    return planResult({ kind: "SEARCH_DISCOVERY", explicit: true, reason: "SEARCH_METHOD", targetUrl: input.canonicalUrl ?? null });
  }
  if (method === "TREND") {
    return planResult({ kind: "TREND_DISCOVERY", explicit: true, reason: "TREND_METHOD", targetUrl: input.canonicalUrl ?? null });
  }
  if (method === "WATCHLIST" && ["X", "XIAOHONGSHU", "DOUYIN", "WEIBO", "ZHIHU", "BILIBILI"].includes(platform)) {
    return planResult({ kind: "UNRESOLVED", explicit: false, reason: "SOCIAL_WATCHLIST_LOGIN_ROUTE_RETIRED", targetUrl: input.canonicalUrl ?? null });
  }
  if (method === "HTTP") {
    return planResult({
      kind: "STATIC_PAGE",
      explicit: true,
      reason: "LEGACY_EXPLICIT_STATIC_PAGE_METHOD",
      targetUrl: input.canonicalUrl ?? null
    });
  }
  if (method === "MANUAL") {
    return planResult({ kind: "MANUAL", explicit: true, reason: "MANUAL_METHOD", targetUrl: input.canonicalUrl ?? null });
  }

  return planResult({
    kind: "UNRESOLVED",
    explicit: false,
    reason: "NO_EXPLICIT_ACQUISITION_ROUTE",
    targetUrl: input.canonicalUrl ?? null
  });
}
