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
  ["会员 Practice / 阶段实操", "部分", "✓"],
  ["每日 AI 精选", "✓", "✓"],
  ["完整课程", "当前同免费层", "规划"],
  ["完整 AI 日报", "当前同免费层", "规划"],
  ["深度解读 / 课程关联", "—", "规划"],
  ["公众号重要更新通知", "✓", "✓"],
  ["公众号课程 / 深度资料更新通知", "—", "规划"],
  ["飞书公开资料", "部分", "部分"],
  ["飞书深度资料 / 扩展教程 / 附件", "—", "规划"],
  ["最新课程内容与新增资料", "部分", "规划"]
] as const;
