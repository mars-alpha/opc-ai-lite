# DEVELOPMENT_OPERATING_MANUAL.md — OPC AI 开发规则与操作手册

Status: **CURRENT / SINGLE OWNER**

本文件是 OPC AI 后续产品开发、技术选择、任务拆分、验收和治理的唯一开发操作手册 owner。

除课程专属规则、Skill 专属规则、数据专属规则外，任何“应该怎么开发、为什么这样选、下一阶段先做什么、如何验收”的规则都以本文件为准。历史方案通过 Git history 追溯，不再保留第二份 current roadmap。

---

## 1. 产品总边界

OPC AI 后续固定为三个彼此独立的产品界面，共享 Backend / Identity / Entitlement / Core，但不共享导航与信息架构。

### 1.1 OPC AI 前台

职责：学习与官方内容消费。

包括：
- 首页；
- 学习路径；
- AI 日报；
- 进阶练习；
- 正式课程；
- 会员权益展示。

不包括：
- 个人 AI 工作台；
- 管理后台；
- Prompt / Skill / Provider 内部配置；
- 用户管理、会员管理、审计、数据库状态。

固定原则：
- 个人工作台不作为前台导航模块；
- 前台可以展示“会员包含个人 AI 工作台”这一权益，但进入工作台使用独立入口；
- 已确认 PC 前台与课程 Runtime 默认冻结。

### 1.2 独立个人 AI 工作台

职责：让会员使用 AI 完成真实工作。

它是独立产品界面，不属于前台，也不属于管理后台。

用户只看到：
- 任务入口；
- 素材；
- 创作 / Studio；
- 自动化；
- 产物；
- 连接；
- 个人设置。

用户不需要理解：
- Skill Registry；
- 平台 Prompt Registry；
- Provider 管理；
- 数据库；
- 审计；
- 平台用户/会员管理；
- 官方内容后台；
- 课程维护后台；
- Feature Flag。

推荐实现：
- MVP 继续放在同一 Next.js 工程和同一 Backend 中，使用独立 App Shell / Route；
- 不提前拆第二套部署、微服务或独立数据库；
- 当工作台形成独立发布节奏、独立域名、独立团队或独立扩缩容需求后，再评估独立部署。

推荐理由：
- 当前 2C2G 和单人产品阶段更需要低复杂度；
- 独立界面不等于必须独立代码仓库；
- 先保持共享身份、会员、API 和 Core，可以避免两套用户体系和重复状态。

### 1.3 管理后台

职责：管理 OPC AI 平台本身，以及给个人工作台提供能力的控制层。

固定分区：

**平台运营**
- 运营总览；
- 官方内容；
- 课程维护；
- 学习洞察。

**用户与权益**
- 用户管理；
- 会员 / Entitlement 作为用户的权益视图；
- 后续订单 / 支付在真实 Commerce 接入后再独立。

**AI 能力配置**
- 官方 Workflow 模板；
- 官方 Prompt 模板；
- 官方 Skill Registry；
- 模型 Provider；
- Connector。

**系统**
- 系统状态；
- 审计；
- 管理员权限；
- Feature Flag；
- 运行配置。

管理后台不得承担普通用户日常创作。

---

## 2. 角色与可见性

| 能力 | 游客/免费 | 公众号关注 | OPC 会员 | 管理员 |
| --- | --- | --- | --- | --- |
| OPC AI 前台 | 按公开权益 | 按关注权益 | 完整会员权益 | 可访问 |
| AI 日报 | 免费范围 | 完整日报 | 完整日报 | 管理 |
| 进阶练习 / 实操 | 否 | 否 | 是 | 管理 |
| 个人 AI 工作台 | 否 | 否 | **会员专属** | 不因管理员身份自动等同会员 |
| 用户/会员后台 | 否 | 否 | 否 | 是 |
| 官方内容后台 | 否 | 否 | 否 | 是 |
| Workflow / Prompt / Skill Registry | 否 | 否 | 否 | 是 |
| Provider / Connector 配置 | 否 | 否 | 否 | 是 |
| 系统审计 / DB 状态 | 否 | 否 | 否 | 是 |

