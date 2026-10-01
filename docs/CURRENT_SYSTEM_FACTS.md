# CURRENT_SYSTEM_FACTS.md — OPC AI 当前系统事实

> 本文件只记录“现在真实存在什么”。历史过程只通过 Git 追溯；未来计划只放 TASKS / DEVELOPMENT_ROADMAP。

## 1. 当前产品阶段

- 正式学习路径已完成并冻结：Track 01～05 共 81 节正式课程。
- 当前课程目录、六步课程壳层、正式 Runtime 与学习路径展示均作为已确认基线。
- 当前开发重点转向统一内容后台、AI 日报、进阶练习、移动端以及后续多端接入。
- 正式域名：`https://opcai.fun`。
- 当前生产服务器：`1.14.180.16`。
- 生产链路：Nginx → PM2 `opc-ai` → Next.js:3000。
- HTTP 已跳转 HTTPS；Let’s Encrypt 自动续期已配置。
- 当前生产应用代码基线：`0b5f0b0`；部署事实治理提交：`4a8155d`。

## 2. 技术基线

```text
Frontend / Web        Next.js 15 App Router
Runtime               Node.js 20
Database              PostgreSQL + Drizzle
DB target             TencentDB for PostgreSQL (Supabase target blocked)
Process manager       PM2
Reverse proxy         Nginx
Production OS         Ubuntu 22.04
Production server     Tencent Cloud 2C2G / 40G
```

正式应用入口是 `app/*`。根目录早期静态 HTML/CSS/JS 原型不属于正式 Runtime，并已退出 current tree。

## 3. 学习平台事实

```text
Track 01  AI Foundation   20 lessons   AVAILABLE / FORMAL_RUNTIME
Track 02  AI Work         15 lessons   AVAILABLE / FORMAL_RUNTIME
Track 03  AI Growth       15 lessons   AVAILABLE / FORMAL_RUNTIME
Track 04  AI Workflow     15 lessons   AVAILABLE / FORMAL_RUNTIME
Track 05  FDE             16 lessons   AVAILABLE / FORMAL_RUNTIME
Total                     81 lessons
```

正式课程：
- 共用 Unified Lesson Shell；
- 统一六步；
- 正式 LessonSpec Registry；
- Check / Practice 由服务端拥有最终状态权威；
- Completion / Rating / Resume 已接入正式 Runtime；
- 未登录进入课程需要登录；
- 课程是否可进入由统一 Access / Entitlement 判断。

课程目录结构与六步 Runtime 继续冻结；课程正文采用正式版本受控更新。所有正文修改必须从 `/admin/courses` 发起 Candidate，经 Human Review 后发布为新正式版本，不能直接覆盖当前正式版本。

## 4. 课程生产 current owners

唯一入口：
`docs/learning/COURSE_BUILD_START_HERE.md`

规范 owners：
- `docs/learning/COURSE_BUILD_STANDARD_V1.md`
- `docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md`
- `docs/learning/UNIFIED_LESSON_SHELL_V1.md`
- `docs/learning/FORMAL_CURRICULUM_V1.md`
- `docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md`
- `docs/learning/TRACK_CONTEXTS_V1.md`
- `skills/course-builder/index.ts`
- `lib/learning/course-production-contract.ts`
- `lib/learning/course-content/*`：81 节正式课程的冻结生产内容源；不是规则 owner，只有具体课程实现/Runtime 问题才读取。

已完成的 Formal Brief、Batch Human Review、一次性 provisioning / acceptance 不属于 current owner。

## 5. Current Course Production Snapshot

```text
Course Builder Skill      course-builder@1.0.0
Workflow                  STABLE_WORKFLOW_V1
Unified Lesson Shell      FROZEN / PASS
Formal Registry           ACTIVE
Track 01～05              ALL AVAILABLE
Learning Path             FROZEN
Course content            VERSIONED / CONTROLLED UPDATE
Next course gate          NONE — reopen only by explicit product decision
```

## 6. 当前产品入口

### PC Web
当前主要入口：
- 首页
- 学习路径
- AI 日报
- 进阶练习
- 登录 / Access

PC 当前已确认版式视为冻结基线。

### Mobile
尚未进入正式实现。已确认未来 Mobile 只重点承载：
- 学习：基础课程、AI 热点能力练习、实操项目；
- AI 日报。

