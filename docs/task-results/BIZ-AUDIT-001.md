# BIZ-AUDIT-001 — MVP 业务闭环与会员订阅 / 权益审计

Status: COMPLETE

## 1. Goal

在继续 MVP-010 Practice / Project 正式化之前，检查当前产品业务逻辑是否已经能承接既定的 OPC 会员订阅方案，特别确认：

```text
用户付费
→ Subscription / Payment
→ Entitlement
→ Course / Lesson / Practice / AI Daily / Stage Project 权限
→ 到期 / 续费 / 取消 / 退款
```

本任务是业务与架构审计，不接支付、不新增 Schema、不改变现有访问规则。

---

## 2. 当前已存在的会员产品事实

前台 `MembershipBenefits` 已固定展示：

```text
月卡  ¥39 / 月
年卡  ¥299 / 年
```

当前权益文案包括：

```text
基础 AI 课程
完整课程
基础 Practice
全部 Practice / 阶段实操
每日 AI 精选
完整 AI 日报
深度解读 / 课程关联
公众号重要更新通知
公众号课程 / 深度资料更新通知
飞书公开资料
飞书深度资料 / 扩展教程 / 附件
最新课程内容与新增资料
```

支付按钮当前明确 disabled，并显示“支付功能接入后启用订阅按钮”。

结论：**会员商品与权益文案已经存在，但目前仍是产品展示层，不是已经落地的订阅业务系统。**

---

## 3. 当前已经具备的权限基础

数据库已有 `entitlements`：

```text
user_id
type
resource_type
resource_id
source
granted_at
expires_at
revoked_at
```

已支持：

```text
COURSE_ACCESS
CHAPTER_ACCESS
LESSON_ACCESS
MEMBERSHIP
```

来源支持：

```text
REGISTRATION
OFFICIAL_ACCOUNT_FOLLOW
MEMBERSHIP
PROMOTION
ADMIN
```

`hasActiveEntitlement()` 已正确检查：

```text
revoked_at IS NULL
AND (expires_at IS NULL OR expires_at > now)
```

因此现有 Entitlement 模型可以继续作为**最终资源访问授权层**，不需要再建第二套“会员权限表”。

公众号关注解锁也已经真实使用 Entitlement：

```text
OFFICIAL_ACCOUNT_FOLLOW
→ CHAPTER_ACCESS
→ MODULE
```

并已有 grant / revoke。

结论：**Entitlement 基础方向正确，应保留。**

---

## 4. 关键发现：当前 MEMBERSHIP 实际没有解锁任何业务资源

虽然 Schema 已定义：

```text
type = MEMBERSHIP
source = MEMBERSHIP
```

但当前代码中没有任何：

```text
type: "MEMBERSHIP"
```

的实际授权写入或访问判断。

当前 `getLessonAccess()` 实际只检查：

```text
CHAPTER_ACCESS
```

并且该权限目前只对应公众号关注解锁的 Stage 1 指定 Module。

其它课程目前主要由“前置 Stage 是否完成”控制，而不是会员状态控制。

因此：

> **现在即使手工向用户写入一个 MEMBERSHIP Entitlement，也不会自动获得“完整课程 / 全部 Practice / 完整 AI 日报”等前台承诺的会员权益。**

这是本次审计最重要的业务缺口。

---

## 5. 当前没有 Subscription / Order / Payment 业务模型

当前 Schema 中没有正式：

```text
membership_plans
subscriptions
orders
payments
payment_events / webhook_events
refunds
```

也没有：

```text
plan_code
billing_period
amount
currency
provider
provider_order_id
provider_transaction_id
subscription_status
current_period_start
current_period_end
cancel_at_period_end
cancelled_at
refunded_at
```

所以当前系统无法正式表达：

```text
用户买的是月卡还是年卡
订单多少钱
是否支付成功
支付渠道是谁
续费周期到哪一天
是否取消自动续费
是否退款
支付回调是否重复
一次支付对应哪次权益授予
```

结论：**现在还没有“订阅付费系统”，只有会员商品 UI + Entitlement 基础设施。**

---

## 6. 当前会员权益文案与真实访问控制不一致

### 6.1 Course / Lesson

前台承诺：

```text
免费用户：完整课程 = 部分
会员：完整课程 = ✓
```

当前真实逻辑：

- Stage 1 前 3 个 Lesson PUBLIC；
- Stage 1 后续 Lesson 依赖公众号 `CHAPTER_ACCESS`；
- 其它 Stage 主要依赖前置 Stage 完成；
- 没有会员判断。

