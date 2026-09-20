# OPC AI — 技术架构基线 V4

## 1. 总体架构

```text
用户侧
Web / H5 / 微信小程序
        │
        ▼
OPC Backend / API
        │
        ▼
PostgreSQL

后台运营侧
Admin / CMS
        │
        ├─ Content Collector
        ├─ Internal AI Service
        ├─ Scheduler
        └─ Channel Adapters
```

MVP 采用：

```text
Modular Monolith
```

不拆微服务。

## 1.1 当前 MVP 实现基线

当前第一版 MVP 不再从空工程重启，而是直接沿用已经验证学习体验的 Next.js 工程。

当前事实：

```text
Next.js 15.5.25
React 19.1
TypeScript 5.8
npm
App Router
Learning State / Auth / Entitlement 已进入 PostgreSQL
Drizzle ORM + postgres.js + Database Migration 已接入
开发环境已连接 Supabase PostgreSQL；正式数据以标准 PostgreSQL 为 Source of Truth
```

Phase 1 的 `Backend / API` 首先作为**逻辑边界**落在同一 Next.js 工程的 server / API / data 层中，而不是强制先启动独立 Fastify 服务。

```text
Web / H5 UI
    ↓
Next.js server / API boundary
    ↓
Domain / Data access
    ↓
PostgreSQL
```

保持以下原则不变：

- PostgreSQL 仍是正式业务数据 Source of Truth；
- 业务规则只实现一次；
- 小程序与其他客户端后续通过稳定 API 复用业务能力；
- 当跨客户端复用、独立部署、扩缩容或团队边界形成真实需求时，再评估把 Backend 抽离成独立服务；
- Fastify / pnpm workspace 不是当前 MVP 的前置条件。

---

## 2. 用户侧与后台侧分离

### 用户侧

只消费已发布业务数据：

```text
课程
知识
日报
实操
学习进度
权益
消息
```

用户侧不直接调用第三方模型 API，不接收用户 API Key。

### 后台侧

必要时使用自动化和 AI：

```text
内容采集
内容处理
知识影响分析
课程更新建议
客服自动回答（基于已审核知识）
推送准备
```

这些能力是内部运营能力，不应泄漏成用户侧模型平台。

---

## 3. 目标领域模块

```text
auth
users
courses
learning
entitlements
content
knowledge
events
analytics
feedback
admin
```

只有真实需求出现时才增加：

```text
notifications
wechat
wecom
feishu_publish
obsidian_export
```

其中 `feishu_publish` 与 `obsidian_export` 都应保持为薄 Adapter，不建设独立内容系统。

禁止提前创建空模块。

---

## 4. Internal AI Service

后台 AI 调用统一收口到薄层内部服务，而不是散落在业务模块中。

建议只提供业务语义能力：

```text
summarize()
classify()
extract()
deduplicateAssist()
tagSuggest()
compareKnowledge()
courseImpactSuggest()
rewriteDraft()
customerAnswer()
```

内部服务最低包含：

```text
Provider Adapter
Prompt Template
Structured Output
Timeout
Retry
Logging
Cost Tracking
```

当前不建设：

```text
多模型路由平台
Agent Orchestration
复杂 Memory
自主决策 Agent
```

---

## 4.1 Deterministic Core / Skill Runtime Boundary

OPC 固定采用：

```text
Code = Truth
Skill = Intelligence
Workflow = Controlled Bridge
Core System = Authority
```

所有新能力先按以下六条规则分类：

```text
Rule 1
能确定性实现 → Code First

Rule 2
需要语义理解 / 生成 / 推理 → Skill

Rule 3
Skill 不直接拥有核心业务状态

Rule 4
Skill 输出必须结构化

Rule 5
最终写库、发布、权限、状态变化 → Core System

Rule 6
Skill 挂掉，核心系统仍可运行
```

标准运行架构：

```text
┌─────────────────────────┐
│ Deterministic Core      │
│ 普通代码                 │
│                         │
│ DB / Auth / Access      │
│ State / CRUD / Schema   │
│ Validation / Workflow   │
└────────────┬────────────┘
             │ controlled context
             ▼
┌─────────────────────────┐
│ Skill Runtime           │
│                         │
│ Summarize               │
│ Analyze                 │
│ Classify                │
│ Generate                │
│ Synthesize              │
└────────────┬────────────┘
             │ structured output
             ▼
┌─────────────────────────┐
│ Structured Draft        │
│ Proposal / Candidate    │
└────────────┬────────────┘
             │
      Code Validation
             │
             ▼
       Human / Rules
             │
             ▼
        Production Data
```

