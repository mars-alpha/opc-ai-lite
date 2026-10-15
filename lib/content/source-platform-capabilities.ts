export type SourcePlatformCapability = {
  platform: string;
  label: string;
  region: "DOMESTIC" | "OVERSEAS";
  discoveryOwner: string;
  creatorRoute: string;
  defaultMode: "AGGREGATOR_ONLY" | "FEED_FIRST" | "CREATOR_PUBLIC_FEED" | "API_QUOTA_MANAGED";
  freeAccess: string;
  schedulePolicy: string;
  status: "ACTIVE" | "CONDITIONAL";
  reason: string;
};

export const SOURCE_PLATFORM_CAPABILITIES: readonly SourcePlatformCapability[] = [
  { platform:"GITHUB", label:"GitHub", region:"OVERSEAS", discoveryOwner:"GitHub Trending + 官方 Atom", creatorRoute:"公开 Atom / RSS；REST API 只补指标", defaultMode:"FEED_FIRST", freeAccess:"公开 Feed 无需登录；REST API 仅作补充", schedulePolicy:"Feed 15–30 分钟；API 仅补 repo 指标 / rate-limit", status:"ACTIVE", reason:"稳定、免费、服务器可直接运行。" },
  { platform:"YOUTUBE", label:"YouTube", region:"OVERSEAS", discoveryOwner:"频道 Feed + YouTube API", creatorRoute:"公开 Channel Feed / Data API", defaultMode:"API_QUOTA_MANAGED", freeAccess:"默认 10,000 quota units/day；search.list 每次 100 units（若全部额度用于搜索约 100 次/日）", schedulePolicy:"频道更新优先 Feed；API 低频补播放/评论等指标，按剩余额度动态降频", status:"ACTIVE", reason:"无需用户登录；API Key / Relay 均可由服务器长期运行。" },
  { platform:"BILIBILI", label:"B站", region:"DOMESTIC", discoveryOwner:"DailyHot + 公开搜索能力", creatorRoute:"仅公开 Feed / RSSHub 路径通过 Probe 后接入", defaultMode:"CREATOR_PUBLIC_FEED", freeAccess:"公开搜索 / 自托管 RSSHub，无登录依赖", schedulePolicy:"热点不单独扫；Creator 仅在公开 Feed Probe 通过后低频采集", status:"ACTIVE", reason:"不使用 Browser 登录兜底。" },
  { platform:"WEIBO", label:"微博", region:"DOMESTIC", discoveryOwner:"DailyHot 国内综合热点", creatorRoute:"当前不提供独立 Creator Route", defaultMode:"AGGREGATOR_ONLY", freeAccess:"由 DailyHot 聚合覆盖", schedulePolicy:"不建立独立热点或登录任务", status:"ACTIVE", reason:"已有聚合覆盖，取消重复任务。" },
  { platform:"ZHIHU", label:"知乎", region:"DOMESTIC", discoveryOwner:"DailyHot 国内综合热点", creatorRoute:"当前不提供独立 Creator Route", defaultMode:"AGGREGATOR_ONLY", freeAccess:"由 DailyHot 聚合覆盖", schedulePolicy:"不建立独立热点或登录任务", status:"ACTIVE", reason:"已有聚合覆盖，取消重复任务。" },
  { platform:"DOUYIN", label:"抖音", region:"DOMESTIC", discoveryOwner:"DailyHot 国内综合热点", creatorRoute:"当前不提供独立 Creator Route", defaultMode:"AGGREGATOR_ONLY", freeAccess:"由 DailyHot 聚合覆盖", schedulePolicy:"不建立独立热点或登录任务", status:"ACTIVE", reason:"已有聚合覆盖，取消重复任务。" }
] as const;
