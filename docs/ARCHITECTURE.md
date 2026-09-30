# ARCHITECTURE.md — OPC AI 稳定架构边界

Status: **CURRENT**

本文件只定义长期稳定技术边界。具体课程规则、当前事实、任务计划和历史实现分别由对应 owner 管理。

## 1. 目标架构

```text
Web / Mobile / Mini Programs
            │
            ▼
     OPC Backend / API
            │
    ┌───────┼────────┐
    │       │        │
 Learning Content  Identity
    │       │        │
    └───────┼────────┘
            ▼
        PostgreSQL

External Evidence ──► Content Workbench
                         │
                    Skill / Workflow
                         │
                    Model Gateway
                         │
                  Human Review / Core
```

当前继续采用 Modular Monolith，不为“未来可能扩展”提前拆微服务。

## 2. 当前技术基线

- Next.js App Router；
- TypeScript；
- PostgreSQL + Drizzle；
- 标准 PostgreSQL 作为数据库边界；正式目标优先 TencentDB for PostgreSQL；
- Nginx + PM2；
- 腾讯云 Ubuntu 生产服务器。

业务规则优先落在同一工程的 server / API / domain 层。只有出现真实跨客户端、扩缩容或独立部署需求时再拆服务。

## 3. Core / Skill / Workflow

固定：

```text
Code = Truth
Skill = Intelligence
Workflow = Controlled Bridge
Core System = Authority
```

### Core
拥有：
- Auth / User；
- Access / Entitlement；
- CRUD / State；
- Schema / Validation；
- Progress / Completion；
- Publish / Version / Audit；
- Secret；
- 多端 API。

### Skill
只承担需要语义理解、生成、分类、判断、综合的能力。

Skill：
- 输入输出结构化；
- 版本化；
- 不直接写正式状态；
- 不直接发布；
- 失败不得破坏 Core。

详细规则见 `docs/SKILL_GOVERNANCE.md`。

### Workflow
显式编排 Code / Skill / Human Gate。
AI 不自主改变业务状态流。

## 4. Learning Boundary

正式学习状态由 Backend / PostgreSQL 拥有。

```text
Course / LessonSpec
→ Runtime Read Model
→ Unified Lesson Shell
→ Check / Practice API
→ Server Gate
→ Progress / Completion
```

Web、Mobile、微信小程序、抖音小程序未来只实现 Presentation / Channel Adapter，不复制：
- Check 规则；
- Practice 规则；
- Completion Gate；
- Entitlement；
- Course 状态。

课程规则与 Curriculum 见 `docs/learning/*` current owners；冻结的正式课程生产内容位于 `lib/learning/course-content/*`。测试/Acceptance fixture 不承载正式生产课程。

## 5. 三产品 Presentation Boundary

### OPC AI 前台

用于学习与官方内容消费。个人 AI 工作台不进入前台导航。

### 独立个人 AI 工作台

它是会员专属的独立产品界面，MVP 可与主站共用同一 Next.js 工程和 Backend，但必须使用独立 App Shell / Route，不共享前台或 Admin 导航。

固定：
- Personal Workspace：一个用户一个 Workspace；
- Membership / Entitlement 决定是否允许进入；
- Workflow：第一版只支持线性顺序节点，可新增、删除、排序、启停、从失败节点重跑；
- Studio：只处理当前素材或产物，不承担平台 CMS 职责；
- 用户内容默认留在浏览器 IndexedDB，可导出，不长期写入平台数据库；
- 用户 AI 默认 BYOK，首批 DeepSeek / 豆包 / OpenAI；
- 普通用户只消费官方发布的 Workflow / Prompt / Skill 能力，不暴露内部 Registry；
- 第一版不执行用户上传的任意 Python / JavaScript / Shell / package 代码；
- 飞书通过 Connector + OAuth 单向写入用户选择的目标，不做实时双向同步；
- 用户业务产物与 OPC AI 官方内容彻底分域。

### 管理后台

