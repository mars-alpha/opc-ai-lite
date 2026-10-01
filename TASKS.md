# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；开发方法见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`；历史通过 Git 追溯。

# NOW — ADMIN-CONTENT-COLLECTION-REVIEW

- 完成 `/admin/content` 视觉审核：采集策略 / 今日情报 / 内容工作台。
- 保持运营总览、用户与权益、课程 Runtime 已确认界面冻结。
- 当前功能链、Development migration `0000`～`0025`、Auth Session 查询均已复核；Auth 报错根因是本地 TencentDB SSH 隧道中断，不新增认证补丁。
- Visual Human Review 未明确通过前，不提交本轮混杂 Git 变更。

# NEXT

1. Git Diff 审计：确认当前工作区变更均有明确归属，删除无引用旧 UI / Skill / Validator 描述。
2. 课程维护：解决后台 DB 课程树与当前 81 节正式课程事实源不一致的问题，不修改冻结课程内容与六步 Shell。
3. 学习洞察：继续只聚合真实学习问题、质量风险与课程更新候选；Human 决定是否创建课程更新任务。
4. 管理后台基线确认后，再进入个人 AI 工作台 Product Spec。

# BACKLOG

- AI Registry / Models / Connectors 管理界面；
- System 运行状态 / 审计 / 管理员权限 / Feature Flag；
- 公众号真实 Follow Entitlement；
- Unified Identity；
- Order / WeChat Pay；
- Mobile Web、微信小程序、抖音小程序；
- 独立 Worker / pgvector / Redis / Queue（达到真实需求阈值后）；
- 独立工作台子域 / 独立部署（出现独立发布、团队或扩缩容需求后）。
