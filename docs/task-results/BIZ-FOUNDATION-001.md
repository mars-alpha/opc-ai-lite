# BIZ-FOUNDATION-001 — Membership Policy / Access Foundation

Status: COMPLETE

## Goal

在不接真实支付、不新增 Subscription / Order Schema 的前提下，把会员商品、会员权益和服务端 Membership Entitlement 固定成同一套 canonical policy，并让现有 Lesson Access 能识别 active OPC Membership。

## Implemented

### 1. Canonical Membership Policy

新增：

```text
lib/membership/policy.ts
```

统一定义：

```text
OPC Membership Product
resourceType = PRODUCT
resourceId   = OPC_MEMBER
entitlement  = MEMBERSHIP

opc_monthly = ¥39 / month
opc_yearly  = ¥299 / year
```

同时把首页会员权益矩阵集中到同一个 policy source，避免 UI 与服务端业务定义继续分叉。

### 2. Membership Status / Feature Resolver

新增：

```text
lib/server/membership/service.ts
```

提供：

```text
getMembershipStatus(userId)
resolveMembershipFeatureAccess(userId, feature)
```

当前 feature vocabulary：

```text
COURSE_CONTENT
PRACTICE
STAGE_PROJECT
AI_DAILY_FULL
DEEP_RESOURCE
```

它是后续 MVP-010 / AI Daily / 深度资料的统一入口基础，不在 Page / API 内散落 `isMember` 判断。

### 3. Existing Lesson Access now recognizes Membership

现有 `getLessonAccess / getLockedLessonIds / getLessonPageAccess` 已增加 active Membership 判断。

当前顺序仍保留学习路径前置条件：

```text
Stage prerequisite
→ Public free lesson
→ Active Membership OR specific Chapter Entitlement
→ Locked
```

因此 Membership 是商业访问授权，不绕过学习阶段顺序。

对于当前 Stage 1 已存在的公众号章节锁：

```text
公众号 CHAPTER_ACCESS
OR
active OPC Membership
```

任一满足即可访问。

这也避免把 Membership 展开成大量与公众号 source 冲突的同资源 Entitlement。

### 4. Membership UI consumes canonical policy

`components/MembershipBenefits.tsx` 不再自己硬编码价格与权益表，而是读取：

```text
OPC_MEMBERSHIP_PLANS
MEMBERSHIP_BENEFIT_MATRIX
```

当前 UI 仍保持支付按钮 disabled；本任务没有假装支付已经完成。

## Deliberately not implemented

本任务没有新增：

```text
membership_plans table
subscriptions
orders
payments
payment webhook
renewal
refund
```

也没有把所有 Course / Practice / AI Daily 强行改成 member-only。

原因：这些资源还缺正式的 access tier / membership requirement metadata。现在直接写死会把产品文案变成散落的条件分支，反而增加 MVP-010 返工。

## Policy fixed for next stages

### Access composition

```text
PUBLIC / FREE RULE
OR specific Entitlement (公众号 / Promotion / Admin)
OR active OPC Membership
```

### Membership expiry

```text
会员到期
→ Membership Access 失效
→ 回退到免费 + 其它独立 Entitlement
→ 不删除 Lesson Progress
→ 不删除 Practice Submission / Evaluation
```

### Stage prerequisite

```text
Membership ≠ 跳级
```

会员解锁商业内容范围，但仍遵守课程学习顺序。

## Validation

```text
npm run typecheck  PASS`r`nnpm run build      PASS`r`nNext.js pages       31
```

## Next

回到 `MVP-010-A1 — Practice Schema normalization`。

要求：新增 Practice Type / ownership 后，`resolvePracticeAccess()` 必须复用这里建立的 Membership Policy，而不是另写一套会员判断。

