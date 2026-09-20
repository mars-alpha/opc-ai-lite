# RUNTIME-001 — Remote Migration 0006–0009 + End-to-End Runtime Verification

Status: COMPLETE

## Goal

不新增产品功能，只把已完成的 0006–0009 正式应用到远程 PostgreSQL，并通过真实 Next Admin API + Remote DB 验证 C2 / D / E / F 核心链路。

## Preflight

执行前确认：

```text
DATABASE_TARGET = REMOTE
Drizzle migration rows = 6
0006 source-aware Candidate schema = absent
0007 knowledge_source_links     = absent
0008 knowledge_deep_resources   = absent
0009 practice_drafts            = absent
```

因此远程数据库不存在部分手工应用或结构漂移，可以按 migration 顺序执行。

## Migration

执行：

```text
npm run db:migrate
```

结果：

```text
PASS
Drizzle migration rows: 6 → 10
0000 → 0009 applied
```

PostgreSQL 仅产生 schema/table already exists 与超长 constraint name 自动截断 NOTICE，没有 migration failure。

执行后结构验证：

```text
course_update_candidates.source_type  PRESENT
knowledge_source_links                PRESENT
knowledge_deep_resources              PRESENT
practice_drafts                       PRESENT
```

## Runtime Smoke

Smoke 使用临时管理员 session 和明确的 RUNTIME001 测试数据。核心业务动作通过当前 Next Admin API 执行，远程数据库用于 setup / verification / cleanup。

### Knowledge Provenance

```text
Content → Knowledge                  PASS
Primary Source auto link             PASS
Supporting Source create             PASS
Supporting Source duplicate          created=false
Knowledge + Content uniqueness       PASS
```

### Course Update Candidate

```text
Published Knowledge → Candidate      PASS
status = PENDING_REVIEW              PASS
same Knowledge + Lesson duplicate    created=false
```

### Feishu Deep Resource

```text
Published Knowledge → Deep Resource  PASS
duplicate Knowledge + URL            created=false
Deep Resource update                 PASS
```

### Practice Draft

当前环境仍未配置真实 AI Provider，因此验证的是正式 RULE fallback，而不是伪造 AI：

```text
generationMode  = RULE
generationError = AI_PROVIDER_NOT_CONFIGURED
```

审核链：

```text
Knowledge
→ Practice Draft
→ APPROVED
→ LATEST_PRACTICE
→ status = DRAFT
PASS
```

覆盖保护：

```text
Knowledge 已有 Latest Practice
→ approve Draft
→ 409 LATEST_PRACTICE_EXISTS
→ existing Practice unchanged
PASS
```

## Route Stability Check

Smoke 期间临时 dev 实例曾出现一次 Content → Knowledge 动态路由 404；同一路由此前已成功返回 201。

为避免把瞬时 dev 状态当作成功，另起干净 dev 实例做无写入复验：

```text
dynamic route unauthenticated probe
expected = 401

1 = 401
2 = 401
3 = 401
4 = 401
5 = 401

PASS
```

该 404 当前不可复现，不作为 Runtime blocker。

## Cleanup

所有 RUNTIME001 测试业务数据与临时 session 已删除。

```text
content    0
knowledge  0
practice   0
draft      0
deep       0
candidate  0
```

Cleanup PASS。

## Final Validation

```text
npm run typecheck            PASS
npm run build                PASS
Production build             31 pages/routes
Remote migration rows        10
Remote schema 0006–0009      VERIFIED
Runtime smoke                PASS
Route stability              PASS
Test data cleanup            PASS
```

临时 dev server 在 smoke 完成后被主动停止；Runner 将主动停止的长期 dev process 记录为 cancelled/exit -1，这是测试服务关闭行为，不是应用 Runtime failure。

## Result

C2 / D / E / F 不再处于 remote migration pending。

当前剩余外部限制主要是：

```text
真实 AI Provider 未配置
新 Access Policy 尚未统一接入用户端
AI Daily 自动采集 / 初筛 / 摘要未实现
```

## Next

```text
ACCESS-001 — AI Daily / Knowledge / Practice Access Policy
```

继续遵守：

```text
系统可运行
→ 真实 Runtime
→ 用户 Access 正确
→ 真实 MVP 可验收
→ 再增加功能
```
