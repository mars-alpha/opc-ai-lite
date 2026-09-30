# scripts — Current Executable Surface

本目录只保留 current 可重跑脚本。历史一次性 Track / Batch provisioning、acceptance、draft validator 已从 current tree 删除，通过 Git history 追溯。

## Repository / Course Governance

- `validate-repository-governance.ts`：检查 owner、学习文档白名单、legacy 清场和脚本表面。
- `validate-script-entrypoints.ts`：确保每个 current script 都有 package entrypoint，不存在历史 / Track 一次性脚本。
- `validate-course-current-state.ts`：验证 5 Tracks / 81 lessons / Catalog / Formal Registry / frozen 状态。
- `validate-course-build-entry.ts`：验证课程唯一入口与 current owners。
- `validate-course-governance.ts`：验证 Course Build Standard 的关键防漂移规则。
- `validate-course-production-workflow.ts`：验证 Stable Workflow / Rule Sources / Human Review Gate。
- `validate-course-builder.ts`：验证 Course Builder Core Contract。
- `validate-formal-lesson-runtime-registry.ts`：验证正式 LessonSpec Registry。

## Runtime / UX Acceptance

- `accept-unified-lesson-shell.ts`
- `accept-formal-check-types-runtime.ts`
- `accept-access-resume.ts`
- `validate-course-interaction-architecture.ts`
- `validate-course-sidebar-ux.ts`
- `validate-membership-benefit-policy.ts`
- `validate-practice-information-architecture.ts`

## Database Foundation

- `validate-database-target.ts`：检查当前 `DATABASE_ENVIRONMENT` / `DATABASE_URL` 是否指向允许的标准 PostgreSQL 目标；Supabase current migration 会被拒绝。
- `validate-database-target-contract.ts`：纯契约测试，固定 Dev/Prod 数据库名、Supabase block 与环境隔离。
- `migrate-database-safe.ts`：唯一 current migration 入口；Development 需要显式 confirm，Production 还需要 backup confirmation。

```bash
npm run db:target:contract:check
npm run db:target:check
npm run db:migrate -- --confirm=development
# Production only after Dev + Human Review Gate:
npm run db:migrate -- --confirm=production --backup-confirmed
```

## Content Workbench

- `validate-content-workbench-contract.ts`：纯契约验证，检查 Schema boundary、Review state machine 与 Publish Gate。
- `accept-content-workbench.ts`：静态/架构验收，检查 migration、API、UI authority、Knowledge derivation 与 public publication boundary。
- `accept-content-workbench-db.ts`：数据库迁移后执行的 rollback-only Acceptance；事务内创建完整关系后强制回滚，不保留测试数据。

运行顺序：

```bash
npm run content:workbench:contract:check
npm run content:workbench:accept
# 只有目标数据库已应用 0014 后：
npm run content:workbench:db:accept
```

## Operational Job

- `drain-learning-behavior-jobs.ts`

## Rule

如果脚本只用于一次 Track / Batch 生产，完成后不留在 current scripts；需要追溯时使用 Git。
