# MVP-011-E — Deep Resource / Feishu Bridge

Status: COMPLETE_WITH_REMOTE_MIGRATION_PENDING

## Goal

在不建设通用 Asset Platform、不接真实 Feishu 自动化的前提下，为 Reviewed Knowledge 建立正式的 Feishu Deep Resource 引用桥接。

## Audit decision

没有复用 `lesson_resources`。原因：`lesson_resources.lessonId` 为必填，语义是 Lesson-owned 附件；Deep Resource 的 owner 应是 Knowledge，Lesson / Practice 只能是可选关联。

## Data model

新增 `knowledge_deep_resources`：

```text
id
knowledgeId required
lessonId nullable
practiceId nullable
provider = FEISHU
title
summary nullable
resourceRef nullable
url
status = DRAFT | REVIEW | PUBLISHED | ARCHIVED
createdAt
updatedAt

UNIQUE(knowledgeId, url)
```

Knowledge 仍是 Production Source of Truth；Feishu 只保存为外部深度研究 / 实践载体引用。

## Publication guard

Deep Resource 可以在 Knowledge 未发布时先保存 DRAFT / REVIEW，但：

```text
Deep Resource.status = PUBLISHED
→ requires Knowledge.status = PUBLISHED
```

服务端强制该规则，UI 只做提示，不承担唯一校验。

可选 Lesson / Practice ID 在保存前会验证真实存在；不存在 fail closed。

## Admin API

新增：

```text
GET  /api/admin/knowledge/items/:itemId/deep-resources
POST /api/admin/knowledge/items/:itemId/deep-resources
PUT  /api/admin/knowledge/items/:itemId/deep-resources/:resourceId
```

全部要求 Session + Admin。POST 对同 Knowledge + URL 幂等，重复 URL 返回已有记录；PUT 禁止撞到同 Knowledge 下其它资源 URL。

## Admin UI

`KnowledgeRoutingPanel` 新增 `KnowledgeDeepResourcesPanel`：

- 查看当前 Knowledge 的 Deep Resource；
- 新建 FEISHU 引用；
- 编辑已有引用；
- 可选填 Lesson / Practice ID；
- 未发布 Knowledge 时提示不能发布 Deep Resource。

## Migration

`drizzle/0008_overrated_triton.sql` 只新增 `knowledge_deep_resources` 和相关 FK / unique index，没有修改 `lesson_resources`。

当前 `DATABASE_URL` 检测为 REMOTE，因此没有执行 `db:migrate`。真实 Runtime / 部署前需依次验证 0006、0007、0008。

## Explicitly out of scope

```text
Feishu API 自动创建文档
Feishu OAuth
Feishu Bot
双向同步 / Webhook
用户侧 Deep Resource Reader
DEEP_RESOURCE Membership Access consumer
Knowledge → Practice AI Draft
Obsidian
Skill
Media Asset
Payment
```

## Validation

```text
npm run db:generate  PASS
npm run typecheck    PASS
npm run build        PASS
```

Production build 已包含两个 Deep Resource Admin API 路由。

## Next

下一步只讨论 / 审计：

```text
MVP-011-F — Knowledge → Practice AI Draft Workflow
```

AI 只能产生可人工审核的 Practice Draft，不允许直接发布正式 Practice。