说明：
- Admin Role 与 Membership 是两套不同权限，不互相推导；
- 管理员若需要体验个人工作台，应通过独立 Preview / Test entitlement，不用 Admin 身份绕过会员规则；
- 个人工作台正式开放前状态为 PLANNED，不应在产品文案中假装已经可用。

---

## 3. 会员权益

OPC 会员固定增加：

**个人 AI 工作台使用权**

推荐 entitlement 语义：

`PERSONAL_WORKSPACE`

实现原则：
- 访问由 Core / Entitlement 判断，不由前端隐藏按钮代替权限；
- 会员失效后禁止继续进入受限工作台功能；
- 会员失效不得删除用户浏览器 IndexedDB 中已有素材和产物；
- 用户重新获得会员后，本地数据可继续使用；
- 支付、订单尚未接入时，继续由现有 Membership Entitlement 作为权威；
- 未来支付只负责产生/延长 Entitlement，不把支付状态直接散落到业务页面。

为什么这样选：
- 会员是“访问权”，不是内容所有权；
- 本地用户数据与订阅生命周期解耦，可以避免会员到期导致数据丢失；
- 权益统一由 Entitlement Core 判断，可同时复用于 Web、Mobile、未来小程序。

---

## 4. 个人工作台需求

### 4.1 MVP 必须有

- 独立 App Shell；
- Membership Gate；
- Personal Workspace metadata；
- 本地 IndexedDB 内容层；
- 导入 / 导出；
- BYOK；
- Provider Adapter；
- 任务入口；
- 单内容 Studio；
- 线性 Workflow；
- Workflow Run / Step Run 最小状态；
- 当前节点失败后停止；
- 修正后可重跑当前节点；
- 官方 Workflow / Prompt / Skill 模板读取；
- Connector / OAuth 基础；
- 飞书单向同步到用户选择的目标；
- 产物导出。

### 4.2 MVP 不做

- 拖拽 Canvas；
- DAG；
- 分支 / 循环；
- 多 Agent；
- 模板市场；
- 用户上传任意可执行代码；
- 平台长期保存普通用户素材/AI 输出/媒体；
- 服务端视频渲染；
- Redis / Kafka；
- 独立 Vector DB；
- 实时飞书双向同步。

### 4.3 用户界面原则

用户从“我要完成什么”开始，不从“我要选哪个 Skill / Prompt / Model”开始。

推荐：

`任务 → 素材 → AI 处理 → 用户确认 → 产物 / 导出 / 同步`

内部 Workflow / Skill 可以存在，但默认隐藏技术实现。

高级配置只有当用户明确需要时再逐级展开。

---

## 5. 管理后台需求

### 5.1 平台运营

负责 OPC AI 自己的业务内容和学习产品。

管理员看到业务任务，不先看到数据库字段。

### 5.2 AI 能力配置

必须补齐：
- Workflow Template Registry；
- Prompt Template Registry；
- Skill Registry；
- Template Version；
- Current Version；
- Provider Adapter；
- Model Profile；
- Connector Definition；
- Permission / Availability；
- Test / Acceptance 状态。

这些能力是“后台供给”，个人工作台只消费已发布版本。

### 5.3 系统

只管理真正的平台控制层：
- 健康状态；
- 数据库状态；
- migration 状态；
- Job 状态；
- Audit；
- Admin；
- Feature Flag；
- Secret 配置状态。

禁止把用户创作素材放到这里。

---

## 6. Code / AI / Skill / Workflow / Human 如何选择

每个新需求实现前必须先分类。

### 6.1 CODE_ONLY

适用：
- CRUD；
- 抓取；
- API 调用；
- 去重；
- 排序；
- 过滤；
- 数值计算；
- 状态机；
- 权限；
- Entitlement；
- Schema；
- Validation；
- 版本；
- 发布；
- Audit；
- 确定性格式转换。

推荐理由：
结果应 100% 一致，不需要模型概率。

### 6.2 SKILL

