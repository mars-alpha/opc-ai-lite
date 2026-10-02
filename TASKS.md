# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；开发方法见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`；历史通过 Git 追溯。

# NOW — LEARNING INSIGHT AI UPDATE COMPARE REVIEW

- Phase 1 已 `USER_APPROVED / PASS`，不再调整已确认的课程队列 / 01 问题汇总 / 02 真实数据 / 03 Human Gate 1。
- Task A 已实现：Human Gate 1 授权后，Code 组装完整课程 Snapshot、累计 Issue、时间线、确定性学习指标、Evidence Catalog、81 门 Curriculum Catalog 与相邻课程摘要，一次性交给 AI 做 Whole-course Diagnosis。
- Task A 输出固定为 `learning_issue_diagnosis_v2`，只允许诊断、列课程、指出关注 Step / 区域；不得返回 Patch，不得创建 Course Candidate，不得写 Course Maintenance DRAFT。
- AI Run 统一复用 `lib/server/ai/configured-chat.ts` 与 `ai_runs`，不新增模型配置系统、不新增 Task A 数据表。
- Deterministic Validator 已覆盖 Schema、enum、evidence_ref、course_id、Step 1～6、禁止 Patch 内容与 Human Gate 1 前置条件。
- Development DB mock acceptance 已通过：Gate1 前阻断、81 课程目录 + 完整 6 Step 输入、ai_runs 审计、业务状态不变、无 Candidate、current diagnosis 可读取、测试数据自动清理。
- Effective Evidence Set 已成为正式 Task A 唯一证据入口。PRODUCTION mode 排除 Acceptance / Human Review / Simulation / Demo / Test，真实 learner 必须 ACTIVE / USER 且存在 identity；反馈、Check、Practice、Hint、Helpfulness 按确定性样本/阈值治理，事件只允许指定 Allowlist。上一轮 Human Review 验收 Issue 与 AI Run 已清理。

# NEXT

1. Visual Human Review：审核模拟课程《提示词（Prompt）：把任务说清楚》的 02 学习反馈 / 学习行为视觉、04 整课诊断与“更新对照”弹窗。
2. 重点验收左右对照是否与正式学员 Runtime 一致、左右 Step 是否同步、AI 改动标注是否清晰、人工编辑后右侧是否实时更新；模拟课程发布按钮必须保持禁用。
3. 验收真实“人工修正”入口：非模拟课程点击后通过显式 course + intent URL 直接打开目标课程已有 DRAFT/REVIEW，或创建 DRAFT 并进入 EDIT，不停在课程详情页。
4. Visual Review 通过后清理/保留审核数据按 Human 指令执行，再做全项目回归、staged diff 审计与提交。
5. 后续真实学习数据达到阈值后，再做首个 Production AI Update 端到端发布验收。

# BACKLOG

- AI Registry / Models / Connectors 管理界面；
- System 运行状态 / 审计 / 管理员权限 / Feature Flag；
- 公众号真实 Follow Entitlement；
- Unified Identity；
- Order / WeChat Pay；
- Mobile Web、微信小程序、抖音小程序；
- 独立 Worker / pgvector / Redis / Queue（达到真实需求阈值后）；
- 独立工作台子域 / 独立部署（出现独立发布、团队或扩缩容需求后）。
