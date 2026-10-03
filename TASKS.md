# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；开发方法见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`；历史通过 Git 追溯。

# NOW — CONTENT FOUNDATION

- Development `opc_ai_dev` 与 Production `opc_ai_prod` 均已迁到轻量服务器本机 PostgreSQL；Development 通过 SSH tunnel 访问，TencentDB 已退出 current runtime。
- 内容采集历史 E2E / acceptance / 演示数据已清场，Development 与 Production 的 `content_*` 表从空基线重新开始。
- Learning Insight、课程维护、用户与权益的正式数据边界保持不变；历史测试过程不再进入 current facts。
- 当前开发只从“采集策略 → 今日情报 → 内容工作台”的真实运营数据继续，不恢复旧模拟数据。

# NEXT

1. 用真实采集策略产生第一批正式 Source / Raw Item / Event，人工检查“今日情报”与内容工作台链路。
2. 完成腾讯云 TencentDB 停止/销毁并确认不再产生按量费用；保留本机 PostgreSQL 自动备份与迁移前核验记录。

# BACKLOG

- AI Registry / Models / Connectors 管理界面；
- System 运行状态 / 审计 / 管理员权限 / Feature Flag；
- 公众号真实 Follow Entitlement；
- Unified Identity；
- Order / WeChat Pay；
- Mobile Web、微信小程序、抖音小程序；
- 独立 Worker / pgvector / Redis / Queue（达到真实需求阈值后）；
- 独立工作台子域 / 独立部署（出现独立发布、团队或扩缩容需求后）。