用于平台运营、用户/会员、官方内容、课程、学习洞察、AI 能力配置与系统控制。内部 Workflow / Prompt / Skill Registry、Provider、Connector、Audit、DB 状态只属于 Admin。

完整开发边界与阶段规则见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`。

## 6. AI / Model Gateway

业务代码不直接绑定模型厂商。

```text
Business Task
→ Model Gateway
→ Provider Adapter
   ├─ Doubao
   ├─ DeepSeek
   └─ OpenAI
```

平台官方 AI Run 必须可追溯 provider / model / skill / prompt / rule version / context / evidence / result / validator / human result。普通用户 BYOK 运行只要求保存最小运行状态和必要配置引用，不要求平台长期保存用户 raw input/output。

上下文治理见 `docs/CONTEXT_GOVERNANCE.md`。

## 7. Storage

### PostgreSQL
平台必须保存：
- Identity / Workspace / Permission；
- Workflow / Prompt / Skill 配置与官方模板；
- 最小 Workflow Run / Step Run 状态；
- 第三方连接 metadata 与字段映射；
- OPC AI 官方内容、审核、发布、Learning / Access / Membership 业务事实。

普通用户采集内容、AI 输出、图片、视频、剪映草稿等默认不作为平台长期内容保存。

### Browser Local Storage
普通用户工作内容第一版使用 IndexedDB + 导出文件：原始素材、AI 输出、草稿、图片/媒体引用与最终产物均本地优先。

### Object Storage
COS 只服务于 OPC AI 官方内容或未来用户显式选择的云存储能力；不是普通用户工作台第一版的默认存储。

第一阶段不增加独立 Vector DB、Redis、Kafka。

### Database Deployment

- Supabase 仅保留为历史测试环境，不再是 current production target；
- 正式目标：TencentDB for PostgreSQL，与 Web/API 腾讯云环境同地域；
- 初期允许同一 TencentDB 实例建立两个逻辑数据库：`opc_ai_dev` 与 `opc_ai_prod`；
- Development / Production 使用不同数据库账号，最小权限隔离；
- Production Web/API 优先通过 VPC 内网连接数据库；
- 本地开发不得持有 Production 数据库账号；
- Drizzle Schema / Migration 保持标准 PostgreSQL 可迁移，不依赖腾讯云专有 SQL。

## 8. Worker

早期低并发控制型 Job 可与 Web/API 同机。普通用户模型推理、媒体计算和内容长期存储不由平台服务器承担。

出现以下情况再拆 Worker：
- 第三方采集/同步并发明显影响 Web；
- OPC AI 官方 AI/抓取长任务持续占资源；
- 平台官方媒体处理成为常态任务；
- Job 吞吐出现稳定瓶颈。

用户侧图片、视频、剪映草稿优先本地或外部 Provider 处理，不在当前 2C2G 本地渲染。

## 9. Identity / Commerce

公众号关注、微信登录、抖音登录、支付属于 Adapter / Identity / Commerce，不应侵入 Course / Content Core。

长期：

```text
User
└─ Identities
   ├─ Web
   ├─ WeChat
   └─ Douyin
```

同一 user 共享 Progress / Entitlement / Membership。个人 AI 工作台访问权属于 Membership / Entitlement，不由前端导航或 Admin Role 代替判断。

## 10. Secret

- Secret 不进 Git；
- 不进 Prompt / Context；
- 不进日志 / Analytics；
- 平台 Key 优先环境变量 / Secret Manager；
- 用户 BYOK 第一阶段不持久化；
- 未来若保存必须服务端加密、脱敏、可撤销、可删除。

## 11. Multi-client

长期目标：

```text
PC Web
Mobile Web
WeChat Mini Program
Douyin Mini Program
        │
        ▼
Shared Backend / API / State
```

共享业务事实，不强求共享 UI 代码。

## 12. 当前演进顺序

阶段顺序、需求、推荐理由、TDD、验收和 Done 标准由 `docs/DEVELOPMENT_OPERATING_MANUAL.md` 唯一拥有。架构文件不再维护第二份 roadmap。