因此“会员解锁完整课程”目前**未实现**。

### 6.2 Practice / Stage Project

前台承诺：

```text
免费用户：基础 Practice ✓ / 全部 Practice 部分
会员：全部 Practice / 阶段实操 ✓
```

当前真实逻辑：

- Interactive Practice 权限跟随 Lesson Access；
- `/practice` 仍主要是公开静态展示；
- Stage Project 页面当前是公开静态内容；
- 没有会员 Access Policy。

因此“会员可访问全部 Practice / Stage Project”目前**未实现**。

### 6.3 AI Daily

前台承诺：

```text
免费用户：每日 AI 精选 ✓ / 完整 AI 日报 部分
会员：完整 AI 日报 ✓
```

当前 `/ai-daily` 没有会员权限边界，Published 内容读取没有 Free / Member 分层。

因此“完整 AI 日报会员专享”目前**未实现**。

### 6.4 深度资料 / 飞书 / 通知

这些权益目前只有产品文案，没有统一 Membership Access Policy，也没有 Subscription 状态驱动。

结论：**目前会员权益表是目标产品定义，不是当前系统真实权限矩阵。**

---

## 7. 当前 Entitlement 模型的一个重要风险

当前唯一索引：

```text
user_id + type + resource_type + resource_id
```

不包含 `source`。

这意味着同一个用户、同一种资源权限，只能有一条 Entitlement。

例如未来某资源同时可能由：

```text
OFFICIAL_ACCOUNT_FOLLOW
MEMBERSHIP
PROMOTION
ADMIN
```

多种来源授予时，如果继续沿用现在的 upsert 方式，后一次 grant 可能覆盖前一次的 `source / grantedAt / expiresAt`。

这样会产生典型问题：

```text
会员到期
↓
系统 revoke 该资源 Entitlement
↓
但用户原本仍因为公众号关注拥有同一资源
↓
错误失去权限
```

因此未来不要把 Membership 简单展开成一堆会与其它来源冲突的同 tuple Entitlement 后直接覆盖。

需要在 Membership 正式化前决定：

A. 一个资源允许多个 grant source；或
B. MEMBERSHIP 作为独立 global entitlement，由 Access Policy 组合判断；或
C. 引入 grant / entitlement assignment 层保存多来源。

当前更适合 MVP 的方向是 **B：保留 Membership 作为独立 global entitlement，Access Policy 统一组合判断。**

---

## 8. 推荐的正式业务分层

会员系统必须明确区分四层：

```text
Membership Plan
≠ Subscription
≠ Payment / Order
≠ Entitlement
```

推荐关系：

```text
MembershipPlan
  月卡 / 年卡
  ↓
Subscription
  用户当前订阅状态与周期
  ↓
Order / Payment
  每次真实付款事实
  ↓
Entitlement
  系统最终访问授权
```

其中：

- Plan 是“卖什么”；
- Subscription 是“用户现在订阅什么、到期时间”；
- Payment / Order 是“钱有没有真实支付”；
- Entitlement 是“现在允许访问什么”。

不要用 Entitlement 代替订单账务，也不要让 Payment API 直接散落判断 Course / Practice 权限。

---

## 9. 推荐 MVP Subscription / Entitlement Matrix

当前建议先固定以下产品规则，后续实现必须以一个统一 Policy 为准：

| 用户状态 | Course / Lesson | Practice | Stage Project | AI Daily | 历史进度 / Submission |
|---|---|---|---|---|---|
| 游客 | 公开内容 | 只看公开说明，不提交 | 只看公开说明或锁定 | 免费精选 | 无个人状态 |
| 注册免费用户 | 免费 Lesson | 基础 Practice | 部分 / 锁定 | 免费精选 / 部分日报 | 保留 |
| 公众号已关注 | 在免费基础上增加指定章节 | 跟随已解锁 Lesson | 不自动等于会员 | 同免费用户 | 保留 |
| OPC 会员 | 会员课程范围全部可访问 | 全部正式 Practice 可提交 | 全部正式 Stage Project 可提交 | 完整 AI Daily / 深度内容 | 保留 |
| 会员过期 | 回退到免费 + 其它独立 Entitlement | 新提交按当前权限限制 | 新提交按当前权限限制 | 回退免费层 | **历史进度和历史 Submission 永久保留** |

重要规则：

```text
会员过期 ≠ 删除学习记录
会员退款 / 到期 ≠ 删除 Submission / Evaluation
公众号权益与会员权益独立存在
```

