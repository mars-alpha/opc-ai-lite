# TASKS.md

> 只保留 NOW / NEXT / BACKLOG 与必要的完成里程碑。当前事实以 `docs/CURRENT_SYSTEM_FACTS.md` / `PROJECT_STATUS.md` / current owner 为准；历史实现细节通过 Git 与 `docs/task-results/*` 追溯，不从本文件恢复旧 Gate。

# NOW — RELEASE-CURRENT-BASELINE

Status: **T5-01～T5-16 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS**

- Track 01～04 正式课程均已 AVAILABLE / FORMAL_RUNTIME。
- Track 04 T4-01～T4-15 已完成 Human Review、LessonSpec Registry、15 课 Runtime Provisioning 与 authenticated Runtime Acceptance。
- Track 04 正式实现已收敛为单一 `track04-runtime.ts` / `track04-specs.ts` current owner；旧 Batch Preview、批次 Runtime 入口和 legacy `ai-workflow` 测试数据已退出 current path。
- Course Production Workflow 已固化 `LESSON_TEMPLATE_DRIFT_FAIL` 与 `CROSS_LESSON_KNOWLEDGE_OVERLAP_FAIL`；共享 helper 只复用类型与装配，不承担 learner-facing 文案。
- 普通课程生产继续复用 Unified Lesson Shell，不新增 UI / CSS / Renderer / interaction type。

# NEXT

## DEPLOY-CURRENT-BASELINE-TO-OPCAI-FUN

- 学习路径 Track 01～05 课程基线已落实并冻结，近期不再调整课程结构与课程内容。
- 首页、AI 日报、进阶练习、公众号学习助手、会员权益等入口继续按 MVP 逐步开发。
- 当前版本完成验证、Git commit 后部署到 opcai.fun（源站 1.14.180.16）。

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
- Track 05 Directory Human Review：DIRECTORY_APPROVED_V1 / 15 PRIMARY KNOWLEDGE HOMES + 1 CAPSTONE
- Track 05 Production Batching：APPROVED_V1 / 6 BATCHES / PHASE-ALIGNED
- Track 05 Batch A Formal Brief：T5-01～T5-03 APPROVED_V1 / READY_FOR_COURSE_BUILDER
- Track 05 Batch A Course Builder：3 DRAFTS / DETERMINISTIC_VALIDATION_PASS / HUMAN_REVIEW_PASS
- Track 05 Batch A T5-01～T5-03：AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
- Track 05 Batches B–F Formal Brief：T5-04～T5-16 / 5 BRIEFS APPROVED_V1
- Track 05 T5-04～T5-16 Course Builder：13 DRAFTS / DETERMINISTIC_VALIDATION_PASS / HUMAN_REVIEW_PASS

- Track 05 T5-01～T5-16：AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS / 6 PHASE RUNTIME
