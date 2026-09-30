import fs from "node:fs";
import { MEMBERSHIP_BENEFIT_MATRIX } from "../lib/membership/policy";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("MEMBERSHIP_POLICY_VALIDATION_FAILED:" + code);
}

const expectedBenefits = [
  "AI 基础认知课程",
  "AI 日报",
  "进阶练习",
  "实操项目",
  "进阶内容",
  "个人 AI 工作台"
];

assert(
  JSON.stringify(MEMBERSHIP_BENEFIT_MATRIX.map(([name]) => name)) ===
    JSON.stringify(expectedBenefits),
  "BENEFIT_MATRIX_DRIFT"
);

const membershipView = fs.readFileSync("components/MembershipBenefits.tsx", "utf8");
const officialAccount = fs.readFileSync("components/OfficialAccountUnlock.tsx", "utf8");
const lockedCta = fs.readFileSync("components/LockedAccessCta.tsx", "utf8");
const dailyFeed = fs.readFileSync("components/DailyFeed.tsx", "utf8");
const practiceAccess = fs.readFileSync("lib/server/practices/access.ts", "utf8");
const facts = fs.readFileSync("docs/CURRENT_SYSTEM_FACTS.md", "utf8");
const architecture = fs.readFileSync("docs/ARCHITECTURE.md", "utf8");

assert(membershipView.includes("OPC 订阅会员"), "MEMBER_COLUMN_TITLE_REQUIRED");
assert(officialAccount.includes("公众号学习助手"), "FOLLOW_ASSISTANT_REQUIRED");
assert(officialAccount.includes("AI 基础认知课程全章节"), "FOLLOW_COURSE_UNLOCK_REQUIRED");
assert(officialAccount.includes("完整 AI 日报"), "FOLLOW_DAILY_UNLOCK_REQUIRED");
assert(officialAccount.includes("实操项目与进阶练习"), "FOLLOW_PUSH_SCOPE_REQUIRED");
assert(!officialAccount.includes("收到推送不代表已获得这些会员内容的使用权限"), "INTERNAL_PUSH_ACCESS_COPY_HIDDEN");
assert(!officialAccount.includes("仍按实际会员权益判断"), "INTERNAL_MEMBERSHIP_RULE_COPY_HIDDEN");
assert(!officialAccount.includes("真实微信关注验证将在微信渠道接入后自动完成"), "INTERNAL_FOLLOW_VERIFICATION_COPY_HIDDEN");
assert(officialAccount.includes("关注公众号 → 解锁完整内容"), "FOLLOW_VALUE_HEADLINE_REQUIRED");
assert(officialAccount.includes("让值得学的内容主动来到你面前"), "FOLLOW_VALUE_COPY_REQUIRED");
assert(officialAccount.includes("公众号权益待解锁"), "AUTHENTICATED_FOLLOW_STATUS_REQUIRED");
assert(dailyFeed.includes("部分内容可免费阅读全文"), "DAILY_PARTIAL_FREE_COPY_REQUIRED");
assert(!dailyFeed.includes("Top 3 免费阅读全文"), "DAILY_TOP3_MUST_NOT_BE_PRODUCT_PROMISE");
assert(lockedCta.includes("进阶练习、实操项目与后续进阶内容"), "MEMBER_VALUE_COPY_REQUIRED");
assert(practiceAccess.includes("resolveMembershipFeatureAccess"), "PRACTICE_MEMBER_GATE_REQUIRED");
assert(MEMBERSHIP_BENEFIT_MATRIX.some(([name, , member]) => name === "个人 AI 工作台" && member.includes("会员专属")), "PERSONAL_WORKSPACE_MEMBER_BENEFIT_REQUIRED");
assert(!practiceAccess.includes("hasOfficialAccountFollowEntitlement"), "FOLLOW_MUST_NOT_UNLOCK_PRACTICE");

for (const banned of [
  "指定基础课程章节",
  "基础练习 / 自主练习",
  "AI 日报精选 3 条",
  "知识库完整正文",
  "最新实操卡片",
  "最新实操详情 / 正式实操",
  "飞书深度学习资料",
  "公众号重要更新通知"
]) {
  assert(!MEMBERSHIP_BENEFIT_MATRIX.some(([name]) => name === banned), "LEGACY_BENEFIT_REINTRODUCED:" + banned);
}

assert(facts.includes("免费用户：AI 日报精选 Top3") && facts.includes("公众号关注权益：全部日报") && facts.includes("个人 AI 工作台") && facts.includes("真实公众号关注验证、完整订单/支付仍未接入"), "CURRENT_FACT_GOVERNANCE_REQUIRED");
assert(architecture.includes("公众号关注、微信登录、抖音登录、支付属于 Adapter / Identity / Commerce") && architecture.includes("同一 user 共享 Progress / Entitlement / Membership"), "ARCHITECTURE_GOVERNANCE_REQUIRED");

console.log("MEMBERSHIP_BENEFIT_MATRIX=PASS");
console.log("OFFICIAL_ACCOUNT_LEARNING_ASSISTANT=PASS");
console.log("AI_DAILY_PRODUCT_COPY=PASS");
console.log("INTERNAL_MODEL_NOT_PRODUCT_BENEFIT=PASS");
console.log("MEMBERSHIP_POLICY_GOVERNANCE=PASS");
