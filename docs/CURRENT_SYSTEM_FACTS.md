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
DB target             TencentDB for PostgreSQL / Supabase LEGACY TEST ONLY
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

当前课程内容冻结。后续课程任务默认仅允许：
1. 修复明确阻断；
2. 做不改变课程知识与结构的 Runtime 修复；
3. 产品负责人显式重新开启课程修改。

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
Course content            FROZEN
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

最新产品边界以“角色”优先，不再以旧的内容四阶段或 Admin Workbench 作为信息架构基线。

### 用户工作台

个人 AI 工作台是未来独立产品，不属于 `/admin`；当前状态为 PLANNED，不暴露正式 `/workspace` 产品页面。

普通用户只看到：
- 工作台任务；
- 素材；
- 创作 / Studio；
- 自动化；
- 产物；
- 连接；
- 个人设置。

普通用户不看到：
- 平台用户/会员管理；
- 官方内容后台；
- 课程维护后台；
- 学习洞察后台；
- 内部 Prompt Registry / Skill Registry；
- 平台模型 Provider；
- 数据库、审计、管理员权限、Feature Flag。

用户工作台只“使用能力”。内部 Workflow / Prompt / Skill 可以通过官方模板和产品交互被调用，但不要求普通用户理解平台内部注册和发布机制。

### 管理后台

`/admin` 只表示管理员控制台，当前分为：

1. 平台运营：运营总览、官方内容、课程维护、学习洞察；
2. 用户与权益：一个一级入口管理用户账号、学习概况与会员 / Entitlement；会员不是独立一级业务对象；
3. AI 能力配置：官方 Workflow 模板、Prompt 模板、Skill Registry、模型 Provider、连接器；
4. 系统：运行状态、审计、管理员权限与后续 Feature Flag。

AI 能力配置与系统域目前只保留产品边界，底层能力未完成前不暴露正式页面或导航入口。

`/admin/platform` 不再作为第二个后台首页，只兼容重定向到 `/admin`。`/admin/content` 对外名称统一为“官方内容”，只处理 OPC AI 自己的业务内容。

用户与会员真实能力继续保留：搜索、ACTIVE/DISABLED、学习概况、会员开始/到期/永久/延长/取消及管理员审计。用户备注已退出产品与运行时 contract，不再作为当前能力。

### 为未来用户工作台必须补齐的后台能力

这些属于控制层，不直接作为用户界面暴露：
- 官方 Workflow / Prompt / Skill 模板发布与版本；
- Provider Adapter / Model Gateway；
- BYOK 配置契约和 Secret 边界；
- 连接器 / OAuth；
- Workspace metadata；
- Workflow Run / Step Run 最小状态和失败重跑；
- 模板分发与权限。

用户内容仍默认保存在浏览器 IndexedDB，可导出文件；平台不长期保存普通用户素材、AI 产物或媒体文件。

本轮不再把“来源/证据 → 候选 → 审核 → 发布”视为整个后台的固定结构。官方内容、课程、学习洞察的具体流程后续分别按管理员职责重新设计。

当前用户/会员治理 migrations 已落到 Development `opc_ai_dev`；本地应用继续使用最小权限账号 `opc_ai_dev_app`。历史 migration 中存在的 `users.admin_note` 仅作为数据库兼容遗留，不再进入前端类型、Admin API 或服务层 current contract。Production 尚未执行本轮用户/角色 migrations。

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

当前进入：

`ADMIN-REMAINING-IA-REBUILD-001 / READY`

当前继续完成后台其余界面重构：运营总览与用户与权益已确认为冻结基线；下一站为官方内容，之后依次收口课程维护与学习洞察。未接通的 AI 能力、系统管理与个人 AI 工作台不暴露正式页面。整个 Admin 基线确认后才进入个人 AI 工作台 Product Spec。

## 12. Repository Governance 状态

- Repository Governance：COMPLETE / PASS；
- Current tree 只保留正式 current owners、正式实现和必要兼容重定向；未批准原型与重复运行路径退出 current tree；
- Course current owner：7 份 learning docs；
- Current executable scripts：由 `npm run scripts:current:check` 管理，不维护易漂移的手工数量；
- 历史 task-results / Track-Batch 一次性脚本 / legacy static prototype / Course Builder Preview 路由：退出 current tree，使用 Git history 追溯；
- 正式课程内容已从 `fixtures` 迁至 `lib/learning/course-content/*`；`fixtures/course-builder` 只保留 Validator/Acceptance 测试样例；
- 已删除 Brief / Audit / Research 文件若作为冻结课程历史 provenance 保留，只允许使用 `git-history:` 前缀，不得作为 current context。