适用：
- 内容理解；
- 摘要；
- 语义分类；
- 价值判断建议；
- 改写；
- 多资料综合；
- 文章/脚本/图片说明生成。

推荐理由：
任务需要语义推理，if/else 无法稳定表达。

规则：
- 一个 Skill 一个主要职责；
- Schema First；
- 版本化；
- 不拥有业务状态；
- 不直接 Publish；
- 不直接改变 Membership / Permission；
- 失败不能破坏 Core。

专属规则 owner：`docs/SKILL_GOVERNANCE.md`。

### 6.3 WORKFLOW

适用：
多个 Code / Skill / Human Gate 需要有确定顺序。

第一版：
- 线性节点；
- 可新增 / 删除 / 排序 / 启停；
- 失败停当前节点；
- 可重跑当前节点。

不用 Workflow 的情况：
- 一个函数即可完成；
- 一个 Skill 即可完成；
- 没有多步骤状态。

### 6.4 HUMAN

只有以下情况才增加人工 Gate：
- 需要平台承担正式内容责任；
- 外部不可逆发布；
- 支付 / 权限 / 删除等高影响动作；
- AI 输出无法由确定性 Validator 判断，而错误成本明显。

不要增加人工 Gate：
- Code 已能确定判断；
- 同一人连续“审核一次 + 发布一次”但两次没有新的信息；
- 用户自己的个人工作台产物。

---

## 7. Human Review / Publish 规则

### 7.1 个人工作台

用户就是自己的 Review Gate。

平台不审核普通用户：
- 素材；
- Prompt；
- AI 输出；
- 草稿；
- 文章；
- 图片；
- 视频脚本。

用户确认后即可保存/导出。

### 7.2 OPC AI 官方内容

默认只保留一次必要 Human Gate。

如果：
- 人工确认时已经看到最终内容、证据和去向；
- 通过后只是写入平台内部可回滚状态；

则：

`Human Approve → Core Publish`

可以是一个操作。

只有以下情况保留第二次发布确认：
- 公众号真实群发；
- 外部社媒发布；
- 定时推送；
- 付费动作；
- 大规模不可逆通知；
- 删除正式数据。

推荐理由：
避免“审核通过 → 再点一次发布”这种没有新增判断信息的重复劳动。

---

## 8. 数据与存储边界

### PostgreSQL

保存：
- Identity；
- Membership / Entitlement；
- Workspace metadata；
- Permission；
- Workflow / Prompt / Skill 官方配置和模板；
- Template version；
- Workflow Run / Step Run 最小状态；
- Connection metadata；
- OPC AI 官方内容；
- Learning；
- Audit。

### IndexedDB

普通用户默认保存：
- 原始素材；
- AI 输出；
- 草稿；
- 图片引用；
- 媒体引用；
- 最终产物。

### Object Storage

MVP 只用于：
- OPC AI 官方内容；
- 或未来用户显式选择的云存储功能。

### 飞书

个人工作台：
- 用户 OAuth；
- 选择目标；
- 单向写入用户勾选字段；
- 不作为平台正式数据源；
- 不做实时双向同步。

官方平台内部若使用飞书，必须与用户工作台 Connector 分开定义，不能复用“同步回来”作为通用产品事实。

---

## 9. 技术选择规则

### 9.1 单体还是微服务

默认 Modular Monolith。

只有出现以下真实条件再拆：
- 独立扩缩容；
- 独立发布节奏；
- Worker 明显影响 Web；
- 独立团队；
- 安全隔离要求。

当前不拆。

### 9.2 同工程还是独立工作台工程

MVP 推荐：
- 同一 Next.js 工程；
- 独立 App Shell；
- 独立 Route；
- 共享 Backend / Auth / Entitlement。

后续再考虑：
- 独立子域；
- 独立部署；
- 独立仓库。

### 9.3 数据库

继续标准 PostgreSQL + Drizzle。
正式托管目标 TencentDB for PostgreSQL。

不因为工作台新增：
- MongoDB；
- Redis；
- Kafka；
- Vector DB。

只有真实需求出现再增加。

