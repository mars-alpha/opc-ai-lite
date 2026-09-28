# TASKS.md

> 只保留 NOW / NEXT / BACKLOG 与必要的完成里程碑。当前事实以 `docs/CURRENT_SYSTEM_FACTS.md` / `PROJECT_STATUS.md` / current owner 为准；历史实现细节通过 Git 与 `docs/task-results/*` 追溯，不从本文件恢复旧 Gate。

# NOW — TRACK05-CURRICULUM-PLANNING

Status: **READY_TO_PLAN**

- Track 01～04 正式课程均已 AVAILABLE / FORMAL_RUNTIME。
- Track 04 T4-01～T4-15 已完成 Human Review、LessonSpec Registry、15 课 Runtime Provisioning 与 authenticated Runtime Acceptance。
- Track 04 正式实现已收敛为单一 `track04-runtime.ts` / `track04-specs.ts` current owner；旧 Batch Preview、批次 Runtime 入口和 legacy `ai-workflow` 测试数据已退出 current path。
- Course Production Workflow 已固化 `LESSON_TEMPLATE_DRIFT_FAIL` 与 `CROSS_LESSON_KNOWLEDGE_OVERLAP_FAIL`；共享 helper 只复用类型与装配，不承担 learner-facing 文案。
- 普通课程生产继续复用 Unified Lesson Shell，不新增 UI / CSS / Renderer / interaction type。

# NEXT

## TRACK05-CURRICULUM-001 — FDE Core Curriculum Planning

目标：
- 从真实业务问题出发定义 Track 05 能力链；
- 从 `DEFERRED_KNOWLEDGE_LEDGER_V1.md` 与 Five-Track Continuity 选择必要知识；
- 完成 Knowledge Map → Six-step Audit → Course Directory；
- 先确认目录，再进入 Formal Brief / Course Production Workflow。

验收：
- Primary Knowledge Home 一课一责；
- 与 Track 04 系统设计边界不重复；
- 目录通过六步可教学性审计；
- 不新增课程 UI / CSS。

# BACKLOG

- 真实 AI Provider Runtime（仅在业务功能确需 AI 时接入）
- AI Daily 自动采集 / AI 初筛 / 自动摘要
- Feishu API sync
- Obsidian export
- Subscription / Order / Payment / WeChat Pay
- 微信真实 OAuth / Official Account webhook
- RUNTIME-INFRA-PERF-003

# COMPLETED MILESTONES

- MVP Core / Content-Knowledge Pipeline：COMPLETE
- Formal Runtime + Access：COMPLETE
- Unified Lesson Shell v1：FROZEN / ACCEPTANCE_PASS
- Stable Course Production Workflow + Course Builder Skill v1：ACTIVE / GOVERNED
- Track 01 T1-01～T1-20：AVAILABLE / FORMAL_RUNTIME
- Track 02 T2-01～T2-15：AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
- Track 03 T3-01～T3-15：AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
- Track 04 T4-01～T4-15：AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
