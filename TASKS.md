# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；开发方法见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`；历史通过 Git 追溯。

# NOW — LEARNING INSIGHT WORKBENCH V2.1 REGRESSION

- Phase 1 界面已经产品负责人确认，当前不再调整 UI 方案；本轮只做全项目回归、错误修正、旧事实清场、冗余文件治理和最终 Git Diff 审计。
- Product Surface：`/admin/learning`。当前结构固定为 Course First：左侧课程队列；右侧课程概况 → 01 静态问题汇总 → 02 课程级真实数据 → 03 Human Gate 1。
- 左侧只保留“搜索课程 + 风险筛选”；风险筛选为全部风险 / 需要检查 / 关注 / 正常。默认排序由确定性 Core 固定执行：红 > 黄 > 绿；同色只按最老未处理时间。
- 01 问题汇总只做课程级统计，不可点击；02 固定读取课程级 `learningFeedback` 与学习行为，不受单 Issue 选择影响。
- 当前风险区间实现为红 `>=10`、黄 `5～9`、绿 `0～4`。Learning Insight 不使用 AI 参与阈值、排序、状态或发布。
- 当前 Phase 1 只允许 Human Gate 1；AI Task A / Task B、Human Gate 2 / 3、自动提交审核、自动发布、Course Builder Workflow 均不在本轮范围。
- 本轮 Acceptance 已完成：Learning Insight 四份 Contract、Phase 1 / Evidence / Bridge / Formal Identity / Course Registry Validators、Development Governance、Repository Governance、current scripts、Typecheck、Production Build、Development DB acceptances 均通过；Visual Review 模拟数据已清零。当前只剩最终 Git Diff / Hygiene 收口。

# NEXT

1. Phase 1 已 `USER_APPROVED / PASS`；下一开发阶段从 AI Task A 开始。
2. 实现 AI Task A：完整课程 + 当前累计问题 + 时间事实 + 可用行为数据 + 相邻课程上下文 → Whole-course Diagnosis；Human Gate 1 前仍不得调用 AI。
3. Task A 通过后实现 Human Gate 2 + Task B Course Change Proposal + Before / After Course Preview。
4. Human Gate 3 后仅把确认 Proposal 写入现有 Course Maintenance DRAFT；不自动 submit review，不直接 publish。

# BACKLOG

- AI Registry / Models / Connectors 管理界面；
- System 运行状态 / 审计 / 管理员权限 / Feature Flag；
- 公众号真实 Follow Entitlement；
- Unified Identity；
- Order / WeChat Pay；
- Mobile Web、微信小程序、抖音小程序；
- 独立 Worker / pgvector / Redis / Queue（达到真实需求阈值后）；
- 独立工作台子域 / 独立部署（出现独立发布、团队或扩缩容需求后）。