### Deterministic Core

以下能力默认 Code First：

```text
Database CRUD
Authentication
Authorization / Access
Entitlement / Membership
State Machine
Lifecycle / Status Transition
Schema
Validation
Field Mapping
Formatting
Sorting / Filtering
Idempotency
Publish / Unpublish
Production write
```

如果业务要求“同样输入必须得到可证明、可测试、可断言的系统结果”，优先由普通代码实现。

尤其是：

```text
Access / Permission
DB Write
Publish
State Transition
Core Business Fact
```

必须由 Core System 最终决定，Skill 没有 authority。

### Skill Runtime

以下能力适合 Skill：

```text
Semantic Understanding
Summarization
Analysis
Classification
Reasoning
Generation
Synthesis
Multi-source Judgment
Ambiguous Boundary Judgment
```

Skill 不直接操作 Production Data，而是生成：

```text
Structured Draft
Proposal
Candidate
Suggestion
Classification Result
Analysis Result
```

### Context Boundary

Skill 默认不自行遍历数据库、文件系统或第三方 API。

正确模式：

```text
Core System
→ Context Builder
→ controlled context
→ Skill
```

由系统决定：

```text
读取哪些 Knowledge
读取哪些 Deep Resource
允许哪些 Lesson / Practice / Content
允许多大输入
是否允许外部工具
```

这样权限、成本、可审计性和数据泄漏边界都由 Core System 控制。

### Structured Output + Validation

Skill 输出必须有结构化 Contract / Schema。

```text
Skill Result
↓
Schema Validation
↓
Business Rule Validation
↓
Human / Rule Gate
↓
Core System Action
```

Skill 生成的 ID、枚举、状态、关联关系等均不能直接信任，必须由系统重新验证。

### Failure Boundary

Skill / Provider 属于增强能力，不得成为核心系统单点故障。

```text
Skill Success
→ Structured Result
→ Validation
→ Continue

Skill Timeout / Provider Failure / Invalid Output
→ RULE fallback
or NEEDS_REVIEW
or no generation
```

具体 fallback 由业务任务定义，但以下能力必须继续工作：

```text
Auth
Access
Existing Course
Existing Knowledge
Existing Practice
DB Read / Write
Core State Machine
```

不得为了“保持 AI 功能可用”伪造 AI 结果。

### Access 特别规则

Access Control 永远属于 Deterministic Core：

```text
User
+ Resource
+ Entitlement
+ Membership
+ Resource Policy
↓
Access Resolver
↓
ALLOW / DENY / PREVIEW
```

Skill 不参与最终权限判断。

---

## 5. Content Engine

内容流水线应保持可审计：

```text
Source
↓
Fetch / Collect
↓
Normalize
↓
Deduplicate
↓
Rule Filter
↓
AI Assist
↓
Editorial Review
↓
Publish
```

采集失败、AI 失败、发布失败是三个不同状态，不允许混在一起。

正式 Published 内容只从 CMS / Backend 发布。

### 5.1 OPC 内容资产主链

外部最新消息不是正式知识。正式主链固定为：

```text
External Signal
→ Fetch / Collect / Normalize / Deduplicate
→ Rule Filter / AI Assist
→ Human Review / Edit
→ Reviewed OPC Knowledge
→ Derived Assets
→ Published Experience
```

职责定义：

```text
External Signal
= 外部世界的新消息、工具变化、案例与来源证据

OPC Knowledge
= 经过人工理解、修改、判断和审核后的可复用知识资产

Derived Assets
= 同一 Knowledge 派生出的不同用途资产，不成为新的事实源
```

Derived Assets 可包括：

```text
Feishu Deep Resource
Latest Practice
Course Update Candidate
Obsidian Note
Skill
Media Asset
```

Published Experience 可包括：

```text
AI Daily
Knowledge Detail
Course / Lesson
Practice
会员深度资料
公众号 / 自媒体内容
```

原则：展示层和渠道层不能反向成为 Knowledge 的唯一事实源。

---

## 6. 正式数据与知识同步

生产业务数据统一进入 PostgreSQL。

正式课程、知识条目、动态内容都从后台 / CMS 维护并发布。

