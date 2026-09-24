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
  | "PRACTICE"
  | "STAGE_PROJECT";

export const MEMBERSHIP_BENEFIT_MATRIX = [
  ["AI 基础认知课程", "关注公众号后解锁全章节", "✓"],
  ["AI 日报", "关注公众号后完整查看", "✓"],
  ["进阶练习", "—", "✓"],
  ["实操项目", "—", "✓"],
  ["进阶内容", "—", "✓"]
] as const;
