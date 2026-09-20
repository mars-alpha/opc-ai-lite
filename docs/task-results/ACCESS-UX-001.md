# ACCESS-UX-001 — Locked Content Conversion UX

Status: COMPLETE

## Goal

在不修改 Access Core 的前提下，把“锁定即消失”改成“价值可发现、内容仍受控”，并区分公众号关注与 OPC Membership 两条转化路径。

固定产品规则：

```text
Restricted content should remain discoverable; access is gated, value is not hidden.
内容可以被锁，但价值不能被隐藏。
```

## Implemented

新增共享 `LockedAccessCta`，统一表达 FOLLOW / MEMBER 两类锁定原因和 CTA。

AI Daily：

```text
Top 3                    免费正常显示
第 4 条及之后            标题 / 摘要 / 分类 / 价值标签继续可见
完整内容                 锁定
Primary CTA              查看关注解锁方式
Secondary CTA            或加入 OPC 会员
```

会员内容：

```text
Knowledge / Latest Practice 摘要   公开
正文 / Deep Resource / 正式实操    MEMBER
进阶课程入口                       MEMBER
Locked CTA                         查看 OPC 会员方案
```

首页新增 `#official-account` 公众号权益说明区，会员区新增 `#membership` 锚点。课程 Follow 锁定页也复用同一 CTA。

真实微信关注验证仍未接入，因此 UI 明确说明“微信接入后自动核验”，没有提供假的“我已关注”按钮。支付仍未接入，会员方案按钮仍保持现有未支付状态。

## Access Boundary

本任务没有修改：

```text
resolveResourceAccess()
Membership / Entitlement 语义
Practice Access
数据库 Schema / Migration
API 的 Top3 Access Core
```

AI Daily 页面展示全部公开安全字段用于 discoverability；`/api/content/daily` 的非授权结果仍只返回 Top3。Content Reader 只读取 title / summary / category / relation 等公开字段，不读取 Knowledge body。

## Validation

```text
npm run typecheck                     PASS
npm run build                         PASS
Production build                      30 static pages generated
5-item in-memory locked card render   PASS
Locked card count = 2                 PASS
FOLLOW CTA                            PASS
MEMBER CTA                            PASS
Locked title/summary discoverability  PASS
Follow CTA triad render               PASS
```

## Out of Scope

未接入真实微信关注验证、公众号 QR / OAuth / Webhook、支付 / Subscription Order、AI Daily 自动采集、Feishu Sync、Skill。

## Next

```text
AI-DAILY-001 — 最小自动采集 → 审核 → 发布
```