---

## 10. Access Policy 必须统一

当前访问逻辑主要集中在 Course / Lesson，但即将进入 MVP-010 后会增加：

```text
LESSON_PRACTICE
STAGE_PROJECT
LATEST_PRACTICE
```

如果现在不统一 Membership Policy，很容易出现：

```text
if (isMember)
if (followedOfficialAccount)
if (courseUnlocked)
if (practiceAllowed)
```

散落在 Page / API / Component。

建议正式形成一个服务端 Policy 层，例如语义上：

```text
getMembershipStatus(userId)
resolveCourseAccess(...)
resolveLessonAccess(...)
resolvePracticeAccess(...)
resolveDailyAccess(...)
```

所有页面和 API 都只消费统一 Access Result。

前端按钮隐藏或显示只用于 UX，**不能作为权限边界**。

---

## 11. Payment 接入前必须具备的最小模型

真实支付不建议现在接，但在 PAYMENT-001 前至少需要：

### MembershipPlan

```text
id / code
name
billing_period = MONTH / YEAR
price_amount
currency
status
```

当前产品基线：

```text
opc_monthly = ¥39 / month
opc_yearly  = ¥299 / year
```

### Subscription

```text
id
user_id
plan_id
status
current_period_start
current_period_end
cancel_at_period_end
cancelled_at
created_at
updated_at
```

建议状态至少：

```text
PENDING
ACTIVE
PAST_DUE
CANCELLED
EXPIRED
REFUNDED
```

### Order / Payment

至少保存：

```text
id
user_id
subscription_id
plan_id
amount
currency
provider
provider_order_id
provider_transaction_id
status
paid_at
refunded_at
created_at
```

### Webhook Idempotency

支付 Provider 回调必须保存 provider event / transaction identity，保证重复回调不会重复延长会员或重复 grant。

---

## 12. 推荐的 Subscription → Entitlement 规则

MVP 不需要给每个 Lesson 写一条会员 Entitlement。

更简单稳定的方式：

```text
支付成功
↓
Subscription = ACTIVE
↓
Grant / refresh
MEMBERSHIP + resourceType=PRODUCT + resourceId=OPC_MEMBER
expiresAt = current_period_end
↓
统一 Access Policy 判断
```

访问 Course / Practice / Daily 时：

```text
Public / Free Rule
OR specific Entitlement（公众号 / Promotion / Admin）
OR active OPC Membership
```

这样会员到期只影响 Membership 本身，不会破坏公众号或其它独立授权来源。

---

## 13. 审计结论

### 可以继续保留

- `entitlements` 作为最终权限基础；
- `expiresAt / revokedAt` 机制；
- 公众号关注作为独立 CHAPTER_ACCESS；
- 前台月卡 ¥39 / 年卡 ¥299 产品定义；
- 免费用户与会员用户两层产品表达。

### 目前缺失，不能宣称已完成

- Membership Plan 正式模型；
- Subscription；
- Order / Payment；
- 支付 Provider / Webhook；
- Membership → Entitlement grant；
- Member Access Policy；
- Course / Practice / AI Daily 的真实会员分层；
- 到期 / 续费 / 取消 / 退款 Runtime。

### 必须在什么时候修

**不需要现在接真实支付。**

但 Membership Access Policy 与 Practice / Project 的会员归属规则，应该在 MVP-010 扩展访问逻辑之前固定，否则会产生二次返工。

---

## 14. Recommended next sequence

```text
BIZ-AUDIT-001                       COMPLETE
↓
BIZ-FOUNDATION-001
Membership Policy + 权益矩阵正式化
不接支付，只建立统一业务边界
↓
MVP-010
Practice / Project 正式化
所有 Practice Access 使用统一 Policy
↓
MEMBERSHIP-001
Plan / Subscription / Order 最小正式模型
↓
PAYMENT-001
真实微信支付 / Provider Adapter
↓
PAYMENT-RUNTIME
支付 → ACTIVE → Entitlement → 到期 / 续费 / 取消 / 退款
真实 Runtime 验证
```

## Final assessment

当前项目**没有走错方向**，因为 Entitlement 已经提前建立；但会员目前只是“商品 UI + 未来权限类型”，还没有形成完整订阅业务闭环。

现在最值得做的不是支付，而是一个很小的 `BIZ-FOUNDATION-001`：固定 Membership Policy、权益矩阵和统一 Access Resolver，然后继续 MVP-010。
