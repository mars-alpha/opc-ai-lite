# MVP-011-D — Knowledge Provenance Foundation

Status: COMPLETE_WITH_REMOTE_MIGRATION_PENDING

## Goal

用最小模型补齐 Reviewed Knowledge 的多 Content 来源追踪，同时保持现有 Content → Knowledge、Knowledge → Practice、Knowledge → Course Candidate 链路不被重建。

## Implemented model

保留：

```text
knowledge_items.sourceContentId
= Primary Source compatibility shortcut
```

新增：

```text
knowledge_source_links
- id
- knowledgeId
- contentId
- role: PRIMARY | SUPPORTING
- createdAt

UNIQUE(knowledgeId, contentId)
```

没有新增通用 `asset_relations`。Practice 与 Course Candidate 继续使用现有 `sourceKnowledgeId`。

## Migration

`drizzle/0007_pink_spirit.sql` 创建 provenance 表并 backfill：

```text
knowledge_items.source_content_id IS NOT NULL
→ knowledge_source_links(role = PRIMARY)
```

因此已有 Knowledge 不会在迁移后丢失 Primary Source 关系。

当前 `DATABASE_URL` 指向 REMOTE，本任务没有执行远程 migration。真实 Runtime / 部署前需按顺序执行并验证 0006、0007。

## Primary source synchronization

`createAdminKnowledgeItem()` / `updateAdminKnowledgeItem()` 会同步 Primary link：

```text
sourceContentId = X
→ X role = PRIMARY
→ 旧 PRIMARY 自动降为 SUPPORTING

sourceContentId = null
→ 当前 PRIMARY 降为 SUPPORTING
```

Primary 快捷字段仍是现有 Reader / 兼容逻辑的稳定入口。

## Supporting source workflow

新增 Admin API：

```text
GET  /api/admin/knowledge/items/:itemId/sources
POST /api/admin/knowledge/items/:itemId/sources
```

POST 只接受 Content ID，并创建 SUPPORTING link。重复 Knowledge + Content 返回已有关系，不重复插入；若该 Content 正是 sourceContentId，则保持 PRIMARY。

Admin Content → Knowledge 区域新增 `KnowledgeSourcesPanel`，可查看 PRIMARY / SUPPORTING 来源并补充 Supporting Content。

## Content routing compatibility

`getKnowledgeForContent()` 现在按：

```text
1. knowledge_items.sourceContentId
2. knowledge_source_links.contentId
```

查找 Knowledge。Supporting Content 再进入 Content → Knowledge 时会识别已有 Knowledge，避免误创建第二个 Knowledge。

## Boundaries

本阶段没有实现：

```text
Feishu Deep Resource model / API
Obsidian export
Skill model / runtime
Media Asset model
AI 自动选源 / 总结
Knowledge → Practice AI Draft
Knowledge → Course Impact AI
Membership / Payment
```

## Validation

```text
npm run db:generate  PASS
npm run typecheck    PASS
npm run build        PASS
```

Production build 已包含：

```text
/api/admin/knowledge/items/[itemId]/sources
```

## Next

下一步只讨论 / 审计：

```text
MVP-011-E — Deep Resource / Feishu Bridge
```

继续坚持最小关系模型，不建设通用 Asset Platform。