数据库权限固定分离：
- `DATABASE_URL`：应用运行连接，只给最小 CRUD / 业务所需权限；
- `DATABASE_MIGRATION_URL`：仅 Schema Migration 使用，必须具备对应数据库 Owner / DDL 权限；
- Migration 连接必须经过同一 `DATABASE_ENVIRONMENT` / database name 校验；
- 不得为了跑 Migration 给 App Role 临时或永久增加 DDL 权限；
- Production Migration 继续要求备份确认。

### 9.4 AI Provider

业务层不绑定厂商。

`Business Task → Model Gateway → Provider Adapter`

首批：
- DeepSeek；
- 豆包；
- OpenAI。

普通用户默认 BYOK。
平台官方任务使用平台 Key。

---

## 10. 后台配置与用户产品的映射

| 管理后台配置 | 用户工作台看到 |
| --- | --- |
| Workflow Template | “自动化模板 / 任务模板” |
| Prompt Template | 默认提示和可编辑内容 |
| Skill Registry | 某项 AI 能力，不显示 Registry |
| Model Provider | 模型连接 / BYOK |
| Connector Definition | “连接飞书”等 |
| Feature Flag | 是否开放该能力 |
| Permission / Membership | 能否进入 / 使用 |
| Template Version | 用户只使用当前发布版本 |

原则：
后台维护“能力定义”，用户界面展示“可以完成什么”。

---

## 11. 开发阶段

### Phase A — Governance Reset

目标：
- 三产品边界固定；
- 会员包含个人工作台；
- 删除旧 roadmap；
- 新操作手册成为唯一 owner；
- 防漂移 Validator 生效。

验收：
- `governance:development:check` PASS；
- current owners 无旧路线引用；
- Git diff 无文档断链。

### Phase B — Admin IA Rebuild

目标：
只整理管理员后台，不开发个人工作台功能。

顺序：
1. 总览；
2. 用户与权益；
3. 官方内容；
4. 课程维护；
5. 学习洞察；
6. AI 能力配置；
7. 系统。

每页先定：
- 使用角色；
- 核心任务；
- 输入；
- 自动化；
- AI / Skill；
- Human Gate；
- 输出；
- 删除哪些旧 UI。

### Phase C — Workbench Product Spec

目标：
在不依赖 Admin UI 的情况下单独设计个人工作台。

先输出：
- 用户任务；
- IA；
- Membership Gate；
- 本地数据模型；
- BYOK；
- Template consumption；
- Run State；
- Connector。

Human Review 后再实现。

### Phase D — Workbench Foundation

实现：
- Workspace；
- IndexedDB；
- Entitlement Gate；
- BYOK；
- Model Gateway；
- Workflow Runtime；
- Template Reader；
- Export。

### Phase E — Connections / Templates

实现：
- 飞书；
- Prompt / Skill / Workflow 官方模板；
- 用户私有配置；
- 版本管理。

### Phase F — Official Platform Automation

再回到：
- AI 日报；
- Knowledge；
- Practice；
- Course Impact；
- 媒体 Workflow。

---

## 12. 每个开发任务必须先写的 Decision Brief

任何实现前必须明确：

```text
Task ID:
Goal:
User Role:
Product Surface:
Problem:
Why Now:

In Scope:
Out of Scope:

Code Responsibility:
AI Responsibility:
Skill Responsibility:
Workflow Responsibility:
Human Responsibility:

Data Read:
Data Write:
Entitlement:
External Side Effect:

Options Considered:
Recommended Option:
Why Recommended:
Why Alternatives Rejected:

Acceptance:
Deterministic Validation:
Human Review:
Rollback:
Owner Files:
```

没有 Decision Brief，不进入代码实现。

---

## 13. TDD 规则

### Step 1 — RED

先写：
- Contract test；
- Validator；
- Acceptance fixture；
- 或最小失败断言。

证明旧实现不满足新 Contract。

### Step 2 — GREEN

只写让当前 Contract 通过的最小实现。

禁止：
- 顺便扩功能；
- 提前抽象未来模块；
- 增加未被当前验收使用的 Schema；
- 建第二条兼容主链。

