export const DISCOVERY_ROUTE_DEFINITIONS = [
  {
    id: "OFFICIAL_FACTS",
    label: "官方事实",
    purpose: "产品、模型、API、Changelog 与官方公告的一手事实",
    authority: "PRIMARY_FACT"
  },
  {
    id: "MEDIA_CONFIRMATION",
    label: "媒体确认",
    purpose: "用独立专业媒体补充确认、背景与影响",
    authority: "FACT_CONFIRMATION"
  },
  {
    id: "RESEARCH_DISCOVERY",
    label: "研究发现",
    purpose: "论文、基准、研究进展与技术解释",
    authority: "RESEARCH_REFERENCE"
  },
  {
    id: "DEVELOPER_ADOPTION",
    label: "开发者采用",
    purpose: "GitHub、HN、Product Hunt 等真实采用与开发者讨论",
    authority: "DISCOVERY_SIGNAL"
  },
  {
    id: "CREATOR_PRACTICE",
    label: "创作者实践",
    purpose: "教程、体验、工作案例与可操作内容",
    authority: "PRACTICAL_REFERENCE"
  },
  {
    id: "AGGREGATED_DISCOVERY",
    label: "聚合发现",
    purpose: "跨平台热点榜与聚合器提供候选线索",
    authority: "DISCOVERY_SIGNAL"
  },
  {
    id: "SOCIAL_SIGNAL",
    label: "社交讨论",
    purpose: "社交传播、讨论和需求信号，只辅助发现",
    authority: "DISCOVERY_SIGNAL"
  }
] as const;

export type DiscoveryRouteId = typeof DISCOVERY_ROUTE_DEFINITIONS[number]["id"];

export type DiscoveryRouteSourceLike = {
  sourceRole?: string | null;
  sourceType?: string | null;
  evidenceRoles?: readonly string[] | null;
};

export function resolveDiscoveryRouteIds(input: DiscoveryRouteSourceLike): DiscoveryRouteId[] {
  const sourceRole = String(input.sourceRole ?? "").toUpperCase();
  const sourceType = String(input.sourceType ?? "").toUpperCase();
  const evidenceRoles = new Set((input.evidenceRoles ?? []).map((item) => String(item).toUpperCase()));
  const routes = new Set<DiscoveryRouteId>();

  if (
    sourceRole === "OFFICIAL" ||
    sourceType === "OFFICIAL" ||
    evidenceRoles.has("PRIMARY_FACT")
  ) routes.add("OFFICIAL_FACTS");

  if (
    sourceRole === "PROFESSIONAL_MEDIA" ||
    sourceType === "MEDIA" ||
    evidenceRoles.has("MEDIA_CONFIRMATION")
  ) routes.add("MEDIA_CONFIRMATION");

  if (
    sourceRole === "RESEARCH" ||
    sourceType === "RESEARCH" ||
    evidenceRoles.has("BENCHMARK")
  ) routes.add("RESEARCH_DISCOVERY");

  if (
    sourceRole === "DEVELOPER_COMMUNITY" ||
    sourceType === "DEVELOPER" ||
    evidenceRoles.has("ADOPTION")
  ) routes.add("DEVELOPER_ADOPTION");

  if (
    sourceRole === "CREATOR" ||
    evidenceRoles.has("TUTORIAL") ||
    evidenceRoles.has("EXPERIENCE")
  ) routes.add("CREATOR_PRACTICE");

  if (sourceRole === "DISCOVERY_AGGREGATOR") routes.add("AGGREGATED_DISCOVERY");

  if (
    sourceRole === "SOCIAL" ||
    sourceType === "SOCIAL" ||
    evidenceRoles.has("SOCIAL_SIGNAL") ||
    evidenceRoles.has("DEMAND_SIGNAL")
  ) routes.add("SOCIAL_SIGNAL");

  if (!routes.size) routes.add("AGGREGATED_DISCOVERY");
  return [...routes];
}

export function discoveryRouteDefinition(routeId: DiscoveryRouteId) {
  return DISCOVERY_ROUTE_DEFINITIONS.find((item) => item.id === routeId)!;
}