Obsidian 采用最轻量的单向 Markdown 同步，只承接已经筛选出长期价值的知识，不同步全部 Daily 原材料：

```text
Reviewed OPC Knowledge
↓
Long-term Value Review
↓
Human-approved Export Action
↓
Markdown Files
↓
Obsidian Vault
```

Obsidian 是长期个人知识沉淀与研究辅助，不是课程、Knowledge 或会员内容的 Production Source of Truth。

默认不建设：

```text
Obsidian 双向实时同步
冲突合并引擎
独立 Obsidian API 服务
客户端直接读取 Vault
```

如果未来确有人工在 Obsidian 编辑并回写的需求，再单独立项，不在 MVP 预埋。

数据库统一：

```text
PostgreSQL
ORM
Migration
```

开发验证可以使用 Supabase PostgreSQL；ORM 与 Database Migration 保持对标准 PostgreSQL 的可移植性。

---

## 7. User 与外部身份

核心身份：

```text
User
```

平台身份：

```text
UserIdentity
```

业务模块只使用 `userId`，不直接把 OpenID、UnionID、企微标识等作为核心主键。

---

## 8. Course / Content / Knowledge 边界

### Course

负责学习路径：

```text
Stage
Module
Lesson
StageProject
```

### Content

负责外部动态信号进入 OPC 后的运营与发布队列：

```text
DailyItem
Source / Signal Metadata
Review / Publish State
```

Content 是“发生了什么”的运营对象，不等于 OPC 正式知识。

### Knowledge

负责经过人工审核后的可复用知识实体，是派生资产的核心事实源：

```text
Knowledge
├─ Feishu Deep Resource
├─ Latest Practice
├─ Course Update Candidate
├─ Obsidian Note
├─ Skill
└─ Media Asset
```

Knowledge 负责概念关系、生命周期、来源追踪、课程影响和后续派生；不能把所有东西塞进 Lesson，也不能把 Feishu / Obsidian / Skill 当成平行事实源。

当前来源模型固定为：`knowledge_items.sourceContentId` 保留为 Primary Source 快捷字段，`knowledge_source_links` 承载 PRIMARY / SUPPORTING 多 Content provenance。Practice / Course Candidate 继续使用各自明确的 `sourceKnowledgeId`，不新增通用 `asset_relations` 重复表达已有强类型关系。

---


## 9. 飞书学习内容发布

飞书是会员可见的“深度研究 / 实践解释层”，也是人工学习、分析、实践形成更深内容的载体，但不取代 OPC Knowledge 的核心业务索引和关系模型。

推荐架构：

```text
Reviewed OPC Knowledge
↓
人工学习 / 分析 / 实践深化
↓
Feishu Deep Resource
↓
Feishu Publish Adapter / 人工发布
↓
飞书文档 / 知识库
↓
返回受控访问 URL / Resource Ref
↓
关联回 Knowledge / Course / Practice
```

当前 E 阶段已落地 Knowledge-owned `knowledge_deep_resources`：只保存 FEISHU URL / ref / title / summary / publication status，可选关联 Lesson / Practice。它不复用 `lesson_resources`，因为 Lesson 不是 Deep Resource 的必需 owner。

当前只实现 Admin 人工引用维护，不包含 Feishu API / OAuth / Bot / 自动发布 / 双向同步。后续进阶 Practice 可以分析飞书 Deep Resource 形成 AI Draft，再由人工审核发布；基础课程主干初版仍由人工讨论确定，AI 只在后续阶段分析新 Knowledge 是否影响既有 Lesson，并生成 Course Update Candidate。

MVP 优先允许人工发布 + 后台保存链接；只有维护量明显增加后，再开发自动发布。

这样可以先验证用户是否真的会点击、阅读和受益，再决定自动化深度。

---
## 10. 内容状态

发布流程：

```text
DRAFT
↓
REVIEW
↓
PUBLISHED
↓
ARCHIVED
```

知识有效性另外维护：

```text
NEW
ACTIVE
WATCH
OUTDATED
DEPRECATED
```

发布状态与知识有效性是两个不同维度。

---

## 11. Progress / Entitlement

学习进度和课程访问均由 Backend 统一判断。

客户端只消费结果。

本地缓存不成为唯一事实源。

ACCESS-001 已将当前产品权限正式接入统一 Deterministic Core Access Resolver：

