# ACCESS-001 — AI Daily / Knowledge / Practice Access Policy

Status: COMPLETE

## Goal

把已批准的用户访问规则落到 Deterministic Core，不引入 Skill，不增加 Schema / Migration：

```text
AI Daily Top3                  FREE
AI Daily 全部                  Official Account Follow OR OPC_MEMBER
Knowledge 正文                 MEMBER
Feishu Deep Resource           MEMBER
Latest Practice 卡片           PUBLIC VISIBLE
Latest Practice 详情 / 正式实操 MEMBER
由进阶内容进入的正式课程入口     MEMBER
```

公众号关注不等价于 Membership。

## Implementation

新增统一资源级 Resolver：

```text
lib/server/access/service.ts
```

Contract：

```text
Resource + User
↓
Membership / Entitlement
↓
resolveResourceAccess()
↓
ALLOW / PREVIEW / DENY
```

支持 AI_DAILY_FULL / KNOWLEDGE_BODY / DEEP_RESOURCE / LATEST_PRACTICE_DETAIL / ADVANCED_COURSE_ENTRY。

AI Daily 页面与 /api/content/daily 同时做服务端门禁；匿名 / 普通用户只获得前 3 条，公众号关注权益或会员获得全部。

Latest Practice 卡片保持公开，但卡片不再直接跳进课程；详情页统一经过会员 Access。正式 LATEST_PRACTICE Runtime 无论历史 access_tier 是否为 FREE，都按当前产品政策要求 Membership。

Published Deep Resource 的用户侧读取会先检查 MEMBER Access；非会员不返回 Feishu URL。

进阶内容到正式课程的入口仅对会员显示。普通 Learning Path / Course 原有访问规则没有被全局替换。

## Public / Member Data Boundary

Runtime smoke 首轮发现：即使 JSX 不渲染正文，Next RSC payload 仍可能序列化服务端查询到的完整 Knowledge row。

因此修正为数据层隔离：

```text
Public Reader
→ 只 SELECT card / preview safe fields
→ 不读取 body / practiceId / courseSlug / lessonSlug

Membership ALLOW
→ Member Detail Reader
→ 才读取 body / Deep Resource / Practice / Course relation
```

最终匿名 / 普通用户 / 公众号关注用户的 HTML / RSC payload 均不含会员 Knowledge body 或 Feishu URL。

## Runtime Acceptance

```text
ANON   AI Daily → 3 items / PREVIEW                         PASS
FREE   AI Daily → 3 items / PREVIEW                         PASS
FOLLOW AI Daily → full / OFFICIAL_ACCOUNT_FOLLOW            PASS
MEMBER AI Daily → full / MEMBERSHIP                         PASS

ANON   Latest Practice → MEMBER_REQUIRED / content=null      PASS
FREE   Latest Practice → MEMBER_REQUIRED / content=null      PASS
FOLLOW Latest Practice → MEMBER_REQUIRED / content=null      PASS
MEMBER Latest Practice → allowed                             PASS

ANON   Knowledge body / Deep Resource / Course entry absent  PASS
FREE   Knowledge body / Deep Resource / Course entry absent  PASS
FOLLOW Knowledge body / Deep Resource / Course entry absent  PASS
MEMBER Knowledge body / Deep Resource / Course entry present PASS
```

测试中特意使用 LATEST_PRACTICE access_tier=FREE，确认当前统一政策仍强制正式 Latest Practice 会员化。

## Validation

```text
npm run typecheck       PASS
npm run build           PASS
Production build        30 static pages generated
ACCESS001 Runtime smoke PASS
Test data cleanup       PASS
```

3012 临时 dev server 在验收完成后主动停止；Runner 的 cancelled / exit -1 是主动关闭测试服务，不是应用失败。

所有 ACCESS001_* 测试资源、测试用户、Session、Entitlement 已清理为 0。

## Out of Scope

Payment / Subscription Order、WeChat OAuth / Official Account webhook、AI Daily automatic collection、Feishu API sync、Obsidian、Skill / Media 均未实现。

## Next

```text
AI-DAILY-001 — 最小自动采集 → 审核 → 发布
```