Mobile 与未来微信/抖音小程序共享同一业务后台、用户、课程、进度、权限、日报与练习数据，不复制业务事实。

## 7. 用户工作台 / 管理后台当前事实

### 用户工作台

个人 AI 工作台是未来独立会员产品，不属于 OPC AI 前台或 `/admin`；当前状态为 PLANNED，不暴露正式 `/workspace` 页面。用户只使用任务、素材、Studio、自动化、产物、连接和个人设置，不看到平台 Registry、Provider、数据库、审计或管理员配置。用户素材与 AI 产物第一阶段默认保存在浏览器 IndexedDB，可导出；平台不长期保存普通用户媒体。

### 管理后台

`/admin` 当前正式导航：
- 平台：运营总览、内容采集、课程维护、学习洞察；
- 用户：用户与权益。

AI 能力配置与系统域仅保留产品边界，底层能力未完成前不暴露正式页面或导航。兼容路由 `/admin/platform`、`/admin/memberships` 只做重定向。

`/admin/content` 对外统一称“内容采集”，固定三个视图：**采集策略 / 今日情报 / 内容工作台**。
- 采集策略 owner：`AdminCollectionStrategyPanel`；Strategy 与 Source Registry 分离。当前可真实执行的 Collector 为 RSS / HTTP / Manual URL / HN Algolia / GitHub Search；RSSHub、Creator / Comment、MediaCrawler 类能力仍是扩展位。
- Collector 固定 `REFERENCE_ONLY`，只返回引用、文本、指标与 metadata，不拥有长期保存媒体的权限。
- Raw Item 有 URL 时按 canonical URL 全局去重，Observation 保存多 Source / Platform 发现事实。
- Event Seed / Expansion / Cluster / Signal 由确定性 Core 运行；复杂分数只用于排序与审计，不作为普通管理员主界面。
- 今日情报由 Human 执行 ADOPT / WATCH / IGNORE；Discovery 不直接写 Content。
- ADOPT 由 `lib/server/content/adoption.ts` 幂等建立 Content DRAFT、关联 Evidence，并进入 `AdminContentStudioWorkspace`。
- Content Brief Enrichment 是 ADOPT 后的可选 AI 能力，只补核心观点 / 受众 / 目的 / 标签；AI 不拥有 Event Decision、Content 状态或发布权，未配置模型时 Core 流程仍可运行。
- 内容工作台唯一 UI owner 为 `AdminContentStudioWorkspace`；旧 AdminContentConsole / Lifecycle / Knowledge Routing 展示层已退出 current tree。
- 审核状态固定为 DRAFT → REVIEW → PUBLISHED；没有实际结果不得审核通过。

`/admin/courses` 以 `learningTracks` + `formalLessonSpecs` 作为 Track 01～05 共 81 节正式课程的身份源，并使用 Development DB 持久化课程更新 Candidate 与正式版本历史。当前链路为 `DRAFT → REVIEW → 审核通过并上线 → PUBLISHED`；审核与发布是一次 Human 决策，没有中间 `APPROVED` 确认步骤。Candidate 支持刷新恢复、差异对比、最近 6 个正式版本、上一版本对照与恢复历史版本；编辑动作固定为“对比当前 / 保存草稿 / 退出修改 / 提交审核”，“退出修改”结束当前 Candidate 且不影响正式课程；正式发布使用事务并做基础版本冲突保护。发布后课程正文 Runtime、课程目录 · 导航卡片（标题 / 副标题）和最近更新时间读取最新正式 snapshot。旧 `AdminCourseEditor`、`listAdminCourseTree` 与 `/api/admin/lessons/[lessonId]` GET/PUT 直接编辑链已退出 current path。Course Builder Workflow 未接入也未修改；新增/删减课程未实现。

Development `opc_ai_dev` 当前已应用 Drizzle migration `0000`～`0025`（26 条）。本地应用使用最小权限账号 `opc_ai_dev_app`，Migration 使用独立 `DATABASE_MIGRATION_URL`。本地开发固定通过 SSH 隧道 `127.0.0.1:15432` 连接 TencentDB；`npm run dev` 由 `scripts/start-local-dev.cjs` 统一执行“检查隧道 → 必要时自动建立 → 最小 DB 连通性验证 → 启动 Next.js”，`npm run dev:check` 只做该确定性预检。后续若 Auth Session 查询出现连接类错误，先按此开发基线恢复隧道/DB，不重复推断 Schema、不新增 Auth migration 或认证补丁，除非有独立 Schema 证据。2026-10-01 的 Auth Session 报错已确认是隧道中断。