```text
AI Daily Top3
→ FREE

AI Daily 全部条目
→ 已关注公众号可解锁；会员同样可访问

Knowledge 正文
→ MEMBER

Feishu Deep Resource
→ MEMBER

Latest Practice 卡片
→ PUBLIC VISIBLE

Latest Practice 详情 / 正式实操 / 由进阶内容进入的正式课程
→ MEMBER
```

公众号关注只负责解锁完整 AI Daily，不等价于 Membership，也不能顺带解锁 Knowledge、Deep Resource、Course 或 Practice。

正式实现使用 `resolveResourceAccess()` + Membership / Entitlement / Practice Access；不允许在各页面散落 `isMember` / `hasFollowed` 判断。公开 Reader 必须只查询 Preview 安全字段，不能先读取会员正文再依赖 JSX 隐藏；会员内容只有在 Access ALLOW 后才能读取。

---

## 12. Channel Adapters

外部渠道必须通过 Adapter 接入。

```text
Official Account Adapter
WeCom Adapter
Feishu Adapter
Mini Program Platform Adapter
```

核心 Course / Knowledge / Entitlement 模块不能直接依赖这些 SDK/API。

渠道失败不得破坏核心业务数据。

---

## 13. 消息模型

业务消息应先形成 OPC 内部事实：

```text
Notification / Message
```

再由不同 Channel Adapter 投递。

公众号、企微、飞书只是渠道，不是消息事实源。

---

## 14. 数据采集策略

采集优先级：

```text
官方 API / RSS / Feed
↓
稳定公开页面
↓
必要的浏览器自动化
```

不为了扩大内容数量建设重型爬虫系统。

高价值、小规模、稳定采集优于大规模不稳定采集。

---

## 15. Failure / Idempotency

所有外部调用必须：

```text
失败可见
错误可定位
适用时可重试
Webhook 幂等
避免重复推送
避免重复权益
```

数据库真正成功之前不能返回成功。

---

## 16. Security

最低要求：

```text
HTTPS
Secret 仅服务端
Admin 鉴权
Webhook 验签
最小权限
环境变量管理密钥
数据库不直接暴露
日志不泄露 Secret
```

---

## 17. 架构稳定原则

```text
一个 Backend
一个 PostgreSQL
一个业务规则实现
用户侧无模型调用复杂度
后台 AI 薄层收口
渠道只是 Adapter
正式内容必须人工审核
动态知识有生命周期
真实复杂度出现后再抽象
```

---

## 18. Execution Context Boundary

开发执行上下文与系统架构解耦。Codex 默认不需要加载完整产品架构。

```text
AGENTS.md
+ 当前 Task
+ Required Reads
= 默认执行上下文
```

`PROJECT_STATUS.md`、`TASKS.md`、ADR 与历史结果仅按需读取。

任务结束后 Codex 必须停止，并通过 `Next Task Handoff` 提醒将结果回传 ChatGPT，由 ChatGPT 决定下一 Task。

---

## 12. MVP-009 Feedback / Event / Insight Runtime Architecture

当前已经形成最小闭环：

```text
Lesson / Practice UI
        ↓
Learning API
        ↓
learning_events / learning_feedback
        ↓
Rule Aggregation
        ↓
course_insights
        ↓
ANALYSIS_READY / REVIEW_REQUIRED
        ↓
Internal AI Analysis（仅真实 Provider 已配置时）
        ↓
course_update_candidates
        ↓
Admin Human Review
```

### Event Trust Boundary

客户端只能发送白名单中的低风险事件。

`practice_passed`、`evaluation_completed` 等业务结果事件必须由服务端正式流程产生；前端伪造请求必须拒绝。

### AI Runtime Boundary

真实 Provider 配置使用：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

当前开发环境没有配置这些变量。

因此当前 Runtime 只验证到：

```text
Rule Aggregation
→ ANALYSIS_READY / REVIEW_REQUIRED
```

AI Analysis、Course Coverage Check 与 Candidate 生成代码已接通，但不能把规则聚合冒充 AI 结果。

当 Provider 缺失或失败时，应保持 `ANALYSIS_READY` 并记录错误，不自动降级生成伪诊断。

### Human Review Boundary

任何 Course Update Candidate 都只能进入 `PENDING_REVIEW`。

Internal AI Service 没有直接写入 Published Lesson 的权限；正式内容更新仍需人工审核和既有 Admin Course 发布流程。

---

## 13. MVP-010 Practice / Project Runtime Architecture

