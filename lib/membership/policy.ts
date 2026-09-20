export const OPC_MEMBERSHIP_PRODUCT = {
  entitlementType: "MEMBERSHIP",
  resourceType: "PRODUCT",
  resourceId: "OPC_MEMBER"
} as const;

export const OPC_MEMBERSHIP_PLANS = [
  {
    code: "opc_monthly",
    name: "月卡",
    priceAmount: 39,
    currency: "CNY",
    billingPeriod: "MONTH",
    priceLabel: "¥39",
    periodLabel: "/ 月",
    description: "适合先体验完整会员内容。",
    featured: false
  },
  {
    code: "opc_yearly",
    name: "年卡",
    priceAmount: 299,
    currency: "CNY",
    billingPeriod: "YEAR",
    priceLabel: "¥299",
    periodLabel: "/ 年",
    description: "适合持续学习与跟进 AI 更新。",
    featured: true
  }
] as const;

export type MembershipFeature =
  | "COURSE_CONTENT"
  | "PRACTICE"
  | "STAGE_PROJECT"
  | "AI_DAILY_FULL"
  | "DEEP_RESOURCE";

export const MEMBERSHIP_BENEFIT_MATRIX = [
  ["基础 AI 课程", "✓", "✓"],
  ["Stage 1 指定章节", "关注公众号后解锁", "✓"],
  ["基础 / 自主 Practice", "✓", "✓"],
  ["AI Daily Top 3", "✓", "✓"],
  ["完整 AI Daily", "关注公众号后解锁", "✓"],
  ["Knowledge 正文", "—", "✓"],
  ["Latest Practice 卡片", "✓", "✓"],
  ["Latest Practice 详情 / 正式实操", "—", "✓"],
  ["进阶内容关联课程入口", "—", "✓"],
  ["飞书 Deep Resource", "—", "✓"],
  ["公众号重要更新通知", "✓", "✓"]
] as const;