用户与权益当前真实能力：用户搜索、ACTIVE / DISABLED、学习概况、会员开始/到期/永久/延长/取消，以及管理员审计。历史 `users.admin_note` 仅作为数据库兼容字段，不属于当前产品 contract。

AI 日报、热点能力练习、实操项目和课程维护可以共享 Event / Source，但不共享内容模板。当前后台课程更新直接维护现有正式课程 snapshot，不调用 Course Builder Workflow；Course Builder 继续只负责独立的课程生产流程。

## 8. 会员与公众号

当前产品策略固定为：
- 免费用户：AI 日报精选 Top3；
- 公众号关注权益：全部日报；
- OPC 会员：进阶练习、实操项目、进阶内容，以及独立个人 AI 工作台使用权；
- 个人 AI 工作台不属于 OPC AI 前台导航，是独立会员产品界面；
- 工作台正式开放前状态仍为 PLANNED，不把原型入口当作已交付会员功能；
- 会员失效后不得删除用户浏览器 IndexedDB 中已有的个人素材与产物。

真实公众号关注验证、完整订单/支付仍未接入，属于后续 Identity / Commerce 阶段。

## 9. 数据与存储方向

数据库技术边界继续使用标准 PostgreSQL；正式托管目标确定为 TencentDB for PostgreSQL。

Workbench 当前数据边界：
- PostgreSQL：身份、Workspace、权限、Workflow/Prompt/Skill 配置、最小运行状态、第三方连接，以及 OPC AI 官方业务事实；
- 浏览器 IndexedDB + 导出文件：普通用户素材、AI 输出、草稿和产物；
- 飞书：用户授权后的外部整理目标，单向写入用户勾选字段；
- 对象存储：仅 OPC AI 官方内容或未来显式云存储能力需要时使用；
- 第一阶段不引入独立 Vector DB / Redis / Kafka；
- Worker 早期仅承担低并发控制型任务，用户模型推理与媒体计算不在平台服务器执行。
- Development 数据库固定命名 `opc_ai_dev`；Production 固定命名 `opc_ai_prod`；
- Dev / Prod 使用不同账号；本地开发不得持有 Production 数据库账号；
- Production Web/API 优先通过腾讯云 VPC 内网连接 TencentDB；
- 当前 migration 入口已增加安全 Gate：Supabase target 会被直接拒绝。

## 10. AI 架构方向

模型调用通过 Provider Adapter / Model Gateway，不把业务逻辑绑定某一家：
- 普通用户第一版 BYOK：DeepSeek / 豆包 / OpenAI；平台不承担用户 Token；
- 普通用户 raw input/output 默认不长期保存服务器；
- OPC AI 官方任务使用平台自己的模型配置，并保留完整 AI Run provenance。

## 11. 当前下一步

当前状态：`COURSE MAINTENANCE / VERSIONED UPDATE / HUMAN REVIEW PASS`。

课程维护的 Candidate 持久化、差异审核、一次审核上线、6 版本历史、恢复历史版本、课程正文与学习路径同步已完成并经过产品负责人实际体验。当前不扩展新增/删减课程或 AI 一键构建，下一步回到后台“学习洞察”与整体事实复核。

## 12. Repository Governance 状态

- Repository Governance：COMPLETE / PASS；
- Current tree 只保留正式 current owners、正式实现和必要兼容重定向；未批准原型与重复运行路径退出 current tree；
- Course current owner：7 份 learning docs；
- Current executable scripts：由 `npm run scripts:current:check` 管理，不维护易漂移的手工数量；
- 历史 task-results / Track-Batch 一次性脚本 / legacy static prototype / Course Builder Preview 路由：退出 current tree，使用 Git history 追溯；
- 正式课程内容已从 `fixtures` 迁至 `lib/learning/course-content/*`；`fixtures/course-builder` 只保留 Validator/Acceptance 测试样例；
- 已删除 Brief / Audit / Research 文件若作为冻结课程历史 provenance 保留，只允许使用 `git-history:` 前缀，不得作为 current context。
