# TencentDB PostgreSQL — OPC AI 数据库操作手册

本文件是操作 Runbook，不是产品事实 owner。数据库长期边界见 `docs/domains/DATA.md`，当前状态见 `docs/CURRENT_SYSTEM_FACTS.md`。

## 1. 目标

正式项目数据库使用标准 PostgreSQL，优先 TencentDB for PostgreSQL。

第一阶段建议：

```text
TencentDB PostgreSQL
├─ opc_ai_dev
└─ opc_ai_prod
```

两个数据库使用不同账号。Production 账号绝不放进本地开发环境。

## 2. 云端创建原则

1. 与当前 Web/API 服务器选择同地域，优先当前生产服务器所在广州地域；
2. 选择 PostgreSQL；
3. 初期使用满足 MVP 的最小稳定规格，不提前为 AI/视频任务扩容数据库；
4. 开启自动备份；
5. Production 连接优先 VPC 内网；
6. 如 Dev 需要公网连接，只给 Dev 数据库账号开放最小 IP 白名单；
7. 不给本地环境 Production 数据库凭据。

## 3. 数据库与账号

建议逻辑数据库：

```text
opc_ai_dev
opc_ai_prod
```

建议账号：

```text
opc_ai_dev_app
opc_ai_prod_app
```

账号权限只覆盖对应数据库。

## 4. 环境配置

本地开发：

```text
DATABASE_ENVIRONMENT=development
DATABASE_URL=postgresql://<dev-user>:<password>@<host>:<port>/opc_ai_dev?sslmode=require
```

生产服务器：

```text
DATABASE_ENVIRONMENT=production
DATABASE_URL=postgresql://<prod-user>:<password>@<private-host>:<port>/opc_ai_prod
```

仓库模板位于 `config/examples/`；真实密码永远不提交 Git。

## 5. 切换前检查

```bash
npm run db:target:check
npm run typecheck
npm run governance:repository:check
```

如果检测到 Supabase hostname，current migration 必须停止。

## 6. Development 首次初始化

创建空的 `opc_ai_dev` 后：

```bash
npm run db:migrate -- --confirm=development
npm run content:workbench:db:accept
```

`content:workbench:db:accept` 使用事务强制回滚，不保留 Acceptance 测试数据。

## 7. Production 初始化

只有 Dev Migration + Acceptance + Manual Acceptance 全部 PASS 后才允许 Production：

```bash
npm run db:target:check
npm run db:migrate -- --confirm=production --backup-confirmed
```

执行前确认：
- 已有可恢复备份；
- `DATABASE_ENVIRONMENT=production`；
- DB name = `opc_ai_prod`；
- 当前 migration 已经过 Dev 验证；
- Production 凭据只存在服务器 Secret / env。

## 8. 回滚原则

当前 Drizzle migration 以向前修复为主，不依赖自动 destructive rollback。

Production 出现异常时：
1. 停止新的 migration / publish；
2. 保留错误日志但不得记录 Secret；
3. 优先从 TencentDB 自动/手工备份恢复；
4. 在 Dev 重现并创建新的 forward-fix migration；
5. 不在 Production 手工临时改 Schema 后再补文件。

## 9. Supabase 退出

旧 Supabase：
- 只用于历史测试数据查询/迁移参考；
- 不再执行新 migration；
- 不作为 Production fallback；
- 新 TencentDB Acceptance 完成后再决定是否删除旧测试项目；
- 删除前确认没有唯一数据仍只存在 Supabase。

## 10. Visual Gate

Content Workbench 数据库就绪并可真实使用后，必须先把 `/admin/content` 提供给产品负责人体验。

只有得到明确确认后：
- Content Workbench UI 才能标记 `USER_APPROVED`；
- 才能进入依赖该工作台界面的下一阶段。