MVP-010 已把 Lesson Practice、Stage Project 与 Latest Practice 收敛到同一业务核心：

```text
User UI
↓
GET /api/learning/practices/:practiceId
↓
getPracticeReadModel()
↓
resolvePracticeAccess()
├─ Lesson Access
├─ Stage prerequisite
├─ Published Content / Knowledge Source
└─ OPC Membership Policy
↓
POST /api/learning/practices/:practiceId/submissions
↓
submission_schema validator dispatch
↓
practice_submissions
↓
practice_evaluations
↓
learning_events
```

正式类型：

```text
LESSON_PRACTICE
STAGE_PROJECT
LATEST_PRACTICE
```

Access denied 时 canonical Read Model 返回：

```text
access.allowed = false
content = null
```

历史 Submission 可以继续返回给原用户，因此会员到期 / 权限回退不会删除学习记录。

当前三类正式样本：

```text
practice_task_brief_structured
practice_stage_personal_knowledge_assistant
practice_latest_evaluation_workflow
```

用户侧最小入口：

```text
Lesson Page
/projects/personal-knowledge-assistant
/practice
```

服务端 PASSED / Completion 事实不能由前端伪造。Lesson Completion 只由 required `LESSON_PRACTICE` 的 PASSED 状态解锁；Stage Project / Latest Practice 不错误参与 Lesson Completion Gate。

当前正式 Submission Schema 仅注册 `TASK_BRIEF_V1`。第二种 Schema、AI Evaluator、文件 / 图片 Submission 都需要后续独立需求，不在 MVP-010 预埋。

---

## 14. Skill 与内容生产资产

Skill 是从重复出现的知识判断、分析方法、Prompt、SOP、结构化输出规则中沉淀出的**可版本化系统资产**，不是一次性的运行时 Prompt。

Skill 最小生命周期：

```text
Repeated Knowledge / Real Task
↓
Human + AI Pre-training / Draft
↓
Minimal Skill v0.x
↓
落盘到系统
↓
真实任务调用
↓
结果 / 失败 / 人工修正
↓
迭代 Skill Version
```

开发原则：

- 第一个真正需要 Skill 的业务任务出现时，不先建设通用 Skill Platform；
- MVP-011-F 已落地首个真实 Skill：`skills/practice-draft/v0.1.ts`，用于 Knowledge → Practice Draft；
- 先围绕该真实任务人工 + AI 预训练一个最小初版 Skill；
- Skill 必须落盘、可版本化、可审计，不能只存在于聊天记录或临时 Prompt；
- 后续基于真实输入、输出质量、人工修改和失败案例逐步优化；
- Skill 可以驱动 AI 初步总结、Knowledge 分析、文案、图片 Brief、PPT 稿、口播脚本等内容生产，但任何正式 Knowledge / Course / Practice 发布仍保留人工审核。

媒体内容生产目标链：

```text
Reviewed Knowledge
+ Skill
+ Channel Template
↓
Media Asset Draft
├─ 文案
├─ 图片 Brief
├─ PPT 稿
├─ 口播脚本
└─ 自媒体发布素材
↓
Human Review
↓
Channel Publish
```

不把 Skill、Media Asset 或渠道发布结果反向当成 Knowledge Source of Truth。

---

## 15. MVP-011-F Practice Draft Review Boundary

当前正式链：

```text
Published Knowledge
+ optional Published Deep Resource
↓
Practice Draft Skill v0.1 / RULE fallback
↓
practice_drafts
↓
Human edit / review
├─ NEEDS_REVISION
├─ DISMISSED
└─ APPROVED
    ↓
LATEST_PRACTICE(status = DRAFT)
    ↓
人工检查 / 发布
```

正式 `practices` 仍是唯一可运行 Practice 数据源。AI / RULE Draft 没有直接发布权限，也没有覆盖已有正式 Latest Practice 的权限。

---

## 16. MVP-011-G Course Impact Analysis Boundary

课程影响分析固定为非持久化建议层：

```text
Published Knowledge
↓
Published Lesson Catalog
↓
AI / conservative RULE
↓
Transient Impact Suggestions
↓
Human Confirm
↓
Course Update Candidate(PENDING_REVIEW)
↓
Human Review
```

AI / RULE 没有 Candidate APPROVE 权限，也不能写入或发布 Lesson。为了减少噪音，RULE 模式在没有 Knowledge→Lesson / Stage 明确关系时返回空建议，而不是随机匹配课程。