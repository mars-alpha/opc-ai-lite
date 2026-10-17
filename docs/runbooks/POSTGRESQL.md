# PostgreSQL — OPC AI 当前数据库操作手册

本文件是操作 Runbook，不是产品事实 owner。数据库长期边界见 `docs/domains/DATA.md`，当前状态见 `docs/CURRENT_SYSTEM_FACTS.md`。

## 1. 目标

正式项目数据库边界是标准 PostgreSQL + Drizzle。当前部署：

```text
Development  Local PostgreSQL 14 / opc_ai_dev / SSH tunnel 127.0.0.1:15432
Production   Local PostgreSQL 14 / opc_ai_prod / 127.0.0.1:5432
```

两个环境使用不同数据库和账号。Production 凭据不进入本地开发环境。

## 2. 当前运行原则

1. Production PostgreSQL 只监听 `127.0.0.1`，不开放公网；
2. 2C2G 阶段控制连接数与内存，不在服务器执行重型 AI / 媒体计算；
3. Development / Production 每天 03:30 自动备份，保留 7 天；
4. Development 通过 SSH tunnel 访问同机 PostgreSQL 的 `opc_ai_dev`；
5. 数据库保持标准 PostgreSQL，可随负载增长迁回托管服务。

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
DATABASE_URL=postgresql://opc_ai_dev_app@127.0.0.1:15432/opc_ai_dev
DATABASE_MIGRATION_URL=postgresql://opcai@127.0.0.1:15432/opc_ai_dev
```

生产服务器：

```text
DATABASE_ENVIRONMENT=production
DATABASE_URL=postgresql://<prod-user>@127.0.0.1:5432/opc_ai_prod
```

仓库模板位于 `config/examples/`；真实密码永远不提交 Git。

## 5. 切换前检查

```bash
npm run db:target:check
npm run typecheck
npm run governance:repository:check
```

如果检测到 Supabase hostname，current migration 必须停止。

### 本机开发隧道

当前SSH登录用户为`ubuntu`，已有本机默认SSH密钥可用；不需要在聊天或仓库中传递私钥。若15432未监听，使用已知服务器地址运行：

```powershell
ssh -N -o BatchMode=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -L 127.0.0.1:15432:127.0.0.1:5432 ubuntu@<server-host>
```

保持该会话运行，仅监听本机回环地址。数据库仍由DATABASE_ENVIRONMENT与数据库名校验，不能把隧道连通当作生产写入授权。

## 6. Migration

只有 Dev Migration + Acceptance PASS 后才允许 Production：

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

### 只读发布前核对

使用运行连接执行`npm run content:collection:deployment:preflight`检查业务表/列、读写权限、管理员身份和非superuser边界。此命令只读，不执行迁移，不代表采集或模型质量验收。

追加`-- --migration-plan`时，现有脚本仍使用运行连接读取Drizzle历史；若返回`MIGRATION_HISTORY_NOT_READABLE`，保留此阻断结果，不为通过检查给运行账号加权。由专用维护连接在`READ ONLY`事务中核对`current_database()`、历史hash/顺序及本地journal前缀，不能把维护凭据写进运行环境或输出。`PLAN_ONLY`且blockers/pending均空只表示当前无需DDL；正式迁移仍执行本节既有备份及确认流程。

## 7. 回滚原则

当前 Drizzle migration 以向前修复为主，不依赖自动 destructive rollback。

Production 出现异常时：
1. 停止新的 migration / publish；
2. 保留错误日志但不得记录 Secret；
3. Production 优先从 `/var/backups/opc-ai-db` 的最近备份恢复；
4. 在 Dev 重现并创建新的 forward-fix migration；
5. 不在 Production 手工临时改 Schema 后再补文件。

## 8. Visual Gate

Content Workbench 数据库就绪并可真实使用后，必须先把 `/admin/content` 提供给产品负责人体验。

只有得到明确确认后：
- Content Workbench UI 才能标记 `USER_APPROVED`；
- 才能进入依赖该工作台界面的下一阶段。
