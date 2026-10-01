# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；开发方法见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`；历史通过 Git 追溯。

# NOW — COURSE MAINTENANCE

- `/admin/courses` 以 Track Catalog + Formal LessonSpec Registry 作为 81 节正式课程身份源，并以 Development DB 持久化课程更新 Candidate 与正式版本历史。
- 当前更新链已完成并通过 Human Review：`DRAFT → REVIEW → 审核通过并上线 → PUBLISHED`；没有重复 `APPROVED / 确认上线` 步骤。
- Candidate 支持刷新恢复、差异对比、最近 6 个正式版本、上一版本对照、恢复历史版本；编辑动作固定为“对比当前 / 保存草稿 / 退出修改 / 提交审核”，其中“退出修改”结束当前 Candidate 且不影响正式课程；发布失败不替换当前正式版本。
- 发布后课程正文、课程目录 · 导航卡片（标题 / 副标题）和最近更新时间自动读取最新正式版本；课程目录结构与六步 Runtime 保持冻结。
- 旧 DB 课程树编辑器、直接 Lesson JSON GET/PUT 链已退出 current path；Course Builder Workflow 未接入、未修改；新增/删减课程未实现。

# NEXT

1. 学习洞察：只聚合真实学习问题、质量风险与课程更新建议；是否发起课程更新仍由 Human 决定。
2. 管理后台当前五个页面完成事实复核后，再进入个人 AI 工作台 Product Spec。

# BACKLOG

- AI Registry / Models / Connectors 管理界面；
- System 运行状态 / 审计 / 管理员权限 / Feature Flag；
- 公众号真实 Follow Entitlement；
- Unified Identity；
- Order / WeChat Pay；
- Mobile Web、微信小程序、抖音小程序；
- 独立 Worker / pgvector / Redis / Queue（达到真实需求阈值后）；
- 独立工作台子域 / 独立部署（出现独立发布、团队或扩缩容需求后）。