### Step 3 — REFACTOR

只在测试已经 PASS 后：
- 去重复；
- 收敛命名；
- 删除旧实现；
- 更新 owner。

### Step 4 — ACCEPTANCE

按任务类型执行：
- TypeScript；
- Build；
- Domain Validator；
- API Acceptance；
- DB Acceptance；
- UI Human Review。

### Step 5 — CLEANUP

删除：
- 临时补丁；
- 旧分支；
- superseded docs；
- 一次性脚本；
- 失效提示词。

---

## 14. 可重跑验证

所有阶段必须优先提供脚本，而不是靠手工说明“我试过了”。

基础：

```bash
npm run typecheck
npm run build
npm run governance:repository:check
npm run governance:development:check
git diff --check
```

会员：

```bash
npm run access:membership-policy:check
```

课程：

```bash
npm run learning:course-current-state:check
npm run learning:course-build-entry:check
npm run learning:course-governance:check
npm run learning:course-production-workflow:check
npm run learning:formal-registry:check
npm run scripts:current:check
```

数据库：

```bash
npm run db:target:check
```

涉及 migration 时继续使用 Safe Migration Gate，不手工绕过。Migration 必须使用 `DATABASE_MIGRATION_URL`；如果该连接未配置或权限不足，状态记为 `REVIEW_BLOCKED`，不得用 `DATABASE_URL` 的 App Role 强行迁移。

---

## 15. UI 操作手册

新增或修改 UI：

```text
需求与角色确认
→ IA / Task Flow
→ 用户确认方向
→ 实现
→ typecheck / build
→ 本地真实体验
→ 产品负责人 Human Review
→ 修正
→ 明确 USER_APPROVED
→ 才进入依赖该 UI 的下一阶段
```

Build PASS 不等于 UI PASS。

不得：
- Agent 自评后直接标记视觉完成；
- 用截图替代实际体验；
- 未确认 IA 就开始批量开发页面。

---

## 16. 文档治理

Bootstrap 必读只保留：

```text
AGENTS.md
docs/CURRENT_SYSTEM_FACTS.md
PROJECT_STATUS.md
TASKS.md
docs/DEVELOPMENT_OPERATING_MANUAL.md
```

按任务再读取：
- `docs/ARCHITECTURE.md`
- `docs/SKILL_GOVERNANCE.md`
- `docs/CONTEXT_GOVERNANCE.md`
- `docs/domains/*`
- `docs/learning/*`

禁止：
- 新建第二份 roadmap；
- 新建重复“产品规划总文档”；
- 在多个 owner 复制同一规则正文；
- 把聊天中的旧方案重新写回 current tree。

旧事实：
- 删除 current 文件；
- Git history 保留；
- 不建立 `old/`、`archive/`、`legacy-docs/` 目录继续污染上下文。

---

## 17. Definition of Done

一个任务只有同时满足以下条件才 Done：

- 角色明确；
- Product Surface 明确；
- 边界明确；
- 推荐方案与理由明确；
- Out of Scope 明确；
- Code / AI / Skill / Workflow / Human 分工明确；
- 数据读写明确；
- Entitlement 明确；
- 测试先行或 Contract 先行；
- 可重跑验证 PASS；
- 旧主链已删除或明确不受影响；
- Current owner 已同步；
- UI 任务获得 USER_APPROVED；
- 未引入重复 owner；
- Git diff 可审计；
- 没有自动提交未授权修改。

---

## 18. 当前冻结结论

从本文件成为 CURRENT 起：

- 旧 `docs/DEVELOPMENT_ROADMAP.md` 删除；
- `ADMIN-WORKBENCH-RESTRUCTURE-001` 不再作为 current 开发入口；
- “后台就是个人工作台”属于废止描述；
- “个人工作台属于 OPC AI 前台导航”属于废止描述；
- “所有平台内容固定四阶段”不再作为全局规则；
- 后续开发必须先按三产品边界归类；
- 会员权益包含个人 AI 工作台，但工作台正式发布状态仍需独立阶段验收。
