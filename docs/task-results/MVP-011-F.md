# MVP-011-F — Knowledge → Practice AI Draft Workflow

Status: COMPLETE_WITH_REMOTE_MIGRATION_AND_AI_RUNTIME_PENDING

## Goal

把 Reviewed Knowledge / Published Deep Resource 转成可人工审核的 Practice Draft，并在人工批准后进入现有正式 LATEST_PRACTICE；AI/规则生成器不能直接发布或覆盖正式 Practice。

## Audit decision

正式 `practices` 已足够承接最终产物，因此不建立第二套 Practice Runtime。新增的 `practice_drafts` 只是审核前候选层。

## Data model

```text
practice_drafts
- id
- sourceKnowledgeId required
- sourceDeepResourceId nullable
- generationMode = RULE | AI
- generationError nullable
- draft JSONB
- status = PENDING_REVIEW | NEEDS_REVISION | APPROVED | DISMISSED
- reviewNote / reviewedBy / reviewedAt
- resultPracticeId nullable
- createdAt / updatedAt

UNIQUE(sourceKnowledgeId)
```

每个 Knowledge 最多保留一个当前 Draft，可重新生成/修改直到进入 APPROVED 或 DISMISSED 终态。

## Skill v0.1

首次真实 Skill 已落盘并实际调用：

```text
skills/practice-draft/v0.1.ts
id = practice-draft
version = 0.1.0
```

Skill 固定结构化输出：title / goal / instructions / hints / rubric / submissionSchema / passScore / accessTier；不包含 publication status，也没有正式发布权限。

## Generation behavior

生成要求：Published 且未 OUTDATED / DEPRECATED 的 Knowledge。可选 Deep Resource 必须属于该 Knowledge 且为 PUBLISHED。

AI Provider 复用现有 OpenAI-compatible 配置：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

本环境检测结果：

```text
AI_PROVIDER_CONFIGURED=NO
```

因此当前已验证路径是：

```text
Knowledge
→ Practice Draft Skill v0.1 rules/template
→ generationMode = RULE
→ generationError = AI_PROVIDER_NOT_CONFIGURED
→ PENDING_REVIEW
```

Provider 已配置时才会调用真实模型并标记 generationMode=AI。Provider 调用失败同样回退 RULE，并记录真实错误，不冒充 AI 输出。

## Human review

Admin 可人工修改 Draft JSON，并执行：

```text
APPROVED
NEEDS_REVISION
DISMISSED
```

APPROVED 的唯一自动结果：

```text
create LATEST_PRACTICE
status = DRAFT
```

不会直接 PUBLISHED。若 Knowledge 已有正式 Latest Practice，返回 LATEST_PRACTICE_EXISTS，拒绝覆盖。

## Admin API

```text
GET  /api/admin/knowledge/items/:itemId/practice-draft
POST /api/admin/knowledge/items/:itemId/practice-draft
PUT  /api/admin/knowledge/items/:itemId/practice-draft
POST /api/admin/knowledge/items/:itemId/practice-draft/review
```

全部要求 Session + Admin。

## Migration

`drizzle/0009_chief_marvex.sql` 只新增 `practice_drafts` 与 FK / unique index。

当前 DATABASE_TARGET=REMOTE，因此未执行 migration。真实 Runtime / 部署前需依次验证 0006-0009。

## Explicitly out of scope

```text
真实 Feishu 内容抓取
AI 直接发布 Practice
AI 覆盖已有正式 Practice
Obsidian
通用 Skill Platform
Media Asset
Membership / Payment
```

## Validation

```text
npm run db:generate  PASS
npm run typecheck    PASS
npm run build        PASS
```

早期一次 typecheck 因 KnowledgeRoutingPanel 局部覆盖导致 JSX 截断；已从 HEAD 恢复完整文件并仅做最小集成，后续 typecheck/build 均通过。

## Next

```text
MVP-011-G — Knowledge → Course Impact Analysis
```

继续保持 AI 只形成 Course Update Candidate，不直接修改 Published Course。
